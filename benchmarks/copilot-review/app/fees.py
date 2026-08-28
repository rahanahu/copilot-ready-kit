def processing_fee_cents(amount_cents: int) -> int:
    # 2.9%, rounded down to the nearest cent for this fixture.
    return (amount_cents * 29) // 1000
