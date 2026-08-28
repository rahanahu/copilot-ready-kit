# Repository context

This branch contains a small Angular 20 profile view-model example.

## Architecture

```text
examples/angular-signals/profile.vm.ts
  -> Angular signals
  -> browser localStorage for persisted UI preference
```

## Repository facts

- Framework baseline: Angular 20.
- `firstName` and `lastName` are source state owned by the view model.
- `fullName` is display-only and has no independent user input, persistence, or external source of truth.
- Persisting `theme` to `localStorage` is an intentional external synchronization effect.

## Evidence policy

- Review changed behavior and directly affected reactive dependencies.
- Prefer concrete framework semantics and repository facts over stylistic preference.
- Do not report an alternative merely because it is shorter or newer.
