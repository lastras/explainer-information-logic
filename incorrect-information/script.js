// -----------------------------------------------------------------------
// "The Price of Incorrect Information" -- a scroll-scrubbed dramatization
// of the paper's "price of incorrect information" section. Temperature
// is a genuinely 1D quantity, so Bob's kernel is drawn as a 1D interval
// -- a translucent band on one shared horizontal temperature axis --
// rather than a circle's radius (whose *area* would scale as the square
// of the interval's own width, a real mismatch between what's drawn and
// what it means). Ordinary ignorance (kappa(S) subset kappa(R)) is a
// band that always contains Alice's own fixed, narrow band, same center
// -- drawn translucent on purpose, so the region where they overlap
// visibly *blends* the two colors: S subset R as something you watch,
// not just a claim. A genuinely wrong belief (kappa(S) disjoint from
// kappa(R')) is a second band, centered far enough away on the very same
// axis that it never touches Alice's, at any width. Both bands narrow
// together as p_r decreases, continuously, straight off scroll position
// every frame (see currentPr/ignoranceRange/wrongRange) -- an explicit
// sentence has an explicit, fixed kernel, so both the printed range and
// the band's own extent are always the same rounded numbers, never an
// interpolation between two different sentences. A marker on the
// cost-ratio curve below tracks the same underlying p_r, unrounded --
// "smaller kernel -> higher up the curve" is something the viewer
// watches happen continuously. As in the other two pieces, a single
// scalar t in [0,1], derived every frame from scroll position, drives
// everything as a continuous scrub.
// -----------------------------------------------------------------------

(function () {
  "use strict";

  // ---- Chapter boundaries (t ranges) --------------------------------------
  const CH = {
    ignoranceEnd: 0.22, // 0: recap -- S's kernel nested inside a merely-weaker R
    wrongEnd: 0.42, // 1: contrast -- a genuinely wrong R', disjoint from S
    shrinkEnd: 0.86, // 2: both R and R' shrink together as p_r decreases; the ratio climbs, live
    // 3: 0.86 -> 1.00, holding on the fully-shrunk state (closing legend arrives at 0.92)
  };

  const LEGEND_CHUNKS = [
    {
      from: 0,
      heading: "Packing for a trip",
      body:
        "Alice and Bob are packing for a trip. Alice's forecast is the more recent one, and both know it. In one scenario, Bob's forecast includes Alice's own range, but is otherwise more vague.",
    },
    {
      from: CH.ignoranceEnd,
      heading: "A different scenario",
      body:
        "In a second scenario, Bob's earlier report told a completely different story. He truly believes that the weather will be warm, and is already packing shorts and sandals.",
    },
    {
      from: CH.wrongEnd,
      heading: "Comparing the two scenarios",
      body:
        "Now let's examine, in both scenarios, what happens as Bob's range gets smaller. The plot shows Alice's relative cost of correcting Bob to what she believes is true, as he grows more opinionated.",
    },
    {
      from: 0.92,
      heading: "The more confident, the costlier",
      body:
        "The more confident Bob's incorrect forecast is, the more it costs Alice to correct, relative to a scenario where Bob's forecast was merely more vague than Alice's.",
    },
  ];

  // ---- Palette --------------------------------------------------------------
  const BG = "#050208";
  const SEED_GLOW_HEX = "#b8fffa"; // kappa(S) -- Alice's truth, unchanged all piece
  const IGNORANT_HEX = "#e8a23b"; // kappa(R) -- Bob's merely-weaker belief
  const WRONG_HEX = "#ff6a6a"; // kappa(R') -- Bob's genuinely wrong belief
  const NEUTRAL_HEX = "#dfe8ea";
  const LABEL_HEX = "#dfe8ea";

  // ---- Small helpers ---------------------------------------------------------
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
  const IGNORANT_COLOR = hexToRgb(IGNORANT_HEX);
  const WRONG_COLOR = hexToRgb(WRONG_HEX);
  const NEUTRAL = hexToRgb(NEUTRAL_HEX);
  const LABEL_COLOR = hexToRgb(LABEL_HEX);

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function rgbCss(c, alpha) {
    return `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, ${alpha})`;
  }

  const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';

  // ---- The paper's own cost functions ----------------------------------------
  // Lambda(a,b) from Theorem 1; ratio(p_r) = Lambda(p_s,1-p_r-p_s) /
  // Lambda(p_s,p_r-p_s) -- matches gen_misinformation.py exactly, p_s=0.1.
  const PS_EXAMPLE = 0.1;
  function lam(a, b) {
    if (a <= 0 || b <= 0) return 0;
    return a * Math.log2((a + b) / a) + b * Math.log2((a + b) / b);
  }
  function ratioFn(pr) {
    return lam(PS_EXAMPLE, 1 - pr - PS_EXAMPLE) / lam(PS_EXAMPLE, pr - PS_EXAMPLE);
  }

  // ---- Bob's kernel size, p_r, mapped onto a shared temperature axis --------
  // The *same* p_r drives both of Bob's bands (ignorant R and wrong R')
  // identically -- it's the same symbol in the paper's own model. p_r
  // starts loose (PR_MAX, a wide, unopinionated interval) and, once
  // ch.2 begins, decreases toward PS_EXAMPLE (as specific/confident as
  // Alice's own kernel) -- never reaching it exactly (Lambda(p_s,0) is
  // undefined, the curve's own vertical asymptote), but visibly closing
  // in on it.
  //
  // PR_MAX = 0.4, not 0.85: ratioFn is monotonically decreasing in p_r,
  // and crosses 1 exactly at p_r = 0.5 -- so starting anywhere below
  // that keeps the ratio above 1 for the entire animation.
  //
  // PR_MIN = 0.15, not 0.105: R's own kernel is rendered from p_r
  // directly, so as p_r approaches p_s, R's own size necessarily
  // approaches S's -- that's the real, correct asymptotic behavior. But
  // 0.105 was close enough to p_s (0.1) that R's own *rounded, printed*
  // half-width (round(30*0.105) = 3) came out *identical* to S_HALF (3)
  // well before the chart's own marker looked anywhere near its own
  // p_s asymptote -- a real, confirmed contradiction between the two
  // (the two kernels reading as equal while the chart still showed a
  // clear gap to the dotted line), not just a rounding nicety. 0.15
  // keeps R's own rounded half-width at least 2° bigger than S_HALF's
  // across the *entire* animation (checked directly below), at the
  // cost of a more modest ending ratio (~3.2x instead of ~15x) --
  // mathematically, that trade-off is unavoidable: the ratio's own
  // climb toward infinity and R's own convergence toward S are the
  // *same* limit (p_r -> p_s), so keeping R visibly bigger than S
  // necessarily caps how far the ratio gets to climb within this
  // animation.
  const PR_MAX = 0.4;
  const PR_MIN = 0.15;

  // One shared axis, one shared unit (°F -- specifically chosen, not
  // arbitrary this time: every rendered range, at every p_r in
  // [PR_MIN, PR_MAX], has to stay within temperatures that actually
  // happen on Earth. An earlier version's wrong-belief center (115°)
  // plus its own widest half-width pushed its upper edge past 125° --
  // hotter than any recorded surface temperature. 85°, centered well
  // inside a normal hot-summer-day range, with a smaller half-width
  // scale (32, not 30) keeps every configuration below ~98° at the
  // wide end and comfortably within an ordinary day's range at the
  // narrow end.
  //
  // This is also -- again -- the whole point of the comparison: *one
  // shared half-width function*. R and R' both use kernelHalf(p_r)
  // verbatim: at any given p_r, Bob's ignorant belief and Bob's wrong
  // belief are *exactly* the same size. Rather than resizing one
  // kernel relative to the other to avoid the two bands' capsules
  // touching on screen, the *centers* are just far enough apart
  // instead: S sits at a fixed, narrow interval, centered on R's own
  // center, so at every width R is centered on -- and therefore
  // contains -- S; R' is centered far enough away that even at its own
  // widest (p_r = PR_MAX), including the extra width drawBand's own
  // rounded end-caps add (a constant, on top of the true interval --
  // see drawBand's own note), it never reaches S or R. The minimum gap
  // that guarantees the two capsules' end-caps themselves never touch
  // is bandHeight/pxPerDegree -- solved directly: ~12.6° at this
  // piece's own constants (viewport-independent, since bw cancels out
  // of that ratio). The ~19° gap below (R's widest upper bound, 52.8°,
  // to R''s widest lower bound, 72.2°) is a healthy margin over that.
  const TEMP_MIN = 0;
  const TEMP_MAX = 112;
  const S_CENTER = 40;
  const R_CENTER = S_CENTER;
  const W_CENTER = 85;
  function kernelHalf(pr) {
    return 32 * pr;
  }
  // Alice's own kernel size is *not* a separately-chosen constant --
  // it's the exact same kernelHalf(pr) formula, evaluated at p_r =
  // p_s, then rounded once (S never animates, so there's no
  // smoothness reason to keep an unrounded version around the way R's
  // own raw half-width needs to be) -- so the number in Alice's own
  // printed sentence and the width of her own rendered band are
  // always identically 3°, never two separately-drifting values.
  const S_HALF = Math.round(kernelHalf(PS_EXAMPLE));

  // Before ch.1 ends, p_r just holds at its loose starting value (both
  // bands sit at full width while the recap/contrast chapters introduce
  // them); ch.2 is the only chapter where it actually moves, continuously,
  // straight off scroll position every frame.
  function currentPr(t) {
    if (t <= CH.wrongEnd) return PR_MAX;
    const u = smoothstep(CH.wrongEnd, CH.shrinkEnd, t);
    return lerp(PR_MAX, PR_MIN, u);
  }

  // `lo`/`hi` are the *raw*, unrounded interval -- what actually gets
  // drawn, so the band itself moves exactly as smoothly as scroll does,
  // never snapping between whole-degree pixel positions. `displayLo`/
  // `displayHi` are what actually gets printed, rounded to a whole
  // degree -- and since re-drawing an unchanged string is a no-op, the
  // *sentence* only ever visibly updates once its own rounded degree
  // actually ticks over, exactly as a person rounding a measurement to
  // say out loud would. Both call the *same* kernelHalf(pr) -- see its
  // own note above for why that has to be shared, not per-side.
  function ignoranceRange(t) {
    const half = kernelHalf(currentPr(t));
    const displayHalf = Math.round(half);
    return { lo: R_CENTER - half, hi: R_CENTER + half, displayLo: R_CENTER - displayHalf, displayHi: R_CENTER + displayHalf };
  }
  function wrongRange(t) {
    const half = kernelHalf(currentPr(t));
    const displayHalf = Math.round(half);
    return { lo: W_CENTER - half, hi: W_CENTER + half, displayLo: W_CENTER - displayHalf, displayHi: W_CENTER + displayHalf };
  }

  // ---- Canvas / DOM setup --------------------------------------------------
  const track = document.getElementById("scrollTrack");
  const pinned = track.querySelector(".pinned");
  const canvas = document.getElementById("scene");
  const ctx = canvas.getContext("2d");
  const legend = document.getElementById("legend");
  const legendHeadingEl = document.getElementById("legendHeading");
  const legendBodyEl = document.getElementById("legendBody");

  const BOARD_ASPECT = 7 / 9;
  const UNIT_DIVISOR = 9;
  let board = { bx: 0, by: 0, bw: 0, bh: 0 };
  let unit = 0;
  let dpr = window.devicePixelRatio || 1;
  let lastT = 0;
  let legendTopPx = Infinity;
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

  // The shared axis's own screen position -- fixed for the whole piece;
  // only each band's *width* ever changes (via ignoranceRange/
  // wrongRange above), so ch.2's shrink reads as "the same axis, the
  // same two bands, narrowing," not a different diagram replacing them.
  function axisRect() {
    // y = 0.22: Bob's two statements now share a single row above the
    // axis (side by side, not stacked -- see bobIgnoranceSlotPos/
    // bobWrongSlotPos's own note), so this only has to clear *one*
    // row's own worst-case height (up to 3 lines, from "Bob (incorrect
    // information):" wrapping on narrow viewports), not two stacked
    // rows the way an earlier layout did.
    return { x0: board.bx + board.bw * 0.08, x1: board.bx + board.bw * 0.92, y: board.by + board.bh * 0.22 };
  }
  function tempToX(temp) {
    const a = axisRect();
    return a.x0 + ((temp - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * (a.x1 - a.x0);
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const cw = track.clientWidth || window.innerWidth;
    const ch = window.innerHeight;
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

    render(lastT);
  }

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

  function roundRectPath(x, y, w, h, r) {
    const rad = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, rad);
    } else {
      ctx.moveTo(x + rad, y);
      ctx.arcTo(x + w, y, x + w, y + h, rad);
      ctx.arcTo(x + w, y + h, x, y + h, rad);
      ctx.arcTo(x, y + h, x, y, rad);
      ctx.arcTo(x, y, x + w, y, rad);
      ctx.closePath();
    }
  }

  // A kernel, drawn as a translucent horizontal band on the shared
  // temperature axis: width is the interval [loTemp, hiTemp]; height is
  // *fixed* and identical for every band, all on the same row, so two
  // bands that share territory (S inside R, always) actually overlap on
  // screen, not just conceptually -- their translucent fills visibly
  // blend there, distinct from the pure single-color territory either
  // one has on its own.
  //
  // The rounded end-caps add a *constant* `height` of extra width on
  // top of the true interval, rather than a floor that *replaces* the
  // true width once it gets small. That distinction matters: a floor
  // makes any two sufficiently narrow bands render at the exact same
  // fixed size regardless of their real difference -- which is exactly
  // what made R look like it had already shrunk to match S's own size
  // well before p_r had actually reached p_s (confirmed directly: R's
  // true half-width was still ~50% bigger than S's at the point they
  // looked identical on screen). Adding a constant instead of flooring
  // means the straight segment between the two end-caps is always
  // *exactly* the true interval width -- so any real difference between
  // two bands' sizes stays visible, however small both get; the shape
  // only degrades gracefully to a plain circle (never disappears) as
  // that true width goes to zero, rather than ever discarding it.
  function drawBand(loTemp, hiTemp, y, height, color, alpha, opts) {
    if (alpha <= 0.005) return;
    opts = opts || {};
    const x0 = tempToX(loTemp);
    const x1 = tempToX(hiTemp);
    const w = Math.max(x1 - x0, 0) + height;
    const x = (x0 + x1) / 2 - w / 2;
    ctx.save();
    roundRectPath(x, y - height / 2, w, height, height / 2);
    ctx.fillStyle = rgbCss(color, alpha * (opts.fillAlphaMult != null ? opts.fillAlphaMult : 0.4));
    ctx.fill();
    ctx.strokeStyle = rgbCss(color, alpha * (opts.strokeAlphaMult != null ? opts.strokeAlphaMult : 0.85));
    ctx.lineWidth = Math.max(1, unit * 0.022);
    ctx.stroke();
    ctx.restore();
  }

  function drawAxis(alpha) {
    if (alpha <= 0.005) return;
    const a = axisRect();
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = rgbCss(NEUTRAL, 0.4);
    ctx.lineWidth = Math.max(1, unit * 0.015);
    ctx.beginPath();
    ctx.moveTo(a.x0, a.y);
    ctx.lineTo(a.x1, a.y);
    ctx.stroke();
    for (let temp = TEMP_MIN; temp <= TEMP_MAX; temp += 20) {
      const x = tempToX(temp);
      ctx.beginPath();
      ctx.moveTo(x, a.y - unit * 0.08);
      ctx.lineTo(x, a.y + unit * 0.08);
      ctx.stroke();
    }
    ctx.restore();
    for (let temp = TEMP_MIN; temp <= TEMP_MAX; temp += 20) {
      drawLabel(`${temp}\u00B0`, tempToX(temp), a.y + unit * 0.16, alpha * 0.55, "center", { sizeMult: 0.6 });
    }
  }

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

  // ---- The three statements --------------------------------------------------
  // Temperature-based from the very first frame -- an earlier version
  // opened with qualitative sentences ("It's raining and cold," "It's
  // cold," "It's sunny and hot") and only switched to numeric ranges
  // partway through ch.2, which meant the piece's own opening had
  // nothing to do with the axis/bands already on screen underneath it.
  // All three now share one format: an attribution (who this belief
  // belongs to, in that entity's own color) on its own line, then the
  // actual quoted sentence (in the plain label color, to visually
  // separate "who" from "what") on the line below -- and all three
  // persist for the rest of the piece, each with its own colored link
  // down to its own band, rather than fading out partway through.
  const ALICE_ATTRIBUTION = "Alice:";
  const IGNORANCE_ATTRIBUTION = "Bob (ignorance):";
  const WRONG_ATTRIBUTION = "Bob (incorrect information):";

  function aliceSentence() {
    return `Between ${S_CENTER - S_HALF}\u00B0 and ${S_CENTER + S_HALF}\u00B0.`;
  }
  function rangeSentence(range) {
    return `Between ${range.displayLo}\u00B0 and ${range.displayHi}\u00B0.`;
  }

  // Bob's two statements sit side by side, in one shared row above the
  // axis, each roughly above its *own* target on the axis (ignorance
  // above R, near 40°; incorrect information above R', near 85°) --
  // parallel to each other, at the same vertical position, so neither
  // one's own link ever has reason to travel across the other's
  // column. Two earlier layouts each put Alice's own statement
  // *somewhere* in that same shared row (first alongside Bob's
  // ignorance statement, then alongside his wrong-belief one) -- and
  // both times, Alice's own link (traveling to S, which sits at R's
  // *own* center) ended up crossing directly through whichever of
  // Bob's statements happened to occupy the space between her text
  // and S's own position. Moving Alice below the axis instead removes
  // the shared space entirely: her own link now travels *upward*, from
  // a zone neither of Bob's own links ever enters.
  function bobIgnoranceSlotPos() {
    return { x: board.bx + board.bw * 0.06, y: board.by + board.bh * 0.03 };
  }
  function bobWrongSlotPos() {
    return { x: board.bx + board.bw * 0.56, y: board.by + board.bh * 0.03 };
  }
  // Centered under S's own position on the axis, in the space *below*
  // it -- far enough down to clear the axis row's own tallest possible
  // extent (bandHeight/2 above/below its centerline) plus a margin.
  function aliceSlotPos() {
    return { x: tempToX(S_CENTER), y: board.by + board.bh * 0.32 };
  }

  // Draws a two-line statement: the attribution on its own line, in
  // `color`; the actual quoted sentence directly below it, in the
  // plain label color -- so "who this belief belongs to" and "what it
  // says" are distinguished both structurally (separate lines) and
  // visually (separate colors), not run together undifferentiated.
  // Returns the point a growing link should start from (bottom-center
  // of the whole two-line block).
  function drawAttributedStatement(attribution, sentence, pos, alpha, color, maxWidth, align, linkFromTop) {
    if (alpha <= 0.01) return null;
    const size = baseFontSize() * 0.85;
    const quoted = `\u201C${sentence}\u201D`;
    ctx.save();
    ctx.font = `${size}px ${FONT_FAMILY}`;
    const attrWidth = ctx.measureText(attribution).width;
    const quoteWidth = ctx.measureText(quoted).width;
    ctx.restore();

    const attrH = drawLabel(attribution, pos.x, pos.y, alpha * 0.92, align, {
      absoluteSize: size,
      color,
      glowColor: color,
      maxWidth: maxWidth != null && attrWidth > maxWidth ? maxWidth : undefined,
    });
    const sentenceY = pos.y + (attrH || size * 1.35);
    const quoteH = drawLabel(quoted, pos.x, sentenceY, alpha * 0.92, align, {
      absoluteSize: size,
      glowColor: color,
      maxWidth: maxWidth != null && quoteWidth > maxWidth ? maxWidth : undefined,
    });

    // Growing links start from directly *below* the block by default
    // (Bob's own two statements, both above their own targets) -- but
    // Alice's own statement sits *below* hers now, linking upward, so
    // its own link has to start from the block's *top* edge instead
    // (`linkFromTop`), or the line would visibly start from the wrong
    // side of her own text and run backward through it.
    const blockWidth = Math.min(Math.max(attrWidth, quoteWidth), maxWidth || Infinity);
    const originX = align === "center" ? pos.x : pos.x + blockWidth / 2;
    const originY = linkFromTop ? pos.y : sentenceY + (quoteH || size * 1.35);
    return { x: originX, y: originY };
  }

  const BAND_HEIGHT_MULT = 0.85;

  // ---- Chapter 0: recap -- S's band always contained in R's, same center --
  function drawIgnorance(t) {
    const a = axisRect();
    const bandHeight = unit * BAND_HEIGHT_MULT;
    const range = ignoranceRange(t);

    const axisAppear = smoothstep(0.02, 0.1, t);
    drawAxis(axisAppear);

    // R drawn *before* S, both translucent -- the region S occupies is
    // entirely inside R's own interval (same center, R always wider),
    // so that whole region shows the two colors blended together, and
    // R's own remaining territory outside it stays pure amber. That
    // blend is the actual point: S subset R, visible, not asserted.
    const rAppear = smoothstep(0.08, CH.ignoranceEnd - 0.03, t);
    drawBand(range.lo, range.hi, a.y, bandHeight, IGNORANT_COLOR, rAppear, { fillAlphaMult: 0.32 });

    const sAppear = smoothstep(0.14, 0.2, t);
    drawBand(S_CENTER - S_HALF, S_CENTER + S_HALF, a.y, bandHeight, SEED_GLOW, sAppear, { fillAlphaMult: 0.5, strokeAlphaMult: 0.95 });

    // Alice's own statement: temperature-based from the first frame,
    // never fades, always linked to S's own band -- the fixed reference
    // point both of Bob's own beliefs are being compared against.
    const aliceAppear = smoothstep(0, 0.1, t);
    const aliceFrom = drawAttributedStatement(
      ALICE_ATTRIBUTION,
      aliceSentence(),
      aliceSlotPos(),
      aliceAppear,
      SEED_GLOW,
      board.bw * 0.4,
      "center",
      true,
    );
    const aliceLinkP = smoothstep(0.04, 0.16, t);
    if (aliceFrom && aliceLinkP > 0) {
      // S's own *south* point -- Alice's text sits below the axis now,
      // linking upward, so the link has to reach the band's bottom
      // edge, not its top (which is what it targeted back when her
      // text sat above it).
      const target = { x: tempToX(S_CENTER), y: a.y + bandHeight / 2 };
      drawGrowingLink(aliceFrom, target, aliceLinkP, aliceAppear * (0.3 + 0.7 * aliceAppear), SEED_GLOW);
    }

    // Bob's ignorant belief: same treatment, also never fades -- its
    // own sentence updates live off `range` every single frame, from
    // this same first chapter onward (not introduced qualitatively
    // first and only switched to numbers partway through ch.2).
    const rAppear2 = smoothstep(0.1, 0.2, t);
    const rFrom = drawAttributedStatement(
      IGNORANCE_ATTRIBUTION,
      rangeSentence(range),
      bobIgnoranceSlotPos(),
      rAppear2,
      IGNORANT_COLOR,
      board.bw * 0.38,
    );
    const rLinkP = smoothstep(0.13, 0.24, t);
    if (rFrom && rLinkP > 0) {
      // The *northwest* point of R's own capsule, not northeast --
      // Bob's own statement now sits to the upper-*left* of R (see
      // bobIgnoranceSlotPos), so a link reaching for R's own left edge
      // approaches directly, at a natural angle; reaching all the way
      // across for the right edge instead (an earlier version, from
      // when the statement sat to the upper-right) meant the line cut
      // across the band itself to get there. Still live -- `range.lo`
      // moves with R's own width exactly as `range.hi` did.
      const target = { x: tempToX(range.lo), y: a.y - bandHeight / 2 };
      drawGrowingLink(rFrom, target, rLinkP, rAppear2 * (0.3 + 0.7 * rAppear2), IGNORANT_COLOR);
    }
  }

  // ---- Chapter 1: a genuinely wrong belief -- a second band, same axis -----
  // Centered far enough from S/R (see W_CENTER's own note) that it never
  // touches either one, at any width -- disjointness as plain spatial
  // separation on the one shared ruler, not an assertion.
  function drawWrongBelief(t) {
    const appear = smoothstep(CH.ignoranceEnd, CH.ignoranceEnd + 0.06, t);
    if (appear <= 0.005) return;
    const a = axisRect();
    const bandHeight = unit * BAND_HEIGHT_MULT;
    const range = wrongRange(t);

    drawBand(range.lo, range.hi, a.y, bandHeight, WRONG_COLOR, appear, { fillAlphaMult: 0.32 });

    // Bob's wrong belief: same treatment as his ignorant one -- also
    // never fades once introduced, its own sentence live off `range`
    // every frame. Stacked below the ignorance statement (see
    // bobWrongSlotPos's own note), so by the time both have appeared,
    // Bob's two beliefs read as a grouped pair, contrasted with
    // Alice's single one across the board.
    const from = drawAttributedStatement(WRONG_ATTRIBUTION, rangeSentence(range), bobWrongSlotPos(), appear, WRONG_COLOR, board.bw * 0.38);
    const linkP = smoothstep(CH.ignoranceEnd + 0.02, CH.ignoranceEnd + 0.14, t);
    if (from && linkP > 0) {
      const target = { x: tempToX(W_CENTER), y: a.y - bandHeight / 2 };
      drawGrowingLink(from, target, linkP, appear * (0.3 + 0.7 * appear), WRONG_COLOR);
    }
  }

  // ---- Chapter 2: both bands narrow together; the ratio climbs, live -------
  // Sized/positioned to clear both the axis row above it (which only
  // needs a modest height -- one shared row of bands, not two tall
  // circles) and the legend card below.
  function chartRect() {
    // y = 0.5, not 0.44 -- the Alice-kernel label above (see
    // drawIgnorance) sits at 0.38, and at narrow viewports (where
    // baseFontSize's own floor makes it relatively tall) its own
    // single line ran right into this rect's "ratio" axis title at
    // 0.44 (confirmed directly by screenshot). This leaves a clear gap.
    return { x: board.bx + board.bw * 0.1, y: board.by + board.bh * 0.5, w: board.bw * 0.8, h: board.bh * 0.18 };
  }

  function drawChart(t) {
    // The chart's own scaffolding (axes, p_s line, tick labels) fades in
    // *during ch.1*, well before ch.2 -- so by the time the kernels
    // actually start narrowing (t > wrongEnd), the chart is already at
    // full opacity, not still ramping up. An earlier version faded the
    // whole chart in *starting* at wrongEnd (the same instant the
    // kernels start moving), which meant the marker was still mostly
    // transparent for the first several hundredths of ch.2 while the
    // kernels were already visibly shrinking at full opacity --
    // mathematically the two were always exactly locked (same p_r,
    // verified directly), but that opacity lag *read* as the marker
    // trailing behind. Now nothing about ch.2 depends on a separate
    // fade-in at all: the curve/marker are drawn at this same, already-
    // full appear from the instant t crosses wrongEnd.
    const appear = smoothstep(CH.ignoranceEnd, CH.ignoranceEnd + 0.1, t);
    if (appear <= 0.005) return;

    const rect = chartRect();
    // Domain tightened to match p_r's own actual configured range
    // (PR_MIN..PR_MAX) with a little margin on each side, rather than
    // the full [something-near-0, 1-p_s] the underlying ratioFn is
    // defined over -- otherwise, now that PR_MAX itself is much smaller
    // (0.4, not 0.85 -- see its own note above), the curve would only
    // ever occupy a small fraction of the chart's own width, leaving
    // most of it visibly empty.
    const xMin = 0.06;
    const xMax = 0.44;
    const yMax = 4;
    function toPx(pr, y) {
      const xf = (pr - xMin) / (xMax - xMin);
      return { x: rect.x + xf * rect.w, y: rect.y + rect.h - (y / yMax) * rect.h };
    }

    ctx.save();
    ctx.globalAlpha = appear;
    ctx.strokeStyle = rgbCss(NEUTRAL, 0.45);
    ctx.lineWidth = Math.max(1, unit * 0.02);
    ctx.beginPath();
    ctx.moveTo(rect.x, rect.y);
    ctx.lineTo(rect.x, rect.y + rect.h);
    ctx.lineTo(rect.x + rect.w, rect.y + rect.h);
    ctx.stroke();
    ctx.restore();

    const psX = toPx(PS_EXAMPLE, 0).x;
    ctx.save();
    ctx.globalAlpha = appear;
    ctx.setLineDash([unit * 0.06, unit * 0.06]);
    ctx.strokeStyle = rgbCss(NEUTRAL, 0.5);
    ctx.lineWidth = Math.max(1, unit * 0.015);
    ctx.beginPath();
    ctx.moveTo(psX, rect.y);
    ctx.lineTo(psX, rect.y + rect.h);
    ctx.stroke();
    ctx.restore();
    // Clamped against the legend's own actual current top edge -- same
    // reasoning as "What a Sentence Means"/script.js's own drawWorldDot:
    // a resize()-only measurement goes stale as the legend's own
    // content (and height) changes between chapters, and this row sits
    // close enough to it at some aspect ratios that a few px of drift
    // matters.
    const axisLabelY = Math.min(rect.y + rect.h + unit * 0.06, legendTopPx - unit * 0.55);
    // Just "p_s", no "= 0.1" -- the actual number is a probability
    // (Alice's own kernel's share of the whole space), not a
    // temperature, and printing it here (right under a temperature
    // axis) invited reading it as one -- a distraction from what the
    // dotted line is actually marking (where p_r would equal p_s).
    drawLabel("p\u209B", psX, axisLabelY, appear * 0.8, "center", { sizeMult: 0.72 });

    drawLabel("ratio", rect.x - unit * 0.06, rect.y - unit * 0.1, appear * 0.85, "left", { sizeMult: 0.78, anchor: "bottom" });
    drawLabel("4", rect.x - unit * 0.16, rect.y, appear * 0.7, "right", { sizeMult: 0.72 });
    drawLabel("0", rect.x - unit * 0.16, rect.y + rect.h - unit * 0.1, appear * 0.7, "right", { sizeMult: 0.72 });
    drawLabel("p\u1D63", rect.x + rect.w, axisLabelY, appear * 0.8, "center", { sizeMult: 0.78 });

    // The curve reveals progressively from the right (p_r = PR_MAX, low
    // ratio) toward the left (today's current p_r), moving continuously
    // with scroll, same as the two circles above -- the marker's own
    // position isn't tied to either side's *rounded* display (which can
    // differ from each other by a fraction of a degree's worth of p_r);
    // it tracks the raw, shared p_r(t) the whole piece is built on.
    const pr = currentPr(t);
    if (t > CH.wrongEnd) {
      // One shared boundary for *both* the curve's own clip and the
      // marker's clamp -- the marker is a point on this exact curve, so
      // it has to be cut off at exactly the same place the curve itself
      // is, or it visually detaches from the line whenever the true
      // ratio exceeds what's clipped/visible (confirmed directly: the
      // curve was clipped at 0.35*unit above rect.y, but the marker's
      // own separate clamp -- plus an even earlier value-space cap at
      // yMax*1.3, unrelated to the curve's own clip boundary at all --
      // pinned it to only 0.1*unit above rect.y, a visibly different
      // point once ratio got large).
      // Clamping only the marker's own *y* (an earlier version) while
      // leaving its true, unclamped x in place doesn't put it back on
      // the curve -- the curve isn't a vertical line, so "the same x,
      // a clamped y" is a *different point* than "wherever the curve
      // actually is at the clip boundary." That's exactly why the dot
      // kept drifting left of the visible line as p_r got close to
      // p_s: its x was already tracking the true (further-left) p_r
      // while its y got held back, so the two stopped corresponding to
      // the same point on the curve at all. Fixed by never computing
      // the marker independently in the first place -- it's just
      // whichever of the *same* discrete samples used to stroke the
      // curve is the last one still inside the clip region, walked in
      // the same loop, guaranteed to be a real point on the visible
      // curve every time, however close p_r gets to p_s.
      const CLIP_TOP = rect.y - unit * 0.35;
      ctx.save();
      ctx.globalAlpha = appear;
      ctx.beginPath();
      ctx.rect(rect.x, CLIP_TOP, rect.w, rect.y + rect.h - CLIP_TOP);
      ctx.clip();
      ctx.strokeStyle = rgbCss(WRONG_COLOR, 1);
      ctx.lineWidth = Math.max(1, unit * 0.03);
      ctx.beginPath();
      const N = 160;
      let started = false;
      let markerPt = null;
      for (let i = 0; i <= N; i++) {
        const prSample = PR_MAX - (i / N) * (PR_MAX - pr);
        const pt = toPx(prSample, ratioFn(prSample));
        if (!started) {
          ctx.moveTo(pt.x, pt.y);
          started = true;
        } else {
          ctx.lineTo(pt.x, pt.y);
        }
        // ratioFn is monotonically decreasing in p_r, and prSample is
        // itself monotonically decreasing as i increases -- so pt.y
        // (screen space) only ever moves *up* across this loop, never
        // back down; the last sample still at/below CLIP_TOP is
        // unambiguously "the furthest along the curve that's still
        // visible," not just some earlier point along the way.
        if (pt.y >= CLIP_TOP) markerPt = pt;
      }
      ctx.stroke();
      ctx.restore();

      if (markerPt) drawGlow(markerPt.x, markerPt.y, unit * 0.06, WRONG_COLOR, appear, 2.4);

      // Fixed at the chart's own top-right corner, not attached to the
      // marker -- the marker's own x/y position is unconstrained (it
      // has to go wherever the curve is), and near the end of ch.2 it
      // sits close enough to the top-left "ratio" axis title that a
      // label following it there collided with that title directly
      // (confirmed by screenshot). A fixed position only has to clear
      // the axis title *once*, not at every possible marker position.
      const ratioLabelAlpha = smoothstep(CH.wrongEnd + 0.03, CH.wrongEnd + 0.08, t) * appear;
      if (ratioLabelAlpha > 0.01) {
        const ratioText = `ratio \u2248 ${Math.min(ratioFn(pr), 99).toFixed(1)}\u00D7`;
        drawLabel(ratioText, rect.x + rect.w, rect.y - unit * 0.1, ratioLabelAlpha, "right", {
          sizeMult: 0.8,
          anchor: "bottom",
          glowColor: WRONG_COLOR,
        });
      }
    }
  }

  function drawScene(t) {
    drawIgnorance(t);
    drawWrongBelief(t);
    drawChart(t);
  }

  // ---- Top-level render ---------------------------------------------------
  function render(t) {
    lastT = t;
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
  function frame() {
    if (window.innerHeight !== lastInnerHeight) {
      lastInnerHeight = window.innerHeight;
      resize();
    }
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
