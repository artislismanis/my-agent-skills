# my-claude

Personal Claude Code baseline. Carries the behavioural rules that should apply in every
session on every machine, plus the one command that installs them.

## Why this plugin exists

Plugins cannot ship instructions. A `CLAUDE.md` at a plugin root is not loaded as
context, and Claude Code only reads instruction files from the locations it already
knows about. So the rules travel as a payload in `rules/`, and a script copies them
into `$CLAUDE_CONFIG_DIR/rules/my-claude/`, which Claude Code does load at the start of
every session.

Everything else a plugin ships, including skills and hooks, loads automatically once the
plugin is enabled. Only the rules need the set-up step.

## What it installs

| Rule | Covers |
|------|--------|
| `tone.md` | Terseness, self-contained answers, no em-dashes |
| `defaults.md` | Editing over creating, no speculative abstractions, surgical diffs |
| `before-coding.md` | Minimum viable implementation, stating assumptions |
| `verification.md` | Turning vague tasks into verifiable ones |
| `destructive-actions.md` | What to ask about before doing |
| `where-rules-live.md` | Where to edit a rule so the change survives |

It also seeds `$CLAUDE_CONFIG_DIR/CLAUDE.md` from `templates/CLAUDE.md`, but only when
that file does not exist. An existing file is never modified: it is hand-edited and
holds machine-local notes that exist nowhere else.

## Choosing which rules to install

Rules are opt-out, not all-or-nothing. `/my-claude:set-up` lists what is available and
asks which ones you want, then remembers the answer.

```bash
sync-claude-config --list                       # checkbox view of what is on
sync-claude-config --only tone,defaults         # install these, remember the choice
sync-claude-config --all                        # everything, forget the selection
sync-claude-config                              # reinstall the remembered selection
```

`--only` is the complete selection rather than an addition, so removing a rule means
re-running without it. The installed directory is rebuilt from scratch on every run, so
a deselected rule disappears with nothing else to undo.

The choice lives in `$CLAUDE_CONFIG_DIR/.my-claude-selection`, outside the plugin-owned
directory so a sync cannot clear it. It is per machine, which is the point: a work
container can run a different subset from a personal one. A machine with no selection
saved gets every rule.

Selection is not prompted for inside the script. The `Setup` hook has no TTY, and the
skill invokes the script through Claude's Bash tool, so an interactive prompt would hang
in both. Claude asks the question, the script takes the answer as a flag.

## Install

```bash
claude plugin marketplace add artislismanis/my-agent-skills
claude plugin install my-claude@my-agent-skills --yes
```

Then run `/my-claude:set-up` in a session. The rules apply from the next session, since
instruction files load at session start.

## Unattended set-up

The `Setup` hook runs the same script, and fires on `claude --init-only`. In a
devcontainer, add it to `postCreateCommand`:

```json
{
  "postCreateCommand": "claude plugin marketplace add artislismanis/my-agent-skills && claude plugin install my-claude@my-agent-skills --yes && claude --init-only"
}
```

To persist authentication across rebuilds, mount `~/.claude` as a named volume and point
`CLAUDE_CONFIG_DIR` at it. The sync script honours `CLAUDE_CONFIG_DIR`, so the rules land
inside the volume.

## Changing a rule

Edit it here, in `rules/`, then re-run `/my-claude:set-up`. Editing
`~/.claude/rules/my-claude/` directly achieves nothing: that directory is plugin-owned
and cleared on every sync, so the next run replaces it.

## Sources and attribution

The rules are personal preferences, but several were shaped by prior art. Recorded here
so the lineage survives later edits.

| Source | Licence | What it contributed |
|--------|---------|---------------------|
| [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) | MIT, forrestchang | `defaults.md` surgical-change rules, `before-coding.md` simplicity rules, `verification.md` in full |
| [Claude Code docs: memory](https://code.claude.com/docs/en/memory) | Anthropic | How instruction tiers load, which shaped where these rules live rather than their content |

`tone.md`, `destructive-actions.md`, and `where-rules-live.md` are original.

The karpathy guidelines were adapted rather than copied. Two changes worth naming:

- Its "stop and ask whenever anything is unclear" rule was narrowed to "state assumptions
  on judgment calls, ask only when readings diverge materially", because the original
  contradicts the terseness rule in `tone.md`.
- Its plan-narration template and its "biases toward caution over speed" caveat were
  dropped for the same reason.

That upstream repo also publishes its guidelines as an installable skill. It is worth
adding as a vendored marketplace entry if the full version is ever wanted alongside these.
