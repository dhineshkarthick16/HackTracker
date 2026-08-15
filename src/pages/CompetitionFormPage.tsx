import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataService } from '../lib/storage';
import {
  Competition,
  CompetitionStatus,
  PaymentStatus,
  ResultStatus,
  Round,
  RoundStatus,
} from '../types';
import {
  toDateInputString,
  toTimeInputString,
  combineDateAndTime,
} from '../utils/dateUtils';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Calendar,
  Layers,
  FileText,
  Trophy,
  Globe,
  Github,
  Linkedin,
  Building,
  CreditCard,
  CheckCircle,
  HelpCircle,
  Clock
} from 'lucide-react';

interface CompetitionFormPageProps {
  id?: string; // If provided, edit mode
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

interface FormRound {
  id?: string;
  name: string;
  date: string; // YYYY-MM-DD format
  time: string; // optional HH:mm format
  status: RoundStatus;
}

export const CompetitionFormPage: React.FC<CompetitionFormPageProps> = ({ id, onNavigate }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [status, setStatus] = useState<CompetitionStatus>('Upcoming');
  const [registrationDate, setRegistrationDate] = useState('');
  const [registrationTime, setRegistrationTime] = useState('');
  const [registrationFee, setRegistrationFee] = useState<number | ''>(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Not Required');
  const [problemStatement, setProblemStatement] = useState('');
  const [result, setResult] = useState<ResultStatus>('Pending');
  const [position, setPosition] = useState('');
  const [prize, setPrize] = useState('');
  const [resultNotes, setResultNotes] = useState('');
  const [competitionUrl, setCompetitionUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // Dynamic Rounds list
  const [rounds, setRounds] = useState<FormRound[]>([
    { name: 'Round 1 — Idea Submission', date: '', time: '', status: 'Upcoming' },
  ]);

  // Load existing data if edit mode
  useEffect(() => {
    async function loadToEdit() {
      if (!isEditMode || !id || !user) return;
      setLoading(true);
      try {
        const existing = await DataService.getCompetitionById(user.id, id);
        if (!existing) {
          addToast('Competition not found', 'error');
          onNavigate('competitions');
          return;
        }

        setName(existing.name);
        setOrganizer(existing.organizer);
        setStatus(existing.status);
        setRegistrationDate(toDateInputString(existing.registration_deadline));
        setRegistrationTime(toTimeInputString(existing.registration_deadline));
        setRegistrationFee(existing.registration_fee ?? 0);
        setPaymentStatus(existing.payment_status);
        setProblemStatement(existing.problem_statement || '');
        setResult(existing.result);
        setPosition(existing.position || '');
        setPrize(existing.prize || '');
        setResultNotes(existing.result_notes || '');
        setCompetitionUrl(existing.competition_url || '');
        setGithubUrl(existing.github_url || '');
        setLinkedinUrl(existing.linkedin_url || '');

        if (existing.rounds && existing.rounds.length > 0) {
          setRounds(
            existing.rounds.map((r) => ({
              id: r.id,
              name: r.name,
              date: toDateInputString(r.date),
              time: toTimeInputString(r.date),
              status: r.status,
            }))
          );
        } else {
          setRounds([]);
        }
      } catch (err: any) {
        addToast(err.message || 'Failed to load competition', 'error');
        onNavigate('competitions');
      } finally {
        setLoading(false);
      }
    }

    loadToEdit();
  }, [id, isEditMode, user]);

  const handleAddRound = () => {
    const nextIndex = rounds.length + 1;
    setRounds((prev) => [
      ...prev,
      {
        name: `Round ${nextIndex} — Evaluation`,
        date: '',
        time: '',
        status: 'Upcoming',
      },
    ]);
  };

  const handleRemoveRound = (index: number) => {
    setRounds((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRoundChange = (index: number, field: keyof FormRound, value: any) => {
    setRounds((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim()) {
      addToast('Please provide a Competition Name', 'error');
      return;
    }
    if (!organizer.trim()) {
      addToast('Please provide an Organizer name', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const parsedDeadline = combineDateAndTime(registrationDate, registrationTime, true);
      const parsedFee = typeof registrationFee === 'number' ? registrationFee : 0;

      const formattedRounds = rounds
        .filter((r) => r.name.trim() !== '')
        .map((r, index) => ({
          ...(r.id ? { id: r.id } : {}),
          name: r.name.trim(),
          date: combineDateAndTime(r.date, r.time, false),
          status: r.status,
          round_order: index + 1,
        }));

      if (isEditMode && id) {
        await DataService.updateCompetition(
          user.id,
          id,
          {
            name: name.trim(),
            organizer: organizer.trim(),
            status,
            registration_deadline: parsedDeadline,
            registration_fee: parsedFee,
            payment_status: paymentStatus,
            problem_statement: problemStatement.trim(),
            result,
            position: position.trim(),
            prize: prize.trim(),
            result_notes: resultNotes.trim(),
            competition_url: competitionUrl.trim(),
            github_url: githubUrl.trim(),
            linkedin_url: linkedinUrl.trim(),
          },
          formattedRounds
        );

        addToast('✓ Competition updated successfully', 'success');
        onNavigate('competition-details', { id });
      } else {
        const created = await DataService.createCompetition(
          user.id,
          {
            name: name.trim(),
            organizer: organizer.trim(),
            status,
            registration_deadline: parsedDeadline,
            registration_fee: parsedFee,
            payment_status: paymentStatus,
            problem_statement: problemStatement.trim(),
            result,
            position: position.trim(),
            prize: prize.trim(),
            result_notes: resultNotes.trim(),
            competition_url: competitionUrl.trim(),
            github_url: githubUrl.trim(),
            linkedin_url: linkedinUrl.trim(),
          },
          formattedRounds
        );

        addToast('✓ Competition added successfully', 'success');
        onNavigate('competition-details', { id: created.id });
      }
    } catch (err: any) {
      console.error('Save error', err);
      addToast(err.message || 'Failed to save competition', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-800 rounded" />
        <div className="h-12 w-1/2 bg-slate-800 rounded" />
        <div className="h-64 bg-slate-800/60 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
      <div>
        <button
          onClick={() => (isEditMode && id ? onNavigate('competition-details', { id }) : onNavigate('competitions'))}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Go Back</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {isEditMode ? 'Edit Competition' : 'Add New Competition'}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Fill in the competition parameters, registration dates, problem statement, and milestone rounds.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="card-surface p-6 sm:p-8 border border-slate-800/80 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Building className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              1. Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Competition Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Smart India Hackathon"
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Organizer <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="e.g. Devfolio, Government of India, IEEE"
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Competition Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CompetitionStatus)}
                className="input-base cursor-pointer"
              >
                <option value="Upcoming">🟡 Upcoming</option>
                <option value="Ongoing">🟢 Ongoing</option>
                <option value="Completed">🔵 Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Registration & Payment */}
        <div className="card-surface p-6 sm:p-8 border border-slate-800/80 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              2. Registration & Fees
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Registration Deadline: Date + Optional Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Registration Deadline (IST)</span>
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={registrationDate}
                  onChange={(e) => setRegistrationDate(e.target.value)}
                  className="input-base text-xs font-mono"
                  placeholder="YYYY-MM-DD"
                />

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="time"
                      value={registrationTime}
                      onChange={(e) => setRegistrationTime(e.target.value)}
                      className="input-base pl-8 py-1.5 text-xs font-mono"
                      placeholder="Time (Optional)"
                    />
                  </div>
                  {registrationTime && (
                    <button
                      type="button"
                      onClick={() => setRegistrationTime('')}
                      className="text-[11px] text-slate-400 hover:text-rose-400 px-1.5 py-1 rounded bg-slate-800"
                      title="Clear optional time"
                    >
                      ✕ Clear
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Time is optional (defaults to 11:59 PM IST if left blank).
              </p>
            </div>

            {/* Registration Fee */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Registration Fee (₹ INR)
              </label>
              <input
                type="number"
                min={0}
                step={50}
                value={registrationFee === '' ? '' : registrationFee}
                onChange={(e) =>
                  setRegistrationFee(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="0 for Free"
                className="input-base font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">Enter 0 for Free entry</p>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="input-base cursor-pointer"
              >
                <option value="Not Required">Not Required</option>
                <option value="Not Paid">Not Paid</option>
                <option value="Paid">✓ Paid</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Competition Rounds */}
        <div className="card-surface p-6 sm:p-8 border border-slate-800/80 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                3. Competition Rounds
              </h2>
            </div>

            <button
              type="button"
              onClick={handleAddRound}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Round</span>
            </button>
          </div>

          <div className="space-y-3">
            {rounds.map((round, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-[#0a0e17] border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
              >
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Round #{index + 1} Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={round.name}
                    onChange={(e) => handleRoundChange(index, 'name', e.target.value)}
                    placeholder="e.g. Round 1 — Idea Submission"
                    className="input-base py-2 text-xs"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Date & Optional Time
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="date"
                      value={round.date}
                      onChange={(e) => handleRoundChange(index, 'date', e.target.value)}
                      className="input-base py-1.5 text-xs font-mono"
                      placeholder="Date"
                    />
                    <input
                      type="time"
                      value={round.time}
                      onChange={(e) => handleRoundChange(index, 'time', e.target.value)}
                      className="input-base py-1.5 text-xs font-mono"
                      placeholder="Time (Optional)"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Round Status
                  </label>
                  <select
                    value={round.status}
                    onChange={(e) =>
                      handleRoundChange(index, 'status', e.target.value as RoundStatus)
                    }
                    className="input-base py-1.5 text-xs cursor-pointer"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Eliminated">Eliminated</option>
                  </select>
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveRound(index)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Remove round"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {rounds.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">
                No rounds added. Click "Add Round" above to create milestones.
              </p>
            )}
          </div>
        </div>

        {/* Section 4: Problem Statement */}
        <div className="card-surface p-6 sm:p-8 border border-slate-800/80 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              4. Problem Statement
            </h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Complete Problem Statement & Requirements
            </label>
            <textarea
              rows={6}
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="Paste the complete hackathon problem statement, guidelines, evaluation metrics, and team objectives here..."
              className="input-base text-sm leading-relaxed"
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Multiline text formatting and paragraphs are preserved.
            </p>
          </div>
        </div>

        {/* Section 5: Result & Prize */}
        <div className="card-surface p-6 sm:p-8 border border-slate-800/80 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              5. Results & Victory Details (Optional)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Result Status
              </label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value as ResultStatus)}
                className="input-base cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="Winner">🏆 Winner</option>
                <option value="Runner-up">🥈 Runner-up</option>
                <option value="Finalist">🥉 Finalist</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Participated">Participated</option>
                <option value="Lost">Lost / Not Selected</option>
                <option value="Disqualified">Disqualified</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Position (Optional)
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. 1st Place / Top 5"
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Prize / Grant (Optional)
              </label>
              <input
                type="text"
                value={prize}
                onChange={(e) => setPrize(e.target.value)}
                placeholder="e.g. ₹50,000 + Cloud Credits"
                className="input-base font-mono"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Result Notes & Judge Feedback (Optional)
              </label>
              <textarea
                rows={2}
                value={resultNotes}
                onChange={(e) => setResultNotes(e.target.value)}
                placeholder="Notes on the final pitch, feedback from judges, next steps..."
                className="input-base text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Links */}
        <div className="card-surface p-6 sm:p-8 border border-slate-800/80 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Globe className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              6. External Links
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" /> Competition Website
              </label>
              <input
                type="url"
                value={competitionUrl}
                onChange={(e) => setCompetitionUrl(e.target.value)}
                placeholder="https://..."
                className="input-base text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-slate-300" /> GitHub Repository
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="input-base text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5 text-sky-400" /> LinkedIn Post
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/posts/..."
                className="input-base text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => (isEditMode && id ? onNavigate('competition-details', { id }) : onNavigate('competitions'))}
            className="btn-secondary px-6"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary px-8 py-3 text-sm font-semibold"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving...' : isEditMode ? 'Update Competition' : 'Save Competition'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
