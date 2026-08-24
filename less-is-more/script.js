// -----------------------------------------------------------------------
// "Less is More" -- a scroll-scrubbed build-up of the "Less is More"
// paradox (main text, "The Less is More paradox" / "Solution
// architecture"; worked numeric example in the SI, "An example of a
// deterministic, optimal algorithm for a small problem with targeted
// queries"). Companion piece to "No need to know" (content/explainer-
// no-need-to-know/): that piece dramatized the case where Alice does
// *not* know Bob's background R, so she hashes her kernel into a bin.
// This piece dramatizes the *other* case: Alice knows exactly what she
// wants Bob to end up able to prove -- a query Q -- and the challenge is
// purely about sending that efficiently. Following the paper's own
// p_r = 1 simplification (used for exactly this illustration in Fig.
// 4(a)), Bob's background R is dropped entirely: everything here is
// about the relationship kappa(S) subseteq kappa(Q).
//
// Like piece one, this starts from a concrete sentence, linked to its
// kernel by a growing line: Alice's specific "It's raining and cold and
// windy." (a small kernel, S) and Bob's weaker "It's cold." (a larger
// kernel, Q, since S entails Q). The two "obvious" ways to send this --
// describe Q outright, or describe S outright -- are then shown to cost
// genuinely different amounts, via a small chart that actually plots
// H_bin(p_q) (a curve) against H_bin(p_s) (a constant), mirroring the
// paper's own Figure 4(a) -- not asserted in prose. A third, in-between
// sentence ("It's raining and cold.", piece one's own example) is then
// introduced as a concrete instance of a cheaper "candidate" kernel,
// tying to a third curve on the same chart: the genuine optimum, always
// below both naive strategies.
//
// The piece then shows that very same candidate also works for a second,
// completely independent scenario (drawn as a differently-shaped, partly
// overlapping oval, Venn-diagram style, never concentric with the first
// -- there's no real size relationship between two unrelated scenarios,
// so drawing them concentrically would assert a false fact), before
// pulling back to give a sense of how many such scenarios exist.
//
// A single scalar t in [0,1], derived every frame from scroll position,
// drives every visual change. Nothing animates from wall-clock time --
// when scrolling stops, the scene is perfectly static.
//
// The diagram itself carries no prose: no math-notation labels (kappa(S),
// kappa(Q), the candidate containment relation), no explanatory captions
// (what the tile is, why it's cheaper) -- all of that lives in the
// legend card, in plain language, and only there. The one deliberate
// exception is the concrete logic sentences themselves (Alice's, Bob's,
// S2's, Q2's, the candidate's own) and their growing links to the
// kernels they name: those are a different kind of thing from an
// explanatory label -- concrete content the rest of the piece reasons
// about, not narration describing what's already on screen -- and stay.
//
// Phase 2 ("Guess the Door," everything past LEGACY_END below) folds in
// a second, concrete dramatization of the *same* mechanism: the SI's own
// worked 6-action example, previously a separate, differently-skinned
// interactive at content/demo-game-show-code/ (untouched, still there).
// A glowing disc's own meaning, established from chapter 0 on, is "a
// kernel" -- a *set* of possibilities. A door is not that: it's a single
// *element* of the 6-item universe. So doors are drawn as plain points,
// never as their own discs, and a kernel here -- a candidate group, or
// the player's own live selection -- is drawn as the complete graph on
// its member points (every pair joined by a line, reusing
// drawGrowingLink, the same primitive used everywhere else in this piece
// for "these are related"), not as an enclosing shape. This isn't only a
// metaphor: the SI's own 4x6 codebook (GROUPS, below) turns out to be
// exactly the 4 vertex-stars of a tetrahedron whose 6 edges are the 6
// doors -- verified directly from GROUPS, not asserted -- and the fixed
// door layout below is a planar drawing of that same graph. See
// verifyGameGeometry() for the checked facts, and the comments around
// GAME_R_SIDE/GAME_R_SPOKE for why the two point-radii differ.
// -----------------------------------------------------------------------

(function () {
  "use strict";

  // ---- Chapter boundaries (t ranges), per the storyboard -----------------
  // Note the order: the second, independent scenario (ch.5) arrives, and
  // the "short pre-agreed list serves many scenarios at once" argument is
  // made, *before* the concrete candidate is revealed (ch.6) -- not
  // after. The candidate being cheap isn't explained by it being "in the
  // middle" (by that logic, one of the two extremes might just as well
  // have been cheaper); it's explained by a short, reusable list covering
  // many scenarios at once, which has to be established first.
  const CH = {
    aliceEnd: 0.11, // 0: Alice's sentence, linked to its kernel S. Was
    // 0.07 -- too little scroll before "What Alice knows" gave way to
    // "What Alice will allow Bob to prove," reported directly as feeling
    // sudden. Widened; bobEnd (below) is pushed later by the same
    // amount, preserving Bob's own reveal at the same relative pace
    // rather than compressing it into a now-shorter remaining window.
    bobEnd: 0.2, // 1: Bob's weaker sentence, linked to its kernel Q (S subset Q)
    relabelEnd: 0.24, // 2: Alice's/Bob's sentences fade; the chart appears
    qCurveEnd: 0.36, // 3: cost chart appears -- H_bin(p_q) curve alone
    sLineEnd: 0.46, // 4: + H_bin(p_s), a fixed line -- the two are compared
    doBetterEnd: 0.52, // 5: "can we do better?" -- posed, not yet answered.
    // Was 0.5 (only 0.04 of scroll after sLineEnd); widened to give this
    // card more room, borrowing a little from scenario 2's own reveal
    // (chapter 6, below) -- which still has comfortable margin left
    // before its own animations need to finish ahead of scenario2End.
    scenario2End: 0.64, // 6: a second, independent scenario (oval) arrives;
    // the "one shared set can serve many scenarios" argument is made
    candidateStatementEnd: 0.77, // 7: the concrete shared sentence itself,
    // and its double entailment -- nothing about a *list* yet. Set with
    // a deliberate buffer *after* the candidate's own growing link
    // finishes reaching its disc (which completes at scenario2End + 0.1
    // = 0.74, independently of this boundary): the card describing that
    // sentence must not be replaced before its own link visibly finishes
    // touching the circle it's about.
    codebookEnd: 0.84, // 8: "a short list of candidate kernels" is named,
    // as one whole sentence -- the two discs flanking the real candidate
    // appear at this exact moment, so the idea has something concrete on
    // screen the instant it's introduced, not only once the later
    // pull-back arrives
    lessEnd: 0.895, // 9: "This is what Less means" -- names the paper's own
    // theorem, then the cost claim
    candidateEnd: 0.96, // 10: "This is what More means" -- Bob's actual
    // kernel is smaller than the query, so he ends up able to prove more
    // than was strictly required, concretely; a direct callback to
    // chapter 0's own "smaller kernel, more informative" point. This is
    // the *last* legend chunk -- "many situations, one short list" and a
    // separate "Less is More" finale used to follow, but once "Less" and
    // "More" each got their own dedicated card, both had already been
    // said; they were retired rather than repeat the same points a
    // second time. candidateEnd and scaleEnd remain as pure *visual*
    // timing anchors past this point (the chart's own curve emphasis,
    // the resting frame's fade-in) -- no more legend text changes with
    // them, but the chart and the resting frame still need to know when
    // to do their own thing.
    scaleEnd: 0.995, // 11: the optimal curve's own emphasis
    // (manyScenariosBoostAt) reaches full strength; resting frame begins
    // 12: 0.995 -> 1.00 resting frame -- the full picture, held. (This
    // tail is deliberately allowed to run faster than the reading-heavy
    // chapters above: once the viewer reaches the bottom of the page,
    // t clamps at 1 and simply stays there -- there's no next card to be
    // rushed past, so there's no cost to a shorter nominal window here.
    // The budget saved this way is what lets chapters 6-10 above run at a
    // comfortable pace instead. Everything past candidateEnd that needs
    // to fit before t=1 -- manyScenariosBoostAt and the resting frame
    // itself -- is anchored to scaleEnd from its *own* end, not to
    // candidateEnd via a fixed offset, so this tail keeps working
    // correctly no matter how far candidateEnd and scaleEnd end up being
    // retuned relative to each other again.)
  };

  // ---- Phase 2 ("Guess the Door"): where it starts, and its own chapter
  // boundaries -----------------------------------------------------------
  // Every constant and offset above (all of CH, every qBoostAt/sBoostAt/
  // candBoostAt/moreBoostAt window, every hand-solved margin inside
  // drawVennProof/drawCostChart/drawCandidateStatement/drawScalePopulation)
  // was tuned and screenshot-verified against a *local* t running 0->1
  // over the *original* 600vh track's own effective scroll range. Adding
  // a second half past the old ending means the overall track (and so
  // the *outer* t computeT() now returns) is physically longer -- and
  // rescaling all of those dozens of constants to match would silently
  // change how many scroll-pixels each one still spans, undoing that
  // verification without anyone re-checking it. Instead, outer t is
  // split in two, and phase 1 is left *completely untouched*: every
  // function above still receives its own local t running 0->1 over
  // exactly the scroll-pixel range it was verified against; only the
  // *outer* mapping from scroll position to that local t changes.
  //
  // LEGACY_END is where phase 1's own t=1 lands in the new, longer outer
  // t. Solved exactly, not approximated: style.css grew the track from
  // 600vh to 1000vh, so outer scroll range is (1000-100)=900 viewport-
  // heights (100vh being the pinned viewport itself); LEGACY_END*900 has
  // to equal phase 1's original (600-100)=500 viewport-heights, i.e.
  // LEGACY_END = 500/900 = 5/9.
  const LEGACY_END = 5 / 9;

  // Phase 2's own chapter boundaries, as a local t running 0->1 over the
  // *remaining* (1 - LEGACY_END) share of outer t -- see tGameOf() below.
  // Chapters 1-6 (the storyboard's own numbering; phase 1 already used
  // 0-10) are simple scroll-driven fades, same idiom as phase 1: a short,
  // plain-prose story (doors, a prize, a dud) that walks through the
  // actual numbers -- telling Alice's whole knowledge outright (~4.9
  // bits), then the realization that Bob doesn't need all of it (~2.58
  // bits), then the real answer (2 bits) -- entirely in the legend card,
  // with no new canvas machinery at all: several earlier attempts to
  // *visualize* this same progression directly on the board (circles,
  // graph edges, checkmark/question-mark recoloring, a full comparison
  // table) each surfaced their own real problems in turn; plain prose,
  // read alongside the same six unchanging points, turned out to need
  // none of that. Chapter 7 onward ("Play, blind") is deliberately *not*
  // t-driven past `playArrive`: Round 1 -> cheat sheet -> Round 2 are
  // choice-dependent, not a fixed sequence a scrollbar could represent,
  // so the board and the legend both switch from following t to
  // following real game state (clicks) at that point. Scrolling further
  // still "works" (nothing breaks), it just has nothing left to drive.
  const CHG = {
    transitionEnd: 0.08, // 1: recap card; phase 1's own diagram/tile/chart
    // fade out together, one shot, no fade back in (captionAlpha with no
    // inStart..inEnd half -- the same one-shot pattern candidateEnd's own
    // sentence fade-outs already use elsewhere in this file).
    doorsEnd: 0.2, // 2: "six doors, two that matter" -- prize, dud; the
    // 6 door-points fade in at their fixed positions
    scoopEnd: 0.32, // 3: Alice has the scoop, but a limited channel
    obviousEnd: 0.44, // 4: the most obvious option -- tell Bob
    // everything outright, ~4.9 bits
    enoughEnd: 0.58, // 5: the realization -- Bob only needs a safe set
    // that includes the prize; naming the prize door alone already
    // works, ~2.58 bits, but there's something better still
    signalEnd: 0.72, // 6: just 2 bits, actually -- Alice's 2-dot signal
    // fades in near the board
    playArrive: 0.85, // 7: "Play, blind" -- the board stops following t
    // from here on; see the note above.
  };

  // ---- Legend copy, synchronized to the same chapter boundaries as the
  // graphic itself. Each chunk's heading/body replaces the previous one's
  // as t crosses its `from` threshold; together they cover the full [0,1]
  // range with no gaps.
  // Legend prose is deliberately plain-language and symbol-free: no raw
  // formulas (those stay properly typeset on the canvas, via
  // drawMathExpr, where they belong), no SI references or specific
  // numbers borrowed from it (2 bits, four entries -- those belong to a
  // worked example this piece hasn't built), and one consistent
  // vocabulary throughout. The one deliberate exception: once the piece
  // has fully demonstrated the result itself, "This is what Less means"
  // names the paper's own theorem by name -- a reveal earned by that
  // point, not a claim borrowed without showing the work.
  //   - these are logic sentences, never "descriptions"
  //   - a kernel is the collection of possible worlds consistent with a
  //     sentence -- "possible world" throughout, not a shifting mix of
  //     "way," "possibility," etc.
  //   - a sentence and its kernel are never conflated ("X is a kernel" is
  //     wrong; "X's kernel is..." is right)
  //   - no size claim about a kernel until there's a second kernel on
  //     screen to compare it against -- "small" or "big" in isolation,
  //     with nothing established to be small or big *relative to*, is
  //     meaningless
  //   - Bob is never given agency he doesn't have: he doesn't "need" or
  //     "decide" anything, he simply ends up able to prove whatever
  //     Alice's communication leaves him able to prove. Every "task" or
  //     "goal" belongs to Alice (she is the one given the query and
  //     tasked with letting Bob end up proving it), never to Bob.
  //   - Alice never "states," "sends," or "names" a *sentence*. Many
  //     different sentences can share the same kernel (semantic content);
  //     what actually gets communicated -- what the "cost" curves are
  //     the cost *of* -- is always a kernel. A sentence appears only as a
  //     concrete, readable stand-in for the kernel it happens to express
  //     ("here's a sentence whose kernel does the job"), never as the
  //     object of a sending/communicating verb.
  //   - no claim that a strategy "is cheap" or "isn't cheap" without a
  //     second, already-shown cost to compare it against -- the same
  //     self-consistency requirement as the no-size-claim-in-isolation
  //     rule above, applied to cost instead of size. And the source of
  //     the eventual savings is never attributed to Alice and Bob having
  //     "planned ahead" or "considered many situations" per se -- sending
  //     either kernel outright is *already* a general-purpose strategy
  //     that works for whatever situation turns out to be real, so
  //     advance planning alone doesn't distinguish the codebook approach.
  //     What actually differentiates it (one short, shared entry serving
  //     more than one *independent* situation at once) is only asserted
  //     once a second situation is actually on screen to demonstrate it.
  const LEGEND_CHUNKS = [
    {
      from: 0,
      heading: "What Alice knows",
      body:
        "\u201CIt's raining and cold and windy.\u201D is a logic sentence. Its kernel is the collection of all possible worlds that are consistent with that sentence.",
    },
    {
      from: CH.aliceEnd,
      heading: "What Alice will allow Bob to prove",
      body:
        "Suppose Alice's task is to let Bob end up able to prove a weaker sentence \u2014 the query: \u201CIt's cold.\u201D Its kernel is bigger than Alice's own: it contains every possible world that Alice's own kernel does, plus others besides.",
    },
    {
      from: CH.relabelEnd,
      heading: "Sending the query outright",
      body:
        "One obvious strategy: Alice just communicates the query's kernel outright. Its cost is shown here as the amber curve.",
    },
    {
      from: CH.qCurveEnd,
      heading: "Sending Alice's own kernel outright",
      body:
        "Alternatively, Alice communicates her own kernel directly. Its cost is shown here as the flat cyan line. The two strategies aren't equally expensive.",
    },
    {
      from: CH.sLineEnd,
      heading: "Can we do better?",
      body:
        "Is there a cheaper way to get either kernel across? The answer only becomes visible once a second, completely independent situation is considered alongside this one.",
    },
    {
      from: CH.doBetterEnd,
      heading: "A second, independent scenario",
      body:
        "Suppose instead Alice's sentence had been \u201CIt's raining and cold and cloudy,\u201D and her task was to let Bob end up able to prove the weaker \u201CIt's raining.\u201D A completely different situation \u2014 with no special connection to the first \u2014 drawn as a different shape, in a different color, overlapping the first only partly.",
    },
    {
      from: CH.scenario2End,
      heading: "One kernel fits both",
      body:
        "Concretely, here's a sentence whose kernel does the job: \u201CIt's raining and cold.\u201D Weaker than either of Alice's own sentences, so its kernel is bigger than either of theirs, yet still strong enough to prove both queries, \u201Ccold\u201D and \u201Craining.\u201D",
    },
    {
      from: CH.candidateStatementEnd,
      heading: "A short, shared list",
      body:
        "If Alice and Bob agree on a short list of candidate kernels in advance, sending just this kernel's place on the list works for whichever situation arises \u2014 reused every time, not worked out anew.",
    },
    {
      from: CH.codebookEnd,
      heading: "This is what \u201CLess\u201D means",
      body:
        "In the paper, this result is called the \u201CLess is More\u201D theorem. Sending a kernel this way costs less than either strategy above, for both situations at once \u2014 shown here as the blue curve, settling in below both others.",
    },
    {
      from: CH.lessEnd,
      heading: "This is what \u201CMore\u201D means",
      body:
        "The kernel Bob actually ends up with \u2014 the candidate's \u2014 is smaller than the query's own kernel. A smaller kernel proves more, exactly as the very first situation shown established: \u201CIt's raining and cold\u201D rules out more than either \u201Ccold\u201D or \u201Craining\u201D alone.",
    },
  ];

  // ---- Phase 2's own legend copy -------------------------------------------
  // Chapters 1-6, keyed to tGame (see tGameOf() below) the same way
  // LEGEND_CHUNKS above is keyed to phase 1's own local t. A short,
  // plain-prose story -- doors, a prize, a dud -- that walks through the
  // actual numbers (4.9 bits, then 2.58, then 2) instead of asserting
  // "2 bits" out of nowhere. Deliberately no new canvas machinery for
  // any of it: the same six unchanging points sit there the whole time;
  // only the legend text changes. Echoes phase 1's own vocabulary
  // ("short list") once the real mechanism is reached, rather than
  // introducing new terms for the same idea.
  const GAME_LEGEND_CHUNKS = [
    {
      from: 0,
      heading: "Here's what this looks like, concretely",
      body:
        "Alice needs to get you safely to a prize \u2014 but she can't just show you everything she knows. Here's the same idea as before, played out as a simple game.",
    },
    {
      from: CHG.transitionEnd,
      heading: "Six doors, two that matter",
      body:
        "Behind one door is a prize; behind another, a dud. You'll walk away with the prize only if you open the door that has it \u2014 and never open the one with the dud.",
    },
    {
      from: CHG.doorsEnd,
      heading: "Alice has the scoop",
      body:
        "Alice knows exactly which door hides the prize, and which hides the dud. The catch: she only has a short message she can send back to you.",
    },
    {
      from: CHG.scoopEnd,
      heading: "The most obvious option",
      body:
        "Alice could just tell you everything she knows: which door has the prize, and which has the dud. That's one specific fact out of 30 possibilities \u2014 about 4.9 bits.",
    },
    {
      from: CHG.obviousEnd,
      heading: "But you don't need all that",
      body:
        "All you actually need is a set of doors that's safe to open \u2014 no dud among them \u2014 guaranteed to include the prize. Just naming the prize door alone already does that: one of six, about 2.58 bits. But there's something even better.",
    },
    {
      from: CHG.enoughEnd,
      heading: "Alice's signal",
      body:
        "Just 2 bits, in fact. Alice is continuously broadcasting a 2-bit signal, shown here as two small marks \u2014 though it means nothing on its own until you also have a shared list to decode it.",
    },
  ];

  // From chapter 4 on, the legend is keyed to the game's own state
  // (`gamePhase`) rather than to t -- see the CHG.playArrive note above.
  const GAME_PHASE_TEXT = {
    blind: {
      heading: "Play, blind",
      body: "Pick some doors, then open them. Find the one with the prize; avoid the one with the dud.",
    },
    cheatsheet: {
      heading: "The short list, made concrete",
      body:
        "This is the same short list from before, made concrete: four pre-agreed candidate kernels, each a subset of these six doors. (Bonus fact: these six doors are a tetrahedron's six edges; each group is the three edges meeting at one corner.)",
    },
    hinted: {
      heading: "Play, with the code",
      body: "Decode Alice's signal, open exactly that group's doors, and win every time.",
    },
  };

  // ---- Palette -------------------------------------------------------------
  // Color = variable identity, kept identical between the diagram and the
  // chart: kappa(S) is this cyan everywhere it appears (its own disc, and
  // the H_bin(p_s) line); kappa(Q) is this amber everywhere it appears
  // (its own circle, and the H_bin(p_q) curve). A disc and a curve
  // sharing a name but *not* sharing a color would undercut the whole
  // point of drawing both.
  const BG = "#050208";
  const SEED_GLOW_HEX = "#b8fffa"; // kappa(S) -- disc and chart line
  const CHART_Q_COLOR_HEX = "#e8a23b"; // kappa(Q) -- circle and chart curve
  const SCENARIO2_COLOR_HEX = "#d15fd0"; // scenario 2 (oval) -- piece one's magenta
  const CANDIDATE_COLOR_HEX = "#3b7fe0"; // the shared candidate -- disc and chart curve
  const NEUTRAL_HEX = "#dfe8ea";
  const LABEL_HEX = "#dfe8ea";
  // Phase 2 only. A door's role (correct/catastrophic) isn't a kernel --
  // there's nothing here to keep color-identical with a curve the way
  // kappa(S)/kappa(Q)/the candidate are elsewhere -- so this is a fresh,
  // ordinary safe/danger pair, not drawn from the kernel palette above.
  const CORRECT_COLOR_HEX = "#7be07f";
  const CATASTROPHIC_COLOR_HEX = "#ff6a6a";

  // ---- Board -----------------------------------------------------------------
  const BOARD_ASPECT = 7 / 9;
  const UNIT_DIVISOR = 8;

  const CENTER_FX = 0.5;
  const CENTER_FY = 0.26;

  // Phase 2's own board anchor/scale -- see gameToBoard() below. Tuned
  // (like CENTER_FY/UNIT_DIVISOR above) by screenshotting the actual
  // composition: high enough to leave room above for the win/loss banner
  // and Alice's signal, and below for the tally line and the cheat
  // sheet's own two rows of mini-boards. 0.27 left the banner clipped off
  // the top of the viewport on wide-but-short boards (900x600 and
  // similar, where board.by is 0) -- reported directly. Solved for
  // directly against that exact case (see the banner/tally arithmetic in
  // drawResultBanner/drawTally's own callers): 0.30 leaves >=15px of
  // margin both above the banner and between the tally and the cheat
  // sheet's own first row, at that viewport.
  const GAME_CENTER_FX = 0.5;
  const GAME_CENTER_FY = 0.3;
  const GAME_UNIT_DIVISOR = 3.6;

  // The cost chart's own rect, as board fractions (not pixels, since the
  // tile grid below is built once, before board dimensions are known,
  // and needs to skip cells that would land on the chart -- using these
  // same bounds, not a hand-copied approximation of them).
  const CHART_FX0 = 0.14;
  const CHART_FX1 = 0.14 + 0.72;
  const CHART_FY0 = 0.56;
  const CHART_FY1 = 0.56 + 0.16;

  // ---- Small helpers, reused verbatim from piece one -----------------------
  function clamp(x, lo, hi) {
    return Math.max(lo, Math.min(hi, x));
  }

  function smoothstep(edge0, edge1, x) {
    if (edge0 === edge1) return x < edge0 ? 0 : 1;
    const u = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return u * u * (3 - 2 * u);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  const SEED_GLOW = hexToRgb(SEED_GLOW_HEX);
  const SCENARIO2_COLOR = hexToRgb(SCENARIO2_COLOR_HEX);
  const CANDIDATE_COLOR = hexToRgb(CANDIDATE_COLOR_HEX);
  const NEUTRAL = hexToRgb(NEUTRAL_HEX);
  const LABEL_COLOR = hexToRgb(LABEL_HEX);
  const CHART_Q_COLOR = hexToRgb(CHART_Q_COLOR_HEX);
  const CORRECT_COLOR = hexToRgb(CORRECT_COLOR_HEX);
  const CATASTROPHIC_COLOR = hexToRgb(CATASTROPHIC_COLOR_HEX);

  function rgbCss(c, alpha) {
    return `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, ${alpha})`;
  }

  const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';

  // ---- The paper's own cost functions ---------------------------------------
  // H_bin(p) = -p log2(p) - (1-p) log2(1-p) (binary entropy). With p_r = 1,
  // the main text ("The Less is More paradox" paragraph) gives: sending Q
  // outright costs Lambda(p_q, 1-p_q) = H_bin(p_q) bits, sending S outright
  // costs Lambda(p_s, 1-p_s) = H_bin(p_s) bits, and the optimal strategy
  // costs Lambda(p_s, 1-p_q) bits -- strictly less than either, except at
  // the single point p_q = p_s where all three meet. p_s = 0.15 matches
  // the paper's own Figure 4(a).
  function hbin(p) {
    if (p <= 0 || p >= 1) return 0;
    return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
  }

  function lambda(a, b) {
    if (a <= 0 || b <= 0) return 0;
    return a * Math.log2((a + b) / a) + b * Math.log2((a + b) / b);
  }

  const PS_EXAMPLE = 0.15; // Alice's "raining and cold and windy"
  const P_CANDIDATE_EXAMPLE = 0.35; // the in-between "raining and cold"
  const PQ_EXAMPLE = 0.65; // Bob's "cold"

  // A kernel's on-screen radius, in arbitrary local "diagram-space" units,
  // as a function of its normalized size p. Exponential, not linear: a
  // *linear* map would make a fixed size gap shrink to a barely visible
  // *ratio* the larger the kernel gets. This is the same formula the
  // scale population below uses (there, applied to actual pixels via the
  // `unit` scale factor); here it's evaluated once per named example so
  // that the diagram's proportions are literally tied to the same
  // quantities plotted on the chart.
  function pNormToLocalRadius(p) {
    const rMin = 0.28;
    const rMax = 2.0;
    return rMin * Math.pow(rMax / rMin, p);
  }

  // ---- The concrete example sentences ---------------------------------------
  const ALICE_STATEMENT = "It\u2019s raining and cold and windy.";
  const BOB_STATEMENT = "It\u2019s cold.";
  // Piece one's own sentence, reused here as the in-between example: it
  // entails Bob's "cold" (dropping "raining") without giving away Alice's
  // "windy" -- exactly the role of a candidate strictly between S and Q.
  const CANDIDATE_STATEMENT = "It\u2019s raining and cold.";
  // Scenario 2's own pair -- sharing "raining" and "cold" with scenario 1
  // but dropping/adding a *different* third conjunct, so S2 and Q2 are
  // logically independent of S1 and Q1 (neither entails the other) while
  // both still being entailed by, and entailing, the same candidate:
  // "raining and cold and cloudy" |= "raining and cold" |= "raining".
  const S2_STATEMENT = "It\u2019s raining and cold and cloudy.";
  const Q2_STATEMENT = "It\u2019s raining.";

  // ---- The Venn-diagram proof: geometry + verification ---------------------
  // Scenario 1 (circle): S1 and Q1 are concentric -- a real containment
  // fact (S1 really is a subset of Q1), drawn the direct way, with radii
  // tied to PS_EXAMPLE/PQ_EXAMPLE above via pNormToLocalRadius(). The
  // shared candidate is *also* concentric with scenario 1 (same real
  // fact, S1 subset candidate subset Q1), tied to P_CANDIDATE_EXAMPLE.
  //
  // Scenario 2 (oval) has no real size or containment relationship to
  // scenario 1 -- it's just some other, unrelated kernel pair -- so it is
  // positioned overlapping Q1 only partly, Venn-diagram style, never
  // concentric with it. Its own S2 *is* concentric with its own Q2 (same
  // single-scenario logic as scenario 1).
  //
  // All coordinates are in the same local "diagram space," converted to
  // board pixels by vennToBoard(). None of this is staged to merely look
  // right: verifyVennGeometry() below samples each shape's boundary and
  // throws at load time if any required containment fails.
  const VENN_Q1 = { cx: 0, cy: 0, r: pNormToLocalRadius(PQ_EXAMPLE) };
  const VENN_S1 = { cx: 0, cy: 0, r: pNormToLocalRadius(PS_EXAMPLE) };
  const VENN_CAND = { cx: 0, cy: 0, r: pNormToLocalRadius(P_CANDIDATE_EXAMPLE) };
  // S2 is deliberately close to S1's own size (not a token-sized oval),
  // which is why Q1 and Q2 have to overlap substantially -- the shared
  // candidate has to be big enough to contain two comparably-sized S's.
  // The candidate can grow up to 10% larger while highlighted (see
  // candBoostAt()); these numbers -- verified below, and re-checked
  // numerically before being committed -- keep it strictly inside *both*
  // Q1 and Q2 even at that enlarged size, with margin to spare. Q2 is
  // deliberately much more elongated (a/b ~= 2.2, versus a near-circular
  // ~1.35 in an earlier version) and offset enough that a substantial
  // portion of it sticks out past Q1's own boundary -- since S2 and Q2
  // really are unrelated to S1 and Q1, the shapes should look unrelated
  // too, not like two near-identical circles that happen to be offset.
  const VENN_Q2 = { cx: 0.1, cy: 0, a: 1.36, b: 0.62 };
  const VENN_S2 = { cx: 0.1, cy: 0, a: 0.34, b: 0.27 };

  // Bounding-box center of the whole composite (Q1 union Q2), computed by
  // hand from the extents above, so the diagram as a whole lands centered
  // on the board rather than drifting toward whichever shape is bigger.
  const VENN_OFFSET = { x: 0.1, y: 0 };

  function insideShape(px, py, shape) {
    if (shape.a != null) {
      const dx = (px - shape.cx) / shape.a;
      const dy = (py - shape.cy) / shape.b;
      return dx * dx + dy * dy <= 1 + 1e-9;
    }
    const dx = px - shape.cx;
    const dy = py - shape.cy;
    return dx * dx + dy * dy <= shape.r * shape.r + 1e-9;
  }

  function shapeBoundaryPoints(shape, n) {
    const a = shape.a != null ? shape.a : shape.r;
    const b = shape.b != null ? shape.b : shape.r;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const th = (i / n) * Math.PI * 2;
      pts.push([shape.cx + a * Math.cos(th), shape.cy + b * Math.sin(th)]);
    }
    return pts;
  }

  // Convexity of circles/ellipses means checking the boundary is enough:
  // interior points are convex combinations of boundary points, so if
  // every boundary point of `inner` is inside `outer` (also convex),
  // every interior point is too.
  function shapeSubsetOf(inner, outer, n) {
    return shapeBoundaryPoints(inner, n || 128).every(([x, y]) => insideShape(x, y, outer));
  }

  (function verifyVennGeometry() {
    // No "enlarged candidate" check here -- the candidate's highlight no
    // longer changes its radius at all (see drawCandidateStatement: a
    // highlight thickens the stroke, it doesn't grow the shape), since
    // size carries real meaning in this piece and a kernel visibly
    // growing to show emphasis would misstate that the kernel itself
    // got bigger. Its radius is simply VENN_CAND.r, always, so checking
    // it once (below) is checking it at every moment.
    const checks = [
      [VENN_S1, VENN_Q1, "\u03BA(S1) \u2286 \u03BA(Q1)"],
      [VENN_S1, VENN_CAND, "\u03BA(S1) \u2286 candidate"],
      [VENN_CAND, VENN_Q1, "candidate \u2286 \u03BA(Q1)"],
      [VENN_S2, VENN_Q2, "\u03BA(S2) \u2286 \u03BA(Q2)"],
      [VENN_S2, VENN_CAND, "\u03BA(S2) \u2286 candidate"],
      [VENN_CAND, VENN_Q2, "candidate \u2286 \u03BA(Q2)"],
    ];
    for (const [inner, outer, label] of checks) {
      if (!shapeSubsetOf(inner, outer)) throw new Error("Venn geometry check failed: " + label);
    }
  })();

  // Points scattered inside the unit circle, used once (ch.0) to echo
  // piece one's "a kernel is a set of models" convention (its Figure
  // 2(b)-(d)) before simplifying to plain discs for the rest of the piece,
  // once there are many discs on screen at once.
  const KERNEL_MODEL_POINTS = [
    [-0.3, -0.4],
    [0.35, -0.25],
    [0.1, 0.1],
    [-0.45, 0.3],
    [0.3, 0.45],
    [-0.05, -0.55],
  ];

  // ---- Build the shared-list tile grid, once ---------------------------
  // A genuine 3x3 grid, uniformly spaced -- 9 entries total, counting
  // the real candidate itself -- not a bigger tile that fills the whole
  // screen. This *is* "a short list": nine is a small, countable,
  // concretely-sized set of options, deliberately not "enormously
  // many." The *middle* row is the diagram's own row (CENTER_FY, whose
  // middle column is *not* drawn here at all -- the real candidate,
  // drawn elsewhere at its own true size, sits there instead, reading as
  // just the center entry of the whole grid, not a distinct thing next
  // to it). One row sits directly above that, one directly below, both
  // at the same offset `TILE_ROW_GAP` from CENTER_FY, so all three rows
  // are evenly spaced. This only became possible once the sentence
  // annotations (Alice's, Bob's, S2's, Q2's, and the candidate's own)
  // are retired -- see candidateStatementEnd's use in drawVennProof's
  // recallFade/scen2SentenceFade and drawCandidateStatement's appear --
  // freeing the space directly above the diagram that an earlier
  // version couldn't use without a disc there visibly running straight
  // through that still-on-screen text. `TILE_ROW_GAP` is chosen to clear
  // the diagram's own outer edge (Q1's circle, the taller of the two
  // shapes) above and below, and the board's own top edge above, and the
  // cost chart below -- with margin on every side, not just enough to
  // avoid literally touching. Note the terminology: "the code" *is* a
  // set of sets (four, in the SI's worked example) -- this tile is a
  // subset of it, each disc one of its member sets, not "the code"
  // itself as a single thing repeating. The exclusion checks below are
  // kept as a safety net in case any of these bounds ever change.
  const TILE_COLS = 3;
  // The middle column is *not* CENTER_FX -- the real candidate that sits
  // there (see drawScalePopulation) is positioned by vennToBoard(), which
  // offsets everything by -VENN_OFFSET.x*unit to keep the *whole*
  // Q1+Q2 composite centered (Q2's oval, not Q1's circle, is the wider
  // shape, so centering the pair means shifting Q1 -- and the candidate,
  // concentric with it -- left of true board-center). Using CENTER_FX
  // here instead put the tile's middle slot 0.0125 of a board-width to
  // the *right* of where the candidate that actually sits there is drawn
  // -- small, but enough to read as "the candidate looks a bit
  // off-center" once there are other, correctly-centered discs right
  // next to it to compare against. `UNIT_DIVISOR` converts unit-space
  // (unit = board.bw / UNIT_DIVISOR) into the same board-fraction terms
  // TILE_COL_FX is otherwise expressed in.
  const TILE_COL_FX = [0.2, CENTER_FX - VENN_OFFSET.x / UNIT_DIVISOR, 0.8];
  const TILE_ROW_GAP = 0.17;
  const TILE_ROW_FY = [CENTER_FY - TILE_ROW_GAP, CENTER_FY, CENTER_FY + TILE_ROW_GAP];
  const TILE_ALIGNED_ROW = 1; // index into TILE_ROW_FY that equals CENTER_FY
  const TILE_ALIGNED_COL = 1; // index into TILE_COL_FX that equals CENTER_FX

  function buildTileGrid() {
    const positions = [];
    for (let r = 0; r < TILE_ROW_FY.length; r++) {
      for (let c = 0; c < TILE_COLS; c++) {
        if (r === TILE_ALIGNED_ROW && c === TILE_ALIGNED_COL) continue; // the real candidate sits here instead
        const fx = TILE_COL_FX[c];
        const fy = TILE_ROW_FY[r];
        if (fy > CHART_FY0 - 0.06 && fy < CHART_FY1 + 0.02) continue;
        if (fx > 0.32 && fx < 0.68 && fy > 0.14 && fy < 0.38) continue;
        positions.push({ fx, fy });
      }
    }
    return positions;
  }

  // =======================================================================
  // ---- Guess the Door: setup (game state, geometry, verification) -------
  // =======================================================================
  // The SI's own pre-agreed 4x6 codebook -- identical to
  // content/demo-game-show-code/'s own GROUPS, and to the matrix in the
  // SI appendix ("An example of a deterministic, optimal algorithm for a
  // small problem with targeted queries"). Row g, column i is 1 if door i
  // belongs to group g.
  const GROUPS = [
    [0, 0, 0, 1, 1, 1],
    [0, 1, 1, 0, 1, 0],
    [1, 0, 1, 1, 0, 0],
    [1, 1, 0, 0, 0, 1],
  ];
  const NUM_DOORS = 6;
  const MAX_SELECTABLE = NUM_DOORS;

  // Given a car door and a zonk door, find a group that includes the car
  // door and excludes the zonk door. Returns -1 if none is found (should
  // never happen for car !== zonk, per the SI's own proof).
  function findGroup(car, zonk) {
    for (let g = 0; g < GROUPS.length; g++) {
      if (GROUPS[g][car] === 1 && GROUPS[g][zonk] === 0) return g;
    }
    return -1;
  }

  // ---- The tetrahedron layout -----------------------------------------
  // Checking GROUPS directly (done once, in Node, before any of this was
  // drawn -- see verifyGameGeometry() below for the load-time version of
  // the same check): each door belongs to exactly 2 of the 4 groups, and
  // the six {group, group} pairs those doors induce are exactly the six
  // 2-element subsets of {0,1,2,3} -- door i's two group-memberships are
  // exactly the two tetrahedron vertices its edge connects, for all 6
  // doors, no exceptions. So "group g" is precisely the 3 edges (doors)
  // meeting at vertex g -- a vertex star -- and the whole codebook is a
  // planar drawing of K4 away from being drawn: an outer triangle of 3
  // vertices plus 1 vertex at the center, 6 edges (the 3 triangle sides
  // plus 3 spokes), with each door placed at *its own edge's* midpoint.
  //
  // Concretely, for this GROUPS: vertex 3 (the "center" group) is the
  // spoke doors {0, 1, 5}; vertices 0/1/2 (the "outer" groups) are each
  // 2 adjacent side-doors plus that vertex's own spoke door: group 0 =
  // {3,4,5}, group 1 = {1,2,4}, group 2 = {0,2,3}. GAME_SIDE_DOORS/
  // GAME_SPOKE_DOORS below encode exactly this split; verifyGameGeometry()
  // confirms it against GROUPS directly rather than trusting this comment.
  //
  // One real wrinkle, worked out by direct computation before committing
  // to this layout (not assumed from "K4 is planar" alone -- that fact is
  // about the 4 *vertex-to-vertex* edges never crossing, not about
  // straight lines drawn between *edge-midpoints*, which is a different
  // graph and doesn't automatically inherit it): placing every door at
  // its edge's exact midpoint puts all 6 doors on a common circle, and
  // the center group's own triangle (connecting 3 doors spread evenly
  // around that circle) crosses each outer group's triangle twice. The
  // fix is GAME_R_SPOKE < GAME_R_SIDE: pulling the 3 spoke-doors in
  // toward the center (any radius under GAME_R_SIDE/2, the outer
  // triangle's own inradius, works -- verified directly below) makes the
  // center group a small triangle strictly inside the outer triangle,
  // which removes the crossing entirely. verifyGameGeometry() checks this
  // at the actual chosen radius, every load, rather than trusting the
  // margin chosen here.
  const GAME_R_SIDE = 0.5;
  const GAME_R_SPOKE = 0.16; // comfortably under 0.25 = GAME_R_SIDE/2
  const GAME_SIDE_DOORS = { 2: 90, 3: 330, 4: 210 }; // door -> angle (deg)
  const GAME_SPOKE_DOORS = { 0: 30, 1: 150, 5: 270 };

  // Door positions in local "game space" units (converted to board pixels
  // by gameToBoard(), the same pattern as vennToBoard() above).
  const DOOR_LOCAL = (function () {
    const pos = new Array(NUM_DOORS);
    function place(map, r) {
      for (const key of Object.keys(map)) {
        const d = Number(key);
        const rad = (map[key] * Math.PI) / 180;
        pos[d] = { x: r * Math.cos(rad), y: r * Math.sin(rad) };
      }
    }
    place(GAME_SIDE_DOORS, GAME_R_SIDE);
    place(GAME_SPOKE_DOORS, GAME_R_SPOKE);
    return pos;
  })();

  // A player's own selection can be any 1-6 points, not just the 4 real
  // groups, and every pair of selected points gets connected the same
  // way (see drawKernelFan below) -- so unlike the 4 real groups (always
  // crossing-free, checked below), a selection of 5 or 6 points is *not*
  // claimed to be crossing-free: its complete graph contains K5, which is
  // non-planar (Kuratowski), so no placement avoids at least one crossing
  // there. Selections of 4 points are a mixed bag at this exact layout --
  // some cross, some don't, depending on which 4 -- and that's fine, not
  // a bug: opening 5+ of 6 doors is already a poor blind-guess strategy
  // (it makes finding the zonk almost certain), so an occasional crossing
  // reads as "you're tangling yourself up," exactly as intended.
  (function verifyGameGeometry() {
    // Structural check: GROUPS really is the tetrahedron's 4 vertex-stars
    // -- each door in exactly 2 groups, and the six {group,group} pairs
    // those memberships produce are exactly the six 2-subsets of
    // {0,1,2,3}, each covered once.
    const doorGroups = [];
    for (let d = 0; d < NUM_DOORS; d++) {
      const gs = [];
      for (let g = 0; g < GROUPS.length; g++) if (GROUPS[g][d] === 1) gs.push(g);
      doorGroups.push(gs);
    }
    const seenPairs = new Set();
    for (const gs of doorGroups) {
      if (gs.length !== 2) throw new Error("Game geometry check failed: door belongs to " + gs.length + " groups, not 2");
      const key = gs[0] < gs[1] ? gs[0] + "," + gs[1] : gs[1] + "," + gs[0];
      if (seenPairs.has(key)) throw new Error("Game geometry check failed: duplicate vertex pair " + key);
      seenPairs.add(key);
    }
    if (seenPairs.size !== 6) throw new Error("Game geometry check failed: not all 6 vertex pairs covered");

    // Each group's own doors must be exactly the doors incident to that
    // group's vertex -- confirms GAME_SIDE_DOORS/GAME_SPOKE_DOORS's own
    // vertex assignment (which group is "center") actually matches
    // GROUPS, not just a plausible-looking guess at the correspondence.
    const groupDoors = GROUPS.map((row) => row.map((b, i) => (b ? i : -1)).filter((i) => i >= 0));
    for (let g = 0; g < GROUPS.length; g++) {
      const incident = [];
      for (let d = 0; d < NUM_DOORS; d++) if (doorGroups[d].includes(g)) incident.push(d);
      if (JSON.stringify(groupDoors[g]) !== JSON.stringify(incident)) {
        throw new Error("Game geometry check failed: group " + g + " doors don't match its vertex star");
      }
    }

    // Geometric check: no two of the 4 real groups' own 3-edge fans cross
    // each other, at the actual DOOR_LOCAL positions drawn. A straight
    // edge's crossing test is exact -- unlike verifyVennGeometry()'s
    // point-sampling (needed there for curved shape boundaries), no
    // sampling is needed here, just the standard segment-orientation test.
    function orient(o, a, b) {
      return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    }
    function segmentsCross(p1, p2, p3, p4) {
      const d1 = orient(p3, p4, p1), d2 = orient(p3, p4, p2);
      const d3 = orient(p1, p2, p3), d4 = orient(p1, p2, p4);
      return (d1 > 0) !== (d2 > 0) && d1 !== 0 && d2 !== 0 && (d3 > 0) !== (d4 > 0) && d3 !== 0 && d4 !== 0;
    }
    function fanEdges(doors) {
      const edges = [];
      for (let i = 0; i < doors.length; i++) for (let j = i + 1; j < doors.length; j++) edges.push([doors[i], doors[j]]);
      return edges;
    }
    function sharesEndpoint(e1, e2) {
      return e1[0] === e2[0] || e1[0] === e2[1] || e1[1] === e2[0] || e1[1] === e2[1];
    }
    for (let g1 = 0; g1 < GROUPS.length; g1++) {
      for (let g2 = g1 + 1; g2 < GROUPS.length; g2++) {
        for (const e1 of fanEdges(groupDoors[g1])) {
          for (const e2 of fanEdges(groupDoors[g2])) {
            if (sharesEndpoint(e1, e2)) continue; // sharing a door is fine, not a crossing
            if (segmentsCross(DOOR_LOCAL[e1[0]], DOOR_LOCAL[e1[1]], DOOR_LOCAL[e2[0]], DOOR_LOCAL[e2[1]])) {
              throw new Error(`Game geometry check failed: group ${g1}'s fan crosses group ${g2}'s fan`);
            }
          }
        }
      }
    }
  })();

  // ---- Game state (never rendered directly -- only through the board's
  // own selected/opened point styling and the reveal labels) -----------
  let carDoor = 0;
  let zonkDoor = 1;
  let hintedGroup = -1;
  const selectedDoors = new Set();
  const openedDoors = new Set();
  let roundResolved = false;
  let lastRoundWin = null; // null until a round resolves; then true/false -- drives the win/loss banner
  let cheatsheetRevealed = false;
  let gamePhase = "blind"; // 'blind' | 'cheatsheet' | 'hinted'
  let winTally = 0;
  let lossTally = 0;

  function randomInt(n) {
    return Math.floor(Math.random() * n);
  }

  function randomizeSecret() {
    carDoor = randomInt(NUM_DOORS);
    do {
      zonkDoor = randomInt(NUM_DOORS);
    } while (zonkDoor === carDoor);
    // Alice broadcasts continuously, from the moment the secret is set --
    // not just once a hint is "asked for." The signal doesn't help at all
    // until the cheat sheet is also in hand to decode it, exactly the
    // point chapter 3's own legend card makes.
    hintedGroup = findGroup(carDoor, zonkDoor);
  }
  randomizeSecret();

  function toggleDoor(i) {
    if (roundResolved) return;
    if (selectedDoors.has(i)) selectedDoors.delete(i);
    else if (selectedDoors.size < MAX_SELECTABLE) selectedDoors.add(i);
    // The first real move after the cheat sheet is revealed -- not a
    // second click of the reveal button -- is what actually moves the
    // legend from "here's the list" (ch.5) to "play with the code" (ch.6):
    // an action, not a passive continuation.
    if (gamePhase === "cheatsheet") gamePhase = "hinted";
    refreshGameUI();
  }

  // Win iff the correct action was found *and* the catastrophic one
  // wasn't. Everything else -- missing the correct action regardless of
  // the catastrophic one, or finding the catastrophic one regardless of
  // the correct one -- is simply a loss. Rule change from the standalone
  // demo (content/demo-game-show-code/), which kept a third "draw"
  // outcome for "found neither." Binary sharpens the actual contrast this
  // mechanism is about: blind guessing loses, the codebook always wins --
  // not a three-way split that softens it.
  function recordOutcome(foundCar, foundZonk) {
    lastRoundWin = foundCar && !foundZonk;
    if (lastRoundWin) winTally++;
    else lossTally++;
  }

  function openSelected() {
    if (selectedDoors.size === 0 || roundResolved) return;
    roundResolved = true;
    for (const i of selectedDoors) openedDoors.add(i);
    recordOutcome(selectedDoors.has(carDoor), selectedDoors.has(zonkDoor));
    refreshGameUI();
  }

  function resetRound() {
    selectedDoors.clear();
    openedDoors.clear();
    roundResolved = false;
    lastRoundWin = null;
    refreshGameUI();
  }

  function revealCheatsheet() {
    cheatsheetRevealed = true;
    gamePhase = "cheatsheet";
    resetRound();
  }

  function startNewRound() {
    randomizeSecret();
    // Once the cheat sheet has been revealed, every subsequent round
    // plays with the code -- there's no reason to send a player who's
    // already seen the short list back to guessing blind. Mirrors the
    // standalone demo's own startNewRound() (`codebookSection.hidden =
    // !cheatsheetRevealed`).
    if (!cheatsheetRevealed) gamePhase = "blind";
    resetRound();
  }

  // Scrolling backward out of the interactive zone (see CHG.playArrive
  // and isGameInteractive() above) puts the game session behind you the
  // same way scrolling back out of any earlier chapter puts *it* behind
  // you -- so scrolling forward again should arrive at a fresh "Play,
  // blind" start, not resume wherever the game session had gotten to.
  // Without this, the cheat sheet (once revealed) stayed revealed no
  // matter how far back you scrolled -- reported directly. A pure state
  // reset, deliberately with *no* call to refreshGameUI()/render() of
  // its own: called from inside render() itself (see wasInteractive
  // below), so the reset state is simply what that same, already-in-
  // progress render() call draws -- calling render() again from in here
  // would re-enter it while it's still running.
  function resetGameToInitialState() {
    cheatsheetRevealed = false;
    gamePhase = "blind";
    winTally = 0;
    lossTally = 0;
    selectedDoors.clear();
    openedDoors.clear();
    roundResolved = false;
    lastRoundWin = null;
    randomizeSecret();
  }

  // ---- Canvas / DOM setup --------------------------------------------------
  const track = document.getElementById("scrollTrack");
  const pinned = track.querySelector(".pinned");
  const canvas = document.getElementById("scene");
  // `let`, not `const`: drawScene() below temporarily points this at an
  // offscreen canvas for exactly as long as it takes to render phase 1's
  // own content, so it can be faded out as a single composited image
  // (see the LEGACY_END note above and drawScene() below) without
  // touching any of phase 1's own drawing functions -- every one of
  // which closes over this one `ctx` binding and calls its methods
  // directly, with no color/alpha parameter threaded through for "how
  // faded is the whole scene," and no such parameter should need adding
  // to already-verified code just to support a fade that phase 1 itself
  // never needed.
  let ctx = canvas.getContext("2d");
  // The offscreen buffer phase 1's own content is redirected to during
  // its fade-out. Sized to match `canvas` exactly (see resize() below).
  const legacyCanvas = document.createElement("canvas");
  const legacyCtx = legacyCanvas.getContext("2d");
  const legendHeadingEl = document.getElementById("legendHeading");
  const legendBodyEl = document.getElementById("legendBody");
  const gameControlsEl = document.getElementById("gameControls");
  const gameOpenBtn = document.getElementById("gameOpenBtn");
  const gameRevealBtn = document.getElementById("gameRevealBtn");
  const gameNewRoundBtn = document.getElementById("gameNewRoundBtn");

  const tileGrid = buildTileGrid();

  let board = { bx: 0, by: 0, bw: 0, bh: 0 };
  let unit = 0;
  let gameUnit = 0;
  let dpr = window.devicePixelRatio || 1;
  let lastT = 0;
  let legendChunkKey = null;
  // Tracks whether the *previous* render() call found the game
  // interactive, so render() can detect the one moment that matters:
  // scrolling backward out of that zone (see resetGameToInitialState()
  // below). Starts false, matching isGameInteractive(0).
  let wasInteractive = false;

  // tGame: local t for phase 2, running 0->1 over outer t's own
  // [LEGACY_END, 1] share. Clamped at both ends, same convention as
  // every other local-t derivation in this file (e.g. computeT() itself).
  function tGameOf(tOuter) {
    return clamp((tOuter - LEGACY_END) / (1 - LEGACY_END), 0, 1);
  }

  // True once the board has arrived at "Play, blind" (CHG.playArrive) and
  // stopped following t -- the single predicate both the click handler
  // and the render/legend logic below use, so "is the game interactive
  // right now" is decided in exactly one place.
  function isGameInteractive(tOuter) {
    return tOuter >= LEGACY_END && tGameOf(tOuter) >= CHG.playArrive;
  }

  function updateLegend(tOuter) {
    let heading, body, key;
    if (tOuter < LEGACY_END) {
      const tOld = tOuter / LEGACY_END;
      let idx = 0;
      for (let i = 0; i < LEGEND_CHUNKS.length; i++) if (tOld >= LEGEND_CHUNKS[i].from) idx = i;
      heading = LEGEND_CHUNKS[idx].heading;
      body = LEGEND_CHUNKS[idx].body;
      key = "legacy" + idx;
    } else {
      const tGame = tGameOf(tOuter);
      if (tGame < CHG.playArrive) {
        let idx = 0;
        for (let i = 0; i < GAME_LEGEND_CHUNKS.length; i++) if (tGame >= GAME_LEGEND_CHUNKS[i].from) idx = i;
        heading = GAME_LEGEND_CHUNKS[idx].heading;
        body = GAME_LEGEND_CHUNKS[idx].body;
        key = "game" + idx;
      } else {
        // Legend text is keyed to gamePhase itself here, not to tGame --
        // see the CHG.playArrive note above for why the board and the
        // legend both switch from following t to following real game
        // state at this exact point.
        const g = GAME_PHASE_TEXT[gamePhase];
        heading = g.heading;
        body = g.body;
        key = "phase-" + gamePhase;
      }
    }
    if (key === legendChunkKey) return;
    legendChunkKey = key;
    legendHeadingEl.textContent = heading;
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

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const cw = track.clientWidth || window.innerWidth;
    const ch = window.innerHeight;
    // `.pinned`'s CSS height (100vh, in style.css) and `ch` here
    // (window.innerHeight) are supposed to be the same number, but on
    // mobile Safari/Chrome they can genuinely diverge *during a scroll*:
    // `100vh` is pinned to the browser's largest possible viewport
    // (address bar hidden), while `window.innerHeight` tracks whatever
    // the *current* viewport actually is (address bar still showing, or
    // mid-animation into/out of view) -- and the address bar's own
    // show/hide is triggered by scrolling, exactly when this matters
    // most. When they disagree, the canvas's own CSS box (100% of
    // `.pinned`) ends up a different size than the drawing buffer just
    // computed for `ch` below, and the browser stretches the rendered
    // pixels to fit -- reported directly as "everything becomes
    // elongated" while scrolling. Setting `.pinned`'s height explicitly,
    // in pixels, from the same `ch` used for the drawing buffer keeps
    // the two locked together regardless of what `100vh` is doing.
    pinned.style.height = `${ch}px`;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    legacyCanvas.width = canvas.width;
    legacyCanvas.height = canvas.height;
    board = computeBoard(cw, ch);
    unit = board.bw / UNIT_DIVISOR;
    gameUnit = board.bw / GAME_UNIT_DIVISOR;
    render(lastT);
  }

  function vennToBoard(lx, ly) {
    const cx = board.bx + CENTER_FX * board.bw;
    const cy = board.by + CENTER_FY * board.bh;
    return { x: cx + (lx - VENN_OFFSET.x) * unit, y: cy + (ly - VENN_OFFSET.y) * unit };
  }

  // ---- Guess the Door: board <-> pixel mapping, same pattern as
  // vennToBoard() above. Its own anchor (GAME_CENTER_FX/FY) and its own
  // scale (GAME_UNIT_DIVISOR) are independent of phase 1's -- the two
  // scenes never share the screen at full opacity (see the LEGACY_END
  // fade in drawScene()), so there's no need for their coordinate
  // systems to agree, only for each to be internally consistent.
  function gameToBoard(lx, ly) {
    const cx = board.bx + GAME_CENTER_FX * board.bw;
    const cy = board.by + GAME_CENTER_FY * board.bh;
    return { x: cx + lx * gameUnit, y: cy + ly * gameUnit };
  }

  function doorBoardPos(i) {
    return gameToBoard(DOOR_LOCAL[i].x, DOOR_LOCAL[i].y);
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

  // ---- Drawing helpers, reused from piece one -------------------------------
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

  // A line that grows from `from` toward `to` as `progress` goes 0->1,
  // with a glowing leading tip while still in motion -- adapted from
  // piece one (which only ever used one color); here, a link's color
  // matches the kernel it points to, same as everything else.
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

  // Base font size for on-canvas text (the sizeMult=1 reference size),
  // floored in absolute CSS-pixel-equivalent terms. `unit` scales with
  // board *width*, and on a narrow, portrait mobile viewport the board's
  // width is the full (narrow) viewport width -- so unit, and every font
  // size derived from it, gets small there even though the piece reads
  // fine on wider/landscape viewports where the board's width is instead
  // capped by its own aspect ratio. Reported directly (logic sentences
  // were unreadably small on a phone, next to the legend card's own
  // fixed, device-independent 0.92rem). Smaller-sizeMult elements (chart
  // axis ticks, etc.) still scale down proportionally from this floored
  // reference, preserving relative size hierarchy, just at an overall
  // larger, legible scale; on wide viewports where unit*0.16 already
  // exceeds the floor, this changes nothing.
  const LABEL_BASE_MIN_PX = 16;
  function baseFontSize() {
    return Math.max(unit * 0.16, LABEL_BASE_MIN_PX);
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

  // ---- A small math-typeset helper -----------------------------------------
  // Not a TeX engine -- just enough manual layout (variable subscripts in
  // a smaller size, shifted baseline; italics for variables, upright for
  // function names) to make expressions like H_bin(p_q) read as properly
  // typeset rather than a flat string with underscores. `segments` is an
  // array of { t: text, i: italic (default true), s: subscript (default
  // false) }. `y` is the expression's own baseline.
  function measureMathExpr(segments, baseSize) {
    let w = 0;
    for (const seg of segments) {
      const size = baseSize * (seg.s ? 0.66 : 1);
      ctx.font = `${seg.i === false ? "" : "italic "}${size}px ${FONT_FAMILY}`;
      w += ctx.measureText(seg.t).width;
    }
    return w;
  }

  function drawMathExpr(segments, x, yBaseline, alpha, align, opts) {
    if (alpha <= 0) return 0;
    opts = opts || {};
    const baseSize = baseFontSize() * (opts.sizeMult || 1);
    ctx.save();
    ctx.textBaseline = "alphabetic";
    ctx.shadowColor = rgbCss(opts.glowColor || SEED_GLOW, alpha * 0.7);
    ctx.shadowBlur = baseSize * 0.5;
    ctx.fillStyle = rgbCss(opts.color || LABEL_COLOR, alpha);

    const totalW = measureMathExpr(segments, baseSize);
    let cx = x;
    if (align === "center") cx = x - totalW / 2;
    else if (align === "right") cx = x - totalW;

    for (const seg of segments) {
      const size = baseSize * (seg.s ? 0.66 : 1);
      ctx.font = `${seg.i === false ? "" : "italic "}${size}px ${FONT_FAMILY}`;
      const dy = seg.s ? baseSize * 0.32 : 0;
      ctx.fillText(seg.t, cx, yBaseline + dy);
      cx += ctx.measureText(seg.t).width;
    }
    ctx.restore();
    return totalW;
  }

  const MATH_HBIN_PQ = [{ t: "H", i: true }, { t: "bin", i: false, s: true }, { t: "(", i: false }, { t: "p", i: true }, { t: "q", i: true, s: true }, { t: ")", i: false }];
  const MATH_HBIN_PS = [{ t: "H", i: true }, { t: "bin", i: false, s: true }, { t: "(", i: false }, { t: "p", i: true }, { t: "s", i: true, s: true }, { t: ")", i: false }];
  const MATH_PQ = [{ t: "p", i: true }, { t: "q", i: true, s: true }];
  const MATH_PS = [{ t: "p", i: true }, { t: "s", i: true, s: true }];

  function captionAlpha(t, inStart, inEnd, outStart, outEnd) {
    const fadeIn = smoothstep(inStart, inEnd, t);
    if (outStart == null) return fadeIn;
    return fadeIn * (1 - smoothstep(outStart, outEnd, t));
  }

  // ---- Chart <-> diagram highlight sync -------------------------------------
  // Defined once, used by both drawCostChart() (the curves) and
  // drawVennProof()/drawCandidateStatement() (the discs each curve names)
  // -- so a curve's highlight window and its disc's highlight are the
  // exact same window, not two hand-tuned approximations of each other.
  function qBoostAt(t) {
    return captionAlpha(t, CH.relabelEnd + 0.06, CH.relabelEnd + 0.08, CH.qCurveEnd - 0.03, CH.qCurveEnd);
  }
  function sBoostAt(t) {
    return captionAlpha(t, CH.qCurveEnd + 0.04, CH.qCurveEnd + 0.06, CH.sLineEnd - 0.03, CH.sLineEnd);
  }
  function candBoostAt(t) {
    // Starts only once the candidate disc has essentially finished
    // blooming in (see linkP/candDiscAlpha in drawCandidateStatement), so
    // the pulse highlights a disc that's actually visible.
    return captionAlpha(t, CH.scenario2End + 0.09, CH.scenario2End + 0.11, CH.candidateEnd - 0.01, CH.candidateEnd);
  }
  // Scoped tightly to "This is what More means" itself (lessEnd through
  // candidateEnd): highlights both *query* kernels, Q1 and Q2, so the
  // chapter's own claim -- the candidate is smaller than the query --
  // has three actual, highlighted shapes to compare on screen (the
  // candidate's own highlight, via candBoostAt above, already spans this
  // whole window on its own). Applied to Q1 via Math.max with qBoostAt,
  // since Q1 already has its own, earlier highlight window and the two
  // should combine rather than compete.
  function moreBoostAt(t) {
    return captionAlpha(t, CH.lessEnd, CH.lessEnd + 0.02, CH.candidateEnd - 0.02, CH.candidateEnd);
  }
  // Ramps in near the end of "This is what More means" (the last legend
  // chunk) and stays at full strength for the rest of the piece (through
  // the resting frame): the naive curves recede, the optimal curve is
  // emphasized, making the gap between "cheap, one shared list" and
  // "expensive, either naive strategy" the chart's own closing visual
  // argument -- with no more legend text changes left to narrate it, and
  // the tile itself long since done growing (see above), this is the
  // piece's last new thing to show.
  function manyScenariosBoostAt(t) {
    // Anchored to scaleEnd's own end, not candidateEnd + a fixed offset:
    // that offset was tuned for a since-changed gap between the two and
    // silently produced a degenerate (or negative-width) window the last
    // time that gap was retuned. A width relative to scaleEnd itself
    // survives future retiming of candidateEnd without repeating that.
    return smoothstep(CH.scaleEnd - 0.03, CH.scaleEnd - 0.01, t);
  }

  // A kernel drawn as an outlined disc: stroke + very faint fill, matching
  // piece one's own kernel-as-a-set circle. Used for any kernel that has
  // something nested *inside* it, or that's meant to read as transparent.
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

  // Same as drawOutlineDisc, but for an ellipse (scenario 2's shape family
  // throughout this piece).
  function drawOutlineEllipse(cx, cy, rx, ry, color, alpha, opts) {
    if (alpha <= 0 || rx <= 0 || ry <= 0) return;
    opts = opts || {};
    ctx.save();
    ctx.fillStyle = rgbCss(opts.fillColor || SCENARIO2_COLOR, alpha * (opts.fillAlphaMult != null ? opts.fillAlphaMult : 0.06));
    ctx.strokeStyle = rgbCss(color, alpha * (opts.strokeAlphaMult != null ? opts.strokeAlphaMult : 0.7));
    ctx.lineWidth = Math.max(1, unit * (opts.lineWidthMult || 0.022));
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // ---- Chapters 0-1: Alice's and Bob's sentences, each linked to its own
  // kernel by a growing line -- same technique as piece one's intro, now
  // used to establish two *different* (but nested) kernels instead of one.
  //
  // Getting this legible on mobile took three attempts, each one running
  // into a wall the previous one didn't account for:
  //   1. Just raising the font floor -- the widest sentence ("It's
  //      raining and cold and cloudy.", 34 characters), on one line, at
  //      any font size close to the legend card's own, is simply wider
  //      than half a narrow phone screen; text ran into its neighbor.
  //   2. Widening the gap between the two columns to make room -- fixed
  //      the overlap, but unbalanced the whole composition (reported
  //      directly: the candidate disc below, whose own position never
  //      moved, started looking off-center relative to the now-lopsided
  //      text above it).
  //   3. Shrinking the font back down until it fit the *original*,
  //      narrower gap on one line -- technically correct, but the
  //      resulting size barely improved on the original at all (reported
  //      directly, again).
  // The actual fix combines two things neither previous attempt used:
  // sentences wrap onto two lines within a fixed-*width* column (so the
  // same font that's too wide for half a phone screen on one line fits
  // across two, without needing a wider gap), and the second sentence
  // row (S2/Q2) is positioned *dynamically*, right after however tall
  // the first row (Alice/Bob) actually turns out to be -- 1 line where
  // that fits, 2 where it doesn't -- rather than at a fixed fraction
  // that assumed a fixed, single-line height. `SENTENCE_MIN_PX` (14) is
  // still its own, smaller floor than baseFontSize()'s general one
  // (16): even with wrapping, two full rows of up to two lines each
  // still have to fit in the fixed space above the diagram before it
  // starts, and 16px doesn't leave enough margin there to be safe: solved
  // for directly (worst case: both rows wrap, on the narrowest supported
  // board), not picked by eye.
  const SENTENCE_MIN_PX = 13;
  // Also *capped*, not just floored: on medium-wide boards, unit*0.16
  // alone already lands close to 14px, at which size the recalled
  // Alice/Bob row's own link -- a straight line toward the diagram,
  // unavoidably passing near where the S2/Q2 row sits directly below --
  // sweeps close enough to that row's own (correspondingly wider) text
  // to visually run through it. A real regression, caught only by
  // screenshotting a desktop-width viewport (900x900) specifically, not
  // by any of the mobile-width checks that motivated the rest of this
  // fix. Capping keeps this link's geometry (and the margins solved for
  // below, in s2Pos()) consistent across every board width, rather than
  // needing to be re-solved for whatever size unit*0.16 happens to be.
  const SENTENCE_MAX_PX = 13;
  const SENTENCE_LINE_HEIGHT_MULT = 1.15; // tighter than drawLabel's normal
  // 1.35 -- every bit of vertical space matters once a row might be two
  // lines tall, and this is still comfortably readable at this font size.
  function statementFontSize() {
    return Math.min(Math.max(unit * 0.16, SENTENCE_MIN_PX), SENTENCE_MAX_PX);
  }

  function statementSizeFor(text) {
    const size = statementFontSize();
    ctx.save();
    ctx.font = `${size}px ${FONT_FAMILY}`;
    const w = ctx.measureText(text).width;
    ctx.restore();
    return { size, w };
  }

  const SENTENCE_COL_FRAC = 0.44;
  const SENTENCE_COL_GAP_FRAC = 0.04;
  function sentenceColWidth() {
    return board.bw * SENTENCE_COL_FRAC;
  }

  // How tall the first sentence row (Alice/Bob) actually renders, right
  // now, given the current board width -- 1 line where Alice's own
  // sentence (the longer of the two roles that share this row's height)
  // fits the column, 2 where it wraps.
  function row1BlockHeight() {
    const { w } = statementSizeFor(ALICE_STATEMENT);
    const lines = w > sentenceColWidth() ? 2 : 1;
    return lines * statementFontSize() * SENTENCE_LINE_HEIGHT_MULT;
  }

  function alicePos() {
    return { x: board.bx + board.bw * 0.06, y: board.by + board.bh * 0.01 };
  }

  function bobPos() {
    return { x: board.bx + board.bw * (0.06 + SENTENCE_COL_FRAC + SENTENCE_COL_GAP_FRAC), y: board.by + board.bh * 0.02 };
  }

  // A second row, directly below Alice's/Bob's own -- same column, same
  // role (S under S, Q under Q) -- since scenario 2's sentences need to
  // coexist on screen with a *recalled* Alice/Bob, not replace them.
  // Positioned dynamically, right after row 1's own actual height (see
  // row1BlockHeight()), plus a gap that's *itself* only as tight as
  // actually necessary: small when row 1 had to wrap (mobile, where
  // vertical space above the diagram is genuinely tight), generous
  // otherwise. A single small gap applied unconditionally pulled the two
  // rows close enough on wider boards -- where row 1 never wraps and
  // there was no space pressure to justify it -- that Alice's and S2's
  // links started crossing each other, a real regression caught only by
  // screenshotting a desktop-width viewport, not by the mobile checks
  // that motivated this in the first place.
  function s2Pos() {
    const wraps = statementSizeFor(ALICE_STATEMENT).w > sentenceColWidth();
    const gap = wraps ? unit * 0.08 : unit * 1.0;
    return { x: board.bx + board.bw * 0.06, y: alicePos().y + row1BlockHeight() + gap };
  }

  function q2Pos() {
    return { x: board.bx + board.bw * (0.06 + SENTENCE_COL_FRAC + SENTENCE_COL_GAP_FRAC), y: s2Pos().y };
  }

  function candidatePos() {
    return { x: board.bx + board.bw * 0.5, y: board.by + board.bh * 0.46 };
  }

  // `maxWidth` is the column's own allocated width, in pixels -- always
  // passed, but only actually triggers wrapping in drawLabel() when a
  // sentence's own single-line width exceeds it (checked here first, so
  // short sentences like "It's cold." never wrap and keep their own,
  // narrower true width for the link-origin calculation below; using the
  // full column width for those would leave the link appearing to start
  // from empty space well to the right of the actual, short text).
  function drawStatement(text, pos, appear, sentenceFadeAlpha, maxWidth) {
    if (appear <= 0 || sentenceFadeAlpha <= 0) return null;
    const { size, w } = statementSizeFor(text);
    const alpha = appear * sentenceFadeAlpha * 0.92;
    const wraps = maxWidth != null && w > maxWidth;
    const blockHeight = drawLabel(text, pos.x, pos.y, alpha, undefined, {
      absoluteSize: size,
      lineHeightMult: SENTENCE_LINE_HEIGHT_MULT,
      maxWidth: wraps ? maxWidth : undefined,
    });
    const originX = wraps ? pos.x + maxWidth / 2 : pos.x + w / 2;
    return { x: originX, y: pos.y + (blockHeight || size) }; // middle, below -- the link's origin
  }

  // ---- The central Venn proof -----------------------------------------------
  function drawVennProof(t) {
    const q1 = vennToBoard(VENN_Q1.cx, VENN_Q1.cy);
    const rQ1 = VENN_Q1.r * unit;
    const rS1 = VENN_S1.r * unit;
    const s1 = q1; // concentric: S1 really is a subset of Q1

    // Ch.0: Alice's sentence, linked to S1.
    const aliceAppear = smoothstep(0, CH.aliceEnd - 0.02, t);
    const sentenceFade = 1 - smoothstep(CH.relabelEnd - 0.04, CH.relabelEnd, t);
    const aliceLinkFrom = drawStatement(ALICE_STATEMENT, alicePos(), aliceAppear, sentenceFade, sentenceColWidth());

    const pointsFade = 1 - smoothstep(0.02, 0.05, t);
    const linkP = smoothstep(0.015, CH.aliceEnd, t);
    // Target S1's own *border* (final radius, not scaled by its
    // still-growing appear), not its center -- same "line ends at the
    // edge, doesn't tunnel into the middle" convention as every other
    // link in the piece.
    const s1Target = { x: s1.x, y: s1.y - rS1 };
    if (aliceLinkFrom && linkP > 0) {
      drawGrowingLink(aliceLinkFrom, s1Target, linkP, sentenceFade * (0.3 + 0.7 * aliceAppear));
    }

    const s1Appear = smoothstep(CH.aliceEnd * 0.4, CH.aliceEnd, t);
    if (s1Appear > 0) {
      const sRadiusIntro = rS1 * s1Appear;
      if (pointsFade > 0.02) {
        for (const [px, py] of KERNEL_MODEL_POINTS) {
          drawGlow(s1.x + px * sRadiusIntro, s1.y + py * sRadiusIntro, unit * 0.04, SEED_GLOW, s1Appear * pointsFade * 0.85);
        }
      }
      // Highlighted in sync with the chart's H_bin(p_s) line (same
      // sBoostAt window). Starting at "can we do better?" (ch.5) and
      // for the rest of the piece, S1 shifts from a solid glow to
      // filled-but-transparent -- a visible boundary with a see-through
      // fill, rather than an opaque disc -- since we're no longer
      // treating S as the one fixed answer, only as one example kernel
      // among the alternates about to be considered.
      const sBoost = sBoostAt(t);
      const sTransparent = smoothstep(CH.sLineEnd, CH.sLineEnd + 0.02, t);
      const sizeMult = 1 + 0.05 * sBoost;
      const coreAlpha = s1Appear * lerp(1, 0.32, sTransparent) * (1 + 0.15 * sBoost);
      drawGlow(s1.x, s1.y, rS1 * s1Appear * sizeMult, SEED_GLOW, coreAlpha, 1.15);
      if (sTransparent > 0.02) {
        drawOutlineDisc(s1.x, s1.y, rS1 * s1Appear * sizeMult, SEED_GLOW, s1Appear * sTransparent, {
          strokeAlphaMult: 0.75,
          fillAlphaMult: 0,
        });
      }
    }

    // Ch.1: Bob's weaker sentence, linked to Q1 (which grows around S1).
    const bobAppear = smoothstep(CH.aliceEnd, CH.bobEnd - 0.02, t);
    const bobLinkFrom = drawStatement(BOB_STATEMENT, bobPos(), bobAppear, sentenceFade, sentenceColWidth());
    const q1Appear = smoothstep(CH.aliceEnd + 0.01, CH.bobEnd, t);
    if (q1Appear > 0) {
      // Highlighted in sync with the chart's H_bin(p_q) curve (same
      // qBoostAt window) -- when the curve is emphasized, so is the
      // circle it's about. Highlighted a second time, later, during
      // "This is what More means" (moreBoostAt) -- Q1 is one of the two
      // query kernels that chapter compares the candidate against.
      const qHighlight = Math.max(qBoostAt(t), moreBoostAt(t));
      drawOutlineDisc(q1.x, q1.y, rQ1 * q1Appear, CHART_Q_COLOR, q1Appear, {
        strokeAlphaMult: 0.55 + 0.35 * qHighlight,
        fillAlphaMult: 0.045 + 0.08 * qHighlight,
        lineWidthMult: 0.022 * (1 + 1.3 * qHighlight),
      });
    }
    const bobLinkP = smoothstep(CH.aliceEnd, CH.bobEnd - 0.01, t);
    if (bobLinkFrom && bobLinkP > 0) {
      // Target is Q1's *final* edge (full rQ1, not scaled by q1Appear) --
      // fixed for the whole growth, so the line's direction never shifts
      // as the circle grows. Circle and line grow independently and meet
      // at the end, rather than the line chasing a moving target.
      const bobTarget = { x: q1.x, y: q1.y - rQ1 };
      drawGrowingLink(bobLinkFrom, bobTarget, bobLinkP, sentenceFade * (0.3 + 0.7 * bobAppear), CHART_Q_COLOR);
    }

    // By now, Alice's and Bob's original sentences have been off screen
    // (and out of mind) for a while -- comparing scenario 2 against them,
    // and later checking that the candidate fits *both*, needs both
    // pairs visible together. So recall Alice's/Bob's sentences here:
    // quickly (no slow "growing" animation -- that attention belongs to
    // what's actually new), and let them persist through the candidate's
    // own reveal -- but no further. By candidateStatementEnd (the start
    // of "a short list of candidate kernels"), the point these sentences
    // exist to make -- one kernel fits both -- has already landed; the
    // piece moves on to generalizing past any one sentence, and all the
    // sentence annotations clear together to make room for the tile.
    const recallFade = captionAlpha(t, CH.doBetterEnd, CH.doBetterEnd + 0.02, CH.candidateStatementEnd, CH.candidateStatementEnd + 0.02);
    const aliceRecallFrom = drawStatement(ALICE_STATEMENT, alicePos(), 1, recallFade, sentenceColWidth());
    if (aliceRecallFrom) drawGrowingLink(aliceRecallFrom, s1Target, 1, recallFade, SEED_GLOW);
    const bobRecallFrom = drawStatement(BOB_STATEMENT, bobPos(), 1, recallFade, sentenceColWidth());
    if (bobRecallFrom) {
      const bobRecallTarget = { x: q1.x, y: q1.y - rQ1 };
      drawGrowingLink(bobRecallFrom, bobRecallTarget, 1, recallFade, CHART_Q_COLOR);
    }

    // Scenario 2 (oval, magenta): a second, *independent* (S, Q) pair --
    // with its own concrete sentences, linked by growing lines exactly
    // the same way scenario 1's were. An abstract oval fading in under a
    // caption reading "a second scenario" has nothing for the viewer to
    // actually check; two real sentences, entailing each other the same
    // way Alice's and Bob's did, make the claim concrete. A second row,
    // directly below the recalled Alice/Bob row, since both need to be
    // on screen at once now. Persists through the candidate's own
    // reveal, same schedule (and same candidateStatementEnd cutoff) as
    // the recalled row above -- absorbing "one set solves both" means
    // seeing all four sentences (plus the candidate's own) at once, not
    // three of them having already faded. Arrives *before* the
    // candidate -- establishing "many scenarios" is what motivates and
    // explains the candidate, not the other way around.
    const q2 = vennToBoard(VENN_Q2.cx, VENN_Q2.cy);
    const s2 = q2; // concentric: S2 really is a subset of Q2
    const scen2SentenceFade = 1 - smoothstep(CH.candidateStatementEnd, CH.candidateStatementEnd + 0.02, t);

    const s2SentenceAppear = smoothstep(CH.doBetterEnd, CH.doBetterEnd + 0.04, t);
    const s2LinkFrom = drawStatement(S2_STATEMENT, s2Pos(), s2SentenceAppear, scen2SentenceFade, sentenceColWidth());
    const s2LinkP = smoothstep(CH.doBetterEnd + 0.005, CH.doBetterEnd + 0.055, t);
    if (s2LinkFrom && s2LinkP > 0) {
      // S2's own border -- but its *west* point (final horizontal
      // semi-axis), not its top. S2's sentence sits below and to the
      // left of Alice's (recalled) one, while S2 itself sits to the
      // *right* of S1; targeting the top would cross Alice's own line
      // (which reaches further right at a higher point first). The west
      // point keeps this link's whole path left of Alice's, no crossing.
      const s2Target = { x: s2.x - VENN_S2.a * unit, y: s2.y };
      drawGrowingLink(s2LinkFrom, s2Target, s2LinkP, scen2SentenceFade * (0.3 + 0.7 * s2SentenceAppear), SCENARIO2_COLOR);
    }
    const s2Appear = smoothstep(CH.doBetterEnd + 0.025, CH.doBetterEnd + 0.06, t);
    if (s2Appear > 0) {
      // Filled and translucent, like S1's own post-transition look --
      // not the thin, mostly-empty fill Q2 gets (which needs to look
      // "empty" so S2 and the candidate can be seen nested inside it).
      drawOutlineEllipse(s2.x, s2.y, VENN_S2.a * unit * s2Appear, VENN_S2.b * unit * s2Appear, SCENARIO2_COLOR, s2Appear, {
        strokeAlphaMult: 0.75,
        fillAlphaMult: 0.4,
      });
    }

    const q2SentenceAppear = smoothstep(CH.doBetterEnd + 0.06, CH.doBetterEnd + 0.1, t);
    const q2LinkFrom = drawStatement(Q2_STATEMENT, q2Pos(), q2SentenceAppear, scen2SentenceFade, sentenceColWidth());
    const q2Appear = smoothstep(CH.doBetterEnd + 0.07, CH.scenario2End, t);
    if (q2Appear > 0) {
      // Highlighted during "This is what More means" (moreBoostAt), same
      // as Q1 above -- Q2 is the *other* query kernel the candidate is
      // being compared against, and both need to stand out together for
      // the comparison to read as "both queries," not just one.
      const moreBoost = moreBoostAt(t);
      drawOutlineEllipse(q2.x, q2.y, VENN_Q2.a * unit * q2Appear, VENN_Q2.b * unit * q2Appear, SCENARIO2_COLOR, q2Appear, {
        strokeAlphaMult: 0.45 + 0.35 * moreBoost,
        fillAlphaMult: 0.045 + 0.08 * moreBoost,
        lineWidthMult: 0.022 * (1 + 1.3 * moreBoost),
      });
    }
    const q2LinkP = smoothstep(CH.doBetterEnd + 0.06, CH.scenario2End - 0.01, t);
    if (q2LinkFrom && q2LinkP > 0) {
      // Fixed final edge (full semi-axis, not scaled by q2Appear) -- same
      // fix as Bob's own link, so the line's direction never shifts as
      // the oval grows.
      const q2Target = { x: q2.x, y: q2.y - VENN_Q2.b * unit };
      drawGrowingLink(q2LinkFrom, q2Target, q2LinkP, scen2SentenceFade * (0.3 + 0.7 * q2SentenceAppear), SCENARIO2_COLOR);
    }

    // The candidate's position/radius, concentric with scenario 1. Drawn
    // in drawCandidateStatement() below, in step with its own growing
    // link, so the disc blooms as the link arrives rather than appearing
    // on an independent timer before the line even reaches it.
    const cand = vennToBoard(VENN_CAND.cx, VENN_CAND.cy);
    const candRadius = VENN_CAND.r * unit;

    return { q1, s1, rQ1, rS1, q2, rQ2y: VENN_Q2.b * unit, cand, candRadius };
  }

  // ---- Chapters 3-6: the real cost of the two naive strategies, plus the
  // optimal candidate -- a small chart mirroring the paper's own Figure
  // 4(a), introduced one curve at a time, in step with the narrative.
  function chartRect() {
    return {
      x: board.bx + board.bw * CHART_FX0,
      y: board.by + board.bh * CHART_FY0,
      w: board.bw * (CHART_FX1 - CHART_FX0),
      h: board.bh * (CHART_FY1 - CHART_FY0),
    };
  }

  function drawCostChart(t) {
    // Fades in once, never back out: the "many scenarios" chapter needs
    // this chart on screen to make its own point (the shared candidate
    // is far cheaper than either naive strategy, not just "somewhere in
    // the middle"), and the resting frame's numeric payoff needs it too.
    const appear = smoothstep(CH.relabelEnd + 0.02, CH.relabelEnd + 0.06, t);
    if (appear <= 0) return;

    const rect = chartRect();
    const xMax = 1;
    const yMax = 1.05;

    function toPx(p, y) {
      const xf = (p - PS_EXAMPLE) / (xMax - PS_EXAMPLE);
      return { x: rect.x + xf * rect.w, y: rect.y + rect.h - (y / yMax) * rect.h };
    }

    ctx.save();
    ctx.globalAlpha = appear;
    ctx.strokeStyle = rgbCss(NEUTRAL, 0.45);
    ctx.lineWidth = Math.max(1, unit * 0.012);
    ctx.beginPath();
    ctx.moveTo(rect.x, rect.y);
    ctx.lineTo(rect.x, rect.y + rect.h);
    ctx.lineTo(rect.x + rect.w, rect.y + rect.h);
    ctx.stroke();
    ctx.restore();

    // "cost," not just "bits" -- without it, nothing on the axis itself
    // says which direction is better; "lower is cheaper" has to be
    // inferred from context rather than read directly off the chart.
    // sizeMult values below were increased (from 0.68-0.82 to 0.85-1.0)
    // alongside baseFontSize()'s own new floor -- reported directly as
    // still too small even once the floor made everything else legible;
    // the axis labels are exactly what tells a reader "lower is better,"
    // so they need to actually be read, not just technically present.
    // anchor: "bottom" -- so the label's own *bottom* edge sits a fixed
    // gap above the axis line, regardless of the label's own height at
    // whatever size it renders at. The previous version anchored from
    // its *top* instead, which put enough of the (now taller) text below
    // that starting point to run directly into the axis line itself.
    drawLabel("cost (bits)", rect.x - unit * 0.06, rect.y - unit * 0.1, appear * 0.8, "left", { sizeMult: 0.85, anchor: "bottom" });
    drawLabel("1", rect.x - unit * 0.18, toPx(PS_EXAMPLE, 1).y, appear * 0.7, "right", { sizeMult: 0.85 });
    drawLabel("0", rect.x - unit * 0.18, toPx(PS_EXAMPLE, 0).y - unit * 0.1, appear * 0.7, "right", { sizeMult: 0.85 });
    drawMathExpr(MATH_PS, toPx(PS_EXAMPLE, 0).x, rect.y + rect.h + unit * 0.22, appear * 0.75, "center", { sizeMult: 0.9 });
    drawLabel("1", toPx(1, 0).x, rect.y + rect.h + unit * 0.02, appear * 0.75, "center", { sizeMult: 0.85 });
    drawMathExpr(MATH_PQ, rect.x + rect.w * 0.5, rect.y + rect.h + unit * 0.34, appear * 0.85, "center", { sizeMult: 1.0 });

    // "send Q outright": H_bin(p_q), a real curve over p_q in [p_s, 1].
    // The curve fades in quickly near the start of its own chapter, so
    // there's time left to highlight it before the chapter ends.
    const qAppear = smoothstep(CH.relabelEnd + 0.02, CH.relabelEnd + 0.05, t);
    if (qAppear > 0) {
      const qBoost = qBoostAt(t);
      const manyBoost = manyScenariosBoostAt(t);
      const qAlpha = appear * qAppear * (0.45 + 0.55 * qBoost) * (1 - 0.55 * manyBoost);
      ctx.save();
      ctx.strokeStyle = rgbCss(CHART_Q_COLOR, qAlpha);
      ctx.lineWidth = Math.max(1, unit * 0.022 * (1 + 1.5 * qBoost));
      ctx.beginPath();
      const N = 60;
      for (let i = 0; i <= N; i++) {
        const p = PS_EXAMPLE + (i / N) * (1 - PS_EXAMPLE);
        const pt = toPx(p, hbin(p));
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.restore();
      drawMathExpr(MATH_HBIN_PQ, rect.x + rect.w * 0.5, rect.y - unit * 0.14, qBoost * appear, "center", {
        sizeMult: 0.85,
        glowColor: CHART_Q_COLOR,
      });
    }

    // "send S outright": H_bin(p_s), a fixed constant -- flat. Same
    // quick-fade-in-then-highlight-then-settle pattern as the Q curve.
    const sAppear = smoothstep(CH.qCurveEnd + 0.01, CH.qCurveEnd + 0.03, t);
    if (sAppear > 0) {
      const sBoost = sBoostAt(t);
      const manyBoost = manyScenariosBoostAt(t);
      const sAlpha = appear * sAppear * (0.45 + 0.55 * sBoost) * (1 - 0.55 * manyBoost);
      const sY = toPx(PS_EXAMPLE, hbin(PS_EXAMPLE)).y;
      ctx.save();
      ctx.strokeStyle = rgbCss(SEED_GLOW, sAlpha);
      ctx.lineWidth = Math.max(1, unit * 0.022 * (1 + 1.5 * sBoost));
      ctx.beginPath();
      ctx.moveTo(rect.x, sY);
      ctx.lineTo(rect.x + rect.w, sY);
      ctx.stroke();
      ctx.restore();
      // On the right, just above the flat line itself -- not centered
      // above the chart, which put it on top of the amber curve's peak.
      drawMathExpr(MATH_HBIN_PS, rect.x + rect.w * 0.97, sY - unit * 0.16, sBoost * appear, "right", {
        sizeMult: 0.85,
        glowColor: SEED_GLOW,
      });
    }

    // The optimal strategy: Lambda(p_s, 1-p_q), always at or below both
    // naive curves. Once the "many scenarios" tile appears, this curve is
    // the one that *doesn't* dim -- the visual point of that chapter is
    // exactly this gap: the shared candidate stays cheap while the two
    // naive strategies (now faded) stay expensive, for every scenario.
    const optAppear = smoothstep(CH.scenario2End + 0.03, CH.candidateEnd - 0.02, t);
    if (optAppear > 0) {
      const candBoost = candBoostAt(t);
      const manyBoost = manyScenariosBoostAt(t);
      ctx.save();
      ctx.strokeStyle = rgbCss(CANDIDATE_COLOR, appear * optAppear * (0.95 + 0.05 * manyBoost));
      ctx.lineWidth = Math.max(1, unit * 0.03 * (1 + 0.8 * candBoost + 0.7 * manyBoost));
      ctx.beginPath();
      const N = 60;
      for (let i = 0; i <= N; i++) {
        const p = PS_EXAMPLE + (i / N) * (1 - PS_EXAMPLE);
        const pt = toPx(p, lambda(PS_EXAMPLE, 1 - p));
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  // ---- Chapter 5: "can we do better?" ---------------------------------------
  // No in-canvas caption of its own -- the legend card alone poses the
  // question now; S1's own transition from a solid glow to a
  // filled-but-translucent disc (see sTransparent below) is this
  // chapter's only visual change.

  // ---- Chapter 7: the concrete shared sentence, linked to the candidate --
  // Arrives only *after* scenario 2 is already on screen, so the viewer
  // sees the candidate satisfy both scenarios at once, rather than being
  // told in prose that it generalizes after the fact. The candidate
  // *disc* is a permanent fixture of the diagram from here on; only the
  // sentence, its link, and its short label are temporary and fade back
  // out, same as Alice's and Bob's sentences did earlier.
  function drawCandidateStatement(t, venn) {
    const linkP = smoothstep(CH.scenario2End + 0.03, CH.scenario2End + 0.1, t);
    const candDiscAlpha = smoothstep(0.3, 1, linkP);
    if (candDiscAlpha > 0) {
      // Highlighted (in sync with the chart's optimal curve, via
      // candBoostAt) by thickening its stroke and brightening its fill --
      // never by growing its radius. Size carries real meaning in this
      // piece (a kernel's radius *is* its size); enlarging the candidate
      // to show a highlight would visually claim the kernel itself is
      // getting bigger, exactly backwards from what a highlight should
      // say. Its radius is always venn.candRadius, full stop -- the same
      // size whether highlighted or not.
      const candBoost = candBoostAt(t);
      drawOutlineDisc(venn.cand.x, venn.cand.y, venn.candRadius, CANDIDATE_COLOR, candDiscAlpha, {
        strokeAlphaMult: 0.95,
        fillAlphaMult: 0.12 + 0.1 * candBoost,
        lineWidthMult: 0.022 * (1 + 1.3 * candBoost),
      });
    }

    // Fades out on the same unified schedule as the recalled Alice/Bob
    // row and scenario 2's own row (see drawVennProof) -- all five
    // sentences need to be readable together while this one is up, and
    // all five clear together at candidateStatementEnd, once "one kernel
    // fits both" has landed and the piece is about to generalize past
    // any single sentence, making room for the tile grid instead.
    const appear = captionAlpha(t, CH.scenario2End + 0.01, CH.scenario2End + 0.06, CH.candidateStatementEnd, CH.candidateStatementEnd + 0.02);
    if (appear <= 0) return;
    const pos = candidatePos();
    const { size, w } = statementSizeFor(CANDIDATE_STATEMENT);
    drawLabel(CANDIDATE_STATEMENT, pos.x - w / 2, pos.y, appear * 0.92, undefined, { absoluteSize: size });

    // Label, then link -- same order as piece one's own intro, so the
    // link's glowing tip is never hidden behind the text.
    const linkFrom = { x: pos.x, y: pos.y + size };
    const target = { x: venn.cand.x, y: venn.cand.y + venn.candRadius };
    drawGrowingLink(linkFrom, target, linkP, appear, CANDIDATE_COLOR);

    // The fuller "more informative than Q, less than S" point is made in
    // the legend card, in plain language -- no in-canvas math-notation
    // label here; the sentence and its link to the candidate's disc are
    // the only thing this diagram itself says.
  }

  // ---- Chapter 6: narrative captions for scenario 2 -------------------------
  // Two sequential captions, both *before* the candidate appears: first
  // scenario 2 on its own merits, then the causal explanation (a short,
  // pre-agreed list can serve many scenarios at once) -- so that when the
  // candidate is revealed next, the viewer already understands why it's
  // going to be cheap, rather than being told "it's in the middle, so
  // it's cheaper" (which isn't actually why -- by that logic, one of the
  // two extremes might just as well have been cheaper).
  // No abstract top-of-screen caption here at all: S2's/Q2's own
  // sentences (drawn in drawVennProof, in step with their own ovals) and
  // the candidate's own sentence (drawCandidateStatement) already say
  // everything that needs saying, concretely. An earlier version added a
  // caption on top of that -- "one set can satisfy both scenarios at
  // once" -- which turned out to be unnecessary: the five sentences and
  // the diagram itself already make the point without it.

  // ---- Chapter 8-10: the shared list, shown in full as soon as it's
  // actually introduced ------------------------------------------------
  function drawScalePopulation(t, venn) {
    // All eight tile discs fade in together, as soon as the legend names
    // "a short list of candidate kernels" (ch.8) -- so the list is shown
    // *whole* the instant it's introduced, not grown further later. An
    // earlier version showed only the two discs flanking the real
    // candidate at this point, then pulled back afterward to reveal many
    // more discs filling the whole screen -- but that reads as the list
    // itself growing without bound, exactly backwards from "short list."
    // What actually grows without bound, later, is the number of
    // *situations* the list has to serve -- a fact about situations, not
    // about the list -- and that point is made without adding a single
    // additional disc (see the "Many more scenarios" legend chunk and
    // manyScenariosBoostAt's chart emphasis, below).
    const a = smoothstep(CH.candidateStatementEnd, CH.candidateStatementEnd + 0.05, t);
    if (a <= 0) return;

    // A regular tile of same-sized, candidate-blue discs: the *code* is
    // itself a set of sets (four, in the SI's worked example); this tile
    // is a subset of it, each disc one of its member sets -- not "the
    // code" as a single thing repeating. Same radius, and the same
    // stroke/fill alphas, as the real candidate disc (venn.candRadius) --
    // by now it's back to its resting (non-enlarged, non-highlighted)
    // size, so it genuinely reads as just the middle entry of its row,
    // not a distinct, differently-styled thing next to look-alikes.
    // No in-canvas caption describing the tile -- "a subset of the
    // code -- itself a set of such sets" and "and it costs far less
    // than either naive strategy, every time" both used to live here.
    // The legend card is now the only place any of this piece's prose
    // lives; the diagram and the tile speak through shape and color
    // alone (plus the logic sentences themselves, which are the one
    // deliberate exception -- see the top-of-file note).
    for (const slot of tileGrid) {
      const x = board.bx + slot.fx * board.bw;
      const y = board.by + slot.fy * board.bh;
      drawOutlineDisc(x, y, venn.candRadius, CANDIDATE_COLOR, a, { strokeAlphaMult: 0.95, fillAlphaMult: 0.12 });
    }
  }

  // ---- Chapter 9: resting frame ---------------------------------------------
  // No caption of its own: "less to send, yet more to prove" used to live
  // here. The resting frame is now just the diagram, the tile, and the
  // chart, held -- the payoff is the shapes themselves (the candidate's
  // own highlight from candBoostAt, the optimal curve's own emphasis from
  // manyScenariosBoostAt), stated in the legend card, not restated again
  // on the canvas.

  // =======================================================================
  // ---- Guess the Door: rendering -----------------------------------------
  // =======================================================================
  // A plain stroked ring, with no fill and no glow halo -- used only for
  // the "selected, not yet opened" outline below. Deliberately not
  // drawOutlineDisc() (used throughout phase 1): that helper's line width
  // is a fraction of phase 1's own `unit`, not `gameUnit`, and the two
  // scale independently (see GAME_UNIT_DIVISOR's own note above) -- this
  // keeps the ring's thickness tied to the same scale as everything else
  // it's drawn alongside.
  function drawRing(cx, cy, radius, color, alpha, lineWidth) {
    if (alpha <= 0 || radius <= 0) return;
    ctx.save();
    ctx.strokeStyle = rgbCss(color, alpha);
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // A door's own marker: a filled *square* (soft glow halo still round --
  // a glow is ambient light, not a shape claim), never a circle/disc. A
  // disc is this piece's own fixed symbol for "a kernel," established
  // from chapter 0 on; a door is a single element, not a kernel, and
  // drawing it as its own disc would blur exactly the distinction the
  // top-of-file note is built around. Used for every door point on both
  // the main board and the cheat sheet's own mini-boards.
  function drawSquareMarker(cx, cy, halfSize, color, alpha, haloMult) {
    if (alpha <= 0 || halfSize <= 0) return;
    const haloRadius = halfSize * (haloMult || 3.2);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, haloRadius);
    grad.addColorStop(0, rgbCss(color, alpha * 0.55));
    grad.addColorStop(1, rgbCss(color, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, haloRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = rgbCss(color, alpha);
    ctx.fillRect(cx - halfSize, cy - halfSize, halfSize * 2, halfSize * 2);
  }

  // The "selected, not yet opened" outline -- a square ring around a
  // square marker, matching shapes (an earlier version used a circular
  // ring here, which looked like a mismatched halo around a square peg).
  function drawSquareRing(cx, cy, halfSize, color, alpha, lineWidth) {
    if (alpha <= 0 || halfSize <= 0) return;
    ctx.save();
    ctx.strokeStyle = rgbCss(color, alpha);
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(cx - halfSize, cy - halfSize, halfSize * 2, halfSize * 2);
    ctx.restore();
  }

  // The complete graph on a set of board points -- every pair joined by
  // drawGrowingLink at progress=1 (a plain, already-finished line; see
  // its own definition above). This is how *every* kernel reads in this
  // section, real group or live selection alike: not an enclosing shape
  // (doors are points, not kernels themselves -- see the top-of-file
  // note), but the relationship among its member points, made visible
  // the same way a growing line already means "these are related"
  // everywhere else in this piece.
  function drawKernelFan(points, color, alpha) {
    if (alpha <= 0 || points.length < 2) return;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) drawGrowingLink(points[i], points[j], 1, alpha, color);
    }
  }

  const DOOR_DOT_RADIUS_MULT = 0.075;

  function drawGameBoard(alpha) {
    if (alpha <= 0) return;
    const dotRadius = Math.max(gameUnit * DOOR_DOT_RADIUS_MULT, 5);

    // The player's own live selection, drawn as a kernel fan in the same
    // candidate-blue the cheat sheet's real groups use below -- both are
    // literally the same role (a candidate subset of the 6-action
    // universe), just one pre-agreed and one chosen on the spot.
    const selPoints = [...selectedDoors].map(doorBoardPos);
    drawKernelFan(selPoints, CANDIDATE_COLOR, alpha * 0.9);

    for (let i = 0; i < NUM_DOORS; i++) {
      const p = doorBoardPos(i);
      const opened = openedDoors.has(i);
      const selected = selectedDoors.has(i);
      const isCar = opened && i === carDoor;
      const isZonk = opened && i === zonkDoor;

      let color = NEUTRAL;
      let glowAlpha = alpha;
      if (isCar) color = CORRECT_COLOR;
      else if (isZonk) color = CATASTROPHIC_COLOR;
      else if (selected) color = CANDIDATE_COLOR;
      else if (opened) glowAlpha = alpha * 0.4; // opened, empty -- dims, doesn't vanish

      drawSquareMarker(p.x, p.y, dotRadius, color, glowAlpha, 2.6);
      if (selected && !opened) {
        drawSquareRing(p.x, p.y, dotRadius * 2.1, CANDIDATE_COLOR, alpha * 0.85, Math.max(1.5, dotRadius * 0.3));
      }
      // Car/zonk reveal on open: color alone (green/red), no "correct"/
      // "catastrophic" text label -- the prominent win/loss banner
      // above the board (drawResultBanner, below) already says which
      // happened; a per-door label repeated that.
    }
  }

  // A prominent, plain-language result banner above the board -- "You
  // win!!" or "You lose!", in the same green/red as the car/zonk squares
  // themselves. Shown the moment a round resolves, replacing any per-
  // door text label (see drawGameBoard above): one clear verdict reads
  // better than two small captions the player has to go find on the
  // board.
  function drawResultBanner(alpha) {
    if (alpha <= 0 || !roundResolved || lastRoundWin === null) return;
    const sp = aliceSignalPos();
    const color = lastRoundWin ? CORRECT_COLOR : CATASTROPHIC_COLOR;
    drawLabel(lastRoundWin ? "You win!!" : "You lose!", sp.x, sp.y - gameUnit * 0.16, alpha, "center", {
      sizeMult: 1.3,
      anchor: "bottom",
      color,
      glowColor: color,
    });
  }

  // Alice's 2-bit signal: two small marks, filled = 1, hollow = 0 -- the
  // same filled/outline distinction phase 1 already uses for disc states
  // (drawGlow vs. drawOutlineDisc's empty fill) rather than a new visual
  // vocabulary. Reused identically for the main board's own signal and
  // for each cheat-sheet row's copy (see drawCheatSheet below).
  function drawSignalIndicator(cx, cy, groupIndex, dotRadius, gap, alpha, color) {
    if (alpha <= 0 || groupIndex < 0) return;
    const bits = groupIndex.toString(2).padStart(2, "0");
    for (let k = 0; k < 2; k++) {
      const x = cx + (k - 0.5) * gap;
      if (bits[k] === "1") drawGlow(x, cy, dotRadius, color, alpha, 2.4);
      else drawRing(x, cy, dotRadius, color, alpha * 0.85, Math.max(1, dotRadius * 0.3));
    }
  }

  function aliceSignalPos() {
    const c = gameToBoard(0, 0);
    return { x: c.x, y: c.y - gameUnit * (GAME_R_SIDE + 0.36) };
  }

  function tallyPos() {
    const c = gameToBoard(0, 0);
    return { x: c.x, y: c.y + gameUnit * (GAME_R_SIDE + 0.3) };
  }

  // A persistent win/loss tally -- plain drawLabel text, no separate DOM
  // scorecard (consistent with "the legend card is the only place any of
  // this piece's prose lives," extended here to game state as well: the
  // canvas speaks through shape, color, and the numbers themselves).
  function drawTally(alpha) {
    if (alpha <= 0) return;
    const p = tallyPos();
    drawLabel(`Wins ${winTally}  \u00B7  Losses ${lossTally}`, p.x, p.y, alpha, "center", { sizeMult: 0.85 });
  }

  // ---- The cheat sheet: 4 small copies of the same 6-point layout, each
  // with its own group's vertex star connected and its own 2-bit signal
  // shown alongside. A 2x2 grid (not 4-in-a-row): comfortably clears a
  // narrow mobile board width at any reasonable mini-board size, where 4
  // side-by-side copies would not.
  const CHEATSHEET_COL_FX = [0.28, 0.72];
  const CHEATSHEET_ROW_FY = [0.53, 0.66];
  const CHEATSHEET_MINI_UNIT_MULT = 0.28;
  // How far above its own mini-board's top point (local y = -0.25, the
  // two side doors) the mini signal indicator sits. Was 0.32 (measured
  // from the board's own *center*, not its edge) -- large enough that
  // the second row's own signal read as ambiguously close to the *first*
  // row's board instead of its own, reported directly. Measured from the
  // board's top edge instead, and shrunk, so the indicator reads as
  // sitting right above its own diagram specifically.
  const CHEATSHEET_SIGNAL_GAP_MULT = 0.22;

  function cheatsheetSlot(g) {
    const col = g % 2;
    const row = Math.floor(g / 2);
    return { x: board.bx + CHEATSHEET_COL_FX[col] * board.bw, y: board.by + CHEATSHEET_ROW_FY[row] * board.bh };
  }

  function drawCheatSheet(alpha) {
    if (alpha <= 0) return;
    const miniUnit = gameUnit * CHEATSHEET_MINI_UNIT_MULT;
    const dotRadius = Math.max(miniUnit * DOOR_DOT_RADIUS_MULT * 1.6, 2.5);
    for (let g = 0; g < GROUPS.length; g++) {
      const slot = cheatsheetSlot(g);
      const doors = GROUPS[g].map((b, i) => (b ? i : -1)).filter((i) => i >= 0);
      const miniPos = (i) => ({ x: slot.x + DOOR_LOCAL[i].x * miniUnit, y: slot.y + DOOR_LOCAL[i].y * miniUnit });
      for (let i = 0; i < NUM_DOORS; i++) {
        const p = miniPos(i);
        const inGroup = doors.includes(i);
        drawSquareMarker(p.x, p.y, dotRadius, inGroup ? CANDIDATE_COLOR : NEUTRAL, alpha * (inGroup ? 1 : 0.3), 2.2);
      }
      drawKernelFan(doors.map(miniPos), CANDIDATE_COLOR, alpha * 0.9);
      const signalY = slot.y - miniUnit * (0.25 + CHEATSHEET_SIGNAL_GAP_MULT);
      drawSignalIndicator(slot.x, signalY, g, dotRadius * 0.85, dotRadius * 3.2, alpha, NEUTRAL);
    }
  }

  function drawGameScene(tGame) {
    const boardAppear = smoothstep(CHG.transitionEnd, CHG.doorsEnd, tGame);
    const signalAppear = smoothstep(CHG.enoughEnd, CHG.signalEnd, tGame);
    const playAppear = smoothstep(CHG.signalEnd, CHG.playArrive, tGame);

    drawGameBoard(boardAppear);
    if (signalAppear > 0) {
      const sp = aliceSignalPos();
      drawSignalIndicator(sp.x, sp.y, hintedGroup, Math.max(gameUnit * 0.055, 3), gameUnit * 0.32, signalAppear, NEUTRAL);
    }
    if (playAppear > 0) {
      drawTally(playAppear);
      drawResultBanner(playAppear);
    }
    if (cheatsheetRevealed) drawCheatSheet(1);
  }

  // Called after every game-state change (a click or a button) -- game
  // state can change with the scroll position perfectly still, unlike
  // everything upstream of chapter 4, so a re-render can't wait for t to
  // change on its own the way frame()'s own loop otherwise assumes.
  function refreshGameUI() {
    render(lastT);
    updateLegend(lastT);
  }

  function syncGameControls(interactive) {
    gameControlsEl.hidden = !interactive;
    if (!interactive) return;
    gameOpenBtn.disabled = selectedDoors.size === 0 || roundResolved;
    gameRevealBtn.hidden = !(roundResolved && !cheatsheetRevealed);
    gameNewRoundBtn.hidden = !roundResolved;
  }

  function drawScene(tOuter) {
    const tOld = clamp(tOuter / LEGACY_END, 0, 1);
    const tGame = tGameOf(tOuter);

    // Phase 1's diagram/tile/chart fade out together, one shot (no fade
    // back in), right as phase 2's own transition chapter begins -- the
    // same one-shot captionAlpha idiom used throughout phase 1, just
    // applied to the *whole* old scene at once via a single composited
    // image rather than threaded through every one of its own alpha
    // parameters. See the LEGACY_END note above for why.
    const legacyAlpha = tOuter < LEGACY_END ? 1 : 1 - smoothstep(0, CHG.transitionEnd, tGame);
    if (legacyAlpha > 0) {
      const mainCtx = ctx;
      legacyCtx.clearRect(0, 0, legacyCanvas.width, legacyCanvas.height);
      ctx = legacyCtx;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const venn = drawVennProof(tOld);
      drawCostChart(tOld);
      drawCandidateStatement(tOld, venn);
      drawScalePopulation(tOld, venn);
      ctx = mainCtx;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = legacyAlpha;
      ctx.drawImage(legacyCanvas, 0, 0);
      ctx.restore();
    }

    if (tOuter >= LEGACY_END) drawGameScene(tGame);
  }

  // ---- Top-level render -------------------------------------------------------
  function render(t) {
    lastT = t;

    // Detected -- and reset -- *before* drawScene() runs, not after: this
    // way the reset state is simply what this same render() call draws,
    // with no second, re-entrant render() needed (resetGameToInitialState
    // itself never calls render()). See wasInteractive's own note above.
    const interactive = isGameInteractive(t);
    if (wasInteractive && !interactive) resetGameToInitialState();
    wasInteractive = interactive;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cw = canvas.width / dpr;
    const chh = canvas.height / dpr;

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, cw, chh);

    drawScene(t);

    ctx.restore();
    syncGameControls(interactive);
  }

  // ---- Main loop: t is the only input -- nothing here is driven by
  // wall-clock time, so the scene is perfectly static whenever scrolling
  // stops, and scrubbing up/down is always smooth. --------------------------
  let lastInnerHeight = window.innerHeight;
  function frame() {
    // A direct check, not just the 'resize' listener below: on mobile,
    // the browser's own address bar shows/hides *in response to*
    // scrolling, which is exactly when a missed or delayed 'resize'
    // event would be most visible (as the "elongation" resize() itself
    // now guards against, once it actually runs). Comparing against the
    // last known height every frame is negligible cost and catches the
    // change even if the event itself doesn't fire promptly.
    if (window.innerHeight !== lastInnerHeight) {
      lastInnerHeight = window.innerHeight;
      resize();
    }
    const t = computeT();
    if (t !== lastT) render(t);
    updateLegend(t);
    requestAnimationFrame(frame);
  }

  // ---- Guess the Door: interaction ---------------------------------------
  // A door is a point, not a DOM element (unlike the standalone demo's
  // own wooden <div> doors) -- so "clicking a door" is canvas hit-
  // testing against the same fixed positions everything else here draws
  // from, not a click listener per door.
  function onCanvasClick(e) {
    if (!isGameInteractive(lastT)) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const hitRadius = Math.max(gameUnit * DOOR_DOT_RADIUS_MULT * 2.2, 16);
    for (let i = 0; i < NUM_DOORS; i++) {
      const p = doorBoardPos(i);
      const dx = x - p.x;
      const dy = y - p.y;
      if (dx * dx + dy * dy <= hitRadius * hitRadius) {
        toggleDoor(i);
        return;
      }
    }
  }

  canvas.addEventListener("click", onCanvasClick);
  gameOpenBtn.addEventListener("click", openSelected);
  gameRevealBtn.addEventListener("click", revealCheatsheet);
  gameNewRoundBtn.addEventListener("click", startNewRound);

  window.addEventListener("resize", resize);
  resize();
  updateLegend(0);
  requestAnimationFrame(frame);
})();
