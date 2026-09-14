# @myorg/skills

A curated set of agent skills, vendored into the repo so every agent — and every CI run — loads the same instructions.

## What it provides

- Curated skills in `configs/skills/skills/<name>/SKILL.md`, each with YAML frontmatter (`name`, `description`)
- `mskills` — one CLI for sync, list, add, update, validate and index
- `.agents/skills/` — the vendored copy agents actually read
- `.agents/skills.index.json` — a generated index so an agent can load descriptions without reading every file

Skills ship as **opt-in** (`Set up AI agent skills?`, default `false`); when declined, the config and `.agents/skills/` are pruned together.

### Curated vs vendored

| Location | Purpose | Committed |
| :--- | :--- | :---: |
| `configs/skills/skills/<name>/SKILL.md` | Curated, template source of truth | ✅ |
| `.agents/skills/<name>/SKILL.md` | Vendored, includes skills.sh installs | ✅ |
| `.agents/skills.index.json` | Generated index | ✅ |

A skill is a folder containing `SKILL.md` with frontmatter:

```markdown
---
name: biome
description: Lint and format with Biome
---
```

### Bundled skills

`biome`, `bun`, `changeset`, `commit`, `playwright`, `review`, `test`, `turbo`

## Usage

```bash
bun run skills list        # what is installed (curated + vendored + skills.sh)
bun run skills validate    # check every SKILL.md frontmatter
bun run skills index       # rebuild .agents/skills.index.json
bun run skills sync        # curated → vendored, then validate + index
bun run skills add <pkg>   # install from skills.sh
bun run skills update      # update everything installed from skills.sh
```

All six subcommands are also `mskills <sub>`; the root script is just `mskills`.

### Adding a curated skill

1. Create `configs/skills/skills/<name>/SKILL.md` with `name` and `description` frontmatter.
2. Keep it to what an agent cannot infer — commands, conventions, gotchas.
3. Run `bun run skills sync`.
4. Commit both the curated file and the vendored copy.

### Adding from skills.sh

1. `bun run skills add vercel-labs/agent-skills` (or `https://skills.sh/p/<pack-id>`).
2. Review the diff in `.agents/skills/` — vendored skills are committed, so what lands is what CI runs.
3. Run `bun run skills sync` and commit the new index.

> [!CAUTION]
> skills.sh audits published packs but cannot guarantee safety. Pin a ref or a pack you own, review the diff, and never put secrets in a skill.
