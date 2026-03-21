#!/usr/bin/env bash
# Blocks file-editing tools when on the main branch (GitHub Flow enforcement).
# Exit 2 = block with message. Exit 0 = allow.

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

if [ "$BRANCH" = "main" ]; then
  echo "⛔ GitHub Flow violation: you are on '$BRANCH'."
  echo ""
  echo "All changes require a feature branch. Options:"
  echo "  • New plugin (speckit):  /speckit.specify \"description\""
  echo "  • Any other change:      git checkout -b <short-description>"
  exit 2
fi
