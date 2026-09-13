## Native Bindings (NAPI-RS)

- `@myorg/native` (`configs/native`) is the opt-in NAPI-RS config: a `select`
  prompt (`none` / `publish` / `docker`) decides whether a project keeps
  native bindings at all.
- Selection is metadata-driven and defaults to `none`; the scaffolder keeps or
  prunes the config and its artifacts according to the choice.
- `@napi-rs/cli` is the only devDependency here so the toolchain is available
  to generated projects that opt in.