import { addDays, agoText, dueGroup, isoDay } from './dates';
import { seed } from './seed';
import { KEY, load, save } from './storage';

describe('dates', () => {
  const now = new Date(2026, 10, 10);
  it('adds days across months', () => expect(addDays('2026-11-29', 3)).toBe('2026-12-02'));
  it('describes age', () => {
    expect(agoText('2026-11-10', now)).toBe('today');
    expect(agoText('2026-11-09', now)).toBe('yesterday');
    expect(agoText('2026-11-04', now)).toBe('6 days ago');
  });
  it('groups due dates', () => {
    expect(dueGroup('2026-11-09', now)).toBe('overdue');
    expect(dueGroup('2026-11-10', now)).toBe('today');
    expect(dueGroup('2026-11-15', now)).toBe('week');
    expect(dueGroup('2026-12-01', now)).toBe('later');
  });
});

describe('seed', () => {
  it('has 3 to 5 roles, all marked fictional', () => {
    const d = seed();
    expect(d.roles.length).toBeGreaterThanOrEqual(3);
    expect(d.roles.length).toBeLessThanOrEqual(5);
    for (const r of d.roles) expect(r.company).toMatch(/\(fictional\)$/);
  });
});

describe('storage', () => {
  beforeEach(() => localStorage.clear());
  it('seeds on first load and round-trips', () => {
    const first = load(localStorage);
    expect(first.ok).toBe(true);
    expect(localStorage.getItem(KEY)).toBeTruthy();
    const changed = { ...first.data, roles: first.data.roles.slice(1) };
    expect(save(changed, localStorage)).toBe(true);
    expect(load(localStorage).data.roles).toHaveLength(first.data.roles.length - 1);
  });
  it('reports ok=false when storage throws', () => {
    const broken = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('full'); } } as unknown as Storage;
    expect(load(broken).ok).toBe(false);
    expect(save(seed(), broken)).toBe(false);
  });
  it('uses local calendar days', () => expect(isoDay(new Date(2026, 0, 5))).toBe('2026-01-05'));
});
