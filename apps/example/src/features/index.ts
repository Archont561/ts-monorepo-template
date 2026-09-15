import { native } from "./native";
import { collectFlags, type FeatureFlags, type FeatureProvider } from "./provider";

export {
  hasNative,
  NATIVE_ENDPOINTS,
  native,
  nativeProvider,
} from "./native";
export type { FeatureFiles } from "./paths";
export { APP_FILES, appFile, repoFile } from "./paths";
export type { FeatureFlags, FeatureName, FeatureProvider } from "./provider";
export { collectFlags } from "./provider";

/**
 * Every opt-in feature the app reports, in flag order.
 *
 * Adding a feature is adding a provider: `/api` reads the flags and the
 * endpoints from here instead of probing files itself.
 */
export const PROVIDERS: readonly FeatureProvider[] = [native];

/**
 * All flags in one call.
 *
 * The API index and the boot log import only this, so the native half can be
 * stripped by the scaffolder without leaving an unused import behind.
 */
export async function detectFeatures(
  providers: readonly FeatureProvider[] = PROVIDERS,
): Promise<FeatureFlags> {
  return collectFlags(providers);
}
