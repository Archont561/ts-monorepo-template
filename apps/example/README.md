# @myorg/example

Demo HTTP application built with Bun.serve and file-based routing.

## Endpoints

| Route | Tier | Handler | Description |
| ----- | ---- | ------- | ----------- |
| `GET /health` | 1 (static) | `src/index.ts` | Health probe |
| `GET /` | 2 (file-based) | `src/pages/index.ts` | HTML welcome page |
| `GET /api` | 2 (file-based) | `src/pages/api/index.ts` | API endpoint list |
| `GET /api/greet/:name` | 2 (file-based) | `src/pages/api/greet/[name].ts` | Greeting |
| `GET /api/shout/:name` | 2 (file-based) | `src/pages/api/shout/[name].ts` | Uppercased greeting |

## Development

```bash
bun run dev              # hot-reloading server on :3000
bun run test             # unit tests (routes + integration)
bun run test:e2e         # Playwright E2E (requires browsers)
```

## Architecture

- **Tier 1** (`routes:` in `Bun.serve`) — static endpoints, sub-millisecond dispatch.
- **Tier 2** (`fetch` + `FileSystemRouter`) — Next.js-style file-based routing.

New endpoints: add a file to `src/pages/` matching the desired URL structure.
