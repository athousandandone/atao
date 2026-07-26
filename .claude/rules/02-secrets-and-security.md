<!-- @format -->

# Secrets and Security

- Never hardcode credentials, tokens, API keys, endpoints with secrets, or private paths.
- Use Rails credentials, environment variables, or documented secret-management seams.
- Do not print secrets in logs, tests, GraphQL responses, fixtures, or screenshots.
- Use fake placeholder values in docs and tests.
- Treat provider credentials as sensitive.
