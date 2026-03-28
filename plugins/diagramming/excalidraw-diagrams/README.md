# excalidraw-diagrams

Generate professional, consistently styled Excalidraw diagrams from natural language
descriptions. Claude handles the design conversation, a builder script handles all JSON
generation and layout calculation, and a specialised agent orchestrates the full
build → validate → render pipeline.

## What This Plugin Does

The `excalidraw-diagrams` skill enables Claude to:

1. **Design diagrams collaboratively** — clarify content and structure through a concise conversation
2. **Generate via a builder script** — Claude constructs a high-level semantic description; the script handles coordinates, bindings, and text positioning
3. **Validate before rendering** — structural and visual checks run automatically before PNG generation
4. **Render PNG previews** — convert any `.excalidraw` file to PNG using a self-contained Node.js script
5. **Apply diagram-type templates** — correct visual conventions for C4, data flow, cloud architecture, flowcharts, and BPMN
6. **Iterate without JSON gymnastics** — describe what to change; the agent handles the rest

## Supported Diagram Types

| Type | Conventions |
|------|-------------|
| **C4** | Context, Container, and Component levels per the C4 Model |
| **Data Flow** | Yourdon–DeMarco DFD with external entities, processes, data stores |
| **Cloud Architecture** | AWS / GCP / Azure service layouts with VPC/subnet boundaries |
| **Flowchart** | ANSI/ISO notation — process, decision, terminator, swim lanes |
| **BPMN** | BPMN 2.0 — events, tasks, gateways, pools, swim lanes |

## Installation

```text
/plugin marketplace add artislismanis/my-agent-skills
/plugin install excalidraw-diagrams@my-agent-skills
```

### Render Script Dependencies

The PNG render script requires Node.js 22+ and three npm packages (`@excalidraw/utils`,
`@napi-rs/canvas`, `jsdom`). Claude will check for these automatically before the first
render and ask your permission to install them locally — no global packages needed.

## Usage

### Generate a Diagram

Ask Claude to create a diagram:

> "Draw a C4 context diagram for an e-commerce system with a web app,
> payment gateway, and inventory service."

Claude will:

1. Ask clarifying questions about content and structure
2. Construct a high-level semantic description (nodes, connections, roles)
3. Delegate to the `excalidraw-builder` agent which runs build → validate → render
4. Show you the PNG preview

### Render an Existing File

```bash
cd "${CLAUDE_SKILL_DIR}/scripts"
node render.mjs /path/to/diagram.excalidraw
# → produces /path/to/diagram.png

# Options
node render.mjs input.excalidraw output.png --width 1600
```

### Validate a File

```bash
cd "${CLAUDE_SKILL_DIR}/scripts"
node validate.mjs /path/to/diagram.excalidraw
# Exit 0 = valid, 1 = errors found, 2 = bad input
```

### Build from Description

```bash
cd "${CLAUDE_SKILL_DIR}/scripts"
node build.mjs /path/to/diagram-input.json /path/to/output.excalidraw
```

Input format documented in `build.mjs` header — high-level semantic JSON with
`elements` (nodes), `connections`, and optional `frames`.

### Iterate on a Diagram

> "Add a notification service connected to the order service."

Claude describes the change to the `excalidraw-builder` agent, which updates the
file, re-validates, and re-renders.

## Output Files

- **`.excalidraw`** — valid Excalidraw JSON, open directly in [excalidraw.com](https://excalidraw.com)
- **`.png`** — rendered preview for visual validation

## Styling

All diagrams use a consistent professional brand (see `references/brand.md`):

- **Colours**: Blue (internal), green (external), yellow (data/decision), grey (infrastructure)
- **Font**: Nunito (clean, readable sans-serif)
- **Strokes**: `strokeWidth: 2`, `roughness: 0` (clean lines)

Brand values live in `references/brand.json` and `references/brand.md`. To swap
the brand, update these two files — visual language principles remain in
`references/visual-language.md`.

## Plugin Contents

```text
excalidraw-diagrams/
├── .claude-plugin/
│   └── plugin.json                  # Plugin metadata (v2.0.0)
├── README.md                        # This file
├── agents/
│   └── excalidraw-builder/
│       └── agent.md                 # Technical builder agent (build → validate → render)
└── skills/
    └── excalidraw-diagrams/
        ├── SKILL.md                 # Thin orchestrator — design conversation + delegation
        ├── scripts/
        │   ├── build.mjs            # Element builder from high-level description
        │   ├── validate.mjs         # Structural + visual validator
        │   ├── render.mjs           # PNG renderer
        │   └── package.json         # Script dependencies
        ├── references/
        │   ├── visual-language.md   # Generic diagram principles (tool-agnostic)
        │   ├── brand.md             # Brand values: colours, fonts, sizes
        │   ├── brand.json           # Machine-readable brand config for scripts
        │   ├── excalidraw-format.md # Excalidraw JSON format reference (for edge cases)
        │   └── diagram-types/       # Quick-reference cards (design phase)
        │       ├── c4.md
        │       ├── bpmn.md
        │       ├── data-flow.md
        │       ├── cloud-architecture.md
        │       └── flowchart.md
        └── assets/
            └── templates/           # Full templates (loaded by agent per diagram type)
                ├── c4-diagrams.md
                ├── data-flow.md
                ├── cloud-architecture.md
                ├── flowchart.md
                └── bpmn.md
```

## Prerequisites

- Claude Code with plugin and agent support
- Node.js 22+ (for PNG rendering only)
- No other dependencies beyond `npm install` in `scripts/`
