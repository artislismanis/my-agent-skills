# Styling Defaults: Excalidraw Diagram Brand

> **Rule severity**: **MUST / MUST NOT** = absolute requirement, no exceptions.
> **SHOULD / SHOULD NOT** = strong default, override only with explicit
> justification documented in the prose plan. **MAY** = truly optional.

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
  arrow MUST share the same centre coordinate on the axis perpendicular to
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
- **Arrow segments must never cross labels** — no arrow segment may pass
  through the bounding box of another arrow's label. When routing elbowed
  arrows through a region that contains labels on other arrows, place the
  bend below (or above) the label area. Verify this in Step 4 by checking
  each elbowed arrow's segments against all label positions in the diagram
- **Minimise crossing and overlapping lines** — rearrange elements to reduce
  arrow intersections. When arrows must share a target shape, bind them to
  different sides or different points on the same side using `fixedPoint`
  (see `excalidraw-format.md`)
- **Straight arrows first, then single-elbow** — MUST NOT produce diagonal
  arrows; restructure the layout so connectors run horizontally or vertically.
  Every arrow MUST use the fewest bends possible. Multi-elbow routes (2+
  bends) are a last resort — before adding a second elbow, restructure the
  layout or choose a different binding side that eliminates the bend
- **Reconnection arrows — one elbow maximum** — when a branch reconnects to the
  main flow (e.g. an error path connecting to the end, an optional step
  merging back), use at most one elbow: one straight segment to reach the
  correct axis, then one straight segment to the target. For example, an
  error box reconnecting to the End node: go straight down from the error
  box, then straight left/right to the End — exactly two segments, one bend.
  Never add extra bends for visual padding
- **Perpendicular entry** — arrows always enter and exit shapes perpendicular
  to the face they connect to. Vertical arrows enter top or bottom faces;
  horizontal arrows enter left or right faces
- **Choose binding faces to minimise elbows** — when connecting two shapes,
  pick the face on each shape that produces the fewest bends. If the target
  is directly below, bind source bottom → target top (straight, zero elbows).
  If the target is below-and-right, choose the pair (bottom→top or
  right→left) that needs fewer bends. Always prefer the combination that
  eliminates elbows over one that feels "natural" but adds a bend
- **No arrow may overlap a shape edge or frame border** — an arrow segment
  must never be collinear with, run along, or visually overlap any edge of a
  shape or any frame boundary line. Route arrow segments through open space
  between elements — not along their perimeters. This is distinct from the
  "never cross shapes" rule: crossing means passing *through*; overlapping
  means running *along*. Both are prohibited
- **Return / loop-back arrows** — when an arrow loops back to an earlier point
  in the flow, route it through empty margin space (outside all shapes and
  outside all frame borders). Place the loop-back target near a diagram edge
  so the return arrow travels through the margin where there are no shapes or
  frame edges to overlap

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

Style tier is determined by element **kind** (from the template shape conventions
table), MUST NOT be chosen based on path importance or "optional" status.

> **WRONG** — Standard Light for a process box on a cancel/optional path:
> The cancel path is still a primary process step.
>
> **CORRECT** — Standard for ALL process boxes regardless of which path they
> are on. Only the template shape conventions table determines the tier.

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

**Important**: The `strokeStyle` values above are general defaults. Templates
may define stricter conventions — e.g. the flowchart template specifies that
ALL decision branch arrows (Yes/No/Cancel/Retry) MUST use `"solid"`, with
`"dashed"` reserved exclusively for error/exception arrows. Always check the
template arrow conventions table.

> **WRONG** — dashed arrow for a cancel or reject branch from a decision
> diamond. Cancel is a normal decision outcome, not an error.
>
> **CORRECT** — `"strokeStyle": "solid"` for all decision branch arrows.
> Only error/exception paths use `"dashed"`.

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

## Layout Planning (mandatory before generating JSON)

Before writing any Excalidraw JSON, plan the layout as prose and verify it
satisfies all rules. **Do not skip this step** — it is faster to fix a prose
plan than to debug coordinate-level JSON.

### Step 0: Clarify requirements

Before designing, read the prompt and identify anything ambiguous or
underspecified. Common questions to resolve:

- **Flow ambiguity**: Which element initiates a loop or cross-lane connection?
  (e.g. "needs more info loop" — from which lane?)
- **Decision outcomes**: How many exits does each decision have? What are the
  exact branch labels? (e.g. "success/retry/cancel" — is that 3 exits from
  one diamond or 2 diamonds?)
- **Terminal paths**: How many distinct paths reach End? Which paths merge?
- **Element scope**: Does a lane description list flow steps or just describe
  the lane's role? (e.g. "Customer lane: submit ticket, receive updates" —
  are both boxes in the flow, or is "receive updates" a role description?)
- **Style decisions**: Are any elements error/failure states that warrant Rare
  Highlight? Which elements are I/O vs process?

If generating for a user: ask clarifying questions and wait for answers
before proceeding. If generating examples from a test prompt: document
the interpretation chosen for each ambiguity in the prose plan so reviewers
can evaluate whether the choice was reasonable.

### Step 1: Element inventory

List every element with: type, label text, size, style tier.

For each decision diamond: determine whether the label fits inside (≤8 chars
per line at the template diamond size) or requires external placement. If ANY
diamond needs external labels, mark ALL diamonds as external.

### Step 2: Coordinate grid

Write a table: element | center x | center y | width | height.

Verify:
- Connected shapes on same axis (vertical arrows → same center x; horizontal → same center y)
- Labelled arrows: ≥140px gap between shapes; unlabelled: ≥60px (flowcharts)
- 40px minimum edge-to-edge gap between every adjacent shape pair

### Step 3: Arrow routing table

For every arrow write one row: source | source face | target | target face | segments | label.

Verify each row:
- Faces chosen to minimise elbows (zero preferred, one for reconnections, ≤1 for
  reconnection arrows — choose the face pair that eliminates bends, not just the
  "facing" side)
- Entry/exit perpendicular to face (vertical → top/bottom; horizontal → left/right)
- No segment overlaps any shape edge or frame border
- Loop-back arrows travel entirely through open margin outside all shapes and frames
- Multiple arrows on the same face use symmetric fixedPoint distribution
  (0.25/0.75 for 2, 0.2/0.5/0.8 for 3)
- Converging arrows from different sources bind to separate fixedPoints
- Parallel elbowed arrows use the same bend y-coordinate (shared routing channel)

### Step 4: Label placement check

For every label (shape, arrow, or external diamond label):
- Shape labels: text fits within shape bounds
- Arrow labels: centred at midpoint with ≥60px visible arrow each side; label
  does not overlap any other arrow line, shape edge, or other label. Also
  verify no OTHER arrow's segment crosses through this label's bounding box
- External diamond labels: placed on the face that has NO connecting arrows
  (typically **above** the diamond when arrows enter from the left and exit
  from the right and/or bottom)
- Loop-back arrows: MUST NOT have a label when the source and target shapes
  provide sufficient context (e.g. "Review Ticket" → "Submit Ticket" is
  self-explanatory). Only add a label if the loop target is genuinely ambiguous
- Arrow `strokeStyle`: matches the template arrow conventions table — solid
  for all decision branches (Yes/No/Cancel), dashed only for error/exception
- Style tier: matches element kind from the template shape conventions table
  (process = Standard, I/O = Standard Light, etc.) — MUST NOT be chosen
  based on path importance or "optional" status
- No label (bound or standalone) overlaps any frame border — labels on
  cross-frame arrows MUST sit entirely in the inter-frame gap

### Step 4b: Spatial collision check

For every elbowed arrow, compute the bounding box of each segment (a thin
rectangle along the segment path). Then verify against every label bounding
box in the diagram (from Step 4):

- **Arrow segment vs label**: no segment may overlap any label bounding box.
  Check: `seg_min_y < lbl_max_y AND seg_max_y > lbl_min_y AND seg_min_x <
  lbl_max_x AND seg_max_x > lbl_min_x`. If true → collision, reroute the
  bend below (or above) the label area.
- **Minimum clearance**: arrow segments MUST maintain **≥30px** clearance
  from any label bounding box edge. This prevents visual merging at lower
  render resolutions.

Write the check as a table: arrow segment | segment y | nearest label |
label y-range | clearance | pass/fail. Fix any failures before proceeding.

### Step 5: Checklist pass

Walk through the template checklist item by item against the prose plan. Fix
any violations before generating JSON — this is the last gate before coding.

### Step 6: Iterate until clean

If Steps 2–5 produced any fixes, repeat from Step 2. Layout changes in one
step can introduce violations in another (e.g. moving a shape to fix spacing
may break axis alignment). Continue until a full pass through Steps 2–5
produces **zero violations**.

Only proceed to JSON generation after a clean pass.

---

## Visual Iteration

After generating a diagram, render it to PNG and review against two categories:

**Category A — Rule violations** (any item from the template checklist or
Steps 2–5 above): Do NOT patch the JSON. Return to the prose plan (Step 1),
fix the violation there, re-run Steps 2–6 until clean, then **regenerate the
full JSON** from the corrected plan.

**Category B — Visual fine-tuning** (spacing balance, label readability,
aesthetic polish that does not involve rule violations): Adjust the JSON
directly, re-render, and repeat. These are coordinate-level tweaks, not
structural changes. Examples:
1. Arrow labels slightly covering arrowheads → adjust label position
2. Unbalanced spacing → adjust coordinates
3. Text clipped at shape edge → widen shape or shrink text

It is normal to need 1–2 Category B iterations. Category A iterations
should be zero if the prose planning loop was thorough.

---

## Style Override Rules

1. Apply all defaults above as a baseline
2. Templates may define their own role-to-style mappings — these take precedence over the general defaults
3. If the user requests a specific style override → apply only that override, keep all others
4. Never introduce colours outside the palette unless explicitly requested
5. Never change `roughness` from `1` unless a different aesthetic is specifically requested
