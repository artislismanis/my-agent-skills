#!/usr/bin/env node
/**
 * validate.mjs — Excalidraw diagram validator
 *
 * Checks structural integrity and visual quality of a .excalidraw file.
 * Run before rendering to catch issues early.
 *
 * Usage:
 *   node validate.mjs <file.excalidraw> [--brand path/to/brand.json] [--json]
 *
 * Exit codes:
 *   0  — valid (no errors, warnings may be present)
 *   1  — validation errors found
 *   2  — bad input (file not found, invalid JSON, wrong format)
 *
 * Output:
 *   Human-readable by default. Pass --json for machine-readable JSON array.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));

// ─── CLI ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--help') {
  console.error([
    'Usage: node validate.mjs <file.excalidraw> [--brand path/to/brand.json] [--json]',
    '',
    'Exit: 0=valid, 1=errors found, 2=bad input',
  ].join('\n'));
  process.exit(args[0] === '--help' ? 0 : 2);
}

let filePath = null;
let brandPath = join(__dir, '../references/brand.json');
let jsonOutput = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--brand') {
    brandPath = args[++i];
  } else if (args[i] === '--json') {
    jsonOutput = true;
  } else if (!filePath) {
    filePath = resolve(args[i]);
  }
}

if (!filePath) {
  console.error('Error: file path is required');
  process.exit(2);
}

// ─── Load file ────────────────────────────────────────────────────────────────

if (!existsSync(filePath)) {
  console.error(`Error: file not found: ${filePath}`);
  process.exit(2);
}

let doc, brand;

try {
  doc = JSON.parse(readFileSync(filePath, 'utf8'));
} catch (e) {
  console.error(`Error: invalid JSON: ${e.message}`);
  process.exit(2);
}

if (doc.type !== 'excalidraw' || doc.version !== 2) {
  console.error('Error: not a valid Excalidraw v2 file (expected type:"excalidraw", version:2)');
  process.exit(2);
}

if (!Array.isArray(doc.elements)) {
  console.error('Error: missing or invalid elements array');
  process.exit(2);
}

try {
  brand = JSON.parse(readFileSync(brandPath, 'utf8'));
} catch {
  brand = null; // brand checks skipped if unavailable
}

// ─── Validators ───────────────────────────────────────────────────────────────

const diagnostics = []; // { severity: 'error'|'warning', code, message, elementId? }

function error(code, message, elementId) {
  diagnostics.push({ severity: 'error', code, message, ...(elementId ? { elementId } : {}) });
}
function warning(code, message, elementId) {
  diagnostics.push({ severity: 'warning', code, message, ...(elementId ? { elementId } : {}) });
}

const elements = doc.elements;
const byId = Object.fromEntries(elements.map(e => [e.id, e]));

/** STRUCTURAL CHECKS */

// S1: Unique IDs
const seenIds = new Set();
for (const el of elements) {
  if (!el.id) {
    error('S1', 'Element missing id field', undefined);
  } else if (seenIds.has(el.id)) {
    error('S1', `Duplicate id "${el.id}"`, el.id);
  } else {
    seenIds.add(el.id);
  }
}

// S2: Arrow binding references exist
for (const el of elements) {
  if (el.type !== 'arrow') continue;
  if (el.startBinding?.elementId && !byId[el.startBinding.elementId]) {
    error('S2', `Arrow "${el.id}" startBinding references unknown element "${el.startBinding.elementId}"`, el.id);
  }
  if (el.endBinding?.elementId && !byId[el.endBinding.elementId]) {
    error('S2', `Arrow "${el.id}" endBinding references unknown element "${el.endBinding.elementId}"`, el.id);
  }
}

// S3: Text containerId references exist + back-reference check
for (const el of elements) {
  if (el.type !== 'text') continue;
  if (!el.containerId) continue; // standalone text is fine

  const parent = byId[el.containerId];
  if (!parent) {
    error('S3', `Text "${el.id}" containerId "${el.containerId}" references unknown element`, el.id);
    continue;
  }
  // Check back-reference
  const backRef = (parent.boundElements ?? []).find(b => b.id === el.id);
  if (!backRef) {
    error('S3', `Text "${el.id}" is bound to "${el.containerId}" but not listed in its boundElements`, el.id);
  }
}

// S4: Arrow back-reference on connected shapes
for (const el of elements) {
  if (el.type !== 'arrow') continue;
  for (const binding of [el.startBinding, el.endBinding]) {
    if (!binding?.elementId) continue;
    const shape = byId[binding.elementId];
    if (!shape) continue;
    const ref = (shape.boundElements ?? []).find(b => b.id === el.id && b.type === 'arrow');
    if (!ref) {
      error('S4', `Arrow "${el.id}" connects to "${binding.elementId}" but that element's boundElements does not reference this arrow`, el.id);
    }
  }
}

// S5: frameId references exist
for (const el of elements) {
  if (!el.frameId) continue;
  if (!byId[el.frameId]) {
    error('S5', `Element "${el.id}" has frameId "${el.frameId}" which references unknown frame`, el.id);
  } else if (byId[el.frameId]?.type !== 'frame') {
    error('S5', `Element "${el.id}" has frameId "${el.frameId}" but that element is not a frame`, el.id);
  }
}

// S6: Points arrays have ≥2 entries
for (const el of elements) {
  if (el.type !== 'arrow' && el.type !== 'line') continue;
  if (!Array.isArray(el.points) || el.points.length < 2) {
    error('S6', `${el.type} "${el.id}" points array must have at least 2 entries`, el.id);
  }
}

/** VISUAL CHECKS */

// V1: No overlapping shapes (excluding frame-child containment)
const shapes = elements.filter(e =>
  ['rectangle', 'diamond', 'ellipse'].includes(e.type) &&
  typeof e.x === 'number' && typeof e.width === 'number'
);

for (let i = 0; i < shapes.length; i++) {
  for (let j = i + 1; j < shapes.length; j++) {
    const a = shapes[i], b = shapes[j];
    // Skip if they share a frameId (children of same frame can overlap by design in swim lanes)
    if (a.frameId && a.frameId === b.frameId) continue;
    // Skip if one is a frame child and the other is the frame
    if (a.frameId === b.id || b.frameId === a.id) continue;

    const ax2 = a.x + (a.width ?? 0);
    const ay2 = a.y + (a.height ?? 0);
    const bx2 = b.x + (b.width ?? 0);
    const by2 = b.y + (b.height ?? 0);

    const overlapX = a.x < bx2 && ax2 > b.x;
    const overlapY = a.y < by2 && ay2 > b.y;

    if (overlapX && overlapY) {
      warning('V1', `Elements "${a.id}" and "${b.id}" overlap`, a.id);
    }
  }
}

// V2: Text fits within parent shape bounds
for (const el of elements) {
  if (el.type !== 'text' || !el.containerId) continue;
  const parent = byId[el.containerId];
  if (!parent || parent.type === 'arrow') continue; // arrow labels can extend outside
  if (typeof parent.width !== 'number') continue;

  if ((el.width ?? 0) > parent.width * 1.05) { // 5% tolerance
    warning('V2', `Text "${el.id}" width (${el.width}px) exceeds parent "${parent.id}" width (${parent.width}px) — label may be clipped`, el.id);
  }
  if ((el.height ?? 0) > parent.height * 1.05) {
    warning('V2', `Text "${el.id}" height (${el.height}px) exceeds parent "${parent.id}" height (${parent.height}px) — label may be clipped`, el.id);
  }
}

// V3: Minimum spacing between shapes that are in the same row or column
// Only check pairs that are NOT overlapping (gapX or gapY > 0) AND
// are adjacent on the relevant axis (the OTHER axis overlaps), to avoid
// false positives between shapes in completely different regions.
if (brand) {
  const minGap = brand.layout?.minGap ?? 40;
  for (let i = 0; i < shapes.length; i++) {
    for (let j = i + 1; j < shapes.length; j++) {
      const a = shapes[i], b = shapes[j];
      if (a.frameId && a.frameId === b.frameId) continue;

      const ax2 = a.x + (a.width ?? 0);
      const ay2 = a.y + (a.height ?? 0);
      const bx2 = b.x + (b.width ?? 0);
      const by2 = b.y + (b.height ?? 0);

      const gapX = Math.max(a.x - bx2, b.x - ax2); // negative = horizontal overlap
      const gapY = Math.max(a.y - by2, b.y - ay2); // negative = vertical overlap

      // Only warn about horizontal proximity if the shapes also share vertical space
      if (gapX >= 0 && gapX < minGap && gapY < 0) {
        warning('V3', `Elements "${a.id}" and "${b.id}" are only ${Math.round(gapX)}px apart horizontally (minimum: ${minGap}px)`, a.id);
      }
      // Only warn about vertical proximity if the shapes also share horizontal space
      if (gapY >= 0 && gapY < minGap && gapX < 0) {
        warning('V3', `Elements "${a.id}" and "${b.id}" are only ${Math.round(gapY)}px apart vertically (minimum: ${minGap}px)`, a.id);
      }
    }
  }
}

// V4: Arrow label positions are reasonable (not clearly outside arrow extent)
for (const el of elements) {
  if (el.type !== 'text' || !el.containerId) continue;
  const parent = byId[el.containerId];
  if (!parent || parent.type !== 'arrow') continue;
  if (!Array.isArray(parent.points) || parent.points.length < 2) continue;

  const lastPt = parent.points[parent.points.length - 1];
  const arrEndX = parent.x + lastPt[0];
  const arrEndY = parent.y + lastPt[1];

  const lblCx = (el.x ?? 0) + (el.width ?? 0) / 2;
  const lblCy = (el.y ?? 0) + (el.height ?? 0) / 2;
  const midX = (parent.x + arrEndX) / 2;
  const midY = (parent.y + arrEndY) / 2;

  const distFromMid = Math.sqrt((lblCx - midX) ** 2 + (lblCy - midY) ** 2);
  const arrowLength = Math.sqrt((arrEndX - parent.x) ** 2 + (arrEndY - parent.y) ** 2);

  if (distFromMid > arrowLength * 0.6) {
    warning('V4', `Arrow label "${el.id}" appears to be far from the arrow midpoint — it may not render over the arrow`, el.id);
  }
}

// ─── Output ───────────────────────────────────────────────────────────────────

const errors = diagnostics.filter(d => d.severity === 'error');
const warnings = diagnostics.filter(d => d.severity === 'warning');

if (jsonOutput) {
  console.log(JSON.stringify(diagnostics, null, 2));
} else {
  if (diagnostics.length === 0) {
    console.log(`✓ Valid: ${elements.length} elements, no issues found`);
  } else {
    if (errors.length > 0) {
      console.log(`\nErrors (${errors.length}):`);
      for (const d of errors) {
        const loc = d.elementId ? ` [${d.elementId}]` : '';
        console.log(`  [${d.code}]${loc} ${d.message}`);
      }
    }
    if (warnings.length > 0) {
      console.log(`\nWarnings (${warnings.length}):`);
      for (const d of warnings) {
        const loc = d.elementId ? ` [${d.elementId}]` : '';
        console.log(`  [${d.code}]${loc} ${d.message}`);
      }
    }
    console.log(`\nSummary: ${errors.length} error(s), ${warnings.length} warning(s) in ${elements.length} elements`);
  }
}

process.exit(errors.length > 0 ? 1 : 0);
