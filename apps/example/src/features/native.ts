import { APP_FILES, type FeatureFiles } from "./paths";
import type { FeatureProvider } from "./provider";

/** Endpoints the native routes expose — mirrors what `/api/native` reports. */
export const NATIVE_ENDPOINTS = [
  "/api/native",
  "/api/native/add?a=1&b=2",
  "/api/native/fibonacci/:n",
  "/api/native/primes/:n",
  "/api/native/reverse?text=hello",
  "/api/native/status",
];

/** Native bindings are available while the native routes exist. */
export async function hasNative(files: FeatureFiles = APP_FILES): Promise<boolean> {
  try {
    return await files.app("src/pages/api/native/index.ts").exists();
  } catch {
    return false;
  }
}

/** Native detection and the endpoints it contributes to the API index. */
export function nativeProvider(files: FeatureFiles = APP_FILES): FeatureProvider {
  return {
    name: "native",
    enabled: () => hasNative(files),
    endpoints: () => [...NATIVE_ENDPOINTS],
  };
}

/** The provider the app uses. */
export const native: FeatureProvider = nativeProvider();
