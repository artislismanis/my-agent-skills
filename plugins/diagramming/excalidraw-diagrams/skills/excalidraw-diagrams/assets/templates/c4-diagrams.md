# Template: C4 Diagrams

**Standard**: C4 Model (Simon Brown) — https://c4model.com
**Supported levels**: Context, Container, Component

C4 diagrams use their own colour palette (defined below) instead of the Standard/
Standard Light/Lighter tiers from `references/styling-defaults.md`. All other
defaults (fonts, stroke widths, roughness, arrow styles, layout spacing) still apply.

---

## C4 Colour Palette

Use these colours for ALL C4 diagram elements across ALL levels (Context,
Container, Component). They override the brand style tiers. The semantic
role of an element — not the diagram level — determines its colour.

| C4 Role | backgroundColor | strokeStyle | strokeColor | Text strokeColor |
|---------|----------------|-------------|-------------|-----------------|
| Person / Actor | `#bbd1f7` (blue pastel) | `solid` | `#01190e` | `#01190e` |
| System / Container / Component (in scope) | `#c8e1be` (green pastel) | `solid` | `#01190e` | `#01190e` |
| External System / External Container | `#e9e9e9` (grey pastel) | `dashed` | `#01190e` | `#01190e` |
| Database / Data Store | `#fdf8b6` (yellow pastel) | `solid` | `#01190e` | `#01190e` |

All shapes: `fillStyle: "solid"`, `strokeWidth: 2`, `roughness: 1`.
The `dashed` stroke on external elements signals they are outside scope.
All text uses `strokeColor: "#01190e"`. Arrows also use `strokeColor: "#01190e"`.

> **Consistency rule**: The same element colour must be used at every diagram
> level. A PostgreSQL database is always `#fdf8b6`, whether drawn in a Context,
> Container, or Component diagram. An external payment gateway is always
> `#e9e9e9` with a dashed stroke.

---

## C4 Level 1 — System Context Diagram

**Purpose**: Shows the system in context with its users and external dependencies.
High-level, suitable for non-technical stakeholders.

### Shape Conventions

Use the **C4 Colour Palette** table above for all colours.

| C4 Concept | Excalidraw Shape | C4 Colour Role | Notes |
|------------|-----------------|----------------|-------|
| Person / User | `rectangle` with `roundness: {type: 3}` | Person / Actor | Primary actor |
| System (in scope) | `rectangle` | System (in scope) | Primary subject |
| External System | `rectangle` | External System | Dashed stroke, clearly outside scope |
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

Use the **C4 Colour Palette** table above for all colours.

| C4 Concept | Excalidraw Shape | C4 Colour Role | Label Tag |
|------------|-----------------|----------------|-----------|
| Web Application / API / Backend | `rectangle` | System (in scope) | `[Web Application]`, `[REST API]` |
| Mobile App | `rectangle` with `roundness: {type: 3}` | System (in scope) | `[Mobile App]` |
| Database / Cache | `rectangle` | Database / Data Store | `[PostgreSQL Database]`, `[Redis Cache]` |
| Message Queue | `rectangle` | Database / Data Store | `[RabbitMQ Queue]` |
| External System | `rectangle` | External System | `[Software System]` — dashed stroke |
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

Use the **C4 Colour Palette** table above for all colours.

| C4 Concept | Excalidraw Shape | C4 Colour Role | Label Tag |
|------------|-----------------|----------------|-----------|
| Component | `rectangle` | System (in scope) | `[Component]` |
| Interface / Port | `rectangle` | Person / Actor | `[Interface]` |
| Container Boundary | `frame` | Frame defaults | Named frame |
| External Container | `rectangle` | External System | `[Container]` — dashed stroke |

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

## Diagram Title

Every C4 diagram **must** include a two-line title block at the top-left of the
canvas, above the diagram content:

- **Title** (line 1): `[Diagram Type] System Name` — the diagram type in square
  brackets followed by the system or scope name
- **Subtitle** (line 2): a short plain-English description of what the diagram shows

**Title format examples:**

| Diagram type | Title | Subtitle |
|---|---|---|
| System Context | `[System Context] Blog Platform` | `Shows how the Blog Platform interacts with bloggers, readers, and external services` |
| Container | `[Container] Online Bookstore` | `Internal containers of the Online Bookstore and their interactions` |
| Component | `[Component] Order Service` | `Internal components of the Order Service container` |

Use the title and subtitle text styles from `references/styling-defaults.md`:

- Title: `fontSize: 36`, `fontFamily: 5`, `textAlign: "left"`, `verticalAlign: "top"`, `containerId: null`
- Subtitle: `fontSize: 20`, `fontFamily: 5`, `textAlign: "left"`, `verticalAlign: "top"`, `containerId: null`

**Title x-alignment**: Set `x` to the leftmost `x` coordinate of any element on the
canvas. This aligns the title with the actual left edge of the diagram — whether that
is a person/system node, a frame, or a boundary shape. Do not use a hardcoded `x: 100`
if any element starts further left. For example, if a Person shape is at `x: 60`,
set `title_x = 60`.

Position the title at `x: <frame_x>, y: 40`. Place the subtitle immediately below:
`subtitle_y = 40 + title_height + 4` where `title_height = 1 × 36 × 1.25 = 45`
(lineHeight is always 1.25). So `subtitle_y = 89`. Diagram content starts at
`y: 180` or lower.

Set `width` generously using the Excalifont character width table in
`references/excalidraw-format.md` — for standalone text, an undersized width
causes truncation in the Excalidraw UI even when the static renderer looks correct:

- Title: `max_line_length × 22px/char` + 40px buffer (fontSize 36)
- Subtitle: `max_line_length × 10px/char` + 20px buffer (fontSize 20)

```json
{
  "id": "title",
  "type": "text",
  "x": 100, "y": 40,
  "width": 700, "height": 45,
  "text": "[System Context] Blog Platform",
  "originalText": "[System Context] Blog Platform",
  "fontSize": 36, "fontFamily": 5,
  "textAlign": "left", "verticalAlign": "top",
  "containerId": null, "autoResize": true, "lineHeight": 1.25,
  "strokeColor": "#01190e", "backgroundColor": "transparent",
  "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
  "roughness": 1, "opacity": 100,
  "angle": 0, "groupIds": [], "frameId": null, "boundElements": [],
  "link": null, "locked": false
},
{
  "id": "subtitle",
  "type": "text",
  "x": 100, "y": 89,
  "width": 840, "height": 25,
  "text": "Shows how the Blog Platform interacts with bloggers, readers, and external services",
  "originalText": "Shows how the Blog Platform interacts with bloggers, readers, and external services",
  "fontSize": 20, "fontFamily": 5,
  "textAlign": "left", "verticalAlign": "top",
  "containerId": null, "autoResize": true, "lineHeight": 1.25,
  "strokeColor": "#01190e", "backgroundColor": "transparent",
  "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
  "roughness": 1, "opacity": 100,
  "angle": 0, "groupIds": [], "frameId": null, "boundElements": [],
  "link": null, "locked": false
}
```

---

## General C4 Rules

1. Always include a diagram title following the pattern above
2. Always include the `[Type]` tag as the second line of every label
3. Use `frame` elements for ALL boundary types (system, container, subsystem)
4. Arrows must have descriptive labels for interactions
5. Number relationships on complex diagrams for reference
6. Limit Context diagrams to 5–10 elements; Container diagrams to 5–15 elements
7. Do not mix C4 levels in a single diagram
