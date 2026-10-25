package com.smartrent.aiintegration.application;

public class AiInvalid extends RuntimeException {
  public AiInvalid() {
    super("AI provider output invalid.");
  }
}
