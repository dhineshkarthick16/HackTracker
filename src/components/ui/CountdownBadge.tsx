import React, { useState, useEffect } from 'react';
import { getCountdown, CountdownResult } from '../../utils/dateUtils';
import { Clock, AlertCircle } from 'lucide-react';

interface CountdownBadgeProps {
  deadline?: string | null;
  compact?: boolean;
}

export const CountdownBadge: React.FC<CountdownBadgeProps> = ({ deadline, compact = false }) => {
  const [countdown, setCountdown] = useState<CountdownResult>(() => getCountdown(deadline));

  useEffect(() => {
    // Initial evaluation
    setCountdown(getCountdown(deadline));

    if (!deadline) return;

    // Update every second
    const interval = setInterval(() => {
      setCountdown(getCountdown(deadline));
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  if (!countdown.hasDeadline) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono">
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        No deadline
      </span>
    );
  }

  if (countdown.isClosed) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/25 text-xs font-mono font-medium">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        Registration closed
      </span>
    );
  }

  // Urgent if less than 24 hours
  const isUrgent = countdown.days === 0 && countdown.hours < 24;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all ${
        isUrgent
          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse-subtle'
          : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
      }`}
    >
      <Clock className={`w-3.5 h-3.5 shrink-0 ${isUrgent ? 'text-amber-400' : 'text-indigo-400'}`} />
      {compact && countdown.days > 0 ? (
        <span>
          {countdown.days}d {countdown.hours}h left
        </span>
      ) : (
        <span>{countdown.text.replace('⏳ ', '')}</span>
      )}
    </span>
  );
};
