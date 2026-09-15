import { configDir } from "../utils/paths";
import { defineWrapperCommand } from "../utils/spawn";

const BIOME = Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome"));

/**
 * Full Biome passthrough — the `m biome` equivalent. `m lint` / `m lint:fix`
 * are the ergonomic defaults over this; use `m biome <cmd>` for anything else
 * (format, migrate, rage, ...).
 */
export default defineWrapperCommand({
  name: "biome",
  version: "1.0.0",
  description: "Biome with baked config path — lint and format, no root biome.json needed",
  binPath: BIOME,
  configArgs: [`--config-path=${configDir()}`],
  configArgsPlacement: "append",
  argsName: "command",
  argsDescription: "Biome command (check, lint, format, etc.)",
});
