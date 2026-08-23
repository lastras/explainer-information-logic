# Information in Logic — explainers

Two scroll-driven, zero-dependency explainers dramatizing mechanisms from the
paper "Information in Logic." No build step, no libraries, no CDN calls —
just `index.html` / `style.css` / `script.js` per piece.

- [`less-is-more/`](less-is-more/) — "Less is More": Alice knows exactly what
  she wants Bob to end up able to prove. A short, pre-agreed list of
  candidate kernels lets her send less than either obvious strategy, while
  Bob ends up able to prove more than was strictly required.
- [`no-need-to-know/`](no-need-to-know/) — "No Need to Know": Alice doesn't
  know what Bob already knows. She hashes her kernel into a short index; Bob
  rules out same-bin "confounders" using his own background knowledge.

Each piece has its own README with full implementation notes and development
history.

## Viewing locally

```
python3 -m http.server
```

then visit `http://localhost:8000/`.

## Published

Served via GitHub Pages from this repo's `main` branch.
