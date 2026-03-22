# Template: Data Flow Diagrams (DFD)

**Standard**: Yourdon–DeMarco DFD notation
**Levels**: Context (Level 0) and Detail (Level 1+)

Apply styling defaults from `references/styling-defaults.md`. This template
defines DFD-specific shape conventions on top of those defaults.

---

## DFD Concepts and Shapes

| DFD Concept | Excalidraw Shape | Style Tier | Notes |
|-------------|-----------------|------------|-------|
| External Entity | `rectangle` | Standard | Source or sink outside the system |
| Process | `ellipse` | Standard | Transforms or handles data |
| Data Store | `rectangle` | Standard | Persistent storage (database, file, cache) |
| Data Flow | `arrow` | Arrow defaults | Labelled with the data being transferred |
| System Boundary | `frame` | Frame defaults | Optional: wraps processes in scope |

---

## Shape Details

### External Entity (rectangle)

Represents a person, organisation, or external system that sends or receives data.

```json
{ "type": "rectangle", "width": 140, "height": 70 }
```

Label: entity name only (`fontSize: 16`)

### Process (ellipse)

Represents a function or transformation. Label with a verb phrase.

```json
{ "type": "ellipse", "roundness": { "type": 2 }, "width": 160, "height": 80 }
```

Label convention: `"1.0\nProcess Name"` — process number on first line, name on second.

### Data Store (rectangle)

Represented as a rectangle with a distinctive style. Label format: `"D1: Store Name"` (Yourdon convention).

```json
{ "type": "rectangle", "width": 160, "height": 60 }
```

Label: `"D1: Orders DB"` or `"D2: User Cache"`

### Data Flow (labelled arrow)

Each arrow carries a label describing the data being transferred.

Use `"strokeStyle": "dashed"` for async or event-driven flows.

**Arrow label binding:** Data flow labels (e.g. `"Order Data"`, `"Payment Info"`)
use `containerId` binding with `lineHeight: 1.25` and calculated midpoint
positioning. See `references/excalidraw-format.md` section "Arrow label rules"
for the complete JSON pattern, sizing formulas, and readability rules.

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
