import { configDir } from "../utils/paths";
import { defineWrapperCommand } from "../utils/spawn";

const BIOME = Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome"));

/** `m lint` — `biome check` with the shared config. Replaces `mbiome check`. */
export default defineWrapperCommand({
  name: "lint",
  version: "1.0.0",
  description: "Lint and format check (Biome, shared config)",
  binPath: BIOME,
  configArgs: ["check", `--config-path=${configDir()}`],
  configArgsPlacement: "append",
  argsName: "paths",
  argsDescription: "Optional paths to check (default: whole repo)",
});
