import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataService } from '../lib/storage';
import { DashboardStats } from '../types';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/dateUtils';
import {
  User,
  Mail,
  ShieldCheck,
  Database,
  Download,
  Trash2,
  Sparkles,
  LogOut,
  Layers,
  Award,
  Key,
  Users
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout, isLiveSupabase, switchDemoUser } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  const loadStats = async () => {
    if (!user) return;
    try {
      const data = await DataService.getCompetitions(user.id);
      setStats(DataService.calculateStats(data));
    } catch (err) {
      console.error('Error loading stats', err);
    }
  };

  useEffect(() => {
    loadStats();
  }, [user]);

  const handleExportData = async () => {
    if (!user) return;
    try {
      const data = await DataService.getCompetitions(user.id);
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hacktrack-export-${user.name.toLowerCase().replace(/\s+/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('✓ Data exported successfully', 'success');
    } catch (err: any) {
      addToast('Failed to export data', 'error');
    }
  };

  const handleSeedDemoData = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
      await DataService.seedDemoCompetitions(user.id);
      addToast('✓ Added 3 sample hackathons to your private account', 'success');
      await loadStats();
    } catch (err: any) {
      addToast('Failed to seed sample hackathons', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const handlePurgeData = async () => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to delete all competitions from your account?')) {
      return;
    }
    setIsPurging(true);
    try {
      await DataService.clearUserData(user.id);
      addToast('✓ All your competition data has been purged', 'success');
      await loadStats();
    } catch (err: any) {
      addToast('Failed to purge data', 'error');
    } finally {
      setIsPurging(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          User Profile & Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your account credentials, storage engine, and competition exports.
        </p>
      </div>

      {/* User Card */}
      <div className="card-surface p-6 sm:p-8 border border-slate-800 rounded-2xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-extrabold text-white shadow-xl shadow-indigo-600/30">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>{user.email}</span>
              </p>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-2 rounded bg-indigo-500/10 text-indigo-300 text-[11px] font-mono">
                <Key className="w-3 h-3" />
                <span>ID: {user.id.substring(0, 18)}...</span>
              </div>
            </div>
          </div>

          <button onClick={logout} className="btn-danger text-xs sm:text-sm self-start sm:self-auto">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Quick User Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800">
          <div className="p-3 bg-[#0a0e17] rounded-xl border border-slate-800 text-center">
            <span className="text-xs text-slate-400">Competitions</span>
            <div className="text-lg font-bold text-white mt-1">
              {stats?.totalCompetitions || 0}
            </div>
          </div>
          <div className="p-3 bg-[#0a0e17] rounded-xl border border-slate-800 text-center">
            <span className="text-xs text-slate-400">Ongoing</span>
            <div className="text-lg font-bold text-emerald-400 mt-1">
              {stats?.ongoingCompetitions || 0}
            </div>
          </div>
          <div className="p-3 bg-[#0a0e17] rounded-xl border border-slate-800 text-center">
            <span className="text-xs text-slate-400">Victories</span>
            <div className="text-lg font-bold text-amber-400 mt-1">{stats?.wins || 0}</div>
          </div>
          <div className="p-3 bg-[#0a0e17] rounded-xl border border-slate-800 text-center">
            <span className="text-xs text-slate-400">Finalists</span>
            <div className="text-lg font-bold text-indigo-400 mt-1">{stats?.finalists || 0}</div>
          </div>
        </div>
      </div>

      {/* Backend & Security Layer Status */}
      <div className="card-surface p-6 sm:p-8 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Database className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Backend & Security Engine
          </h2>
        </div>

        <div className="p-4 rounded-xl bg-[#0a0e17] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isLiveSupabase ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-bold text-emerald-300">
                    Live Supabase PostgreSQL Active
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <span className="text-sm font-bold text-indigo-300">
                    Client-Side Isolated Multi-User Engine
                  </span>
                </>
              )}
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {isLiveSupabase ? 'RLS Enabled' : 'Local Partition'}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {isLiveSupabase
              ? 'Your hackathon records and rounds are stored securely in Supabase PostgreSQL with strict Row Level Security (RLS) policies.'
              : 'HackTrack is running in local multi-user mode. Data is partitioned strictly by user ID so that User A and User B never share data. To connect to Supabase Cloud, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.'}
          </p>
        </div>
      </div>

      {/* Multi-User Fast Account Switcher for Testing */}
      <div className="card-surface p-6 sm:p-8 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Users className="w-5 h-5 text-violet-400" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Multi-User Isolation Switcher
          </h2>
        </div>

        <p className="text-xs text-slate-400">
          Click below to switch accounts instantly to test that User A cannot see User B's competitions:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => switchDemoUser('alice')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              user.email === 'alice@hacktrack.io'
                ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/10'
                : 'bg-[#0a0e17] border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-sm font-bold text-white">👤 User A: Alice (Developer A)</div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">alice@hacktrack.io</div>
            {user.email === 'alice@hacktrack.io' && (
              <span className="inline-block mt-2 text-[10px] text-indigo-400 font-semibold bg-indigo-500/15 px-2 py-0.5 rounded">
                ● Currently Logged In
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => switchDemoUser('bob')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              user.email === 'bob@hacktrack.io'
                ? 'bg-violet-600/20 border-violet-500 shadow-md shadow-violet-500/10'
                : 'bg-[#0a0e17] border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-sm font-bold text-white">👤 User B: Bob (Competitor B)</div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">bob@hacktrack.io</div>
            {user.email === 'bob@hacktrack.io' && (
              <span className="inline-block mt-2 text-[10px] text-violet-400 font-semibold bg-violet-500/15 px-2 py-0.5 rounded">
                ● Currently Logged In
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Developer & Copyright Card */}
      <div className="card-surface p-6 sm:p-8 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Developer & Copyright
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0a0e17] border border-slate-800">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">
              Developed by <span className="text-indigo-400 font-bold">Dhinesh Karthick D</span>
            </p>
            <p className="text-xs text-slate-400 font-mono">
              © DK 2026 — All rights reserved.
            </p>
          </div>

          <a
            href="https://www.linkedin.com/in/dhineshkarthick16/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs shrink-0 self-start sm:self-auto"
          >
            <span>Connect on LinkedIn</span>
            <span className="text-xs">↗</span>
          </a>
        </div>
      </div>

      {/* Data Management Actions */}
      <div className="card-surface p-6 sm:p-8 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Data Management
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={handleExportData}
            className="btn-secondary justify-start p-3 text-xs"
          >
            <Download className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Export Data (JSON)</span>
          </button>

          <button
            onClick={handleSeedDemoData}
            disabled={isSeeding}
            className="btn-secondary justify-start p-3 text-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{isSeeding ? 'Seeding...' : 'Load Sample Hackathons'}</span>
          </button>

          <button
            onClick={handlePurgeData}
            disabled={isPurging}
            className="btn-danger justify-start p-3 text-xs"
          >
            <Trash2 className="w-4 h-4 text-white shrink-0" />
            <span>{isPurging ? 'Purging...' : 'Purge All My Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
