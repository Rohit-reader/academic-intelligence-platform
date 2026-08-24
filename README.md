# Academic Operations Manager (AG012) — Enterprise Platform

An enterprise MERN web application built with a light mode SaaS UI layout, constraint-based timetable engine, Digital Twin What-If simulation studio, Smart Ripple-Effect impact analyzer, and a centralized Role-Based Access Control (RBAC) authorization system.

---

## 🔒 Authorization & RBAC Architecture

The platform enforces a server-side authorization security model:

$$\text{Authentication (JWT)} \rightarrow \text{Role Permission} \rightarrow \text{Data Scope} \rightarrow \text{Action}$$

### 1. Primary Roles & Data Scopes

| Role | Primary Scope | Permitted Modules & Operations |
|---|---|---|
| **ADMIN** | Institution-Wide | Full CRUD on Users, Departments, Faculty, Students, Subjects, Sections, Classrooms, Labs, Timetable Engine, Digital Twin, Examinations, Events, Security & Audit Logs. |
| **HOD** | Assigned Department Only | Department-level Faculty, Students, Subjects, Sections, Timetable, Leave Approvals, Workload Distribution, Events, Analytics. **Blocked from foreign department data or global user settings.** |
| **FACULTY** | Assigned Classes & Self | Own Profile, Own Weekly Timetable, Assigned Class Roster, Workload Metrics, Create/View Leave Requests. **Blocked from approving own leave or editing timetables.** |
| **STUDENT** | Enrolled Roster & Self | Own Profile, Section Weekly Timetable, Examination Schedule & Room Assignments, Enrolled Subjects, Notifications, Academic Events. |
| **EXAM_CELL** | Institution Examinations | Schedule Exams, Exam Room Seating Allocations, Invigilation, Room Conflict Checks, Exam Simulations. **Blocked from modifying normal timetables or user roles.** |

---

### 2. Centralized Permission Matrix (`server/src/config/permissions.js`)

Permissions are explicitly mapped per role rather than hardcoded `if (user.role === 'ADMIN')` checks:

```js
const PERMISSION_MATRIX = {
  ADMIN: ['users:manage', 'departments:manage', 'faculty:manage', 'students:manage', 'timetable:manage', ...],
  HOD: ['faculty:read:dept', 'students:read:dept', 'subjects:manage:dept', 'leave:approve:dept', ...],
  FACULTY: ['profile:read:self', 'timetable:read:self', 'leave:create', 'leave:read:self', ...],
  STUDENT: ['profile:read:self', 'timetable:read:self', 'exams:read:self', 'subjects:read:self', ...],
  EXAM_CELL: ['exams:create', 'exams:read', 'exam_rooms:manage', 'seating:manage', ...],
};
```

---

### 3. Server-Side Security Middleware (`server/src/middleware/permissions.js`)

- **`requirePermission(code)`**: Ensures user possesses explicit permission code.
- **`requireDepartmentScope()`**: Enforces HOD requests match `req.user.department` (prevents cross-department tampering).
- **`requireOwnership()`**: Enforces users can only access their own profile/data (prevents BOLA / IDOR vulnerabilities).
- **Audit Logging**: Any unauthorized access attempt logs a `PERMISSION_DENIED` event in `AuditLog` and triggers a `UNAUTHORIZED_ACCESS` alert in `SecurityAlert`.

---

## ⚡ Key Features

- **Smart Ripple-Effect Impact Analyzer**: Deterministic rule engine analyzing direct & indirect impact of resource changes (faculty leave, room maintenance, event additions) with visual timeline, 3 scored replacement scenarios (0–100), and before-after diff previews.
- **Digital Twin What-If Studio**: Isolated virtual buffer for simulating hypothetical faculty absences, room blocks, or new events without altering production data.
- **Constraint-Based Timetable Engine**: Automated weekly timetable matrix builder with hard/soft conflict detector.
- **Dynamic Dashboard Visualizations**: Built with `Recharts` (Bar charts, Area charts, and Quick Access shortcuts).

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@university.edu` | `Admin@123` |
| **HOD (CSE)** | `hod.cse@university.edu` | `Hod@123` |
| **Faculty** | `ravi@university.edu` | `Faculty@123` |
| **Student** | `student1@university.edu` | `Student@123` |
| **Exam Cell** | `examcell@university.edu` | `Exam@123` |

---

## 🛠️ Project Setup & Execution

### 1. Backend Server (`http://localhost:5000`)
```bash
cd server
npm install
npm run dev
```

### 2. Frontend Client (`http://localhost:5173`)
```bash
cd client
npm install
npm run dev
```
