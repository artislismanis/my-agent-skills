<!--
SYNC IMPACT REPORT
==================
Version change: (unversioned template) → 1.0.0
Initial population of all placeholder tokens.

Modified principles: N/A (first version)
Added sections: Core Principles, Development Standards, Workflow, Governance
Removed sections: N/A

Templates reviewed:
  ✅ .specify/templates/plan-template.md — Constitution Check section already
     references "Gates determined based on constitution file"; aligns with
     principles defined here. No update needed.
  ✅ .specify/templates/spec-template.md — User story independence and
     acceptance-scenario structure align with Principle III. No update needed.
  ✅ .specify/templates/tasks-template.md — Phase structure (Setup → Foundational
     → User Stories → Polish) and [P] parallel markers align with principles
     I–IV. No update needed.
  ✅ .specify/templates/agent-file-template.md — Generic; no principle-specific
     references. No update needed.
  ✅ .claude/commands/speckit.constitution.md — Generic guidance; no outdated
     agent-specific references that would conflict. No update needed.

Deferred TODOs: None — all placeholders resolved.
-->

# my-agent-skills Constitution

## Core Principles

### I. Spec-First Development

Every feature MUST begin with a written specification (`spec.md`) before any
implementation work starts. Implementation planning (`plan.md`) MUST follow the
specification and precede task generation (`tasks.md`). No code is written
without an approved spec and plan.

**Rationale**: Specifications surface ambiguities early, align stakeholders, and
prevent wasted implementation effort on poorly understood requirements.

### II. Test-First Implementation

Tests MUST be written before implementation code. The Red-Green-Refactor cycle
MUST be followed: write a failing test, confirm it fails, implement the minimum
code to make it pass, then refactor. Tests MUST NOT be retrofitted after
implementation is complete.

**Rationale**: Writing tests first clarifies acceptance criteria, prevents
feature creep, and ensures coverage is not an afterthought.

### III. User Story Independence

Each user story MUST be independently implementable, testable, and demonstrable.
A story MUST deliver standalone value as an MVP increment without requiring
another story to be complete. Stories MUST NOT share mutable state that prevents
independent verification.

**Rationale**: Independence enables parallel development, early delivery of
value, and clear rollback boundaries if a story must be reverted.

### IV. Incremental Delivery (MVP-First)

P1 stories MUST be fully functional and validated before P2 work begins. P2
MUST be complete before P3. Each priority tier MUST be deployable or
demonstrable independently. Features MUST NOT be held back to bundle with
lower-priority stories.

**Rationale**: Incremental delivery reduces risk, surfaces integration issues
early, and allows stakeholders to respond to working software rather than
promises.

### V. Simplicity (YAGNI)

The minimum implementation that satisfies the acceptance criteria MUST be
preferred over a more general or extensible solution. Abstractions MUST NOT be
introduced until there are at least three concrete use cases that justify them.
Complexity MUST be documented and justified in the plan's Complexity Tracking
table.

**Rationale**: Premature abstraction creates maintenance burden and cognitive
overhead without delivering proportional value. Simple code is easier to test,
reason about, and change.

## Development Standards

- **Specification tool**: speckit v0.3.2 (`/speckit.*` commands)
- **AI assistant**: Claude (configured via `.specify/init-options.json`)
- **Branch naming**: Sequential numbering (e.g., `001-feature-name`)
- **Quality gates**: All P1 acceptance scenarios MUST pass before any P2 work
  begins. All acceptance scenarios MUST pass before a feature is considered
  complete.
- **Observability**: Structured logging MUST be included for all service-layer
  operations. Log levels (DEBUG/INFO/WARN/ERROR) MUST be used consistently.
- **Versioning**: Public interfaces MUST follow Semantic Versioning
  (MAJOR.MINOR.PATCH). Breaking changes MUST increment MAJOR and include a
  migration note in the plan.

## Workflow

- **Spec review**: The specification (`spec.md`) MUST be reviewed and accepted
  before the implementation plan is drafted.
- **Plan review**: The implementation plan (`plan.md`) MUST pass a Constitution
  Check (all principles satisfied) before tasks are generated.
- **Task execution**: Tasks MUST be executed in the order defined in `tasks.md`.
  Parallel tasks (marked `[P]`) MAY be executed concurrently only when they
  operate on different files with no shared dependencies.
- **Checkpoints**: Each user story phase MUST end with an independent validation
  checkpoint. Work on the next story MUST NOT begin until the checkpoint passes.
- **Amendments**: Constitution changes MUST be proposed, version-bumped per
  semantic rules, and the Sync Impact Report MUST be updated before the change
  takes effect.

## Governance

This constitution supersedes all other development practices and guidelines
within this project. Where a conflict exists between this constitution and any
other document, the constitution takes precedence.

**Amendment procedure**:

1. Propose the change with a rationale and version bump classification.
2. Run `/speckit.constitution` with the proposed text to validate and propagate.
3. Confirm no dependent templates require breaking changes.
4. Commit with message: `docs: amend constitution to vX.Y.Z (<summary>)`.

**Versioning policy**:

- MAJOR: Principle removal, redefinition, or backward-incompatible governance change.
- MINOR: New principle or section added, or materially expanded guidance.
- PATCH: Clarifications, wording, or typo fixes with no semantic change.

**Compliance**: All feature plans MUST include a Constitution Check section that
explicitly verifies compliance with each principle. Any violation MUST be
justified in the plan's Complexity Tracking table or the plan MUST NOT be
approved.

**Version**: 1.0.0 | **Ratified**: 2026-03-21 | **Last Amended**: 2026-03-21
