import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserCheck, CheckCircle2, XCircle, Sliders } from 'lucide-react';

import { RippleEffectAnalyzerModal } from '../components/RippleEffectAnalyzerModal';

export const LeaveManagement = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ripple Analysis State
  const [rippleData, setRippleData] = useState(null);
  const [analyzingRipple, setAnalyzingRipple] = useState(false);

  const handleRunImpactAnalysis = async (facName = 'Faculty Member') => {
    setAnalyzingRipple(true);
    try {
      const res = await fetchAPI('/ripple/analyze', {
        method: 'POST',
        body: {
          resourceType: 'FACULTY',
          resourceName: facName,
          changeType: 'LEAVE',
          day: 'Wednesday',
          startTime: '10:00',
          endTime: '16:00',
        },
      });
      if (res.success) setRippleData(res.data);
    } catch (err) {
      alert(err.message || 'Impact analysis failed');
    } finally {
      setAnalyzingRipple(false);
    }
  };

  // Form states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const res = await fetchAPI('/leaves');
      if (res.success) setLeaves(res.data);
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetchAPI('/leaves/apply', {
        method: 'POST',
        body: { startDate, endDate, reason },
      });
      if (res.success) {
        alert('Leave request submitted! System has evaluated substitute options.');
        setStartDate('');
        setEndDate('');
        setReason('');
        loadLeaves();
      }
    } catch (err) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (leaveId, status, substituteId) => {
    try {
      const res = await fetchAPI(`/leaves/${leaveId}/review`, {
        method: 'PUT',
        body: { status, substituteFacultyId: substituteId, reviewComments: `Action set to ${status}` },
      });
      if (res.success) {
        alert(`Leave request ${status.toLowerCase()} cleanly!`);
        loadLeaves();
      }
    } catch (err) {
      alert(err.message || 'Review failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">Faculty Leave & Automated Substitution</h2>
        <p className="text-xs text-[#64748B] mt-0.5 font-medium">Apply for faculty leave, evaluate affected classes, and review substitution options.</p>
      </div>

      {/* Faculty Apply Form */}
      {(user?.role === 'FACULTY' || user?.role === 'HOD' || user?.role === 'ADMIN') && (
        <div className="saas-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#4F46E5]" /> Apply for Faculty Leave
          </h3>

          <form onSubmit={handleApply} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">Reason for Leave</label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Attending Conference"
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-2"
              >
                <Sliders className="w-4 h-4" /> {submitting ? 'Analyzing Options...' : 'Submit & Analyze Impact'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leave Requests List */}
      <div className="saas-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A]">Leave Requests & Substitute Queue</h3>

        {loading ? (
          <div className="p-8 text-center text-[#64748B] text-xs">Loading leave requests...</div>
        ) : leaves.length === 0 ? (
          <div className="p-8 text-center text-[#64748B] text-xs">No leave requests found.</div>
        ) : (
          <div className="space-y-4">
            {leaves.map((leave) => {
              const rec = leave.aiRecommendation;
              return (
                <div key={leave._id} className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-[#0F172A]">
                        {leave.faculty?.user?.name || 'Faculty Member'} ({leave.faculty?.department?.code})
                      </h4>
                      <p className="text-xs text-[#64748B] font-medium mt-0.5">{leave.reason}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#64748B] font-mono">
                        {new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                          leave.status === 'APPROVED'
                            ? 'bg-emerald-50 text-[#10B981] border-emerald-200'
                            : leave.status === 'REJECTED'
                            ? 'bg-rose-50 text-[#F43F5E] border-rose-200'
                            : 'bg-amber-50 text-[#F59E0B] border-amber-200'
                        }`}
                      >
                        {leave.status}
                      </span>
                    </div>
                  </div>

                  {/* Recommendation Card */}
                  {rec && (
                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-950 space-y-2">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5 text-[#7C3AED]">
                          <Sliders className="w-4 h-4" /> Automated Substitute Recommendation
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white border border-purple-200 text-[#7C3AED] text-[10px] font-bold">
                          Match Score: {rec.overallQualityScore}/100
                        </span>
                      </div>

                      <p className="text-[#0F172A] font-medium">{rec.humanExplanation}</p>

                      {rec.scenariosEvaluated && rec.scenariosEvaluated.length > 0 && (
                        <div className="pt-2 border-t border-purple-200 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                          {rec.scenariosEvaluated.map((sc) => (
                            <div key={sc.id} className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs">
                              <p className="font-bold text-[#0F172A]">{sc.title}</p>
                              <p className="text-[#64748B] text-[10px] mt-0.5 font-medium">{sc.impactSummary}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions for HOD / Admin */}
                  {leave.status === 'PENDING' && (user?.role === 'HOD' || user?.role === 'ADMIN') && (
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleRunImpactAnalysis(leave.faculty?.user?.name)}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7C3AED] border border-purple-200 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Sliders className="w-3.5 h-3.5" /> Impact Analysis
                      </button>

                      <button
                        onClick={() => handleReview(leave._id, 'REJECTED')}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#F43F5E] border border-rose-200 text-xs font-bold flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject Leave
                      </button>

                      <button
                        onClick={() =>
                          handleReview(
                            leave._id,
                            'APPROVED',
                            rec?.scenariosEvaluated?.[0]?.substituteFacultyId
                          )
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Reassign Substitute
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ripple Effect Impact Analyzer Modal */}
      {rippleData && (
        <RippleEffectAnalyzerModal
          analysisData={rippleData}
          onClose={() => setRippleData(null)}
          onApplySuccess={() => loadLeaves()}
        />
      )}
    </div>
  );
};
