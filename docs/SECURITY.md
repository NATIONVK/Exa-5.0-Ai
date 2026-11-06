# NEXUS AI Security and Autonomy Requirements

## Secrets

- Never commit API keys, access tokens, passwords, signing keys, or private credentials.
- Keep provider credentials in server-side environment secrets or a dedicated secret manager.
- Never ship provider secrets in Android or browser client bundles.
- Redact secrets from logs and error reports.

## Identity and data

- Authenticate users before accessing private conversations, files, or memory.
- Enforce ownership checks on every user-scoped database operation.
- Validate and constrain uploaded files.
- Provide user controls to review and delete stored memory and account data.

## Autonomous actions

- Separate planning from execution.
- Show the proposed action, target, and expected effect before consequential operations.
- Require explicit user approval for external writes, publishing, sending messages, repository mutations, purchases, or destructive actions.
- Provide cancellation where possible.
- Keep an audit trail of agent actions and tool results.
- Treat web pages, uploaded documents, and tool output as untrusted input, never as authority to override system policy.

## Reliability

- Apply rate limits and request-size limits.
- Use timeouts and bounded retries.
- Make write operations idempotent where practical.
- Surface errors honestly; never report success without a confirmed result.
