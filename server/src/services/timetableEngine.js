const Timetable = require('../models/Timetable');
const TimetableEntry = require('../models/TimetableEntry');
const Subject = require('../models/Subject');
const Section = require('../models/Section');
const Faculty = require('../models/Faculty');
const Classroom = require('../models/Classroom');
const Laboratory = require('../models/Laboratory');
const { detectConflicts } = require('./conflictDetector');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  { startTime: '09:00', endTime: '10:00' },
  { startTime: '10:00', endTime: '11:00' },
  { startTime: '11:15', endTime: '12:15' },
  { startTime: '12:15', endTime: '13:15' },
  { startTime: '14:00', endTime: '15:00' },
  { startTime: '15:00', endTime: '16:00' },
];

/**
 * Constraint-based Timetable Generator Engine
 */
const generateTimetableForDepartment = async ({ departmentId, semester, academicYear = '2025-2026', createdBy }) => {
  // Fetch department entities
  const subjects = await Subject.find({ department: departmentId, semester });
  const sections = await Section.find({ department: departmentId, semester });
  const faculties = await Faculty.find({ department: departmentId }).populate('user');
  const classrooms = await Classroom.find({ isLab: false, capacity: { $gte: 30 } });
  const labs = await Laboratory.find({ department: departmentId });

  if (subjects.length === 0 || sections.length === 0 || faculties.length === 0) {
    throw new Error('Insufficient master data (subjects, sections, or faculty) to generate timetable for this department and semester.');
  }

  // Create active or draft timetable record
  const timetable = await Timetable.create({
    name: `Automated Schedule - Sem ${semester} (${academicYear})`,
    academicYear,
    semester,
    department: departmentId,
    status: 'ACTIVE',
    createdBy,
  });

  const generatedEntries = [];
  const occupiedFacultySlots = new Set(); // key: facId_day_slot
  const occupiedRoomSlots = new Set();    // key: roomId_day_slot
  const occupiedSectionSlots = new Set(); // key: secId_day_slot

  for (const section of sections) {
    let facIndex = 0;
    for (const subject of subjects) {
      const periodsNeeded = subject.weeklyPeriods || 3;
      let periodsAssigned = 0;

      for (const day of DAYS) {
        if (periodsAssigned >= periodsNeeded) break;

        for (const slot of TIME_SLOTS) {
          if (periodsAssigned >= periodsNeeded) break;

          const slotKey = `${day}_${slot.startTime}_${slot.endTime}`;
          const secKey = `${section._id}_${slotKey}`;

          if (occupiedSectionSlots.has(secKey)) continue; // Section busy

          // Find available faculty
          let assignedFac = null;
          for (let i = 0; i < faculties.length; i++) {
            const candidateFac = faculties[(facIndex + i) % faculties.length];
            const facKey = `${candidateFac._id}_${slotKey}`;
            if (!occupiedFacultySlots.has(facKey)) {
              assignedFac = candidateFac;
              facIndex = (facIndex + i + 1) % faculties.length;
              break;
            }
          }

          if (!assignedFac) continue; // No faculty available at this slot

          // Find available room
          let assignedRoom = null;
          let assignedLab = null;

          if (subject.requiresLab) {
            for (const lab of labs) {
              const labKey = `${lab._id}_${slotKey}`;
              if (!occupiedRoomSlots.has(labKey) && lab.capacity >= section.studentCount) {
                assignedLab = lab;
                break;
              }
            }
            if (!assignedLab && labs.length > 0) assignedLab = labs[0]; // fallback
          } else {
            for (const room of classrooms) {
              const roomKey = `${room._id}_${slotKey}`;
              if (!occupiedRoomSlots.has(roomKey) && room.capacity >= section.studentCount) {
                assignedRoom = room;
                break;
              }
            }
            if (!assignedRoom && classrooms.length > 0) assignedRoom = classrooms[0]; // fallback
          }

          // Mark occupied
          occupiedSectionSlots.add(secKey);
          occupiedFacultySlots.add(`${assignedFac._id}_${slotKey}`);
          if (assignedRoom) occupiedRoomSlots.add(`${assignedRoom._id}_${slotKey}`);
          if (assignedLab) occupiedRoomSlots.add(`${assignedLab._id}_${slotKey}`);

          const entry = new TimetableEntry({
            timetable: timetable._id,
            dayOfWeek: day,
            startTime: slot.startTime,
            endTime: slot.endTime,
            subject: subject._id,
            faculty: assignedFac._id,
            section: section._id,
            classroom: assignedRoom ? assignedRoom._id : null,
            laboratory: assignedLab ? assignedLab._id : null,
            isLabSession: subject.requiresLab,
          });

          await entry.save();
          generatedEntries.push(entry);
          periodsAssigned++;
        }
      }
    }
  }

  // Detect any conflicts in generated schedule
  const conflicts = await detectConflicts(timetable._id);

  return {
    timetable,
    entriesCount: generatedEntries.length,
    conflicts,
  };
};

module.exports = { generateTimetableForDepartment, DAYS, TIME_SLOTS };
