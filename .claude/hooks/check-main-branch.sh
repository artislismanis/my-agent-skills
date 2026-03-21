#!/usr/bin/env bash
# Blocks file-editing tools when on the main branch (GitHub Flow enforcement).
# Outputs a structured JSON deny decision when on main; exits 0 to allow otherwise.

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

if [ "$BRANCH" = "main" ]; then
  REASON="GitHub Flow: you are on main. Create a feature branch first: git checkout -b <name>, or use /speckit.specify for new plugins."
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}' "$REASON"
  exit 0
fi

exit 0
