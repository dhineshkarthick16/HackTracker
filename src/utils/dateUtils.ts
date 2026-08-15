/**
 * Date and Countdown utilities with IST (Asia/Kolkata) timezone support.
 */

// Format date to readable string (e.g., "20 Aug 2026" or "20 Aug 2026, 6:30 PM")
export function formatDate(dateString?: string | null, includeTime = false): string {
  if (!dateString) return 'No deadline';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';

    const hasSpecificTime = 
      !(date.getUTCHours() === 23 && date.getUTCMinutes() === 59) &&
      !(date.getHours() === 23 && date.getMinutes() === 59) &&
      !(date.getHours() === 0 && date.getMinutes() === 0);

    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    };

    if (includeTime && hasSpecificTime) {
      options.hour = 'numeric';
      options.minute = '2-digit';
      options.hour12 = true;
    }

    return new Intl.DateTimeFormat('en-IN', options).format(date);
  } catch {
    return 'Invalid date';
  }
}

// Format relative countdown info for a deadline
export interface CountdownResult {
  text: string;
  isClosed: boolean;
  hasDeadline: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

export function getCountdown(deadlineString?: string | null): CountdownResult {
  if (!deadlineString) {
    return {
      text: 'No deadline',
      isClosed: false,
      hasDeadline: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
    };
  }

  const deadline = new Date(deadlineString).getTime();
  if (isNaN(deadline)) {
    return {
      text: 'Invalid deadline',
      isClosed: false,
      hasDeadline: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
    };
  }

  const now = Date.now();
  const diffMs = deadline - now;

  if (diffMs <= 0) {
    return {
      text: '⚠️ Registration closed',
      isClosed: true,
      hasDeadline: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: diffMs,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let text = '⏳ ';
  if (days > 0) {
    text += `${days} ${days === 1 ? 'Day' : 'Days'} ${hours} ${hours === 1 ? 'Hour' : 'Hours'} remaining`;
  } else if (hours > 0) {
    text += `${hours} ${hours === 1 ? 'Hour' : 'Hours'} ${minutes} ${minutes === 1 ? 'Min' : 'Mins'} remaining`;
  } else if (minutes > 0) {
    text += `${minutes} ${minutes === 1 ? 'Min' : 'Mins'} ${seconds}s remaining`;
  } else {
    text += `${seconds}s remaining`;
  }

  return {
    text,
    isClosed: false,
    hasDeadline: true,
    days,
    hours,
    minutes,
    seconds,
    totalMs: diffMs,
  };
}

// Convert ISO string or Date to date input string (YYYY-MM-DD)
export function toDateInputString(dateString?: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  
  return `${year}-${month}-${day}`;
}

// Convert ISO string or Date to optional time input string (HH:mm)
export function toTimeInputString(dateString?: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  // If time is 23:59:59 (default end-of-day), treat as no specific time set
  if (date.getHours() === 23 && date.getMinutes() === 59) return '';

  const pad = (n: number) => n.toString().padStart(2, '0');
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  
  return `${hours}:${minutes}`;
}

// Combine date (YYYY-MM-DD) and optional time (HH:mm) into ISO string
export function combineDateAndTime(dateStr?: string, timeStr?: string, defaultEndOfDay = true): string | null {
  if (!dateStr || !dateStr.trim()) return null;

  try {
    const trimmedDate = dateStr.trim();
    const [year, month, day] = trimmedDate.split('-').map(Number);
    if (!year || !month || !day) return null;

    if (timeStr && timeStr.trim()) {
      const [hours, minutes] = timeStr.trim().split(':').map(Number);
      const dateObj = new Date(year, month - 1, day, hours || 0, minutes || 0, 0);
      return isNaN(dateObj.getTime()) ? null : dateObj.toISOString();
    }

    // Date-only provided:
    // If defaultEndOfDay is true (e.g. registration deadline), default to 23:59:59
    const dateObj = defaultEndOfDay
      ? new Date(year, month - 1, day, 23, 59, 59)
      : new Date(year, month - 1, day, 12, 0, 0);

    return isNaN(dateObj.getTime()) ? null : dateObj.toISOString();
  } catch {
    return null;
  }
}

// Backward compatibility helpers
export function toDateTimeLocalString(dateString?: string | null): string {
  return toDateInputString(dateString);
}

export function fromDateTimeLocalString(localString?: string): string | null {
  return combineDateAndTime(localString, '');
}

// Format currency amount (e.g. ₹500 or Free)
export function formatCurrency(amount: number | string | undefined | null): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num === undefined || num === null || isNaN(num) || num <= 0) {
    return 'Free';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}
