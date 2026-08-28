# Reasoning Amplifies Information — a scroll-driven explainer

A scroll-scrubbed introduction to Figure 1 of the paper. It's a
zero-dependency companion piece to the paper — same convention as
`content/demo-game-show-code/` and the sibling explainers: no build step,
no libraries, no CDN calls.

## The story

The piece opens with the question Richard Feynman once posed in his
*Lectures on Physics*: if all scientific knowledge were destroyed, and
only one sentence could be saved for the future, which sentence would let
that future rebuild the most? His own answer — "all things are made of
atoms, little particles that move around in perpetual motion, attracting
each other when they are a little distance apart, but repelling upon
being squeezed into one another" — is short, but hides an enormous amount
of knowledge, unlocked only by a mind able to reason from it.

Shannon's classical model of communication has nothing to say about that
unlocking: it ends the instant a message is decoded. The piece draws that
model as a simple pipeline (message → encode → bits → decode → recovered
message), then draws a second, parallel pipeline for a logic sentence —
identical up through decoding, but extended with one new stage
underneath: the receiver's own deductive machinery, turning the decoded
sentence into deduced facts the sender never had to send explicitly. That
extra stage is what the rest of the paper is about.

## What it illustrates

- **The one stage Shannon's model leaves out.** Both pipelines share an
  identical prefix (encode → bits → decode); the extension is drawn as a
  literal new stage appended after that prefix, not a different diagram
  making a similar point — the visual comparison *is* the argument.
- **Real vector diagrams, not hand-drawn canvas shapes.** The two pipeline
  rows are actual SVGs compiled from (recolored) TikZ sources — see
  `tikz-src/README.md` — positioned and revealed (a left-to-right
  clip-path wipe) by `script.js`, not drawn primitive-by-primitive on the
  canvas the way the sibling pieces' diagrams are. Only the Feynman quote
  itself is still canvas text, since there's no diagram to be low-quality
  there.
- **The bottom row's own new stages read in logical order, not reading
  order.** Its "deductive machinery" and "deduced facts" sit *below* the
  shared prefix, not to its right — so the reveal happens in two
  sequential phases (the shared band first, left-to-right; then
  everything below it, top-to-bottom) rather than one wipe that would
  otherwise reveal the second new stage before the first.
- **Chapter timing keyed to the actual story beats**, not a flat split:
  Feynman's own setup, his answer, Shannon's model, the extension, and
  the closing point each get their own `t`-range, matching the sibling
  explainers' convention.

## How it works

A single scalar `t ∈ [0,1]`, recomputed every animation frame from scroll
position (`computeT()`), drives everything as a continuous scrub — the
same convention as the sibling explainers; there is no discrete step
logic.

- `index.html` — page shell: a tall scroll track with a `position: sticky`
  pinned `<canvas>`, the two `<img class="diagram-row">` pipeline SVGs
  overlaid on top of it, plus the `.legend` caption card.
- `style.css` — dark theme, sticky pin container, `.diagram-row`
  positioning context (actual position/size set in `script.js`, matching
  the canvas's own letterboxing), and the caption card styling.
- `script.js` — `drawFeynman()` for the canvas-drawn setup/quote text,
  `layoutDiagramRows()`/`revealRow()`/`revealBottomRow()` for positioning
  and wiping the two SVGs in, the `LEGEND_CHUNKS` copy, and the
  `requestAnimationFrame` render loop.
- `assets/` — the two compiled SVGs (`shannon_top_row.svg`,
  `shannon_bottom_row.svg`); `tikz-src/` has their LaTeX/TikZ sources and
  its own README describing the exact build.

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
re-letterboxes the scene and repositions the two diagram rows immediately
at the current scroll position.
