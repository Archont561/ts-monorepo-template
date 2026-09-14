# @myorg/codeql

GitHub's static analysis for security vulnerabilities, wired into CI so results land in **Security → Code scanning alerts**.

## What it provides

- `ci.steps.yml` — a fragment that adds CodeQL init, autobuild and analyze to `ci.yml`
- `mcodeql` — an informational wrapper (CodeQL itself runs in GitHub Actions, not locally)
- `codeql-config.yml` — optional, for custom queries and ignored paths

CodeQL is free for public repositories, covers JavaScript and TypeScript, and finds the classes of bug that tests do not — injection, XSS, unsafe data flow.

## Usage

```bash
bun run docs:sync   # regenerates ci.yml with the CodeQL steps
mcodeql info        # what the config would do
```

### What runs in CI

```yaml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v3
  with:
    languages: javascript-typescript
    queries: security-and-quality

- name: Autobuild
  uses: github/codeql-action/autobuild@v3

- name: Perform CodeQL Analysis
  uses: github/codeql-action/analyze@v3
```

Alerts appear in the Security tab, not as PR comments. Running the CodeQL CLI locally is possible (`brew install codeql`) but heavy, and almost nobody does it.

> [!NOTE]
> Opt-in, **enabled by default**. Decline it with `--no-codeql` when scaffolding.
