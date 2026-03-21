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
    "elementId": "source-id",
    "focus": 0,
    "gap": 8,
    "fixedPoint": null
  },
  "endBinding": {
    "elementId": "target-id",
    "focus": 0,
    "gap": 8,
    "fixedPoint": null
  },
  "startArrowhead": null,
  "endArrowhead": "arrow",
  "elbowed": false
}
```

**Arrow binding rules:**
- `elementId` — ID of the shape being connected to
- `focus` — position along the shape's edge: `-1` (left/top), `0` (centre), `1` (right/bottom)
- `gap` — pixel distance from the shape border (typically `8`)
- `fixedPoint` — normalized `[x, y]` anchor (`null` for auto)
- The source shape's `boundElements` must include `{ "id": "<arrow-id>", "type": "arrow" }`
- The target shape's `boundElements` must include `{ "id": "<arrow-id>", "type": "arrow" }`

**Arrowhead values:** `null` (none), `"arrow"` (filled), `"bar"`, `"dot"`, `"triangle"`

**Points array:** Coordinates are offsets from the arrow's `x`/`y` origin. Always provide at least 2 points: `[[0, 0], [dx, dy]]`.

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

Standalone text or bound label inside a shape.

```json
{
  "type": "text",
  "text": "My Label",
  "fontSize": 16,
  "fontFamily": 6,
  "textAlign": "center",
  "verticalAlign": "middle",
  "containerId": null,
  "originalText": "My Label",
  "autoResize": true
}
```

| Field | Values | Notes |
|-------|--------|-------|
| `fontFamily` | `5` Excalifont, `6` Nunito, `8` Comic Shanns | Use brand defaults |
| `textAlign` | `"left"`, `"center"`, `"right"` | |
| `verticalAlign` | `"top"`, `"middle"`, `"bottom"` | |
| `containerId` | string\|null | ID of parent shape for bound labels |

**Bound label rules (text inside a shape):**
1. Set `text.containerId` = parent shape's `id`
2. Add `{ "id": "<text-id>", "type": "text" }` to parent shape's `boundElements`
3. Set `text.verticalAlign = "middle"` and `textAlign = "center"` for centred labels

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

---

## Frames

Frames visually group elements with a named boundary:
1. Create a `frame` element with a `name`
2. Set `frameId` on every child element to the frame's `id`

Children do **not** need to be visually inside the frame rectangle — the `frameId` reference is the logical membership.

---

## Complete Example: Two Boxes with a Labelled Arrow

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
      "x": 100, "y": 220, "width": 160, "height": 40,
      "text": "System A", "fontSize": 16, "fontFamily": 6,
      "textAlign": "center", "verticalAlign": "middle",
      "containerId": "box-a", "originalText": "System A", "autoResize": true,
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
      "x": 400, "y": 220, "width": 160, "height": 40,
      "text": "System B", "fontSize": 16, "fontFamily": 6,
      "textAlign": "center", "verticalAlign": "middle",
      "containerId": "box-b", "originalText": "System B", "autoResize": true,
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
      "startBinding": { "elementId": "box-a", "focus": 0, "gap": 8, "fixedPoint": null },
      "endBinding": { "elementId": "box-b", "focus": 0, "gap": 8, "fixedPoint": null },
      "startArrowhead": null, "endArrowhead": "arrow",
      "elbowed": false,
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

## Validation Rules

- Every `id` must be unique within the document
- Arrow `startBinding.elementId` / `endBinding.elementId` must reference an existing shape element
- Text with `containerId` must reference an existing shape, and that shape's `boundElements` must back-reference the text
- `frameId` must reference an existing `frame` element
- `points` arrays in arrow and line elements must contain at least 2 entries
- Elements in the same group must share at least one `groupIds` entry
- `elements` may be an empty array `[]` — this is valid and renders a blank canvas
