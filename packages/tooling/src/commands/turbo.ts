import { resolveConfig } from "../utils/paths";
import { defineWrapperCommand } from "../utils/spawn";

const TURBO = Bun.fileURLToPath(import.meta.resolve("turbo/bin/turbo"));

// Turbo only recognises a "local" install through root-level node_modules
// layouts (hoisted, nested, pnpm-linked). This repo pins turbo inside the
// tooling package and bun's isolated linker never links it at the repo root,
// so every run would warn about a "globally installed" turbo. The binary is
// always the pinned local one resolved above, making the warning a false
// positive — turbo's own escape hatch silences it.
process.env.TURBO_GLOBAL_WARNING_DISABLED = "1";

/** `m turbo <task>` — the `m turbo` equivalent. */
export default defineWrapperCommand({
  name: "turbo",
  version: "1.0.0",
  description: "Turbo with baked root config — no root turbo.json needed, uses turbo.base.json",
  binPath: "bun",
  configArgs: [TURBO, `--root-turbo-json=${resolveConfig("turbo.base.json")}`],
  argsName: "task",
  argsDescription: "Turbo task (build, dev, test, typecheck, etc.)",
});
