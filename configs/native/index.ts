export const NATIVE_TARGETS = [
  "x86_64-apple-darwin",
  "aarch64-apple-darwin",
  "x86_64-pc-windows-msvc",
  "x86_64-unknown-linux-gnu",
  "aarch64-unknown-linux-gnu",
  "x86_64-unknown-linux-musl",
  "wasm32-wasip1-threads",
] as const;

export type NativeTarget = (typeof NATIVE_TARGETS)[number];

export const CARGO_WORKSPACE_CONFIG = {
  resolver: "2",
  members: ["packages/native"],
  edition: "2021",
} as const;

export const CARGO_PROFILES = {
  dev: { optLevel: 0, debug: true },
  release: { optLevel: 3, lto: true, codegenUnits: 1, strip: "symbols" },
  ci: { inherits: "dev", optLevel: 1 },
} as const;

export const CARGO_COMMANDS = {
  check: "cargo check --workspace",
  clippy: "cargo clippy --workspace -- -D warnings",
  fmtCheck: "cargo fmt --all -- --check",
  fmt: "cargo fmt --all",
  test: "cargo test --workspace",
  build: "cargo build --workspace",
  buildRelease: "cargo build --workspace --release",
  buildCi: "cargo build --workspace --profile ci",
} as const;
