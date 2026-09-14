# CONTEXT.md — @myorg/changeset

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- `configs/changeset/config.json` ignores 14 packages today: `bun-config`, `bunup`, `changeset`, `commitlint`, `example`, `gh-actions`, `internal`, `lefthook`, `native`(workspace), `playwright`, `skills`, `template`, `ts`, `turbo`, `unocss`.
- Only `@myorg/external` and `@myorg/native` are versioned and published.
- Release steps live in `configs/changeset/release.steps.yml`; CI runs version + publish on `main`.
- `.changeset/config.json` is generated at install time (`mchangeset init`) and is not committed as a source file.

## Decisions as outcomes

- **Release intent at PR time** — reviewers see the intended bump in the diff, and the release PR is mechanical.
- **Config packages are never published** — they are private by definition, so they stay out of the version graph entirely.

## Open

- The per-platform native npm packages (`npm/native-<platform>/`) are produced by `native.yml` as an artifact, but nothing publishes them yet — publish ordering is unwired.

## Recent changes

| Commit | What |
| :--- | :--- |
| `c8024de` | shared versions centralised; changeset config kept as the single source |
| `05e8dc6` | root docs split; release workflow described in `README.md` |
