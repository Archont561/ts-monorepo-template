/**
 * Values substituted into `{{NAME}}` placeholders in workflow bases and step
 * fragments.
 *
 * These live next to the generator rather than in `configs/gh-actions` because
 * `aggregate.ts` is also executed straight from a bare copy of the repo
 * (scaffolding, tests) where no workspace can be resolved.
 *
 * Paths and versions that workflow YAML has to spell out.
 *
 * Step fragments are plain YAML — they cannot import TypeScript — so the
 * generator substitutes `{{NAME}}` placeholders from this map. Declaring them
 * once here keeps `packages/native`, `apps/example` and the toolchain version
 * from being scattered across every `*.steps.yml` and `*.base.yml`.
 */

/** Workspace-relative path of the optional native npm packages. */
export const NATIVE_DIR = "packages/native";

/** Directory holding the Rust crates, at the repo root (the Cargo workspace root). */
export const CRATES_DIR = "crates";

/** Workspace-relative path of the demo app. */
export const APP_DIR = "apps/example";

/** Bun version installed by the generated workflows. */
export const BUN_VERSION = "latest";

/** pixi standalone, pinned by the sandbox bootstrap + env-pack workflow. */
export const PIXI_VERSION = "v0.48.0";

/** pixi-pack, pinned by the environment-pack workflow. */
export const PIXI_PACK_VERSION = "v0.7.10";

/** Local cargo vendor tree (gitignored), fetched by `pixi run fetch-vendor`. */
export const VENDOR_DIR = "vendor";

export const WORKFLOW_VARS = {
  BUN_VERSION,
  NATIVE_DIR,
  // The Cargo workspace root is the repo root: `{{NATIVE_CARGO}}` guards on it.
  NATIVE_CARGO: "Cargo.toml",
  CRATES_DIR,
  // One npm package per binding crate, so the workflow guards on a glob rather
  // than a single path. `hashFiles` understands globs.
  NATIVE_NPM: `${NATIVE_DIR}/npm/*/package.json`,
  // Keep in sync with NATIVE_WASI_SDK_VERSION in configs/native/index.ts.
  NATIVE_WASI_SDK_VERSION: "24",
  PIXI_VERSION,
  PIXI_PACK_VERSION,
  VENDOR_DIR,
  APP_DIR,
  APP_DOCKERFILE: `${APP_DIR}/Dockerfile`,
} as const;
