# Styling Defaults: Excalidraw Diagram Brand

**Purpose**: Apply these defaults to ALL generated diagrams for a consistent, professional appearance.
**Rule**: Use these values unless the user explicitly requests a different style. When overriding, keep all other defaults intact.

---

## Visual Language Principles

These principles apply to ALL diagrams regardless of type or template. Individual
templates may override or extend these with diagram-type-specific conventions.

### Consistency

- Use the **same shape type** for elements of the same kind throughout a diagram
- Stick to the **colour palette** defined below — do not introduce ad-hoc colours
- Use **one font family** per diagram (default: Nunito) unless a specific context
  demands a second (e.g. monospace for code annotations)
- Keep stroke widths and styles uniform for elements at the same level of hierarchy

### Flow and Layout

- Establish a **clear directional flow**: left-to-right or top-to-bottom
- **Align elements** on a consistent grid — shapes at the same level share the same
  x-coordinate (vertical layout) or y-coordinate (horizontal layout)
- Use **generous whitespace** between elements — crowded diagrams are hard to read
- **Minimise crossing and overlapping lines** — rearrange elements to reduce
  arrow intersections. When arrows must share a target shape, bind them to
  different sides or different points on the same side using `fixedPoint`
  (see `excalidraw-format.md`). Route multi-segment arrows through empty
  space — never along the same path as an existing arrow
- Use **straight or single-elbow arrows** — avoid diagonal arrows; restructure the
  layout so connectors run horizontally or vertically
- To achieve straight horizontal arrows, align connected shapes on the **same
  y-coordinate** (matching vertical centres). For straight vertical arrows, align
  on the **same x-coordinate**. When shapes cannot share an axis (e.g. different
  rows and columns), use multi-segment arrows with explicit intermediate points
  (see `excalidraw-format.md`)
- For large diagrams, group related elements into **distinct spatial regions**

### Labels

- Use **concise language** — remove articles ("a", "the"), use verb phrases for
  arrows ("sends order", "validates"), noun phrases for shapes ("Order Service")
- Size text boxes to fit their content — avoid oversized empty shapes
- Every shape and every arrow carrying meaning should have a label
- **Arrow labels must not obscure the arrow** — the arrowhead and at least ~30px
  of arrow line at each end should remain visible
- **Use multiline labels** to reduce label width when the label would cover most
  of the arrow — split into 2 lines with `\n` (e.g. `"Browses &\npurchases"`
  instead of `"Browses & purchases"`)
- If a label still covers too much of the arrow, increase spacing between the
  connected elements

### Structure

- Provide **clear entry points** — the reader should immediately identify where the
  flow starts (top-left element, or a visually distinct start node)
- Place **important elements** at the top or centre of the diagram; supporting
  elements toward the edges
- For diagrams exceeding ~12 elements, consider splitting into multiple diagrams or
  using frames to modularise

---

## Colour Palette

Use these colours by role. Do not use arbitrary hex values outside this palette.

| Role | Hex | Use For |
|------|-----|---------|
| `stroke` | `#1e1e1e` | Borders, arrows, text — primary dark |
| `text` | `#1e1e1e` | All text elements |
| `background-blue` | `#dbe4ff` | Primary system/component fill |
| `background-green` | `#d3f9d8` | Secondary system / external entity fill |
| `background-yellow` | `#fff3bf` | Highlight / warning / annotation fill |
| `background-red` | `#ffe3e3` | Error state / critical path fill |
| `background-grey` | `#f1f3f5` | Neutral / infrastructure fill |
| `canvas` | `#ffffff` | Canvas background (`appState.viewBackgroundColor`) |
| `transparent` | `"transparent"` | Frames, arrows, text containers |

### Colour Assignment by Diagram Layer

- **External systems / actors**: `background-green` (`#d3f9d8`)
- **Internal systems / components**: `background-blue` (`#dbe4ff`)
- **Infrastructure / supporting services**: `background-grey` (`#f1f3f5`)
- **Data stores**: `background-yellow` (`#fff3bf`)
- **Decision / gateway elements**: `background-yellow` (`#fff3bf`)
- **Frames / boundaries**: `transparent` fill, `stroke` border at reduced opacity
- **Arrows / connectors**: `transparent` fill, `stroke` colour

---

## Font Families

Use modern Excalidraw font families (do not use legacy fonts 1/2/3).

| ID | Family | Use For |
|----|--------|---------|
| `6` | Nunito | **Default for all labels** — clean, readable body text |
| `5` | Excalifont | Informal / hand-drawn aesthetic when requested |
| `8` | Comic Shanns | Code annotations, technical labels, monospace content |

**Default font**: `6` (Nunito) for all text unless a specific context calls for another.

```json
"fontFamily": 6
```

---

## Font Sizes

| Context | Size |
|---------|------|
| Element label (inside shape) | `16` |
| Sub-label / technology annotation | `14` |
| Frame / boundary label | `18` |
| Standalone heading text | `20` |
| Arrow label | `14` |

```json
"fontSize": 16
```

---

## Stroke Settings

| Property | Default Value | Notes |
|----------|--------------|-------|
| `strokeWidth` | `2` | Medium weight — readable at any scale |
| `strokeStyle` | `"solid"` | Use `"dashed"` for optional/async flows |
| `roughness` | `0` | Clean, polished lines (not hand-drawn) |
| `opacity` | `100` | Full opacity for all elements |

```json
"strokeWidth": 2,
"strokeStyle": "solid",
"roughness": 0,
"opacity": 100
```

---

## Fill Style

| Context | fillStyle |
|---------|-----------|
| Shapes with background colour | `"solid"` |
| Shapes where hachure is desired | `"hachure"` |
| Transparent / outline only | `"solid"` (with `backgroundColor: "transparent"`) |

Default: `"solid"` for all coloured shapes.

```json
"fillStyle": "solid"
```

---

## Arrow Defaults

```json
{
  "startArrowhead": null,
  "endArrowhead": "arrow",
  "elbowed": false,
  "strokeColor": "#1e1e1e",
  "backgroundColor": "transparent",
  "fillStyle": "solid",
  "strokeWidth": 2,
  "strokeStyle": "solid",
  "roughness": 0,
  "opacity": 100
}
```

- Use `"endArrowhead": "arrow"` for directed relationships
- Use `"startArrowhead": "arrow"` + `"endArrowhead": "arrow"` for bidirectional
- Use `null` on both ends for undirected lines (prefer `line` type instead)
- Use `"strokeStyle": "dashed"` for async, optional, or future flows

---

## Text Alignment Defaults

```json
"textAlign": "center",
"verticalAlign": "middle"
```

For bound labels (text inside shapes and on arrows): always set both `textAlign` and
`verticalAlign` explicitly — the renderer does not default these.

**Important:** The static PNG renderer (`@excalidraw/utils`) does **not** auto-centre
or reposition text. The `x`, `y`, `width`, and `height` values on text elements are
used as-is. You must calculate these at generation time using the positioning formulas
in `references/excalidraw-format.md`. Setting `textAlign` and `verticalAlign` controls
alignment within the text element's bounding box, but the bounding box itself must be
positioned correctly.

For standalone text: `"left"` alignment is acceptable.

---

## Text Element Defaults

All `text` elements (bound and standalone) must include `lineHeight`. The renderer
defaults to `2.5` when the field is absent, which over-spaces multi-line labels.

```json
"lineHeight": 1.25
```

| Property | Default | Notes |
|----------|---------|-------|
| `lineHeight` | `1.25` | Line spacing multiplier. Always set explicitly to avoid the renderer's `2.5` default. |

---

## appState Defaults

```json
"appState": {
  "viewBackgroundColor": "#ffffff",
  "gridSize": null,
  "theme": "light"
}
```

---

## Complete Element Default Template

Use this as the baseline for any new element, then override only what differs:

```json
{
  "id": "<unique-id>",
  "type": "<element-type>",
  "x": 0,
  "y": 0,
  "width": 160,
  "height": 80,
  "angle": 0,
  "strokeColor": "#1e1e1e",
  "backgroundColor": "#dbe4ff",
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

## Complete Text Element Default Template

Use this as the baseline for any new text element:

```json
{
  "id": "<unique-id>",
  "type": "text",
  "x": 0,
  "y": 0,
  "width": 160,
  "height": 40,
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
  "locked": false,
  "text": "",
  "originalText": "",
  "fontSize": 16,
  "fontFamily": 6,
  "textAlign": "center",
  "verticalAlign": "middle",
  "lineHeight": 1.25,
  "containerId": null,
  "autoResize": true
}
```

---

## Layout Spacing Guidelines

- **Minimum gap between elements**: `40px`
- **Arrow gap from shape border**: `8px` (implicit in `orbit` mode bindings)
- **Standard shape size**: `160 × 80` for boxes, `80 × 80` for circles/diamonds
- **Frame padding**: `40px` inside frame boundary around child elements
- **Horizontal spacing (left-to-right layouts)**: `160px` minimum between shape
  edges for unlabelled arrows. For labelled arrows, use `label_width + 160px`
  — this leaves ~80px of visible arrow line on each side of the label. Most
  two-line labels are ~80px wide, so `240px` is a good default when arrows
  carry labels
- **Vertical spacing (top-to-bottom layouts)**: `120px` minimum between shape edges.
  Increase for labelled vertical arrows where the label sits beside the arrow
- **Centre-line alignment**: When two shapes are connected by a horizontal arrow,
  set them to the same `y` value (or offset so their vertical centres match). When
  connected by a vertical arrow, use the same `x` value. This eliminates diagonal arrows
- **Canvas origin**: Start first element at `x: 100, y: 100` to avoid clipping
- **Balanced spacing**: distribute spacing evenly across the diagram — avoid very
  short gaps on one side and very long gaps on the other. Aim for roughly equal
  arrow lengths between shapes at the same depth level

---

## Visual Iteration

After generating a diagram, render it to PNG and review the output. Check for:

1. Arrow labels covering arrowheads or arrow origins
2. Unbalanced spacing (some gaps much larger/smaller than others)
3. Text clipped or overflowing shape boundaries
4. Overlapping elements

If any issues are found, adjust the layout (spacing, label line breaks, element
positions) and re-render. Repeat until the diagram looks clean and balanced. It
is normal to need 2–3 iterations.

---

## Style Override Rules

1. Apply all defaults above as a baseline
2. If the user requests a specific colour → apply only that override, keep all others
3. If the user requests a different font → override `fontFamily` only
4. Never introduce colours outside the palette unless explicitly requested
5. Never change `roughness` from `0` unless hand-drawn aesthetic is requested
