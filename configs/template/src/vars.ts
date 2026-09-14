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

/** Workspace-relative path of the optional native package. */
export const NATIVE_DIR = "packages/native";

/** Workspace-relative path of the demo app. */
export const APP_DIR = "apps/example";

/** Bun version installed by the generated workflows. */
export const BUN_VERSION = "latest";

export const WORKFLOW_VARS = {
  BUN_VERSION,
  NATIVE_DIR,
  NATIVE_CARGO: `${NATIVE_DIR}/Cargo.toml`,
  // One npm package per binding crate, so the workflow guards on a glob rather
  // than a single path. `hashFiles` understands globs.
  NATIVE_NPM: `${NATIVE_DIR}/npm/*/package.json`,
  // Keep in sync with NATIVE_WASI_SDK_VERSION in configs/native/index.ts.
  NATIVE_WASI_SDK_VERSION: "24",
  APP_DIR,
  APP_DOCKERFILE: `${APP_DIR}/Dockerfile`,
} as const;

export type WorkflowVar = keyof typeof WORKFLOW_VARS;
