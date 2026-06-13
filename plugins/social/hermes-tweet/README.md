# hermes-tweet

Operate the native Hermes Agent plugin for X/Twitter automation through Xquik.

## What This Plugin Does

The `hermes-tweet` skill helps Claude Code guide a Hermes Agent operator through:

1. Installing and enabling the Hermes Tweet plugin
2. Keeping X/Twitter workflows read-first by default
3. Using `tweet_explore` before choosing any Xquik endpoint
4. Calling `tweet_read` only for catalog-listed read-only routes
5. Reserving `tweet_action` for explicit, approval-gated account actions

## Installation

```text
/plugin marketplace add artislismanis/my-agent-skills
/plugin install hermes-tweet@my-agent-skills
```

Then install Hermes Tweet in the Hermes Agent runtime:

```bash
hermes plugins install Xquik-dev/hermes-tweet --enable
hermes plugins list
hermes tools list
```

Configure runtime credentials outside chat and issue text. Keep action tools disabled
unless the session has a specific approved account-changing task.

## Plugin Contents

```text
hermes-tweet/
├── .claude-plugin/
│   └── plugin.json
├── README.md
└── skills/
    └── hermes-tweet/
        └── SKILL.md
```

## Prerequisites

- Claude Code with plugin support
- Hermes Agent with Hermes Tweet installed and enabled
- A runtime API key configured in the Hermes Agent environment
