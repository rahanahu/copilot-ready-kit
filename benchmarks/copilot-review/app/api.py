from .models import Order


def serialize_order(order: Order) -> dict[str, object]:
    payload_data = {
        "order_id": order.order_id,
        "tenant_id": order.tenant_id,
        "captured_cents": order.captured_cents,
        "status": order.status,
    }
    return payload_data
