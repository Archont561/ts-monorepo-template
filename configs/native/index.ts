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

export const CARGO_CONFIG = {
  edition: "2021",
  members: ["packages/native"],
  manifest: "packages/native/Cargo.toml",
  selfContained: true,
} as const;

export const CARGO_PROFILES = {
  dev: { optLevel: 0, debug: true },
  release: { optLevel: 3, lto: true, codegenUnits: 1, strip: "symbols" },
  ci: { inherits: "dev", optLevel: 1 },
} as const;

export const CARGO_COMMANDS = {
  check: "mnative check",
  clippy: "mnative clippy",
  fmtCheck: "mnative fmt:check",
  fmt: "mnative fmt",
  test: "mnative test",
  build: "mnative build",
  buildRelease: "mnative build:release",
  buildCi: "mnative build:ci",
} as const;

export const NAPI_COMMANDS = {
  build: "mnative napi:build",
  buildDebug: "mnative napi:build:debug",
  buildWasm: "mnative napi:build:wasm",
} as const;
