# How Claude Code instruction tiers resolve

Reference for authoring rules. Deliberately not shipped as a rule in the `my-claude` plugin: this is stock Claude Code behaviour, so stating it in a loaded rule would spend context in every session without changing what Claude does.

## Files combine, they do not override

Every instruction file Claude Code discovers is concatenated into context. There is no override mechanism. Order runs broadest to most specific:

1. Managed policy (`/etc/claude-code/CLAUDE.md` on Linux)
2. User (`~/.claude/CLAUDE.md`, plus `~/.claude/rules/*.md`)
3. Project, from the filesystem root down to the working directory
4. `CLAUDE.local.md`, appended after `CLAUDE.md` within each directory

Being read last is not precedence. The docs are explicit that contradictions resolve arbitrarily. A rule that must win should name what it supersedes ("ignore the root rule about X, do Y instead") rather than just stating the opposite.

## Where a new rule belongs

| Scope | Location | Shared with |
|-------|----------|-------------|
| Every machine, portable behaviour | `my-claude` plugin `rules/`, synced to `~/.claude/rules/my-claude/` | Just me, everywhere |
| One machine only | `~/.claude/CLAUDE.md` | Just me, this box |
| One project, team-wide | `./CLAUDE.md` or `./.claude/CLAUDE.md` | The team, via git |
| One project, personal | `./CLAUDE.local.md`, gitignored | Just me, this checkout |

Settings are a separate hierarchy: `~/.claude/settings.json`, a project's `.claude/settings.json`, and `./.claude/settings.local.json` for per-machine overrides.

## What earns a place in a rule

Keep what Claude cannot derive: preferences, pitfalls, and conventions that differ from tool defaults. Cut what it can look up or would do anyway. The `/doctor` trim check applies the same test, and shorter files measurably improve adherence.

Path-scoped rules in `.claude/rules/` with `paths:` frontmatter load only when Claude touches matching files, which keeps narrow rules out of context the rest of the time.

## Source

Condensed from the [Claude Code memory docs](https://code.claude.com/docs/en/memory).
