from dataclasses import dataclass


@dataclass
class Order:
    tenant_id: str
    order_id: str
    captured_cents: int
    status: str = "captured"
