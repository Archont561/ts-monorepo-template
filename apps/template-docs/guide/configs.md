# Config matrix

Every tool lives in `configs/*` and exposes exactly one `m`-prefixed command.
The root `package.json` ships zero devDependencies of its own — the tooling
arrives as workspaces and the bins are linked into `node_modules/.bin` on
install.

## Always on

| Config | Bin |
| :--- | :--- |
| `configs/biome` | `mbiome` |
| `configs/bun-config` | `mbun` |
| `configs/bunup` | `mbunup` |
| `configs/changeset` | `mchangeset` |
| `configs/citty` | `mcitty` |
| `configs/coverage` | `mcoverage` |
| `configs/gh-actions` | `mci` |
| `configs/gitleaks` | `mgitleaks` |
| `configs/ts` | `mtsc` |
| `configs/turbo` | `mturbo` |
| `configs/badges` | `mbadges` |
| `configs/community` | — |

## Opt-in

| Config | Default | Bin |
| :--- | :--- | :--- |
| `configs/playwright` | `true` | `me2e` |
| `configs/codeql` | `true` | `mcodeql` |
| `configs/skills` | `false` | `mskills` |
| `configs/devcontainer` | `false` | — |
| `configs/pages` | `false` | `mpages` |
| `configs/trivy` | `false` | `mtrivy` |
| `configs/stale` | `false` | — |
| `configs/native` | `none` | `mnative` |

## How a config opts in

Each config declares `scaffold` metadata in its `package.json`:

```json
{
  "scaffold": {
    "default": false,
    "flag": "trivy",
    "prompt": "Include Trivy vulnerability scanning?",
    "removals": {
      "false": {
        "scriptsToRemove": ["security:trivy"],
        "extraRemovals": ["configs/trivy"]
      }
    }
  }
}
```

::: tip
The scaffolder discovers configs by scanning `configs/*` — there is no central
registry to update when you add one.
:::
