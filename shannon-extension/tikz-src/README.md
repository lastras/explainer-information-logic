# TikZ sources for this explainer's two diagrams

`shannon_top_row.tex` and `shannon_bottom_row.tex` are recolored
adaptations of the paper's own Figure 1
(`content/paper-PNAS-final/fig01_shannon_model_extension_standalone.tex`) --
same content and layout, split into the two rows and colored to match
this explainer's own palette (`classical` cyan / `newstage` gold, defined
in each file). `tikzlibrarydsp.code.tex` is copied here unmodified (same
dependency the paper's own figure uses).

The compiled output lives in `../assets/` as SVG (`shannon_top_row.svg`,
`shannon_bottom_row.svg`), loaded directly by `script.js`. To regenerate
after editing either `.tex` file:

```
pdflatex -interaction=nonstopmode shannon_top_row.tex
pdftocairo -svg shannon_top_row.pdf shannon_top_row.svg
cp shannon_top_row.svg ../assets/

pdflatex -interaction=nonstopmode shannon_bottom_row.tex
pdftocairo -svg shannon_bottom_row.pdf shannon_bottom_row.svg
cp shannon_bottom_row.svg ../assets/
```

(`dvisvgm` was tried first but this machine's build isn't linked against
Ghostscript/poppler, so it can't process the PostScript specials TikZ
emits or read PDF page counts; `pdftocairo -svg`, from poppler, works
cleanly and was used for both assets checked in here.)

Build artifacts (`.aux`/`.log`/`.pdf`) aren't checked in -- only the
`.tex` sources and the final `.svg` outputs.
