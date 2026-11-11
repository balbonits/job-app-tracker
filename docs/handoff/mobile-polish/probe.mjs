import { chromium } from 'playwright-core';
const base = 'http://127.0.0.1:4291/ux/job-tracker/#/';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
for (const w of [320, 375, 600, 959]) for (const scheme of ['light', 'dark']) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 }, colorScheme: scheme, deviceScaleFactor: 2 });
  const p = await ctx.newPage(); await p.goto(base, { waitUntil: 'networkidle' }); await p.waitForTimeout(500);
  const m = await p.evaluate(() => { const l = document.querySelector('.em-tablist'); if (!l) return null; const lr = l.getBoundingClientRect();
    const cs = (sel) => getComputedStyle(document.querySelector(sel));
    return { list: [lr.left, lr.right, lr.height, l.scrollWidth, l.clientWidth], tabs: [...l.children].map((t) => [t.textContent, Math.round(t.getBoundingClientRect().left), Math.round(t.getBoundingClientRect().right), Math.round(t.getBoundingClientRect().height)]),
      act: (() => { const a = document.querySelector('.jt-card-actions .em-btn'); if (!a) return null; const r = a.getBoundingClientRect(); const s = getComputedStyle(a); return [a.textContent, r.width, r.height, s.borderColor, s.backgroundColor, s.color]; })(),
      bg: getComputedStyle(document.body).backgroundColor, main: cs('.jt-main').backgroundColor };
  });
  console.log(w, scheme, JSON.stringify(m));
  if (w <= 375) await p.screenshot({ path: `/tmp/tr/now-${w}-${scheme}.png`, clip: { x: 0, y: 0, width: w, height: 560 } });
  await ctx.close();
}
await b.close();
