#!/usr/bin/env bun
import { defineWrapperCommand, runMain } from "@myorg/citty";

const TURBO = Bun.fileURLToPath(import.meta.resolve("turbo/bin/turbo"));

const main = defineWrapperCommand({
  name: "mturbo",
  version: "1.0.0",
  description: "Turbo with baked root config — no root turbo.json needed, uses turbo.base.json",
  binPath: "bun",
  configArgs: [TURBO, `--root-turbo-json=${import.meta.dir}/../turbo.base.json`],
  argsName: "task",
  argsDescription: "Turbo task (build, dev, test, typecheck, etc.)",
});

runMain(main);
