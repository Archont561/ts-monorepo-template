import { cancel, confirm, intro, isCancel, outro, select, text } from "@clack/prompts";
import { file } from "bun";
import { DEFAULT_SCOPE, discoverConfigs, type NativeMode, type ScaffoldSelection } from "./configs";
import type { ScaffolderOptions } from "./scaffolder";

export interface CollectorOptions {
  /** If true, skip prompts and return defaults. */
  nonInteractive?: boolean;
  /** Override defaults for non-interactive mode. */
  defaults?: Partial<ScaffolderOptions>;
}

/**
 * Collects scaffolding options from the user via Clack prompts.
 *
 * Separated from the scaffolder itself for testability.
 * The CLI entry point (index.ts) is a thin wrapper that
 * instantiates this collector, then passes the result to
 * MonorepoScaffolder.
 */
export class OptionsCollector {
  private readonly nonInteractive: boolean;
  private readonly defaults: ScaffolderOptions;

  constructor(options: CollectorOptions = {}) {
    this.nonInteractive =
      options.nonInteractive ??
      (process.argv.includes("--yes") ||
        process.argv.includes("-y") ||
        process.argv.includes("--CI") ||
        Boolean(process.env.CI) ||
        !process.stdin.isTTY);

    this.defaults = {
      scope: DEFAULT_SCOPE,
      gitHooks: true,
      configs: {},
      ...options.defaults,
    };
  }

  /**
   * Resolves the scaffold target directory. Prefers an explicit
   * --target-dir argument; otherwise walks up from the current working
   * directory to the repository root (the nearest ancestor that contains
   * the configs/template marker). This keeps `bun run --filter
   * @myorg/template scaffold` (which executes with cwd configs/template)
   * and a direct dist invocation from the repo root both correct.
   */
  private async resolveTargetDir(): Promise<string> {
    const targetArgIndex = process.argv.indexOf("--target-dir");
    if (targetArgIndex >= 0) {
      return process.argv[targetArgIndex + 1] ?? ".";
    }

    let dir = process.cwd();
    for (let depth = 0; depth < 32; depth++) {
      const marker = file(`${dir}/configs/template/package.json`);
      if (await marker.exists()) return dir;
      const next = dir.split("/").slice(0, -1).join("/") || "/";
      if (next === dir) break;
      dir = next;
    }

    return process.cwd();
  }

  /**
   * Runs the full collection flow. Returns fully-resolved options
   * ready to pass to MonorepoScaffolder.
   */
  async collect(): Promise<ScaffolderOptions> {
    const targetDir = await this.resolveTargetDir();

    if (this.nonInteractive) {
      return { targetDir, ...this.defaults };
    }

    intro("📦 Bun Monorepo Scaffolder");

    const scope = await this.promptScope();
    const gitHooks = await this.promptGitHooks();
    const configs = await this.collectDynamicPrompts(targetDir);

    outro(`✨ Configuring workspace under ${scope}...`);

    return {
      targetDir,
      scope,
      gitHooks,
      configs,
    };
  }

  /**
   * Generates prompts for every opt-in config from its scaffold metadata.
   * Configs with `"default": "always"` are never prompted for.
   */
  private async collectDynamicPrompts(
    targetDir: string,
  ): Promise<Record<string, ScaffoldSelection>> {
    const configs = await discoverConfigs(targetDir);
    const results: Record<string, ScaffoldSelection> = {};

    for (const config of configs) {
      const meta = config.meta;
      if (meta.default === "always") continue;
      if (!meta.flag || !meta.prompt) continue;

      if (this.nonInteractive) {
        results[meta.flag] = meta.default;
        continue;
      }

      if (meta.type === "select" && meta.options) {
        const answer = await select({
          message: meta.prompt,
          options: meta.options,
          initialValue: meta.default as NativeMode,
        });
        this.handleCancel(answer);
        results[meta.flag] = answer as NativeMode;
      } else {
        const answer = await confirm({
          message: meta.prompt,
          initialValue: meta.default as boolean,
        });
        this.handleCancel(answer);
        results[meta.flag] = answer as boolean;
      }
    }

    return results;
  }

  /** Exits when the prompt was cancelled (Ctrl-C / Esc). */
  private handleCancel(value: unknown): void {
    if (isCancel(value)) {
      cancel("Setup cancelled.");
      process.exit(0);
    }
  }

  private async promptScope(): Promise<string> {
    const result = await text({
      message: "Organization / Scope name?",
      placeholder: "@acme",
      defaultValue: this.defaults.scope ?? DEFAULT_SCOPE,
      validate: (value?: string) => {
        if (!value) return "Scope cannot be empty";
        if (!value.startsWith("@")) return "Scope must start with '@'";
        if (!/^@[a-z0-9-]+$/.test(value))
          return "Scope must be lowercase alphanumeric with hyphens";
      },
    });
    this.handleCancel(result);
    return result as string;
  }

  private async promptGitHooks(): Promise<boolean> {
    const result = await confirm({
      message: "Initialize Git and install Lefthook hooks?",
      initialValue: this.defaults.gitHooks ?? true,
    });
    this.handleCancel(result);
    return result as boolean;
  }
}
