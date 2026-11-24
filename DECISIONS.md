# Decisions and assumptions

The acceptance criteria leave deliberate gaps. This file records how I filled them, what I cut, how the design grows beyond the proof of concept, and what I'd do next. The same assumptions appear as numbered requirements in [docs/spec/requirements.md](docs/spec/requirements.md).

## Assumptions

1. **"I have chosen 5 products to be top rated."**
   - "I" is the business owner, and "top rated" is the owner's choice rather than something calculated. The words "I have chosen" say so.
   - The picks are an ordered list of product IDs in config (`TOP_RATED_PRODUCT_IDS`). There is no admin screen.
   - The default picks are the 5 best-rated Fake Store products (IDs 12, 11, 3, 18 and 5), which happen to cover all 4 categories.
   - If a pick no longer exists, it is skipped and logged rather than breaking the home page.
2. **"Top rated products for that category … and additional products."**
   - The category page shows the owner's picks that belong to the category first, in the owner's order, then every other product in the category.
   - If the owner picked nothing in a category, its 3 best products by customer rating fill in, so the section is never empty. This keeps one meaning of "top rated" everywhere.
3. **"Products that have text matching that search term."**
   - Matching ignores case and apostrophes. Every word of the term must match the start of a word in the title, description or category.
   - Plain substring matching would make "men" return every women's product, which no customer expects. Word-start matching means "jack" still finds jackets.
   - A search runs from the button or the Enter key. Terms must be 1 to 100 characters.
   - The URL holds the term (`/search?q=…`), so results can be shared and the Back button works.
4. **Product IDs and URLs.** Product IDs are opaque strings, not Fake Store's numbers, and categories get our own URL slugs (`mens-clothing`). The next data source might use SKUs or UUIDs.
5. **Enquiry.**
   - The form asks for name and email (required), and phone and message (optional).
   - The email goes to `SALES_INBOX_EMAIL`, with Reply-To set to the customer, so sales can simply reply.
   - The server looks up the product itself and never trusts product details sent by the browser.
   - "Thank you" appears only once the mail server has accepted the email. If sending fails, the customer sees an error and can retry. They are never thanked for an enquiry that was lost.
   - There is no confirmation email to the customer, because the criterion doesn't ask for one.
6. **The "sales inbox" locally** is Mailpit. It is free and needs no account, so a reviewer can see the email arrive.
7. **Product images** load from Fake Store's image URLs. I count these as static files, not as calling the Fake Store API, which constraint 2 rules out. In production, images would come from our own CDN.
8. **Other assumptions.**
   - Prices are for display only, in US dollars.
   - The interface text is in British English, matching the brief ("catalogue", "enquiry").
   - Category names are shown as Fake Store spells them, including "jewelery".
   - There is no login, cart, paging (20 products) or translation.

## Dropped or simplified, and why

| Cut                                          | Why                                                                                                                      | What it costs                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| No database; enquiries are not stored        | The criterion only needs the email. The sales inbox is the record, and a failed send is shown so the customer can retry. | An email outage that lasts longer than the customer's patience loses the lead |
| No admin screen for top-rated picks          | A config value meets "I have chosen" without an auth system                                                              | Changing the picks needs a config change and a restart                        |
| No infrastructure as code                    | The brief makes infrastructure optional; Docker Compose covers local running                                             | The AWS deployment below is described but not automated                       |
| No server-side rendering                     | A single-page app is enough for the PoC and keeps a clean API boundary                                                   | No SEO yet                                                                    |
| No browser end-to-end tests                  | Journey tests cover every criterion in jsdom, and the Docker stack was checked by hand against live data and Mailpit     | No automated test of the real browser, nginx and Mailpit together             |
| Plain-text email, no HTML template           | Nothing a customer types can be rendered as HTML, and the brand isn't designed yet                                       | The email is plain                                                            |
| Rate limiting, no CAPTCHA                    | Enough for a PoC without a third-party account                                                                           | Bots that rotate IP addresses get through                                     |
| Cache and rate-limit counters held in memory | One API instance needs no Redis                                                                                          | Several instances would each keep their own counts                            |

## Key technical decisions

| Decision                                                                                                                          | Why                                                                                                                                                                     | Trade-off                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Separate React app and Express API, talking only over `/api`                                                                      | The clear boundaries the brief asks for, and any future client (iOS, Android) uses the same API                                                                         | Two apps to run, made easy by Compose                                                                 |
| Express 5, not Fastify or NestJS                                                                                                  | It's the stack I know best (the follow-up includes a live change), and it is ubiquitous. Express 5 passes errors from async handlers to the error handler automatically | Security headers, rate limits and validation are assembled from middleware                            |
| Layered API built from factory functions, wired in `container.ts`                                                                 | Easy to read: dependencies go in as arguments, there are no classes and no `this` binding problems, and tests pass in fakes                                             | The wiring is written by hand instead of done by a DI framework                                       |
| Fake Store adapter loads all products once and answers queries in memory                                                          | Fake Store has no search, and it returns HTTP 200 with an empty body for unknown IDs. There are only 20 products.                                                       | Wrong for a big catalogue, but a database repository would run real queries behind the same interface |
| 5-minute in-memory cache that stores in-flight promises                                                                           | Each Fake Store call takes about 0.7 s. Concurrent requests share one call, and failed calls are not cached.                                                            | Data can be up to 5 minutes old, and each instance has its own cache                                  |
| zod at every boundary: requests, env and upstream data                                                                            | One way to validate everything. Bad config fails at startup, and unexpected upstream data becomes a clean 502.                                                          | The rules are written in zod, not in the routes                                                       |
| OpenAPI docs generated from the same zod schemas                                                                                  | The docs cannot drift from what the API accepts                                                                                                                         | Adds `zod-to-openapi` as a dependency                                                                 |
| JSON endpoints shaped by a screen where a business rule is involved (`/categories/:slug/products` returns `{ topRated, others }`) | The top-rated rule lives once, on the server; a mobile app reuses it                                                                                                    | Slightly less generic than plain lists                                                                |
| `/top-rated` and `/search` sit outside `/products/`                                                                               | Product IDs are opaque strings, so `/products/:id` must not reserve words (code review found the original routes collided)                                              | Paths are less nested                                                                                 |
| Web types mirror the API contract instead of sharing a package                                                                    | Apps share a contract (OpenAPI) across the network, not code. A Swift or Kotlin client couldn't share TypeScript anyway.                                                | The types could drift. Next step: generate them from `/api/docs.json`                                 |
| Design tokens plus CSS Modules, no UI kit                                                                                         | The look will be replaced by the creative agency's work. Tokens make that one file, with no fighting a kit's styles.                                                    | Components are styled by hand                                                                         |
| TypeScript pinned to 6.0                                                                                                          | `typescript@latest` (7.x) is outside typescript-eslint's supported range                                                                                                | Upgrade once typescript-eslint supports 7                                                             |

## How the design grows beyond the PoC

- **A new product data source** (a database, Shopify, a PIM):
  - implement `ProductRepository`, for example `createPostgresProductRepository`, using real queries;
  - change the one line in `container.ts`.

  Services, controllers, the web app and the tests don't change. The in-memory repository shows the interface is enough.

- **A new email provider:** any SMTP provider (SES, SendGrid, Postmark) is just environment variables. A provider API can be added as another `Mailer` implementation.
- **A new look and feel:** replace the tokens in `apps/web/src/styles/theme.css` and the brand in `apps/web/src/config.ts`. Components only use the tokens.
- **New clients:** iOS and Android call the same JSON API. The OpenAPI document at `/api/docs.json` can generate their client code.
- **Scale:** the API is stateless, so containers can sit behind a load balancer. The cache and rate-limit counters move to Redis (ElastiCache) behind the same `Cache` interface.
- **AWS deployment:**
  - the API image on ECS Fargate or App Runner;
  - the web build on S3 + CloudFront, with `/api/*` routed to the API's load balancer;
  - SES for email, Secrets Manager for SMTP credentials;
  - CloudWatch for the JSON logs, which the production logger already writes.

## What I'd do next with another day

1. **Never lose a lead:** store each enquiry in PostgreSQL (RDS), then send the email from a queue (an outbox table, or SQS) with retries.
2. **Owner admin:** a signed-in screen for choosing the top-rated picks, stored in the database instead of config.
3. **End-to-end tests:** a Playwright test of the enquiry journey against Docker Compose, checking the email arrived through Mailpit's API, run in CI.
4. **Generated client types:** web app types generated from the OpenAPI document, so a contract change breaks the build instead of production.
5. **Observability:** request IDs in logs, metrics, and alerts on 5xx and upstream failures.
6. **Infrastructure as code:** AWS CDK (or Terraform) for the deployment above.
7. **Better form errors:** show each field's server message next to the field, not one summary line.
8. **Polish:** an accessibility and performance pass with axe and Lighthouse, responsive images, and search ranking (title matches first).
