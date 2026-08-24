# CLAUDE.md — explainer-information-logic

This file exists so a fresh Claude Code session (no prior conversation
history) can pick up work on this repo without re-deriving context that
took a very long session to build up. Read this before touching
`less-is-more/script.js` in particular — it has accumulated a lot of
hard-won, verified design decisions that are easy to accidentally undo.

## What this repo is

Two scroll-driven, canvas-based explainers for a paper about
information-theoretic "targeted queries" (working title/theme: "Less is
More" — a shorter, cleverly pre-agreed message can prove *more* than a
longer, directly-tailored one, because it's built to serve many
situations at once instead of being freshly computed for just one).

- `less-is-more/` — the main, actively-developed piece. Two phases in
  one continuous scroll track (see below).
- `no-need-to-know/` — a separate, related explainer. Not touched during
  the session that produced most of this file; less context here.
- `index.html` (repo root) — a landing page linking both.

**Deployed via GitHub Pages** at:
**https://lastras.github.io/explainer-information-logic/less-is-more/**

No build step anywhere. Each piece is `index.html` + `style.css` +
`script.js`, opened directly or served with `python3 -m http.server`.

## Repo / remote situation (read this before pushing anything)

This repo (`github.com/lastras/explainer-information-logic`) is the
**primary, public-facing deployment repo** — safe to push to, contains
only these two explainers, nothing sensitive.

There is *also* a mirror copy of `less-is-more/`'s three files
(`index.html`, `style.css`, `script.js` — **not** `README.md`, which
diverged and is phase-1-only, see below) at:

```
github.ibm.com:IBM-Research-AI/information-in-logic
  content/explainer-less-is-more/
```

**That second repo is the main research monorepo for an entire
unpublished PNAS paper** — it contains peer review files, draft PDFs,
etc., elsewhere in its history. It is *not* Pages-deployed (or wasn't,
as of this writing — Pages was enabled on it once by request, then its
status was left an open question; check before assuming). **Do not**
`git add -A` or otherwise sweep up unrelated files there. Only ever add
the three explicit `less-is-more/{index.html,style.css,script.js}`
files (mapped to `content/explainer-less-is-more/` in that repo) when
syncing.

**Workflow used throughout**: edit the files at
`content/explainer-less-is-more/` (or wherever the working copy is),
verify locally (see below), then `cp` the three files to
`/tmp/explainer-information-logic/less-is-more/` (or wherever that
repo's working copy currently is checked out — **it may be in `/tmp`,
which is not guaranteed to survive a reboot; if it's gone, `git clone
git@github.com:lastras/explainer-information-logic.git` fresh**), commit
and push there, then commit and push the IBM mirror too. Two separate
commits (same message content, second one adds a
`Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` trailer to
match that repo's own convention) — not a shared history, these are
unrelated repos.

There is also a stray, unused git remote (`github-com` →
`git@github.com:lastras/information-in-logic.git`) on the IBM repo's
working copy, left over from an early mistake (created an empty repo
there before being redirected to the *actual* intended deployment repo
above). It has nothing pushed to it. Ignore it; don't push there.

## Verification methodology (used for every single change)

This piece is unusually rigorously verified for something with no test
framework. The discipline, in order, for *any* nontrivial change:

1. **Verify geometry/math numerically in Node *before* writing rendering
   code.** E.g. before drawing the tetrahedron, a standalone Node script
   confirmed the cube-corner vertex construction gives equal edge
   lengths, and separately confirmed which rotation angle sends a given
   vertex to the ±Z axis. Before removing the two-radii door layout, a
   script confirmed what angles the "aligned" 3D projection actually
   produces, so the new flat 2D hexagon could be picked to match them
   exactly rather than approximately. Scratch scripts like this go in
   `/tmp/verify_gtd/` (arbitrary scratch dir name from this session;
   feel free to make a new one) — throwaway, not committed.
2. **Take real screenshots** via Puppeteer + a locally-cached
   Chrome-for-Testing binary, not by reasoning about CSS/canvas math
   alone. The exact binary path used throughout this session:
   ```
   /Users/lastrasl/.cache/puppeteer/chrome/mac_arm-152.0.7977.42/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing
   ```
   (version number may drift; `ls ~/.cache/puppeteer/chrome/` to find
   the current one.) `puppeteer-core` (not full `puppeteer`) installed
   in a scratch dir via `npm install puppeteer-core`.
3. **Serve the directory locally** before screenshotting:
   `cd less-is-more && python3 -m http.server 8791` (background it),
   then hit `http://localhost:8791/index.html` from the Puppeteer
   script. Restart the server after every edit (`pkill -f "http.server
   8791"` then relaunch) — Python's server doesn't need a restart to
   pick up file changes, actually, but doing it defensively doesn't
   hurt and was the habit throughout.
4. **Checks run after every meaningful change**, always:
   - **Idle-static**: screenshot, wait 1.5–2s doing nothing, screenshot
     again, assert byte-identical `canvas.toDataURL()`. Confirms nothing
     animates from wall-clock time (the one hard invariant this piece
     inherited from phase 1 and extended to phase 2 — see below).
   - **Forward/backward scroll scrub**: for every *scroll-driven*
     chapter (not the interactive game, not tetrahedron-drag — those are
     legitimately state-driven, not reversible-by-construction), scroll
     through a set of `t` values forward, then the same values backward,
     assert each `t` produces byte-identical canvas both directions.
   - **Full-page error scan**: scroll through the *entire* track in
     small steps, assert zero console errors and zero failed network
     requests (aside from the harmless `favicon.ico` 404, which is
     always present and always ignored).
   - **Full game-loop click-through** via `page.mouse.click()`: select
     doors, click "Open selected", click "Reveal the cheat sheet",
     decode Alice's 2-bit signal from actual rendered pixel colors
     (`ctx.getImageData`), open the correct group, confirm a win.
   - **Viewport sweep**: 900×700 (primary desktop), 390×844 (mobile),
     900×600 ("short" — the one that has caught the most real layout
     bugs), 360×740 (small mobile). A few times, 1400×900 (wide) too.
   - **Drag-specific** (tetrahedron reveal): simulate a
     `mouse.down()` → several `mouse.move()` → `mouse.up()`, confirm the
     canvas changed during, and is idle-static again after release.
5. **When a bug is found, fix root cause, re-verify with the *exact same
   script that caught it*, then re-run the *whole* suite** — several
   real bugs in this session were only caught this way (see "Bugs found
   and fixed" below).

None of this is automated/committed as a test suite — it's all
disposable Puppeteer scripts run ad hoc during the session. If picking
this up fresh, expect to rewrite small variants of these scripts as
needed; the patterns above are the reusable part, not any specific
script file.

## `less-is-more/script.js` architecture

Single IIFE closure, no imports, no modules. Written top-to-bottom in
roughly this order (grep for the section-header comments, which use
`// ----` and `// ====` banners consistently):

### Phase 1 vs. phase 2 split

- `t` = a single scalar in `[0,1]`, derived from scroll position
  (`computeT()`), driving *everything*. Nothing animates from
  wall-clock time **except** the tetrahedron's drag-rotation, which is
  real user-pointer-input-driven state, not time-driven — it changes
  only on an actual drag and holds exactly still otherwise, satisfying
  the same "static unless something changes" rule by a different route.
- Phase 1 (the original, pre-existing piece: Venn-diagram kernel/query
  argument, weather-sentence examples, cost curves, "This is what
  Less/More means") is **completely untouched** by any of phase 2's
  work — its own local `t` is `tOuter / LEGACY_END`, computed and passed
  to its own drawing functions exactly as it always was.
- `LEGACY_END` (currently **5/11**) is where phase 1's own `t=1` lands
  in the new, longer combined scroll track. It has been recomputed
  twice now, each time the track grew (`style.css`'s `.scroll-track`
  height), specifically so that phase 1 keeps the *exact* absolute
  scroll-pixel budget it was originally tuned and verified against
  (currently: track is 1200vh, so outer scroll range is 1100
  viewport-heights; `LEGACY_END × 1100 = 500` = phase 1's original
  effective range). **If you grow the track again, recompute
  `LEGACY_END` the same way — see its own code comment for the exact
  arithmetic — don't rescale phase 1's own dozens of internal margin
  constants to compensate; that's the whole point of this split.**
- Phase 2 (`tGame = (tOuter - LEGACY_END) / (1 - LEGACY_END)`, its own
  `[0,1]` range) is everything covered below. `CHG` (chapter boundaries)
  and `GAME_LEGEND_CHUNKS`/`GAME_PHASE_TEXT`/`TETRA_REVEAL_TEXT`/
  `SUMMARY_TEXT` (legend copy) are all keyed to `tGame`.
- The old standalone demo this was built from,
  `content/demo-game-show-code/` (or wherever it lives relative to this
  repo — it's a sibling in the IBM monorepo, not present in *this*
  repo), is **explicitly left untouched**, kept only for reference. All
  of phase 2 here is a fresh reimplementation in this piece's own visual
  language, not an edit to that demo.

### Phase 2's own structure ("Guess the Door")

A concrete dramatization of the same "targeted query" mechanism via the
SI's own worked example: 6 doors, one hides a prize, one hides a dud,
Alice knows which is which and broadcasts a 2-bit signal that's useless
without a shared 4-entry codebook to decode it against.

**Current chapter sequence** (all `CHG` values are `tGame` fractions;
recompute if you touch `LEGACY_END`/track height again):

| `tGame` | Boundary name | What happens |
|---|---|---|
| 0 → 0.05 | `transitionEnd` | "Let's demonstrate this with a game" — phase 1's own diagram/tile/chart fade out together, one shot |
| → 0.1333 | `doorsEnd` | "Six doors, two that matter" — 6 door-points fade in (plain hexagon, see below) |
| → 0.2167 | `scoopEnd` | "Alice has the scoop" |
| → 0.3 | `obviousEnd` | "The most obvious option" — tell Bob everything, ~4.9 bits (log₂30) |
| → 0.4 | `enoughEnd` | "But you don't need all that" — naming just the prize door alone is enough, ~2.58 bits (log₂6); teases "something better" |
| → 0.5 | `signalEnd` | "Alice's signal" — reveals 2 bits (log₂4); the 2-dot signal indicator fades in |
| → 0.5833 | `playArrive` | Interactive game begins — see below; board stops following `t` |
| → 0.8333 | `tetraStart` | Geometric reveal begins — 2D board crossfades into the 3D tetrahedron |
| → 0.9333 | `tetraSweepEnd` | Scroll-driven rotation sweep completes; hands off to user drag |
| → 0.975 | `summaryStart` | Legend switches to the closing "Less is more" card; tetrahedron stays draggable forever after |

All the actual bit-cost numbers (4.9, 2.58, 2) are stated as **plain
prose in the legend card only** — there is deliberately no attempt to
visualize kernels/queries/checkmarks on the canvas for this part
anymore (see "Things tried and reverted" below for why).

### Interactive game (`tGame` in `[playArrive, tetraStart)`)

Not `t`-driven at all past `playArrive` — driven by real clicks.
`isGameInteractive(tOuter)` is the single source of truth for "are we in
this zone" (note it has an *upper* bound at `tetraStart` too, added
later — see bugs below). Game state:

- `carDoor`/`zonkDoor` — the random secret (prize/dud), re-rolled by
  `randomizeSecret()`.
- `GROUPS` — the SI's own 4×6 codebook matrix (hardcoded, from the
  paper). `findGroup(car, zonk)` returns which of the 4 groups is safe.
- `selectedDoors`/`openedDoors` (Sets), `roundResolved`, `lastRoundWin`.
- `gamePhase`: `'blind' → 'cheatsheet' → 'hinted'` (button-click driven:
  "Open selected" resolves a round; "Reveal the cheat sheet" — appears
  once a round resolves and the cheat sheet hasn't been shown yet —
  reveals the 4-group codebook and resets the round; the *first* door
  click after that moves `'cheatsheet' → 'hinted'`). No `'less'`/`'more'`
  sub-phases anymore (those existed briefly, then were reverted — see
  below).
- Win rule: **binary**. Win iff prize door is among the opened doors
  *and* dud door is not. Everything else (missed the prize regardless of
  the dud, or found the dud regardless of the prize) is simply a loss.
  No three-way win/draw/loss.
- `resetGameToInitialState()` — fires once, detected in `render()`, when
  scrolling *backward* out of the game entirely (past `playArrive`
  going down). Uses its own predicate, `hasReachedGame()` (no upper
  bound), specifically *not* `isGameInteractive()` — see bugs below for
  why that distinction is load-bearing.
- Visuals: doors are **plain squares** (`drawSquareMarker`), never
  discs/circles — a glowing disc means "a kernel" everywhere else in
  this piece (established in phase 1), and a door is a single element,
  not a kernel; drawing it as a disc would blur that distinction. Colors:
  `CORRECT_COLOR` (green, prize), `CATASTROPHIC_COLOR` (red, dud),
  `CANDIDATE_COLOR` (blue — reused from phase 1's own "candidate kernel"
  color, for selected/grouped doors). A prominent "You win!!"/"You
  lose!" text banner (`drawResultBanner`) appears above the board on
  round resolution — no per-door "correct"/"catastrophic" text labels
  (removed; the banner already says which happened).
- **No connecting lines between doors at all** (removed — see "Things
  tried and reverted"). A door's own fill color is the only signal for
  set membership (selected, or in a cheat-sheet group).

### Board geometry — now a plain hexagon

`GAME_DOOR_RADIUS = 0.5`, `GAME_DOOR_ANGLES = [180, 300, 240, 120, 0,
60]` (degrees, indexed by door number). All 6 doors at the *same*
radius, evenly spaced. `DOOR_LOCAL` is derived directly from these two
constants.

This used to be a two-radii "K4 planar embedding" layout (3 doors at
radius 0.5, 3 at radius 0.16) specifically so that a now-removed
"kernel fan" (connecting lines between grouped/selected doors) never
crossed. Once the fan-lines were removed, that whole justification
disappeared, and the layout was simplified to a plain hexagon — picked
to land on the *exact* angles the 3D tetrahedron reveal's own aligned
projection produces (see `TETRA_ALIGN_X/Y` below), which incidentally
makes the 2D→3D crossfade close to exact rather than merely similar.

`verifyGameGeometry()` still runs on load and still checks the one
thing that's still load-bearing: **`GROUPS` really is the 4 vertex-stars
of a tetrahedron whose 6 edges are the 6 doors** (each door belongs to
exactly 2 groups; the six `{group,group}` pairs induced are exactly the
six 2-subsets of `{0,1,2,3}`). This structural fact is what
`findGroup()` and the entire 3D reveal depend on. The check used to
*also* verify no two groups' fan-lines crossed geometrically — removed,
since there are no fan-lines left to check.

### The 3D tetrahedron reveal (`tGame ≥ tetraStart`)

A hand-rolled 3D renderer (no library) — genuinely worth understanding
before touching:

- `TETRA_VERTS_3D` — 4 vertices via the standard "alternating cube
  corners" construction: `(1,1,1), (1,-1,-1), (-1,1,-1), (-1,-1,1)`.
  Verified once (Node) that all 6 pairwise distances are equal (regular
  tetrahedron). Vertex index = group index (0–3), same order `GROUPS`
  lists them, no separate remapping.
- `DOOR_VERTEX_PAIRS` — derived from `GROUPS` directly (which two
  vertices/groups each door's edge connects). `DOOR_LOCAL_3D` — each
  door's 3D position, the midpoint of its own edge. Verified once that
  these midpoints land exactly on the 3 coordinate axes (a well-known
  fact: a tetrahedron's edge-midpoints form a regular octahedron).
- `rotatePoint3D(p, angleX, angleY)` — rotate around X then Y.
  `project3D(p, cx, cy, scale)` — perspective projection,
  `scale = TETRA_FOCAL / (TETRA_FOCAL - p.z)` (camera on the **+z**
  side looking toward −z; this exact sign was gotten backward once and
  caught by screenshot — see bugs below).
- `TETRA_ALIGN_X = -π/4`, `TETRA_ALIGN_Y = atan(1/√2)` — the rotation
  that sends vertex 3 (group 3) to the ±Z axis, i.e. "look straight down
  group 3's own vertex." Solved once, by hand then confirmed in Node.
  At this angle the 6 doors project to a flat, non-overlapping hexagon
  — the crossfade target when the 2D board hands off.
- `TETRA_REST_X = -0.35`, `TETRA_REST_Y = 0.6` — the "settled" pose the
  scroll-driven sweep rotates *to*, and where user-drag picks up from.
- Each door is a small flat-shaded **cube** (`drawTetraCube`) — 8
  corners (`CUBE_CORNERS_UNIT`), 6 faces (`CUBE_FACES`, wound for
  outward normals), backface-culled, painter's-algorithm depth-sorted,
  simple flat shading via `dot(faceNormal, cameraDir)`. Each of the 4
  group-vertices is a plain glowing dot labeled with Alice's own 2-bit
  code in binary (`i.toString(2).padStart(2,'0')`) — same encoding
  `drawSignalIndicator` already uses elsewhere.
- **The crossfade + sweep** (`drawGameScene`): `tetraAlpha` is a
  one-way `captionAlpha` fade-in (no fade-back-out — this is the
  piece's final resting state). While `tGame < tetraSweepEnd`: render
  angles are `lerp(TETRA_ALIGN_X/Y, TETRA_REST_X/Y, sweepProgress)` and
  cube z-half-size is `lerp(0, TETRA_CUBE_HALF, sweepProgress)` (x/y
  half-size stays constant — cubes visually *thicken* from flat squares
  rather than growing from a point). This is **scroll-driven**, not a
  drag. Past `tetraSweepEnd`: a **one-shot handoff**
  (`tetraSweepHandedOff` flag) sets the mutable drag state
  `tetraRotX/Y = TETRA_REST_X/Y` exactly once, so user-dragging picks up
  with zero visible jump; `onTetraPointerDown` refuses to start a drag
  before `tetraSweepEnd` (matches the legend's own "keep scrolling to
  see it rotate, then drag it yourself"). Scrolling backward before the
  handoff re-arms it (`tetraSweepHandedOff = false` inside the sweep
  branch) so re-crossing forward re-triggers a fresh, correct handoff.
- Drag interaction: **Pointer Events** (`pointerdown`/`pointermove`/
  `pointerup`/`pointercancel`), one code path for mouse/touch/pen,
  `canvas.setPointerCapture()` so drags work even if the pointer leaves
  the canvas mid-gesture. Gated by `isTetraActive()` (broad) *and*
  `tGameOf(lastT) >= CHG.tetraSweepEnd` (narrow, the actual drag-enable
  gate) in `onTetraPointerDown`.
- **Honest limits, not overclaimed**: the crossfade is close to exact
  (matching angles) but perspective projection still introduces a small
  size difference between doors at different depths even at the aligned
  angle — not literally pixel-perfect. This is fine and not something
  to chase further; don't try to make it "more exact" without a good
  reason, it was already tuned/accepted as "close enough" after direct
  measurement.

## Things tried and explicitly reverted (don't redo these without a new reason)

This session went through several rounds of trying to formalize
"kernel"/"query" for the game's own intro, each abandoned after a real,
specific problem was found — reported here so the same dead ends aren't
retried:

1. **Small circle (Alice's kernel) + big ellipse (the query) drawn
   around subsets of the door-points.** Turned out mathematically
   inconsistent: any single fixed fact about one button in a 6-button
   universe costs exactly log₂6 bits to state outright (a
   combinatorial symmetry, `C(6,1) = C(6,5)`), so there was no way to
   make "the query" genuinely cheaper than "the kernel" just by
   choosing which button it names, no matter how the shapes were drawn.
2. **Checkmark/question-mark recoloring of the same 6 board points
   across several sequential cards** (Alice's view → Bob's view → "send
   everything" → "obvious way" → "just 2 bits"), each card reusing the
   same dots for a different meaning. Reported directly as confusing —
   asking color alone to keep too many different things apart across
   time. One card (`"Send Alice's view, verbatim"`) was also just
   mislabeled: it showed *Bob's* derived state, not Alice's own.
3. **A full HTML `<table>` comparison** (rows = strategies, columns =
   what Alice knows / what Bob can deduce / cost) — built as a *direct
   replacement* for #2, worked correctly, but was itself abandoned days
   later when the user asked to "go back to the game the way we had it
   before we were trying to talk about kernels" — i.e. revert past all
   of #1–#3 to a simpler pre-existing baseline, then make smaller,
   targeted changes from there. **The current door/prize/dud plain-prose
   walkthrough (see chapter table above) is what replaced all three of
   these**, landing on: state the numbers in the legend text, in plain
   language, with *no* accompanying canvas visualization of
   kernels/queries at all. This turned out to be the version that
   actually stuck.
4. **Fan-lines** (`drawKernelFan` — a complete graph of connecting lines
   between every pair of selected/grouped doors, reusing
   `drawGrowingLink`) for both the player's live selection and each
   cheat-sheet row. Reported as redundant with the color already doing
   that job, and occasional crossings (unavoidable for 4+ point subsets,
   by Kuratowski's theorem for 5+) as visual noise rather than signal.
   Removed entirely; color alone (a door's own fill) now carries all of
   this. This is *why* the two-radii board layout was also simplified
   to a plain hexagon (see above) — that layout's whole reason to exist
   was keeping those now-gone fan-lines from crossing.
5. **`"action"` terminology** → renamed to `"button"` at one point
   (mid-session), then implicitly reverted back to **`"door"`** when #3
   was reverted (the revert target predated the button rename). Current
   terminology is **door / prize / dud**, matching the demo this was
   built from, not "action/correct/catastrophic" (still used
   internally as variable/constant names — `carDoor`, `zonkDoor`,
   `CORRECT_COLOR`, `CATASTROPHIC_COLOR`, `recordOutcome` — only the
   user-facing legend text changed).

## Bugs found and fixed during this session (patterns worth remembering)

- **Perspective sign backward**: `project3D`'s scale formula was
  `FOCAL / (FOCAL + p.z)` at first — backward for a camera on the +z
  side looking toward −z (closer objects, larger +z, must get a
  *larger* scale). Caught by screenshotting: faces facing the camera
  rendered smaller than faces facing away. Fixed to
  `FOCAL / (FOCAL - p.z)`.
- **CSS `[hidden]` losing to a class selector**: `.game-controls { display:
  flex }` (author class selector) outranked the browser's own default
  `[hidden] { display: none }` (UA attribute selector), so setting the
  `hidden` DOM property from JS silently did nothing — the button row
  stayed visible the entire time. Caught on the very first frame
  screenshot. Fixed with an explicit `.game-controls[hidden] { display:
  none }` override. **Watch for this pattern any time a `hidden`-toggled
  element also has an unconditional `display` rule.**
- **Two independently-`position: absolute`, both-anchored-to-`bottom`
  elements overlapping**: the legend card and the game button row were
  each independently `bottom: 6%`-anchored; the button row's own
  computed height didn't push the legend down, so it overlapped the
  legend's own text. Fixed by wrapping both in one flexbox column
  (`.bottom-stack`), letting normal layout push them apart instead of
  independent absolute math. **Prefer flex/normal layout over
  independently-computed absolute offsets whenever two DOM elements'
  visibility toggles independently and their total height varies.**
- **`isGameInteractive()` reused for two different questions that need
  different answers**: it needs an *upper* bound at `tetraStart` (so a
  tetrahedron drag is never mistaken for a door click), but the "reset
  the game session" logic in `render()` was using that same predicate
  to detect "scrolled backward out of the game" — which meant scrolling
  *forward* into the tetrahedron reveal *also* looked like "left the
  game," incorrectly wiping the cheat-sheet/tally state the instant
  anyone scrolled past `playArrive`. Fixed with a second predicate,
  `hasReachedGame()` (no upper bound), used *only* for the reset check.
  **When a boolean gets a second, narrower meaning bolted on, check
  every existing caller of the original — don't assume the widening is
  safe everywhere it's already used.**
- **Narrow-viewport table overflow with no scroll affordance**: the
  (since-removed) comparison table's natural width (433px) exceeded its
  container's `clientWidth` (328px) at 390px viewport width, with the
  overflow silently scrolled off-screen and no visual hint more content
  existed. Caught by *directly measuring* `scrollWidth` vs
  `clientWidth` in the browser, not by eyeballing a screenshot. Fixed
  with a responsive breakpoint, re-measured until they matched. **For
  any dense/tabular content, measure actual rendered widths at the
  narrowest supported viewport — don't just screenshot and squint.**
- **Scroll-gap-too-narrow, twice**: the gap between "Play, blind"
  arriving and the tetrahedron reveal starting was first left at ~16
  scroll-vh (an artifact of a uniform rescale), widened once to 48vh
  after review, and *still* reported as easy to trigger by accident —
  widened again to 150vh, this time by computing the actual vh budget
  directly (`fraction × phase2_total_vh`) rather than picking a fraction
  by feel. **Compute actual vh amounts, don't just compare fractions —
  a 0.04 gap sounds small in the abstract but is genuinely a different
  thing to feel out at 400vh total vs. 900vh total.**

## Naming/vocabulary cheat sheet

- **Door** = one of 6 elements of the universe `M` (the game's action
  space). Drawn as a plain square, never a disc/circle (discs mean
  "kernel" everywhere in this piece).
- **Prize** = the one correct/safe door (`carDoor` in code — named
  after the standalone demo's own car/zonk game-show framing, which
  predates this piece and was kept as internal naming even after the
  user-facing text moved to door/prize/dud).
- **Dud** = the one catastrophic door (`zonkDoor` in code).
- **World** = which door is the prize *and* which is the dud jointly (a
  full state of affairs) — 30 possible worlds total (6 × 5). This is
  the one place the phase-1 vocabulary ("world" = a complete possible
  state of affairs, same as a weather-sentence's own kernel elements)
  is explicitly carried over and reused, in prose, without any
  accompanying canvas visualization (see "reverted" list above for why
  not).
- **Group** / **candidate** = one of the 4 rows of `GROUPS`, a
  pre-agreed subset of 3 doors. Same role as phase 1's own "candidate
  kernel" — reuses `CANDIDATE_COLOR` (blue) deliberately for this
  reason.
- **Alice's signal** = the 2-bit code identifying which group applies to
  the current secret. Meaningless without the codebook, same point
  phase 1 makes about a short pre-agreed list needing to be shared in
  advance to be useful.

## If you're picking this up fresh, in order of likely need

1. `cd` into the actual working copy (may need to re-clone; see remotes
   section above) and confirm `git log --oneline -5` matches what you'd
   expect (recent commits should mention hexagon/tetrahedron/reveal).
2. Serve locally and manually scroll through once in a real browser to
   get oriented, before editing anything.
3. If making a change, re-read the relevant section above, grep the
   actual code for the constant/function names mentioned (comments in
   the code itself are extensive and were kept deliberately verbose —
   trust them over this summary if they ever disagree, this file could
   drift).
4. Re-verify with the discipline above before considering anything
   done, and update *this file* if the change is significant enough
   that a future fresh session would benefit from knowing about it.
5. Push to **both** repos (see remotes section), unless explicitly told
   otherwise.
