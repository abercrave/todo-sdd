# Todo SDD Notes

## Planning

### Single-user or multi-user? (Multi-user pulls in auth, which is a real scope decision, not a detail.)

Single user.

### Does data persist across sessions? (If yes, that's your Postgres schema.)

Yes.

### What's the minimum viable "todo"? Title and done/not-done is defensible. So is adding due dates, priority, or categories — but each one you add is scope you now own for the rest of the exercise

A todo list with titles, descrioptions, and due dates.

### Do you need an API only, a UI only, or both?

API and UI.

## Retrospective: SDD process misses (for future projects)

Concrete gaps found while running this project end-to-end through
`/speckit.constitution` → `specify` → `plan` → `tasks` → `analyze` → `implement`.
None of these were caught by the spec-kit gates themselves — all surfaced
either mid-implementation or via manual browser testing after "all tests green."

### Constitution / Plan

- **Validate the existing scaffold before planning against it.** The repo's
  pre-existing Jest config was silently broken (ESM/`nodenext` vs ts-jest
  mismatch) — _no test had ever run_, including the original scaffold's own
  test. This should have been caught by literally running `pnpm test` once
  during `/speckit.plan`'s research phase, before writing any task that
  assumes "add a test" is a one-line effort.
- **A shared package spanning multiple build tools is a research decision,
  not an implementation detail.** Introducing `shared/` (Zod schemas used by
  NestJS + Jest + Vite) needed a module-format decision (CJS vs ESM) made
  once, up front, against all three consumers — not discovered by trial and
  error (two separate runtime failures: Jest choking on ESM, then Vite
  refusing to load the CJS build until `optimizeDeps.include` was set).
- **Check for pre-existing un-migrated database state.** The Prisma schema
  had `@@ignore` and no `prisma/migrations/` folder, meaning the "add a
  migration" task turned into a live "reset the dev database, get explicit
  user consent" moment mid-implementation. A quick `ls prisma/migrations`
  during planning would have surfaced this as a known risk instead of a
  surprise.
- **Vague constitution principles need to be made concrete or explicitly
  scoped N/A during planning.** "Prisma queries MUST select only needed
  fields" never mapped to any task and was hand-waved away at the end as "not
  meaningful given entity size." Either write principles specific enough to
  generate a task, or have the plan phase explicitly mark them out-of-scope
  with a reason — don't leave it for a code reviewer (human or AI) to notice.
- **Decide commit cadence before implementation starts**, not mid-session.
  Ask once during planning; don't let it come up organically after Phase 1 is
  already done.
- **Surface visual/UX polish as an explicit scope decision.** Nothing in
  spec.md required styling, but nothing explicitly said "ship unstyled"
  either — it was silently assumed rather than confirmed. Anything a user
  will visibly judge (does this look intentional?) deserves an explicit
  yes/no in plan.md's research, even if the answer is "skip it for now."

### Tasks / Analyze

- **`/speckit.analyze` caught a real constitution violation (missing
  frontend edge/error-state tests) that `/speckit.tasks` itself should have
  self-checked.** Treat analyze as a second opinion, not the only opinion —
  cross-check each constitution principle against the generated task list
  before calling tasks.md done.
- **Tasks that touch a network/data layer should say "parse the response
  through the shared schema," not just "call the API."** The task for
  `useTodos`'s fetch logic didn't specify this, and the natural
  implementation shortcut (an unchecked type cast) shipped a real runtime
  bug that the schema, which already existed, would have caught for free.

### Implementation

- **Component-level tests with fully-mocked callback props gave false
  confidence.** Both real bugs found post-"all green" (a date-parsing crash,
  duplicate DOM ids from reusing a form component) lived in code paths that
  every test mocked away — the actual `fetch`+parse logic, and multi-component
  page composition. Component tests alone can't catch cross-component DOM
  conflicts (two instances of the same form on one page); that needs a
  whole-page render or a real browser check.
- **Manual browser verification (screenshots + a scripted click-through) was
  what actually caught both real bugs — automated tests did not.** Don't
  treat a green test suite as done for UI work; drive the running app at
  least once per user story before checking it off, not just at the very end.
- **No test-database isolation.** The e2e suite and manual browser testing
  both hit the same dev Postgres instance, so stray rows from one leaked into
  the other repeatedly and had to be manually cleaned up mid-session. Worth a
  dedicated test database or per-test transaction rollback next time.
- **Document the shared-package build/watch workflow as part of the plan,
  not as a quickstart afterthought.** Every edit to `shared/src/` requires an
  explicit `pnpm --filter shared build` before `api`/`ui` see it — this
  friction should be called out (and ideally automated with a watch script)
  when the shared package is first introduced, not patched into the docs
  after someone hits the stale-build error.

### Code quality (patterns that should have been established early, not left to whichever file needed them first)

- **State/status values were raw string literals compared with `===`
  instead of a single named source of truth.** `TodosStatus = 'loading' |
  'error' | 'empty' | 'ready'` and its comparisons (`status === 'loading'`,
  etc.) are spread across `useTodos.ts` and `TodosPage.tsx` as magic
  strings. A `const TODOS_STATUS = { LOADING: 'loading', ... } as const`
  (or enum) would have made every consumer reference the same constant
  instead of retyping the string, and a typo would be a compile error
  instead of a silent no-op branch.
- **Error-message extraction was reinvented three different ways.**
  `useTodos.ts` has a real `toErrorMessage()` helper that special-cases
  `ZodError` into a friendly message. `TodoItem.tsx`'s toggle/remove
  handlers and `TodoForm.tsx`'s submit handler each duplicate the plain
  `err instanceof Error ? err.message : fallback` pattern inline instead of
  importing the shared helper — so the Zod-friendly-message fix only
  landed in one of the three places that needed it. This should have been
  a shared utility from the first time the pattern was written twice, not
  after a code review flagged the first copy.
- **Validation limits were magic numbers, not named constants.**
  `shared/src/todo.schema.ts` has `.max(255, 'Title must be 255 characters
  or fewer')` and `.max(2000, 'Description must be 2000 characters or
  fewer')` — the limit and its message are two separate literals that have
  to be changed together by hand. `const TITLE_MAX_LENGTH = 255` used in
  both the check and a template-literal message would make that
  impossible to desync.
- **The `/todos` route path is duplicated across four independent places**
  (the frontend's `API_BASE` constant, the backend's `@Controller('todos')`
  decorator, the Vite dev-server proxy config, and `contracts/todos-api.md`)
  with nothing enforcing they agree. Fine at one route; worth a single
  source of truth (or contract-driven codegen) before a second resource is
  added and one of the four copies inevitably drifts.

### Agent process (model assignment)

- **CLAUDE.md's Model Assignment Rules were never actually applied.** The
  rules say architecture decisions/reviews → Opus, implementation → Sonnet,
  simple edits/formatting/renaming → Haiku, security-sensitive changes →
  escalate to Opus. In practice, one Sonnet 5 instance did the entire
  session end to end — the constitution, plan.md's architecture decisions,
  the code-review workflow (a "review"), the implementation work, *and* the
  simple edits (README, CSS pass, dead-asset cleanup) — because nothing
  ever invoked a model override. The mechanism exists (`Agent`'s `model`
  param, `Workflow`'s per-agent `model` override) but has to be deliberately
  used per task; it isn't automatic just because CLAUDE.md states the rule.
  The Prisma `migrate reset` — a destructive, data-sensitive action — is a
  concrete example of something that should have been routed through an
  Opus review step rather than just a direct human consent prompt. Next
  time: either explicitly invoke the right model per task type, or don't
  write assignment rules that nothing enforces.
