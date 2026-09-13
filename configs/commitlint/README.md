# @myorg/commitlint

> Conventional Commit validation, shared.

## What it provides

- `@commitlint/cli` and `@commitlint/config-conventional` as shared devDependencies.
- `index.js` — the single commitlint config, consumed with
  `--config configs/commitlint/index.js`.

## Enforced rules

- **Scopes** (`scope-enum`): `config`, `internal`, `external`, `example`,
  `deps`, `release`, `ci`.
- **Types** (`type-enum`): `feat`, `fix`, `docs`, `style`, `refactor`, `test`,
  `chore`, `ci`, `perf`.

## Usage

```bash
bunx commitlint --config configs/commitlint/index.js --edit {1}
```

The commit-msg hook runs this on every commit, so messages are validated
automatically.

See [AGENT.md](./AGENT.md) for the agent-facing reference.