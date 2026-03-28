# Brand: Diagram Styling Defaults

**Purpose**: Brand-specific values applied to all generated diagrams. Swap this
file (and `brand.json`) to change the visual identity while keeping the same
visual language principles from `visual-language.md`.

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

Default font: `6` (Nunito).

## Font Sizes

| Context | Size |
|---------|------|
| Element label (inside shape) | `16` |
| Sub-label / technology annotation | `14` |
| Frame / boundary label | `18` |
| Standalone heading text | `20` |
| Arrow label | `14` |

---

## Stroke Settings

| Property | Default Value | Notes |
|----------|--------------|-------|
| `strokeWidth` | `2` | Medium weight — readable at any scale |
| `strokeStyle` | `"solid"` | Use `"dashed"` for optional/async flows |
| `roughness` | `0` | Clean, polished lines (not hand-drawn) |
| `opacity` | `100` | Full opacity for all elements |

## Fill Style

| Context | fillStyle |
|---------|-----------|
| Shapes with background colour | `"solid"` |
| Shapes where hachure is desired | `"hachure"` |
| Transparent / outline only | `"solid"` (with `backgroundColor: "transparent"`) |

Default: `"solid"` for all coloured shapes.

---

## Arrow Defaults

- `endArrowhead: "arrow"` for directed relationships
- `startArrowhead: "arrow"` + `endArrowhead: "arrow"` for bidirectional
- `null` on both ends for undirected lines (prefer `line` type instead)
- `strokeStyle: "dashed"` for async, optional, or future flows

---

## Character Width Estimates

Used for calculating text element dimensions. Values are approximate pixels per
character at the given `fontSize` with Nunito (fontFamily 6).

| fontSize | px/char |
|----------|---------|
| `12` | `8` |
| `14` | `8` |
| `16` | `10` |
| `20` | `10` |
| `36` | `22` |
