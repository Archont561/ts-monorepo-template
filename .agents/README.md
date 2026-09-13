# .agents

> AI agent skills and runtime data — vendored via [skills.sh](https://skills.sh) + curated skills.

## Structure

```
.agents/
  skills/              # Vendored skills (committed) — source of truth for agent runtime
    biome/SKILL.md
    bun/SKILL.md
    ...
  skills.index.json    # Generated index (committed) — fast lookup for agent loader
  README.md            # This file
```

## Skills Management (skills.sh)

We use the [skills.sh](https://skills.sh) ecosystem to vendor "skills" (procedural knowledge) into this repo.

### Commands

| Command | Description |
| :--- | :--- |
| `bun run skills:add <pkg>` | Add via skills.sh (e.g. `vercel-labs/agent-skills`) |
| `bun run skills:update` | Update all via skills.sh |
| `bun run skills:sync` | Sync curated → vendored + validate + index |
| `bun run skills:list` | List installed skills |
| `bun run skills:validate` | Validate frontmatter (`name`, `description`) |
| `bun run skills:index` | Build `skills.index.json` |

> [!TIP]
> Skills live in `.agents/skills/<name>/SKILL.md` — each requires YAML frontmatter with `name` and `description`.

### Adding skills via skills.sh

```bash
# Add from GitHub
bun run skills:add vercel-labs/agent-skills

# Add from pack
bun run skills:add https://skills.sh/p/<pack-id>

# Direct via CLI
npx skills add vercel-labs/agent-skills -p --agent * -y
```

### Updating

```bash
bun run skills:update
# or
npx skills update -p -y
```

### Curated vs Vendored

- **Curated**: `configs/skills/skills/<name>/SKILL.md` — committed, template source of truth, synced via `mskills sync`
- **Vendored**: `.agents/skills/<name>/SKILL.md` — committed for reproducibility, may include skills.sh installs
- **Index**: `.agents/skills.index.json` — generated, lists all valid skills with metadata

> [!IMPORTANT]
> Treat `.agents/skills/` as source of truth for agent runtime. Commit it so CI/devs get identical behavior.

## Security + Hygiene

> [!CAUTION]
> skills.sh cannot guarantee quality/security of every skill. Review before installing.

- **Pin/curate**: Prefer fixed GitHub ref (tag/commit) or pack you own
- **Review diffs**: Skill changes show up in PRs since `.agents/skills/` is committed
- **No secrets**: Packs are unlisted, not access-controlled — never include secrets/credentials
- **Validate**: Run `bun run skills:validate` to check frontmatter

## Loader (Bun-friendly)

Minimum viable loader for agent runtime:

```typescript
import { file } from "bun";

const index = await file(".agents/skills.index.json").json();
for (const skill of index) {
  const content = await file(skill.path).text();
  // Parse frontmatter, feed markdown body into system instructions
}
```

Or find all `SKILL.md`:

```typescript
import { Glob } from "bun";

const glob = new Glob(".agents/skills/**/SKILL.md");
for await (const path of glob.scan({ cwd: process.cwd() })) {
  // Load skill
}
```

## References

- [skills.sh Docs](https://skills.sh)
- [skills CLI](https://www.npmjs.com/package/skills)
- [Curated Skills README](../configs/skills/README.md)
- [Skills AGENT](../configs/skills/AGENT.md)
