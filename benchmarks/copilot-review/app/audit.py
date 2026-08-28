class AuditLog:
    def __init__(self) -> None:
        self.events: list[dict[str, object]] = []

    def record(
        self,
        action: str,
        tenant_id: str,
        order_id: str,
        *,
        amount_cents: int | None = None,
    ) -> None:
        self.events.append(
            {
                "action": action,
                "tenant_id": tenant_id,
                "order_id": order_id,
                "amount_cents": amount_cents,
            }
        )
