/**
 * Scaffold barrel — the programmatic surface used by `m docs`, the bun-create
 * preinstall entry (`src/scaffold/run.ts`) and the template tests.
 *
 * `run.ts` is deliberately not re-exported here: it calls `main()` on import.
 */

export { aggregateWorkflow, regenerateAll } from "./aggregator";
export { type CollectorOptions, OptionsCollector } from "./collector";
export {
  DEFAULT_SCOPE,
  type DiscoveredConfig,
  discoverConfigs,
  getRegisteredConfigs,
  NATIVE_MODES,
  type NativeMode,
  type RegisteredConfigInfo,
  type RegisteredConfigsMetadata,
  registerConfigsMetadata,
  type ScaffoldMeta,
  type ScaffoldOption,
  type ScaffoldRemovals,
  type ScaffoldSelection,
} from "./features";
export { type HarnessOptions, type HarnessResult, TemplateHarness } from "./harness";
export {
  CUSTOM_MARKER_PATTERNS,
  collectScopeTargets,
  IDENTITY_PLACEHOLDER,
  isScopeDisabled,
  MARKER_PATTERNS,
  MonorepoScaffolder,
  markerFindArgs,
  resolveOwner,
  resolveRepo,
  type ScaffolderOptions,
  stripMarkerBlocks,
} from "./pipeline";

export { APP_DIR, BUN_VERSION, NATIVE_DIR, WORKFLOW_VARS } from "./vars";
