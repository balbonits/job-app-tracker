// Probe for Creatives' ring condition: the focused tab's whole focus ring is inside the tablist's clip box and never under
// a shown plate, after every key, at 320/375 light/dark. --before drops the inset rule (Ember's offset 2px) as a control.
// Also CA's forced-colors row for MP-3: the plate stays opaque and the chevron follows currentColor.
import { chromium } from 'playwright-core';
import { inject } from './proto.mjs';
const before = process.argv.includes('--before');
const base = 'http://127.0.0.1:4291/ux/job-tracker/#/';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
let pass = 0, fail = 0; const bad = [];
const ok = (c, m) => { if (c) pass++; else { fail++; bad.push(m); } };
const measure = (p) => p.evaluate(() => {
  const l = document.querySelector('.em-tablist'), t = document.activeElement, cs = getComputedStyle(t), lr = l.getBoundingClientRect(), tr = t.getBoundingClientRect();
  const o = parseFloat(cs.outlineOffset) + parseFloat(cs.outlineWidth);
  const ring = { l: tr.left - o, t: tr.top - o, r: tr.right + o, b: tr.bottom + o };
  const clip = { l: lr.left + l.clientLeft, t: lr.top + l.clientTop, r: lr.left + l.clientLeft + l.clientWidth, b: lr.top + l.clientTop + l.clientHeight };
  const hit = [...document.querySelectorAll('.jt-cue')].filter((c) => getComputedStyle(c).opacity !== '0').filter((c) => { const q = c.getBoundingClientRect(); return q.left < ring.r && q.right > ring.l && q.top < ring.b && q.bottom > ring.t; }).map((c) => c.className);
  return { name: t.textContent, role: t.getAttribute('role'), h: tr.height, style: `${cs.outlineStyle} ${cs.outlineWidth}`, ring, clip, hit, inside: ring.l >= clip.l - 0.5 && ring.r <= clip.r + 0.5 && ring.t >= clip.t - 0.5 && ring.b <= clip.b + 0.5 };
});
for (const w of [320, 375]) for (const scheme of ['light', 'dark']) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 }, colorScheme: scheme, reducedMotion: 'reduce' });
  const p = await ctx.newPage(); await p.goto(base, { waitUntil: 'networkidle' }); await inject(p);
  if (before) await p.addStyleTag({ content: '.jt-stagetabs .em-tab:focus-visible { outline-offset: 2px !important; }' });
  await p.locator('[role=tab][aria-selected=true]').focus();
  // Tab-key entry gives :focus-visible; walk the whole list both ways, then End and Home
  await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab');
  const keys = ['Home', 'ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowLeft', 'ArrowLeft', 'Home', 'End', 'ArrowLeft', 'Home'];
  for (const k of keys) {
    await p.keyboard.press(k); await p.waitForTimeout(60); const m = await measure(p);
    const id = `${w} ${scheme} ${k} -> ${m.name}`;
    ok(m.role === 'tab' && m.h >= 44, `${id}: tab height ${m.h}`);
    ok(m.style === 'solid 2px', `${id}: outline ${m.style}`);
    ok(m.inside, `${id}: ring ${JSON.stringify(m.ring)} outside clip ${JSON.stringify(m.clip)}`);
    ok(m.hit.length === 0, `${id}: ring under plate ${m.hit}`);
  }
  if (!before) {
    await p.emulateMedia({ forcedColors: 'active' }); await p.locator('[role=tab]').first().focus(); await p.keyboard.press('Home'); await p.waitForTimeout(60);
    const fc = await p.evaluate(() => [...document.querySelectorAll('.jt-cue')].map((c) => { const s = getComputedStyle(c), v = c.querySelector('svg'); return { bg: s.backgroundColor, color: s.color, stroke: getComputedStyle(v).stroke, attrStroke: v.getAttribute('stroke'), fill: v.getAttribute('fill') }; }));
    for (const c of fc) {
      ok(!/rgba\(.*, 0\)|transparent/.test(c.bg), `${w} ${scheme} forced-colors plate bg ${c.bg}`);
      ok(c.attrStroke === 'currentColor' && c.stroke === c.color && c.fill === 'none', `${w} ${scheme} forced-colors chevron stroke ${c.stroke} vs color ${c.color}, fill ${c.fill}`);
    }
  }
  await ctx.close();
}
await b.close();
for (const m of bad) console.log('FAIL', m);
console.log(`ring${before ? ' --before' : ''}: ${pass} pass, ${fail} fail`); process.exit(fail ? 1 : 0);
