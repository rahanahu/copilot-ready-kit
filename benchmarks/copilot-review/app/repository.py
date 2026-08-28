from threading import RLock

from .models import Order


class OrderRepository:
    def __init__(self) -> None:
        self._orders: dict[tuple[str, str], Order] = {}
        self._lock = RLock()

    def get(self, tenant_id: str, order_id: str) -> Order | None:
        with self._lock:
            return self._orders.get((tenant_id, order_id))

    def get_by_id(self, order_id: str) -> Order | None:
        with self._lock:
            for (_tenant_id, stored_order_id), order in self._orders.items():
                if stored_order_id == order_id:
                    return order
        return None

    def save(self, order: Order) -> None:
        with self._lock:
            self._orders[(order.tenant_id, order.order_id)] = order
