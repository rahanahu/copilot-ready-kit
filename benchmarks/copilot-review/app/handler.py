import logging

from .api import serialize_order
from .service import OrderService


logger = logging.getLogger(__name__)


def handle_refund(
    service: OrderService,
    authorization_header: str,
    tenant_id: str,
    order_id: str,
    amount_cents: int,
) -> dict[str, object]:
    logger.info(
        "refund requested tenant=%s order=%s authorization=%s",
        tenant_id,
        order_id,
        authorization_header,
    )
    order = service.refund_order(tenant_id, order_id, amount_cents)
    return serialize_order(order)
