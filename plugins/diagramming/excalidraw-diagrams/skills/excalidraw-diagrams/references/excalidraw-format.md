# Excalidraw JSON Format Reference

**Schema Version**: 2
**Scope**: All element types supported for diagram generation

---

## Document Structure

Every Excalidraw file is a JSON object with this top-level shape:

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [...],
  "appState": {
    "viewBackgroundColor": "#ffffff",
    "gridSize": null,
    "theme": "light"
  },
  "files": {}
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `type` | string | Yes | Always `"excalidraw"` |
| `version` | number | Yes | Always `2` |
| `source` | string | No | Arbitrary identifier |
| `elements` | Element[] | Yes | May be empty `[]` |
| `appState` | object | No | Canvas/render settings |
| `files` | object | No | Embedded image data |

---

## Element Properties (Common to All Types)

Every element shares these fields:

```json
{
  "id": "abc123",
  "type": "rectangle",
  "x": 100,
  "y": 200,
  "width": 160,
  "height": 80,
  "angle": 0,
  "strokeColor": "#1e1e1e",
  "backgroundColor": "transparent",
  "fillStyle": "solid",
  "strokeWidth": 2,
  "strokeStyle": "solid",
  "roughness": 0,
  "opacity": 100,
  "groupIds": [],
  "frameId": null,
  "boundElements": [],
  "link": null,
  "locked": false
}
```

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Unique within the document (use short alphanumeric IDs) |
| `type` | string | Element type — see types below |
| `x`, `y` | number | Position in pixels from canvas origin |
| `width`, `height` | number | Dimensions in pixels |
| `angle` | number | Rotation in radians (0 = no rotation) |
| `strokeColor` | string | Hex colour for border/line |
| `backgroundColor` | string | Hex colour or `"transparent"` |
| `fillStyle` | string | `"solid"`, `"hachure"`, `"cross-hatch"`, `"dots"` |
| `strokeWidth` | number | `1`, `2`, or `4` |
| `strokeStyle` | string | `"solid"`, `"dashed"`, `"dotted"` |
| `roughness` | number | `0` = clean, `1` = low, `2` = high hand-drawn |
| `opacity` | number | `0`–`100` |
| `groupIds` | string[] | Empty array if not grouped |
| `frameId` | string\|null | Parent frame ID or `null` |
| `boundElements` | BoundRef[] | Arrows and text labels bound to this element |
| `link` | string\|null | URL or `null` |
| `locked` | boolean | `false` for generated diagrams |

---

## Element Types

### `rectangle`

Standard rectangle. Most common shape — use for systems, components, containers, processes, swimlane cells.

```json
{
  "type": "rectangle",
  "roundness": null
}
```

Add `"roundness": { "type": 3 }` for rounded corners (e.g. tasks in BPMN, containers in C4).

---

### `diamond`

Diamond shape. Use for decisions in flowcharts, gateways in BPMN.

```json
{
  "type": "diamond",
  "roundness": null
}
```

---

### `ellipse`

Ellipse/circle. Use for events (BPMN start/end), processes in data flow diagrams, terminators.

```json
{
  "type": "ellipse",
  "roundness": { "type": 2 }
}
```

---

### `arrow`

Directed connector with optional arrowheads and bindings. Use for relationships, flows, sequence connections.

```json
{
  "type": "arrow",
  "x": 260,
  "y": 240,
  "width": 100,
  "height": 0,
  "points": [[0, 0], [100, 0]],
  "startBinding": {
    "mode": "orbit",
    "elementId": "source-id",
    "fixedPoint": [0.5001, 0.5001]
  },
  "endBinding": {
    "mode": "orbit",
    "elementId": "target-id",
    "fixedPoint": [0.5001, 0.5001]
  },
  "startArrowhead": null,
  "endArrowhead": "arrow",
  "elbowed": false
}
```

**Arrow binding rules:**

- `mode` — always `"orbit"` (connector finds the shortest path to the shape edge)
- `elementId` — ID of the shape being connected to
- `fixedPoint` — normalised `[x, y]` anchor on the shape (see fixedPoint Coordinate
  System below)
- The source shape's `boundElements` must include `{ "id": "<arrow-id>", "type": "arrow" }`
- The target shape's `boundElements` must include `{ "id": "<arrow-id>", "type": "arrow" }`

**Arrowhead values:** `null` (none), `"arrow"` (filled), `"bar"`, `"dot"`, `"triangle"`

**Points array:** Coordinates are offsets from the arrow's `x`/`y` origin. Always
provide at least 2 points: `[[0, 0], [dx, dy]]`. Use more points for multi-segment
arrows (see below).

**Straight vs elbow arrows:** Arrows should be straight (horizontal or vertical).
Align connected shapes so their centres share the same y-coordinate (for horizontal
arrows) or x-coordinate (for vertical arrows). When shapes cannot be axis-aligned,
use multi-segment arrows with explicit intermediate points (see below).

### fixedPoint Coordinate System

`fixedPoint` uses normalised `[x, y]` where `(0, 0)` is the top-left and `(1, 1)`
is the bottom-right of the shape's bounding box. Values are continuous — any point
along an edge is valid.

**Common anchor points:**

| Target | fixedPoint | Notes |
|--------|-----------|-------|
| Centre (auto) | `[0.5001, 0.5001]` | Default — arrow finds nearest edge |
| Left centre | `[0, 0.5]` | Arrow arrives from the left |
| Right centre | `[1, 0.5]` | Arrow departs to the right |
| Top centre | `[0.5, 0]` | Arrow arrives from above |
| Bottom centre | `[0.5, 1]` | Arrow departs downward |

**Distributing multiple arrows on the same side:**

When several arrows connect to the same side of a shape, space them evenly along
that edge to prevent overlapping:

- 2 arrows on the left side: `[0, 0.33]` and `[0, 0.67]`
- 3 arrows on the left side: `[0, 0.25]`, `[0, 0.5]`, and `[0, 0.75]`
- 2 arrows on the bottom: `[0.33, 1]` and `[0.67, 1]`

The exact positions may need adjusting during visual iteration to achieve a clean
look — these are starting points, not rigid rules.

**Choosing sides and points:**

- Default to the side facing the connected shape (left/right for horizontal arrows,
  top/bottom for vertical)
- When a new arrow would overlap an existing one on the same side, either distribute
  both arrows along that side or route the new arrow to a different side entirely
- For complex diagrams, iterate the `fixedPoint` values after rendering to find the
  cleanest arrangement

### Elbowed (multi-segment) arrows

When shapes are not axis-aligned, use native elbowed arrows with `"elbowed": true`.
You must still provide the calculated intermediate points — the static renderer does
not auto-route, but it does render whatever points you provide.

**Required properties for elbowed arrows:**

```json
"elbowed": true,
"fixedSegments": null,
"startIsSpecial": null,
"endIsSpecial": null
```

**Routing patterns** — provide 4 points in the `points` array:

Right-then-up/down (horizontal first, then vertical):

```
"points": [[0, 0], [bend_x, 0], [bend_x, dy_end], [dx_end, dy_end]]
```

Up/down-then-right (vertical first, then horizontal):

```
"points": [[0, 0], [0, bend_y], [dx_end, bend_y], [dx_end, dy_end]]
```

**Binding gap for elbowed arrows:**

Native elbowed arrows create the binding gap via `fixedPoint` values slightly
outside `[0, 1]`. Use a `~0.03` offset from the edge:

- Start from right edge: `fixedPoint: [1.03, y]` (arrow origin ~6px past edge)
- End at left edge: `fixedPoint: [-0.03, y]` (arrow ends ~6px before edge)
- The arrow's `x`/`y` is the actual start position (no manual 8px offset needed)

For straight arrows, `orbit` mode also handles the visual gap — set the arrow's
`x`/`y` to the shape edge and the renderer creates the spacing automatically.

**Rules:**

- Place bend points in empty space — not on top of other elements or arrow labels
- Choose the route that avoids crossing or overlapping existing arrows
- Set the arrow's `width` to the maximum absolute x-offset and `height` to the
  maximum absolute y-offset across all points

**Arrow label rules (text on an arrow):**

Arrow labels use the same `containerId` binding as shape labels. **The static
renderer does NOT auto-position arrow labels** — you must calculate `x`, `y`,
`width`, and `height` so the label appears at the arrow's midpoint.

1. Create a `text` element with `containerId` = the arrow's `id`
2. Add `{ "id": "<text-id>", "type": "text" }` to the arrow's `boundElements`
3. Set `textAlign = "center"` and `verticalAlign = "middle"`

**Sizing formulas for arrow labels:**

- `text_height` = `num_lines × fontSize × lineHeight` (e.g. 1 × 14 × 1.25 = 17.5)
- `text_width` — estimate from text content: **~8px per character** for fontSize 14
  Nunito, **~9px per character** for fontSize 16. Round up generously to avoid
  clipping — the Excalidraw app measures precisely but we must overestimate.
- `text_x` = arrow midpoint x − text_width / 2
- `text_y` = arrow midpoint y − text_height / 2

Example: "Uses" (4 chars, fontSize 14) on a horizontal arrow from x=260 to x=400, y=240:

- Arrow midpoint: x=330, y=240
- `text_width` = 4 × 8 = 32 → round up to 40
- `text_height` = 1 × 14 × 1.25 = 17.5
- `text_x` = 330 − 40/2 = 310
- `text_y` = 240 − 17.5/2 ≈ 231

```json
{
  "id": "lbl-arr1",
  "type": "text",
  "x": 310, "y": 231, "width": 40, "height": 17.5,
  "text": "Uses",
  "fontSize": 14,
  "fontFamily": 6,
  "textAlign": "center",
  "verticalAlign": "middle",
  "lineHeight": 1.25,
  "containerId": "arr-1",
  "originalText": "Uses",
  "autoResize": true
}
```

Arrow labels can use `\n` for multiline text, just like shape labels. This is
useful for compact labels like `"REST/HTTPS\nJSON"`. Calculate `text_height`
using the number of lines.

**Readability rule:** Labels should not cover arrowheads. For horizontal arrows,
ensure the label doesn't extend to the arrow endpoints — leave at least ~30px
of visible arrow line at each end. For vertical arrows, position the label
beside the arrow (offset `text_x` to the right) rather than centred on it.

The arrow must reference this label in its `boundElements`:

```json
{
  "id": "arr-1",
  "type": "arrow",
  "boundElements": [{ "id": "lbl-arr1", "type": "text" }]
}
```

> **Do not** position arrow label text manually with `containerId: null` — the label
> will not move with the arrow and will render at incorrect positions in PNG output.

---

### `line`

Non-directed line without arrowheads or bindings. Use for decorative separators, boundaries, swim lane dividers.

```json
{
  "type": "line",
  "points": [[0, 0], [200, 0]],
  "startArrowhead": null,
  "endArrowhead": null
}
```

---

### `text`

Text elements can be **standalone** (floating on the canvas) or **bound** (inside a
shape or on an arrow). Bound text is by far the most common — use it for all labels
inside shapes and on arrows.

| Field | Values | Notes |
|-------|--------|-------|
| `fontFamily` | `5` Excalifont, `6` Nunito, `8` Comic Shanns | Use brand defaults |
| `textAlign` | `"left"`, `"center"`, `"right"` | |
| `verticalAlign` | `"top"`, `"middle"`, `"bottom"` | |
| `containerId` | string\|null | ID of parent shape/arrow for bound labels; `null` only for standalone text |
| `lineHeight` | number | Line spacing multiplier; always set to `1.25`. Renderer default (`2.5`) over-spaces labels |

#### Bound text (label inside a shape)

This is the standard pattern for labelling shapes. **The static renderer does NOT
auto-centre text** — you must calculate `x`, `y`, `width`, and `height` so the
text appears centred within the parent shape.

**Positioning formulas:**

```text
text_height = num_lines × fontSize × lineHeight
text_y      = parent_y + (parent_height - text_height) / 2
text_x      = parent_x
text_width  = parent_width
```

Example: "System A" (1 line, fontSize 16) in a 160×80 box at (100, 200):

- `text_height` = 1 × 16 × 1.25 = 20
- `text_y` = 200 + (80 − 20) / 2 = 230
- `text_x` = 100, `text_width` = 160

```json
{
  "type": "text",
  "x": 100, "y": 230, "width": 160, "height": 20,
  "text": "System A",
  "fontSize": 16,
  "fontFamily": 6,
  "textAlign": "center",
  "verticalAlign": "middle",
  "containerId": "box-a",
  "originalText": "System A",
  "autoResize": true,
  "lineHeight": 1.25
}
```

**Rules:**

1. Set `containerId` = parent shape's `id`
2. Add `{ "id": "<text-id>", "type": "text" }` to parent shape's `boundElements`
3. Always set `verticalAlign = "middle"` and `textAlign = "center"` explicitly —
   the renderer does not default these, and omitting them causes top-left alignment
4. **Calculate `x`, `y`, `width`, `height` explicitly** using the formulas above —
   the static PNG renderer uses these values as-is and does not reposition text

#### Multi-line text

For labels with multiple lines (e.g. name + type in C4 boxes), use literal `\n` in
both the `text` and `originalText` fields. Calculate `text_height` using the number
of lines:

Example: "Customer\n[Person]" (2 lines, fontSize 16) in a 160×80 box at (100, 200):

- `text_height` = 2 × 16 × 1.25 = 40
- `text_y` = 200 + (80 − 40) / 2 = 220

```json
{
  "x": 100, "y": 220, "width": 160, "height": 40,
  "text": "Customer\n[Person]",
  "originalText": "Customer\n[Person]",
  "containerId": "user1",
  "lineHeight": 1.25
}
```

#### Standalone text (floating label)

Only use `containerId: null` for text that is genuinely standalone — annotations,
diagram titles, or notes that are not inside any shape or on any arrow.

```json
{
  "type": "text",
  "text": "Diagram Title",
  "containerId": null,
  "originalText": "Diagram Title",
  "lineHeight": 1.25
}
```

> **WARNING — Anti-pattern**: NEVER use `containerId: null` combined with manual
> `x`/`y` positioning and `groupIds` to simulate text inside a shape. Always use
> proper `containerId` binding for text inside shapes and on arrows, combined with
> accurately calculated `x`/`y`/`width`/`height` values.

---

### `frame`

Named container that groups related elements visually. Use for C4 boundaries, VPC/subnet boundaries, BPMN pools.

```json
{
  "type": "frame",
  "name": "E-Commerce System"
}
```

Child elements reference the frame via `"frameId": "<frame-id>"`. Frame itself uses `backgroundColor: "transparent"` and a distinct `strokeColor`.

---

### `freedraw`

Freehand stroke path. Rarely needed in generated diagrams — avoid unless specifically requested.

```json
{
  "type": "freedraw",
  "points": [[0, 0], [5, 3], [10, 0]],
  "simulatePressure": false
}
```

---

### `image`

Embedded image. The image data lives in the document's `files` object.

```json
{
  "type": "image",
  "fileId": "abc123",
  "scale": [1, 1],
  "status": "saved"
}
```

`files` entry: `{ "abc123": { "mimeType": "image/png", "id": "abc123", "dataURL": "data:image/png;base64,...", "created": 0 } }`

---

### `iframe`

Embedded web content preview.

```json
{
  "type": "iframe",
  "link": "https://example.com"
}
```

---

## Grouping

To group elements together (move/select as a unit):

1. Generate a shared group ID string (e.g. `"grp-abc"`)
2. Add it to `groupIds` for each element in the group

```json
{ "groupIds": ["grp-abc"] }
```

Elements can belong to multiple groups (nested grouping).

> **Note:** `groupIds` controls selection and movement grouping only. It does NOT
> affect text positioning or rendering. To place text inside a shape or on an arrow,
> use `containerId` binding — not `groupIds`.

---

## Frames

Frames visually group elements with a named boundary:

1. Create a `frame` element with a `name`
2. Set `frameId` on every child element to the frame's `id`

Children do **not** need to be visually inside the frame rectangle — the `frameId` reference is the logical membership.

---

## Complete Example: Two Boxes with a Labelled Arrow

Text positions are calculated using the formulas from the text section above:

- "System A" (1 line, fontSize 16) in 160×80 box at y=200: `text_y` = 200 + (80 − 20) / 2 = 230
- "System B" same calculation: `text_y` = 230
- "Calls" (5 chars, fontSize 14) on arrow at midpoint (330, 240): `width` = 5 × 8 = 40, `height` = 17.5, `x` = 310, `y` = 231

```json
{
  "type": "excalidraw",
  "version": 2,
  "elements": [
    {
      "id": "box-a",
      "type": "rectangle",
      "x": 100, "y": 200, "width": 160, "height": 80,
      "strokeColor": "#1e1e1e", "backgroundColor": "#dbe4ff",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 0, "opacity": 100, "angle": 0,
      "groupIds": [], "frameId": null,
      "boundElements": [
        { "id": "txt-a", "type": "text" },
        { "id": "arr-1", "type": "arrow" }
      ]
    },
    {
      "id": "txt-a",
      "type": "text",
      "x": 100, "y": 230, "width": 160, "height": 20,
      "text": "System A", "fontSize": 16, "fontFamily": 6,
      "textAlign": "center", "verticalAlign": "middle",
      "containerId": "box-a", "originalText": "System A", "autoResize": true, "lineHeight": 1.25,
      "strokeColor": "#1e1e1e", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 0, "opacity": 100, "angle": 0,
      "groupIds": [], "frameId": null, "boundElements": []
    },
    {
      "id": "box-b",
      "type": "rectangle",
      "x": 400, "y": 200, "width": 160, "height": 80,
      "strokeColor": "#1e1e1e", "backgroundColor": "#d3f9d8",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 0, "opacity": 100, "angle": 0,
      "groupIds": [], "frameId": null,
      "boundElements": [
        { "id": "txt-b", "type": "text" },
        { "id": "arr-1", "type": "arrow" }
      ]
    },
    {
      "id": "txt-b",
      "type": "text",
      "x": 400, "y": 230, "width": 160, "height": 20,
      "text": "System B", "fontSize": 16, "fontFamily": 6,
      "textAlign": "center", "verticalAlign": "middle",
      "containerId": "box-b", "originalText": "System B", "autoResize": true, "lineHeight": 1.25,
      "strokeColor": "#1e1e1e", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 0, "opacity": 100, "angle": 0,
      "groupIds": [], "frameId": null, "boundElements": []
    },
    {
      "id": "arr-1",
      "type": "arrow",
      "x": 260, "y": 240, "width": 140, "height": 0,
      "points": [[0, 0], [140, 0]],
      "startBinding": { "mode": "orbit", "elementId": "box-a", "fixedPoint": [0.5001, 0.5001] },
      "endBinding": { "mode": "orbit", "elementId": "box-b", "fixedPoint": [0.5001, 0.5001] },
      "startArrowhead": null, "endArrowhead": "arrow",
      "elbowed": false,
      "strokeColor": "#1e1e1e", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 0, "opacity": 100, "angle": 0,
      "groupIds": [], "frameId": null,
      "boundElements": [{ "id": "lbl-arr1", "type": "text" }]
    },
    {
      "id": "lbl-arr1",
      "type": "text",
      "x": 310, "y": 231, "width": 40, "height": 17.5,
      "text": "Calls", "fontSize": 14, "fontFamily": 6,
      "textAlign": "center", "verticalAlign": "middle",
      "containerId": "arr-1", "originalText": "Calls", "autoResize": true, "lineHeight": 1.25,
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

## Element Ordering (Z-order)

The renderer draws elements in **array order** — later elements render on top of
earlier ones. There is no separate Z-index property. Follow this ordering:

1. **Frame children before their frame** — required for correct clipping
2. **Shapes before their bound text labels** — so text renders on top of the fill
3. **Arrows after the shapes they connect** — so connector lines render on top

Within a group of same-level elements, order does not matter.

> **Note:** The Excalidraw app uses an `index` field (fractional indexing) for
> collaborative editing. This field is **not required** for generation — array
> position controls rendering order. Other app-managed fields (`version`,
> `versionNonce`, `seed`, `updated`, `isDeleted`) can also be omitted.

---

## Validation Rules

- Every `id` must be unique within the document
- Arrow `startBinding.elementId` / `endBinding.elementId` must reference an existing shape element
- Text with `containerId` must reference an existing shape, and that shape's `boundElements` must back-reference the text
- `frameId` must reference an existing `frame` element
- `points` arrays in arrow and line elements must contain at least 2 entries
- Elements in the same group must share at least one `groupIds` entry
- `elements` may be an empty array `[]` — this is valid and renders a blank canvas
