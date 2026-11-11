import { chromium } from 'playwright-core';
import { writeFileSync, mkdirSync } from 'node:fs';
import { inject } from './proto.mjs';
const base = 'http://127.0.0.1:4291/ux/job-tracker/#/'; const out = '/tmp/tr/shots'; mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' }); const meta = {};
const probe = (p) => p.evaluate(() => { const l = document.querySelector('.em-tablist'), w = l.parentElement; const r = (e) => { const q = e.getBoundingClientRect(); return [+q.left.toFixed(1), +q.top.toFixed(1), +q.width.toFixed(1), +q.height.toFixed(1)]; };
  const cues = [...w.querySelectorAll('.jt-cue')].map((c) => ({ cls: c.className, op: getComputedStyle(c).opacity, rect: r(c), color: getComputedStyle(c).color, bg: getComputedStyle(c).backgroundColor, hidden: c.getAttribute('aria-hidden') }));
  const sel = l.querySelector('[aria-selected="true"]'); const btn = document.querySelector('.jt-card-actions .em-btn'); const bs = getComputedStyle(btn);
  return { scroll: [l.scrollLeft, l.scrollWidth, l.clientWidth], cues, sel: [sel.textContent, ...r(sel)], list: r(l), btn: { rect: r(btn), border: bs.borderColor, bg: bs.backgroundColor, color: bs.color, outline: `${bs.outlineStyle} ${bs.outlineWidth} ${bs.outlineColor}`, exp: btn.getAttribute('aria-expanded') } }; });
for (const w of [320, 375]) for (const scheme of ['light', 'dark']) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 }, colorScheme: scheme, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  const p = await ctx.newPage(); await p.goto(base, { waitUntil: 'networkidle' }); await p.waitForTimeout(400); await inject(p);
  const snap = async (name, clipH = 380) => { meta[`${w}-${scheme}-${name}`] = await probe(p); await p.screenshot({ path: `${out}/${w}-${scheme}-${name}.png`, clip: { x: 0, y: 150, width: w, height: clipH } }); };
  await snap('start');
  // keyboard: focus the selected tab, ArrowRight x2 (Interviewing), the list scrolls only as needed
  await p.locator('[role=tab][aria-selected=true]').focus(); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(150); await snap('middle-kbd');
  await p.keyboard.press('End'); await p.waitForTimeout(150); await snap('end-kbd');
  await p.keyboard.press('Home'); await p.waitForTimeout(150);
  // Actions button states on the Saved card
  const btn = p.locator('.jt-card-actions .em-btn').first();
  await p.evaluate(() => document.activeElement.blur()); await btn.hover(); await snap('actions-hover');
  await p.mouse.move(1, 1); await btn.focus(); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab'); await snap('actions-focus');
  await p.keyboard.press('Enter'); await p.waitForTimeout(150); await p.mouse.move(1, 1); await snap('actions-expanded', 440);
  await ctx.close();
}
writeFileSync(`${out}/meta.json`, JSON.stringify(meta, null, 1)); await b.close(); console.log('ok');
