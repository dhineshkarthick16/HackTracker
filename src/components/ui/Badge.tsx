import React from 'react';
import { CompetitionStatus, PaymentStatus, ResultStatus, RoundStatus } from '../../types';
import { Trophy, Award, Check, Clock, AlertTriangle, X } from 'lucide-react';

interface StatusBadgeProps {
  status: CompetitionStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  if (status === 'Ongoing') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Ongoing
      </span>
    );
  }

  if (status === 'Upcoming') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Upcoming
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
      Completed
    </span>
  );
};

interface PaymentBadgeProps {
  status: PaymentStatus;
  fee?: number;
  size?: 'sm' | 'md';
}

export const PaymentBadge: React.FC<PaymentBadgeProps> = ({ status, fee, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  if (status === 'Paid') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-medium rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${sizeClasses}`}
      >
        <Check className="w-3.5 h-3.5" />
        Paid
      </span>
    );
  }

  if (status === 'Not Paid') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-medium rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 ${sizeClasses}`}
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        Not Paid
      </span>
    );
  }

  if (status === 'Refunded') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-medium rounded-md bg-purple-500/15 text-purple-400 border border-purple-500/30 ${sizeClasses}`}
      >
        Refunded
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-md bg-slate-800 text-slate-400 border border-slate-700 ${sizeClasses}`}
    >
      {fee && fee > 0 ? 'Not Required' : 'Free'}
    </span>
  );
};

interface ResultBadgeProps {
  result: ResultStatus;
  size?: 'sm' | 'md';
}

export const ResultBadge: React.FC<ResultBadgeProps> = ({ result, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  switch (result) {
    case 'Winner':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20 ${sizeClasses}`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          Winner
        </span>
      );
    case 'Runner-up':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/40 ${sizeClasses}`}
        >
          <Award className="w-3.5 h-3.5 text-sky-400" />
          Runner-up
        </span>
      );
    case 'Finalist':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 ${sizeClasses}`}
        >
          <Award className="w-3.5 h-3.5 text-indigo-400" />
          Finalist
        </span>
      );
    case 'Shortlisted':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/30 ${sizeClasses}`}
        >
          Shortlisted
        </span>
      );
    case 'Participated':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30 ${sizeClasses}`}
        >
          Participated
        </span>
      );
    case 'Lost':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-md bg-slate-800 text-slate-400 border border-slate-700 ${sizeClasses}`}
        >
          Not Selected
        </span>
      );
    case 'Disqualified':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 ${sizeClasses}`}
        >
          Disqualified
        </span>
      );
    case 'Pending':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/60 ${sizeClasses}`}
        >
          Pending
        </span>
      );
  }
};

interface RoundStatusBadgeProps {
  status: RoundStatus;
}

export const RoundStatusBadge: React.FC<RoundStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <Check className="w-3 h-3" /> Completed
        </span>
      );
    case 'Ongoing':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          <Clock className="w-3 h-3 animate-spin" /> Ongoing
        </span>
      );
    case 'Eliminated':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
          <X className="w-3 h-3" /> Eliminated
        </span>
      );
    case 'Upcoming':
    default:
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
          Upcoming
        </span>
      );
  }
};
