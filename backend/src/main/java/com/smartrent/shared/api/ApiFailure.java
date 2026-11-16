package com.smartrent.shared.api;

public class ApiFailure extends RuntimeException {
  private final int status;
  private final String code;

  public ApiFailure(int status, String code, String message) {
    super(message);
    this.status = status;
    this.code = code;
  }

  public int status() {
    return status;
  }

  public String code() {
    return code;
  }

  public static ApiFailure missing() {
    return new ApiFailure(404, "NOT_FOUND", "Resource not found.");
  }

  public static ApiFailure invalid() {
    return new ApiFailure(400, "VALIDATION_ERROR", "Invalid request.");
  }

  public static ApiFailure state() {
    return new ApiFailure(422, "INVALID_STATE", "Operation is not permitted in the current state.");
  }

  public static ApiFailure unauthenticated() {
    return new ApiFailure(
        401, "UNAUTHENTICATED", "Authentication required or credentials invalid.");
  }

  public static ApiFailure conflict() {
    return new ApiFailure(409, "CONFLICT", "Conflicting resource or request.");
  }
}
