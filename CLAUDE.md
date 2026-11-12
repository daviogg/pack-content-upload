# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Node 22 (`.nvmrc`). PostgreSQL comes from Docker: `docker compose up -d db`.

```bash
npm run dev                     # dev server, http://localhost:5173
docker compose up               # full stack (app + db), http://localhost:3000
npm run lint                    # prettier --check + eslint
npm run format                  # prettier --write
npm run check                   # svelte-kit sync + svelte-check
npm run test:unit -- --run      # vitest "unit" project (without --run it watches)
npm run test:integration        # vitest "integration" project, needs Postgres
npx playwright test             # e2e against the production build, needs Postgres
npm run db:generate             # new SQL migration in ./drizzle after editing schema.ts
```

Single test:

```bash
npx vitest run --project unit src/lib/domain/resource/Title.test.ts
npx vitest run --project unit -t "test name"
npx playwright test e2e/upload.e2e.ts -g "test name"
```

CI (`.github/workflows/ci.yml`) runs lint, check, unit, integration, e2e in that order on every
pull request; a push to `main` then deploys to Fly.io.

## Test setup

- Vitest has two projects, defined in `vite.config.ts`: `unit` matches `src/**/*.test.ts`,
  `integration` matches `src/**/*.integration.test.ts`. `expect.requireAssertions` is on, so
  a test without an assertion fails.
- Integration and e2e tests wipe tables. They use `TEST_DATABASE_URL` (`pack_test`), never
  `DATABASE_URL`. `pack_test` is created by `docker/initdb/01-test-database.sql`, which only
  runs when the Postgres volume is first created; on an older volume run that file by hand.
- Playwright builds the app and runs `node build` on port 4173 with its own environment
  (`playwright.config.ts`): local storage in `./data/e2e-uploads`, `ADMIN_PASSWORD=e2e-admin`.
  Outside CI it reuses a server already listening on 4173, so stop a stale one to test new code.
- Use cases are unit-tested with the fakes in `src/lib/testing/fakes/` (in-memory repository
  and storage, fixed clock, sequential ids), not with mocks.

## Architecture

DDD tactical patterns in a hexagonal layout. Dependency rule:
`routes → application → domain ← infrastructure`. Nothing in `domain` or `application`
imports from `infrastructure`, `routes` or SvelteKit.

- `src/lib/domain/` is pure TypeScript. One aggregate, `Resource`, whose fields are value
  objects (`Title`, `Description`, `Category`, `Language`, `Provider`, `Roles`, `StoredFile`).
  Each value object has a private constructor and a `create()` factory that enforces its rules
  and throws `DomainError(code, message, field)`. `Resource.upload()` creates a new resource,
  `Resource.reconstitute()` rebuilds one from the database without re-running rules.
- Category, language, provider and roles are closed lists held in the value objects, not
  database tables.
- `src/lib/application/` holds the use cases (`UploadResource`, `ListResources`,
  `ViewResource`, `OpenResourceFile`, `DeleteResource`), the ports they need (`FileStorage`,
  `Clock`, `IdGenerator`; `ResourceRepository` lives in the domain) and the DTOs handed to the
  UI. Use cases take plain strings and build the value objects themselves.
- `src/lib/infrastructure/` holds the adapters: Drizzle repository, `LocalFileStorage`,
  `S3FileStorage` (Cloudflare R2), `AdminSession`.
- `src/lib/infrastructure/container.ts` is the composition root and the only place where ports
  meet adapters. Routes reach everything through `container.<useCase>.execute(...)`.
- `src/routes/` are the primary adapters. A `+page.server.ts` action reads the form, calls a
  use case, and turns a `DomainError` into `fail(400, { values, error: { field, message } })`
  so the form can mark the right input. Other errors are rethrown.
- `src/lib/ui/` holds Svelte components plus view helpers (`uploadForm.ts`, `tabs.ts`) that
  translate between forms/URLs and the domain.

Flows that span several files:

- **Upload** (`UploadResource`): build every value object first, then write the bytes to
  storage, then save the aggregate. If the save fails the bytes are deleted again.
- **File serving** (`/files/[id]`, `OpenResourceFile`): the storage adapter either returns a
  signed URL (S3/R2, the route redirects) or `null` (local disk, the route streams the file).
  `?download=1` switches the disposition from inline to attachment.
- **Admin**: `ADMIN_PASSWORD` unset means no administrator (`container.adminSession` is
  `null`). Login sets a stateless HMAC-signed cookie; `handle` in `src/hooks.server.ts`
  verifies it on every request and sets `locals.isAdmin`, which gates deletion.
- **Migrations**: `init` in `src/hooks.server.ts` applies the SQL in `./drizzle` at server
  start. A schema change is an edit to `persistence/drizzle/schema.ts` plus
  `npm run db:generate`.
- **List page state** lives in the URL (`?tab=`, `?q=`, `?upload=1`, `?uploaded=1`,
  `?deleted=1`) so the page works without client-side JavaScript. Keep forms working as plain
  HTML posts.

## Project conventions

- SvelteKit 3: there is no `svelte.config.js`. Kit options (adapter-node, forced runes mode,
  `paths.origin`) are passed to `sveltekit()` in `vite.config.ts`.
- Environment variables are declared and validated once in `src/env.ts` and imported, typed,
  from `$app/env/private`. A new variable goes in `src/env.ts`, `.env.example` and, when the
  container needs it, `docker-compose.yml`.
- `ORIGIN` is read at build time for the CSRF check on form posts. `BODY_SIZE_LIMIT` must stay
  at 200 MB or more for adapter-node to accept uploads.
- Imports: routes use the `#lib/...` subpath alias with the `.ts` extension
  (`#lib/infrastructure/container.ts`); files inside `src/lib` use relative imports without
  an extension.
- Svelte 5 runes only. Styling is Tailwind 4; class order is fixed by the prettier plugin.
- `docs/PLAN.md` records the design decisions and assumptions behind the model.
