# API Contract: Settings

Base path: `/settings`. A single-resource endpoint (no `:id` — there is
exactly one shared settings record for the whole app; see `data-model.md`).
Request/response bodies are JSON and validated against the shared Zod
schemas in `shared/src/settings.schema.ts`.

## Settings representation (response shape)

```json
{
  "sortField": "title",
  "sortDirection": "asc",
  "updatedAt": "2026-07-08T09:15:00.000Z"
}
```

- `sortField`: one of `"createdAt" | "updatedAt" | "completedAt" | "title"`.
- `sortDirection`: one of `"asc" | "desc"`.

## `GET /settings` — Read the current sort preference (FR-020, FR-021; User Story 5)

**Responses**:

- `200 OK` — returns the Settings representation. If no preference has ever
  been saved, returns the documented defaults (`sortField: "createdAt"`,
  `sortDirection: "desc"`) without requiring a row to exist yet.

## `PUT /settings` — Save the current sort preference (FR-020, FR-022; User Story 5)

**Request body** (`settingsSchema`, both fields required together — never a
partial update):

```json
{
  "sortField": "title",
  "sortDirection": "asc"
}
```

**Responses**:

- `200 OK` — returns the updated Settings representation.
- `400 Bad Request` — validation failed (e.g., `sortField`/`sortDirection`
  missing or not one of the allowed values). Body:
  `{ "message": string, "errors": [{ "path": string, "message": string }] }`.

## Error handling contract

Consistent with the base app's `todos` contract: every endpoint returns a
4xx/5xx with a JSON error body (never a bare `200` for a failed write).

## Client fallback behavior (not part of the wire contract)

Per `research.md` §11, the client treats a failed or slow `GET /settings`
the same as "no preference saved" — it falls back to the documented defaults
rather than surfacing an error state. This is a client-side behavior, not a
server response shape.
