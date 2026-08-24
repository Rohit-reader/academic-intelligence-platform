# AG012 – Autonomous Academic Intelligence Platform

You are the lead full-stack engineer for this project.

## GOAL

Build a production-quality MERN web application that acts as an AI-powered Academic Operations Manager for colleges/universities.

The platform should manage academic operations, not just timetable generation.

---

# TECH STACK

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB
- Database GUI: MongoDB Compass
- Authentication: JWT + bcrypt
- API communication: Axios
- Styling: Tailwind CSS
- Charts: Recharts or another lightweight React chart library
- Icons: Lucide React
- JavaScript preferred unless TypeScript provides a clear advantage

Keep the architecture modular so AI/ML and optimization services can be integrated later.

---

# IMPORTANT: EXISTING PROJECT

The project folder already exists.

DO NOT create another parent project folder.

First inspect the existing project.

Then:

1. Determine what files already exist.
2. Preserve useful existing work.
3. Create the required folder structure yourself.
4. Install required dependencies.
5. Configure the MERN project.
6. Do not ask me to manually create folders unless absolutely necessary.

---

# CORE PRODUCT

The platform should provide:

1. Authentication & RBAC
2. Academic Master Data
3. Timetable Management
4. Conflict Detection
5. Conflict Prediction
6. Faculty Leave Management
7. Faculty Workload Management
8. Classroom Management
9. Laboratory Management
10. Resource Optimization
11. AI Recommendation Engine
12. Digital Twin / What-if Simulation
13. Explainable AI
14. Examination Management
15. Events / Workshops / Placements
16. Audit Logs
17. Security / Anomaly Detection
18. Admin Dashboard
19. HOD Dashboard
20. Faculty Dashboard
21. Student Dashboard
22. Examination Cell Dashboard

---

# USER ROLES

Implement RBAC with:

- ADMIN
- HOD
- FACULTY
- STUDENT
- EXAM_CELL

Permissions must be enforced in backend middleware, not only hidden in the frontend.

## ADMIN

Can:

- Manage users
- Manage departments
- Manage faculty
- Manage students
- Manage subjects
- Manage classrooms
- Manage laboratories
- Manage timetable
- View analytics
- View audit logs
- Manage system settings

## HOD

Can:

- Manage own department
- Manage faculty workload
- Manage department timetable
- Review leave
- Review AI recommendations
- Approve timetable changes
- View department analytics

## FACULTY

Can:

- View own timetable
- View workload
- Apply for leave
- View assigned subjects/classes

## STUDENT

Can:

- View timetable
- View examination schedule
- View academic events
- View announcements

## EXAM_CELL

Can:

- Manage examinations
- Allocate examination rooms
- View required academic data related to examinations

---

# FOLDER STRUCTURE

Create a clean modular structure similar to:

/

├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── utils/
│   │   └── assets/
│   └── ...

├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   ├── server.js
│   └── ...

├── README.md
└── .gitignore

Adjust the structure if a better architecture is required.

---

# DATABASE

Use MongoDB with Mongoose.

The application must connect using:

MONGO_URI=

The user will use MongoDB Compass to inspect and manage the database.

Create appropriate Mongoose models for:

- User
- Department
- Faculty
- Student
- Subject
- Section
- Classroom
- Laboratory
- Timetable
- TimetableEntry
- LeaveRequest
- Event
- Workshop
- Placement
- Examination
- ExamRoomAllocation
- Recommendation
- Simulation
- AuditLog
- Notification

Use references between collections where appropriate.

Use timestamps on important models.

Never store passwords in plain text.

---

# AUTHENTICATION

Implement:

- User registration
- Login
- JWT authentication
- Password hashing using bcrypt
- Protected routes
- Role-based authorization
- Logout
- Persistent authentication
- Current-user endpoint

Never hardcode JWT secrets.

Use:

JWT_SECRET=

in `.env`.

---

# DASHBOARDS

Create separate dashboards based on role.

## ADMIN DASHBOARD

Show:

- Total students
- Faculty count
- Departments
- Classrooms
- Laboratories
- Active timetable
- Pending approvals
- Conflicts
- Leave requests
- Security alerts
- Recent audit logs

## HOD DASHBOARD

Show:

- Department statistics
- Faculty workload
- Today's classes
- Conflicts
- Leave requests
- AI recommendations
- Pending approvals

## FACULTY DASHBOARD

Show:

- Today's classes
- Weekly timetable
- Workload
- Leave application
- Leave history

## STUDENT DASHBOARD

Show:

- Today's timetable
- Weekly timetable
- Upcoming exams
- Events/workshops

## EXAM CELL DASHBOARD

Show:

- Upcoming exams
- Room allocation
- Conflicts
- Exam capacity

---

# ACADEMIC MASTER DATA

Admin should be able to CRUD:

- Departments
- Faculty
- Students
- Subjects
- Sections
- Classrooms
- Laboratories

Include:

- Search
- Filtering
- Sorting
- Pagination where appropriate
- Form validation
- Loading states
- Empty states
- Error handling

---

# TIMETABLE ENGINE

Build the timetable module as a constraint-based system.

## Hard Constraints

- Faculty cannot teach two classes at the same time.
- Room cannot host two classes at the same time.
- Section cannot attend two classes at the same time.
- Room capacity must be sufficient.
- Lab-required subjects require labs.
- Faculty must be available.
- Required weekly periods must be satisfied.

## Soft Constraints

- Balance faculty workload.
- Minimize unnecessary gaps.
- Prefer faculty availability.
- Prefer suitable rooms.
- Avoid excessive consecutive classes.

Initially implement a reliable rule/constraint engine.

Do NOT pretend a basic random timetable generator is AI.

Design the system so a real optimization engine can later be integrated.

---

# CONFLICT DETECTION

Create a service that checks timetable conflicts.

Detect:

- Faculty conflicts
- Room conflicts
- Section conflicts
- Capacity conflicts
- Availability conflicts
- Laboratory conflicts
- Workload problems

Return human-readable explanations.

Example:

> Faculty Ravi is assigned to DBMS and Networks at Monday 10:00 AM.

---

# FACULTY LEAVE MANAGEMENT

Faculty can submit leave requests.

Workflow:

Faculty submits leave
→ HOD/Admin reviews
→ System identifies affected classes
→ Generate possible replacement/rescheduling options
→ Create recommendation
→ HOD approves
→ Timetable can be updated
→ Audit log created

Display affected:

- Classes
- Faculty
- Rooms
- Sections
- Students

---

# RESOURCE OPTIMIZATION

Build services to recommend:

- Suitable classroom based on capacity
- Available laboratory
- Available faculty
- Suitable time slot

Show WHY a resource was selected.

Example:

> Room 301 selected because it has capacity 60, is available at 10:00 AM, and matches the section size of 55.

---

# AI RECOMMENDATION ENGINE

Create a modular recommendation service.

It should accept a problem/event and produce:

- Problem
- Possible solutions
- Score for each solution
- Recommended solution
- Explanation
- Impact
- Confidence/quality score

Example:

Problem:

> Faculty Ravi is unavailable Monday.

Scenario A:

> Move class to Tuesday 10 AM  
> Conflicts: 2

Scenario B:

> Assign Faculty Kumar  
> Conflicts: 1

Scenario C:

> Move class to Wednesday 11 AM  
> Conflicts: 0

Recommendation:

> Scenario C

Reason:

- No student conflict
- Room available
- Faculty available
- Zero timetable conflicts

Initially implement this using deterministic rules/scoring.

DO NOT fabricate AI functionality.

Keep an abstraction layer so an LLM/ML model can later replace or enhance the recommendation service.

---

# DIGITAL TWIN / WHAT-IF SIMULATION

Create a What-If Simulation module.

Users should be able to simulate:

- Faculty leave
- Classroom unavailable
- Laboratory unavailable
- Event added
- Workshop added
- Placement drive added
- Timetable change

Simulation must NOT immediately modify production data.

Workflow:

Current state
→ Create temporary simulation
→ Apply hypothetical change
→ Detect conflicts
→ Generate alternatives
→ Score scenarios
→ Recommend best scenario
→ User can Apply Scenario

Show:

- Affected classes
- Affected students
- Conflicts
- Resource changes
- Scenario comparison
- Recommended scenario

---

# EXPLAINABLE AI

Every recommendation must contain a human-readable explanation.

Never display only:

> AI recommends Scenario C.

Instead display:

> Scenario C was selected because:
>
> - Faculty Kumar is available.
> - Room 301 is available.
> - CSE-A has no conflicting class.
> - Faculty workload remains within limits.
> - The scenario creates zero hard conflicts.

---

# EXAMINATION MANAGEMENT

Create basic examination management.

Admin/Exam Cell can:

- Create examination
- Assign subjects
- Assign date/time
- Allocate rooms
- Check room capacity
- Detect student/exam conflicts
- Detect room conflicts

Students can view their examination timetable.

---

# EVENTS / WORKSHOPS / PLACEMENTS

Create an event management module.

Events can affect:

- Rooms
- Faculty
- Students
- Timetable

When an event is added, the system should identify possible academic conflicts.

---

# SECURITY

Implement:

- JWT authentication
- RBAC
- Backend authorization middleware
- Input validation
- Helmet
- Rate limiting
- CORS configuration
- Secure password storage
- Audit logging

Audit important actions:

- Login
- Failed login
- User creation
- Timetable modification
- Leave approval
- Recommendation approval
- Simulation application
- Exam modification
- Permission-denied actions

---

# ANOMALY DETECTION

For MVP, implement rule-based anomaly detection.

Examples:

- Too many timetable changes by one user
- Repeated unauthorized access
- Bulk modification
- Multiple failed login attempts
- User attempting privileged operation

Create a security dashboard showing:

- Alert type
- User
- Timestamp
- Severity
- Action
- Status

Do not claim this is ML anomaly detection unless an actual ML model is implemented.

---

# UI/UX

Build a professional modern SaaS-style dashboard.

Requirements:

- Responsive
- Desktop-first
- Mobile-friendly
- Sidebar navigation
- Top navigation
- Cards
- Tables
- Charts
- Modal forms
- Toast notifications
- Confirmation dialogs
- Loading skeletons
- Empty states
- Error states

Use a consistent design system.

Prioritize usability over excessive animations.

---

# REST API

Create clean REST APIs.

Examples:

/api/auth
/api/users
/api/departments
/api/faculty
/api/students
/api/subjects
/api/sections
/api/classrooms
/api/labs
/api/timetable
/api/conflicts
/api/leaves
/api/recommendations
/api/simulations
/api/exams
/api/events
/api/audit
/api/security

Use:

Controllers
→ Services
→ Models

Do not put all business logic inside route files.

---

# ENVIRONMENT VARIABLES

Create `.env.example`:

PORT=
MONGO_URI=
JWT_SECRET=
CLIENT_URL=

Never commit real secrets.

---

# SEED DATA

Create a database seed script.

Seed realistic demo data:

- 2–3 departments
- 10+ faculty
- 100+ students
- Multiple sections
- 15+ subjects
- Multiple classrooms
- 3+ laboratories
- Timetable entries
- Sample leave requests
- Sample events
- Sample examinations
- Sample audit logs

Create demo accounts for each role.

Clearly document demo credentials in README for local development only.

---

# DEVELOPMENT PHASES

Build incrementally.

## PHASE 1 — FOUNDATION

Implement:

- Project structure
- MongoDB connection
- Authentication
- JWT
- RBAC
- Base layouts
- Navigation

## PHASE 2 — ACADEMIC DATA

Implement:

- Departments
- Faculty
- Students
- Subjects
- Sections
- Classrooms
- Laboratories

## PHASE 3 — TIMETABLE

Implement:

- Timetable CRUD
- Timetable generation
- Constraint checking
- Conflict detection

## PHASE 4 — INTELLIGENCE

Implement:

- Faculty leave
- Faculty workload
- Resource optimization
- Conflict prediction
- AI recommendations
- Explainable recommendations

## PHASE 5 — DIGITAL TWIN

Implement:

- What-if simulation
- Scenario generation
- Scenario comparison
- Apply recommended scenario

## PHASE 6 — ADDITIONAL OPERATIONS

Implement:

- Examination management
- Events
- Workshops
- Placements

## PHASE 7 — SECURITY

Implement:

- Audit logs
- Security dashboard
- Rule-based anomaly detection
- Unauthorized activity detection

## PHASE 8 — POLISH

Implement:

- Error handling
- Testing
- Responsive UI
- Seed data
- Performance improvements
- Documentation

---

# CODING RULES

1. Write clean, maintainable code.
2. Avoid unnecessary dependencies.
3. Avoid duplicated logic.
4. Use reusable components.
5. Keep frontend and backend separated.
6. Validate backend inputs.
7. Handle API errors properly.
8. Never expose secrets.
9. Do not use fake API responses in the final implementation.
10. Do not hardcode business data.
11. Use MongoDB through Mongoose.
12. Add comments only where genuinely useful.
13. Keep functions reasonably small.
14. Use meaningful variable/function names.
15. Do not over-engineer the MVP.
16. Keep the application runnable throughout development.

---

# IMPORTANT AGENT BEHAVIOR

Do not explain every small action to me.

Work directly on the codebase.

Before changing anything:

1. Inspect the existing project.
2. Determine its current state.
3. Preserve useful existing code.

Then implement the project phase by phase.

After each major phase:

1. Run the application/build.
2. Fix compilation errors.
3. Verify APIs.
4. Verify frontend compilation.
5. Verify MongoDB connection.
6. Continue to the next phase.

Do not stop after creating empty folders.

Do not create placeholder pages that look complete but have no functionality.

When a feature is not implemented yet, clearly mark it as planned rather than pretending it works.

---

# START NOW

Inspect the existing project and begin with PHASE 1.

Do not ask me to create the folder structure manually.

Create the structure yourself and start implementing the working application.