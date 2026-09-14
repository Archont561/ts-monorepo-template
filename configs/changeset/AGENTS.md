# AGENTS.md — @myorg/changeset

## Rules

- Never edit a `version` field by hand. Add a changeset instead.
- Every change to a **published** package needs a changeset in the same PR — `@myorg/external`, `@myorg/native`.
- Private packages and config packages are in `config.json`'s `ignore` list; do not add changesets for them.
- A new private package belongs in that `ignore` list, otherwise Changesets will try to version it.
- Do not commit `.changeset/*.md` files that are already consumed — the version bump deletes them.
- Use `feat!:` or a `BREAKING CHANGE:` footer for breaking changes so the bump is major.

## Before marking a task done

- [ ] Published-package change → `bun run changeset` with the right bump type
- [ ] New private package → added to `ignore` in `configs/changeset/config.json`
- [ ] `bun run version` is left to CI, not run locally
