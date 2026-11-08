# Pack · Resource Upload

Upload a learning resource (title, description, category, language, provider, roles, file)
and browse the uploaded resources in a table. A row opens the resource with an in-platform
viewer and a download button.

Live: **https://pack-content-upload.fly.dev** (sleeps when idle, first request takes a moment).

Stack: SvelteKit 3 · TypeScript · PostgreSQL (Drizzle) · Tailwind · Docker.
Architecture: DDD + hexagonal (ports & adapters). Plan and decisions: [docs/PLAN.md](docs/PLAN.md).

## Run it

```bash
docker compose up            # http://localhost:3000
```

Development (Node 22, Docker for PostgreSQL):

```bash
cp .env.example .env
docker compose up -d db
npm install
npm run dev                  # http://localhost:5173
```

Migrations run at startup. Files go to `./data/uploads`; set `STORAGE_DRIVER=s3` and the
`S3_*` variables in `.env` to use Cloudflare R2 (private bucket, signed URLs). Every
variable is documented in `.env.example` and validated in `src/env.ts`.

## Tests

```bash
npm run lint && npm run check   # prettier, eslint, svelte-check
npm run test:unit -- --run      # domain, use cases, adapters with fakes
npm run test:integration        # Drizzle repository against Postgres
npx playwright test             # end-to-end against the production build
```

## Layout

```
src/lib/domain/          Resource aggregate, value objects, repository port   (pure TS)
src/lib/application/     use cases, ports (FileStorage, Clock, IdGenerator), DTOs
src/lib/infrastructure/  Drizzle repository, local / S3 file storage, container
src/lib/ui/              Svelte components and view helpers
src/routes/              SvelteKit pages and endpoints (load / actions / GET)
```

Dependency rule: `routes → application → domain ← infrastructure`.

## Delivery

GitHub Actions runs lint, type check, unit, integration and e2e on every pull request;
merging to `main` deploys to Fly.io (`fly.toml`, Fly Postgres, Cloudflare R2).

## Assumptions

- Closed lists (category, language, provider, roles) are domain value objects.
- At least one role is required; files up to 200 MB from a MIME whitelist.
- No authentication, so the "Uploaded By" column is left out. View count increments when
  the detail page is opened.
