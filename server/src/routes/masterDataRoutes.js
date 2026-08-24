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
const { requirePermission, requireDepartmentScope } = require('../middleware/permissions');

router.use(protect);

// Departments
router.route('/departments')
  .get(getDepartments)
  .post(requirePermission('departments:manage'), createDepartment);
router.route('/departments/:id')
  .put(requirePermission('departments:manage'), updateDepartment)
  .delete(requirePermission('departments:manage'), deleteDepartment);

// Faculty
router.route('/faculty')
  .get(requireDepartmentScope(), getFaculty)
  .post(requirePermission('faculty:manage'), createFaculty);
router.route('/faculty/:id')
  .put(requirePermission('faculty:manage'), updateFaculty)
  .delete(requirePermission('faculty:manage'), deleteFaculty);

// Students
router.route('/students')
  .get(requireDepartmentScope(), getStudents)
  .post(requirePermission('students:manage'), createStudent);
router.route('/students/:id')
  .put(requirePermission('students:manage'), updateStudent)
  .delete(requirePermission('students:manage'), deleteStudent);

// Subjects
router.route('/subjects')
  .get(requireDepartmentScope(), getSubjects)
  .post(requireDepartmentScope(), createSubject);
router.route('/subjects/:id')
  .put(requireDepartmentScope(), updateSubject)
  .delete(requireDepartmentScope(), deleteSubject);

// Sections
router.route('/sections')
  .get(requireDepartmentScope(), getSections)
  .post(requireDepartmentScope(), createSection);
router.route('/sections/:id')
  .put(requireDepartmentScope(), updateSection)
  .delete(requireDepartmentScope(), deleteSection);

// Classrooms
router.route('/classrooms')
  .get(getClassrooms)
  .post(requirePermission('classrooms:manage'), createClassroom);
router.route('/classrooms/:id')
  .put(requirePermission('classrooms:manage'), updateClassroom)
  .delete(requirePermission('classrooms:manage'), deleteClassroom);

// Laboratories
router.route('/labs')
  .get(requireDepartmentScope(), getLaboratories)
  .post(requirePermission('labs:manage'), createLaboratory);
router.route('/labs/:id')
  .put(requirePermission('labs:manage'), updateLaboratory)
  .delete(requirePermission('labs:manage'), deleteLaboratory);

module.exports = router;
