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
