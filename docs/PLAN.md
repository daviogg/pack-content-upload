# Pack – Resource Upload Challenge: Implementation Plan

Goal: upload form + table of uploaded resources, SvelteKit + TypeScript + PostgreSQL,
built with DDD tactical patterns inside a hexagonal (ports & adapters) architecture.

## 1. Domain model

Single bounded context: **Content Library**. One aggregate: `Resource`.

| Concept            | Kind           | Rules                                                                                                          |
| ------------------ | -------------- | -------------------------------------------------------------------------------------------------------------- |
| `Resource`         | Aggregate root | identity `ResourceId` (uuid), created at, view count                                                           |
| `Title`            | Value object   | non-empty, trimmed, max 200 chars                                                                              |
| `Description`      | Value object   | non-empty, trimmed, max 1000 chars                                                                             |
| `Category`         | Value object   | closed list: Leadership, Managing Complexity, Communication, Conflict Resolution, …                            |
| `Language`         | Value object   | ISO 639-1 subset: en, it, es, fr, de, pt                                                                       |
| `Provider`         | Value object   | closed list: Skilla, Linkedin, Pack, Mentor                                                                    |
| `Roles`            | Value object   | non-empty set of `Mentor/Coach`, `Mentee/Coachee`                                                              |
| `StoredFile`       | Value object   | storage key, original name, mime type, size, `kind` (pdf, video, text, slides, image, other) derived from mime |
| `ResourceUploaded` | Domain event   | emitted by `Resource.upload(...)` factory (kept simple)                                                        |

Invariants live in the value objects; constructors throw typed `DomainError`s, the
aggregate can never exist in an invalid state. Domain layer has **zero dependencies**
(no SvelteKit, no Drizzle, no Node APIs).

### Ports (interfaces owned by the domain/application)

- `ResourceRepository` – `save`, `findById`, `findAll`, `incrementViewCount`
- `FileStorage` – `put(stream, meta) -> key`, `getUrl(key)` or `read(key)`, `delete(key)`
- `Clock`, `IdGenerator` – tiny, make tests deterministic

## 2. Hexagonal layout

```
src/lib/
  domain/                     # entities, value objects, events, ports, errors  (pure TS)
  application/                # use cases (commands/queries), DTOs, result types
    UploadResource, ListResources, GetResource, OpenResourceFile
  infrastructure/             # secondary (driven) adapters
    persistence/drizzle/      # schema, migrations, DrizzleResourceRepository
    storage/                  # LocalFileStorage (disk), S3FileStorage (R2 / S3)
    container.ts              # composition root: wires adapters from env
src/routes/                   # primary (driving) adapters = SvelteKit pages/actions/endpoints
  +page.svelte / +page.server.ts        # table + upload modal (form action)
  resources/[id]/                       # detail + in-platform viewer
  files/[id]/+server.ts                 # streams file / redirects to signed URL
tests/
  unit (domain + application with in-memory fakes), integration (Postgres), e2e (Playwright)
```

Dependency rule: `routes -> application -> domain <- infrastructure`. Nothing inside
`domain`/`application` imports from `infrastructure` or `routes`.

## 3. Steps (one commit each, approval between steps)

| #   | Step                 | Output                                                                                                                                                                         |
| --- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0   | Prerequisites (user) | Docker Desktop running; `flyctl` installed + logged in; Cloudflare R2 bucket + API token                                                                                       |
| 1   | Scaffold             | SvelteKit (TS, Tailwind, Vitest, Playwright, adapter-node, Drizzle/postgres.js), `.nvmrc`=22, git init, private GitHub repo `daviogg/pack-content-upload`, this plan committed |
| 2   | Domain               | value objects, `Resource` aggregate, ports, errors, unit tests                                                                                                                 |
| 3   | Application          | 4 use cases + in-memory fakes + tests                                                                                                                                          |
| 4   | Persistence          | Drizzle schema + migration, `DrizzleResourceRepository`, `docker-compose` (Postgres), integration test                                                                         |
| 5   | UI: list + upload    | table (mockup 3), upload modal (mockups 1–2), form action, validation errors, success toast                                                                                    |
| 6   | UI: viewer           | row click → detail page, inline PDF/video/text/image, download fallback, view count                                                                                            |
| 7   | Storage + packaging  | `LocalFileStorage`, `S3FileStorage` (R2), env switch, Dockerfile, full compose (`docker compose up` = everything), README                                                      |
| 8   | Quality              | Playwright smoke (upload → row → open), GitHub Actions (lint, check, test)                                                                                                     |
| 9   | Deploy               | Fly.io app + Fly Postgres + R2 secrets, URL in README                                                                                                                          |
| 10  | Wrap-up              | final review, ADR notes, decide repo visibility, submit                                                                                                                        |

## 4. Decisions / assumptions (to confirm)

- **Closed lists as value objects**, not DB lookup tables: brief says "…" so lists are
  illustrative; enums in domain keep it simple and type-safe. Easy to swap later.
- **Table columns**: mockup shows Path / View Count / Uploaded By. No auth in scope, so
  columns become: Title, Category, Language, Roles, View Count, Provider, Type. "Uploaded By" omitted.
- **Tabs** All / Videos / Documents / Lessons are filters on `StoredFile.kind`; Archive disabled.
- **File limits**: max 200 MB, allowed mime whitelist (pdf, txt/md, mp4/webm, ppt/pptx/key, images).
  adapter-node needs `BODY_SIZE_LIMIT` raised (default 512 KB).
- **Storage**: `STORAGE_DRIVER=local|s3`. Local writes under `./data/uploads` (Docker volume).
  S3 driver = R2 via `@aws-sdk/client-s3`, private bucket, files served via short-lived signed URLs.
- **No auth**: out of scope; "Uploaded By" left out rather than faked.
