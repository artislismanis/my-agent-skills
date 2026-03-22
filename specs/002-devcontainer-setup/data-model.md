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
| `runArgs` | `["--cap-add=NET_ADMIN", "--cap-add=NET_RAW"]` — capabilities for optional firewall |
| `remoteUser` | `"vscode"` — non-root user created and fully configured in Dockerfile |
| `customizations.vscode.extensions` | See extension list below |
| `customizations.vscode.settings` | See VS Code settings below |
| `mounts` | See volume mounts below |
| `containerEnv` | `NVM_DIR=/home/vscode/.nvm`, `CLAUDE_CONFIG_DIR=/home/vscode/.claude` |
| `postCreateCommand` | `pre-commit install` — installs git hooks once on container create/rebuild (pre-commit binary installed in Dockerfile) |
| `postStartCommand` | _(none — firewall is manually activated via `sudo /usr/local/share/init-firewall.sh`)_ |

Note: No devcontainer features are used. zsh, Oh My Zsh, and powerlevel10k are installed
directly in the Dockerfile for 100% control and a single-source user setup.

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
| `terminal.integrated.fontFamily` | `"MesloLGS NF, monospace"` — recommended for powerlevel10k glyphs; falls back gracefully if font not installed on host |
| `markdownlint.config` | `{ "default": true }` |

**Volume Mounts** (FR-012):

| Mount | Type | devcontainer.json format |
| ----- | ---- | ------------------------ |
| Shell history | Named volume | `source=devcontainer-history, target=/commandhistory, type=volume` — `HISTFILE` set to `/commandhistory/.zsh_history` in Dockerfile |
| Claude config | Bind mount | `source=${localEnv:HOME}/.claude, target=/home/vscode/.claude, type=bind, consistency=cached` |

Note: `${localEnv:HOME}` resolves to the host user's home directory at container start time.

### Dockerfile

Dockerfile layers run in this order (user context shown):

| Layer | User | Purpose |
| ----- | ---- | ------- |
| Base image | root | `debian:bookworm` — clean Debian base for version-pinned runtimes |
| System packages | root | `curl git jq fzf zsh sudo iptables ipset iproute2 dnsutils` — CLI tools, zsh, firewall utilities; `curl` installed here so it is available for subsequent layers |
| GitHub CLI apt repo + install | root | Add `https://cli.github.com/packages` apt source + keyring (using `curl` from prior layer); install `gh` — not in Debian bookworm base repos; separate layer because it requires a third-party apt repo |
| uv (binary copy) | root | `COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/` — uv binary copied before user switch |
| git-delta | root | Download latest release from GitHub releases (version: latest at build time — display tool, not a runtime) |
| vscode user | root | `groupadd -g 1000 vscode && useradd -m -u 1000 -g 1000 -s /bin/zsh vscode` — user created with zsh as default shell |
| Firewall script | root | Copy to `/usr/local/share/init-firewall.sh`; create `/etc/sudoers.d/vscode-firewall` allowing `vscode` to run that script as root only |
| Switch to vscode user | — | `USER vscode` + `WORKDIR /home/vscode` + `ENV PATH="/home/vscode/.local/bin:${PATH}"` — all subsequent layers install per-user; PATH extended so `uv tool install` binaries are reachable |
| Oh My Zsh | vscode | Install via `--unattended` official installer; creates `~/.zshrc` with OMZ setup and default `robbyrussell` theme |
| Powerlevel10k | vscode | `git clone` into `~/.oh-my-zsh/custom/themes/powerlevel10k`; update `ZSH_THEME` in `.zshrc`; copy `p10k-lean.zsh` preset to `~/.p10k.zsh` |
| p10k shell config | vscode | Prepend instant-prompt block to top of `.zshrc`; append `source ~/.p10k.zsh` to bottom |
| Shell history | vscode | `mkdir -p /commandhistory` + `ENV HISTFILE=/commandhistory/.zsh_history` — wires zsh history to the named volume mount so history persists across container rebuilds |
| nvm + Node.js | vscode | nvm `v0.40.1` installed to `/home/vscode/.nvm` via official install script (auto-adds sourcing to `.zshrc`); then `nvm install 22 && nvm alias default 22` |
| Python | vscode | `uv python install 3.12` — installs to user's uv-managed Python store |
| pre-commit | vscode | `uv tool install pre-commit` — installed after Python 3.12 so uv uses that interpreter; binary lands in `~/.local/bin/pre-commit` (on PATH via ENV set at user switch); no `--break-system-packages` needed |
| Atuin | vscode | Install via `https://setup.atuin.sh` (local-only mode); append `eval "$(atuin init zsh)"` to `/home/vscode/.zshrc`; falls back gracefully if install fails |
| git-delta pager | vscode | `git config --global core.pager delta` — configure delta as default git diff pager |
| Claude Code | vscode | `npm install -g @anthropic-ai/claude-code@latest` (uses nvm-managed npm) |

Note: zsh, Oh My Zsh, and powerlevel10k are installed directly in the Dockerfile — no
devcontainer features are used. This gives 100% control over user and shell setup in a
single build stage.

### Firewall Script (`init-firewall.sh`)

The firewall is **manually activated** — not run on container start. Activate with:

```bash
sudo /usr/local/share/init-firewall.sh
```

| Component | Purpose |
| --------- | ------- |
| Docker DNS preservation | Save existing DOCKER-USER/DOCKER chain rules; restore after flush so container networking remains intact |
| ipset `allowed-domains` | `hash:net` set for whitelisted IP ranges; created with `ipset create allowed-domains hash:net` |
| GitHub IP ranges | Fetched from `https://api.github.com/meta`; extract `.web[]`, `.api[]`, `.git[]` CIDR arrays; add directly to ipset (no aggregation) |
| Static domain resolution | `dig +short <domain>` for each whitelisted hostname; all resolved IPs added to ipset |
| Default-deny policy | `iptables -P INPUT DROP`, `iptables -P FORWARD DROP`, `iptables -P OUTPUT DROP` |
| Verification tests | Block: `curl --max-time 5 https://example.com` must fail (exit non-zero); Allow: `curl --max-time 10 https://api.github.com` must succeed (exit zero) |

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

**Hook version strategy**: Pin each hook repo to a specific `rev` tag at implementation time (use latest stable release). Update periodically via `pre-commit autoupdate`.

**ESLint `additional_dependencies`**: The `mirrors-eslint` hook requires `additional_dependencies: [eslint]` (at minimum) to initialise its isolated environment. Since this repo currently has no JS/TS files, the hook will not run on any files — but the dependency must be declared for hook initialisation to succeed.

**Prettier config**: No `.prettierrc` required — Prettier defaults are acceptable. `.editorconfig` values (indent, line endings) are respected automatically since Prettier v2.0.

**ESLint config**: No `.eslintrc` required as a deliverable for this feature — the repo has no JS/TS source files. Add an ESLint config when JS/TS code is introduced.

### EditorConfig (`.editorconfig`)

| Glob | indent\_style | indent\_size | trim\_trailing\_whitespace | Notes |
| ---- | ------------- | ------------ | -------------------------- | ----- |
| `*` | space | 2 | true | Universal baseline |
| `*.py` | space | 4 | true | PEP 8 |
| `*.md` | space | 2 | false | Trailing whitespace = line break in Markdown |
| `Makefile` | tab | — | true | Required by Make syntax |

All files: `end_of_line: lf`, `insert_final_newline: true`, `charset: utf-8`.

### Documentation Updates

**README.md quick-start section** (FR-018) must cover:

1. Prerequisites: Docker Desktop (or Colima/Podman), VS Code, Remote-Containers extension
2. Steps: clone → open in VS Code → "Reopen in Container" → wait for build
3. Firewall section (local Docker only — not applicable in Codespaces): activate with `sudo /usr/local/share/init-firewall.sh`; explain when to activate (recommended before running Claude Code in auto mode) and what the output means
4. Outside container: `pip install pre-commit && pre-commit install` (requires Python 3 + pip)
5. When to rebuild: after changes to `Dockerfile` or `devcontainer.json`

**CLAUDE.md devcontainer section** (FR-017) must cover:

1. What the devcontainer provides (runtimes, tools, extensions)
2. How to rebuild after config changes
3. Auto-mode guardrails: commit-per-iteration rule (advisory), branch protection (enforced), `--no-verify` prohibition

## Relationships

```text
devcontainer.json
  ├── references → Dockerfile (build.dockerfile)
  ├── references → init-firewall.sh (manual activation only)
  ├── triggers → pre-commit install (postCreateCommand)
  └── configures → VS Code extensions + settings

Dockerfile
  ├── creates → vscode user (UID 1000, zsh default shell)
  ├── installs → zsh + Oh My Zsh + powerlevel10k (shell environment)
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
