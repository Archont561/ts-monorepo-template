## Lint & Format

> [!CAUTION]
> Biome is the only lint/format tool. Never use ESLint, Prettier, or `lint-staged`.

- `mbiome` (from `@myorg/biome`, `configs/biome`) bakes in `--config-path=<configs/biome>`; there is no root `biome.json`
- Config (`configs/biome/biome.json`): `recommended` rule preset, unused imports as errors, space indentation (2), 100 column width, double quotes, semicolons, trailing commas, import organizing on
- Run `bun run check` to lint+format without writing; `bun run check:fix` to auto-fix. Run `check:fix` before committing
- The pre-commit hook reformats staged files automatically (`mbiome check --write {staged_files}`)

| Command | Description |
| :--- | :--- |
| `bun run check` | Check without writes |
| `bun run check:fix` | Auto-fix |
| `mbiome check --write {files}` | Direct fix |

```mermaid
graph LR
    A[edit] --> B[check:fix]
    B --> C[commit]
    C --> D[pre-commit: mbiome]

    style D fill:#0969DA,color:#fff
```
