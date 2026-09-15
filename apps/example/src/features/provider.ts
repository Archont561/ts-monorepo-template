/** The opt-in features the demo app knows how to report. */
export type FeatureName = "native";

/** What this checkout can serve — reported by `/api` and logged at boot. */
export type FeatureFlags = Record<FeatureName, boolean>;

/**
 * One opt-in feature.
 *
 * Features are detected at runtime by file existence: the scaffolder deletes the
 * files of a config that was declined, so nothing has to be rebuilt or flagged.
 * Keeping detection behind this interface means a call site never needs to know
 * which file a feature lives in — and a test can hand it a fixture directory.
 */
export interface FeatureProvider {
  /** Flag this provider answers for in `FeatureFlags`. */
  readonly name: FeatureName;
  /** True when the files this feature needs survived scaffolding. */
  enabled(): Promise<boolean>;
  /** Endpoint paths this feature adds to the API index. */
  endpoints(): string[];
}

/** Turns providers into the flags object the API reports. */
export async function collectFlags(providers: readonly FeatureProvider[]): Promise<FeatureFlags> {
  const states = await Promise.all(
    providers.map(async (provider) => [provider.name, await provider.enabled()] as const),
  );
  return Object.fromEntries(states) as FeatureFlags;
}
