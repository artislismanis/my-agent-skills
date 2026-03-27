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

| BPMN Event | Excalidraw Shape | Style Tier | Border Notes |
|------------|-----------------|------------|--------------|
| Start Event | `ellipse` | Standard | Thin border — use `strokeWidth: 1` |
| End Event | `ellipse` | Occasional Highlight | Thick border — use `strokeWidth: 4` |
| Intermediate Event | `ellipse` | Standard | Double thin — standard stroke |
| Boundary Event | `ellipse` | Standard | Attached to task border |

Size: `60 × 60`

```json
{ "type": "ellipse", "width": 60, "height": 60, "roundness": { "type": 2 }, "strokeWidth": 1 }
```

```json
{ "type": "ellipse", "width": 60, "height": 60, "roundness": { "type": 2 }, "strokeWidth": 4 }
```

### Tasks

Tasks are the work items — atomic activities performed by a person or system.

| BPMN Task Type | Excalidraw Shape | Style Tier | Label Prefix |
|----------------|-----------------|------------|--------------|
| User Task | `rectangle` with roundness | Standard | No prefix (default) |
| Service Task | `rectangle` with roundness | Standard | `[Service]` prefix |
| Send Task | `rectangle` with roundness | Standard | `[Send]` prefix |
| Receive Task | `rectangle` with roundness | Standard | `[Receive]` prefix |
| Script Task | `rectangle` with roundness | Standard | `[Script]` prefix |
| Manual Task | `rectangle` with roundness | Standard Light | `[Manual]` prefix |

Size: `160 × 80`

```json
{ "type": "rectangle", "roundness": { "type": 3 }, "width": 160, "height": 80 }
```

### Gateways

Gateways control the flow — splitting or merging paths.

| BPMN Gateway | Excalidraw Shape | Style Tier | Label Convention |
|--------------|-----------------|------------|-----------------|
| Exclusive (XOR) | `diamond` | Standard | `"X"` in label or `"XOR"` |
| Parallel (AND) | `diamond` | Standard | `"+"` in label or `"AND"` |
| Inclusive (OR) | `diamond` | Standard | `"O"` in label or `"OR"` |
| Event-Based | `diamond` | Standard | `"Event"` |

Size: `80 × 80`

```json
{ "type": "diamond", "width": 80, "height": 80 }
```

Label incoming arrow with the condition; label outgoing arrows with outcomes.

---

## Swim Lanes (Pools and Lanes)

BPMN processes are organised into **Pools** (participants) and **Lanes** (roles/systems
within a participant). Apply the multi-frame layout rules from
`references/styling-defaults.md` for spacing, cross-lane axis alignment, and
arrow routing.

### Pool

A `frame` element representing one process participant.

```json
{ "type": "frame", "name": "Order Fulfilment Process", "width": 1200, "height": 400 }
```

### Lane

Horizontal bands within a pool, each representing a role or system.

Implement lanes as nested `frame` elements stacked vertically inside the pool frame.
Minimum lane height: 200px. Leave 60px gap between consecutive lane frames.

```
Pool frame (full width)
├── Lane: Customer     (frame, height: 200)
├── 60px gap
├── Lane: Order System (frame, height: 200)
├── 60px gap
└── Lane: Warehouse    (frame, height: 200)
```

Lane label: set via the frame's `name` field.

---

## Flow Connections

| Flow Type | Arrow Style | Notes |
|-----------|-------------|-------|
| Sequence Flow | `solid` arrow | Normal flow between elements in same pool |
| Message Flow | `dashed` arrow | Cross-pool communication (different participants) |
| Association | `dotted` arrow, no arrowhead | Links annotation to element |
| Default Flow | `solid` arrow | Use arrow label `"[default]"` |
| Conditional Flow | `solid` arrow | Use arrow label with condition |

**Arrow label binding:** All flow labels (gateway branch labels like `"Yes"` /
`"No"`, condition labels, `"[default]"`) use `containerId` binding with
`lineHeight: 1.25` and calculated midpoint positioning. See
`references/excalidraw-format.md` section "Arrow label rules" for the complete
JSON pattern, sizing formulas, and readability rules.

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

- Elements within a lane: centre vertically — `y = lane.y + (lane.height / 2) - (element.height / 2)`
- Horizontal gap between tasks: `60px` between right edge of one and left edge of next
- Cross-lane arrows: follow cross-frame arrow rules in `references/styling-defaults.md` — straight vertical, perpendicular entry (top/bottom faces), gap symmetry

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
