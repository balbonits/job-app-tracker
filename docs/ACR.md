# Accessibility Conformance Report: Job tracker prototype

Based on VPAT® 2.5 Rev 508 edition (Section 508). **Self-assessed** by the builder (Full Stack Developer bot for John Dilig). It isn't a third-party audit.

- **Product:** Job application tracker prototype, a UX case study, at https://jdilig.me/ux/job-tracker/
- **Version:** repo `main` (see [PROGRESS.md](../PROGRESS.md) for the build tag)
- **Report date:** 2026-11-10
- **Contact:** https://github.com/balbonits/job-app-tracker/issues
- **Standards:** Revised Section 508 (36 CFR 1194), which incorporates WCAG 2.0 A/AA. This report also covers WCAG 2.2 A/AA.

## Evaluation methods
- **Automated:** axe-core 4.x on 17 screens and states (board, role, reminders, settings, the modal and menu states, and the empty, loading and error states) at 1280, 900, 414, 375 and 320 px, in light and dark: 170 runs with 0 violations at any impact that fail the build. The same script also checks for horizontal overflow and for controls under 44x44 px (`scripts/a11y.mjs`).
- **Keyboard and focus:** scripted keyboard-only flows in Chromium (`scripts/e2e.mjs`). They cover the skip link, focus on the H1 after a route change, the title on every route, scroll restore on Back, and dialog focus in and return on Esc.
- **Lighthouse:** accessibility 100.
- **Screen reader:** **not yet evaluated** with a screen reader. Until a reader pass is recorded in PROGRESS.md (naming the reader, browser and OS), items that depend on announcements, such as 4.1.3, rest on markup and automated checks only.

## Terms
Supports, Partially Supports, Does Not Support, Not Applicable (as defined by VPAT 2.5).

## WCAG 2.x Report (Section 508 Chapter 5, 501.1 and Chapter 6, 602.3)
| Criteria | Level | Conformance | Remarks |
|---|---|---|---|
| 1.1.1 Non-text Content | A | Supports | No content images. Decorative glyphs (✕, arrows) are aria-hidden, and their buttons have text labels. |
| 1.2.1 Audio-only and Video-only (Prerecorded) | A | Not Applicable | No audio or video. |
| 1.2.2 Captions (Prerecorded) | A | Not Applicable | No audio or video. |
| 1.2.3 Audio Description or Media Alternative (Prerecorded) | A | Not Applicable | No audio or video. |
| 1.2.4 Captions (Live) | AA | Not Applicable | No live media. |
| 1.2.5 Audio Description (Prerecorded) | AA | Not Applicable | No video. |
| 1.3.1 Info and Relationships | A | Supports | Uses landmarks (header, nav, main, footer), one H1 per view with H2s for board stages, real lists, a description list for role facts, labelled form fields with programmatic errors, and fieldset/legend for grouped checkboxes. |
| 1.3.2 Meaningful Sequence | A | Supports | DOM order matches visual order at every breakpoint. |
| 1.3.3 Sensory Characteristics | A | Supports | No instructions rely on shape, color, position or sound. |
| 1.3.4 Orientation | AA | Supports | Works in portrait and landscape. |
| 1.3.5 Identify Input Purpose | AA | Not Applicable | No fields collect the user's own personal data. Company and role describe a job posting. Company still has autocomplete="organization". |
| 1.4.1 Use of Color | A | Supports | Stage, due status and errors are shown in text, not only color. |
| 1.4.2 Audio Control | A | Not Applicable | No audio. |
| 1.4.3 Contrast (Minimum) | AA | Supports | axe color-contrast passes in light and dark at 5 widths across 17 screens and states. |
| 1.4.4 Resize Text | AA | Supports | Uses rem-based type. Content reflows at 200% zoom with nothing lost. |
| 1.4.5 Images of Text | AA | Supports | No images of text. |
| 1.4.10 Reflow | AA | Supports | No horizontal page scroll at 320 CSS px, which the automated sweep checks. |
| 1.4.11 Non-text Contrast | AA | Supports | Focus ring, input borders and control boundaries use Ember UI tokens checked at 3:1 or higher. |
| 1.4.12 Text Spacing | AA | Supports | No fixed-height text containers. Text wraps. |
| 1.4.13 Content on Hover or Focus | AA | Supports | No hover or focus pop-ups. The Actions panel is opened by a button and stays until dismissed. |
| 2.1.1 Keyboard | A | Supports | Every function works by keyboard. The scripted keyboard-only flow is in scripts/e2e.mjs. |
| 2.1.2 No Keyboard Trap | A | Supports | The native modal dialog keeps Tab inside while open, and Esc closes it. |
| 2.1.4 Character Key Shortcuts | A | Not Applicable | No single-key shortcuts. |
| 2.2.1 Timing Adjustable | A | Supports | No time limits. Undo toasts stay until dismissed or replaced. |
| 2.2.2 Pause, Stop, Hide | A | Supports | No moving, blinking or auto-updating content. The loading skeleton is static. |
| 2.3.1 Three Flashes or Below Threshold | A | Supports | Nothing flashes. |
| 2.4.1 Bypass Blocks | A | Supports | The first Tab stop is a skip link, which moves focus to main without changing the route. |
| 2.4.2 Page Titled | A | Supports | Each view sets a unique document title on every route change. |
| 2.4.3 Focus Order | A | Supports | On a route change, focus moves to the new view's H1. Dialogs return focus to their opener. |
| 2.4.4 Link Purpose (In Context) | A | Supports | Card links are the role title, and each Actions button names its role. |
| 2.4.5 Multiple Ways | AA | Supports | Roles are reachable from the board and from Reminders. Header navigation is on every view. |
| 2.4.6 Headings and Labels | AA | Supports | Headings and labels are descriptive. |
| 2.4.7 Focus Visible | AA | Supports | A 2px focus ring on every interactive element. |
| 2.4.11 Focus Not Obscured (Minimum) | AA | Supports | No sticky overlays cover focused content. |
| 2.5.1 Pointer Gestures | A | Supports | No multipoint or path gestures. Cards move with a Select, not drag. |
| 2.5.2 Pointer Cancellation | A | Supports | Uses native click activation, which fires on up-event. |
| 2.5.3 Label in Name | A | Supports | Accessible names start with the visible label text. |
| 2.5.4 Motion Actuation | A | Not Applicable | No motion input. |
| 2.5.7 Dragging Movements | AA | Supports | No dragging. Stage changes use Move to. |
| 2.5.8 Target Size (Minimum) | AA | Supports | Standalone controls are at least 44x44 CSS px, which the automated sweep checks. Inline links in sentences are exempt. |
| 3.1.1 Language of Page | A | Supports | lang="en". |
| 3.1.2 Language of Parts | AA | Not Applicable | No other-language passages. |
| 3.2.1 On Focus | A | Supports | Focus causes no context change. |
| 3.2.2 On Input | A | Supports | Move to changes a card's stage when the Select changes, with a toast and Undo. There is no navigation on input. |
| 3.2.3 Consistent Navigation | AA | Supports | The same header nav appears on every view. |
| 3.2.4 Consistent Identification | AA | Supports | The same functions have the same labels everywhere. |
| 3.2.6 Consistent Help | A | Not Applicable | No help mechanism. |
| 3.3.1 Error Identification | A | Supports | Inline errors in text, tied to fields with aria-describedby, plus aria-invalid. |
| 3.3.2 Labels or Instructions | A | Supports | Every field has a visible label. Required fields are marked. |
| 3.3.3 Error Suggestion | AA | Supports | Errors say how to fix them, for example "Enter the company name". |
| 3.3.4 Error Prevention (Legal, Financial, Data) | AA | Supports | Delete and Clear all ask for confirmation. Delete, Mark done and Move also offer Undo. |
| 3.3.7 Redundant Entry | A | Supports | Edit pre-fills saved values. |
| 3.3.8 Accessible Authentication (Minimum) | AA | Not Applicable | No sign-in. |
| 4.1.2 Name, Role, Value | A | Supports | Native controls, plus WAI-ARIA tabs from Ember UI. axe passes. |
| 4.1.3 Status Messages | AA | Supports | Toasts, the notes Saved status and the Can't save banner use live regions or role=alert. |

## Revised Section 508 Chapter 3: Functional Performance Criteria
| Criteria | Conformance | Remarks |
|---|---|---|
| 302.1 Without Vision | Partially Supports | Built with semantic markup, labels and live regions, and checked with axe. Not yet verified with a screen reader. |
| 302.2 With Limited Vision | Supports | Reflows at 320 px and 200% zoom. AA contrast in light and dark. |
| 302.3 Without Perception of Color | Supports | Nothing relies on color alone. |
| 302.4 Without Hearing | Not Applicable | No audio. |
| 302.5 With Limited Hearing | Not Applicable | No audio. |
| 302.6 Without Speech | Not Applicable | No speech input. |
| 302.7 With Limited Manipulation | Supports | Fully keyboard operable, 44 px targets, no drag or timing. |
| 302.8 With Limited Reach and Strength | Supports | Same as 302.7. |
| 302.9 With Limited Language, Cognitive, and Learning Abilities | Supports | Plain labels, Undo on destructive actions, inline error help. |

## Chapter 4 Hardware, Chapter 6 Support Documentation, Chapter 7 Software
- Chapter 4: Not Applicable (web content).
- Chapter 5 Software and 602 Support Documentation: Not Applicable beyond the WCAG table above. The prototype has no authoring tools and no separate documentation.

## Legal disclaimer
This is a self-assessment of a demo prototype that uses fictional data. It describes the build named above and doesn't promise future conformance.
