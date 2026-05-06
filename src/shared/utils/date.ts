/**
 * 4CORE OKR Platform - Date & Time Utilities
 */

/**
 * Get current time in West Africa (WAT)
 */
export const getWATTime = (): Date => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const today = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Get current quarter info
 */
export const getCurrentQuarterInfo = () => {
  const now = getWATTime();
  const month = now.getMonth();
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const quarterIndex = Math.floor(month / 3);
  return {
    year: now.getFullYear(),
    quarter: quarters[quarterIndex],
    quarterIndex,
    quarterLabel: quarters[quarterIndex]
  };
};

/**
 * Get current week number
 */
export const getCurrentWeekNumber = () => {
  const now = getWATTime();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return { week: `Week ${week}`, year: now.getFullYear() };
};

/**
 * Get current week range (Monday - Sunday)
 */
export const getCurrentWeekRange = (): string => {
  const now = getWATTime();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  const sunday = new Date(now.setDate(diff + 6));
  const weekNum = Math.ceil(((monday.getTime() - new Date(monday.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(monday.getFullYear(), 0, 1).getDay() + 1) / 7);
  return `Week ${weekNum}, ${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
};

/**
 * Get recent week ranges for filters
 */
export const getRecentWeekRanges = (): { label: string; value: string }[] => {
  const now = getWATTime();
  const ranges = [];
  for (let i = 0; i < 8; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - (i * 7));
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d.setDate(diff));
    const sun = new Date(d.setDate(diff + 6));
    const weekNum = Math.ceil(((mon.getTime() - new Date(mon.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(mon.getFullYear(), 0, 1).getDay() + 1) / 7);
    ranges.push({
      label: `Week ${weekNum}, ${mon.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sun.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      value: `W${weekNum}`
    });
  }
  return ranges;
};

/**
 * Format date for display
 */
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  });
};

/**
 * Format date with time
 */
export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = getWATTime();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(d);
};

/**
 * Get week start and end dates for a given week number
 */
export const getWeekDates = (weekNum: number, year: number): { start: Date; end: Date } => {
  const jan1 = new Date(year, 0, 1);
  const days = (weekNum - 1) * 7 - jan1.getDay() + 1;
  const start = new Date(year, 0, days);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { start, end };
};

/**
 * Get all quarters for a year
 */
export const getYearQuarters = (year: number): { quarter: string; start: Date; end: Date }[] => {
  return [
    { quarter: 'Q1', start: new Date(year, 0, 1), end: new Date(year, 2, 31) },
    { quarter: 'Q2', start: new Date(year, 3, 1), end: new Date(year, 5, 30) },
    { quarter: 'Q3', start: new Date(year, 6, 1), end: new Date(year, 8, 30) },
    { quarter: 'Q4', start: new Date(year, 9, 1), end: new Date(year, 11, 31) }
  ];
};

/**
 * Check if a date is today
 */
export const isToday = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = getWATTime();
  return d.toDateString() === today.toDateString();
};

/**
 * Check if a date is in the past
 */
export const isPast = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < getWATTime();
};

/**
 * Check if a date is in the future
 */
export const isFuture = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d > getWATTime();
};