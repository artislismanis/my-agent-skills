# xquik-social-automation

Use Xquik from Claude Code for X data workflows, bulk extraction, monitors,
webhooks, MCP setup, and confirmation-gated publishing flows.

This plugin bundles one skill:

- `xquik-social-automation` - selects the safest Xquik API or MCP workflow,
  keeps actions read-only by default, and requires explicit approval for private
  reads, writes, monitors, webhooks, and metered bulk jobs.

## Installation

```text
/plugin marketplace add artislismanis/my-agent-skills
/plugin install xquik-social-automation@my-agent-skills
```

## Configuration

Set a user-issued Xquik API key in your local agent environment:

```bash
export XQUIK_API_KEY="xq_..."
```

The skill only needs the Xquik API key. If an X account connection or
reauthentication is needed, use the Xquik dashboard rather than chat.
Never paste API keys into chat, prompts, logs, or source control.

Xquik is an independent third-party service. Not affiliated with X Corp.

## What It Covers

- Tweet and user lookup
- Tweet search and timeline research
- Bulk extraction planning and estimates
- Media, article, thread, and engagement workflows
- Monitors and signed event delivery setup
- MCP setup and operation selection
- Confirmation-gated publishing and account actions

## Source References

- [Xquik documentation](https://docs.xquik.com)
- [API reference](https://docs.xquik.com/api-reference/overview)
- [MCP guide](https://docs.xquik.com/mcp/overview)
- [Source skill](https://github.com/Xquik-dev/x-twitter-scraper/tree/master/skills/x-twitter-scraper)

## Plugin Contents

```text
xquik-social-automation/
├── .claude-plugin/
│   └── plugin.json
├── README.md
└── skills/
    └── xquik-social-automation/
        └── SKILL.md
```

## Prerequisites

- Claude Code with plugin support
- Xquik API key
- Internet access for `https://xquik.com` and `https://docs.xquik.com`
