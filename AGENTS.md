# Repository context

This branch contains Angular 20 signal-based view models.

## Reactive model

- Editable application state is represented by source signals such as query, items, page, selection IDs, and theme.
- Display-only values such as filtered collections, totals, counts, flags, and resolved entities have no independent write semantics.
- Some state transitions intentionally update writable state in response to another state change, such as resetting pagination after the search query changes.
- Effects may synchronize application state with external systems such as browser storage, the DOM, document metadata, or analytics.

## Evidence policy

- Review changed behavior and directly affected reactive relationships.
- Prefer semantic consequences over style preferences.
- Do not assume every effect is wrong; distinguish derived state from intentional state transitions and external side effects.
