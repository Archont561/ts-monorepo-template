# @myorg/editorconfig

One file that makes every editor agree on whitespace and line endings — no plugin required in most editors, no CLI, no build step.

## What it provides

`.editorconfig` at the repo root:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
trim_trailing_whitespace = true
```

- `root = true` — editors stop looking further up the tree
- LF endings and UTF-8 everywhere
- 2-space indentation, with Rust files at 4
- Trailing whitespace trimmed on save

## Scaffold

Always included. It is a repo-health baseline with no opt-out.
