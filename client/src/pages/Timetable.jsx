import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';
import { Calendar, Play, AlertTriangle, CheckCircle, Filter, BookOpen } from 'lucide-react';

export const Timetable = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState(5);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    { start: '09:00', end: '10:00' },
    { start: '10:00', end: '11:00' },
    { start: '11:15', end: '12:15' },
    { start: '12:15', end: '13:15' },
    { start: '14:00', end: '15:00' },
    { start: '15:00', end: '16:00' },
  ];

  const loadDepartments = async () => {
    try {
      const res = await fetchAPI('/master/departments');
      if (res.success && res.data.length > 0) {
        setDepartments(res.data);
        setSelectedDept(res.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const loadTimetable = async () => {
    if (!selectedDept) return;
    setLoading(true);
    try {
      const res = await fetchAPI(`/timetable?department=${selectedDept}&semester=${selectedSem}`);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedDept) loadTimetable();
  }, [selectedDept, selectedSem]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetchAPI('/timetable/generate', {
        method: 'POST',
        body: { department: selectedDept, semester: Number(selectedSem), academicYear: '2025-2026' },
      });
      if (res.success) {
        alert(`Timetable generated cleanly with ${res.data.entriesCount} entries!`);
        loadTimetable();
      }
    } catch (err) {
      alert(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const entries = data?.entries || [];
  const conflicts = data?.conflicts || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">Constraint-Based Timetable Engine</h2>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">View master schedules, trigger automated constraint checking, and inspect double bookings.</p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-2 self-start disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-white" /> {generating ? 'Evaluating Constraints...' : 'Auto-Generate Timetable'}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="saas-card p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
          <Filter className="w-4 h-4 text-[#4F46E5]" /> Filter Schedule:
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-1.5 text-xs text-[#0F172A] font-medium focus:outline-none"
        >
          {departments.map((d) => (
            <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
          ))}
        </select>

        <select
          value={selectedSem}
          onChange={(e) => setSelectedSem(e.target.value)}
          className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-1.5 text-xs text-[#0F172A] font-medium focus:outline-none"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <option key={s} value={s}>Semester {s}</option>
          ))}
        </select>
      </div>

      {/* Conflict Inspector Banner */}
      <div className="saas-card p-5">
        <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Rule & Constraint Evaluation Report</h3>

        {conflicts.length === 0 ? (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-[#10B981]" />
            <span>Zero hard conflicts detected. All faculty, room, section, and laboratory constraints satisfied.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {conflicts.map((c, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#F43F5E]" />
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 mr-2">
                    {c.severity}
                  </span>
                  <span>{c.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timetable Matrix Grid */}
      <div className="saas-card p-6 overflow-x-auto">
        <h3 className="text-sm font-bold text-[#0F172A] mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#4F46E5]" /> Weekly Class Grid
        </h3>

        {loading ? (
          <div className="p-8 text-center text-[#64748B] text-xs">Loading timetable matrix...</div>
        ) : (
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] font-bold bg-[#F8FAFC]">
                <th className="py-3 px-3.5 w-28 rounded-l-xl">Time Slot</th>
                {days.map((day) => (
                  <th key={day} className="py-3 px-3.5 text-center">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {timeSlots.map((slot) => (
                <tr key={`${slot.start}-${slot.end}`}>
                  <td className="py-3 px-3.5 font-mono text-[11px] text-[#4F46E5] font-bold bg-[#F8FAFC]">
                    {slot.start} - {slot.end}
                  </td>
                  {days.map((day) => {
                    const matched = entries.filter((e) => e.dayOfWeek === day && e.startTime === slot.start);
                    return (
                      <td key={day} className="p-2 align-top text-center border-l border-[#E2E8F0] min-h-[80px]">
                        {matched.map((e) => (
                          <div
                            key={e._id}
                            className={`p-3 rounded-xl text-left mb-1.5 border shadow-2xs ${
                              e.isLabSession
                                ? 'bg-purple-50 border-purple-200 text-purple-900'
                                : 'bg-white border-[#E2E8F0] text-[#0F172A]'
                            }`}
                          >
                            <p className="font-bold text-xs truncate flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" /> {e.subject?.code || 'SUB'}
                            </p>
                            <p className="text-[11px] text-[#64748B] font-medium truncate mt-0.5">Sec: {e.section?.name || 'All'}</p>
                            <p className="text-[11px] text-[#64748B] truncate">Fac: {e.faculty?.user?.name || 'Prof'}</p>
                            <span className="inline-block mt-1.5 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#10B981]">
                              {e.isLabSession ? (e.laboratory?.roomNumber || 'Lab') : (e.classroom?.roomNumber || 'Room')}
                            </span>
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
