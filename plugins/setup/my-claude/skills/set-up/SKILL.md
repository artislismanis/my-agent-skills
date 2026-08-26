---
name: set-up
description: Set up my Claude. Installs this plugin's baseline behavioural rules (tone, defaults, before-coding, verification, destructive actions, where-rules-live) into the user rules directory so they load in every session, and seeds a machine-local CLAUDE.md on a fresh box. Also used to change which rules are installed later. Use when setting up a new machine, container, or codespace, after the plugin updates, or when adding or removing a rule.
---

# Set up my Claude

Installs rules into `$CLAUDE_CONFIG_DIR/rules/my-claude/` (defaulting to
`~/.claude/rules/my-claude/`), where Claude Code loads them at every session start.

## Choosing rules

Start by showing what is available and what is currently on:

```bash
"${CLAUDE_PLUGIN_ROOT}/bin/sync-claude-config" --list
```

Then ask the user which rules they want, as a multi-select with every currently
installed rule pre-selected. Ask once, and skip asking entirely if they already said
what they want, such as "install everything" or "drop the tone rule".

Apply the answer:

```bash
# everything, and forget any previous selection
"${CLAUDE_PLUGIN_ROOT}/bin/sync-claude-config" --all

# a subset, remembered for later runs
"${CLAUDE_PLUGIN_ROOT}/bin/sync-claude-config" --only tone,defaults,verification
```

Pass the full list of rules the user wants each time. `--only` is the complete
selection, not an addition, so removing a rule means re-running with it left out.

## Re-syncing

With no flags the script reinstalls whatever selection is remembered, or every rule if
none was ever chosen. That is what the `Setup` hook runs on `claude --init-only`, so an
unattended container reproduces the same choice with no prompt.

```bash
"${CLAUDE_PLUGIN_ROOT}/bin/sync-claude-config"
```

## What to report

Say which rules landed and which were left out, and that they take effect from the
user's next session, since instruction files load at session start.

The script also creates `$CLAUDE_CONFIG_DIR/CLAUDE.md` from `templates/CLAUDE.md`, but
only when that file does not exist. An existing file is never modified: it is
hand-edited and holds machine-local notes that exist nowhere else. Report which
happened.

## Changing a rule's content

Edit it in the plugin repo under `rules/`, then re-run this. Editing
`~/.claude/rules/my-claude/` directly is pointless, the next sync replaces it.
