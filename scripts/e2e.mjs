// R-5 e2e: a hash-route change behaves like a page change (title, focus on the H1, scroll), and Back restores scroll.
// Usage: node scripts/e2e.mjs [baseUrl]   (default http://127.0.0.1:4174/ux/job-tracker/)
import { chromium } from 'playwright-core';

const base = process.argv[2] ?? 'http://127.0.0.1:4174/ux/job-tracker/';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome' });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 320 } })).newPage();
const fails = [];
const check = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${msg}`); if (!ok) fails.push(msg); };

await page.goto(base + '#/');
await page.waitForSelector('h1');
check((await page.title()).startsWith('Applications'), `board title: ${await page.title()}`);
await page.evaluate(() => window.scrollTo(0, 200));
await page.waitForTimeout(100);
const saved = await page.evaluate(() => window.scrollY);
check(saved > 0, `board scrolled to ${saved}`);

const link = page.locator('.jt-card-title a:visible').last();
const name = (await link.textContent()).trim();
await link.click();
await page.waitForFunction((n) => document.querySelector('h1')?.textContent?.includes(n), name);
await page.waitForTimeout(100);
check((await page.title()).startsWith(name), `role title: ${await page.title()}`);
check(await page.evaluate(() => document.activeElement?.tagName === 'H1'), 'focus is on the role H1');
check((await page.evaluate(() => window.scrollY)) === 0, 'role view starts at the top');

await page.goBack();
await page.waitForFunction(() => document.title.startsWith('Applications'));
await page.waitForTimeout(150);
check(await page.evaluate(() => document.activeElement?.tagName === 'H1'), 'focus is on the board H1 after Back');
const y = await page.evaluate(() => window.scrollY);
check(Math.abs(y - saved) <= 2, `Back restores scroll (${y} vs ${saved})`);

// Keyboard-only: the skip link is the first Tab stop and keeps the current route; the Add role dialog opens and closes from the keyboard.
await page.goto(base + '#/reminders');
await page.reload();
await page.waitForSelector('h1');
await page.keyboard.press('Tab');
check(await page.evaluate(() => document.activeElement?.textContent === 'Skip to content'), 'first Tab stop is the skip link');
await page.keyboard.press('Enter');
check(await page.evaluate(() => document.activeElement?.id === 'main' && location.hash === '#/reminders'), 'skip link focuses main and keeps the route');
await page.goto(base + '#/');
await page.waitForSelector('h1');
const add = page.getByRole('button', { name: 'Add role' }).first();
await add.focus();
await page.keyboard.press('Enter');
await page.waitForSelector('dialog[open]');
check(await page.evaluate(() => !!document.activeElement?.closest('dialog[open]')), 'focus moves into the Add role dialog');
await page.keyboard.press('Escape');
await page.waitForFunction(() => !document.querySelector('dialog[open]'));
const after = await page.evaluate(() => `${document.activeElement?.tagName}:${document.activeElement?.textContent}`);
check(after === 'BUTTON:Add role', `focus after Esc: ${after}; Esc closes the dialog and focus returns to Add role`);

await browser.close();
process.exit(fails.length ? 1 : 0);
