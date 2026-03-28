# BPMN Quick Reference

**Standard**: BPMN 2.0 | **Use for**: Business workflows, approval processes, swim-lane flows

## Shape → Element Mapping

| BPMN Element | Shape | Background | Size |
|--------------|-------|------------|------|
| Start Event | `ellipse` | `#d3f9d8` | `60 × 60`, `strokeWidth: 1` |
| End Event | `ellipse` | `#ffe3e3` | `60 × 60`, `strokeWidth: 4` |
| Intermediate Event | `ellipse` | `#fff3bf` | `60 × 60` |
| Task (User/Service) | `rectangle` + `roundness: {type:3}` | `#dbe4ff` | `160 × 80` |
| Manual Task | `rectangle` + `roundness: {type:3}` | `#f1f3f5` | `160 × 80` |
| Exclusive Gateway (XOR) | `diamond` | `#fff3bf` | `80 × 80` |
| Parallel Gateway (AND) | `diamond` | `#fff3bf` | `80 × 80` |
| Pool | `frame` | `transparent` | Full diagram width |
| Lane | `rectangle` | `transparent` | Min height `160px` |

## Key Conventions

- **Task labels**: Prefix with `[Service]`, `[Send]`, `[Receive]`, `[Script]` to indicate type
- **Gateway labels**: Question form (`"Approved?"`) on gateway; outcomes on outgoing arrows
- **Flow types**: Sequence (solid, same pool); Message (dashed, cross-pool); Association (dotted, no arrowhead)
- **Pools**: Every pool needs ≥1 Start and ≥1 End event
- **Lanes**: Stack vertically inside pool; elements vertically centred in lane

## Layout

- Horizontal swim lanes (default): left → right flow, lanes stacked top → bottom
- Element start x: `pool.x + 80` (space for lane label)
- Horizontal gap between tasks: `60px`

Full template: `assets/templates/bpmn.md`
