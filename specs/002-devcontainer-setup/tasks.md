# Tasks: Devcontainer with Secure Claude Code Environment

**Input**: Design documents from `/specs/002-devcontainer-setup/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md — all reviewed and resolved
**Branch**: `002-devcontainer-setup`

**Organization**: Tasks grouped by user story to enable independent implementation and testing.
No tests requested — validation is manual (container build, firewall activation, pre-commit run).

**Note on init-firewall.sh**: The Dockerfile `COPY`s init-firewall.sh at build time — the script must exist before the Dockerfile is built. Created in Phase 2 (Foundational) so Phase 3 (US1) Dockerfile can reference it.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)

---

## Phase 1: Setup

**Purpose**: Minimum prerequisites before any container work begins.

- [x] T001 Create `.nvmrc` at repo root with content `22` (pins Node.js major version for nvm and contributors)

---

## Phase 2: Foundational (Blocking — must complete before Phase 3)

**Purpose**: Firewall script must exist before Dockerfile builds (COPY'd during `docker build`).

**⚠️ CRITICAL**: T003 (Dockerfile) cannot be built without this file present in `.devcontainer/`.

- [x] T002 Create `.devcontainer/init-firewall.sh` per data-model firewall spec — implement all 6 components in order:
  1. Save and restore Docker DNS chain rules (DOCKER-USER/DOCKER) around iptables flush
  2. `ipset create allowed-domains hash:net` (with `2>/dev/null || ipset flush allowed-domains` to handle re-runs)
  3. Fetch GitHub IP ranges from `https://api.github.com/meta`; pipe `.web[]`, `.api[]`, `.git[]` CIDRs directly into `ipset add allowed-domains <cidr> 2>/dev/null || true`
  4. Static domain resolution: `dig +short <domain>` for all whitelisted domains (registry.npmjs.org, api.github.com, api.anthropic.com, sentry.io, statsig.anthropic.com, statsig.com, marketplace.visualstudio.com, vscode.blob.core.windows.net, update.code.visualstudio.com, pypi.org, files.pythonhosted.org); add all resolved IPs to ipset
  5. Allow rules: loopback (lo), established/related connections, ipset-matched OUTPUT; then set default-deny `iptables -P INPUT DROP`, `iptables -P FORWARD DROP`, `iptables -P OUTPUT DROP`
  6. Verification tests: `curl --max-time 5 https://example.com` must fail (exit non-zero → blocked); `curl --max-time 10 https://api.github.com` must succeed (exit zero → allowed)
  7. Status output: on success print count of whitelisted domains; on any failure print the step that failed and an actionable error message; exit 1 on failure
  8. Make executable: `chmod +x .devcontainer/init-firewall.sh`

**Checkpoint**: `init-firewall.sh` exists in `.devcontainer/` and is executable. Ready for Dockerfile COPY.

---

## Phase 3: User Story 1 — Open Repository in Devcontainer (Priority: P1) 🎯 MVP

**Goal**: A developer opens the repo in VS Code, clicks "Reopen in Container", and gets a fully working environment — Node 22, Python 3.12, all CLI tools, 10 VS Code extensions, zsh/OMZ/Atuin, no manual setup.

**Independent Test**: `docker build .devcontainer/ -f .devcontainer/Dockerfile` succeeds. Container opens. `node --version` → 22.x, `python3 --version` → 3.12.x, `git delta --version`, `claude --version`, `atuin --version` all respond. `zsh --version` is default shell.

- [x] T003 [US1] Create `.devcontainer/Dockerfile` implementing all layers in order per data-model:
  - `FROM debian:trixie` (Debian 13 LTS — provides GLIBC 2.40, required by git-delta latest)
  - `RUN apt-get update && apt-get install -y git jq fzf curl zsh iptables ipset iproute2 dnsutils libatomic1` (set DEBIAN_FRONTEND=noninteractive; `libatomic1` required by Node.js in pre-commit's isolated envs; no python3-pip — uv manages Python)
  - Install GitHub CLI via its own apt repo with GPG keyring (gh is not in Debian main repos)
  - `COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/`
  - Download git-delta latest release binary from GitHub releases (`https://github.com/dandavison/delta/releases/latest`, asset pattern `delta-*-x86_64-unknown-linux-gnu.tar.gz`) for linux-amd64 to `/usr/local/bin/delta`; `chmod +x /usr/local/bin/delta`
  - `RUN groupadd -g 1000 vscode && useradd -m -u 1000 -g 1000 -s /bin/zsh vscode`
  - `COPY init-firewall.sh /usr/local/share/init-firewall.sh`; `RUN echo "vscode ALL=(root) NOPASSWD: /usr/local/share/init-firewall.sh" > /etc/sudoers.d/vscode-firewall && chmod 0440 /etc/sudoers.d/vscode-firewall`
  - `USER vscode`
  - Install Oh My Zsh: `sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended`
  - Install powerlevel10k: `git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ~/.oh-my-zsh/custom/themes/powerlevel10k`; update `ZSH_THEME` in `.zshrc`; copy `p10k-rainbow.zsh` preset
  - Prepend p10k instant-prompt block to top of `.zshrc`; append `[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh` and POWERLEVEL9K prompt layout overrides to bottom
  - Install nvm v0.40.1: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash` then `. "$NVM_DIR/nvm.sh" && nvm install 22 && nvm alias default 22`
  - `uv python install 3.12`
  - `uv tool install pre-commit` (isolated env — no system-package conflicts; replaces pip3 install)
  - Install Atuin: `curl --proto '=https' --tlsv1.2 -LsSf https://setup.atuin.sh | sh || true`; if Atuin installed, append `eval "$(atuin init zsh)"` to `/home/vscode/.zshrc`
  - `git config --global core.pager delta`
  - `. "$NVM_DIR/nvm.sh" && npm install -g @anthropic-ai/claude-code@latest`

- [x] T004 [US1] Create `.devcontainer/devcontainer.json` per data-model — include all required fields:
  - `build.dockerfile`: `"Dockerfile"`
  - `runArgs`: `["--cap-add=NET_ADMIN", "--cap-add=NET_RAW"]`
  - `remoteUser`: `"vscode"`
  - `customizations.vscode.extensions`: all 10 IDs from data-model (anthropic.claude-code, dbaeumer.vscode-eslint, esbenp.prettier-vscode, eamodio.gitlens, DavidAnson.vscode-markdownlint, charliermarsh.ruff, ms-python.python, EditorConfig.EditorConfig, yzhang.markdown-all-in-one, bierner.markdown-mermaid)
  - `customizations.vscode.settings`: all 7 settings from data-model (formatOnSave, defaultFormatter, codeActionsOnSave, python formatter, zsh terminal, fontFamily, markdownlint config)
  - `mounts`: named volume `source=devcontainer-history,target=/commandhistory,type=volume` and bind `source=${localEnv:HOME}/.claude,target=/home/vscode/.claude,type=bind,consistency=cached`
  - `containerEnv`: `{ "NVM_DIR": "/home/vscode/.nvm", "CLAUDE_CONFIG_DIR": "/home/vscode/.claude" }`
  - `postCreateCommand`: `"pre-commit install"`

**Checkpoint**: Container builds and opens. Run `node -v` (22.x), `python3 -V` (3.12.x), `delta --version`, `claude --version`, `atuin --version`, `git log --oneline -1` (shows delta-formatted output). All 10 VS Code extensions active. Shell is zsh with OMZ prompt.

---

## Phase 4: User Story 2 — Code Quality on Commit (Priority: P2)

**Goal**: Pre-commit hooks catch and fix code quality issues on every commit, working inside and outside the devcontainer.

**Independent Test**: Install hooks (`pre-commit install`), add trailing whitespace to a .md file, run `git commit` — commit should fail, whitespace fixed. `pre-commit run --all-files` passes on current repo state.

- [x] T005 [P] [US2] Create `.editorconfig` at repo root per data-model:
  - Root section: `root = true`
  - `[*]`: `indent_style = space`, `indent_size = 2`, `end_of_line = lf`, `charset = utf-8`, `trim_trailing_whitespace = true`, `insert_final_newline = true`
  - `[*.py]`: `indent_size = 4`
  - `[*.md]`: `trim_trailing_whitespace = false`

- [x] T006 [P] [US2] Create `.pre-commit-config.yaml` at repo root per data-model — pin each hook repo `rev` to its latest stable release at implementation time:
  - `pre-commit/pre-commit-hooks`: hooks `trailing-whitespace`, `end-of-file-fixer`, `check-yaml`, `check-json`, `check-merge-conflict`
  - `pre-commit/mirrors-prettier`: hook `prettier`, types filter `[javascript, ts, json, yaml]`
  - `pre-commit/mirrors-eslint`: hook `eslint`, types filter `[javascript, ts]`, `additional_dependencies: [eslint]`
  - `astral-sh/ruff-pre-commit`: hooks `ruff-check` (with `--fix` arg) and `ruff-format`, types filter `[python]`
  - `DavidAnson/markdownlint-cli2`: hook `markdownlint-cli2`, types filter `[markdown]`

**Checkpoint**: `pre-commit run --all-files` exits 0 on current repo (may auto-fix files on first run — re-run to confirm clean). All 5 hook repos initialise successfully.

---

## Phase 5: User Story 3 — Autonomous Claude Code Operation (Priority: P3)

**Goal**: Firewall restricts container to approved domains only when activated, providing a safe boundary for autonomous Claude Code operation.

**Independent Test**: Inside running container, run `sudo /usr/local/share/init-firewall.sh`. Output shows domain count. `curl --max-time 5 https://example.com` fails. `curl https://api.github.com` succeeds.

- [x] T007 [US3] Verify and fix `.devcontainer/init-firewall.sh` inside the running devcontainer — activate firewall with `sudo /usr/local/share/init-firewall.sh` (the COPY destination in the Docker image); confirm SC-004 passes (`example.com` connection fails) and SC-005 passes (`api.github.com` connection succeeds); fix any bugs found in the script (DNS resolution issues, ipset errors, missing allow rules for Docker bridge, etc.)

**Checkpoint**: Firewall activates cleanly. Success output shows whitelisted domain count. Blocked domain times out or is refused. Whitelisted domain connects successfully. Note: US3-AS3 (CLAUDE.md guardrails direct commits) is verified after Phase 6/T008 completes.

---

## Phase 6: User Story 4 — Documentation and Onboarding (Priority: P4)

**Goal**: New contributors can find clear instructions for devcontainer setup, firewall activation, pre-commit usage, and Claude Code auto-mode rules.

**Independent Test**: Read README.md — find devcontainer quick-start section. Read CLAUDE.md — find devcontainer section and auto-mode guardrails section with commit-per-iteration rule.

- [x] T008 [P] [US4] Update `CLAUDE.md` — add two new sections per data-model documentation scope:
  1. **Devcontainer Setup** section (FR-017): what the devcontainer provides (Node 22 via nvm, Python 3.12 via uv, zsh/OMZ/Atuin, Claude Code CLI, 10 VS Code extensions, pre-commit hooks); how to rebuild (VS Code palette → "Rebuild Container" after changes to Dockerfile/devcontainer.json)
  2. **Auto-mode Guardrails** section (FR-016): commit-per-iteration rule (advisory, not enforced — via CLAUDE.md and system prompt); definition of "logical unit of work" (each speckit task, or coherent group of related edits); `--no-verify` prohibition; branch protection on `main` (enforced by PreToolUse hook — separate, pre-existing control); `--dangerously-skip-permissions` context (safe inside devcontainer due to defence-in-depth: firewall + non-root user + container isolation + PreToolUse hook)

- [x] T009 [P] [US4] Update `README.md` — add devcontainer quick-start section (FR-018) per data-model documentation scope:
  1. Prerequisites: Docker Desktop (or Colima/Podman), VS Code with Remote-Containers extension
  2. Steps: clone repo → open in VS Code → "Reopen in Container" → wait for build
  3. Firewall (local Docker only — skip in Codespaces): activate with `sudo .devcontainer/init-firewall.sh`; recommend before running Claude Code in auto mode; explain that output shows whitelisted domain count on success
  4. Outside container: `pip install pre-commit && pre-commit install` (requires Python 3 + pip on host)
  5. Rebuild: needed after changes to `.devcontainer/Dockerfile` or `.devcontainer/devcontainer.json`

**Checkpoint**: Both sections present and readable. US4-AS1 (README quick-start findable) and US4-AS2 (CLAUDE.md guardrails findable) pass.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validate all changed files pass linting and keep repo metadata current.

- [x] T010 Run `pre-commit run --all-files` to validate every file added or modified in this feature passes all hooks; fix any linting failures before committing
- [x] T011 Update `CLAUDE.md` Active Technologies and Recent Changes sections to reflect the devcontainer setup deliverables

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS Phase 3
- **Phase 3 (US1)**: Depends on Phase 2 — BLOCKS Phases 4, 5, 6
- **Phase 4 (US2)**: Depends on Phase 3 — independent of Phase 5
- **Phase 5 (US3)**: Depends on Phase 3 (running container) — independent of Phase 4
- **Phase 6 (US4)**: Depends on Phases 3, 4, 5 — documentation requires all features to exist
- **Phase 7 (Polish)**: Depends on Phase 6 — final validation pass

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — foundational MVP
- **US2 (P2)**: Can start after US1 — independently testable (works without container)
- **US3 (P3)**: Requires running container from US1 — verification task only
- **US4 (P4)**: Depends on all features existing — documentation last

### Parallel Opportunities

- T005 [P] and T006 [P] can run in parallel (different files: `.editorconfig` vs `.pre-commit-config.yaml`)
- T008 [P] and T009 can run in parallel (different files: `CLAUDE.md` vs `README.md`)

---

## Parallel Example: Phase 4 (US2)

```bash
# These two tasks can run in parallel (different files):
T005: Create .editorconfig
T006: Create .pre-commit-config.yaml
```

## Parallel Example: Phase 6 (US4)

```bash
# These two tasks can run in parallel (different files):
T008: Update CLAUDE.md
T009: Update README.md
```

---

## Implementation Strategy

### MVP First (US1 only — Phases 1–3)

1. Complete Phase 1: Create `.nvmrc`
2. Complete Phase 2: Create `init-firewall.sh` (foundational prerequisite)
3. Complete Phase 3: Create `Dockerfile` and `devcontainer.json`
4. **STOP and VALIDATE**: Build container, verify all US1 acceptance scenarios
5. Commit: `feat: add devcontainer with Node 22, Python 3.12, and tools`

### Incremental Delivery

1. MVP (Phases 1–3) → Working devcontainer
2. Add Phase 4 → Pre-commit hooks working
3. Add Phase 5 → Firewall verified
4. Add Phase 6 → Documentation complete
5. Phase 7 → Final lint pass + metadata

---

## Notes

- [P] tasks = different files, no shared dependencies — safe to run in parallel
- [Story] label maps task to specific user story for traceability
- No test tasks — validation is manual per acceptance scenarios in spec.md
- Commit after each phase or logical group per FR-016 guardrails
- T007 (firewall verification) may require fixes to T002 — update init-firewall.sh and recommit
- init-firewall.sh path in sudoers must match the COPY destination in T003 Dockerfile
