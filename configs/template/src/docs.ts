#!/usr/bin/env bun
import { regenerateAll } from "./aggregate";

/**
 * m-prefixed docs sync CLI. Regenerates workflows from configs/* via the
 * shared aggregation logic. Owned by `@myorg/template`. Root README.md and
 * AGENTS.md are now static reference files (not concatenated) with
 * TEMPLATE-ONLY blocks for template vs monorepo descriptions.
 */
const targetDir = process.argv[2] ?? ".";
await regenerateAll(targetDir);
