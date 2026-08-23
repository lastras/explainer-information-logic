// -----------------------------------------------------------------------
// "No Need to Know" -- a scroll-scrubbed build-up of the "No need to know"
// decoding mechanism (Figure 2(g)-(h) of the paper).
//
// A logic statement is linked to its *kernel* (the set of models that
// satisfy it -- see kappa(.) in the paper), which then collapses into a
// single point in a grid of candidate kernels, each colored by which of 4
// hash bins it falls into. Bob's window kappa(R) isolates the single true
// kernel from same-colored "confounders" that land in the same hash bin
// but get rejected because they don't entail what Bob already knows.
// There is no discrete step logic (a la Scrollama): a single scalar t in
// [0,1], derived every frame from scroll position, drives everything as a
// continuous scrub. The piece ends holding on the filtered result -- the
// one true kernel, alone in Bob's window.
// -----------------------------------------------------------------------

(function () {
  "use strict";

  // ---- Chapter boundaries (t ranges), per the storyboard -----------------
  const CH = {
    statementEnd: 0.08, // 0: the logic statement, alone
    linkEnd: 0.22, // 1: a link grows from the statement to its kernel
    collapseEnd: 0.32, // 2: the kernel set collapses into a single point
    gridEnd: 0.48, // 3: pull back to the full grid of candidate kernels
    hashEnd: 0.64, // 4: hash to 2 bits (4 hues)
    windowEnd: 0.74, // 5: Bob's window arrives
    // 6: 0.74 -> 1.00 filtering out confounders -- ends here, holding on
    // the one true kernel alone in Bob's window.
  };

  // ---- Legend copy, synchronized to the same chapter boundaries as the
  // graphic itself -- reviewed against the paper's actual text (kernels,
  // hash bins, entailment, confounders) so it stays accurate for a
  // general audience. Each chunk's heading/body replaces the previous
  // one's as t crosses its `from` threshold; together they cover the
  // full [0,1] range with no gaps.
  const LEGEND_CHUNKS = [
    {
      from: 0,
      heading: "A statement's meaning is a set of possibilities",
      body:
        '"It\u2019s raining and cold" and "it\u2019s cold and raining" are different sentences that leave open exactly the same possibilities. That shared set of possibilities is called a kernel \u2014 every way the world could turn out to be, consistent with what was said.',
    },
    {
      from: CH.collapseEnd,
      heading: "One kernel among many candidates",
      body:
        "The glowing disc is Alice's kernel \u2014 but it's only one of many things she could have meant. Every other disc is a different candidate, each with its own set of possibilities. We show these discs here without overlaps, but in general they can overlap.",
    },
    {
      from: CH.gridEnd,
      heading: "A fingerprint, not the whole thing",
      body:
        "Sending Alice's whole kernel would be expensive. Instead, she and Bob agree in advance on a hashing scheme that sorts every possible kernel into one of four bins \u2014 just two bits \u2014 and Alice sends only the bin number. In this case, that's green.",
    },
    {
      from: CH.hashEnd,
      heading: "Bob already knows something, too",
      body:
        "Bob has his own kernel, based on what he already knows. We assume Bob knows less than Alice, but that whatever he knows doesn't contradict what she knows \u2014 geometrically, that's exactly why Alice's kernel always sits inside Bob's.",
    },
    {
      from: CH.windowEnd,
      heading: "Ruling out confounders",
      body:
        "Bob keeps only candidates that both match Alice's hash bin and are consistent with what he already knows. Confounders \u2014 other candidates that happen to share Alice's hash bin \u2014 get rejected because they fail that second test.",
    },
    {
      from: 0.95,
      heading: "No need to know",
      body:
        "The bins are sized so that, almost always, exactly one candidate survives \u2014 Alice's true kernel, recovered from just a couple of bits, without her ever needing to know what Bob knew in advance. Bob's reconstruction doesn't have to match her wording, only her kernel \u2014 like the two equivalent statements shown here.",
    },
  ];

  // ---- Palette, sampled from the source cover photo -----------------------
  const BG = "#050208";
  const PALETTE_HEX = [
    "#14b37a", // 0: green / seed hue
    "#3b7fe0", // 1: blue
    "#d15fd0", // 2: magenta
    "#9aa0bd", // 3: slate gray
  ];
  const SEED_GLOW_HEX = "#b8fffa";
  const NEUTRAL_HEX = "#dfe8ea"; // seed dot's pre-hash "uncolored" glow
  const DIM_GRAY_HEX = "#2b2d36"; // other dots' pre-hash, dim/unlit state
  const LABEL_HEX = "#dfe8ea";

  // ---- Grid layout ---------------------------------------------------------
  // 7x9 dots fully visible, plus one extra bleed column/row on every side
  // so dots crop off all four edges rather than stopping neatly at the
  // frame. This is a stylized approximation of the real cover photo's
  // lattice, not a pixel-accurate reproduction of it.
  const COLS_VISIBLE = 7;
  const ROWS_VISIBLE = 9;
  const BOARD_ASPECT = COLS_VISIBLE / ROWS_VISIBLE; // portrait framing, letterboxed on wide viewports
  const SEED_COL = 2; // even/even so the seed falls on the green coset below
  const SEED_ROW = 4;

  // Hash bin = 2 bits = (column parity, row parity). This makes every
  // hash bin a *coset* of the sublattice (2Z x 2Z) inside the grid's index
  // lattice Z x Z -- exactly the regular, periodic banding visible on the
  // real cover photo (confirmed by sampling it directly), rather than an
  // i.i.d. random color per dot.
  function hashBinOf(col, row) {
    const cm = ((col % 2) + 2) % 2;
    const rm = ((row % 2) + 2) % 2;
    return cm * 2 + rm; // 0..3; (even,even) -> 0 -> green
  }

  // Bob's window kappa(R): a square centered on the seed with half-width
  // of exactly 2 grid units. Because the green coset repeats every 2
  // columns/rows, the *nearest* other kernels sharing the seed's hash bin
  // sit exactly 2 units away orthogonally (or 2*sqrt(2) away diagonally)
  // -- so this half-width makes the window's boundary pass directly
  // through their centers. The window therefore contains exactly one
  // *whole* green circle (the seed) and only ever clips every other green
  // circle it touches partially, never fully -- mirroring how Bob rejects
  // confounders by entailment, not by color.
  const WINDOW_HALF_PITCH = 2;

  const RNG_SEED = 0x5eed1e55;

  // ---- Small helpers --------------------------------------------------------
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function clamp(x, lo, hi) {
    return Math.max(lo, Math.min(hi, x));
  }

  function smoothstep(edge0, edge1, x) {
    if (edge0 === edge1) return x < edge0 ? 0 : 1;
    const u = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return u * u * (3 - 2 * u);
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  const PALETTE = PALETTE_HEX.map(hexToRgb);
  const SEED_GLOW = hexToRgb(SEED_GLOW_HEX);
  const NEUTRAL = hexToRgb(NEUTRAL_HEX);
  const DIM_GRAY = hexToRgb(DIM_GRAY_HEX);
  const LABEL_COLOR = hexToRgb(LABEL_HEX);

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpColor(c1, c2, t) {
    return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
  }

  function rgbCss(c, alpha) {
    return `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, ${alpha})`;
  }

  // Points scattered inside the unit circle, used to draw a kernel as a
  // set containing a handful of models -- matching the paper's own
  // Figure 2(b)-(d) convention of drawing a kernel as a blob of points,
  // rather than just a bare circle.
  const KERNEL_MODEL_POINTS = [
    [-0.3, -0.4],
    [0.35, -0.25],
    [0.1, 0.1],
    [-0.45, 0.3],
    [0.3, 0.45],
    [-0.05, -0.55],
  ];

  // ---- Build the logical grid (positions independent of pixel size) ------
  // Runs once at startup. Hash-bin colors are fully deterministic (the
  // coset rule above); the seeded RNG here only drives each dot's
  // breathing phase, so that stays stable across reloads too.
  function buildGrid() {
    const rng = mulberry32(RNG_SEED);
    const dots = [];

    for (let row = -1; row <= ROWS_VISIBLE; row++) {
      for (let col = -1; col <= COLS_VISIBLE; col++) {
        const isSeed = col === SEED_COL && row === SEED_ROW;
        const dc = col - SEED_COL;
        const dr = row - SEED_ROW;
        const dist = Math.sqrt(dc * dc + dr * dr);

        dots.push({
          col,
          row,
          isSeed,
          hashBin: hashBinOf(col, row),
          dist,
          phase: rng() * Math.PI * 2,
          // filled in by layoutGrid() whenever the canvas is (re)sized:
          x: 0,
          y: 0,
          baseRadius: 0,
        });
      }
    }

    let maxDist = 0;
    for (const d of dots) maxDist = Math.max(maxDist, d.dist);
    for (const d of dots) d.distNorm = maxDist > 0 ? d.dist / maxDist : 0;

    return dots;
  }

  // ---- Canvas / DOM setup --------------------------------------------------
  const track = document.getElementById("scrollTrack");
  const canvas = document.getElementById("scene");
  const ctx = canvas.getContext("2d");
  const legendHeadingEl = document.getElementById("legendHeading");
  const legendBodyEl = document.getElementById("legendBody");

  const grid = buildGrid();
  let board = { bx: 0, by: 0, bw: 0, bh: 0 };
  let pitch = 0;
  let dpr = window.devicePixelRatio || 1;
  let lastT = 0;
  let legendChunkIndex = -1;

  // Only touches the DOM when the active chunk actually changes.
  function updateLegend(t) {
    let idx = 0;
    for (let i = 0; i < LEGEND_CHUNKS.length; i++) {
      if (t >= LEGEND_CHUNKS[i].from) idx = i;
    }
    if (idx === legendChunkIndex) return;
    legendChunkIndex = idx;
    legendHeadingEl.textContent = LEGEND_CHUNKS[idx].heading;
    legendBodyEl.textContent = LEGEND_CHUNKS[idx].body;
  }

  function computeBoard(cw, ch) {
    let bw, bh;
    if (cw / ch > BOARD_ASPECT) {
      bh = ch;
      bw = bh * BOARD_ASPECT;
    } else {
      bw = cw;
      bh = bw / BOARD_ASPECT;
    }
    return { bx: (cw - bw) / 2, by: (ch - bh) / 2, bw, bh };
  }

  function layoutGrid() {
    pitch = board.bw / COLS_VISIBLE;
    for (const d of grid) {
      d.x = board.bx + (d.col + 0.5) * pitch;
      d.y = board.by + (d.row + 0.5) * pitch;
      d.baseRadius = pitch * 0.3;
    }
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const cw = track.clientWidth || window.innerWidth;
    const ch = window.innerHeight;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    board = computeBoard(cw, ch);
    layoutGrid();
    render(lastT); // repaint immediately at the current t, no blank flash
  }

  // ---- Scroll -> t ----------------------------------------------------------
  function computeT() {
    const trackHeight = track.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrollRange = trackHeight - viewportHeight;
    if (scrollRange <= 0) return 0;
    const top = track.getBoundingClientRect().top;
    return clamp(-top / scrollRange, 0, 1);
  }

  // ---- Drawing helpers --------------------------------------------------------
  function drawGlow(x, y, radius, color, alpha) {
    if (alpha <= 0 || radius <= 0) return;
    const haloRadius = radius * 3.2;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, haloRadius);
    grad.addColorStop(0, rgbCss(color, alpha * 0.55));
    grad.addColorStop(1, rgbCss(color, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, haloRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = rgbCss(color, alpha);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // A line that grows from `from` toward `to` as `progress` goes 0->1,
  // with a glowing leading tip while still in motion -- used for every
  // statement/kernel link in the piece (the intro's and the finale's) so
  // they all read as the same kind of connection, drawn the same way.
  function drawGrowingLink(from, to, progress, alpha) {
    if (alpha <= 0 || progress <= 0) return;
    const tipX = lerp(from.x, to.x, progress);
    const tipY = lerp(from.y, to.y, progress);
    ctx.save();
    ctx.strokeStyle = rgbCss(SEED_GLOW, alpha * 0.5);
    ctx.lineWidth = Math.max(1, pitch * 0.02);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();
    ctx.restore();
    if (progress < 1) drawGlow(tipX, tipY, pitch * 0.05, SEED_GLOW, alpha);
  }

  // Draws a label at (x,y). If opts.maxWidth is given, greedily word-wraps
  // onto multiple lines instead of overflowing. Returns the total height
  // drawn, so callers can stack more content underneath (e.g. color
  // swatches below a caption).
  function drawLabel(text, x, y, alpha, align, opts) {
    if (alpha <= 0) return 0;
    opts = opts || {};
    const size = pitch * 0.16 * (opts.sizeMult || 1);
    const lineHeight = size * 1.35;
    ctx.save();
    ctx.font = `${size}px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`;
    ctx.textAlign = align || "left";
    ctx.textBaseline = "top";
    ctx.shadowColor = rgbCss(SEED_GLOW, alpha * 0.7);
    ctx.shadowBlur = size * 0.5;
    ctx.fillStyle = rgbCss(LABEL_COLOR, alpha);

    let lines = [text];
    if (opts.maxWidth) {
      lines = [];
      let line = "";
      for (const word of text.split(" ")) {
        const test = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(test).width > opts.maxWidth) {
          lines.push(line);
          line = word;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
    }

    // When anchored from the bottom, `y` is where the text block should
    // end rather than begin -- lets a caption grow upward, away from a
    // fixed edge, regardless of how many lines it wraps to.
    const topY = opts.anchor === "bottom" ? y - lines.length * lineHeight : y;

    lines.forEach((line, i) => ctx.fillText(line, x, topY + i * lineHeight));
    ctx.restore();
    return lines.length * lineHeight;
  }

  // "hashed into one of 4 bins" followed inline by the 4 hues themselves,
  // as one horizontally-centered row -- text and swatches side by side,
  // not stacked, so "a bin is a color" reads as a single statement. Text
  // uses textBaseline "middle" so it and the swatches share the exact same
  // centerY by construction, rather than a hand-tuned offset that can
  // drift depending on which font a browser substitutes.
  function drawHashCaption(centerX, centerY, alpha) {
    if (alpha <= 0) return;
    const text = "hashed into one of 4 bins";
    const size = pitch * 0.16 * 1.25;

    ctx.save();
    ctx.font = `${size}px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`;
    const textWidth = ctx.measureText(text).width;

    const gap = pitch * 0.2;
    const spacing = pitch * 0.24;
    const swatchR = pitch * 0.065;
    const swatchesWidth = spacing * (PALETTE.length - 1) + swatchR * 2;
    const leftX = centerX - (textWidth + gap + swatchesWidth) / 2;

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.shadowColor = rgbCss(SEED_GLOW, alpha * 0.7);
    ctx.shadowBlur = size * 0.5;
    ctx.fillStyle = rgbCss(LABEL_COLOR, alpha);
    ctx.fillText(text, leftX, centerY);
    ctx.restore();

    const firstSwatchX = leftX + textWidth + gap + swatchR;
    for (let i = 0; i < PALETTE.length; i++) {
      drawGlow(firstSwatchX + i * spacing, centerY, swatchR, PALETTE[i], alpha);
    }
  }

  // A concrete example carries the whole piece: two sentences that say the
  // same thing in a different order, so they share one kernel. Alice's is
  // shown up front; Bob's logically-equivalent-but-differently-worded
  // reconstruction is revealed at the very end (drawEquivalentStatements).
  const ALICE_STATEMENT = "It\u2019s raining and cold.";
  const BOB_STATEMENT = "It\u2019s cold and raining.";

  // ---- Chapters 0-2: a logic statement, linked to its kernel, which then
  // collapses into the single seed dot that anchors the rest of the piece.
  function statementPos() {
    return { x: board.bx + board.bw * 0.16, y: board.by + board.bh * 0.14 };
  }

  function seedPos() {
    return { x: board.bx + (SEED_COL + 0.5) * pitch, y: board.by + (SEED_ROW + 0.5) * pitch };
  }

  function drawIntro(t) {
    const stmt = statementPos();
    const kernel = seedPos();

    // The statement text, its link, and the kernel-set diagram all fade
    // out together as the kernel collapses into the plain seed dot (the
    // form every later chapter uses).
    const collapseP = smoothstep(CH.linkEnd, CH.collapseEnd, t);
    const introAlpha = 1 - collapseP;

    // The link (below) emerges from close to the statement's own text --
    // middle, below it -- rather than from a separate node circle: one
    // circle for the statement and another for the kernel read as more
    // shapes than the diagram needs.
    const stmtSize = pitch * 0.16;
    ctx.save();
    ctx.font = `${stmtSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`;
    const stmtWidth = ctx.measureText(ALICE_STATEMENT).width;
    ctx.restore();
    const stmtLineFrom = { x: stmt.x + stmtWidth / 2, y: stmt.y + stmtSize };

    // Ch.0: the statement text appears first.
    const statementAppear = smoothstep(0, 0.05, t);
    if (statementAppear > 0 && introAlpha > 0) {
      drawLabel(ALICE_STATEMENT, stmt.x, stmt.y, statementAppear * introAlpha * 0.9);
    }

    // Ch.1: a link grows from the statement to its kernel, drawn after
    // the label so its glowing tip is never hidden behind the text.
    const linkP = smoothstep(CH.statementEnd, CH.linkEnd, t);
    if (linkP > 0 && introAlpha > 0) {
      const a = introAlpha * (0.25 + 0.75 * statementAppear);
      drawGrowingLink(stmtLineFrom, kernel, linkP, a);
    }

    // ...blooming into the kernel: a set containing a few models, matching
    // how the paper itself draws a kernel (Figure 2(b)-(d)) -- then, once
    // the link has fully arrived (ch.2), collapsing back down into the
    // single point every later chapter builds on: this whole set is one
    // dot. Bloom-in and collapse share one radius formula so there is only
    // ever one circle on screen, never two overlapping ones.
    const kernelBloom = smoothstep(0.3, 1, linkP);
    const setRadius = pitch * 1.6 * kernelBloom * (1 - collapseP);
    const setAlpha = kernelBloom * (1 - collapseP);
    if (setAlpha > 0) {
      if (setRadius > pitch * 0.02) {
        ctx.save();
        ctx.fillStyle = rgbCss(NEUTRAL, setAlpha * 0.05);
        ctx.strokeStyle = rgbCss(SEED_GLOW, setAlpha * 0.6);
        ctx.lineWidth = Math.max(1, pitch * 0.02);
        ctx.beginPath();
        ctx.arc(kernel.x, kernel.y, setRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      for (const [px, py] of KERNEL_MODEL_POINTS) {
        drawGlow(kernel.x + px * setRadius, kernel.y + py * setRadius, pitch * 0.045, NEUTRAL, setAlpha * 0.85);
      }
      // Fades out quickly once the collapse starts, before the circle has
      // shrunk much, so the label doesn't visibly slide toward the point.
      const labelAlpha = setAlpha * (1 - smoothstep(0, 0.35, collapseP));
      drawLabel("kernel of the statement", kernel.x, kernel.y + setRadius + pitch * 0.14, labelAlpha * 0.9, "center");
    }
  }

  // Bob's window as a function of t: slides/scales in from the board's
  // corner during ch.5, then holds at its final size/position (centered on
  // the seed, half-width WINDOW_HALF_PITCH) for the rest of the piece.
  function windowRect(t) {
    const p = smoothstep(CH.hashEnd, CH.windowEnd, t);
    const kernel = seedPos();

    const finalSize = WINDOW_HALF_PITCH * 2 * pitch;
    const finalX = kernel.x - WINDOW_HALF_PITCH * pitch;
    const finalY = kernel.y - WINDOW_HALF_PITCH * pitch;

    const startX = board.bx;
    const startY = board.by;
    const startSize = finalSize * 0.15;

    const ease = smoothstep(0, 1, p);
    return {
      x: lerp(startX, finalX, ease),
      y: lerp(startY, finalY, ease),
      w: lerp(startSize, finalSize, ease),
      h: lerp(startSize, finalSize, ease),
      p,
    };
  }

  function drawWindowRect(rect, now) {
    if (rect.p <= 0) return;
    const pulse = 0.85 + 0.15 * Math.sin(now * 0.6);
    ctx.save();
    ctx.strokeStyle = rgbCss(SEED_GLOW, rect.p * pulse);
    ctx.lineWidth = Math.max(1.5, pitch * 0.035);
    ctx.shadowColor = rgbCss(SEED_GLOW, rect.p * 0.8);
    ctx.shadowBlur = pitch * 0.25;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
  }

  // ---- Per-dot state as a pure function of t (+ idle breathing) -----------
  // Drawn in two passes so that dots straddling Bob's window boundary show
  // up genuinely half-lit / quarter-lit rather than fully in or fully out:
  // pass 1 draws every dot in its "outside" (dimmable) appearance, then
  // pass 2 redraws every dot -- clipped to the window rect -- in its
  // "inside" (ch.6 filtering) appearance. Only the geometry inside the clip
  // region gets the brighter second pass, so partial overlaps read as a
  // literal partial capture.
  function renderDots(t, now, rect) {
    const seedAppear = smoothstep(CH.linkEnd, CH.collapseEnd, t);
    const gridAppear = smoothstep(CH.collapseEnd, CH.gridEnd - 0.04, t);

    const bases = grid.map((d) => {
      const appear = d.isSeed ? seedAppear : gridAppear;
      if (appear <= 0) return null;

      const breathe = 1 + 0.07 * Math.sin(now * 0.5 + d.phase);
      const breatheAlpha = clamp(1 + 0.1 * Math.sin(now * 0.5 + d.phase), 0.7, 1.3);

      // Ch.4: a wave of hash-color resolution sweeping out from the seed.
      const waveStart = CH.gridEnd + d.distNorm * 0.1;
      const hashProgress = smoothstep(waveStart, waveStart + 0.08, t);
      const preColor = d.isSeed ? NEUTRAL : DIM_GRAY;
      const hueColor = PALETTE[d.hashBin];

      return {
        color: lerpColor(preColor, hueColor, hashProgress),
        alpha: appear * breatheAlpha,
        radius: d.baseRadius * breathe,
      };
    });

    // Pass 1: the "outside the window" appearance -- full brightness
    // before ch.5, dimming toward black as Bob's window arrives (ch.5+).
    for (let i = 0; i < grid.length; i++) {
      const base = bases[i];
      if (!base) continue;
      const d = grid[i];
      const dim = d.isSeed ? 1 : 1 - rect.p * 0.85;
      drawGlow(d.x, d.y, Math.max(0, base.radius), base.color, clamp(base.alpha * dim, 0, 1));
    }

    // Pass 2: the "inside the window" appearance, clipped to Bob's window
    // -- this is where confounders get filtered out (ch.6).
    if (rect.p > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.w, rect.h);
      ctx.clip();

      for (let i = 0; i < grid.length; i++) {
        const base = bases[i];
        if (!base) continue;
        const d = grid[i];
        let alpha = base.alpha;
        let radius = base.radius;

        if (d.isSeed) {
          // The seed brightens slightly as everything else falls away,
          // then settles so the resting frame isn't still growing.
          radius *= 1 + 0.15 * smoothstep(CH.windowEnd, 0.9, t);
        } else if (d.hashBin !== 0) {
          // Non-green kernels inside the window fade further...
          alpha *= 1 - 0.75 * smoothstep(CH.windowEnd, CH.windowEnd + 0.08, t);
        } else {
          // ...and green confounders -- rejected by entailment, not by
          // color -- shrink/fade away, nearest ones first.
          const start = CH.windowEnd + 0.02 + d.dist * 0.03;
          const factor = 1 - smoothstep(start, start + 0.05, t);
          alpha *= factor;
          radius *= factor;
        }

        drawGlow(d.x, d.y, Math.max(0, radius), base.color, clamp(alpha, 0, 1));
      }
      ctx.restore();
    }
  }

  // A caption's alpha: fades in over [inStart,inEnd], optionally fades back
  // out over [outStart,outEnd] (pass null/null to have it simply persist).
  function captionAlpha(t, inStart, inEnd, outStart, outEnd) {
    const fadeIn = smoothstep(inStart, inEnd, t);
    if (outStart == null) return fadeIn;
    return fadeIn * (1 - smoothstep(outStart, outEnd, t));
  }

  // ---- Chapters 3-6: captions for the rest of the piece, either as a
  // running subtitle for scene-level events (top-right quadrant) or
  // attached to the shape they describe (below the window, beside the
  // seed) -- same idea as "a logic statement" / "kernel of the statement"
  // up front.
  function drawCaptions(t, rect) {
    // Landing exactly in the gap between grid columns 4 and 5 (rather than
    // an arbitrary fraction of the board) so the caption reads as centered
    // between the circles beneath it, not just "somewhere top-right".
    const topX = board.bx + 5 * pitch;
    const topY = board.by + board.bh * 0.2;

    drawLabel(
      "one of many candidate kernels",
      topX,
      topY,
      captionAlpha(t, 0.34, 0.38, 0.44, 0.48),
      "center",
      { sizeMult: 1.25 },
    );

    // "hashed into one of 4 bins" sits a tad lower than "one of many
    // candidate kernels" so it reads as centered in the quadrant together
    // with its color swatches, which sit inline on the same line as the
    // text (not stacked below it) -- "a bin is a color" needs the two
    // side by side to read as one statement.
    drawHashCaption(topX, topY + pitch * 0.18, captionAlpha(t, 0.52, 0.56, 0.6, 0.64));

    // Above the window rather than below it -- the bottom edge is where
    // the synced legend card lives, and stacking captions there too
    // crowded that narrative rather than complementing it. `anchor:
    // "bottom"` lets each caption's text grow upward from the same fixed
    // point regardless of how many lines it wraps to.
    const winX = rect.x + rect.w / 2;
    const winYBottom = rect.y - pitch * 0.14;

    drawLabel("Bob's kernel", winX, winYBottom, captionAlpha(t, 0.68, 0.74, 0.78, 0.82), "center", {
      anchor: "bottom",
    });
    // Centered on the window itself (like "Bob's kernel" above it), not on
    // the board as a whole -- the window sits left of board-center since
    // the seed isn't in the middle column, so board-centering would read
    // as visually off relative to the thing this sentence describes. The
    // wrap width is capped by whichever side of the window has less room,
    // so the centered block never overflows the board's edge.
    const sideRoom = Math.min(winX - board.bx, board.bx + board.bw - winX);
    drawLabel(
      "Alice's information must entail Bob's and agree with the hash bin, so Bob can eliminate confounding kernels",
      winX,
      winYBottom,
      captionAlpha(t, 0.8, 0.84, 0.88, 0.91),
      "center",
      { maxWidth: sideRoom * 1.84, anchor: "bottom" },
    );
  }

  // Ch.6 finale: once the true kernel stands alone, expand back out to two
  // *different* sentences that share it -- Alice's original, top-left
  // (unchanged from the intro), and a logically equivalent one Bob could
  // just as well have reconstructed, placed east of the kernel rather
  // than south of it so the legend card never occludes it. Same kernel,
  // different words: the point made about equivalent sentences at the
  // very top of the piece, now shown in reverse. There's no separate node
  // circle at either end -- one circle for the statement and another for
  // the kernel reads as more shapes than the diagram needs -- so each
  // growing link simply emerges from close to its statement's own text.
  function drawEquivalentStatements(t) {
    const revealP = smoothstep(0.93, 0.97, t);
    if (revealP <= 0) return;
    const kernel = seedPos();
    const size = pitch * 0.16;

    ctx.save();
    ctx.font = `${size}px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`;
    const aliceWidth = ctx.measureText(ALICE_STATEMENT).width;
    ctx.restore();

    const aliceX = board.bx + board.bw * 0.16;
    const aliceY = board.by + board.bh * 0.14;
    const aliceFrom = { x: aliceX + aliceWidth / 2, y: aliceY + size }; // middle, below

    const bobX = board.bx + board.bw * 0.66;
    const bobY = kernel.y - size * 0.5;
    const bobFrom = { x: bobX, y: bobY + size * 0.5 }; // leftmost

    // Labels drawn before the links, so each link's glowing tip lands on
    // top of the text as it arrives, rather than disappearing behind it.
    drawLabel(ALICE_STATEMENT, aliceX, aliceY, revealP * 0.9);
    drawLabel(BOB_STATEMENT, bobX, bobY, revealP * 0.9);

    drawGrowingLink(kernel, aliceFrom, revealP, revealP);
    drawGrowingLink(kernel, bobFrom, revealP, revealP);
  }

  function drawScene(t, now) {
    drawIntro(t);
    const rect = windowRect(t);
    renderDots(t, now, rect);
    drawWindowRect(rect, now);
    drawCaptions(t, rect);
    drawEquivalentStatements(t);
  }

  // ---- Top-level render -------------------------------------------------------
  function render(t) {
    lastT = t;
    const now = performance.now() / 1000;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cw = canvas.width / dpr;
    const chh = canvas.height / dpr;

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, cw, chh);

    drawScene(t, now);

    ctx.restore();
  }

  // ---- Main loop: recompute t every frame so breathing keeps running even
  // when scroll is idle, and scrubbing up/down is always smooth. --------------
  function frame() {
    const t = computeT();
    render(t);
    updateLegend(t);
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  resize();
  updateLegend(0);
  requestAnimationFrame(frame);
})();
