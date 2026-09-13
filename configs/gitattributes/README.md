# @myorg/gitattributes

> Git file handling via `.gitattributes`.

## What it provides

- `.gitattributes` at repo root — controls line endings (`text=auto eol=lf`), diff rendering (lock files as binary), and merge strategies.
- Ensures `bun.lock`, `Cargo.lock`, `*.node`, `*.png` etc. are treated as binary to avoid noisy diffs.
- Ensures shell scripts always use LF.

```gitattributes
* text=auto eol=lf
*.sh text eol=lf
bun.lock binary
*.png binary
```

## Scaffold

Always included. Baseline repo health.

See [AGENT.md](./AGENT.md).
