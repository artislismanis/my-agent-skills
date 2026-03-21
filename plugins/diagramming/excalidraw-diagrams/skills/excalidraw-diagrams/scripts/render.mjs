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
import { JSDOM } from 'jsdom';
import * as napiCanvas from '@napi-rs/canvas';
import { GlobalFonts } from '@napi-rs/canvas';
import { readdirSync } from 'fs';

// ---------------------------------------------------------------------------
// Register Excalidraw bundled fonts with @napi-rs/canvas
// ---------------------------------------------------------------------------

const scriptDir = dirname(fileURLToPath(import.meta.url));
const fontsDir = resolve(scriptDir, 'node_modules/@excalidraw/utils/dist/prod/assets');

// Map font filenames to the family names Excalidraw uses internally
const fontMap = {
  'Nunito ExtraLight Medium.ttf': 'Nunito',
  'Excalifont.ttf': 'Excalifont',
  'Virgil.ttf': 'Virgil',
  'Comic Shanns Regular.ttf': 'Comic Shanns',
  'Liberation Sans.ttf': 'Liberation Sans',
  'Lilita One.ttf': 'Lilita One',
  'Cascadia Code.ttf': 'Cascadia',
};
try {
  for (const [file, family] of Object.entries(fontMap)) {
    GlobalFonts.registerFromPath(resolve(fontsDir, file), family);
  }
} catch {
  // Fonts directory missing — fall back to system fonts
}

// ---------------------------------------------------------------------------
// Browser environment polyfills — @excalidraw/utils requires DOM + Canvas APIs
// ---------------------------------------------------------------------------

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  pretendToBeVisual: true,
  url: 'http://localhost',
});

global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, 'navigator', {
  value: dom.window.navigator, writable: true, configurable: true,
});
global.HTMLElement = dom.window.HTMLElement;
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
global.HTMLImageElement = dom.window.HTMLImageElement;
global.Image = dom.window.Image;
global.DOMParser = dom.window.DOMParser;
global.XMLSerializer = dom.window.XMLSerializer;
global.Element = dom.window.Element;
global.SVGElement = dom.window.SVGElement;
global.Node = dom.window.Node;
global.NodeList = dom.window.NodeList;
global.Blob = dom.window.Blob;
global.URL = dom.window.URL;
Object.defineProperty(global, 'crypto', {
  value: globalThis.crypto, writable: true, configurable: true,
});
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.devicePixelRatio = 1;

// FontFace polyfill (CSS Font Loading API — not available in jsdom)
class FontFace {
  constructor(family, source, descriptors = {}) {
    this.family = family;
    this.source = source;
    this.style = descriptors.style || 'normal';
    this.weight = descriptors.weight || 'normal';
    this.status = 'loaded';
    this.loaded = Promise.resolve(this);
  }
  async load() { return this; }
}
global.FontFace = FontFace;

if (!document.fonts) {
  const fontSet = new Set();
  fontSet.ready = Promise.resolve();
  fontSet.check = () => true;
  fontSet.load = async () => [];
  Object.defineProperty(document, 'fonts', {
    value: fontSet, writable: true, configurable: true,
  });
}

// Route canvas creation through @napi-rs/canvas for real rendering
const origCreateElement = document.createElement.bind(document);
document.createElement = function(tagName, options) {
  if (tagName.toLowerCase() === 'canvas') {
    const canvas = napiCanvas.createCanvas(300, 150);
    canvas.style = {};
    canvas.setAttribute = () => {};
    canvas.getAttribute = () => null;
    return canvas;
  }
  return origCreateElement(tagName, options);
};

// Dynamic import after polyfills are in place
const { exportToCanvas } = await import('@excalidraw/utils');

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
    if (width > 8192) {
      console.error('Error: --width must not exceed 8192');
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
// Render: Excalidraw JSON → PNG via @excalidraw/utils
// ---------------------------------------------------------------------------

const bgColor = doc.appState?.viewBackgroundColor ?? '#ffffff';
if (!/^#[0-9a-fA-F]{3,8}$|^[a-zA-Z]+$/.test(bgColor)) {
  console.error('Error: invalid viewBackgroundColor value');
  process.exit(1);
}

if (doc.elements.length === 0) {
  // Empty elements — render a blank canvas
  const blankHeight = Math.round(width * 0.5625);
  const canvas = napiCanvas.createCanvas(width, blankHeight);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, blankHeight);
  const pngBuffer = canvas.toBuffer('image/png');
  writeFileSync(outputPath, pngBuffer);
  console.log(`Rendered: ${width}x${blankHeight} → ${outputPath}`);
  process.exit(0);
}

// Suppress non-fatal font warnings from @excalidraw/utils
const origConsoleWarn = console.warn;
console.warn = (...args) => {
  const msg = args[0];
  if (typeof msg === 'string' && msg.includes("Couldn't transform font-face")) return;
  origConsoleWarn.apply(console, args);
};

try {
  const canvas = await exportToCanvas({
    elements: doc.elements,
    appState: {
      exportBackground: true,
      viewBackgroundColor: bgColor,
      exportWithDarkMode: false,
    },
    files: doc.files || {},
    maxWidthOrHeight: width,
  });

  const renderWidth = canvas.width;
  const renderHeight = canvas.height;
  const pngBuffer = canvas.toBuffer('image/png');

  writeFileSync(outputPath, pngBuffer);
  console.log(`Rendered: ${renderWidth}x${renderHeight} → ${outputPath}`);
} catch (err) {
  console.error(`Error: PNG render failed: ${err.message}`);
  process.exit(1);
} finally {
  console.warn = origConsoleWarn;
}
