import { useEffect, useState } from 'react';

export type Route = { name: 'board' } | { name: 'role'; id: string } | { name: 'reminders' } | { name: 'settings' };

export function parse(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/';
  const m = path.match(/^\/role\/([\w-]+)$/);
  if (m) return { name: 'role', id: m[1] };
  if (path === '/reminders') return { name: 'reminders' };
  if (path === '/settings') return { name: 'settings' };
  return { name: 'board' };
}

export const href = {
  board: '#/',
  role: (id: string) => `#/role/${id}`,
  reminders: '#/reminders',
  settings: '#/settings',
};

/** Hash routing keeps the prototype a plain static folder under /ux/job-tracker/ with no server rewrites. */
export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(window.location.hash));
  useEffect(() => {
    // Route changes behave like page changes (R-5): new views start at the top, Back restores the saved position.
    const stack: { hash: string; y: number }[] = [{ hash: window.location.hash, y: 0 }];
    const on = () => {
      const hash = window.location.hash;
      stack[stack.length - 1].y = lastY;
      const back = stack.length > 1 && stack[stack.length - 2].hash === hash;
      let y = 0;
      if (back) { stack.pop(); y = stack[stack.length - 1].y; } else stack.push({ hash, y: 0 });
      setRoute(parse(hash));
      requestAnimationFrame(() => window.scrollTo(0, y));
    };
    let lastY = window.scrollY;
    const onScroll = () => { lastY = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('hashchange', on);
    return () => { window.removeEventListener('hashchange', on); window.removeEventListener('scroll', onScroll); };
  }, []);
  return route;
}
