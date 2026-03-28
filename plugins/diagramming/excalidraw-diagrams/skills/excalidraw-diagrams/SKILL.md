---
name: excalidraw-diagrams
description: >-
  Generate professional Excalidraw diagrams from natural language descriptions.
  Use when the user asks to create, draw, or visualise diagrams including C4,
  flowcharts, BPMN, data flow, and cloud architecture diagrams. Produces valid
  Excalidraw JSON with consistent professional styling.
metadata:
  version: 2.0.0
  author: Artis Lismanis
allowed-tools: Bash Read Write Agent
---

# Excalidraw Diagram Skill

You orchestrate the creation of professional, consistently styled Excalidraw diagrams
from natural language. Your role is the **design conversation** — understand what the
user wants, then delegate technical generation to the `excalidraw-builder` agent.

## Design Session

**Do not generate JSON.** First, understand the diagram's intent:

1. **Identify the diagram type** (C4, flowchart, BPMN, data flow, cloud architecture, or general)
2. Load `references/visual-language.md` and the relevant type card from `references/diagram-types/`
3. **Ask 2–4 targeted questions** covering:
   - Systems, components, actors, and their names
   - Relationships and data flows between them
   - Groupings, boundaries, or swim lanes needed
   - Level of detail required
4. **Confirm your understanding** — summarise the planned diagram before proceeding

If the user's description is already detailed, confirm your interpretation in one message.

### Diagram Type → Reference Card

| User requests... | Load type card |
|-----------------|----------------|
| C4, context, container, component diagram | `references/diagram-types/c4.md` |
| Data flow, DFD | `references/diagram-types/data-flow.md` |
| AWS, GCP, Azure, cloud, infrastructure | `references/diagram-types/cloud-architecture.md` |
| Flowchart, decision tree, process flow | `references/diagram-types/flowchart.md` |
| BPMN, business process, swim lane | `references/diagram-types/bpmn.md` |
| Anything else | Apply `references/visual-language.md` defaults; box-and-arrow conventions |

---

## Generation: Delegate to excalidraw-builder Agent

Once the user confirms the diagram scope, construct a **high-level diagram description**
(not raw Excalidraw JSON) and pass it to the `excalidraw-builder` agent.

### Builder Input Format

```json
{
  "diagramType": "flowchart",
  "direction": "top-to-bottom",
  "outputPath": "/path/to/output.excalidraw",
  "elements": [
    { "id": "start", "shape": "rounded-rect", "role": "terminal", "label": "Start", "size": [160, 60] },
    { "id": "p1",    "shape": "rect",          "role": "internal", "label": "Process Data" },
    { "id": "d1",    "shape": "diamond",        "role": "decision", "label": "Valid?",      "size": [120, 120] },
    { "id": "end",   "shape": "rounded-rect",  "role": "terminal", "label": "End",          "size": [160, 60] }
  ],
  "connections": [
    { "from": "start", "to": "p1" },
    { "from": "p1",    "to": "d1" },
    { "from": "d1",    "to": "end", "label": "Yes" },
    { "from": "d1",    "to": "err", "label": "No", "style": "dashed" }
  ],
  "frames": [
    { "id": "f1", "name": "Validation Flow", "contains": ["start", "p1", "d1", "end"] }
  ]
}
```

**Supported shapes**: `rect`, `rounded-rect`, `diamond`, `ellipse`, `frame`
**Supported roles**: `internal`, `external`, `infrastructure`, `dataStore`, `decision`, `terminal`, `terminal-start`, `terminal-end`, `error`

Pass this description to the `excalidraw-builder` agent. The agent handles:
- Layout calculation and coordinate placement
- Brand styling application from `references/brand.md`
- Binding wiring (shapes ↔ arrows ↔ labels)
- Text positioning and sizing
- Running `build.mjs`, `validate.mjs`, and `render.mjs`
- Returning the PNG for your review

---

## Iteration

When the user requests changes, describe them to the `excalidraw-builder` agent:

- **Add/remove elements**: provide updated builder input JSON
- **Restyle an element**: specify element ID + desired changes
- **Repositioning**: note which elements need moving and why
- **Small targeted edits**: the agent can edit the .excalidraw file directly for minor tweaks

---

## Render Script (fallback — if agent unavailable)

If the agent cannot be used, render manually after writing the .excalidraw file:

```bash
# Check dependencies
ls "${CLAUDE_SKILL_DIR}/scripts/node_modules" 2>/dev/null

# Install if missing (ask user first)
cd "${CLAUDE_SKILL_DIR}/scripts" && npm install

# Render
cd "${CLAUDE_SKILL_DIR}/scripts"
node render.mjs <path-to-file>.excalidraw
```

Output: `<filename>.png` in the same directory. Accepts `[--width <pixels>]` (default 1200).
