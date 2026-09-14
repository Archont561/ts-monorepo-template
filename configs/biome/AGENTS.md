# AGENTS.md — @myorg/biome

## Rules

> [!CAUTION]
> Biome is the only lint and format tool. Never add or invoke `eslint`, `prettier`, or `lint-staged`.

- Never create a root `biome.json`. The shared config lives at `configs/biome/biome.json` and is reached through `mbiome`.
- Never edit files under `dist/` to satisfy a lint rule — regenerate instead.
- Run `bun run check:fix` before committing; the pre-commit hook will reformat staged files anyway, so an unformatted diff means you skipped it.
- **Overrides replace, they do not merge.** Each `overrides[]` entry restates its own rule set; adding an override without restating the shared rules silently drops them.
- Adding a lint suppression (`// biome-ignore`) is a last resort — fix the code or narrow the config.
- Ignore *generated* directories in `files.includes`, never individual files.

## Boundaries enforced here

| Import | Where | Why |
| :--- | :--- | :--- |
| `bunup` | everywhere | Use `@myorg/bunup` so presets apply |
| `@myorg/example` | `packages/**`, `configs/**` | Apps consume packages, never the reverse |

## Before marking a task done

- [ ] `bun run check` exits 0 (baseline: 14 warnings + 14 infos over 138 files — warnings are not errors)
- [ ] No new `// biome-ignore` comments without a reason
- [ ] Any new override restates the rules it needs
