# Research: Excalidraw Diagram Plugin

**Feature**: 001-excalidraw-diagrams
**Date**: 2026-03-21

## R1: PNG Rendering Approach

### Decision: Three-package pipeline — `excalidraw-to-svg` + `@napi-rs/canvas` → `@resvg/resvg-js`

### Rationale

`@excalidraw/utils` provides `exportToSvg`, `exportToBlob`, `exportToCanvas`,
and `exportToClipboard` — but all require browser DOM APIs
(`HTMLCanvasElement`, `window.URL.createObjectURL`, etc.). An Excalidraw
maintainer confirmed in [GitHub issue #8747](https://github.com/excalidraw/excalidraw/issues/8747)
that server-side use is "not completely out-of-the-box."

The pipeline avoids browser automation entirely:

1. **`excalidraw-to-svg`** ^3.1.0 — handles jsdom setup internally, runs Excalidraw +
   React in Node.js to produce SVG.
2. **`@napi-rs/canvas`** ^0.1.97 — Rust-based canvas implementation (prebuilt binary,
   no system dependencies). Required because jsdom needs a `canvas` package for
   `HTMLCanvasElement.getContext()`. Aliased as `canvas` via a postinstall script.
3. **`@resvg/resvg-js`** ^2.6.2 — Rust-based SVG renderer with prebuilt napi-rs
   binaries. Fast, no native compilation.

> **Updated during testing** (see R5): Original plan used only two packages.
> Testing revealed `excalidraw-to-svg` v3 requires a canvas backend for jsdom.
> `@napi-rs/canvas` was added as the solution — see R5 for the full decision trail.

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
| `excalidraw-to-svg` | ^3.1.0 | Excalidraw JSON → SVG (bundles jsdom, @excalidraw/utils) | Heavy transitive deps |
| `@napi-rs/canvas` | ^0.1.97 | Canvas backend for jsdom (prebuilt Rust binary) | ~15MB platform binary |
| `@resvg/resvg-js` | ^2.6.2 | SVG → PNG (prebuilt Rust binary via napi-rs) | ~8MB platform binary |

### Font Handling

Excalidraw has both legacy and modern font families:
- **Legacy**: Virgil (deprecated), Helvetica, Cascadia (hidden)
- **Modern**: Excalifont (hand-drawn default, ID 5), Nunito (body text, ID 6), Lilita One (headings, ID 7), Comic Shanns (code, ID 8)

The styling configuration uses modern fonts by default. For accurate PNG
rendering, font files must be provided to resvg via the `fontFiles` option.
The render script should bundle or download these fonts. If fonts are
unavailable, text renders in system fallback fonts — functional but visually
different from the Excalidraw editor.

### Known Limitations

- `excalidraw-to-svg`'s jsdom-based rendering may have minor differences vs
  browser rendering
- Embedded images in diagrams require passing the `files` property from the
  Excalidraw JSON to the export function
- Transitive dependency tree is heavy (~react, jsdom, excalidraw) — mitigated
  by using npx/inline deps so nothing is globally installed

## R2: Excalidraw JSON Format

### Decision: Document format based on publicly available Excalidraw schema

### Rationale

The Excalidraw JSON format is stable and well-documented through the
excalidraw.com source code and developer docs. The plugin's reference material
will document the subset needed for diagram generation:

- **Element types**: rectangle, diamond, ellipse, arrow, line, text, frame, freedraw, image, iframe
- **Common properties**: id, type, x, y, width, height, strokeColor,
  backgroundColor, fillStyle, strokeWidth, roughness, opacity, groupIds
- **Arrow bindings**: startBinding/endBinding with elementId, focus, gap
- **Text labels**: boundElements on shapes, text element with containerId
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
`package.json` declares `excalidraw-to-svg`, `@resvg/resvg-js`, and
`@napi-rs/canvas` — npm handles transitive deps. A `postinstall` script
creates a `canvas` alias in `node_modules/` so that jsdom (used internally
by `excalidraw-to-svg`) can find a canvas implementation.

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
