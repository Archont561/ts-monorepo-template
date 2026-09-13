## UnoCSS Styling

- `@myorg/unocss` (`configs/unocss`) is the opt-in UnoCSS styling config.
  Apps spread `baseConfig` from `@myorg/unocss` into their own
  `defineConfig()`.
- `baseConfig` ships `presetWind3`, `transformerDirectives`,
  `transformerVariantGroup`, a `brand` color palette, and the `btn-primary` /
  `card` shortcuts.
- The scaffolder's `removals` metadata handles the disabled case: it removes
  the shared `uno.config.ts` and the `unocss` / `@unocss/reset` app
  dependencies.