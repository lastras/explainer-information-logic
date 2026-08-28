// Pauses each inlined piece's own rAF render loop while it's scrolled out of
// view, and resumes it once visible again -- so this page isn't running
// four simultaneous canvas animations at all times.
//
// Relies on <piece-block>.__pauseAnim / .__resumeAnim, hooks each of the
// four explainer script.js files attach directly to their own nearest
// .piece-block ancestor (root.__pauseAnim/__resumeAnim, where `root` is
// that same element -- see each piece's own script.js for the mechanism).
// Same-document, not cross-origin like the earlier <iframe> version: no
// contentWindow, no load-event wait, no try/catch for a cross-origin
// failure that can no longer happen. Works identically over file:// or
// http(s).
//
// Observes each piece's own `.pinned` element, not the `.piece-block`
// section itself -- confirmed directly, not assumed: a percentage
// `threshold` is computed against the *observed* element's own area, and
// `.piece-block` is that piece's full scroll-track (600vh, or 1200vh for
// "Less is More"), not just the visible graphic. For "Less is More"
// specifically, the track is ~12 viewport-heights tall, so even a
// fully-on-screen `.pinned` (filling the entire viewport) only ever
// covers ~1/12 ~= 0.083 of `.piece-block`'s own area -- below any
// threshold at or above 0.1, so `isIntersecting` would never go true and
// that piece's animation would never resume once paused. `.pinned` itself
// is always ~100vh (by its own CSS, whether or not it's currently
// sticky-stuck), so a ratio computed against *it* stays meaningful
// regardless of how tall its containing track is.
(function () {
  "use strict";

  document.querySelectorAll(".piece-block").forEach(function (piece) {
    const pinned = piece.querySelector(".pinned");
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        const fn = entry.isIntersecting ? piece.__resumeAnim : piece.__pauseAnim;
        if (fn) fn();
      });
    }, { threshold: 0.1 });
    observer.observe(pinned);
  });
})();

// Note: an earlier version of this file also contained a second block of
// JS here that repositioned the scroll (via window.scrollTo) whenever a
// piece-frame settled half on/off screen. That entire approach was
// removed at the user's direction -- it kept fighting the user's own
// scrolling in one way or another. It's no longer needed for a different
// reason too: each piece is now inlined at its own real height (see
// index.html's own note) rather than squeezed into a short <iframe>, so
// there's no "half on/off screen" resting state left to correct in the
// first place. This file contains zero calls to window.scrollTo.
