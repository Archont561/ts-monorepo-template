## Lint & Format

- Biome is the only lint/format tool. `mbiome` (from `@myorg/biome`, `configs/biome`) bakes in `--config-path=<configs/biome>`; there is no root `biome.json`.
- Config (`configs/biome/biome.json`): `recommended` rule preset, unused imports as errors, space indentation (2), 100 column width, double quotes, semicolons, trailing commas, import organizing on.
- Run `bun run check` to lint+format without writing; `bun run check:fix` to auto-fix. Run `check:fix` before committing.
- The pre-commit hook reformats staged files automatically (`mbiome check --write {staged_files}`).