# @myorg/gitattributes

Git file handling: line endings in the working tree, and which files Git should never try to diff.

## What it provides

`.gitattributes` at the repo root:

```gitattributes
* text=auto eol=lf
*.sh text eol=lf
bun.lock binary
Cargo.lock binary
*.png binary
*.node binary
```

- `* text=auto eol=lf` — LF in the working tree on every platform
- `*.sh eol=lf` — shell scripts stay LF even on Windows
- Lock files, images and native binaries are marked `binary`, so diffs stay readable and merges never corrupt them

## Scaffold

Always included — baseline repo health.
