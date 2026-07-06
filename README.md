# Todo SDD App

A single-user todo application: a NestJS API and a React (Vite) UI sharing
one set of Zod validation schemas, backed by Postgres via Prisma.

## Tech Stack

- TypeScript (strict mode)
- Backend: NestJS
- Frontend: React + Vite
- Validation: Zod (shared between frontend and backend, see `shared/`)
- Database: PostgreSQL, via Prisma
- Testing: Jest + Supertest (backend), Vitest + React Testing Library (frontend)

## Prerequisites

- Node.js and [pnpm](https://pnpm.io/)
- Docker (for the local Postgres container)

## Getting Started

```bash
# 1. From the repo root — installs api, ui, and shared, and links the workspace
pnpm install

# 2. Build the shared Zod-schema package
#    api and ui both consume shared's compiled dist/ output, not its raw source,
#    so rebuild this any time shared/src/ changes.
pnpm --filter shared build

# 3. Start Postgres (docker-compose, defined in api/docker-compose.yml)
cd api
pnpm db:start

# 4. Apply Prisma migrations (creates/updates the todos table)
pnpm exec prisma migrate dev

# 5. Start the backend (NestJS, watch mode) — http://localhost:3000
pnpm start:dev
```

In a second terminal:

```bash
# 6. Start the frontend (Vite) — http://localhost:5173
cd ui
pnpm dev
```

Open **http://localhost:5173**. Vite's dev server proxies `/todos` requests
to the API on port 3000, so no extra CORS setup is needed.

### Stopping

- `Ctrl+C` both dev servers.
- `cd api && pnpm db:stop` to stop Postgres (data persists in a named Docker
  volume, so it survives a restart).

### Known gotcha

If the UI throws a `SyntaxError` about `createTodoSchema` not being exported,
`shared/` wasn't rebuilt after a source change — re-run step 2
(`pnpm --filter shared build`).

## Running Tests

```bash
# backend unit tests
cd api && pnpm test

# backend integration (e2e) tests — requires Postgres running
cd api && pnpm test:e2e

# frontend tests
cd ui && pnpm test
```

## Linting

```bash
cd api && pnpm lint
cd ui && pnpm lint
```

## Project Structure

```text
api/        # NestJS backend
ui/         # React + Vite frontend
shared/     # Zod schemas shared by api and ui
specs/      # Spec-kit feature specs, plans, and tasks
```

See [`specs/001-todo-app/`](./specs/001-todo-app/) for the full feature
specification, implementation plan, data model, API contract, and
validation scenarios (`quickstart.md`) behind the current feature set.
