# HANDOFF

Dev-ready design specs for the job tracker, one section per card. The builder builds each section as written; CA signs it
before coding. Tokens are Ember UI v0.2.2 (`node_modules/ember-ui/src/tokens.json`), the tracker's own identity; no new tokens.

## FU-TRACKER-MOBILE-POLISH (issue #2)

Source: [issue #2](https://github.com/balbonits/job-app-tracker/issues/2), from Creatives' phone re-check of v0.2.2.
Base: main `adea3fd`. Spec only; nothing under `src/` changes in this PR.

1. **Stage tabs (below 960px):** at 320 and 375 only Saved, Applied and Interviewing show, with nothing telling you Offer
   and Closed are off to the side. Fix: an edge cue that shows while more tabs are hidden on that side.
2. **Card button:** it reads as plain text (Ember `ghost`: transparent, no border). Fix: give it a visible button look
   with a chevron. The issue calls it "Actions"; since #5 (copy review F4-F6) its label is **Move or edit**, and that
   label stays.

### Decision: a solid edge plate with a chevron, not a fade

A fade over the tab labels can't keep their contrast. `--text-muted` faded toward `--color-bg` drops below 4.5:1 once
it's about 25% faded: light 4.69 at 25%, 2.56 at 50%; dark 6.90 at 25%, 3.70 at 50% (worked out from the v0.2.2 tokens).
So the cue is an **opaque plate** in `--color-bg` with a chevron. Labels under it are hidden, not dimmed, and every
visible label keeps its full contrast. The chevron is non-text (1.4.11), and its contrast against the plate is
`--text-muted` on `--color-bg`: light 9.39, dark 11.56.

### Layout per breakpoint

| Width | Board | Stage tabs | Move or edit |
|---|---|---|---|
| 320 | Tabs (`< 960px`, unchanged) | List 288px wide, content 512px: the end cue shows at rest. | Right-aligned in the card, 139x44 |
| 375 | Tabs | List 343px, content 512px: the end cue shows at rest. | Same |
| 600 | Tabs | List 568px ≥ 512px: everything fits, so no cue. The cues follow real overflow, not a breakpoint, so a longer count (for example "Interviewing (12)") brings them back. | Same |
| 1280 | Columns (`≥ 960px`, unchanged); no tabs, so no cue | n/a | Same treatment in each column card, 44px tall |

Fluid rules: the cues are positioned with logical properties (`inset-inline-start` / `-end`), so they work right to
left too. They never take layout space: the tablist keeps its width and the tabs keep their size and padding. There's no
page-level sideways scroll at any width (320 measured: `scrollWidth` = 320).

### Stage tabs: build

In `Board.tsx`, wrap the existing `<Tabs>` in the app's own element and add two cue spans after it. Ember's `Tabs` is
not edited:

```tsx
<div className="jt-stagetabs" ref={cueRef}>
  <Tabs label="Stages" tabs={...} />
  <span className="jt-cue jt-cue--start" aria-hidden="true"><ChevronLeft /></span>
  <span className="jt-cue jt-cue--end" aria-hidden="true"><ChevronRight /></span>
</div>
```

A hook, `useScrollCue(cueRef)`, finds `.em-tablist` inside the wrapper and:
- On `scroll` (passive) and on a `ResizeObserver` of the list, sets `data-more-start` when `max > 1 && |scrollLeft| > 1`
  and `data-more-end` when `max > 1 && |scrollLeft| < max - 1`, where `max = scrollWidth - clientWidth`. `Math.abs`
  handles RTL's negative `scrollLeft`.
- **Keeps the selected tab in view.** On `focusin` and `click` on a `[role=tab]`, and once on mount for the selected
  tab, it calls `tab.scrollIntoView({ block: 'nearest', inline: 'nearest' })`. Measured on main: Ember's `focus()`
  leaves a partly hidden tab where it is (ArrowRight to Interviewing at 320 gave `scrollLeft` 0, with the tab at x
  213..343 in a list ending at 304), so this is needed even without the cue.
- Doesn't touch roles, `tabIndex` or key handling. The tablist pattern stays Ember's: arrows, Home and End move the
  selection, and only the selected tab is in the Tab order.

CSS (`src/app.css`; every value is an existing token):

```css
.jt-stagetabs { position: relative; }
.jt-stagetabs .em-tablist { scroll-padding-inline: 40px; } /* 32px plate + 8px, so scrollIntoView clears the cue */
.jt-cue { position: absolute; top: 0; height: 43px; width: 32px; display: grid; place-items: center;
  background: var(--color-bg); color: var(--text-muted); pointer-events: none; opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-standard); }
.jt-cue svg { width: 16px; height: 16px; }
.jt-cue--start { inset-inline-start: 0; border-inline-end: 1px solid var(--border-subtle); }
.jt-cue--end { inset-inline-end: 0; border-inline-start: 1px solid var(--border-subtle); }
.jt-stagetabs[data-more-start] .jt-cue--start, .jt-stagetabs[data-more-end] .jt-cue--end { opacity: 1; }
@media (prefers-reduced-motion: reduce) { .jt-cue { transition: none; } }
```

- The plate is 43px tall, not 44, so the tablist's 1px bottom border stays visible under it.
- Chevrons: 16x16 SVG, `viewBox="0 0 16 16"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, round caps and
  joins. Paths: left `M10 3 5 8l5 5`, right `M6 3l5 5-5 5`. Both get `aria-hidden="true"` and `focusable="false"`.
- **The cue is decorative and stays silent.** The tablist already exposes every tab to screen readers ("tab, 4 of
  5"), so the cue is `aria-hidden`, isn't focusable, and has `pointer-events: none`. A tap on it goes to the tab
  underneath, which then scrolls fully into view through the click handler. That's not a new target, just the tab's
  own one.

States:

| State | Start cue | End cue |
|---|---|---|
| Nothing overflows (600 today, every width ≥ content) | hidden | hidden |
| Scrolled to the start (rest) | hidden | shown |
| Middle | shown | shown |
| Scrolled to the end | shown | hidden |

Tab states are Ember's and unchanged:
- default `--text-muted`;
- hover `--text` on `--surface-muted`;
- focus-visible 2px `--focus` outline, offset 2px;
- selected `--text` with a 2px `--accent` underline;
- pressed is the same as selected (activation is immediate);
- disabled: not used here (every stage is enabled).

Targets: tabs stay 44px tall (Ember), and the cue adds no target.

### Move or edit: build

In `RoleCard`:
- `variant="ghost"` becomes `variant="secondary"` (Ember's own secondary: `--surface` fill, 1px `--border`).
- Add a trailing chevron-down, `<svg className="jt-chev" ...><path d="M3 6l5 5 5-5"/></svg>`. It uses the same SVG
  attributes as above and is `aria-hidden`.
- The `aria-label` ("Move or edit <title> at <company>"), `aria-expanded` and `aria-controls` stay exactly as they are.

```css
.jt-card-actions .em-btn .jt-chev { width: 16px; height: 16px; transition: transform var(--duration-fast) var(--ease-standard); }
.jt-card-actions .em-btn[aria-expanded="true"] { background: var(--accent-soft); }
.jt-card-actions .em-btn[aria-expanded="true"] .jt-chev { transform: rotate(180deg); }
@media (prefers-reduced-motion: reduce) { .jt-card-actions .em-btn .jt-chev { transition: none; } }
```

States (measured in the prototype; contrast from the v0.2.2 tokens):

| State | Look | Contrast |
|---|---|---|
| Default | `--surface` fill, 1px `--border`, `--text` label, chevron down | border on the card's `--surface`: light 4.91, dark 4.69; label 17.5 / 14.89 |
| Hover | `--surface-muted` fill (Ember) | border on `--surface-muted`: 3.93 / 4.18; label 14.02 / 13.27 |
| Focus-visible | Ember's 2px `--focus` outline, offset 2px | focus on `--surface`: 7.11 / 10.41 |
| Pressed | Ember's `:active` (translateY 1px; none under reduced motion) | as default |
| Expanded (menu open) | `--accent-soft` fill, chevron up | border on `--accent-soft`: 4.10 / 4.68; label 14.63 / 14.86 |
| Disabled | n/a: always enabled. If it ever is disabled, Ember's `opacity .55` and `not-allowed` apply. | n/a |

Target: 139x44 at every width (Ember's 44px `min-height`), right-aligned (`.jt-card-actions`, unchanged).

### Motion

| What | Motion | Reduced motion |
|---|---|---|
| Cue appears or hides | opacity, `--duration-fast` (120ms), `--ease-standard` | instant |
| Chevron flips on open | rotate 180°, same timing | instant |
| scrollIntoView | instant (`behavior` left at its default, `auto`), never smooth | instant |

### Gates the builder adds (in `scripts/e2e.mjs`, run against the built app)

- **MP-1, cue state.** At 320 and 375, light and dark:
  - At rest, the end cue has opacity 1 and the start cue 0.
  - After End, it's the reverse; after ArrowRight x2, both show.
  - At 600 and with no overflow, both are 0. At 1280 there are none.
  - Each cue is `aria-hidden="true"`, has no focusable descendant, and has `pointer-events: none`.
- **MP-2, selected tab in view.** After every ArrowRight, ArrowLeft, Home and End, the selected tab's rect sits inside
  the list's rect, minus 32px on any side whose cue is shown. Negative check: drop the hook's `scrollIntoView`, and
  ArrowRight x2 at 320 must fail.
- **MP-3, cue contrast.** The plate's computed background is opaque (alpha 1) and equals `--color-bg`. The chevron's
  colour equals `--text-muted` and is at least 3:1 against the plate, in light and dark.
- **MP-4, tablist pattern unchanged.** The arrows move the selection, exactly one tab has `tabIndex` 0, and Tab moves
  from the selected tab into the panel. axe shows 0 serious or critical on the board at 320 and 375, light and dark.
- **MP-5, Move or edit.**
  - Border colour equals `--border` and is at least 3:1 against the card's `--surface`.
  - Height at least 44px at 320, 375, 600 and 1280.
  - The chevron is `aria-hidden`, and the accessible name is unchanged ("Move or edit <title> at <company>").
  - `aria-expanded` toggles; expanded has background `--accent-soft`.
  - Focus-visible is a solid 2px outline in `--focus`.
- **MP-6, reduced motion.** Under `prefers-reduced-motion: reduce`, the computed `transition-duration` on `.jt-cue` and
  `.jt-chev` is 0s.
- **MP-7, no sideways scroll.** `scrollWidth <= innerWidth` on the board at 320, 375 and 600, light and dark.
- Existing gates stay green: `npm run test`, `npm run test:a11y` and `npm run test:e2e`.

### Shots (`docs/handoff/mobile-polish/`, lossless 8-bit RGB PNG)

- `tracker-{320,375}-{light,dark}-mobile-polish.png` are at 2x with reduced motion. They have numbered panels: (1) main
  before; (2) at the start; (3) the middle, from the keyboard; (4) the end; (5) Move or edit hovered; (6)
  focus-visible; (7) expanded. A legend underneath gives the measured plate, colours, scroll sizes and the
  selected-tab position.
- `tracker-600-light-*` shows no overflow, so no cue. `tracker-1280-{light,dark}-*` shows the columns, with the button in
  every card.
- Reproduce: `npm run build && npx vite preview --host 127.0.0.1 --port 4291`, then `mkdir -p /tmp/tr/handoff`. Copy
  the four `.mjs` files into a folder inside the repo, so `playwright-core` resolves, and run them there:
  - `node probe.mjs` writes the before shots `/tmp/tr/now-*.png`;
  - `node shoot.mjs` writes `/tmp/tr/shots/` and `meta.json`;
  - `node wide.mjs` writes the 600 and 1280 shots.

  Then `cd /tmp/tr && python3 <repo>/docs/handoff/mobile-polish/compose.py /tmp/tr/handoff`. `proto.mjs` injects this spec's CSS and DOM into the built
  app. It's a reference for the builder, not app code.

### Known issues

- **MP-KI-1.** A label under a plate is cut off at the plate's edge, as in panel 4 ("ewing (1)"). It's hidden, not
  dimmed, so no visible text goes below its contrast; that's the point of the decision above.
- **MP-KI-2.** The cue can't be clicked to scroll; it's decorative by design. Swipe, trackpad, the tab under it, or
  the arrow keys all reach the hidden tabs. If Creatives wants a clickable paddle later, it needs a 44px target, a name
  and a CA ruling on how it fits the tablist pattern.
