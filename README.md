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

## Development Environment (Devcontainer)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Colima/Podman)
- [VS Code](https://code.visualstudio.com/) with the
  [Remote-Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- **MesloLGS NF font** installed on your host OS (recommended — terminal fonts render
  host-side, not in the container). Download from the
  [Powerlevel10k fonts page](https://github.com/romkatv/powerlevel10k#fonts). The
  devcontainer works without it (falls back to monospace) but glyphs will be missing.

### Quick start

1. Clone the repository and open it in VS Code
2. When prompted, click **"Reopen in Container"** (or open the command palette and run
   **"Dev Containers: Reopen in Container"**)
3. Wait for the container to build — Node.js 22, Python 3.12, Claude Code CLI, and all
   tools will be available automatically

### Firewall (local Docker only — skip in Codespaces)

To restrict container network access to approved domains only (recommended before
running Claude Code in autonomous mode):

```bash
sudo /usr/local/share/init-firewall.sh
```

On success, the output shows the count of whitelisted domains. On failure, it prints
the step that failed with an actionable error message. The firewall is optional and
manually activated — the container works normally without it.

### Pre-commit hooks (outside the container)

If you're working outside the devcontainer, install pre-commit hooks manually
(requires Python 3 and pip):

```bash
pip install pre-commit && pre-commit install
```

### Rebuilding the container

Rebuild after changes to `.devcontainer/Dockerfile` or `.devcontainer/devcontainer.json`:
open the VS Code command palette and run **"Dev Containers: Rebuild Container"**.

## Other resources

- [`docs/`](docs/) — Best-practice guides and reusable templates
- [`configs/`](configs/) — System prompts and agent configuration files

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.
