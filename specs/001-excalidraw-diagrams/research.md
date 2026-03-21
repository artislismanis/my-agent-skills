# Research: Excalidraw Diagram Plugin

**Feature**: 001-excalidraw-diagrams
**Date**: 2026-03-21

## R1: PNG Rendering Approach

### Decision: Two-stage pipeline — `excalidraw-to-svg` → `@resvg/resvg-js`

### Rationale

`@excalidraw/utils` provides `exportToSvg`, `exportToBlob`, `exportToCanvas`,
and `exportToClipboard` — but all require browser DOM APIs
(`HTMLCanvasElement`, `window.URL.createObjectURL`, etc.). An Excalidraw
maintainer confirmed in [GitHub issue #8747](https://github.com/excalidraw/excalidraw/issues/8747)
that server-side use is "not completely out-of-the-box."

The two-stage pipeline avoids browser automation entirely:

1. **`excalidraw-to-svg`** — handles jsdom setup internally, runs Excalidraw +
   React in Node.js to produce SVG. No manual DOM polyfill needed.
2. **`@resvg/resvg-js`** — Rust-based SVG renderer with prebuilt napi-rs
   binaries. Fast, no native compilation, no canvas dependency.

### Alternatives Considered

| Approach | Rejected Because |
|----------|-----------------|
| `@excalidraw/utils` directly | Requires manual jsdom + node-canvas setup, fragile DOM globals |
| Puppeteer/Playwright | Spec explicitly prohibits browser automation |
| `node-canvas` + `exportToCanvas` | Native compilation dependency, harder to self-contain |
| `sharp` for SVG→PNG | Less accurate SVG rendering than resvg for complex paths |

### Dependencies

| Package | Purpose | Size Impact |
|---------|---------|-------------|
| `excalidraw-to-svg` | Excalidraw JSON → SVG (bundles jsdom, react, @excalidraw/excalidraw) | Heavy transitive deps |
| `@resvg/resvg-js` | SVG → PNG (prebuilt Rust binary via napi-rs) | ~8MB platform binary |

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
`package.json` declares only `excalidraw-to-svg` and `@resvg/resvg-js` —
npm handles transitive deps.

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
