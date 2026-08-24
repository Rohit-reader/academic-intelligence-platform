import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../../services/api';
import { Users, Clock, AlertTriangle, CheckCircle2, UserCheck, Sliders } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">HOD Department Control Center</h2>
        <p className="text-xs text-[#64748B] mt-0.5 font-medium">Manage department workload, review faculty leave applications, and analyze timetable recommendations.</p>
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

      {/* Faculty Workload Progress Bars */}
      <div className="saas-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A]">Department Faculty Workload Distribution</h3>
        <div className="space-y-4">
          {data?.facultyWorkloads?.map((fw) => {
            const percentage = Math.min(100, Math.round((fw.currentWorkload / fw.maxWeeklyWorkload) * 100));
            return (
              <div key={fw.facultyId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0F172A]">{fw.name} ({fw.employeeId})</span>
                  <span className="font-mono text-[#64748B]">
                    {fw.currentWorkload} / {fw.maxWeeklyWorkload} hrs/wk ({percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      percentage > 90
                        ? 'bg-[#F43F5E]'
                        : percentage > 75
                        ? 'bg-[#F59E0B]'
                        : 'bg-[#4F46E5]'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
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
                  <span className="text-[#7C3AED] uppercase tracking-wider">{rec.category} Optimization</span>
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
