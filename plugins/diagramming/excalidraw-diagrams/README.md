# excalidraw-diagrams

Generate professional, consistently styled Excalidraw diagrams from natural language
descriptions. Claude handles the design conversation, generates valid Excalidraw JSON,
and can render PNG previews — all without leaving your editor.

## What This Plugin Does

The `excalidraw-diagrams` skill enables Claude to:

1. **Generate diagrams from descriptions** — describe what you want, Claude asks
   clarifying questions, then produces valid Excalidraw JSON with professional styling
2. **Render PNG previews** — convert any `.excalidraw` file to PNG for visual
   inspection using a self-contained Node.js script
3. **Apply diagram-type templates** — correct visual conventions for C4, data flow,
   cloud architecture, flowcharts, and BPMN
4. **Iterate and refine** — modify existing diagrams while preserving styling consistency

## Supported Diagram Types

| Type | Conventions |
|------|-------------|
| **C4** | Context, Container, and Component levels per the C4 Model |
| **Data Flow** | Yourdon–DeMarco DFD with external entities, processes, data stores |
| **Cloud Architecture** | AWS / GCP / Azure service layouts with VPC/subnet boundaries |
| **Flowchart** | ANSI/ISO notation — process, decision, terminator, swim lanes |
| **BPMN** | BPMN 2.0 — events, tasks, gateways, pools, swim lanes |

For diagram types not in the list, Claude applies the default styling brand and
general box-and-arrow conventions.

## Installation

```text
/plugin marketplace add artislismanis/my-agent-skills
/plugin install excalidraw-diagrams@my-agent-skills
```

### Render Script Setup (one-time)

The PNG render script requires Node.js 22+ and a one-time `npm install`:

```bash
cd ~/.claude/plugins/excalidraw-diagrams/skills/excalidraw-diagrams/scripts
npm install
```

This installs `excalidraw-to-svg` and `@resvg/resvg-js` locally — no global packages.

## Usage

### Generate a Diagram

Ask Claude to create a diagram:

> "Draw a C4 context diagram for an e-commerce system with a web app,
> payment gateway, and inventory service."

Claude will:
1. Ask clarifying questions about the diagram's content and structure
2. Generate a `.excalidraw` file with professional styling
3. Render a PNG preview for visual inspection

### Render an Existing File

```bash
cd ~/.claude/plugins/excalidraw-diagrams/skills/excalidraw-diagrams/scripts
node render.mjs /path/to/diagram.excalidraw
# → produces /path/to/diagram.png
```

Options:
```bash
node render.mjs input.excalidraw output.png --width 1600
```

### Iterate on a Diagram

> "Add a notification service connected to the order service."

Claude reads the existing `.excalidraw` file, adds the new element with consistent
styling and proper bindings, and re-renders the PNG.

## Output Files

- **`.excalidraw`** — valid Excalidraw JSON, open directly in [excalidraw.com](https://excalidraw.com)
- **`.png`** — rendered preview for visual validation

## Styling

All diagrams use a consistent professional brand:

- **Colours**: Blue (internal), green (external), yellow (data/decision), grey (infrastructure)
- **Font**: Nunito (clean, readable sans-serif)
- **Strokes**: `strokeWidth: 2`, `roughness: 0` (clean lines)
- **Fill**: Solid colours, no hachure by default

To customise styling, tell Claude what you want: "use darker blue backgrounds" or
"make the arrows dashed". Claude applies your override while keeping all other defaults.

## Plugin Contents

```text
excalidraw-diagrams/
├── .claude-plugin/
│   └── plugin.json              # Plugin metadata
├── README.md                    # This file
└── skills/
    └── excalidraw-diagrams/
        ├── SKILL.md             # Skill definition and generation instructions
        ├── scripts/
        │   ├── render.mjs       # PNG render script
        │   └── package.json     # Script dependencies
        ├── references/
        │   ├── excalidraw-format.md   # Excalidraw JSON format reference
        │   └── styling-defaults.md   # Brand: colours, fonts, stroke settings
        └── assets/
            └── templates/
                ├── c4-diagrams.md        # C4 Model conventions
                ├── data-flow.md          # DFD conventions
                ├── cloud-architecture.md # AWS/GCP/Azure conventions
                ├── flowchart.md          # Flowchart/decision tree conventions
                └── bpmn.md              # BPMN 2.0 conventions
```

## Prerequisites

- Claude Code with plugin support
- Node.js 22+ (for PNG rendering only)
- No other dependencies beyond `npm install` in `scripts/`
