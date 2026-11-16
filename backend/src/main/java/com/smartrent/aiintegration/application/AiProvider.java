package com.smartrent.aiintegration.application;

import com.smartrent.aiintegration.domain.Classification;

public interface AiProvider {
  Classification classify(String minimizedDescription);

  Answer answer(String minimizedQuestion, String authorizedContext);

  record Answer(String answer, boolean requiresMoreInformation) {
    public Answer {
      if (answer == null || answer.isBlank() || answer.length() > 4000)
        throw new IllegalArgumentException("Invalid assistant output.");
    }
  }
}
