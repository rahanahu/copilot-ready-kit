def processing_fee_cents(amount_cents: int) -> int:
    rate = 0.029
    return int((amount_cents * rate))
