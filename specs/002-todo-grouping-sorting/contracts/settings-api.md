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

- `sortField`: one of `"createdAt" | "updatedAt" | "title"`.
- `sortDirection`: one of `"asc" | "desc"`.

## `GET /settings` — Read the current sort preference (FR-018, FR-019; User Story 5)

**Responses**:

- `200 OK` — returns the Settings representation. If no preference has ever
  been saved, returns the documented defaults (`sortField: "createdAt"`,
  `sortDirection: "desc"`) without requiring a row to exist yet.

## `PUT /settings` — Save the current sort preference (FR-018, FR-020; User Story 5)

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

Per `research.md` §9, the client treats a failed or slow `GET /settings`
the same as "no preference saved" — it falls back to the documented defaults
rather than surfacing an error state. A failed `PUT /settings` (e.g., the
user changed the sort while offline) is handled the same way: the change
still applies locally and is not surfaced as an error (FR-021). These are
client-side behaviors, not server response shapes.
