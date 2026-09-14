# AGENTS.md — @myorg/commitlint

## Rules

- Every commit subject is `<type>(<scope>): <lowercase subject>` — no period, imperative mood, under 100 characters.
- The scope must be a workspace package name (unscoped) or one of the cross-cutting scopes: `config`, `repo`, `deps`, `release`, `ci`.
- One concern per commit; do not bundle unrelated packages into a single message.
- Breaking changes use `feat!:` or a `BREAKING CHANGE:` footer — not a `major` keyword.
- Never bypass the `commit-msg` hook with `--no-verify` without saying why in the commit body.

## Before marking a task done

- [ ] Commit subjects parse (the hook will reject them otherwise)
- [ ] Scopes match real package names
- [ ] `bun run check` and `bun run test` pass before the commit is made
