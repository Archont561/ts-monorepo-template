# @myorg/ts

> Shared TypeScript configuration for the monorepo.

## What it provides

- `typescript` and `@types/bun` as a single, shared devDependency (the only
  place in the repo that declares them).
- Three `tsconfig` presets, all extending `base.json`:

| Preset | Intent |
| ------ | ------ |
| `base.json` | Strict, modern defaults (ES2022, `moduleResolution: "Bundler"`, `strict`, `verbatimModuleSyntax`, `noUncheckedIndexedAccess`) |
| `library.json` | `base` + declaration files and source maps (library packages) |
| `app.json` | `base` + `noEmit` and `"types": ["bun"]` (apps, run directly by Bun) |

## Usage

Add the workspace dependency and extend the preset from any package:

```bash
bun add -d @myorg/ts --filter @myorg/<package>  # workspace:* protocol
```

```jsonc
// packages/<name>/tsconfig.json
{
  "extends": "@myorg/ts/library.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "./dist",
    "types": ["bun"],
    "paths": { "@src/*": ["./src/*"], "@tests/*": ["./tests/*"] }
  }
}
```

## Files

- `base.json`, `library.json`, `app.json`

## Rules

- Path aliases are per-package — never add them to the shared presets.
- Never use `baseUrl` (removed in TypeScript 7.0, TS5102).

See [AGENT.md](./AGENT.md) for the agent-facing reference.