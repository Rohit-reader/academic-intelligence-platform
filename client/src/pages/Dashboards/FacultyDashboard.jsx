import React, { useEffect, useState } from 'react';
import { fetchAPI } from '../../services/api';
import { Calendar as CalendarIcon, UserCheck, BookOpen, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FacultyDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetchAPI('/dashboard/stats');
        if (res.success) setStats(res.data);
      } catch (err) {
        console.error('Failed to load faculty stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-[#64748B] text-xs">Loading Faculty Schedule Console...</div>;
  }

  const entries = stats?.timetableEntries || [];
  const leaves = stats?.leaveHistory || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">Faculty Workload & Schedule</h2>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">View assigned class periods, room locations, and manage leave applications.</p>
        </div>
        <Link
          to="/leaves"
          className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-2 self-start"
        >
          <UserCheck className="w-4 h-4" /> Apply for Leave
        </Link>
      </div>

      {/* Workload Metric Banner */}
      <div className="saas-card p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-[#64748B] font-semibold">Employee Designation</p>
          <p className="text-base font-bold text-[#0F172A] mt-1">{stats?.designation} ({stats?.employeeId})</p>
        </div>
        <div>
          <p className="text-xs text-[#64748B] font-semibold">Weekly Workload</p>
          <p className="text-base font-bold text-[#4F46E5] mt-1">
            {stats?.currentWorkload} / {stats?.maxWeeklyWorkload} hours/week
          </p>
        </div>
        <div>
          <p className="text-xs text-[#64748B] font-semibold">Active Assigned Classes</p>
          <p className="text-base font-bold text-[#10B981] mt-1">{entries.length} Scheduled Periods</p>
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="saas-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#4F46E5]" /> Assigned Weekly Class Periods
        </h3>

        {entries.length === 0 ? (
          <p className="text-xs text-[#64748B] italic py-4 text-center">No assigned classes found in current active timetable.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {entries.map((e) => (
              <div key={e._id} className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#4F46E5]">{e.dayOfWeek}</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#E2E8F0] text-[#0F172A] font-mono text-[11px] font-semibold">
                    {e.startTime} - {e.endTime}
                  </span>
                </div>

                <div className="pt-1">
                  <p className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#64748B]" /> {e.subject?.name || 'Subject'}
                  </p>
                  <p className="text-xs text-[#64748B] font-medium mt-0.5">Section: {e.section?.name || 'All'}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#10B981] font-semibold pt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{e.isLabSession ? (e.laboratory?.name || 'Lab') : (e.classroom?.roomNumber || 'Classroom')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leave Application History */}
      <div className="saas-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A]">My Leave Applications & History</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] font-bold bg-[#F8FAFC]">
                <th className="py-3 px-3.5 rounded-l-xl">Start Date</th>
                <th className="py-3 px-3.5">End Date</th>
                <th className="py-3 px-3.5">Reason</th>
                <th className="py-3 px-3.5 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
              {leaves.map((l) => (
                <tr key={l._id} className="hover:bg-[#F8FAFC] transition">
                  <td className="py-3 px-3.5 font-medium">{new Date(l.startDate).toLocaleDateString()}</td>
                  <td className="py-3 px-3.5 font-medium">{new Date(l.endDate).toLocaleDateString()}</td>
                  <td className="py-3 px-3.5 text-[#64748B]">{l.reason}</td>
                  <td className="py-3 px-3.5">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                        l.status === 'APPROVED'
                          ? 'bg-emerald-50 text-[#10B981] border-emerald-200'
                          : l.status === 'REJECTED'
                          ? 'bg-rose-50 text-[#F43F5E] border-rose-200'
                          : 'bg-amber-50 text-[#F59E0B] border-amber-200'
                      }`}
                    >
                      {l.status}
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
