# Pack · Resource Upload

Take-home challenge: upload a learning resource (title, description, category, language,
provider, roles, file) and browse the uploaded resources in a table.

Stack: SvelteKit 3 · Svelte 5 · TypeScript · PostgreSQL (Drizzle) · Tailwind.
Architecture: DDD + hexagonal (ports & adapters). See [docs/PLAN.md](docs/PLAN.md).

## Run locally (development)

Requirements: Node 22 (`nvm use`), Docker.

```bash
cp .env.example .env          # defaults work out of the box
docker compose up -d db       # PostgreSQL on localhost:5432
npm install
npm run dev                   # http://localhost:5173
```

Database tables are created automatically on first start. Uploaded files are written to
`./data/uploads` (local storage driver).

## Tests

```bash
npm run test:unit             # domain + application, no infrastructure needed
npm run test:integration      # Postgres repository, needs `docker compose up -d db`
```

## Project layout

```
src/lib/domain/          entities, value objects, ports        (pure TypeScript)
src/lib/application/     use cases + DTOs                      (depends on domain only)
src/lib/infrastructure/  Drizzle repository, file storage, composition root
src/lib/ui/              Svelte components and view helpers
src/routes/              SvelteKit pages = primary adapters (load / form actions)
```
