# Configs

Every tool in this monorepo is configured here. One directory per tool, one `m`-prefixed command per tool, and **no configuration files at the repo root** — `turbo.json`, `biome.json`, `bunfig.toml`, `commitlint.config.js` and the rest all live in `configs/<name>/` and are reached through their CLI.

Keeping them here means a tool can be dropped by deleting one directory: the scaffolder prunes the package, its scripts, its turbo tasks and its CI steps from metadata alone.

## The packages

| Package | Command | Scaffold default | Flag |
| :--- | :--- | :--- | :--- |
| [badges](badges/README.md) | `mbadges` | always | `badges` |
| [biome](biome/README.md) | `mbiome` | always | `biome` |
| [bun-config](bun-config/README.md) | `mbun` | always | `bun-config` |
| [bunup](bunup/README.md) | `mbunup` | always | `bunup` |
| [changeset](changeset/README.md) | `mchangeset` | always | `changeset` |
| [citty](citty/README.md) | `mcitty` | always | `citty` |
| [codeql](codeql/README.md) | `mcodeql` | true | `codeql` |
| [commitlint](commitlint/README.md) | — | always | `commitlint` |
| [community](community/README.md) | — | always | `community` |
| [coverage](coverage/README.md) | `mcoverage` | always | `coverage` |
| [dependabot](dependabot/README.md) | — | always | `dependabot` |
| [devcontainer](devcontainer/README.md) | — | false | `devcontainer` |
| [editorconfig](editorconfig/README.md) | — | always | `editorconfig` |
| [gh-actions](gh-actions/README.md) | `mci` | always | `gh-actions` |
| [gitattributes](gitattributes/README.md) | — | always | `gitattributes` |
| [gitleaks](gitleaks/README.md) | `mgitleaks` | always | `gitleaks` |
| [lefthook](lefthook/README.md) | `msetup` | always | `lefthook` |
| [native-config](native/README.md) | `mnative` | none | `native` |
| [pages](pages/README.md) | `mpages` | false | `pages` |
| [playwright](playwright/README.md) | `me2e` | true | `playwright` |
| [skills](skills/README.md) | `mskills` | false | `skills` |
| [stale](stale/README.md) | — | false | `stale` |
| [template](template/README.md) | `mdocs` | always | — |
| [trivy](trivy/README.md) | `mtrivy` | false | `trivy` |
| [ts](ts/README.md) | `mtsc` | always | `ts` |
| [turbo](turbo/README.md) | `mturbo` | always | `turbo` |
| [unocss](unocss/README.md) | `munocss` | false | `unocss` |

`always` means every generated project gets it; `true`/`false`/`none` are the defaults for the opt-in prompts, overridable with the flag at scaffold time.

## How a config is built

```
configs/<name>/
├── package.json     # name, bin, exports, and the `scaffold` metadata
├── README.md        # what it is, how to use it
├── AGENTS.md        # the rules that hold in this area
├── CONTEXT.md       # what is true here right now
├── src/cli.ts       # the `m…` command (citty)
├── <tool>.config.*  # the tool's own config, referenced by CLI flag
└── *.steps.yml      # optional CI fragment, spliced into a generated workflow
```

Adding a config takes four steps:

1. Create `configs/<name>/` as a workspace with a `package.json` exposing one `m…` bin.
2. Put the tool's config file inside that directory and reference it by flag — never from the root.
3. Add `README.md`, `AGENTS.md` and `CONTEXT.md`.
4. If it needs CI, contribute a `*.steps.yml` fragment and run `bun run docs:sync`.

> [!IMPORTANT]
> Every config that touches CI declares its own `removals` in `scaffold` metadata, so pruning it leaves nothing behind.
