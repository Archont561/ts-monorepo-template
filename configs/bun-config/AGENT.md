## Bun Config + Coverage Generation

> [!NOTE]
> Shared `bunfig.toml` — no per-package symlinks. Coverage reporting in `@myorg/coverage`.

- `mbun` (from `@myorg/bun-config`) wraps `bun` and injects `--config=<configs/bun-config/bunfig.toml>` for `bun test`; other commands pass through
- `mbun coverage` runs `mturbo coverage` (per-package); `bun run coverage` follows it with `mcoverage merge`, which writes the merged root `coverage/lcov.info` (lcov-result-merger, no lcov binary needed)
- Config (`bunfig.toml`): LCOV + text reporters, 80% line/function threshold, ignores `*.test.ts`, `dist`, `node_modules`, `configs/*`, `cli.ts`, `e2e`, `aggregate.ts`, `*.node`, `target`, `apps/example/src/index.ts`, `pages/index.ts`
- No per-package `bunfig.toml` — always passed explicitly for deterministic output
- Reporting (HTML, artifact, Pages, threshold, PR comment) is in `@myorg/coverage` — see `configs/coverage/AGENT.md`: `mcoverage setup` installs lcov, `mcoverage html` renders `coverage/html/`, `upload-artifact@v4` retention 14d, `mcoverage check --threshold 80` gates the build, PR comment via `lcov-reporter-action`, Pages inclusion at `/coverage/` (via `mcoverage pages`) when pages enabled else standalone `coverage.yml` Pages deploy

| Command | Description |
| :--- | :--- |
| `bun run test` | Turbo → per-package `mbun test` |
| `bun run coverage` | `mturbo coverage && mcoverage merge` → merged LCOV |
| `mbun test` | Direct, injects config |

```mermaid
graph TD
    A[mbun test] --> B[bunfig.toml]
    B --> C[coverage/lcov.info]
    C --> D[mturbo coverage<br/>then mcoverage merge]

    style B fill:#0969DA,color:#fff
```

> [!WARNING]
> JSC not V8 — don't use Node coverage APIs.
