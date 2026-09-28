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

## Registration verification

Set `Email__VerificationBaseUrl` to the public frontend URL (HTTPS; localhost HTTP is supported for development). Verification links carry a random token in a URL fragment so it is not sent in HTTP request URLs. The existing sign-in modal consumes it through POST. Tokens expire after 30 minutes and resend has a one-minute per-account cooldown plus IP rate limiting. New registrations receive no JWT; login is blocked until verified. Existing accounts are grandfathered by the migration to preserve access.
