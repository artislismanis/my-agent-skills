# Implementation Plan: Devcontainer with Secure Claude Code Environment

**Branch**: `002-devcontainer-setup` | **Date**: 2026-03-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-devcontainer-setup/spec.md`

## Summary

Create a VS Code devcontainer providing Node.js 22 (nvm), Python 3.12 (uv), zsh/Oh My Zsh, Atuin, Claude Code CLI, firewall-secured networking, pre-commit hooks for multi-language linting, and documented auto-mode guardrails. Based on the Claude Code reference implementation with additions for nvm, uv, Python, Atuin, pre-commit, and project-specific tooling. Uses `debian:bookworm` base with nvm + uv for fully version-pinned runtimes (R1/R2).

## Technical Context

**Language/Version**: Dockerfile (container definition), Bash (firewall + setup scripts), YAML (pre-commit config), JSON (devcontainer.json), Markdown (documentation)
**Primary Dependencies**: Docker/devcontainer spec, nvm, uv, Oh My Zsh, Atuin, pre-commit framework, Claude Code CLI
**Storage**: N/A — configuration files only
**Testing**: Manual validation (container build, firewall tests, pre-commit hook execution); automated firewall self-test in init-firewall.sh
**Target Platform**: VS Code Dev Containers, GitHub Codespaces, local Docker
**Project Type**: Infrastructure/config — devcontainer + tooling configuration
**Performance Goals**: Container build < 10 minutes on standard hardware
**Constraints**: Must be compatible with both local Docker and GitHub Codespaces; firewall requires NET_ADMIN + NET_RAW capabilities
**Scale/Scope**: Single-developer container; supports the my-agent-skills repo structure

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
| --------- | ------ | ----- |
| I. Spec-First | PASS | spec.md written and reviewed before this plan |
| II. Test-First | PASS | Firewall self-test validates security at startup; pre-commit hooks are testable via git commit; acceptance scenarios define verification steps. Note: this is infrastructure config, not application code — "tests" are validation scripts and manual verification |
| III. User Story Independence | PASS | P1 (devcontainer) works standalone; P2 (pre-commit) works inside and outside container; P3 (auto-mode) builds on P1; P4 (docs) depends on features existing |
| IV. Incremental Delivery | PASS | P1 must be complete before P2/P3; each priority tier is independently demonstrable |
| V. Simplicity (YAGNI) | PASS | Following proven reference implementation; adding only what's specified (nvm, uv, Atuin, pre-commit); no speculative abstractions |

**Observability**: Exempt — standalone scripts and config files per constitution v1.0.1.
**Versioning**: N/A — no public interfaces; devcontainer config follows internal repo conventions.

### Post-Phase 1 Re-check

All principles remain PASS after design. No new complexity introduced:

- R1/R2 (debian base + nvm + uv) provides precise version pinning for both runtimes
- R3 (uv multi-stage COPY) is the recommended Docker pattern
- Pre-commit config is a standard YAML file with no custom code
- Firewall is adapted from the proven reference implementation

## Project Structure

### Documentation (this feature)

```text
specs/002-devcontainer-setup/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── tasks.md             # Phase 2 output (/speckit.tasks)
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
.devcontainer/
├── devcontainer.json    # Container config, extensions, settings, mounts (no features)
├── Dockerfile           # debian:bookworm + nvm (Node 22) + uv (Python 3.12) + tools
└── init-firewall.sh     # iptables/ipset firewall (manually activated)

.pre-commit-config.yaml  # Pre-commit hook definitions (repo root)
.editorconfig            # Cross-editor formatting rules (indentation, line endings, charset)
.nvmrc                   # Node.js version pin (e.g., 22)

CLAUDE.md                # Updated: devcontainer section, auto-mode guardrails
README.md                # Updated: devcontainer quick-start section
```

**Structure Decision**: Follows the Claude Code reference 3-file devcontainer pattern. Pre-commit config lives at repo root (standard convention). Documentation updates are in existing files. No new source directories — this is purely config + docs.

## Implementation Phases

Tasks must be executed in this order (each phase can be independently verified before proceeding):

### Phase 1 — Core Container (P1, blocker for all other phases)

1. `.nvmrc` — Node.js version pin (content: `22`)
2. `.devcontainer/Dockerfile` — all layers in order per data-model: base image → system packages → GitHub CLI → uv binary → git-delta → vscode user → firewall script + sudoers → `USER vscode` (+ PATH for ~/.local/bin) → Oh My Zsh → powerlevel10k → p10k config → shell history → nvm → Python → pre-commit (via `uv tool install`) → Atuin → git-delta pager → Claude Code
3. `.devcontainer/devcontainer.json` — runArgs, remoteUser, extensions, settings, mounts, containerEnv, postCreateCommand (no features — all shell setup in Dockerfile)
4. **Verify**: container builds and all runtimes/tools are available in interactive terminal (US1 acceptance scenarios)

### Phase 2 — Firewall (P1, depends on Phase 1)

1. `.devcontainer/init-firewall.sh` — full script per data-model firewall spec (DNS preservation, ipset, GitHub CIDRs, static resolution, default-deny, verification tests)
2. **Verify**: firewall activates cleanly; SC-004 (example.com blocked) and SC-005 (api.github.com allowed) pass

### Phase 3 — Pre-commit & Editor Config (P2, independent of Phase 2)

1. `.editorconfig` — all globs and settings per data-model
2. `.pre-commit-config.yaml` — all hooks with pinned revs and ESLint additional_dependencies per data-model
3. **Verify**: `pre-commit run --all-files` passes on current repo state (US2 acceptance scenarios)

### Phase 4 — Documentation (P4, depends on Phases 1–3)

1. `CLAUDE.md` — add devcontainer section (FR-017) and auto-mode guardrails section (FR-016) per data-model documentation scope
2. `README.md` — add devcontainer quick-start section (FR-018) per data-model documentation scope
3. **Verify**: US4 acceptance scenarios pass (sections findable and complete)
