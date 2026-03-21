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
import { Resvg } from '@resvg/resvg-js';
import { exportToSvg } from 'excalidraw-to-svg';

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log('Usage: node render.mjs <input-path> [output-path] [--width <pixels>]');
  process.exit(args.length === 0 ? 1 : 0);
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
    i++;
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
// Render: Excalidraw JSON → SVG → PNG
// ---------------------------------------------------------------------------

const bgColor = doc.appState?.viewBackgroundColor ?? '#ffffff';
let svgString;

if (doc.elements.length === 0) {
  // Empty elements array — render a blank canvas (matches Excalidraw behaviour)
  const blankHeight = Math.round(width * 0.5625);
  svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${blankHeight}"><rect width="${width}" height="${blankHeight}" fill="${bgColor}"/></svg>`;
} else {
  // Stage 1: Excalidraw JSON → SVG via excalidraw-to-svg
  let svgElement;
  try {
    svgElement = await exportToSvg({
      elements: doc.elements,
      appState: {
        ...(doc.appState ?? {}),
        exportWithDarkMode: false,
        viewBackgroundColor: bgColor,
      },
      files: doc.files ?? {},
    });
  } catch (err) {
    console.error(`Error: SVG export failed: ${err.message}`);
    process.exit(1);
  }

  svgString = svgElement.outerHTML;
}

// Stage 2: SVG → PNG via @resvg/resvg-js
try {
  const resvg = new Resvg(svgString, {
    fitTo: { mode: 'width', value: width },
    font: { loadSystemFonts: true },
  });

  const rendered = resvg.render();
  const renderWidth = rendered.width;
  const renderHeight = rendered.height;
  const pngBuffer = rendered.asPng();

  writeFileSync(outputPath, pngBuffer);
  console.log(`Rendered: ${renderWidth}x${renderHeight} → ${outputPath}`);
} catch (err) {
  console.error(`Error: PNG render failed: ${err.message}`);
  process.exit(1);
}
