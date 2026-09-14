# AGENTS.md — @myorg/manifest

## Rules

- Never `JSON.parse` + `JSON.stringify` a manifest this repo owns — use the helpers here.
- Every edit goes through `updateManifestFile`, which writes only when the text changed.
- Addresses are dotted and may not contain dots: `scripts.build:native`, not `scripts["build:native"]`.
- Keep the functions pure (`string -> string`); file I/O stays in `updateManifestFile`.
- Array elements and entries that share a line are supported; add a test for any new shape.

## Before marking a task done

- [ ] `bun test --cwd configs/manifest` is green
- [ ] `bun run check` and `bun run typecheck` pass
- [ ] A new shape (inline array, nested block, empty object) has a test
