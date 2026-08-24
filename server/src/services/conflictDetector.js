const TimetableEntry = require('../models/TimetableEntry');
const Faculty = require('../models/Faculty');
const Classroom = require('../models/Classroom');
const Section = require('../models/Section');
const Subject = require('../models/Subject');

/**
 * Validates a list of timetable entries or database timetable entries for hard and soft conflicts.
 * Returns array of structured conflict objects with human-readable explanations.
 */
const detectConflicts = async (timetableId = null, draftEntries = null) => {
  let entries = [];
  if (draftEntries) {
    entries = draftEntries;
  } else if (timetableId) {
    entries = await TimetableEntry.find({ timetable: timetableId })
      .populate('faculty')
      .populate('subject')
      .populate('section')
      .populate('classroom')
      .populate('laboratory');
  }

  const conflicts = [];

  // Group by (dayOfWeek, timeSlot)
  const timeSlotMap = {};

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const key = `${entry.dayOfWeek}_${entry.startTime}_${entry.endTime}`;
    if (!timeSlotMap[key]) {
      timeSlotMap[key] = [];
    }
    timeSlotMap[key].push(entry);
  }

  // 1. Check time slot overlapping conflicts
  for (const [slotKey, slotEntries] of Object.entries(timeSlotMap)) {
    const [day, start, end] = slotKey.split('_');

    // Faculty check
    const facultySeen = {};
    for (const e of slotEntries) {
      const facId = e.faculty?._id?.toString() || e.faculty?.toString();
      if (facId) {
        if (facultySeen[facId]) {
          const facName = e.faculty?.user?.name || e.faculty?.employeeId || 'Faculty member';
          const sub1 = e.subject?.code || 'Subject 1';
          const sub2 = facultySeen[facId].subject?.code || 'Subject 2';
          conflicts.push({
            type: 'FACULTY_CONFLICT',
            severity: 'HARD',
            day,
            timeSlot: `${start} - ${end}`,
            facultyId: facId,
            message: `Faculty (${facName}) is double-booked on ${day} ${start}-${end} for subjects ${sub1} and ${sub2}.`,
          });
        } else {
          facultySeen[facId] = e;
        }
      }
    }

    // Room check
    const roomSeen = {};
    for (const e of slotEntries) {
      const roomId = e.classroom?._id?.toString() || e.classroom?.toString() || e.laboratory?._id?.toString();
      if (roomId) {
        if (roomSeen[roomId]) {
          const roomNum = e.classroom?.roomNumber || e.laboratory?.roomNumber || 'Room';
          const sec1 = e.section?.name || 'Section 1';
          const sec2 = roomSeen[roomId].section?.name || 'Section 2';
          conflicts.push({
            type: 'ROOM_CONFLICT',
            severity: 'HARD',
            day,
            timeSlot: `${start} - ${end}`,
            roomId,
            message: `Room (${roomNum}) is double-booked on ${day} ${start}-${end} for sections ${sec1} and ${sec2}.`,
          });
        } else {
          roomSeen[roomId] = e;
        }
      }
    }

    // Section check
    const sectionSeen = {};
    for (const e of slotEntries) {
      const secId = e.section?._id?.toString() || e.section?.toString();
      if (secId) {
        if (sectionSeen[secId]) {
          const secName = e.section?.name || 'Section';
          const sub1 = e.subject?.code || 'Subject 1';
          const sub2 = sectionSeen[secId].subject?.code || 'Subject 2';
          conflicts.push({
            type: 'SECTION_CONFLICT',
            severity: 'HARD',
            day,
            timeSlot: `${start} - ${end}`,
            sectionId: secId,
            message: `Section (${secName}) is assigned to two concurrent classes on ${day} ${start}-${end}: ${sub1} and ${sub2}.`,
          });
        } else {
          sectionSeen[secId] = e;
        }
      }
    }
  }

  // 2. Capacity & Lab type checks
  for (const e of entries) {
    const secCount = e.section?.studentCount || 60;
    const roomCap = e.classroom?.capacity || e.laboratory?.capacity || 60;

    if (secCount > roomCap) {
      const roomNum = e.classroom?.roomNumber || e.laboratory?.roomNumber || 'Room';
      const secName = e.section?.name || 'Section';
      conflicts.push({
        type: 'CAPACITY_CONFLICT',
        severity: 'HARD',
        day: e.dayOfWeek,
        timeSlot: `${e.startTime} - ${e.endTime}`,
        message: `Room (${roomNum}) capacity ${roomCap} is smaller than section (${secName}) student count of ${secCount}.`,
      });
    }

    if (e.subject?.requiresLab && !e.isLabSession && !e.laboratory) {
      const subCode = e.subject?.code || 'Subject';
      conflicts.push({
        type: 'LABORATORY_REQUIRED_CONFLICT',
        severity: 'HARD',
        day: e.dayOfWeek,
        timeSlot: `${e.startTime} - ${e.endTime}`,
        message: `Subject ${subCode} requires a laboratory setup, but is assigned to a standard classroom.`,
      });
    }
  }

  // 3. Workload limits check (Soft/Hard)
  const facultyWorkloadCount = {};
  for (const e of entries) {
    const facId = e.faculty?._id?.toString() || e.faculty?.toString();
    if (facId) {
      facultyWorkloadCount[facId] = (facultyWorkloadCount[facId] || 0) + 1;
    }
  }

  for (const [facId, count] of Object.entries(facultyWorkloadCount)) {
    const fac = await Faculty.findById(facId).populate('user');
    if (fac && count > fac.maxWeeklyWorkload) {
      const facName = fac.user?.name || fac.employeeId;
      conflicts.push({
        type: 'WORKLOAD_EXCEEDED_CONFLICT',
        severity: 'SOFT',
        facultyId: facId,
        message: `Faculty (${facName}) total assigned periods (${count}) exceeds weekly maximum limit of (${fac.maxWeeklyWorkload}).`,
      });
    }
  }

  return conflicts;
};

module.exports = { detectConflicts };
