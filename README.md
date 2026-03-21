# My Agent Skills

Personal Claude plugin marketplace — skills, agents, and MCP servers organised by topic.

## Plugins

| Plugin | Type | Description | Install |
|--------|------|-------------|---------|
| *Coming soon* | — | — | — |

Browse the [`plugins/`](plugins/) directory for all available packages, or see
[`marketplace.yml`](marketplace.yml) for the machine-readable manifest.

## What's in a plugin?

Each plugin is a self-contained package that can bundle any combination of:

- **Skills** — reusable instructions in [agentskills.io](https://agentskills.io) format
- **Agents** — agent definitions with system prompts and tool configurations
- **MCP Servers** — [Model Context Protocol](https://modelcontextprotocol.io) servers

See [`CLAUDE.md`](CLAUDE.md) for the full plugin package standard and folder structure.

## Installation

Plugins from this repo can be installed via the Claude plugin mechanism:

```
/plugin install artislismanis/my-agent-skills/plugins/<topic>/<plugin-name>
```

Refer to each plugin's `README.md` for specific installation instructions and
configuration details.

## Other resources

- [`docs/`](docs/) — Best-practice guides and reusable templates
- [`configs/`](configs/) — System prompts and agent configuration files

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.
