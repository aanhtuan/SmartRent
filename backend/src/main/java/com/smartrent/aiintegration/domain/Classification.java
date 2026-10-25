package com.smartrent.aiintegration.domain;

import java.util.*;

public record Classification(
    String category,
    String priority,
    String summary,
    List<String> missingInformation,
    double confidence) {
  public Classification {
    if (!Set.of(
                "ELECTRICITY",
                "PLUMBING",
                "INTERNET",
                "AIR_CONDITIONER",
                "FURNITURE",
                "CLEANING",
                "OTHER")
            .contains(category)
        || !Set.of("LOW", "MEDIUM", "HIGH").contains(priority)
        || summary == null
        || summary.isBlank()
        || summary.length() > 1000
        || missingInformation == null
        || missingInformation.size() > 5
        || missingInformation.stream().anyMatch(s -> s == null || s.isBlank() || s.length() > 200)
        || !Double.isFinite(confidence)
        || confidence < 0
        || confidence > 1) throw new IllegalArgumentException("Invalid classification output.");
    missingInformation = List.copyOf(missingInformation);
  }
}
