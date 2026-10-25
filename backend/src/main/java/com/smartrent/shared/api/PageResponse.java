package com.smartrent.shared.api;

import java.util.List;

public record PageResponse<T>(List<T> items, int page, int pageSize) {
  public static int offset(int page, int size) {
    if (page < 1 || size < 1 || size > 100 || page > 1_000_000) throw ApiFailure.invalid();
    return (page - 1) * size;
  }
}
