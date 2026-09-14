import { defineConfig } from "vitepress";

export default defineConfig({
  title: "ts-monorepo-template",
  description:
    "Template-only docs for Archont561/ts-monorepo-template — removed during scaffolding.",
  // Required for GitHub Pages project sites (username.github.io/repo-name).
  base: "/ts-monorepo-template/",
  // The bundled static site lands in dist/ — the same convention as every
  // other app, so the Pages artifact path is a plain dist/ reference.
  outDir: "dist",
  cleanUrls: true,
  // /coverage/ (mcoverage html) and /example/ (the demo app artifact) are
  // generated into the site by `mdocs site` — they are not VitePress pages, so
  // the dead-link checker would flag them. Everything else is still checked.
  ignoreDeadLinks: [/^\.\/coverage\//, /^\.\/example\//],
  // Needs fetch-depth: 0 in the deploy workflow to read git history.
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/" },
      { text: "Configs", link: "/guide/configs" },
      { text: "Status", link: "/status" },
      {
        text: "GitHub",
        link: "https://github.com/Archont561/ts-monorepo-template",
      },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Introduction", link: "/guide/" },
          { text: "Config matrix", link: "/guide/configs" },
          { text: "Status", link: "/status" },
        ],
      },
      {
        text: "About",
        items: [{ text: "This docs site", link: "/README" }],
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/Archont561/ts-monorepo-template" }],
    search: { provider: "local" },
    editLink: {
      pattern:
        "https://github.com/Archont561/ts-monorepo-template/edit/main/apps/template-docs/:path",
      text: "Edit this page on GitHub",
    },
    lastUpdated: { text: "Last updated" },
  },
  markdown: {
    lineNumbers: true,
  },
});
