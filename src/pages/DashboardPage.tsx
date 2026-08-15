import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataService } from '../lib/storage';
import { Competition, DashboardStats } from '../types';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge, PaymentBadge, ResultBadge } from '../components/ui/Badge';
import { CountdownBadge } from '../components/ui/CountdownBadge';
import { formatDate, formatCurrency } from '../utils/dateUtils';
import { ConfirmDeleteModal } from '../components/ui/ConfirmDeleteModal';
import { useToast } from '../context/ToastContext';
import {
  Trophy,
  Flame,
  CheckCircle2,
  Award,
  Clock,
  IndianRupee,
  Plus,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Layers,
  Search,
  Calendar
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Competition | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await DataService.getCompetitions(user.id);
      setCompetitions(data);
      setStats(DataService.calculateStats(data));
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      addToast(err.message || 'Failed to load competitions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleDelete = async () => {
    if (!user || !deleteTarget) return;
    setIsDeleting(true);
    try {
      await DataService.deleteCompetition(user.id, deleteTarget.id);
      addToast(`✓ Competition "${deleteTarget.name}" deleted successfully`, 'success');
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete competition', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSeedDemoData = async () => {
    if (!user) return;
    try {
      await DataService.seedDemoCompetitions(user.id);
      addToast('✓ Loaded sample hackathons into your private account', 'success');
      await loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to seed sample data', 'error');
    }
  };

  // Filter urgent upcoming deadlines for the top banner (within next 7 days)
  const urgentCompetitions = React.useMemo(() => {
    return competitions.filter((comp) => {
      if (!comp.registration_deadline) return false;
      const deadlineTime = new Date(comp.registration_deadline).getTime();
      const now = Date.now();
      return deadlineTime > now && deadlineTime <= now + 7 * 24 * 3600 * 1000;
    });
  }, [competitions]);

  // Sort competitions by status: Ongoing (1) & Upcoming (2) at the top, Completed (3) at the bottom
  // Secondary sort by newest created
  const sortedCompetitions = React.useMemo(() => {
    const getStatusWeight = (status: string) => {
      if (status === 'Ongoing') return 1;
      if (status === 'Upcoming') return 2;
      if (status === 'Completed') return 3;
      return 4;
    };

    return [...competitions].sort((a, b) => {
      const weightDiff = getStatusWeight(a.status) - getStatusWeight(b.status);
      if (weightDiff !== 0) return weightDiff;

      // Within same status, sort newest first
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [competitions]);

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Welcome back, {user?.name?.split(' ')[0] || 'Hacker'}</span>
            <span className="text-xl">🚀</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track hackathons, milestones, submissions, and competition victories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {competitions.length === 0 && (
            <button
              onClick={handleSeedDemoData}
              className="btn-secondary text-xs sm:text-sm"
              title="Load 3 sample hackathons into your private account"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Load Sample Data</span>
            </button>
          )}
          <button
            onClick={() => onNavigate('add-competition')}
            className="btn-primary text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Competition</span>
          </button>
        </div>
      </div>

      {/* Urgent Deadlines Banner if any */}
      {urgentCompetitions.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-fade-in shadow-lg shadow-amber-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl shrink-0">
              <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-300">
                Upcoming Registration Deadline Alert!
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                <span className="font-semibold text-white">{urgentCompetitions[0].name}</span> registration is closing soon.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end md:self-auto">
            <CountdownBadge deadline={urgentCompetitions[0].registration_deadline} />
            <button
              onClick={() => onNavigate('competition-details', { id: urgentCompetitions[0].id })}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 7 Key Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Competitions"
          value={loading ? '-' : stats?.totalCompetitions || 0}
          icon={Layers}
          iconColor="text-indigo-400"
          bgColor="bg-indigo-500/15"
          highlight={true}
        />
        <StatCard
          title="Ongoing"
          value={loading ? '-' : stats?.ongoingCompetitions || 0}
          icon={Flame}
          iconColor="text-emerald-400"
          bgColor="bg-emerald-500/15"
        />
        <StatCard
          title="Completed"
          value={loading ? '-' : stats?.completedCompetitions || 0}
          icon={CheckCircle2}
          iconColor="text-blue-400"
          bgColor="bg-blue-500/15"
        />
        <StatCard
          title="Wins"
          value={loading ? '-' : stats?.wins || 0}
          icon={Trophy}
          iconColor="text-amber-400"
          bgColor="bg-amber-500/15"
        />
        <StatCard
          title="Finalists"
          value={loading ? '-' : stats?.finalists || 0}
          icon={Award}
          iconColor="text-violet-400"
          bgColor="bg-violet-500/15"
        />
        <StatCard
          title="Upcoming Deadlines"
          value={loading ? '-' : stats?.upcomingDeadlines || 0}
          icon={Clock}
          iconColor="text-rose-400"
          bgColor="bg-rose-500/15"
        />
        <StatCard
          title="Total Fees Paid"
          value={loading ? '-' : formatCurrency(stats?.totalFeesPaid || 0)}
          icon={IndianRupee}
          iconColor="text-emerald-400"
          bgColor="bg-emerald-500/15"
          subtext="Total registration fees"
        />
      </div>

      {/* Competitions Quick Overview Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-white tracking-tight">Active & Recent Competitions</h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-400 font-mono">
              {competitions.length}
            </span>
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-medium">
              🟢 Ongoing & 🟡 Upcoming first
            </span>
          </div>

          <button
            onClick={() => onNavigate('competitions')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All Competitions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Empty State */}
        {!loading && competitions.length === 0 && (
          <div className="card-surface p-12 text-center rounded-2xl border-dashed border-2 border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 text-3xl">
              🏆
            </div>
            <h3 className="text-lg font-bold text-white">No competitions yet</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mt-1 mb-6">
              Start tracking your hackathons, deadlines, rounds, problem statements, and victories.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('add-competition')}
                className="btn-primary"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Your First Competition</span>
              </button>
              <button
                onClick={handleSeedDemoData}
                className="btn-secondary"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Load Sample Hackathons</span>
              </button>
            </div>
          </div>
        )}

        {/* Competitions Table */}
        {!loading && sortedCompetitions.length > 0 && (
          <div className="card-surface overflow-hidden border border-slate-800/80 rounded-xl shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#101726] border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-12 text-center">S.No</th>
                    <th className="py-3.5 px-4">Competition</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Rounds</th>
                    <th className="py-3.5 px-4">Deadline & Countdown</th>
                    <th className="py-3.5 px-4">Fee & Payment</th>
                    <th className="py-3.5 px-4">Organizer</th>
                    <th className="py-3.5 px-4">Result</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sortedCompetitions.slice(0, 10).map((comp, idx) => {
                    const completedRounds = (comp.rounds || []).filter(
                      (r) => r.status === 'Completed'
                    ).length;
                    const totalRounds = (comp.rounds || []).length;

                    return (
                      <tr
                        key={comp.id}
                        className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        onClick={() => onNavigate('competition-details', { id: comp.id })}
                      >
                        {/* S.No */}
                        <td className="py-4 px-4 text-center font-mono text-xs text-slate-400">
                          {idx + 1}
                        </td>

                        {/* Competition Name */}
                        <td className="py-4 px-4">
                          <div className="font-semibold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                            <span>{comp.name}</span>
                            {comp.competition_url && (
                              <a
                                href={comp.competition_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-slate-400 hover:text-indigo-400"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <StatusBadge status={comp.status} size="sm" />
                        </td>

                        {/* Rounds */}
                        <td className="py-4 px-4">
                          {totalRounds > 0 ? (
                            <div className="space-y-1">
                              <span className="text-xs font-mono font-medium text-slate-300">
                                {completedRounds} / {totalRounds} completed
                              </span>
                              <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-indigo-500 h-full rounded-full transition-all"
                                  style={{
                                    width: `${(completedRounds / totalRounds) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-mono">No rounds</span>
                          )}
                        </td>

                        {/* Deadline & Live Countdown */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="text-xs text-slate-300 font-medium">
                              {formatDate(comp.registration_deadline)}
                            </div>
                            <CountdownBadge deadline={comp.registration_deadline} compact />
                          </div>
                        </td>

                        {/* Fee & Payment */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="text-xs font-semibold text-slate-200">
                              {formatCurrency(comp.registration_fee)}
                            </div>
                            <PaymentBadge
                              status={comp.payment_status}
                              fee={comp.registration_fee}
                              size="sm"
                            />
                          </div>
                        </td>

                        {/* Organizer */}
                        <td className="py-4 px-4 text-xs text-slate-400 font-medium">
                          {comp.organizer}
                        </td>

                        {/* Result */}
                        <td className="py-4 px-4">
                          <ResultBadge result={comp.result} size="sm" />
                        </td>

                        {/* Actions */}
                        <td
                          className="py-4 px-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onNavigate('competition-details', { id: comp.id })}
                              className="px-2.5 py-1 text-xs font-medium text-indigo-400 hover:text-white hover:bg-indigo-600/30 rounded transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => onNavigate('edit-competition', { id: comp.id })}
                              className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteTarget(comp)}
                              className="px-2.5 py-1 text-xs font-medium text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 rounded transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          isOpen={true}
          competitionName={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};
