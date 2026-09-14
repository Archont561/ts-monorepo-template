import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * CLI contract harness.
 *
 * Every `m*` binary is a thin wrapper, and the wrappers are the one thing users
 * touch directly: help text, version output and exit codes are the contract. The
 * harness runs `--help` and `--version` for each one and compares the captured
 * bytes against a committed snapshot, so a refactor that changes how a wrapper is
 * built has to leave the visible behaviour alone.
 *
 * Refresh the snapshot deliberately (and review the diff) with:
 *
 *     UPDATE_CLI_CONTRACT=1 bun test tests/cli-contract.test.ts
 *
 * Only `--help`/`--version` are probed: they are side-effect free for every bin,
 * unlike a bare invocation, which for several of them does real work.
 */

const REPO_ROOT = join(import.meta.dir, "../../..");
const SNAPSHOT_PATH = join(import.meta.dir, "fixtures/cli-contract.json");

/** One captured invocation. */
interface Contract {
  code: number;
  out: string;
  err: string;
}

interface BinContract {
  help: Contract;
  version: Contract;
}

type Snapshot = Record<string, BinContract>;

/** Every bin in the workspace whose name starts with `m`. */
function discoverBins(): Array<{ name: string; path: string }> {
  const bins: Array<{ name: string; path: string }> = [];

  for (const group of ["configs", "packages"]) {
    const groupDir = join(REPO_ROOT, group);
    if (!existsSync(groupDir)) continue;

    for (const entry of readdirSync(groupDir).sort()) {
      const manifestPath = join(groupDir, entry, "package.json");
      if (!existsSync(manifestPath)) continue;

      const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
        name?: string;
        bin?: string | Record<string, string>;
      };
      const bin = manifest.bin;
      if (!bin) continue;

      const entries =
        typeof bin === "string" ? [[manifest.name ?? entry, bin] as const] : Object.entries(bin);
      for (const [name, relative] of entries) {
        if (!name.startsWith("m")) continue;
        bins.push({ name, path: join(groupDir, entry, relative) });
      }
    }
  }

  return bins.sort((a, b) => a.name.localeCompare(b.name));
}

const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");

/** Strips colour and absolute paths so the snapshot is portable. */
function normalize(text: string): string {
  return text.replace(ANSI, "").replaceAll(REPO_ROOT, "<repo>").trimEnd();
}

/** Runs one bin with one flag, capturing exit code, stdout and stderr. */
async function probe(path: string, flag: string): Promise<Contract> {
  const proc = Bun.spawn({
    cmd: ["bun", path, flag],
    cwd: REPO_ROOT,
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, NO_COLOR: "1" },
  });

  const timeout = setTimeout(() => proc.kill(), 30_000);
  const [out, err] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const code = await proc.exited;
  clearTimeout(timeout);

  return { code, out: normalize(out), err: normalize(err) };
}

async function captureAll(): Promise<Snapshot> {
  const snapshot: Snapshot = {};
  for (const bin of discoverBins()) {
    snapshot[bin.name] = {
      help: await probe(bin.path, "--help"),
      version: await probe(bin.path, "--version"),
    };
  }
  return snapshot;
}

describe("CLI contract", () => {
  test(
    "every m* binary answers --help and --version exactly as snapshotted",
    async () => {
      const bins = discoverBins();
      expect(bins.length).toBeGreaterThan(0);

      const captured = await captureAll();

      if (process.env.UPDATE_CLI_CONTRACT === "1") {
        writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(captured, null, 2)}\n`);
        console.log(`📸 Wrote ${SNAPSHOT_PATH} (${bins.length} binaries)`);
        return;
      }

      const snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, "utf8")) as Snapshot;

      // A bin with no contract is a bin nobody is watching.
      expect(Object.keys(snapshot).sort()).toEqual(bins.map((bin) => bin.name));

      for (const name of Object.keys(snapshot).sort()) {
        expect(captured[name], `${name} --help`).toEqual(snapshot[name]);
      }
    },
    { timeout: 120_000 },
  );
});
