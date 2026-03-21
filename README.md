# My Agent Skills

Personal Claude plugin marketplace — skills, agents, and MCP servers organised by topic.

## Plugins

| Plugin                                                          | Type  | Description                                                | Install                                               |
|-----------------------------------------------------------------|-------|------------------------------------------------------------|-------------------------------------------------------|
| [excalidraw-diagrams](plugins/diagramming/excalidraw-diagrams/) | Skill | Generate professional Excalidraw diagrams with PNG preview | `/plugin install excalidraw-diagrams@my-agent-skills` |

Browse the [`plugins/`](plugins/) directory for all available packages, or see
[`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json) for the
machine-readable manifest.

## What's in a plugin?

Each plugin is a self-contained package that can bundle any combination of:

- **Skills** — reusable instructions in [agentskills.io](https://agentskills.io) format
- **Agents** — agent definitions with system prompts and tool configurations
- **MCP Servers** — [Model Context Protocol](https://modelcontextprotocol.io) servers

See [`CLAUDE.md`](CLAUDE.md) for the full plugin package standard and folder structure.

## Installation

First, add this marketplace to your Claude Code:

```text
/plugin marketplace add artislismanis/my-agent-skills
```

Then install individual plugins:

```text
/plugin install <plugin-name>@my-agent-skills
```

Refer to each plugin's `README.md` for specific configuration details.

## Other resources

- [`docs/`](docs/) — Best-practice guides and reusable templates
- [`configs/`](configs/) — System prompts and agent configuration files

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.
