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

## Repo / remote situation — an important discrepancy vs. `less-is-more/`

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
(`diff -rq content/explainer-no-need-to-know/ /tmp/.../no-need-to-know/`)
to confirm they're still identical (they were, as of this file's writing —
`index.html`, `style.css`, `script.js`, `README.md`, this new `CLAUDE.md`).
If you edit the IBM-repo copy, remember to also `git add` it there — it
won't get picked up by an existing pattern the way `less-is-more/`'s already
does, since it's never been added at all.

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
   `less-is-more/CLAUDE.md`'s "Repo / remote situation" section, but note
   you'll need `git add` (not just `git commit`) on the IBM side the first
   time, since this directory has never been tracked there.
