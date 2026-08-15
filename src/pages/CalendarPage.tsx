import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataService } from '../lib/storage';
import { Competition } from '../types';
import { formatDate } from '../utils/dateUtils';
import { StatusBadge } from '../components/ui/Badge';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface CalendarPageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

interface CalendarEvent {
  competitionId: string;
  competitionName: string;
  organizer: string;
  eventType: 'Registration Deadline' | 'Round Milestone';
  title: string;
  date: Date;
  status: string;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[] | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);
      try {
        const data = await DataService.getCompetitions(user.id);
        setCompetitions(data);
      } catch (err) {
        console.error('Error loading calendar data', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  // Extract all calendar events (registration deadlines & round deadlines)
  const allEvents = useMemo<CalendarEvent[]>(() => {
    const events: CalendarEvent[] = [];

    competitions.forEach((comp) => {
      // 1. Registration Deadline
      if (comp.registration_deadline) {
        const d = new Date(comp.registration_deadline);
        if (!isNaN(d.getTime())) {
          events.push({
            competitionId: comp.id,
            competitionName: comp.name,
            organizer: comp.organizer,
            eventType: 'Registration Deadline',
            title: `Deadline: ${comp.name}`,
            date: d,
            status: comp.status,
          });
        }
      }

      // 2. Round deadlines
      (comp.rounds || []).forEach((round) => {
        if (round.date) {
          const rd = new Date(round.date);
          if (!isNaN(rd.getTime())) {
            events.push({
              competitionId: comp.id,
              competitionName: comp.name,
              organizer: comp.organizer,
              eventType: 'Round Milestone',
              title: `${round.name} (${comp.name})`,
              date: rd,
              status: round.status,
            });
          }
        }
      });
    });

    return events;
  }, [competitions]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Calculate calendar grid days
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Days in current month
    const totalDays = lastDayOfMonth.getDate();

    // Day of week index for 1st of month (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    // Convert to Monday = 0, ..., Sunday = 6
    let startingDay = (firstDayOfMonth.getDay() + 6) % 7;

    const days: Array<{
      dayNumber: number;
      isCurrentMonth: boolean;
      date: Date;
      events: CalendarEvent[];
    }> = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      const pDay = prevMonthLastDay - i;
      const d = new Date(year, month - 1, pDay);
      days.push({
        dayNumber: pDay,
        isCurrentMonth: false,
        date: d,
        events: allEvents.filter(
          (e) =>
            e.date.getFullYear() === d.getFullYear() &&
            e.date.getMonth() === d.getMonth() &&
            e.date.getDate() === d.getDate()
        ),
      });
    }

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(year, month, day);
      days.push({
        dayNumber: day,
        isCurrentMonth: true,
        date: d,
        events: allEvents.filter(
          (e) =>
            e.date.getFullYear() === d.getFullYear() &&
            e.date.getMonth() === d.getMonth() &&
            e.date.getDate() === d.getDate()
        ),
      });
    }

    // Next month padding to reach full 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        dayNumber: i,
        isCurrentMonth: false,
        date: d,
        events: allEvents.filter(
          (e) =>
            e.date.getFullYear() === d.getFullYear() &&
            e.date.getMonth() === d.getMonth() &&
            e.date.getDate() === d.getDate()
        ),
      });
    }

    return days;
  }, [year, month, allEvents]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleDateClick = (date: Date, events: CalendarEvent[]) => {
    if (events.length > 0) {
      setSelectedDateEvents(events);
      setSelectedDateStr(formatDate(date.toISOString()));
    } else {
      setSelectedDateEvents(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Deadlines & Milestones Calendar</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Visual schedule of hackathon registration closures and round evaluations.
          </p>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="btn-secondary text-xs px-3 py-1.5"
          >
            Today
          </button>
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-semibold text-white min-w-[140px] text-center font-mono">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="card-surface overflow-hidden border border-slate-800 rounded-2xl shadow-2xl">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-800 bg-[#0d121e] text-center text-xs font-bold text-slate-400 py-3 uppercase tracking-wider">
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-800/80 bg-[#090d16]">
          {calendarDays.map((cell, index) => {
            const today = isToday(cell.date);
            const hasEvents = cell.events.length > 0;

            return (
              <div
                key={index}
                onClick={() => handleDateClick(cell.date, cell.events)}
                className={`min-h-[110px] sm:min-h-[130px] p-2 sm:p-2.5 flex flex-col justify-between transition-colors ${
                  cell.isCurrentMonth ? 'bg-transparent' : 'bg-slate-950/40 text-slate-400'
                } ${hasEvents ? 'cursor-pointer hover:bg-slate-800/40' : ''}`}
              >
                {/* Date Number */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full ${
                      today
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                        : cell.isCurrentMonth
                        ? 'text-slate-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {hasEvents && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse sm:hidden" />
                  )}
                </div>

                {/* Events list within cell */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {cell.events.slice(0, 2).map((event, eIdx) => {
                    const isDeadline = event.eventType === 'Registration Deadline';

                    return (
                      <div
                        key={eIdx}
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('competition-details', { id: event.competitionId });
                        }}
                        className={`text-[11px] p-1 rounded font-medium truncate flex items-center gap-1 transition-all hover:scale-[1.02] cursor-pointer ${
                          isDeadline
                            ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25'
                            : 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25'
                        }`}
                        title={`${event.eventType}: ${event.title}`}
                      >
                        {isDeadline ? (
                          <Clock className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                        ) : (
                          <Layers className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                        )}
                        <span className="truncate">{event.competitionName}</span>
                      </div>
                    );
                  })}

                  {cell.events.length > 2 && (
                    <div className="text-[10px] text-slate-400 font-mono pl-1">
                      +{cell.events.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Event Drawer / Detail Strip */}
      {selectedDateEvents && (
        <div className="card-surface p-6 border border-slate-800 rounded-2xl shadow-xl space-y-4 animate-slide-up">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">
                Events for {selectedDateStr}
              </h3>
            </div>
            <button
              onClick={() => setSelectedDateEvents(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedDateEvents.map((ev, i) => (
              <div
                key={i}
                onClick={() => onNavigate('competition-details', { id: ev.competitionId })}
                className="p-4 rounded-xl bg-[#0a0e17] border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        ev.eventType === 'Registration Deadline'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {ev.eventType}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {ev.competitionName}
                  </h4>
                  <p className="text-xs text-slate-400">{ev.title}</p>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
