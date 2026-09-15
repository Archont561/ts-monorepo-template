import { configDir } from "@/src/utils/paths";
import { defineWrapperCommand } from "@/src/utils/spawn";

const BIOME = Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome"));

/** `m lint:fix` — `biome check --write`. Replaces `m biome check --write`. */
export default defineWrapperCommand({
  name: "lint:fix",
  version: "1.0.0",
  description: "Lint and format, applying safe fixes (Biome, shared config)",
  binPath: BIOME,
  configArgs: ["check", "--write", `--config-path=${configDir()}`],
  configArgsPlacement: "append",
  argsName: "paths",
  argsDescription: "Optional paths to fix (default: whole repo)",
});
