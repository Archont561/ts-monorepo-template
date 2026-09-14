# AGENTS.md — @myorg/skills

> AI agent skills. Curated source lives in `configs/skills/skills/`, vendored copy in `.agents/skills/`.
> Orientation in [README.md](./README.md), current state in [CONTEXT.md](./CONTEXT.md).

## Rules

- `configs/skills/skills/<name>/SKILL.md` is the source of truth for curated skills. Edit there, never in `.agents/skills/`.
- Every `SKILL.md` needs YAML frontmatter with `name` and `description`. `mskills validate` fails otherwise.
- After editing any skill, run `bun run skills sync` — it copies curated → vendored, validates and rebuilds the index. The vendored copy and the index are committed, so a sync that is not run leaves the repo inconsistent.
- `.agents/skills/` is the path agents read at runtime. Treat it as the stable contract; do not point agents at `configs/skills/skills/`.
- `.agents/skills.index.json` is generated. Never hand-edit it.
- A skill documents what an agent cannot infer: commands, conventions, gotchas. It is not a second README.
- Skills are monorepo-wide. There is no per-package skills directory and no per-package command.
- Vendored skills come from outside the repo: review the diff before committing, pin a ref or a pack you own, and never store secrets in one.

## Commands

| Command | Purpose |
| :--- | :--- |
| `bun run skills sync` | Curated → vendored, then validate + index |
| `bun run skills list` | What is installed |
| `bun run skills validate` | Check every `SKILL.md` frontmatter |
| `bun run skills index` | Rebuild `.agents/skills.index.json` |
| `bun run skills add <pkg>` | Install from skills.sh |
| `bun run skills update` | Update skills.sh installs |

`mskills <subcommand>` is the same CLI without the root script. `list` aliases `ls`, `add` aliases `a`, `update` aliases `upgrade`.

## Before marking a task done

- [ ] Skill edited in `configs/skills/skills/`, not in `.agents/skills/`
- [ ] `bun run skills sync` run; vendored copy and index committed
- [ ] `bun run skills validate` clean
