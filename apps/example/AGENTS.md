# AGENTS.md — @myorg/example

> The demo HTTP app. Orientation in [README.md](./README.md), current state in [CONTEXT.md](./CONTEXT.md).

## Rules

- Private and unbundled. Never add a bundler — Bun runs TypeScript directly (`dev` uses `--hot`).
- Never import `@myorg/internal`. Apps import `@myorg/external`; internal is private and inlined.
- No `output` or bundling config: `tsconfig.json` extends `@myorg/ts/app.json` with `noEmit`.
- Never add `typescript`, `bunup` or `@types/bun` here — `@myorg/ts` owns them.
- Opt-in features must be detected at runtime, not at build time: check whether the file or package exists before using it, so the app still runs after a config is pruned.
- The port comes from `src/port.ts`, overridable with `PORT`. Read it; do not hardcode 3000 in a second place.
- Static endpoints go in Tier 1 (`routes:` in `Bun.serve`); everything else is a file under `src/pages/`.
- E2E specs live in `e2e/`, unit tests in `tests/`. Never mix the two runners.

## Adding an endpoint

1. Create the file in `src/pages/` matching the URL you want (`src/pages/api/hello.ts` → `/api/hello`).
2. Export a default handler:

   ```ts
   export default {
     fetch(req: Request) {
       return Response.json({ message: "Hello" });
     }
   };
   ```

3. For a dynamic segment, name the file `[name].ts`; for a catch-all, `[...slug].ts`.
4. If the endpoint depends on an opt-in config, guard it with a runtime check and add it to that config's removal patterns.
5. Add a unit test in `tests/`, and an E2E spec in `e2e/` when it is user-visible.

## Before marking a task done

- [ ] `bun run typecheck`
- [ ] `bun run test`
- [ ] `bun run test:e2e` (skipping counts as passing)
- [ ] New opt-in behaviour degrades gracefully when the config is pruned
- [ ] No import of `@myorg/internal`
