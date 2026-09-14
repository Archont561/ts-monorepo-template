# CONTEXT.md — @myorg/stale

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Opt-in (`confirm`, default `false`); enabled in this repo, so `.github/workflows/stale.yml` is generated.
- No step fragments exist for it — `stale.base.yml` is copied whole by the workflow aggregator.
- Aggregation is conditional on `configs/stale/package.json` existing; when the config is pruned, `docs:sync` deletes the workflow.

## Decisions as outcomes

- **Whole skeleton, no fragments** — nothing else has a stake in the sweep, so there is nothing to splice.

## Open

- The workflow has never run here; the schedule and label names are unverified against a live repository.

## Recent changes

| Commit | What |
| :--- | :--- |
| `05e8dc6` | root docs split; this config's docs reduced to the three-document set |
