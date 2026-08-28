from threading import Lock


class DailyRefundLimiter:
    def __init__(self, limit_cents: int) -> None:
        self._limit_cents = limit_cents
        self._used_by_tenant: dict[str, int] = {}
        self._lock = Lock()

    def try_consume(self, tenant_id: str, amount_cents: int) -> bool:
        with self._lock:
            used = self._used_by_tenant.get(tenant_id, 0)
            if used + amount_cents > self._limit_cents:
                return False
            self._used_by_tenant[tenant_id] = used + amount_cents
            return True
