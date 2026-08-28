# Copilot review benchmark context

This directory is a deliberately small multi-tenant payment/order service used to evaluate pull-request review quality.

Treat the code as production-like for review purposes. Do not assume every defect is called out by tests.

## Domain model

- `tenant_id` identifies the customer account.
- `order_id` is unique only **within a tenant**, not globally.
- `captured_cents` stores captured money as integer cents.
- refunds reduce `captured_cents`.
- service methods may be called concurrently by multiple request workers.

## Repository invariants

- Every read or mutation of tenant-owned order data must remain scoped by both `tenant_id` and `order_id`.
- A refund amount must be strictly positive and must not exceed the currently captured amount.
- Audit events describing a successful state change must be recorded only **after** persistence of that state change succeeds.
- Shared mutable quota/accounting state used by concurrent service calls must preserve atomic check-and-update behavior.

## Architecture map

```text
request handler
  -> OrderService
      -> OrderRepository
      -> AuditLog
      -> DailyRefundLimiter

API serialization
  -> public client consumer
```

## Review boundary

This benchmark intentionally contains some awkward but harmless code and at least one unrelated pre-existing defect outside the candidate diff. Review should stay attributable to the proposed change rather than expanding into cleanup of unchanged code.
