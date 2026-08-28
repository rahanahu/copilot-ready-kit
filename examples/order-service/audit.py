class AuditLog:
    def __init__(self) -> None:
        self.events: list[dict[str, object]] = []

    def record(self, event: str, tenant_id: str, order_id: str, **details: object) -> None:
        self.events.append(
            {
                "event": event,
                "tenant_id": tenant_id,
                "order_id": order_id,
                **details,
            }
        )
