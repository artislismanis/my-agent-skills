# Flowchart Quick Reference

**Standard**: ANSI/ISO notation | **Direction**: Top-to-bottom (default)

## Shape → Element Mapping

| Element | Shape | Background | Size |
|---------|-------|------------|------|
| Start / End (Terminator) | `rectangle` + `roundness: {type:3}` | `#d3f9d8` | `160 × 60` |
| Process / Action | `rectangle` | `#dbe4ff` | `160 × 80` |
| Decision | `diamond` | `#fff3bf` | `120 × 120` |
| Input / Output | `rectangle` | `#f1f3f5` | `160 × 80` |
| Error / Exception | `rectangle` | `#ffe3e3` | `160 × 80` |
| Connector (off-page) | `ellipse` | `#f1f3f5` | `60 × 60` |
| Swim Lane | `frame` | `transparent` | — |

## Key Conventions

- **Labels**: Terminators → `"Start"` / `"End"`. Process → imperative verb (`"Validate Input"`). Decision → question (`"Is Valid?"`). Decision branches → `"Yes"` / `"No"` as arrow labels.
- **Arrows**: All solid. Dashed for error/exception paths only.
- **Decisions**: 1 incoming, 2+ outgoing (all labelled). Bottom = false/No, right = true/Yes.
- **Termination**: Exactly one Start; all terminal paths reach an End.
- **Spacing**: 60px vertical between shapes; 80px horizontal for branches.
- **Swim lanes**: Stack lane frames vertically, min height `140px`.

Full template: `assets/templates/flowchart.md`
