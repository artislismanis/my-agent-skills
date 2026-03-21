#!/usr/bin/env node
/**
 * render.mjs — Convert Excalidraw JSON to PNG
 *
 * Usage:
 *   node render.mjs <input-path> [output-path] [--width <pixels>]
 *
 * Prerequisites:
 *   Node.js 22+
 *   npm install  (run once in this directory)
 *
 * Exit codes:
 *   0 — success, PNG written to output path
 *   1 — error (invalid input, missing file, render failure)
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.error('Usage: node render.mjs <input-path> [output-path] [--width <pixels>]');
  process.exit(1);
}

let inputPath = null;
let outputPath = null;
let width = 1200;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--width' && args[i + 1]) {
    width = parseInt(args[i + 1], 10);
    if (isNaN(width) || width <= 0) {
      console.error('Error: --width must be a positive integer');
      process.exit(1);
    }
    i++; // skip value
  } else if (!inputPath) {
    inputPath = resolve(args[i]);
  } else if (!outputPath) {
    outputPath = resolve(args[i]);
  }
}

if (!inputPath) {
  console.error('Error: input path is required');
  process.exit(1);
}

// Default output path: same directory, same name, .png extension
if (!outputPath) {
  const dir = dirname(inputPath);
  const name = basename(inputPath, extname(inputPath));
  outputPath = resolve(dir, `${name}.png`);
}

// ---------------------------------------------------------------------------
// Load and validate input
// ---------------------------------------------------------------------------

let raw;
try {
  raw = readFileSync(inputPath, 'utf8');
} catch (err) {
  console.error(`Error: cannot read file "${inputPath}": ${err.message}`);
  process.exit(1);
}

let doc;
try {
  doc = JSON.parse(raw);
} catch (err) {
  console.error(`Error: invalid JSON in "${inputPath}": ${err.message}`);
  process.exit(1);
}

if (doc.type !== 'excalidraw') {
  console.error('Error: input is not an Excalidraw document (missing type: "excalidraw")');
  process.exit(1);
}

if (doc.version !== 2) {
  console.error(`Error: unsupported Excalidraw schema version ${doc.version} (expected 2)`);
  process.exit(1);
}

if (!Array.isArray(doc.elements)) {
  console.error('Error: document is missing an "elements" array');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Handle empty elements — render a blank PNG matching Excalidraw behaviour
// ---------------------------------------------------------------------------

const BLANK_CANVAS_WIDTH = width;
const BLANK_CANVAS_HEIGHT = Math.round(width * 0.5625); // 16:9 default

if (doc.elements.length === 0) {
  const bgColor = doc.appState?.viewBackgroundColor ?? '#ffffff';

  // Use @resvg/resvg-js directly to render a blank SVG
  const { Resvg } = await import('@resvg/resvg-js');
  const blankSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${BLANK_CANVAS_WIDTH}" height="${BLANK_CANVAS_HEIGHT}"><rect width="${BLANK_CANVAS_WIDTH}" height="${BLANK_CANVAS_HEIGHT}" fill="${bgColor}"/></svg>`;
  const resvg = new Resvg(blankSvg, { fitTo: { mode: 'width', value: BLANK_CANVAS_WIDTH } });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  writeFileSync(outputPath, pngBuffer);
  console.log(`Rendered: ${BLANK_CANVAS_WIDTH}x${BLANK_CANVAS_HEIGHT} → ${outputPath}`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Two-stage pipeline: Excalidraw JSON → SVG → PNG
// ---------------------------------------------------------------------------

// Stage 1: Excalidraw JSON → SVG via excalidraw-to-svg
let svgElement;
try {
  const { exportToSvg } = await import('excalidraw-to-svg');

  svgElement = await exportToSvg({
    elements: doc.elements,
    appState: {
      exportWithDarkMode: false,
      viewBackgroundColor: doc.appState?.viewBackgroundColor ?? '#ffffff',
      ...(doc.appState ?? {}),
    },
    files: doc.files ?? {},
  });
} catch (err) {
  console.error(`Error: SVG export failed: ${err.message}`);
  process.exit(1);
}

// Serialise SVG element to string
let svgString;
try {
  // excalidraw-to-svg returns a DOM SVGSVGElement via jsdom
  svgString = svgElement.outerHTML ?? new XMLSerializer().serializeToString(svgElement);
} catch (err) {
  console.error(`Error: could not serialise SVG: ${err.message}`);
  process.exit(1);
}

// Stage 2: SVG → PNG via @resvg/resvg-js
let pngBuffer;
try {
  const { Resvg } = await import('@resvg/resvg-js');

  const resvg = new Resvg(svgString, {
    fitTo: { mode: 'width', value: width },
    // Font fallback: use system fonts if Excalidraw custom fonts are unavailable
    font: {
      loadSystemFonts: true,
    },
  });

  const rendered = resvg.render();
  const renderWidth = rendered.width;
  const renderHeight = rendered.height;
  pngBuffer = rendered.asPng();

  writeFileSync(outputPath, pngBuffer);
  console.log(`Rendered: ${renderWidth}x${renderHeight} → ${outputPath}`);
} catch (err) {
  console.error(`Error: PNG render failed: ${err.message}`);
  process.exit(1);
}
