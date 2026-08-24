import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Play, AlertTriangle, CheckCircle, Filter, BookOpen } from 'lucide-react';

export const Timetable = () => {
  const { user } = useAuth();
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

  const userDeptId = user?.department?._id || user?.department;
  const isDeptRestricted = (user?.role === 'FACULTY' || user?.role === 'HOD') && userDeptId;

  const loadDepartments = async () => {
    try {
      const res = await fetchAPI('/master/departments');
      if (res.success && res.data.length > 0) {
        if (isDeptRestricted) {
          const filtered = res.data.filter((d) => d._id === userDeptId.toString());
          setDepartments(filtered.length > 0 ? filtered : res.data);
          setSelectedDept(userDeptId.toString());
        } else {
          setDepartments(res.data);
          setSelectedDept(res.data[0]._id);
        }
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
        body: { department: selectedDept, semester: selectedSem, academicYear: '2025-2026' },
      });
      if (res.success) {
        alert('Timetable generated cleanly using rule engine!');
        loadTimetable();
      }
    } catch (err) {
      alert(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">KEC Timetable Matrix & Constraint Engine</h2>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            {isDeptRestricted
              ? `Assigned Department Timetable Scope: ${departments[0]?.name || 'My Department'}`
              : 'Inspect weekly master schedules, detect hard/soft conflicts, and execute rule-based auto-generation.'}
          </p>
        </div>

        {(user?.role === 'ADMIN' || user?.role === 'HOD') && (
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-2 self-start"
          >
            <Play className="w-4 h-4 fill-white" /> {generating ? 'Generating Schedule...' : 'Auto-Generate Timetable'}
          </button>
        )}
      </div>

      {/* Selectors Bar */}
      <div className="saas-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#64748B]" />
            <span className="text-xs font-bold text-[#0F172A]">Department:</span>
          </div>
          <select
            value={selectedDept}
            disabled={isDeptRestricted}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-1.5 text-xs text-[#0F172A] font-medium focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <span className="text-xs font-bold text-[#0F172A]">Semester:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSem(sem)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  selectedSem === sem
                    ? 'bg-[#4F46E5] text-white shadow-2xs'
                    : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
                }`}
              >
                S{sem}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conflicts Status Banner */}
      {data?.conflicts && data.conflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#F43F5E]">
            <AlertTriangle className="w-4 h-4" /> Hard Conflicts Detected ({data.conflicts.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
            {data.conflicts.map((c, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-white border border-rose-200 shadow-2xs">
                <span className="font-bold text-[#F43F5E] block">{c.type}</span>
                <span className="text-[#64748B]">{c.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Matrix Grid */}
      <div className="saas-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A] flex items-center justify-between">
          <span>Weekly Academic Timetable Matrix</span>
          <span className="text-xs text-[#10B981] font-bold font-mono">
            {data?.entries?.length || 0} Scheduled Periods
          </span>
        </h3>

        {loading ? (
          <div className="p-8 text-center text-[#64748B] text-xs">Loading Timetable Matrix...</div>
        ) : !data?.entries || data.entries.length === 0 ? (
          <div className="p-8 text-center text-[#64748B] text-xs">
            No active timetable entries found for this department & semester. Click "Auto-Generate Timetable" to create a schedule!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] font-bold bg-[#F8FAFC]">
                  <th className="py-3 px-3.5 rounded-l-xl w-32">Time Slot</th>
                  {days.map((d) => (
                    <th key={d} className="py-3 px-3.5">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
                {timeSlots.map((slot) => (
                  <tr key={`${slot.start}-${slot.end}`} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 px-3.5 font-mono text-[#64748B] font-bold bg-[#F8FAFC]">
                      {slot.start} - {slot.end}
                    </td>

                    {days.map((day) => {
                      const entry = data.entries.find(
                        (e) => e.day === day && e.startTime === slot.start
                      );

                      return (
                        <td key={day} className="py-3 px-3.5 align-top">
                          {entry ? (
                            <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-1 shadow-2xs">
                              <p className="font-bold text-xs text-[#0F172A]">{entry.subject?.name || 'Subject'}</p>
                              <p className="text-[10px] text-[#4F46E5] font-semibold">
                                {entry.faculty?.user?.name || 'Faculty Member'}
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1 border-t border-indigo-100 font-mono">
                                <span>{entry.section?.name || 'Sec'}</span>
                                <span className="font-bold text-[#7C3AED]">
                                  {entry.classroom?.roomNumber || entry.laboratory?.roomNumber || 'Room'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="h-16 rounded-xl border border-dashed border-[#E2E8F0] flex items-center justify-center text-[10px] text-[#CBD5E1]">
                              Free Slot
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
