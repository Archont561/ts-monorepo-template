# AGENTS.md — @myorg/internal

> Private, inlined implementation. Orientation in [README.md](./README.md), current state in [CONTEXT.md](./CONTEXT.md).

## Rules

- This package is `private: true` and is never published. Do not add publish metadata, a version bump, or a changeset for it.
- Never import `@myorg/external` from here — that dependency is circular.
- Never import this package from `apps/`. Apps import `@myorg/external`; the implementation reaches them inlined.
- New functionality is exported explicitly from `src/index.ts`, then re-exported from `@myorg/external` if it is public. Nothing is public by accident.
- Never add `typescript`, `bunup` or `@types/bun` here — `@myorg/ts` and `@myorg/bunup` own them.
- Never edit `dist/`; `mbunup` generates it.
- Split a new internal package out only when the logic is reused across modules; otherwise add a module here.

## File layout

| Path | Role |
| :--- | :--- |
| `src/index.ts` | Barrel with explicit named exports |
| `src/format.ts`, `src/greeting.ts` | Implementation modules |
| `tests/` | Bun tests |
| `bunup.config.ts` | Build config (`baseConfig` from `@myorg/bunup`) |
| `tsconfig.json` | Extends `@myorg/ts/library.json` |

## Before marking a task done

- [ ] `bun run build`
- [ ] `bun run typecheck`
- [ ] `bun run test`
- [ ] No import of `@myorg/external` anywhere in `src/`
- [ ] New public behaviour re-exported from `@myorg/external` with a changeset there
