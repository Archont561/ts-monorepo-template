import { resolveConfig } from "../utils/paths";
import { defineCommand, spawnTool } from "../utils/spawn";

/** `m test` — `bun test` with the shared bunfig.toml. The `mbun test` equivalent. */
export default defineCommand({
  meta: { name: "test", description: "Run bun test with the shared bunfig.toml config" },
  args: {
    args: {
      type: "positional",
      description: "Extra args for bun test",
      required: false,
    },
  },
  run() {
    // Everything after the subcommand name, so `m test src/x.test.ts` works and
    // `m bun test --coverage` and this stay identical.
    const argv = process.argv.slice(2);
    const at = argv.lastIndexOf("test");
    const raw = at === -1 ? [] : argv.slice(at + 1);
    process.exit(spawnTool(["bun", "test", `--config=${resolveConfig("bunfig.toml")}`, ...raw]));
  },
});
