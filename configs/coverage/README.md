# @myorg/coverage

Coverage collection, merging, reporting and the CI gate — one CLI behind all of it.

## What it provides

`mcoverage` owns every coverage step; the workflow fragments are one-liners that call it.

| Subcommand | What it does |
| :--- | :--- |
| `setup` | Installs `lcov`/`genhtml` if missing (apt-get on Linux, brew on macOS) |
| `collect` | Runs JS coverage (`bun run coverage`) and, when a Cargo workspace exists, Rust coverage (`mnative llvm-cov`), then merges |
| `merge` | Merges per-package LCOV files into `coverage/lcov.info`, rebasing `SF:` paths to the repo root so Codecov and genhtml resolve sources |
| `html` | Renders the HTML report with `genhtml` |
| `check` | Fails CI below the threshold — parses `LF:`/`LH:` itself, no `lcov` binary needed |
| `summary` | Prints the line/function totals (`--json` for scripts/docs, `--markdown` for `$GITHUB_STEP_SUMMARY`) |
| `sync` | Regenerates the root `codecov.yml` from the workspace package list |
| `pages` | Puts the rendered report into the Pages artifact so it is served at `/coverage/` |

### Flow

```mermaid
graph TD
    A[bun run coverage<br/>mturbo coverage] --> B[per-package coverage/lcov.info]
    B --> C[mcoverage merge<br/>root coverage/lcov.info<br/>SF: rebased to root]
    C --> D[mcoverage html → coverage/html/]
    D --> E[upload-artifact coverage-report 14d]
    C --> F[mcoverage check<br/>threshold 80%]
    C --> G[PR comment]
    C --> I[codecov-action@v5<br/>single merged upload]
    I --> J[codecov.yml components<br/>per-package statuses]
    D --> H[Pages /coverage/ or standalone coverage.yml]

    style C fill:#0969DA,color:#fff
```

## Usage

```bash
bun run coverage        # per-package reports, then merge → coverage/lcov.info
bun run coverage:html   # coverage/html/
bun run coverage:check  # CI gate (80%)
bun run coverage:report # coverage + HTML in one shot
bun run coverage:summary
```

## Codecov

The repo-root `codecov.yml` is **generated** by `mcoverage sync` — never hand-edit it. It refreshes on every `bun install` (the `prepare` script) and on `bun run docs:sync`, so its component list always matches the packages that actually exist (scaffolding prunes packages; users add them). The scaffolder deletes it outright — its components describe the template's package set — and the first `bun install` regenerates it for the scaffold's.

CI uploads **one merged report** (`coverage/lcov.info`, no flags). Per-package status checks come from the `component_management` section of the generated file — components are defined entirely in `codecov.yml` and need no upload-time tagging, which is what keeps the workflows free of per-package upload steps that would drift whenever the workspace changes. `flag_management` (`carryforward: true`) stays configured, so per-package flagged uploads can be added later without touching the file.

Store the upload token as the `CODECOV_TOKEN` secret; the merged upload runs with `fail_ci_if_error: true` — it is the gate, alongside `mcoverage check`.

## Where the report is published

| Repo | Publisher | URL |
| :--- | :--- | :--- |
| With Pages enabled | `mcoverage pages` + `mpages build` | `/coverage/` on the Pages site |
| Without Pages | standalone `coverage.yml` workflow | its own Pages site |
| This template repo | `mdocs site` | `/coverage/` on the docs site (`apps/template-docs/dist/coverage`) |

> [!NOTE]
> Exactly one workflow may deploy to Pages. In the template repo that is `template-docs.yml`, so `docs:sync` skips `pages.yml` and `coverage.yml` while the docs app exists.
