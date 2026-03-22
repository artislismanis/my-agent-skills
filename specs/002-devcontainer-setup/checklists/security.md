# Security Requirements Quality Checklist: Devcontainer Setup

**Purpose**: Validate security requirements completeness, clarity, and coverage before implementation
**Created**: 2026-03-22
**Feature**: [spec.md](../spec.md)
**Depth**: Standard | **Audience**: Author (pre-implementation self-review)
**Focus**: Firewall design, permissions model, autonomous operation safety, data handling

## Firewall Requirement Completeness

- [x] SEC001 - Is the firewall activation mechanism fully specified? FR-008 says "manually activated and documented in README" but does not define the exact command or who may activate it (any user? only `vscode`? via sudo?). [Completeness, Spec §FR-008]
  - Resolved: Exact command (`sudo .devcontainer/init-firewall.sh`) is in data-model.md. The spec says "manually activated and documented in README" — the README is the correct place for the exact invocation workflow. Any authenticated user can activate via sudo, which is the standard pattern. FR-008 updated to say "sudoers is configured for this script only".

- [x] SEC002 - Is the scope of the default-deny policy specified for all traffic directions? FR-008 mentions outbound, but is inbound and forwarding traffic also covered in requirements? [Completeness, Spec §FR-008]
  - Fixed: FR-008 updated from "restricts outbound network access" to "enforces a default-deny policy on all traffic directions (INPUT, FORWARD, OUTPUT), permitting only whitelisted domains for outbound connections". Matches the data-model's firewall script description.

- [x] SEC003 - Is the firewall's DNS resolution dependency documented as a requirement? The firewall resolves whitelisted domain names to IPs at activation time — are requirements defined for what happens if a domain resolves to multiple IPs or changes after activation? [Coverage, Spec §FR-008]
  - Resolved: Multiple IPs per domain are handled gracefully by ipset (all resolved IPs are added). Stale IPs after activation are acceptable — re-running the script refreshes them (documented in edge cases and resolved in CHK027). The DNS-unreachable edge case is covered (FR-008 states the script exits with an error if DNS fails — the container continues to work without firewall protection).

- [x] SEC004 - Are all domains in the whitelist (FR-009) justified and documented? The spec lists categories but does not specify all individual domain entries — is the data-model whitelist (10 entries) considered authoritative, or are there gaps? [Completeness, Spec §FR-009]
  - Resolved: data-model.md has the full 10-entry authoritative list. FR-009 correctly abstracts to categories (npm, GitHub, Claude API, etc.) — the data-model provides the implementation-level hostname detail. No gaps identified.

- [x] SEC005 - Is there a requirement for the firewall to log blocked connection attempts? The spec defines verification tests (SC-004/SC-005) but does not specify whether denied connections should be logged or silently dropped. [Gap, Spec §FR-008]
  - Resolved: Logging is an implementation detail. For a developer tool, DROP (silent timeout) is acceptable — it matches the reference implementation and CHK010 resolution. The spec correctly focuses on user-facing behaviour (SC-004 verifies blocking works) rather than the technical implementation. No logging requirement added.

## Firewall Requirement Clarity

- [x] SEC006 - Is "whitelisted domains only" defined clearly enough to implement? FR-009 lists domains by category (e.g., "GitHub web/api/git") but not all individual hostnames. Is the full hostname list specified somewhere, or is it an implementation decision? [Clarity, Spec §FR-009]
  - Resolved: The full hostname list is in data-model.md. FR-009 is at the right level of abstraction for a spec requirement. The data-model is the authoritative detailed spec for implementation. No change needed.

- [x] SEC007 - Is the relationship between NET_ADMIN/NET_RAW capabilities and the firewall requirement explicit? FR-008 states both are required — are requirements defined for what happens if only one capability is available? [Clarity, Spec §FR-008]
  - Resolved: The firewall script will fail with a clear error if required capabilities are unavailable. The Codespaces edge case covers the realistic scenario where capabilities are absent (skip firewall activation, rely on Codespaces isolation). A partial-capability failure mode is not worth specifying as a separate requirement.

- [x] SEC008 - Is "manually activated" in FR-008 sufficiently defined? Does it mean: (a) run once per container start, (b) run as needed, or (c) run as part of a documented workflow? The edge case says "skip in Codespaces" but the activation workflow isn't fully specified. [Ambiguity, Spec §FR-008]
  - Resolved: FR-008 says "documented in the README" — the README is where the exact workflow (when and how to activate) will be defined during implementation. "Manually activated" means run as needed by the developer; re-running refreshes IP resolutions. The spec is at the correct level of abstraction.

## Permissions Model Requirements

- [x] SEC009 - Is the non-root user requirement explicitly stated as a security requirement? FR-001/data-model specify `vscode` user and `common-utils` feature, but the spec never explicitly states "container MUST run as non-root". The security rationale is implicit. [Completeness, Gap]
  - Fixed: FR-001 updated with "The container MUST run as the non-root `vscode` user; no processes run as root except the optional firewall activation via sudo."

- [x] SEC010 - Is the sudoers scope requirement documented in the spec? The research (R7) says "just that one script" but this constraint is not reflected in any functional requirement. If FR-008 is the only place root is needed, is that requirement precise enough to prevent implementation adding broader sudo access? [Completeness, Gap]
  - Fixed: FR-008 updated with "Sudoers is configured for this script only — no other commands run as root." This prevents implementation from inadvertently granting broader sudo access.

- [x] SEC011 - Are requirements defined for secrets and credential handling inside the container? The `.claude` volume mount persists Claude's config (including API keys) — are there requirements specifying how credentials are protected or excluded from git? [Gap]
  - Fixed: Added to Assumptions: "The `.claude` bind mount gives the container access to the developer's host `~/.claude` directory, which may include API credentials and session tokens. This is intentional — it allows Claude Code to use existing credentials. Developers are responsible for not committing credential files to the repository." The README will reinforce this.

- [x] SEC012 - Is the security boundary for `--dangerously-skip-permissions` clearly defined? The spec assumption states "the firewall is the primary runtime security boundary" — but is this assumption validated or just asserted? Are there requirements to verify the boundary is effective before autonomous operation? [Clarity, Assumption, Spec §Assumptions]
  - Resolved: This is an architectural assumption that cannot be fully validated in requirements — it is a design decision. The assumption is correctly labelled as such. SC-004/SC-005 verify the firewall boundary is effective at activation time. The spec cannot verify security posture at the requirements level beyond defining the controls.

## Autonomous Operation Security (Claude Code Guardrails)

- [x] SEC013 - Are the auto-mode guardrails independently enforceable? FR-016 documents CLAUDE.md guidance, but CLAUDE.md is advisory (Claude reads it) rather than enforced by a technical control. Is the distinction between "enforced by hook" and "guided by CLAUDE.md" explicit in requirements? [Clarity, Spec §FR-016]
  - Fixed: FR-016 updated with explicit distinction: "the commit-per-iteration rule is advisory (enforced via CLAUDE.md guidance and Claude's system prompt); the branch protection on `main` is a separate, technically enforced control implemented via a pre-existing PreToolUse hook."

- [x] SEC014 - Is the commit-per-iteration rule defined with enough specificity to be verifiable? FR-016 defines "logical unit of work" but does not specify a maximum uncommitted file count or time window. Can SC compliance be objectively measured? [Measurability, Spec §FR-016]
  - Resolved: FR-016 defines "logical unit of work" as specifically as is practical: "each task in tasks.md during speckit workflows, or each coherent group of related file edits outside speckit." In structured (speckit) workflows this is fully verifiable. Unstructured workflows involve inherent subjectivity — prescribing a file count or time window would be over-engineering. The advisory nature of this control (SEC013) acknowledges the compliance verification limitation.

- [x] SEC015 - Are requirements defined for what constitutes an acceptable autonomous operation scope inside the container? FR-016 defines commit guardrails and FR-008 defines network guardrails — but are there requirements for file system scope (e.g., can Claude write outside the workspace directory)? [Gap]
  - Resolved: File system scope is implicitly bounded by the devcontainer workspace mount — Claude Code operates in the workspace directory by default. The existing controls (branch protection, network isolation, commit rule) are the intended scope boundaries. Adding a file system scope requirement would be implementation-level detail that constrains Claude Code's normal operation unnecessarily.

- [x] SEC016 - Is the existing PreToolUse hook (branch protection) specified as a requirement in this feature, or is it assumed as a pre-existing control? US3-AS4 relies on it, but FR-001 through FR-020 don't document it. [Consistency, Spec §US3-AS4 vs §Requirements]
  - Fixed: Added to Assumptions: "The PreToolUse hook is a pre-existing control implemented in `.claude/settings.json` — it is not created by this feature." Also added to the `--dangerously-skip-permissions` assumption, which now lists all defence-in-depth controls. US3-AS4 correctly references it as a pre-existing control.

## Firewall Verification Requirements

- [x] SEC017 - Are the firewall verification tests (SC-004/SC-005) specified with enough detail to be reproducible? SC-004 says "test against a known-blocked domain" and SC-005 says "known-allowed domain" — are the specific test domains and expected outcomes documented? [Measurability, Spec §SC-004/SC-005]
  - Fixed: SC-004 updated to "verified by test against `example.com` at activation time — connection must fail." SC-005 updated to "verified by test against `api.github.com` at activation time — connection must succeed." These are unambiguous, reproducible acceptance criteria.

- [x] SEC018 - Is there a requirement for the firewall verification tests to be automated (run at activation) vs. manual? The edge case implies the firewall script includes self-tests, but FR-008 doesn't specify this. [Completeness, Spec §FR-008]
  - Fixed: FR-008 updated with "The firewall script MUST include self-verification tests that run at activation time." SC-004/SC-005 both now say "at activation time" to make the automated-on-activation behaviour explicit.

- [x] SEC019 - Are requirements specified for what "blocked" means in SC-004? Is a connection RESET (immediate REJECT) or silently dropped (DROP/timeout) considered acceptable? Different behaviours have different security implications and user experience impacts. [Clarity, Spec §SC-004]
  - Resolved: DROP vs REJECT is an implementation detail resolved in CHK010 ("iptables DROP behaviour; implementation concern, not spec"). SC-004 says "connection must fail" — this correctly captures the requirement without prescribing the technical mechanism. Consistent with the prior resolution.

## Pre-commit as a Security Control

- [x] SEC020 - Are the pre-commit hooks framed as a security/integrity control anywhere in requirements? FR-013 defines them as code quality tools — but they also prevent malformed config files (check-yaml, check-json) from entering the repo. Is the integrity protection aspect documented? [Completeness, Gap]
  - Resolved: The integrity protection (preventing malformed YAML/JSON) is a beneficial side effect of the code quality tools. The spec correctly frames them as code quality requirements — the security benefit doesn't require a separate requirement. Over-specifying this would blur the distinction between code quality and security requirements.

- [x] SEC021 - Is the requirement to never use `--no-verify` (FR-016) technically enforceable, or only advisory? Are requirements defined for a technical enforcement mechanism (e.g., a git hook that detects `--no-verify` attempts), or is CLAUDE.md guidance considered sufficient? [Clarity, Spec §FR-016]
  - Resolved: Advisory enforcement is the intended approach, consistent with how Claude Code is designed (system prompt + CLAUDE.md). A git hook to detect `--no-verify` would be technically complex and potentially counterproductive (it couldn't distinguish Claude's attempts from developer intentional use). The SEC013 fix documents this advisory nature explicitly. FR-016 is clear that this is advisory.

## Data Persistence Security

- [x] SEC022 - Are requirements defined for what data is persisted in the named history volume? Shell history may contain sensitive commands, API tokens passed as arguments, or secrets. Is there a requirement about what must NOT be persisted? [Gap]
  - Resolved: Shell history in a named Docker volume has the same security exposure as shell history on a developer's local machine — it is the developer's responsibility. Adding a requirement about what must not be persisted would be impractical (shell history is captured by the shell, not filtered). The README will note that the history volume may contain sensitive commands. No spec requirement needed.

- [x] SEC023 - Is the `.claude` bind mount scope specified? The mount persists the entire `~/.claude` directory — is there a requirement to exclude sensitive files (e.g., `.claude/auth.json`, session tokens) from being mounted into the container or accessible to other container instances? [Completeness, Gap]
  - Resolved: The bind mount of `~/.claude` is intentional — it provides Claude Code access to existing credentials without re-authentication. The SEC011 fix added an assumption documenting this explicitly and developer responsibility for not committing credentials. No exclusion requirement is added — selectively excluding files from `~/.claude` would break Claude Code functionality.

## Security Boundary Clarity

- [x] SEC024 - Is the security model documented at the right level of abstraction? The spec assumption states the firewall is "the primary runtime security boundary" — but are there secondary boundaries (non-root user, container isolation, PreToolUse hook) documented as defence-in-depth? [Clarity, Assumption]
  - Fixed: The `--dangerously-skip-permissions` assumption updated to list all layers: "the firewall (primary runtime network boundary), the non-root `vscode` user (limits system access), container isolation (process namespace), and the existing PreToolUse hook (blocks writes on `main`)". Defence-in-depth is now explicit.

- [x] SEC025 - Are requirements defined for what "container isolation" means when the firewall is not active (Codespaces, pre-activation)? FR-019 says Codespaces "relies on Codespaces' own network isolation" — but is this assumption validated against Codespaces' documented security model? [Assumption, Spec §FR-019]
  - Resolved: Validating Codespaces' security model against their published documentation is out of scope for this feature's requirements. FR-019 correctly documents the assumption ("Codespaces' own network isolation"). This is an acknowledged dependency on Codespaces' security guarantees, not a gap in this feature's requirements.

## Notes

- Check items off as completed: `[x]`
- Add comments or findings inline
- Items are numbered SEC001–SEC025 to distinguish from requirements.md CHK items
- SEC011 and SEC022-SEC023 (credential/secret handling) are the highest-risk gaps not previously addressed
- SEC013 (advisory vs enforced guardrails) is important context for understanding the real security posture
- **All 25 items resolved 2026-03-22**
- **Spec changes applied**: FR-001 (non-root user), FR-008 (all traffic directions + sudoers scope + self-verification requirement), FR-016 (advisory vs enforced distinction), SC-004/SC-005 (specific test domains), Assumptions (defence-in-depth layers + credential handling + PreToolUse pre-existing dependency)
