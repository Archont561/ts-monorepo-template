# @myorg/dependabot

Automated dependency updates across every ecosystem in the repo, with patch/minor updates auto-merged.

## What it provides

- `.github/dependabot.yml` — generated from `dependabot.base.yml` plus fragments collected from `configs/*/dependabot.yml`
- `.github/workflows/dependabot-auto-merge.yml` — approves and merges patch/minor bumps after checks pass
- Four ecosystems: `npm` (`bun.lock`), `cargo` (`Cargo.toml`), `github-actions` (workflows), `docker` (`apps/example/Dockerfile`)

### Per-ecosystem defaults

| Setting | Value |
| :--- | :--- |
| Schedule | Weekly, Monday 09:00 UTC |
| Open PR limit | 10 (5 for Docker) |
| Labels | `dependencies` + the ecosystem |
| Groups | Batch minor/patch; production vs dev tooling for npm |
| Ignores | `semver-major` — majors stay a manual decision |
| Commit message | `chore` prefix with scope |

> [!NOTE]
> `.github/dependabot.yml` is generated. Edit the fragments and run `bun run docs:sync`.

## Enabling it (one-time)

Settings → Code security and analysis → enable **Dependabot alerts**, **security updates** and **version updates**. The dependency graph turns on automatically.

## PR commands

`@dependabot rebase`, `@dependabot recreate`, `@dependabot merge`, `@dependabot squash and merge`, `@dependabot ignore this major version`.
