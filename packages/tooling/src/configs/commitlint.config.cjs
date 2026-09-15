/**
 * Conventional Commits, as enforced by the `commit-msg` hook.
 *
 * The hook used to hand-roll this as a shell regex, which accepted anything
 * shaped like `type: subject` and nothing else about it — no header limit, no
 * body wrapping, an open-ended type list. `@commitlint/config-conventional` is
 * the actual specification, so the check is now the same one the ecosystem
 * tooling agrees on.
 *
 * Two things deliberately live in the hook rather than here:
 *
 *   - `fixup!` / `squash!` / `Merge ` / `Revert ` are short-circuited before
 *     commitlint runs. commitlint's `defaultIgnores` would skip them anyway,
 *     but the hook exits first so the intent is legible in the config and does
 *     not depend on a default a future major could change.
 *   - `wip:` / `todo:` are rejected with a message naming
 *     `git commit --fixup=<sha>`. commitlint would reject `wip` too, but only
 *     as "type must be one of [...]", which does not tell anyone what to do
 *     instead, and it would not catch `TODO` inside an otherwise valid subject.
 *
 * `.cjs` because commitlint loads its config with `require()`; an ESM config
 * here would need `.config.mjs` and a `"type": "module"` package.
 */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // config-conventional forbids Sentence case, Start Case, PascalCase and
    // UPPER CASE subjects. Kept: the repo's history is uniformly lowercase and
    // the rule is part of the spec being adopted, not an extra we invented.
    // Flip to [0] if that ever becomes a nuisance.
  },
};
