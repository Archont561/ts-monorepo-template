# packages/native

The Rust side of the monorepo — a virtual Cargo workspace whose members are crates, each wrapped by an npm package.

```
packages/native/
├── Cargo.toml            # virtual workspace: resolver 3, members = crates/*
├── rust-toolchain.toml   # stable + rustfmt, clippy, wasm32-wasip1-threads
├── .cargo/config.toml    # build config (WASI linker)
├── .gitignore            # build output, generated loaders, per-platform packages
├── crates/
│   └── native/           # one crate per Rust unit — crate-type = ["cdylib"]
└── npm/
    └── native/           # one npm package per binding crate
```

The repo root has **no `Cargo.toml`**. Everything Rust lives here, which is what lets the native config be dropped by deleting one directory.

## How the pieces relate

| Piece | Owns |
| :--- | :--- |
| `crates/<name>/` | Rust source, `#[napi]` exports, `build.rs` |
| `npm/<name>/` | The npm manifest with the napi config, generated loader and types |
| `Cargo.toml` | Members, `edition`/`version`/`license`/`repository`, shared dependencies and lints |
| `npm/<name>-<platform>/` | **Generated in CI**, never committed |

## Commands

All of them go through `mnative`, which discovers crates and packages from disk:

```bash
mnative list              # crates → npm packages, targets per package
mnative add parser        # new binding crate + npm package
mnative add shared --pure # pure-Rust crate, no npm package
mnative matrix            # the CI matrix this workspace would build

mnative check             # cargo check --workspace
mnative clippy            # clippy --workspace --all-targets -- -D warnings
mnative fmt:check
mnative test
mnative napi:build        # build every package's addon
```

## Where to go next

- [configs/native](../../configs/native/README.md) — the config that scaffolds this layout, the CLI and the CI matrix
- [npm/native](npm/native/README.md) — the npm package built from the `native` crate
- [Cargo Book — workspaces](https://doc.rust-lang.org/cargo/reference/workspaces.html)
