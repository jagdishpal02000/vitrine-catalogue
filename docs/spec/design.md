# Design

How Vitrine meets [the requirements](requirements.md). The reasons behind the main choices are in
[DECISIONS.md](../../DECISIONS.md).

## Overview

```
Browser: React app (apps/web)
   │  same-origin /api/*   (Vite proxy in dev · nginx in Docker · CloudFront on AWS)
   ▼
API: Express 5 (apps/api)
   routes ──► controllers ──► services ──► repositories ──► Fake Store API
   (zod)      (HTTP only)     (rules)      (data access)
                                  └──► infra: mailer (SMTP) · cache · logger · HTTP client
                                                 │
                                                 ▼
                                    Mailpit locally (the "sales inbox"), AWS SES in production
```

Each expected change (C7) has one seam:

| Expected change | Seam | What changes |
|---|---|---|
| Product data source | `ProductRepository` interface | Add one repository file, wire it in `container.ts` |
| Email provider | `Mailer` interface, SMTP settings | Usually just env vars (most providers speak SMTP) |
| Look and feel | `styles/theme.css` design tokens, `config.ts` brand | CSS and components; no data logic |

## API layers

| Layer | Folder | Responsibility |
|---|---|---|
| Routes | `routes/` | Map URLs to controllers; run zod validation and rate limits |
| Controllers | `controllers/` | Read validated input, call one service, send JSON |
| Services | `services/` | Business rules (top rated, category split, enquiry email); no Express |
| Repositories | `repositories/` | The only code that knows the data source |
| Infra | `infra/` | Logger (winston), cache, HTTP client, mailer |
| Shared | `config/`, `constants/`, `models/`, `validators/`, `utils/`, `middlewares/` | Env, limits, zod schemas, helpers, cross-cutting middleware |

Dependencies are passed into factory functions (`createCatalogueService(repository, topRatedIds)`) and wired once in
`container.ts`. Tests build the same objects with an in-memory repository and a fake mailer.

## API contract

Base path `/api`. Every response is JSON. Interactive docs: `/api/docs` (OpenAPI generated from the same zod schemas).

| Method and path | Success | Errors | Used by |
|---|---|---|---|
| `GET /products/top-rated` | `200 Product[]` in the owner's order | | Home |
| `GET /products/search?q=term` | `200 Product[]` | 400 | Search |
| `GET /products/:id` | `200 Product` | 404 | Product page |
| `GET /categories` | `200 Category[]` | | Navigation |
| `GET /categories/:slug/products` | `200 { category, topRated, others }` | 404 | Category page |
| `POST /enquiries` | `202 { message }` | 400, 404, 429, 502 | Enquiry form |
| `GET /health` | `200 { status: "ok" }` | | Docker and load-balancer health checks |

Every error has one shape, produced only by the global error handler:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Some of the details you sent are not valid", "details": [{ "field": "email", "message": "Enter a valid email address" }] } }
```

Upstream failures (Fake Store or email) return `502` with a friendly message. Internals are logged, never returned.

## Domain model

```ts
Category     { slug: string; name: string }            // slug is ours: "mens-clothing"
Product      { id: string; title: string; description: string; price: number;
               imageUrl: string; category: Category; rating?: { average: number; count: number } }
CategoryPage { category: Category; topRated: Product[]; others: Product[] }
```

IDs are opaque strings, so a future source can use SKUs or UUIDs. `rating` is optional because not every source has one.

## Product data: Fake Store repository

- Fake Store has no search and no category slugs, and returns `200` with an empty body for unknown IDs.
  So the repository loads all 20 products in one call, validates them with zod, and maps them to our model.
- The result is cached in memory for 5 minutes. The cache stores the in-flight promise, so concurrent requests share one upstream call.
- All queries (`findById`, `findByCategory`, `findCategories`, `search`) run in memory through
  `createInMemoryProductRepository(loadProducts)`. The tests use that same function with fixture data.
- A database-backed repository would implement the same interface with real queries; nothing above it changes.

## Enquiries

1. The router applies the enquiry rate limit and validates the body (`z.strictObject`, so unknown fields are rejected).
2. The service looks the product up itself. It never trusts product details sent by the browser.
3. The `Mailer` sends a plain-text email to `SALES_INBOX_EMAIL`, with Reply-To set to the customer. Plain text means no HTML injection.
4. A send failure becomes a `502`. The client then shows an error, not "Thank you".

## Security

helmet headers · CORS allowlist from env · 10 kB JSON body limit · general `/api` rate limit plus a strict enquiry limit ·
zod validation on every input, on env and on upstream data · outbound request timeout · the email recipient is fixed by config ·
no request bodies or personal data in logs · secrets only via env.

## Web app

- Routes: `/`, `/categories/:slug`, `/search?q=`, `/products/:id`, and a catch-all not-found page.
- `api/client.ts` is the only place that calls `fetch`. `api/catalogue.ts` holds typed calls and TanStack Query hooks.
- Pages fetch data. Components (`ProductSection`, `ProductCard`, `EnquiryForm`, `QueryStatus`, `Layout`, `SearchBar`) display it.
- Types in `api/types.ts` mirror the API contract on purpose: apps share a contract, not code, across the network.

## Testing

| Level | Tool | Covers |
|---|---|---|
| API unit | Vitest | search matching, catalogue rules, enquiry email, Fake Store mapping and failures |
| API HTTP | Vitest + supertest on `createApp()` | every endpoint's success and error paths, error shape, rate limit, docs |
| Web | Vitest + React Testing Library | one journey per acceptance criterion through the real routes |

## Running and deploying

- Locally: `docker compose up --build` runs `web` (nginx serving the build and proxying `/api`), `api` and `mailpit`.
- On AWS: the API image runs on ECS Fargate or App Runner, the web build on S3 + CloudFront (routing `/api/*` to the API),
  and email goes through SES by changing SMTP settings.
