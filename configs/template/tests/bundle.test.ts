import { afterAll, describe, expect, test } from "bun:test";
import { $ } from "bun";

/**
 * `configs/template/dist/index.js` is committed: `bun-create` executes it
 * straight off the published tarball (`"preinstall": "bun configs/template/dist/index.js"`),
 * so a stale bundle ships a scaffolder that no longer matches `src/`.
 *
 * This is a drift *detector*, so it must not be a drift *fixer*: the rebuild
 * overwrites the bundle in place, and `afterAll` always puts the committed bytes
 * back. Otherwise a failing run would leave the working tree dirty — and CI's
 * `git diff --exit-code` gate (see configs/bun-config/ci.steps.yml) would then
 * report the *test's* rewrite rather than the original drift.
 *
 * Both this test and the CI step shell out to the package's real `build` script
 * instead of re-spelling the bundler flags, so the two cannot disagree about
 * how the bundle is produced.
 *
 * Note the gate is byte-exact, so it also fires when a Bun upgrade changes
 * bundler output. That is intended — re-run the build and commit — but it means
 * a Bun version bump can legitimately turn this red.
 */

const PACKAGE = `${import.meta.dir}/..`;
const BUNDLE = `${PACKAGE}/dist/index.js`;

describe("scaffolder bundle", () => {
  let committed: string | null = null;

  afterAll(async () => {
    if (committed !== null) await Bun.write(BUNDLE, committed);
  });

  test("the committed dist/index.js matches a fresh build", async () => {
    const bundle = Bun.file(BUNDLE);
    expect(await bundle.exists(), `${BUNDLE} is missing`).toBe(true);

    committed = await bundle.text();
    await $`bun run build`.cwd(PACKAGE).quiet();
    const rebuilt = await Bun.file(BUNDLE).text();

    expect(
      rebuilt,
      "dist/index.js is stale — run `bun run --filter @myorg/template build` and commit it",
    ).toBe(committed);
  });
});
