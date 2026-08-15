import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
  subtext?: string;
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-indigo-400',
  bgColor = 'bg-indigo-500/10',
  subtext,
  highlight = false,
}) => {
  return (
    <div
      className={`card-surface p-5 relative overflow-hidden flex flex-col justify-between ${
        highlight ? 'border-indigo-500/40 shadow-glow-sm' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${bgColor}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
          {value}
        </div>
        {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );
};
