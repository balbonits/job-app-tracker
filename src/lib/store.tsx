import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { addDays, isoDay } from './dates';
import { seed } from './seed';
import { load, save } from './storage';
import type { Data, Reminder, Role, Stage } from './types';

export type NewRole = { company: string; title: string; link?: string; stage: Stage; remindOn?: string };
export type Status = 'loading' | 'ready';

type Api = {
  data: Data;
  status: Status;
  canSave: boolean;
  addRole: (r: NewRole) => Role;
  updateRole: (id: string, patch: Partial<Pick<Role, 'company' | 'title' | 'link' | 'salary' | 'notes' | 'contacts'>>) => void;
  moveRole: (id: string, stage: Stage) => void;
  deleteRole: (id: string) => Role | undefined;
  restoreRole: (role: Role, reminders: Reminder[]) => void;
  setReminderDone: (id: string, done: boolean) => void;
  snoozeReminder: (id: string, days: number) => void;
  clearAll: () => void;
  resetDemo: () => void;
};

const Ctx = createContext<Api | null>(null);

export function useStore(): Api {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside <StoreProvider>');
  return v;
}

let counter = 0;
const uid = (p: string) => `${p}${Date.now().toString(36)}${(counter++).toString(36)}`;

/** Reminders created by moving a role, per the journey map: follow-ups are triggered by stage. */
const STAGE_REMINDER: Partial<Record<Stage, { text: string; days: number }>> = {
  applied: { text: 'Follow up on the application', days: 7 },
  interviewing: { text: 'Send thank-you note', days: 1 },
  offer: { text: 'Reply to the offer', days: 3 },
};

export type DemoState = 'empty' | 'loading' | 'error' | null;

export function StoreProvider({ children, demo = null, loadDelay = 350 }: { children: ReactNode; demo?: DemoState; loadDelay?: number }) {
  const initial = useMemo(() => {
    if (demo === 'empty') return { data: { version: 1 as const, roles: [], reminders: [] }, ok: true };
    if (demo === 'error') return { data: seed(), ok: false };
    return load();
  }, [demo]);
  const [data, setData] = useState<Data>(initial.data);
  const [canSave, setCanSave] = useState(initial.ok);
  const [status, setStatus] = useState<Status>(loadDelay > 0 || demo === 'loading' ? 'loading' : 'ready');
  const ref = useRef(data);
  /** Every change goes through here: update state, then try to save (demo previews never write). */
  const commit = useCallback((fn: (d: Data) => Data) => {
    const next = fn(ref.current);
    if (next === ref.current) return;
    ref.current = next;
    setData(next);
    if (!demo) setCanSave(save(next));
  }, [demo]);

  useEffect(() => {
    if (demo === 'loading') return;
    if (loadDelay <= 0) return;
    const t = window.setTimeout(() => setStatus('ready'), loadDelay);
    return () => window.clearTimeout(t);
  }, [demo, loadDelay]);

  const addRole = useCallback((r: NewRole) => {
    const now = isoDay();
    const role: Role = {
      id: uid('r'), company: r.company.trim(), title: r.title.trim(), link: r.link?.trim() || undefined,
      stage: r.stage, createdAt: now, updatedAt: now, stageChangedAt: now, notes: '', contacts: '',
      timeline: [{ stage: r.stage, at: now }],
    };
    commit((d) => ({
      ...d,
      roles: [role, ...d.roles],
      reminders: r.remindOn
        ? [...d.reminders, { id: uid('m'), roleId: role.id, text: 'Check on this role', due: r.remindOn, done: false }]
        : d.reminders,
    }));
    return role;
  }, [commit]);

  const updateRole: Api['updateRole'] = useCallback((id, patch) => {
    commit((d) => ({ ...d, roles: d.roles.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: isoDay() } : r)) }));
  }, [commit]);

  const moveRole = useCallback((id: string, stage: Stage) => {
    const now = isoDay();
    commit((d) => {
      const role = d.roles.find((r) => r.id === id);
      if (!role || role.stage === stage) return d;
      const auto = STAGE_REMINDER[stage];
      return {
        ...d,
        roles: d.roles.map((r) => (r.id === id ? { ...r, stage, stageChangedAt: now, updatedAt: now, timeline: [...r.timeline, { stage, at: now }] } : r)),
        reminders: auto ? [...d.reminders, { id: uid('m'), roleId: id, text: auto.text, due: addDays(now, auto.days), done: false }] : d.reminders,
      };
    });
  }, [commit]);

  const deleteRole = useCallback((id: string) => {
    const role = ref.current.roles.find((r) => r.id === id);
    commit((d) => ({ ...d, roles: d.roles.filter((r) => r.id !== id), reminders: d.reminders.filter((m) => m.roleId !== id) }));
    return role;
  }, [commit]);

  const restoreRole = useCallback((role: Role, reminders: Reminder[]) => {
    commit((d) => ({ ...d, roles: [role, ...d.roles], reminders: [...d.reminders, ...reminders] }));
  }, [commit]);

  const setReminderDone = useCallback((id: string, done: boolean) => {
    commit((d) => ({ ...d, reminders: d.reminders.map((m) => (m.id === id ? { ...m, done } : m)) }));
  }, [commit]);

  const snoozeReminder = useCallback((id: string, days: number) => {
    commit((d) => ({ ...d, reminders: d.reminders.map((m) => (m.id === id ? { ...m, due: addDays(m.due < isoDay() ? isoDay() : m.due, days) } : m)) }));
  }, [commit]);

  const clearAll = useCallback(() => commit(() => ({ version: 1, roles: [], reminders: [] })), [commit]);
  const resetDemo = useCallback(() => commit(() => seed()), [commit]);

  const api = useMemo<Api>(() => ({
    data, status, canSave, addRole, updateRole, moveRole, deleteRole, restoreRole, setReminderDone, snoozeReminder, clearAll, resetDemo,
  }), [data, status, canSave, addRole, updateRole, moveRole, deleteRole, restoreRole, setReminderDone, snoozeReminder, clearAll, resetDemo]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
