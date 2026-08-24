import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAPI } from '../../services/api';
import { Users, Clock, CheckCircle2, UserCheck, Sliders, Calendar, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const HodDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetchAPI('/dashboard/hod');
        if (res.success) setData(res.data);
      } catch (err) {
        console.error('Failed to load HOD dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) return <div className="p-8 text-center text-[#64748B] text-xs font-medium">Loading HOD Department Dashboard...</div>;

  const workloadGraphData = data?.facultyWorkloads?.map((fw) => ({
    name: fw.name?.split(' ')[0] || fw.employeeId,
    current: fw.currentWorkload,
    max: fw.maxWeeklyWorkload,
  })) || [];

  const quickAccessHOD = [
    { title: 'Faculty Leave Queue', desc: 'Review & Approve Leave Requests', path: '/leaves', icon: UserCheck, color: 'text-[#4F46E5] bg-indigo-50 border-indigo-200' },
    { title: 'Department Timetable', desc: 'Inspect Section Schedules & Matrices', path: '/timetable', icon: Calendar, color: 'text-[#10B981] bg-emerald-50 border-emerald-200' },
    { title: 'Department Master Data', desc: 'Manage Staff, Students & Subjects', path: '/master-data', icon: Users, color: 'text-[#7C3AED] bg-purple-50 border-purple-200' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">HOD Department Control Center</h2>
        <p className="text-xs text-[#64748B] mt-0.5 font-medium">Manage department workload, review faculty leave applications, analyze timetable recommendations, and access quick actions.</p>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickAccessHOD.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              to={item.path}
              className="saas-card p-4 hover:border-[#4F46E5] transition group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-[#4F46E5] transition">{item.title}</h4>
                  <p className="text-[10px] text-[#64748B] font-medium">{item.desc}</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#4F46E5] transition" />
            </Link>
          );
        })}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold text-[#64748B]">Department Faculty</span>
            <Users className="w-4 h-4 text-[#4F46E5]" />
          </div>
          <p className="text-2xl font-extrabold text-[#0F172A]">{data?.departmentFacultyCount || 0}</p>
          <p className="text-[10px] text-[#10B981] font-semibold">Active Teaching Staff</p>
        </div>

        <div className="saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold text-[#64748B]">Enrolled Students</span>
            <UserCheck className="w-4 h-4 text-[#7C3AED]" />
          </div>
          <p className="text-2xl font-extrabold text-[#0F172A]">{data?.departmentStudentCount || 0}</p>
          <p className="text-[10px] text-[#64748B] font-semibold">Undergraduate Roster</p>
        </div>

        <div className="saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold text-[#64748B]">Pending Leave Requests</span>
            <Clock className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <p className="text-2xl font-extrabold text-[#0F172A]">{data?.pendingLeavesCount || 0}</p>
          <p className="text-[10px] text-[#F59E0B] font-semibold">Requires Approval</p>
        </div>

        <div className="saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold text-[#64748B]">Smart Recommendations</span>
            <Sliders className="w-4 h-4 text-[#10B981]" />
          </div>
          <p className="text-2xl font-extrabold text-[#0F172A]">{data?.recommendations?.length || 0}</p>
          <p className="text-[10px] text-[#10B981] font-semibold">Automated Optimizations</p>
        </div>
      </div>

      {/* Dynamic Faculty Workload Chart */}
      <div className="saas-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A]">Faculty Weekly Teaching Load Analytics (hrs/wk)</h3>
        
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workloadGraphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
              <Bar dataKey="current" name="Assigned Hours" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              <Bar dataKey="max" name="Max Capacity" fill="#CBD5E1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conflicts & Smart Recommendations Box */}
      <div className="saas-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#4F46E5]" /> Smart Optimization & Conflict Inspector
        </h3>

        {data?.recommendations?.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>All department faculty workloads and schedules are conflict-free. No actions required!</span>
          </div>
        ) : (
          <div className="space-y-3">
            {data?.recommendations?.map((rec) => (
              <div key={rec._id} className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-950 space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-[#7C3AED] uppercase tracking-wider">{rec.category?.replace(/_/g, ' ')} Optimization</span>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-purple-200 text-[#7C3AED] text-[10px]">
                    Quality Score: {rec.overallQualityScore}/100
                  </span>
                </div>
                <p className="font-medium text-[#0F172A]">{rec.humanExplanation}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
