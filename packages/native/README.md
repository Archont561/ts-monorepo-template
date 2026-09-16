# packages/native

The Rust side of the monorepo — a virtual Cargo workspace whose members are crates: **pure Rust crates** that hold the logic, and **binding crates** that expose it to JS via napi-rs, each wrapped by an npm package.

The Cargo workspace lives at the **repo root**; the npm packages stay here. The `m native` CLI discovers both from disk.

```
<repo root>/
├── Cargo.toml            # virtual workspace: resolver 3, members = crates/*
├── Cargo.lock            # committed — reproducible native builds
├── rust-toolchain.toml   # stable + rustfmt, clippy, wasm32-wasip1-threads
├── .cargo/config.toml    # build config (WASI linker)
└── crates/
    ├── package.json      # @myorg/native-crates — the bridge node (see below)
    ├── turbo.json        # its Turbo tasks
    ├── native/           # binding crate — crate-type = ["cdylib"], thin #[napi] wrappers
    └── shared/           # pure Rust crate — the logic, no napi, plain `cargo test`

packages/native/
├── .gitignore            # generated loaders, per-platform packages
└── npm/
    └── native/           # one npm package per binding crate
```

## How the pieces relate

| Piece | Owns |
| :--- | :--- |
| `crates/<name>/` (pure) | Rust logic — testable with plain `cargo test`, no Node runtime |
| `crates/<name>/` (binding) | Thin `#[napi]` wrappers that delegate to the pure crates |
| `npm/<name>/` (under `packages/native`) | The npm manifest with the napi config, generated loader and types |
| `Cargo.toml` (root) | Members, `edition`/`version`/`license`/`repository`, shared dependencies (incl. `shared = { path = … }`), lints and `[profile.release]` |
| `crates/package.json` | The **bridge node** — the single Turbo package that stands for every pure crate |
| `npm/<name>-<platform>/` | **Generated in CI**, never committed |

## The Turbo graph

Binding packages depend on the bridge package (`@myorg/native-crates: workspace:*`)
whenever their crate has a Cargo path dependency on a pure crate. That mirrors the
Cargo graph into the npm graph, so Turbo orders pure Rust work (`build`, `test`,
`cargo:check`, `cargo:clippy`) before the napi builds that compile it in:

```
@myorg/native ──workspace:*──▶ @myorg/native-crates ──▶ (every pure crate)
        │ napi build                    │ mnative build/test --pure
        ▼                               ▼
   *.node, index.js, index.d.ts    cargo target/ (uncached)
```

- **napi builds are Turbo-cached**: outputs are the stable `*.node` / `index.js` /
  `index.d.ts`, and the `inputs` glob the whole `crates/` tree plus the workspace
  manifests — a Rust change always invalidates the cache.
- **The bridge node is never cached**: cargo owns `target/` and its incremental
  state, and the toolchain participates in cargo's own caching. Its `inputs`
  exist so hash reports reflect Rust changes.

`mnative sync` re-syncs this wiring (bridge node files, the `workspace:*` edges,
the root `workspaces` entry) after Cargo dependencies are hand-edited.

## Commands

All of them go through `mnative`, which discovers crates and packages from disk
and runs cargo against the workspace at the repo root:

```bash
mnative list              # crates → npm packages, targets per package
mnative add parser        # new binding crate + npm package
mnative add core --pure   # pure-Rust crate, no npm package
mnative sync              # re-sync bridge node + Cargo→npm edges

mnative check             # cargo check --workspace
mnative check --pure      # only the pure crates (what the bridge node runs)
mnative clippy            # clippy --workspace --all-targets -- -D warnings
mnative fmt:check
mnative test              # cargo test --workspace
mnative napi:build        # build every package's addon
```

## Where to go next

- [packages/tooling](../tooling/README.md) — the CLI and the CI matrix that drive this layout
- [npm/native](npm/native/README.md) — the npm package built from the `native` crate
- [Cargo Book — workspaces](https://doc.rust-lang.org/cargo/reference/workspaces.html)
