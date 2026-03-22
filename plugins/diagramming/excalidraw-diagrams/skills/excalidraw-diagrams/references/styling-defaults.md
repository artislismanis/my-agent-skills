# Styling Defaults: Excalidraw Diagram Brand

**Purpose**: Apply these defaults to ALL generated diagrams for a consistent, professional appearance.
**Rule**: Use these values unless the user explicitly requests a different style, or a template defines its own overrides. When overriding, keep all other defaults intact.

---

## Visual Language Principles

These principles apply to ALL diagrams regardless of type or template. Individual
templates may override or extend these with diagram-type-specific conventions.

### Consistency

- Use the **same shape type** for elements of the same kind throughout a diagram
- Use the **same style tier** (Standard, Standard Light, etc.) for elements of the same semantic role
- Use **one font family** per diagram (Excalifont) for all labels
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

## Text Styling

All text uses a consistent style. Only `fontSize` changes by context.

| Context | fontSize | fontFamily | strokeColor | textAlign | verticalAlign |
|---------|----------|------------|-------------|-----------|---------------|
| Main title (standalone) | `36` | `5` (Excalifont) | `#01190e` | `"left"` | `"top"` |
| Subtitle (standalone) | `20` | `5` | `#01190e` | `"left"` | `"top"` |
| General text / labels | `16` | `5` | `#01190e` | `"left"` | `"top"` |

**Labels inside shapes and on arrows** always use:

```json
"textAlign": "center",
"verticalAlign": "middle",
"fontSize": 16,
"fontFamily": 5,
"strokeColor": "#01190e",
"lineHeight": 1.25
```

Note: `lineHeight: 1.25` must always be set explicitly — the renderer defaults to
`2.5` when absent, which over-spaces multi-line labels.

---

## Shape Styles

Use these five named styles. Most diagram content uses the three Standard tiers.
Highlight styles are used sparingly to draw attention to key elements.

| Style | backgroundColor | fillStyle | strokeStyle | strokeColor | roughness |
|-------|----------------|-----------|-------------|-------------|-----------|
| **Standard** | `#d9fce3` | `"solid"` | `"solid"` | `#01190e` | `1` |
| **Standard Light** | `#d9fce3` | `"cross-hatch"` | `"dashed"` | `#01190e` | `1` |
| **Standard Lighter** | `#d9fce3` | `"hachure"` | `"dotted"` | `#01190e` | `1` |
| **Occasional Highlight** | `#01190e` | `"solid"` | `"solid"` | `#01190e` | `1` |
| **Rare Highlight** | `#ff5033` | `"solid"` | `"solid"` | `#01190e` | `1` |

All shapes use: `strokeWidth: 2`, `opacity: 100`.

**Text color inside shapes** (bound text `strokeColor`):

| Shape style | Text strokeColor |
|-------------|-----------------|
| Standard / Standard Light / Standard Lighter | `#01190e` |
| Occasional Highlight | `#d9fce3` (inverted — light on dark) |
| Rare Highlight | `#f5fff7` (light on red) |

### Usage guidance

- **Standard** — primary, foreground elements (most diagram nodes)
- **Standard Light** — secondary elements, less prominent paths
- **Standard Lighter** — tertiary elements, background context, optional/future items
- **Occasional Highlight** — key focal points; use for at most 1-2 elements per diagram
- **Rare Highlight** — errors, critical warnings, blockers; use only when essential

### Deprecated or future items

Apply any style above but set `opacity: 50` to visually de-emphasise the element.

---

## Arrow Defaults

Arrows inherit from the shape styling aesthetic:

```json
{
  "strokeColor": "#01190e",
  "backgroundColor": "transparent",
  "fillStyle": "solid",
  "strokeWidth": 2,
  "strokeStyle": "solid",
  "roughness": 1,
  "opacity": 100,
  "startArrowhead": null,
  "endArrowhead": "arrow",
  "elbowed": false
}
```

- Use `"endArrowhead": "arrow"` for directed relationships
- Use `"startArrowhead": "arrow"` + `"endArrowhead": "arrow"` for bidirectional
- Use `null` on both ends for undirected lines (prefer `line` type instead)
- Use `"strokeStyle": "dashed"` for async, optional, or future flows (matches Standard Light)
- Use `"strokeStyle": "dotted"` for weaker associations (matches Standard Lighter)

Arrow labels use the same font as shape labels: `fontFamily: 5`, `fontSize: 16` (or 14 for sub-labels).

---

## Frame Styling

Frames use Excalidraw's built-in defaults — visual style is not configurable.
Set only `name` (the boundary label) and size/position. Child elements reference
the frame via `frameId`.

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
- **Balanced spacing**: Distribute spacing evenly across the diagram — avoid very
  short gaps on one side and very long gaps on the other. Aim for roughly equal
  arrow lengths between shapes at the same depth level

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
2. Templates may define their own role-to-style mappings — these take precedence over the general defaults
3. If the user requests a specific style override → apply only that override, keep all others
4. Never introduce colours outside the palette unless explicitly requested
5. Never change `roughness` from `1` unless a different aesthetic is specifically requested
