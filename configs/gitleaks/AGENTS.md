# AGENTS.md — @myorg/gitleaks

## Rules

- Never commit secrets, tokens or credentials — the pre-commit hook and CI both look for them.
- Keep `mgitleaks` non-fatal when the binary is absent. A developer without gitleaks can still commit; CI is the enforcement point.
- Reviewed false positives go in `.gitleaksignore` with a reason — never by weakening the rules globally.
- Do not add a custom `gitleaks.toml` unless a rule genuinely misfires; the default ruleset is the point.

## Before marking a task done

- [ ] No credentials, API keys or tokens in the diff
- [ ] `.env` files are not committed (`.env.example` is the template)
- [ ] `bun run security:gitleaks` clean when the binary is installed
