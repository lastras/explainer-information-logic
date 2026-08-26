# CLAUDE.md — explainer-no-need-to-know

This file is scoped to **this piece only**. Do not assume
`explainer-less-is-more/CLAUDE.md` (in the sibling directory, or at this
repo's root as `CLAUDE.md` in the public mirror) tells you anything specific
about this one — it doesn't. The two pieces share only a general *pattern*
(single scalar `t`, `CH` chapter table, a synced `LEGEND_CHUNKS` caption
card, an IIFE closure, a few identically-named helpers), not any content,
mechanism, or specific decision. Read that other file only for the general
verification *methodology* section, which does transfer; everything else in
it (the door game, `LEGACY_END`, the 3D tetrahedron, phase-1/phase-2) is
irrelevant here and does not exist in this piece.

## What this piece is

A scroll-scrubbed dramatization of the "No need to know" decoding mechanism
— Figure 2(g)-(h) of the paper. Distinct from `less-is-more/`'s own
mechanism (a short pre-agreed list of candidate kernels making a targeted
query cheap): this piece is about Alice **not knowing what Bob already
knows**, and Bob filtering out same-hash-bin "confounders" using his own
background knowledge (entailment), not color.

Single-file, single-phase, `600vh` scroll track. **Much smaller and simpler
than `less-is-more/script.js`**: 744 lines total, one continuous
scroll-driven sequence, no interactive game, no click-driven state, no 3D,
no `LEGACY_END`-style split (nothing to preserve — this piece has never
been extended past its original scope). If you're arriving here having just
read the `less-is-more` CLAUDE.md, expect this one to be considerably
simpler and don't go looking for analogous machinery that isn't here.

## Repo / remote situation

**Correction, a later session**: the claim below that this directory
"has never actually been committed" in the IBM monorepo was true when
first written but is **stale** -- `git log -- content/explainer-no-need-to-know/`
shows it was tracked shortly after (`a18e7cf Track explainer-no-need-to-know
in this monorepo...`), and has since picked up the same later commits
`less-is-more/` did (mobile text-size/elongation fixes, the closing-card
trim) -- i.e. it's *no longer* uniquely dormant the way the original
paragraph below describes. Left the original paragraph intact underneath
for its own still-useful context (the mirror workflow itself, the "diff
the two copies first" habit); just don't trust its specific "never
committed"/"zero commits since" claims without re-checking `git log`
yourself first, the way this correction just did.

Unlike `less-is-more/` (which has an actively-maintained mirror workflow
between this IBM monorepo and `github.com/lastras/explainer-information-logic`),
**this directory (`content/explainer-no-need-to-know/` in the IBM monorepo)
has never actually been committed here** — `git status` shows it as a fully
untracked `??` directory. It is, however, byte-identical to the copy already
committed and pushed in the public repo, at:

```
/tmp/explainer-information-logic/no-need-to-know/
  (or wherever that repo is checked out -- see less-is-more's own CLAUDE.md
  for the "it may be in /tmp and may not survive a reboot" caveat, same
  applies here)
```

which was committed there in one shot (`aa3476b Add Less is More and No
Need to Know explainers`) and has had **zero commits touching it since** —
i.e. this piece has been completely dormant since that initial add, while
`less-is-more/` went through an entire second phase of active development.

**Before making any change**: diff the two copies first
(`diff -rq content/explainer-no-need-to-know/ /tmp/.../no-need-to-know/`,
or wherever the IBM monorepo is actually checked out — confirmed, this
later session, to be `/Users/lastrasl/github/information-in-logic/`)
to confirm they're still identical. If they've diverged, reconcile before
piling a new change on top of an unknown base.

Deployed at:
**https://lastras.github.io/explainer-information-logic/no-need-to-know/**

No build step. `index.html` + `style.css` + `script.js`, opened directly or
served with `python3 -m http.server`.

## Architecture

Single IIFE closure (`(function () { "use strict"; ... })()`), no imports.

- `CH` — chapter boundaries, all fractions of the *one* `t ∈ [0,1]` (no
  outer/inner split like `less-is-more`'s `tOuter`/`tGame` — there's only
  ever one `t` here, driven directly by `computeT()` off scroll position):

  | `t` | Boundary | What happens |
  |---|---|---|
  | 0 → 0.08 | `statementEnd` | The logic statement alone ("It's raining and cold.") |
  | → 0.22 | `linkEnd` | A link grows from the statement to its kernel |
  | → 0.32 | `collapseEnd` | The kernel set (a blob of `KERNEL_MODEL_POINTS`) collapses into a single seed dot |
  | → 0.48 | `gridEnd` | Pull back to the full 7×9 grid of candidate kernels |
  | → 0.64 | `hashEnd` | Hash to 2 bits — dots snap to one of 4 hues |
  | → 0.74 | `windowEnd` | Bob's window arrives, centered on the seed |
  | → 1.0 | *(unnamed tail)* | Confounder filtering completes; at 0.95 the closing "No need to know" legend chunk arrives and the two-equivalent-sentences reveal (`drawEquivalentStatements`, gated on `smoothstep(0.93, 0.97, t)`) plays |

- **Grid** (`buildGrid()`): logical positions independent of pixel size,
  built once at startup. `COLS_VISIBLE=7`, `ROWS_VISIBLE=9`, plus one extra
  bleed row/column on every side (dots crop at the frame edges rather than
  stopping neatly). `SEED_COL=2`, `SEED_ROW=4` (even/even, so the seed
  lands on hash bin 0 / green).
- **Hash bin = coset, not i.i.d. color** (`hashBinOf(col, row)`): `hash =
  (col mod 2)*2 + (row mod 2)`. This makes every hash bin literally a coset
  of the sublattice `(2Z × 2Z)` inside the grid's index lattice — the
  *actual*, verified reason the real PNAS cover photo shows regular,
  periodic color banding (confirmed once by directly sampling that photo,
  not assumed). **Do not replace this with random-per-dot coloring** — it
  would look superficially similar but silently break the "why does the
  cover photo look like this" fact the piece is quietly built on.
- **Bob's window** (`windowRect(t)` / `WINDOW_HALF_PITCH = 2`): a square
  centered on the seed, half-width exactly 2 grid units. Because the green
  coset repeats every 2 columns/rows, the nearest same-hash-bin confounders
  sit exactly 2 units away orthogonally — so this exact half-width makes
  the window's boundary pass **directly through their centers**, guaranteeing
  partial (never full) capture of every confounder it touches. This is a
  deliberately exact, load-bearing number, not a tuned "looks about right"
  value — don't change it without re-deriving why 2 is the right constant.
- **Two-pass dot rendering** (`renderDots`): pass 1 draws every dot's
  "outside the window" appearance (full brightness pre-window, dimming as
  the window arrives); pass 2 redraws every dot a second time, **clipped to
  the window rect** (`ctx.clip()`), in its brighter "inside the window"
  appearance. This is *why* dots straddling the window's edge appear
  genuinely half-lit/quarter-lit rather than binary in/out — the clip region
  intersecting a dot's circle only partially lights that partial area.
- **Seeded RNG (`mulberry32`, `RNG_SEED = 0x5eed1e55`) drives *only* each
  dot's idle-breathing phase** — never hash-bin color (fully deterministic
  via `hashBinOf`) and never layout (fully deterministic via `col`/`row`).
  This is the one thing this piece keeps a seeded RNG for at all.
- **Deliberately wall-clock-driven idle "breathing"**: every dot's
  radius/alpha gets a small `Math.sin(now * 0.5 + d.phase)` wobble, and
  Bob's window border has its own slow pulse (`Math.sin(now * 0.6)`), both
  using `now = performance.now() / 1000` — **not** derived from `t`. This
  is a **deliberate, different invariant from `less-is-more`**, which
  enforces "nothing animates from wall-clock time, ever" as a hard rule
  (verified there via byte-identical idle-static screenshots). Here, the
  README explicitly documents the opposite choice: "a slow, independently-
  seeded breathing pulse runs on every dot at all times... so the piece
  still feels alive if the user stops scrolling." **If you ever try to
  verify idle-static (byte-identical canvas after a wait) on this piece,
  it will legitimately fail — that's expected here, not a bug.** Don't
  import `less-is-more`'s idle-static check into this piece's verification
  routine without accounting for that.
- **Captions drawn on canvas** (`drawCaptions`): a handful of short
  in-canvas text captions ("one of many candidate kernels", "hashed into
  one of 4 bins" with inline color swatches via `drawHashCaption`, "Bob's
  kernel", the entailment-rule sentence) — each faded in/out over a narrow
  `t` window via `captionAlpha(t, inStart, inEnd, outStart, outEnd)`
  (`outStart`/`outEnd` may be `null` to persist rather than fade out).
- **Finale** (`drawEquivalentStatements`): expands the lone surviving seed
  dot back out into two sentences sharing its kernel — Alice's original
  (top-left, unchanged since the intro) and a logically-equivalent
  reconstruction ("It's cold and raining.", placed east of the kernel, not
  south, so the bottom-docked legend card never occludes it). Reuses
  `drawGrowingLink` for both connecting lines, same primitive as the
  intro's statement→kernel link — deliberately the same visual grammar in
  both directions (collapse at the start, expansion at the end).
- **Legend** (`LEGEND_CHUNKS`, `updateLegend(t)`): 6 chunks, keyed to `CH`
  boundaries plus one extra at `t=0.95` for the closing "No need to know"
  card (there is no separate named `CH` entry for 0.95 — it's a bare
  literal in the `LEGEND_CHUNKS` array itself, not a `CH.something`).

## Things NOT present in this piece (don't go looking for them)

Anyone coming from `less-is-more/`'s own CLAUDE.md should note this piece
has **none** of the following, all of which are central over there:
- No `LEGACY_END` / outer-inner `t` split (only one `t`, one phase, ever).
- No interactive game, no click-driven state, no buttons, no DOM beyond the
  canvas and the legend card.
- No 3D rendering, no drag interaction, no Pointer Events.
- No `GROUPS` codebook, no doors/prize/dud, no win/loss.
- No history of reverted visualization attempts — this piece has had
  essentially one design since its initial commit and has not been
  iterated on since.

## Verification

This piece has **no documented verification history of its own** (unlike
`less-is-more/`, which has an extensive, explicit Puppeteer-screenshot
discipline built up over a long session — see that piece's CLAUDE.md). If
you make changes here, the same general *approach* transfers directly and
should be applied fresh:

1. Serve locally (`python3 -m http.server`) and take real screenshots via
   Puppeteer + a locally-cached Chrome-for-Testing binary, at a few
   viewport sizes (900×700, 390×844, 900×600 at minimum).
2. Forward/backward scroll-scrub check across the whole `[0,1]` range
   (every chapter here is purely `t`-driven, so full reversibility should
   hold everywhere — there is no interactive-state exception the way
   `less-is-more`'s game/tetrahedron sections are exceptions).
3. **Do not** apply an idle-static (byte-identical-after-waiting) check
   without modification — this piece's breathing animation means the canvas
   is *expected* to differ slightly frame-to-frame even with `t` held
   fixed. If you want an idle check here, compare against a *tolerance*
   (e.g. mean pixel diff below some small threshold) rather than exact
   byte-equality, or explicitly skip this check and rely on the
   forward/backward scrub check instead.
4. Full-page console-error/failed-network-request scan across the whole
   scroll range.

No scratch verification scripts from this piece's original build were kept
anywhere discoverable — if you need one, write a fresh one (see
`less-is-more/CLAUDE.md`'s own methodology section for the general
Puppeteer-script pattern; adapt it, don't copy its game/tetrahedron-specific
checks).

## Bugs found and fixed (both already fixed once in `less-is-more/`, ported here)

This piece had been dormant since its initial add (see "Repo / remote
situation" above), so it never received two general fixes `less-is-more/`
picked up during its own later, active-development phase. Both were
reported directly by re-visiting this piece after a long gap, in almost
exactly the same terms `less-is-more/` had originally been reported in —
worth knowing both symptom and fix, since the same root causes could
recur in a *third* piece someday:

- **Label text too small, especially on narrow/mobile viewports.** Every
  in-canvas label/caption size was a flat `pitch * 0.16`, with no floor —
  `pitch = board.bw / COLS_VISIBLE`, so on a narrow viewport (where
  `board.bw` itself shrinks) this came out to single-digit px (measured
  directly: ~8-9px at 390×844 and 360×740, vs. ~12px at 900×700 — none of
  them generous, the narrow ones genuinely illegible). Fixed with a
  `baseFontSize()` helper (`Math.max(pitch * 0.16, LABEL_BASE_MIN_PX)`,
  `LABEL_BASE_MIN_PX = 16`) — the exact same floor value
  `less-is-more/script.js` already uses for the same reason — and routed
  all four call sites (`drawLabel`, `drawHashCaption`, the intro
  statement's own size, `drawEquivalentStatements`'s own size) through it
  instead of the bare `pitch * 0.16` formula directly.
- **The picture visibly stretches ("elongates") while scrolling on
  mobile.** `.pinned`'s CSS height (`100vh`) and `resize()`'s own
  `ch = window.innerHeight` can genuinely diverge *during a scroll* on
  mobile Safari/Chrome, because the browser's address bar shows/hides in
  response to scrolling and `100vh` tracks the browser's *largest*
  possible viewport (address bar hidden) while `window.innerHeight`
  tracks whatever the viewport actually is *right now* — exactly while
  scrolling is happening. When they disagree, the canvas's own CSS box
  (100% of `.pinned`) ends up a different size than the drawing buffer
  `resize()` just computed, and the browser stretches the rendered pixels
  to fit. Fixed the same two-part way `less-is-more/` was: (1) `resize()`
  now sets `pinned.style.height = \`${ch}px\`` explicitly, in pixels,
  from the same `ch` the drawing buffer uses, locking the two together
  regardless of what `100vh` is doing; (2) `frame()` compares
  `window.innerHeight` against its own last-known value on *every* frame
  (not just the `'resize'` event listener), since the address bar's
  show/hide is exactly the case where a delayed or missed `'resize'`
  event is most likely. **Verified directly, not just patched and
  assumed**: faked a `window.innerHeight` change via
  `Object.defineProperty` with *no* `'resize'` event dispatched at all —
  confirmed `pinned.style.height` and the canvas's own drawing-buffer
  dimensions both updated within roughly one frame anyway, proving the
  per-frame polling (not the event listener) is what actually caught it.
- **The `baseFontSize` fix above had its own side effect, caught right
  after**: `drawCaptions`'s two top-right captions ("one of many
  candidate kernels", "hashed into one of 4 bins" + its own inline color
  swatches) both used a fixed `board.bx + 5 * pitch` horizontal center,
  which was fine when the text was tiny (the bug just fixed) but ran
  the wider of the two right off the canvas's own right edge once the
  text was legible-sized — measured directly: ~22-34px of real crop at
  390×844/360×740 (narrow viewports have `board.bx = 0`, no letterboxing
  margin to absorb the overflow the way wide viewports do). Fixed by
  measuring both captions' actual widths (`hashCaptionWidth()`, pulled
  out of `drawHashCaption` so `drawCaptions` can call it too) and
  clamping the shared center-x to whatever the canvas's own real width
  allows, rather than picking a new fixed multiplier that would just be
  a *different* hand-picked guess, liable to break again the next time
  this text or the font-size formula changes. Confirmed directly (not
  just re-eyeballed): the clamp is a no-op at 900×700 (unchanged,
  ~180-200px of margin already), and produces a small positive margin
  (~8-14px) rather than negative (crop) at both narrow viewports.
- **The closing "No need to know" card was too long**, reported directly
  as needing about two fewer lines (not a drastic rewrite). Original
  body rendered 5/8/9 lines at 900×700/390×844/360×740 respectively;
  trimmed (iterated on several candidate rewordings, measuring actual
  rendered line count via `getBoundingClientRect()` rather than just
  eyeballing word count, since wrapping depends on pixel width, not
  word count) to a version rendering 3/6/6 lines — the -2 target at the
  two more common widths, one extra line saved at the narrowest one
  tested. Kept a short "as shown here" callback to the two-equivalent-
  statements reveal that plays at the same moment, rather than cutting
  it entirely, since an equally-short rewording without it measured no
  shorter.
- **The legend card visibly drifts up and occludes the graphic when
  scrolling *back* on mobile** — a second-order consequence of the
  elongation fix above, not a new independent bug: `.legend`'s CSS
  `bottom: 6%` is a percentage of `.pinned`'s height (`ch`), which the
  elongation fix now deliberately keeps in exact sync with
  `window.innerHeight` — but on narrow viewports, the *graphic's* own
  vertical extent is `board.by = (ch - board.bh) / 2`, and `board.bh`
  is itself **ch-independent** there (`computeBoard`'s narrow branch
  derives it from `cw` alone). So as `ch` shrinks — exactly what
  happens when a mobile browser's address bar reappears, which itself
  tends to happen when scrolling *back* toward the top — the legend's
  own top edge moves at a *different rate* (initially 1:1 with `ch`,
  once naively "fixed" to a constant pixel `bottom` instead of a
  percentage — still wrong, since `top = ch - bottomOffset - height`
  still contains `ch` directly) than the graphic's own bottom edge does
  (exactly half that rate, `(ch + board.bh) / 2`). Confirmed directly,
  not just theorized: faking an `innerHeight` shrink (same technique as
  the elongation fix's own verification, no `'resize'` event dispatched
  at all) reproduced a jump from `-149px` to as bad as `-217px` of
  overlap through two wrong attempts before landing on the real fix.
  **Real fix**: anchor the legend's own `top` (not `bottom`) directly to
  the graphic's own actual bottom edge, `board.by + board.bh`, minus a
  fixed `overlapPx` (a fraction of `cw`, calibrated to match the
  original intentional-overlay look) — both sides of that subtraction
  now move at the *same* rate as `ch` changes, so the gap between them
  is arithmetically invariant, not just "hopefully close." Only applied
  on the narrow branch (`cw / ch <= BOARD_ASPECT`); wide viewports fall
  back to clearing both inline `top`/`bottom` overrides entirely,
  restoring the original CSS-only `bottom: 6%` design untouched — `ch`
  doesn't fluctuate there, so it was never broken. Confirmed the gap
  against the graphic's own real (bleed-row-inclusive) bottommost lit
  pixel stays stable within 3px across the same simulated shrink that
  used to move it by well over 100px, and re-ran the full chapter sweep
  (real navigation, not simulated) to confirm no chapter's own legend
  position regressed.

## Intro/finale link geometry: pointing *at* the kernel, not *into* it (latest session)

Three related fixes, all reported directly after watching the intro and
finale play slowly, to how `drawGrowingLink`'s calls in `drawIntro` and
`drawEquivalentStatements` relate to the kernel circle/seed dot at their
own destination end:

- **The intro's link no longer visually crosses into the kernel set's
  own circle.** `drawGrowingLink(stmtLineFrom, kernel, linkP, a)` used
  to lerp all the way to `kernel` (the circle's *center*) regardless of
  the circle's own current radius, so once the tip had traveled far
  enough it was, for the rest of the chapter, drawn *inside* the
  circle, heading toward its center among the `KERNEL_MODEL_POINTS`
  dots -- reading as pointing at one specific point/model rather than
  at the kernel (the whole set) itself. Fixed by capping the *progress*
  passed to the lerp, not just the drawn result: `edgeProgress = clamp(1
  - setRadius / toKernelDist, 0, 1)`, `cappedLinkP = min(linkP,
  edgeProgress)` -- so the line itself stops growing exactly at the
  circle's own current edge, then tracks that edge outward as the
  circle blooms and back inward as it collapses (ch.2), reaching the
  true center only once the circle has fully collapsed to the seed dot
  itself (at which point edge and center are the same point anyway).
  `kernelBloom`/`setRadius`/`setAlpha` were hoisted earlier in
  `drawIntro` (they already existed, just below the link's own drawing
  block before this) so the link's own capping calculation has the
  circle's current radius available before it needs it.
- **The tip's own traveling glow dot stops the instant the line reaches
  that edge**, not just once `progress` reaches `1` (`drawGrowingLink`'s
  own old rule) -- reported directly as confusable with the model-point
  dots it now visually sits among/near otherwise. `drawGrowingLink`
  gained an optional `showDot` parameter (defaults to the old `progress
  < 1` rule when omitted, so the finale's own two calls -- which don't
  land on a growing circle at all -- are unaffected); the intro's own
  call passes `cappedLinkP >= linkP` (true exactly while the line
  hasn't started clamping yet, i.e. is still genuinely approaching).
  One-way per chapter-4/5 pass: once hidden, never reappears, since both
  the line's own remaining distance to center and the circle's radius
  only move toward each other from that instant on (until the collapse
  phase, addressed by the capping formula's own symmetry, not by any
  special-cased direction check).
- **The finale's two links (`drawEquivalentStatements`) now start from
  the seed dot's own edge, not its center**, aimed at each one's own
  destination -- previously both lines emerged from the exact same
  point (the center), reading as passing through the dot rather than
  originating from it. Needed the seed dot's own *current* rendered
  radius (it breathes and briefly grows, real-time -- see `renderDots`'
  own seed-specific branch), factored out into a shared `seedRadius(t,
  now)` helper (used by `renderDots` too now, replacing its own
  duplicate copy of the same formula, so the two can't drift apart) and
  a small `edgePointTowards(center, radius, target)` helper. Required
  threading `now` through to `drawEquivalentStatements` (previously
  only took `t`) -- `drawScene`'s own call site updated to match.

Verified via a fine `t`-sweep through the intro's own link-growing
chapter (screenshots at `t = 0.14, 0.15, 0.16, 0.17, ..., 0.22`):
tip dot visible right up to first contact, gone the very next checked
frame, with the line's own end sitting exactly on the circle's edge at
every frame checked, including as the circle continues blooming past
first contact and later collapses back toward the seed dot. Finale
confirmed via cropped zooms (ImageMagick, not just eyeballing the full
frame) at both mid-reveal and fully-settled -- both lines visibly
originate at the dot's own glow boundary, not its center, in each
frame. Full forward/backward scroll of the entire track, and a
390\u00d7844 mobile check of both fixes: zero console errors beyond the
standard harmless favicon 404.

## If you're picking this up fresh

1. Diff the IBM-repo copy against the public-repo copy first (see "Repo /
   remote situation" above) — confirm which one, if either, has drifted.
2. Serve locally and scroll through once in a real browser before editing
   anything.
3. This piece has had no active iteration since its initial add — there is
   no backlog of "things tried and reverted" to avoid repeating, unlike
   `less-is-more/`. Treat any change here as new work, not a continuation
   of an existing thread.
4. If the change is significant, update *this file* (not
   `less-is-more/CLAUDE.md`) — keep the two pieces' documentation as
   separate as the pieces themselves are.
5. Push to both repos following the same two-commit pattern documented in
   `less-is-more/CLAUDE.md`'s "Repo / remote situation" section. (This
   directory *is* now tracked on the IBM side too, contrary to what an
   earlier version of this file's own "Repo / remote situation" section
   above claimed — see that section's own correction note. Plain `git
   add` + `git commit` there works the same as it does for `less-is-more/`.)
