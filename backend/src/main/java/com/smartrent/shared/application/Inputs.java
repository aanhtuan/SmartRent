package com.smartrent.shared.application;

import com.smartrent.shared.api.ApiFailure;
import java.util.Set;

public final class Inputs {
  private Inputs() {}

  public static String text(String v, int max) {
    if (v == null || v.isBlank() || v.length() > max) throw ApiFailure.invalid();
    return v;
  }

  public static String choice(String v, String... values) {
    if (v == null || !Set.of(values).contains(v)) throw ApiFailure.invalid();
    return v;
  }

  public static void phone(String value) {
    if (value != null && value.length() > 30) throw ApiFailure.invalid();
  }
}
