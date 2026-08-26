---
name: set-up
description: Set up my Claude. Installs this plugin's baseline behavioural rules (tone, defaults, before-coding, verification, destructive actions, where-rules-live) into the user rules directory so they load in every session, and seeds a machine-local CLAUDE.md on a fresh box. Use when setting up a new machine, container, or codespace, or after the plugin updates.
---

# Set up my Claude

Run the bundled sync script:

```bash
"${CLAUDE_PLUGIN_ROOT}/bin/sync-claude-config"
```

It does two things, against `$CLAUDE_CONFIG_DIR` (defaulting to `~/.claude`):

1. Replaces `rules/my-claude/` with this plugin's `rules/*.md`. That directory is
   plugin-owned, so the copy is safe to repeat.
2. Creates `CLAUDE.md` from `templates/CLAUDE.md` only if it does not already exist.
   An existing file is never modified: it is hand-edited and holds notes that exist
   nowhere else.

Report which files landed and whether the local file was seeded or left alone. The
rules apply from the user's next session, since instruction files load at session start.

To change a rule, edit it in the plugin repo and re-run this. Editing
`~/.claude/rules/my-claude/` directly is pointless, the next sync replaces it.
