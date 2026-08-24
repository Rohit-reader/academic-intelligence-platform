import React, { useState } from 'react';
import { fetchAPI } from '../services/api';
import {
  Sliders, AlertTriangle, CheckCircle2, ArrowRight, X, ShieldAlert,
  Users, Building2, BookOpen, Layers, Check, Eye
} from 'lucide-react';

export const RippleEffectAnalyzerModal = ({ analysisData, onClose, onApplySuccess }) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    analysisData?.scenarios?.find((s) => s.isRecommended)?.id || analysisData?.scenarios?.[0]?.id || 'SCENARIO_A'
  );
  const [showDiffPreview, setShowDiffPreview] = useState(false);
  const [applying, setApplying] = useState(false);

  if (!analysisData) return null;

  const currentScenario = analysisData.scenarios?.find((s) => s.id === selectedScenarioId) || analysisData.scenarios?.[0];

  const handleApply = async () => {
    if (!window.confirm(`Are you sure you want to apply '${currentScenario?.title}' to live production?`)) return;
    setApplying(true);
    try {
      const res = await fetchAPI('/ripple/apply', {
        method: 'POST',
        body: {
          analysisId: analysisData.analysisId,
          scenarioId: selectedScenarioId,
        },
      });

      if (res.success) {
        alert(`Scenario '${currentScenario?.title}' committed to production cleanly! Audit log created.`);
        if (onApplySuccess) onApplySuccess();
        onClose();
      }
    } catch (err) {
      alert(err.message || 'Failed to apply scenario');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#4F46E5] text-white">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">Smart Ripple-Effect Impact Analyzer</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-mono font-bold uppercase">
                  Rule-Based Engine
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Resource Input: <span className="font-bold text-white">{analysisData.resourceDetails?.resourceName}</span> ({analysisData.resourceDetails?.changeType} on {analysisData.resourceDetails?.day} {analysisData.resourceDetails?.timeWindow})
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#F8FAFC]">
          {/* Timeline / Flow Visualizer */}
          <div className="saas-card p-4 bg-white border border-[#E2E8F0]">
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2.5">Ripple Analysis Pipeline Flow</p>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-[#E2E8F0] font-bold text-[#0F172A]">
                <span className="w-2 h-2 rounded-full bg-[#4F46E5]"></span>
                <span>CHANGE ({analysisData.resourceDetails?.changeType})</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#64748B]" />

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 font-bold text-[#F59E0B]">
                <Users className="w-3.5 h-3.5" />
                <span>AFFECTED RESOURCES ({analysisData.impactSummary?.affectedStudentsCount} Students)</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#64748B]" />

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 font-bold text-[#10B981]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>HARD CONFLICTS ({analysisData.impactSummary?.potentialConflictsCount})</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#64748B]" />

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 font-bold text-[#7C3AED]">
                <Building2 className="w-3.5 h-3.5" />
                <span>ALTERNATIVES ({analysisData.impactSummary?.alternativeRoomsCount} Rooms)</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#64748B]" />

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 font-bold text-[#4F46E5]">
                <Sliders className="w-3.5 h-3.5" />
                <span>RECOMMENDATION ({currentScenario?.score}/100)</span>
              </div>
            </div>
          </div>

          {/* Impact Detection Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="saas-card p-3.5 text-center">
              <p className="text-[10px] font-bold text-[#64748B] uppercase">Classes Affected</p>
              <p className="text-xl font-extrabold text-[#0F172A] mt-0.5">{analysisData.impactSummary?.affectedClassesCount}</p>
            </div>
            <div className="saas-card p-3.5 text-center">
              <p className="text-[10px] font-bold text-[#64748B] uppercase">Students Affected</p>
              <p className="text-xl font-extrabold text-[#4F46E5] mt-0.5">{analysisData.impactSummary?.affectedStudentsCount}</p>
            </div>
            <div className="saas-card p-3.5 text-center">
              <p className="text-[10px] font-bold text-[#64748B] uppercase">Faculty Affected</p>
              <p className="text-xl font-extrabold text-[#7C3AED] mt-0.5">{analysisData.impactSummary?.affectedFacultyCount}</p>
            </div>
            <div className="saas-card p-3.5 text-center">
              <p className="text-[10px] font-bold text-[#64748B] uppercase">Alt Rooms Available</p>
              <p className="text-xl font-extrabold text-[#10B981] mt-0.5">{analysisData.impactSummary?.alternativeRoomsCount}</p>
            </div>
            <div className="saas-card p-3.5 text-center">
              <p className="text-[10px] font-bold text-[#64748B] uppercase">Hard Conflicts</p>
              <p className="text-xl font-extrabold text-[#10B981] mt-0.5">{analysisData.impactSummary?.potentialConflictsCount}</p>
            </div>
          </div>

          {/* Scenarios Tabs & Recommendation Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Evaluated Replacement Scenarios</h4>
              <button
                type="button"
                onClick={() => setShowDiffPreview(!showDiffPreview)}
                className="text-xs font-bold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1.5 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200"
              >
                <Eye className="w-3.5 h-3.5" /> {showDiffPreview ? 'Hide Before-After Preview' : 'Preview Changes (Before → Impact → After)'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysisData.scenarios?.map((sc) => {
                const selected = sc.id === selectedScenarioId;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setSelectedScenarioId(sc.id)}
                    className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                      selected
                        ? 'bg-white border-[#4F46E5] shadow-md shadow-indigo-500/10 ring-2 ring-[#4F46E5]/20'
                        : 'bg-white border-[#E2E8F0] hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase border ${
                            sc.isRecommended
                              ? 'bg-emerald-50 text-[#10B981] border-emerald-200'
                              : sc.score > 80
                              ? 'bg-indigo-50 text-[#4F46E5] border-indigo-200'
                              : 'bg-amber-50 text-[#F59E0B] border-amber-200'
                          }`}
                        >
                          {sc.badge}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#0F172A]">Score: {sc.score}/100</span>
                      </div>

                      <h5 className="text-xs font-bold text-[#0F172A] leading-snug">{sc.title}</h5>

                      <div className="space-y-1 text-[11px] text-[#64748B] pt-1">
                        <div className="flex justify-between">
                          <span>Hard Conflicts:</span>
                          <span className="font-bold text-[#10B981]">{sc.hardConflicts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Student Disruption:</span>
                          <span className="font-bold text-[#0F172A]">{sc.studentDisruption}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Faculty Load:</span>
                          <span className="font-bold text-[#0F172A]">{sc.facultyWorkloadBalance}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px]">
                      <span className="text-[#64748B] font-medium">{selected ? 'Selected' : 'Click to Select'}</span>
                      {selected && <Check className="w-4 h-4 text-[#4F46E5]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Reason Explanation */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-[#0F172A] space-y-1.5">
            <p className="font-bold text-[#4F46E5] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Recommendation Reason & Evaluation
            </p>
            <p className="font-medium text-[#0F172A] leading-relaxed">{currentScenario?.reason}</p>
          </div>

          {/* Before → Impact → After Diff Comparison View */}
          {showDiffPreview && (
            <div className="saas-card p-5 space-y-3 bg-white border border-[#E2E8F0]">
              <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Before → Impact → After Schedule Reassignments ({currentScenario?.title})
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-[#64748B] font-bold bg-[#F8FAFC]">
                      <th className="py-2.5 px-3 rounded-l-xl">Day & Slot</th>
                      <th className="py-2.5 px-3">Subject & Section</th>
                      <th className="py-2.5 px-3">Original Room</th>
                      <th className="py-2.5 px-3">Reassigned Room</th>
                      <th className="py-2.5 px-3">Faculty Assignee</th>
                      <th className="py-2.5 px-3 rounded-r-xl">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
                    {currentScenario?.reassignedEntries?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FAFC]">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#4F46E5]">{item.day} ({item.timeSlot})</td>
                        <td className="py-2.5 px-3 font-bold">{item.subjectName} <span className="text-[#64748B] font-normal">({item.sectionName})</span></td>
                        <td className="py-2.5 px-3 font-mono text-[#F43F5E] line-through">{item.originalRoom}</td>
                        <td className="py-2.5 px-3 font-mono text-[#10B981] font-bold">{item.newRoom}</td>
                        <td className="py-2.5 px-3 text-[#0F172A] font-semibold">{item.newFaculty}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                              item.status === 'RESOLVED'
                                ? 'bg-emerald-50 text-[#10B981] border-emerald-200'
                                : 'bg-amber-50 text-[#F59E0B] border-amber-200'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-[#E2E8F0] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] text-xs font-semibold hover:bg-[#F1F5F9]"
          >
            Cancel / Retain Production Status
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDiffPreview(!showDiffPreview)}
              className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] text-xs font-bold hover:bg-[#F8FAFC]"
            >
              {showDiffPreview ? 'Hide Details' : 'Preview Changes'}
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={applying}
              className="px-5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" /> {applying ? 'Applying Scenario...' : `Apply ${currentScenario?.title?.split(':')[0]}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
