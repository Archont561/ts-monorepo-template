import {
  type BuildContext,
  type BuildMeta,
  type BuildOptions,
  type BuildOutputFile,
  type BuildResult,
  type BunupPlugin,
  build as bunupBuild,
  defineConfig as bunupDefineConfig,
  defineWorkspace as bunupDefineWorkspace,
  type DefineConfigItem,
  type DefineWorkspaceItem,
} from "bunup";

/**
 * @myorg/tooling/bunup — Shared Bunup bundling configuration.
 *
 * Re-exports Bunup's complete public API with sensible presets baked in.
 * Library packages should import only from this module, never from `bunup`
 * directly.
 *
 * Usage:
 *   import { defineConfig, baseConfig } from "@myorg/tooling/bunup";
 *
 *   export default defineConfig({
 *     ...baseConfig,
 *     entry: ["src/index.ts"],
 *   });
 *
 * The four presets are carried over from `configs/bunup/index.ts` unchanged, so
 * swapping `@myorg/bunup` for `@myorg/tooling/bunup` is behaviour-preserving.
 * They are defined here rather than imported from `@myorg/bunup` because
 * `configs/` is deleted in R27.
 */

export const build = bunupBuild;
export const defineConfig = bunupDefineConfig;
export const defineWorkspace = bunupDefineWorkspace;

export type {
  BuildContext,
  BuildMeta,
  BuildOptions,
  BuildOutputFile,
  BuildResult,
  BunupPlugin,
  DefineConfigItem,
  DefineWorkspaceItem,
};

/**
 * Shared base configuration for all library packages.
 * Spread into your own `defineConfig()` to customize.
 */
/**
 * bunup infers a type that references an internal `WithRequired` helper it does
 * not export, which breaks declaration emit. Naming the return type keeps the
 * presets identical while making the .d.ts portable.
 */
type Preset = ReturnType<typeof bunupDefineConfig>;

export const baseConfig: Preset = bunupDefineConfig({
  format: ["esm"],
  dts: true,
  clean: true,
  target: "node",
  minify: false,
  sourcemap: false,
});

/**
 * Preset for packages that ship both types and runtime code.
 * Enables source maps for debugging.
 */
export const libraryConfig: Preset = bunupDefineConfig({
  ...baseConfig,
  sourcemap: true,
});

/**
 * Preset for internal-only packages that will be inlined by Bunup.
 * Skips DTS generation since consumers get types from the outer package.
 */
export const inlinedConfig: Preset = bunupDefineConfig({
  ...baseConfig,
  dts: false,
});

/**
 * Preset for CLI tools bundled as executables.
 * Bundles all dependencies inline (no external imports).
 */
export const cliConfig: Preset = bunupDefineConfig({
  ...baseConfig,
  dts: false,
  minify: true,
  target: "bun",
});
