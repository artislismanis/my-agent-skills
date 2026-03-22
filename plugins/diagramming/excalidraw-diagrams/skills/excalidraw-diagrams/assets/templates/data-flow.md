# Template: Data Flow Diagrams (DFD)

**Standard**: Yourdon–DeMarco DFD notation
**Levels**: Context (Level 0) and Detail (Level 1+)

Apply styling defaults from `references/styling-defaults.md`. This template
defines DFD-specific shape conventions on top of those defaults.

---

## DFD Concepts and Shapes

| DFD Concept | Excalidraw Shape | Background | Notes |
|-------------|-----------------|------------|-------|
| External Entity | `rectangle` | `#d3f9d8` | Source or sink outside the system |
| Process | `ellipse` | `#dbe4ff` | Transforms or handles data |
| Data Store | `rectangle` (open sides) | `#fff3bf` | Persistent storage (database, file, cache) |
| Data Flow | `arrow` | `transparent` | Labelled with the data being transferred |
| System Boundary | `frame` | `transparent` | Optional: wraps processes in scope |

---

## Shape Details

### External Entity (rectangle, green fill)

Represents a person, organisation, or external system that sends or receives data.

```json
{
  "type": "rectangle",
  "backgroundColor": "#d3f9d8",
  "strokeColor": "#1e1e1e",
  "strokeWidth": 2,
  "roughness": 0
}
```

Label: entity name only (`fontFamily: 6`, `fontSize: 16`)

### Process (ellipse, blue fill)

Represents a function or transformation. Label with a verb phrase.

```json
{
  "type": "ellipse",
  "backgroundColor": "#dbe4ff",
  "strokeColor": "#1e1e1e",
  "strokeWidth": 2,
  "roughness": 0,
  "roundness": { "type": 2 }
}
```

Label convention: `"1.0\nProcess Name"` — process number on first line, name on second.
Dimensions: `160 × 80` (wider than tall for readability).

### Data Store (open rectangle, yellow fill)

Represented as a rectangle with a visual cue. Use standard rectangle with a
distinctive colour. Label format: `"D1: Store Name"` (Yourdon convention).

```json
{
  "type": "rectangle",
  "backgroundColor": "#fff3bf",
  "strokeColor": "#1e1e1e",
  "strokeWidth": 2,
  "roughness": 0
}
```

Label: `"D1: Orders DB"` or `"D2: User Cache"`

### Data Flow (labelled arrow)

Each arrow carries a label describing the data being transferred.

```json
{
  "type": "arrow",
  "endArrowhead": "arrow",
  "strokeColor": "#1e1e1e",
  "strokeWidth": 2,
  "strokeStyle": "solid"
}
```

**Arrow label binding:** Data flow labels (e.g. `"Order Data"`, `"Payment Info"`)
use `containerId` binding with `lineHeight: 1.25` and calculated midpoint
positioning. See `references/excalidraw-format.md` section "Arrow label rules"
for the complete JSON pattern, sizing formulas, and readability rules.

Use `"strokeStyle": "dashed"` for async or event-driven flows.

---

## DFD Levels

### Level 0 — Context Diagram

- Single process bubble representing the entire system
- Show all external entities connected to the system
- Label all data flows in and out
- No data stores at Level 0

Layout: process at centre, entities arranged around it (top, bottom, left, right).

### Level 1 — Top-Level DFD

- Decompose the Level 0 process into major sub-processes
- Show data stores used between processes
- Show all external entities with their data flows
- Number processes starting from 1.0

Layout: left-to-right flow with external entities on far left/right, data stores
at the bottom.

### Level 2+ — Detailed DFD

- Further decompose any complex Level 1 process
- Use `frame` to indicate the boundary of the parent process being decomposed
- Number sub-processes as `1.1`, `1.2`, etc.

---

## Layout Guidelines

- **Left-to-right**: External entities on the left → processes in the middle → outputs on the right
- **Or top-to-bottom**: Inputs at top → processes in the middle → outputs at bottom
- Data stores typically at the bottom of the diagram
- Use `frame` to group processes within a system boundary
- Minimum 60px vertical spacing, 80px horizontal spacing between elements
- Avoid crossing arrows where possible — reroute elements for clarity

---

## Labelling Rules

1. Every process: verb phrase (`"Validate Order"`, `"Calculate Tax"`)
2. Every data flow: noun phrase describing the data (`"Order Request"`, `"Customer Record"`)
3. Every data store: `"D<n>: Name"` format
4. Every external entity: proper name (`"Customer"`, `"Payment Gateway"`)
5. Process IDs increase sequentially and are shown in the label

---

## Example: Level 1 DFD Snippet (3 processes)

```json
{
  "elements": [
    { "id": "ext1", "type": "rectangle", "backgroundColor": "#d3f9d8",
      "x": 60, "y": 200, "width": 140, "height": 70,
      "boundElements": [{"id": "lbl-ext1", "type": "text"}, {"id": "flow1", "type": "arrow"}],
      "strokeColor": "#1e1e1e", "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 0, "opacity": 100, "angle": 0, "groupIds": [], "frameId": null },
    { "id": "lbl-ext1", "type": "text", "x": 60, "y": 225, "width": 140, "height": 20,
      "text": "Customer", "fontSize": 16, "fontFamily": 6,
      "textAlign": "center", "verticalAlign": "middle",
      "containerId": "ext1", "originalText": "Customer", "autoResize": true, "lineHeight": 1.25,
      "strokeColor": "#1e1e1e", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 0, "opacity": 100, "angle": 0, "groupIds": [], "frameId": null, "boundElements": [] },
    { "id": "proc1", "type": "ellipse", "backgroundColor": "#dbe4ff",
      "x": 300, "y": 180, "width": 180, "height": 110,
      "boundElements": [{"id": "lbl-p1", "type": "text"}, {"id": "flow1", "type": "arrow"}],
      "strokeColor": "#1e1e1e", "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 0, "opacity": 100, "angle": 0, "groupIds": [], "frameId": null,
      "roundness": {"type": 2} },
    { "id": "lbl-p1", "type": "text", "x": 300, "y": 215, "width": 180, "height": 40,
      "text": "1.0\nValidate Order", "fontSize": 16, "fontFamily": 6,
      "textAlign": "center", "verticalAlign": "middle",
      "containerId": "proc1", "originalText": "1.0\nValidate Order", "autoResize": true, "lineHeight": 1.25,
      "strokeColor": "#1e1e1e", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 0, "opacity": 100, "angle": 0, "groupIds": [], "frameId": null, "boundElements": [] },
    { "id": "flow1", "type": "arrow",
      "x": 200, "y": 235, "width": 100, "height": 0,
      "points": [[0, 0], [100, 0]],
      "startBinding": { "mode": "orbit", "elementId": "ext1", "fixedPoint": [0.5001, 0.5001] },
      "endBinding": { "mode": "orbit", "elementId": "proc1", "fixedPoint": [0.5001, 0.5001] },
      "startArrowhead": null, "endArrowhead": "arrow",
      "strokeColor": "#1e1e1e", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 0, "opacity": 100, "angle": 0, "elbowed": false,
      "groupIds": [], "frameId": null, "boundElements": [{"id": "lbl-flow1", "type": "text"}] },
    { "id": "lbl-flow1", "type": "text",
      "x": 210, "y": 226, "width": 80, "height": 17.5,
      "text": "Order Data", "fontSize": 14, "fontFamily": 6,
      "textAlign": "center", "verticalAlign": "middle",
      "containerId": "flow1", "originalText": "Order Data", "autoResize": true, "lineHeight": 1.25,
      "strokeColor": "#1e1e1e", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 0, "opacity": 100, "angle": 0, "groupIds": [], "frameId": null, "boundElements": [] }
  ]
}
```
