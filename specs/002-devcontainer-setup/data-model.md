# Data Model: Devcontainer Setup

**Feature**: 002-devcontainer-setup
**Date**: 2026-03-22

This feature is infrastructure configuration — no application data model. The
"entities" are configuration files and their relationships.

## Configuration Entities

### Devcontainer Configuration (`devcontainer.json`)

| Field | Value / Purpose |
| ----- | --------------- |
| `build.dockerfile` | References `.devcontainer/Dockerfile` |
| `features` | `ghcr.io/devcontainers/features/common-utils` — creates `vscode` user, installs zsh + Oh My Zsh |
| `runArgs` | `["--cap-add=NET_ADMIN", "--cap-add=NET_RAW"]` — capabilities for optional firewall |
| `remoteUser` | `"vscode"` — non-root user created by `common-utils` feature |
| `customizations.vscode.extensions` | See extension list below |
| `customizations.vscode.settings` | See VS Code settings below |
| `mounts` | See volume mounts below |
| `containerEnv` | Environment variables (NVM_DIR, CLAUDE_CONFIG_DIR) |
| `postCreateCommand` | `pre-commit install` — installs git hooks once on container create/rebuild |
| `postStartCommand` | _(none — firewall is manually activated via `sudo .devcontainer/init-firewall.sh`)_ |

**VS Code Extensions** (FR-010):

| Extension ID | Name |
| ------------ | ---- |
| `anthropic.claude-code` | Claude Code |
| `dbaeumer.vscode-eslint` | ESLint |
| `esbenp.prettier-vscode` | Prettier |
| `eamodio.gitlens` | GitLens |
| `DavidAnson.vscode-markdownlint` | markdownlint |
| `charliermarsh.ruff` | Ruff |
| `ms-python.python` | Python |
| `EditorConfig.EditorConfig` | EditorConfig |
| `yzhang.markdown-all-in-one` | Markdown All in One |
| `bierner.markdown-mermaid` | Markdown Mermaid |

**VS Code Settings** (FR-011):

| Setting | Value |
| ------- | ----- |
| `editor.formatOnSave` | `true` |
| `editor.defaultFormatter` | `"esbenp.prettier-vscode"` |
| `editor.codeActionsOnSave` | `{ "source.fixAll.eslint": "explicit" }` |
| `[python].editor.defaultFormatter` | `"charliermarsh.ruff"` |
| `terminal.integrated.defaultProfile.linux` | `"zsh"` |
| `markdownlint.config` | `{ "default": true }` |

**Volume Mounts** (FR-012):

| Mount | Type | Purpose |
| ----- | ---- | ------- |
| `devcontainer-history:/commandhistory` | Named volume | Shell history persistence across restarts |
| `~/.claude:/home/vscode/.claude` | Bind mount | Claude Code configuration persistence |

### Dockerfile

| Layer | Purpose |
| ----- | ------- |
| Base image | `debian:bookworm` — clean Debian base for version-pinned runtimes |
| System packages | `git gh jq fzf curl iptables ipset iproute2 dnsutils` — CLI tools and firewall utilities |
| nvm + Node.js | nvm installed to `/home/vscode/.nvm`, then `nvm install 22`; version pinned via `.nvmrc` |
| uv + Python | Multi-stage copy of uv binary, then `uv python install 3.12` |
| Atuin | CLI install via official script, local-only mode (falls back gracefully if install fails) |
| git-delta | Downloaded from GitHub releases |
| Claude Code | `npm install -g @anthropic-ai/claude-code@latest` |
| Firewall script | Copied to `.devcontainer/init-firewall.sh`; sudoers configured for root execution |

Note: zsh and Oh My Zsh are installed by the `common-utils` devcontainer feature, not
the Dockerfile. The `node` user is replaced by the `vscode` user created by the same
feature.

### Firewall Script (`init-firewall.sh`)

The firewall is **manually activated** — not run on container start. Activate with:

```bash
sudo .devcontainer/init-firewall.sh
```

| Component | Purpose |
| --------- | ------- |
| Docker DNS preservation | Save and restore internal DNS rules before flush |
| ipset `allowed-domains` | `hash:net` set for whitelisted IP ranges |
| GitHub IP ranges | Fetched from GitHub meta API; added directly to ipset (no aggregation) |
| Static domain resolution | DNS lookup for each whitelisted domain |
| Default-deny policy | INPUT, FORWARD, OUTPUT all DROP |
| Verification tests | Block test (`example.com`) + allow test (`api.github.com`) |

Note: `aggregate` is NOT used. GitHub CIDRs (~20-40 ranges) are piped directly into
ipset. See R9 in research.md for rationale.

### Firewall Whitelist

| Domain | Purpose |
| ------ | ------- |
| `registry.npmjs.org` | npm packages |
| `api.github.com` + GitHub IP ranges | GitHub API, web, git |
| `api.anthropic.com` | Claude API |
| `sentry.io` | Error reporting |
| `statsig.anthropic.com`, `statsig.com` | Feature flags |
| `marketplace.visualstudio.com` | VS Code extensions |
| `vscode.blob.core.windows.net` | VS Code extension binaries |
| `update.code.visualstudio.com` | VS Code updates |
| `pypi.org` | Python package index |
| `files.pythonhosted.org` | Python package downloads |

### Pre-commit Configuration (`.pre-commit-config.yaml`)

| Hook repo | Hooks | Files targeted |
| --------- | ----- | -------------- |
| `pre-commit/pre-commit-hooks` | trailing-whitespace, end-of-file-fixer, check-yaml, check-json, check-merge-conflict | All |
| `pre-commit/mirrors-prettier` | prettier | JS, TS, JSON, YAML |
| `pre-commit/mirrors-eslint` | eslint | JS, TS |
| `astral-sh/ruff-pre-commit` | ruff-check, ruff-format | Python |
| `DavidAnson/markdownlint-cli2` | markdownlint-cli2 | Markdown |

### EditorConfig (`.editorconfig`)

| Glob | indent\_style | indent\_size | trim\_trailing\_whitespace | Notes |
| ---- | ------------- | ------------ | -------------------------- | ----- |
| `*` | space | 2 | true | Universal baseline |
| `*.py` | space | 4 | true | PEP 8 |
| `*.md` | space | 2 | false | Trailing whitespace = line break in Markdown |
| `Makefile` | tab | — | true | Required by Make syntax |

All files: `end_of_line: lf`, `insert_final_newline: true`, `charset: utf-8`.

## Relationships

```text
devcontainer.json
  ├── references → Dockerfile (build.dockerfile)
  ├── uses feature → common-utils (creates vscode user, installs zsh/omz)
  ├── references → init-firewall.sh (manual activation only)
  ├── triggers → pre-commit install (postCreateCommand)
  └── configures → VS Code extensions + settings

Dockerfile
  ├── installs → nvm + Node.js (pinned via .nvmrc)
  ├── installs → uv + Python 3.12
  ├── installs → Atuin, git-delta, Claude Code CLI
  └── copies → init-firewall.sh (with sudoers)

init-firewall.sh
  └── enforces → Firewall Whitelist (manual activation only)

.pre-commit-config.yaml
  └── independent of devcontainer (works standalone)

.editorconfig
  └── independent of devcontainer (read by any editor with EditorConfig support)

.nvmrc
  └── pins → Node.js version (read by nvm inside container + local dev)
```
