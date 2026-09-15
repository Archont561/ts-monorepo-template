import { defineWrapperCommand } from "../utils/spawn";

const TSC = Bun.fileURLToPath(
  import.meta.resolve("typescript/package.json").replace("package.json", "bin/tsc"),
);

/** `m typecheck` — the `mtsc` equivalent. */
export default defineWrapperCommand({
  name: "typecheck",
  version: "1.0.0",
  description: "TypeScript wrapper — tsc owned by @myorg/tooling, use m typecheck not tsc",
  binPath: "bun",
  configArgs: [TSC],
  argsName: "args",
  argsDescription: "tsc args",
});
