# Feature Specification: Devcontainer with Secure Claude Code Environment

**Feature Branch**: `002-devcontainer-setup`
**Created**: 2026-03-22
**Status**: Draft
**Input**: User description: "Create a VS Code devcontainer with Node.js 22, Python 3.12, zsh/Oh My Zsh, Atuin, Claude Code CLI + extension, firewall security, pre-commit hooks, VS Code extensions/settings, auto-mode guardrails, and documentation updates."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Open Repository in Devcontainer (Priority: P1)

A developer clones or opens this repository in VS Code and launches the devcontainer. Within minutes they have a fully working environment with all runtimes, CLI tools, and editor integrations ready — no manual setup required.

**Why this priority**: This is the core value proposition. Without a working devcontainer, nothing else matters.

**Independent Test**: Can be fully tested by opening the repo in VS Code, clicking "Reopen in Container", and verifying that Node.js 22, Python 3.12, zsh, and all CLI tools are available in the terminal.

**Acceptance Scenarios**:

1. **Given** a fresh clone of the repository, **When** a developer opens it in VS Code and selects "Reopen in Container", **Then** the container builds successfully and opens with a zsh terminal, Node.js 22, Python 3.12, git, gh, jq, fzf, and git-delta all available on PATH in an interactive terminal.
2. **Given** the devcontainer is running, **When** the developer opens a terminal, **Then** zsh is the default shell with Oh My Zsh and Atuin history management active.
3. **Given** the devcontainer is running, **When** the developer checks installed VS Code extensions, **Then** Claude Code, ESLint, Prettier, GitLens, markdownlint, Ruff, and Python extensions are all installed and active.

---

### User Story 2 - Code Quality on Commit (Priority: P2)

A developer makes changes and commits. Pre-commit hooks automatically lint and format the staged files, catching issues before they enter the repository history.

**Why this priority**: Consistent code quality across all contributors prevents drift and reduces review burden. This works independently of the devcontainer (contributors outside it can install pre-commit manually).

**Independent Test**: Can be tested by modifying a Markdown file with trailing whitespace and a JS file with formatting issues, then running `git commit` and verifying hooks catch and fix both.

**Acceptance Scenarios**:

1. **Given** pre-commit hooks are installed, **When** a developer commits a Markdown file with linting violations, **Then** markdownlint reports the issues and the commit is blocked until they are fixed.
2. **Given** pre-commit hooks are installed, **When** a developer commits a JS/TS file, **Then** Prettier auto-formats the file (modifying it in place) and ESLint reports any errors (blocking the commit if errors are found); if Prettier modified files, the commit fails on first pass and the developer re-stages the modified files and commits again.
3. **Given** pre-commit hooks are installed, **When** a developer commits a Python file, **Then** Ruff auto-formats the file and blocks the commit if any lint errors remain after formatting; if Ruff modified files, the commit fails on first pass and the developer re-stages the modified files and commits again.
4. **Given** pre-commit hooks are installed, **When** a developer commits files with trailing whitespace or missing final newlines, **Then** the standard hooks fix these automatically (commit fails first pass; developer re-stages the fixed files and commits again).

---

### User Story 3 - Autonomous Claude Code Operation (Priority: P3)

A developer runs Claude Code in autonomous mode inside the devcontainer. The firewall restricts network access to only approved domains, and guardrails ensure each logical unit of work is committed — providing a safe, auditable environment for unattended AI-assisted development.

**Why this priority**: Autonomous operation is a power-user feature that builds on the secure container foundation. It requires the devcontainer (P1) to be working first.

**Independent Test**: Can be tested by running Claude Code with `--dangerously-skip-permissions` inside the container, verifying the firewall blocks unauthorized domains, and confirming that CLAUDE.md guardrails prompt regular commits.

**Acceptance Scenarios**:

1. **Given** the devcontainer is running with the firewall active, **When** a process attempts to connect to an unauthorized domain, **Then** the connection is blocked (the attempt will time out or be immediately refused depending on firewall policy — DROP causes timeout; REJECT causes immediate refusal).
2. **Given** the devcontainer is running with the firewall active, **When** Claude Code connects to the Claude API, GitHub, npm registry, or PyPI, **Then** the connections succeed.
3. **Given** Claude Code is running in auto mode, **When** it completes a logical unit of work, **Then** CLAUDE.md guidance directs it to commit changes before proceeding.
4. **Given** the devcontainer is running, **When** Claude Code attempts to write files on the `main` branch, **Then** the existing PreToolUse hook blocks the write.

---

### User Story 4 - Documentation and Onboarding (Priority: P4)

A new contributor reads the README and CLAUDE.md to understand how to use the devcontainer, what guardrails are in place for autonomous operation, and how pre-commit hooks work.

**Why this priority**: Documentation enables adoption but depends on the features being implemented first.

**Independent Test**: Can be tested by reading CLAUDE.md and README.md and verifying they contain devcontainer setup instructions, guardrail documentation, and pre-commit hook usage.

**Acceptance Scenarios**:

1. **Given** a new contributor reads the repository README, **When** they look for setup instructions, **Then** they find a devcontainer quick-start section explaining how to open in container.
2. **Given** a developer reads CLAUDE.md, **When** they look for auto-mode guidance, **Then** they find documented guardrails including commit-per-iteration rules and branch protection.

---

### Edge Cases

- What happens when the devcontainer is built on a machine without Docker? The build fails with a clear error from VS Code's Remote-Containers extension.
- What happens when a required runtime (Node.js, Python) fails to install during image build? The Docker build fails and no container is created. The developer sees a build error with the relevant install step.
- What happens when the firewall script fails to resolve a whitelisted domain? The script exits with an error. The firewall is manually activated (not auto-started), so the container continues to work without firewall protection; the error is reported to the developer.
- What happens when a contributor works outside the devcontainer without pre-commit installed? Commits proceed without hooks. The README documents how to install pre-commit manually.
- What happens when pre-commit hooks conflict with Claude Code's `--no-verify` behaviour? CLAUDE.md will document that Claude must never skip hooks (`--no-verify`) — if a hook fails, Claude must fix the issue and re-commit. This is reinforced by Claude's system prompt.
- What happens when Atuin is unavailable or fails to install? The container falls back to standard zsh history — Atuin is an enhancement, not a blocker.
- What happens when the devcontainer runs in GitHub Codespaces without NET_ADMIN/NET_RAW capabilities? The container starts normally. The firewall script requires manual activation and will fail if capabilities are unavailable — developers in Codespaces simply skip firewall activation and rely on Codespaces' own network isolation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The devcontainer MUST build successfully from the repository root using VS Code's "Reopen in Container" or equivalent devcontainer CLI. The container MUST run as the non-root `vscode` user; no processes run as root except the optional firewall activation via sudo.
- **FR-002**: The devcontainer MUST provide Node.js 22 managed via nvm as the default Node runtime.
- **FR-003**: The devcontainer MUST provide Python 3.12 managed via uv as the default Python runtime.
- **FR-004**: The devcontainer MUST use zsh as the default shell with Oh My Zsh installed.
- **FR-005**: The devcontainer MUST install Atuin for shell history management.
- **FR-006**: The devcontainer MUST pre-install these CLI tools: git, GitHub CLI (gh), jq, fzf, git-delta. git-delta MUST be configured as git's diff pager so that `git diff`, `git log -p`, and `git show` use delta's enhanced output automatically.
- **FR-007**: The devcontainer MUST install Claude Code CLI globally via npm.
- **FR-008**: The devcontainer MUST include a firewall script (`init-firewall.sh`) that enforces a default-deny policy on all traffic directions (INPUT, FORWARD, OUTPUT), permitting only whitelisted domains for outbound connections. The firewall is activated manually (not on container start) and documented in the README. It requires NET_ADMIN and NET_RAW Linux capabilities. Sudoers is configured for this script only — no other commands run as root. The firewall script MUST include self-verification tests that run at activation time. The script MUST output a clear status summary on completion: on success, the count of whitelisted domains; on failure, the step that failed with an actionable error message.
- **FR-009**: The firewall MUST allow connections to: npm registry, GitHub (web/api/git), Claude API, Sentry, Statsig, VS Code marketplace, and PyPI.
- **FR-010**: The devcontainer MUST pre-install these VS Code extensions: Claude Code, ESLint, Prettier, GitLens, markdownlint, Ruff, Python, EditorConfig, Markdown All in One, Markdown Mermaid.
- **FR-011**: The devcontainer MUST configure VS Code settings for format-on-save with Prettier as default formatter, ESLint fix-on-save, Ruff as Python formatter, and zsh as default terminal.
- **FR-012**: The devcontainer MUST persist command history and Claude Code configuration between container restarts via volume mounts.
- **FR-013**: The repository MUST include a pre-commit configuration that runs: Prettier (JS/TS/JSON/YAML), ESLint (JS/TS), Ruff (Python), markdownlint (Markdown), and standard hooks (trailing-whitespace, end-of-file-fixer, check-yaml, check-json, check-merge-conflict).
- **FR-014**: The devcontainer MUST auto-install pre-commit hooks during container creation.
- **FR-015**: The pre-commit configuration MUST work outside the devcontainer for contributors who install pre-commit manually.
- **FR-016**: CLAUDE.md MUST document auto-mode guardrails including the commit-per-iteration rule. A logical unit of work is defined as each task in `tasks.md` during speckit workflows, or each coherent group of related file edits outside speckit. Claude MUST commit after completing each such unit before proceeding to the next. Claude MUST NOT use `--no-verify` to skip pre-commit hooks. Note: the commit-per-iteration rule is advisory (enforced via CLAUDE.md guidance and Claude's system prompt); the branch protection on `main` is a separate, technically enforced control implemented via a pre-existing PreToolUse hook.
- **FR-017**: CLAUDE.md MUST document the devcontainer setup and usage.
- **FR-018**: The repository README MUST include a devcontainer quick-start section.
- **FR-019**: The devcontainer MUST be compatible with GitHub Codespaces. Since Codespaces may not provide NET_ADMIN/NET_RAW capabilities, the firewall is optional and manually activated; Codespaces environments rely on Codespaces' own network isolation.
- **FR-020**: The repository MUST include an `.editorconfig` file defining consistent editor settings: `indent_style: space`, `indent_size: 2` (4 for Python per PEP 8), `end_of_line: lf`, `insert_final_newline: true`, `charset: utf-8`, and `trim_trailing_whitespace: true` (false for Markdown where trailing whitespace is significant).

### Key Entities

- **Devcontainer Configuration**: The set of files (devcontainer.json, Dockerfile, init-firewall.sh) that define the container environment.
- **Firewall Whitelist**: The set of approved outbound domains and their resolution rules.
- **Pre-commit Configuration**: The hook definitions and tool versions that enforce code quality on commit.
- **Auto-mode Guardrails**: The CLAUDE.md rules and settings that govern Claude Code's autonomous behaviour.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can go from fresh clone to fully working environment in under 10 minutes (container build + start).
- **SC-002**: All 10 specified VS Code extensions are installed and active when the container starts.
- **SC-003**: Pre-commit hooks catch 100% of trailing whitespace, missing newlines, invalid YAML, and invalid JSON in staged files (pre-commit operates on staged files only).
- **SC-004**: The firewall blocks connections to unauthorized domains (verified by test against `example.com` at activation time — connection must fail).
- **SC-005**: The firewall permits connections to all whitelisted services (verified by test against `api.github.com` at activation time — connection must succeed).
- **SC-006**: Contributors outside the devcontainer can install and use pre-commit hooks with a single command documented in the README.

## Assumptions

- Docker (or a compatible container runtime) is available on the developer's machine.
- Contributors have VS Code with the Remote-Containers extension (or use GitHub Codespaces).
- The `debian:trixie` base image is used (Debian 13 LTS). zsh, Oh My Zsh, and powerlevel10k are installed directly in the Dockerfile (no devcontainer features). nvm manages Node.js and uv manages Python — providing precise version pinning for both runtimes.
- Docker image builds have unrestricted network access; the firewall only applies at container runtime when manually activated.
- `--dangerously-skip-permissions` for Claude Code is made safe by defence-in-depth: the firewall (primary runtime network boundary), the non-root `vscode` user (limits system access), container isolation (process namespace), and the existing PreToolUse hook (blocks writes on `main`). The PreToolUse hook is a pre-existing control implemented in `.claude/settings.json` — it is not created by this feature.
- The `.claude` bind mount gives the container access to the developer's host `~/.claude` directory, which may include API credentials and session tokens. This is intentional — it allows Claude Code to use existing credentials. Developers are responsible for not committing credential files to the repository.
- PyPI (pypi.org, files.pythonhosted.org) is added to the firewall whitelist beyond the reference implementation's defaults, to support uv/pip operations.
- Atuin installation uses the official install script; if it fails, the container still starts successfully with standard zsh history as fallback.
- The pre-commit framework is installed via uv/pip inside the devcontainer and via contributor's own Python environment outside it. Contributors using pre-commit outside the devcontainer are assumed to have Python 3 and pip available on their host machine (required to run the single-command install documented in the README).
- Prettier respects `.editorconfig` by default (since Prettier v2.0), so `.editorconfig` and Prettier configuration work in concert without conflicts.
