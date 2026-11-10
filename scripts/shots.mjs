// Milestone screenshots for PROGRESS.md. Usage: node scripts/shots.mjs <milestone> [baseUrl]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const [milestone = 'prototype', baseArg] = process.argv.slice(2);
const base = (baseArg || 'http://127.0.0.1:4174/ux/job-tracker/').replace(/\/?$/, '/');
const day = new Date().toLocaleDateString('en-CA');
const out = fileURLToPath(new URL('../docs/screenshots/', import.meta.url));
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
async function shot(name, url, { width = 1280, height = 800, scheme = 'light', before } = {}) {
  const ctx = await b.newContext({ viewport: { width, height }, colorScheme: scheme, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(600);
  if (before) await before(p);
  await p.screenshot({ path: `${out}${day}-${milestone}-${name}.png`, fullPage: true });
  await ctx.close();
}
if (milestone === 'wireframe') {
  await shot('wireframes', new URL('../docs/wireframes/wireframes.html', import.meta.url).href, { width: 1640 });
} else {
  await shot('board-desktop', base + '#/');
  await shot('board-mobile-dark', base + '#/', { width: 390, height: 844, scheme: 'dark' });
  await shot('role-detail', base + '#/role/r1');
  await shot('add-role-errors-mobile', base + '#/', { width: 390, height: 844, before: async (p) => { await p.getByRole('button', { name: 'Add role' }).first().click(); await p.getByRole('button', { name: 'Save role' }).click(); } });
  await shot('reminders', base + '#/reminders');
  await shot('empty-board', base + '?state=empty#/');
  await shot('error-banner-mobile', base + '?state=error#/', { width: 390, height: 844 });
}
await b.close();
console.log('saved', milestone);
