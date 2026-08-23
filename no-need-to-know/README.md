# No Need to Know — a scroll-driven explainer

A scroll-scrubbed animation of the "No need to know" decoding mechanism. It's
a zero-dependency companion piece to the paper — same convention as
`content/demo-game-show-code/`: no build step, no libraries, no CDN calls.

## What it illustrates

Mirroring Figure 2(g)–(h) of the paper:

- A concrete logic statement — "It's raining and cold." — is linked to its
  **kernel** κ(·): the set of models satisfying it, drawn as a blob
  containing a few model-points, the same way the paper itself draws
  kernels in Figure 2(b)–(d). That kernel then collapses into a single
  point: "this whole set is represented by one dot."
- That dot turns out to be one of many candidate kernels, laid out in a
  grid. Each dot = one candidate kernel (some other sentence Alice could
  have meant).
- Alice hashes her kernel to one of **4 bins** (2 bits). Every dot in the
  grid snaps to one of 4 hues accordingly — green, blue, magenta, or slate
  gray, assigned by a coset rule (`hashBinOf` in `script.js`: hash bin =
  column parity × row parity), not i.i.d. randomness. This mirrors the
  actual regular, periodic color banding visible on the real PNAS cover
  photo (confirmed by sampling it directly) — hash bins are cosets of a
  sublattice, not scattered noise.
- Bob's window κ(R) is the set of kernels that provably entail what Bob
  already knows. It's drawn as a glowing rectangle centered on the true
  kernel with a half-width of exactly 2 grid units — so it contains exactly
  one *whole* green circle (the true kernel) and clips every other
  same-colored kernel it touches only partially (half-lit at the window's
  edges, quarter-lit at its corners), never fully. That partial capture is
  the point: those are the confounders Bob rejects by entailment, not by
  color.
- Inside the window, kernels that hashed to a different bin fade further.
  The green confounders shrink and fade away, nearest ones first, until
  only the true kernel — the one that's both in the window and matches the
  received bin — is left, alone, glowing.
- The piece then expands the lone dot back out into two sentences: Alice's
  original ("It's raining and cold.", top-left, the same one shown at the
  start) and a logically equivalent but differently-worded reconstruction
  Bob could have arrived at instead ("It's cold and raining.", placed east
  of the kernel — at the same height, not south of it, so the legend card
  docked at the bottom never occludes it). A growing link (the same
  `drawGrowingLink` used for the intro's statement→kernel line) extends
  from the kernel to each sentence, emerging from close to the text itself
  rather than from a separate node circle — one circle for the statement
  and another for the kernel read as more shapes than the diagram needs.
  Same meaning, different words — the point made about equivalent
  sentences up front, now shown in reverse as the resting frame.

The graphic ends there, holding on that result. Its own narration is
limited to a handful of short in-canvas captions ("one of many candidate
kernels", "hashed into one of 4 bins" with the hues shown as swatches,
"Bob's kernel", and the confounder-elimination rule, plus the labels on
the statement/kernel diagrams at the start and end) — everything else is
dots, glow, and color on a near-black background. A fuller, general-audience explanation
rides alongside it as a caption card overlaid near the bottom of the
pinned graphic (`.legend` in `index.html`), whose heading and body text
are swapped by `script.js` as the same `t` crosses each chapter boundary —
NYT-style captions that progress *with* the graphic, rather than a single
block of prose parked after it.

## How it works

A single scalar `t ∈ [0,1]`, recomputed every animation frame from scroll
position (`script.js`, `computeT()`), drives everything: the intro
statement/kernel diagram, dot appearance and color, and the position of
Bob's window. This is a continuous scrub (like NYT's data-driven scroll
pieces), not a discrete step/reveal pattern — there are no separate "steps"
beyond loose chapter boundaries (`CH` in `script.js`) used purely to
schedule when different visual elements fade in or out.

- `index.html` — page shell: a tall (`600vh`) scroll track with a `position:
  sticky` pinned `<canvas>`, plus the overlaid `.legend` caption card, both
  inside it.
- `style.css` — dark theme, sticky pin container and letterboxing
  background for the graphic, plus the translucent, comfortably-readable
  caption card styling for `.legend`.
- `script.js` — grid construction (seeded RNG drives only the idle
  breathing phase; hash-bin colors are fully deterministic), the intro
  statement → kernel → grid-seed sequence, the `t → per-dot render state`
  mapping for every chapter, Bob's window and its clipped two-pass dot
  rendering, the in-canvas captions, the `LEGEND_CHUNKS` copy and
  `updateLegend()` that swaps the caption card's text as `t` crosses each
  chapter boundary, and the `requestAnimationFrame` render loop.

A slow, independently-seeded "breathing" pulse runs on every dot at all
times (driven by wall-clock time, not scroll), so the piece still feels
alive if the user stops scrolling mid-way.

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
