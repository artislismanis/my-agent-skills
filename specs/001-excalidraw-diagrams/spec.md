# Feature Specification: Excalidraw Diagram Plugin

**Feature Branch**: `001-excalidraw-diagrams`
**Created**: 2026-03-21
**Status**: Draft
**Input**: User description: "Create an Excalidraw diagram plugin for the marketplace that enables Claude to generate professional, consistently styled Excalidraw diagrams and validate them visually."

## User Scenarios & Testing

### User Story 1 - Generate a Styled Diagram from a Description (Priority: P1)

A user asks Claude to create a diagram (e.g., "draw a C4 context diagram for my
e-commerce system"). Claude generates valid Excalidraw JSON using the plugin's
format reference and styling configuration, producing a diagram with consistent
colours, fonts, and layout that looks professional without manual adjustments.

**Why this priority**: This is the core value proposition — without diagram
generation with consistent styling, no other capability matters. A user must be
able to go from a natural-language description to a well-styled Excalidraw
diagram in a single interaction.

**Independent Test**: Can be fully tested by providing a diagram description and
verifying that the output is valid Excalidraw JSON with correct element types,
proper bindings, and styling that matches the plugin's defined palette and
defaults.

**Acceptance Scenarios**:

1. **Given** a user requests a C4 context diagram, **When** Claude generates the
   diagram using the plugin's reference and styling, **Then** the output is valid
   Excalidraw JSON containing rectangles for systems, labelled arrows for
   relationships, and colours/fonts matching the defined palette.
2. **Given** a user requests a flowchart, **When** Claude generates the diagram,
   **Then** the output uses diamonds for decisions, rectangles for processes,
   arrows with labels for flow, and all elements use consistent stroke width,
   roughness, and colour scheme.
3. **Given** a user requests a diagram type not covered by a specific template,
   **When** Claude generates the diagram, **Then** the output still applies the
   default styling configuration (palette, fonts, stroke settings) for a
   professional appearance.

---

### User Story 2 - Validate Diagram Visually via PNG Render (Priority: P2)

After generating an Excalidraw diagram, the user wants to see what it looks like
without opening a separate tool. Claude runs the plugin's render script to
convert the Excalidraw JSON to a PNG image, allowing the user to visually
inspect the diagram and request adjustments.

**Why this priority**: Visual validation closes the feedback loop — users can
confirm the diagram matches their intent and iterate. However, it depends on
having a valid diagram first (P1), and many users may also validate by pasting
JSON into excalidraw.com.

**Independent Test**: Can be tested by providing any valid Excalidraw JSON file
to the render script and verifying it produces a readable PNG image with correct
element rendering.

**Acceptance Scenarios**:

1. **Given** a valid Excalidraw JSON file, **When** the render script is
   executed, **Then** a PNG image is produced that accurately represents the
   diagram elements, labels, and connections.
2. **Given** an Excalidraw JSON file with styled elements (colours, fonts),
   **When** the render script is executed, **Then** the PNG preserves the
   styling faithfully (correct colours, readable text, proper stroke rendering).
3. **Given** the render script is run on a machine without prior setup, **When**
   the script executes, **Then** it self-installs any required dependencies
   inline (no global installs, no manual setup steps required).

---

### User Story 3 - Use Diagram Templates for Specific Artifact Types (Priority: P2)

A user asks for a specific type of diagram (e.g., "create a BPMN diagram" or
"draw a cloud architecture diagram for AWS"). Claude uses the plugin's
diagram-type-specific template to apply the correct element conventions, layout
patterns, and visual language for that artifact type.

**Why this priority**: Templates elevate quality from "generic boxes and arrows"
to diagrams that follow established visual conventions for each type. This is
at the same priority as PNG rendering because both enhance quality but neither
is required for basic diagram generation.

**Independent Test**: Can be tested by requesting each supported diagram type
and verifying the output follows the conventions defined in that type's template
(correct shapes, labelling patterns, grouping, and layout approach).

**Acceptance Scenarios**:

1. **Given** a user requests a C4 Container diagram, **When** Claude uses the
   C4 template, **Then** the output uses the correct C4 visual language
   (labelled boxes with technology annotations, boundary groupings, directional
   arrows with protocol labels).
2. **Given** a user requests an AWS architecture diagram, **When** Claude uses
   the cloud architecture template, **Then** the output organises elements by
   service category, uses consistent iconography conventions, and groups
   elements by VPC/subnet boundaries where appropriate.
3. **Given** a user requests a BPMN diagram, **When** Claude uses the BPMN
   template, **Then** the output uses standard BPMN shapes (circles for events,
   rounded rectangles for tasks, diamonds for gateways, swim lanes for roles).

---

### User Story 4 - Iterate and Refine Diagrams (Priority: P3)

A user reviews the generated diagram (either via PNG or by pasting JSON into
excalidraw.com) and requests changes — adding elements, repositioning nodes,
changing labels, or adjusting connections. Claude modifies the existing
Excalidraw JSON while preserving styling consistency.

**Why this priority**: Iteration is essential for real-world use but depends on
all prior stories. The plugin's reference material enables Claude to make
targeted modifications without breaking the diagram structure.

**Independent Test**: Can be tested by generating a diagram, then requesting a
specific modification, and verifying the modified JSON retains all unchanged
elements while correctly applying the requested change.

**Acceptance Scenarios**:

1. **Given** an existing diagram JSON, **When** a user requests adding a new
   component, **Then** the new element is added with consistent styling and
   proper connections, and all existing elements remain unchanged.
2. **Given** an existing diagram JSON, **When** a user requests repositioning
   elements, **Then** the coordinates are updated and any connected arrows
   adjust their binding points accordingly.

---

### Edge Cases

- What happens when the Excalidraw JSON contains unknown or malformed element
  types? The plugin reference should clearly document supported element types
  so Claude avoids generating invalid structures.
- How does the render script handle very large diagrams (50+ elements)?
  The script should produce a readable PNG regardless of diagram complexity,
  scaling the canvas as needed.
- What happens when arrow bindings reference non-existent element IDs?
  The reference material should document binding requirements so Claude
  generates consistent, valid bindings.
- How does the system handle diagram requests for unsupported types?
  Claude should fall back to general-purpose styling and may request additional
  clarifications where needed.
- What happens when text exceeds shape boundaries? Text outside shapes MUST be
  shown in full. Text inside shapes MAY be truncated, but Claude MUST flag the
  truncation and ask the user for a decision.
- How should overlapping elements be handled? Overlapping SHOULD generally be
  avoided unless the diagram template specifically defines overlap cases (e.g.,
  nested boundaries). The PNG preview enables iterating on spacing and placement.
- What happens when the render script receives an empty elements array?
  It MUST render a blank PNG (matching Excalidraw's own behaviour for an empty
  canvas) rather than returning an error.

## Requirements

### Functional Requirements

- **FR-001**: The plugin MUST include an Excalidraw JSON format reference
  targeting schema version 2 and covering all supported element types
  (rectangle, diamond, ellipse, arrow, text, line, frame, freedraw, image,
  iframe), their properties, arrow bindings, text labels, grouping, and frames.
- **FR-002**: The plugin MUST include a styling configuration (the "brand")
  defining colour palettes, font choices, stroke styles, and roughness settings
  that produce a consistent professional appearance. All default styling values
  MUST be centralised in the styling configuration and referenced by templates.
- **FR-003**: The plugin MUST include diagram templates for at least five
  artifact types: C4 diagrams (Context, Container, Component), data flow
  diagrams, cloud architecture (AWS/GCP/Azure), flowcharts/decision trees, and
  BPMN business process diagrams.
- **FR-004**: The plugin MUST include a self-contained render script that
  converts Excalidraw JSON to PNG without requiring external tools, MCP servers,
  or browser automation.
- **FR-005**: The render script MUST declare all dependencies in a local
  package.json with minimal external packages. It MUST require no manual setup
  beyond Node.js 22+ and a one-time `npm install` in the scripts/ directory.
  Self-contained means: no global installs, no MCP servers, no browser
  automation, and minimal dependency chains.
- **FR-006**: The styling configuration MUST be applied as defaults so that
  diagrams look professional without requiring the user to specify styling
  details.
- **FR-007**: Each diagram template MUST define the specification for its
  diagram type, including which shapes represent which concepts, how connections
  are used, labelling conventions, and layout approach — according to the
  relevant standard (e.g., C4 model, BPMN 2.0).
- **FR-008**: The format reference MUST document arrow binding mechanics
  (startBinding, endBinding) so that connected elements maintain their
  relationships.
- **FR-009**: The plugin MUST conform to the marketplace plugin package standard
  (`.claude-plugin/plugin.json`, `SKILL.md` with frontmatter, folder-based
  structure).
- **FR-010**: The plugin MUST be installable via the Claude plugin mechanism
  without any additional setup steps beyond installation. The render script
  requires a one-time `npm install` in its scripts/ directory.
- **FR-011**: Claude MUST save generated diagrams as `.excalidraw` files and
  render a PNG preview for visual validation.
- **FR-012**: Claude MUST ask clarifying questions during the design session to
  understand the diagram's intent, content, and structure before generating
  the final output. The interaction should be collaborative, not single-shot.

### Key Entities

- **Excalidraw Document**: A JSON structure containing an array of elements and
  optional appState. Represents a complete diagram.
- **Element**: An individual shape, line, arrow, or text item within a diagram.
  Has type, position, dimensions, styling properties, and optional bindings.
- **Diagram Template**: A predefined set of conventions for a specific artifact
  type, defining which elements to use, how to label them, and how to lay them
  out.
- **Styling Configuration**: A set of defaults (colours, fonts, strokes) applied
  to all generated diagrams for visual consistency.
- **Render Script**: A self-contained Node script that reads Excalidraw JSON and
  outputs a PNG image.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A user can describe a diagram in natural language and, after a
  collaborative clarification exchange, receive a valid, styled Excalidraw JSON
  file without specifying any styling details.
- **SC-002**: All generated diagrams use styling consistent with the brand
  defined in the styling configuration (colour palette, font family, stroke
  style) across element types and diagram types.
- **SC-003**: The render script converts any valid plugin-generated Excalidraw
  JSON to a readable PNG in under 30 seconds on a standard development machine.
- **SC-004**: Each of the five supported diagram types produces output that
  follows the established visual conventions for that artifact type (correct
  shapes, labelling, and grouping).
- **SC-005**: The plugin can be installed and used immediately with no manual
  dependency installation, configuration files, or environment setup beyond
  having Node.js available.
- **SC-006**: A user can iterate on a generated diagram (add, remove, or modify
  elements) across multiple interactions while maintaining consistency with the
  brand defined in the styling configuration.

## Assumptions

- Node.js 22+ is available on the user's machine for PNG rendering.
- Users are familiar with Excalidraw as a diagramming tool and may paste
  generated JSON into excalidraw.com for editing.
- The Excalidraw JSON format follows the publicly documented schema version 2
  used by excalidraw.com.
- Claude has sufficient context window to include the format reference and
  a diagram template alongside the user's request.
- The plugin's styling is opinionated by design — users who want different
  styling can modify the generated JSON or the plugin's configuration.
  User-specified style overrides blend with defaults (keep defaults, override
  only what the user requests). Full style management is a future enhancement.
- Excalidraw font families include both legacy (Virgil, Helvetica, Cascadia)
  and modern (Excalifont, Nunito, Lilita One, Comic Shanns) fonts. The styling
  configuration uses modern fonts by default. When fonts are unavailable for
  PNG rendering, system fallback fonts are used — output remains functional
  but may differ visually from the Excalidraw editor.

## Scope Boundaries

**In scope**:

- Excalidraw JSON format reference documentation
- Default styling configuration (one professional palette)
- Five diagram type templates (C4, data flow, cloud architecture, flowchart, BPMN)
- PNG render script with self-contained dependencies
- Plugin packaging for marketplace installation

**Out of scope**:

- Interactive diagram editing (drag-and-drop)
- Multiple colour themes or user-customisable palettes (future enhancement)
- SVG or PDF export formats (future enhancement)
- MCP server or browser-based rendering
- Integration with external diagram tools beyond Excalidraw
- Real-time collaboration features
