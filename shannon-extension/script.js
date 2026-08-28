// -----------------------------------------------------------------------
// "Reasoning Amplifies Information" -- a scroll-scrubbed introduction to
// Figure 1 of the paper. Leads with Feynman's own example (a single
// sentence, chosen to carry the most possible knowledge to a future that
// has lost all science) before showing what the paper actually changes:
// Shannon's classical communication pipeline (message -> encode -> bits
// -> decode -> recovered message) is extended with one new stage --
// what's decoded doesn't just sit there; a receiver who can reason feeds
// it into deductive machinery, producing deduced facts.
//
// The two pipeline diagrams themselves are *not* hand-drawn on canvas --
// they're real vector graphics (assets/shannon_top_row.svg,
// assets/shannon_bottom_row.svg), compiled from TikZ sources recolored
// from the paper's own Figure 1 (see tikz-src/README.md for the exact
// build). Both images share the same natural point-scale (same TikZ
// column spacing for their shared stages), so positioning them flush-left
// at the same x and the same px-per-pt scale makes the bottom row's
// shared prefix land in *exactly* the same pixels as the top row's own --
// the extension reads as new stages appended after an unmoved prefix,
// not a resemblance between two independently-drawn diagrams. Each row
// reveals with a left-to-right clip-path wipe as t crosses its own
// chapter, and stays fully revealed afterward (both rows persist through
// the closing frame -- the visual comparison *is* the closing point).
//
// Only the Feynman quote itself is still canvas text (there's no diagram
// to be low-quality there). As in the sibling explainers, a single
// scalar t in [0,1], derived every frame from scroll position, drives
// everything as a continuous scrub; there is no discrete step logic.
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
  const CH = {
    introEnd: 0.12, // 0: Feynman's own setup -- a cataclysm, and a single sentence to send
    quoteEnd: 0.3, // 1: the sentence itself
    shannonEnd: 0.55, // 2: Shannon's classical model, drawn as a simple pipeline
    extendEnd: 0.85, // 3: the extension -- one new stage, reasoning over what's received
    // 4: 0.85 -> 1.00, holding on the resting frame, both pipelines visible together
  };

  const LEGEND_CHUNKS = [
    {
      from: 0,
      heading: "A cataclysm, and one sentence",
      body: "A thought experiment from Feynman\u2019s own Lectures on Physics.",
    },
    {
      from: CH.introEnd,
      heading: "Feynman\u2019s answer",
      body: "His own choice for that single sentence.",
    },
    {
      from: CH.quoteEnd,
      heading: "Shannon\u2019s model",
      body:
        "Shannon\u2019s classical theory of communication deliberately ignores what a receiver can do with a message \u2014 it only cares about transmitting symbols reliably: encoded into bits, then decoded back.",
    },
    {
      from: CH.shannonEnd,
      heading: "Our extension: reasoning",
      body:
        "We extend Shannon\u2019s model with one new stage. The receiver reasons over what\u2019s decoded, deducing further facts \u2014 going beyond the literal bits transmitted.",
    },
    {
      from: CH.extendEnd,
      heading: "Why so few words can go so far",
      body:
        "Reasoning amplifies the effective content of what\u2019s transmitted: the same short sentence can leave a reasoning receiver knowing more than its own bits alone would suggest.",
    },
  ];

  const BG = "#050208";
  const LABEL_HEX = "#dfe8ea";

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

  function rgbCss(c, alpha) {
    return `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, ${alpha})`;
  }

  const LABEL_COLOR = hexToRgb(LABEL_HEX);

  const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';

  // ---- Canvas / DOM setup --------------------------------------------------
  const track = $("scrollTrack");
  const pinned = track.querySelector(".pinned");
  const canvas = $("scene");
  const ctx = canvas.getContext("2d");
  const legend = $("legend");
  const legendHeadingEl = $("legendHeading");
  const legendBodyEl = $("legendBody");
  const topRowEl = $("topRow");
  const bottomRowEl = $("bottomRow");

  const BOARD_ASPECT = 7 / 9;
  const UNIT_DIVISOR = 9;
  let board = { bx: 0, by: 0, bw: 0, bh: 0 };
  let unit = 0;
  let dpr = window.devicePixelRatio || 1;
  let lastT = 0;
  let legendChunkIndex = -1;

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

  // ---- Diagram-row image layout --------------------------------------------
  // Natural SVG dimensions (its own viewBox units -- effectively "pt",
  // but only their *ratio* matters here). Both assets share the same
  // underlying TikZ column spacing for their common stages, so scaling
  // both by the *same* px-per-unit factor (derived once, from the wider
  // bottom row) and flush-left-aligning them is what makes the shared
  // prefix land pixel-for-pixel in the same place in both rows -- not a
  // coincidence, and not something a per-row "fit to width" scale would
  // preserve.
  const TOP_ROW_NATURAL = { w: 334.306, h: 36.372 };
  // The bottom row's own new stages (deductive machinery, deduced facts)
  // turn *downward* from the shared prefix rather than continuing
  // rightward (see tikz-src/shannon_bottom_row.tex's own comment) -- so
  // this row is only slightly wider than the top row, not roughly double
  // it, and correspondingly much taller. That shape swap is the actual
  // fix for "too wide to fit on a phone": width no longer has to shrink
  // nearly as far before this block fits, since height was always the
  // more available dimension in a tall, scroll-driven layout.
  const BOTTOM_ROW_NATURAL = { w: 334.306, h: 137.865 };
  // The gap between rows, expressed in the *same* natural units as the
  // two images themselves (not a board-height fraction) -- so it scales
  // together with them under whichever constraint (width or height)
  // ends up binding, below. Sized off the (unchanging) top row's own
  // height, not the bottom row's -- the latter is now dominated by its
  // own internal downward extension, which has nothing to do with how
  // much air the two *rows* need between them.
  const ROWS_GAP_NATURAL = TOP_ROW_NATURAL.h * 1.1;
  const ROW_WIDTH_FRAC = 0.88; // max width, as a fraction of the full viewport width
  // An absolute cap, on top of the fraction above -- on a wide desktop
  // window, `ROW_WIDTH_FRAC * cw` alone keeps growing without bound (at
  // 1920px wide that's still nearly 1700px, an enormous, dominating
  // diagram), which is what "looks too big" turned out to mean once
  // clarified as not tied to any particular narrow-viewport bug. On a
  // narrow phone this cap never binds (0.88*cw is already well under it
  // for any realistic phone width), so mobile keeps its own generous
  // fraction untouched.
  const ROW_MAX_WIDTH_PX = 560;
  const ROWS_TOP_FRAC = 0.08; // top of the available vertical band, as a fraction of viewport height

  let rowLayout = { scale: 0, left: 0, topRowTop: 0, bottomRowTop: 0 };

  // "Contain" fit, not just "fit to width": picks whichever of the width
  // or height constraint is tighter, so the two-row block is as large as
  // possible while still fitting the available band -- robust across
  // very different viewport aspect ratios (e.g. a short 900x600 desktop
  // window, where height binds, vs. a narrow 360x740 phone, where width
  // binds) rather than a fixed scale tuned to look right on only one of
  // them. Centered within the available band on whichever axis has
  // slack left over once the binding constraint is applied.
  //
  // Deliberately sized against the *full* viewport (`cw`/`ch`), not
  // `board.bw`/`board.bh` -- `board` is a narrow, portrait-ish 7:9
  // rectangle tuned for the sibling explainers' round kernel diagrams,
  // and this piece's content is the opposite shape (a wide, short
  // horizontal pipeline). Confining it to `board` left roughly 180px of
  // unused black letterbox bar on each side at 900x700 alone (confirmed
  // directly, not just anticipated) -- purely wasted space for content
  // that actually wants the width. `legendTop` is the legend card's own
  // *measured* current top edge (not a guessed constant), so the
  // available band's bottom bound stays correct however the legend
  // itself is positioned (its CSS differs between the wide/narrow
  // branches just above).
  function layoutDiagramRows(cw, ch, legendTop) {
    const totalNaturalH = TOP_ROW_NATURAL.h + ROWS_GAP_NATURAL + BOTTOM_ROW_NATURAL.h;
    const top = ch * ROWS_TOP_FRAC;
    const availableH = Math.max(legendTop - top, 0);
    const scaleByWidth = Math.min(ROW_WIDTH_FRAC * cw, ROW_MAX_WIDTH_PX) / BOTTOM_ROW_NATURAL.w;
    const scaleByHeight = availableH / totalNaturalH;
    const scale = Math.min(scaleByWidth, scaleByHeight);

    const topW = TOP_ROW_NATURAL.w * scale;
    const topH = TOP_ROW_NATURAL.h * scale;
    const bottomW = BOTTOM_ROW_NATURAL.w * scale;
    const gapPx = ROWS_GAP_NATURAL * scale;
    const totalH = totalNaturalH * scale;

    const left = (cw - bottomW) / 2;
    const topRowTop = top + (availableH - totalH) / 2;
    const bottomRowTop = topRowTop + topH + gapPx;
    rowLayout = { scale, left, topRowTop, bottomRowTop };

    topRowEl.style.width = `${topW}px`;
    topRowEl.style.left = `${left}px`;
    topRowEl.style.top = `${topRowTop}px`;
    bottomRowEl.style.width = `${bottomW}px`;
    bottomRowEl.style.left = `${left}px`;
    bottomRowEl.style.top = `${bottomRowTop}px`;
  }

  // Reveals `el` with a left-to-right clip-path wipe as `appear` goes
  // 0->1 (already-smoothstepped, so it clamps to 1 and simply stays
  // fully revealed for any t beyond the chapter it belongs to).
  function revealRow(el, appear) {
    el.style.clipPath = `inset(0 ${(1 - appear) * 100}% 0 0)`;
  }

  // The bottom row's own shared prefix sits in a band across the *top*
  // of its image (the same absolute height as the top row's own image,
  // since it's the same TikZ content at the same scale); everything new
  // -- deductive machinery, deduced facts -- is *below* that band, not
  // to its right (see shannon_bottom_row.tex's own comment on why). A
  // single left-to-right wipe would therefore reveal part of "deductive
  // machinery" (which sits only partway across the image horizontally)
  // before "recovered logic sentence" (further right, same band) had
  // finished appearing -- visually out of order. Revealing in two
  // sequential phases instead -- first *that band only*, left-to-right
  // (matching the top row's own wipe), then everything below it,
  // top-to-bottom -- keeps every stage appearing in its actual logical
  // order regardless of where it happens to sit on screen.
  const PREFIX_BAND_FRAC = TOP_ROW_NATURAL.h / BOTTOM_ROW_NATURAL.h;
  function revealBottomRow(el, t) {
    const prefixP = smoothstep(CH.shannonEnd, CH.shannonEnd + 0.06, t);
    const restP = smoothstep(CH.shannonEnd + 0.06, CH.extendEnd, t);
    const bandPct = PREFIX_BAND_FRAC * 100;
    if (prefixP < 1) {
      el.style.clipPath = `inset(0 ${(1 - prefixP) * 100}% ${100 - bandPct}% 0)`;
    } else {
      el.style.clipPath = `inset(0 0% ${(1 - restP) * (100 - bandPct)}% 0)`;
    }
  }

  function updateDiagrams(t) {
    revealRow(topRowEl, smoothstep(CH.quoteEnd, CH.shannonEnd, t));
    revealBottomRow(bottomRowEl, t);
  }

  // The legend card's own height (and so its top edge, since it's
  // anchored from the bottom) varies with which chunk's text is
  // currently showing -- but the diagram rows' own size/position is only
  // ever computed once per resize(), not every time the chunk changes.
  // Sizing them against whichever chunk happened to be active *at that
  // moment* (chunk 0, on initial load, with its own short card) once
  // left them tall enough to run straight into a later, taller card's
  // own top edge once the user actually scrolled there (confirmed
  // directly -- the "deductive machinery" cloud's own bottom overlapped
  // the "Our extension: reasoning" card). Fixed by measuring the
  // *tallest* card among every chunk during which a diagram is actually
  // visible (indices 2-4: from Shannon's model onward) and using
  // whichever of those gives the smallest available height -- so the
  // diagrams are sized once, conservatively enough to never overlap any
  // card they'll ever actually share the screen with. Chunk text is
  // swapped and restored synchronously (each getBoundingClientRect()
  // call forces the layout it needs), so this never flashes on screen.
  const DIAGRAM_VISIBLE_CHUNK_INDICES = [2, 3, 4];
  // Returns the legend's own top edge *relative to `.pinned`'s own top
  // edge* -- not the raw, viewport-relative getBoundingClientRect().top
  // -- since that's the coordinate system layoutDiagramRows() actually
  // positions the two <img> rows in (both are `position: absolute`
  // descendants of `.pinned`, the same as `.legend` itself).
  //
  // The distinction is invisible standalone (this piece is the only
  // content on its own page, so `.pinned` is already sticky-stuck at
  // viewport top 0 the moment resize() first runs, making the two
  // coordinate systems coincide) but very much not invisible once
  // embedded partway down a longer page (e.g. content/blog-combined/):
  // resize() still runs once at that page's own load, at which point
  // this piece's own track sits far below the *current* scroll
  // position, so `.pinned` is not yet stuck -- it's rendered at its
  // natural flow position, dozens of viewport-heights down the
  // document, and the *raw* getBoundingClientRect().top read at that
  // moment reflects that natural position, not the "stuck at 0" state
  // it will actually be in once the reader scrolls here. Since nothing
  // re-runs resize() on ordinary scrolling (no 'resize' event fires),
  // that one bad reading -- confirmed directly to be off by over
  // 1000px in the combined page -- silently persisted for the rest of
  // the scroll-through, pushing both rows visibly down into the legend
  // card. Subtracting `.pinned`'s own current top makes the result
  // identical to the raw value whenever `.pinned` *is* stuck (top 0,
  // the standalone case, unchanged), and correct even when it is not.
  function measureLegendTopBound() {
    const savedHeading = legendHeadingEl.textContent;
    const savedBody = legendBodyEl.textContent;
    const pinnedTop = pinned.getBoundingClientRect().top;
    let minTop = Infinity;
    for (const idx of DIAGRAM_VISIBLE_CHUNK_INDICES) {
      const chunk = LEGEND_CHUNKS[idx];
      legendHeadingEl.textContent = chunk.heading;
      legendBodyEl.textContent = typeof chunk.body === "function" ? chunk.body(chunk.from) : chunk.body;
      minTop = Math.min(minTop, legend.getBoundingClientRect().top - pinnedTop);
    }
    legendHeadingEl.textContent = savedHeading;
    legendBodyEl.textContent = savedBody;
    return minTop;
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const cw = track.clientWidth || window.innerWidth;
    const ch = window.innerHeight;
    // See explainer-no-need-to-know/CLAUDE.md for why `.pinned`'s CSS
    // height (100vh) and `window.innerHeight` can genuinely diverge
    // *during* a scroll on mobile -- setting `.pinned`'s height
    // explicitly, in pixels, from the same `ch` the drawing buffer uses
    // keeps the two locked together regardless of what `100vh` is doing.
    pinned.style.height = `${ch}px`;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    board = computeBoard(cw, ch);
    unit = board.bw / UNIT_DIVISOR;

    if (cw / ch <= BOARD_ASPECT) {
      const graphicBottomPx = board.by + board.bh;
      const overlapPx = cw * 0.2;
      legend.style.top = `${graphicBottomPx - overlapPx}px`;
      legend.style.bottom = "auto";
    } else {
      legend.style.top = "";
      legend.style.bottom = "";
    }
    layoutDiagramRows(cw, ch, measureLegendTopBound());

    render(lastT);
    updateDiagrams(lastT);
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
    ctx.font = `${opts.italic ? "italic " : ""}${size}px ${FONT_FAMILY}`;
    ctx.textAlign = align || "left";
    ctx.textBaseline = "top";
    ctx.shadowColor = rgbCss(opts.glowColor || LABEL_COLOR, alpha * 0.6);
    ctx.shadowBlur = size * 0.4;
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
    if (opts.anchor === "middle") {
      const totalH = lines.length * lineHeight;
      lines.forEach((line, i) => ctx.fillText(line, x, y - totalH / 2 + i * lineHeight));
    } else {
      lines.forEach((line, i) => ctx.fillText(line, x, topY + i * lineHeight));
    }
    ctx.restore();
    return lines.length * lineHeight;
  }

  // ---- Chapter 0-1: Feynman's own setup, then his actual sentence -----------
  function drawFeynman(t) {
    const cx = board.bx + board.bw / 2;
    const cy = board.by + board.bh * 0.42;
    const maxWidth = board.bw * 0.82;

    const setupAppear = smoothstep(0, 0.04, t);
    const setupFade = 1 - smoothstep(CH.introEnd, CH.introEnd + 0.04, t);
    const setupAlpha = setupAppear * setupFade;
    if (setupAlpha > 0.01) {
      drawLabel(
        "In his famous Lectures on Physics, Feynman imagined a cataclysmic situation in which all scientific knowledge is destroyed, and a sentence carrying the most information in the fewest words needs to be chosen for transmission to future generations of beings.",
        cx,
        cy,
        setupAlpha,
        "center",
        { anchor: "middle", maxWidth, sizeMult: 1.05, lineHeightMult: 1.45 }
      );
    }

    const quoteAppear = smoothstep(CH.introEnd, CH.introEnd + 0.05, t);
    const quoteFade = 1 - smoothstep(CH.quoteEnd, CH.quoteEnd + 0.04, t);
    const quoteAlpha = quoteAppear * quoteFade;
    if (quoteAlpha > 0.01) {
      drawLabel(
        "\u201CAll things are made of atoms\u2014little particles that move around in perpetual motion, attracting each other when they are a little distance apart, but repelling upon being squeezed into one another.\u201D",
        cx,
        cy,
        quoteAlpha,
        "center",
        { anchor: "middle", maxWidth, sizeMult: 1.0, lineHeightMult: 1.5, italic: true }
      );
    }
  }

  function drawScene(t) {
    drawFeynman(t);
  }

  // ---- Top-level render ---------------------------------------------------
  function render(t) {
    lastT = t;
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
    updateDiagrams(t);
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
