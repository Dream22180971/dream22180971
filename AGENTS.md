# AI Repository Instructions

This repository defines the shared GitHub README and repository-metadata standards for Sean Walter's public projects.

## Mandatory source of truth

Before creating or modifying any README, repository description, topics, screenshots, badges, Quick Start instructions, or project metadata, read:

- `docs/README_DESIGN_SYSTEM.md`
- `docs/repository-metadata.json`

These files are the source of truth. Do not redesign README structure from memory.

## Required workflow

For README or repository-metadata work:

1. Inspect the current implementation first.
2. Verify install/run commands against actual repository files.
3. Keep `README.md` as the English primary README.
4. Keep `README.zh-CN.md` as the full Simplified Chinese README.
5. Preserve the language switch in both files.
6. Use the correct README archetype from the design system.
7. Use project-specific visuals; do not copy one visual gimmick to every repository.
8. Do not add typing animations to project READMEs. The profile README is the exception.
9. Never fabricate screenshots, GIFs, features, commands, releases, URLs, supported platforms, test status, or roadmap completion.
10. If documentation conflicts with implementation, treat implementation as the source of truth.
11. Run the README quality check before finishing.

## Check task

Local check for this repository:

```bash
node scripts/check-readme.mjs . Dream22180971/dream22180971
```

For other repositories, use the reusable GitHub Actions workflow defined in:

`.github/workflows/readme-quality.yml`

A README task is not complete until the check has been reviewed.

## Repository metadata apply task

Dry run:

```bash
node scripts/apply-repository-metadata.mjs
```

Apply all canonical Description/Topics values (requires authenticated GitHub CLI):

```bash
node scripts/apply-repository-metadata.mjs --apply
```

Apply one repository only:

```bash
node scripts/apply-repository-metadata.mjs --apply --repo=Dream22180971/LLM-Usage-Collector
```
