# Todo SDD Notes

## Single-user or multi-user? (Multi-user pulls in auth, which is a real scope decision, not a detail.)

Single user.

## Does data persist across sessions? (If yes, that's your Postgres schema.)

Yes.

## What's the minimum viable "todo"? Title and done/not-done is defensible. So is adding due dates, priority, or categories — but each one you add is scope you now own for the rest of the exercise

A todo list with titles, descrioptions, and due dates.

## Do you need an API only, a UI only, or both?

API and UI.
