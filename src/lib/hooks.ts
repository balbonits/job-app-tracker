import { useEffect, useRef, useSyncExternalStore } from 'react';

export function useMediaQuery(q: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(q);
      m.addEventListener('change', cb);
      return () => m.removeEventListener('change', cb);
    },
    () => window.matchMedia(q).matches,
    () => false,
  );
}

/** Sets the tab title and moves focus to the page heading when a screen opens, so screen readers hear the new page. */
export function usePageHeading<T extends HTMLElement>(title: string) {
  const ref = useRef<T>(null);
  useEffect(() => {
    document.title = `${title} · Job tracker prototype · John Dilig`;
    if (document.body.dataset.routed) ref.current?.focus({ preventScroll: true });
    document.body.dataset.routed = '1';
  }, [title]);
  return ref;
}
