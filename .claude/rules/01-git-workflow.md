<!-- @format -->

# Git Workflow

- Never commit directly to `main` or `master`.
- Work in small, reviewable commits.
- Never commit secrets.
- Never rewrite shared history unless explicitly asked.
- Before edits: check branch and git status.
- After edits: summarize changed files, tests run, and invariants touched.
- Do not mix architecture changes with implementation changes.
- Do not expand scope beyond the requested phase.
- Never use parentheses in branch names.
- PRs and commits must never reference Claude — no Co-Authored-By line, no "Generated with Claude Code" footer, no mention of the assistant in commit bodies or PR descriptions.
