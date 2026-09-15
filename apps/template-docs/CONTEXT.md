# CONTEXT.md — @myorg/template-docs

> Snapshot of what is true **right now**. Not rules — those are in the root
> [AGENTS.md](../../AGENTS.md). Not onboarding — that is in
> [README.md](./README.md).
>
> This file goes stale on the next commit; regenerate it rather than patching it.

Last updated: 2026-09-15

## ⚠️ These docs are deprecated

**The VitePress site in this package is deprecated. Do not act on it.**

The pages here were written against the pre-R28 layout, where every tool lived
in its own `configs/<name>` workspace package and exposed a dedicated
`m<name>` binary. Both halves of that are gone: `configs/` was deleted and the
28 packages collapsed into `packages/tooling`, and the `m<name>` binaries were
consolidated into subcommands of a single `m` CLI.

Measured on 2026-09-15, the tracked Markdown still carries **36 references** to
a tree and a set of binaries that no longer exist:

| File | Stale references |
| :--- | ---: |
| `guide/configs.md` | 23 |
| `guide/index.md` | 7 |
| `status.md` | 3 |
| `README.md` | 2 |
| `index.md` | 1 |

`guide/configs.md` is the worst case and cannot be patched line by line: its
whole premise — one directory and one binary per tool — is the thing that was
removed. It needs a rewrite, not a fix.

## Do not perform any action unless a task references it

This is an explicit instruction to agents and maintainers, not a soft
suggestion:

- **Do not** "helpfully" correct a stale path, binary name, or command you
  notice in these files while working on something else.
- **Do not** regenerate, rebuild, or reformat the site as a drive-by.
- **Do not** treat a discrepancy between these docs and the code as a bug in
  the code. Where they disagree, **the code is right and the docs are wrong.**
- **Do** update a page here only when the task you are working on names that
  page, that file, or this package explicitly. Scope the edit to what the task
  asked for and leave the rest of the deprecation debt in place.

The reason for the rule: with 36 known-bad references, a partial cleanup is
worse than none, because it makes the remaining ones look deliberately
maintained. Either the whole site gets rewritten against the current layout, or
it stays visibly stale. Halfway is the state that misleads people.

## Current state

- `@myorg/template-docs`, version `0.0.0`, private, never published.
- VitePress `^1.6.4`; config in `.vitepress/`, build output in `dist/`
  (gitignored).
- Scripts: `build` / `dev` / `preview` (vitepress), `typecheck` (`m typecheck`).
- The root `docs:*` scripts (`docs:build`, `docs:dev`, `docs:preview`,
  `docs:site`) all filter this package.
- `status.data.ts` is a VitePress data loader; `status.md` renders from it.
- The scaffolder deletes this package on `bun create` — see the `template`
  feature's `extraRemovals` in `packages/tooling/src/scaffold/features.ts`,
  which lists `apps/template-docs` and `.github/workflows/template-docs.yml`.

## What is still true

The deprecation covers the **content**, not the plumbing:

- The package still builds: `m turbo build --filter=@myorg/template-docs`
  succeeds. Note that VitePress builds every `.md` under its source dir as a
  page and fails the build on dead links, so this file is listed in
  `srcExclude` in `.vitepress/config.mts` — without that, the link to
  `../../AGENTS.md` (which escapes the site root) breaks the build.
- `docs:sync` (`m docs && m coverage sync`) still regenerates `.github/` from
  the fragments in `packages/tooling/src/ci/`. That generator is current; only
  the prose describing it is not.

## Open

- Rewrite or delete `guide/configs.md` against the `packages/tooling` layout —
  the largest single piece of debt here.
- Decide whether the site survives at all. It documents a template, and the
  scaffolder removes it, so its only audience is people reading the template
  repository itself.

## Recent changes

| Commit | What |
| :--- | :--- |
| `54f3ee3` | R28 — `configs/` deleted, 28 packages collapsed into `packages/tooling`; these docs were not updated |
| `7f52d15` | UnoCSS dropped; one row removed from `guide/configs.md`, the rest left stale |
