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
| `markdown.md` | No hard-wrapped prose |
| `master-prompt.md` (opt-in, see below) | How to treat an imported master prompt |

It also seeds `$CLAUDE_CONFIG_DIR/CLAUDE.md` from `templates/CLAUDE.md`, but only when
that file does not exist. An existing file is never modified: it is hand-edited and
holds machine-local notes that exist nowhere else.

## Choosing which rules to install

Rules are opt-out, not all-or-nothing, except `master-prompt`, which is opt-in: it never
installs by default and `--all` never restores it. `/my-claude:set-up` lists what is
available and asks which ones you want, then remembers the answer.

```bash
sync-claude-config --list                       # checkbox view of what is on, opt-in ones marked
sync-claude-config --only tone,defaults         # install these, remember the choice
sync-claude-config --all                        # every default rule, forget the selection
sync-claude-config                              # reinstall the remembered selection, or every default rule if none is remembered
sync-claude-config --only tone,master-prompt    # opt-in rules only install when named explicitly
```

`--only` is the complete selection rather than an addition, so removing a rule means
re-running without it. The installed directory is rebuilt from scratch on every run, so
a deselected rule disappears with nothing else to undo. It's also the only path that
gets `master-prompt` installed and kept installed: `--all` clears the selection file, so
an opt-in rule left out of it would be silently dropped on the next unattended sync
(the `Setup` hook, `claude --init-only`) if `--all` ever restored it.

The choice lives in `$CLAUDE_CONFIG_DIR/.my-claude-selection`, outside the plugin-owned
directory so a sync cannot clear it. It is per machine, which is the point: a work
container can run a different subset from a personal one. A machine with no selection
saved gets every default rule.

Selection is not prompted for inside the script. The `Setup` hook has no TTY, and the
skill invokes the script through Claude's Bash tool, so an interactive prompt would hang
in both. Claude asks the question, the script takes the answer as a flag.

## Master prompt

A master prompt is a living document describing who you are: values, working style, life
context. Pointing Claude at one means it stops needing that context re-explained every
session. The concept is Tiago Forte's: [The Master Prompt 2.0: Live Session with Tiago Forte](https://www.youtube.com/watch?v=VfDZnvUCM_Q) and [The Master Prompt Method: Build Your AI Operating System](https://www.youtube.com/watch?v=yNpbnrlAFzA).

`master-prompt.md` is the one rule here that is opt-in, because it only does anything
once a path to your own master prompt file is configured, and that path is
machine-specific — it might point into a mounted Obsidian vault on one box and not exist
at all on another.

Select it in `/my-claude:set-up` and the skill asks for the path, then appends an
`@`-import to your machine-local `$CLAUDE_CONFIG_DIR/CLAUDE.md`, under a `## Personal
context` heading, so Claude Code loads the file as context every session. The rule
content itself carries no path; it just says how to treat a master prompt once one is
loaded. The master prompt file stays wherever you keep it (your vault, most likely) and
never enters this repo.

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
| [Tiago Forte: The Master Prompt 2.0](https://www.youtube.com/watch?v=VfDZnvUCM_Q), [The Master Prompt Method](https://www.youtube.com/watch?v=yNpbnrlAFzA) | — | The master prompt concept behind `master-prompt.md`. No text borrowed, only the idea. |

`tone.md`, `destructive-actions.md`, `where-rules-live.md`, and `markdown.md` are original.

The karpathy guidelines were adapted rather than copied. Two changes worth naming:

- Its "stop and ask whenever anything is unclear" rule was narrowed to "state assumptions
  on judgment calls, ask only when readings diverge materially", because the original
  contradicts the terseness rule in `tone.md`.
- Its plan-narration template and its "biases toward caution over speed" caveat were
  dropped for the same reason.

That upstream repo also publishes its guidelines as an installable skill. It is worth
adding as a vendored marketplace entry if the full version is ever wanted alongside these.
