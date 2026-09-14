# AGENTS.md — @myorg/template

> The `bun create` scaffolder and the workflow aggregator. Template-development-only: this package is removed from generated projects.
> Orientation in [README.md](./README.md), current state in [CONTEXT.md](./CONTEXT.md).

## Rules

- Nothing about a config may be hardcoded in the scaffolder. Behaviour comes from the `scaffold` metadata in each `configs/*/package.json` — add a field there, not a special case here.
- `dist/index.js` is committed and is what `bun create` actually runs. Rebuild it (`bun run --filter @myorg/template build`) after every source change, or the template ships stale behaviour.
- Never edit generated `.github/workflows/*`. Change the skeleton or the fragment, then run `bun run docs:sync`.
- A new step-fragment filename must be registered in the aggregator's allow-list, or discovery will ignore it.
- Fragments are spliced under `steps:`, so every line must be indented.
- Only one workflow may deploy to Pages. `docs:sync` skips `pages.yml` and `coverage.yml` while the docs app (`apps/template-docs`) exists because `template-docs.yml` owns the site here.
- Any prose that must not survive into a generated project goes inside `TEMPLATE-ONLY:START(...)` / `END(...)` markers — the scaffolder strips those blocks.
- The bundle must stay free of runtime dependencies: Bun-native APIs only, plus `--packages bundle`.
- The scaffolder scaffolds **in place**. Never run it against this repository — use the test harness (`BUN_CREATE_DIR`), which copies to a temp directory.
- Root `README.md`, `AGENTS.md`, `CONTEXT.md` and `LICENSE.md` are static reference files, not concatenated. Do not add a generator for them.

## Commands

| Command | Purpose |
| :--- | :--- |
| `bun run test:template` | unit + integration + combination cases |
| `bun run test:template:cases` | combination cases only |
| `bun run --filter @myorg/template build` | rebuild the committed bundle |
| `bun run docs:sync` | regenerate workflows and dependabot config |
| `bun run docs:site` | build the docs artifact |
| `bun run ci:lint` | validate the regenerated workflows |

## Before marking a task done

- [ ] `bun run --filter @myorg/template build` run and `dist/index.js` committed
- [ ] `cd configs/template && bun test` passes (84 tests, including the leak scanner)
- [ ] `bun run docs:sync` run and generated workflows committed
- [ ] `bun run ci:lint` clean
- [ ] New opt-in config declares `removals` for its disabled state
- [ ] Template-only prose wrapped in `TEMPLATE-ONLY` markers
