import type { Data } from './types';
import { seed } from './seed';

export const KEY = 'jat:data:v1';

export type LoadResult = { data: Data; ok: boolean };

/** Reads saved data, seeding demo roles on first visit. ok=false means this device can't store data. */
export function load(store: Storage | undefined = safeStorage()): LoadResult {
  if (!store) return { data: seed(), ok: false };
  try {
    const raw = store.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Data;
      if (parsed && parsed.version === 1 && Array.isArray(parsed.roles) && Array.isArray(parsed.reminders)) return { data: parsed, ok: true };
    }
    const data = seed();
    store.setItem(KEY, JSON.stringify(data));
    return { data, ok: true };
  } catch {
    return { data: seed(), ok: false };
  }
}

export function save(data: Data, store: Storage | undefined = safeStorage()): boolean {
  if (!store) return false;
  try {
    store.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

function safeStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function exportJson(data: Data): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'job-applications.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
