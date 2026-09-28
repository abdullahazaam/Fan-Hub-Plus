# Password reset email

Configure through environment variables or your deployment secret provider; no credentials belong in source control.

- `Email__Host`: SMTP server
- `Email__Port`: STARTTLS port (default 587)
- `Email__EnableSsl`: true (default); STARTTLS required for remote servers
- `Email__FromAddress`: verified sender email
- `Email__Username`: SMTP username, when authentication is required
- `Email__Password`: SMTP password/app password from a secret store

Equivalent appsettings keys are under `Email`. Use environment variables for credentials. Implicit TLS port 465 is not supported by this SMTP transport; use your provider's STARTTLS endpoint.

The existing Reset tab accepts the emailed token. Expiry remains 30 minutes. Tokens are never logged or returned by the forgot-password API. Failures return the same public response and invalidate the undelivered token. Local capture testing supports `localhost`/`127.0.0.1` with TLS disabled. Restart the API after configuring SMTP.
