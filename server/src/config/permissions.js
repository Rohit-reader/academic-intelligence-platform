/**
 * Centralized Permission Matrix & Scope Definitions
 * ROLE + PERMISSION + DATA SCOPE
 */

const PERMISSION_MATRIX = {
  ADMIN: [
    'users:manage',
    'departments:manage',
    'faculty:manage',
    'students:manage',
    'subjects:manage',
    'sections:manage',
    'classrooms:manage',
    'labs:manage',
    'timetable:manage',
    'leave:manage:all',
    'workload:manage:all',
    'simulations:manage',
    'exams:manage',
    'events:manage',
    'security:read',
    'security:manage',
    'audit:read',
  ],
  HOD: [
    'faculty:read:dept',
    'students:read:dept',
    'subjects:manage:dept',
    'sections:manage:dept',
    'timetable:manage:dept',
    'leave:approve:dept',
    'workload:manage:dept',
    'simulations:create:dept',
    'events:manage:dept',
    'analytics:read:dept',
    'security:read:dept',
  ],
  FACULTY: [
    'profile:read:self',
    'profile:update:self',
    'timetable:read:self',
    'workload:read:self',
    'leave:create',
    'leave:read:self',
    'students:read:assigned',
    'events:read',
  ],
  STUDENT: [
    'profile:read:self',
    'profile:update:self',
    'timetable:read:self',
    'exams:read:self',
    'subjects:read:self',
    'notifications:read:self',
    'events:read',
  ],
  EXAM_CELL: [
    'exams:create',
    'exams:read',
    'exams:update',
    'exams:delete',
    'exam_rooms:manage',
    'seating:manage',
    'invigilation:manage',
    'exam_simulation:create',
    'exam_simulation:apply',
    'conflicts:read:exams',
  ],
};

const hasPermission = (userRole, requiredPermission) => {
  if (!userRole || !PERMISSION_MATRIX[userRole]) return false;
  return PERMISSION_MATRIX[userRole].includes(requiredPermission);
};

module.exports = {
  PERMISSION_MATRIX,
  hasPermission,
};
