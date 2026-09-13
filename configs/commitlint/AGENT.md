## Commit Messages

- Commits must follow Conventional Commits: `feat(external): add user profile`.
- Config lives in `configs/commitlint/index.js` (validated by the Commit-msg hook via `bunx commitlint --config configs/commitlint/index.js`).
- Valid scopes: `config`, `internal`, `external`, `example`, `deps`, `release`, `ci`.
- Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`.