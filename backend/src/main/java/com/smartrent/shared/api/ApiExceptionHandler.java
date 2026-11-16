package com.smartrent.shared.api;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class ApiExceptionHandler {
  @ExceptionHandler(ApiFailure.class)
  ResponseEntity<?> failure(ApiFailure ex) {
    var builder = ResponseEntity.status(ex.status());
    if (ex.status() == 429) builder.header("Retry-After", "900");
    return builder.body(ApiErrors.body(ex.code(), ex.getMessage()));
  }

  @ExceptionHandler({
    HttpMessageNotReadableException.class,
    MethodArgumentNotValidException.class,
    MethodArgumentTypeMismatchException.class,
    org.springframework.web.bind.MissingServletRequestParameterException.class
  })
  ResponseEntity<?> invalid(Exception ex) {
    return ResponseEntity.badRequest().body(ApiErrors.body("VALIDATION_ERROR", "Invalid request."));
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  ResponseEntity<?> conflict(Exception ex) {
    return ResponseEntity.status(409).body(ApiErrors.body("CONFLICT", "Conflicting resource."));
  }

  @ExceptionHandler({
    org.springframework.web.servlet.resource.NoResourceFoundException.class,
    org.springframework.web.servlet.NoHandlerFoundException.class
  })
  ResponseEntity<?> notFound(Exception ex) {
    return ResponseEntity.status(404).body(ApiErrors.body("NOT_FOUND", "Resource not found."));
  }

  @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class)
  ResponseEntity<?> method(Exception ex) {
    return ResponseEntity.status(405)
        .body(ApiErrors.body("VALIDATION_ERROR", "Method not allowed."));
  }

  @ExceptionHandler(org.springframework.web.HttpMediaTypeNotSupportedException.class)
  ResponseEntity<?> media(Exception ex) {
    return ResponseEntity.status(415)
        .body(ApiErrors.body("VALIDATION_ERROR", "Unsupported media type."));
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<?> unknown(Exception ex) {
    return ResponseEntity.internalServerError()
        .body(ApiErrors.body("INTERNAL_ERROR", "Request could not be completed."));
  }
}
