# Research: Devcontainer Setup

**Feature**: 002-devcontainer-setup
**Date**: 2026-03-22

## R1: Base Image Strategy

**Decision**: Use `debian:bookworm` as the base image, then install Node.js via nvm
and Python via uv for fully version-pinned runtimes.

**Rationale**: A plain Debian base with nvm + uv gives precise control over exact
runtime versions (e.g., `22.11.0` not just `22.x`). Version pins are declared in
`.nvmrc` (Node) and managed by uv (Python), making updates explicit and auditable
without rebuilding the container image. This approach treats runtimes as managed
dependencies rather than image-level assumptions.

The reference implementation uses `node:20` as a base image, but that couples the
Node version to the Docker image tag. For a development environment where
reproducibility matters, nvm provides better flexibility.

**Alternatives considered**:

- `node:22-bookworm` — simpler but only pins to major version (22.x); no `.nvmrc`
  support; version updates require image rebuild
- `node:22-alpine` — musl-based, compatibility issues with some npm packages
- `ubuntu:24.04` — viable but Bookworm aligns with reference (Debian-based)

## R2: nvm for Node.js Version Management

**Decision**: Install nvm and use `.nvmrc` to pin the exact Node.js version.

**Rationale**: nvm enables:

- Exact version pinning via `.nvmrc` (e.g., `22.11.0`)
- Version updates without rebuilding the container (just edit `.nvmrc` + `nvm install`)
- Consistency with local development outside the container
- Standard ecosystem pattern familiar to Node developers

**Install approach**:

```dockerfile
# Install nvm
ENV NVM_DIR=/home/vscode/.nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# Install Node version from .nvmrc or explicit version
RUN . "$NVM_DIR/nvm.sh" && nvm install 22 && nvm alias default 22
```

A `.nvmrc` file at the repo root pins the version for all contributors:

```text
22
```

**Shell integration**: nvm must be sourced in zsh profile for interactive use.
The Dockerfile handles this via the nvm install script which adds sourcing to
`.bashrc`/`.zshrc` automatically.

## R3: Python via uv

**Decision**: Install uv via multi-stage COPY, then use `uv python install 3.12` to
provide Python 3.12.

**Rationale**: uv manages Python installations natively (no need for apt python packages
or pyenv). The `COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/` pattern is
the recommended Docker approach — fast, no network fetch at build time for uv itself.

**Install sequence**:

```dockerfile
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
RUN uv python install 3.12
```

**Alternatives considered**:

- `apt-get install python3.12` — not available on Bookworm (ships 3.11)
- pyenv — slower, more complex than uv for this use case
- deadsnakes PPA — Ubuntu-only, not available on Debian

## R4: Atuin Installation

**Decision**: Install Atuin CLI via the official install script, local-only mode (no server).

**Rationale**: Atuin's installer (`https://setup.atuin.sh`) downloads the appropriate
binary from GitHub releases. No server is needed for local shell history — the CLI
stores history in a local SQLite database by default.

**Install command**:

```bash
curl --proto '=https' --tlsv1.2 -LsSf https://setup.atuin.sh | sh
```

**Shell integration**: Add to `.zshrc`:

```bash
eval "$(atuin init zsh)"
```

**Fallback**: If Atuin install fails (network issue, unsupported arch), the container
starts normally with standard zsh history. Atuin is an enhancement, not a blocker.

**Firewall domains needed** (build-time only — Docker build has unrestricted network):

- `setup.atuin.sh` — installer script
- `github.com` — already whitelisted (release downloads)

## R5: Pre-commit Hook Configuration

**Decision**: Use the `pre-commit` Python framework with these hook repos:

| Hook | Repo | Purpose |
| ---- | ---- | ------- |
| Standard hooks | `pre-commit/pre-commit-hooks` | trailing-whitespace, end-of-file-fixer, check-yaml, check-json, check-merge-conflict |
| Prettier | `pre-commit/mirrors-prettier` | JS/TS/JSON/YAML formatting |
| ESLint | `pre-commit/mirrors-eslint` | JS/TS linting |
| Ruff | `astral-sh/ruff-pre-commit` | Python lint + format (ruff-check, ruff-format) |
| markdownlint | `DavidAnson/markdownlint-cli2` | Markdown linting |

**Rationale**: `pre-commit` is language-agnostic (Python-based but manages hooks for
any language). Mirror repos for Prettier/ESLint avoid requiring a global Node
installation for hooks (pre-commit manages its own environments). Ruff's official
pre-commit hook is fast and replaces multiple Python tools.

**Install in devcontainer**: `postCreateCommand` runs `pre-commit install`.
**Install outside**: Contributors run `pip install pre-commit && pre-commit install`.

**Alternatives considered**:

- Husky (Node-based) — requires package.json at repo root; this isn't a Node monorepo
- lint-staged — complements Husky but same limitation
- lefthook — viable alternative, but pre-commit has wider ecosystem and Python is available via uv

## R6: Firewall Whitelist — Additional Domains

**Decision**: Add these domains beyond the reference implementation's whitelist:

| Domain | Purpose |
| ------ | ------- |
| `pypi.org` | Python package index API |
| `files.pythonhosted.org` | Python package file downloads |
| `setup.atuin.sh` | Atuin installer (if re-installed at runtime) |

**Rationale**: uv/pip need PyPI access for package management. The reference already
covers npm, GitHub, Claude API, Sentry, Statsig, and VS Code marketplace. GitHub
(already whitelisted) covers Atuin release downloads.

**Note**: The firewall is manually activated (not auto-started on container start).
Codespaces environments without NET_ADMIN/NET_RAW capabilities simply skip firewall
activation and rely on Codespaces' own network isolation. Build-time (Dockerfile RUN
commands) has unrestricted Docker network and doesn't need whitelist entries.

## R7: Devcontainer User Model

**Decision**: Use the `ghcr.io/devcontainers/features/common-utils` devcontainer feature
to create a `vscode` user (UID 1000). Set `remoteUser: "vscode"` in `devcontainer.json`.

**Rationale**: `debian:bookworm` has **no non-root users** — only system accounts with
`/usr/sbin/nologin` shells. The `node:22-bookworm` pattern (which the original research
assumed) doesn't apply when switching to a plain Debian base.

The `common-utils` feature is the standard devcontainer ecosystem approach for adding a
non-root user. It:

- Creates a `vscode` user at UID 1000 with sudo access
- Installs zsh, Oh My Zsh, and common CLI utilities
- Is the mechanism used by all official Microsoft devcontainer images
- Reduces custom Dockerfile complexity (zsh/Oh My Zsh no longer needs manual installation)

VS Code does NOT auto-create users — the `remoteUser` in `devcontainer.json` must
reference an existing user, which `common-utils` provides.

**uv/Python ownership**: uv installs Python under the user's home directory by default,
so no permission issues. Pre-commit also installs per-user. The firewall script needs
root, so sudoers is configured for just that one script.

## R8: Pre-commit and Claude Code Interaction

**Decision**: Document in CLAUDE.md that Claude must never use `--no-verify` to skip hooks.

**Rationale**: Claude Code's system prompt already instructs it not to skip hooks.
The CLAUDE.md guardrails reinforce this with project-specific context. If a pre-commit
hook fails, Claude should fix the issue and re-commit (matching existing system prompt
behaviour).

## R9: IP Aggregation — Skip `aggregate` Tool

**Decision**: Skip the `aggregate` tool. Pipe GitHub CIDRs directly into ipset without
aggregation.

**Rationale**: The reference implementation uses `aggregate` (a Debian package available
as `apt-get install aggregate`) to merge adjacent IPv4 CIDR prefixes before adding them
to ipset. However, aggregation is an optimisation that is unnecessary here:

- GitHub's meta API returns ~20-40 CIDR ranges — well within ipset's efficient range
- `ipset hash:net` handles thousands of entries with O(1) lookup per packet
- The container is short-lived; saving milliseconds of startup time is irrelevant
- Removing `aggregate` simplifies the firewall script and reduces package dependencies

**Implementation**: Add CIDRs directly to ipset with duplicate handling:

```bash
jq -r '(.web + .api + .git)[]' <<< "$github_meta" | while read -r cidr; do
    ipset add allowed-domains "$cidr" 2>/dev/null || true
done
```

The `2>/dev/null || true` handles any duplicate or overlapping CIDRs gracefully.

## R10: EditorConfig

**Decision**: Add `.editorconfig` at the repo root defining consistent formatting
rules for all file types.

**Rationale**: `.editorconfig` is a cross-editor standard (supported natively by VS Code
with the `EditorConfig.EditorConfig` extension, and by most other editors/IDEs).
It provides a single source of truth for indentation, line endings, and trailing
whitespace — ensuring consistency across contributors regardless of their editor.

Prettier respects `.editorconfig` by default since v2.0 (`--editorconfig` flag defaults
to `true`). This means `.editorconfig` and Prettier work in concert: `.editorconfig`
sets the baseline, and Prettier-specific settings in `.prettierrc` can override where needed.

**Settings**:

| Glob | `indent_style` | `indent_size` | Notes |
| ---- | -------------- | ------------- | ----- |
| `*` (default) | space | 2 | Universal baseline |
| `*.py` | space | 4 | PEP 8 standard |
| `*.md` | space | 2 | `trim_trailing_whitespace: false` (Markdown line breaks) |
| `Makefile` | tab | — | Required by Make syntax |

All files: `end_of_line: lf`, `insert_final_newline: true`, `charset: utf-8`.
