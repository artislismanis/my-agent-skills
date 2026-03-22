# Developer Experience Quality Checklist: Devcontainer Setup

**Purpose**: Validate that requirements deliver a good first-run, day-to-day, and onboarding developer experience
**Created**: 2026-03-22
**Feature**: [spec.md](../spec.md)
**Depth**: Standard | **Audience**: Author (pre-tasks self-review)
**Focus**: First-run DX, tool usability, error feedback, outside-container contributor path, documentation clarity

## First-Run Experience

- [x] UX001 - Is git-delta specified as configured (not just installed)? FR-006 lists git-delta as an installed tool, but without configuring it as git's diff pager (`git config core.pager "delta"`), installing it provides no visible improvement — `git diff` continues to use the default pager. Is a git configuration requirement defined? [Completeness, Gap, Spec §FR-006]
  - Fixed: FR-006 updated — git-delta MUST be "configured as git's diff pager so that `git diff`, `git log -p`, and `git show` use delta's enhanced output automatically." Data-model Dockerfile layer updated to add `git config --global core.pager delta` as a vscode-user step.

- [x] UX002 - Are nvm auto-use requirements defined? FR-002 says Node.js 22 is managed via nvm, but the spec doesn't state whether nvm should auto-switch when entering a directory with a `.nvmrc` file. Without `nvm use --silent` or equivalent in the shell profile, developers must manually run `nvm use` in each new terminal. [Completeness, Gap, Spec §FR-002]
  - Resolved: The devcontainer installs a single Node.js version (22). With only one installed version, nvm auto-switching adds no value — `node` is always version 22 regardless. Auto-use configuration would only be needed if multiple Node versions were installed. Mark as resolved — no requirement change needed.

- [x] UX003 - Is the Oh My Zsh theme specified as a requirement? FR-004 says "Oh My Zsh installed" but the theme is unspecified at the spec level (data-model mentions powerlevel10k as an implementation detail). Is the theme a developer experience requirement (affects the prompt, git status, runtime indicators) or intentionally left as an implementation choice? [Clarity, Spec §FR-004]
  - Resolved: Theme is an intentional implementation choice. Different developers prefer different prompts. The spec correctly leaves this as a data-model-level detail. No requirement needed — the implementation may choose any theme.

- [x] UX004 - Are requirements defined for how installed tools are discoverable? US1-AS1 says tools are "available on PATH" — but is there a requirement for a welcome message, `motd`, or README section listing what's installed so a new contributor knows what tools they have? [Coverage, Gap, Spec §US1-AS1]
  - Resolved: The README quick-start section (FR-018) and US1 scenario description ("fully working environment with all runtimes, CLI tools, and editor integrations") provide sufficient discoverability context. The README will naturally list what's installed. A `motd` would be noise. No additional requirement needed.

## Shell & Tool Interaction

- [x] UX005 - Is the Atuin keyboard interaction requirement specified? FR-005 says "install Atuin for shell history management" but doesn't specify the search binding or mode (Atuin replaces Ctrl+R by default; this changes the shell history interaction for all users). Is this an explicit requirement or implementation detail? [Clarity, Spec §FR-005]
  - Resolved: Atuin's default binding (Ctrl+R → enhanced history search) is its primary feature and expected behaviour. The spec says "shell history management" which implies this interactive behaviour. local-only mode is already specified in research R4. No additional requirement needed.

- [x] UX006 - Are requirements defined for shell history persistence scope? FR-012 says "persist command history between container restarts" — but is the history available immediately on first terminal open (pre-populated from the named volume), or only after the first session? Is cross-session history search (Atuin's key feature) explicitly required? [Clarity, Spec §FR-012]
  - Resolved: "Persist between container restarts" correctly captures the requirement — the named volume is empty on first container creation and accumulates history across restarts. First-run empty state is expected and acceptable. Cross-session search is Atuin's default behaviour, not a separate requirement to specify.

## Pre-commit Hook Developer Experience

- [x] UX007 - Is the re-commit workflow specified consistently across all auto-fixing hooks? US2-AS4 documents the re-stage-then-recommit workflow for standard hooks (trailing whitespace), but US2-AS2 and US2-AS3 describe Prettier and Ruff auto-fixing without explicitly stating the same re-commit workflow applies. Is the full "auto-fix → re-stage → commit again" loop specified for all auto-fixing hooks? [Consistency, Spec §US2-AS2, US2-AS3, US2-AS4]
  - Fixed: US2-AS2 and US2-AS3 updated — both now include "if [tool] modified files, the commit fails on first pass and the developer re-stages the modified files and commits again." Consistent with US2-AS4.

- [x] UX008 - Are hook execution time requirements defined as a DX concern? Slow hooks (>5–10 seconds) are a well-known driver of `--no-verify` usage — the very behaviour FR-016 prohibits. Is there a requirement that hooks must complete within an acceptable time bound? [Gap]
  - Resolved: The repo is currently small (mainly markdown + config), and all chosen tools (Ruff, markdownlint, Prettier on mirrors) are known to be fast. A formal execution time requirement would be premature and hard to benchmark before implementation. Monitor post-implementation; add a time bound if slow hooks become an issue.

- [x] UX009 - Are outside-container contributor prerequisites specified? FR-015 says pre-commit works outside the devcontainer; SC-006 says "single command documented in README". But are the host prerequisites (Python, pip version) specified as requirements? A contributor without Python cannot run the single command. [Coverage, Spec §FR-015, SC-006]
  - Fixed: Added to Assumptions: "Contributors using pre-commit outside the devcontainer are assumed to have Python 3 and pip available on their host machine (required to run the single-command install documented in the README)." Data-model README outline updated: "Outside container: `pip install pre-commit && pre-commit install` (requires Python 3 + pip)."

## Firewall Developer Experience

- [x] UX010 - Are requirements defined for firewall activation output? FR-008 requires self-verification tests (SC-004/SC-005) that run at activation, but doesn't specify what the developer sees on success (e.g., "Firewall active — 10 domains whitelisted") vs. failure (e.g., which domain failed resolution and what to do). Is success/failure output a requirement? [Completeness, Gap, Spec §FR-008]
  - Fixed: FR-008 updated — "The script MUST output a clear status summary on completion: on success, the count of whitelisted domains; on failure, the step that failed with an actionable error message."

- [x] UX011 - Are requirements defined for when and why a developer should activate the firewall? FR-018 requires a README quick-start section and FR-008 says the firewall is "documented in the README" — but is there a requirement to explain the use case for firewall activation (specifically: before running Claude Code in auto mode), not just the how? [Clarity, Gap, Spec §FR-008, FR-018]
  - Fixed: Data-model README content outline updated — firewall section now includes "explain when to activate (recommended before running Claude Code in auto mode) and what the output means." Also added Codespaces caveat: "local Docker only — not applicable in Codespaces."

## Autonomous Mode Developer Experience

- [x] UX012 - Is "immediate feedback" in US3-AS1 defined from the developer's perspective? The firewall uses DROP (silent timeout) per the spec. "Immediate feedback" in US3-AS1 would come from Claude Code reporting a connection failure — not from the firewall directly. Is there a tension between "immediate feedback" (the requirement) and DROP behaviour (the implementation direction)? Should REJECT be required instead to provide instant rather than timeout-based feedback? [Clarity, Ambiguity, Spec §US3-AS1]
  - Fixed: US3-AS1 updated to remove the contradictory "immediate feedback" phrasing — now reads: "the connection is blocked (the attempt will time out or be immediately refused depending on firewall policy — DROP causes timeout; REJECT causes immediate refusal)." DROP vs REJECT remains an implementation choice; the requirement no longer mandates a specific behaviour.

- [x] UX013 - Is the CLAUDE.md auto-mode guardrails documentation required to be actionable (not just policy)? FR-016 requires documenting "guardrails including commit-per-iteration rules" — but is there a requirement for the documentation to include a worked example or clear "what to do when a hook fails" guidance, rather than just stating the rule? [Clarity, Spec §FR-016]
  - Resolved: Mandating "actionable" documentation at requirements level is too prescriptive. The data-model CLAUDE.md content outline covers the key topics. Implementation will naturally include actionable guidance (the existing CLAUDE.md style is already prescriptive and example-driven). No spec change needed.

## Documentation & Onboarding

- [x] UX014 - Are requirements defined for a Codespaces-specific onboarding path? FR-019 says Codespaces is supported without firewall — but are there requirements for Codespaces-specific README instructions (e.g., the firewall section should be marked "local Docker only", or a Codespaces badge/button)? Without this, Codespaces users may follow firewall activation steps that don't apply to them. [Coverage, Gap, Spec §FR-019]
  - Fixed: Data-model README outline updated — firewall section marked as "local Docker only — not applicable in Codespaces."

- [x] UX015 - Are requirements defined for what a developer does when the container needs rebuilding? FR-001 says the container must build successfully, and `postCreateCommand` re-runs on rebuild — but is there a requirement for the README to document when a rebuild is needed (e.g., after changes to Dockerfile or devcontainer.json)? [Coverage, Gap, Spec §FR-001, FR-018]
  - Fixed: Data-model README outline updated — added "When to rebuild: after changes to `Dockerfile` or `devcontainer.json`."

## Notes

- Check items off as completed: `[x]`
- Add comments or findings inline
- Items are numbered UX001–UX015
- **All 15 items resolved 2026-03-22**
- **Spec changes applied**: FR-006 (git-delta pager config requirement), FR-008 (firewall output requirement), US2-AS2/US2-AS3 (re-commit loop consistency), US3-AS1 (DROP vs immediate feedback clarification), Assumptions (Python prerequisite for outside-container contributors)
- **Data-model changes**: git-delta layer (pager config step), README content outline (firewall when/why, Codespaces caveat, rebuild guidance, Python prerequisite)
- Key DX finding: git-delta was installed but would have had no visible effect without pager configuration
- Key accuracy fix: "immediate feedback" contradicted DROP firewall policy — resolved by making the wording implementation-neutral
