def processing_fee_cents(amount_cents: int) -> int:
    # 2.9%, rounded down to the nearest cent.
    return (amount_cents * 29) // 1000
