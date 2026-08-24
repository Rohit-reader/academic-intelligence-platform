import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';
import { ShieldAlert, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';

export const Security = () => {
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      const [alertRes, logRes] = await Promise.all([
        fetchAPI('/system/security/alerts'),
        fetchAPI('/system/audit'),
      ]);
      if (alertRes.success) setAlerts(alertRes.data);
      if (logRes.success) setLogs(logRes.data);
    } catch (err) {
      console.error('Failed to load security data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();
  }, []);

  const handleResolveAlert = async (alertId) => {
    try {
      const res = await fetchAPI(`/system/security/alerts/${alertId}/resolve`, {
        method: 'PUT',
      });
      if (res.success) {
        alert('Alert marked as resolved.');
        loadSecurityData();
      }
    } catch (err) {
      alert(err.message || 'Failed to resolve alert');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#F43F5E]" /> Security Operations & Rule-Based Anomaly Detection
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">Monitor system audit logs, automated rule-based security anomaly scanners, and unauthorized action attempts.</p>
        </div>

        <button
          onClick={loadSecurityData}
          className="px-4 py-2 bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] rounded-xl text-xs font-semibold flex items-center gap-2 self-start shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Scanner
        </button>
      </div>

      {/* Security Alerts Banner */}
      <div className="saas-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A] flex items-center justify-between">
          <span>Active Security Anomaly Alerts</span>
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-50 text-[#F43F5E] border border-rose-200">
            {alerts.filter((a) => a.status === 'OPEN').length} Open Alerts
          </span>
        </h3>

        {alerts.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#10B981]" />
            <span>Zero open security anomaly alerts detected. Platform integrity is clean.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((al) => (
              <div
                key={al._id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  al.status === 'RESOLVED'
                    ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#F43F5E]" />
                  <div className="space-y-0.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0F172A]">{al.alertType}</span>
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-rose-100 text-[#F43F5E] uppercase border border-rose-200">
                        {al.severity}
                      </span>
                    </div>
                    <p className="opacity-90">{al.description}</p>
                    <p className="text-[10px] text-[#64748B] font-mono">
                      Timestamp: {new Date(al.createdAt).toLocaleString()} | IP: {al.ipAddress}
                    </p>
                  </div>
                </div>

                {al.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleResolveAlert(al._id)}
                    className="px-3 py-1.5 bg-[#F43F5E] hover:bg-[#E11D48] text-white rounded-lg text-xs font-semibold shadow-2xs self-start sm:self-center"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Logs Table */}
      <div className="saas-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A]">Full System Audit Log History</h3>

        {loading ? (
          <div className="p-8 text-center text-[#64748B] text-xs">Loading audit logs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] font-bold bg-[#F8FAFC]">
                  <th className="py-3 px-3.5 rounded-l-xl">Timestamp</th>
                  <th className="py-3 px-3.5">User</th>
                  <th className="py-3 px-3.5">Role</th>
                  <th className="py-3 px-3.5">Action</th>
                  <th className="py-3 px-3.5">IP Address</th>
                  <th className="py-3 px-3.5 rounded-r-xl">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#F8FAFC] transition">
                    <td className="py-3 px-3.5 font-mono text-[11px] text-[#64748B]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 font-bold text-[#0F172A]">{log.userName}</td>
                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 border border-[#E2E8F0] text-[#64748B]">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-mono font-bold text-[#4F46E5]">{log.action}</td>
                    <td className="py-3 px-3.5 font-mono text-[#64748B] text-[11px]">{log.ipAddress}</td>
                    <td className="py-3 px-3.5 text-[#64748B] truncate max-w-xs">{log.details}</td>
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
