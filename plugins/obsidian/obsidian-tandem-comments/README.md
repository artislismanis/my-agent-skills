# obsidian-tandem-comments

A vendored copy of the Claude Code skill that the
[Tandem Comments](https://github.com/leonpawelzik/obsidian-tandem-comments) Obsidian
plugin generates. Teaches Claude to read, write, reply to, and resolve comments and
edit suggestions stored in the plugin's `tandem-comments` fenced-JSON block.

## Why this is vendored, not exported

Tandem Comments' own **Advanced & integrations → Export skill** writes the file to
`~/.claude/skills/obsidian-tandem-comments/` on the machine running Obsidian. That
works when Claude runs on the same host. It does not reach an agent running inside a
container — such as [Agent Sandbox](https://github.com/artislismanis/obsidian-agent-sandbox)
— which mounts a named volume at `/home/claude/.claude`, not the host's `~/.claude`.
So the skill has to travel as a plugin instead of a per-machine export.

## Install

```bash
claude plugin marketplace add artislismanis/my-agent-skills
claude plugin install obsidian-tandem-comments@my-agent-skills
```

Inside Agent Sandbox this lands in the `oas-claude-config` volume and survives
`docker compose build` and container restarts.

## Sources and attribution

| Source | Licence | What it contributed |
|--------|---------|---------------------|
| [leonpawelzik/obsidian-tandem-comments](https://github.com/leonpawelzik/obsidian-tandem-comments) | MIT, Leon Pawelzik | `skills/obsidian-tandem-comments/SKILL.md` in full |

`LICENSE` in this plugin carries the upstream MIT notice, as required for redistributing
the file. Nothing here is a deviation — `SKILL.md` is byte-for-byte what the plugin
exports.

**Pinned to:** upstream commit
[`8d02351`](https://github.com/leonpawelzik/obsidian-tandem-comments/commit/8d02351a21f8949af1ca3d2e96561fcb58d72d06)
(2026-07-23), plugin version `0.5.2` (`manifest.json` at that commit).

### Refresh procedure

The skill text is a template literal (`SKILL_MARKDOWN`) in the plugin's
`src/skill-export.ts`. It escapes its own backticks, so the TS source is not
byte-identical to the exported file — evaluate it, don't transcribe it by hand.

1. Check for a new commit touching `src/skill-export.ts`:

   ```bash
   curl -s "https://api.github.com/repos/leonpawelzik/obsidian-tandem-comments/commits?path=src/skill-export.ts&sha=main&per_page=1" \
     | node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const c=JSON.parse(d)[0];console.log(c.sha,c.commit.author.date)})"
   ```

   If the SHA matches the one pinned above, stop — nothing changed.

2. Fetch the new source and evaluate the literal exactly as JS would (no hand
   transcription of escapes):

   ```bash
   curl -sL https://raw.githubusercontent.com/leonpawelzik/obsidian-tandem-comments/main/src/skill-export.ts -o /tmp/skill-export.ts
   awk '/^export const SKILL_MARKDOWN/,/^`;$/' /tmp/skill-export.ts > /tmp/eval-skill.mjs
   printf '\nprocess.stdout.write(SKILL_MARKDOWN);\n' >> /tmp/eval-skill.mjs
   node /tmp/eval-skill.mjs > /tmp/SKILL.md
   ```

3. Diff against the vendored copy:

   ```bash
   diff /tmp/SKILL.md skills/obsidian-tandem-comments/SKILL.md
   ```

   If it differs, replace the vendored file with `/tmp/SKILL.md`, check
   `manifest.json` at the new commit for the plugin version, and bump both the
   pinned commit/version above and `version` in `.claude-plugin/plugin.json`.
