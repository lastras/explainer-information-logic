# CLAUDE.md — content/explainer-less-is-more/

This file exists so a fresh Claude Code session (no prior conversation
history) can pick up work on this piece without re-deriving context that
took a very long session to build up. Read this before touching
`script.js` in particular — it has accumulated a lot of hard-won,
verified design decisions that are easy to accidentally undo.

**This directory is a mirror.** The actual public deployment lives in a
*separate* repo, `github.com/lastras/explainer-information-logic`
(Pages-deployed at
**https://lastras.github.io/explainer-information-logic/less-is-more/**).
This copy, inside the IBM research monorepo
(`github.ibm.com:IBM-Research-AI/information-in-logic`), exists so this
piece's source lives alongside the paper it explains, but **every
change needs to be synced to both repos** (see below). Note this repo's
own `README.md` in this directory has diverged and is phase-1-only —
trust the code and this file over it for phase 2.

## Repo / remote situation (read this before pushing anything)

**This repo is the main research monorepo for an entire unpublished
PNAS paper** — it contains peer review files, draft PDFs, etc.,
elsewhere in its history. **Do not** `git add -A` or otherwise sweep up
unrelated files here. Only ever add the three explicit
`content/explainer-less-is-more/{index.html,style.css,script.js}` files
when committing changes to this piece. This repo is not (or wasn't, as
of this writing — Pages was enabled on it once by request, then its
status left an open question; check before assuming) itself
Pages-deployed; the *other* repo below is the actual public-facing one.

The other repo, **`github.com/lastras/explainer-information-logic`**,
is the **primary, public-facing deployment repo** — safe to push to,
contains only this piece and one other explainer (`no-need-to-know/`,
which has its own separate `CLAUDE.md` at
`content/explainer-no-need-to-know/CLAUDE.md` in this monorepo — this
file's content is specific to `less-is-more/` and does not apply there),
nothing sensitive. Its own working copy may be checked out at
`/tmp/explainer-information-logic/` (not guaranteed to survive a
reboot — if it's gone, `git clone
git@github.com:lastras/explainer-information-logic.git` fresh). That
repo has its **own, more detailed CLAUDE.md** at its root — read that
one too if it's reachable; this file and that one were written
together and are meant to be near-duplicates, but that one has a couple
of details specific to that repo's own layout.

**Workflow used throughout**: edit here, verify locally (see below),
then `cp` the three files to the other repo's `less-is-more/` directory,
commit and push there, then commit and push here too. Two separate
commits (same message content, this repo's own commit adds a
`Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` trailer to
match its own convention) — not a shared history, these are unrelated
repos.

There is also a stray, unused git remote (`github-com` →
`git@github.com:lastras/information-in-logic.git`) on this repo's
working copy, left over from an early mistake (created an empty repo
there before being redirected to the *actual* intended deployment repo
above). It has nothing pushed to it. Ignore it; don't push there. The
remote actually used for the deployment repo, if added here at all,
would need adding fresh (it wasn't kept as a remote of *this* repo —
syncing was done by `cp`-ing files between two separately-cloned
working copies, not by git remotes on one shared repo).

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
   exactly rather than approximately. Scratch scripts like this go in a
   throwaway scratch dir (e.g. `/tmp/verify_gtd/` from this session) —
   not committed.
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
   `cd content/explainer-less-is-more && python3 -m http.server 8791`
   (background it), then hit `http://localhost:8791/index.html` from
   the Puppeteer script. Restart the server after every edit
   (`pkill -f "http.server 8791"` then relaunch) — not strictly
   necessary since the server re-reads files per-request, but was the
   habit throughout.
4. **Checks run after every meaningful change**, always:
   - **Idle-static**: screenshot, wait 1.5–2s doing nothing, screenshot
     again, assert byte-identical `canvas.toDataURL()`. Confirms nothing
     animates from wall-clock time (the hard invariant this piece
     inherited from phase 1 and extended to phase 2 — see below). **Three
     legitimate, narrowly-scoped exceptions now**: an active drag, the
     tetrahedron auto-spin while it's still running (only possible
     while `tGame` is in `[doorsEnd, playArrive)`, or briefly past
     `playArrive` until it finishes its current revolution and snaps to
     rest — see "Tetrahedron auto-spin" below), and the cheat-sheet
     vertex pulse while `gamePhase === 'cheatsheet'` (see "Cheat-sheet
     vertex pulse" below — it stops the moment the player's first move
     flips `gamePhase` to `'hinted'`). Idle-static must still hold
     everywhere else: before `doorsEnd`, once the spin has settled
     at/past `playArrive`, and once `gamePhase` has moved past
     `'cheatsheet'`.
   - **Forward/backward scroll scrub**: for every *scroll-driven*
     chapter (not the interactive game/tetrahedron-drag past `playArrive`
     — those are legitimately state-driven, not reversible-by-
     construction), scroll through a set of `t` values forward, then the
     same values backward, assert each `t` produces byte-identical
     canvas both directions. **Also not reversible-by-construction from
     `doorsEnd` on**, now, for the same reason: once the board is
     visible at all, the auto-spin's own real-elapsed-time state means
     revisiting the same `t` after a different amount of real time has
     passed can legitimately show the shape at a different rotation.
     Confirmed directly, this session: everything strictly before
     `doorsEnd` still matches byte-for-byte forward vs. backward;
     `doorsEnd` and beyond legitimately doesn't, purely because of
     accumulated auto-spin time, not a bug.
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
   - **Drag-specific**: simulate a `mouse.down()` → several
     `mouse.move()` → `mouse.up()`, confirm the canvas changed during,
     and is idle-static again after release.
   - **Tap-vs-drag, and rotate-then-tap correctness** (added once the 2D
     board and the tetrahedron merged into one draggable+tappable
     shape): a near-zero-movement pointer sequence toggles a door and
     does *not* rotate; a clearly-moved one rotates and does *not*
     toggle a door — checked both on top of a door-cube and on empty
     space between doors. Separately: rotate the shape by a *known*
     amount (replicate `rotatePoint3D`/`project3D`/`sensitivity` in the
     test script itself to predict the new screen position of a
     specific door), then tap where that door *now* is — confirm the
     right door toggles, and confirm tapping its *old*, pre-rotation
     position does nothing. Identifying which door is the prize/dud
     from a screenshot is more robust by *dominant color channel*
     (green clearly ahead of both red and blue, or vice versa) than by
     absolute distance to `CORRECT_COLOR`/`CATASTROPHIC_COLOR` — a
     cube's own per-face flat-shading brightness swings the exact
     sampled RGB well away from the raw constant, but which channel
     dominates survives that shading. **Since the auto-spin was added**:
     any test script computing a door's screen position offline (via
     `rotatePoint3D`/`project3D` at a fixed `TETRA_ALIGN_X/Y`) is only
     valid once the spin has actually settled — either wait it out (up
     to a full revolution, `2*PI / TETRA_AUTOSPIN_SPEED` seconds, plus
     margin, worst case) after first reaching `tGame >= playArrive`, or
     cancel it first with a real drag before relying on a computed
     angle for hit-testing.
5. **When a bug is found, fix root cause, re-verify with the *exact same
   script that caught it*, then re-run the *whole* suite** — several
   real bugs in this session were only caught this way (see "Bugs found
   and fixed" below).

None of this is automated/committed as a test suite — it's all
disposable Puppeteer scripts run ad hoc during the session. If picking
this up fresh, expect to rewrite small variants of these scripts as
needed; the patterns above are the reusable part, not any specific
script file.

## `script.js` architecture

Single IIFE closure, no imports, no modules. Written top-to-bottom in
roughly this order (grep for the section-header comments, which use
`// ----` and `// ====` banners consistently):

### Phase 1 vs. phase 2 split

- `t` = a single scalar in `[0,1]`, derived from scroll position
  (`computeT()`), driving *everything*. Nothing animates from
  wall-clock time **except three things**: the tetrahedron's
  drag-rotation, which is real user-pointer-input-driven state, not
  time-driven — it changes only on an actual drag and holds exactly
  still otherwise, satisfying the same "static unless something
  changes" rule by a different route — a slow **auto-spin** in
  `tetraRotY` alone, running only across `[doorsEnd, playArrive)` (plus
  a short tail past `playArrive` to finish its current revolution) and
  cancelled permanently, instantly, by the first real drag (see
  "Tetrahedron auto-spin" below) — and a **cheat-sheet vertex pulse**,
  running only while `gamePhase === 'cheatsheet'` (see "Cheat-sheet
  vertex pulse" below). The latter two are genuinely wall-clock-time-
  driven, not just user-input-driven like the drag exception, so each
  narrows the idle-static invariant differently, in its own separate
  window; don't conflate any of the three when re-verifying.
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
  and `GAME_LEGEND_CHUNKS`/`GAME_PHASE_TEXT`/`SUMMARY_TEXT` (legend copy)
  are all keyed to `tGame`.
- The old standalone demo this was built from,
  `content/demo-game-show-code/` (a sibling directory in this same
  monorepo), is **explicitly left untouched**, kept only for reference.
  All of phase 2 here is a fresh reimplementation in this piece's own
  visual language, not an edit to that demo.

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
| → 0.1333 | `doorsEnd` | "Six doors, two that matter" (now names the six cubes as doors explicitly, and teases the tetrahedron's own significance) — the tetrahedron itself fades in (wireframe + 6 door-cubes, at its default `TETRA_ALIGN_X/Y` pose — see below), becomes *draggable* (not yet tappable — see `playArrive`), and the auto-spin starts (see "Tetrahedron auto-spin" below) |
| → 0.2167 | `scoopEnd` | "Alice has the scoop" — the two fixed illustrative doors (prize + dud) are highlighted, color + word label (`illustrativeHighlightPhase` returns `'both'` from here through `obviousEnd`) |
| → 0.3 | `obviousEnd` | "The most obvious option" — tell Bob everything, ~4.9 bits (log₂30); illustrative highlight still `'both'` through here |
| → 0.4 | `enoughEnd` | "But you don't need all that" — naming just the prize door alone is enough, ~2.58 bits (log₂6); teases "something better"; illustrative highlight narrows to `'prizeOnly'` from here through `playArrive` |
| → 0.5 | `signalEnd` | "Alice's signal" — reveals 2 bits (log₂4); the signal indicator fades in **below** the shape now (larger font too — see "Tetrahedron auto-spin..." session notes below); illustrative highlight still `'prizeOnly'`. Body text rewritten to be self-contained (no longer opens with "Just 2 bits, *in fact*," a backreference to the *previous* card's own "something even better" — reported directly) |
| → 0.5833 | `playArrive` | Interactive game begins — see below; board stops following `t`, becomes *tappable* (it's already been draggable since `doorsEnd` — see "This session's redesign"); illustrative highlight goes `'none'` for good; the auto-spin, if not already cancelled by a drag, keeps running until it next crosses `TETRA_ALIGN_Y`, then snaps to rest |
| → 0.9333 | `summaryStart` | Legend switches to the closing "Less is more" card (now names the concrete "More" payoff: the code hands you three safe doors, one the true prize); the tetrahedron keeps sitting there, exactly as draggable/tappable as a moment before |

There used to be two more rows here — `tetraStart` (a 2D→3D crossfade)
and `tetraSweepEnd` (a scroll-driven rotation sweep) — see "This
session's redesign" below for why they're gone, and where their own vh
budget went instead (a longer `playArrive..summaryStart` play window).

All the actual bit-cost numbers (4.9, 2.58, 2) are stated as **plain
prose in the legend card only** — there is deliberately no attempt to
visualize kernels/queries/checkmarks on the canvas for this part
anymore (see "Things tried and reverted" below for why).

## This session's redesign: merging the 2D board into the tetrahedron

For a long time, this piece had **two separate visual representations**
of the same 6-door structure, shown one after the other: a flat 2D
hexagon (`DOOR_LOCAL`/`GAME_DOOR_ANGLES`, since deleted) that the entire
interactive game was played on, reached only by scrolling *past* it into
a *separate* "geometric reveal" — a real, drag-rotatable 3D tetrahedron,
whose sole interaction was a drag (no door-tapping at all there). That
two-scene structure is now gone entirely: from the moment the board
fades in (`doorsEnd`) to the end of the piece, "Guess the Door" is
played directly on one continuous, real 3D tetrahedron — draggable *and*
tappable, from `playArrive` onward, with no upper bound. There's nothing
left to "reveal" geometrically (the player has been looking at, and can
rotate, the tetrahedron the whole time); only the cheat sheet's vertex
*labels* are still a genuine, player-triggered reveal now.

Load-bearing consequences of this merge, worth knowing before touching
any of it again:

- **`doorBoardPos(i)`/`vertexBoardPos(g)` are the single source of
  truth** for where a door/vertex actually is on screen, *right now* —
  always `project3D(rotatePoint3D(DOOR_LOCAL_3D[i]` (or `TETRA_VERTS_3D[g]`
  for the vertex version) `, tetraRotX, tetraRotY), ...)`. Both rendering
  (`drawGameBoard`) and tap hit-testing (`onTetraPointerUp`) call the
  *exact same* functions — there is no separate "flat layout" a tap
  could hit-test against that might disagree with what's actually drawn.
- **The idle/default rotation is `TETRA_ALIGN_X/Y`** (the angle that
  already sends the 6 doors to a flat, non-overlapping hexagon — see
  below), not the old `TETRA_REST_X/Y` "reads as 3D immediately" pose
  (deleted). This is deliberate: the shape *looks* like the old flat
  hexagon at rest, right up until the player drags it — there's no
  separate flat board left to hand off from, and no scroll-driven sweep
  left to rotate away from it either.
- **Tap vs. drag, on the very same DOM element** (`tetraGrabZone`):
  `onTetraPointerDown/Move/Up` track `tetraGestureDist`, the total
  pointer movement (accumulated across every move event, not just net
  start→end displacement) since the current gesture's own `pointerdown`.
  Rotation is applied *live*, move by move, regardless of how the
  gesture eventually gets classified. On `pointerup` (not
  `pointercancel` — an interrupted gesture never counts as a tap):
  `tetraGestureDist < TETRA_TAP_MAX_PX` (8px) means a tap, so hit-test
  all 6 doors via `doorBoardPos` and toggle whichever one the pointer
  landed on; at or past that threshold, it was a drag, and rotation
  already happened — no toggle.
- **`isGameInteractive(tOuter)` lost its upper bound.** It used to go
  `false` again at the old `tetraStart` (a different scene, a different
  interaction model, needed its own gate); now there's only one scene
  and one interaction model, active forever once reached, so
  `isTetraActive()` and `hasReachedGame()` (two other predicates that
  used to exist *specifically* to disagree with `isGameInteractive()`
  about the upper bound — see the historical bug entry below) collapsed
  into it. `render()`'s own "scrolled backward out of the game, reset
  everything" check calls `isGameInteractive()` directly.
  `layoutTetraGrabZone`'s own active-window check does **not** — see the
  next bullet, a follow-up refinement made right after this redesign
  first shipped.
- **Rotating and door-tapping ended up needing two different gates
  after all, just not the old `tetraStart` one.** Reported directly:
  freezing the shape until `playArrive` felt wrong, since it's already
  a concrete 3D object the *earlier* "Six doors, two that matter" ..
  "Alice's signal" walk-through cards are describing. Added
  `isBoardVisible(tOuter)` (true from `doorsEnd`, no upper bound,
  broader than `isGameInteractive()`) to gate `layoutTetraGrabZone`
  specifically, so dragging works through that whole earlier stretch.
  Door-*tapping* stays gated by the narrower `isGameInteractive()`
  though — checked separately, inside `onTetraPointerUp` itself, right
  before the hit-test/toggle — since there's no secret/round yet for a
  tap to act on before `playArrive`. A pre-`playArrive` tap simply
  rotates (a near-zero-movement drag) and does nothing further.
- **A door's own cube is always full-size** (`TETRA_CUBE_HALF`, no
  `zHalf`/`cubeZHalf` parameter anymore) — no more flat-to-cube
  thickening, since there's no separate reveal moment left to thicken
  *into*. `drawTetraCube` takes an explicit `color` param (reflecting
  selected/opened-as-prize/opened-as-dud/neutral) instead of a
  hardcoded one.
- **`TETRA_BOARD_RADIUS_MULT`** (distinct from the intentionally-
  oversized `TETRA_HIT_RADIUS_MULT`) anchors `aliceSignalPos`/
  `tallyPos` a fixed distance from the shape's own center, replacing
  their old use of `GAME_DOOR_RADIUS`. **Caught by screenshot, this
  session**: an initial value (1.0) sized to the shape's own *worst-
  case* vertex reach pushed the signal text clean off the top of the
  viewport at the shape's default resting pose on a 700px-tall
  viewport — a hard, always-visible clipping bug, for the sake of
  guaranteeing zero overlap at rotation angles that are individually
  rare. Retuned down (0.55) to comfortably clear the shape's *typical*
  extent instead, matching the old, proven-good `GAME_DOOR_RADIUS`-based
  position closely; the tradeoff is that a vertex/cube can occasionally
  swing out far enough, at some reachable drag angles, to sit close to
  (rarely, slightly under) the signal or tally text. **A rare cosmetic
  overlap beats a hard, common-case clipping failure** — don't
  "fix" this by inflating the constant back up without re-checking the
  clipping case at a modest viewport height.
- Wireframe edges and the 4 vertex dots are unconditional once the board
  itself has faded in — **not** gated behind `cheatsheetRevealed`; only
  each vertex's own binary-code *label* waits for that. This is what
  makes the shape read as one connected 3D object from the very start,
  rather than 6 floating cubes that only turn out to be connected once
  the cheat sheet arrives.
- The old flat-square door's "selected" ring outline (`drawSquareRing`)
  has **no cube equivalent** — deleted, not replaced. A cube's own fill
  color change (neutral → `CANDIDATE_COLOR`) plus its own glow was
  judged sufficient signal on its own, confirmed by screenshot.

### Interactive game (`tGame ≥ playArrive`, no upper bound)

Not `t`-driven at all past `playArrive` — driven by real taps/drags and
button clicks. `isGameInteractive(tOuter)` is the single source of truth
for "is the board interactive right now." Game state:

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
  going down), via `isGameInteractive()` directly (no separate
  predicate needed anymore — see "This session's redesign" above).
- Visuals: doors are small **cubes** sitting on the tetrahedron's own
  edges (`drawTetraCube`), never discs/circles — a glowing disc means "a
  kernel" everywhere else in this piece (established in phase 1), and a
  door is a single element, not a kernel; drawing it as a disc would
  blur that distinction. Colors: `CORRECT_COLOR` (green, prize),
  `CATASTROPHIC_COLOR` (red, dud), `CANDIDATE_COLOR` (blue — reused from
  phase 1's own "candidate kernel" color, for selected/grouped doors). A
  prominent "You win!!"/"You lose!" text banner (`drawResultBanner`)
  appears above the board on round resolution — no per-door "correct"/
  "catastrophic" text labels (removed; the banner already says which
  happened), and no per-cube "selected" ring either (the old flat-
  square board's own outline doesn't translate cleanly onto a cube; the
  color change plus the cube's own glow is enough on its own).
- **No connecting lines between doors themselves** (removed — see
  "Things tried and reverted"): a door's own fill color is the only
  signal for set membership (selected, or in a cheat-sheet group). The
  tetrahedron's own wireframe *edges* (vertex-to-vertex, always visible)
  are a different thing — genuine 3D structure, not a "these doors are
  related" annotation — and stay.

### Board geometry: the tetrahedron itself

A hand-rolled 3D renderer (no library) — genuinely worth understanding
before touching. This *is* the board, not a separate later reveal (see
"This session's redesign" above):

- `TETRA_VERTS_3D` — 4 vertices via the standard "alternating cube
  corners" construction: `(1,1,1), (1,-1,-1), (-1,1,-1), (-1,-1,1)`.
  Verified once (Node) that all 6 pairwise distances are equal (regular
  tetrahedron). Vertex index = group index (0–3), same order `GROUPS`
  lists them, no separate remapping.
- `verifyGameGeometry()` still runs on load and checks the fact this
  whole layout depends on: **`GROUPS` really is the 4 vertex-stars of a
  tetrahedron whose 6 edges are the 6 doors** (each door belongs to
  exactly 2 groups; the six `{group,group}` pairs induced are exactly
  the six 2-subsets of `{0,1,2,3}`).
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
  group 3's own vertex." Solved once, by hand then confirmed in Node. At
  this angle the 6 doors project to a flat, non-overlapping hexagon —
  now simply this piece's own **default/idle pose** (`tetraRotX/Y`'s own
  initial value), not a crossfade target for a separate scene.
- Each door is a small flat-shaded **cube** (`drawTetraCube`), always at
  its one true size (`TETRA_CUBE_HALF`) — 8 corners
  (`CUBE_CORNERS_UNIT`), 6 faces (`CUBE_FACES`, wound for outward
  normals), backface-culled, painter's-algorithm depth-sorted, simple
  flat shading via `dot(faceNormal, cameraDir)`. Each of the 4
  group-vertices is a plain glowing dot, always visible; its own binary-
  code label (`i.toString(2).padStart(2,'0')` — same encoding
  `drawSignalIndicator` uses elsewhere) only once `cheatsheetRevealed`.
- Drag *and* tap interaction, on the very same element: **Pointer
  Events** (`pointerdown`/`pointermove`/`pointerup`/`pointercancel`),
  one code path for mouse/touch/pen, `tetraGrabZone.setPointerCapture()`
  so a drag keeps working even if the pointer leaves the small grab
  zone mid-gesture. The grab zone itself (`layoutTetraGrabZone`) is
  gated by the *broader* `isBoardVisible()` (from `doorsEnd`) — dragging
  works well before the game itself does; `onTetraPointerUp`'s own
  tap-to-toggle branch checks the *narrower* `isGameInteractive()`
  (from `playArrive`) separately. See "This session's redesign" above
  for the tap-vs-drag disambiguation logic itself (`tetraGestureDist`
  vs. `TETRA_TAP_MAX_PX`).
- **Honest limits, not overclaimed**: the resting pose matches the old,
  since-deleted flat 2D hexagon *closely*, not pixel-perfectly —
  perspective projection still introduces a small size difference
  between doors at different depths even at that aligned angle. This is
  fine and not something to chase further; don't try to make it "more
  exact" without a good reason, it was already tuned/accepted as "close
  enough" after direct measurement.

## Tetrahedron auto-spin, illustrative highlighting, and repositioned signal (latest session)

Three related but separable changes, all in the same session, worth
understanding together before touching any of them again:

### Auto-spin

The tetrahedron now rotates on its own, slowly, from the moment it
appears (`doorsEnd`) until gameplay starts (`playArrive`) — so the
walk-through cards that are all *about* the shape don't show it sitting
frozen the whole time. This is a **second, and so far only other**,
exception to "nothing animates from wall-clock time" (the drag being
the first) — narrowly scoped, and genuinely time-driven rather than
input-driven, so it changes what idle-static verification means during
this specific window (see the verification methodology section above).

- **Mechanics**: `updateTetraAutoSpin(nowMs, tOuter)`, called from
  `frame()` on *every* animation frame (not gated behind "did `t`
  change" — real elapsed time keeps passing whether `t` does or not).
  Advances `tetraRotY` alone, at `TETRA_AUTOSPIN_SPEED` (`2*PI/24`
  rad/s — one revolution every 24s); `tetraRotX` stays pinned at
  `TETRA_ALIGN_X` throughout, so the rotation is exactly periodic in
  `tetraRotY` with period `2*PI` (confirmed numerically in Node before
  writing any of this — see "Verify geometry/math numerically" above).
  `frame` itself became `frame(now)` to get a real timestamp (rAF's own
  callback argument, previously unused); `updateTetraAutoSpin`'s return
  value (did it just change `tetraRotY`) is OR'd into the existing
  `t !== lastT` check so a `render()` still happens on a frame where
  only the spin moved.
- **Where it stops**: holding `angleX` fixed means "the flat hexagon
  view" (the same pose `TETRA_ALIGN_X/Y` already names) recurs *exactly*
  whenever `tetraRotY ≡ TETRA_ALIGN_Y (mod 2*PI)` — verified numerically
  to have no slack (the nearest miss within a full revolution is off by
  a healthy, non-degenerate margin, not a near-tie). Once `tGame` first
  reaches `playArrive` while still spinning, the spin ignores `t`
  entirely from then on (`tetraAutoSpinFinishing` goes true) and simply
  keeps advancing until the *next* such crossing, computed once as
  `tetraAutoSpinStopAtY`, then snaps `tetraRotY` to exactly
  `TETRA_ALIGN_Y` (not a `+2*PI*k` copy of it) and goes inert for good.
  Worst case, this tail runs a full 24s past `playArrive` — see the
  verification methodology's own note on why offline test scripts that
  assume a fixed `TETRA_ALIGN_X/Y` angle need to either wait this out or
  cancel the spin first.
- **Cancelled instantly, permanently, by a real drag**:
  `onTetraPointerDown` sets `tetraAutoSpinActive = false` as its very
  first action — no fighting the user's own input, no snapping back
  later, same precedent the tap-vs-drag handoff already set.
- **Re-armed by leaving the board's visible window entirely**:
  `render()` tracks `wasBoardVisible` (parallel to the existing
  `wasInteractive`/`resetGameToInitialState` pattern) and, on the
  `true → false` transition of `isBoardVisible(t)` (scrolling backward
  past `doorsEnd`), resets `tetraRotX/Y` to `TETRA_ALIGN_X/Y` and
  re-arms `tetraAutoSpinActive`/clears the finishing state — mirroring
  "leaving the game resets it," one level broader.
- **State**: `tetraAutoSpinActive` (bool), `tetraAutoSpinFinishing`
  (bool), `tetraAutoSpinStopAtY` (number or `null`), `tetraAutoSpinLastMs`
  (number or `null` — the rAF timestamp last advanced against; `null`
  whenever not currently eligible to advance, so a long gap, e.g.
  scrolling away and back, or the tab being backgrounded, never
  produces one giant dt jump — the first frame back always just
  re-establishes the baseline and advances nothing).

### Illustrative prize/dud doors

Two **fixed, always-the-same** doors — `ILLUSTRATIVE_PRIZE_DOOR = 0`,
`ILLUSTRATIVE_DUD_DOOR = 1` — used purely to dramatize "Alice knows
exactly which is which" / "naming the prize alone is enough" concretely,
during the pre-`playArrive` walk-through. **Not** `carDoor`/`zonkDoor`:
the real secret is already randomized at module load and stays live all
the way into "Play, blind" — showing it this early would spoil the
blind round. Never randomized, never involved in real scoring.

- `illustrativeHighlightPhase(tGame)` returns `'both'` (prize green +
  "prize" label, dud red + "dud" label) across
  `[doorsEnd, obviousEnd)`, `'prizeOnly'` (prize only) across
  `[obviousEnd, playArrive)`, `'none'` otherwise. `drawGameBoard`
  checks this *before* the real selected/opened/car/zonk logic — only
  ever relevant pre-`playArrive`, since that real state is still empty
  then, so there's nothing for it to shadow.
- `drawDoorWordLabel(i, text, color, alpha)` — a plain word label next
  to the door. **Not** a fixed "straight up" screen-space offset (an
  earlier version, parallel to the vertex code label's own
  `anchor: "bottom"`/fixed-gap styling) — offset *radially outward* from
  the shape's own projected center instead. Changed for a real
  correctness reason, not styling: once `TETRA_AUTOSPIN_TILT` (below)
  started wobbling `tetraRotX` too, a dense Node sweep across a full
  rotation caught the fixed "up" offset placing the "prize" label
  almost *exactly on top of* the dud's own cube at some angles (worst
  case under 1px away) — and a second sweep confirmed this had *already*
  been possible even with the tilt off, just less likely to be seen by
  chance. The radial approach clears the wrong cube by a healthy,
  multi-times-the-cube's-own-radius margin at every angle checked (see
  the auto-spin section below for the sweep script pattern). Gap
  magnitude (`gameUnit * DOOR_DOT_RADIUS_MULT * 6.5`, floor 30px)
  unchanged from before, only the *direction* changed.

### Signal below the shape; banner above; a floating "Play again" in between

`aliceSignalPos()` used to double as the win/loss banner's own anchor
(both "above the shape"). Now that the signal itself lives **below**
the shape (reads better near the doors it's actually about, and is
drawn larger — `drawSignalIndicator`'s own `sizeMult`, `0.95 → 1.3`),
the banner needed its own, separate anchor: `resultBannerPos()`.
`tallyPos()` moved further below the signal, to clear its own larger
footprint without overlapping it.

`resultBannerPos()`'s own offset (`TETRA_BOARD_RADIUS_MULT + X`) has
grown twice since it was first extracted: `0.36` (matched
`aliceSignalPos()`'s own old "above" value, unchanged banner
appearance) → `0.46`, once a second banner line (the win/loss
*reason*, see below) and a floating "Play again" button both needed
to fit in the same space, above the shape but below this anchor. This
is now the tightest vertical squeeze in the whole piece: measured
directly (not guessed) at all four of this file's own standard
viewports, `900×600` is tight on *both* sides at once (little headroom
above the viewport's own top edge, little room below before the
shape's own topmost point — the board fills the full viewport height
there), so `0.46` is the largest value that still clears the top edge
there with a little margin; growing it further would clip the banner
itself off-screen on that viewport before it would meaningfully help
anything below it.

### Win/loss banner now says *why*

One clear verdict ("You win!!"/"You lose!") doesn't say *why* on its
own — there are two different ways to lose (found the dud; found
neither), and reported directly as something the player shouldn't have
to go inspect the board itself to figure out. `recordOutcome()` now
also sets `lastRoundReason` (`'win' | 'dud' | 'missed'` — `'dud'` takes
priority over `'missed'` when a round somehow finds both, since opening
the dud is what actually lost it), reset to `null` alongside
`lastRoundWin` everywhere that already resets that. `drawResultBanner`
draws a second, smaller line right under the main verdict via a small
`RESULT_REASON_TEXT` lookup table.

### Floating "Play again" button, right under the banner

Moved out of `.game-controls` (the bottom button row) entirely, into
its own top-level element (`.play-again-floating` in
`index.html`/`style.css`) positioned every `render()` by
`layoutPlayAgainButton(t)` — the same "recompute from scratch every
render, don't couple to a specific past draw call" pattern
`layoutTetraGrabZone` already uses, not a value read back from
`drawResultBanner`'s own draw call. Reported directly: the CTA to keep
playing belongs right where the eye already is after a round resolves,
not only down in the bottom row. Horizontal centering is free (`left:
50%` in CSS — `resultBannerPos().x` is always exactly the viewport's
own horizontal center); only `top` is set from JS. Deliberately more
compact than the other `.game-btn` instances (smaller font/padding) —
see `resultBannerPos()`'s own note above on just how little vertical
room this has to fit in on this piece's tightest viewports.
`syncGameControls()` no longer touches this button at all; it's fully
owned by `layoutPlayAgainButton`.

**Font-family bug, caught right after**: `.game-btn` sets `font-family:
inherit`, which worked fine back when this button lived inside
`.game-controls` (which sets the real font list) — once moved to be a
sibling of `.game-controls` instead (a direct child of `.pinned`),
inheriting from *this* element's own ancestor chain fell through to
the browser's plain default font, reported directly as looking
mismatched from every other piece of text on the page. Fixed by
setting `font-family` explicitly on `.play-again-floating` itself (the
same list `.game-controls`/`.legend` already use) rather than relying
on inheriting it from a specific parent — the general lesson: moving an
element to a new place in the DOM tree can silently change what
`inherit` resolves to for *any* property that was relying on a specific
ancestor, not just layout-related ones.

### Selected-door color: bright white, not blue, and not shaded either

A selected-but-unopened door used to reuse `CANDIDATE_COLOR` (the same
blue as the wireframe edges and phase 1's own "candidate kernel").
Reported directly as reading too close to the doors' own plain neutral
gray once a cube's own per-face shading dims it — confusable with an
ordinary, unselected door. First fix: a dedicated `SELECTED_DOOR_COLOR`
(`#ffffff`), still put through the *same* per-face directional dimming
(`drawTetraCube`'s own `brightness = 0.5 + 0.5*f.nz`, then `*0.85`)
every other cube gets. **Still reported as hard to see** — even white,
the brightest color available, reads as dim/gray-ish on most faces most
of the time under that lighting model, which is exactly what makes an
*ordinary* gray cube look gray in the first place.

Real fix: `drawTetraCube` takes a `fullBright` flag (set only for the
selected-door branch in `drawGameBoard`) that skips the directional
dimming *and* the flat `*0.85` dampening entirely — every face of a
selected door renders at the color's own full strength, regardless of
which way it's currently facing. The point of highlighting a door is
for it to visibly *not* be sitting under the same lighting as every
other cube; a highlight that's still subject to the same lighting model
as everything else was never going to look highlighted. `CANDIDATE_COLOR`
itself, and the normal per-face lighting, are both untouched everywhere
else (the wireframe edges, phase 1's diagrams, every other door state)
— `fullBright` is a narrow, single-branch override.

**A follow-up, for even more contrast**: the default (unselected,
unopened) door fill also got its own dedicated, darker color —
`DOOR_NEUTRAL_COLOR_HEX` (`#7f8a8d`), not `NEUTRAL_HEX` (`#dfe8ea`,
left completely untouched — still used for the vertex dots, phase 1's
diagrams, and everything else that always used it). Requested directly
("make the boxes a little darker"): once the selected color renders
`fullBright`, an ordinary door sitting closer to white than it needs to
on the brightness scale narrows the very gap the highlight depends on.
A narrow substitution again, exactly parallel to `SELECTED_DOOR_COLOR`'s
own — only `drawGameBoard`'s own default `color = ...` for a door cube
changed; the vertex dots' own glow (`drawGlow`) still reads `NEUTRAL`.

### Auto-spin rotation axis: a wobble, not a flat pin — and what it broke

Holding `tetraRotX` perfectly fixed at `TETRA_ALIGN_X` throughout the
spin (the original design) read as a flat, uninteresting merry-go-round
— reported directly. `TETRA_AUTOSPIN_TILT` (~10°) now wobbles
`tetraRotX` as a *deterministic function of tetraRotY's own progress*:
`tetraRotX = TETRA_ALIGN_X + TETRA_AUTOSPIN_TILT * Math.sin(tetraRotY -
TETRA_ALIGN_Y)`. Deliberately tied this way, not a second independently
time-driven variable: `sin(0) = 0` at every exact multiple of a full
revolution — i.e. at *exactly* the same instants `tetraRotY`'s own
crossing already identifies as "the hexagon view is back" — so
`tetraRotX` is always back at `TETRA_ALIGN_X` too, right when it needs
to be, with zero risk of the two drifting out of sync. At settle, both
are still hard-snapped to their exact canonical values (`TETRA_ALIGN_X`/
`TETRA_ALIGN_Y`), not left to merely converge via the sine.

**This exposed a real, pre-existing bug in `drawDoorWordLabel`**, not a
new one the tilt introduced: see that function's own note above. Caught
by an exhaustive Node sweep (not a screenshot that happened to catch a
bad angle) — the general lesson: *any* screen-space offset computed
relative to a rotating 3D object should be checked across a full sweep
of the rotation, in Node, before trusting a handful of screenshots at
arbitrary instants not to have missed a bad angle. A screenshot confirms
one instant; a sweep confirms all of them.

### Cheat-sheet vertex pulse — the *third* wall-clock exception

The one vertex actually matching the current secret (`hintedGroup`)
slowly grows and shrinks, real-time, for as long as the current round
is still untouched — drawing the eye to exactly which corner "the code"
means, right when the code first becomes visible, before the player's
own first move that round. Requested directly, in those terms — "a
sphere that slowly increases/decreases in radius" — where "sphere"
means the vertex's own existing glowing dot (`drawGlow`, a radial-
gradient glow that already reads as a small glowing orb), not a new 3D
primitive.

- `isCheatsheetPulseActive()` → `cheatsheetRevealed && selectedDoors.size
  === 0`. **Not** `gamePhase === 'cheatsheet'` (the first version) —
  `gamePhase` only ever passes through `'cheatsheet'` once per
  *session*; every later round (reached via "Play again," which always
  re-`randomizeSecret()`s) goes straight to `'hinted'` and stays there,
  so that check fired the pulse once, on the very first reveal, and
  never again — reported directly as "after the first
  growing/shrinking... it apparently stops doing it." Keying off
  `selectedDoors` instead re-arms naturally every time `resetRound()`
  clears it, at the start of *every* round, not just the first.
- `CHEATSHEET_PULSE_PERIOD_S` (3.5s), `CHEATSHEET_PULSE_SPEED`
  (`2*PI / period`), `CHEATSHEET_PULSE_AMPLITUDE` (`0.75`, i.e. grows
  up to +75% of the dot's own base radius). A gentle multi-second
  breathing cycle, deliberately not a fast flash — but a *big* swing:
  an initial ±40% amplitude, symmetric around the base radius, was
  reported directly as still too subtle to reliably notice; widened to
  ±75% next — then reported a *second* time as the dot shrinking "way
  too small" at its own trough (a symmetric swing means it dips as low
  as `dotR * 0.25`, a quarter its resting size). **The wave's own shape
  changed, not just the number**: `glowR = dotR * (1 +
  CHEATSHEET_PULSE_AMPLITUDE * wave)`, where `wave = (1 - cos(phase)) /
  2` — a raised cosine ranging `[0, 1]`, not a plain sine ranging
  `[-1, 1]`. `glowR` now only ever grows *larger* than `dotR`, bottoming
  out at exactly `dotR` (verified directly: the multiplier's own range
  across many full cycles is exactly `[1, 1.75]`, checked numerically in
  Node, not just eyeballed) — "have it become larger/smaller only to
  the original size when smallest," requested in those terms. Tuned by
  watching it over several cycles, not from a single screenshot (a
  pulse is inherently a multi-frame thing to judge).
- Reads real time via `lastFrameNowMs` (set at the top of `frame(now)`,
  every frame) rather than having a parameter threaded through
  `drawScene`/`drawGameScene`/`drawGameBoard` — the same "module-level
  state read directly" pattern `tetraRotX/Y` already use, now extended
  to a plain timestamp.
- **Only the glow's own radius pulses** — `drawGameBoard` computes a
  separate `glowR` for the `drawGlow` call, while the vertex code
  label's own gap (`dotR * 2.8`) still reads off the *unpulsed* `dotR`.
  Coupling the label's position to the pulsing radius too was tried
  first and reverted immediately (still in the same editing pass, never
  screenshotted) — the label visibly bobbing up and down in sync with
  the glow read as distracting jitter on the text itself, not a
  deliberate effect; the glow alone breathing, with the label held
  perfectly still, was the version that actually looked intentional.
- `frame()`'s own render-or-not check gained a third OR clause —
  `isCheatsheetPulseActive()` — forcing a repaint every frame for as
  long as that's true, parallel to `updateTetraAutoSpin`'s own return
  value. No settle/snap semantics of its own to get right here (unlike
  the auto-spin): the pulse simply stops changing, wherever it happens
  to be in its own cycle, the instant a door gets selected — there's no
  "must end at a specific canonical value" fact to land on exactly.
- **Verified by sampling brightness at a fixed screen offset from each
  of the 4 vertices across ~4 real seconds**, not just by eyeballing a
  screenshot (a pulse, like the auto-spin's own rotation rate, is a
  claim about *change over real time* — a single screenshot can't
  confirm or refute it on its own): the hinted vertex's own sample swings
  by a large margin (hundreds, in raw summed-RGB terms) while the other
  three stay *exactly* constant, confirming both that the right vertex
  pulses and that no other vertex does. Re-checked across *two*
  consecutive rounds (not just one) specifically to catch the
  re-triggering bug above — the first version's own test suite only
  ever checked a single round, which is exactly why that bug shipped
  initially undetected.

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
   this. This is *why* the once-separate 2D board's own two-radii layout
   was simplified to a plain hexagon (and, later, deleted outright when
   that whole 2D board merged into the tetrahedron itself — see "This
   session's redesign" above) — that two-radii layout's whole reason to
   exist was keeping those now-gone fan-lines from crossing.
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
  safe everywhere it's already used.** (Later, once the 2D board and the
  tetrahedron merged into one continuously-interactive scene —
  see "This session's redesign" above — `isGameInteractive()`'s own
  upper bound went away entirely, and `hasReachedGame()`/`isTetraActive()`
  collapsed back into it: the two questions this bug entry is about
  stopped needing different answers at all.)
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
  thing to feel out at 400vh total vs. 900vh total.** (This entire gap,
  and the `tetraStart`/`tetraSweepEnd` chapters it was protecting, were
  later deleted outright — see "This session's redesign" above — once
  there was no separate reveal left that scrolling past too quickly
  could cause you to miss.)
- **`TETRA_BOARD_RADIUS_MULT` sized for the worst case, clipped in the
  common case**: see "This session's redesign" above — the same
  "compute actual amounts, don't just eyeball a formula" lesson as the
  scroll-gap bug above, applied to a rotation-dependent visual extent
  instead of a scroll distance.

## Naming/vocabulary cheat sheet

- **Door** = one of 6 elements of the universe `M` (the game's action
  space). Drawn as a small cube on the tetrahedron's own edge, never a
  disc/circle (discs mean "kernel" everywhere in this piece).
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
- **Illustrative prize/dud doors** (`ILLUSTRATIVE_PRIZE_DOOR = 0`,
  `ILLUSTRATIVE_DUD_DOOR = 1`) = a fixed, always-the-same pair used
  purely to dramatize the walk-through cards before `playArrive` — never
  the real, randomized `carDoor`/`zonkDoor`, and never involved in real
  scoring. See "Tetrahedron auto-spin, illustrative highlighting..."
  above.

## If you're picking this up fresh, in order of likely need

1. Confirm `git log --oneline -5 -- content/explainer-less-is-more/`
   matches what you'd expect (recent commits should mention
   hexagon/tetrahedron/merge/tap-vs-drag).
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
