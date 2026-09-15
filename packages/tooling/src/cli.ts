#!/usr/bin/env bun
import type { SubCommandsDef } from "citty";
import { defineCommand, runMain } from "./utils/spawn";

/**
 * `m` — the unified monorepo toolchain CLI.
 *
 * Every legacy `m*` bin has exactly one subcommand here, so nothing is lost in
 * the consolidation:
 *
 *   mbadges    -> m badges          mbiome     -> m biome  (+ m lint, m lint:fix)
 *   mbun       -> m bun             (+ m test)
 *   mbunup     -> m build           (+ m health)
 *   mchangeset -> m changeset       mcodeql    -> m codeql
 *   mcoverage  -> m coverage        mci        -> m ci     (+ m ci:lint, m ci:local)
 *   mgitleaks  -> m gitleaks        msetup     -> m setup
 *   mnative    -> m native          mpages     -> m pages
 *   mskills    -> m skills          mtrivy     -> m trivy
 *   mtsc       -> m typecheck       mturbo     -> m turbo
 *   me2e       -> m e2e
 *   mdocs      -> m docs
 *
 * `mcitty` has no subcommand: it only ever printed framework info, and the
 * helpers it documented now live in `src/utils/spawn.ts`.
 *
 * Subcommands are lazy `() => import(...)` so `m --help` and every individual
 * command pay only for the module they actually run. The `.then((m) => m.default)`
 * matters — the modules use `export default`, and handing citty the module
 * namespace gives it an object with no `run`, which it silently ignores.
 *
 * The map is typed as citty's own `SubCommandsDef` so each loader is checked
 * against the type citty resolves subcommands to.
 */
const subCommands: SubCommandsDef = {
  // Core toolchain
  lint: () => import("./commands/lint").then((m) => m.default),
  "lint:fix": () => import("./commands/lint-fix").then((m) => m.default),
  biome: () => import("./commands/biome").then((m) => m.default),
  typecheck: () => import("./commands/typecheck").then((m) => m.default),
  turbo: () => import("./commands/turbo").then((m) => m.default),
  build: () => import("./commands/bunup").then((m) => m.default),
  health: () => import("./commands/health").then((m) => m.default),
  bun: () => import("./commands/bun").then((m) => m.default),
  test: () => import("./commands/bun-test").then((m) => m.default),
  coverage: () => import("./commands/coverage").then((m) => m.default),
  changeset: () => import("./commands/changeset").then((m) => m.default),
  commitlint: () => import("./commands/commitlint").then((m) => m.default),
  setup: () => import("./commands/setup").then((m) => m.default),

  // CI & security
  ci: () => import("./commands/ci").then((m) => m.default),
  "ci:lint": () => import("./commands/ci-lint").then((m) => m.default),
  "ci:local": () => import("./commands/ci-local").then((m) => m.default),
  gitleaks: () => import("./commands/gitleaks").then((m) => m.default),
  trivy: () => import("./commands/trivy").then((m) => m.default),
  codeql: () => import("./commands/codeql").then((m) => m.default),

  // Opt-in features
  native: () => import("./commands/native").then((m) => m.default),
  e2e: () => import("./commands/e2e").then((m) => m.default),
  pages: () => import("./commands/pages").then((m) => m.default),
  skills: () => import("./commands/skills").then((m) => m.default),
  badges: () => import("./commands/badges").then((m) => m.default),

  // Meta
  docs: () => import("./commands/docs").then((m) => m.default),
};

const main = defineCommand({
  meta: {
    name: "m",
    version: "0.1.0",
    description: "Unified monorepo toolchain CLI",
  },
  subCommands,
});

runMain(main);
