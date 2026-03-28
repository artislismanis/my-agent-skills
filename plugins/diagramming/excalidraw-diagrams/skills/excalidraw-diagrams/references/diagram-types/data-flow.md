# Data Flow Diagram Quick Reference

**Standard**: Yourdon–DeMarco DFD | **Levels**: Context (L0), Top-Level (L1), Detailed (L2+)

## Shape → Element Mapping

| DFD Concept | Shape | Background | Size |
|-------------|-------|------------|------|
| External Entity | `rectangle` | `#d3f9d8` | `140 × 70` |
| Process | `ellipse` | `#dbe4ff` | `160 × 80` |
| Data Store | `rectangle` | `#fff3bf` | `160 × 60` |
| Data Flow | `arrow` (labelled) | `transparent` | — |
| System Boundary | `frame` | `transparent` | — |

## Label Conventions

- **External Entity**: Proper name only (`"Customer"`, `"Payment Gateway"`)
- **Process**: Process number + name — `"1.0\nValidate Order"` (number on first line)
- **Data Store**: `"D1: Store Name"` format (`"D1: Orders DB"`)
- **Data Flow arrows**: Noun phrase describing the data (`"Order Request"`, `"Customer Record"`)

## DFD Levels

- **L0 (Context)**: Single process at centre; all external entities around it; no data stores
- **L1 (Top-Level)**: Decompose into major sub-processes (numbered 1.0+); include data stores
- **L2+ (Detailed)**: Further decompose one L1 process; sub-processes numbered `1.1`, `1.2`…

## Layout

- Left-to-right: entities left → processes centre → outputs right
- Data stores at the bottom
- Use `frame` for system boundary
- Min spacing: 60px vertical, 80px horizontal

Full template: `assets/templates/data-flow.md`
