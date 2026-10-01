# Security Policy

## Supported Versions

Security fixes are applied to the current `main` branch.

## Reporting a Vulnerability

Please do not publish credentials, tokens, API keys, database connection strings or other sensitive details in a public issue.

For a private report, contact the repository owner through GitHub.

## Secret Hygiene

- Never commit production secrets.
- Use environment variables or platform secret storage.
- Rotate any secret that has been exposed.
- Do not commit publish profiles, private keys, local databases or SMTP credentials.
- Review `git diff --cached` before pushing.

## Scope

This policy covers the Fan Hub Plus source repository and its public application/API configuration.
