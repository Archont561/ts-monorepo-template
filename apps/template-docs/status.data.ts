import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
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
type Commit = {
  sha: string | null;
  short: string | null;
  date: string | null;
  branch: string | null;
};

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
      execFileSync(cmd[0] ?? "", cmd.slice(1), {
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
type Declared = { range: string; ownerDir: string };

/**
 * Declared range for a tool plus the package that owns it. Tools live in
 * `configs/*` workspaces, and the docs toolchain in `apps/template-docs`, so
 * their versions must be resolved from there too: Bun installs into
 * `node_modules/.bun/<pkg>@<ver>` and only symlinks into the dependent
 * package's own node_modules, so a root `node_modules/<tool>` usually
 * does not exist.
 */
function declaredRange(tool: string): Declared | null {
  for (const base of ["configs", "apps"]) {
    const baseDir = join(ROOT, base);
    if (!existsSync(baseDir)) continue;
    for (const entry of readdirSync(baseDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const ownerDir = join(baseDir, entry.name);
      const pkg = readJson<{
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      }>(join(ownerDir, "package.json"));
      const range = pkg?.dependencies?.[tool] ?? pkg?.devDependencies?.[tool];
      if (range) return { range, ownerDir };
    }
  }
  return null;
}

function installedVersion(tool: string, ownerDir: string | null): string | null {
  for (const from of [ownerDir, ROOT]) {
    if (!from) continue;
    const linked = readJson<{ version?: string }>(join(from, "node_modules", tool, "package.json"));
    if (linked?.version) return linked.version;
  }
  // Root devDependencies (e.g. vitepress) resolve through Node instead.
  try {
    const resolved = createRequire(join(ROOT, "package.json")).resolve(`${tool}/package.json`);
    return readJson<{ version?: string }>(resolved)?.version ?? null;
  } catch {
    return null;
  }
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
  return names.map((name) => {
    const declared = declaredRange(name);
    return {
      name,
      version: installedVersion(name, declared?.ownerDir ?? null),
      declared: declared?.range ?? null,
    };
  });
}

function repo(): Repo {
  const fromCli = json<Repo>(["bun", "run", "mpages", "base", "--json"]);
  if (fromCli?.repo) return fromCli;

  // Fallback for a checkout where the bins aren't linked yet.
  const remote = text(["git", "config", "--get", "remote.origin.url"]);
  const match = remote?.replace(/\.git$/, "").match(/[:/]([^/:]+)\/([^/]+)$/);
  const owner = match?.[1];
  const repo = match?.[2];
  if (!owner || !repo) {
    return { owner: null, repo: null, base: null, url: null };
  }
  return {
    owner,
    repo,
    base: `/${repo}`,
    url: `https://${owner.toLowerCase()}.github.io/${repo}`,
  };
}

function workflows(slug: Repo): Workflow[] {
  const dir = join(ROOT, ".github", "workflows");
  if (!existsSync(dir) || !slug.owner || !slug.repo) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".yml"))
    .map((file) => {
      const first = readFileSync(join(dir, file), "utf8").split("\n");
      const name =
        first
          .find((line) => line.startsWith("name:"))
          ?.replace("name:", "")
          .trim() ?? file;
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
  const reportPath = join(ROOT, "coverage", "html", "index.html");
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
