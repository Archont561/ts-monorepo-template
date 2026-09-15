---
layout: home
hero:
  name: "ts-monorepo-template"
  text: "Bun + TypeScript monorepo template"
  tagline: "Opt-in configs, m-prefixed tooling, data-driven scaffolding"
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: Status
      link: /status
    - theme: alt
      text: View on GitHub
      link: https://github.com/Archont561/ts-monorepo-template
features:
  - icon: ⚡
    title: Bun-first
    details: Every script runs through Bun and the m-prefixed CLI aliases (mbiome, mturbo, mbun, mcoverage).
  - icon: 🧩
    title: Opt-in configs
    details: Playwright, NAPI-RS, CodeQL, Trivy, Pages, Stale — pick them at scaffold time, or strip them later.
  - icon: 🏗️
    title: Scaffolds itself
    details: "bun create turns this template into your monorepo — scope replaced, template-only files pruned, workflows regenerated."
---

## Template-only

::: warning
This site documents the **template repository itself**. It is removed when you
run `bun create Archont561/ts-monorepo-template` — generated monorepos get their
own Pages workflow from `configs/pages` if you opt in.
:::
