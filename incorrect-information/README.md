# The Price of Incorrect Information — a scroll-driven explainer

A scroll-scrubbed dramatization of the paper's "price of incorrect
information" result. It's a zero-dependency companion piece to the paper —
same convention as `content/demo-game-show-code/` and the sibling
explainers: no build step, no libraries, no CDN calls.

## The story

Alice and Bob are packing for a trip. They each checked the weather
forecast at a different time — Alice's check was the more recent one, and
Bob knows it.

- **Ordinary ignorance**: Bob's own (earlier) forecast gave a wider
  temperature range, but one that still contains Alice's later, more
  precise one. Bob's belief is outdated, not wrong.
- **Incorrect information**: in a second scenario, Bob's earlier forecast
  told a completely different story, sharing no temperature with Alice's
  current one. Bob isn't just behind now; he's flatly wrong.

The piece then asks: how much does it cost Alice to bring Bob up to speed,
in each case, as Bob's own belief gets more specific/confident? The two
costs are the paper's own `Λ(p_s, p_r−p_s)` (ignorance) and
`Λ(p_s, 1−p_r−p_s)` (incorrect information) — plotted live as a ratio that
climbs sharply for the wrong-belief case as `p_r → p_s`, while the
ignorance case's own cost shrinks to nothing.

## What it illustrates

- **One shared temperature axis**, not separate diagrams per scenario.
  Both of Bob's beliefs are drawn as translucent horizontal capsule bands
  on it (`drawBand` in `script.js`); Alice's own kernel is a small, fixed
  band at a set temperature. Because the bands are translucent, the
  region where Bob's ignorant belief *contains* Alice's own is visible as
  a literal color blend, not just asserted — and Bob's wrong belief is a
  second band centered far enough away that it never touches Alice's, at
  any width: disjointness as plain spatial separation on one ruler.
- **One shared kernel-size function** (`kernelHalf(p_r)`) drives both of
  Bob's bands identically — at any given `p_r`, his ignorant and wrong
  beliefs are exactly the same size. Only the bands' *centers* differ, far
  enough apart that they never overlap even at their widest.
- **Three linked statements**: Alice's, Bob's ignorant one, and Bob's
  wrong one, each a two-line attribution+quote (e.g. `Bob (incorrect
  information): "Between 74° and 96°."`), each with its own colored
  growing link down to its own band, all three temperature-based and
  live-updating from the very first frame — no qualitative-to-numeric
  hand-off partway through.
- **A live cost-ratio chart** (`drawChart`) plots `Λ(p_s,1−p_r−p_s) /
  Λ(p_s,p_r−p_s)` against `p_r`, with a marker that rides exactly on the
  visible (clipped) curve at every point — walking the same discrete
  samples used to stroke the curve itself, rather than being computed
  independently and risking drifting off it.
- Every rendered temperature, at every `p_r` in the piece's own
  configured range, stays within temperatures that actually happen on
  Earth (roughly 0°–100°F) — a deliberate constraint on the scale
  constants, not an afterthought.

## How it works

A single scalar `t ∈ [0,1]`, recomputed every animation frame from scroll
position (`computeT()`), drives everything as a continuous scrub — the
same convention as the sibling explainers. `p_r` (Bob's own kernel size)
holds at its loosest value through the recap/contrast chapters, then
decreases continuously with `t` through the "shrink" chapter; nothing
about it is a discrete step.

- `index.html` — page shell: a tall scroll track with a `position: sticky`
  pinned `<canvas>`, plus the overlaid `.legend` caption card.
- `style.css` — dark theme, sticky pin container, and the caption card
  styling for `.legend`.
- `script.js` — the shared temperature axis and band drawing
  (`axisRect`/`drawBand`/`drawAxis`), the three attributed statements and
  their links (`drawAttributedStatement`, `drawIgnorance`,
  `drawWrongBelief`), the live cost-ratio chart (`drawChart`), the
  `LEGEND_CHUNKS` copy and `updateLegend()` that swaps the caption card's
  text as `t` crosses each chapter boundary, and the
  `requestAnimationFrame` render loop.

## Viewing it locally

No build step. Either open the file directly:

```
open index.html
```

or serve the directory:

```
python3 -m http.server
```

then visit `http://localhost:8000/`.

Scroll all the way through; scrolling back up scrubs the animation
backward smoothly. Resizing the window (including narrow/mobile widths)
re-letterboxes the scene and repaints immediately at the current scroll
position.
