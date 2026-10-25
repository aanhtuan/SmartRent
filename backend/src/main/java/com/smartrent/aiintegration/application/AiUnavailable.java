package com.smartrent.aiintegration.application;

public class AiUnavailable extends RuntimeException {
  public AiUnavailable() {
    super("AI provider unavailable.");
  }
}
