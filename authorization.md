# AG012 — Authorization & RBAC Implementation

Implement the complete authorization system for AG012.

## ROLES

The system has exactly these primary roles:

- ADMIN
- HOD
- FACULTY
- STUDENT
- EXAM_CELL

Use RBAC for the base permission model, combined with data-level/department-level authorization.

IMPORTANT:
Do NOT rely only on frontend role checks.
Every protected API request must be authorized on the backend.

Use:
Authentication → Role Permission → Data Scope → Action

Follow:
- Least privilege
- Deny by default
- Server-side authorization
- Object/data-level authorization
- Audit authorization-sensitive actions

---

# 1. ADMIN

Scope: Entire institution.

Permissions:

Users:
- Create users
- View users
- Update users
- Deactivate users
- Assign roles
- Reset passwords

Departments:
- Create/read/update/delete departments

Faculty:
- Full CRUD

Students:
- Full CRUD

Subjects:
- Full CRUD

Sections:
- Full CRUD

Classrooms:
- Full CRUD

Laboratories:
- Full CRUD

Timetable:
- Create
- View
- Update
- Delete
- Generate
- Validate
- Detect conflicts
- Apply recommendations
- Apply simulation scenarios

Faculty Leave:
- View all
- Approve
- Reject
- Override when necessary

Workload:
- View all
- Configure workload rules

AI Recommendations:
- View
- Approve
- Reject
- Apply

Digital Twin:
- Create simulation
- Run simulation
- Compare scenarios
- Apply scenario

Examinations:
- Full access

Events:
- Full access

Security:
- View security alerts
- View anomaly detection
- View audit logs
- Manage security settings

System:
- Full configuration access

---

# 2. HOD

Scope:
ONLY their own department.

Every HOD request must be checked against their departmentId.

Permissions:

Faculty:
- View department faculty
- Manage department faculty-related academic data

Students:
- View department students
- Manage department academic information

Subjects:
- View/manage department subjects

Sections:
- View/manage department sections

Classrooms/Labs:
- View available resources
- Request/manage department allocation where appropriate

Timetable:
- View department timetable
- Create department timetable changes
- Update department timetable
- Detect conflicts
- Run department simulations
- Review recommendations
- Approve department-level recommendations

Leave:
- View department leave requests
- Approve department faculty leave
- Reject department faculty leave

Workload:
- View department workload
- Manage workload distribution
- Detect overloaded/underloaded faculty

Events:
- Create/manage department events

Analytics:
- View department analytics
- View department resource utilization
- View department conflicts

Security:
- View relevant department-level security/audit events only

HOD MUST NOT:
- Modify another department's data
- Manage global users
- Change roles
- Change system security settings
- Access institution-wide confidential data unless explicitly permitted

---

# 3. FACULTY

Scope:
Own profile + assigned academic resources.

Permissions:

Profile:
- View own profile
- Update allowed personal information

Timetable:
- View own timetable
- View assigned classes
- Report timetable conflicts
- Request timetable changes

Students:
- View students belonging to assigned classes only

Subjects:
- View assigned subjects

Workload:
- View own workload

Leave:
- Create leave request
- View own leave requests
- Cancel pending leave request

Faculty must NOT:
- Approve own leave
- Modify timetable directly
- Modify another faculty member
- View all students
- View other faculty workloads unless explicitly allowed
- Access audit/security logs
- Manage users

---

# 4. STUDENT

Scope:
Own student account and academic information.

Permissions:

Profile:
- View own profile
- Update allowed profile information

Timetable:
- View own section timetable
- View today's timetable
- View timetable changes

Examinations:
- View own examination schedule
- View assigned exam room

Subjects:
- View enrolled subjects

Faculty:
- View faculty associated with own subjects

Events:
- View relevant academic events

Notifications:
- View own notifications

Reports:
- View own academic information

Students MUST NOT:
- Modify timetable
- View other students' private information
- View faculty workload
- View administrative data
- View security information
- Access AI administrative controls
- Access audit logs

---

# 5. EXAM_CELL

Scope:
Institution-wide examination data ONLY.

Permissions:

Examinations:
- Create examinations
- View examinations
- Update examinations
- Delete/cancel examinations
- Schedule exam dates
- Schedule exam sessions

Exam Rooms:
- View rooms
- Allocate exam rooms
- Validate room capacity
- Detect room conflicts

Seating:
- Generate seating allocation
- View seating plans
- Modify seating allocation

Invigilation:
- Assign invigilators
- View invigilation schedules

Students:
- View required examination-related student data only

Faculty:
- View faculty data required for invigilation

Conflict Detection:
- Detect examination conflicts
- Detect room conflicts
- Detect invigilator conflicts

Simulation:
- Simulate examination scheduling
- Simulate room unavailability
- Compare examination scenarios
- Apply approved examination scenarios

Analytics:
- View examination analytics

EXAM_CELL MUST NOT:
- Manage application users
- Change user roles
- Modify normal academic timetable
- Modify faculty workload
- Access unrelated department data
- Access system security configuration

---

# PERMISSION MODEL

Do NOT hardcode authorization everywhere like:

if (user.role === "ADMIN")

Instead create centralized permissions.

Example:

ADMIN:
- users:create
- users:read
- users:update
- users:delete
- timetable:create
- timetable:read
- timetable:update
- timetable:delete
- timetable:generate
- timetable:apply
- simulation:create
- simulation:apply
- recommendations:approve
- exams:manage
- security:read
- audit:read

HOD:
- faculty:read
- students:read
- timetable:create
- timetable:read
- timetable:update
- conflicts:read
- leave:approve
- workload:manage
- simulation:create
- recommendations:approve

FACULTY:
- profile:read:self
- profile:update:self
- timetable:read:self
- workload:read:self
- leave:create
- leave:read:self
- students:read:assigned

STUDENT:
- profile:read:self
- timetable:read:self
- exams:read:self
- subjects:read:self
- notifications:read:self

EXAM_CELL:
- exams:create
- exams:read
- exams:update
- exams:delete
- exam_rooms:manage
- seating:manage
- invigilation:manage
- exam_simulation:create
- exam_simulation:apply

---

# DATA-LEVEL AUTHORIZATION

This is critical.

Having permission is NOT enough.

Example:

HOD has:

timetable:update

But HOD can only update timetable entries where:

timetable.departmentId === user.departmentId

Faculty has:

students:read:assigned

Therefore faculty can only access students belonging to their assigned sections/classes.

Student has:

timetable:read:self

Therefore student can only retrieve their own section timetable.

Exam Cell has access to examination data but not unrelated academic administration.

Prevent IDOR/BOLA vulnerabilities.

A user must NOT gain access simply by changing an ID in the API request.

Example:

GET /api/students/123

must verify that the authenticated user is authorized to access student 123.

Do NOT rely on MongoDB ObjectId secrecy.

---

# BACKEND MIDDLEWARE

Create centralized middleware such as:

authenticateUser
requirePermission
requireRole
requireDepartmentScope
requireOwnership
requireResourceAccess

Example architecture:

Request
 ↓
authenticateUser
 ↓
requirePermission("timetable:update")
 ↓
checkResourceAccess()
 ↓
Controller
 ↓
Service
 ↓
Database

Authorization must happen before sensitive business operations.

---

# FRONTEND

Frontend should dynamically display navigation and actions based on permissions.

Examples:

ADMIN:
Show all modules.

HOD:
Show only department-management modules.

FACULTY:
Show:
- Dashboard
- My Timetable
- My Workload
- Leave
- My Classes

STUDENT:
Show:
- Dashboard
- My Timetable
- Exams
- Subjects
- Events
- Notifications

EXAM_CELL:
Show:
- Dashboard
- Examinations
- Exam Rooms
- Seating
- Invigilation
- Exam Conflicts
- Exam Simulation

IMPORTANT:

Frontend hiding is ONLY for UX.

Backend authorization remains the real security boundary.

---

# API SECURITY

Every protected endpoint must verify:

1. Is the user authenticated?
2. Does the user have the required permission?
3. Is the requested resource within their allowed scope?
4. Is the requested action allowed?
5. If the request fails, return a safe 403 response.

Use 401 for unauthenticated requests.

Use 403 for authenticated users without permission.

Do not expose sensitive implementation details in authorization errors.

---

# AUDIT LOGGING

Create audit logs for security-sensitive actions.

Record:

- userId
- role
- action
- resource
- resourceId
- timestamp
- IP if available
- result: SUCCESS / DENIED
- reason where appropriate

Examples:

ADMIN updated timetable.

HOD approved faculty leave.

FACULTY attempted unauthorized timetable modification.

STUDENT attempted to access another student's data.

EXAM_CELL modified exam room allocation.

Also log failed authorization attempts.

---

# SECURITY TEST CASES

Create tests for authorization.

At minimum test:

1. Student cannot access admin API.
2. Faculty cannot modify timetable.
3. Faculty cannot access another faculty member's private data.
4. Student cannot access another student's data.
5. HOD cannot modify another department's timetable.
6. HOD cannot modify system roles.
7. Exam Cell cannot modify normal timetable.
8. Exam Cell cannot change user roles.
9. Admin can access authorized institutional resources.
10. Unauthorized resource IDs return 403.
11. Missing permissions default to DENY.
12. Frontend restrictions cannot bypass backend authorization.

---

# ADMIN PERMISSION MANAGEMENT

Create an Admin page:

Settings → Roles & Permissions

Display:

Role | Module | Permission | Scope

Example:

HOD | Timetable | Update | Own Department
Faculty | Timetable | Read | Own Classes
Student | Timetable | Read | Own Section
Exam Cell | Exams | Manage | Institution

Do not allow arbitrary privilege escalation.

Any permission change must create an audit log.

---

# DESIGN PRINCIPLE

Use:

ROLE + PERMISSION + DATA SCOPE

instead of only:

ROLE

Example:

HOD
+
timetable:update
+
departmentId match
=
ALLOW

Otherwise:
=
DENY

---

# FINAL REQUIREMENT

Implement this authorization architecture cleanly in the existing AG012 MERN project.

Do not create fake authorization.

Do not rely on frontend-only checks.

Do not duplicate permission logic across controllers.

Centralize authorization logic into reusable middleware/services.

Keep the system extensible so additional roles and permissions can be added later without rewriting the application.

After implementation:

1. Run backend.
2. Run frontend.
3. Test login for all five roles.
4. Test role-specific dashboards.
5. Test API authorization.
6. Test department-level restrictions.
7. Test ownership restrictions.
8. Test unauthorized access.
9. Fix all authorization bugs.
10. Document the authorization architecture in README.md.