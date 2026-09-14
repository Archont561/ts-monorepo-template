# CONTEXT.md — @myorg/manifest

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- One module, `src/index.ts`: text-level editing of JSON manifests. No dependencies, no bin.
- Always-on config: it ships to generated projects like `@myorg/citty` and `@myorg/ts`.
- `tests/manifest.test.ts` covers insert, replace, nested paths, array append/remove,
  the two removal shapes (middle entry, last entry), idempotence, and file-level writes.
- Writers that use it: the native and unocss setup scripts, and the scaffolder's
  removals pass.

## Decisions as outcomes

- **Text edits, not re-serialization** — the manifest a project commits is the manifest it keeps;
  no edit reformats bytes it was not asked about.
- **`setJsonBlock` takes JSON text** — objects and arrays have no canonical spelling, so the
  caller supplies the style and the editor only re-bases indentation.
- **Missing paths are no-ops** — a removal for a config that already cleaned itself up
  must not fail the scaffold.
