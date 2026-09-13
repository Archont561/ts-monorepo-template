## AI Agent Skills

- Modular skill files ship in `configs/skills/skills/` and are installed into `.agents/skills/` (gitignored) by `mskills` (from `@myorg/skills`).
- `bun run skills:sync` copies skills into `.agents/skills/`; `bun run skills:list` prints what is available.
- Treat `configs/skills/skills/` as the source of truth — never edit files inside `.agents/` directly.
- Skills supplement this AGENTS.md with tool-specific knowledge.
- This config is opt-in: it is pruned (and the `skills:sync`/`skills:list` scripts removed) unless selected during scaffolding.