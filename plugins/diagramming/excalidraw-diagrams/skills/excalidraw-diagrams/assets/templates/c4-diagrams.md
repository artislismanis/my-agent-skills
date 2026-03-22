# Template: C4 Diagrams

**Standard**: C4 Model (Simon Brown) — https://c4model.com
**Supported levels**: Context, Container, Component

Apply the styling defaults from `references/styling-defaults.md` for all colours,
fonts, and stroke settings. This template defines C4-specific shape conventions,
labelling patterns, and layout approach on top of those defaults.

---

## C4 Level 1 — System Context Diagram

**Purpose**: Shows the system in context with its users and external dependencies.
High-level, suitable for non-technical stakeholders.

### Shape Conventions

| C4 Concept | Excalidraw Shape | Background | Notes |
|------------|-----------------|------------|-------|
| Person / User | `rectangle` with rounded corners | `#d3f9d8` | Optional: use ellipse |
| System (in scope) | `rectangle` | `#dbe4ff` | Primary subject — use blue |
| External System | `rectangle` | `#f1f3f5` | Grey — clearly outside scope |
| System Boundary | `frame` | `transparent` | Named boundary around in-scope system |

### Label Convention

Each shape has **two text lines** using bound text element:
- **Line 1 (bold style)**: Name — `fontFamily: 6`, `fontSize: 16`
- **Line 2**: `[Person]` or `[Software System]` tag — `fontFamily: 6`, `fontSize: 14`

Use `\n` within the text string:
```json
"text": "E-Commerce System\n[Software System]"
```

### Relationship Conventions

- Use `arrow` elements with `endArrowhead: "arrow"`
- Label arrows with a short description of the interaction
- Arrow labels use `containerId` binding to the arrow (bound text, `fontSize: 14`)
- Use `"strokeStyle": "dashed"` for async or future relationships

**Arrow label binding:** All relationship labels use `containerId` binding with
`lineHeight: 1.25` and calculated midpoint positioning. See
`references/excalidraw-format.md` section "Arrow label rules" for the complete
JSON pattern, sizing formulas, and readability rules.

### Layout

- Arrange in-scope system at centre
- Users/persons at top or left
- External systems at right or bottom
- Boundary frame wraps the in-scope system (40px padding)

### Example Structure (3-element context)

```json
{
  "type": "excalidraw",
  "version": 2,
  "elements": [
    {
      "id": "user1", "type": "rectangle",
      "x": 100, "y": 200, "width": 160, "height": 80,
      "roundness": { "type": 3 },
      "strokeColor": "#1e1e1e", "backgroundColor": "#d3f9d8",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 0, "opacity": 100, "angle": 0,
      "groupIds": [], "frameId": null,
      "boundElements": [{ "id": "lbl-user1", "type": "text" }, { "id": "arr1", "type": "arrow" }]
    },
    {
      "id": "lbl-user1", "type": "text",
      "x": 100, "y": 220, "width": 160, "height": 40,
      "text": "Customer\n[Person]", "fontSize": 16, "fontFamily": 6,
      "textAlign": "center", "verticalAlign": "middle",
      "containerId": "user1", "originalText": "Customer\n[Person]", "autoResize": true, "lineHeight": 1.25,
      "strokeColor": "#1e1e1e", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 0, "opacity": 100, "angle": 0,
      "groupIds": [], "frameId": null, "boundElements": []
    },
    {
      "id": "sys1", "type": "rectangle",
      "x": 380, "y": 200, "width": 200, "height": 100,
      "strokeColor": "#1e1e1e", "backgroundColor": "#dbe4ff",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 0, "opacity": 100, "angle": 0,
      "groupIds": [], "frameId": "boundary1",
      "boundElements": [{ "id": "lbl-sys1", "type": "text" }, { "id": "arr1", "type": "arrow" }]
    },
    {
      "id": "lbl-sys1", "type": "text",
      "x": 380, "y": 230, "width": 200, "height": 40,
      "text": "E-Commerce System\n[Software System]", "fontSize": 16, "fontFamily": 6,
      "textAlign": "center", "verticalAlign": "middle",
      "containerId": "sys1", "originalText": "E-Commerce System\n[Software System]", "autoResize": true, "lineHeight": 1.25,
      "strokeColor": "#1e1e1e", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 0, "opacity": 100, "angle": 0,
      "groupIds": [], "frameId": "boundary1", "boundElements": []
    },
    {
      "id": "boundary1", "type": "frame",
      "x": 340, "y": 160, "width": 280, "height": 180,
      "name": "E-Commerce Context",
      "strokeColor": "#1e1e1e", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 0, "opacity": 100, "angle": 0,
      "groupIds": [], "frameId": null, "boundElements": []
    },
    {
      "id": "arr1", "type": "arrow",
      "x": 260, "y": 240, "width": 120, "height": 0,
      "points": [[0, 0], [120, 0]],
      "startBinding": { "mode": "orbit", "elementId": "user1", "fixedPoint": [0.5001, 0.5001] },
      "endBinding": { "mode": "orbit", "elementId": "sys1", "fixedPoint": [0.5001, 0.5001] },
      "startArrowhead": null, "endArrowhead": "arrow",
      "elbowed": false,
      "strokeColor": "#1e1e1e", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 0, "opacity": 100, "angle": 0,
      "groupIds": [], "frameId": null,
      "boundElements": [{ "id": "lbl-arr1", "type": "text" }]
    },
    {
      "id": "lbl-arr1", "type": "text",
      "x": 290, "y": 231, "width": 60, "height": 17.5,
      "text": "Browses", "fontSize": 14, "fontFamily": 6,
      "textAlign": "center", "verticalAlign": "middle",
      "containerId": "arr1", "originalText": "Browses", "autoResize": true, "lineHeight": 1.25,
      "strokeColor": "#1e1e1e", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 0, "opacity": 100, "angle": 0,
      "groupIds": [], "frameId": null, "boundElements": []
    }
  ],
  "appState": { "viewBackgroundColor": "#ffffff" },
  "files": {}
}
```

---

## C4 Level 2 — Container Diagram

**Purpose**: Zooms into the in-scope system to show containers (applications,
databases, services) and their interactions.

### Shape Conventions

| C4 Concept | Excalidraw Shape | Background | Label Tag |
|------------|-----------------|------------|-----------|
| Web Application | `rectangle` | `#dbe4ff` | `[Web Application]` |
| API / Backend | `rectangle` | `#dbe4ff` | `[REST API]` or `[gRPC Service]` |
| Database | `rectangle` | `#fff3bf` | `[PostgreSQL Database]` or `[Redis Cache]` |
| Message Queue | `rectangle` | `#fff3bf` | `[RabbitMQ Queue]` |
| Mobile App | `rectangle` rounded | `#dbe4ff` | `[Mobile App]` |
| External System | `rectangle` | `#f1f3f5` | `[Software System]` |
| System Boundary | `frame` | `transparent` | Named frame for the system |

### Label Convention

Three-line label for containers:
```
Name
[Container: Technology]
Short description
```

Example text string:
```json
"text": "Order Service\n[Container: Node.js]\nManages order lifecycle"
```

### Relationship Conventions

- Arrow labels describe the protocol and interaction: `"REST/HTTPS"`, `"SQL"`, `"AMQP"`
- Use `"strokeStyle": "dashed"` for async message flows

### Layout

- System boundary frame wraps all containers
- Database containers at the bottom of the boundary
- External systems outside the boundary
- Top-to-bottom or left-to-right flow for service interactions

---

## C4 Level 3 — Component Diagram

**Purpose**: Zooms into a single container to show its internal components.

### Shape Conventions

| C4 Concept | Excalidraw Shape | Background | Label Tag |
|------------|-----------------|------------|-----------|
| Component | `rectangle` | `#dbe4ff` | `[Component]` |
| Interface / Port | `rectangle` | `#d3f9d8` | `[Interface]` |
| Container Boundary | `frame` | `transparent` | Named frame |
| External Container | `rectangle` | `#f1f3f5` | `[Container]` |

### Label Convention

```
ComponentName
[Component: Technology]
Responsibility description
```

### Layout

- Container boundary frame wraps all components
- Group related components (use `groupIds`)
- Arrange by layer: controllers → services → repositories → external

---

## General C4 Rules

1. Always include the `[Type]` tag as the second line of every label
2. Use `frame` elements for ALL boundary types (system, container, subsystem)
3. Arrows must have descriptive labels for interactions
4. Number relationships on complex diagrams for reference
5. Limit Context diagrams to 5–10 elements; Container diagrams to 5–15 elements
6. Do not mix C4 levels in a single diagram
