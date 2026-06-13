---
name: hermes-tweet
description: Install, configure, and operate Hermes Tweet, the native Hermes Agent X/Twitter plugin. Use for Hermes Agent social listening, X search, trend research, account reads, launch monitoring, and approval-gated X actions.
compatibility: Hermes Agent with the hermes-tweet plugin installed
metadata:
  author: Xquik
  version: 0.1.6
---

# Hermes Tweet

Use this skill when the user wants Claude Code to help install, configure, test,
or operate Hermes Tweet in a Hermes Agent runtime.

Hermes Tweet repository: https://github.com/Xquik-dev/hermes-tweet

## Setup

1. Install and enable the Hermes Agent plugin:

   ```bash
   hermes plugins install Xquik-dev/hermes-tweet --enable
   ```

2. Put the API key in the Hermes runtime environment or `~/.hermes/.env`.
   Never ask the user to paste key values into chat.

3. Keep account-changing actions disabled unless the workflow has explicit human
   approval:

   ```bash
   export HERMES_TWEET_ENABLE_ACTIONS=false
   ```

4. Confirm the plugin and toolset are visible:

   ```bash
   hermes plugins list
   hermes tools list
   ```

## Workflow

1. Call `tweet_explore` first to find a catalog-listed `/api/v1/...` endpoint.
2. Call `tweet_read` for public read-only endpoints after a concrete path is
   known.
3. Call `tweet_action` only for writes, private reads, monitors, webhooks,
   media operations, extraction jobs, draws, DMs, follows, or profile changes
   after stating the exact endpoint and payload.

## Good Fits

- Social listening
- Launch monitoring
- X search and trend research
- Creator and brand research
- Public mention triage
- Giveaway and community audits
- Draft planning before approved publishing

## Safety Rules

- Never request, print, log, or store API keys, passwords, cookies, or TOTP
  secrets.
- Never pass credentials in Hermes tool arguments.
- Use only endpoint paths returned by `tweet_explore`.
- Keep `tweet_action` disabled for unattended, cron, or gateway workflows unless
  an approval step is documented.
- Do not use billing, credit top-up, API-key, support-ticket, account
  connection, or account re-authentication endpoints.
- Before any post, reply, delete, follow, DM, monitor, webhook, extraction job,
  media operation, or draw, summarize the action and wait for explicit
  approval.

## Troubleshooting

- If Hermes reports `not enabled`, run `hermes plugins enable hermes-tweet`.
- If only `tweet_explore` appears, configure the API key where the Hermes
  runtime executes and reload or restart that runtime.
- If action tools are hidden, confirm action tools are enabled only for the
  approved session.
- For remote gateway profiles, configure Hermes Tweet on the remote host, not
  only the desktop chat surface.
