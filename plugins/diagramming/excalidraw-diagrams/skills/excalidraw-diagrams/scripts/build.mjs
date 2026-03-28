#!/usr/bin/env node
/**
 * build.mjs — Excalidraw diagram builder
 *
 * Converts a high-level semantic diagram description into a valid .excalidraw file.
 * Handles layout, bindings, text positioning, and brand styling automatically.
 *
 * Usage:
 *   node build.mjs <input.json> [output.excalidraw] [--brand path/to/brand.json]
 *
 * Input format (input.json):
 * {
 *   "diagramType": "flowchart",          // flowchart | c4 | bpmn | data-flow | cloud | general
 *   "direction": "top-to-bottom",        // top-to-bottom | left-to-right
 *   "elements": [
 *     { "id": "start", "shape": "rounded-rect", "role": "terminal", "label": "Start", "size": [160, 60] },
 *     { "id": "p1",    "shape": "rect",          "role": "internal", "label": "Process Data" },
 *     { "id": "d1",    "shape": "diamond",        "role": "decision", "label": "Valid?" }
 *   ],
 *   "connections": [
 *     { "from": "start", "to": "p1" },
 *     { "from": "p1",    "to": "d1", "label": "Check" },
 *     { "from": "d1",    "to": "p2", "label": "Yes", "direction": "down" },
 *     { "from": "d1",    "to": "err","label": "No",  "direction": "right" }
 *   ],
 *   "frames": [
 *     { "id": "f1", "name": "Validation", "contains": ["start", "p1", "d1"] }
 *   ]
 * }
 *
 * Supported shapes: rect, rounded-rect, diamond, ellipse, frame
 * Supported roles:  internal, external, infrastructure, dataStore, decision,
 *                   terminal, terminal-start, terminal-end, error, frame
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));

// ─── CLI ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--help') {
  console.error([
    'Usage: node build.mjs <input.json> [output.excalidraw] [--brand path/to/brand.json]',
    '',
    'Converts a high-level diagram description to a valid .excalidraw file.',
    'See script header for input format documentation.',
  ].join('\n'));
  process.exit(args[0] === '--help' ? 0 : 1);
}

let inputPath = null;
let outputPath = null;
let brandPath = join(__dir, '../references/brand.json');

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--brand') {
    brandPath = args[++i];
  } else if (!inputPath) {
    inputPath = resolve(args[i]);
  } else if (!outputPath) {
    outputPath = resolve(args[i]);
  }
}

if (!inputPath) {
  console.error('Error: input file is required');
  process.exit(1);
}

if (!existsSync(inputPath)) {
  console.error(`Error: input file not found: ${inputPath}`);
  process.exit(1);
}

// ─── Load inputs ──────────────────────────────────────────────────────────────

let input, brand;

try {
  input = JSON.parse(readFileSync(inputPath, 'utf8'));
} catch (e) {
  console.error(`Error: could not parse input JSON: ${e.message}`);
  process.exit(1);
}

try {
  brand = JSON.parse(readFileSync(brandPath, 'utf8'));
} catch (e) {
  console.error(`Error: could not load brand config from ${brandPath}: ${e.message}`);
  process.exit(1);
}

// ─── Validate input ───────────────────────────────────────────────────────────

const errors = [];
if (!Array.isArray(input.elements) || input.elements.length === 0) {
  errors.push('input.elements must be a non-empty array');
}
if (!Array.isArray(input.connections)) {
  errors.push('input.connections must be an array');
}
if (errors.length > 0) {
  console.error('Validation errors:\n' + errors.map(e => `  - ${e}`).join('\n'));
  process.exit(1);
}

// ─── Brand helpers ────────────────────────────────────────────────────────────

const B = brand;

/** Resolve a color key to hex, supporting both key names and direct hex values */
function color(key) {
  if (key === 'transparent' || key === null) return 'transparent';
  if (key && key.startsWith('#')) return key;
  return B.colors[key] ?? B.colors[B.colorAssignment[key]] ?? key;
}

/** Normalise label text: convert literal \n (2 chars) to actual newline */
function normalizeText(text) {
  return text.replace(/\\n/g, '\n');
}

/** Estimate text width in pixels for given text and fontSize */
function estimateTextWidth(text, fontSize) {
  const longestLine = text.split('\n').reduce((a, b) => a.length > b.length ? a : b, '');
  const charWidth = B.text.charWidthBySize[String(fontSize)] ?? 9;
  return Math.ceil(longestLine.length * charWidth);
}

/** Count lines in a text string */
function countLines(text) {
  return text.split('\n').length;
}

/** Calculate text element height */
function textHeight(text, fontSize) {
  return countLines(text) * fontSize * B.text.lineHeight;
}

// ─── Role → styling ──────────────────────────────────────────────────────────

const ROLE_COLOR = {
  internal:       'backgroundBlue',
  external:       'backgroundGreen',
  infrastructure: 'backgroundGrey',
  dataStore:      'backgroundYellow',
  decision:       'backgroundYellow',
  terminal:       'backgroundGreen',
  'terminal-start': 'backgroundGreen',
  'terminal-end': 'backgroundGreen',
  error:          'backgroundRed',
  frame:          'transparent',
  default:        'backgroundBlue',
};

function roleToBackground(role) {
  return color(ROLE_COLOR[role] ?? ROLE_COLOR.default);
}

// ─── Shape → Excalidraw type + roundness ────────────────────────────────────

function shapeToExcalidraw(shape) {
  switch (shape) {
    case 'rounded-rect': return { type: 'rectangle', roundness: { type: 3 } };
    case 'rect':         return { type: 'rectangle', roundness: null };
    case 'diamond':      return { type: 'diamond',   roundness: null };
    case 'ellipse':      return { type: 'ellipse',   roundness: { type: 2 } };
    case 'frame':        return { type: 'frame',     roundness: null };
    default:             return { type: 'rectangle', roundness: null };
  }
}

// ─── Geometry helpers ─────────────────────────────────────────────────────────

/**
 * Find the point on a shape's bounding box edge in the direction of a target point.
 * Returns [x, y] at the edge.
 */
function getEdgePoint(pos, targetCx, targetCy) {
  const cx = pos.x + pos.w / 2;
  const cy = pos.y + pos.h / 2;
  const dx = targetCx - cx;
  const dy = targetCy - cy;
  if (dx === 0 && dy === 0) return [cx, cy];
  const hw = pos.w / 2;
  const hh = pos.h / 2;
  // Scale to reach the bounding box boundary
  const scaleX = dx !== 0 ? hw / Math.abs(dx) : Infinity;
  const scaleY = dy !== 0 ? hh / Math.abs(dy) : Infinity;
  const scale = Math.min(scaleX, scaleY);
  return [cx + dx * scale, cy + dy * scale];
}

/**
 * Convert an edge point back to a normalised fixedPoint [0..1, 0..1].
 */
function toFixedPoint(pos, edgePt) {
  return [
    Math.max(0, Math.min(1, (edgePt[0] - pos.x) / pos.w)),
    Math.max(0, Math.min(1, (edgePt[1] - pos.y) / pos.h)),
  ];
}

/**
 * Return the centre point on a named face of a shape, plus its elbowed-arrow fixedPoint.
 * Face offsets slightly beyond the edge so elbowed binding gaps render correctly.
 */
function getFacePoint(pos, face) {
  const cx = pos.x + pos.w / 2;
  const cy = pos.y + pos.h / 2;
  switch (face) {
    case 'top':    return { pt: [cx,          pos.y],          fp: [0.5,  -0.03] };
    case 'bottom': return { pt: [cx,          pos.y + pos.h],  fp: [0.5,   1.03] };
    case 'left':   return { pt: [pos.x,       cy],             fp: [-0.03, 0.5]  };
    case 'right':  return { pt: [pos.x + pos.w, cy],           fp: [1.03,  0.5]  };
    default:       return { pt: [cx, cy],                      fp: [0.5,   0.5]  };
  }
}

/**
 * Route an arrow between two shapes.
 * Returns start/end positions, fixedPoints, points array, and elbowed flag.
 *
 * Axis-aligned arrows (|relY| ≤ TOL in LR, |relX| ≤ TOL in TB) stay straight.
 * All other arrows get a 4-point elbowed path with one right-angle bend.
 *
 * Routing strategy:
 *   LR layout — primary axis horizontal: exit right, enter left, bend mid-X.
 *   TB layout — primary axis vertical:   exit bottom, enter top, bend mid-Y.
 *               Backward edges (target above): exit top, enter bottom, bend mid-Y.
 */
function routeArrow(fromPos, toPos) {
  const AXIS_TOL = 2; // px — treat as axis-aligned below this threshold

  const fromCx = fromPos.x + fromPos.w / 2;
  const fromCy = fromPos.y + fromPos.h / 2;
  const toCx   = toPos.x   + toPos.w   / 2;
  const toCy   = toPos.y   + toPos.h   / 2;
  const relX   = toCx - fromCx;
  const relY   = toCy - fromCy;

  if (isLR) {
    if (Math.abs(relY) <= AXIS_TOL) {
      // Pure horizontal — straight 2-point arrow, orbit mode
      const [startX, startY] = getEdgePoint(fromPos, toCx, toCy);
      const [endX,   endY  ] = getEdgePoint(toPos,   fromCx, fromCy);
      const startFP = toFixedPoint(fromPos, [startX, startY]);
      const endFP   = toFixedPoint(toPos,   [endX,   endY  ]);
      return { startX, startY, endX, endY, startFP, endFP,
               points: [[0, 0], [endX - startX, endY - startY]], elbowed: false };
    }
    // Non-aligned in LR: horizontal-first elbow
    const exitFace  = relX >= 0 ? 'right' : 'left';
    const entryFace = relX >= 0 ? 'left'  : 'right';
    const { pt: [startX, startY], fp: startFP } = getFacePoint(fromPos, exitFace);
    const { pt: [endX,   endY  ], fp: endFP   } = getFacePoint(toPos,   entryFace);
    const dx = endX - startX;
    const dy = endY - startY;
    const bendX = dx / 2;
    return { startX, startY, endX, endY, startFP, endFP,
             points: [[0, 0], [bendX, 0], [bendX, dy], [dx, dy]], elbowed: true };
  } else {
    if (Math.abs(relX) <= AXIS_TOL) {
      // Pure vertical — straight 2-point arrow, orbit mode
      const [startX, startY] = getEdgePoint(fromPos, toCx, toCy);
      const [endX,   endY  ] = getEdgePoint(toPos,   fromCx, fromCy);
      const startFP = toFixedPoint(fromPos, [startX, startY]);
      const endFP   = toFixedPoint(toPos,   [endX,   endY  ]);
      return { startX, startY, endX, endY, startFP, endFP,
               points: [[0, 0], [endX - startX, endY - startY]], elbowed: false };
    }
    // Non-aligned in TB: vertical-first elbow
    const exitFace  = relY >= 0 ? 'bottom' : 'top';
    const entryFace = relY >= 0 ? 'top'    : 'bottom';
    const { pt: [startX, startY], fp: startFP } = getFacePoint(fromPos, exitFace);
    const { pt: [endX,   endY  ], fp: endFP   } = getFacePoint(toPos,   entryFace);
    const dx = endX - startX;
    const dy = endY - startY;
    const bendY = dy / 2;
    return { startX, startY, endX, endY, startFP, endFP,
             points: [[0, 0], [0, bendY], [dx, bendY], [dx, dy]], elbowed: true };
  }
}

// ─── ID generation ───────────────────────────────────────────────────────────

const counters = {};
function nextId(prefix) {
  counters[prefix] = (counters[prefix] ?? 0) + 1;
  return `${prefix}${counters[prefix]}`;
}

// ─── Layout engine ───────────────────────────────────────────────────────────

const direction = input.direction ?? 'top-to-bottom';
const isLR = direction === 'left-to-right';
const layout = B.layout;

const DEFAULT_SIZE = layout.standardShape; // [160, 80]

/** Assign grid positions using a simple topological-sort-based approach */
function computeLayout(elements, connections) {
  // Build adjacency (id → [target ids])
  const outEdges = {};
  const inDegree = {};
  for (const el of elements) { outEdges[el.id] = []; inDegree[el.id] = 0; }
  for (const conn of connections) {
    if (outEdges[conn.from] !== undefined && inDegree[conn.to] !== undefined) {
      outEdges[conn.from].push(conn.to);
      inDegree[conn.to]++;
    }
  }

  // Kahn's topological sort → assign column/row depth
  const depth = {};
  const queue = Object.keys(inDegree).filter(id => inDegree[id] === 0);
  for (const id of queue) depth[id] = 0;

  while (queue.length) {
    const id = queue.shift();
    for (const next of (outEdges[id] ?? [])) {
      depth[next] = Math.max(depth[next] ?? 0, (depth[id] ?? 0) + 1);
      inDegree[next]--;
      if (inDegree[next] === 0) queue.push(next);
    }
  }
  // Fallback for any unvisited nodes (cycles)
  for (const el of elements) {
    if (depth[el.id] === undefined) depth[el.id] = 0;
  }

  // Group elements by depth, maintain insertion order within groups
  const byDepth = {};
  for (const el of elements) {
    const d = depth[el.id];
    (byDepth[d] = byDepth[d] ?? []).push(el.id);
  }

  // Assign pixel positions
  const positions = {};
  const [ox, oy] = layout.canvasOrigin;

  if (isLR) {
    // Left-to-right: depth = column, position within depth = row
    let x = ox;
    const depths = Object.keys(byDepth).sort((a, b) => a - b);
    for (const d of depths) {
      const ids = byDepth[d];
      const colWidth = Math.max(...ids.map(id => {
        const el = elements.find(e => e.id === id);
        return (el.size?.[0] ?? DEFAULT_SIZE[0]);
      }));
      let y = oy;
      for (const id of ids) {
        const el = elements.find(e => e.id === id);
        const [w, h] = el.size ?? DEFAULT_SIZE;
        positions[id] = { x, y, w, h };
        y += h + layout.verticalSpacing;
      }
      x += colWidth + layout.horizontalSpacing;
    }
  } else {
    // Top-to-bottom: depth = row, position within depth = column
    const depths = Object.keys(byDepth).sort((a, b) => a - b);

    // First pass: calculate row widths to find the maximum (used for centering)
    const rowWidths = depths.map(d => {
      const ids = byDepth[d];
      return ids.reduce((sum, id) => {
        const el = elements.find(e => e.id === id);
        return sum + (el.size?.[0] ?? DEFAULT_SIZE[0]);
      }, 0) + (ids.length - 1) * layout.horizontalSpacing;
    });
    const maxRowWidth = Math.max(...rowWidths);

    // Second pass: assign positions, centering each row relative to the widest row
    let y = oy;
    for (let di = 0; di < depths.length; di++) {
      const d = depths[di];
      const ids = byDepth[d];
      const rowHeight = Math.max(...ids.map(id => {
        const el = elements.find(e => e.id === id);
        return (el.size?.[1] ?? DEFAULT_SIZE[1]);
      }));
      const rowWidth = rowWidths[di];
      let x = ox + (maxRowWidth - rowWidth) / 2;
      for (const id of ids) {
        const el = elements.find(e => e.id === id);
        const [w, h] = el.size ?? DEFAULT_SIZE;
        positions[id] = { x, y, w, h };
        x += w + layout.horizontalSpacing;
      }
      y += rowHeight + layout.verticalSpacing;
    }
  }

  return positions;
}

// ─── Builder ─────────────────────────────────────────────────────────────────

function buildDocument(input, brand) {
  const excalidrawElements = [];
  const positions = computeLayout(input.elements, input.connections ?? []);

  // Map user element IDs to Excalidraw IDs
  const idMap = {};           // userElementId → excalidrawShapeId
  const shapeIdToEl = {};     // excalidrawShapeId → user element spec
  const boundElementsMap = {}; // excalidrawShapeId → [{id, type}]

  // Helper: register a bound element reference on a shape
  function addBoundRef(shapeExId, refId, refType) {
    (boundElementsMap[shapeExId] = boundElementsMap[shapeExId] ?? [])
      .push({ id: refId, type: refType });
  }

  const strokeBase = {
    strokeColor: brand.colors.stroke,
    strokeWidth: brand.stroke.strokeWidth,
    strokeStyle: brand.stroke.strokeStyle,
    roughness: brand.stroke.roughness,
    opacity: brand.stroke.opacity,
    angle: 0,
    groupIds: [],
    link: null,
    locked: false,
  };

  // ── Pass 1: Create shapes ──────────────────────────────────────────────────
  const shapeElements = [];
  const textElements = [];

  for (const el of input.elements) {
    if (el.shape === 'frame') continue; // handled in frames pass

    const pos = positions[el.id] ?? { x: 100, y: 100, w: DEFAULT_SIZE[0], h: DEFAULT_SIZE[1] };
    const exId = nextId('s');
    idMap[el.id] = exId;

    const { type: exType, roundness } = shapeToExcalidraw(el.shape ?? 'rect');
    const bg = roleToBackground(el.role ?? 'internal');
    const [w, h] = el.size ?? [pos.w, pos.h];

    const shape = {
      id: exId,
      type: exType,
      x: pos.x,
      y: pos.y,
      width: w,
      height: h,
      backgroundColor: bg,
      fillStyle: brand.fill.fillStyle,
      ...strokeBase,
      frameId: null,
      boundElements: [], // will be filled later
    };
    if (roundness !== null) shape.roundness = roundness;

    shapeElements.push({ exId, shape, el, pos: { x: pos.x, y: pos.y, w, h } });
    shapeIdToEl[exId] = el;

    // Create bound text label if element has a label
    if (el.label) {
      const txtId = nextId('t');
      const fontSize = brand.text.fontSize.elementLabel;
      const label = normalizeText(el.label);
      const th = textHeight(label, fontSize);
      const tx = pos.x;
      const ty = pos.y + (h - th) / 2;

      const textEl = {
        id: txtId,
        type: 'text',
        x: tx,
        y: ty,
        width: w,
        height: th,
        text: label,
        originalText: label,
        fontSize,
        fontFamily: brand.text.fontFamily,
        textAlign: 'center',
        verticalAlign: 'middle',
        lineHeight: brand.text.lineHeight,
        containerId: exId,
        autoResize: true,
        backgroundColor: 'transparent',
        fillStyle: 'solid',
        ...strokeBase,
        frameId: null,
        boundElements: [],
      };
      textElements.push(textEl);
      addBoundRef(exId, txtId, 'text');
    }
  }

  // ── Pass 2: Create frames ─────────────────────────────────────────────────
  const frameElements = [];
  const frameTextElements = [];

  for (const frame of (input.frames ?? [])) {
    const frameExId = nextId('fr');
    idMap[frame.id] = frameExId;

    // Calculate frame bounds from children
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const childId of frame.contains ?? []) {
      const childExId = idMap[childId];
      const childSpec = shapeElements.find(s => s.exId === childExId);
      if (childSpec) {
        minX = Math.min(minX, childSpec.pos.x);
        minY = Math.min(minY, childSpec.pos.y);
        maxX = Math.max(maxX, childSpec.pos.x + childSpec.pos.w);
        maxY = Math.max(maxY, childSpec.pos.y + childSpec.pos.h);
      }
    }
    const pad = layout.framePadding;
    const fx = isFinite(minX) ? minX - pad : 100;
    const fy = isFinite(minY) ? minY - pad : 100;
    const fw = isFinite(maxX) ? (maxX - minX) + pad * 2 : 300;
    const fh = isFinite(maxY) ? (maxY - minY) + pad * 2 : 200;

    const frameEl = {
      id: frameExId,
      type: 'frame',
      name: frame.name ?? '',
      x: fx,
      y: fy,
      width: fw,
      height: fh,
      backgroundColor: 'transparent',
      fillStyle: 'solid',
      ...strokeBase,
      frameId: null,
      boundElements: [],
    };
    frameElements.push(frameEl);

    // Assign frameId to children
    for (const childId of frame.contains ?? []) {
      const childExId = idMap[childId];
      const childShape = shapeElements.find(s => s.exId === childExId);
      if (childShape) childShape.shape.frameId = frameExId;
      // Also update any text bound to this shape
      const childEl = childShape?.el;
      if (childEl?.label) {
        const txtEl = textElements.find(t => t.containerId === childExId);
        if (txtEl) txtEl.frameId = frameExId;
      }
    }
  }

  // ── Pass 3: Create arrows ─────────────────────────────────────────────────
  const arrowElements = [];
  const arrowTextElements = [];

  // Minimum clearance between an arrow label and a frame border (px)
  const FRAME_LABEL_GAP = 8;

  for (const conn of (input.connections ?? [])) {
    const fromExId = idMap[conn.from];
    const toExId = idMap[conn.to];
    if (!fromExId || !toExId) continue;

    const fromSpec = shapeElements.find(s => s.exId === fromExId);
    const toSpec = shapeElements.find(s => s.exId === toExId);
    if (!fromSpec || !toSpec) continue;

    const arrId = nextId('a');
    const isDashed = conn.style === 'dashed';

    // Route the arrow — elbowed when shapes are not axis-aligned
    const route = routeArrow(fromSpec.pos, toSpec.pos);
    const { startX, startY, endX, endY, startFP, endFP, points, elbowed } = route;
    const dx = endX - startX;
    const dy = endY - startY;

    // Width/height = max absolute extent across all points
    const arrowW = Math.max(...points.map(p => Math.abs(p[0])), 1);
    const arrowH = Math.max(...points.map(p => Math.abs(p[1])), 1);

    const arrow = {
      id: arrId,
      type: 'arrow',
      x: startX,
      y: startY,
      width: arrowW,
      height: arrowH,
      points,
      startBinding: { mode: 'orbit', elementId: fromExId, fixedPoint: startFP },
      endBinding:   { mode: 'orbit', elementId: toExId,   fixedPoint: endFP },
      startArrowhead: conn.bidirectional ? 'arrow' : null,
      endArrowhead: brand.arrow.endArrowhead,
      elbowed,
      ...(elbowed ? { fixedSegments: null, startIsSpecial: null, endIsSpecial: null } : {}),
      backgroundColor: 'transparent',
      fillStyle: 'solid',
      strokeColor: brand.colors.stroke,
      strokeWidth: brand.stroke.strokeWidth,
      strokeStyle: isDashed ? 'dashed' : brand.stroke.strokeStyle,
      roughness: brand.stroke.roughness,
      opacity: brand.stroke.opacity,
      angle: 0,
      groupIds: [],
      frameId: null,
      link: null,
      locked: false,
      boundElements: [],
    };

    // Register back-references on both shapes
    addBoundRef(fromExId, arrId, 'arrow');
    addBoundRef(toExId, arrId, 'arrow');
    arrowElements.push(arrow);

    // Arrow label
    if (conn.label) {
      const lblId = nextId('al');
      const fontSize = brand.text.fontSize.arrowLabel;
      const label = normalizeText(conn.label);
      const tw = estimateTextWidth(label, fontSize);
      const th = textHeight(label, fontSize);

      // Start at geometric midpoint of the straight-line segment
      let midX = startX + dx / 2 - tw / 2;
      let midY = startY + dy / 2 - th / 2;

      // Shift label so it doesn't straddle any frame border
      for (const fr of frameElements) {
        const frRight  = fr.x + fr.width;
        const frBottom = fr.y + fr.height;
        const lblRight  = midX + tw;
        const lblBottom = midY + th;

        // Left border
        if (midX < fr.x && lblRight > fr.x) {
          midX = fr.x - FRAME_LABEL_GAP - tw;
        }
        // Right border
        if (midX < frRight && lblRight > frRight) {
          midX = frRight + FRAME_LABEL_GAP;
        }
        // Top border
        if (midY < fr.y && lblBottom > fr.y) {
          midY = fr.y - FRAME_LABEL_GAP - th;
        }
        // Bottom border
        if (midY < frBottom && lblBottom > frBottom) {
          midY = frBottom + FRAME_LABEL_GAP;
        }
      }

      const lblEl = {
        id: lblId,
        type: 'text',
        x: midX,
        y: midY,
        width: tw,
        height: th,
        text: label,
        originalText: label,
        fontSize,
        fontFamily: brand.text.fontFamily,
        textAlign: 'center',
        verticalAlign: 'middle',
        lineHeight: brand.text.lineHeight,
        containerId: arrId,
        autoResize: true,
        backgroundColor: 'transparent',
        fillStyle: 'solid',
        strokeColor: brand.colors.stroke,
        strokeWidth: brand.stroke.strokeWidth,
        strokeStyle: brand.stroke.strokeStyle,
        roughness: brand.stroke.roughness,
        opacity: brand.stroke.opacity,
        angle: 0,
        groupIds: [],
        frameId: null,
        link: null,
        locked: false,
        boundElements: [],
      };
      arrowTextElements.push(lblEl);
      addBoundRef(arrId, lblId, 'text');
    }
  }

  // ── Pass 4: Apply bound element maps back to shapes and arrows ───────────
  for (const { exId, shape } of shapeElements) {
    shape.boundElements = boundElementsMap[exId] ?? [];
  }
  for (const arrow of arrowElements) {
    arrow.boundElements = boundElementsMap[arrow.id] ?? [];
  }

  // ── Pass 5: Z-order assembly ───────────────────────────────────────────────
  // Order: frame children → frame → shape → shape text → arrow → arrow text
  for (const shape of shapeElements)     excalidrawElements.push(shape.shape);
  for (const text  of textElements)      excalidrawElements.push(text);
  for (const frame of frameElements)     excalidrawElements.push(frame);
  for (const text  of frameTextElements) excalidrawElements.push(text);
  for (const arrow of arrowElements)     excalidrawElements.push(arrow);
  for (const text  of arrowTextElements) excalidrawElements.push(text);

  return {
    type: 'excalidraw',
    version: 2,
    source: 'https://excalidraw.com',
    elements: excalidrawElements,
    appState: {
      viewBackgroundColor: brand.appState.viewBackgroundColor,
      gridSize: brand.appState.gridSize,
      theme: brand.appState.theme,
    },
    files: {},
  };
}

// ─── Run and write output ─────────────────────────────────────────────────────

const doc = buildDocument(input, brand);

if (!outputPath) {
  outputPath = inputPath.replace(/\.json$/, '.excalidraw');
  if (outputPath === inputPath) outputPath = inputPath + '.excalidraw';
}

try {
  writeFileSync(outputPath, JSON.stringify(doc, null, 2));
  console.log(`Built: ${doc.elements.length} elements → ${outputPath}`);
} catch (e) {
  console.error(`Error writing output: ${e.message}`);
  process.exit(1);
}
