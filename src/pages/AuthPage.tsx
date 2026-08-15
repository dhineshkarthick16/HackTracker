import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, ArrowRight, ShieldCheck, Zap, Users, Lock, Mail, User } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register, switchDemoUser, isLiveSupabase } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        const res = await register(name, email, password);
        if (!res.success) {
          setError(res.error || 'Registration failed');
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Login failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-xl shadow-indigo-600/25 mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
            HackTrack
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            The developer platform for tracking hackathons, rounds & deadlines
          </p>
        </div>

        {/* Auth Card */}
        <div className="card-surface p-6 sm:p-8 border border-slate-800 shadow-2xl">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setError(null);
              }}
              className={`flex-1 py-2.5 text-sm font-semibold border-b-2 text-center transition-colors cursor-pointer ${
                !isRegisterMode
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setError(null);
              }}
              className={`flex-1 py-2.5 text-sm font-semibold border-b-2 text-center transition-colors cursor-pointer ${
                isRegisterMode
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium animate-fade-in flex items-start gap-2">
              <span className="font-bold shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Turing"
                    className="input-base pl-10"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@hackathon.dev"
                  className="input-base pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-base pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-3 text-sm font-semibold mt-2"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{isRegisterMode ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Multi-User Demo Switchers */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" /> Multi-User Quick Test
              </span>
              <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded font-mono">
                1-Click Sign In
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Instantly test user-specific data isolation:
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => switchDemoUser('alice')}
                className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-400">
                  👤 User A (Alice)
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  alice@hacktrack.io
                </div>
              </button>

              <button
                type="button"
                onClick={() => switchDemoUser('bob')}
                className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-violet-400">
                  👤 User B (Bob)
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  bob@hacktrack.io
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Security & RLS status badge */}
        <div className="mt-6 text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {isLiveSupabase
                ? 'Protected by PostgreSQL Row Level Security (RLS)'
                : 'Isolated Multi-User Private Data Partitions'}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-800/80 space-y-0.5">
            <div className="text-xs text-slate-400">
              <span>Developed by </span>
              <a
                href="https://www.linkedin.com/in/dhineshkarthick16/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1 hover:underline"
              >
                <span>Dhinesh Karthick D</span>
                <span className="text-[10px]">↗</span>
              </a>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              © DK 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
