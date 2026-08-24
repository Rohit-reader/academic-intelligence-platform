import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, GraduationCap, ArrowRight } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);

    try {
      await login(demoEmail, demoPass);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label: 'Admin', email: 'admin@university.edu', pass: 'Admin@123', color: 'border-rose-200 hover:bg-rose-50 text-rose-700' },
    { label: 'HOD CSE', email: 'hod.cse@university.edu', pass: 'Hod@123', color: 'border-purple-200 hover:bg-purple-50 text-purple-700' },
    { label: 'Faculty', email: 'ravi@university.edu', pass: 'Faculty@123', color: 'border-indigo-200 hover:bg-indigo-50 text-indigo-700' },
    { label: 'Student', email: 'student1@university.edu', pass: 'Student@123', color: 'border-emerald-200 hover:bg-emerald-50 text-emerald-700' },
    { label: 'Exam Cell', email: 'examcell@university.edu', pass: 'Exam@123', color: 'border-amber-200 hover:bg-amber-50 text-amber-700' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      {/* Background Soft Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#4F46E5]/10 to-[#7C3AED]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-xl z-10">
        <div className="text-center mb-8">
          <img src="/kec-logo.png" alt="KEC Logo" className="h-16 w-auto mx-auto mb-3 object-contain" />
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">KEC</h1>
          <p className="text-xs text-[#4F46E5] mt-1 font-bold">Kongu Engineering College — Operations Platform</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@university.edu"
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold py-2.5 rounded-xl transition shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Login Shortcuts */}
        <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
          <p className="text-center text-xs font-bold text-[#64748B] mb-3">Quick Demo Logins (1-Click)</p>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.label}
                type="button"
                onClick={() => handleDemoLogin(acc.email, acc.pass)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition flex items-center justify-center gap-1.5 ${acc.color}`}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
