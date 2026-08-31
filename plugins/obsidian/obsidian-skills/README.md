# obsidian-skills

A vendored copy of three skills from [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills): teach Claude to create and edit Obsidian Flavored Markdown, Bases (`.base`), and JSON Canvas (`.canvas`) files.

## Why this is vendored, not all of it

Upstream ships five skills. Two are omitted:

- **`obsidian-cli`** drives a CLI binary against a running Obsidian instance, on the Obsidian host. It has no use inside a container that talks to the vault over MCP instead, and its description ("interact with their Obsidian vault, manage notes, search vault content") would compete with the MCP tools actually in use there.
- **`defuddle`** is not an Obsidian skill — it's a WebFetch replacement ("Use instead of WebFetch") that needs `npm i -g defuddle` and firewall allowlist entries for whatever it fetches.

There is no per-skill toggle for an installed plugin: `plugin.json`'s `skills` field is additive to the default `skills/` scan, not an allowlist, and there's no `settings.json` key or permission rule to disable one skill inside a plugin. Referencing upstream directly at a pinned commit was considered, but that installs all five skills with no way to drop these two — so this vendors a subset instead of pinning upstream whole.

## Install

```bash
claude plugin marketplace add artislismanis/my-agent-skills
claude plugin install obsidian-skills@my-agent-skills
```

Inside [Agent Sandbox](https://github.com/artislismanis/obsidian-agent-sandbox) this lands in the `oas-claude-config` volume and survives `docker compose build` and container restarts. Use the shell form above, not `/plugin install`: the slash form prompts for scope, and choosing "project" would write to the git-tracked `workspace/.claude/settings.json`.

## Sources and attribution

| Source | Licence | What it contributed |
|--------|---------|---------------------|
| [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills) | MIT, Steph Ango | `skills/obsidian-markdown/`, `skills/obsidian-bases/`, `skills/json-canvas/` in full |

`LICENSE` in this plugin carries the upstream MIT notice, as required for redistributing the files. Deviation from upstream: `obsidian-cli` and `defuddle` are omitted, for the reasons above. The three included skills are byte-for-byte what upstream ships.

**Pinned to:** upstream commit [`a1dc48e`](https://github.com/kepano/obsidian-skills/commit/a1dc48e68138490d522c04cbf5822214c6eb1202) (2026-06-08), plugin version `1.0.1` (`.claude-plugin/plugin.json` at that commit).

### Refresh procedure

1. Check for new commits since the pinned SHA:

   ```bash
   curl -s "https://api.github.com/repos/kepano/obsidian-skills/commits?sha=main&since=2026-06-08T09:12:01-07:00&per_page=30" \
     | node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{JSON.parse(d).forEach(c=>console.log(c.sha,c.commit.author.date,c.commit.message.split('\n')[0]))})"
   ```

   If nothing lists, stop — nothing changed.

2. Shallow clone upstream at the new commit:

   ```bash
   git clone --depth 1 https://github.com/kepano/obsidian-skills.git /tmp/obsidian-skills-refresh
   ```

3. Diff the three vendored skill folders against upstream:

   ```bash
   diff -r /tmp/obsidian-skills-refresh/skills/obsidian-markdown skills/obsidian-markdown
   diff -r /tmp/obsidian-skills-refresh/skills/obsidian-bases skills/obsidian-bases
   diff -r /tmp/obsidian-skills-refresh/skills/json-canvas skills/json-canvas
   ```

   Also check whether upstream added, removed, or renamed skills (`ls /tmp/obsidian-skills-refresh/skills`) — that changes what "the subset" means.

4. Replace any differing files, then bump the pinned commit/date/version above and `version` in `.claude-plugin/plugin.json`.
