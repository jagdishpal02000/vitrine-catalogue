# AGENTS.md

Instructions for AI coding agents (Claude Code, Codex, Cursor, Copilot, …) working in this repository.
People should start with [README.md](README.md). The spec is in [docs/spec](docs/spec), and the reasoning behind decisions is in [DECISIONS.md](DECISIONS.md).

## Commands

- `npm install`: installs every workspace and sets up the git hooks.
- `npm run dev`: API on :3000 and web on :5173. For email, run `docker compose up -d mailpit` first.
- `npm run check`: lint, format check, typecheck and all tests. **Run it before saying a task is done.**
- `npm test -w apps/api` or `npm test -w apps/web`: test one workspace.
- `docker compose up --build`: the full stack, run exactly as a reviewer runs it.

## Architecture rules

- API layers: routes → controllers → services → repositories / infra. Never skip a layer or point a dependency backwards.
- Routes declare URL, middleware and zod validation only.
- Controllers read validated input, call one service and send the response. They hold no business logic and no try/catch.
- Services hold business rules. They are plain TypeScript and never import Express.
- Repositories are the only code that knows a data source. Fake Store's data shape never leaves `fakeStore.product.repository.ts`.
- `infra/` holds the technical adapters: logger, cache, HTTP client and mailer.
- Wire dependencies in `container.ts` only. Use factory functions (`createXService(deps)`), not classes. The one exception is `AppError`.
- The web app only talks to `/api`, never to Fake Store.
- Public endpoints live under `/api/v1`. Never make a breaking change to v1; put it in a new `/v2` router. Only operational endpoints (`/api/health`) are unversioned.

## Coding standards

- TypeScript strict. No `any`, no non-null `!`, no `@ts-ignore`, and no disabled lint rule without a comment explaining why.
- Validate every external input with zod at the boundary: requests (`validate()` in routes), env (`config/env.ts`) and upstream responses (`fetchJson`).
- Throw expected errors as `new AppError(ERRORS.X)`. Every error the API can return is defined once in `ERRORS` (status, code, message); add new ones there. Only the global error handler writes error responses. Never echo the request (paths, input) back in an error.
- The web app never shows an error's own text. Display errors with `getUserMessage()`, and add friendly copy for new API codes in `api/errors.ts`.
- Log with `logger` (winston), never `console`. Never log request bodies or personal details.
- Limits, HTTP status codes (`HTTP_STATUS`) and every string a client can receive go in `constants/`. Log messages, the email template and the API docs stay next to their code. Tests assert literal values on purpose, so they catch an accidental change to a constant. Configuration comes only from `config/env.ts`.
- Keep it simple. Reuse before writing anything new, and add no new dependency or abstraction without a clear need. Use small functions with descriptive names.
- User-facing copy is in British English ("catalogue", "enquiry").

## Testing rules

- Every behaviour change comes with a test. Write the tests first for business rules (search, top rated, enquiry).
- Never delete, skip or weaken a failing test to make it pass. Fix the code, or stop and ask.
- API: Vitest unit tests for services and utils, and supertest HTTP tests through `createApp()` with the in-memory repository and a fake mailer.
- Web: React Testing Library through the real routes (`renderRoute()`), with API calls stubbed via `vi.spyOn(catalogueApi, ...)`.

## Git

- Conventional Commits (`feat(api): …`, `fix(web): …`, `docs: …`), each small and focused. The git hooks enforce lint, format and the message format.
- Never commit `.env` files or secrets.

## Gotchas

- In Express 5, `req.query` is a read-only getter, so `validate()` redefines it. Errors thrown in async handlers reach the error handler without a wrapper.
- Fake Store returns HTTP 200 with an empty body for unknown product IDs. We load the full product list instead of calling `/products/:id`.
- TypeScript is pinned to 6.0.x because typescript-eslint does not support TypeScript 7 yet.
- API imports use `.js` extensions (Node ESM), even when importing `.ts` files.
- Several dependencies are newer than most models' training data (React Router 8, Vite 8, Vitest 5, ESLint 10, nodemailer 10). Check the installed types, not memory.
- React 19 types: form handlers take `SubmitEvent`. `FormEvent` is deprecated and fails lint.
- Browsers compile the `pattern` attribute with the RegExp `v` flag, so escape `(`, `)` and `-` inside character classes, or the pattern is silently ignored.
- zod-to-openapi: name schemas with zod's `.meta({ id })`. `extendZodWithOpenApi` only reaches schemas created after it runs.
- Keep `/products/:id` free of fixed sub-paths. Product IDs are opaque strings, so lists live elsewhere (`/top-rated`, `/search`).
