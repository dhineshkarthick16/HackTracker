import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataService } from '../lib/storage';
import { Competition, Round, RoundStatus } from '../types';
import { StatusBadge, PaymentBadge, ResultBadge, RoundStatusBadge } from '../components/ui/Badge';
import { CountdownBadge } from '../components/ui/CountdownBadge';
import { formatDate, formatCurrency } from '../utils/dateUtils';
import { ConfirmDeleteModal } from '../components/ui/ConfirmDeleteModal';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Globe,
  Github,
  Linkedin,
  Copy,
  Check,
  Trophy,
  Award,
  Layers,
  Sparkles,
  Building,
  CreditCard,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CompetitionDetailsPageProps {
  id: string;
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export const CompetitionDetailsPage: React.FC<CompetitionDetailsPageProps> = ({ id, onNavigate }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedProblem, setCopiedProblem] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCompetition = async () => {
    if (!user || !id) return;
    setLoading(true);
    try {
      const data = await DataService.getCompetitionById(user.id, id);
      if (!data) {
        addToast('Competition not found or access unauthorized', 'error');
        onNavigate('competitions');
        return;
      }
      setCompetition(data);

      // Trigger celebratory confetti if Winner
      if (data.result === 'Winner') {
        setTimeout(() => {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }, 300);
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to load competition', 'error');
      onNavigate('competitions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompetition();
  }, [id, user]);

  const handleDelete = async () => {
    if (!user || !competition) return;
    setIsDeleting(true);
    try {
      await DataService.deleteCompetition(user.id, competition.id);
      addToast(`✓ Competition "${competition.name}" deleted`, 'success');
      setDeleteModalOpen(false);
      onNavigate('competitions');
    } catch (err: any) {
      addToast(err.message || 'Failed to delete competition', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyProblemStatement = () => {
    if (!competition?.problem_statement) return;
    navigator.clipboard.writeText(competition.problem_statement);
    setCopiedProblem(true);
    addToast('Problem statement copied to clipboard', 'info');
    setTimeout(() => setCopiedProblem(false), 2500);
  };

  // Quick toggle round status
  const handleUpdateRoundStatus = async (roundId: string, nextStatus: RoundStatus) => {
    if (!user || !competition) return;
    const updatedRounds = (competition.rounds || []).map((r) =>
      r.id === roundId ? { ...r, status: nextStatus } : r
    );

    try {
      const updated = await DataService.updateCompetition(
        user.id,
        competition.id,
        {},
        updatedRounds
      );
      setCompetition(updated);
      addToast('✓ Round status updated', 'success');
    } catch (err: any) {
      addToast('Failed to update round status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-800 rounded" />
        <div className="h-10 w-3/4 bg-slate-800 rounded" />
        <div className="h-40 bg-slate-800/60 rounded-xl" />
        <div className="h-60 bg-slate-800/60 rounded-xl" />
      </div>
    );
  }

  if (!competition) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Back Button */}
      <div>
        <button
          onClick={() => onNavigate('competitions')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Competitions</span>
        </button>
      </div>

      {/* Main Header Banner */}
      <div className="card-surface p-6 sm:p-8 border border-slate-800/80 rounded-2xl shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={competition.status} />
              <ResultBadge result={competition.result} />
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {competition.name}
            </h1>

            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Building className="w-4 h-4 text-indigo-400" />
              <span>Organizer:</span>
              <span className="font-semibold text-slate-200">{competition.organizer}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => onNavigate('edit-competition', { id: competition.id })}
              className="btn-secondary text-xs sm:text-sm"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Competition</span>
            </button>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="btn-danger text-xs sm:text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Highlight Grid: Deadline & Fees */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
          {/* Registration Deadline & Live IST Countdown */}
          <div className="p-4 rounded-xl bg-[#0a0e17] border border-slate-800/80 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" /> Registration Deadline (IST)
            </div>
            <div className="text-base font-bold text-slate-100 font-mono">
              {formatDate(competition.registration_deadline, true)}
            </div>
            <div>
              <CountdownBadge deadline={competition.registration_deadline} />
            </div>
          </div>

          {/* Registration Fee & Payment Status */}
          <div className="p-4 rounded-xl bg-[#0a0e17] border border-slate-800/80 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-400" /> Registration Fee & Payment
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-slate-100 font-mono">
                {formatCurrency(competition.registration_fee)}
              </span>
              <PaymentBadge
                status={competition.payment_status}
                fee={competition.registration_fee}
              />
            </div>
            <p className="text-xs text-slate-400">
              Payment Status:{' '}
              <strong className="text-slate-300">{competition.payment_status}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Competition Rounds Timeline */}
      <div className="card-surface p-6 sm:p-8 border border-slate-800/80 rounded-2xl shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Competition Rounds</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {(competition.rounds || []).filter((r) => r.status === 'Completed').length} of{' '}
            {(competition.rounds || []).length} completed
          </span>
        </div>

        {(!competition.rounds || competition.rounds.length === 0) ? (
          <div className="p-6 text-center rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 text-sm">
            No rounds specified yet for this competition.
          </div>
        ) : (
          <div className="space-y-3">
            {competition.rounds.map((round, index) => {
              const isDone = round.status === 'Completed';
              const isOngoing = round.status === 'Ongoing';
              const isEliminated = round.status === 'Eliminated';

              return (
                <div
                  key={round.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : isOngoing
                      ? 'bg-amber-950/20 border-amber-500/30 shadow-sm shadow-amber-500/10'
                      : isEliminated
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : 'bg-[#0a0e17] border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isDone
                          ? 'bg-emerald-500 text-slate-950'
                          : isOngoing
                          ? 'bg-amber-500 text-slate-950'
                          : isEliminated
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {index + 1}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white">{round.name}</h4>
                      {round.date && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Date: {formatDate(round.date)}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Interactive Status Selector */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <select
                      value={round.status}
                      onChange={(e) =>
                        handleUpdateRoundStatus(round.id, e.target.value as RoundStatus)
                      }
                      className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                      <option value="Eliminated">Eliminated</option>
                    </select>
                    <RoundStatusBadge status={round.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Problem Statement Section */}
      <div className="card-surface p-6 sm:p-8 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Problem Statement</h2>
          </div>

          {competition.problem_statement && (
            <button
              onClick={handleCopyProblemStatement}
              className="btn-secondary text-xs py-1.5 px-3"
              title="Copy problem statement"
            >
              {copiedProblem ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          )}
        </div>

        {competition.problem_statement ? (
          <div className="p-5 rounded-xl bg-[#0a0e17] border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans select-text">
            {competition.problem_statement}
          </div>
        ) : (
          <div className="p-6 text-center rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 text-sm">
            No problem statement recorded for this competition.
          </div>
        )}
      </div>

      {/* Result & Awards Showcase */}
      <div className="card-surface p-6 sm:p-8 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">Competition Result & Prize</h2>
        </div>

        <div className="p-5 rounded-xl bg-[#0a0e17] border border-slate-800/80 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Status:</span>
              <ResultBadge result={competition.result} size="md" />
            </div>

            {competition.position && (
              <div>
                <span className="text-xs text-slate-400 block mb-1">Position:</span>
                <span className="text-sm font-semibold text-slate-100 bg-slate-800 px-3 py-1 rounded-md border border-slate-700">
                  {competition.position}
                </span>
              </div>
            )}

            {competition.prize && (
              <div>
                <span className="text-xs text-slate-400 block mb-1">Prize / Grant:</span>
                <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/30 font-mono">
                  {competition.prize}
                </span>
              </div>
            )}
          </div>

          {competition.result_notes && (
            <div className="pt-3 border-t border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-1 font-semibold">Notes / Feedback:</span>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {competition.result_notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* External Links */}
      <div className="card-surface p-6 sm:p-8 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">Project & Competition Links</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Website Link */}
          {competition.competition_url ? (
            <a
              href={competition.competition_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-[#0a0e17] border border-slate-800 hover:border-indigo-500/50 hover:bg-[#111726] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-200">Competition Website</span>
              </div>
              <span className="text-xs text-slate-500 group-hover:text-indigo-400">↗</span>
            </a>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#0a0e17]/50 border border-slate-800/40 text-slate-400 text-xs flex items-center gap-2">
              <Globe className="w-4 h-4 opacity-40" />
              <span>No website URL</span>
            </div>
          )}

          {/* GitHub Repository */}
          {competition.github_url ? (
            <a
              href={competition.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-[#0a0e17] border border-slate-800 hover:border-slate-600 hover:bg-[#111726] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <Github className="w-4 h-4 text-slate-200 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-200">GitHub Repository</span>
              </div>
              <span className="text-xs text-slate-500 group-hover:text-white">↗</span>
            </a>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#0a0e17]/50 border border-slate-800/40 text-slate-400 text-xs flex items-center gap-2">
              <Github className="w-4 h-4 opacity-40" />
              <span>No GitHub repo</span>
            </div>
          )}

          {/* LinkedIn Post */}
          {competition.linkedin_url ? (
            <a
              href={competition.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-[#0a0e17] border border-slate-800 hover:border-sky-500/50 hover:bg-[#111726] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <Linkedin className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-200">LinkedIn Post</span>
              </div>
              <span className="text-xs text-slate-500 group-hover:text-sky-400">↗</span>
            </a>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#0a0e17]/50 border border-slate-800/40 text-slate-400 text-xs flex items-center gap-2">
              <Linkedin className="w-4 h-4 opacity-40" />
              <span>No LinkedIn post</span>
            </div>
          )}
        </div>
      </div>

      {/* Metadata & Timestamps */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 pt-4 border-t border-slate-800/80 font-mono">
        <div>
          <span>Created: </span>
          <strong className="text-slate-300">{formatDate(competition.created_at, true)}</strong>
        </div>
        <div>
          <span>Last Updated: </span>
          <strong className="text-slate-300">{formatDate(competition.updated_at, true)}</strong>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        competitionName={competition.name}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
        isDeleting={isDeleting}
      />
    </div>
  );
};
