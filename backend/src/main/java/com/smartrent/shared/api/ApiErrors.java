package com.smartrent.shared.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;

public final class ApiErrors {
  private ApiErrors() {}

  public static Map<String, Object> body(String code, String message) {
    return Map.of("error", Map.of("code", code, "message", message));
  }

  public static void write(HttpServletResponse response, ObjectMapper json, int status, String code)
      throws java.io.IOException {
    response.setStatus(status);
    response.setContentType("application/json");
    json.writeValue(
        response.getOutputStream(),
        body(
            code,
            status == 401 ? "Authentication required or credentials invalid." : "Access denied."));
  }
}
