# AGENTS.md — @myorg/lefthook

## Rules

- Never edit the root `lefthook.yml` — it is generated from `configs/lefthook/lefthook.yml` by `msetup`.
- Hooks must stay fast. A hook that runs the full test suite will be skipped with `--no-verify`, which defeats it.
- New hooks are added to the source config, then reinstalled with `msetup lefthook` (or `bun install`).
- Do not bypass hooks with `--no-verify` casually; when you must, say why in the commit body.

## Before marking a task done

- [ ] Hook changes made in `configs/lefthook/lefthook.yml`, not the generated file
- [ ] `msetup lefthook` run and the generated root wrapper committed
- [ ] Both hooks still pass on a real commit (format check + commit message lint)
