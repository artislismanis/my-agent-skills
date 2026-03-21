# Contract: Render Script CLI

**Type**: Command-line interface
**Location**: `plugins/diagramming/excalidraw-diagrams/skills/excalidraw-diagrams/scripts/render.mjs`

## Interface

```text
node render.mjs <input-path> [output-path] [--width <pixels>]
```

### Arguments

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| `input-path` | Yes | — | Path to Excalidraw JSON file (`.excalidraw` or `.json`) |
| `output-path` | No | `<input-basename>.png` | Path for output PNG file |
| `--width` | No | `1200` | Output image width in pixels (height scales proportionally) |

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success — PNG written to output path |
| 1 | Error — invalid input, missing file, or render failure |

### Stdout

On success: `Rendered: <width>x<height> → <output-path>`
On error: Error message describing the failure

### Input Format

Valid Excalidraw JSON document (see data-model.md). Must contain at minimum:
- `type: "excalidraw"`
- `version: 2`
- `elements: [...]` (may be empty — an empty array renders a blank PNG per spec edge cases)

### Output Format

PNG image file. White background by default (or `appState.viewBackgroundColor`
if specified in input JSON).

### Prerequisites

- Node.js 22+
- Dependencies installed via `npm install` in the `scripts/` directory
