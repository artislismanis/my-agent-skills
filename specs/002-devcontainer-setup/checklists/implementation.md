# Implementation Readiness Checklist: Devcontainer Setup

**Purpose**: Validate that plan and data-model artifacts contain sufficient implementation detail to generate unambiguous tasks
**Created**: 2026-03-22
**Feature**: [spec.md](../spec.md)
**Depth**: Standard | **Audience**: Author (pre-tasks self-review)
**Focus**: Plan.md completeness, data-model.md implementation detail, missing deliverables

## Dockerfile Implementation Completeness

- [x] IMP001 - Is the nvm installer version specified in data-model.md? Research R2 specifies `v0.40.1` but data-model only says "nvm installed to `/home/vscode/.nvm`" — an implementer reading only data-model cannot determine which nvm version to pin. [Completeness, Gap, data-model §Dockerfile]
  - Fixed: Dockerfile layer table updated — nvm row now specifies installer version `v0.40.1`.

- [x] IMP002 - Is the git-delta version specified anywhere in the design artifacts? Data-model says "Downloaded from GitHub releases" without a version — is "latest at build time" the intended strategy, or should a specific release be pinned for reproducibility? [Completeness, Ambiguity, data-model §Dockerfile]
  - Resolved: Explicit strategy added to data-model: "latest at build time — display tool, not a runtime". Consistent with CHK002 resolution for other system utilities.

- [x] IMP003 - Are shell integration steps (nvm sourcing in `.zshrc`, Atuin initialisation in `.zshrc`) specified as Dockerfile layers or deliverables? These are required for both tools to work in interactive shells — but no `.zshrc` modification step appears in the data-model Dockerfile layer table or the plan project structure. [Gap, data-model §Dockerfile]
  - Fixed: Dockerfile layer table expanded:
    - nvm: "nvm install script auto-adds sourcing to `.bashrc` and `.zshrc`" — handled automatically
    - Atuin: explicit step "append `eval "$(atuin init zsh)"` to `/home/vscode/.zshrc`" added to Atuin layer

- [x] IMP004 - Is the user context for `uv python install 3.12` and Atuin installation specified? uv and Atuin install per-user by default — if the Dockerfile runs these as root before the `vscode` user is created, Python and Atuin will be unavailable to the `vscode` user. The data-model does not specify `USER` switching order. [Completeness, Ambiguity, data-model §Dockerfile]
  - Fixed: Dockerfile layer table now shows user context per layer (root vs vscode) and explicit ordering:
    1. Root layers first: packages, pre-commit, uv binary copy, pre-create vscode user (`useradd`), git-delta, sudoers
    2. `USER vscode` switch
    3. Per-user layers: nvm, Python (`uv python install`), Atuin, Claude Code
  - Key decision: vscode user is pre-created in the Dockerfile (UID 1000) so per-user installs run correctly; `common-utils` feature finds and configures this existing user.

## devcontainer.json Implementation Completeness

- [x] IMP005 - Are the `common-utils` feature version and configuration options specified? Data-model says the feature "creates `vscode` user, installs zsh + Oh My Zsh" but does not specify: feature version, `username`, `uid`, `installZsh`, `configureZshAsDefaultShell`, `installOhMyZsh`, or `upgradePackages` options. Without these, the implementer must guess the correct options. [Completeness, Gap, data-model §devcontainer.json]
  - Fixed: Added `common-utils` feature options table to data-model: version `:2`, username `vscode`, userUid/userGid `1000`, installZsh/configureZshAsDefaultShell/installOhMyZsh all `true`, upgradePackages `false`.

- [x] IMP006 - Are the exact `containerEnv` values specified? Data-model lists `NVM_DIR` and `CLAUDE_CONFIG_DIR` as environment variables but does not specify their values (e.g., `/home/vscode/.nvm` and `/home/vscode/.claude`). These values must match the Dockerfile install paths. [Completeness, Gap, data-model §devcontainer.json]
  - Fixed: `containerEnv` field in data-model now shows exact values: `NVM_DIR=/home/vscode/.nvm`, `CLAUDE_CONFIG_DIR=/home/vscode/.claude`.

- [x] IMP007 - Is the devcontainer mount syntax fully specified? Data-model gives logical mount descriptions (`devcontainer-history:/commandhistory`, `~/.claude:/home/vscode/.claude`) but not the exact devcontainer.json mount object format (which requires `source`, `target`, and `type` fields). Is `~/.claude` a host-side path that requires special handling? [Clarity, data-model §devcontainer.json]
  - Fixed: Volume mounts table updated with exact devcontainer.json format strings including `${localEnv:HOME}` syntax for bind mount source path.

- [x] IMP008 - Does the `postCreateCommand` need shell environment sourcing before `pre-commit install` runs? nvm must be on PATH for Claude Code (installed via npm) to be available; if `postCreateCommand: "pre-commit install"` runs before nvm is sourced in the shell, it may fail or use the wrong environment. Is a shell wrapper specified? [Gap, data-model §devcontainer.json]
  - Resolved: `pre-commit install` only needs the `pre-commit` binary (installed globally via pip in the Dockerfile — see IMP004 fix). It does NOT require nvm. The command installs git hooks into `.git/hooks/`, which is a file operation — no runtime dependency on nvm. Shell sourcing is not needed. `postCreateCommand: "pre-commit install"` is correct as-is.
  - Fixed: Added `pre-commit` as an explicit Dockerfile layer (root user: `pip install pre-commit`) to confirm it is globally available when `postCreateCommand` runs.

## Pre-commit Configuration Completeness

- [x] IMP009 - Are `rev` (version) pins specified for each hook repository in the pre-commit configuration? Data-model lists hook repos and hooks but no versions — should these be pinned to specific tags or use the latest release? Pinning affects reproducibility across contributors. [Completeness, Ambiguity, data-model §Pre-commit]
  - Resolved: Added to data-model: "Pin each hook repo to a specific `rev` tag at implementation time (use latest stable release). Update periodically via `pre-commit autoupdate`." Specific versions will be captured in the `.pre-commit-config.yaml` deliverable.

- [x] IMP010 - Are `additional_dependencies` for the `pre-commit/mirrors-eslint` hook specified? The mirrors-eslint hook requires `additional_dependencies` declaring the eslint version and any config packages (e.g., `eslint`, `eslint-config-*`). Without these the ESLint hook will fail to initialise. [Gap, data-model §Pre-commit]
  - Fixed: Added to data-model: "The `mirrors-eslint` hook requires `additional_dependencies: [eslint]` at minimum. Since this repo currently has no JS/TS files, the hook will not run on any files — but the dependency must be declared for hook initialisation to succeed."

- [x] IMP011 - Are Prettier and ESLint tool configuration files (`.prettierrc`, `.eslintrc` or equivalent) listed as deliverables? The spec requires Prettier (FR-013) and ESLint (FR-013) hooks, but configuration files for these tools are not in the plan project structure. Without a config, Prettier uses defaults and ESLint may error on missing config. [Completeness, Gap, plan.md §Project Structure]
  - Resolved: Added to data-model:
    - `.prettierrc`: NOT required — Prettier defaults are acceptable; `.editorconfig` provides indent/line-ending baseline
    - `.eslintrc`: NOT required as a deliverable for this feature — no JS/TS source files exist; add when JS/TS code is introduced

## Firewall Script Implementation Completeness

- [x] IMP012 - Is the GitHub meta API URL specified in the data-model? The firewall script fetches GitHub IP ranges from the GitHub meta API — the endpoint URL (`https://api.github.com/meta`) and the JSON fields to extract (`.web[]`, `.api[]`, `.git[]`) should be documented as they are contract-critical. [Completeness, Gap, data-model §Firewall Script]
  - Fixed: Firewall component table updated with exact API URL (`https://api.github.com/meta`) and JSON field paths (`.web[]`, `.api[]`, `.git[]`).

- [x] IMP013 - Is the firewall verification test mechanism specified well enough to implement? Data-model says "Block test (`example.com`) + allow test (`api.github.com`)" but does not specify: the tool used (curl? wget?), timeout duration, success/failure criteria, or expected exit codes. SC-004/SC-005 say "connection must fail/succeed" — is this enough for implementation? [Clarity, data-model §Firewall Script]
  - Fixed: Firewall component table updated with exact verification commands:
    - Block: `curl --max-time 5 https://example.com` must fail (exit non-zero)
    - Allow: `curl --max-time 10 https://api.github.com` must succeed (exit zero)

## Documentation Scope Completeness

- [x] IMP014 - Is the content scope of the README quick-start section specified? FR-018 requires a "devcontainer quick-start section" but does not define what it must contain — prerequisites, step-by-step instructions, firewall activation steps, troubleshooting? Without a content outline, this task is ambiguous. [Completeness, Gap, Spec §FR-018]
  - Fixed: Added "Documentation Updates" section to data-model with README quick-start content outline: prerequisites, open-in-container steps, optional firewall activation, outside-container pre-commit install.

- [x] IMP015 - Is the content scope of the CLAUDE.md devcontainer section specified? FR-017 requires "CLAUDE.md MUST document the devcontainer setup and usage" but does not outline what sections or content are required. The auto-mode guardrails content is defined (FR-016) but the devcontainer documentation scope is not. [Completeness, Gap, Spec §FR-017]
  - Fixed: Added CLAUDE.md section content outline to data-model: what the devcontainer provides, how to rebuild, auto-mode guardrails (commit rule advisory + branch protection enforced + --no-verify prohibition).

## Plan Structure for Task Generation

- [x] IMP016 - Does plan.md define an implementation phase order? The current plan.md contains summary, tech context, constitution check, and project structure — but no explicit phases or implementation sequence. Is the ordering (e.g., Dockerfile first, then devcontainer.json, then firewall script, then pre-commit, then docs) clear enough for `/speckit.tasks` to generate correctly ordered tasks? [Completeness, Gap, plan.md]
  - Fixed: Added "Implementation Phases" section to plan.md with 4 explicitly sequenced phases (Phase 1: core container + devcontainer.json; Phase 2: firewall; Phase 3: pre-commit + editorconfig; Phase 4: documentation), each with numbered deliverables and a verify step.

- [x] IMP017 - Is the relationship between the Dockerfile `USER` instruction and the `common-utils` feature documented in the plan? The `common-utils` feature creates the `vscode` user at runtime (via `postCreate`?), but the Dockerfile may need to install nvm/uv as the correct user at build time. Is this ordering constraint captured in the plan or data-model? [Clarity, Consistency, data-model §Relationships]
  - Fixed: Resolved via IMP004 fix. Data-model now explicitly documents that the `vscode` user is pre-created in the Dockerfile (UID 1000) before the `USER vscode` switch. `common-utils` finds this existing user and configures it (sets shell, installs zsh/OMZ) without conflict. Relationships diagram in data-model updated to note this ordering.

## Notes

- Check items off as completed: `[x]`
- Add comments or findings inline
- Items are numbered IMP001–IMP017
- **All 17 items resolved 2026-03-22**
- **Data-model changes**: Dockerfile layer table expanded with user context, user creation ordering, shell integration, pre-commit install layer, nvm version; common-utils options table added; containerEnv values specified; mount format strings with `${localEnv:HOME}`; firewall API URL and verification commands; pre-commit rev strategy and ESLint deps; documentation scope
- **Plan changes**: Implementation phases section added (4 phases, numbered deliverables, verify steps per phase)
- Critical finding resolved: **pre-commit was missing from the Dockerfile** — added as a root-layer pip install
- Critical finding resolved: **USER switching order** — vscode user pre-created in Dockerfile, common-utils configures it
