---
name: excalidraw-diagrams
description: >-
  Generate professional Excalidraw diagrams from natural language descriptions.
  Use when the user asks to create, draw, or visualise diagrams including C4,
  flowcharts, BPMN, data flow, and cloud architecture diagrams. Produces valid
  Excalidraw JSON with consistent professional styling.
metadata:
  version: 1.0.0
  author: Artis Lismanis
allowed-tools: Bash Read Write
---

# Excalidraw Diagram Skill

You generate professional, consistently styled Excalidraw diagrams from natural
language descriptions. Every diagram you produce is valid Excalidraw JSON saved
as a `.excalidraw` file, styled according to the brand defined in
`references/styling-defaults.md`.

## Reference Material

**Always load before generating any diagram:**

1. Read `references/excalidraw-format.md` — Excalidraw JSON format, all element
   types, binding rules, and a complete worked example
2. Read `references/styling-defaults.md` — colour palette, fonts, stroke
   settings, and layout spacing guidelines

**Load for specific diagram types:**

- C4 diagrams → `assets/templates/c4-diagrams.md`
- Data flow diagrams → `assets/templates/data-flow.md`
- Cloud architecture → `assets/templates/cloud-architecture.md`
- Flowcharts / decision trees → `assets/templates/flowchart.md`
- BPMN business process → `assets/templates/bpmn.md`

If the diagram type does not match any template, apply styling defaults and
general-purpose box-and-arrow conventions.

---

## Design Session (FR-012)

**Do not generate the diagram immediately.** First, have a collaborative design
conversation to understand the diagram's intent and content:

1. **Identify the diagram type** from the user's description (C4, flowchart,
   BPMN, data flow, cloud architecture, or general)
2. **Ask clarifying questions** about:
   - The systems, components, or actors involved and their names
   - The relationships and data flows between them
   - Any groupings, boundaries, or swim lanes needed
   - The level of detail (high-level overview vs. detailed component view)
   - Any specific technology labels or annotations required
3. **Confirm your understanding** by summarising the planned diagram before
   generating JSON
4. Only proceed to generation once the user confirms the scope and content

Keep the design conversation concise — typically 2–4 targeted questions. If the
user's description is already detailed, confirm your interpretation in one
message and proceed.

---

## Generation Rules

### Structure

1. Load `references/excalidraw-format.md` and `references/styling-defaults.md`
2. If a template applies, load it from `assets/templates/`
3. Generate all elements in a single valid JSON document (schema version 2)
4. Assign unique short alphanumeric IDs to every element (e.g. `"r1"`, `"a2"`)
5. Every shape that has a text label needs BOTH:
   - A bound `text` element with `containerId` set to the shape's `id`
   - A `boundElements` entry on the shape referencing the text element
6. Every arrow that connects two shapes needs BOTH shapes' `boundElements` to
   reference the arrow

### Styling

Apply `references/styling-defaults.md` values to every element:

- `strokeColor`: `#1e1e1e`
- `strokeWidth`: `2`
- `roughness`: `0`
- `opacity`: `100`
- `fontFamily`: `6` (Nunito) for labels
- Background colours: use the palette by role (blue for internal, green for
  external, grey for infrastructure, yellow for data stores / decisions)
- `fillStyle`: `"solid"` for coloured shapes
- Arrow defaults: `endArrowhead: "arrow"`, `strokeStyle: "solid"`

If the user specified any style overrides during the design session, apply those
overrides while keeping all other defaults.

### Layout

- Start elements at `x: 100, y: 100` to avoid clipping
- Minimum 40px gap between elements
- Arrow `gap: 8` in bindings
- Standard shape: `160 × 80` for boxes, `80 × 80` for circles and diamonds
- Frame padding: 40px inside boundary around children
- Top-to-bottom flows: 60px vertical spacing between shape edges
- Left-to-right flows: 80px horizontal spacing between shape edges

### Text and Labels

- All shape labels: `textAlign: "center"`, `verticalAlign: "middle"`, `fontSize: 16`
- Sub-labels / technology annotations: `fontSize: 14`
- Frame names: `fontSize: 18`
- Arrow labels (if used): standalone text near midpoint, `fontSize: 14`
- Text outside shapes MUST be shown in full. Text inside shapes MAY be
  truncated only when necessary — if truncated, flag this to the user and ask
  for a decision.

### Validation Before Output

Before saving, verify:
- [ ] Every `id` is unique
- [ ] Every arrow binding references an existing shape `id`
- [ ] Every text `containerId` references an existing shape, with back-reference
- [ ] Every `frameId` references an existing frame element
- [ ] All `points` arrays have at least 2 entries
- [ ] No overlapping elements (unless template-defined nesting like C4 boundaries)

---

## Output

Save the generated diagram as a `.excalidraw` file using the Write tool. Use a
descriptive filename based on the diagram content (e.g.
`ecommerce-c4-context.excalidraw`).

After saving:

1. Confirm the file path to the user
2. Run the render script to generate a PNG preview (see render instructions below)
3. Show the PNG to the user for visual validation
4. Ask if any adjustments are needed

---

## Render Script

After saving a `.excalidraw` file, render it to PNG for visual validation:

```bash
cd <skill-directory>/scripts
npm install  # first time only — installs excalidraw-to-svg and @resvg/resvg-js
node render.mjs <path-to-file>.excalidraw
```

This produces `<filename>.png` in the same directory as the input file.

The render script accepts:
- `<input-path>` — required: path to the `.excalidraw` file
- `[output-path]` — optional: custom output path (default: same dir, `.png` extension)
- `[--width <pixels>]` — optional: output width (default: `1200`)

On success it prints: `Rendered: <width>x<height> → <output-path>`

**Prerequisites**: Node.js 22+ must be available. Run `npm install` in the
`scripts/` directory once before first use.

---

## Iteration

When the user requests changes to an existing diagram:

1. Read the existing `.excalidraw` file
2. Identify which elements to add, remove, or modify
3. For additions: generate new elements with fresh unique IDs, apply brand
   styling, establish proper bindings
4. For removals: remove the element AND any arrows/texts bound to it; remove
   back-references from connected shapes
5. For moves: update `x`/`y` coordinates and recalculate arrow `points` to
   maintain connectivity
6. Preserve all unchanged element IDs and styling
7. Maintain consistency with `references/styling-defaults.md` brand throughout
8. Maintain consistency with the applicable diagram template conventions
9. Save the updated file and re-render to PNG for visual confirmation

---

## Template Selection

| User requests... | Load template |
|-----------------|---------------|
| C4, context diagram, container diagram, component diagram | `assets/templates/c4-diagrams.md` |
| Data flow, DFD, data diagram | `assets/templates/data-flow.md` |
| AWS, GCP, Azure, cloud architecture, infrastructure | `assets/templates/cloud-architecture.md` |
| Flowchart, flow diagram, decision tree, process flow | `assets/templates/flowchart.md` |
| BPMN, business process, swim lane diagram | `assets/templates/bpmn.md` |
| Anything else | Apply styling defaults; use general box-and-arrow conventions |

For unsupported types, apply `references/styling-defaults.md` defaults and
note to the user that no specific template is available. Offer to clarify the
conventions to use.
