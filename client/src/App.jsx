import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { DashboardIndex } from './pages/Dashboards/DashboardIndex';
import { MasterData } from './pages/MasterData';
import { Timetable } from './pages/Timetable';
import { LeaveManagement } from './pages/LeaveManagement';
import { DigitalTwin } from './pages/DigitalTwin';
import { Examinations } from './pages/Examinations';
import { Events } from './pages/Events';
import { Security } from './pages/Security';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">Authenticating...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardIndex />} />
            <Route
              path="/master-data"
              element={
                <ProtectedRoute roles={['ADMIN', 'HOD']}>
                  <MasterData />
                </ProtectedRoute>
              }
            />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/leaves" element={<LeaveManagement />} />
            <Route
              path="/digital-twin"
              element={
                <ProtectedRoute roles={['ADMIN', 'HOD']}>
                  <DigitalTwin />
                </ProtectedRoute>
              }
            />
            <Route path="/exams" element={<Examinations />} />
            <Route path="/events" element={<Events />} />
            <Route
              path="/security"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <Security />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
