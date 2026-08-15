import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataService } from '../lib/storage';
import { Competition, CompetitionStatus, PaymentStatus, ResultStatus, SortField } from '../types';
import { StatusBadge, PaymentBadge, ResultBadge } from '../components/ui/Badge';
import { CountdownBadge } from '../components/ui/CountdownBadge';
import { formatDate, formatCurrency } from '../utils/dateUtils';
import { ConfirmDeleteModal } from '../components/ui/ConfirmDeleteModal';
import { useToast } from '../context/ToastContext';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  LayoutGrid,
  List,
  Calendar,
  Layers,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface CompetitionsListPageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export const CompetitionsListPage: React.FC<CompetitionsListPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Search, Filters & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [resultFilter, setResultFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('latest');

  // Deletion Modal
  const [deleteTarget, setDeleteTarget] = useState<Competition | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await DataService.getCompetitions(user.id);
      setCompetitions(data);
    } catch (err: any) {
      console.error('Error fetching competitions', err);
      addToast('Failed to load competitions', 'error');
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

  // Filter & Search & Sort Logic
  const filteredAndSortedCompetitions = useMemo(() => {
    return competitions
      .filter((comp) => {
        // Search across name, organizer, and problem statement
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = comp.name.toLowerCase().includes(q);
          const matchOrganizer = comp.organizer.toLowerCase().includes(q);
          const matchProblem = (comp.problem_statement || '').toLowerCase().includes(q);
          if (!matchName && !matchOrganizer && !matchProblem) return false;
        }

        // Status Filter
        if (statusFilter !== 'All' && comp.status !== statusFilter) {
          return false;
        }

        // Result Filter
        if (resultFilter !== 'All' && comp.result !== resultFilter) {
          return false;
        }

        // Payment Filter
        if (paymentFilter !== 'All') {
          if (paymentFilter === 'Paid' && comp.payment_status !== 'Paid') return false;
          if (paymentFilter === 'Not Paid' && comp.payment_status !== 'Not Paid') return false;
          if (
            paymentFilter === 'Free / Not Required' &&
            comp.payment_status !== 'Not Required' &&
            comp.registration_fee > 0
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortField) {
          case 'latest':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'oldest':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case 'name':
            return a.name.localeCompare(b.name);
          case 'deadline': {
            if (!a.registration_deadline) return 1;
            if (!b.registration_deadline) return -1;
            return new Date(a.registration_deadline).getTime() - new Date(b.registration_deadline).getTime();
          }
          case 'status':
            return a.status.localeCompare(b.status);
          case 'result':
            return a.result.localeCompare(b.result);
          default:
            return 0;
        }
      });
  }, [competitions, searchQuery, statusFilter, resultFilter, paymentFilter, sortField]);

  return (
    <div className="space-y-6">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Competitions Directory</span>
            <span className="text-sm font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full font-mono">
              {filteredAndSortedCompetitions.length} of {competitions.length}
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your hackathons, submissions, rounds, and milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Table vs Card View Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'cards' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onNavigate('add-competition')}
            className="btn-primary text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Competition</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="card-surface p-4 border border-slate-800 rounded-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, organizer, problem statement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-10 text-xs sm:text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-base text-xs sm:text-sm cursor-pointer"
            >
              <option value="All">Status: All</option>
              <option value="Upcoming">Upcoming (🟡)</option>
              <option value="Ongoing">Ongoing (🟢)</option>
              <option value="Completed">Completed (🔵)</option>
            </select>
          </div>

          {/* Result Filter */}
          <div>
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="input-base text-xs sm:text-sm cursor-pointer"
            >
              <option value="All">Result: All</option>
              <option value="Pending">Pending</option>
              <option value="Winner">Winner (🏆)</option>
              <option value="Runner-up">Runner-up (🥈)</option>
              <option value="Finalist">Finalist (🥉)</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Participated">Participated</option>
              <option value="Lost">Not Selected</option>
              <option value="Disqualified">Disqualified</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="input-base text-xs sm:text-sm cursor-pointer"
            >
              <option value="All">Payment: All</option>
              <option value="Paid">Paid</option>
              <option value="Not Paid">Not Paid</option>
              <option value="Free / Not Required">Free / Not Required</option>
            </select>
          </div>
        </div>

        {/* Sorting and Active Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" /> Sort by:
            </span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="bg-slate-900 border border-slate-700/80 rounded-md px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="latest">Latest Added (Default)</option>
              <option value="oldest">Oldest Added</option>
              <option value="deadline">Registration Deadline</option>
              <option value="name">Competition Name</option>
              <option value="status">Status</option>
              <option value="result">Result</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== 'All' || resultFilter !== 'All' || paymentFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setResultFilter('All');
                setPaymentFilter('All');
                setSortField('latest');
              }}
              className="text-indigo-400 hover:text-indigo-300 font-medium underline flex items-center gap-1 cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {!loading && filteredAndSortedCompetitions.length === 0 && (
        <div className="card-surface p-12 text-center rounded-2xl border-dashed border-2 border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3 text-2xl">
            🔍
          </div>
          <h3 className="text-base font-bold text-white">No matching competitions found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {competitions.length === 0
              ? 'You have not added any competitions yet. Add your first one to get started!'
              : 'Try adjusting your search terms or clearing active filters.'}
          </p>
          {competitions.length === 0 ? (
            <button
              onClick={() => onNavigate('add-competition')}
              className="btn-primary text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Competition</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setResultFilter('All');
                setPaymentFilter('All');
              }}
              className="btn-secondary text-xs"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Table View */}
      {!loading && viewMode === 'table' && filteredAndSortedCompetitions.length > 0 && (
        <div className="card-surface overflow-hidden border border-slate-800/80 rounded-xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#101726] border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">S.No</th>
                  <th className="py-3.5 px-4">Competition Name</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Rounds</th>
                  <th className="py-3.5 px-4">Registration Deadline</th>
                  <th className="py-3.5 px-4">Fee & Payment</th>
                  <th className="py-3.5 px-4">Organizer</th>
                  <th className="py-3.5 px-4">Result</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAndSortedCompetitions.map((comp, index) => {
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
                        {index + 1}
                      </td>

                      {/* Competition Name + Links preview */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                          {comp.name}
                        </div>
                        {comp.competition_url && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5">
                            {comp.competition_url.replace(/^https?:\/\//, '')}
                          </div>
                        )}
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
                                className="bg-indigo-500 h-full rounded-full"
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

                      {/* Registration Deadline & Countdown */}
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
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onNavigate('edit-competition', { id: comp.id })}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(comp)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Card Grid View */}
      {!loading && viewMode === 'cards' && filteredAndSortedCompetitions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAndSortedCompetitions.map((comp) => {
            const completedRounds = (comp.rounds || []).filter((r) => r.status === 'Completed').length;
            const totalRounds = (comp.rounds || []).length;

            return (
              <div
                key={comp.id}
                onClick={() => onNavigate('competition-details', { id: comp.id })}
                className="card-interactive p-5 flex flex-col justify-between cursor-pointer space-y-4 group"
              >
                {/* Card Header */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={comp.status} size="sm" />
                    <ResultBadge result={comp.result} size="sm" />
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {comp.name}
                  </h3>

                  <p className="text-xs text-slate-400">
                    Organizer: <span className="text-slate-300 font-medium">{comp.organizer}</span>
                  </p>
                </div>

                {/* Card Middle: Deadline & Countdown */}
                <div className="p-3 bg-[#0a0e17] rounded-lg border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Deadline:</span>
                    <span className="text-slate-200 font-medium font-mono">
                      {formatDate(comp.registration_deadline)}
                    </span>
                  </div>
                  <div>
                    <CountdownBadge deadline={comp.registration_deadline} />
                  </div>
                </div>

                {/* Card Bottom: Rounds & Payment */}
                <div className="pt-2 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Rounds: <strong className="text-slate-200">{completedRounds}/{totalRounds}</strong>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-200 font-mono">
                        {formatCurrency(comp.registration_fee)}
                      </span>
                      <PaymentBadge status={comp.payment_status} size="sm" />
                    </div>
                  </div>

                  {/* External Links */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      {comp.competition_url && (
                        <a
                          href={comp.competition_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded"
                          title="Competition Website"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {comp.github_url && (
                        <a
                          href={comp.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded"
                          title="GitHub Repository"
                        >
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {comp.linkedin_url && (
                        <a
                          href={comp.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded"
                          title="LinkedIn Post"
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onNavigate('edit-competition', { id: comp.id })}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(comp)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
