const Department = require('../models/Department');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Section = require('../models/Section');
const Classroom = require('../models/Classroom');
const Laboratory = require('../models/Laboratory');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');
const { logAudit } = require('../middleware/audit');

// 1. DEPARTMENTS
const getDepartments = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = { $or: [{ name: new RegExp(search, 'i') }, { code: new RegExp(search, 'i') }] };
    }
    const departments = await Department.find(query).populate({ path: 'hod', select: 'name email' });
    return sendSuccess(res, departments);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const createDepartment = async (req, res) => {
  try {
    const department = await Department.create(req.body);
    await logAudit(req, 'DEPARTMENT_CREATE', 'DEPARTMENT', department._id.toString(), `Created department ${department.name} (${department.code})`);
    return sendSuccess(res, department, 'Department created', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAudit(req, 'DEPARTMENT_UPDATE', 'DEPARTMENT', department._id.toString(), `Updated department ${department.name}`);
    return sendSuccess(res, department, 'Department updated');
  } catch (error) {
    return sendError(res, error.message);
  }
};

const deleteDepartment = async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    await logAudit(req, 'DEPARTMENT_DELETE', 'DEPARTMENT', req.params.id, 'Deleted department');
    return sendSuccess(res, null, 'Department deleted');
  } catch (error) {
    return sendError(res, error.message);
  }
};

// 2. FACULTY
const getFaculty = async (req, res) => {
  try {
    const { department, search } = req.query;
    let query = {};
    if (department) query.department = department;

    let facultyList = await Faculty.find(query).populate('user department');

    if (search) {
      facultyList = facultyList.filter(
        (f) =>
          f.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
          f.employeeId.toLowerCase().includes(search.toLowerCase())
      );
    }

    return sendSuccess(res, facultyList);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const createFaculty = async (req, res) => {
  try {
    const { name, email, password, employeeId, department, designation, specializations, maxWeeklyWorkload } = req.body;

    const user = await User.create({
      name,
      email,
      password: password || 'Faculty@123',
      role: 'FACULTY',
      department,
    });

    const faculty = await Faculty.create({
      user: user._id,
      employeeId,
      department,
      designation: designation || 'Assistant Professor',
      specializations: specializations || [],
      maxWeeklyWorkload: maxWeeklyWorkload || 18,
    });

    await logAudit(req, 'FACULTY_CREATE', 'FACULTY', faculty._id.toString(), `Created faculty profile for ${name}`);
    return sendSuccess(res, faculty, 'Faculty created successfully', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const updateFaculty = async (req, res) => {
  try {
    const { name, email, designation, department, maxWeeklyWorkload, employeeId } = req.body;
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return sendError(res, 'Faculty not found', 404);

    if (name || email) {
      await User.findByIdAndUpdate(faculty.user, {
        ...(name && { name }),
        ...(email && { email }),
        ...(department && { department }),
      });
    }

    if (designation) faculty.designation = designation;
    if (department) faculty.department = department;
    if (maxWeeklyWorkload) faculty.maxWeeklyWorkload = maxWeeklyWorkload;
    if (employeeId) faculty.employeeId = employeeId;

    await faculty.save();
    await logAudit(req, 'FACULTY_UPDATE', 'FACULTY', faculty._id.toString(), `Updated faculty ${employeeId}`);
    return sendSuccess(res, faculty, 'Faculty updated');
  } catch (error) {
    return sendError(res, error.message);
  }
};

const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);
    if (faculty) {
      await User.findByIdAndDelete(faculty.user);
    }
    await logAudit(req, 'FACULTY_DELETE', 'FACULTY', req.params.id, 'Deleted faculty profile');
    return sendSuccess(res, null, 'Faculty deleted');
  } catch (error) {
    return sendError(res, error.message);
  }
};

// 3. STUDENTS
const getStudents = async (req, res) => {
  try {
    const { department, section, search } = req.query;
    let query = {};
    if (department) query.department = department;
    if (section) query.section = section;

    let students = await Student.find(query).populate('user department section');

    if (search) {
      students = students.filter(
        (s) =>
          s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
          s.rollNumber.toLowerCase().includes(search.toLowerCase())
      );
    }

    return sendSuccess(res, students);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const createStudent = async (req, res) => {
  try {
    const { name, email, password, rollNumber, department, section, semester, batch } = req.body;

    const user = await User.create({
      name,
      email,
      password: password || 'Student@123',
      role: 'STUDENT',
      department,
    });

    const student = await Student.create({
      user: user._id,
      rollNumber,
      department,
      section: section || null,
      semester: semester || 1,
      batch: batch || '2023-2027',
    });

    await logAudit(req, 'STUDENT_CREATE', 'STUDENT', student._id.toString(), `Created student profile for ${name}`);
    return sendSuccess(res, student, 'Student created', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const updateStudent = async (req, res) => {
  try {
    const { name, email, rollNumber, department, section, semester, batch } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return sendError(res, 'Student not found', 404);

    if (name || email) {
      await User.findByIdAndUpdate(student.user, {
        ...(name && { name }),
        ...(email && { email }),
        ...(department && { department }),
      });
    }

    if (rollNumber) student.rollNumber = rollNumber;
    if (department) student.department = department;
    if (section) student.section = section;
    if (semester) student.semester = semester;
    if (batch) student.batch = batch;

    await student.save();
    await logAudit(req, 'STUDENT_UPDATE', 'STUDENT', student._id.toString(), `Updated student ${rollNumber}`);
    return sendSuccess(res, student, 'Student updated');
  } catch (error) {
    return sendError(res, error.message);
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (student) {
      await User.findByIdAndDelete(student.user);
    }
    await logAudit(req, 'STUDENT_DELETE', 'STUDENT', req.params.id, 'Deleted student profile');
    return sendSuccess(res, null, 'Student deleted');
  } catch (error) {
    return sendError(res, error.message);
  }
};

// 4. SUBJECTS
const getSubjects = async (req, res) => {
  try {
    const { department, semester, search } = req.query;
    let query = {};
    if (department) query.department = department;
    if (semester) query.semester = Number(semester);
    if (search) query.name = new RegExp(search, 'i');

    const subjects = await Subject.find(query).populate('department');
    return sendSuccess(res, subjects);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const createSubject = async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    await logAudit(req, 'SUBJECT_CREATE', 'SUBJECT', subject._id.toString(), `Created subject ${subject.name} (${subject.code})`);
    return sendSuccess(res, subject, 'Subject created', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAudit(req, 'SUBJECT_UPDATE', 'SUBJECT', subject._id.toString(), `Updated subject ${subject.name}`);
    return sendSuccess(res, subject, 'Subject updated');
  } catch (error) {
    return sendError(res, error.message);
  }
};

const deleteSubject = async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    await logAudit(req, 'SUBJECT_DELETE', 'SUBJECT', req.params.id, 'Deleted subject');
    return sendSuccess(res, null, 'Subject deleted');
  } catch (error) {
    return sendError(res, error.message);
  }
};

// 5. SECTIONS
const getSections = async (req, res) => {
  try {
    const { department, semester } = req.query;
    let query = {};
    if (department) query.department = department;
    if (semester) query.semester = Number(semester);

    const sections = await Section.find(query).populate('department');
    return sendSuccess(res, sections);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const createSection = async (req, res) => {
  try {
    const section = await Section.create(req.body);
    await logAudit(req, 'SECTION_CREATE', 'SECTION', section._id.toString(), `Created section ${section.name}`);
    return sendSuccess(res, section, 'Section created', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const updateSection = async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAudit(req, 'SECTION_UPDATE', 'SECTION', section._id.toString(), `Updated section ${section.name}`);
    return sendSuccess(res, section, 'Section updated');
  } catch (error) {
    return sendError(res, error.message);
  }
};

const deleteSection = async (req, res) => {
  try {
    await Section.findByIdAndDelete(req.params.id);
    await logAudit(req, 'SECTION_DELETE', 'SECTION', req.params.id, 'Deleted section');
    return sendSuccess(res, null, 'Section deleted');
  } catch (error) {
    return sendError(res, error.message);
  }
};

// 6. CLASSROOMS
const getClassrooms = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) query.roomNumber = new RegExp(search, 'i');
    const rooms = await Classroom.find(query);
    return sendSuccess(res, rooms);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const createClassroom = async (req, res) => {
  try {
    const room = await Classroom.create(req.body);
    await logAudit(req, 'CLASSROOM_CREATE', 'CLASSROOM', room._id.toString(), `Created classroom ${room.roomNumber}`);
    return sendSuccess(res, room, 'Classroom created', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const updateClassroom = async (req, res) => {
  try {
    const room = await Classroom.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAudit(req, 'CLASSROOM_UPDATE', 'CLASSROOM', room._id.toString(), `Updated classroom ${room.roomNumber}`);
    return sendSuccess(res, room, 'Classroom updated');
  } catch (error) {
    return sendError(res, error.message);
  }
};

const deleteClassroom = async (req, res) => {
  try {
    await Classroom.findByIdAndDelete(req.params.id);
    await logAudit(req, 'CLASSROOM_DELETE', 'CLASSROOM', req.params.id, 'Deleted classroom');
    return sendSuccess(res, null, 'Classroom deleted');
  } catch (error) {
    return sendError(res, error.message);
  }
};

// 7. LABORATORIES
const getLaboratories = async (req, res) => {
  try {
    const { department } = req.query;
    let query = {};
    if (department) query.department = department;
    const labs = await Laboratory.find(query).populate('department');
    return sendSuccess(res, labs);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const createLaboratory = async (req, res) => {
  try {
    const lab = await Laboratory.create(req.body);
    await logAudit(req, 'LABORATORY_CREATE', 'LABORATORY', lab._id.toString(), `Created laboratory ${lab.name}`);
    return sendSuccess(res, lab, 'Laboratory created', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const updateLaboratory = async (req, res) => {
  try {
    const lab = await Laboratory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAudit(req, 'LABORATORY_UPDATE', 'LABORATORY', lab._id.toString(), `Updated laboratory ${lab.name}`);
    return sendSuccess(res, lab, 'Laboratory updated');
  } catch (error) {
    return sendError(res, error.message);
  }
};

const deleteLaboratory = async (req, res) => {
  try {
    await Laboratory.findByIdAndDelete(req.params.id);
    await logAudit(req, 'LABORATORY_DELETE', 'LABORATORY', req.params.id, 'Deleted laboratory');
    return sendSuccess(res, null, 'Laboratory deleted');
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = {
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getFaculty, createFaculty, updateFaculty, deleteFaculty,
  getStudents, createStudent, updateStudent, deleteStudent,
  getSubjects, createSubject, updateSubject, deleteSubject,
  getSections, createSection, updateSection, deleteSection,
  getClassrooms, createClassroom, updateClassroom, deleteClassroom,
  getLaboratories, createLaboratory, updateLaboratory, deleteLaboratory,
};
