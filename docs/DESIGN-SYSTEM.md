# DESIGN-SYSTEM.md — Brand Tokens & UI Rules

**Owner:** Viral Parikh
**Last updated:** 2026-08-08
**Source of truth for:** CuevikSync's design tokens, the rules for using them, and the
accessibility floor every color must clear.

> **The three Tier-1 brand anchors in §1 are the ratified Cueserve logo colors** — Dark Blue
> `#0C385A` and Light Blue `#2384C6`, supplied 2026-08-12; ink is shared, unbranded near-black.
> Everything else in this file — the three-tier architecture, the semantic token names, the
> scales, the dark-mode derivation, and the "compute the contrast, don't eyeball it" rule — is
> settled and is shared structurally with `RedyQuote:docs/DESIGN-SYSTEM.md`.
> Depends on: [PRD.md](PRD.md) **NFR-012** for the WCAG 2.1 AA obligation this file's floor
> implements.
> Implemented in: `src/app/globals.css`, `src/app/layout.tsx`, `src/components/ui/`,
> `eslint.config.mjs`

---

## Contents

- [1. Where the brand values came from](#1-where-the-brand-values-came-from)
- [2. The three tiers](#2-the-three-tiers)
- [3. The one rule: semantic tokens only](#3-the-one-rule-semantic-tokens-only)
- [4. Accessibility floor](#4-accessibility-floor)
- [5. Dark mode is derived, not designed](#5-dark-mode-is-derived-not-designed)
- [6. Decisions worth not re-litigating](#6-decisions-worth-not-re-litigating)
- [7. The editable-vs-calculated convention](#7-the-editable-vs-calculated-convention)
- [8. Typography](#8-typography)
- [9. Scales](#9-scales)
- [10. Chart series](#10-chart-series)
- [11. Voice](#11-voice)
- [12. Token map — design system → CuevikSync](#12-token-map-design-system-cueviksync)
- [13. Adding a component](#13-adding-a-component)

## 1. Where the brand values came from

**Ratified.** CuevikSync's brand is the Cueserve logo, supplied 2026-08-12: Dark Blue and Light
Blue, two shades of one hue rather than the red/blue hue-split RedyQuote's palette uses.

| Anchor                 | Value     | Contrast                | Note                                                                  |
| ---------------------- | --------- | ----------------------- | --------------------------------------------------------------------- |
| Primary — `--clay-600` | `#0C385A` | 12.15:1 white-on-fill   | Dark Blue, literal logo hex. OKLCH hue 246.7°.                        |
| Ink — `--stone-900`    | `#1A1A1A` | 16.67:1 on the canvas   | A neutral near-black, shared with RedyQuote. Not a brand-owned value. |
| Accent — `--moss-600`  | `#2384C6` | 4.76:1 dark-ink-on-fill | Light Blue, literal logo hex. OKLCH hue 244.2°.                       |

**The two anchors are 2.5° apart — the same hue family, not a deliberate hue-split.** Every prior
cut of this palette (provisional teal/amber, then teal/violet) picked a _second_ hue specifically
to separate from the first, following RedyQuote's red/blue precedent. That does not apply here:
Cueserve's brand is genuinely monochromatic, so Primary and Accent are distinguished by
**lightness**, not hue. One real consequence follows from this — see the
`--accent-secondary-foreground` note in §4.

**Both hexes are load-bearing exactly as given — do not touch `--clay-600` or `--moss-600`.**
Every other step in both ramps is derived around them.

**Why the ramps had to be re-derived, not reused.** The earlier provisional palette copied
RedyQuote's per-step lightness values outright and substituted hue — valid there because the
provisional anchors happened to sit near RedyQuote's own "600" lightness. Cueserve's Dark Blue
does not: its lightness (L .331) sits well below RedyQuote's original "600" position (L .489).
Forcing it into that slot while keeping RedyQuote's other step values fixed would have put step
600 _darker_ than step 700, breaking the ramp's required monotonic order. Each ramp is instead
built as two affine segments (50→600, 600→900) that pass through the literal anchor exactly at
600 — the position every tier-2 token actually references — while keeping the same overall shape.
Both ramps were re-verified monotonic in OKLCH lightness after this construction.

| Value                                        | Source                                                                           |
| -------------------------------------------- | -------------------------------------------------------------------------------- |
| Brand anchors (Dark Blue / ink / Light Blue) | Ratified Cueserve logo colors, supplied 2026-08-12. Ink is not brand-owned.      |
| Clay and Moss ramp steps                     | Re-derived around the anchors — see above. Not RedyQuote's lightness values.     |
| Stone ramp                                   | Shared with RedyQuote verbatim — ink-based neutral, no brand content.            |
| Status triads (success/warning/danger/info)  | Shared with RedyQuote verbatim. Their hues are independent of the brand anchors. |
| Archivo + IBM Plex Mono                      | Shared with RedyQuote verbatim.                                                  |
| Radius, type, spacing, shadow scales         | Shared with RedyQuote verbatim.                                                  |
| Editable-vs-calculated field convention      | Shared with RedyQuote verbatim — amber/warning-tinted, not brand-tinted. See §7. |

**What replacing the anchors would cost, if Cueserve's palette ever changes.** Two hex values in
`src/app/globals.css`, a full re-derivation of both ramps (not a simple substitution — see
above), a re-solve of `--clay-450` and `--moss-650` (§5), a re-solve of the chart series
(§10), and this table.
| Editable-vs-calculated field convention | Shared with RedyQuote verbatim â amber/warning-tinted, not brand-tinted. See Â§7. |

**What replacing the anchors would cost, if Cueserve's palette ever changes.** Two hex values in
`src/app/globals.css`, a full re-derivation of both ramps (not a simple substitution â see
above), a re-solve of `--clay-450` and `--moss-650` (Â§5), a re-solve of the chart series
(Â§10), and this table.

## 2. The three tiers

| Tier                   | Where                                         | May components use it?                            |
| ---------------------- | --------------------------------------------- | ------------------------------------------------- |
| 1 — Brand primitives   | `:root` in `globals.css`, **not** in `@theme` | **No.** Tailwind emits no utility for them.       |
| 2 — Semantic tokens    | `@theme inline` in `globals.css`              | **Yes — these are the only color names allowed.** |
| 3 — Component variants | `cva()` in `src/components/ui/`               | Yes.                                              |

Tier 1 being outside `@theme` is deliberate and load-bearing: Tailwind only generates
utilities for `@theme` entries, so `bg-clay-600` **does not exist as a class**. A primitive
cannot be reached from a component even by accident.

**Tier-1 values are written as hex; derived values are written in oklch.** That split is the
provenance marker — hex came from the design source and can be diffed against it; oklch was
solved here by lightness. There are exactly five derived primitives, all forced by contrast
(see §4).

## 3. The one rule: semantic tokens only

Components use `bg-background`, `text-muted-foreground`, `bg-primary`, `border-border`,
`text-success` — never `bg-stone-100`, `text-black`, or `bg-[#82424c]`. Raw palette classes and
hex literals bypass the token layer: they don't flip in dark mode and they don't re-theme when
a brand value changes.

This is **enforced, not documented**, in two layers:

1. Tier-1 primitives generate no utilities (above).
2. `no-restricted-syntax` in `eslint.config.mjs` rejects raw palette classes and hex literals
   in `className` strings and template literals across `src/**/*.tsx`.

Note that the lint rule bans `bg-stone-*` meaning **Tailwind's** warm stone, which is a
different thing from our `--stone-*` ramp. The two never collide: ours is `--stone-500`,
Tailwind's is `--color-stone-500`.

Same philosophy as the RLS approval gate and the `ui/` boundary rule — if it matters, the build
enforces it.

## 4. Accessibility floor

**Text clears WCAG AA (4.5:1) in every role it is used in; boundaries that identify a control
clear the 1.4.11 non-text floor (3:1).** This is a floor, not an aspiration.

The design source's palette is rougher than a hand-picked one: several raw values fail outright
once computed rather than eyeballed. **Five values were re-solved rather than shipped as the
source gives them:**

| Export value                                  | What it's used for              | Measured                                                        | Resolution                                                |
| --------------------------------------------- | ------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------- |
| `--stone-800` (88% ink + black)               | Ramp step between stone-700/900 | L .191 — darker than stone-900's L .218, breaks monotonic order | Re-mixed as 88% ink + 12% white → `#313131`               |
| `--warning-fg #C77700`                        | Pending-Approval ink            | 3.46:1 on white, 3.09 on page — fails as text outright          | Darkened along the same hue to `#9c5400` — 5.70 / 5.09    |
| `--success-light #E3F1E4`                     | Tint behind the success ink     | Ink-on-tint 4.39:1 — misses the floor by a hair                 | Re-mixed lighter (8% ink) → `#eef4ee` (4.59)              |
| `--focus-ring` / `--shadow-focus` (alpha red) | Focus ring                      | Alpha-blended, well under 3:1 on any surface                    | `--ring` is clay-600, solid — 11.64:1 on the canvas       |
| Editable-border "45% into white" formula      | Editable-cell boundary          | ~2:1 on every surface                                           | Uses the unmixed warning ink instead — 5.70 / 5.09 / 4.88 |

**The `--border` vs `--input` split carries forward unchanged** — the design source again gives
one value (`stone-200`) for two incompatible jobs: decorative rules and control boundaries. Only
the second carries a 3:1 floor. So:

- **`--border`** — decorative only. WCAG 1.4.11 exempts purely decorative boundaries, so this
  is `stone-200` **verbatim** (1.48:1 on white — fine, nothing here needs a floor). Card
  outlines, table rules, dividers, and the status/Tag/Badge borders in §7.
- **`--input`** — the boundary that _identifies a control_. Stepped to `stone-600`, which clears
  3:1 on all three light surfaces (5.66 card / 5.05 page / 5.05 muted). Text inputs, selects,
  checkboxes, radios, outline buttons.

This is also exactly shadcn's existing distinction between the two tokens, so it costs nothing
structurally.

Two things kept **verbatim** on purpose, not oversights:

- **Elevation shadows and the modal scrim are ink-tinted** (`rgba(26,26,26,...)`). Ink IS the
  neutral anchor, so the shadow tint and the palette agree.
- **Badge/Tag/StatusPill borders sit well under 3:1** (e.g. `--primary-border` on white is only
  1.92:1). Decorative in the same sense as `--border` above — the tint plus ink text already
  carries the status meaning, the border is a soft edge rather than the thing identifying the
  control — so no floor applies.

**Links are distinguished from surrounding text by weight, not by hue alone — a decision, and a
markedly tighter one than either prior palette.** `--primary-text` on the page canvas measures
11.64:1 and `--foreground` 16.67:1, so both clear AA against the surface independently. Against
_each other_ they measure **1.43:1** — well under the 3:1 that WCAG technique G183 asks for
when a link carries no underline, and noticeably lower than the 2.37:1 the provisional palette
had. This is a direct consequence of §1's monochromatic-brand finding: Dark Blue (`--clay-600`,
the link color) and the near-black ink (`--foreground`) are both very dark, so they differ far
more in hue than in apparent lightness.

G183 is a _sufficient_ technique for 1.4.1, not the only one: the non-color cue here is weight —
links render `font-semibold` against `font-normal` neighbours — plus an underline on hover and a
solid `--ring` on keyboard focus. That defense is unchanged in _kind_, but 1.43:1 is low enough
that it deserves a real look, not just a passing computation: **render a link next to body text
and confirm by eye that weight alone reads clearly**, the first time this ships to a real screen.
If it doesn't, the fix is not a token here — it's deciding whether `--primary-text` should be a
value distinct from `--primary` in light mode (they are currently identical by convention, see
§5), which is a structural change bigger than this file should make silently.

Two consequences, stated so this doesn't get re-litigated per screen:

- **Don't add a local underline to "fix" one table.** `a { no-underline }` in `globals.css` is
  global; a per-surface underline rule makes links look unlike links on the screen beside it.
- **The weight contrast is load-bearing, not decoration.** A link set at the same weight as the
  text around it has no non-color cue left and _does_ fail 1.4.1. If a link has to live
  somewhere that cannot carry `font-semibold`, that link needs an underline there.

### Measured, light

| Pair                                                                     | Ratio                     | Floor            |
| ------------------------------------------------------------------------ | ------------------------- | ---------------- |
| `--foreground` on page / card / muted                                    | 16.67 / 17.40 / 15.55     | 4.5              |
| `--muted-foreground` on page / card / muted                              | 5.42 / 5.66 / 5.05        | 4.5              |
| `--primary-text` (links) on page / card / muted                          | 11.64 / 12.15 / 10.85     | 4.5              |
| `--primary-foreground` on the clay fill                                  | 12.15                     | 4.5              |
| `--accent-secondary-foreground` on the moss fill                         | 4.76                      | 4.5              |
| `--success` / `--warning` / `--destructive` / `--info` on their own tint | 4.59 / 4.88 / 6.45 / 4.98 | 4.5              |
| same four as ink on a card                                               | 5.13 / 5.70 / 7.58 / 5.98 | 4.5              |
| `--input` on page / card / muted                                         | 5.05 / 5.66 / 5.05        | 3.0              |
| `--editable-border` on white / page / own fill                           | 5.70 / 5.09 / 4.88        | 3.0              |
| `--ring` on page / card / muted                                          | 11.64 / 12.15 / 10.85     | 3.0              |
| `--sidebar-ring` on the rail / on hover                                  | 5.63 / 4.21               | 3.0              |
| `--sidebar-foreground` on the rail / on hover                            | 8.03 / 6.00               | 4.5              |
| `--primary-text` vs `--foreground` (link vs adjacent text)               | 1.43                      | none — see above |

`--muted-foreground` is `--stone-600` — an actual ramp step, not a custom-solved hex.

**Every pair above was computed with a throwaway contrast script, not eyeballed.** Re-run the
computation before trusting any figure in this file rather than assuming it still holds — it
has already changed twice (provisional teal/amber, then teal/violet, now the real Cueserve
colors) and every prior version's numbers were wrong for the version that followed it.

## 5. Dark mode is derived, not designed

**The design system is light-only.** Every dark value here was solved and measured; none of it
comes from a design source. Treat it as an implementation of the light system's logic in a dark
band, not as designed output.

Consequences worth knowing:

**Clay splits into two tokens.** No single lightness does both jobs on a dark surface: a fill
dark enough to carry `--primary-foreground` reads too dim as ink, and ink light enough to pass
drops the fill below AA. So `--primary` is the fill and **`--primary-text`** is clay used _as_
ink. In dark mode use `text-primary-text` for links and active nav, never `text-primary`. In
light mode the two are the same value.

**Hover darkens in dark mode too.** Normally a dark theme lightens on hover, but clay-400 as a
_fill_ holds `--primary-foreground` at only 4.11:1 (fails outright) — lightening would break AA
on the exact state the pointer is on. So `--primary-hover` darkens (clay-450 → 500 → 600).
`--primary-text` also needed a lighter step than clay-400: as dark-mode ink it measures only
4.01:1 on the card, below AA. `--clay-300` clears it at 7.42:1.

**Two derived primitives are needed, same count as the provisional palette before this one, for a
different reason each time.** Neither ramp has a step that both carries white text at AA _and_
stays light enough to separate from a dark canvas:

| Value                          | Why it's needed                                                                                                                                                                                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--clay-450` = `#4c6a85`       | `--clay-400` separates from the dark canvas at 4.36:1 but carries white at only 4.11:1 (fails). `--clay-500` carries white at 7.69:1 but separates from the canvas at only 2.33:1 (fails the 3:1 floor). Solved between them: 5.66:1 fill, 3.17:1 canvas. |
| `--moss-650` = `#1d6ca1`       | `--moss-600` separates from the dark canvas at only 2.32:1 (fails outright); `--moss-700` at 2.996:1 — fails by a hair, not a bare pass. Solved between them: 5.66:1 fill, 3.17:1 canvas.                                                                 |
| `--stone-950` / `--stone-1000` | Independent of hue — dark mode still needs `stone-900` (ink) for its _raised_ surface, so canvas and card must sit below the ramp.                                                                                                                        |
| dark status tints              | Status inks are pinned at oklch L 0.720 so the tints sit high enough to be visible against the card; only `--info`'s underlying hue moved with the accent anchor — see §6.                                                                                |

This is the opposite of RedyQuote's outcome, and worth stating as such: its red and blue anchors
happened to have usable ladder steps for the dark-mode fills, so it needed no derived step at
all. Neither the provisional palette's teal/violet nor Cueserve's real Dark Blue/Light Blue does
— verified by recomputation each time, not assumed to carry over.
assumed.

## 6. Decisions worth not re-litigating

**Brand blue is scoped to interaction, never a surface.** Filled primary buttons, links, the
focus ring, and active nav/tab all carry `--primary`; it never fills a large surface or a
page/card background. One filled-primary action per screen — everything else uses
`--accent-secondary` (ink) or a ghost/outline variant. This bounds where the brand color gets
added going forward, not just where the palette started.

**`destructive` is a tint, never a solid fill, and shares no hue with either brand anchor.** A
same-hue destructive would read as "the brand color, slightly off" rather than a different
signal — the reason the provisional palette rejected an amber accent in favor of violet
(194.9°/291°). The real Cueserve anchors (246.7°/244.2°) were not chosen from alternatives —
they are the given logo colors — and happen to sit nowhere near destructive's 37.6° or
warning's 58.8° regardless, so nothing here was ever load-bearing for _this_ palette. It is kept as its own hue anyway, and
deliberately: the rule is "a status color must not share the brand hue", not "a status color
must not share _this_ palette's brand hue" — deleting a constraint because the current values
happen to satisfy it is how it gets violated the next time the values move.

`--destructive` is a **burnt-orange/rust hue** (~38° in OKLCH: `#9b2d00`), sitting between the
brand anchors (~245°, far away) and warning/amber (~59°, its nearest neighbour) — in the
"warm alarm" register (a cool hue like blue or green would read as neutral or positive, a worse
failure than resembling primary). It keeps the tint/ink/border structure unchanged — the fix is
the underlying hue, not the shape. Primary stays unambiguous, and Delete does too.

**Moss lives in `--accent-secondary`, not `--secondary`.** shadcn's `--secondary` is a subtle
_gray surface_, used by imported components as a Progress track and similar; overloading it with
the accent color would turn those blue too. `--secondary` stays stone-100; the moss action pair
is its own token. Moss is Cueserve's Light Blue here, and happens to be blue in RedyQuote too
(hue 244.2° vs. 258.8°) — coincidence, not coordination between the two brands. The
variable name is legacy in both, the same naming quirk this file already carries for
`--stone-*` vs. Tailwind's own "stone" palette (see §3). Renaming it would ripple through
every tier-2 reference in both repos for no functional gain. One consequence worth knowing:
moss's "info" role and the Tag "moss" tone land in the same accent family — see the token map
in §12.

**`--accent` stays neutral.** shadcn uses it for every generic hover, so tinting it clay would
put brand color on every dropdown row. The clay tint is scoped to active nav and to
`--primary-muted`.

**`--muted` / `--secondary` / `--accent` are darker than `--background`.** A recessed surface
lighter than the page canvas reads inside-out. stone-100 recedes correctly on both a white card
and the stone-50 canvas.

**The radius ladder is explicit, not a `calc()` chain.** 6 → 10 → 16 → 22 is not a constant
multiple; forcing it onto one base distorted the middle steps. Don't "simplify" it back.

**`ghost` keeps its borderless variant.** The design system's "ghost" button has a 1px border —
that is this repo's `outline`. A genuinely borderless variant is retained for dense toolbars
and icon rows, which the design system itself needs for `IconButton`.

## 7. The editable-vs-calculated convention

The product-specific pattern from the original export: estimators must tell at a glance what they can
type into versus what the system computes.

**Amber/warning-tinted, not brand-tinted.** A brand tint on every editable cell puts brand
color on ordinary data entry and leaves nothing distinct for actual brand actions. The amber
family gives "editable" its own visual language. Shared verbatim with RedyQuote, and
independent of either repo's brand anchor — which is the point.

- **Editable** — `bg-editable` (the warning tint, `#fbebd6`) + `border-editable-border` (the
  unmixed warning ink, `#9c5400`) + value in `font-mono tabular-nums`.
- **Calculated** — no tint, no border, plain text. `bg-card` if boxed at all.

**The border is what carries the meaning, not the tint.** The tint alone reads at low contrast
against a white card — invisible on its own, same problem the prior clay-tint convention had.
That's why the border uses the unmixed ink rather than the export's own "45%-into-white" border
formula, which measured only ~2:1 on every surface (see §4).

**One overlap worth flagging, not redesigning:** editable cells and the Pending-Approval badge
now share the same warning hue family. They stay structurally distinguishable — a rectangular
input with mono tabular digits vs. a pill with a status label — so this is documented rather
than treated as a conflict to solve.

## 8. Typography

| Token         | Family        | Use                                                                        |
| ------------- | ------------- | -------------------------------------------------------------------------- |
| `--font-sans` | Archivo       | Everything — headings, body, tables, nav                                   |
| `--font-mono` | IBM Plex Mono | Tabular numerics only: costs, SKUs, %, quantities, editable numeric fields |

Both are self-hosted by `next/font/google` — no external request, no layout shift. The design
system's `@import` from `fonts.googleapis.com` is deliberately not used.

**There is no separate heading family.** Archivo is display _and_ body; `h1`–`h4` differ from
body by weight (600) and tracking (`-0.01em`), not by face. `--font-heading` no longer exists —
one grotesk keeps a dense quote table visually quiet.

**Italic Archivo is reserved for rare brand-voice moments, never body copy.**

**Money and quantities use `font-mono tabular-nums`** so figures don't jitter as digits change.
Both are stock Tailwind utilities; there is no custom class for it.

## 9. Scales

**Type** — 12 / 13 / **15 (base)** / 17 / 20 / 24 / 30 / 40 / 52px, denser than Tailwind's
default at every step. `text-md` (17px) has no Tailwind default; defining `--text-md` creates
it. Leading: tight 1.15 / snug 1.35 / **normal 1.55** / relaxed 1.7. Tracking: tight -0.01em /
wide 0.04em.

**Radius** — `rounded-sm` 6px (chips, inputs, tags) · `rounded-md` 10px (buttons, icon buttons,
tables) · `rounded-lg` 16px (cards) · `rounded-xl` 22px (modals, panels) · `rounded-full`
(badges, switches). **Never 0px.** Note that `rounded-lg` is a _card_ radius here, not a button
one — shadcn components pasted in unchanged may need `rounded-md`.

**Spacing** — the design system's 4px scale is already Tailwind's default (`p-2` = 8px, `p-6` =
24px). No tokens added. Density rule: 8–12px inside table cells and toolbars, 24–32px around
page-level sections.

**Motion** — 120–160ms ease-out opacity/fade only, for toasts, tooltips, dialogs, and route
transitions. **No scale or translate on press** — this is a data tool, and motion must never
make a number feel imprecise. The press state darkens a step (`--primary-active`) instead.

**Elevation** — increases with layering (modal > popover > card), never with hover.

**Layout** — left sidebar, a persistent top bar (breadcrumb-style, e.g. "Home / Quotes / New"),
and an independently-scrolling content area. Primary content pattern is either "toolbar + KPI
strip + table" or "form + live-calculated summary panel."

**Supported viewports are set by [PRD.md](PRD.md) NFR-008 — tablet and up (≥768px)**, and that
row is the authority; don't restate the range here, it will drift. What follows from it for the
chrome: there is no phone drawer and no hamburger, and 768px is the narrowest width any layout
below is designed against.

**The rail collapses, it does not resize.** 220px at `xl` (≥1280px) and above; 64px icons-only
below it — `w-16 … xl:w-55` in `src/components/layout/sidebar.tsx`, so **the rail step is
156px**. Two widths, no intermediate step. A fixed 220px would be 29% of a 768px tablet;
collapsing to 64px returns 156px of that to the content area. Below `xl` the wordmark chip is
hidden rather than scaled (it is the only brand asset, and it is illegible at 40px), each item
keeps its label as `sr-only` for its accessible name, and a right-side tooltip carries the
label for sighted users.

**Why `xl` and not `lg`.** A two-width rail always makes the content area shrink at the moment
it expands; the step cannot be removed, only placed. At `lg` it landed badly — 959px of content
at 1023px (1023 − 64), then 804px at 1024px (1024 − 220), so the content area **lost 155px
going one pixel wider**. At `xl` the same step falls at 1280px, where 1060px of content
(1280 − 220) still clears the quotes table with room over.

> **155 vs 156 is not a typo.** 156px is the rail step (220 − 64). 155px is the _content-width
> drop across the breakpoint_, which is the rail step minus the one pixel the viewport gained.
> Quote whichever one you actually mean.

**The rule is not that content width grows monotonically; it is that the narrow side of the
step still fits the widest table.** Check that before moving this breakpoint, and re-check it
if a table gains columns.

**How to check it — the table width is measured, not derivable.** The quotes table
(`src/app/(app)/quotes/_components/QuoteTable.tsx`) has nine auto-width columns and no fixed
widths, so its rendered width depends on content. An earlier revision of this section quoted it
as 787px; that figure came from a render of the **mock fixtures** in `src/lib/mock/` and will
change when real quote data replaces them. Treat it as a measurement to retake, not a constant:
run `npm run dev`, set the viewport to the narrow side of the step, and confirm the table is
not clipped and the page itself does not scroll horizontally (NFR-008).

**Surfaces** — flat color only: no gradients, no photographic imagery, no textures or patterns.

## 10. Chart series

`--chart-1..5` is a **categorical** palette: fixed order, never cycled, color follows the
entity and never its rank. The design system does not specify one, so this is derived here.

| Token       | Hue        | OKLCH hue |
| ----------- | ---------- | --------- |
| `--chart-1` | brand blue | 246.7°    |
| `--chart-2` | rose       | 350°      |
| `--chart-3` | chartreuse | 90°       |
| `--chart-4` | teal       | 190°      |
| `--chart-5` | violet     | 300°      |

**chart-1 nods to the brand hue, same move RedyQuote makes with its own chart-1** (clay/red
there). The other four are placed to avoid three things at once: the brand hue itself, each
other, and the three status hues (destructive 37.6°, warning 58.8°, success 144.2°) — a
series color that reads as a status color, or as the brand's own primary/ring color, is the
failure mode being designed against.

**Re-solved wholesale for this palette, not carried forward from either prior cut.** Both
earlier versions of this section put a chart hue within 10° of that palette's own brand
anchor by coincidence (this palette's would-be chart-4 at the old scheme's 240° sits only
7° from the real brand anchor's 246.7°) — exactly the near-duplicate problem this section
warns against, just uncaught until now. The five hues here are deliberately **out of sequence**
(246.7, 350, 90, 190, 300, not sorted) so the two numerically closest hues in the set are never
adjacent in series order; every consecutive pair is °90° apart.

Every step clears the 3:1 non-text floor on both surfaces, though with less margin than the
brand/status colors — chartreuse and teal sit closer to white's own luminance, which is a
property of those hues, not a computation error:

| Token       | vs. white | vs. page canvas |
| ----------- | --------- | --------------- |
| `--chart-1` | 4.62      | 4.43            |
| `--chart-2` | 5.04      | 4.83            |
| `--chart-3` | 3.97      | 3.80            |
| `--chart-4` | 4.01      | 3.85            |
| `--chart-5` | 4.53      | 4.34            |

Status colors are reserved and are never reused as a series color. A 6th series is not a
generated hue — fold it into "Other", facet it, or use small multiples.

## 11. Voice

From the original brand-voice export, and it constrains copy in components:

- **Title Case for top-level labels** — primary nav, page headers, tabs, and section headers use Title Case.
- **Sentence case for supporting UI copy** — buttons, table headers, form labels, help text, and status copy stay sentence case. No ALL-CAPS.
- **Buttons are short verb phrases** — "New quote", "Save quote", "Submit for approval".
- **Numbers are the content, not the pitch.** Money, percentages, and counts are primary;
  copy labels a number, it doesn't sell it.
- **Warnings are factual**, never alarmist: "Margin floor: 20.0% — this quote is 3.2 points
  below it." No exclamation points. State the fact, never a consequence the system does not
  enforce — the margin-floor flag is advisory and save/submit remain allowed (PRD-016), and
  every quote routes for approval regardless of margin (PRD-010).
- **Help text is one calm sentence under a control** — never a tooltip standing in for real
  labeling.
- **No emoji in-product**, ever. Icons are Lucide (`lucide-react`), used sparingly — row
  actions, nav, status — never decoratively.
- **Empty and loading states are plain.** "Loading…" — no illustration, no cute copy.

## 12. Token map — design system → CuevikSync

Useful when reading the two documents side by side. CuevikSync keeps **shadcn's semantic names**
so imported shadcn components work untouched; only the values changed. RedyQuote's copy of this
table is identical in structure — the mapping is a property of the system, not the palette.

| Design system                                | CuevikSync                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `--bg-page`                                  | `--background`                                                                            |
| `--bg-surface`                               | `--card` / `--popover`                                                                    |
| `--bg-surface-sunken` / `--bg-surface-inset` | `--muted` (also `--secondary`, `--accent`)                                                |
| `--text-primary`                             | `--foreground`                                                                            |
| `--text-secondary` / `--text-tertiary`       | `--muted-foreground` (collapsed to one; 4.56:1 on muted)                                  |
| `--text-on-accent`                           | `--primary-foreground`                                                                    |
| `--text-link` / `--text-link-hover`          | `--primary-text` / `--primary-hover`                                                      |
| `--accent-primary` / `-hover` / `-active`    | `--primary` / `--primary-hover` / `--primary-active`                                      |
| `--accent-secondary` / `-hover`              | `--accent-secondary` / `--accent-secondary-hover`                                         |
| `--border-default`                           | `--border` (decorative) — **split**, see §4                                               |
| `--border-strong`                            | `--input` (control boundaries) — **split**                                                |
| `--focus-ring` / `--shadow-focus`            | `--ring` (solid, `ring-3`)                                                                |
| `--editable-field-bg` / `-border`            | `--editable` / `--editable-border`                                                        |
| `--success-bg` / `-fg` / `-border`           | `--success-muted` / `--success` / `--success-border`                                      |
| `--danger-*`                                 | `--destructive-*` — **different hue than brand red**, see §6                              |
| Tag tone "clay"                              | `--primary-muted` / `--primary-border`                                                    |
| Tag tone "moss"                              | `--info` / `--info-muted` — converges with the info status color now both are accent-blue |
| StatusPill                                   | `Badge` — folded in, no separate component; see §13                                       |
| IconButton                                   | `Button` (`icon` / `icon-sm` / `icon-lg` sizes) — folded in, see §13                      |
| `--container-max`                            | `--container-max` (unchanged)                                                             |

## 13. Adding a component

1. Check [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md) §2 for where it goes.
2. Define variants with `cva()` — see `src/components/ui/button.tsx` and `badge.tsx`.
3. Use semantic tokens only. Lint will reject anything else.
4. Anything in `src/components/ui/` must stay **app-agnostic** — it is the future shared
   Cuevik library, and the boundary is enforced in `eslint.config.mjs`. `badge.tsx` knows
   about `success` / `warning` / `info`, not about a specific pipeline stage. App-specific mappings
   live in `src/components/`.
5. If you add a color, compute its contrast in both modes before committing (§4).
6. Three components from the original component inventory are folded into existing shadcn
   primitives, not built separately — the mapping is already decided, don't rebuild them:
   - **StatusPill → `Badge`** — same tint/ink/border shape, same pill radius.
   - **Tag → `Badge`** — the "clay" tone is `Badge`'s `default` variant; the "moss" tone
     converges with `info` now both are accent-blue.
   - **IconButton → `Button`**'s `icon`/`icon-sm`/`icon-lg` sizes, borderless ghost
     variant included.
     The remaining components (Card, Input, Select, Checkbox, Radio, Switch, DataTable, KpiStat,
     Dialog, Toast, Tooltip, EmptyState, Tabs, Sidebar, Topbar) are built as new files under
     `src/components/ui/` (Sidebar/Topbar under `src/components/layout/` instead — see
     [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md)), translated to `cva()` + semantic tokens with no
     inline styles or CDN dependencies.
