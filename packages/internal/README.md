# @myorg/internal

> Private shared implementation — inlined into `@myorg/external` by Bunup.

## What it is

- **Private**: never published, never imported by apps directly.
- Provides the implementation modules that `@myorg/external` re-exports
  (`format.ts`, `greeting.ts`, `index.ts`).
- **Never depends on `@myorg/external`** (would be circular).
- Consumed as a devDependency by `@myorg/external` and inlined at build time,
  so consumers of the published package see only one bundle.

## Development

```bash
bun run dev          # bunup --watch
bun run build        # bunup
bun run typecheck    # tsc --noEmit
bun run test         # bun test
```

See the [Adding a New Package guide](../external/README.md) for how internal
packages are structured.