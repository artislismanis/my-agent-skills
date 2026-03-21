# Styling Defaults: Excalidraw Diagram Brand

**Purpose**: Apply these defaults to ALL generated diagrams for a consistent, professional appearance.
**Rule**: Use these values unless the user explicitly requests a different style. When overriding, keep all other defaults intact.

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

For bound labels (text inside shapes): always centre both axes.
For standalone text: `"left"` alignment is acceptable.

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

---

## Layout Spacing Guidelines

- **Minimum gap between elements**: `40px`
- **Arrow gap from shape border**: `8px` (`gap: 8` in bindings)
- **Standard shape size**: `160 × 80` for boxes, `80 × 80` for circles/diamonds
- **Frame padding**: `40px` inside frame boundary around child elements
- **Horizontal spacing (left-to-right layouts)**: `80px` between shape edges
- **Vertical spacing (top-to-bottom layouts)**: `60px` between shape edges
- **Canvas origin**: Start first element at `x: 100, y: 100` to avoid clipping

---

## Style Override Rules

1. Apply all defaults above as a baseline
2. If the user requests a specific colour → apply only that override, keep all others
3. If the user requests a different font → override `fontFamily` only
4. Never introduce colours outside the palette unless explicitly requested
5. Never change `roughness` from `0` unless hand-drawn aesthetic is requested
