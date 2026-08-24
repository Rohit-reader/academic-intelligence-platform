import React, { useEffect, useState } from 'react';
import { fetchAPI } from '../services/api';
import { ShieldCheck, ShieldAlert, Key, CheckCircle, Search, Sliders } from 'lucide-react';

export const RolesPermissions = () => {
  const [matrix, setMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const res = await fetchAPI('/system/permissions');
        if (res.success) setMatrix(res.data);
      } catch (err) {
        console.error('Failed to load permissions matrix:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPermissions();
  }, []);

  const roleBadges = {
    ADMIN: 'bg-rose-50 text-rose-700 border-rose-200',
    HOD: 'bg-purple-50 text-purple-700 border-purple-200',
    FACULTY: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    STUDENT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    EXAM_CELL: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  const filteredMatrix = matrix.filter((item) =>
    item.role.toLowerCase().includes(search.toLowerCase()) ||
    item.scope.toLowerCase().includes(search.toLowerCase()) ||
    item.permissions.some((p) => p.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#4F46E5]" /> Settings → Roles & Permission Matrix
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5 font-medium">
          Centralized Role-Based Access Control (RBAC) & Data Scope Security Matrix (Role + Permission + Data Scope).
        </p>
      </div>

      {/* Security Architecture Banner */}
      <div className="saas-card p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Security Enforcement Model</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              Deny By Default
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Authentication → Role Permission → Data Scope → Action. Every request is verified server-side.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20">
            5 Registered Roles
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20">
            Strict IDOR Protection
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by role, permission, or scope..."
          className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
        />
      </div>

      {/* Roles & Permissions Matrix Table */}
      <div className="saas-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A]">System Permission Registry</h3>

        {loading ? (
          <div className="p-8 text-center text-[#64748B] text-xs">Loading Security Matrix...</div>
        ) : (
          <div className="space-y-4">
            {filteredMatrix.map((row) => (
              <div key={row.role} className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-extrabold rounded-xl border uppercase ${roleBadges[row.role] || ''}`}>
                      {row.role}
                    </span>
                    <span className="text-xs font-semibold text-[#0F172A]">Data Scope: <span className="text-[#4F46E5] font-bold">{row.scope}</span></span>
                  </div>
                  <span className="text-xs text-[#64748B] font-mono">{row.permissions.length} Explicit Permissions</span>
                </div>

                {/* Permission Badges Grid */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {row.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg bg-white border border-[#E2E8F0] text-[#0F172A] flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3 h-3 text-[#10B981]" />
                      <span>{perm}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
