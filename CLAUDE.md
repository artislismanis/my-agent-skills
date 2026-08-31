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
CLAUDE.md                  # This file
.claude-plugin/
  marketplace.json         # Machine-readable plugin manifest (Claude plugin mechanism)
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
.claude/                   # Claude Code config (settings, commands, memory)
```

Single-type plugins (e.g. `skills`) may omit unused type subfolders (e.g., `agents` and `mcp-servers`).

## Plugin Package Standard

Each plugin folder is a self-contained Claude plugin package.

**`.claude-plugin/plugin.json`** declares plugin metadata: name, version, description,
and capabilities. Plugins install to `~/.claude/plugins/marketplaces/<marketplace>/<source-path>/`
via the Claude plugin mechanism, where `<source-path>` is the `source` field from
`marketplace.json`.

**`README.md`** (required in every plugin) covers:

- What the plugin is and why it exists
- What each included skill/agent/MCP server does
- Specific use case examples
- Installation instructions for each component type
- A **Sources and attribution** section whenever the plugin is derived from or inspired
  by external work: the source repo, its licence, what it contributed, and any
  deliberate deviations. Add a row to the Attribution table in the root README too.

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

| Scope                          | Path                                                                              |
| ------------------------------ | --------------------------------------------------------------------------------- |
| User-level                     | `~/.claude/skills/<skill-name>/`                                                  |
| Project-level                  | `.claude/skills/<skill-name>/`                                                    |
| Plugin-bundled                 | `~/.claude/plugins/marketplaces/<marketplace>/<source-path>/skills/<skill-name>/` |
| Legacy human-invocable command | `~/.claude/commands/<name>.md` (flat file)                                        |

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
- **Supported runtimes**: Node.js 22+ for JS/TS scripts, Python 3.12+ for Python scripts.
- Scripts in `skills/*/scripts/` must use self-contained dependency declarations to avoid
  requiring manual setup steps.
- Any cross-language use within a plugin requires a **Technology Decisions** section in
  the plugin's `README.md` with justification.

## Marketplace Files

**`README.md`** (root) serves as the GitHub homepage and human catalog: grouped by topic,
one-liner per plugin, install snippet, link to each plugin's README.

**`.claude-plugin/marketplace.json`** is the machine-readable manifest used by the
Claude plugin mechanism:

```json
{
	"name": "my-agent-skills",
	"owner": { "name": "Artis Lismanis" },
	"plugins": [
		{
			"name": "plugin-name",
			"source": "./plugins/topic/plugin-name",
			"description": "One-line description"
		}
	]
}
```

Users add this marketplace and install plugins via:

```text
/plugin marketplace add artislismanis/my-agent-skills
/plugin install plugin-name@my-agent-skills
```

Update both `README.md` and `.claude-plugin/marketplace.json` whenever a plugin is
added, moved, or removed.

## Branching (GitHub Flow)

All changes — including docs, config, and ad-hoc fixes — MUST be made on a
feature branch. Direct commits to `main` are not allowed.

```bash
git checkout -b <short-description>   # e.g. git checkout -b update-readme
# make changes, commit, then merge into main
```

A `PreToolUse` hook in `.claude/settings.json` enforces this by blocking `Edit`,
`Write`, and `NotebookEdit` calls when Claude is on `main`.

## Devcontainer Setup

The repository includes a VS Code devcontainer (`.devcontainer/`) that provides a
fully configured development environment — no manual setup required.

**What the devcontainer provides:**

- **Node.js 22** managed via nvm
- **Python 3.12** managed via uv
- **zsh** as default shell with Oh My Zsh, powerlevel10k theme, and Atuin shell history
  (all installed directly in the Dockerfile — no devcontainer features)
- **Claude Code CLI** installed globally via npm
- **CLI tools**: git, GitHub CLI (gh), jq, fzf, git-delta (configured as git pager)
- **VS Code extensions**: Claude Code, ESLint, Prettier, GitLens, markdownlint, Ruff,
  Python, EditorConfig, Markdown All in One, Markdown Mermaid
- **Pre-commit hooks** installed automatically on container creation

**Host font requirement:** Terminal fonts render on the host machine, not inside the
container. Install **MesloLGS NF** on your host OS for correct glyph rendering in the
powerlevel10k prompt. Download from the
[Powerlevel10k fonts page](https://github.com/romkatv/powerlevel10k#fonts). The
`p10k-rainbow` preset is used with prompt layout overrides from zsh-in-docker defaults.
MesloLGS NF is recommended — without it Nerd Font glyphs will be missing.

**To rebuild the container** (after changes to `.devcontainer/Dockerfile` or
`.devcontainer/devcontainer.json`): open the VS Code command palette and run
**"Dev Containers: Rebuild Container"**.

## Auto-mode Guardrails

These rules govern Claude Code operating in autonomous (`--dangerously-skip-permissions`) mode.

### Commit-per-iteration rule (advisory)

Claude MUST commit changes after completing each logical unit of work before proceeding
to the next: each coherent group of related file edits.

This rule is advisory — enforced via this CLAUDE.md guidance and Claude's system prompt,
not technically.

### No-verify prohibition

Claude MUST NOT use `--no-verify` to bypass pre-commit hooks. If a hook fails, fix
the underlying issue and recommit.

### Branch protection on `main` (enforced)

A `PreToolUse` hook in `.claude/settings.json` blocks `Edit`, `Write`, and
`NotebookEdit` calls when on the `main` branch. This is a separate, technically
enforced control — not an advisory rule.

### `--dangerously-skip-permissions` safety context

Inside the devcontainer, `--dangerously-skip-permissions` is safe to use due to
defence-in-depth:

1. **Firewall** — optional default-deny network boundary (activate with
   `sudo /usr/local/share/init-firewall.sh`)
2. **Non-root user** — container runs as `vscode` (UID 1000), limiting system access
3. **Container isolation** — process namespace isolated from host
4. **PreToolUse hook** — blocks writes to `main` branch

## Claude Code Defaults

Project-level defaults in `.claude/settings.json`:

- **Model**: `opusplan` — uses Opus for planning/thinking, Sonnet for execution
- **Default mode**: `plan` — Claude enters plan mode before making changes

## Active Technologies

- Dockerfile (container definition), Bash (firewall + setup scripts), YAML (pre-commit
  config), JSON (devcontainer.json), Markdown (documentation) + Docker/devcontainer
  spec, nvm, uv, Oh My Zsh, Atuin, pre-commit framework, Claude Code CLI
