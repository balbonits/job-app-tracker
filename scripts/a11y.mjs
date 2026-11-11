// Axe + overflow sweep over every screen and state, at 1280 and 320 wide, light and dark.
// Usage: node scripts/a11y.mjs [baseUrl]   (default http://127.0.0.1:4174/ux/job-tracker/)
// Optional: SHOTS=dir to save a screenshot of each run.
import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const base = (process.argv[2] || 'http://127.0.0.1:4174/ux/job-tracker/').replace(/\/?$/, '/');
const axe = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const shots = process.env.SHOTS;
if (shots) mkdirSync(shots, { recursive: true });

const pages = [
  ['board', '#/'], ['role', '#/role/r1'], ['role-missing', '#/role/nope'], ['reminders', '#/reminders'], ['settings', '#/settings'],
  ['board-empty', '?state=empty#/'], ['reminders-empty', '?state=empty#/reminders'],
  ['board-loading', '?state=loading#/'], ['role-loading', '?state=loading#/role/r1'], ['reminders-loading', '?state=loading#/reminders'], ['settings-loading', '?state=loading#/settings'],
  ['board-error', '?state=error#/'], ['role-error', '?state=error#/role/r1'], ['reminders-error', '?state=error#/reminders'], ['settings-error', '?state=error#/settings'],
  ['add-role-modal', '#/', 'add'], ['card-menu', '#/', 'menu'],
];
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
let failing = 0, runs = 0, minor = 0;
for (const width of [1280, 900, 414, 375, 320]) for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 }, colorScheme: scheme, reducedMotion: 'reduce', bypassCSP: true });
  for (const [name, path, action] of pages) {
    const p = await ctx.newPage();
    await p.goto(base + path, { waitUntil: 'networkidle' });
    await p.waitForTimeout(500);
    if (action === 'add') { await p.getByRole('button', { name: 'Add role' }).first().click(); await p.getByRole('button', { name: 'Save role' }).click(); }
    if (action === 'menu') await p.getByRole('button', { name: /^Move or edit / }).first().click();
    await p.waitForTimeout(250);
    await p.addScriptTag({ content: axe });
    const res = await p.evaluate(async () => {
      const r = await axe.run(document, { resultTypes: ['violations'] });
      // Touch targets: every control 44px+ in both directions. Inline links inside a sentence are exempt (WCAG 2.5.8).
      const small = [...document.querySelectorAll('button, select, input:not([type=checkbox]), textarea, [role=tab], summary, a')]
        .filter((el) => !el.closest('p') && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden' && !el.closest('dialog:not([open])'))
        .filter((el) => !(el.classList.contains('jt-skip') && document.activeElement !== el))
        .map((el) => [el, el.getBoundingClientRect()]).filter(([, b]) => b.height < 44 || b.width < 44)
        .map(([el, b]) => `${el.tagName.toLowerCase()}:${(el.textContent || '').trim().slice(0, 20)}:${Math.round(b.width)}x${Math.round(b.height)}`);
      return { v: r.violations.map((x) => ({ id: x.id, impact: x.impact, n: x.nodes.length })), over: document.documentElement.scrollWidth - window.innerWidth, small };
    });
    runs++;
    const bad = res.v.filter((x) => x.impact === 'serious' || x.impact === 'critical');
    minor += res.v.length - bad.length;
    if (bad.length || res.over > 0 || res.small.length) { failing++; console.log('FAIL', width, scheme, name, JSON.stringify(bad), 'overflow', res.over, 'small', res.small.join(' ')); }
    if (shots) await p.screenshot({ path: `${shots}/${name}-${width}-${scheme}.png`, fullPage: true });
    await p.close();
  }
  await ctx.close();
}
await browser.close();
console.log(`axe: ${runs} runs (${pages.length} screens and states x 1280/900/414/375/320 x light/dark), ${failing} failing. Minor/moderate: ${minor}`);
process.exit(failing ? 1 : 0);
