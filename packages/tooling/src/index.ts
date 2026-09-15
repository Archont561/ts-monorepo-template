/**
 * @myorg/tooling — public surface.
 *
 * Re-exports the CLI-building helpers and path resolution that command modules
 * and any in-repo consumer need. The bunup presets live behind their own
 * subpath (`@myorg/tooling/bunup`) because pulling `bunup` into the main entry
 * would make every consumer of the helpers load the bundler too.
 */

export {
  configDir,
  curatedSkillsDir,
  pkgRoot,
  repoRoot,
  resolveConfig,
  resolveSrc,
} from "./utils/paths";
export {
  type ArgDef,
  type ArgsDef,
  type CommandDef,
  defineCommand,
  defineSpawnSubcommand,
  defineWrapperCommand,
  rawArgsAfter,
  renderUsage,
  runCommand,
  runMain,
  type SpawnSubcommandOptions,
  showUsage,
  spawnIfPresent,
  spawnTool,
  type WrapperOptions,
} from "./utils/spawn";
