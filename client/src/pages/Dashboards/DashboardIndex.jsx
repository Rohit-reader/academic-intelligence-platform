import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { HodDashboard } from './HodDashboard';
import { FacultyDashboard } from './FacultyDashboard';
import { StudentDashboard } from './StudentDashboard';
import { ExamCellDashboard } from './ExamCellDashboard';

export const DashboardIndex = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'HOD':
      return <HodDashboard />;
    case 'FACULTY':
      return <FacultyDashboard />;
    case 'STUDENT':
      return <StudentDashboard />;
    case 'EXAM_CELL':
      return <ExamCellDashboard />;
    default:
      return <AdminDashboard />;
  }
};
