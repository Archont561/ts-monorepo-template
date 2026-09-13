import {
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
  type UserConfig,
  defineConfig as unoDefineConfig,
} from "unocss";

// Re-export UnoCSS primitives
export const defineConfig = unoDefineConfig;
export type { UserConfig };

/**
 * Shared base UnoCSS config.
 * Apps spread this into their own defineConfig() to customize.
 */
export const baseConfig = {
  presets: [presetWind3()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  content: {
    filesystem: [
      "./apps/*/src/**/*.{html,js,jsx,ts,tsx,vue,svelte}",
      "./packages/*/src/**/*.{html,js,jsx,ts,tsx,vue,svelte}",
    ],
  },
  theme: {
    colors: {
      brand: {
        50: "#eff6ff",
        500: "#3b82f6",
        600: "#2563eb",
        700: "#1d4ed8",
      },
    },
    fontFamily: {
      sans: "Inter, ui-sans-serif, system-ui, sans-serif",
    },
  },
  shortcuts: {
    "btn-primary":
      "inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700",
    card: "rounded-lg border border-gray-200 bg-white p-6 shadow-sm",
  },
} as const;
