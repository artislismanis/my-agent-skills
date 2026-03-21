# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo Purpose

Personal Claude plugin marketplace hosted on GitHub. Contains topic-organised plugin
packages — each bundling skills, agents, and/or MCP servers — plus best-practice
documentation, reusable configs, and templates. Plugins are designed to be installable
directly from this repo via the Claude plugin mechanism.

## Repo Structure

```text
README.md                  # Human-readable marketplace catalog (GitHub homepage)
marketplace.yml            # Machine-readable plugin manifest
CLAUDE.md                  # This file
docs/
  best-practices/          # AI/agent development guides
  templates/               # Reusable prompt and config templates
configs/
  system-prompts/          # Reusable system prompts
  agent-configs/           # Reusable agent configuration files
plugins/
  <topic>/                 # e.g. coding/, productivity/, devops/
    <plugin-name>/         # Self-contained plugin package
      README.md
      .claude-plugin/
        plugin.json        # Plugin metadata
      .mcp.json            # MCP server config (if plugin includes servers)
      skills/
        <skill-name>/
          SKILL.md
          scripts/         # Optional
          references/      # Optional
          assets/          # Optional
      agents/
        <agent-name>/
          agent.md
      mcp-servers/
        <server-name>/
          README.md
          src/
          package.json or pyproject.toml
specs/                     # Speckit feature specs (plugin development work only)
.specify/                  # Speckit framework
.claude/                   # Claude Code config (settings, commands, memory)
```

Single-type plugins (e.g. `skills`) may omit unused type subfolders (e.g., `agents` and `mcp-servers`).

## Plugin Package Standard

Each plugin folder is a self-contained Claude plugin package.

**`.claude-plugin/plugin.json`** declares plugin metadata: name, version, description,
and capabilities. Plugins install to `~/.claude/plugins/<plugin-name>/` via the Claude
plugin mechanism.

**`README.md`** (required in every plugin) covers:

- What the plugin is and why it exists
- What each included skill/agent/MCP server does
- Specific use case examples
- Installation instructions for each component type

## Skills (agentskills.io format)

Each skill is a **folder** — not a flat file — containing `SKILL.md` at its root.

```text
skill-name/
├── SKILL.md          # Required
├── scripts/          # Optional: executable code
├── references/       # Optional: reference docs loaded on demand
└── assets/           # Optional: templates, images, data files
```

**`SKILL.md` frontmatter**:

| Field           | Required | Notes                                                         |
| --------------- | -------- | ------------------------------------------------------------- |
| `name`          | Yes      | Lowercase, hyphens only, max 64 chars; must match folder name |
| `description`   | Yes      | What it does AND when to use it — drives auto-invocation      |
| `license`       | No       |                                                               |
| `compatibility` | No       | Environment/tool requirements                                 |
| `metadata`      | No       | Arbitrary key-value pairs (author, version, etc.)             |
| `allowed-tools` | No       | Space-delimited pre-approved tools (experimental)             |

Claude Code-specific extensions: `disable-model-invocation`, `user-invocable`,
`context: fork`, `effort`, `agent`.

**Scripts** in `scripts/` should use self-contained dependency declarations so they run
without external setup: PEP 723 inline deps for Python; `npm:`/`jsr:` imports for Deno;
auto-install for Bun.

**Installation paths** — depends on scenario:

| Scope                          | Path                                                   |
| ------------------------------ | ------------------------------------------------------ |
| User-level                     | `~/.claude/skills/<skill-name>/`                       |
| Project-level                  | `.claude/skills/<skill-name>/`                         |
| Plugin-bundled                 | `~/.claude/plugins/<plugin-name>/skills/<skill-name>/` |
| Legacy human-invocable command | `~/.claude/commands/<name>.md` (flat file)             |

## Agents

Agent definitions live in `agents/<agent-name>/agent.md` within the plugin folder.
Each file contains: system prompt, context window guidance, and example invocations.

## MCP Servers

Follow the [Model Context Protocol](https://modelcontextprotocol.io) specification
(JSON-RPC 2.0). Server configuration declared in `.mcp.json` at the plugin root.

- **TypeScript/Node**: `package.json` + `tsconfig.json`, entry point in `src/index.ts`
- **Python**: `pyproject.toml`, source in `src/`

Installable via `claude mcp add` from npm/PyPI or directly from GitHub.

## Technology Rules

- Choose **one primary language** per plugin: Python, TypeScript/Node, or Bash.
- Scripts in `skills/*/scripts/` must use self-contained dependency declarations to avoid
  requiring manual setup steps.
- Any cross-language use within a plugin requires a **Technology Decisions** section in
  the plugin's `README.md` with justification.

## Marketplace Files

**`README.md`** (root) serves as the GitHub homepage and human catalog: grouped by topic,
one-liner per plugin, install snippet, link to each plugin's README.

**`marketplace.yml`** is the machine-readable manifest:

```yaml
plugins:
  - name: plugin-name
    path: plugins/topic/plugin-name/
    description: One-line description
    types: [skill, mcp-server] # skill | agent | mcp-server
    tags: [coding, review]
    install: '/plugin install owner/repo/plugins/topic/plugin-name'
```

Update both files whenever a plugin is added, moved, or removed.

## Developing New Plugins (speckit workflow)

New plugin development uses the speckit pipeline:

1. `/speckit.specify "description"` — creates branch + `specs/<branch>/spec.md`
2. `/speckit.clarify` — resolve spec ambiguities
3. `/speckit.plan` — implementation plan (includes constitution check)
4. `/speckit.tasks` — generate task list
5. `/speckit.implement` — execute tasks

Plugin source lands in `plugins/<topic>/<plugin-name>/`; speckit artifacts live in
`specs/<branch>/`. After implementation, update `README.md` and `marketplace.yml`.

Speckit commands are defined in `.claude/commands/speckit.*.md`. Key scripts:

- `.specify/scripts/bash/create-new-feature.sh "" --json --short-name "name" "description"` — creates feature branch + spec. Never pass `--number`.
- `.specify/scripts/bash/setup-plan.sh` — copies plan template; run from a `###-` branch.

Constitution at `.specify/memory/constitution.md` (v1.0.0). Every `plan.md` must include
a Constitution Check. Principles: Spec-First, Test-First, User Story Independence,
MVP-First, Simplicity (YAGNI).
