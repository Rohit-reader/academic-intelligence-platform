import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../../services/api';
import { Calendar, FileCheck, Award, MapPin } from 'lucide-react';

export const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetchAPI('/dashboard/student');
        if (res.success) setData(res.data);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) return <div className="p-8 text-center text-[#64748B] text-xs font-medium">Loading Student Dashboard...</div>;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="space-y-6">
      {/* Student Welcome Header */}
      <div className="saas-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">Welcome, {data?.studentProfile?.name}!</h2>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            Roll No: <span className="font-mono text-[#4F46E5] font-bold">{data?.studentProfile?.rollNumber}</span> | Department: {data?.studentProfile?.department} | Section: {data?.studentProfile?.section}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-[#4F46E5] text-xs font-bold">
            Semester {data?.studentProfile?.semester}
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#10B981] text-xs font-bold">
            Batch {data?.studentProfile?.batch}
          </span>
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="saas-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#4F46E5]" /> My Weekly Academic Class Schedule
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {days.map((day) => {
            const dayEntries = data?.weeklySchedule?.[day] || [];
            return (
              <div key={day} className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <h4 className="text-xs font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-2 uppercase tracking-wide">
                  {day}
                </h4>

                {dayEntries.length === 0 ? (
                  <p className="text-[11px] text-[#64748B] italic">No classes scheduled</p>
                ) : (
                  <div className="space-y-2">
                    {dayEntries.map((e, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] shadow-2xs space-y-1">
                        <p className="font-bold text-xs text-[#0F172A]">{e.subject}</p>
                        <p className="text-[10px] text-[#4F46E5] font-semibold">{e.faculty}</p>
                        <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1 border-t border-slate-100">
                          <span className="font-mono">{e.startTime} - {e.endTime}</span>
                          <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> {e.room}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Examinations & Events Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exams */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#F59E0B]" /> Upcoming Examinations Roster
          </h3>

          {data?.upcomingExams?.length === 0 ? (
            <p className="text-xs text-[#64748B]">No upcoming examinations scheduled.</p>
          ) : (
            <div className="space-y-3">
              {data?.upcomingExams?.map((ex) => (
                <div key={ex._id} className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#0F172A]">{ex.name}</p>
                    <p className="text-[#64748B] text-[11px] mt-0.5 font-medium">{ex.subject?.name}</p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-[#4F46E5] font-bold">{new Date(ex.date).toLocaleDateString()}</p>
                    <p className="text-[10px] text-[#64748B]">{ex.startTime} - {ex.endTime}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Events */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#7C3AED]" /> Workshops & Placement Events
          </h3>

          {data?.upcomingEvents?.length === 0 ? (
            <p className="text-xs text-[#64748B]">No upcoming campus events.</p>
          ) : (
            <div className="space-y-3">
              {data?.upcomingEvents?.map((ev) => (
                <div key={ev._id} className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[#7C3AED]">{ev.title}</p>
                    <span className="px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-[#7C3AED] text-[10px] font-bold">
                      {ev.type}
                    </span>
                  </div>
                  <p className="text-[#64748B] text-[11px]">{ev.description}</p>
                  <p className="text-[10px] text-[#64748B] font-mono pt-1">{new Date(ev.date).toLocaleDateString()} | Org: {ev.organizer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
