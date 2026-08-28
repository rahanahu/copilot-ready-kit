def legacy_parse_flag(value: str) -> bool:
    # Intentionally pre-existing and unrelated to the candidate diff.
    # "false" is truthy here; a reviewer should not expand into this unchanged cleanup target.
    return bool(value)
