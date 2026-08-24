import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Database, Calendar, UserCheck, Layers, TestTube,
  FileCheck, ShieldAlert, ShieldCheck, LogOut, Bell, ChevronRight, Menu, X, GraduationCap
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'HOD', 'FACULTY', 'STUDENT', 'EXAM_CELL'] },
    { label: 'Master Data', path: '/master-data', icon: Database, roles: ['ADMIN', 'HOD'] },
    { label: 'Timetable Engine', path: '/timetable', icon: Calendar, roles: ['ADMIN', 'HOD', 'FACULTY', 'STUDENT'] },
    { label: 'Faculty Leave Management', path: '/leaves', icon: UserCheck, roles: ['ADMIN', 'HOD', 'FACULTY'] },
    { label: 'Digital Twin (What-If)', path: '/digital-twin', icon: Layers, roles: ['ADMIN', 'HOD'] },
    { label: 'Examinations', path: '/exams', icon: FileCheck, roles: ['ADMIN', 'EXAM_CELL', 'STUDENT'] },
    { label: 'Events & Workshops', path: '/events', icon: TestTube, roles: ['ADMIN', 'HOD', 'FACULTY', 'STUDENT'] },
    { label: 'Security & Audits', path: '/security', icon: ShieldAlert, roles: ['ADMIN'] },
    { label: 'Roles & Permissions', path: '/roles-permissions', icon: ShieldCheck, roles: ['ADMIN'] },
  ];

  const filteredNav = navItems.filter((item) => user && item.roles.includes(user.role));

  const roleStyles = {
    ADMIN: 'bg-rose-50 text-rose-700 border-rose-200',
    HOD: 'bg-purple-50 text-purple-700 border-purple-200',
    FACULTY: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    STUDENT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    EXAM_CELL: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#0F172A] overflow-hidden font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#E2E8F0]">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center gap-3">
          <img src="/kec-logo.png" alt="KEC Logo" className="h-10 w-auto object-contain shrink-0" />
          <div>
            <h1 className="font-extrabold text-[#0F172A] tracking-tight text-sm">KEC</h1>
            <p className="text-[10px] text-[#4F46E5] font-bold tracking-wide uppercase">Kongu Engineering</p>
          </div>
        </div>

        <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-500/20'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#64748B]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Card */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center font-bold text-xs border border-[#4F46E5]/20">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#0F172A] truncate">{user?.name}</p>
              <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-full border uppercase mt-0.5 ${roleStyles[user?.role] || ''}`}>
                {user?.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-[#64748B] hover:text-[#F43F5E] rounded-lg hover:bg-rose-50 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-[#64748B] hover:text-[#0F172A] rounded-lg bg-[#F1F5F9]"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <span className="font-medium text-[#64748B]">Platform</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1]" />
              <span className="text-[#0F172A] font-semibold capitalize">
                {location.pathname.replace('/', '').replace('-', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              <span className="text-[#0F172A] font-extrabold">KEC — {user?.department?.name || 'Kongu Engineering College'}</span>
            </div>

            <button className="p-2 text-[#64748B] hover:text-[#0F172A] rounded-xl hover:bg-[#F1F5F9] relative transition">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#4F46E5] rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
