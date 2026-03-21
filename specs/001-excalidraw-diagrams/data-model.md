# Data Model: Excalidraw Diagram Plugin

**Feature**: 001-excalidraw-diagrams
**Date**: 2026-03-21

## Overview

This plugin does not use a database or persistent storage. The "data model"
describes the Excalidraw JSON structure that Claude generates and the render
script consumes. Understanding these entities is essential for writing accurate
reference material and templates.

## Entities

### ExcalidrawDocument

The top-level JSON structure representing a complete diagram.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | Always `"excalidraw"` |
| version | number | Yes | Schema version (currently `2`) |
| source | string | No | Origin URL or tool identifier |
| elements | Element[] | Yes | Array of all diagram elements |
| appState | AppState | No | Editor/rendering configuration |
| files | Record<string, FileData> | No | Embedded images/files by ID |

### Element (base)

All elements share these common properties.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier (nanoid format) |
| type | string | Yes | Element type discriminator |
| x | number | Yes | Horizontal position (pixels from origin) |
| y | number | Yes | Vertical position (pixels from origin) |
| width | number | Yes | Element width in pixels |
| height | number | Yes | Element height in pixels |
| angle | number | No | Rotation in radians (default: 0) |
| strokeColor | string | Yes | Border/line colour (hex, e.g. `"#1e1e1e"`) |
| backgroundColor | string | Yes | Fill colour (hex or `"transparent"`) |
| fillStyle | string | Yes | `"solid"`, `"hachure"`, `"cross-hatch"`, `"dots"` |
| strokeWidth | number | Yes | Line thickness (1, 2, or 4) |
| strokeStyle | string | Yes | `"solid"`, `"dashed"`, `"dotted"` |
| roughness | number | Yes | Hand-drawn effect: 0 (none), 1 (low), 2 (high) |
| opacity | number | Yes | 0–100 |
| groupIds | string[] | Yes | Group membership (empty array if ungrouped) |
| frameId | string | No | Parent frame element ID |
| boundElements | BoundRef[] | No | Elements bound to this one (arrows, labels) |
| link | string | No | URL link |
| locked | boolean | No | Whether element is locked |

### Element Types

#### Shape Elements (rectangle, diamond, ellipse)

Inherit all base properties. Can contain bound text labels.

| Field | Type | Description |
|-------|------|-------------|
| roundness | object | `{ type: 3 }` for rounded corners (rectangle only) |

#### Text Element

| Field | Type | Description |
|-------|------|-------------|
| text | string | Display text content |
| fontSize | number | Font size in pixels (default: 20) |
| fontFamily | number | 1 = Virgil (deprecated), 2 = Helvetica, 3 = Cascadia (hidden), 5 = Excalifont, 6 = Nunito, 7 = Lilita One, 8 = Comic Shanns |
| textAlign | string | `"left"`, `"center"`, `"right"` |
| verticalAlign | string | `"top"`, `"middle"`, `"bottom"` |
| containerId | string | ID of parent shape (for bound labels) |
| originalText | string | Same as text (for bound text tracking) |
| autoResize | boolean | Whether text auto-resizes its container |

#### Arrow Element

| Field | Type | Description |
|-------|------|-------------|
| points | number[][] | Array of [x, y] offset points from element origin |
| startBinding | Binding | Connection to source element |
| endBinding | Binding | Connection to target element |
| startArrowhead | string | `null`, `"arrow"`, `"bar"`, `"dot"`, `"triangle"` |
| endArrowhead | string | `null`, `"arrow"`, `"bar"`, `"dot"`, `"triangle"` |
| elbowed | boolean | Whether arrow uses right-angle routing |

#### Line Element

Same as Arrow but without bindings or arrowheads. Used for decorative lines
and boundaries.

#### Freedraw Element

| Field | Type | Description |
|-------|------|-------------|
| points | number[][] | Array of [x, y] offset points from element origin |
| simulatePressure | boolean | Whether to simulate pen pressure for stroke width variation |

Freehand drawing element. Uses points array like Arrow/Line but rendered as
a continuous stroke path.

#### Image Element

| Field | Type | Description |
|-------|------|-------------|
| fileId | string | Reference to entry in document's `files` record |
| scale | number[] | [scaleX, scaleY] scaling factors |
| status | string | `"pending"`, `"saved"`, `"error"` |

Embedded image element. The actual image data is stored in the document's
`files` property, keyed by `fileId`.

#### Iframe Element

| Field | Type | Description |
|-------|------|-------------|
| link | string | URL of the embedded content |

Embedded web content element. Renders a preview in the editor.

#### Frame Element

| Field | Type | Description |
|-------|------|-------------|
| name | string | Frame label displayed at top |

Child elements reference the frame via their `frameId` property.

### Binding

Describes how an arrow connects to a shape element.

| Field | Type | Description |
|-------|------|-------------|
| elementId | string | ID of the target shape |
| focus | number | Position along the shape edge (-1 to 1) |
| gap | number | Distance from shape border in pixels |
| fixedPoint | number[] | Optional [x, y] normalized anchor point |

### BoundRef

Reference from a shape to its bound elements.

| Field | Type | Description |
|-------|------|-------------|
| id | string | ID of the bound element |
| type | string | `"arrow"` or `"text"` |

### AppState (subset relevant for generation)

| Field | Type | Description |
|-------|------|-------------|
| viewBackgroundColor | string | Canvas background colour |
| gridSize | number | Grid spacing (null for no grid) |
| theme | string | `"light"` or `"dark"` |

## Relationships

```text
ExcalidrawDocument 1──* Element
Element (shape) 1──* BoundRef ──1 Element (arrow or text)
Element (arrow) *──1 Binding ──1 Element (shape)
Element (text)  *──1 containerId ──1 Element (shape)
Element (any)   *──? frameId ──1 Element (frame)
Element (any)   *──* groupIds (shared group membership)
```

## Validation Rules

- Every `id` must be unique within the document
- Arrow `startBinding.elementId` and `endBinding.elementId` must reference
  existing shape elements
- Text with `containerId` must reference an existing shape element
- That shape's `boundElements` must include a back-reference to the text
- `frameId` must reference an existing frame element
- `points` in arrows/lines must have at least 2 entries
- `groupIds` arrays for grouped elements must share at least one common ID
