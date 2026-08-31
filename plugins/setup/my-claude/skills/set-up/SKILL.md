---
name: set-up
description: Set up my Claude. Installs this plugin's baseline behavioural rules (tone, defaults, before-coding, verification, destructive actions, where-rules-live, markdown) into the user rules directory so they load in every session, and seeds a machine-local CLAUDE.md on a fresh box. Also configures the opt-in master-prompt rule and its personal-context import. Also used to change which rules are installed later. Use when setting up a new machine, container, or codespace, after the plugin updates, or when adding or removing a rule.
---

# Set up my Claude

Installs rules into `$CLAUDE_CONFIG_DIR/rules/my-claude/` (defaulting to `~/.claude/rules/my-claude/`), where Claude Code loads them at every session start.

## Choosing rules

Start by showing what is available and what is currently on:

```bash
"${CLAUDE_PLUGIN_ROOT}/bin/sync-claude-config" --list
```

`master-prompt` is opt-in: it never installs by default and `--all` never includes it, because it only does anything once a machine-specific path is configured (see below). Every other rule installs by default.

Then ask the user which rules they want, as a multi-select with every currently installed rule pre-selected. Ask once, and skip asking entirely if they already said what they want, such as "install the defaults" or "drop the tone rule". "Install everything" means every default rule, not `master-prompt` — that still needs naming explicitly, since selecting it is what triggers the path question below.

Apply the answer:

```bash
# every default rule, and forget any previous selection
"${CLAUDE_PLUGIN_ROOT}/bin/sync-claude-config" --all

# a subset, remembered for later runs
"${CLAUDE_PLUGIN_ROOT}/bin/sync-claude-config" --only tone,defaults,verification

# including the opt-in master-prompt rule
"${CLAUDE_PLUGIN_ROOT}/bin/sync-claude-config" --only tone,defaults,master-prompt
```

Pass the full list of rules the user wants each time. `--only` is the complete selection, not an addition, so removing a rule means re-running with it left out. It is also the only way `master-prompt` gets installed at all, and the only way an unattended re-sync (the `Setup` hook, `claude --init-only`) keeps reinstalling it afterwards — it works because the choice is remembered in the selection file, not because `master-prompt` is special-cased anywhere else.

## Master prompt

Run this only when `master-prompt` is among the rules just selected.

The rule itself just says how to treat a master prompt if one is imported; it carries no path. The path lives in the machine-local `$CLAUDE_CONFIG_DIR/CLAUDE.md`, which the sync script never touches, so wiring it up is this skill's job, done directly with Read/Edit, not through the script.

1. Read `$CLAUDE_CONFIG_DIR/CLAUDE.md`. Look for an existing line starting with `@` — not for a `## Personal context` heading, since a heading can exist with no import under it, or an import can already live under a different heading.
2. If no `@` line exists: ask for the path to their master prompt file. Check it with `test -f`; if missing, say so and ask whether to write the import anyway (the vault may not be mounted yet on this machine).
3. Append to the machine-local file:

   ```markdown
   ## Personal context

   @/absolute/path/to/master-prompt.md
   ```

4. If an `@` line already exists and points somewhere else, report the current path and ask before changing it. Never overwrite it silently.
5. If `master-prompt` is later deselected, the rule file disappears from `rules/my-claude/` on the next sync, but the `@` import in the local `CLAUDE.md` stays — that file is never auto-edited on removal. Tell the user where the line lives if they want it gone too.

The master prompt concept is Tiago Forte's: [The Master Prompt 2.0: Live Session with Tiago Forte](https://www.youtube.com/watch?v=VfDZnvUCM_Q) and [The Master Prompt Method: Build Your AI Operating System](https://www.youtube.com/watch?v=yNpbnrlAFzA). Point the user there if they're configuring this rule without already having a master prompt file to link to.

## Re-syncing

With no flags the script reinstalls whatever selection is remembered, or every rule if none was ever chosen. That is what the `Setup` hook runs on `claude --init-only`, so an unattended container reproduces the same choice with no prompt.

```bash
"${CLAUDE_PLUGIN_ROOT}/bin/sync-claude-config"
```

## What to report

Say which rules landed and which were left out, and that they take effect from the user's next session, since instruction files load at session start.

The script also creates `$CLAUDE_CONFIG_DIR/CLAUDE.md` from `templates/CLAUDE.md`, but only when that file does not exist. An existing file is never modified: it is hand-edited and holds machine-local notes that exist nowhere else. Report which happened.

## Changing a rule's content

Edit it in the plugin repo under `rules/`, then re-run this. Editing `~/.claude/rules/my-claude/` directly is pointless, the next sync replaces it.
