# Tasks: Excalidraw Diagram Plugin

**Input**: Design documents from `/specs/001-excalidraw-diagrams/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested — validation is manual via render script (generate JSON → render PNG → visual check).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

All plugin files live under `plugins/diagramming/excalidraw-diagrams/`. The skill
folder is `skills/excalidraw-diagrams/` within the plugin root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create project directory structure and plugin metadata

- [X] T001 Create full directory structure per plan.md: `plugins/diagramming/excalidraw-diagrams/{.claude-plugin/,skills/excalidraw-diagrams/{scripts/,references/,assets/templates/}}`
- [X] T002 [P] Create plugin metadata in `plugins/diagramming/excalidraw-diagrams/.claude-plugin/plugin.json` with name, version 1.0.0, description, and capabilities
- [X] T003 [P] Create `plugins/diagramming/excalidraw-diagrams/skills/excalidraw-diagrams/scripts/package.json` declaring `@excalidraw/utils`, `@napi-rs/canvas`, and `jsdom` dependencies per research.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Reference material that ALL user stories depend on — format spec and styling brand

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Create Excalidraw JSON format reference in `plugins/diagramming/excalidraw-diagrams/skills/excalidraw-diagrams/references/excalidraw-format.md` covering all 10 element types (rectangle, diamond, ellipse, arrow, text, line, frame, freedraw, image, iframe), common properties, arrow bindings (`mode: "orbit"`, `elementId`, `fixedPoint` coordinate system with normalised `[0,1]` anchors and multi-arrow distribution on same edge), elbowed arrows (`elbowed: true` with 4-point routing patterns, `fixedSegments`/`startIsSpecial`/`endIsSpecial`, and `~0.03` binding gap offset), text elements (bound vs standalone, `containerId` binding for shapes AND arrows, calculated `x`/`y`/`width`/`height` positioning formulas per FR-013, `lineHeight: 1.25` always required, multi-line `\n` handling in both `text` and `originalText`), arrow label sizing and midpoint centering formulas (~8px/char for fontSize 14, 30px visible arrow line readability rule), anti-pattern warning against `containerId: null` with manual positioning, `groupIds` vs `containerId` clarification, element ordering / Z-order rules (array order: shapes before text, arrows after shapes), grouping, frames, appState, and a complete example with labelled arrow — targeting schema version 2 per data-model.md and R7–R9 in research.md
- [X] T005 [P] Create styling defaults brand definition in `plugins/diagramming/excalidraw-diagrams/skills/excalidraw-diagrams/references/styling-defaults.md` defining: visual language principles (consistency rules for shapes/colours/fonts, flow and layout rules including grid alignment/generous whitespace/arrow crossing and overlap avoidance with `fixedPoint` distribution, straight vs elbow arrow preference with centre-line alignment, label rules with concise language and multiline `\n` split guidance and 30px visible arrow line rule, structure rules for clear entry points), colour palette (5–7 colours by role), font family defaults (modern: Excalifont 5 for hand-drawn, Nunito 6 for body, Comic Shanns 8 for code), stroke width, roughness (0), opacity (100), fill style defaults, text alignment defaults with note that static renderer does not auto-position (`x`/`y`/`width`/`height` used as-is), text element defaults (`lineHeight: 1.25` always required, complete text element default template JSON), appState defaults, complete element default template, layout spacing guidelines (`160px` horizontal min for unlabelled arrows, `label_width + 160px` for labelled with `240px` default, `120px` vertical min, centre-line alignment for straight arrows, balanced spacing), visual iteration checklist (post-render review for label positioning, spacing balance, text clipping, overlapping elements), and inline JSON snippets for each default value per FR-002 and R10 in research.md

**Checkpoint**: Foundation ready — format reference and brand definition available for all stories

---

## Phase 3: User Story 1 — Generate a Styled Diagram from a Description (Priority: P1) 🎯 MVP

**Goal**: A user describes a diagram in natural language and Claude generates valid, professionally styled Excalidraw JSON using the format reference and styling defaults

**Independent Test**: Provide a diagram description (e.g., "draw a flowchart with three steps") → verify output is valid Excalidraw JSON with correct element types, proper bindings, and styling matching styling-defaults.md brand

### Implementation for User Story 1

- [X] T006 [US1] Create SKILL.md in `plugins/diagramming/excalidraw-diagrams/skills/excalidraw-diagrams/SKILL.md` with: frontmatter per skill-interface.md contract (name, description, metadata, allowed-tools), collaborative design flow (FR-012: ask clarifying questions before generating), instructions to load excalidraw-format.md and styling-defaults.md for every request, instructions to save output as `.excalidraw` file, and structured generation guidance covering: element creation, binding setup (including arrow label binding via `containerId` to arrow ID with `boundElements` back-reference), multi-line labels with `\n` in both `text` and `originalText`, anti-pattern warning against `containerId: null` with manual `x`/`y` positioning for bound text, and styling application from brand defaults

**Checkpoint**: User Story 1 fully functional — Claude can generate styled Excalidraw diagrams from descriptions

---

## Phase 4: User Story 2 — Validate Diagram Visually via PNG Render (Priority: P2)

**Goal**: After generating an Excalidraw diagram, Claude renders it to PNG for visual inspection without requiring external tools

**Independent Test**: Provide any valid Excalidraw JSON file to the render script → verify it produces a readable PNG with correct element rendering, colours, and text

### Implementation for User Story 2

- [X] T007 [US2] Implement render script in `plugins/diagramming/excalidraw-diagrams/skills/excalidraw-diagrams/scripts/render.mjs` per render-script.md contract: CLI interface (`node render.mjs <input-path> [output-path] [--width <pixels>]`), direct PNG rendering via @excalidraw/utils exportToCanvas(), exit codes 0/1, stdout format, Node.js 22+, handle empty elements array (render blank PNG), handle appState.viewBackgroundColor
- [X] T008 [US2] Update SKILL.md in `plugins/diagramming/excalidraw-diagrams/skills/excalidraw-diagrams/SKILL.md` to add render script invocation instructions: after saving .excalidraw file, run `node render.mjs <path>` to generate PNG preview for visual validation (FR-011)

**Checkpoint**: User Stories 1 AND 2 both work independently — diagrams generate and render to PNG

---

## Phase 5: User Story 3 — Use Diagram Templates for Specific Artifact Types (Priority: P2)

**Goal**: When a user requests a specific diagram type, Claude uses the appropriate template to apply correct element conventions, layout patterns, and visual language for that artifact type

**Independent Test**: Request each of the 5 supported diagram types → verify output follows the conventions defined in that type's template (correct shapes, labelling, grouping, layout)

### Implementation for User Story 3

- [X] T009 [P] [US3] Create C4 diagrams template in `plugins/diagramming/excalidraw-diagrams/skills/excalidraw-diagrams/assets/templates/c4-diagrams.md` defining C4 model specification (Context, Container, Component levels), shape-to-concept mapping (rectangles for systems/containers, boundary frames for contexts), labelling conventions (multiline name + type via `\n`), connection patterns (arrows with bound text labels via `containerId`, `lineHeight: 1.25`), and example JSON patterns using `mode: "orbit"` binding format with calculated text positions per FR-007
- [X] T010 [P] [US3] Create data flow template in `plugins/diagramming/excalidraw-diagrams/skills/excalidraw-diagrams/assets/templates/data-flow.md` defining DFD conventions: external entities (rectangles), processes (ellipses/rounded rectangles), data stores (open rectangles/parallel lines), data flows (arrows with bound text labels via `containerId`, `lineHeight: 1.25`), example JSON using `mode: "orbit"` binding with calculated text positions, and levelling approach
- [X] T011 [P] [US3] Create cloud architecture template in `plugins/diagramming/excalidraw-diagrams/skills/excalidraw-diagrams/assets/templates/cloud-architecture.md` defining multi-cloud conventions (AWS/GCP/Azure): service category grouping, VPC/subnet boundary frames, consistent iconography conventions (shape + label patterns for compute, storage, networking, databases), and connection patterns (arrow labels via `containerId` binding per `excalidraw-format.md`)
- [X] T012 [P] [US3] Create flowchart template in `plugins/diagramming/excalidraw-diagrams/skills/excalidraw-diagrams/assets/templates/flowchart.md` defining flowchart and decision tree conventions: process (rectangles), decision (diamonds), terminator (rounded rectangles), flow arrows with labels (arrow labels via `containerId` binding per `excalidraw-format.md`), swim lanes for roles, and top-to-bottom or left-to-right layout
- [X] T013 [P] [US3] Create BPMN template in `plugins/diagramming/excalidraw-diagrams/skills/excalidraw-diagrams/assets/templates/bpmn.md` defining BPMN 2.0 conventions: events (circles — start/intermediate/end), tasks (rounded rectangles), gateways (diamonds — exclusive/parallel/inclusive), swim lanes (horizontal frames), message flows (arrow labels via `containerId` binding per `excalidraw-format.md`), and sequence flows per FR-007
- [X] T014 [US3] Update SKILL.md in `plugins/diagramming/excalidraw-diagrams/skills/excalidraw-diagrams/SKILL.md` to add template selection logic: detect diagram type from user request, load appropriate template from `assets/templates/`, apply template conventions on top of styling defaults, fall back to general-purpose styling for unsupported types
- [X] T019 [P] [US3] Add arrow label binding cross-reference callouts to all 5 templates (`flowchart.md`, `cloud-architecture.md`, `bpmn.md`, `c4-diagrams.md`, `data-flow.md`) pointing to `excalidraw-format.md` § "Arrow label rules" as single source of truth for `containerId` binding, `lineHeight: 1.25`, and `mode: "orbit"` format. Fix `data-flow.md` Level 1 example to include labelled arrow (`lbl-flow1` bound to `flow1`)

**Checkpoint**: All 5 diagram types produce output following established visual conventions

---

## Phase 6: User Story 4 — Iterate and Refine Diagrams (Priority: P3)

**Goal**: A user reviews a generated diagram and requests modifications — Claude updates the existing JSON while preserving styling consistency

**Independent Test**: Generate a diagram, then request a specific modification (e.g., "add a notification service") → verify modified JSON retains unchanged elements with correct styling and properly applies the requested change

### Implementation for User Story 4

- [X] T015 [US4] Update SKILL.md in `plugins/diagramming/excalidraw-diagrams/skills/excalidraw-diagrams/SKILL.md` to add iteration guidance: how to modify existing Excalidraw JSON (add/remove/reposition elements), preserve existing element IDs and styling, update arrow bindings when elements move, maintain brand consistency from styling-defaults.md across iterations, and re-render PNG after modifications

**Checkpoint**: All user stories independently functional — generate, render, template, iterate

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Plugin documentation, marketplace registration, and validation

- [X] T016 [P] Create plugin README.md in `plugins/diagramming/excalidraw-diagrams/README.md` covering: what the plugin is, what the skill does, supported diagram types, installation instructions, usage examples, render script setup (npm install + Node.js 22+), and quickstart guide per quickstart.md
- [X] T017 Update root `README.md` and `.claude-plugin/marketplace.json` to register the new excalidraw-diagrams plugin in the marketplace
- [X] T018 Run quickstart.md validation: install plugin, generate a test diagram, render to PNG, verify end-to-end flow works

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — core skill definition
- **US2 (Phase 4)**: Depends on Setup (package.json) — render script is independent of SKILL.md content but T008 updates SKILL.md
- **US3 (Phase 5)**: Depends on Foundational — templates reference styling defaults. T014 depends on T006 (SKILL.md must exist)
- **US4 (Phase 6)**: Depends on US1 (SKILL.md must exist with generation guidance)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — no dependencies on other stories
- **User Story 2 (P2)**: Can start after Setup (Phase 1) — render script is independent; T008 depends on T006
- **User Story 3 (P2)**: Templates (T009–T013) can start after Foundational; T014 depends on T006
- **User Story 4 (P3)**: Depends on T006 (SKILL.md must exist for iteration updates)

### Within Each User Story

- Reference material before skill definition
- Core implementation before integration updates
- SKILL.md updates are sequential (T006 → T008 → T014 → T015)

### Parallel Opportunities

- T002 and T003 can run in parallel (different files in Setup)
- T004 and T005 can run in parallel (different reference files in Foundational)
- T009, T010, T011, T012, T013 can ALL run in parallel (5 independent template files)
- T007 can run in parallel with T006 (render script vs SKILL.md — different files)

---

## Parallel Example: User Story 3

```bash
# Launch all 5 template files together (all independent):
Task: "Create C4 template in assets/templates/c4-diagrams.md"
Task: "Create data flow template in assets/templates/data-flow.md"
Task: "Create cloud architecture template in assets/templates/cloud-architecture.md"
Task: "Create flowchart template in assets/templates/flowchart.md"
Task: "Create BPMN template in assets/templates/bpmn.md"

# Then update SKILL.md with template selection (depends on all templates):
Task: "Update SKILL.md with template selection logic"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T005)
3. Complete Phase 3: User Story 1 (T006)
4. **STOP and VALIDATE**: Generate a diagram from a description, verify valid JSON with correct styling
5. Usable immediately — users paste JSON into excalidraw.com

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Generate styled diagrams (MVP!)
3. Add User Story 2 → PNG preview closes the feedback loop
4. Add User Story 3 → Templates elevate quality for specific diagram types
5. Add User Story 4 → Iteration support for refinement
6. Polish → Documentation, marketplace registration, end-to-end validation

### Parallel Execution (Single Developer)

After Foundational phase:

- T006 (SKILL.md) and T007 (render.mjs) can run in parallel
- All 5 templates (T009–T013) can run in parallel
- SKILL.md updates (T008, T014, T015) must be sequential

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- SKILL.md is updated incrementally across US1 (T006), US2 (T008), US3 (T014), US4 (T015)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No automated tests — validation is manual via render script and visual inspection
