# @myorg/editorconfig

> Consistent editor settings via `.editorconfig`.

## What it provides

- `.editorconfig` at repo root — tells VS Code, JetBrains, Vim, etc. to use consistent indent, line endings, charset.
- No plugin required in most editors.
- Config: `root = true`, `lf` endings, `utf-8`, `2-space` indent (4 for Rust), `trim_trailing_whitespace`.

## Usage

File is read automatically by editors. No CLI needed.

```ini
# .editorconfig
root = true
[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
```

## Scaffold

Always included. No opt-out — it's a repo health baseline.

See [AGENTS.md](./AGENTS.md) for agent reference.
