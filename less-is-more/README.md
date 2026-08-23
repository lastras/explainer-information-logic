# Less is More — a scroll-driven explainer

A scroll-scrubbed animation of the "Less is More" paradox. It's a
zero-dependency companion piece to the paper and to
`content/explainer-no-need-to-know/` — same convention as
`content/demo-game-show-code/`: no build step, no libraries, no CDN calls.

## How this relates to "No need to know"

The first piece (`content/explainer-no-need-to-know/`) dramatizes the case
where Alice does **not** know what Bob already knows: she hashes her kernel
into one of 4 bins, and Bob rules out same-bin "confounders" using his own
background knowledge R.

This piece dramatizes the paper's *other* named mechanism, for the opposite
situation: Alice **does** know exactly what she wants Bob to end up able to
prove — a query Q — and the only question is how to send that efficiently.
Following the paper's own `p_r = 1` simplification (used for exactly this
illustration in Fig. 4(a)), Bob's background R is dropped entirely here.
Everything is about the relationship κ(S) ⊆ κ(Q), and a short, pre-agreed
**codebook** — a different trick from piece one's hashing, deliberately
drawn with a different visual metaphor (nested discs, not a grid) so it
doesn't read as "the same hashing trick again."

## What it illustrates

Mirroring the main text's "The Less is More paradox" / "Solution
architecture" paragraphs, and the SI's worked NASA/Mars example:

- **A concrete sentence, linked to its kernel by a growing line** — the
  same technique piece one's intro uses, now used to establish two
  *different* (but nested) kernels instead of one. Alice's specific "It's
  raining and cold and windy." links to a small kernel, κ(S). Bob's
  weaker "It's cold." — the query Alice will allow him to prove, not
  something imposed on her — links to a larger kernel, κ(Q), drawn as a
  circle growing directly out of the very disc it contains (same center
  as S, since S really is a subset of that Q), rather than from an offset
  point elsewhere on screen. The legend's own heading changes the instant
  "It's cold." starts appearing, not after — the two are meant to read as
  one moment, not two. Each link's color matches the kernel it points to
  (Bob's link is amber, matching κ(Q)), and each link's target is its
  kernel's *final* edge — fixed for the whole growth, not scaled by the
  circle's current, still-growing radius — so the line's direction never
  visibly shifts mid-growth; the circle and the line grow independently
  and simply meet at the end. Every link targets its kernel's actual
  *border*, never its center (an earlier version had Alice's own link,
  and later S2's, running straight to the disc's center point, visibly
  tunneling through the shape rather than stopping at its edge — fine for
  piece one's tiny fixed-size dots, where center and edge are barely
  distinguishable, but not once a kernel's size is meaningful and it's
  drawn at any real size). Each sentence fades back out once its kernel
  is established, same as piece one's own temporary intro statement.
- **How should Alice send this?** Shown as a small chart, not asserted in
  prose, and introduced one curve at a time in step with the narrative:
  first *only* the cost of sending Q outright (`H_bin(p_q)`, a real curve,
  since it depends on how demanding the query is, typeset with a genuine
  subscript rather than a flat "H_bin(p_q)" string); then, once that's
  been discussed on its own, the cost of sending S outright is added
  (`H_bin(p_s)`, a fixed line, since it doesn't depend on the query at
  all, positioned on the right, above the line itself, rather than
  centered over the chart where it would sit on top of the amber curve's
  peak). The two are visibly not the same curve. Color is kept identical
  between disc and curve throughout: κ(Q)'s circle and the `H_bin(p_q)`
  curve are the same amber; κ(S)'s disc and the `H_bin(p_s)` line are the
  same cyan — a shape and a curve sharing a name but not a color would
  undercut the point of drawing both. Highlighting is synchronized too:
  when a curve is emphasized, its disc brightens in the diagram above, at
  the exact same moment (the two use one shared timing function, not two
  hand-tuned approximations of each other). A brief "can we do better?"
  beat follows before anything else changes — posed in the legend card
  alone (no in-canvas caption of its own; see below) — and starting
  here, κ(S)'s disc shifts from a solid glow to filled-but-translucent,
  since S is no longer being treated as the one fixed answer, just one
  example kernel among the alternates about to be considered.
- **A second, independent scenario is introduced with its own concrete
  sentences** — "It's raining and cold and cloudy." (S2) and the weaker
  "It's raining." (Q2), linked exactly the same "label, then link, then
  bloom" way Alice's and Bob's were. An earlier version introduced
  scenario 2 with an abstract top-of-screen caption and nothing else —
  no sentence, no concrete claim the viewer could check, and the purple
  oval it referred to didn't even reliably appear at the same time as the
  caption. Real sentences fix both problems at once: something concrete
  to look at, appearing exactly when the legend says it does (S2's/Q2's
  own reveal starts the instant the "second scenario" chapter begins, not
  ~10% of the whole scroll range later). S2 and Q2 share "raining" and
  "cold" with S1 and Q1 but drop/add a *different* third conjunct
  ("cloudy" instead of "windy"), so neither entails the other — genuinely
  independent, not just differently sized. The oval itself is drawn to
  match: much more elongated (`a/b ≈ 2.2`, versus a near-circular `≈1.35`
  in an earlier version) and offset enough that a substantial portion of
  it visibly sticks out past the circle's own boundary, rather than
  reading as two near-identical circles that merely happen to be offset.
  S2's link targets its oval's *west* point specifically, not its top:
  since S2 sits to the right of S1 while S2's sentence sits below and to
  the left of Alice's (recalled) one, targeting the top would send S2's
  line straight through Alice's, a visible crossing. Aiming west instead
  keeps S2's whole path to the left of Alice's, throughout.
- **Alice's and Bob's original sentences reappear at the same moment,
  statically** — a second row, directly below scenario 2's own, same
  column per role (S under S, Q under Q). By the time scenario 2 arrives,
  enough scroll has passed that the originals are out of view *and* out
  of mind; recalling them costs nothing (no "growing" animation — that
  attention belongs to what's actually new) but is necessary for the
  comparison to make sense at all. All four sentences, and later the
  candidate's own fifth, stay up together through the entire "one set
  solves both" reveal and only clear as a group at
  `candidateStatementEnd` — right as "One kernel fits both" ends and "A
  short, shared list" begins — trying to absorb "it fits both" while
  three of the four things it's supposed to fit have already faded
  isn't something a viewer can actually do. All five clearing together,
  in turn, is what makes the grid below possible: with no sentence text
  left anywhere on the board, the space directly above the diagram is
  free for the tile's own top row.
- **Deliberately, nothing is said yet about a shared set solving
  anything** — that idea is introduced together with its concrete example
  next, not twice (an earlier version explained the mechanism in the
  abstract right after scenario 2 appeared, then repeated much the same
  explanation with the concrete example right after — redundant, and it
  also invited a subtly wrong reading: "more informative than Q but less
  than S" doesn't *by itself* explain a lower cost. By that logic, one of
  the two extremes might just as well have been cheaper — and indeed,
  describing an arbitrary set of the candidate's own size naively would
  cost *more* than either, since naive cost peaks in the middle. It's not
  "the middle" that's cheap.).
- **Only then is the concrete shared sentence revealed, carrying the
  mechanism explanation with it** — "It's raining and cold." (piece
  one's own sentence, reused here), linked (in the candidate's own blue)
  to a candidate kernel the same way the other four sentences were. It
  entails both "cold" (Q1) and "raining" (Q2) without giving away
  "windy" (S1) or "cloudy" (S2). Because both scenarios are already on
  screen with their own real sentences, the viewer sees one set satisfy
  *both* concretely, rather than being told in prose that it generalizes
  after the fact. This whole beat is spread across four short legend
  chunks in sequence, not one long paragraph — "One kernel fits both"
  (the sentence itself and its double entailment, nothing about a list
  yet), "A short, shared list" (the actual mechanism, kept as one whole
  sentence rather than being cut at its own colon: Alice and Bob
  pre-agree on a short list of candidate kernels, and naming just one
  entry's place on it works for whichever situation turns out to be
  real, because the same list gets reused for every situation rather
  than each needing its own newly worked-out kernel), "This is what
  'Less' means" (naming the paper's own theorem, then the cost claim),
  and "This is what 'More' means" (the payoff: the kernel Bob actually
  receives — the candidate's — is *smaller* than the query he was
  intended to prove, and a smaller kernel is more informative, exactly
  as established all the way back in chapter 0 — so Bob ends up able to
  prove more than was strictly required, a direct callback rather than
  a new, unmotivated claim). An earlier version ran all of this as one
  long paragraph; a version right after that split it into pieces but
  kept the *same* total scroll budget the paragraph had used, so each
  card got only about a third of the reading time the original single
  card had — and one of those splits fell in the middle of what was
  actually a single compound sentence, so half of it appeared on one
  card and the second half on the next. Both problems are fixed here:
  the split now respects actual sentence boundaries, and the section as
  a whole was given noticeably more scroll room, borrowed from the
  chapters that follow it (see below for why that borrowing is safe).
  The exact moment the second card names "a short list of candidate
  kernels" is also the exact moment the full nine-disc tile fades in,
  all at once (see below) — the list appearing complete the instant
  it's introduced in words, rather than as a partial glimpse that only
  fills out later. The chart gains a third curve at the same time as the
  mechanism itself is explained: `Lambda(p_s, 1-p_q)`, in that same
  blue, at or below both naive strategies everywhere. The candidate's
  disc thickens its own stroke in sync with its curve's own highlight
  window, the same way κ(S)'s and κ(Q)'s highlights work — deliberately
  *not* by enlarging, even though an earlier version did exactly that.
  Size carries real meaning throughout this piece (a kernel's radius
  *is* its size); growing the candidate to show a highlight would
  visually claim the kernel itself just got bigger, exactly backwards
  from what a highlight is supposed to communicate. Its radius is fixed
  at `venn.candRadius` unconditionally now, whether highlighted or not —
  removing `CAND_ENLARGE_MAX` and the geometry check that used to verify
  the *enlarged* candidate still stayed inside both Q's, since there's
  no longer an enlarged state to check. (No dot markers on any curve: an
  earlier version placed one at Bob's specific query, but with three
  separate curves on screen, a single unlabeled dot read as unexplained
  clutter rather than useful. No abstract top-of-screen caption here
  either — an earlier version added "one set can satisfy both scenarios
  at once" on top of everything else; once the five sentences and the
  diagram itself already make the point, restating it in a caption
  turned out to add nothing.)
- Scenario 2's own S is deliberately close to S1's own size (not a
  token-sized oval) — meaning Q1 and Q2 have to overlap substantially,
  since the shared candidate must be big enough to contain two
  comparably-sized S's — and, like S1, is drawn filled and translucent
  rather than as a thin, mostly-empty outline. None of this is staged to
  merely look right (within each scenario, its own S *is* concentric with
  its own Q, since that containment fact is real, while the two scenarios
  themselves are never concentric with *each other*): `verifyVennGeometry()`
  in `script.js` samples each shape's boundary (128 points) and throws at
  load time if any of the required containment facts — including the
  candidate *while highlighted and enlarged* — doesn't actually hold for
  the hand-picked coordinates. (An earlier version enlarged the candidate
  without checking this, and it could briefly poke outside scenario 2's
  own Q — a real bug, not just an aesthetic one, now caught at load time
  rather than left to be noticed by eye.)
- The **3x3 tile of same-sized, candidate-blue discs — nine entries
  total, counting the real candidate — appears all at once, as one
  genuine, evenly-spaced grid**, the instant "A short, shared list" (see
  above) actually names the idea, so the list has something concrete and
  *complete* on screen from the moment it's introduced. Getting to an
  actual 3x3 took two attempts:
  - The first showed only the two discs flanking the real candidate at
    that point, then pulled back later, during "many more scenarios," to
    reveal a much bigger tile filling the whole screen — but that reads
    as the *list itself* growing without bound, which is backwards: the
    list is short and fixed; what's actually unbounded is the number of
    different *situations* it has to serve, a fact about situations, not
    about the list.
  - The second showed all nine discs at once, correctly, but arranged as
    one row flanking the diagram plus two separate rows crammed below the
    chart — not a grid at all, just three unrelated rows, two of which
    also ran behind the legend card. The real fix only became available
    once the sentence annotations were retired earlier (see above): with
    Alice's, Bob's, both of scenario 2's, and the candidate's own
    sentences all gone by `candidateStatementEnd`, the space directly
    above the diagram — previously occupied by two lines of text — is
    free. The tile is now a genuine 3x3: the diagram's own row
    (`CENTER_FY`) sits in the *middle*, one row sits directly above it
    and one directly below, both at the same offset (`TILE_ROW_GAP`), so
    the whole grid is evenly spaced and centered on the real candidate,
    which occupies the exact center of the grid rather than one edge of
    it. `TILE_ROW_GAP` clears the diagram's own outer edge (Q1's circle,
    the taller of the two shapes) above and below, the board's own top
    edge above, and the cost chart below, each with margin to spare —
    verified by picking the value from the actual geometry (candidate
    radius, Q1's radius, chart bounds) rather than by eye. Two in-canvas
    captions that used to sit safely above everything (`"a subset of the
    code..."`, `"and it costs far less..."`) needed a small nudge upward
    once this new top row existed — otherwise their text ran directly
    into that row's rim, caught only by cropping and zooming into a
    screenshot of that exact region. (Both captions were removed
    entirely in a later round — see "The diagram itself was stripped of
    every piece of prose..." below — so this specific nudge no longer
    applies, but the underlying lesson does: any in-canvas text needs
    checking against whatever else occupies the same screen region,
    not just against its own fade timing.)

  Nine is a small, countable size — deliberately not "enormously many" —
  so showing all nine at once and never adding a tenth is what actually
  earns the name "a short list." The tile is deliberately *not* a
  scatter of differently-sized (S, Q) pairs, which would read as "here
  are many different situations." The code itself *is* a set of sets;
  this tile is a subset of it, each disc one of its member sets — not
  one single set, "the code," repeating. The grid's middle column, in
  its middle row, is deliberately left empty — the real candidate, drawn
  with the exact same stroke/fill alphas the tile discs use, sits there
  instead, so it reads as just the center entry of the grid rather than
  a distinct, differently-styled thing next to a grid of look-alikes.
  Once the tile is fully on screen, it does no further growing of its
  own — the chapters that follow make "many more scenarios" a point
  about the chart instead: the two naive curves visibly dim while the
  optimal curve brightens and thickens, making "the same short list
  stays cheap while either naive strategy stays expensive, no matter how
  many situations it's asked to serve" the chart's own visual argument,
  not something a bigger tile asserts by growing.
- The resting frame holds the full combined picture: the two-scenario
  Venn proof at the center (circle, oval, and the shared candidate in
  their overlap), the chart (now a permanent fixture rather than fading
  out, since its numbers are exactly the "less to send, yet more to
  prove" payoff), and the surrounding tile.
- **Pacing: chapters 6-8 (`CH.scenario2End` through `CH.candidateEnd`)
  deliberately run slower than they first did.** When the "one kernel
  fits both" paragraph above was first split into separate cards, each
  card inherited only its proportional slice of the single paragraph's
  original scroll budget — about a third each, which is far too little
  to actually read before the next card replaces it (a card mid-scroll
  isn't like a card sitting still on a page; if its window is too
  narrow, ordinary scrolling carries the viewer straight through it).
  This took *two* rounds to actually fix, not one:
  - The first round widened the three cards' windows but missed that
    the candidate's own growing link (`linkP` in
    `drawCandidateStatement`) takes a fixed amount of scroll to finish
    reaching its disc, set independently of the card boundaries. The new
    `candidateStatementEnd` still landed *before* that link finished —
    so "One kernel fits both" was still being replaced by the next card
    right as its own line was still visibly short of the circle it was
    about to name, before a reader could see the two connect. Caught by
    a direct report, not by any automated check (none of them look at
    whether an animation has visually *finished* by a given boundary,
    only at whether rendering is internally consistent). Fixed by moving
    `candidateStatementEnd` to comfortably *after* the link's own
    completion point, with margin to spare.
  - Widening that window pushes on every boundary after it, which in
    turn squeezes the pull-back chapter and finale that follow — and the
    second round's fix introduced a *new* bug while re-tuning those:
    one pull-back caption (`"a subset of the code..."`) was re-anchored
    to `scaleEnd` without checking what it actually needs to happen
    *after* — the five sentences above it (Alice's, Bob's, both of
    scenario 2's, and the candidate's own) fading out, which is timed
    off `candidateEnd`, not `scaleEnd`. With the two now closer together,
    the caption started fading in *before* those sentences had finished
    clearing, and for a stretch of scroll the caption's text and the
    fading sentence text were both partially visible, superimposed, in
    the same on-screen position — different garbled text than the first
    version of this same mistake produced a few edits earlier, but the
    same underlying error: re-anchoring one timed element without
    tracing what it actually depends on. Caught only by screenshotting
    that exact range, not by any automated check. Fixed by anchoring the
    caption to what it's actually waiting on (`candidateEnd`'s own
    sentence fade-out, plus margin) rather than to `scaleEnd`, and by
    giving the whole tail slightly more room (`scaleEnd` moved later
    still, borrowing further from the final card, which remains safe to
    compress — see below) so both pull-back captions and the resting
    frame all fit in sequence without any two of their windows
    overlapping.
  - `CH.candidateStatementEnd`, `CH.codebookEnd`, `CH.candidateEnd`, and
    `CH.scaleEnd` reflect the result. Every window defined *relative* to
    these (`candBoostAt`, `drawCandidateStatement`'s fades, `optAppear`)
    adjusts automatically since they're expressed as offsets from the
    same constants. `manyScenariosBoostAt`, though (and, at the time,
    the tile's own `restA` and `drawResting`'s own fade-in — both since
    removed entirely, the former in a later tile redesign, the latter
    along with its one caption; see below), was re-anchored to
    `scaleEnd`'s own end rather than to `candidateEnd` plus a fixed
    offset, precisely so that the *next* time any of these four
    constants gets retuned, the tail doesn't need this same kind of
    manual re-derivation (and the same kind of mistake) all over again.
- **"Less" and "More" each get their own dedicated card.** Until this
  point, "More" had only ever been asserted at the very end, in the
  final "Less is More" card, as a brief trailing clause — the payoff got
  a whole card's worth of attention for "Less" but only a sentence for
  "More," even though the piece's own title puts them on equal footing.
  A new `CH.lessEnd` boundary splits what used to be one "This is what
  'Less' means" card into two: the existing cost claim, now preceded by
  naming the paper's own "Less is More" theorem (the one deliberate
  exception to "the legend never names the paper," see below — earned
  at this exact point, since the piece has by now actually demonstrated
  the result, not merely asserted it); and a new "This is what 'More'
  means" card explaining *why* Bob ends up ahead: the kernel he actually
  receives is smaller than the query he was intended to prove, and a
  smaller kernel is more informative — the very same fact chapter 0
  established before any of this mechanism existed, now paying off
  rather than being a new, unmotivated claim at the finish line. (The
  final "Less is More" card's own body was trimmed to match at the time
  — it used to re-explain this same mechanism in its own trailing
  clause — and, one round later, retired outright: see the very next
  bullet below.) Inserting a fourth card into an already-tight budget
  meant retuning `codebookEnd`/`candidateEnd`/`scaleEnd` once again — and
  fixing a bug this reintroduced: one pull-back caption was still
  anchored to `candidateEnd + <fixed offset>`, an offset tuned for a
  since-widened gap between `candidateEnd` and `scaleEnd`, which pushed
  it well past `t = 1` once `candidateEnd` moved. Re-anchored instead to
  `candidateStatementEnd` (when the tile itself, and the sentence
  annotations' own fade-out, actually happen) plus a fixed delay — its
  real dependency, and one that doesn't shift every time `candidateEnd`
  and `scaleEnd` are retuned relative to each other.
- **The trailing "Many situations, one short list" and "Less is More"
  cards were retired outright, one round later.** Once "Less" and
  "More" each had their own dedicated card (previous bullet), these two
  had nothing left to say that hadn't already been said: "Many
  situations, one short list" restated the reuse point "This is what
  'Less' means" already made; "Less is More" restated the provability
  point "This is what 'More' means" now already made too, concretely.
  `LEGEND_CHUNKS` simply ends at "This is what 'More' means," which — as
  the last entry — stays the active card for the rest of the scroll,
  through the chart's own closing curve emphasis and the resting frame,
  with no further text changes. `CH.candidateEnd` and `CH.scaleEnd`
  remain: the chart's curve emphasis (`manyScenariosBoostAt`) and the
  resting frame's own fade-in still need *some* timing anchor, even with
  no more legend cards left to synchronize with. The concrete grounding
  the retired "Less is More" card used to supply ("It's raining and
  cold" rules out more than either "cold" or "raining" alone) was folded
  into "This is what 'More' means" itself rather than dropped — an
  abstract claim with no concrete, checkable instance attached would
  have broken with how every other claim in this piece is handled.
- **"This is what 'More' means" highlights all three kernels its own
  claim compares — not just the candidate.** The candidate's own
  highlight (`candBoostAt`) already spanned this card's window from an
  earlier round, but the two *query* kernels it's being compared
  against, Q1 and Q2, had no highlight of their own here at all — so the
  claim "the candidate is smaller than the query" had only one of its
  two subjects actually standing out on screen. A new `moreBoostAt()`,
  scoped tightly to this one card (`lessEnd` through `candidateEnd`),
  brightens and thickens both query shapes — Q1's circle and Q2's oval —
  the same way `qBoostAt`/`candBoostAt` already do elsewhere, so all
  three shapes the sentence is actually about (the blue candidate,
  nested inside both the amber and magenta query kernels) visibly stand
  out together while it's being read, then settle back once the card
  moves on. Combined with Q1's own earlier, separate highlight window
  via `Math.max`, not replaced by it, since the two windows don't
  overlap in time but shouldn't fight each other if a future retiming
  ever makes them.
- **"A short, shared list" and "This is what 'More' means" were both
  trimmed for length, since the legend card itself was tall enough at
  five and six lines respectively to visibly overlap the cost chart
  above it.** The `.legend` card is bottom-anchored (`bottom: 6%` in
  `style.css`, unchanged from piece one) with a height driven entirely
  by its own content — a longer body pushes the card's *top* edge
  further up the screen, since its bottom edge is fixed. Neither card's
  length had been checked against the chart's own position before now;
  once it was (by screenshotting a standard-ish viewport directly), the
  card's top edge was visibly cutting through the chart's bottom-right
  corner — the curves' own convergence point near `p_q = 1`, and the
  `p_q` axis label itself. Both bodies were shortened (mostly by cutting
  redundant restatement — "This is what 'More' means" no longer repeats
  "the one Alice's task was to let him prove," already established two
  cards earlier, or closes with "Less to send, yet more deductive power
  gained," which just restates what the card's own preceding sentences
  already said) until a direct check of the actual pixel gap, not just
  an absence of visible overlap, showed comfortable clearance — checked
  at both a standard-ish 900×700 and a shorter 800×600 viewport, since a
  shorter viewport leaves the chart and the card's own natural height
  less room to avoid each other.
- **The diagram itself was stripped of every piece of prose except the
  logic sentences.** Up to this point, several explanatory labels had
  accumulated directly on the canvas, alongside the legend: the
  κ(S) ⊆ κ(Q) relabeling sentence (with its own κ(S)/κ(Q) tags on the
  shapes) near the beginning; "κ(S) ⊂ candidate ⊂ κ(Q)" under the
  candidate's own sentence; "a subset of the code — itself a set of
  such sets" and "and it costs far less than either naive strategy,
  every time" describing the tile; "can we do better?" posing that
  chapter's question; and "less to send, yet more to prove" in the
  resting frame. None of these are logic sentences — they're the
  piece's own narration *about* what's on screen, and the legend card
  already carries that narration, in plain language, for every one of
  them. Keeping both was always redundant; removing the canvas copies
  makes the split of labor explicit: the diagram communicates through
  shape, color, and position (plus the concrete logic sentences and
  their links, which are content the piece reasons about, not narration
  describing it), and the legend card is the *only* place prose lives.
  `drawIntroLabels()`, `drawDoBetterCaption()`, and `drawResting()` are
  removed entirely (each had nothing left to do once its one label was
  gone); the two tile captions are cut from `drawScalePopulation()`,
  which otherwise draws the tile exactly as before. A note at the top of
  `script.js` now states this division of labor explicitly, so it isn't
  rediscovered by accident the next time a label is tempted back onto
  the canvas.
- **Two more pacing rounds, at the very front of the piece this time.**
  Both reported directly, not caught by any check:
  - "What Alice knows" gave way to "What Alice will allow Bob to prove"
    after only `CH.aliceEnd = 0.07` of scroll — the shortest window of
    any chunk at the front of the piece, and it read as sudden.
    `aliceEnd` moved to `0.11`; `bobEnd` moved by the same amount (`0.16`
    to `0.2`) rather than being left behind, so Bob's own sentence,
    link, and Q1's growth still play out over the same *relative* width
    they always have — widening the first card without secretly
    compressing the animations that immediately follow it into a now
    shorter remaining span.
  - "Can we do better?" had only `0.04` of scroll (`sLineEnd` to
    `doBetterEnd`) for a two-sentence card. `doBetterEnd` moved from
    `0.5` to `0.52`, borrowing from scenario 2's own reveal
    (`doBetterEnd` through `scenario2End`) immediately after — checked
    directly, by screenshotting right up against `scenario2End`, that
    S2's and Q2's own sentences, links, and ovals still finish settling
    with margin to spare before the chunk changes again, rather than
    just trusting the arithmetic.
- **On-canvas text was too small on mobile — reported directly, since
  the legend card (fixed CSS `0.92rem`, device-independent) read fine
  right next to it.** The root cause: every on-canvas font size derives
  from `unit`, which scales with *board width* — and on a narrow,
  portrait mobile viewport, the board's width is the full (narrow)
  viewport width, unlike on a wider/landscape viewport where the board's
  width is instead capped by its own aspect ratio and ends up
  comfortably larger. `baseFontSize()` now floors the sizeMult=1
  reference size at `16px`, used by the chart's own labels (`drawLabel`/
  `drawMathExpr`'s default base) — on viewports where `unit*0.16` is
  already above that, nothing changes; on narrow ones, it is not
  allowed to shrink below it. The chart's own axis `sizeMult` values
  were separately raised too (`0.68-0.82` to `0.85-1.0`) — the floor
  alone still left them proportionally smaller than the main text, and
  they're exactly what tells a reader "lower is better," so they need
  to actually be legible, not just technically present.
  - **Getting the logic sentences right took three attempts, each
    reported directly.**
    1. Applying that same `16px` floor to the sentences (Alice's, Bob's,
       etc.) made the widest ones wide enough to run directly into the
       fixed-position right column at the old `0.6` board-fraction —
       fixed, at the time, by computing the right column's x
       *dynamically* from the actual measured width of whichever
       left-column sentence was widest. That technically stopped the
       overlap, but pushed the right column much further right than
       before, leaving a large empty gap in between and making the whole
       composition read as lopsided — the candidate disc below, whose
       position never actually moved, now *looked* off-center relative
       to the newly asymmetric text block above it.
    2. Reverted to the original fixed `0.6` column fraction, and gave
       sentences their own, smaller floor (`SENTENCE_MIN_PX = 12`)
       chosen by solving for the largest single-line size that still
       fits the widest sentence in that fixed gap on a ~360px-wide
       board. Technically correct, but barely bigger than the original
       at all — reported directly, again, as "just as small."
    3. The actual fix: let the wide sentences *wrap* onto two lines
       within a column defined by *width* (`SENTENCE_COL_FRAC = 0.44`),
       not by a hard-coded second x-coordinate — the same font that's
       too wide for half a phone screen on one line fits easily across
       two, so the column no longer needs to widen to make room, and the
       lopsided-composition problem from attempt 1 doesn't recur.
       `bobPos()`/`q2Pos()` are now `alicePos().x` plus
       `SENTENCE_COL_FRAC` plus a small gap, rather than a second
       independent fraction. `drawStatement()` checks whether a given
       sentence's own measured width actually exceeds the column before
       wrapping it (so short sentences like "It's cold." stay single-line
       and keep their own true center for the link origin — using the
       full column's center for those would leave the link appearing to
       start from empty space well to their right). The second sentence
       row (S2/Q2) is positioned *dynamically*, right after however tall
       the first row (Alice/Bob) actually renders — one line where that
       fits, two where it wraps — via `row1BlockHeight()`, rather than at
       a fixed fraction that assumed a fixed, single-line height.
       `SENTENCE_MIN_PX`/`SENTENCE_MAX_PX` (both `13`) keep the sentence
       font in a narrow, fully solved-for range regardless of board
       width — see the next bullet for why a *ceiling*, not just a
       floor, turned out to matter too. Sentences are now meaningfully
       bigger than the original on every board width tested (mobile:
       ~7.8px → 13px, a ~67% increase), using wrapping rather than extra
       width to get there.
    4. Solving the mobile-width problem introduced a *new* one on
       desktop-width boards, caught only by screenshotting a 900×900
       viewport specifically (none of the mobile-width checks that
       motivated this fix would have caught it): the recalled Alice row
       and the new S2 row now sat close enough together, vertically,
       that Alice's own link — a straight line toward the diagram,
       passing directly below her own row on its way there — swept
       through the horizontal span of S2's text sitting in that same
       region. Not a link-crossing-link problem (S2's own "west point"
       target, from an earlier round, still correctly keeps the two
       *links* apart) but a link-crossing-*text* one. Diagnosed by
       temporarily exposing the actual computed coordinates (a
       `window.__DEBUG` hook read back via Puppeteer) rather than
       continuing to hand-calculate them, which had already produced at
       least one wrong conclusion along the way (an early hand-check
       used S1's *query* radius where it should have used S1's own,
       smaller radius, throwing off every downstream estimate). Fixed by
       solving directly for the row-2 gap and the sentence font size
       together: `SENTENCE_MAX_PX` caps sentence size at `13px` even on
       boards wide enough that `unit * 0.16` alone would exceed it (so
       the geometry below is solved for one consistent size, not
       whatever size a given board width happens to produce), the
       non-wrapped row gap widened to `unit * 1.0`, and `alicePos()`'s
       own top margin tightened slightly to recover the vertical room
       that widened gap costs — each solved for the specific margin
       needed against the diagram's own top edge and against the
       sweeping line's own position at that height, then confirmed
       empirically (screenshots at both 360px and 900×900) rather than
       trusted on arithmetic alone, given the arithmetic's own history
       in this same round.
  - Increasing the *chart's* label sizes, separately, pushed the `p_q`
    axis label's own offset far enough down that on a short mobile
    viewport (360×740) it started overlapping the legend card's own top
    edge — caught by cropping and zooming into that exact region, not by
    eye at a glance. Its offset was reduced (`unit * 0.46` back to
    `unit * 0.34`) until a fresh crop showed clear separation.
- **Three more issues, reported directly after the above was live on an
  actual phone.**
  1. **"cost (bits)" overlapped the chart's own axis line.** It was
     anchored from its own *top*, at a fixed small offset above the
     axis — fine when the label was small, but once its font grew (same
     round as the sentence work above), enough of its own height now
     fell *below* that anchor point to reach the axis line itself.
     Switched to `anchor: "bottom"` — the label's bottom edge, not its
     top, sits a fixed gap above the axis — so the visible gap no longer
     depends on how tall the label happens to render at.
  2. **The candidate disc read as slightly left of where the tile grid's
     own middle column implied it should be.** A real, if small (0.0125
     of a board-width), discrepancy: the tile's middle column was placed
     at `CENTER_FX`, true board-center, but the actual candidate sitting
     there is positioned by `vennToBoard()`, which offsets *everything*
     by `-VENN_OFFSET.x * unit` to keep the Q1+Q2 composite (not just
     Q1) centered — Q2's oval is the wider of the two shapes, so
     centering the pair shifts Q1, and the candidate concentric with it,
     left of true center. Invisible on its own; visible the moment other,
     correctly-centered discs (the rest of the tile) sit right next to
     it for comparison. Fixed by deriving the tile's middle column from
     the same offset (`CENTER_FX - VENN_OFFSET.x / UNIT_DIVISOR`) rather
     than from `CENTER_FX` directly, so both are computed from the one
     underlying fact instead of one silently assuming the other away.
  3. **Everything visibly stretched while scrolling, on an actual phone**
     — never reproduced in any of this project's own headless-Chrome
     checks, which don't simulate a mobile browser's own address bar
     animating away as the page scrolls. That animation is exactly the
     trigger: `.pinned`'s CSS height (`100vh`, in `style.css`) tracks the
     browser's *largest* possible viewport (address bar hidden), while
     `resize()` sizes the canvas's actual drawing buffer from
     `window.innerHeight`, which tracks the *current* one — normally the
     same number, but genuinely different while the address bar is
     mid-animation, which scrolling itself triggers. When they disagree,
     the canvas's CSS box (100% of `.pinned`) ends up a different size
     than the buffer it was just sized for, and the browser stretches
     the rendered pixels to fill the mismatch. Fixed two ways: `resize()`
     now sets `.pinned`'s height explicitly, in pixels, from the exact
     same `ch` value used for the drawing buffer, instead of leaving it
     to `100vh`; and `frame()` additionally compares `window.innerHeight`
     against its own last-seen value on every animation frame, calling
     `resize()` again if it's changed even when no `resize` event fired
     for it — a direct, low-cost check rather than trusting the browser
     to always fire that event promptly during its own chrome animation.
     Confirmed in Puppeteer by forcing a viewport height change mid-page
     (simulating the address bar's own show/hide) and checking that the
     canvas's drawing-buffer aspect ratio and its rendered CSS aspect
     ratio stay exactly equal — not just that nothing looked obviously
     wrong in a screenshot, since a mismatch here would be a stretch
     factor, not a broken layout, and easy to miss by eye alone.

The legend text is deliberately self-contained: it never names Figure
4(a), the SI, or NASA, and never cites the SI's specific numbers (2
bits, four entries) — those belong to a worked example this infographic
hasn't built, and are planned as a *separate*, later addition rather than
a claim borrowed without showing the work. The "Less is More" conclusion
stands entirely on what's actually been shown here: the chart (our own
curves, for our own two scenarios) and the sentences themselves ("It's
raining and cold" rules out more than either "cold" or "raining" alone —
checkable directly from the entailments already on screen, not asserted
by citing an external result). There is one deliberate exception to
"never names the paper": "This is what 'Less' means" names the result
shown as the paper's own "Less is More" theorem, once the piece has
already demonstrated it in full — a reveal earned by that point in the
scroll, not a claim borrowed without first showing the work, and
distinct from citing the SI's own specific numbers (still avoided
entirely, since that worked example still hasn't been built here).

The legend prose went through five full passes for plain, consistent,
fully self-contained language — an earlier version mixed jargon from the
paper's own notation into text meant to stand on its own, and each
subsequent pass at fixing that surfaced further problems the previous
pass had missed or introduced. Concretely, across all five passes:
- **Raw formulas as plain text.** `H_bin(p_q)`, `Λ(p_s, 1-p_q)`, and
  `p_r = 1` appeared directly in the legend's `<p>` text, which (unlike
  the canvas, where `drawMathExpr()` gives these a genuine subscript) has
  no markup to render a subscript with — so they showed up as a literal
  underscore-and-parenthesis string. `p_r = 1` in particular referenced a
  parameter this piece never defines (R was dropped entirely, from the
  very first line of the file's own top comment) — meaningless without
  the paper open next to it. The fix isn't to add subscript markup to the
  legend; it's to describe each curve in prose ("shown here as the amber
  curve") and let the canvas — which already typesets these
  correctly — carry the actual notation.
- **An illustration artifact presented as a general truth.** "This has a
  fixed cost... since it doesn't depend on the query at all," describing
  `H_bin(p_s)`, sounds like a notable, inherent property of "sending S" —
  but it's only fixed because *this particular chart* happens to hold
  Alice's own sentence constant while varying the query along the x-axis.
  A chart that varied the roles the other way would make "sending S" the
  curve and "sending Q" the flat line instead; which one is "fixed" is an
  artifact of which axis this one illustration chose, not a fact about
  either strategy. Both curve descriptions are now purely descriptive
  ("its cost is shown here as the amber curve" / "the flat cyan line"),
  with no causal explanation attached to either.
- **A rebuttal to a claim that was never made.** "That, not 'being in the
  middle,' is the real source of the savings" rebuts an idea — that a
  kernel works because it's sized "in the middle" — that no earlier
  sentence, in the version being read, actually states. It was the
  surviving half of an argument-and-rebuttal pair from an earlier draft;
  the language-cleanup passes had already cut the argument half without
  noticing the rebuttal now pointed at nothing. Replaced with the actual,
  self-contained reason the shared kernel is cheaper: the same short list
  gets reused for every situation, rather than each situation needing its
  own newly worked-out answer.
- **Symbols standing in for words.** `κ(S)`, `κ(Q)`, `⊆`, and bare `S`/`Q`
  appeared in legend prose, even though the canvas already labels the
  actual shapes this way (unambiguous there, since each label sits right
  on its own circle). In prose, without that visual anchor, a symbol
  reads as terser than it needs to be for no real gain — every instance
  is now a plain phrase ("Alice's kernel," "the query") instead.
- **"Description" instead of "sentence."** These are logic sentences, not
  free-form descriptions — the first pass's own replacement term ("a way
  the world could be and still make that description true") was itself
  imprecise. Every instance is now "sentence" (or, once introduced,
  "query" for the specific sentence Alice's task is to let Bob end up
  able to prove).
- **A sentence conflated with its kernel.** "'It's raining and cold.' is
  one such kernel" treats a sentence and the collection of possible
  worlds consistent with it as the same thing — they aren't. Every
  instance is now phrased as "here's a *sentence* that works... its
  *kernel* is..." keeping the two distinct.
- **Inconsistent vocabulary for the same idea.** A single legend chunk
  used "way," "possibility," and (separately) "set" for what was, each
  time, the same underlying concept. The rewrite settles on "possible
  world" for one member of a kernel — not "a way the world could be,"
  which the first pass had settled on but which is looser than the
  standard term — and "kernel" for the collection, once introduced, never
  "set" again afterward even though a kernel technically *is* one.
  "Situation" is kept distinct, for a whole (S, Q) pairing, so the two
  levels (one possible world, versus one whole scenario) don't blur.
- **A size claim with nothing to compare against.** The very first chunk
  said a kernel "is small" before any second kernel existed on screen to
  be small *relative to* — a real self-consistency failure, not just a
  style issue. The first size comparison now waits until chunk two, once
  Bob's query and its kernel are also established ("its kernel is
  *bigger than Alice's own*").
- **False agency attributed to Bob.** "Bob doesn't need Alice's whole
  sentence" and "Bob only needed to prove the weaker..." both frame Bob
  as if he reasons about or decides what he needs — but in the paper's
  own setup, Alice is given a query and tasked with letting Bob end up
  able to prove it; Bob is simply the passive recipient of whatever that
  communication leaves him able to prove. Every instance is now phrased
  as Alice's task ("Alice's task is to let Bob end up able to prove...").
- **An ambiguous ellipsis.** "...is consistent with this weaker one too,
  plus others that aren't" leaves "that aren't" to be resolved by the
  reader — aren't *what*, exactly? Grammatically resolvable on a careful
  read, but not worth requiring one. Replaced with an explicit subset
  statement: "it contains every possible world that Alice's own kernel
  does, plus others besides."
- **A vague, unnamed referent.** "Yet the outcome exceeds what was
  strictly required" never says whose outcome, or what kind. Replaced
  with "what Bob ends up able to prove exceeds what was strictly
  required" — naming the actual subject instead of gesturing at it.
- **Sentences described as the thing being sent.** "Alice just states the
  query itself," "Alice states her own sentence directly," "here's a
  sentence that works for both... naming just its place on that list,"
  "each situation needing its own newly worked-out answer," "each would
  need its own tailor-made sentence" — all frame a *sentence* as the
  object being communicated. But many different sentences can share the
  same kernel (the same collection of possible worlds), and it's the
  kernel — the semantic content, not any particular wording of it — that
  the cost curves are actually the cost *of*. A sentence still appears on
  screen, but only as a concrete, readable stand-in for the kernel it
  happens to express, never as the object of a "send"/"state"/"name"
  verb. Every instance is now phrased around the kernel itself: "Alice
  just communicates the query's kernel outright," "Alice communicates her
  own kernel directly," "here's a sentence whose kernel does the job...
  sending just this kernel's place on that list... each situation needing
  its own newly worked-out kernel... sending a kernel this way costs
  less," "each would need a fresh kernel sent."

This was a genuinely iterative process, not a single pass that got
everything right the first time: each round of review caught real
mistakes the previous round had either introduced or missed, including
in the write-up of the previous round's own fixes.

The three named kernel sizes (`p_s = 0.15`, the candidate's `0.35`, and
`p_q = 0.65`) are illustrative constants, not values computed from the
actual English sentences (there's no well-defined universe to compute
them from). The diagram's own disc radii (`VENN_S1`, `VENN_Q1`,
`VENN_CAND`) are computed directly from these same constants via the same
exponential size-to-radius mapping used elsewhere in the piece, so the
picture and the chart are never telling two different stories about how
big each kernel is.

## How it works

A single scalar `t ∈ [0,1]`, recomputed every animation frame from scroll
position (`script.js`, `computeT()` — identical to piece one's), drives
every visual change. There are no discrete steps, only loose chapter
boundaries (`CH` in `script.js`) used to schedule fades. Unlike piece one,
nothing here is driven by wall-clock time — no idle "breathing" pulse —
so the frame is rendered once per distinct `t` and is pixel-identical
whenever scrolling stops, and scrubbing forward then backward through the
same `t` values reproduces byte-identical frames.

- `index.html` / `style.css` — identical shell and styling to piece one: a
  tall (`600vh`) scroll track with a sticky pinned `<canvas>`, plus the
  overlaid `.legend` caption card.
- `script.js` — new storyboard and content, but reuses piece one's
  primitives: `clamp`, `smoothstep`, `lerp`, `hexToRgb`, `rgbCss`,
  `drawLabel`, `captionAlpha`, the `LEGEND_CHUNKS`/`updateLegend()`
  pattern, and the same background/glow color constants, all verbatim.
  `drawGlow` gets one additive tweak: an optional tighter halo multiplier,
  since here (unlike piece one's fixed-size grid dots) a disc's radius is
  meaningful — it *is* the kernel's size — and piece one's default 3.2x
  halo would visually balloon a kernel well past its true boundary.
  `drawGrowingLink` gets a second tweak: an optional color (piece one
  only ever used one), so a link always matches the kernel it points to.
  New for this piece:
  - `ALICE_STATEMENT`/`BOB_STATEMENT`/`S2_STATEMENT`/`Q2_STATEMENT`/
    `CANDIDATE_STATEMENT` and `drawStatement()` — the concrete sentences
    and the "label, then link" sequencing piece one's own intro uses.
    `s2Pos()`/`q2Pos()` are a second row, directly below `alicePos()`/
    `bobPos()` — Alice's and Bob's originals get *recalled* (a quick,
    non-animated fade-in — `recallFade` in `drawVennProof()`, no
    `drawGrowingLink` progress ramp, just a static line) at the same
    moment scenario 2's own row animates in, and both rows plus the
    candidate's own sentence stay up together, fading out as one group
    only once "one set solves both" has had its moment. An earlier
    version let scenario 2 use Alice's/Bob's exact positions on the
    (wrong) assumption that the originals would already be gone; they
    need to coexist instead, hence the second row. Every link target is
    computed at its kernel's *final* size, never scaled by that kernel's
    own still-growing radius, so a link's direction never shifts
    mid-growth.
  - `qBoostAt()`/`sBoostAt()`/`candBoostAt()` — one shared timing function
    per curve, called by both `drawCostChart()` (the curve itself) and
    `drawVennProof()`/`drawCandidateStatement()` (the disc it names), so a
    curve and its disc highlight at the exact same moment, not two
    independently hand-tuned windows. The candidate's own highlight only
    ever thickens its stroke and brightens its fill (`lineWidthMult`/
    `fillAlphaMult`, the same knobs Q1's highlight already used) — an
    earlier version grew its radius instead (`CAND_ENLARGE_MAX`, checked
    against `verifyVennGeometry()` to make sure the enlarged disc still
    stayed inside both Q's), which read as the kernel itself getting
    bigger to show emphasis, backwards in a piece where radius *is*
    kernel size. `CAND_ENLARGE_MAX` and that extra geometry check are
    both gone; the candidate's radius is simply `venn.candRadius`,
    unconditionally, checked once rather than twice.
    `manyScenariosBoostAt()` is a similar one-shot ramp (no fade back out)
    that dims the two naive curves and emphasizes the optimal one near
    the end of the scroll, after "This is what 'More' means" (the last
    legend card) — by this point the tile itself (already shown in full,
    see below) has no more growing left to do, and there's no further
    legend text either, so this curve emphasis carries the piece's
    closing point on its own.
  - `drawMathExpr()` / `measureMathExpr()` — a small, non-TeX math-typeset
    helper: an array of `{ text, italic, subscript }` segments, each
    drawn in its own font size/offset, so `H_bin(p_q)` reads with a
    genuine subscript rather than a flat string with underscores.
  - `drawOutlineDisc()` / `drawOutlineEllipse()` — a kernel-as-a-set
    shape: stroke + very faint fill, used for any kernel that has
    something nested inside it, or that's meant to read as transparent.
  - The Venn geometry itself — `VENN_Q1`/`VENN_S1` (circle, concentric),
    `VENN_Q2`/`VENN_S2` (oval, concentric), `VENN_CAND` (the shared
    candidate) — with `VENN_S1`/`VENN_Q1`/`VENN_CAND`'s radii tied
    directly to `PS_EXAMPLE`/`PQ_EXAMPLE`/`P_CANDIDATE_EXAMPLE` via
    `pNormToLocalRadius()`, the same exponential mapping the chart's own
    curves are plotted against. `insideShape()`/`shapeBoundaryPoints()`/
    `shapeSubsetOf()` are generic point-in-circle/point-in-ellipse and
    boundary-sampling containment checks, used by `verifyVennGeometry()`
    (an IIFE that runs once at load time and throws if any required
    containment fact fails). The candidate's radius is fixed regardless
    of highlight state (see `candBoostAt` below), so there's only ever
    one size to check per shape, not a resting size and a separately
    verified highlighted one.
  - `hbin()` (binary entropy) and `lambda()` (the paper's own
    `Λ(a,b) = a·log2((a+b)/a) + b·log2((a+b)/b)`), both taken directly
    from the paper's definitions — and `drawCostChart()`, a small inset
    chart plotting `H_bin(p_q)` (a curve, amber), the fixed `H_bin(p_s)`
    (a line, cyan), and `Λ(p_s, 1-p_q)` (a curve, blue) against a
    properly labeled `p_q` axis, mirroring Figure 4(a). The y-axis reads
    "cost (bits)," not just "bits" — a bare unit name doesn't say which
    direction on the chart is *better*; "cost" makes "lower is cheaper"
    readable directly off the axis, without requiring it to be inferred
    from context. Each of the two
    naive curves fades in near the start of its own chapter, then its
    line width/alpha increase during a highlight window comfortably
    *within* that same chapter (an earlier version of this code let a
    highlight's fade-out window start before its fade-in had even
    finished, which silently suppressed the highlight almost entirely —
    now verified by scrubbing through each window's exact boundary). The
    chart fades in once and never back out (an earlier version faded it
    out well before the piece's closing curve emphasis, which needs it
    on screen to make its own point).
  - `buildTileGrid()` — a deterministic grid of positions (no randomness
    at all, unlike an earlier version of this chapter that scattered
    differently-sized (S, Q) pairs; "regular tile, one fixed size, one
    color," not "scattered variety," is the point here). `TILE_COLS = 3`
    columns (`TILE_COL_FX`) and `TILE_ROW_FY.length = 3` rows — nine
    slots total, counting the real candidate, deliberately small and
    countable rather than a much larger grid (two earlier versions tried
    a five-row grid revealed in two stages, and then a three-row grid
    that wasn't actually a grid — see above for both). The middle row
    (`TILE_ALIGNED_ROW`) lands at exactly `CENTER_FY`, the same height as
    the real candidate disc; that row's middle column
    (`TILE_ALIGNED_COL`) is skipped entirely, since the real candidate —
    drawn in `drawScalePopulation()` at `venn.candRadius`, the same
    stroke/fill alphas as the tile discs, not a separate hardcoded
    size — sits there instead, at the exact center of the grid. The
    other two rows sit at `CENTER_FY \u00B1 TILE_ROW_GAP`, evenly spacing
    them above and below the middle row; `TILE_ROW_GAP` (0.17, in board
    fractions) was derived from the actual geometry, not picked by eye:
    large enough to clear Q1's own radius (the taller of the diagram's
    two shapes) plus a tile disc's own radius, in both directions, with
    margin, while staying small enough that the bottom row still clears
    the chart. This symmetric arrangement was only possible once the
    sentence annotations above the diagram were retired (see above) --
    an earlier attempt kept a row there and it visibly ran through two
    lines of still-on-screen text. `CHART_FX0`/`CHART_FX1`/`CHART_FY0`/
    `CHART_FY1` (board-fraction constants shared with `chartRect()`) and
    a fixed margin around the diagram's own bounding box are still
    checked as a safety net, even though the hand-derived row gap is
    chosen to clear both already. All nine slots fade in together, in a
    single `smoothstep`, at `CH.candidateStatementEnd` — the instant the
    legend names "a short list of candidate kernels" — with no later
    stage: an earlier version faded in only the two slots flanking the
    real candidate at that moment (tagged `preview: true`) and grew the
    rest of the tile in later, during a pull-back chapter that has since
    been retired; removed along with that chapter, since the list is now
    shown complete from the start.

The pieces do differ on one point now: piece one's dots keep a slow,
independently-seeded "breathing" pulse running at all times, driven by
wall-clock time, so its scene is only reproducible up to harmless idle
jitter. This piece deliberately drops that: a shape's size changing for
any reason *other* than scrolling read as distracting, so every visual
here is a pure function of `t` alone.

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
backward smoothly. Resizing the window (including narrow/mobile widths and
ultrawide/pillarboxed widths) re-letterboxes the scene and repaints
immediately at the current scroll position.
