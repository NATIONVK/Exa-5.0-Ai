# Phase 01 — NEXUS AI Core Brain Specification

## Goal

Deliver a real, testable AI chat foundation that later memory and agent modules can use.

## Functional requirements

1. Provide a functional chat interface.
2. Use a modular provider adapter architecture.
3. Support Gemini and OpenAI adapters when configured with valid credentials.
4. Store provider credentials only in server-side environment secrets.
5. Provide explicit provider/model selection and a tested connection status.
6. Persist conversations and messages in a database.
7. Support streaming responses when the selected provider supports it.
8. Support Bangla and English conversations.
9. Include loading, retry, timeout, offline, and provider-error states.
10. Provide provider settings and usage visibility.

## Suggested backend boundaries

- `providers/` — provider interface and provider-specific adapters
- `chat/` — conversation orchestration and message validation
- `storage/` — conversation persistence
- `api/` — authenticated API endpoints
- `security/` — authorization, rate limiting, and secret access
- `tests/` — unit and integration tests

These are architectural boundaries, not a claim that implementation files already exist.

## Data model (initial)

### Conversation
- `id`: string/UUID
- `user_id`: string/UUID
- `title`: string
- `created_at`: timestamp
- `updated_at`: timestamp

### Message
- `id`: string/UUID
- `conversation_id`: string/UUID
- `role`: system | user | assistant
- `content`: text
- `provider`: string, nullable
- `model`: string, nullable
- `created_at`: timestamp

### Provider configuration
- `id`: string/UUID
- `user_id`: string/UUID
- `provider_name`: string
- `selected_model`: string
- `is_enabled`: boolean
- Secret values must remain outside this record in a secure secret store.

## Acceptance tests

- A user can send a message and receive a real provider response.
- Conversation history remains available after refresh/re-login.
- Bangla and English prompts both work.
- Invalid or missing credentials produce a clear actionable error.
- Provider failure can be retried or routed to a configured fallback.
- API credentials never appear in browser/mobile client bundles or logs.
- Unauthorized users cannot read another user's conversations.

## Builder implementation prompt

Build Phase 01 of NEXUS AI as a working feature, not a mockup. Implement the provider abstraction, Gemini and OpenAI adapters, secure server-side secret configuration, persistent conversations/messages, bilingual chat, streaming where supported, provider settings, and complete loading/error/retry states. Preserve the current cinematic cyberpunk interface and responsive Android/Web experience. Add tests for the end-to-end chat flow, persistence, provider failures, and authorization. Do not invent successful provider connections; verify them with configured credentials. Test it and show the result.
