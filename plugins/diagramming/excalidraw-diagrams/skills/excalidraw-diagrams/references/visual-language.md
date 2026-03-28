# Visual Language: Diagram Design Principles

**Purpose**: These principles apply to ALL diagrams regardless of type, template,
or brand. They define how diagrams are structured, laid out, and labelled for
clarity and professionalism.

---

## Consistency

- Use the **same shape type** for elements of the same kind throughout a diagram
- Stick to the **colour palette** defined in `brand.md` — do not introduce ad-hoc colours
- Use **one font family** per diagram unless a specific context demands a second
  (e.g. monospace for code annotations)
- Keep stroke widths and styles uniform for elements at the same level of hierarchy

## Flow and Layout

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

## Labels

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

## Structure

- Provide **clear entry points** — the reader should immediately identify where the
  flow starts (top-left element, or a visually distinct start node)
- Place **important elements** at the top or centre of the diagram; supporting
  elements toward the edges
- For diagrams exceeding ~12 elements, consider splitting into multiple diagrams or
  using frames to modularise

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

## Text Alignment

For bound labels (text inside shapes and on arrows): always set both `textAlign` and
`verticalAlign` explicitly — the renderer does not default these.

**Important:** The static PNG renderer (`@excalidraw/utils`) does **not** auto-centre
or reposition text. The `x`, `y`, `width`, and `height` values on text elements are
used as-is. You must calculate these at generation time using the positioning formulas
in `excalidraw-format.md`. Setting `textAlign` and `verticalAlign` controls
alignment within the text element's bounding box, but the bounding box itself must be
positioned correctly.

All `text` elements (bound and standalone) must include `lineHeight: 1.25`. The
renderer defaults to `2.5` when the field is absent, which over-spaces multi-line labels.

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

1. Apply all brand defaults as a baseline
2. If the user requests a specific colour → apply only that override, keep all others
3. If the user requests a different font → override `fontFamily` only
4. Never introduce colours outside the palette unless explicitly requested
5. Never change `roughness` from `0` unless hand-drawn aesthetic is requested
