# AGENTS.md — @myorg/community

## Rules

- Never delete these files — they are baseline health, surfaced in Insights → Community Standards.
- Add new sensitive or specialised paths (auth, Rust, infrastructure) to `.github/CODEOWNERS` rather than relying on a global owner.
- Issue templates are YAML forms; keep the fields required so reports arrive actionable.
- Do not move vulnerability reporting, support or the code of conduct into standalone Markdown files — they are `README.md` sections by design.
- The CODEOWNERS owner is **not** rewritten by the scaffolder; remind the user to set it after scaffolding.

## Before marking a task done

- [ ] New protected path → CODEOWNERS entry
- [ ] PR template checklist still matches what CI actually enforces
- [ ] No root Markdown file was added for content that belongs in a README section
