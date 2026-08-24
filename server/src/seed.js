const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Department = require('./models/Department');
const Faculty = require('./models/Faculty');
const Student = require('./models/Student');
const Subject = require('./models/Subject');
const Section = require('./models/Section');
const Classroom = require('./models/Classroom');
const Laboratory = require('./models/Laboratory');
const Timetable = require('./models/Timetable');
const TimetableEntry = require('./models/TimetableEntry');
const LeaveRequest = require('./models/LeaveRequest');
const Event = require('./models/Event');
const Examination = require('./models/Examination');
const ExamRoomAllocation = require('./models/ExamRoomAllocation');
const Recommendation = require('./models/Recommendation');
const Simulation = require('./models/Simulation');
const AuditLog = require('./models/AuditLog');
const SecurityAlert = require('./models/SecurityAlert');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academic_intelligence');
    console.log('Connected to MongoDB for Seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Faculty.deleteMany({}),
      Student.deleteMany({}),
      Subject.deleteMany({}),
      Section.deleteMany({}),
      Classroom.deleteMany({}),
      Laboratory.deleteMany({}),
      Timetable.deleteMany({}),
      TimetableEntry.deleteMany({}),
      LeaveRequest.deleteMany({}),
      Event.deleteMany({}),
      Examination.deleteMany({}),
      ExamRoomAllocation.deleteMany({}),
      Recommendation.deleteMany({}),
      Simulation.deleteMany({}),
      AuditLog.deleteMany({}),
      SecurityAlert.deleteMany({}),
    ]);

    console.log('Cleared old database records.');

    // 1. Create Core Users & Roles
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@university.edu',
      password: 'Admin@123',
      role: 'ADMIN',
    });

    const examCellUser = await User.create({
      name: 'Dr. Suresh Verma (Exam Cell)',
      email: 'examcell@university.edu',
      password: 'Exam@123',
      role: 'EXAM_CELL',
    });

    const hodCseUser = await User.create({
      name: 'Dr. Ramesh Sharma (HOD CSE)',
      email: 'hod.cse@university.edu',
      password: 'Hod@123',
      role: 'HOD',
    });

    const hodEceUser = await User.create({
      name: 'Dr. Anita Roy (HOD ECE)',
      email: 'hod.ece@university.edu',
      password: 'Hod@123',
      role: 'HOD',
    });

    // 2. Departments
    const cseDept = await Department.create({
      code: 'CSE',
      name: 'Computer Science & Engineering',
      hod: hodCseUser._id,
      building: 'Tech Block A',
      contactEmail: 'cse@university.edu',
    });

    const eceDept = await Department.create({
      code: 'ECE',
      name: 'Electronics & Communication Engineering',
      hod: hodEceUser._id,
      building: 'Tech Block B',
      contactEmail: 'ece@university.edu',
    });

    const meDept = await Department.create({
      code: 'ME',
      name: 'Mechanical Engineering',
      building: 'Workshop Block C',
      contactEmail: 'me@university.edu',
    });

    hodCseUser.department = cseDept._id;
    await hodCseUser.save();
    hodEceUser.department = eceDept._id;
    await hodEceUser.save();

    // 3. Faculty Users & Profiles
    const facultyUsersData = [
      { name: 'Dr. Ravi Kumar', email: 'ravi@university.edu', empId: 'FAC001', dept: cseDept._id, desig: 'Professor', maxW: 16 },
      { name: 'Prof. Ananya Sen', email: 'ananya@university.edu', empId: 'FAC002', dept: cseDept._id, desig: 'Associate Professor', maxW: 18 },
      { name: 'Dr. Vikram Patel', email: 'vikram@university.edu', empId: 'FAC003', dept: cseDept._id, desig: 'Assistant Professor', maxW: 18 },
      { name: 'Prof. Neha Gupta', email: 'neha@university.edu', empId: 'FAC004', dept: cseDept._id, desig: 'Assistant Professor', maxW: 18 },
      { name: 'Dr. Amit Joshi', email: 'amit@university.edu', empId: 'FAC005', dept: eceDept._id, desig: 'Professor', maxW: 16 },
      { name: 'Prof. Sunita Reddy', email: 'sunita@university.edu', empId: 'FAC006', dept: eceDept._id, desig: 'Assistant Professor', maxW: 18 },
      { name: 'Dr. Rajesh Nair', email: 'rajesh@university.edu', empId: 'FAC007', dept: meDept._id, desig: 'Professor', maxW: 16 },
      { name: 'Prof. Manoj Mehta', email: 'manoj@university.edu', empId: 'FAC008', dept: meDept._id, desig: 'Assistant Professor', maxW: 18 },
      { name: 'Dr. Pooja Bhatia', email: 'pooja@university.edu', empId: 'FAC009', dept: cseDept._id, desig: 'Assistant Professor', maxW: 18 },
      { name: 'Prof. Rahul Saxena', email: 'rahul@university.edu', empId: 'FAC010', dept: eceDept._id, desig: 'Assistant Professor', maxW: 18 },
    ];

    const facultyDocs = [];
    for (const fac of facultyUsersData) {
      const u = await User.create({
        name: fac.name,
        email: fac.email,
        password: 'Faculty@123',
        role: 'FACULTY',
        department: fac.dept,
      });

      const f = await Faculty.create({
        user: u._id,
        employeeId: fac.empId,
        department: fac.dept,
        designation: fac.desig,
        maxWeeklyWorkload: fac.maxW,
        currentWorkload: 12,
      });
      facultyDocs.push(f);
    }

    // 4. Classrooms & Laboratories
    const room101 = await Classroom.create({ roomNumber: 'ROOM-101', building: 'Tech Block A', capacity: 60, facilities: ['PROJECTOR', 'AC'] });
    const room102 = await Classroom.create({ roomNumber: 'ROOM-102', building: 'Tech Block A', capacity: 65, facilities: ['PROJECTOR', 'SMART_BOARD'] });
    const room201 = await Classroom.create({ roomNumber: 'ROOM-201', building: 'Tech Block B', capacity: 60, facilities: ['PROJECTOR'] });
    const room202 = await Classroom.create({ roomNumber: 'ROOM-202', building: 'Tech Block B', capacity: 70, facilities: ['PROJECTOR', 'AUDIO_SYSTEM'] });
    const hall301 = await Classroom.create({ roomNumber: 'HALL-301', building: 'Auditorium Block', capacity: 120, facilities: ['PROJECTOR', 'AC', 'AUDIO_SYSTEM'] });

    const cseLab1 = await Laboratory.create({ name: 'Advanced AI & Data Analytics Lab', roomNumber: 'LAB-CSE-01', department: cseDept._id, capacity: 35, equipmentList: ['35 High-End Workstations', 'NVIDIA GPUs'] });
    const cseLab2 = await Laboratory.create({ name: 'Networks & Security Lab', roomNumber: 'LAB-CSE-02', department: cseDept._id, capacity: 35, equipmentList: ['Cisco Routers', 'Firewalls'] });
    const eceLab1 = await Laboratory.create({ name: 'VLSI & Embedded Systems Lab', roomNumber: 'LAB-ECE-01', department: eceDept._id, capacity: 30, equipmentList: ['FPGA Kits', 'Oscilloscopes'] });

    // 5. Sections
    const secCseA = await Section.create({ name: 'CSE-A', department: cseDept._id, semester: 5, studentCount: 55 });
    const secCseB = await Section.create({ name: 'CSE-B', department: cseDept._id, semester: 5, studentCount: 52 });
    const secEceA = await Section.create({ name: 'ECE-A', department: eceDept._id, semester: 5, studentCount: 48 });

    // 6. Subjects
    const subjectsData = [
      { code: 'CS501', name: 'Database Management Systems', dept: cseDept._id, credits: 4, weeklyPeriods: 4, reqLab: false, sem: 5 },
      { code: 'CS502', name: 'Computer Networks', dept: cseDept._id, credits: 4, weeklyPeriods: 4, reqLab: false, sem: 5 },
      { code: 'CS503', name: 'Artificial Intelligence', dept: cseDept._id, credits: 3, weeklyPeriods: 3, reqLab: false, sem: 5 },
      { code: 'CS504L', name: 'DBMS & AI Laboratory', dept: cseDept._id, credits: 2, weeklyPeriods: 2, reqLab: true, sem: 5 },
      { code: 'CS505', name: 'Operating Systems', dept: cseDept._id, credits: 3, weeklyPeriods: 3, reqLab: false, sem: 5 },
      { code: 'EC501', name: 'Digital Signal Processing', dept: eceDept._id, credits: 4, weeklyPeriods: 4, reqLab: false, sem: 5 },
      { code: 'EC502', name: 'Microcontrollers & Embedded Systems', dept: eceDept._id, credits: 4, weeklyPeriods: 4, reqLab: true, sem: 5 },
      { code: 'ME501', name: 'Thermodynamics', dept: meDept._id, credits: 4, weeklyPeriods: 4, reqLab: false, sem: 5 },
    ];

    const subjectDocs = [];
    for (const sub of subjectsData) {
      const s = await Subject.create({
        code: sub.code,
        name: sub.name,
        department: sub.dept,
        credits: sub.credits,
        weeklyPeriods: sub.weeklyPeriods,
        requiresLab: sub.reqLab,
        semester: sub.sem,
      });
      subjectDocs.push(s);
    }

    // 7. Students (Bulk seed 100+ demo students)
    console.log('Seeding 100+ students...');
    const bcrypt = require('bcryptjs');
    const hashedStudentPass = await bcrypt.hash('Student@123', 10);

    const userInserts = [];
    const studentMeta = [];

    for (let i = 1; i <= 105; i++) {
      const isSecA = i <= 55;
      const isCse = i <= 80;
      const dept = isCse ? cseDept._id : eceDept._id;
      const sec = isCse ? (isSecA ? secCseA._id : secCseB._id) : secEceA._id;
      const roll = isCse ? `23CSE${i.toString().padStart(3, '0')}` : `23ECE${(i - 80).toString().padStart(3, '0')}`;

      userInserts.push({
        name: `Student ${i} (${isCse ? 'CSE' : 'ECE'})`,
        email: `student${i}@university.edu`,
        password: hashedStudentPass,
        role: 'STUDENT',
        department: dept,
      });

      studentMeta.push({ rollNumber: roll, department: dept, section: sec });
    }

    const createdUsers = await User.insertMany(userInserts);
    const studentInserts = createdUsers.map((u, idx) => ({
      user: u._id,
      rollNumber: studentMeta[idx].rollNumber,
      department: studentMeta[idx].department,
      section: studentMeta[idx].section,
      semester: 5,
      batch: '2023-2027',
    }));

    await Student.insertMany(studentInserts);

    // 8. Timetable & Entries
    const activeTimetable = await Timetable.create({
      name: 'Autumn 2026 Master Academic Timetable',
      academicYear: '2025-2026',
      semester: 5,
      department: cseDept._id,
      status: 'ACTIVE',
      createdBy: adminUser._id,
    });

    const entriesData = [
      { day: 'Monday', start: '09:00', end: '10:00', sub: subjectDocs[0]._id, fac: facultyDocs[0]._id, sec: secCseA._id, room: room101._id },
      { day: 'Monday', start: '10:00', end: '11:00', sub: subjectDocs[1]._id, fac: facultyDocs[1]._id, sec: secCseA._id, room: room101._id },
      { day: 'Monday', start: '11:15', end: '12:15', sub: subjectDocs[2]._id, fac: facultyDocs[2]._id, sec: secCseA._id, room: room102._id },
      { day: 'Tuesday', start: '09:00', end: '10:00', sub: subjectDocs[4]._id, fac: facultyDocs[3]._id, sec: secCseA._id, room: room101._id },
      { day: 'Tuesday', start: '10:00', end: '12:00', sub: subjectDocs[3]._id, fac: facultyDocs[8]._id, sec: secCseA._id, lab: cseLab1._id, isLab: true },
      { day: 'Wednesday', start: '09:00', end: '10:00', sub: subjectDocs[0]._id, fac: facultyDocs[0]._id, sec: secCseB._id, room: room102._id },
      { day: 'Thursday', start: '10:00', end: '11:00', sub: subjectDocs[1]._id, fac: facultyDocs[1]._id, sec: secCseB._id, room: room102._id },
      { day: 'Friday', start: '14:00', end: '15:00', sub: subjectDocs[2]._id, fac: facultyDocs[2]._id, sec: secCseA._id, room: room101._id },
    ];

    for (const e of entriesData) {
      await TimetableEntry.create({
        timetable: activeTimetable._id,
        dayOfWeek: e.day,
        startTime: e.start,
        endTime: e.end,
        subject: e.sub,
        faculty: e.fac,
        section: e.sec,
        classroom: e.room || null,
        laboratory: e.lab || null,
        isLabSession: e.isLab || false,
      });
    }

    // 9. Leave Request & AI Recommendation
    const leaveRec = await Recommendation.create({
      contextType: 'LEAVE_SUBSTITUTION',
      problemDescription: 'Dr. Ravi Kumar requested leave on Monday due to conference attendance.',
      scenariosEvaluated: [
        {
          id: 'SCENARIO_SUB_ANANYA',
          title: 'Substitute Prof. Ananya Sen',
          score: 94,
          conflictsCount: 0,
          explanation: ['Prof. Ananya is available Monday 09:00 AM.', 'Workload within limits.'],
        },
      ],
      recommendedScenarioId: 'SCENARIO_SUB_ANANYA',
      overallQualityScore: 94,
      humanExplanation: 'Recommended Prof. Ananya Sen because she is free during Monday 09:00 AM and teaches in CSE department.',
      status: 'PROPOSED',
    });

    await LeaveRequest.create({
      faculty: facultyDocs[0]._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 2),
      reason: 'Attending International AI & Academic Research Summit',
      status: 'PENDING',
      aiRecommendation: leaveRec._id,
    });

    // 10. Examinations & Room Allocations
    const exam1 = await Examination.create({
      name: 'Mid-Semester Examination Fall 2026 - DBMS',
      subject: subjectDocs[0]._id,
      department: cseDept._id,
      date: new Date(Date.now() + 86400000 * 7),
      startTime: '10:00',
      endTime: '13:00',
      totalStudents: 107,
      status: 'SCHEDULED',
    });

    await ExamRoomAllocation.create({
      examination: exam1._id,
      classroom: room101._id,
      allocatedStudentsCount: 55,
      invigilator: facultyDocs[1]._id,
    });

    await ExamRoomAllocation.create({
      examination: exam1._id,
      classroom: room102._id,
      allocatedStudentsCount: 52,
      invigilator: facultyDocs[2]._id,
    });

    // 11. Events
    await Event.create({
      title: 'National Hackathon & AI Workshop 2026',
      type: 'WORKSHOP',
      date: new Date(Date.now() + 86400000 * 10),
      startTime: '09:00',
      endTime: '17:00',
      classroom: hall301._id,
      organizer: 'Department of Computer Science & ACM Student Chapter',
      affectedSections: [secCseA._id, secCseB._id],
      description: 'Hands-on workshop on generative AI, autonomous agent design, and model fine-tuning.',
    });

    await Event.create({
      title: 'Global Tech Campus Placement Drive - Google & Microsoft',
      type: 'PLACEMENT',
      date: new Date(Date.now() + 86400000 * 14),
      startTime: '10:00',
      endTime: '16:00',
      classroom: hall301._id,
      organizer: 'Training & Placement Cell',
      affectedSections: [secCseA._id, secCseB._id, secEceA._id],
      description: 'Annual placement interviews and coding assessment for graduating batch.',
    });

    // 12. Audit Logs & Security Alerts
    await AuditLog.create({
      user: adminUser._id,
      userName: adminUser.name,
      userRole: 'ADMIN',
      action: 'SYSTEM_INIT_SEED',
      entity: 'SYSTEM',
      details: 'Database seeded with complete academic master data, timetables, and demo roles.',
      ipAddress: '127.0.0.1',
    });

    await SecurityAlert.create({
      alertType: 'UNAUTHORIZED_ACCESS',
      userEmail: 'student1@university.edu',
      severity: 'MEDIUM',
      description: "Student 'student1@university.edu' attempted to access restricted endpoint '/api/timetable/generate'.",
      status: 'OPEN',
    });

    console.log('\n======================================================');
    console.log('DATABASE SEED COMPLETE SUCCESS!');
    console.log('======================================================');
    console.log('DEMO ACCOUNTS FOR LOCAL TESTING:');
    console.log('------------------------------------------------------');
    console.log('ADMIN:       email: admin@university.edu        pass: Admin@123');
    console.log('HOD CSE:     email: hod.cse@university.edu      pass: Hod@123');
    console.log('HOD ECE:     email: hod.ece@university.edu      pass: Hod@123');
    console.log('FACULTY:     email: ravi@university.edu         pass: Faculty@123');
    console.log('STUDENT:     email: student1@university.edu     pass: Student@123');
    console.log('EXAM CELL:   email: examcell@university.edu     pass: Exam@123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
};

seedDB();
