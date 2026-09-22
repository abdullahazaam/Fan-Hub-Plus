# Contributing to Fan Hub Plus

## Git Workflow & Secret Hygiene Guidelines

To maintain repository cleanliness and security, follow these strict rules for every commit and push:

1. **Review Diff Before Staging**:
   - Always run `git status` and `git diff` to review all local changes before staging.

2. **Stage Selectively by Explicit Path**:
   - Stage **only** the specific files needed for the feature or fix:
     ```bash
     git add path/to/file1 path/to/file2
     ```
   - **Never** use blanket staging commands like `git add .` or `git add -A`.

3. **Verify Staged Changes (`git diff --cached`)**:
   - Carefully review all staged content:
     ```bash
     git diff --cached
     ```

4. **Secret Scanning**:
   - Scan staged changes for sensitive data prior to every commit:
     - API keys, JWT tokens, OAuth client secrets
     - Passwords, credentials, and private keys (`.pfx`, `.pem`, `.key`)
     - Database connection strings containing usernames or passwords (only credential-free local development strings such as `Trusted_Connection=True` are permitted).
     - Personal identifying data.

5. **Tracked Files Warning**:
   - **Never assume `.gitignore` protects a file that is already tracked by Git.**
   - If a sensitive file was previously tracked, removing it requires explicit untracking (`git rm --cached <file>`).

6. **Commit & Push**:
   - Write clear, descriptive commit messages.
   - Push specifically to the intended branch without force-pushing:
     ```bash
     git push origin main
     ```
