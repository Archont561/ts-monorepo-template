/**
 * Shared constants for the native (Rust + napi-rs) workspace.
 *
 * Layout: the Cargo workspace lives at the repo root, with a crate per Rust
 * unit and an npm package per napi binding under `packages/native/npm`.
 * Per-platform packages are build artifacts — `napi create-npm-dirs` generates
 * them in CI, so they are never committed.
 *
 * ```
 * Cargo.toml            virtual workspace (no [package]) — members: crates/*
 * crates/native/        cdylib binding
 * crates/shared/        pure Rust
 * packages/native/
 * └── npm/native/       @scope/native
 *     npm/native-darwin-arm64/            generated in CI
 * ```
 */

/** Scope used when nothing else (flag, manifest, env) provides one. */
export const DEFAULT_NATIVE_SCOPE = "@myorg";

/** Workspace-relative path of the npm packages (the `packages/native` subtree). */
export const NATIVE_DIR = "packages/native";

/** Directory holding the crates, relative to the repo root (= the Cargo workspace root). */
export const NATIVE_CRATES_DIR = "crates";

/** Directory holding the npm packages, relative to `NATIVE_DIR`. */
export const NATIVE_NPM_DIR = "npm";

/** Root `package.json` workspace glob that links the npm packages. */
export const NATIVE_WORKSPACE_GLOB = `${NATIVE_DIR}/${NATIVE_NPM_DIR}/*`;

/** Crate and npm-package names are kept identical so either can be found. */
export const nativeCrateDir = (name: string): string => `${NATIVE_CRATES_DIR}/${name}`;

export const nativePackageDir = (name: string): string => `${NATIVE_DIR}/${NATIVE_NPM_DIR}/${name}`;

/** WASI target — the only target that is not a native binary. */
export const NATIVE_WASM_TARGET = "wasm32-wasip1-threads";

/**
 * A build target plus everything CI needs to build it.
 *
 * `container` uses the napi-rs images so glibc/musl sysroots are correct;
 * `cross` builds a foreign Linux target from a Linux host (napi's bundled
 * cross toolchain); `wasi` needs the WASI SDK on disk.
 */
export type NativeTargetSpec = {
  /** Rust target triple. */
  target: string;
  /** GitHub Actions runner. */
  runner: string;
  /** napi-rs docker image used as the job container. */
  container?: string;
  /** Build with `--use-napi-cross` from a Linux host. */
  cross?: boolean;
  /** Install the WASI SDK before building. */
  wasi?: boolean;
};

export const NATIVE_TARGETS: readonly NativeTargetSpec[] = [
  { target: "aarch64-apple-darwin", runner: "macos-latest" },
  { target: "x86_64-apple-darwin", runner: "macos-13" },
  { target: "x86_64-pc-windows-msvc", runner: "windows-latest" },
  {
    target: "x86_64-unknown-linux-gnu",
    runner: "ubuntu-latest",
    container: "ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-debian",
  },
  {
    target: "aarch64-unknown-linux-gnu",
    runner: "ubuntu-latest",
    container: "ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-debian-aarch64",
  },
  {
    // NOT the `lts-alpine` image, even though the target is musl. Bun — which
    // drives every step of this job — publishes glibc builds only, so its binary
    // cannot exec on Alpine at all (`spawn ... ENOENT`: the ELF interpreter is
    // missing). The Debian image runs Bun, and `musl-tools` supplies the
    // `musl-gcc` linker napi's plain `cargo build --target` needs; the workflow
    // installs it and points cargo at it via CARGO_TARGET_*_LINKER.
    target: "x86_64-unknown-linux-musl",
    runner: "ubuntu-latest",
    container: "ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-debian",
  },
  { target: NATIVE_WASM_TARGET, runner: "ubuntu-latest", wasi: true },
];

/** The `napi.targets` list written into each npm package's package.json. */
export const NATIVE_TARGET_TRIPLES: readonly string[] = NATIVE_TARGETS.map((t) => t.target);

/** Version of the WASI SDK the CI workflow installs. */
export const NATIVE_WASI_SDK_VERSION = "24";

export const CARGO_CONFIG = {
  edition: "2024",
  resolver: "3",
  workspaceManifest: "Cargo.toml",
  cratesDir: NATIVE_CRATES_DIR,
} as const;

export const CARGO_PROFILES = {
  dev: { optLevel: 0, debug: true },
  release: { optLevel: 3, lto: true, codegenUnits: 1, strip: "symbols" },
  ci: { inherits: "dev", optLevel: 1 },
} as const;

/** Cargo runs against the whole workspace; napi runs per package. */
export const CARGO_COMMANDS = {
  check: "m native check",
  clippy: "m native clippy",
  fmtCheck: "m native fmt:check",
  fmt: "m native fmt",
  test: "m native test",
  build: "m native build",
  buildRelease: "m native build:release",
  buildCi: "m native build:ci",
} as const;

export const NAPI_COMMANDS = {
  build: "m native napi:build",
  buildDebug: "m native napi:build:debug",
  buildWasm: "m native napi:build:wasm",
  list: "m native list",
  add: "m native add <name>",
} as const;

/**
 * A crate declared by the setup script.
 *
 * `binding: false` creates a pure-Rust crate (no `cdylib`, no npm package) —
 * the place for logic that must not couple to the Node-API layer.
 */
export type NativeCrateSpec = {
  /** Crate directory name; binding crates also name their npm package. */
  name: string;
  /** Emit a `cdylib` and an npm package. */
  binding?: boolean;
  /** Path dependencies on sibling crates. */
  uses?: string[];
  /** Rust functions/structs to scaffold (defaults to the sample bindings). */
  sample?: "arithmetic" | "text" | "none";
};

/**
 * What `m native setup` creates: one pure crate with the shared logic plus the
 * thin binding crate that exposes it to JS. The pure crate has no npm package
 * of its own — `crates/package.json` (the bridge node) is the single Turbo
 * package that represents every pure crate.
 */
export const DEFAULT_NATIVE_CRATES: readonly NativeCrateSpec[] = [
  { name: "native", binding: true, uses: ["shared"], sample: "arithmetic" },
  { name: "shared", sample: "arithmetic" },
];
