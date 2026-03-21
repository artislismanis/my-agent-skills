# Quickstart: Excalidraw Diagram Plugin

## Install

```text
/plugin marketplace add artislismanis/my-agent-skills
/plugin install excalidraw-diagrams@my-agent-skills
```

## Use

Ask Claude to create a diagram:

> "Draw a C4 context diagram for an e-commerce system with a web app,
> payment gateway, and inventory service"

Claude generates Excalidraw JSON using the plugin's format reference and
styling defaults.

## Render to PNG

After Claude generates a diagram and saves it to a file:

```bash
cd "${CLAUDE_SKILL_DIR}/scripts"
node render.mjs /path/to/diagram.excalidraw
```

Claude checks for missing dependencies before the first render and asks
permission to install them.

This produces `diagram.png` in the same directory as the input file.

## Supported Diagram Types

- **C4** — Context, Container, Component diagrams
- **Data flow** — Sources, processes, stores, data flows
- **Cloud architecture** — AWS/GCP/Azure service layouts
- **Flowchart** — Process flows and decision trees
- **BPMN** — Business process with events, tasks, gateways, swim lanes

## Iterate

Ask Claude to modify the generated diagram:

> "Add a notification service connected to the order service"

Claude updates the existing JSON while preserving styling consistency.
