import { spinner } from "@clack/prompts";
import { OptionsCollector } from "./collector";
import { MonorepoScaffolder } from "./pipeline";

async function main(): Promise<void> {
  const collector = new OptionsCollector();
  const options = await collector.collect();

  const s = spinner();
  s.start("Configuring repository...");

  const scaffolder = new MonorepoScaffolder(options);
  await scaffolder.execute();

  s.stop("Monorepo ready!");
}

main().catch((err) => {
  console.error("❌ Scaffolding failed:", err);
  process.exit(1);
});
