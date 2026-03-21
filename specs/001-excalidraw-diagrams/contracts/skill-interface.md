# Contract: Skill Interface

**Type**: Claude Code skill (agentskills.io format)
**Location**: `plugins/diagramming/excalidraw-diagrams/skills/excalidraw-diagrams/SKILL.md`

## Invocation

The skill is auto-invoked when Claude detects a diagram generation request
in the user's message. It can also be referenced explicitly by name.

### Trigger Patterns

The skill description should cause auto-invocation when the user asks to:

- Create, draw, or generate a diagram
- Create an Excalidraw diagram specifically
- Generate a C4, flowchart, BPMN, data flow, or architecture diagram
- Visualise or render a system/process as a diagram

### Skill Inputs (via conversation context)

| Input | Source | Description |
|-------|--------|-------------|
| Diagram description | User message | Natural language description of what to diagram |
| Diagram type | Inferred from description | Determines which template to load |
| Modification request | User message (iteration) | Changes to apply to existing diagram |

### Skill Outputs

| Output | Format | Description |
|--------|--------|-------------|
| Excalidraw JSON | `.excalidraw` file on disk | Complete, valid Excalidraw document |
| PNG image | File on disk | Visual rendering (when render script is invoked) |

### Reference Loading

The skill loads references on demand based on the request:

| Reference | Loaded When | Path |
|-----------|-------------|------|
| `excalidraw-format.md` | Always (for any diagram request) | `references/excalidraw-format.md` |
| `styling-defaults.md` | Always (for any diagram request) | `references/styling-defaults.md` |
| Template files | When specific diagram type is requested | `assets/templates/<type>.md` |

### SKILL.md Frontmatter

```yaml
---
name: excalidraw-diagrams
description: >-
  Generate professional Excalidraw diagrams from natural language descriptions.
  Use when the user asks to create, draw, or visualise diagrams including C4,
  flowcharts, BPMN, data flow, and cloud architecture diagrams. Produces valid
  Excalidraw JSON with consistent professional styling.
metadata:
  version: 1.0.0
  author: Artis Lismanis
allowed-tools: Bash Read
---
```
