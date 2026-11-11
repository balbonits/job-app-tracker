# PROGRESS: job application tracker

Dated devlog for UX Project 2. The case study's process section is written from this record.

## 2026-11-10: Spec and design
- Design spec v1.0 from Chief of Creatives: two personas (labeled Assumption), Maya's journey map, IA, text wireframes for Board, Role detail, Add role and Reminders, and required empty, loading and error states. Written up in [docs/UX.md](docs/UX.md).
- Wireframe milestone: the text wireframes rendered as low-fi frames.

![Wireframes](docs/screenshots/2026-11-10-wireframe-wireframes.png)

## 2026-11-10: Ember UI gap found and fixed upstream
- Reminders needs "Reminder done" with **Undo**, and Ember UI's Toast had no action button. Added an optional `action` to Toast in [a11y-design-system](https://github.com/balbonits/a11y-design-system) (merge caa2f11), with a unit test and a Storybook story, instead of building a one-off toast here.

## 2026-11-10: Prototype
- Vite + React 19 + TypeScript app that used Ember UI straight from its repo at first (pinned to caa2f11, later the v0.2.x tags). Data in localStorage with fictional seed roles. Hash routing so it ships as a static folder at jdilig.me/ux/job-tracker/.
- Board: tabs below 960px, five columns above, Closed collapsed. Cards move with "Move to..." in an Actions menu. Moving to Applied, Interviewing or Offer adds a follow-up reminder (the journey map's "reminders triggered by stage").
- Role detail with Overview, autosaving Notes ("Saved" status in a live region) and Timeline. Add and Edit share one modal form with inline errors; focus goes to the first invalid field.
- Reminders grouped Overdue, Today, This week and Later, with Mark done plus Undo and Snooze 3 days. Settings has export, reset demo, state previews, and clear with confirm.
- States: empty, static skeleton loading (no shimmer), and a "Can't save" alert banner with Export, on every screen. Preview with `?state=empty|loading|error`.
- Checks: 15 unit tests pass. axe sweep of 17 screens and states x 1280/320 x light/dark = 68 runs, 0 serious or critical, no horizontal overflow. First run flagged one contrast issue (the preview-state link on the muted note bar in light mode), fixed by using body text color there.

| Board, desktop | Board, mobile dark | Add role errors |
|---|---|---|
| ![](docs/screenshots/2026-11-10-prototype-board-desktop.png) | ![](docs/screenshots/2026-11-10-prototype-board-mobile-dark.png) | ![](docs/screenshots/2026-11-10-prototype-add-role-errors-mobile.png) |

| Role detail | Reminders | Empty | Can't save |
|---|---|---|---|
| ![](docs/screenshots/2026-11-10-prototype-role-detail.png) | ![](docs/screenshots/2026-11-10-prototype-reminders.png) | ![](docs/screenshots/2026-11-10-prototype-empty-board.png) | ![](docs/screenshots/2026-11-10-prototype-error-banner-mobile.png) |

## 2026-11-10: Architecture review, mobile-first and keyboard pass
- Chief Architect's review asked for these, and all are done:
  - **R-1:** Ember UI now comes in as a built package from the tag `github:balbonits/a11y-design-system#v0.2.1`, with no alias into its source.
  - **R-5:** route changes act like page changes. The title updates, focus moves to the H1, a new view starts at the top, and Back restores the scroll position.
  - **R-8:** CI, an ACR and a secret scan.
- Mobile-first: all buttons use the 44px default size. Standalone links, the Closed toggle and the brand link are 44px tall. Ember UI's modal close button went from 36px to 44px upstream (v0.2.0).
- The keyboard-only e2e (`scripts/e2e.mjs`) found two real bugs:
  - The skip link went to `#main`, which the hash router read as "go to the board". It now moves focus to main without touching the route.
  - Closing the Add or Edit role dialog with Esc dropped focus to the page body, because the app unmounts the dialog. Fixed upstream in Ember UI v0.2.1 with a regression test.
- Heading order: each board stage panel now has an H2. A favicon was added.
- Checks:
  - 15 unit tests pass.
  - The e2e has 11 checks and all pass.
  - The axe sweep is now 17 screens and states x 1280, 900, 414, 375 and 320 x light and dark = 170 runs. It found 0 violations, 0 horizontal overflow and 0 controls under 44x44px.
  - Local Lighthouse scores 100 for accessibility, best practices and performance.
- [Accessibility Conformance Report](docs/ACR.md) (VPAT 2.5, 508 edition, self-assessed). It says plainly that no screen-reader pass has been done yet.
- CI on GitHub Actions runs typecheck, lint, unit tests, build, the axe sweep and the e2e on every push and PR.

## 2026-11-10 2:45 PM PT: Live on jdilig.me (v0.1.0)

- Live at https://www.jdilig.me/ux/job-tracker/, with the case study at https://www.jdilig.me/ux/job-tracker/case-study (jdilig-me-v3 merge e8f285a). The site serves the exact tag build; BUILD.json reports v0.1.0 at c449ac8.
- Live checks: axe ran 170 times (17 screens and states, at 1280, 900, 414, 375 and 320, light and dark) with 0 serious or critical issues, no page-level overflow and every target at least 44px. The keyboard e2e passes (skip link, dialog focus, focus return after Esc).
- Final screenshots are in docs/screenshots/ with the 2026-11-10-final prefix.
- Still to come: this build uses Ember UI v0.2.1. It gets retrofitted onto v0.3.0 once the theme (R-2) and motion (R-3) work lands, along with the B-1 and B-2 fixes. The screen-reader pass (Orca on Linux) and an iPhone VoiceOver follow-up are still open.

## Design log (Chief of Creatives)
_Chief of Creatives adds their entries here._

## 2026-11-10 3:16 PM PT: Ember UI v0.2.2

Bumped ember-ui to v0.2.2 (Architecture review B-1, B-2): small buttons and checkbox rows get 44px hit areas, and the Undo toast now stays until dismissed instead of timing out after 5s (WCAG 2.2.1). Unit 15/15, axe 170 runs 0 failing, e2e pass.

## 2026-11-10 5:45 PM PT: R-8 repo conventions
- Secret scan: gitleaks 8.28.0 over the full history (9 commits, up to 91cd7d1), findings redacted: **no leaks found**.
- CI now runs gitleaks on every push and PR (`.github/workflows/gitleaks.yml`, full history), next to the existing check job (typecheck, lint, test, build, test:a11y, test:e2e).
- Conventions confirmed: README, this PROGRESS.md, MIT LICENSE ("Copyright (c) 2026 John Dilig") and the ACR source at [docs/ACR.md](docs/ACR.md). History is real and unsquashed.

## 2026-11-10 6:36 PM PT: skip link 44px hit area (QA live-gate follow-up)
- The "Skip to content" link was 40px tall. A `::before` now extends its hit area to 44px (2px above and below), the same technique as jdilig.me PR #25. There's no visual change: the link still draws at 136x40, and screenshots of it focused at 320px are pixel-identical before and after.
- Checked: clicks 1.5px above and below the visible box now land on the link (before, they hit the header). Lint, typecheck, unit tests 15/15, axe 170 runs with 0 failing, and the e2e skip-link check passes.

## 2026-11-10 PM PT: skip link no longer covers the brand (TRACKER-BRAND)
- axe flagged target-size on the "Job tracker" brand link while the skip link was focused: the floating skip link (136x40 at 8,8) covered all but an 8px strip of the brand (89x44 at 16,12). No invisible fix exists, because axe counts the focused overlay itself.
- Proposal: while focused, the skip link sits in the page flow above the header instead of floating over it, so the header moves down about 56px only while it has focus. Unfocused pages are pixel-identical to main at 320/375/1280 in light and dark. Signed off by Chief of Creatives with three conditions, all checked in e2e: the shift is instant (no transition), the band behind the link is the page background token, and after activation focus lands on main and the band collapses.

![Skip link focused, dark, 375px](docs/screenshots/2026-11-10-tracker-brand-dark-375.png)
- Checked: axe clean focused and unfocused, skip link 44px hit area at all widths, lint, typecheck, unit 15/15, axe 170 runs 0 failing, e2e pass.

## 2026-11-10: Design: dusk identity (UX/UI Designer)
Dusk is this app's v3 identity on Ember UI, designed in balbonits/a11y-design-system. Times are merge times in PT, from GitHub.
- 5:59 PM PT: first dusk HANDOFF and prototype ([PR #14](https://github.com/balbonits/a11y-design-system/pull/14), `96b1fe2`).
- 6:01 and 6:08 PM PT: Chief of Creatives' scope rulings recorded in the HANDOFF ([PR #18](https://github.com/balbonits/a11y-design-system/pull/18), `983ec14`), then kept in the HANDOFF source ([PR #19](https://github.com/balbonits/a11y-design-system/pull/19), `202b5da`).
- 6:48 PM PT: rework into the job tracker Board, now the default view ([PR #22](https://github.com/balbonits/a11y-design-system/pull/22), `eec5773`).
- Chief Architect signed dusk at `eec5773`, and Visual QA passed it at the same sha.
- 6:55 PM PT: Known issues 5 to 7 RULED by Chief of Creatives: the Move button, Undo then Dismiss on the toast, and reminder chip text owned by Reminders ([PR #24](https://github.com/balbonits/a11y-design-system/pull/24), `f7fbc4a`).
- 7:05 PM PT: Chief Architect's toast conditions, and focus after a delete moves to the next card in the column, or to the column heading when the column is empty ([PR #25](https://github.com/balbonits/a11y-design-system/pull/25), `6be00f5`). Visual QA passed `6be00f5`.
- 7:15 PM PT: the conditions added to the HANDOFF's toast row, with refreshed annotated shots ([PR #26](https://github.com/balbonits/a11y-design-system/pull/26), `748d492`).
- 7:24 PM PT: v3 README entry page for all three directions ([PR #28](https://github.com/balbonits/a11y-design-system/pull/28), `1835b93`).
- Live prototype: [dusk Board](https://raw.githack.com/balbonits/a11y-design-system/main/docs/directions/v3/dusk/index.html). Spec: [dusk HANDOFF](https://github.com/balbonits/a11y-design-system/blob/main/docs/directions/v3/dusk/HANDOFF.md).
- Next: the app build, by Full Stack Developer on `feat/dusk-theme`.

![Dusk Board at 375px, light, annotated](https://raw.githubusercontent.com/balbonits/a11y-design-system/748d492/docs/directions/v3/dusk/handoff/dusk-tracker-375-light-annotated.png)
![Dusk Board at 1440px, dark, annotated](https://raw.githubusercontent.com/balbonits/a11y-design-system/748d492/docs/directions/v3/dusk/handoff/dusk-tracker-1440-dark-annotated.png)

## 2026-11-10 7:11 PM PT: copy review must-fixes F4 to F6

From the UI Copywriter's review (ux-projects/copy/JOB-TRACKER-COPY-REVIEW.md):
- F4: the card age line now reads "Started interviewing 3 days ago" and "Got an offer 2 days ago" (STAGE_VERB in src/screens/Board.tsx), not "Interviewing since 3 days ago" and "Offer 2 days ago".
- F5: the card button is "Move or edit", and its accessible name is "Move or edit {title} at {company}", so the visible text starts the name (2.5.3). docs/UX.md, docs/ACR.md, the unit test and scripts/a11y.mjs are updated to match.
- F6: the clear-data dialog says "1 role" for a single role.
- Commits are authored as John Dilig with an `Author-bot: Full Stack Developer` trailer from here on (CTE ruling).
F1 to F3 are case-study copy on jdilig.me and go in a separate jdilig-me-v3 PR.

## 2026-11-10 11:55 PM PT: TRACKER-README-FIX

- README now says Ember UI is installed from the tag `v0.2.2`, matching package.json (it said `v0.2.1`). Earlier dated entries that name v0.2.1 stay as written.
- ACR 2.5.8 and 302.7 now say the Ember tabs are 43px effective because of an Ember v0.2.2 tablist clip. That was fixed upstream in a11y-design-system #36, and the note is removed when the tracker moves to Ember v0.3 (card TRACKER-EMBER-V03, waiting on a Creatives theme).

## 2026-11-11 1:10 AM PT: FU-TRACKER-ACR-302.7

- ACR 302.7 said 'aim for 44px' twice. It now says it once: "Targets aim for 44px, and all meet WCAG 2.5.8 (24px)", matching README and jdilig.me's copy, followed by the Ember tab note.
- ACR 2.5.8 and 302.7 now end with the same wording as the dashboard's 2.5.8 row: "fixed upstream in a11y-design-system #36, to be removed when the tracker moves to Ember v0.3."
