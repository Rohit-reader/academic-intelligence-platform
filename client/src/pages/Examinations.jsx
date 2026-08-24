import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';
import { FileCheck, Plus } from 'lucide-react';

export const Examinations = () => {
  const [exams, setExams] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('13:00');
  const [totalStudents, setTotalStudents] = useState(60);

  const loadData = async () => {
    setLoading(true);
    try {
      const [exRes, roomRes] = await Promise.all([
        fetchAPI('/exams'),
        fetchAPI('/master/classrooms'),
      ]);
      if (exRes.success) setExams(exRes.data);
      if (roomRes.success) setClassrooms(roomRes.data);
    } catch (err) {
      console.error('Failed to load exams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchAPI('/exams', {
        method: 'POST',
        body: {
          name,
          date,
          startTime,
          endTime,
          totalStudents,
          department: classrooms[0]?.department || undefined,
          subject: classrooms[0]?._id || undefined,
        },
      });
      if (res.success) {
        alert('Examination scheduled successfully!');
        setName('');
        setDate('');
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to schedule exam');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-[#F59E0B]" /> Examination Operations & Seating Allocations
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5 font-medium">Schedule mid-sem and end-sem examinations, allocate exam rooms, and check seating capacity constraints.</p>
      </div>

      {/* Schedule Form */}
      <div className="saas-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A]">Schedule New Examination</h3>

        <form onSubmit={handleCreateExam} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1">Examination Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Mid-Sem DBMS Exam"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1">Exam Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1">Enrolled Student Count</label>
            <input
              type="number"
              required
              value={totalStudents}
              onChange={(e) => setTotalStudents(Number(e.target.value))}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Save & Allocate Seating
            </button>
          </div>
        </form>
      </div>

      {/* Exam List */}
      <div className="saas-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A]">Scheduled Examination Roster</h3>

        {loading ? (
          <div className="p-8 text-center text-[#64748B] text-xs">Loading examination schedule...</div>
        ) : exams.length === 0 ? (
          <div className="p-8 text-center text-[#64748B] text-xs">No examinations scheduled yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] font-bold bg-[#F8FAFC]">
                  <th className="py-3 px-3.5 rounded-l-xl">Examination Name</th>
                  <th className="py-3 px-3.5">Subject</th>
                  <th className="py-3 px-3.5">Date</th>
                  <th className="py-3 px-3.5">Time Slot</th>
                  <th className="py-3 px-3.5">Total Students</th>
                  <th className="py-3 px-3.5 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
                {exams.map((ex) => (
                  <tr key={ex._id} className="hover:bg-[#F8FAFC] transition">
                    <td className="py-3 px-3.5 font-bold text-[#0F172A]">{ex.name}</td>
                    <td className="py-3 px-3.5 text-[#4F46E5] font-semibold">{ex.subject?.name || 'DBMS'}</td>
                    <td className="py-3 px-3.5 font-mono">{new Date(ex.date).toLocaleDateString()}</td>
                    <td className="py-3 px-3.5 font-mono text-[11px]">{ex.startTime} - {ex.endTime}</td>
                    <td className="py-3 px-3.5 font-bold text-[#10B981]">{ex.totalStudents} Students</td>
                    <td className="py-3 px-3.5">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-[#F59E0B] border border-amber-200">
                        {ex.status}
                      </span>
                    </td>
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
