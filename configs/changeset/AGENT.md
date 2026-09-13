## Changeset

> [!NOTE]
> Versioning via Changesets — not manual bumps.

- `mchangeset` (from `@myorg/changeset`) wraps `changeset` with config path `configs/changeset/config.json`
- Config ignores `internal`, `example`, `configs/*` — only `external` is versioned/published
- `mchangeset init` (run by root `prepare`) ensures `.changeset/config.json` exists from template
- Run `bun run changeset` to create a changeset, `mchangeset version` to bump, `mchangeset publish` to publish
- Each subpath export is a separate entry in `dist/` — minor bump for new subpaths

| Command | Description |
| :--- | :--- |
| `bun run changeset` | Create `.changeset/*.md` |
| `mchangeset version` | Apply changesets |
| `mchangeset publish` | Publish |

```mermaid
graph LR
    A[code change] --> B[changeset]
    B --> C[.changeset/*.md]
    C --> D[version]
    D --> E[publish]

    style B fill:#0969DA,color:#fff
```

> [!TIP]
> Add `internal-<name>` packages to `.changeset/config.json` `ignore` list.
