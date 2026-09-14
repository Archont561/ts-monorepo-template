# AGENTS.md — @myorg/gitattributes

## Rules

- This package owns the root `.gitattributes`. Never add another one.
- Every new binary artefact type — `.wasm`, `.node`, archives, images — must be marked `binary` here, or Git will try to diff it.
- Shell scripts and CI entry points stay `eol=lf`; do not relax that for Windows.

## Before marking a task done

- [ ] New binary file type → `binary` entry
- [ ] No `.gitattributes` outside the root
