# Sean GitHub README Design System

This document is the single source of truth for public repository README design, visual hierarchy, repository metadata, and AI-generated documentation changes.

## 1. Core principle

A README is a landing page first and a manual second.

Within the first 5–10 seconds, a visitor should understand:

1. What is this?
2. What problem does it solve?
3. What does it look like?
4. Can I run or try it quickly?

## 2. Language

- `README.md` is the English primary version.
- `README.zh-CN.md` is the full Simplified Chinese version.
- Both files must contain a visible language switch near the top.
- Do not stack English and Chinese paragraph-by-paragraph in one README.
- The Chinese version should be natural Chinese, not a mechanical line-by-line translation.

Recommended switch:

```md
[English](./README.md) | [简体中文](./README.zh-CN.md)
```

## 3. First-screen structure

Recommended order:

```text
Project name
One-sentence value proposition
English | 简体中文
3–6 meaningful badges
Primary visual / terminal preview / architecture cue
Primary action: Quick Start / Demo / Download
```

Do not repeat the same value proposition above and below the H1.

## 4. Visual system

The goal is visual richness, not identical decoration.

### Semantic emoji

Use emoji as stable navigation cues when the section exists:

- 🎯 What it is / 它是什么
- 💡 Why / 为什么做
- 🎬 Demo / 演示
- ⚡ Quick Start / 快速开始
- 📦 Download / Get it / 直接使用
- ✨ Features / 核心功能
- 🔄 Workflow / 流程
- 🧭 Product Flow / 产品方向
- 🧩 Architecture / 架构
- 🧪 Testing / 测试
- ✅ Coverage / Capabilities
- 📊 Reports / Data
- 🛠 Commands / Stack / Build
- 🤖 Supported Agents
- 🔐 Privacy / Security
- ⚠️ Limitations
- 🗂 Project Structure
- 🗺 Roadmap
- 🤝 Contributing
- 📄 License

Emoji are semantic icons, not decoration. Avoid filling every line or table cell with emoji.

### Typing animation

- Allowed by default only on the GitHub profile README.
- Do not add `readme-typing-svg` to project READMEs unless explicitly approved for a specific repository.

### Visual priority by repository type

#### A. Developer Tool

Examples: LLM-Usage-Collector, agent-memory-hub, wise-council-mcp.

Preferred structure:

Hero → terminal/demo → Quick Start → supported tools → usage → architecture → extension → roadmap → contributing.

Preferred visuals:

- terminal output
- architecture diagrams
- compatibility tables
- concise badges
- workflow diagrams

#### B. Product App

Examples: WorkLife-Dashboard, VoyageAI, YouRenTool, animation-memory-museum.

Preferred structure:

Hero → screenshot/GIF → Download/Live Demo → features → privacy/experience → Quick Start → roadmap.

Preferred visuals:

- real screenshots
- real product GIFs
- live-demo badge
- feature tables
- product-flow diagrams

#### C. Engineering / AI Quality

Examples: TestPilotAgent, BaiyueMedicalSalesSystemTest, Pysystem, RAG demos.

Preferred structure:

Hero → workflow/demo → problem → Quick Start → architecture → testing/example → limitations → roadmap.

Preferred visuals:

- workflow diagrams
- architecture diagrams
- coverage/status tables
- test reports
- real screenshots where useful

## 5. Demo assets

- Real GIF > real screenshot > terminal preview / Mermaid diagram.
- Never fabricate a GIF or claim a demo exists when it does not.
- GIFs should demonstrate the core value, not merely animate the UI.
- A 10–20 second focused workflow is usually enough.

## 6. Badges

Use 3–6 high-signal badges.

Good categories:

- language/runtime
- release/version
- license
- supported platform
- supported agents/tools
- build/test status
- live demo/download

Do not badge every framework dependency.

## 7. Quick Start

Quick Start must be copyable and materially runnable.

Before writing it, inspect actual repository files such as:

- `package.json`
- `requirements.txt`
- `pyproject.toml`
- `Dockerfile`
- `docker-compose.yml`
- startup scripts
- `.env.example`

Never invent commands or reference scripts that do not exist.

If the project requires two processes, show both.

If a cloud/platform project has no local build, say so and document the real configuration flow instead.

## 8. Truthfulness and trust signals

Never fabricate:

- features
- screenshots
- GIFs
- releases
- download links
- test status
- supported platforms
- model/provider support
- roadmap completion
- performance claims

Useful trust sections include:

- Current Limitations
- Supported Platforms
- Testing
- Known Constraints
- Roadmap
- Contributing

Limitations are a trust signal, not a weakness.

## 9. Repository Description

Public repository descriptions should normally be:

- English
- one short sentence
- value-oriented
- usually <= 120 characters when practical
- free of long technology lists
- understandable without opening the README

Good:

```text
Local-first usage analytics for AI coding agents — tokens, models, sessions & cost.
```

Technology keywords belong mainly in Topics and the README.

The canonical expected descriptions are stored in `docs/repository-metadata.json`.

## 10. Repository Topics

Use roughly 4–8 focused topics.

Topics should describe domain, technology category, product type, and notable architecture.

The canonical expected topics are stored in `docs/repository-metadata.json`.

## 11. Metadata hierarchy

```text
Repository Name
    ↓
Description
    ↓
Topics
    ↓
README Hero
```

These four layers should reinforce the same positioning.

## 12. AI change protocol

When an AI modifies documentation:

1. Read this design system.
2. Inspect current code and configuration.
3. Classify the repository as Developer Tool, Product App, or Engineering / AI Quality.
4. Verify commands and claims.
5. Update English and Chinese READMEs together.
6. Preserve project-specific visual identity.
7. Update metadata expectations if positioning changes.
8. Run the README check task.
9. Report warnings separately from hard failures.

## 13. Check severity

Hard failures:

- missing English or Chinese README
- missing language switch
- typing animation in non-profile project README
- stale legacy template markers
- README references an npm script that does not exist
- README references a local startup script that does not exist

Warnings:

- Description differs from canonical metadata
- required Topics are missing
- more than 6 prominent badges
- no primary visual where a visual would materially help
- no limitations section for an engineering/AI project

Metadata checks remain warnings until repository-metadata write access is available and the canonical values have been applied.
