# Feature Specification: Todo App

**Feature Branch**: `001-todo-app`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Build a single-user todo application (no auth) with both an API and a UI, where todos have a title, description, and due date, and all data persists across sessions in Postgres"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Capture a Todo (Priority: P1)

As the single user of the application, I want to record a new todo with a title,
description, and due date so that I don't lose track of something I need to do.

**Why this priority**: Capturing work is the entire reason the application
exists. Without the ability to create a todo, there is no product — this is the
smallest possible slice that delivers value on its own.

**Independent Test**: Can be fully tested by creating a todo through the UI (or
API) and confirming it is saved and appears in the todo list, delivering the
value of "nothing I write down gets lost."

**Acceptance Scenarios**:

1. **Given** the todo list is empty, **When** the user creates a todo with a
   title, description, and due date, **Then** the todo appears in the list with
   the information they entered.
2. **Given** the user is creating a todo, **When** they submit without a title,
   **Then** the system rejects the submission and explains that a title is
   required.
3. **Given** a todo has been created, **When** the user closes and reopens the
   application, **Then** the todo is still present with the same information.

---

### User Story 2 - Review and Complete Todos (Priority: P2)

As the single user, I want to see all my todos at a glance and mark them done
when finished, so I can track what's outstanding and what's behind me.

**Why this priority**: Once todos can be captured, the next most valuable
capability is being able to see them together and close them out — this is
what turns a list of notes into a working todo system.

**Independent Test**: Can be fully tested by viewing the list of existing
todos, marking one complete, and confirming its status visibly changes and
persists after reloading.

**Acceptance Scenarios**:

1. **Given** multiple todos exist, **When** the user views the list, **Then**
   they see each todo's title, description, due date, and completion status.
2. **Given** an incomplete todo, **When** the user marks it done, **Then** its
   status changes to complete and remains complete after the application is
   reloaded.
3. **Given** a completed todo, **When** the user marks it not done, **Then** its
   status reverts to incomplete.
4. **Given** no todos have been created yet, **When** the user views the list,
   **Then** the system shows a clear empty state rather than a blank screen.

---

### User Story 3 - Edit and Remove Todos (Priority: P3)

As the single user, I want to update or delete a todo, so I can correct
mistakes or remove things that are no longer relevant.

**Why this priority**: Editing and deletion round out the management
experience but are not required for the application to deliver its core value
of capturing and tracking work — they can be added after the first two
stories are working.

**Independent Test**: Can be fully tested by editing an existing todo's fields
and confirming the changes are saved, and separately by deleting a todo and
confirming it no longer appears in the list.

**Acceptance Scenarios**:

1. **Given** an existing todo, **When** the user edits its title, description,
   or due date and saves, **Then** the updated information is shown and
   persists after reloading.
2. **Given** an existing todo, **When** the user deletes it, **Then** it no
   longer appears in the list and does not reappear after reloading.
3. **Given** the user is editing a todo, **When** they clear the title field
   and attempt to save, **Then** the system rejects the change and explains
   that a title is required.

---

### Edge Cases

- What happens when the user sets a due date in the past? The system MUST still
  accept it and MAY visually flag the todo as overdue.
- What happens when the description is left blank? The system MUST accept the
  todo, since a description is optional.
- What happens when the title or description is extremely long? The system
  MUST enforce a reasonable maximum length and reject input beyond it with a
  clear message rather than silently truncating.
- What happens if the connection to storage is unavailable when the user tries
  to create, edit, complete, or delete a todo? The system MUST show a clear
  error message and MUST NOT report success for an action that wasn't saved.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow the user to create a todo with a title
  (required), a description (optional), and a due date (optional).
- **FR-002**: System MUST reject creation or edits of a todo that has no title,
  with a clear explanation of why it was rejected.
- **FR-003**: System MUST display all existing todos, showing each one's title,
  description, due date, and completion status.
- **FR-004**: System MUST allow the user to mark any todo as complete or
  incomplete, and reflect that status in the list.
- **FR-005**: System MUST allow the user to edit the title, description, and
  due date of an existing todo.
- **FR-006**: System MUST allow the user to permanently delete a todo.
- **FR-007**: System MUST persist all todo data so it remains available after
  the application is closed and reopened, or after a browser refresh.
- **FR-008**: System MUST support exactly one user; the application MUST NOT
  require sign-in, and there is only one shared todo list.
- **FR-009**: System MUST expose todo creation, viewing, updating, completion
  toggling, and deletion through both a programmatic interface and a visual
  interface, with both interfaces operating on the same underlying data.
- **FR-010**: System MUST show a clear, distinct empty state when no todos
  exist, rather than an empty or blank view.
- **FR-011**: System MUST show a clear error to the user whenever a create,
  edit, complete/incomplete, or delete action fails, and MUST NOT indicate
  success for an action that did not persist.

### Key Entities

- **Todo**: A single unit of work the user wants to track. Attributes: title
  (required, short text), description (optional, longer free text), due date
  (optional, a calendar date), completion status (done / not done), and
  timestamps for when it was created and last updated. A Todo has no owner
  field since the system supports only one user.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A new user can create their first todo within 30 seconds of
  opening the application, with no setup or account creation required.
- **SC-002**: Todos created in a session are still present and accurate 100%
  of the time after the application is closed and reopened.
- **SC-003**: A user can find the completion status of any todo within 5
  seconds of opening the todo list, without needing to open each todo
  individually.
- **SC-004**: Users can go from "list of things I need to do" to "have them
  recorded in the system" for at least 10 todos in under 3 minutes.
- **SC-005**: Zero data loss occurs across create, edit, complete, and delete
  actions under normal operation — every successfully confirmed action is
  reflected in what the user sees on their next visit.

## Assumptions

- The application has exactly one user and no concept of accounts, login, or
  permissions; "single-user" means there is one shared todo list rather than
  per-user data isolation.
- A todo's completion status (done / not done) is treated as a core attribute
  of every todo even though it wasn't explicitly named in the request, because
  tracking completion is intrinsic to what a "todo" is.
- Deleting a todo is permanent (no trash/undo) since no recovery mechanism was
  requested.
- The todo list has no built-in requirement for sorting, filtering, search, or
  categorization beyond showing all todos with their fields; these may be
  added later but are out of scope for this feature.
- Due dates are calendar dates without a specific time component, since no
  time-of-day requirement was mentioned.
- There is no maximum number of todos a user is expected to manage beyond what
  a single person's task list would reasonably contain.
