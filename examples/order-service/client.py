def parse_order_id(payload: dict[str, object]) -> str:
    value = payload["order_id"]
    if not isinstance(value, str):
        raise TypeError("order_id must be a string")
    return value
