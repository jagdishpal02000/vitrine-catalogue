# Tasks

The implementation plan, in order. Each task is a small, reviewable slice with its own commit(s).
Requirement IDs refer to [requirements.md](requirements.md).

## Foundations

- [x] T1 Spec: requirements, design, tasks
- [x] T2 Agent instructions: `AGENTS.md`, `CLAUDE.md`
- [x] T3 Tooling: npm workspaces, TypeScript, Prettier, ESLint, Husky, lint-staged, commitlint
- [x] T4 CI: lint, format, typecheck, test and build on every pull request

## API

- [x] T5 Express app: env config, logger, error handling, health check
- [x] T6 Middleware: zod request validation, rate limiting
- [x] T7 Search matching rules (R3.1) — tests first
- [x] T8 Product repository: Fake Store adapter, in-memory queries, cache
- [x] T9 Catalogue service: top rated (R1), category page (R2), search (R3), product (R4) — tests first
- [x] T10 Product and category endpoints
- [x] T11 Enquiry endpoint: validation, email, rate limit (R5) — tests first
- [x] T12 OpenAPI docs and Swagger UI

## Web

- [x] T13 Vite + React app shell, theme tokens, routing
- [x] T14 API client and data hooks
- [x] T15 Layout: brand, category navigation (R2.1), search bar (R3)
- [x] T16 Home (R1), category (R2) and search (R3) pages
- [x] T17 Product page (R4) and enquiry form (R5)
- [x] T18 Journey tests, one per acceptance criterion

## Delivery

- [x] T19 Docker: API and web images, compose with Mailpit, `.env.example`
- [x] T20 Docs: README, DECISIONS, AI_USAGE
- [x] T21 Independent review pass and fixes
- [x] T22 API versioning: public endpoints under `/api/v1`, health check unversioned
- [ ] T23 Pull request into `main`
