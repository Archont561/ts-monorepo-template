# AGENTS.md — @myorg/editorconfig

## Rules

- This package owns the root `.editorconfig`. Never create another editor config at the root or inside a package.
- Change indentation or line endings by editing `.editorconfig`, not by reformatting files ad hoc.
- New file types with different conventions (Rust already uses 4 spaces) get their own `[*.ext]` section.

## Before marking a task done

- [ ] No new `.editorconfig` files anywhere but the root
- [ ] Any new file type with special indentation has a section here
