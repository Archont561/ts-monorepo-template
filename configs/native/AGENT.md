## Native (NAPI-RS)

> Opt-in — select prompt `none` / `publish` / `docker` during scaffolding. Data-driven via `package.json` `scaffold` metadata.

- `configs/native` (`@myorg/native`) provides scaffold prompt for Rust + NAPI-RS bindings, `@napi-rs/cli` as shared devDep
- `setup: configs/native/src/setup.ts` scaffolds `packages/native/` when enabled (publish/docker)
- When `none` selected, `configs/native` + `packages/native/` + `*.node` + `rust-toolchain.toml` are pruned via `filePatternsToRemove` + `fileRegexesToRemove` (glob + regex)
- When enabled, adds `packages/native/` with Rust crate (`Cargo.toml`, `src/lib.rs` #[napi], `build.rs`, `package.json` napi config)
- External wrapper `packages/external/src/native.ts` provides JS fallback + dynamic import `@myorg/native`
- Build: `bun run build:native` → `napi build --release --platform`, `build:wasm` → `wasm32-wasip1-threads`
- WASM fallback portable but Bun caveat napi-rs#2965
- Publish: `create-npm-dirs` → CI matrix per target → `artifacts` → `pre-publish` → npm publish (scope required)

| Option | Result |
| :--- | :--- |
| `none` | No native dir, config removed (default) |
| `publish` | Native package + prebuilds + setup.ts scaffold |
| `docker` | Native + Docker cross-compilation |

```mermaid
graph TD
    A[bun create] --> B{native?}
    B -->|none| C[prune native<br/>glob+regex]
    B -->|publish| D[setup.ts → packages/native/<br/>Cargo + lib.rs + napi config]
    B -->|docker| E[setup + Docker]
    D --> F[napi build<br/>*.node + index.js loader]
    F --> G[@myorg/external/native.ts<br/>fallback]
    style B fill:#0969DA,color:#fff
    style F fill:#dea584,color:#000
```

> [!WARNING]
> Native bindings require Rust toolchain + `@napi-rs/cli`. Never call `.node` from browser.

> [!IMPORTANT]
> Scaffold metadata includes `setup` field — `scaffolder.ts` runs it only when enabled. Disabled via `filePatternsToRemove`/`fileRegexesToRemove` uses `Bun.Glob` + RegExp.

See [README.md](./README.md) and [PLAN.md](./PLAN.md) for full integration plan.
