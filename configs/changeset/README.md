# @myorg/changeset

> Changesets versioning + releases, configured.

## What it provides

- `@changesets/cli` as a shared devDependency (exposed via `changeset`,
  `changeset version`, `changeset publish`).
- `config.json` — the shared Changesets config (public access, `main` base
  branch, every non-published package in `ignore`).
- `minit` — copies `config.json` to `.changeset/config.json` when missing and
  never overwrites it afterwards, so developers can customize.

## Lifecycle

The root `prepare` script invokes `bun configs/changeset/init.ts changeset`
on every `bun install`, ensuring `.changeset/config.json` exists.

## Usage

```bash
bun run changeset    # create a changeset for a published-package change
bun run version      # apply versions + changelogs
bun run release      # publish to npm
```

Only `@myorg/external` is published; everything else stays in `ignore`.

See [AGENT.md](./AGENT.md) for the agent-facing reference.