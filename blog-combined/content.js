// Single source of truth for this page's own text and page order --
// consumed by build.js to generate index.html. Edit *this* file for
// wording/ordering changes; edit a piece's own ../explainer-<name>/
// index.html for that piece's own markup shape (build.js re-reads it
// fresh every run, so there's nothing to hand-copy or keep in sync).
//
// `sections` is rendered top to bottom, exactly in this order. Each
// entry is either:
//   { type: "prose", className: "...", html: "..." } -- a <section>
//   of hand-written HTML (h2/p/a, whatever's needed), or
//   { type: "piece", name: "..." } -- a placeholder for that piece's
//   own real markup, pulled live from ../explainer-<name>/index.html.

module.exports = {
  title: "Interactive Explainer for Fundamental limits incorporating logical reasoning into Shannon’s information theory",

  masthead: {
    h1: "Interactive Explainer for Fundamental limits incorporating logical reasoning into Shannon’s information theory",
      subhead: `Our <a href="https://www.pnas.org/doi/10.1073/pnas.2525600123" target="_blank" rel="noopener">paper</a> that combines information theory and mathematical logic has been published in the Proceedings of the National Academy of Sciences. The intended usage of this website is as a companion to that paper; we only select a few topics and expand on them for didactic purposes.`,
  },

  sections: [
    {
      type: "prose",
      className: "prose",
      html: `
  <h2>Reasoning Amplifies Information</h2> Our first task is to motivate the paper using one of Richard Feynman's Lectures on Physics famous quotes.`,
    },
    { type: "piece", name: "shannon-extension" },
    {
      type: "prose",
      className: "prose",
      html: `
  <h2>What a Sentence Means</h2>
  <p>Key to our work is a crisp definition of the meaning of a logic sentence. The piece below builds that notion &mdash; we
    call it a sentence&rsquo;s <em>kernel</em> &mdash; from worked
    examples, following the same approach as the paper itself.</p>`,
    },
    { type: "piece", name: "entailment" },
    {
      type: "prose",
      className: "prose",
      html: `
  <p>With that vocabulary established, our results can be stated almost
    geometrically: communicating a sentence means communicating enough
    about its kernel.</p>

  <h2>No Need to Know</h2>
  <p>Consider a case in which intuition might mislead: one would expect
    that knowing what it is that one&rsquo;s audience knows should make communication cheaper, and not knowing it should incur some cost. Surprisingly, not knowing what it is that the audience knows results only in a slight efficiency loss. The piece below illustrates the core mechanism we use to establish this.</p>`,
    },
    { type: "piece", name: "no-need-to-know" },
    {
      type: "prose",
      className: "prose",
      html: `
  <h2>The Less is More Paradox</h2>
  <p>Now suppose Alice knows what it is that Bob knows, and needs only for him to
    be able to prove one specific fact, not everything she knows. One
    would expect the cheapest possible message to be the one stating
    exactly that fact, no more. The piece below presents a strategy
    that is provably cheaper still &mdash; along with a hidden paradox.</p>`,
    },
    { type: "piece", name: "less-is-more" },
    {
      type: "prose",
      className: "prose",
      html: `
  <h2>The Price of Incorrect Information</h2>
  <p>In the following explainer, we demonstrate the relative cost of correcting someone who agrees with you generally, but knows less than you do, versus a situation where they believe conflicting information.</p>`,
    },
    { type: "piece", name: "incorrect-information" },
    {
      type: "prose",
      className: "closing prose",
      html: `  <p>For the origins of this project, IBM Research has also published
    <a href="https://research.ibm.com/blog/information-theory-meaning" target="_blank" rel="noopener">a feature</a>
    describing how it grew from a years-long side project into the
    collaboration described here.</p>`,
    },
  ],
};
