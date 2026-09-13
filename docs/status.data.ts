import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * Build-time facts for the Status page.
 *
 * VitePress data loaders run in Node during `bun run docs:build` (and on watch
 * in dev), so the page ships with real numbers instead of client-side fetches.
 * Everything that already has a CLI owns its own logic — coverage comes from
 * `mcoverage summary --json` and the repo slug from `mpages base --json`.
 *
 * Exported as a plain object rather than through vitepress' `defineLoader`:
 * the loader is bundled as CJS and `vitepress` is ESM-only, so importing it
 * here fails the build. `defineLoader` only adds types.
 */
/**
 * VitePress bundles data loaders into a cache dir before running them, so the
 * repo root cannot be derived from `import.meta.url`. Walk up from the cwd
 * (`vitepress build docs` runs from the repo root) until the workspace markers
 * are found.
 */
function findRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) {
    if (existsSync(join(dir, "package.json")) && existsSync(join(dir, ".github", "workflows"))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

const ROOT = findRoot();

type Coverage = {
  available: boolean;
  percent: number;
  hit: number;
  found: number;
  threshold: number;
  source: string;
  reportUrl: string | null;
};
type Repo = { owner: string | null; repo: string | null; base: string | null; url: string | null };
type Manifest = { name: string; version: string; private: boolean; kind: string; dir: string };
type Tool = { name: string; version: string | null; declared: string | null };
type Workflow = { file: string; name: string; url: string; badge: string };
type Commit = { sha: string | null; short: string | null; date: string | null; branch: string | null };

export type Status = {
  generatedAt: string;
  coverage: Coverage;
  repo: Repo;
  commit: Commit;
  packages: Manifest[];
  tools: Tool[];
  runtime: { bun: string | null; node: string | null };
  workflows: Workflow[];
};

function text(cmd: string[], cwd = ROOT): string | null {
  try {
    return (
      execFileSync(cmd[0], cmd.slice(1), {
        cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }).trim() || null
    );
  } catch {
    return null;
  }
}

function json<T>(cmd: string[]): T | null {
  const out = text(cmd);
  if (!out) return null;
  try {
    return JSON.parse(out) as T;
  } catch {
    return null;
  }
}

function readJson<T>(path: string): T | null {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

function manifests(dir: string, kind: string): Manifest[] {
  const base = join(ROOT, dir);
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const pkg = readJson<{ name?: string; version?: string; private?: boolean }>(
        join(base, entry.name, "package.json"),
      );
      if (!pkg?.name) return null;
      return {
        name: pkg.name,
        version: pkg.version ?? "—",
        private: pkg.private === true,
        kind,
        dir: `${dir}/${entry.name}`,
      };
    })
    .filter((m): m is Manifest => m !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Declared range for a tool, as pinned by whichever config package owns it. */
function declaredRange(tool: string): string | null {
  const configsDir = join(ROOT, "configs");
  if (!existsSync(configsDir)) return null;
  for (const entry of readdirSync(configsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const pkg = readJson<{ dependencies?: Record<string, string>; devDependencies?: Record<string, string> }>(
      join(configsDir, entry.name, "package.json"),
    );
    const range = pkg?.dependencies?.[tool] ?? pkg?.devDependencies?.[tool];
    if (range) return range;
  }
  return null;
}

function tools(): Tool[] {
  const names = [
    "typescript",
    "turbo",
    "bunup",
    "@biomejs/biome",
    "@playwright/test",
    "vitepress",
    "citty",
    "@changesets/cli",
    "lefthook",
  ];
  return names.map((name) => ({
    name,
    version: readJson<{ version?: string }>(join(ROOT, "node_modules", name, "package.json"))?.version ?? null,
    declared: declaredRange(name),
  }));
}

function repo(): Repo {
  const fromCli = json<Repo>(["bun", "run", "mpages", "base", "--json"]);
  if (fromCli?.repo) return fromCli;

  // Fallback for a checkout where the bins aren't linked yet.
  const remote = text(["git", "config", "--get", "remote.origin.url"]);
  const match = remote?.replace(/\.git$/, "").match(/[:/]([^/:]+)\/([^/]+)$/);
  if (!match) return { owner: null, repo: null, base: null, url: null };
  return {
    owner: match[1],
    repo: match[2],
    base: `/${match[2]}`,
    url: `https://${match[1].toLowerCase()}.github.io/${match[2]}`,
  };
}

function workflows(slug: Repo): Workflow[] {
  const dir = join(ROOT, ".github", "workflows");
  if (!existsSync(dir) || !slug.owner || !slug.repo) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".yml"))
    .map((file) => {
      const first = readFileSync(join(dir, file), "utf8").split("\n");
      const name = first.find((line) => line.startsWith("name:"))?.replace("name:", "").trim() ?? file;
      const runs = `https://github.com/${slug.owner}/${slug.repo}/actions/workflows/${file}`;
      return {
        file,
        name: name.replace(/^["']|["']$/g, ""),
        url: runs,
        badge: `${runs}/badge.svg?branch=main`,
      };
    })
    .sort((a, b) => a.file.localeCompare(b.file));
}

function coverage(): Coverage {
  const raw = json<{ available: boolean; lines: { hit: number; found: number; percent: number } }>([
    "bun",
    "run",
    "mcoverage",
    "summary",
    "--json",
  ]);
  const reportPath = join(ROOT, "docs", "public", "coverage", "index.html");
  return {
    available: Boolean(raw?.available),
    percent: raw?.lines.percent ?? 0,
    hit: raw?.lines.hit ?? 0,
    found: raw?.lines.found ?? 0,
    // Matches the CI gate (mcoverage check --threshold 80).
    threshold: 80,
    source: "coverage/lcov.info",
    reportUrl: existsSync(reportPath) ? "./coverage/" : null,
  };
}

export default {
  // Re-run in `docs:dev` when any of these change.
  watch: [
    "../../coverage/lcov.info",
    "../../package.json",
    "../../packages/*/package.json",
    "../../apps/*/package.json",
    "../../.github/workflows/*.yml",
  ],
  load(): Status {
    const slug = repo();
    return {
      generatedAt: new Date().toISOString(),
      coverage: coverage(),
      repo: slug,
      commit: {
        sha: text(["git", "log", "-1", "--format=%H"]),
        short: text(["git", "log", "-1", "--format=%h"]),
        date: text(["git", "log", "-1", "--format=%cI"]),
        branch: text(["git", "rev-parse", "--abbrev-ref", "HEAD"]),
      },
      packages: [...manifests("packages", "package"), ...manifests("apps", "app")],
      tools: tools(),
      runtime: { bun: text(["bun", "--version"]), node: process.version },
      workflows: workflows(slug),
    };
  },
};
