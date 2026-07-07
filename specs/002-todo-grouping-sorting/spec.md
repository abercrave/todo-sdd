# Feature Specification: Completed Todo Grouping, Sorting & Overdue Highlighting

**Feature Branch**: `002-todo-grouping-sorting`

**Created**: 2026-07-07

**Status**: Draft

**Input**: User description: "Add a section below the current todo list to group completed items. Items in this group should be grayed out. Add sorting by created date, updated date, and completion date. Finally, highlight uncompleted items that are overdue"

**Amendment (2026-07-07)**: "Also add alphabetical sorting and ASC/DESC sorting for all other sorting options" — folded into this spec as User Story 4 rather than a separate feature, since it extends the same sort control.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Separate completed items into their own section (Priority: P1)

As someone managing a growing todo list, I want completed items moved out of my active list and grouped together below it, visually muted, so I can focus on what's still outstanding without losing track of what I've finished.

**Why this priority**: This is the foundational change everything else builds on — sorting and highlighting are meaningless if completed and active items are still mixed together. It also delivers immediate, standalone value: a cleaner active list.

**Independent Test**: Can be fully tested by creating several todos, marking some complete, and confirming completed items appear in a distinct, grayed-out section below the active (incomplete) items, and that toggling completion moves an item between sections immediately.

**Acceptance Scenarios**:

1. **Given** a list containing both complete and incomplete todos, **When** the list is viewed, **Then** all incomplete todos appear in the active section above, and all complete todos appear in a separate "Completed" section below, rendered with a visually muted (grayed-out) appearance.
2. **Given** an incomplete todo in the active section, **When** the user marks it complete, **Then** it moves out of the active section and into the Completed section without a page reload.
3. **Given** a completed todo in the Completed section, **When** the user marks it incomplete again, **Then** it moves back into the active section and loses the grayed-out appearance.
4. **Given** a list with zero completed todos, **When** the list is viewed, **Then** no empty "Completed" section is shown.

---

### User Story 2 - Sort todos by created, updated, or completion date (Priority: P2)

As someone reviewing my todos, I want to reorder them by when they were created, last changed, or completed, so I can find recent activity or see what I finished when.

**Why this priority**: Sorting is valuable on top of the grouping from User Story 1, but grouping alone already improves usability; sorting is a refinement most useful once sections exist.

**Independent Test**: Can be fully tested by creating todos at different times, updating some, completing others, then selecting each sort option and confirming the resulting order matches the expected date field, in both the active and Completed sections.

**Acceptance Scenarios**:

1. **Given** todos with different creation times, **When** the user sorts by "Date Created," **Then** both the active and Completed sections order their items by creation time.
2. **Given** todos that have been edited at different times, **When** the user sorts by "Date Last Updated," **Then** both sections order their items by the time they were last changed.
3. **Given** several completed todos finished at different times, **When** the user sorts by "Date Completed," **Then** the Completed section orders its items by completion time.
4. **Given** no explicit sort has been chosen, **When** the list is viewed, **Then** each section falls back to its default order (see Assumptions).

---

### User Story 3 - Highlight overdue incomplete todos (Priority: P3)

As someone tracking deadlines, I want incomplete todos whose due date has passed to stand out visually, so I immediately notice what needs attention.

**Why this priority**: This is an enhancement on top of an already-usable, sorted, grouped list — valuable, but the list is functional without it.

**Independent Test**: Can be fully tested by creating todos with due dates in the past, present, and future, and confirming only the incomplete ones with a past due date receive the overdue highlight.

**Acceptance Scenarios**:

1. **Given** an incomplete todo with a due date in the past, **When** the list is viewed, **Then** that todo displays a visual highlight distinct from both normal active items and grayed-out completed items.
2. **Given** an incomplete todo with a due date in the future or no due date, **When** the list is viewed, **Then** that todo does not display the overdue highlight.
3. **Given** a completed todo whose due date is in the past, **When** the list is viewed, **Then** that todo does not display the overdue highlight, since it is grouped and styled as completed instead.
4. **Given** an overdue incomplete todo, **When** the user marks it complete, **Then** the overdue highlight is removed immediately as it moves to the Completed section.

---

### User Story 4 - Sort alphabetically and choose direction (Priority: P4)

As someone reviewing my todos, I want to sort them alphabetically by title, and reverse the direction of any sort (date-based or alphabetical), so I can find a specific todo by name or flip between oldest/newest or A-Z/Z-A as needed.

**Why this priority**: This extends the sort control from User Story 2 with an additional field and a direction toggle. It's valuable, but the list is already sortable and usable without it.

**Independent Test**: Can be fully tested by creating todos with distinct titles, selecting "Title" as the sort field and confirming A→Z order, then toggling direction on each of the four sort fields (Date Created, Date Last Updated, Date Completed, Title) and confirming the order exactly reverses each time.

**Acceptance Scenarios**:

1. **Given** todos with different titles, **When** the user sorts by "Title," **Then** both the active and Completed sections order their items alphabetically, A→Z, case-insensitively.
2. **Given** todos sorted by any field in its default direction, **When** the user switches the direction control, **Then** the visible order exactly reverses, including how tied values are ordered.
3. **Given** the user has selected a sort field and a direction, **When** the user changes only the sort field, **Then** the newly selected field applies its own default direction rather than carrying over the previous field's direction.
4. **Given** the user has selected a sort field and a direction, **When** the user changes only the direction, **Then** the currently selected sort field does not change.

---

### Edge Cases

- What happens when a todo's due date is exactly the current moment? It is treated as not yet overdue until the due date/time is strictly in the past.
- What happens when two todos share the exact same value for the active sort field? Order between them is stable and does not change on subsequent views.
- What happens when a todo is marked complete and then incomplete again? Its completion date no longer applies, it returns to the active section, and its overdue highlight is re-evaluated based on its due date.
- What happens when a todo has no due date? It is never considered overdue and never shows the highlight.
- What happens when the Completed section has items but the active section is empty? The Completed section still displays normally below the (empty-state) active section.
- What happens when two todos have the exact same title (case-insensitive)? They are treated as tied; reversing direction mirrors the overall list but does not reorder tied items relative to each other beyond that mirroring.
- What happens when a title has leading/trailing whitespace or punctuation? Standard alphabetical comparison is used; whitespace/punctuation are compared as part of the string, not specially stripped or ignored.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display completed todos in a distinct "Completed" section positioned below the active (incomplete) todos.
- **FR-002**: System MUST render every item in the Completed section with a visually muted/grayed-out appearance that distinguishes it from active items.
- **FR-003**: System MUST move a todo between the active section and the Completed section immediately when its completion status changes, without requiring a manual page reload.
- **FR-004**: System MUST hide the Completed section entirely when there are zero completed todos, rather than showing it empty.
- **FR-005**: System MUST let users sort todos by "Date Created."
- **FR-006**: System MUST let users sort todos by "Date Last Updated."
- **FR-007**: System MUST let users sort the Completed section by "Date Completed."
- **FR-008**: System MUST record the date and time a todo was most recently marked complete, so it can be used as the sort key for FR-007.
- **FR-009**: System MUST apply a sensible default sort to each section when the user has not made an explicit selection (see Assumptions).
- **FR-010**: System MUST visually highlight any active (incomplete) todo whose due date has passed, using a treatment distinct from both normal active items and grayed-out completed items.
- **FR-011**: System MUST NOT apply the overdue highlight to completed todos, regardless of their due date.
- **FR-012**: System MUST NOT apply the overdue highlight to todos that have no due date set.
- **FR-013**: System MUST re-evaluate a todo's overdue highlight and section placement whenever its completion status or due date changes.
- **FR-014**: System MUST let users sort todos alphabetically by title, in addition to Date Created, Date Last Updated, and Date Completed.
- **FR-015**: System MUST compare titles case-insensitively when sorting alphabetically.
- **FR-016**: System MUST let users choose an ascending or descending direction for whichever sort field is currently selected (Date Created, Date Last Updated, Date Completed, or Title).
- **FR-017**: System MUST make descending order the exact reverse of ascending order for the same field, including how tied values are ordered.
- **FR-018**: System MUST retain the currently selected sort field when the user changes only the direction, and MUST apply each field's own default direction when the user selects a different field (see Assumptions).
- **FR-019**: System MUST apply a sensible default direction for each sort field when the user has not made an explicit direction choice (see Assumptions).

### Key Entities

- **Todo**: The existing single unit-of-work entity. This feature adds a tracked "Date Completed" — the date and time the todo was most recently marked complete — used to group, sort, and determine grayed-out styling. Its existing due date continues to determine overdue status when the todo is incomplete. Its existing title is also used as an alphabetical sort key (FR-014).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of completed todos appear grouped in a separate section below all active todos, with no completed todo ever appearing mixed into the active section.
- **SC-002**: Users can switch the sort order of the list by created date, last-updated date, or completion date in a single interaction, with the new order reflected immediately.
- **SC-003**: 100% of incomplete todos with a past due date display the overdue highlight, and 0% of completed todos or todos without a due date display it.
- **SC-004**: Users can identify every overdue todo at a glance, without opening or inspecting individual items.
- **SC-005**: Users can sort the todo list alphabetically by title in a single interaction.
- **SC-006**: Users can reverse the sort direction for any of the four supported sort fields in a single interaction, with the visible order updating immediately.

## Assumptions

- The active section's default sort (when the user has not chosen one) is "Date Created," most recent first.
- The Completed section's default sort (when the user has not chosen one) is "Date Completed," most recently completed first.
- Sort selection applies for the current session/view and does not need to persist across page reloads for this iteration.
- "Overdue" means the todo's due date/time is strictly earlier than the current date/time and the todo is not completed.
- The Completed section is hidden (not shown with an empty-state message) when it contains zero items, consistent with how the app already handles an empty overall list.
- No new user-facing controls beyond a sort selector and the existing due-date field are required; no changes to how due dates or completion are set are in scope.
- Default direction is descending (most recent first) for Date Created, Date Last Updated, and Date Completed; default direction for Title is ascending (A→Z).
- Each sort field has its own default direction; selecting a different field applies that field's default direction rather than carrying over the direction from whichever field was previously selected.
- Alphabetical comparison uses standard case-insensitive lexicographic ordering; natural/numeric-aware sorting (e.g., "Item 2" before "Item 10") is not required for this iteration.
