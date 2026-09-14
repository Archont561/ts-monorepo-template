# @myorg/template

> The `bun create` scaffolder that turns this monorepo into a reusable template.

## What it provides

- `@myorg/template` — a first-class Bun workspace declared as `bun-create.preinstall` in the root `package.json`. On `bun create`, the committed bundle at `dist/index.js` scaffolds the project *before* `bun install`
- A **data-driven** engine: `discoverConfigs()` reads every `configs/*/package.json`'s `scaffold` metadata — no config package is hardcoded in the scaffolder
- `docs:sync` — runs `src/aggregate.ts` to regenerate `.github/workflows/*.yml` from the `configs/*` packages (`ci.steps.yml` and the gh-actions base skeletons). Root `README.md` and `AGENTS.md` are now static reference files with `TEMPLATE-ONLY` blocks for template vs monorepo descriptions

> [!IMPORTANT]
> This package is **removed** from generated projects (`selfDestruct: true`). Everything it references is stripped.

## Architecture

```mermaid
graph TD
    A[bun create<br/>Archont561/ts-monorepo-template] --> B[preinstall: dist/index.js]
    B --> C[OptionsCollector<br/>Clack prompts]
    C --> D[discoverConfigs<br/>scan configs/*/package.json]
    D --> E[MonorepoScaffolder<br/>pipeline]
    E --> F[replace @myorg scope]
    E --> G[strip TEMPLATE-ONLY]
    E --> H[prune disabled configs]
    E --> I[regenerateCI<br/>workflows]
    E --> J[setupGitHooks<br/>git init]
    J --> K[bun install<br/>prepare: msetup]

    style B fill:#0969DA,color:#fff
    style E fill:#f6f8fa,stroke:#0969DA
```

## Workflow placeholders

`regenerateCI` splices step fragments into a skeleton, then interpolates values
that have a single source of truth in TypeScript (`src/vars.ts`):

| Placeholder | Value |
| :--- | :--- |
| `{{STEPS}}` / `{{UPDATES}}` | concatenated `configs/*/<fragment>` files |
| `{{BUN_VERSION}}` | Bun version installed by the workflow |
| `{{NATIVE_DIR}}` | `packages/native` |
| `{{NATIVE_CARGO}}` | `packages/native/Cargo.toml` |
| `{{NATIVE_MANIFEST}}` | `packages/native/package.json` |
| `{{APP_DIR}}` | `apps/example` |
| `{{APP_DOCKERFILE}}` | `apps/example/Dockerfile` |

Fragments are plain YAML, so this is how `hashFiles('…')` guards and
`directory:` entries stay in sync with the packages they point at. GitHub's own
`${{ … }}` expressions are untouched.

## Scaffold Metadata (Data-Driven)

> [!TIP]
> The scaffolder is **fully data-driven** — no config is hardcoded. Each `configs/*/package.json` declares `scaffold` metadata.

```json
{
  "scaffold": {
    "default": "always | true | false | \"none\"",
    "flag": "playwright",
    "prompt": "Include E2E testing?",
    "type": "confirm | select",
    "options": [{ "value": "none", "label": "None" }],
    "removals": {
      "false": {
        "extraRemovals": ["apps/example/e2e"],
        "filePatternsToRemove": ["**/e2e/**", "**/*.e2e.ts"],
        "fileRegexesToRemove": ["playwright", ".*\\.spec\\.e2e\\..*"],
        "scriptsToRemove": ["test:e2e"],
        "turboTasksToRemove": ["test:e2e"],
        "appDepsToRemove": ["@myorg/playwright"]
      }
    },
    "selfDestruct": true
  }
}
```

### Removal fields

| Field | Type | Description |
| :--- | :--- | :--- |
| `extraRemovals` | `string[]` | Exact paths (`rm -rf`) |
| `filePatternsToRemove` | `string[]` | Glob patterns via `Bun.Glob` (e.g. `**/e2e/**`) |
| `fileRegexesToRemove` | `string[]` | Regex against relative paths (e.g. `playwright`) |
| `scriptsToRemove` | `string[]` | Root `package.json` scripts |
| `turboTasksToRemove` | `string[]` | `turbo.base.json` tasks |
| `appDepsToRemove` | `string[]` | `apps/example/package.json` devDeps |

> [!NOTE]
> `filePatternsToRemove` uses `Bun.Glob` with `dot:true`, skips `node_modules/.git/dist/.turbo`. `fileRegexesToRemove` compiles to `RegExp` and scans all files via `find`.

## Source map

| File | Role |
| :--- | :--- |
| `src/index.ts` | CLI entry (bundled) |
| `src/collector.ts` | `OptionsCollector` — Clack prompts + repo-root discovery |
| `src/scaffolder.ts` | `MonorepoScaffolder` — pipeline + glob/regex removal |
| `src/configs.ts` | `discoverConfigs` / `ScaffoldMeta` types |
| `src/harness.ts` | `TemplateHarness` — full-pipeline integration helper (`BUN_CREATE_DIR`) |
| `src/aggregate.ts` | `docs:sync` — aggregates CI workflows from `configs/*` |
| `src/docs.ts` | `mdocs` bin — single bin for this package (`docs:sync` + `site`) |

## Development

```bash
bun run --filter @myorg/template test     # unit + integration + cases (all combos)
bun run test:template                     # same via root script
bun run test:template:cases               # only combination cases (cases.test.ts)
bun run --filter @myorg/template build    # rebuild the committed dist bundle
bun run docs:sync                          # regenerate workflows (mdocs)
bun run docs:site                          # build the docs artifact (mdocs site)
bun run ci:lint                            # after regenerating workflows
```

<details>
<summary>Build & test</summary>

- Build: `mbun build ./src/index.ts --outdir ./dist --target bun --packages bundle --minify`
- Produces committed `dist/index.js` bundle
- Regenerate with `bun run --filter @myorg/template build` whenever sources change
- Tests: unit suites per source file + full-pipeline integration in `tests/index.test.ts`
- Uses only Bun-native APIs (`Bun.file`, `Bun.write`, `Bun.$`) — no external runtime deps (bundled)

</details>

## Template Development Only

> [!CAUTION]
> This package is **removed** from generated projects (its scaffold metadata declares `selfDestruct: true`). Everything it references is stripped by the scaffolder (`TEMPLATE-ONLY` blocks, the `docs:sync` script, the `configs/template` workspace). Root `prepare` in generated projects uses `msetup` + `mchangeset init` directly.

- [ ] `bun run --filter @myorg/template build` after editing sources
- [ ] `bun run docs:sync` after editing workflow skeletons
- [ ] `bun run ci:lint` after regenerating workflows

See [AGENT.md](./AGENT.md) for the agent-facing reference.
