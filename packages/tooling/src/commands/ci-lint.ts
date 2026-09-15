import { defineCommand, rawArgsAfter } from "@/src/utils/spawn";
import { runActionlint } from "./ci";

/** `m ci:lint` — shorthand for `m ci lint`. The `mci lint` equivalent. */
export default defineCommand({
  meta: { name: "ci:lint", description: "Validate workflows via actionlint with shared config" },
  args: {
    args: { type: "positional", description: "Extra args for actionlint", required: false },
  },
  run() {
    process.exit(runActionlint(rawArgsAfter("ci:lint")));
  },
});
