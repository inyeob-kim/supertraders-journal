def paginate(offset: int = 0, limit: int = 50) -> tuple[int, int]:
    return max(offset, 0), max(min(limit, 100), 1)

