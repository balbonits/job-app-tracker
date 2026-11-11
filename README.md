# Job application tracker (prototype)

A clickable prototype of a job application tracker, built as a UX case study by John Dilig with the [Ember UI](https://github.com/balbonits/a11y-design-system) design system.

- **Live prototype:** https://jdilig.me/ux/job-tracker/
- **Case study:** https://jdilig.me/ux/job-tracker/case-study
- **Design docs:** [docs/UX.md](docs/UX.md) (personas, journey map, IA, wireframes, states)
- **Devlog:** [PROGRESS.md](PROGRESS.md)
- **Accessibility Conformance Report:** [docs/ACR.md](docs/ACR.md) (VPAT 2.5, 508 edition, self-assessed)

All companies in the demo data are fictional. Data lives only in your browser's localStorage: there's no backend and no login.

## What it does

- Board with Saved, Applied, Interviewing, Offer and Closed. Tabs on mobile, columns on desktop.
- Move a role with "Move to..." from its card or detail page. Nothing is drag-only.
- Role detail with Overview, autosaving Notes, and a stage Timeline.
- Reminders grouped Overdue, Today and This week, with Mark done (and Undo) and Snooze 3 days. Moving a role to Applied, Interviewing or Offer adds a follow-up reminder.
- Settings: export JSON, reset demo data, preview the empty, loading and error states, and clear data with a confirm step.

## Accessibility

Built with Ember UI (installed from the tag `v0.2.2`) components (Button, Input, Select, Checkbox, Modal, Tabs, Toast). Full keyboard use. A route change updates the title, moves focus to the page heading and resets scroll, and Back restores it. Toasts use live regions. Targets aim for 44px, and all meet WCAG 2.5.8 (24px).

- `npm run test:a11y` runs axe on every screen and state at 1280, 900, 414, 375 and 320 px in light and dark mode. It fails on any serious or critical issue, any horizontal overflow, or any control whose rendered box is under 44 px. It measures each control's rendered box, so it doesn't detect a hit area clipped by an ancestor's overflow: the Ember v0.2.2 stage and role tabs clip to 43px until the Ember tab patch lands (tracked as TRACKER-EMBER-BUMP).
- `npm run test:e2e` runs the keyboard-only and route-change checks.

CI runs both on every push.

## Develop

```sh
npm install
npm run dev        # http://localhost:5173/ux/job-tracker/
npm run typecheck && npm run lint && npm test
npm run build && npm run preview
npm run test:a11y  # against a served build; pass a base URL to test another host
npm run test:e2e   # same
```

The app builds with base `/ux/job-tracker/` and ships as a static folder inside [jdilig.me](https://jdilig.me), which copies `dist/` in with its sync script. Routing uses the URL hash, so no server rewrites are needed.

## License

MIT
