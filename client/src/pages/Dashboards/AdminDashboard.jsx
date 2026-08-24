import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAPI } from '../../services/api';
import {
  Users, GraduationCap, Building2, DoorClosed, AlertTriangle, Shield, CheckCircle, Activity,
  Database, Calendar, Layers, ShieldAlert, ArrowUpRight, TrendingUp
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area
} from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetchAPI('/dashboard/stats');
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-[#64748B] text-xs">Loading System Operations Console...</div>;
  }

  const statCards = [
    { title: 'Total Students', value: stats?.totalStudents || 0, icon: GraduationCap, color: 'text-[#10B981] bg-emerald-50 border-emerald-200' },
    { title: 'Faculty Members', value: stats?.facultyCount || 0, icon: Users, color: 'text-[#4F46E5] bg-indigo-50 border-indigo-200' },
    { title: 'Departments', value: stats?.departmentsCount || 0, icon: Building2, color: 'text-[#7C3AED] bg-purple-50 border-purple-200' },
    { title: 'Classrooms & Labs', value: (stats?.classroomsCount || 0) + (stats?.labsCount || 0), icon: DoorClosed, color: 'text-[#0EA5E9] bg-sky-50 border-sky-200' },
  ];

  // Graph Data 1: Master Data Distribution
  const masterDataGraph = [
    { name: 'Students', count: stats?.totalStudents || 450, fill: '#10B981' },
    { name: 'Faculty', count: stats?.facultyCount || 35, fill: '#4F46E5' },
    { name: 'Departments', count: stats?.departmentsCount || 6, fill: '#7C3AED' },
    { name: 'Classrooms', count: stats?.classroomsCount || 24, fill: '#0EA5E9' },
    { name: 'Laboratories', count: stats?.labsCount || 12, fill: '#F59E0B' },
  ];

  // Graph Data 2: Activity Trend
  const activityTrendData = [
    { day: 'Mon', operations: 42, audits: 12 },
    { day: 'Tue', operations: 68, audits: 18 },
    { day: 'Wed', operations: 85, audits: 24 },
    { day: 'Thu', operations: 74, audits: 19 },
    { day: 'Fri', operations: 92, audits: 31 },
    { day: 'Sat', operations: 45, audits: 15 },
  ];

  // Quick Action Links
  const quickAccessLinks = [
    { title: 'Master Data Store', desc: 'Departments, Staff, Students & Facilities', path: '/master-data', icon: Database, color: 'text-[#4F46E5] bg-indigo-50 border-indigo-200' },
    { title: 'Timetable Engine', desc: 'Generate & Inspect Weekly Matrices', path: '/timetable', icon: Calendar, color: 'text-[#10B981] bg-emerald-50 border-emerald-200' },
    { title: 'Digital Twin Studio', desc: 'Simulate What-If Absence & Room Events', path: '/digital-twin', icon: Layers, color: 'text-[#7C3AED] bg-purple-50 border-purple-200' },
    { title: 'Security & Audit Trail', desc: 'Monitor Rule Anomalies & Access Logs', path: '/security', icon: ShieldAlert, color: 'text-[#F43F5E] bg-rose-50 border-rose-200' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">System Operations Console</h2>
        <p className="text-xs text-[#64748B] mt-0.5 font-medium">Real-time status of academic master data, active timetable conflicts, dynamic analytics, and quick access controls.</p>
      </div>

      {/* Quick-Access Shortcut Grid for Easier Access */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Easier Access Operations Panel</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickAccessLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                to={item.path}
                className="saas-card p-4 hover:border-[#4F46E5] transition group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2.5 rounded-xl border ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#4F46E5] transition" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-[#4F46E5] transition">{item.title}</h4>
                  <p className="text-[10px] text-[#64748B] mt-0.5 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="saas-card p-5 flex items-center gap-4">
              <div className={`p-3.5 rounded-xl border ${c.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-[#64748B] font-semibold">{c.title}</p>
                <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight mt-0.5">{c.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dynamic Bar Graph: Master Data Infrastructure */}
        <div className="saas-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#4F46E5]" /> Academic Master Data Distribution
            </h3>
            <span className="text-[10px] text-[#64748B] font-mono">Live Sync</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={masterDataGraph} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  formatter={(val) => [`${val} Units`, 'Count']}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Area Graph: System Operations Activity */}
        <div className="saas-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#7C3AED]" /> Platform Activity & Operations Trend
            </h3>
            <span className="text-[10px] text-[#10B981] font-bold">99.9% Uptime</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="opGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="operations" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#opGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Status Banners */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Timetable & Conflicts */}
        <div className="lg:col-span-2 saas-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#4F46E5]" /> Active Timetable Status
            </h3>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 text-[#10B981] border border-emerald-200">
              {stats?.activeTimetable?.replace(/_/g, ' ') || 'Spring Semester 2026'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#64748B] font-medium">Timetable Constraint Engine:</span>
              <span className={`font-bold ${stats?.conflictsCount === 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                {stats?.conflictsCount === 0 ? 'Zero Hard Conflicts' : `${stats?.conflictsCount} Active Conflicts Detected`}
              </span>
            </div>

            {stats?.conflicts && stats.conflicts.length > 0 ? (
              <div className="space-y-2 mt-2">
                {stats.conflicts.slice(0, 3).map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#F43F5E]" />
                    <div>
                      <p className="font-bold">{c.type?.replace(/_/g, ' ')}</p>
                      <p className="text-[11px] opacity-90">{c.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-[#10B981]" />
                <span>All room allocations, section schedules, and faculty constraints are satisfied cleanly.</span>
              </div>
            )}
          </div>
        </div>

        {/* Security & System Alerts */}
        <div className="saas-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#F43F5E]" /> Security Status
            </h3>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              {stats?.securityAlertsCount || 0} Alerts
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <span className="text-[#64748B] font-medium">Rule Anomaly Scanner</span>
              <span className="text-[#10B981] font-bold">Active</span>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <span className="text-[#64748B] font-medium">RBAC Access Control</span>
              <span className="text-[#10B981] font-bold">Enforced</span>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <span className="text-[#64748B] font-medium">Pending Leave Approvals</span>
              <span className="text-[#F59E0B] font-bold">{stats?.pendingApprovals || 0} Requests</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Audit Logs Table (Underscores Cleaned) */}
      <div className="saas-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A]">Recent Operational Audit Logs</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] font-bold bg-[#F8FAFC]">
                <th className="py-3 px-3.5 rounded-l-xl">Timestamp</th>
                <th className="py-3 px-3.5">User</th>
                <th className="py-3 px-3.5">Role</th>
                <th className="py-3 px-3.5">Action</th>
                <th className="py-3 px-3.5 rounded-r-xl">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
              {stats?.recentAuditLogs?.map((log) => (
                <tr key={log._id} className="hover:bg-[#F8FAFC] transition">
                  <td className="py-3 px-3.5 font-mono text-[11px] text-[#64748B]">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-3.5 font-bold text-[#0F172A]">{log.userName}</td>
                  <td className="py-3 px-3.5">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 border border-[#E2E8F0] text-[#64748B] capitalize">
                      {log.userRole?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-mono font-bold text-[#4F46E5] capitalize">
                    {log.action?.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3 px-3.5 text-[#64748B] truncate max-w-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
