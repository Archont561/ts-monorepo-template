#!/usr/bin/env bun
import { defineWrapperCommand, runMain } from "@myorg/citty";

const BIOME = Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome"));

const main = defineWrapperCommand({
  name: "mbiome",
  version: "1.0.0",
  description: "Biome with baked config path — lint and format, no root biome.json needed",
  binPath: BIOME,
  configArgs: [`--config-path=${import.meta.dir}/..`],
  configArgsPlacement: "append",
  argsName: "command",
  argsDescription: "Biome command (check, lint, format, etc.)",
});

runMain(main);
