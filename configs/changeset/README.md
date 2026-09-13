# @myorg/changeset

> Changesets versioning + releases, configured.

## What it provides

- `@changesets/cli` as a shared devDependency, exposed via single bin `mchangeset`:
  - `mchangeset init` — copies `config.json` to `.changeset/config.json` when missing
    and never overwrites it afterwards, so developers can customize.
  - `mchangeset <args>` — delegates to `changeset` (e.g. `add`, `version`, `publish`).
- `config.json` — the shared Changesets config (public access, `main` base
  branch, every non-published package in `ignore`).

## Lifecycle

The root `prepare` script invokes `mchangeset init` on every `bun install`,
ensuring `.changeset/config.json` exists.

## Usage

```bash
bun run changeset    # mchangeset — create a changeset for a published-package change
bun run version      # mchangeset version — apply versions + changelogs
bun run release      # mchangeset publish — publish to npm
```

Only `@myorg/external` is published; everything else stays in `ignore`.

See [AGENT.md](./AGENT.md) for the agent-facing reference.