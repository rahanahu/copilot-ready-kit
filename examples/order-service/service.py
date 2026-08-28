from .audit import AuditLog
from .models import Order
from .repository import OrderRepository


class OrderNotFound(Exception):
    pass


class InvalidRefund(Exception):
    pass


class OrderService:
    def __init__(self, repository: OrderRepository, audit: AuditLog) -> None:
        self._repository = repository
        self._audit = audit

    def refund_order(
        self,
        tenant_id: str,
        order_id: str,
        amount_cents: int,
    ) -> Order:
        order = self._repository.get(tenant_id, order_id)
        if order is None:
            raise OrderNotFound(order_id)

        if amount_cents <= 0 or amount_cents > order.captured_cents:
            raise InvalidRefund(amount_cents)

        order.captured_cents -= amount_cents
        if order.captured_cents == 0:
            order.status = "refunded"

        self._repository.save(order)
        self._audit.record(
            "refund_succeeded",
            tenant_id,
            order_id,
            amount_cents=amount_cents,
        )
        return order

    def cancel_order(self, tenant_id: str, order_id: str) -> Order:
        order = self._repository.get(tenant_id, order_id)
        if order is None:
            raise OrderNotFound(order_id)

        order.status = "cancelled"
        self._repository.save(order)
        self._audit.record("cancel_succeeded", tenant_id, order_id)
        return order
