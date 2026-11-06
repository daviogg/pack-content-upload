# Pack · Resource Upload

Take-home challenge: upload a learning resource (title, description, category, language,
provider, roles, file) and browse the uploaded resources in a table. Clicking a row opens the
resource with an in-platform viewer (PDF, text, video, images) and a download button.

Stack: SvelteKit 3 · Svelte 5 · TypeScript · PostgreSQL (Drizzle ORM) · Tailwind · Docker.
Architecture: DDD + hexagonal (ports & adapters). Planning notes in [docs/PLAN.md](docs/PLAN.md).

## Quick start (Docker, one command)

Requirements: Docker.

```bash
docker compose up
```

Open http://localhost:3000. This builds the app image, starts PostgreSQL, applies the database
migrations and stores uploaded files in a Docker volume (`uploads`).

## Development

Requirements: Node 22 (`nvm use`), Docker (for PostgreSQL).

```bash
cp .env.example .env          # defaults work out of the box
docker compose up -d db       # PostgreSQL on localhost:5432
npm install
npm run dev                   # http://localhost:5173
```

Tables are created automatically on first start (migrations run from `src/hooks.server.ts`).
Uploaded files go to `./data/uploads` with the default local storage driver.

## Configuration

All variables are declared once in `src/env.ts` and validated at startup.

| Variable               | Default          | Purpose                                                         |
| ---------------------- | ---------------- | --------------------------------------------------------------- |
| `DATABASE_URL`         | required         | PostgreSQL connection string                                    |
| `STORAGE_DRIVER`       | `local`          | `local` (disk) or `s3` (Cloudflare R2 / any S3-compatible)      |
| `LOCAL_STORAGE_DIR`    | `./data/uploads` | Where the local driver writes files                             |
| `S3_BUCKET`            |                  | Bucket name (s3 driver)                                         |
| `S3_ENDPOINT`          |                  | R2: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`             |
| `S3_REGION`            | `auto`           | `auto` for R2                                                   |
| `S3_ACCESS_KEY_ID`     |                  | R2 API token (Object Read & Write)                              |
| `S3_SECRET_ACCESS_KEY` |                  |                                                                 |
| `ORIGIN`               |                  | Public URL, **baked in at build time** for CSRF checks on forms |
| `BODY_SIZE_LIMIT`      | `209715200`      | Max request body for the Node adapter (200 MB uploads)          |

### Cloud storage (Cloudflare R2) with local fallback

With `STORAGE_DRIVER=s3` files are uploaded to a **private** bucket. When a user opens a file
the app signs a short-lived URL (15 minutes) and redirects the browser to it, so bytes never
flow through the app server. The signed URL pins `Content-Type` and `Content-Disposition`,
so "Open" (inline) and "Download" (attachment) behave exactly like the local driver, which
streams the file through `/files/<id>` instead.

To use R2 locally, create a bucket and an API token in the Cloudflare dashboard, fill the
`S3_*` variables in `.env` and set `STORAGE_DRIVER=s3`. `docker compose` reads the same
`.env`, so the container picks up the same configuration.

## How a request flows

```
browser ──POST ?/upload──▶ src/routes/+page.server.ts        (primary adapter: form action)
                             └─▶ UploadResource (use case)
                                   ├─ Title/Description/Category/… value objects (domain validation)
                                   ├─ FileStorage.put(key, blob)      ──▶ LocalFileStorage | S3FileStorage
                                   ├─ Resource.upload(...)            (aggregate root)
                                   └─ ResourceRepository.save(...)    ──▶ DrizzleResourceRepository (PostgreSQL)

browser ──GET /files/<id>──▶ src/routes/files/[id]/+server.ts
                             └─▶ OpenResourceFile ──▶ signed URL (redirect) | stream with headers
```

Dependency rule: `routes → application → domain ← infrastructure`. The domain and the
application layer know nothing about SvelteKit, Drizzle or S3; they only see ports
(`ResourceRepository`, `FileStorage`, `Clock`, `IdGenerator`). Adapters implement the ports
and `src/lib/infrastructure/container.ts` wires them together once per process.

Validation errors are `DomainError`s with a `field`; the form action turns them into a
`fail(400)` so the modal highlights the field and keeps the values typed so far.

## Project layout

```
src/lib/domain/          Resource aggregate, value objects, DomainError, repository port   (pure TS)
src/lib/application/     use cases (Upload/List/View/OpenResourceFile), ports, DTOs
src/lib/infrastructure/  Drizzle repository + migrations, Local/S3 file storage, container
src/lib/testing/fakes/   in-memory adapters used by unit tests
src/lib/ui/              Svelte components (table, upload modal, viewer) and view helpers
src/routes/              SvelteKit pages and endpoints = primary adapters (load / actions / GET)
drizzle/                 SQL migrations generated by drizzle-kit
```

## Tests

```bash
npm run test:unit             # domain + application + adapters with fakes, no infrastructure
npm run test:integration      # Drizzle repository against Postgres (docker compose up -d db)
npm run lint && npm run check # prettier + eslint, svelte-check
```

## Decisions and assumptions

- **Closed lists as domain value objects** (category, language, provider, roles): the brief
  shows them as illustrative dropdowns, so a typed enum in the domain keeps validation in one
  place. Swapping to DB lookup tables would only touch the value object and the form options.
- **Roles are mandatory**: at least one of Mentor / Coach, Mentee / Coachee.
- **File rules**: max 200 MB, whitelisted MIME types (PDF, text/markdown, MP4/WebM,
  PowerPoint/Keynote, images). The _kind_ derived from the MIME type drives the tabs
  (Videos / Documents / Lessons) and the viewer.
- **No authentication** is in scope, so the "Uploaded By" column from the mockup is left out
  rather than faked. "View Count" increments every time the detail page is opened.
- **Migrations run at startup** so a fresh `docker compose up` needs no extra command.
- **ORM**: Drizzle keeps the SQL explicit (schema file + generated migrations) while giving
  typed rows; the repository is the only place that knows about it.
