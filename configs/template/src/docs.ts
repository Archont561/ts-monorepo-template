#!/usr/bin/env bun
import { regenerateAll } from "./aggregate";

/**
 * m-prefixed docs sync CLI. Regenerates AGENTS.md, README.md and workflows
 * from configs/* via the shared aggregation logic. Owned by `@myorg/template`.
 * Used as `mdocs` in root scripts instead of `bun configs/template/src/aggregate.ts`.
 */
const targetDir = process.argv[2] ?? ".";
await regenerateAll(targetDir);
