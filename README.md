# Vitrine

A product catalogue proof of concept. Customers browse and search products, open a product, and send an enquiry that lands in the sales inbox.

It is built as a foundation, not a throwaway. The three things the brief says will change each have one seam:

- the **product data source** is behind `ProductRepository`;
- the **email provider** is behind `Mailer` and SMTP settings;
- the **look and feel** lives in design tokens in `theme.css`.

## Run it

You need Docker Desktop, or Docker Engine with Compose v2.24 or later. No accounts or API keys are needed.

```bash
docker compose up --build
```

The first build takes about a minute. Then open:

| URL                               | What you'll find                                                 |
| --------------------------------- | ---------------------------------------------------------------- |
| http://localhost:8080             | The web app                                                      |
| http://localhost:8025             | Mailpit, the local **sales inbox**, where enquiry emails arrive  |
| http://localhost:8080/api/v1/docs | The API docs (Swagger UI), generated from the validation schemas |

No `.env` file is needed, because every setting has a working default (see [.env.example](.env.example)). Stop the stack with `docker compose down`.

### Try the acceptance criteria

1. **Home page:** the 5 top-rated products are shown. They are the owner's picks, set by `TOP_RATED_PRODUCT_IDS`.
2. **Category page:** click a category in the header. Its top-rated products come first, then the rest.
3. **Search:** type `jacket` and click **Search** to see only matching products. Searching `men` returns no women's products.
4. **Product page:** click any product tile to open its details.
5. **Enquiry:** click **Enquire**, fill in the form and send it. You'll see "Thank you", and the email will be in Mailpit at http://localhost:8025.

## Stack, and why

| Layer   | Choice                                                          | Why                                                                                                                                                 |
| ------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client  | React 19 + TypeScript, Vite, React Router, TanStack Query       | My strongest front-end stack. A single-page app keeps a hard boundary: the browser only ever calls our API, never Fake Store.                       |
| Backend | Node.js 24 + TypeScript, Express 5, zod                         | My strongest back-end stack. Express is the most widely known Node framework, so the code is easy to review and to change.                          |
| Email   | Nodemailer over SMTP; Mailpit locally                           | Reviewers can watch the email arrive without signing up for anything. Production can use any SMTP provider, such as AWS SES, through configuration. |
| Running | Docker Compose with three containers: nginx + web, API, Mailpit | One command for reviewers. The same images run on AWS (ECS or App Runner).                                                                          |

## How it is organised

```
apps/api/      Express API: routes → controllers → services → repositories, plus infra (logger, cache, mailer)
apps/web/      React app: pages, components and the API client
docs/spec/     requirements, design and task plan, written before the code
AGENTS.md      rules for AI coding agents (CLAUDE.md imports it)
DECISIONS.md   assumptions, trade-offs, cuts and next steps
AI_USAGE.md    how AI was used, and where it went wrong
```

```
Browser ─► web (nginx) ─/api─► API: routes ─► controllers ─► services ─► ProductRepository ─► Fake Store
                                                                  └────► Mailer ─► SMTP (Mailpit / SES)
```

[docs/spec/design.md](docs/spec/design.md) has the full design and API contract.

## API

The API is versioned in the URL, so every public endpoint is under `/api/v1`. A future breaking change can ship as `/api/v2` while existing clients, such as a mobile app that can't update straight away, keep using v1. The health check stays unversioned at `/api/health`, so Docker and load balancers never need to change.

| Endpoint                                | Returns                                                        |
| --------------------------------------- | -------------------------------------------------------------- |
| `GET /api/v1/top-rated`                 | The owner's top-rated products, in order                       |
| `GET /api/v1/search?q=term`             | Products matching every word of the term                       |
| `GET /api/v1/products/:id`              | One product (404 if unknown)                                   |
| `GET /api/v1/categories`                | Every category                                                 |
| `GET /api/v1/categories/:slug/products` | `{ category, topRated, others }`                               |
| `POST /api/v1/enquiries`                | 202 once the email is accepted; 400, 404, 429 or 502 otherwise |

Every error has the same shape: `{ "error": { "code", "message", "details"? } }`.

## Configuration

Every variable is optional. [.env.example](.env.example) lists them all with their defaults. The most useful ones:

| Variable                                               | Default                    | Purpose                                         |
| ------------------------------------------------------ | -------------------------- | ----------------------------------------------- |
| `TOP_RATED_PRODUCT_IDS`                                | `12,11,3,18,5`             | The owner's top-rated picks, in display order   |
| `SALES_INBOX_EMAIL`                                    | `sales@example.com`        | Where enquiries are sent                        |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | `localhost`, `1025`        | Mail server: Mailpit locally, SES in production |
| `FAKE_STORE_BASE_URL`                                  | `https://fakestoreapi.com` | The product data source                         |

To change settings under Docker, copy `.env.example` to `.env`, edit it, and run `docker compose up` again. A rebuild isn't needed.

## Develop without Docker

This needs Node.js 24 (`nvm use` picks it up from `.nvmrc`).

```bash
npm install                    # installs both apps and the git hooks
docker compose up -d mailpit   # optional: a local inbox for enquiry emails
npm run dev                    # API on :3000, web on :5173 (Vite forwards /api to the API)
```

## Quality checks

```bash
npm run check   # ESLint (strict, type-aware), Prettier, TypeScript, and all 82 tests
```

- **API tests** (Vitest + supertest): business rules, the Fake Store adapter, and every endpoint's success and error paths.
- **Web tests** (React Testing Library): one journey per acceptance criterion, run through the real routes with only the API stubbed.
- **Git hooks** (Husky):
  - on commit: lint and format the staged files, and check the message follows Conventional Commits (commitlint);
  - before push: typecheck and tests.
- **CI** (GitHub Actions): the same checks, plus building both Docker images and checking every commit message in the pull request.

## Time spent

About **3 hours** in total. The building phase can be checked against the commit timestamps.

| Phase                                                                                               | Time    |
| --------------------------------------------------------------------------------------------------- | ------- |
| Planning: reading the brief, probing Fake Store, researching AI-assisted engineering practice, spec | ~1 h    |
| Building, tests first: API, web, Docker                                                             | ~35 min |
| Testing and checking it works end to end: live Fake Store, Mailpit, Docker                          | ~20 min |
| Independent code review and fixes                                                                   | ~20 min |
| Documentation and my own review of every commit                                                     | ~45 min |
