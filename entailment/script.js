// -----------------------------------------------------------------------
// "What a Sentence Means" -- a scroll-scrubbed introduction to kernels and
// entailment (Figure 2(b)-(e) of the paper). A sentence's meaning is drawn
// as a disc containing a handful of labeled *possible worlds* -- fully
// specified mini-sentences, not abstract points -- so "a kernel is a set
// of possibilities" is something the viewer can actually read, not just
// take on faith. A weaker sentence's kernel is drawn as a second, larger
// circle around the same center, containing the same labeled worlds plus
// new ones -- entailment as literal, visible containment, with both
// sentences' own statements reappearing side by side (joined by the
// entailment symbol, \u22A2) once that containment is the explicit point
// being made. Deliberately stops there: no third, unrelated sentence and
// no conjunction/intersection story -- the piece stays focused on the one
// conceptual hurdle it exists to clear, why a *stronger* sentence's kernel
// looks *smaller*. As in "No Need to Know", a single scalar t in [0,1],
// derived every frame from scroll position, drives everything as a
// continuous scrub; there is no discrete step logic.
// -----------------------------------------------------------------------

(function () {
  "use strict";

  // Scoped DOM lookups: standalone, this piece is the only script on the
  // page, so document.getElementById would be fine. Embedded in the
  // combined blog page (content/blog-combined/), multiple copies of these
  // same ids (#scene, #legend, etc.) exist in one document -- one per
  // piece -- so document.currentScript.closest(".piece-block") scopes
  // every lookup to *this* piece's own wrapper. Falls back to `document`
  // when there's no such ancestor (i.e. the standalone page), reproducing
  // today's standalone behavior exactly.
  const root = (document.currentScript && document.currentScript.closest(".piece-block")) || document;
  function $(id) { return root.querySelector("#" + id); }

  // ---- Chapter boundaries (t ranges) --------------------------------------
  // Each window's *width* is proportional to how much legend copy has to
  // be read during it (word count of that chunk's heading+body, plus a
  // fixed per-chunk buffer so a short card still gets a comfortable
  // minimum -- not just its bare proportional share, which would leave
  // the shortest chunks flashing by too fast to read). See
  // /tmp/verify_edits/timing_calc2.js for the exact derivation; every
  // smoothstep offset elsewhere in this file that's anchored to one of
  // these boundaries has been rescaled by that same window's own
  // (new width / old width) ratio, so the internal choreography within
  // each chapter keeps the same relative pacing it always had, just
  // stretched or compressed to fit its new, text-proportional width.
  const CH = {
    introEnd: 0.19, // 0: the statement, alone
    // 1: three possible worlds appear one at a time -- concrete, readable
    // examples of "ways the world could be" -- *before* any circle or the
    // word "kernel" exists on screen at all, so the idea of a sentence
    // ruling worlds in/out has something to point at before it's named.
    worldsEnd: 0.34,
    linkEnd: 0.48, // 2: a link grows to a circle drawn *around* those same three worlds; this is where "kernel" is actually defined
    rewordEnd: 0.61, // 3: a differently-worded, equivalent statement shares the same kernel
    weakenEnd: 0.71, // 4: a weaker statement's bigger, concentric kernel
    entailEnd: 0.89, // 5: entailment stated explicitly, plus both statements compared side by side
    // 6: 0.89 -> 1.00, holding on the resting frame (closing legend arrives at 0.89 too -- no gap to fill with a third story)
  };

  // ---- Legend copy, synchronized to the same chapter boundaries as the
  // graphic itself.
  const LEGEND_CHUNKS = [
    {
      from: 0,
      heading: "How mathematical logic associates a sentence with meaning",
      body:
        "As an example, take the sentence \u201CIt\u2019s raining and cold.\u201D It doesn't rule out being windy, but it does restrict the world to both raining and cold \u2014 one way to assign meaning to a sentence.",
    },
    {
      from: CH.introEnd,
      heading: "Some examples of worlds consistent with a sentence",
      // A function, not a fixed string: each sentence below arrives in
      // step with the matching world-dot's own reveal window
      // (INNER_REVEAL_WINDOWS, defined further down) so the caption
      // builds up in sync with the dots appearing on screen, rather than
      // sitting there fully written while the dots trickle in one at a
      // time. Referencing INNER_REVEAL_WINDOWS here is safe even though
      // it's declared later in the file -- this function is only ever
      // *called* from updateLegend's per-frame loop, well after the
      // whole module has finished initializing.
      body: function (t) {
        let s = "Here\u2019s one way the world could be, consistent with the sentence.";
        if (t >= INNER_REVEAL_WINDOWS.rcWindy[0]) s += " Here\u2019s another.";
        if (t >= INNER_REVEAL_WINDOWS.rcCalm[0]) {
          s +=
		" And another. Although each are different ways in which the world could be, all of them are consistent with the sentence.";
        }
        return s;
      },
    },
    {
      from: CH.worldsEnd,
      heading: "A sentence, and its kernel",
      body:
        "Together with every other such world, these form the sentence\u2019s kernel \u2014 the disc now drawn around them. The kernel is then the set of all possible worlds that are consistent with the sentence.",
    },
    {
      from: CH.linkEnd,
      heading: "Same meaning, different words",
      body:
        "\u201CIt\u2019s cold and raining\u201D is a different sentence \u2014 but it leaves open exactly the same worlds. From the point of view of mathematical logic, these sentences are equivalent.",
    },
    {
      from: CH.rewordEnd,
      heading: "A weaker sentence",
      body:
        "\u201CIt\u2019s cold\u201D says less. Its kernel is bigger \u2014 it contains every world in the smaller kernel, plus additional ones.",
    },
    {
      from: CH.weakenEnd,
      heading: "Entailment, geometrically",
      body:
        "A sentence entails another whenever assuming the former lets you prove the latter. \u201CIt\u2019s raining and cold\u201D entails \u201CIt\u2019s cold\u201D because its kernel sits entirely inside the other\u2019s.",
    },
    {
      from: CH.entailEnd,
      heading: "Less is more informative",
      body:
        "A smaller kernel says more about the world \u2014 it\u2019s a stronger, more specific sentence. That\u2019s the thread the next two pieces pick up.",
    },
  ];

  // ---- Palette --------------------------------------------------------------
  // Color = which kernel a shape belongs to, kept consistent everywhere it
  // appears: the strong statement's kernel is always this cyan, the weaker
  // one always amber.
  const BG = "#050208";
  const SEED_GLOW_HEX = "#b8fffa"; // "raining and cold" -- the strong statement's kernel
  const WEAKER_HEX = "#e8a23b"; // "cold" -- the weaker, containing kernel
  const NEUTRAL_HEX = "#dfe8ea"; // every possible-world dot, regardless of kernel
  const LABEL_HEX = "#dfe8ea";

  const RNG_SEED = 0x5eed1e55;

  // ---- Small helpers ---------------------------------------------------------
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

  const SEED_GLOW = hexToRgb(SEED_GLOW_HEX);
  const WEAKER_COLOR = hexToRgb(WEAKER_HEX);
  const NEUTRAL = hexToRgb(NEUTRAL_HEX);
  const LABEL_COLOR = hexToRgb(LABEL_HEX);

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function rgbCss(c, alpha) {
    return `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, ${alpha})`;
  }

  const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';

  // ---- Possible worlds -------------------------------------------------------
  // A world is a fully-specified mini-sentence over three independent
  // attributes: whether it's raining, whether it's cold, and one of three
  // wind conditions (windy/calm/foggy) -- the third attribute varies
  // freely so worlds that satisfy the *same* two-attribute sentence are
  // still visually and textually distinct dots, never indistinguishable
  // duplicates. Each world's (ox, oy) is a fixed offset from a shared
  // origin point, in "unit" multiples (see layout() below) -- absolute
  // and never rescaled, so a dot that belongs to more than one kernel
  // (drawn as more than one circle around/near that origin) sits at
  // exactly the same place in every one of them: the *same* point, not a
  // coincidentally similar one.
  //
  // Kernels, as sets of these worlds:
  //   "raining and cold"  = { rcWindy, rcCalm, rcFoggy }              (3)
  //   "cold"               = the above + { nrcWindy, nrcCalm, nrcFoggy } (6)
  // "raining and cold" ⊆ "cold" (nesting, ch.3-4) follows directly from
  // these being the literal attribute values, not asserted separately
  // from the geometry.
  // The inner three are arranged as an *inverted* triangle -- one dot
  // at the bottom (rcCalm, 90°/south) and two level at the top (11 and
  // 1 o'clock, 240°/300°), matching the two incoming links from ch.0-2's
  // own statements above, which target those exact same two angles
  // (drawInnerKernel/drawReword) -- so each arriving line visibly
  // points straight at one of the two top-row worlds, not at an
  // arbitrary point on the circle. Which of the two (rcWindy vs
  // rcFoggy) takes which side isn't itself load-bearing -- there's no
  // longer a third, unrelated circle whose own placement depended on it.
  const WORLDS = {
    rcWindy: { ox: 0.52, oy: -0.3, label: "rain, cold, windy" },
    rcCalm: { ox: 0, oy: 0.6, label: "rain, cold, calm" },
    rcFoggy: { ox: -0.52, oy: -0.3, label: "rain, cold, foggy" },
    // nrcCalm/nrcFoggy sit at the angular *midpoints* between the inner
    // dots (each 120° apart -> midpoints at 150°/270°), not just offset
    // a little from their nearest inner counterpart -- maximizing
    // separation from every inner label, not only the one sharing part
    // of its own name. nrcWindy (the "cold" kernel's own fourth world)
    // just sits close to rcWindy's own angle instead -- the ring-radius
    // label anchoring in drawWorldDot is what actually keeps the two
    // labels apart on screen despite that.
    nrcWindy: { ox: 1.317, oy: -0.109, label: "no rain, cold, windy" },
    nrcCalm: { ox: -1.212, oy: 0.7, label: "no rain, cold, calm" },
    nrcFoggy: { ox: 0, oy: -1.4, label: "no rain, cold, foggy" },
  };

  const INNER_KEYS = ["rcWindy", "rcCalm", "rcFoggy"];
  const ANNULUS_KEYS = ["nrcWindy", "nrcCalm", "nrcFoggy"];

  // Radii, in unit multiples, around the shared origin.
  const R_INNER = 1.0; // "raining and cold"
  const R_COLD = 1.8; // "cold"

  // ---- Build the (pixel-independent) world/dot table once at startup -----
  // Only each dot's idle-breathing phase is randomized (mulberry32); every
  // position is the fixed offset table above, and every kernel membership
  // is the fixed key lists above -- nothing here is randomized layout.
  function buildWorlds() {
    const rng = mulberry32(RNG_SEED);
    const out = {};
    for (const key of Object.keys(WORLDS)) {
      out[key] = Object.assign({}, WORLDS[key], { phase: rng() * Math.PI * 2 });
    }
    return out;
  }

  // ---- Canvas / DOM setup --------------------------------------------------
  const track = $("scrollTrack");
  const pinned = track.querySelector(".pinned");
  const canvas = $("scene");
  const ctx = canvas.getContext("2d");
  const legend = $("legend");
  const legendHeadingEl = $("legendHeading");
  const legendBodyEl = $("legendBody");

  const worlds = buildWorlds();
  const BOARD_ASPECT = 7 / 9;
  const UNIT_DIVISOR = 9;
  let board = { bx: 0, by: 0, bw: 0, bh: 0 };
  let unit = 0;
  let dpr = window.devicePixelRatio || 1;
  let lastT = 0;
  let legendTopPx = Infinity; // updated in resize(); see drawWorldDot's own vertical clamp
  let legendChunkIndex = -1;
  // The kernel's own x -- not a fixed board fraction, but computed once
  // per resize (see resize()'s own note) so ch.1-2's two links (Alice's
  // original statement, then the reworded one) land at genuinely
  // mirror-symmetric angles about the vertical through the kernel,
  // rather than just symmetric *target* angles reached from
  // arbitrarily-placed statements.
  let originX = 0;

  function updateLegend(t) {
    let idx = 0;
    for (let i = 0; i < LEGEND_CHUNKS.length; i++) {
      if (t >= LEGEND_CHUNKS[i].from) idx = i;
    }
    const chunk = LEGEND_CHUNKS[idx];
    // A chunk's body may be a plain string (the common case) or a
    // function of t (see chunk 1's own comment) for a caption that
    // builds up progressively while its chunk stays active. Either way,
    // only touch the DOM when something has actually changed -- for a
    // dynamic body that's most frames early in its own window (as each
    // sentence arrives) and none once it's fully built.
    const body = typeof chunk.body === "function" ? chunk.body(t) : chunk.body;
    if (idx === legendChunkIndex && body === legendBodyEl.textContent) return;
    legendChunkIndex = idx;
    legendHeadingEl.textContent = chunk.heading;
    legendBodyEl.textContent = body;
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

  function originPos() {
    return { x: originX, y: board.by + board.bh * 0.48 };
  }

  // A point at `distUnits` * unit from `center`, at `angleDeg` degrees
  // (plain cos/sin -- the same convention every world's fixed (ox, oy)
  // offset above already uses). Used to aim a growing link's target at
  // a specific point on a circle's own edge, chosen to land in a gap
  // between dots/labels rather than through one.
  function polarPoint(center, angleDeg, distUnits) {
    const r = (angleDeg * Math.PI) / 180;
    return { x: center.x + Math.cos(r) * distUnits * unit, y: center.y + Math.sin(r) * distUnits * unit };
  }

  function worldPos(key) {
    const o = originPos();
    const w = worlds[key];
    return { x: o.x + w.ox * unit, y: o.y + w.oy * unit };
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const cw = track.clientWidth || window.innerWidth;
    const ch = window.innerHeight;
    // See explainer-no-need-to-know/CLAUDE.md for why `.pinned`'s CSS
    // height (100vh) and `window.innerHeight` can genuinely diverge
    // *during* a scroll on mobile (the browser's address bar showing/
    // hiding) -- setting `.pinned`'s height explicitly, in pixels, from
    // the same `ch` used for the drawing buffer keeps the two locked
    // together regardless of what `100vh` is doing.
    pinned.style.height = `${ch}px`;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    board = computeBoard(cw, ch);
    unit = board.bw / UNIT_DIVISOR;

    // The x each of ch.1-2's two links actually grows *from* is each
    // statement's own text-center (leftSlotPos/rightSlotPos's own x
    // plus half that statement's own rendered width -- see
    // drawStatement's own return value), not the raw slot x -- so the
    // kernel's own x has to be the midpoint of *those* two centers, not
    // the midpoint of the two slots, for the two lines to actually end
    // up mirror-symmetric. Measured directly (both statements happen to
    // render to the same width here, being anagrams of each other, but
    // this doesn't assume that -- it re-measures on every resize).
    const symSize = baseFontSize();
    ctx.save();
    ctx.font = `${symSize}px ${FONT_FAMILY}`;
    const aliceHalfW = ctx.measureText(ALICE_STATEMENT).width / 2;
    const rewordHalfW = ctx.measureText(REWORD_STATEMENT).width / 2;
    ctx.restore();
    const aliceCenterX = leftSlotPos().x + aliceHalfW;
    const rewordCenterX = rightSlotPos().x + rewordHalfW;
    originX = (aliceCenterX + rewordCenterX) / 2;

    // Same legend-drift fix as explainer-no-need-to-know: on narrow
    // viewports, anchor the legend's own `top` directly to the graphic's
    // own real bottom edge (which moves at the *same* rate as `ch` does),
    // rather than a `bottom` percentage (which doesn't).
    if (cw / ch <= BOARD_ASPECT) {
      const graphicBottomPx = board.by + board.bh;
      const overlapPx = cw * 0.2;
      legend.style.top = `${graphicBottomPx - overlapPx}px`;
      legend.style.bottom = "auto";
    } else {
      legend.style.top = "";
      legend.style.bottom = "";
    }

    render(lastT);
  }

  // ---- Scroll -> t ------------------------------------------------------------
  function computeT() {
    const trackHeight = track.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrollRange = trackHeight - viewportHeight;
    if (scrollRange <= 0) return 0;
    const top = track.getBoundingClientRect().top;
    return clamp(-top / scrollRange, 0, 1);
  }

  // ---- Drawing helpers --------------------------------------------------------
  function drawGlow(x, y, radius, color, alpha, haloMult) {
    if (alpha <= 0 || radius <= 0) return;
    const haloRadius = radius * (haloMult || 3.2);
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

  function drawGrowingLink(from, to, progress, alpha, color) {
    if (alpha <= 0 || progress <= 0) return;
    const c = color || SEED_GLOW;
    const tipX = lerp(from.x, to.x, progress);
    const tipY = lerp(from.y, to.y, progress);
    ctx.save();
    ctx.strokeStyle = rgbCss(c, alpha * 0.5);
    ctx.lineWidth = Math.max(1, unit * 0.02);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();
    ctx.restore();
    if (progress < 1) drawGlow(tipX, tipY, unit * 0.05, c, alpha);
  }

  function drawOutlineDisc(cx, cy, radius, color, alpha, opts) {
    if (alpha <= 0 || radius <= 0) return;
    opts = opts || {};
    ctx.save();
    ctx.fillStyle = rgbCss(opts.fillColor || NEUTRAL, alpha * (opts.fillAlphaMult != null ? opts.fillAlphaMult : 0.06));
    ctx.strokeStyle = rgbCss(color, alpha * (opts.strokeAlphaMult != null ? opts.strokeAlphaMult : 0.7));
    ctx.lineWidth = Math.max(1, unit * (opts.lineWidthMult || 0.022));
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Every in-canvas label/caption text size is a flat `unit * mult`, with
  // a fixed floor -- see explainer-no-need-to-know/CLAUDE.md for why a
  // floor is necessary (narrow viewports otherwise render single-digit
  // px text).
  const LABEL_BASE_MIN_PX = 16;
  function baseFontSize() {
    return Math.max(unit * 0.22, LABEL_BASE_MIN_PX);
  }

  function drawLabel(text, x, y, alpha, align, opts) {
    if (alpha <= 0) return 0;
    opts = opts || {};
    const size = opts.absoluteSize != null ? opts.absoluteSize : baseFontSize() * (opts.sizeMult || 1);
    const lineHeight = size * (opts.lineHeightMult || 1.35);
    ctx.save();
    ctx.font = `${size}px ${FONT_FAMILY}`;
    ctx.textAlign = align || "left";
    ctx.textBaseline = "top";
    ctx.shadowColor = rgbCss(opts.glowColor || SEED_GLOW, alpha * 0.7);
    ctx.shadowBlur = size * 0.5;
    ctx.fillStyle = rgbCss(opts.color || LABEL_COLOR, alpha);

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

    const topY = opts.anchor === "bottom" ? y - lines.length * lineHeight : y;
    lines.forEach((line, i) => ctx.fillText(line, x, topY + i * lineHeight));
    ctx.restore();
    return lines.length * lineHeight;
  }

  // A possible-world dot, plus its short label fanned radially outward
  // from `center` (the circle it's being read as belonging to right
  // now) -- so labels around one disc spread away from each other and
  // away from the disc's own outline, rather than colliding at a single
  // fixed offset. `sizeMult` is small (worlds are secondary, supporting
  // detail -- 3-6 of them share the space around one disc, unlike the
  // handful of primary captions elsewhere in this piece).
  function drawWorldDot(key, center, alpha, opts) {
    opts = opts || {};
    const w = worlds[key];
    const pos = worldPos(key);
    const now = performance.now() / 1000;
    const breathe = 1 + 0.07 * Math.sin(now * 0.5 + w.phase);
    const breatheAlpha = clamp(1 + 0.1 * Math.sin(now * 0.5 + w.phase), 0.7, 1.3);

    drawGlow(pos.x, pos.y, unit * 0.05 * breathe, opts.dotColor || NEUTRAL, clamp(alpha * breatheAlpha, 0, 1));

    const labelAlpha = alpha * (opts.labelAlphaMult != null ? opts.labelAlphaMult : 1);
    if (opts.showLabel === false || labelAlpha <= 0.02) return;
    const dx = pos.x - center.x;
    const dy = pos.y - center.y;
    const d = Math.hypot(dx, dy) || 1;
    const ux = dx / d;
    const uy = dy / d;
    // Labels are anchored to a *ring* radius (typically the outer edge
    // of whichever circle this dot is being read as belonging to right
    // now), not to a small fixed gap past the dot's own position. Two
    // dots that are angularly close but belong to different circles
    // (e.g. an inner-kernel dot and a same-side annulus dot on the
    // bigger, concentric "cold" circle) can otherwise land only a few
    // dozen pixels apart even though their *circles* are clearly
    // separated -- anchoring to the ring pushes their labels to two
    // visibly different radii instead, adding real separation the
    // angle alone doesn't provide.
    const ringDist = opts.labelRingRadius != null ? opts.labelRingRadius * unit + unit * 0.26 : d + unit * 0.16;
    let lx = center.x + ux * ringDist;
    // A downward-pointing label (e.g. one whose circle sits mostly below
    // and to the side of the origin, like nrcCalm's own annulus dot) can
    // land close enough to the legend card overlaid near the bottom of
    // the viewport that the two touch at some aspect ratios (confirmed
    // directly at 900x600 -- tighter vertically than either primary
    // target viewport). Clamped against the legend's own *actual*
    // current top edge, not a guessed constant, so this stays correct
    // if the legend's own size/position ever changes.
    const ly = Math.min(center.y + uy * ringDist, legendTopPx - unit * 0.62);
    const align = ux >= 0.15 ? "left" : ux <= -0.15 ? "right" : "center";

    // Clamp to the canvas's own real width so a label growing toward a
    // screen edge (align "right" grows left, "left" grows right) can't
    // run off it -- narrow/mobile viewports have no letterboxing margin
    // (`board.bx = 0`) to absorb the overflow the way wide ones do.
    // Measured directly, not guessed: on a 390px-wide viewport, a
    // same-side annulus label anchored near the board's own left edge
    // ran roughly 55px past x=0 before this clamp existed.
    const labelSize = baseFontSize() * (opts.sizeMult || 0.7);
    ctx.save();
    ctx.font = `${labelSize}px ${FONT_FAMILY}`;
    const textWidth = ctx.measureText(w.label).width;
    ctx.restore();
    const cw = canvas.width / dpr;
    const margin = unit * 0.1;
    if (align === "right") lx = Math.max(lx, margin + textWidth);
    else if (align === "left") lx = Math.min(lx, cw - margin - textWidth);
    else lx = clamp(lx, margin + textWidth / 2, cw - margin - textWidth / 2);

    drawLabel(w.label, lx, ly, labelAlpha * 0.9, align, {
      sizeMult: opts.sizeMult || 0.7,
      anchor: uy >= 0 ? undefined : "bottom",
      glowColor: opts.glowColor || opts.dotColor || SEED_GLOW,
    });
  }

  // ---- The concrete example sentences ---------------------------------------
  const ALICE_STATEMENT = "It\u2019s raining and cold.";
  const REWORD_STATEMENT = "It\u2019s cold and raining.";
  const WEAKEN_STATEMENT = "It\u2019s cold.";
  // U+22A2, single turnstile ("proves"/"entails") -- ch.4's own
  // drawEntailCompare places this between the two statements it's
  // comparing, not the double turnstile (\u22A8, semantic entailment):
  // the legend text for this chapter already frames it in exactly
  // these terms ("...whenever you can prove the latter...").
  const ENTAILS_SYMBOL = "\u22A2";

  function leftSlotPos() {
    return { x: board.bx + board.bw * 0.06, y: board.by + board.bh * 0.03 };
  }
  function rightSlotPos() {
    return { x: board.bx + board.bw * 0.56, y: board.by + board.bh * 0.03 };
  }

  // Draws a statement at a fixed slot, fading in/out over the given
  // windows, and returns the point its own growing link should emerge
  // from (middle, below the text) -- same convention as the other two
  // pieces, so a single circle/line grammar reads consistently across
  // all three.
  function drawStatement(text, pos, alpha) {
    if (alpha <= 0.01) return null;
    const size = baseFontSize();
    ctx.save();
    ctx.font = `${size}px ${FONT_FAMILY}`;
    const w = ctx.measureText(text).width;
    ctx.restore();
    drawLabel(text, pos.x, pos.y, alpha * 0.92, undefined, { absoluteSize: size });
    return { x: pos.x + w / 2, y: pos.y + size };
  }

  // ---- Chapters 0-1: the statement, linked to its kernel -------------------
  // Each of the three inner worlds gets its own reveal window, one after
  // another, entirely within [introEnd, worldsEnd] -- *before* the
  // circle exists at all (see drawInnerKernel below). Order is just a
  // natural reading order (left, then right, then the bottom one last,
  // as if confirming the full shape once all three are down); it isn't
  // load-bearing.
  const INNER_REVEAL_WINDOWS = {
    rcFoggy: [0.19, 0.24],
    rcWindy: [0.24, 0.29],
    rcCalm: [0.29, 0.34],
  };

  function drawInnerKernel(t) {
    const origin = originPos();

    const aliceAppear = smoothstep(0, CH.introEnd, t);
    const aliceFade = 1 - smoothstep(CH.rewordEnd, CH.rewordEnd + 0.017, t);
    const aliceFrom = drawStatement(ALICE_STATEMENT, leftSlotPos(), aliceAppear * aliceFade);

    // Only the *most recently introduced* batch of world-dots stays
    // labeled -- once ch.3's annulus dots (the "cold" kernel's own
    // three new worlds) bloom in, these inner three fade their own
    // labels back out. The dots themselves persist (still visibly
    // nested inside the bigger circle, still the point being made);
    // only the text is dropped, since by ch.4 all six labels on screen
    // at once was the actual clutter, not the dots.
    const innerLabelFade = 1 - smoothstep(CH.rewordEnd + 0.028, CH.weakenEnd, t);

    // The three worlds appear one at a time, entirely *before* the
    // circle/line below exist -- concrete examples of "ways the world
    // could be" that the viewer can read, with nothing yet telling them
    // these three belong together. Not gated on discAppear (unlike the
    // circle/link below): these are visible on their own throughout
    // ch.1, independent of whether the circle enclosing them has
    // appeared yet.
    for (const key of INNER_KEYS) {
      const [ws, we] = INNER_REVEAL_WINDOWS[key];
      const revealAppear = smoothstep(ws, we, t);
      drawWorldDot(key, origin, revealAppear, {
        dotColor: NEUTRAL,
        labelRingRadius: R_INNER,
        labelAlphaMult: innerLabelFade,
      });
    }

    // discAppear computed before the link below (not just before its
    // own drawing block further down) since the link's own target now
    // needs to track this circle's *current* radius, same reasoning as
    // "It's cold."'s own link target (drawColdKernel, below) -- discAppear
    // starts blooming slightly after linkP does (both finish at the
    // same t, but linkP's own head start means it would otherwise touch
    // the target before this circle had grown to meet it). Both start
    // at worldsEnd, not introEnd -- the circle (and the line reaching
    // for it) only begin *after* all three worlds above are already on
    // screen, so the moment "kernel" is actually defined is the same
    // moment a circle is drawn *around* examples the viewer has already
    // seen, not introduced alongside them.
    const discAppear = smoothstep(CH.worldsEnd + 0.035, CH.linkEnd, t);
    const linkP = smoothstep(CH.worldsEnd, CH.linkEnd, t);
    // 11 o'clock -- paired with the reworded statement's own 1 o'clock
    // target (drawReword, below). Genuinely symmetric, not just two
    // symmetric target angles: the kernel's own x (originPos, via
    // resize()'s own originX) is set to the midpoint of both
    // statements' actual text-centers, so the two lines' angles away
    // from vertical actually match, not just look close.
    const target = polarPoint(origin, 240, R_INNER * discAppear);
    if (aliceFrom && linkP > 0) {
      drawGrowingLink(aliceFrom, target, linkP, aliceFade * (0.3 + 0.7 * aliceAppear), SEED_GLOW);
    }

    if (discAppear > 0) {
      drawOutlineDisc(origin.x, origin.y, R_INNER * unit * discAppear, SEED_GLOW, discAppear, {
        strokeAlphaMult: 0.75,
        fillAlphaMult: 0.07,
      });
    }

    return { origin, aliceFade };
  }

  // ---- Chapter 2: a differently-worded, equivalent statement ----------------
  function drawReword(t) {
    const origin = originPos();
    const appear = smoothstep(CH.linkEnd, CH.linkEnd + 0.04, t);
    const fade = 1 - smoothstep(CH.rewordEnd, CH.rewordEnd + 0.017, t);
    const alpha = appear * fade;
    if (alpha <= 0.01) return;

    const from = drawStatement(REWORD_STATEMENT, rightSlotPos(), alpha);
    const linkP = smoothstep(CH.linkEnd, CH.linkEnd + 0.065, t);
    // 1 o'clock -- see Alice's own 11 o'clock target, above, for why
    // (both the angle and the genuine, measured symmetry). No
    // bloom-scaling needed here: the disc has already fully bloomed
    // (discAppear reaches 1 at CH.linkEnd, exactly when this chapter's
    // own appear window starts) by the time this link exists at all.
    const target = polarPoint(origin, 300, R_INNER);
    if (from && linkP > 0) {
      drawGrowingLink(from, target, linkP, alpha, SEED_GLOW);
    }
  }

  // Shared layout for ch.4's stronger/weaker comparison: both statements
  // slide into this tight arrangement -- Alice's own text, then the
  // entailment symbol, then "It's cold." -- read together as a single
  // "A entails B" expression, rather than each sitting alone in its own
  // far-apart slot with the symbol lost in the empty space between.
  // Computed entirely from *measured* text/font metrics (never a fixed
  // pixel offset), so this holds together the same way at every
  // viewport this piece targets, narrow phone widths included -- the
  // same measure-don't-guess approach resize() already uses for
  // originX's own genuine symmetry.
  function entailCompareLayout() {
    const size = baseFontSize();
    ctx.save();
    ctx.font = `${size}px ${FONT_FAMILY}`;
    const aliceWidth = ctx.measureText(ALICE_STATEMENT).width;
    const turnstileWidth = ctx.measureText(ENTAILS_SYMBOL).width;
    ctx.restore();
    const gap = size * 0.55; // a comfortable word-space-sized gap on each side of the symbol
    const leftSlot = leftSlotPos();
    const turnstileCenterX = leftSlot.x + aliceWidth + gap + turnstileWidth / 2;
    const coldX = turnstileCenterX + turnstileWidth / 2 + gap;
    return { turnstileCenterX, coldX, y: leftSlot.y };
  }

  // ---- Chapter 3: a weaker sentence, and its bigger, concentric kernel -----
  function drawColdKernel(t) {
    const origin = originPos();
    const bloom = smoothstep(CH.rewordEnd, CH.weakenEnd, t);
    if (bloom <= 0.005) return { alpha: 0 };

    // Grows outward from R_INNER, not from zero -- "cold" is a superset
    // of "raining and cold," so animating it as a literal expansion of
    // the circle already on screen (rather than an unrelated one
    // appearing from nothing at the shared center) shows the
    // containment as it happens, not just once it's finished. Never
    // fades back out once bloomed: with no third statement/circle to
    // hand off to, this comparison *is* the piece's own closing point
    // ("a smaller kernel means a stronger sentence") -- so both circles
    // persist, side by side, all the way through the resting frame the
    // closing legend arrives over, rather than clearing away to an
    // unlabeled circle right before the piece makes that exact point.
    const currentRadius = lerp(R_INNER, R_COLD, bloom);
    drawOutlineDisc(origin.x, origin.y, currentRadius * unit, WEAKER_COLOR, bloom, {
      strokeAlphaMult: 0.7,
      fillAlphaMult: 0.05,
    });
    const dotsAppear = smoothstep(CH.rewordEnd + 0.017, CH.weakenEnd, t);
    for (const key of ANNULUS_KEYS) {
      drawWorldDot(key, origin, dotsAppear, { dotColor: NEUTRAL, glowColor: WEAKER_COLOR, labelRingRadius: R_COLD });
    }

    const stmtAppear = smoothstep(CH.rewordEnd + 0.017, CH.rewordEnd + 0.044, t);
    // Sits at the normal right slot through ch.3-4 (unchanged) and only
    // slides into the tight comparison layout (see entailCompareLayout,
    // above) once ch.4 itself begins -- same pacing as drawEntailCompare's
    // own linkP, so the statement finishes arriving at the same moment
    // Alice's own link finishes growing, not before or after it.
    const compareProgress = smoothstep(CH.weakenEnd, CH.weakenEnd + 0.068, t);
    const comparePos = entailCompareLayout();
    const stmtPos = { x: lerp(rightSlotPos().x, comparePos.coldX, compareProgress), y: rightSlotPos().y };
    const from = drawStatement(WEAKEN_STATEMENT, stmtPos, stmtAppear);
    const linkP = smoothstep(CH.rewordEnd + 0.017, CH.rewordEnd + 0.067, t);
    // Due north (270° in this piece's own cos/sin-as-canvas-offset
    // convention, since canvas y increases downward) -- touching the
    // circle at its own top, rather than off to one side, reads as the
    // more natural place for a link arriving from a statement above it
    // to land. Uses the *same* currentRadius the circle itself is drawn
    // at (growing from R_INNER, not zero -- see its own note above),
    // not the fixed final R_COLD -- the link finishes growing (t=0.59)
    // before the circle finishes blooming (t=0.62), so a fixed-radius
    // target left the tip floating above the circle's own
    // still-smaller current edge for that whole stretch, touching
    // nothing until the circle finally caught up.
    const target = polarPoint(origin, 270, currentRadius);
    if (from && linkP > 0) {
      drawGrowingLink(from, target, linkP, 0.3 + 0.7 * stmtAppear, WEAKER_COLOR);
    }

    return { alpha: bloom, bloom };
  }

  // ---- Chapter 4: entailment ---------------------------------------------
  // The nesting itself (the smaller circle's dots, unchanged, now sitting
  // inside the bigger one) already shows containment -- but by this point
  // neither of the two statements that originally *defined* either circle
  // still has a visible link on screen (Alice's own faded back in ch.2-3,
  // "It's cold and raining"'s in ch.3-4). Bringing Alice's original
  // statement back -- alongside "It's cold.", which persists from here on
  // (see drawColdKernel's own note) -- makes the containment a comparison
  // between two actual sentences, each pointing at its own kernel, not
  // just two unlabeled nested circles. Never fades back out, for the same
  // reason drawColdKernel's own circle doesn't: this comparison is the
  // piece's own closing point, so it's still on screen when the closing
  // legend arrives to state it in words.
  function drawEntailCompare(t) {
    const origin = originPos();
    const alpha = smoothstep(CH.weakenEnd, CH.weakenEnd + 0.045, t);
    if (alpha <= 0.01) return;

    const from = drawStatement(ALICE_STATEMENT, leftSlotPos(), alpha);
    const linkP = smoothstep(CH.weakenEnd, CH.weakenEnd + 0.068, t);
    // Same 11 o'clock target as ch.0-1's own link into the inner circle
    // (drawInnerKernel) -- already fully bloomed by now, so no
    // bloom-scaling needed, same reasoning as drawReword's own target.
    const target = polarPoint(origin, 240, R_INNER);
    if (from && linkP > 0) {
      drawGrowingLink(from, target, linkP, alpha, SEED_GLOW);
    }

    // The entailment symbol itself, in the tight gap between the two
    // statements -- "It's raining and cold. \u22A2 It's cold." -- read
    // left to right exactly as the legend's own wording has it ("...
    // entails ..."). Same layout drawColdKernel's own "It's cold." is
    // sliding toward (entailCompareLayout), so the symbol and both
    // statements agree on one shared, measured arrangement.
    const layout = entailCompareLayout();
    drawLabel(ENTAILS_SYMBOL, layout.turnstileCenterX, layout.y, alpha * 0.92, "center", { absoluteSize: baseFontSize() });
  }

  function drawScene(t) {
    drawInnerKernel(t);
    drawReword(t);
    drawColdKernel(t);
    drawEntailCompare(t);
  }

  // ---- Top-level render ---------------------------------------------------
  function render(t) {
    lastT = t;
    // Measured fresh every frame, not just on resize: the legend card's
    // own height (and therefore its top edge, since it's anchored from
    // the bottom) changes as its text content changes between chapters
    // -- a value cached only in resize() went stale the moment the
    // legend's own copy changed, confirmed directly (a downward-leaning
    // world label's own vertical clamp, below, was comparing against the
    // *very first* chapter's shorter card long after a taller one had
    // replaced it).
    legendTopPx = legend.getBoundingClientRect().top;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cw = canvas.width / dpr;
    const chh = canvas.height / dpr;

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, cw, chh);

    drawScene(t);

    ctx.restore();
  }

  // ---- Main loop --------------------------------------------------------------
  let lastInnerHeight = window.innerHeight;
  // Set by root.__pauseAnim/__resumeAnim (below) so an embedding page can
  // stop this piece's rAF loop while it's scrolled out of view, and restart
  // it when it scrolls back in. Attached to `root` (this piece's own
  // wrapper when embedded, `document` when standalone -- see the `root`/`$`
  // note near the top of this file), not a bare `window` global, so
  // multiple pieces loaded on the same page each get their own isolated
  // pair of hooks instead of the last-loaded piece's clobbering the rest.
  // Nothing calls these unless a parent page does, so standalone behavior
  // (this piece opened on its own) is unaffected.
  let framePaused = false;
  function frame() {
    if (window.innerHeight !== lastInnerHeight) {
      lastInnerHeight = window.innerHeight;
      resize();
    }
    const t = computeT();
    render(t);
    updateLegend(t);
    if (!framePaused) requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  resize();
  updateLegend(0);
  requestAnimationFrame(frame);

  root.__pauseAnim = function () { framePaused = true; };
  root.__resumeAnim = function () {
    if (!framePaused) return;
    framePaused = false;
    requestAnimationFrame(frame);
  };
})();
