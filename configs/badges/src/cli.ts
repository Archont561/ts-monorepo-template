#!/usr/bin/env bun
import { file } from "bun";
import { defineCommand, runCommand, runMain } from "citty";
import { checkBadges } from "./index.ts";

const checkCommand = defineCommand({
  meta: { name: "check", description: "Check README badges for placeholder owner/scope" },
  args: {
    owner: { type: "string", description: "Expected owner/repo", default: "YOUR_ORG/YOUR_REPO" },
    scope: { type: "string", description: "Expected scope", default: "@your-scope" },
  },
  run: async ({ args }) => {
    const owner = (args.owner as string) || "YOUR_ORG/YOUR_REPO";
    const scope = (args.scope as string) || "@your-scope";
    const readmePath = `${process.cwd()}/README.md`;
    const content = await file(readmePath)
      .text()
      .catch(() => "");
    if (!content) {
      console.error(`No README at ${readmePath}`);
      process.exit(1);
    }
    const issues = checkBadges(content, owner, scope);
    if (issues.length === 0) {
      console.log("✅ Badges look OK (no placeholder owner/scope in badge URLs)");
      // citty runs the parent command after a subcommand, so leaving without an
      // exit code would re-run the default check (and print this line twice).
      process.exit(0);
    }
    console.warn("⚠️ Badge issues:\n" + issues.map((i) => `  - ${i}`).join("\n"));
    process.exit(1);
  },
});

const main = defineCommand({
  meta: {
    name: "mbadges",
    version: "1.0.0",
    description: "Badges validation — check README badges",
  },
  subCommands: { check: checkCommand },
  run: async () => {
    // citty's own invoker builds the typed context; calling `run` by hand needs
    // a hand-made one (and a cast) because the parsed args are not optional.
    await runCommand(checkCommand, { rawArgs: [] });
  },
});

runMain(main);
