const express = require('express');
const router = express.Router();
const {
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getFaculty, createFaculty, updateFaculty, deleteFaculty,
  getStudents, createStudent, updateStudent, deleteStudent,
  getSubjects, createSubject, updateSubject, deleteSubject,
  getSections, createSection, updateSection, deleteSection,
  getClassrooms, createClassroom, updateClassroom, deleteClassroom,
  getLaboratories, createLaboratory, updateLaboratory, deleteLaboratory,
} = require('../controllers/masterDataController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

// Departments
router.route('/departments')
  .get(getDepartments)
  .post(authorize('ADMIN'), createDepartment);
router.route('/departments/:id')
  .put(authorize('ADMIN'), updateDepartment)
  .delete(authorize('ADMIN'), deleteDepartment);

// Faculty
router.route('/faculty')
  .get(getFaculty)
  .post(authorize('ADMIN'), createFaculty);
router.route('/faculty/:id')
  .put(authorize('ADMIN'), updateFaculty)
  .delete(authorize('ADMIN'), deleteFaculty);

// Students
router.route('/students')
  .get(getStudents)
  .post(authorize('ADMIN'), createStudent);
router.route('/students/:id')
  .put(authorize('ADMIN'), updateStudent)
  .delete(authorize('ADMIN'), deleteStudent);

// Subjects
router.route('/subjects')
  .get(getSubjects)
  .post(authorize('ADMIN', 'HOD'), createSubject);
router.route('/subjects/:id')
  .put(authorize('ADMIN', 'HOD'), updateSubject)
  .delete(authorize('ADMIN', 'HOD'), deleteSubject);

// Sections
router.route('/sections')
  .get(getSections)
  .post(authorize('ADMIN', 'HOD'), createSection);
router.route('/sections/:id')
  .put(authorize('ADMIN', 'HOD'), updateSection)
  .delete(authorize('ADMIN', 'HOD'), deleteSection);

// Classrooms
router.route('/classrooms')
  .get(getClassrooms)
  .post(authorize('ADMIN'), createClassroom);
router.route('/classrooms/:id')
  .put(authorize('ADMIN'), updateClassroom)
  .delete(authorize('ADMIN'), deleteClassroom);

// Laboratories
router.route('/labs')
  .get(getLaboratories)
  .post(authorize('ADMIN'), createLaboratory);
router.route('/labs/:id')
  .put(authorize('ADMIN'), updateLaboratory)
  .delete(authorize('ADMIN'), deleteLaboratory);

module.exports = router;
