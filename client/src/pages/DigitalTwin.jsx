import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';
import { Layers, Play, CheckCircle } from 'lucide-react';

import { RippleEffectAnalyzerModal } from '../components/RippleEffectAnalyzerModal';
import { Sliders } from 'lucide-react';

export const DigitalTwin = () => {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faculties, setFaculties] = useState([]);
  const [classrooms, setClassrooms] = useState([]);

  // Ripple Analysis State
  const [rippleData, setRippleData] = useState(null);
  const [analyzingRipple, setAnalyzingRipple] = useState(false);

  const handleRunRippleAnalysis = async () => {
    setAnalyzingRipple(true);
    try {
      const res = await fetchAPI('/ripple/analyze', {
        method: 'POST',
        body: {
          resourceType: selectedRooms.length > 0 ? 'CLASSROOM' : selectedFaculties.length > 0 ? 'FACULTY' : 'CLASSROOM',
          resourceId: selectedRooms[0] || selectedFaculties[0] || '123',
          resourceName: 'Room 301',
          changeType: 'MAINTENANCE',
          day: 'Wednesday',
          startTime: '10:00',
          endTime: '16:00',
        },
      });
      if (res.success) setRippleData(res.data);
    } catch (err) {
      alert(err.message || 'Ripple Analysis failed');
    } finally {
      setAnalyzingRipple(false);
    }
  };

  // Form states
  const [simName, setSimName] = useState('');
  const [selectedFaculties, setSelectedFaculties] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [running, setRunning] = useState(false);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [facRes, roomRes, simRes] = await Promise.all([
        fetchAPI('/master/faculty'),
        fetchAPI('/master/classrooms'),
        fetchAPI('/simulations'),
      ]);
      if (facRes.success) setFaculties(facRes.data);
      if (roomRes.success) setClassrooms(roomRes.data);
      if (simRes.success) setSimulations(simRes.data);
    } catch (err) {
      console.error('Failed to load digital twin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleRunSimulation = async (e) => {
    e.preventDefault();
    setRunning(true);
    try {
      const res = await fetchAPI('/simulations', {
        method: 'POST',
        body: {
          name: simName || 'Hypothetical What-If Scenario',
          absentFacultyIds: selectedFaculties,
          blockedRoomIds: selectedRooms,
          newEvent: eventTitle ? { title: eventTitle, date: new Date(), startTime: '10:00', endTime: '12:00' } : null,
        },
      });

      if (res.success) {
        alert('Digital Twin simulation completed! Evaluated alternatives generated without altering live data.');
        setSimName('');
        setSelectedFaculties([]);
        setSelectedRooms([]);
        setEventTitle('');
        loadInitialData();
      }
    } catch (err) {
      alert(err.message || 'Simulation failed');
    } finally {
      setRunning(false);
    }
  };

  const handleApplyScenario = async (simId, scenarioId) => {
    try {
      const res = await fetchAPI(`/simulations/${simId}/apply`, {
        method: 'POST',
        body: { scenarioId },
      });
      if (res.success) {
        alert(`Scenario '${scenarioId}' committed to live production! Audit log created.`);
        loadInitialData();
      }
    } catch (err) {
      alert(err.message || 'Failed to apply scenario');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#4F46E5]" /> Digital Twin / What-If Simulation Studio
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5 font-medium">
          Simulate hypothetical faculty absences, room maintenance, or event additions in an isolated virtual buffer before committing changes.
        </p>
      </div>

      {/* Simulation Builder Form */}
      <div className="saas-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A]">Build Hypothetical What-If Test Bench</h3>

        <form onSubmit={handleRunSimulation} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1">Simulation Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Faculty Absent & Maintenance on Block A"
              value={simName}
              onChange={(e) => setSimName(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">Simulate Faculty Absence</label>
              <select
                multiple
                value={selectedFaculties}
                onChange={(e) =>
                  setSelectedFaculties(Array.from(e.target.selectedOptions, (option) => option.value))
                }
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2 text-xs text-[#0F172A] h-28 focus:outline-none"
              >
                {faculties.map((f) => (
                  <option key={f._id} value={f._id}>{f.user?.name || f.employeeId}</option>
                ))}
              </select>
              <p className="text-[10px] text-[#64748B] mt-1 font-medium">Hold Ctrl/Cmd to select multiple</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">Simulate Room Block/Maintenance</label>
              <select
                multiple
                value={selectedRooms}
                onChange={(e) =>
                  setSelectedRooms(Array.from(e.target.selectedOptions, (option) => option.value))
                }
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2 text-xs text-[#0F172A] h-28 focus:outline-none"
              >
                {classrooms.map((r) => (
                  <option key={r._id} value={r._id}>{r.roomNumber} ({r.capacity} Seats)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">Simulate New Event Addition</label>
              <input
                type="text"
                placeholder="e.g. Guest Lecture 10am"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleRunRippleAnalysis}
              disabled={analyzingRipple}
              className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-[#7C3AED] border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <Sliders className="w-4 h-4" /> {analyzingRipple ? 'Analyzing Ripple Effect...' : 'Run Smart Ripple-Effect Analysis'}
            </button>

            <button
              type="submit"
              disabled={running}
              className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" /> {running ? 'Simulating Digital Twin...' : 'Run Simulation'}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Simulations List */}
      <div className="saas-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A]">Evaluated Digital Twin Simulations</h3>

        {loading ? (
          <div className="p-8 text-center text-[#64748B] text-xs">Loading simulations...</div>
        ) : simulations.length === 0 ? (
          <div className="p-8 text-center text-[#64748B] text-xs">No simulations recorded yet. Run a What-If scenario above!</div>
        ) : (
          <div className="space-y-6">
            {simulations.map((sim) => (
              <div key={sim._id} className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A]">{sim.name}</h4>
                    <p className="text-xs text-[#64748B] mt-0.5 font-medium">Created by: {sim.createdBy?.name || 'Administrator'}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                      sim.status === 'APPLIED'
                        ? 'bg-emerald-50 text-[#10B981] border-emerald-200'
                        : 'bg-indigo-50 text-[#4F46E5] border-indigo-200'
                    }`}
                  >
                    {sim.status}
                  </span>
                </div>

                {/* Scenarios Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sim.scenarios?.map((sc) => (
                    <div
                      key={sc.scenarioId}
                      className={`p-4 rounded-xl border space-y-3 ${
                        sc.isRecommended
                          ? 'bg-indigo-50 border-indigo-200 text-[#0F172A]'
                          : 'bg-white border-[#E2E8F0] text-[#0F172A]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{sc.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold text-[#10B981]">
                          Score: {sc.score}/100
                        </span>
                      </div>

                      <ul className="text-xs space-y-1">
                        {sc.explanation?.map((exp, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-[#64748B]">
                            <span className="text-[#4F46E5] font-bold">•</span>
                            <span>{exp}</span>
                          </li>
                        ))}
                      </ul>

                      {sim.status !== 'APPLIED' && (
                        <button
                          onClick={() => handleApplyScenario(sim._id, sc.scenarioId)}
                          className="w-full py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold shadow transition flex items-center justify-center gap-1.5 mt-2"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Apply Scenario to Live Production
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ripple Effect Impact Analyzer Modal */}
      {rippleData && (
        <RippleEffectAnalyzerModal
          analysisData={rippleData}
          onClose={() => setRippleData(null)}
          onApplySuccess={() => loadInitialData()}
        />
      )}
    </div>
  );
};
