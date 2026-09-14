# AGENTS.md — @myorg/dependabot

## Rules

- Never edit `.github/dependabot.yml` — it is generated. Change `configs/*/dependabot.yml` fragments and run `bun run docs:sync`.
- A new ecosystem (or a second manifest directory) gets its own `updates` block; one block per manifest directory.
- Major bumps are deliberately ignored — they require a human decision, so do not remove the `ignore: semver-major` rule to "fix" a stale PR.
- Auto-merge covers patch and minor only; anything that skips CI must not be auto-merged.
- Reviewers are set through `CODEOWNERS`, not through `dependabot.yml` (the `reviewers` key was removed upstream).

## Before marking a task done

- [ ] New manifest directory → matching `updates` block
- [ ] `bun run docs:sync` run and the generated file committed
- [ ] Auto-merge workflow still limited to patch/minor
