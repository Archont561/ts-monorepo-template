# Support

## Getting Help

### Documentation

- **README.md** — Quick start, architecture, project structure, commands
- **AGENTS.md** — Agent-facing docs, CLI aliases (m-bins), dev commands, package architecture
- **CONTRIBUTING.md** — Development workflow, recovery from broken install
- **configs/*/README.md** — Tool-specific docs (Biome, Bun, Changeset, etc.)
- **configs/*/AGENT.md** — Agent-specific references

### Commands

```bash
bun install          # Install deps + link m-bins + git hooks
bun run dev          # Watch mode (Turbo)
bun run build        # Build all packages
bun run test         # Unit tests
bun run coverage     # Coverage (LCOV at coverage/lcov.info)
bun run check        # Biome lint + format check
bun run check:fix    # Auto-fix
bun run typecheck    # Type-check
bun run docs:sync    # Regenerate workflows from configs/* (mdocs)
```

### Common Issues

| Issue | Solution |
| ----- | -------- |
| `bun install` no top-level symlinks | `bun run reinstall` (clean all node_modules + reinstall) — see CONTRIBUTING.md |
| `cargo` not found | Install Rust via https://rustup.rs, then `mnative check` |
| `napi` build fails | `mnative check` then `bun run build:native` |
| Lefthook hooks not running | `msetup lefthook` or `bun install` (prepare runs it) |
| Workflows out of sync | `bun run docs:sync` (mdocs) |
| Coverage missing | `bun run coverage`, then `mcoverage html` |

### Reporting Bugs

Use the **Bug report** issue template:

- `.github/ISSUE_TEMPLATE/bug_report.yml`
- Include reproduction steps, environment (`bun --version`, OS), logs.

### Feature Requests

Use the **Feature request** template:

- `.github/ISSUE_TEMPLATE/feature_request.yml`
- Describe problem, proposed solution, area (tooling, CI, packages, etc.)

### Security Vulnerabilities

**Do not open a public issue.** See [SECURITY.md](./SECURITY.md) for private reporting.

### Community

- **Discussions**: Use GitHub Discussions if enabled (Settings → General → Features → Discussions)
- **CODEOWNERS**: `.github/CODEOWNERS` auto-assigns reviewers by path
- **PR Template**: `.github/PULL_REQUEST_TEMPLATE.md` checklist for PRs

### Commercial / Sponsorship

See `.github/FUNDING.yml` for sponsorship links (customize after scaffolding).

## Versioning

This template uses [Changesets](https://github.com/changesets/changesets) for versioning:

- `bun run changeset` — create a changeset file describing your change
- `bun run version` — bump versions, update CHANGELOG
- `bun run release` — publish to npm

See `configs/changeset/README.md`.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development workflow and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for community standards.
