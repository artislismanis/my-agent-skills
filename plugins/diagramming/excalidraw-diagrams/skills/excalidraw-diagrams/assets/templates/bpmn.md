# Template: BPMN Business Process Diagrams

**Standard**: BPMN 2.0 (Business Process Model and Notation)
**Use for**: Business workflows, approval processes, service interactions, process documentation

Apply styling defaults from `references/styling-defaults.md`. This template defines
BPMN-specific shape conventions. Note: Excalidraw does not have native BPMN shapes —
use the approximations below, which are standard practice for BPMN in general-purpose
diagramming tools.

---

## BPMN Elements and Excalidraw Shapes

### Events

Events mark where a process starts, ends, or is interrupted.

| BPMN Event | Excalidraw Shape | Background | Border | Notes |
|------------|-----------------|------------|--------|-------|
| Start Event | `ellipse` | `#d3f9d8` | single thin (`strokeWidth: 1`) | Entry point — one per pool |
| End Event | `ellipse` | `#ffe3e3` | double (simulate with thick `strokeWidth: 4`) | Termination |
| Intermediate Event | `ellipse` | `#fff3bf` | double thin | Timer, message, signal |
| Boundary Event | `ellipse` | `#fff3bf` | attached to task border | Interrupting exception |

Start/End Event size: `60 × 60`

```json
{ "type": "ellipse", "width": 60, "height": 60,
  "backgroundColor": "#d3f9d8", "strokeWidth": 1, "roughness": 0 }
```

### Tasks

Tasks are the work items — atomic activities performed by a person or system.

| BPMN Task Type | Excalidraw Shape | Background | Label Prefix |
|----------------|-----------------|------------|--------------|
| User Task | `rectangle` with roundness | `#dbe4ff` | No prefix (default) |
| Service Task | `rectangle` with roundness | `#dbe4ff` | `⚙` prefix or `[Service]` |
| Send Task | `rectangle` with roundness | `#dbe4ff` | `[Send]` prefix |
| Receive Task | `rectangle` with roundness | `#dbe4ff` | `[Receive]` prefix |
| Script Task | `rectangle` with roundness | `#dbe4ff` | `[Script]` prefix |
| Manual Task | `rectangle` with roundness | `#f1f3f5` | `[Manual]` prefix |

Task size: `160 × 80`

```json
{ "type": "rectangle", "width": 160, "height": 80,
  "roundness": { "type": 3 },
  "backgroundColor": "#dbe4ff", "strokeWidth": 2, "roughness": 0 }
```

### Gateways

Gateways control the flow — splitting or merging paths.

| BPMN Gateway | Excalidraw Shape | Background | Label Convention |
|--------------|-----------------|------------|-----------------|
| Exclusive (XOR) | `diamond` | `#fff3bf` | `X` in label or `"XOR"` |
| Parallel (AND) | `diamond` | `#fff3bf` | `+` in label or `"AND"` |
| Inclusive (OR) | `diamond` | `#fff3bf` | `O` in label or `"OR"` |
| Event-Based | `diamond` | `#fff3bf` | `"Event"` |

Gateway size: `80 × 80`

```json
{ "type": "diamond", "width": 80, "height": 80,
  "backgroundColor": "#fff3bf", "strokeWidth": 2, "roughness": 0 }
```

Label incoming arrow with the condition; label outgoing arrows with outcomes.

---

## Swim Lanes (Pools and Lanes)

BPMN processes are organised into **Pools** (participants) and **Lanes** (roles/systems
within a participant).

### Pool

A `frame` element representing one process participant.

```json
{ "type": "frame", "name": "Order Fulfilment Process",
  "width": 1200, "height": 400,
  "backgroundColor": "transparent", "strokeWidth": 2 }
```

### Lane

Horizontal bands within a pool, each representing a role or system.

Implement lanes as `rectangle` elements (or `frame` elements) stacked vertically
inside the pool frame:

```
Pool frame (full width)
├── Lane: Customer     (top strip, height: 140)
├── Lane: Order System (middle strip, height: 140)
└── Lane: Warehouse    (bottom strip, height: 140)
```

Lane label: vertical text at left edge — use standalone `text` element rotated
90° (`angle: -1.5708` ≈ -90°) or a horizontal label at left edge.

For simplicity, use horizontal lane labels at the top-left of each lane rectangle.

Lane styling:
```json
{ "type": "rectangle",
  "backgroundColor": "transparent", "strokeColor": "#1e1e1e",
  "strokeWidth": 1, "strokeStyle": "solid", "roughness": 0 }
```

---

## Flow Connections

| Flow Type | Arrow Style | Notes |
|-----------|-------------|-------|
| Sequence Flow | `solid` arrow | Normal flow between elements in same pool |
| Message Flow | `dashed` arrow | Cross-pool communication (different participants) |
| Association | `dotted` arrow, no arrowhead | Links annotation to element |
| Default Flow | `solid` arrow with `//` marking | Use arrow label `"[default]"` |
| Conditional Flow | `solid` arrow with diamond marker | Use arrow label with condition |

---

## Layout

### Horizontal Swim Lane Layout (recommended)

- Pool spans the full diagram width
- Lanes stack vertically (Customer on top, System in middle, Backend at bottom)
- Sequence flows run left-to-right within each lane
- Cross-lane flows go vertically (between lanes)
- Start Event at far left of first lane; End Event at far right

```
|————————————————————————————————————————————————|
| Customer  | (start) → Submit Order → ...       |
|————————————————————————————————————————————————|
| System    | Validate → Process Payment → ...   |
|————————————————————————————————————————————————|
| Warehouse | Pick → Pack → Ship → (end)         |
|————————————————————————————————————————————————|
```

Minimum lane height: `160px` (to fit tasks + arrows + labels)
Element start x: pool `x + 80` (leave room for lane label)
Horizontal spacing between elements: `60px`

### Spacing Within Lanes

- Elements within a lane: `y = lane.y + (lane.height / 2) - (element.height / 2)` to centre vertically
- Horizontal gap between tasks: `60px` between right edge of one and left edge of next
- Cross-lane arrows: keep as vertical as possible; use `elbowed: false` and set `points` to route clearly

---

## BPMN Labelling Rules

1. **Tasks**: Short imperative verb phrases — `"Review Application"`, `"Send Confirmation"`
2. **Gateways**: Question form or condition — `"Approved?"`, `"Amount > $500?"`
3. **Gateway branches**: Label outgoing arrows — `"Yes"` / `"No"`, `"Approved"` / `"Rejected"`
4. **Events**: Describe the trigger/result — `"Order Received"`, `"Payment Failed"`, `"Process Complete"`
5. **Lanes**: Role or system name — `"Customer"`, `"Finance Team"`, `"Payment Service"`
6. **Pool**: Overall process name — `"Order Fulfilment"`, `"Employee Onboarding"`

---

## Checklist Before Generating

- [ ] Every pool has at least one Start Event and one End Event
- [ ] Every Sequence Flow stays within the same pool (use Message Flow for cross-pool)
- [ ] Every gateway has labelled outgoing arrows
- [ ] Exclusive gateways have exactly one outgoing path taken at runtime
- [ ] Lanes cover the full pool height (no gaps between lane rectangles)
- [ ] Tasks are vertically centred within their lane
