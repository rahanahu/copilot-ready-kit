def read_order_id(response: dict[str, object]) -> str:
    value = response["order_id"]
    if not isinstance(value, str):
        raise TypeError("order_id must be a string")
    return value
