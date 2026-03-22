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
├── devcontainer.json    # Container config, common-utils feature, extensions, settings, mounts
├── Dockerfile           # debian:bookworm + nvm (Node 22) + uv (Python 3.12) + tools
└── init-firewall.sh     # iptables/ipset firewall (manually activated)

.pre-commit-config.yaml  # Pre-commit hook definitions (repo root)
.editorconfig            # Cross-editor formatting rules (indentation, line endings, charset)
.nvmrc                   # Node.js version pin (e.g., 22)

CLAUDE.md                # Updated: devcontainer section, auto-mode guardrails
README.md                # Updated: devcontainer quick-start section
```

**Structure Decision**: Follows the Claude Code reference 3-file devcontainer pattern. Pre-commit config lives at repo root (standard convention). Documentation updates are in existing files. No new source directories — this is purely config + docs.
