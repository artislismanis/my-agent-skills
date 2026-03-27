# Template: Flowcharts and Decision Trees

**Standard**: ANSI/ISO flowchart notation (industry-standard symbols)
**Use for**: Process flows, decision trees, algorithms, approval workflows

Apply styling defaults from `references/styling-defaults.md`. This template
defines flowchart-specific shape conventions on top of those defaults.

---

## Shape Conventions

| Flowchart Element | Excalidraw Shape | Style Tier | Typical Size |
|-------------------|-----------------|------------|--------------|
| Start (Terminator) | `ellipse` with `roundness: { type: 2 }` | Standard, `strokeWidth: 2` | `40 × 40` |
| End (Terminator) | `ellipse` with `roundness: { type: 2 }` | Standard, `strokeWidth: 4` | `40 × 40` |
| Process / Action | `rectangle` | Standard | `160 × 80` |
| Decision | `diamond` | Standard | `120 × 120` |
| Input / Output | `rectangle` | Standard Light | `160 × 80` |
| Sub-Process | `rectangle` | Standard | `160 × 80` |
| Data Store / Database | `rectangle` | Standard | `160 × 80` |
| Connector (off-page) | `ellipse` | Standard Lighter | `60 × 60` |
| Annotation / Note | `text` (standalone, no background) | — | — |
| Swim Lane | `frame` | Frame defaults | — |

```json
{ "type": "ellipse", "roundness": { "type": 2 }, "width": 40, "height": 40, "strokeWidth": 2 }
```

```json
{ "type": "ellipse", "roundness": { "type": 2 }, "width": 40, "height": 40, "strokeWidth": 4 }
```

```json
{ "type": "diamond", "width": 120, "height": 120 }
```

```json
{ "type": "ellipse", "roundness": { "type": 2 }, "width": 60, "height": 60 }
```

**Error and failure states**: Use the **Rare Highlight** style
(`backgroundColor: "#ff5033"`, text `strokeColor: "#f5fff7"`). Do NOT use
Occasional Highlight for error or failure states — that style is reserved for
focal emphasis, not errors.

---

## Label Conventions

- **Terminator**: No label. Start and End are small unlabeled circles — do not
  create a bound text element for terminators. Start uses standard stroke width
  (`strokeWidth: 2`), End uses bold stroke width (`strokeWidth: 4`) to visually
  distinguish them. The incoming/outgoing arrows provide the flow context.
- **Process**: Imperative verb phrase — `"Validate Input"`, `"Send Email"`
- **Decision**: Question form ending with `?` — `"Authenticated?"`, `"Payment valid?"`
  Keep labels short: 1–2 words + `?`. If a natural phrasing is too long, shorten
  it (e.g. `"Discount Code?"` not `"Apply Discount Code?"`). As an alternative,
  place the label as standalone text beside an unlabeled diamond and reduce the
  diamond size — but if you use this approach, apply it consistently to ALL
  diamonds in the diagram.
- **Decision branches**: Label arrows exiting a diamond with `"Yes"` / `"No"` or `"True"` / `"False"`
- **Input/Output**: Noun phrase — `"User Credentials"`, `"Order Confirmation"`

---

## Arrow Conventions

| Flow Type | Arrow Style | Label |
|-----------|-------------|-------|
| Normal flow | `solid` arrow | Optional brief label |
| Decision YES/TRUE branch | `solid` arrow | `"Yes"` or `"True"` |
| Decision NO/FALSE branch | `solid` arrow | `"No"` or `"False"` |
| Loop-back / retry | `solid` arrow (curved via points) | Optional |
| Error / exception | `dashed` arrow | `"Error"` or `"Timeout"` |

Decision diamond labels:

- Arrows come out from the **bottom** (false/no) and **right** (true/yes) — or bottom and left
- Add a short text label on each outgoing arrow

**Arrow label binding:** All arrow labels (including decision branch labels like
`"Yes"` / `"No"`) use `containerId` binding with `lineHeight: 1.25` and calculated
midpoint positioning. See `references/excalidraw-format.md` section "Arrow label
rules" for the complete JSON pattern, sizing formulas, and readability rules.

---

## Layout

Apply the axis alignment, arrow routing, and multi-frame layout rules from
`references/styling-defaults.md`. The rules below are flowchart-specific.

### Top-to-Bottom (default)

Standard flow direction: start at top, end at bottom. Decision branches go
to the side; the main (happy) path continues down.

Vertical spacing: 60px between shapes (edge to edge).
Horizontal spacing: 120px for branches.
Decision branches: go right for one outcome, continue down for the other —
be consistent within the diagram.

### Left-to-Right (alternative)

Use when the process has many sequential steps that would create a very tall diagram.

---

## Swim Lanes

Use swim lanes to show which actor/role performs each step. Apply the
multi-frame layout rules from `references/styling-defaults.md` for spacing,
cross-frame axis alignment, and arrow routing.

- Each lane is a `frame` element with the actor's name
- Height: enough to contain all steps for that actor (minimum 200px)
- Width: full diagram width (equal for all lanes)
- Stack lanes vertically, top lane = first actor
- Process elements inside a lane reference the frame via `frameId`

```
[frame: Customer]
  └── [Start] → [Browse Catalog] → [Add to Cart]
[frame: System]
  └── [Validate Cart] → [Process Payment] → [Confirm Order]
[frame: Warehouse]
  └── [Pick Order] → [Pack] → [Ship]
```

---

## Decision Tree Specifics

For decision trees (rather than process flows):

- Root decision at top
- Branch left and right (or multiple directions) for each outcome
- Leaf nodes (final outcomes) at bottom — use Terminator shape
- Label every branch with its condition value

Layout: top-down tree structure, outcomes spread left-to-right.

---

## Complex Flow Handling

- **Loops**: Draw the return arrow to the left or right of the process block,
  not through existing elements. Use enough spacing to route cleanly.
- **Parallel paths**: Use a horizontal `line` to indicate fork and join (or label arrows clearly).
- **Sub-processes**: Indicate with an `"[SP]"` suffix in the label or a nested frame.
- **Off-page connectors**: Use small labelled `ellipse` elements at page breaks.

---

## Checklist Before Generating

**Flowchart-specific:**
- [ ] Every decision diamond has exactly one incoming arrow and at least two outgoing arrows
- [ ] Every outgoing arrow from a decision has a label (Yes/No or condition)
- [ ] Exactly one Start node and at least one End node (unlabeled circles)
- [ ] No dead ends (every non-terminal shape has an outgoing arrow)
- [ ] Error/failure states use Rare Highlight (red), not Occasional Highlight

**From `references/styling-defaults.md` (apply to all diagrams):**
- [ ] Connected shapes share the same axis coordinate (straight arrows, no diagonal)
- [ ] Branch targets align with their branch origin on the perpendicular axis
- [ ] No arrow crosses any shape
- [ ] No arrow uses more elbows than the geometry requires (prefer zero, max one for reconnection)
- [ ] Arrows enter/exit shapes perpendicular to the face (vertical arrows → top/bottom, horizontal → left/right)
- [ ] (Swim lanes) Cross-frame connected pairs share the same axis — plan columns before placing shapes
- [ ] (Swim lanes) 60px gap between consecutive lane frames
