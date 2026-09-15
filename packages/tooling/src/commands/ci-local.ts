import { defineCommand, rawArgsAfter } from "@/src/utils/spawn";
import { runAct } from "./ci";

/**
 * `m ci:local` — shorthand for `m ci act push`, which is what the repo's
 * `ci:local` script has always run.
 */
export default defineCommand({
  meta: { name: "ci:local", description: "Run the push workflow locally via act" },
  args: {
    args: { type: "positional", description: "Extra args for act", required: false },
  },
  run() {
    process.exit(runAct(["push", ...rawArgsAfter("ci:local")]));
  },
});
