## CI Workflow Validation

- The workflows in `.github/workflows/` are **generated** by `bun run docs:sync`
  — never hand edited. The skeletons
  `configs/gh-actions/ci.base.yml` and `release.base.yml` hold the workflow
  structure plus the shared bootstrap steps (for CI: checkout, setup-bun,
  `bun install --frozen-lockfile`); their `{{STEPS}}` placeholder is filled from
  the surviving configs' `ci.steps.yml` fragments (in sorted config-directory
  order) and, for releases, `configs/changeset/release.steps.yml`.
- To add CI steps for a tool, create a `ci.steps.yml` fragment in that config
  package's directory — it is picked up automatically. Then run
  `bun run docs:sync` and `bun run ci:lint`.
- `mactionlint` (from `@myorg/gh-actions`, `configs/gh-actions`) bakes in
  `-config-file=<configs/gh-actions/actionlint.yaml>`; there is no root config file.
- Local CI with `act` via `mact` (flags baked in, no `.actrc`): `bun run ci:list`,
  `bun run ci:dry` (`-n`, shows the plan), `bun run ci:local` (runs in Docker;
  requires `act` + Docker).
- To simulate other events: `act pull_request -n`, `act -W .github/workflows/release.yml -n`,
  `act -j actionlint -n`.
- Secrets are absent locally: pass them per-run (`act push -s NPM_TOKEN`) or via an
  untracked `.secrets` file.
- The release workflow guards every step with `if: ${{ !env.ACT }}` (step-level `if`
  only — job-level cannot access the `env` context, and actionlint enforces this) so
  local `act` runs never publish to npm.
- Local simulation ≠ GitHub: no OIDC, no environments, limited `GITHUB_TOKEN`. The
  real CI run is authoritative.
- Run `bun run ci:lint` after regenerating a workflow.