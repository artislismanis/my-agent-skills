# Template: Flowcharts and Decision Trees

**Standard**: ANSI/ISO flowchart notation (industry-standard symbols)
**Use for**: Process flows, decision trees, algorithms, approval workflows

Apply styling defaults from `references/styling-defaults.md`. This template
defines flowchart-specific shape conventions on top of those defaults.

---

## Shape Conventions

| Flowchart Element | Excalidraw Shape | Background | Typical Size |
|-------------------|-----------------|------------|--------------|
| Start / End (Terminator) | `rectangle` with `roundness: { type: 3 }` | `#d3f9d8` | `160 × 60` |
| Process / Action | `rectangle` | `#dbe4ff` | `160 × 80` |
| Decision | `diamond` | `#fff3bf` | `120 × 120` |
| Input / Output | `rectangle` (use parallelogram label convention) | `#f1f3f5` | `160 × 80` |
| Sub-Process | `rectangle` (double border via label convention) | `#dbe4ff` | `160 × 80` |
| Data Store / Database | `rectangle` | `#fff3bf` | `160 × 80` |
| Connector (off-page) | `ellipse` | `#f1f3f5` | `60 × 60` |
| Annotation / Note | `text` (standalone, no background) | `transparent` | — |
| Swim Lane | `frame` | `transparent` | — |

---

## Label Conventions

- **Terminator**: `"Start"` or `"End"` — `fontFamily: 6`, `fontSize: 16`
- **Process**: Imperative verb phrase — `"Validate Input"`, `"Send Email"`
- **Decision**: Question form ending with `?` — `"Is user authenticated?"`, `"Amount > $100?"`
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

---

## Layout

### Top-to-Bottom (default)

Standard flow direction: start at top, end at bottom.

```
[Start]
   ↓
[Process 1]
   ↓
[Decision?] ——No——→ [Process 2b]
   ↓ Yes               ↓
[Process 2a]      [End (alternate)]
   ↓
[End]
```

Vertical spacing: 60px between shapes (edge to edge).
Horizontal spacing: 80px for branches.
Decision branches: go right for "Yes", continue down for "No" (or vice versa — be consistent).

### Left-to-Right (alternative)

Use when the process has many sequential steps that would create a very tall diagram.

---

## Swim Lanes

Use swim lanes to show which actor/role performs each step.

- Each lane is a `frame` element with the actor's name
- Height: enough to contain all steps for that actor (varies)
- Width: full diagram width
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

Lane width: equal widths for all lanes. Minimum lane height: 140px.

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

## Example: Simple Decision Flow

```
[Start] → [Get User Input] → [Is Valid?] → Yes → [Process Request] → [Show Success] → [End]
                                    ↓ No
                              [Show Error] → [End (error)]
```

Shapes:
- Start/End: `rectangle` rounded, `#d3f9d8`, `160 × 60`
- Get User Input: `rectangle`, `#dbe4ff`, `160 × 80`
- Is Valid?: `diamond`, `#fff3bf`, `120 × 120`
- Process Request: `rectangle`, `#dbe4ff`, `160 × 80`
- Show Success: `rectangle`, `#d3f9d8`, `160 × 80`
- Show Error: `rectangle`, `#ffe3e3`, `160 × 80`

---

## Checklist Before Generating

- [ ] Every decision diamond has exactly one incoming arrow and at least two outgoing arrows
- [ ] Every outgoing arrow from a decision has a label (Yes/No or condition)
- [ ] Exactly one Start node and at least one End node
- [ ] No dead ends (every non-terminal shape has an outgoing arrow)
- [ ] No crossing arrows where avoidable — reroute if needed
