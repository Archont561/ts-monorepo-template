#!/usr/bin/env bun
import { defineWrapperCommand, runMain } from "@myorg/citty";

const TSC = Bun.fileURLToPath(
  import.meta.resolve("typescript/package.json").replace("package.json", "bin/tsc"),
);

const main = defineWrapperCommand({
  name: "mtsc",
  version: "1.0.0",
  description: "TypeScript wrapper — tsc owned by @myorg/ts, hoisted, use mtsc not tsc",
  binPath: "bun",
  configArgs: [TSC],
  argsName: "args",
  argsDescription: "tsc args",
});

runMain(main);
