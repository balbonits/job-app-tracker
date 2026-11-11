import { chromium } from 'playwright-core';
import { inject } from './proto.mjs';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
for (const [w, s] of [[600, 'light'], [1280, 'light'], [1280, 'dark']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 }, colorScheme: s, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const p = await ctx.newPage(); await p.goto('http://127.0.0.1:4291/ux/job-tracker/#/', { waitUntil: 'networkidle' }); await p.waitForTimeout(400); await inject(p);
  const m = await p.evaluate(() => { const l = document.querySelector('.em-tablist'); return { tabs: !!l, scroll: l ? [l.scrollWidth, l.clientWidth] : null, cues: [...document.querySelectorAll('.jt-cue')].map((c) => getComputedStyle(c).opacity), btns: [...document.querySelectorAll('.jt-card-actions .em-btn')].map((x) => Math.round(x.getBoundingClientRect().height)), sx: document.documentElement.scrollWidth }; });
  console.log(w, s, JSON.stringify(m)); await p.screenshot({ path: `/tmp/tr/handoff/tracker-${w}-${s}-mobile-polish.png`, clip: { x: 0, y: 0, width: w, height: 620 } }); await ctx.close();
}
await b.close();
