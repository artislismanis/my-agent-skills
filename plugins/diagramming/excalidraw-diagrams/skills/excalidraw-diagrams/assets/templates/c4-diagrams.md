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

| C4 Concept | Excalidraw Shape | Style Tier | Notes |
|------------|-----------------|------------|-------|
| Person / User | `rectangle` with rounded corners | Standard | Primary actor |
| System (in scope) | `rectangle` | Standard | Primary subject |
| External System | `rectangle` | Standard Light | Clearly outside scope |
| System Boundary | `frame` | Frame defaults | Named boundary around in-scope system |

```json
{ "type": "rectangle", "width": 160, "height": 80,
  "roundness": { "type": 3 } }
```

### Label Convention

Each shape has **two text lines** using bound text element:
- **Line 1**: Name — `fontSize: 16`
- **Line 2**: `[Person]` or `[Software System]` tag — `fontSize: 14` (use `fontSize` override on this line only via multiline)

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

---

## C4 Level 2 — Container Diagram

**Purpose**: Zooms into the in-scope system to show containers (applications,
databases, services) and their interactions.

### Shape Conventions

| C4 Concept | Excalidraw Shape | Style Tier | Label Tag |
|------------|-----------------|------------|-----------|
| Web Application | `rectangle` | Standard | `[Web Application]` |
| API / Backend | `rectangle` | Standard | `[REST API]` or `[gRPC Service]` |
| Database | `rectangle` | Standard | `[PostgreSQL Database]` or `[Redis Cache]` |
| Message Queue | `rectangle` | Standard | `[RabbitMQ Queue]` |
| Mobile App | `rectangle` rounded | Standard | `[Mobile App]` |
| External System | `rectangle` | Standard Light | `[Software System]` |
| System Boundary | `frame` | Frame defaults | Named frame for the system |

```json
{ "type": "rectangle", "width": 200, "height": 100 }
```

### Label Convention

Three-line label for containers:

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

| C4 Concept | Excalidraw Shape | Style Tier | Label Tag |
|------------|-----------------|------------|-----------|
| Component | `rectangle` | Standard | `[Component]` |
| Interface / Port | `rectangle` | Standard Light | `[Interface]` |
| Container Boundary | `frame` | Frame defaults | Named frame |
| External Container | `rectangle` | Standard Lighter | `[Container]` |

```json
{ "type": "rectangle", "width": 160, "height": 80 }
```

### Label Convention

```json
"text": "OrderController\n[Component: Spring Bean]\nHandles order requests"
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
