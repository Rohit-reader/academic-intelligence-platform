import React, { useEffect, useState } from 'react';
import { fetchAPI } from '../../services/api';
import { FileCheck, DoorClosed, Users, Plus, ArrowUpRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const ExamCellDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetchAPI('/dashboard/stats');
        if (res.success) setStats(res.data);
      } catch (err) {
        console.error('Failed to load exam cell stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-[#64748B] text-xs">Loading Exam Operations Console...</div>;
  }

  const exams = stats?.upcomingExams || [];

  const examSeatingGraph = exams.map((ex) => ({
    name: ex.name?.split(' ')[0] || 'Exam',
    students: ex.totalStudents || 40,
  }));

  const quickAccessExam = [
    { title: 'Schedule New Exam', desc: 'Add Date, Time & Enrolled Count', path: '/exams', icon: Plus, color: 'text-[#4F46E5] bg-indigo-50 border-indigo-200' },
    { title: 'Classroom & Seating Master', desc: 'Inspect Room Seating Capacities', path: '/master-data', icon: DoorClosed, color: 'text-[#10B981] bg-emerald-50 border-emerald-200' },
    { title: 'Digital Twin Exam Simulation', desc: 'Test Room Allocations & Blocks', path: '/digital-twin', icon: Calendar, color: 'text-[#7C3AED] bg-purple-50 border-purple-200' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">Examination Cell & Room Allocations</h2>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">Manage exam schedules, seating capacity, invigilators, and room conflict checks.</p>
        </div>
        <Link
          to="/exams"
          className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Schedule New Exam
        </Link>
      </div>

      {/* Quick Access Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickAccessExam.map((item) => {
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

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="saas-card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[#F59E0B]">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#64748B] font-semibold">Scheduled Exams</p>
            <h3 className="text-2xl font-extrabold text-[#0F172A] mt-0.5">{stats?.examCount || 0} Scheduled</h3>
          </div>
        </div>

        <div className="saas-card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-[#4F46E5]">
            <DoorClosed className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#64748B] font-semibold">Classrooms Available</p>
            <h3 className="text-2xl font-extrabold text-[#0F172A] mt-0.5">{stats?.classroomsCount || 0} Rooms</h3>
          </div>
        </div>

        <div className="saas-card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#10B981]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#64748B] font-semibold">Total Seating Capacity</p>
            <h3 className="text-2xl font-extrabold text-[#0F172A] mt-0.5">{stats?.totalSeatingCapacity || 0} Seats</h3>
          </div>
        </div>
      </div>

      {/* Dynamic Graph */}
      {examSeatingGraph.length > 0 && (
        <div className="saas-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#0F172A]">Scheduled Examination Student Enrollment Breakdown</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={examSeatingGraph} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                <Bar dataKey="students" name="Enrolled Students" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Upcoming Exams Table */}
      <div className="saas-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A]">Scheduled Examination Roster</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] font-bold bg-[#F8FAFC]">
                <th className="py-3 px-3.5 rounded-l-xl">Examination Name</th>
                <th className="py-3 px-3.5">Subject</th>
                <th className="py-3 px-3.5">Department</th>
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5">Time Slot</th>
                <th className="py-3 px-3.5">Enrolled Students</th>
                <th className="py-3 px-3.5 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
              {exams.map((ex) => (
                <tr key={ex._id} className="hover:bg-[#F8FAFC] transition">
                  <td className="py-3 px-3.5 font-bold text-[#0F172A]">{ex.name}</td>
                  <td className="py-3 px-3.5 text-[#4F46E5] font-semibold">{ex.subject?.name || 'Subject'}</td>
                  <td className="py-3 px-3.5 text-[#64748B] font-mono">{ex.department?.code || 'CSE'}</td>
                  <td className="py-3 px-3.5 font-mono">{new Date(ex.date).toLocaleDateString()}</td>
                  <td className="py-3 px-3.5 font-mono text-[11px]">{ex.startTime} - {ex.endTime}</td>
                  <td className="py-3 px-3.5 font-bold text-[#0F172A]">{ex.totalStudents}</td>
                  <td className="py-3 px-3.5">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-[#F59E0B] border border-amber-200 capitalize">
                      {ex.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
