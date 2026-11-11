// Prototype of FU-TRACKER-MOBILE-POLISH injected into the built app (no app code changed), for probes and shots.
import { chromium } from 'playwright-core';
import { writeFileSync } from 'node:fs';
export const CSS = `
.jt-stagetabs { position: relative; }
.jt-stagetabs .em-tablist { scroll-padding-inline: 40px; }
.jt-stagetabs .em-tab:focus-visible { outline-offset: -4px; } /* inset ring: the scrolling list clips anything outside a tab */
.jt-cue { position: absolute; top: 0; height: 43px; width: 32px; display: grid; place-items: center; background: var(--color-bg); color: var(--text-muted); pointer-events: none; opacity: 0; transition: opacity var(--duration-fast) var(--ease-standard); }
.jt-cue svg { width: 16px; height: 16px; }
.jt-cue--start { inset-inline-start: 0; border-inline-end: 1px solid var(--border-subtle); }
.jt-cue--end { inset-inline-end: 0; border-inline-start: 1px solid var(--border-subtle); }
.jt-stagetabs[data-more-start] .jt-cue--start, .jt-stagetabs[data-more-end] .jt-cue--end { opacity: 1; }
.jt-card-actions .em-btn .jt-chev { width: 16px; height: 16px; transition: transform var(--duration-fast) var(--ease-standard); }
.jt-card-actions .em-btn[aria-expanded="true"] { background: var(--accent-soft); }
.jt-card-actions .em-btn[aria-expanded="true"] .jt-chev { transform: rotate(180deg); }
@media (prefers-reduced-motion: reduce) { .jt-cue, .jt-card-actions .em-btn .jt-chev { transition: none; } }
@media (forced-colors: active) { .jt-cue { background: Canvas; color: CanvasText; } }
`;
const CHEV = (d) => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
export async function inject(p) {
  await p.addStyleTag({ content: CSS });
  await p.evaluate(({ L, R, D }) => {
    const list = document.querySelector('.em-tablist');
    if (list) { const wrap = list.parentElement; wrap.classList.add('jt-stagetabs');
      for (const [cls, d] of [['jt-cue jt-cue--start', L], ['jt-cue jt-cue--end', R]]) { const s = document.createElement('span'); s.className = cls; s.setAttribute('aria-hidden', 'true'); s.innerHTML = d; wrap.insertBefore(s, list.nextSibling); }
      const upd = () => { const max = list.scrollWidth - list.clientWidth; const x = Math.abs(list.scrollLeft);
        wrap.toggleAttribute('data-more-start', max > 1 && x > 1); wrap.toggleAttribute('data-more-end', max > 1 && x < max - 1); };
      list.addEventListener('scroll', upd, { passive: true }); const show = (t) => t && t.scrollIntoView({ block: 'nearest', inline: 'nearest' }); list.addEventListener('focusin', (e) => show(e.target.closest('[role=tab]'))); list.addEventListener('click', (e) => show(e.target.closest('[role=tab]'))); show(list.querySelector('[aria-selected=true]')); new ResizeObserver(upd).observe(list); upd(); window.__upd = upd; }
    for (const b of document.querySelectorAll('.jt-card-actions .em-btn')) { b.classList.replace('em-btn--ghost', 'em-btn--secondary'); b.insertAdjacentHTML('beforeend', D.replace('<svg', '<svg class="jt-chev"')); }
  }, { L: CHEV('M10 3 5 8l5 5'), R: CHEV('M6 3l5 5-5 5'), D: CHEV('M3 6l5 5 5-5') });
  await p.waitForTimeout(150);
}
