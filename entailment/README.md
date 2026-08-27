# What a Sentence Means — a scroll-driven explainer

A scroll-scrubbed introduction to kernels and entailment (Figure 2(b)-(e) of
the paper). It's a zero-dependency companion piece to the paper — same
convention as `content/demo-game-show-code/` and the sibling explainers: no
build step, no libraries, no CDN calls.

## The story

Alice tells Bob, "It's raining and cold." One theory of what a sentence
means: it gives information about a hypothetical world, narrowing down its
specifics — ruling some possibilities in, others out. The piece makes this
concrete by drawing a sentence's meaning as a disc containing a handful of
labeled *possible worlds* — fully specified mini-sentences, not abstract
points — so "a kernel is a set of possibilities" is something the viewer
can actually read, not just take on faith.

A differently-worded but logically equivalent sentence ("It's cold and
raining") shares that same kernel. A weaker sentence ("It's cold") gets a
second, larger, concentric circle around the same worlds plus new ones —
entailment as literal, visible containment — and once that containment is
the point being made, both sentences' own statements reappear side by side,
joined by the entailment symbol (⊢), so the comparison is between two
actual sentences, not just two unlabeled nested circles. The piece
deliberately stops there: no third, unrelated sentence and no
conjunction/intersection story — it stays focused on the one conceptual
hurdle it exists to clear, why a *stronger* sentence's kernel looks
*smaller*.

## What it illustrates

- **Possible worlds as readable dots, not abstract points.** Each world is
  a fully-specified mini-sentence over three independent attributes
  (raining, cold, wind condition); the ones satisfying "raining and cold"
  are introduced one at a time — before the word "kernel" is even used —
  so the idea of a sentence ruling worlds in/out has something concrete to
  point at before it's named.
- **Entailment as literal containment.** A weaker sentence's kernel is
  drawn as a bigger circle around the same shared center, containing every
  world the stronger one's does, plus more. Both circles, and both
  sentences' own statements, persist all the way to the piece's closing
  frame — the visual comparison *is* the closing point ("a smaller kernel
  means a stronger sentence"), so it's still on screen when the legend
  states it in words.
- **Genuinely measured layout, not guessed.** The kernel's own horizontal
  position is the midpoint of both incoming statements' actual
  text-centers (not a fixed board fraction), so their two links land at
  truly symmetric angles. The tight "A ⊢ B" comparison layout is likewise
  derived from `ctx.measureText()` on the real rendered strings, so it
  holds together the same way at every viewport, narrow phone widths
  included.
- **Chapter timing proportional to reading load.** Each chapter's own
  width (of the single scalar `t ∈ [0,1]`) is proportional to the word
  count of its legend caption, plus a fixed per-chapter buffer — so a
  short caption still gets a comfortable minimum, and a long one gets
  correspondingly more scroll distance to read it in, rather than a flat
  split.

## How it works

A single scalar `t ∈ [0,1]`, recomputed every animation frame from scroll
position (`computeT()`), drives everything as a continuous scrub — the same
convention as the sibling explainers; there is no discrete step logic.

- `index.html` — page shell: a tall scroll track with a `position: sticky`
  pinned `<canvas>`, plus the overlaid `.legend` caption card.
- `style.css` — dark theme, sticky pin container, and the caption card
  styling for `.legend`.
- `script.js` — the possible-worlds table and kernel-drawing helpers
  (`drawInnerKernel`, `drawReword`, `drawColdKernel`, `drawEntailCompare`),
  the shared `entailCompareLayout()` both the weaker statement and the
  entailment symbol slide into, the `LEGEND_CHUNKS` copy (some chunks are
  plain strings, one is a function of `t` so its caption builds up in sync
  with the world-dots it describes) and `updateLegend()` that swaps the
  caption card's text as `t` crosses each chapter boundary, and the
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
