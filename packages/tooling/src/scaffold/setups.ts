import { file } from "bun";
import { resolveSrc } from "../utils/paths";

/** What a feature's setup step is handed when it runs. */
export interface SetupContext {
  /** Absolute path of the project being scaffolded — the setup's cwd. */
  targetDir: string;
  /** The scope the user chose; setup scripts read it from the `*_SCOPE` env. */
  scope: string;
}

/** A feature's setup step. Replaces the old `scaffold.setup` path string. */
export type FeatureSetup = (ctx: SetupContext) => Promise<void>;

/**
 * Builds a setup step that runs one of this package's setup scripts inside the
 * freshly copied project.
 *
 * The script is resolved from *this package*, not from the target: R27 deletes
 * `configs/`, so `${targetDir}/configs/<name>/src/setup.ts` no longer exists.
 * It is still spawned as a child process rather than imported, because the
 * scripts read `process.cwd()` at module scope and must see the target.
 */
function runSetupScript(relativeScript: string, label: string): FeatureSetup {
  return async ({ targetDir, scope }) => {
    const script = resolveSrc(...relativeScript.split("/"));
    // Preserve the original skip-if-absent behaviour so a missing asset is a
    // quiet no-op rather than a spawn failure.
    if (!(await file(script).exists())) return;

    console.log(`\n🔧 Running setup for ${label}: ${relativeScript}\n`);
    try {
      const proc = Bun.spawn({
        cmd: ["bun", script],
        cwd: targetDir,
        env: {
          ...process.env,
          SCOPE: scope,
          NATIVE_SCOPE: scope,
          UNOCSS_SCOPE: scope,
          DEVCONTAINER_SCOPE: scope,
          SKILLS_SCOPE: scope,
        },
        stdout: "inherit",
        stderr: "inherit",
      });
      const exitCode = await proc.exited;
      if (exitCode !== 0) {
        console.warn(`⚠️ Setup for ${label} exited with code ${exitCode}`);
      }
    } catch (e) {
      console.warn(`⚠️ Setup for ${label} failed:`, e);
    }
  };
}

/** Scaffolds `packages/native/` — crates, bridge package, toolchain, routes. */
export const setupNative: FeatureSetup = runSetupScript("commands/native-setup.ts", "native");

/** Writes the UnoCSS config, swaps the HTML entry, wires the example app. */
export const setupUnocss: FeatureSetup = runSetupScript("commands/unocss-setup.ts", "unocss");

/** Writes `.devcontainer/devcontainer.json` from the consolidated asset. */
export const setupDevcontainer: FeatureSetup = runSetupScript(
  "commands/devcontainer-setup.ts",
  "devcontainer",
);
