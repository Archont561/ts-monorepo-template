# Configs - Agent Reference

Shared tooling configurations. Each sub-directory owns one tool's config and exposes a single `m`-prefixed CLI bin.

> [!IMPORTANT]
> No root-level `turbo.json`, `biome.json`, `bunfig.toml`, etc. — all config lives in `configs/*` and is referenced by CLI flags.

## Packages

| Package | Bin | File |
| :--- | :--- | :--- |
| Biome | `mbiome` | [AGENTS.md](biome/AGENTS.md) |
| Bun Config | `mbun` | [AGENTS.md](bun-config/AGENTS.md) |
| Bunup | `mbunup` | [AGENTS.md](bunup/AGENTS.md) |
| Changeset | `mchangeset` | [AGENTS.md](changeset/AGENTS.md) |
| Citty | `mcitty` | [AGENTS.md](citty/AGENTS.md) |
| Commitlint | — | [AGENTS.md](commitlint/AGENTS.md) |
| GitHub Actions | `mci` | [AGENTS.md](gh-actions/AGENTS.md) |
| Lefthook | `msetup` | [AGENTS.md](lefthook/AGENTS.md) |
| Native | — | [AGENTS.md](native/AGENTS.md) |
| Playwright | `me2e` | [AGENTS.md](playwright/AGENTS.md) |
| Skills | `mskills` | [AGENTS.md](skills/AGENTS.md) |
| Template | `mdocs` | [AGENTS.md](template/AGENTS.md) |
| TypeScript | `mtsc` | [AGENTS.md](ts/AGENTS.md) |
| Turbo | `mturbo` | [AGENTS.md](turbo/AGENTS.md) |
| UnoCSS | — | [AGENTS.md](unocss/AGENTS.md) |
| Pages | — | [AGENTS.md](pages/AGENTS.md) |

Root `AGENTS.md` and `README.md` reference these files instead of concatenating them. Workflows are generated via `bun run docs:sync` (`mdocs`).

```mermaid
graph LR
    A["configs/*"] --> B[discoverConfigs]
    B --> C["mdocs / scaffolder"]
    C --> D[".github/workflows"]
    C --> E["prune disabled"]

    style B fill:#0969DA,color:#fff
```

## Rules

- [ ] No root-level `turbo.json`, `biome.json`, `bunfig.toml`, etc. — all config lives in `configs/*` and is referenced by CLI flags.
- [ ] Adding a config requires only a new `configs/<dir>/` workspace with `package.json`, `AGENTS.md`, `README.md`, and optionally `ci.steps.yml`.
- [ ] Each package exposes exactly one `m`-command (with subcommands where needed).

<details>
<summary>Scaffold metadata</summary>

Each `configs/*/package.json` may contain:

```json
{
  "scaffold": {
    "default": "always | enabled | disabled",
    "flag": "--playwright",
    "prompt": { "type": "confirm", "message": "..." },
    "removals": ["apps/example/playwright.config.ts"],
    "scriptsToRemove": ["test:e2e"],
    "selfDestruct": true
  }
}
```

- `discoverConfigs()` reads this — no hardcoded list
- `selfDestruct` packages (template) are always removed

</details>

> [!TIP]
> Run `bun run docs:sync` after editing workflow skeletons, and `bun run ci:lint` after regenerating.
