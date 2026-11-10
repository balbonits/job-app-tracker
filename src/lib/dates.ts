const DAY = 86_400_000;

/** Local calendar date as YYYY-MM-DD. */
export function isoDay(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return isoDay(new Date(y, m - 1, d + n));
}

/** Whole days from `day` to today; positive means in the past. */
export function daysAgo(at: string, now: Date = new Date()): number {
  const [y, m, d] = at.slice(0, 10).split('-').map(Number);
  const then = new Date(y, m - 1, d).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((today - then) / DAY);
}

export function agoText(at: string, now?: Date): string {
  const n = daysAgo(at, now);
  if (n <= 0) return 'today';
  if (n === 1) return 'yesterday';
  return `${n} days ago`;
}

export function formatDay(day: string): string {
  const [y, m, d] = day.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export type DueGroup = 'overdue' | 'today' | 'week' | 'later';
export function dueGroup(due: string, now?: Date): DueGroup {
  const n = -daysAgo(due, now);
  if (n < 0) return 'overdue';
  if (n === 0) return 'today';
  if (n <= 7) return 'week';
  return 'later';
}
