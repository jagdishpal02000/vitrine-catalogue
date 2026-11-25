# AI usage

## Tools and models

- **Claude Code** (VS Code extension) running **Claude Opus 5.5** (`claude-opus-5-5`). I used it for research, planning, implementation, tests and documentation.
- Claude Code features used:
  - **plan mode**, so we agreed a plan before any code was written;
  - **web search and fetch**, to research current practice and read library docs;
  - the **`/code-review`** skill, which reviews the branch in fresh-context subagents that never saw our conversation.
- Commits are authored under my GitHub account. Claude Code wrote the code under my direction; I made the decisions and reviewed the result. This file is the disclosure.

## Agent instruction files

- [AGENTS.md](AGENTS.md) holds the tool-agnostic rules. It follows the AGENTS.md open standard, so Codex, Cursor or Copilot would get the same rules. It covers:
  - commands;
  - layer boundaries;
  - coding and testing standards (for example, "never delete, skip or weaken a failing test");
  - a **Gotchas** list, which grew during the build as mistakes were caught.
- [CLAUDE.md](CLAUDE.md) imports AGENTS.md (`@AGENTS.md`) and adds Claude-specific notes.
- Both are deliberately short. Anthropic's guidance is to keep them under about 200 lines and to include only what the agent can't learn by reading the code.

## Plan and spec

Before writing any code I asked for research into how teams build software with AI agents today. The sources agree on one approach: **spec → plan → small tasks → automated checks → human review → commit**, not "one prompt, whole app".

| Source                                                                                                                                                       | What I took from it                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| [Anthropic: Claude Code best practices](https://code.claude.com/docs/en/best-practices)                                                                      | Give the agent a pass/fail check to run; keep CLAUDE.md short; review with a fresh-context reviewer  |
| [GitHub Spec Kit](https://github.github.com/spec-kit/), [AWS Kiro](https://kiro.dev/docs/specs/concepts)                                                     | Requirements → design → tasks, written down before the code                                          |
| [OpenAI: building an AI-native engineering team](https://developers.openai.com/codex/guides/build-ai-native-engineering-team)                                | Agents draft; engineers own the architecture, trade-offs and final review; tests first               |
| [DORA 2025](https://dora.dev/dora-report-2025/), [Thoughtworks Radar](https://www.thoughtworks.com/radar/techniques/complacency-with-ai-generated-code)      | AI amplifies the practices a team already has; complacency with AI-generated code is an anti-pattern |
| [Kent Beck](https://www.kentbeck.com/summaries/augmented-coding-beyond-the-vibes/), [Simon Willison](https://simonwillison.net/2025/Oct/7/vibe-engineering/) | Tests and review are what separate engineering from "vibe coding"; watch for agents weakening tests  |

What that produced:

- **The spec**, in the Kiro and Spec Kit shape, committed before any code:
  - [requirements.md](docs/spec/requirements.md): the acceptance criteria rewritten in EARS form, with my assumptions;
  - [design.md](docs/spec/design.md): the architecture, the seams and the API contract;
  - [tasks.md](docs/spec/tasks.md): 22 small tasks, each built as one or two commits and ticked off when done.
- **Automated checks rather than rules on paper:** strict TypeScript, type-aware ESLint (`strictTypeChecked`), Prettier, Husky hooks, commitlint, and CI on the pull request.
- **Tests first for the business rules** (search, top rated, enquiry). Each failing test was seen to fail before the code was written.

## Key prompts and moments

Prompts are lightly edited for spelling.

1. **"Let's first discuss, then start the implementation."** The AI read the brief and probed the real Fake Store API before proposing anything. That's how we found that unknown products return HTTP 200 with an empty body, that there is no search endpoint, and that plain substring search for "men" also matches "women".
2. **"Do deep research on industry standards and good practice for coding with AI agents: what are the bigger players doing?"** This turned the workflow from "plan, then generate everything" into the spec-first, test-first, small-commit process above.
3. **"Follow strict coding standards … zod at router level … don't write complex code, it should be easy for me to understand … DRY, a global error handler, winston. My experience is in Express."** I overrode the AI's Fastify recommendation, because I'll be changing this code live in the interview. My simplicity rules shaped the design: factory functions instead of classes or DI frameworks, one error handler, and one place for each concern.
4. **"Do we really need to send pages from the API, or is just data fine? A mobile app can just make API calls, right?"** I challenged the AI's wording. The result is JSON only, with screen-shaped responses limited to where a business rule lives (the category page's top-rated split).
5. **"Commit step by step, following industry standards for commit messages and branch names."** This gave us a feature branch, small Conventional Commits made as each slice was finished, and hooks that check every message.

## Where the AI got it wrong, and how it was caught

| What went wrong                                                                                                                                                 | Caught by                                                                | Fix                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| It recommended Fastify                                                                                                                                          | Me: I know Express best, and I'll change this code live in the interview | Express 5. The framework only touches the routing layer                                                |
| It described the API as returning "pages"                                                                                                                       | Me: I challenged it                                                      | Clarified as JSON only, see prompt 4                                                                   |
| Its finished API had no versioning, which an API that future mobile apps will depend on needs                                                                   | Me, reviewing the finished API: "haven't we added versioning?"           | Public endpoints moved under `/api/v1` with the health check left unversioned, plus tests pinning both |
| Its default install would have pulled in `typescript@latest` (7.x), which typescript-eslint doesn't support                                                     | Checking the packages' supported versions before installing              | TypeScript pinned to 6.0                                                                               |
| It wrote commit bodies longer than commitlint allows                                                                                                            | The commit-msg hook rejected the commit                                  | Wrapped at 72 characters, and rewrapped the earlier, unpushed commits                                  |
| It assumed zod-to-openapi works without `extendZodWithOpenApi`. In fact zod 4 copies methods onto each schema when it is created, so the setup has to run first | Failing tests (`zodSchema.openapi is not a function`)                    | Named the schemas with zod's own `.meta({ id })` instead                                               |
| It used React's `FormEvent`, which React 19 deprecates                                                                                                          | ESLint `no-deprecated`                                                   | Switched to `SubmitEvent`                                                                              |
| It wrote a test that checked the page before the data had loaded                                                                                                | The test failed                                                          | The test now waits for the link itself                                                                 |
| `/products/top-rated` and `/products/search` collided with `/products/:id`, and shared a web cache key, so the product page could crash                         | Independent `/code-review`                                               | Moved to `/top-rated` and `/search`, gave each query its own cache key, added a regression test        |
| A failed background refresh replaced a loaded page, losing a half-filled enquiry form                                                                           | `/code-review`                                                           | Data is shown first and errors only when there's nothing to show; added a test                         |
| The phone field's `pattern` was invalid under the RegExp `v` flag that browsers use, so browsers ignored it                                                     | `/code-review`, confirmed by compiling the pattern in Node               | Escaped the pattern                                                                                    |
| The search box kept the old term after Back                                                                                                                     | `/code-review`                                                           | Reset the search bar with a React `key`; the new test was shown to fail without the fix                |
| Field limits were hard-coded, against our own AGENTS.md rule, plus three smaller issues (a misleading error message, a cache race, a noisy log)                 | `/code-review`                                                           | Fixed, each with a regression test                                                                     |

I didn't apply one review suggestion: making nginx look up the API's address again after the API container restarts. It only matters if that container crashes during local use, and the fix adds a Docker DNS detail to explain. I recorded it as an accepted risk.

## Checked rather than assumed

- **Fake Store's real behaviour**, by calling it before designing anything: empty-body 404s, about 0.7 s per call, the category names.
- **The repository against the live API**, and **a real email through Mailpit**, before any UI existed.
- **Libraries newer than the model's training data** (Express 5, zod 4, nodemailer 10, React Router 8, Vite 8, ESLint 10), by reading the installed type definitions and generating the official Vite template rather than writing config from memory.
- **Two false alarms checked before acting:**
  - a lint error on winston's types turned out to be a typings quirk, so it was suppressed with a written reason;
  - `npm install` into a brand-new workspace silently didn't record the dependencies, so `package.json` was checked after every install.
- **Every acceptance criterion through the full Docker stack**, which built and started in 39 seconds.
- **Before opening the pull request**, I read every commit on the branch.
