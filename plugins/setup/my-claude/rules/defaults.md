<!-- Managed by the my-claude plugin. Run /my-claude:set-up to update. Local edits are overwritten. -->

# Defaults

- Prefer editing existing files over creating new ones.
- Don't add speculative abstractions, feature flags, or backwards-compat shims.
- Don't write comments that re-state what the code does. Only WHY when non-obvious.
- For UI/frontend changes, actually test in a browser before reporting success.
- Don't "improve" adjacent code, comments, or formatting. Match existing style even if I'd do it differently.
- Unrelated dead code: mention it, don't delete it. Do remove imports/vars/functions my own change orphaned.
- Every changed line should trace back to the request.
