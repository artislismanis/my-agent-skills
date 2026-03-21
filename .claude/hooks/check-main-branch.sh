#!/usr/bin/env bash
# Blocks file-editing tools when on the main branch (GitHub Flow enforcement).
# Only blocks edits to files inside this repository — files outside (e.g. plan
# files in ~/.claude/plans/) are always allowed.
# Treats detached HEAD the same as main (blocks repo file edits).

# Read stdin (hook receives JSON with tool_input.file_path)
INPUT=$(cat)

# Extract file_path from JSON input (jq preferred, grep fallback)
if command -v jq >/dev/null 2>&1; then
  FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
else
  FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"//;s/"$//')
fi

# If we can't determine the repo root, allow (not a git repo)
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0

# Allow edits to files outside the repository
if [ -n "$FILE_PATH" ]; then
  case "$FILE_PATH" in
    "$REPO_ROOT"/*) ;; # file is inside repo — continue to branch check
    *) exit 0 ;;       # file is outside repo — allow
  esac
fi

# Get current branch (returns "HEAD" when detached)
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

# Block on main or detached HEAD
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "HEAD" ]; then
  REASON="GitHub Flow: you are on ${BRANCH}. Create a feature branch first: git checkout -b <name>, or use /speckit.specify for new plugins."
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}' "$REASON"
  exit 0
fi

exit 0
