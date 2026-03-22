# Research: Excalidraw Diagram Plugin

**Feature**: 001-excalidraw-diagrams
**Date**: 2026-03-21

## R1: PNG Rendering Approach

### Decision: Official `@excalidraw/utils` with jsdom + `@napi-rs/canvas` polyfills

### Rationale

> **Updated**: Pipeline replaced — removed `excalidraw-to-svg` + `@resvg/resvg-js` in favour
> of official `@excalidraw/utils` (see R5, R6). The third-party `excalidraw-to-svg` library
> produced broken text positioning — labels inside containers were misplaced and overlapping,
> making output unusable.

The official `@excalidraw/utils` package provides `exportToCanvas()` which renders
PNG directly using Excalidraw's own rendering code (same as the web app). It needs
browser APIs, but these are polyfilled in render.mjs:

1. **`@excalidraw/utils`** (latest) — official Excalidraw export utilities. `exportToCanvas()`
   produces a canvas element with correct text positioning and layout.
2. **`@napi-rs/canvas`** ^0.1.97 — Rust-based canvas implementation (prebuilt binary).
   Provides real canvas rendering in Node.js. Also used to register Excalidraw's bundled
   fonts (Nunito, Excalifont, Virgil, etc.) via `GlobalFonts.registerFromPath()`.
3. **`jsdom`** ^26.1.0 — DOM polyfill providing `window`, `document`, `HTMLElement`, etc.

The render script sets up global polyfills (`window`, `document`, `navigator`, `FontFace`,
`document.fonts`) before dynamically importing `@excalidraw/utils`. Canvas creation is
intercepted via `document.createElement('canvas')` override to route through `@napi-rs/canvas`.

### Alternatives Considered

| Approach | Rejected Because |
|----------|-----------------|
| `@excalidraw/utils` directly | Requires manual jsdom + node-canvas setup, fragile DOM globals |
| Puppeteer/Playwright | Spec explicitly prohibits browser automation |
| `node-canvas` + `exportToCanvas` | Native compilation dependency, harder to self-contain |
| `sharp` for SVG→PNG | Less accurate SVG rendering than resvg for complex paths |

### Dependencies

| Package | Version | Purpose | Size Impact |
|---------|---------|---------|-------------|
| `@excalidraw/utils` | latest | Official Excalidraw renderer — exportToCanvas() for direct PNG | Bundles Excalidraw rendering code + fonts |
| `@napi-rs/canvas` | ^0.1.97 | Canvas backend for Node.js (prebuilt Rust binary) + font registration | ~15MB platform binary |
| `jsdom` | ^26.1.0 | DOM polyfill (window, document, HTMLElement, etc.) | Moderate transitive deps |

### Font Handling

Excalidraw has both legacy and modern font families:
- **Legacy**: Virgil (deprecated), Helvetica, Cascadia (hidden)
- **Modern**: Excalifont (hand-drawn default, ID 5), Nunito (body text, ID 6), Lilita One (headings, ID 7), Comic Shanns (code, ID 8)

The styling configuration uses modern fonts by default. The `@excalidraw/utils`
package bundles all font files as `.ttf` assets in `dist/prod/assets/`. The
render script registers these with `@napi-rs/canvas` via `GlobalFonts.registerFromPath()`
for correct font rendering. If fonts are unavailable, text renders in system
fallback fonts — functional but visually different from the Excalidraw editor.

### Known Limitations

- Embedded images in diagrams require passing the `files` property from the
  Excalidraw JSON to the export function
- `@excalidraw/utils` is browser-focused — render.mjs sets up jsdom/canvas
  polyfills to make it work in Node.js. Font rendering uses `@napi-rs/canvas`
  GlobalFonts rather than the CSS Font Loading API (FontFace polyfill is a stub)

## R2: Excalidraw JSON Format

### Decision: Document format based on publicly available Excalidraw schema

### Rationale

The Excalidraw JSON format is stable and well-documented through the
excalidraw.com source code and developer docs. The plugin's reference material
will document the subset needed for diagram generation:

- **Element types**: rectangle, diamond, ellipse, arrow, line, text, frame, freedraw, image, iframe
- **Common properties**: id, type, x, y, width, height, strokeColor,
  backgroundColor, fillStyle, strokeWidth, roughness, opacity, groupIds
- **Arrow bindings**: startBinding/endBinding with `mode: "orbit"`,
  `elementId`, `fixedPoint` normalised coordinates (see R8)
- **Text labels**: boundElements on shapes, text element with containerId,
  calculated positioning (see R7)
- **Frames**: frameId property on child elements
- **appState**: viewBackgroundColor, theme, gridSize

### Sources

- [Excalidraw developer docs](https://docs.excalidraw.com)
- [Excalidraw source code](https://github.com/excalidraw/excalidraw)

## R3: Self-Contained Script Approach

### Decision: Node.js script with package.json for dependency declaration

### Rationale

The render script will be a `.mjs` file accompanied by a minimal
`package.json` in the `scripts/` directory. Users run it via:

```bash
cd plugins/diagramming/excalidraw-diagrams/skills/excalidraw-diagrams/scripts
npm install && node render.mjs input.excalidraw output.png
```

Or Claude runs it automatically after generating diagram JSON. The
`package.json` declares `@excalidraw/utils`, `@napi-rs/canvas`, and
`jsdom` — npm handles transitive deps.

### Alternatives Considered

| Approach | Rejected Because |
|----------|-----------------|
| Deno with `npm:` imports | Less common in Claude Code user environments |
| Single-file with inline deps (PEP 723 style) | No Node.js equivalent for npm packages |
| npx wrapper | Adds indirection, harder to version-pin dependencies |

## R4: Styling Configuration Approach

### Decision: Markdown reference with JSON defaults inline

### Rationale

The styling configuration will be a markdown file (`styling-defaults.md`)
containing the default property values as inline JSON snippets. Claude reads
this reference and applies the values when generating diagrams. This is simpler
than a separate JSON config file that would need parsing logic.

The configuration defines:
- Colour palette (5-7 colours for backgrounds, strokes, text)
- Font family defaults (Excalifont for hand-drawn labels, Nunito for body text, Comic Shanns for code annotations)
- Stroke width, roughness, and opacity defaults
- Fill style defaults (hachure vs solid vs cross-hatch)

### Alternatives Considered

| Approach | Rejected Because |
|----------|-----------------|
| JSON config file loaded by script | Adds complexity, script doesn't need it — Claude reads markdown |
| YAML config | Same issue, plus adds a parser dependency |
| Embedded in SKILL.md | Would bloat the main skill definition |

## R5: Render Script Testing and Dependency Fixes

**Date**: 2026-03-21 (post-implementation validation)

### Context

During end-to-end validation of the render script, several issues were
discovered with the original dependency specification. This section documents
the problems found, alternatives evaluated, and final decisions.

### Finding 1: `excalidraw-to-svg` ^0.2.0 does not exist

The original `package.json` specified `excalidraw-to-svg@^0.2.0`. The package's
actual published versions start at `1.0.0`. `npm install` fails with `ETARGET`.

**Resolution**: Updated to `^3.1.0` (latest). v3 replaces the native `canvas`
dependency with `canvas-5-polyfill` and upgrades jsdom to v24.

### Finding 2: `excalidraw-to-svg` v3 requires a canvas backend

v3 bundles `canvas-5-polyfill` which provides `Path2D` but does **not** provide
a real `HTMLCanvasElement.getContext()` implementation. jsdom v24 checks for
`require("canvas")` and falls back to a "not implemented" error without it.
The Excalidraw renderer internally calls `getContext("2d")` for text measurement,
causing a crash: `TypeError: Cannot use 'in' operator to search for 'filter' in null`.

**Alternatives evaluated**:

| Approach | Outcome |
| -------- | ------- |
| `excalidraw-to-svg` v2 (uses native `canvas` package) | Fails — requires `pixman-1` dev headers for native compilation; no prebuilt binary for Node v23 |
| `canvas-5-polyfill` only (v3 default) | Fails — polyfill mocks `CanvasRenderingContext2D` class but doesn't patch jsdom's `HTMLCanvasElement.getContext()` |
| `@napi-rs/canvas` aliased as `canvas` | Works — prebuilt Rust binary, no system dependencies, provides real `createCanvas` + `getContext` |
| Install system dev headers (`libpixman-1-dev`, etc.) | Not viable — no sudo access, and would add system-level prerequisites for users |

**Resolution**: Added `@napi-rs/canvas@^0.1.97` to `package.json`. A
`postinstall` script creates a `node_modules/canvas/` shim that re-exports
`@napi-rs/canvas`, satisfying jsdom's `require("canvas")` lookup.

### Finding 3: `excalidraw-to-svg` API differs from expected

The library exports a single default function that takes the full Excalidraw
document object (not separate `{elements, appState, files}` arguments). It is
also a CommonJS module, requiring `import exportToSvg from 'excalidraw-to-svg'`
rather than a named import.

Additionally, the library reads `@excalidraw/utils` and `canvas-5-polyfill`
from `./node_modules/` via `fs.readFileSync` with a relative path. The render
script must `process.chdir()` to the scripts directory to ensure these paths
resolve correctly regardless of where the script is invoked from.

**Resolution**: Updated `render.mjs` with:
- Default import instead of named import
- `process.chdir(scriptDir)` at startup
- Pass full `doc` object (with merged `appState`) to `exportToSvg()`

### Finding 4: Render script validation results

All tests pass after the fixes above:

| Test | Input | Expected | Result |
| ---- | ----- | -------- | ------ |
| Happy path | Rectangle + ellipse + arrow with bindings | 1200x222 PNG with shapes and arrow | Pass |
| Empty elements | `"elements": []` | Blank 16:9 PNG (1200x675) | Pass |
| Custom width | `--width 2400` | Wider PNG (2400x444) | Pass |
| `--help` flag | `node render.mjs --help` | Usage text, exit 0 | Pass |
| No args | `node render.mjs` | Usage text, exit 1 | Pass |
| Invalid JSON | `"not json"` | Error message, exit 1 | Pass |
| Wrong type field | `type: "other"` | Error message, exit 1 | Pass |
| Missing file | Nonexistent path | Error message, exit 1 | Pass |
| Clean install | `rm -rf node_modules && npm install` | Postinstall creates canvas alias, render works | Pass |

## R6: Pipeline Replacement — excalidraw-to-svg → @excalidraw/utils

### Decision: Replace render pipeline with official @excalidraw/utils

### Problem

The `excalidraw-to-svg` v3.1.0 library (third-party reimplementation) produced broken
PNG output: text inside containers was mispositioned and overlapping. The SVG intermediate
step introduced layout errors that made rendered diagrams unusable for visual validation.

### Alternatives Evaluated

| Option | Approach | Text accuracy | Deps | Verdict |
| ------ | -------- | ------------- | ---- | ------- |
| Keep excalidraw-to-svg, fix text | Patch SVG output | Partial | Low | Fragile — different rendering code |
| @excalidraw/utils + polyfills | Official renderer in Node.js | Correct | Medium | Chosen — uses same code as web app |
| Puppeteer/headless Chrome | Full browser rendering | Perfect | Heavy | Overkill — 200MB+ Chromium dependency |
| excalidraw-render MCP server | Headless Chromium service | Perfect | Heavy | Separate process, complex setup |

### Solution

Replaced the two-stage pipeline (JSON → SVG → PNG) with direct PNG rendering via
`@excalidraw/utils.exportToCanvas()`. The official library uses the same rendering code
as excalidraw.com, producing correct text positioning.

**Polyfills required** (set up as globals before dynamic import):
- `jsdom` — provides `window`, `document`, `HTMLElement`, `DOMParser`, etc.
- `@napi-rs/canvas` — provides real canvas via `document.createElement('canvas')` override
- `FontFace` stub — CSS Font Loading API polyfill (non-functional, allows library to load)
- `document.fonts` stub — FontFaceSet polyfill
- Font registration via `GlobalFonts.registerFromPath()` using bundled `.ttf` files from
  `@excalidraw/utils/dist/prod/assets/`

**Dependencies changed**:
- Removed: `excalidraw-to-svg`, `@resvg/resvg-js`
- Added: `@excalidraw/utils`, `jsdom`
- Kept: `@napi-rs/canvas`
- Removed: postinstall canvas alias shim (no longer needed)

### Test Results

All 8 test cases pass with the new pipeline:

| Test | Result |
| ---- | ------ |
| C4 context diagram (text in containers, arrows, frame) | Pass — text correctly positioned |
| Empty elements | Pass — blank 16:9 canvas |
| Custom --width | Pass |
| --help / no args | Pass |
| Invalid JSON / wrong type / missing file | Pass — correct error messages |
| Clean npm install | Pass — no postinstall shim needed |

## R7: Static Renderer Text Positioning

**Date**: 2026-03-22 (discovered during iterative testing, Changes 1–12)

### Discovery: Static renderer does not auto-position text

The `@excalidraw/utils` static renderer does **not** auto-centre or
auto-position bound text elements. The `x`, `y`, `width`, and `height`
values on text elements are rendered as-is — unlike the interactive
Excalidraw editor, which runs a layout engine to reposition bound text
within its container.

### Observed Problem

Text labels inside shapes appeared at wrong positions in rendered PNGs:
top-left instead of centred, wrong height for multiline labels, labels
overflowing shape boundaries. This made rendered output unusable for
visual validation.

### Root Cause: No layout engine in static export

The static renderer (`exportToCanvas`) skips the interactive layout engine.
It trusts the coordinates in the JSON. Two additional issues compounded this:

1. **`lineHeight` defaults to `2.5`** when omitted — the renderer's fallback
   produces double-spaced text that overflows containers
2. **`containerId: null` with manual `x`/`y` + `groupIds`** does not work —
   text positioned this way renders at incorrect locations in PNG output
   because `groupIds` controls selection grouping, not rendering position

### Resolution: Explicit positioning formulas

Explicit positioning formulas added to `excalidraw-format.md`:

```text
text_height = num_lines × fontSize × lineHeight
text_y      = parent_y + (parent_height - text_height) / 2
text_x      = parent_x
text_width  = parent_width
```

For arrow labels (midpoint centering):

```text
text_width  ≈ num_chars × 8  (fontSize 14 Nunito)
text_x      = arrow_midpoint_x - text_width / 2
text_y      = arrow_midpoint_y - text_height / 2
```

**Mandatory properties:**

- `lineHeight: 1.25` — always set explicitly on every text element
- `containerId` — must reference parent shape/arrow ID for bound text
- `autoResize: true` — allows Excalidraw editor to reflow if edited later

### Cross-cutting Impact

This finding affected every task that produces JSON examples: T004 (format
reference), T005 (styling defaults), T006 (SKILL.md), and all template
tasks (T009–T013). All examples updated with calculated text positions.

## R8: Arrow Binding Format — orbit + fixedPoint

**Date**: 2026-03-22 (discovered during iterative testing, Changes 13–16)

### Discovery: orbit mode replaces focus/gap

The correct arrow binding format uses `mode: "orbit"` with `fixedPoint`
normalised coordinates. The previously documented `focus`/`gap`/
`fixedPoint: null` fields are legacy and produce inconsistent results
with the current Excalidraw renderer.

### Correct Format

```json
"startBinding": {
  "mode": "orbit",
  "elementId": "source-id",
  "fixedPoint": [0.5001, 0.5001]
}
```

### fixedPoint Coordinate System

`fixedPoint` uses normalised `[x, y]` where `(0, 0)` is the top-left and
`(1, 1)` is the bottom-right of the shape's bounding box. Values are
**continuous** — any point along an edge is valid, not just 5 preset
anchors.

Common anchors: `[0, 0.5]` (left), `[1, 0.5]` (right), `[0.5, 0]` (top),
`[0.5, 1]` (bottom), `[0.5001, 0.5001]` (auto/centre).

**Multi-arrow distribution:** When multiple arrows connect to the same
side, distribute them evenly (e.g., 2 arrows on left: `[0, 0.33]` and
`[0, 0.67]`; 3 arrows: `[0, 0.25]`, `[0, 0.5]`, `[0, 0.75]`).

### Legacy Fields (removed from guidance)

- `focus` — position along shape edge (-1 to 1). Replaced by fixedPoint.
- `gap` — pixel distance from shape border. Now implicit in orbit mode.
- `fixedPoint: null` — old auto-placement. Replaced by `[0.5001, 0.5001]`.

## R9: Native Elbowed Arrows

**Date**: 2026-03-22 (discovered during iterative testing, Changes 17–19)

### Discovery: elbowed flag required for right-angle routing

Native Excalidraw elbowed arrows use `"elbowed": true` with additional
properties. The initial approach of simulating elbows with
`"elbowed": false` and manual 4-point paths produced diagonal lines in
some cases because the renderer interpreted the points differently
without the elbowed flag.

### Native Format

```json
{
  "elbowed": true,
  "fixedSegments": null,
  "startIsSpecial": null,
  "endIsSpecial": null,
  "points": [[0, 0], [bend_x, 0], [bend_x, dy_end], [dx_end, dy_end]]
}
```

### Binding Gap for Elbowed Arrows

Elbowed arrows create the binding gap via `fixedPoint` values slightly
outside `[0, 1]`. A `~0.03` offset from the edge creates ~6px of visual
gap:

- Start from right edge: `fixedPoint: [1.03, y]`
- End at left edge: `fixedPoint: [-0.03, y]`

This differs from straight arrows, which use manual 8px offset in the
arrow's `x`/`y` coordinates. The arrow's `x`/`y` for elbowed arrows is
the actual start position (no manual offset needed).

> **Correction (Changes 20+):** `orbit` mode handles the visual gap for
> straight arrows too — set `x`/`y` to the shape edge. The complete
> example confirms: arrow at `x=260` = box edge `(100+160)`, no manual
> offset. The "8px offset for straight arrows" claim was from early
> testing and is incorrect.

### Routing Patterns

Two primary patterns (4 points each):

- **Right-then-up/down**: `[[0, 0], [bend_x, 0], [bend_x, dy], [dx, dy]]`
- **Up/down-then-right**: `[[0, 0], [0, bend_y], [dx, bend_y], [dx, dy]]`

Bend points must be placed in empty space — not overlapping other elements
or arrow labels.

## R10: Layout Spacing and Visual Language

**Date**: 2026-03-22 (discovered during iterative testing, Changes 13–14)

### Discovery: original spacing too tight for labelled arrows

The original layout spacing values (80px horizontal, 60px vertical) were
too tight for diagrams with labelled arrows. Arrow labels covered
arrowheads and the diagrams felt cramped.

### Spacing Formula

Through iterative rendering and visual review, the optimal spacing was
found to be:

- **Labelled arrows**: `label_width + 160px` between shape edges (leaves
  ~80px visible arrow line on each side of the label). Most two-line labels
  are ~80px wide, so `240px` is a good default.
- **Unlabelled arrows**: `160px` minimum between shape edges.
- **Vertical spacing**: `120px` minimum between shape edges.

### Centre-Line Alignment

Diagonal arrows are almost always unintentional. They're eliminated by
aligning connected shapes:

- Horizontal arrows: shapes share the same `y` (vertical centres match)
- Vertical arrows: shapes share the same `x` (horizontal centres match)

When shapes cannot share an axis, use elbowed arrows (see R9) instead of
allowing diagonal connections.

### Visual Iteration

First-pass layouts rarely render perfectly. A post-render review checklist
was added to `styling-defaults.md`:

1. Arrow labels covering arrowheads or arrow origins
2. Unbalanced spacing (some gaps much larger/smaller than others)
3. Text clipped or overflowing shape boundaries
4. Overlapping elements

2–3 iterations is normal to achieve a clean diagram.
