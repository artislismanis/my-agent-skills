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
- Use **generous whitespace** between elements — crowded diagrams are hard to read
- For large diagrams, group related elements into **distinct spatial regions**

#### Axis alignment

- **Align connected shapes on the same axis** — shapes connected by a direct
  arrow should share the same centre coordinate on the axis perpendicular to
  the arrow: same centre x for vertical arrows, same centre y for horizontal
  arrows. This produces straight arrows with zero elbows
- **Align branch targets with their branch origin** — when a decision or fork
  creates a side branch, place the branch target at the same coordinate as
  the origin on the perpendicular axis (e.g. same y for a horizontal branch
  off a vertical flow). This makes branch arrows straight horizontal or
  vertical lines
- Think of the layout as an **implicit grid** — elements at the same depth in
  the flow share one axis coordinate, branches share the other

#### Arrow routing

- **Arrows must never cross shapes** — if an arrow's natural route passes
  through an intermediate shape, reroute it around all shapes through empty
  space (margin areas, gaps between regions). Absolute rule, no exceptions
- **Minimise crossing and overlapping lines** — rearrange elements to reduce
  arrow intersections. When arrows must share a target shape, bind them to
  different sides or different points on the same side using `fixedPoint`
  (see `excalidraw-format.md`)
- **Straight arrows first, then single-elbow** — avoid diagonal arrows;
  restructure the layout so connectors run horizontally or vertically. Every
  arrow should use the fewest bends possible. Multi-elbow routes (2+ bends)
  are a last resort — before adding a second elbow, restructure the layout or
  choose a different binding side that eliminates the bend
- **Reconnection arrows — one elbow maximum** — when a branch reconnects to the
  main flow (e.g. an error path connecting to the end, an optional step
  merging back), use at most one elbow: one straight segment to reach the
  correct axis, then one straight segment to the target
- **Perpendicular entry** — arrows always enter and exit shapes perpendicular
  to the face they connect to. Vertical arrows enter top or bottom faces;
  horizontal arrows enter left or right faces. An arrow must never run along
  a shape's edge
- **Return / loop-back arrows** — when an arrow loops back to an earlier point
  in the flow, route it through empty margin space (outside all shapes). Place
  the loop-back target near a diagram edge so the return arrow travels through
  the margin where there are no shapes to cross

#### Multi-frame layouts (swim lanes, boundaries, nested frames)

These rules apply to ANY diagram using `frame` elements to group content —
swim lanes in flowcharts/BPMN, system boundaries in C4, VPC/subnet boundaries
in cloud architecture, etc.

- **Frame spacing**: Leave at least **60px vertical gap** between consecutive
  stacked frames. This provides breathing room and visible space for
  cross-frame arrows
- **Cross-frame axis alignment**: Elements in different frames that are
  directly connected should share the same axis coordinate so the connecting
  arrow is straight. Plan this before placing shapes — identify which elements
  connect across frame boundaries and assign them to the same column (vertical
  layout) or row (horizontal layout)
- **Cross-frame arrow direction**: Cross-frame arrows travel perpendicular to
  the frame boundary — vertically between horizontally-stacked frames,
  horizontally between vertically-stacked frames. They enter/exit from the
  face closest to the other frame (top/bottom for vertical travel). Never
  enter a side face with a vertical cross-frame arrow
- **Gap symmetry**: Cross-frame arrows pass through the gap between frames at
  the midpoint: `(bottom of upper frame + top of lower frame) / 2`. Labels
  on cross-frame arrows must sit entirely within the inter-frame gap —
  centred at the gap midpoint with at least 10px clearance from each frame
  border. If the gap is too narrow for the label, increase the frame spacing
  beyond the 60px minimum (label_height + 20px is the minimum viable gap)

### Labels

- Use **concise language** — remove articles ("a", "the"), use verb phrases for
  arrows ("sends order", "validates"), noun phrases for shapes ("Order Service")
- Size text boxes to fit their content — avoid oversized empty shapes
- Every shape and every arrow carrying meaning should have a label
- **Arrow labels must not obscure the arrow** — every labelled arrow must satisfy
  `min_arrow_length = label_width + 120` (60px visible per side). See the
  minimum arrow length rule in `references/excalidraw-format.md`
- **Use multiline labels** to reduce label width when the label would violate
  the minimum arrow length — split into 2 lines with `\n` (e.g.
  `"Browses &\npurchases"` instead of `"Browses & purchases"`)
- If splitting is insufficient, increase spacing between the connected elements

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

- **Minimum gap between elements**: `40px` — this applies to ALL pairs of
  adjacent shapes, including shapes stacked vertically within the same lane.
  No two shapes may touch or overlap; always verify a 40px minimum edge-to-edge
  gap in both the x and y dimensions before finalising a layout
- **Arrow gap from shape border**: `8px` (implicit in `orbit` mode bindings)
- **Standard shape size**: `160 × 80` for boxes, `80 × 80` for circles/diamonds
- **Frame padding**: `40px` inside frame boundary around child elements
- **Horizontal spacing (left-to-right layouts)**: `120px` minimum between shape
  edges for unlabelled arrows. For labelled arrows, use `label_width + 120px`
  — this leaves 60px of visible arrow line on each side of the label, satisfying
  the minimum arrow length rule in `references/excalidraw-format.md`. Most
  two-line labels are ~80px wide, so `200px` is a good default when arrows
  carry labels. **Frame crossings:** when an arrow exits a frame, ensure the
  source shape sits at least 20px from the frame edge so the crossing is clearly
  visible (increase frame padding if needed)
- **Vertical spacing (top-to-bottom layouts)**: `120px` minimum between shape
  edges for unlabelled arrows. For labelled vertical arrows, use
  `label_height + 120px` — this is the vertical equivalent of the horizontal
  labelled-arrow rule. A single-line label at fontSize 14 has
  `label_height` = 17.5px, giving a minimum of **140px**. Templates may
  specify smaller spacing for unlabelled arrows (e.g. 60px in compact
  flowcharts) but must use at least 140px when vertical arrows carry labels
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
