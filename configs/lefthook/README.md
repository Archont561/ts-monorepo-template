# @myorg/lefthook

Git hooks, managed — plus `msetup`, the command that links every `m`-bin into `node_modules/.bin`.

## What it provides

- `lefthook` as a shared workspace dependency
- `lefthook.yml` — the hooks source (the root `lefthook.yml` is generated from it)
- `msetup` — links `m`-bins, regenerates the root wrapper, installs the hooks, and makes sure the Changesets config exists

> [!NOTE]
> The root `lefthook.yml` is generated. Edit `configs/lefthook/lefthook.yml` instead.

### Hooks

| Hook | Command | Purpose |
| :--- | :--- | :--- |
| `pre-commit` | `mbiome check --write {staged_files}` | Format and lint staged files |
| `commit-msg` | `commitlint --edit {1}` | Validate the commit message |

## Usage

```bash
bun install        # runs `prepare` → msetup lefthook + mchangeset init
msetup lefthook    # regenerate lefthook.yml and reinstall the hooks
```

`msetup` scans each `configs/*/package.json` `bin` field and symlinks the bins, which is why the root ships zero `devDependencies`.
