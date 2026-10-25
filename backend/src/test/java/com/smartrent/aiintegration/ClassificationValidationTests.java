package com.smartrent.aiintegration;

import static org.assertj.core.api.Assertions.*;

import com.smartrent.aiintegration.domain.Classification;
import java.util.*;
import org.junit.jupiter.api.Test;

class ClassificationValidationTests {
  @Test
  void validAndMissingInformationDoNotDependOnConfidenceCutoff() {
    assertThat(
            new Classification("OTHER", "LOW", "Cần kiểm tra", List.of("Vị trí?"), 0.0)
                .missingInformation())
        .hasSize(1);
  }

  @Test
  void rejectsNonfiniteConfidenceAndInvalidEnums() {
    for (double c : new double[] {Double.NaN, Double.POSITIVE_INFINITY, -0.1, 1.1})
      assertThatThrownBy(() -> new Classification("OTHER", "LOW", "summary", List.of(), c))
          .isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(() -> new Classification("UNKNOWN", "LOW", "summary", List.of(), 0.5))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void rejectsMissingAndOversizedText() {
    assertThatThrownBy(() -> new Classification("OTHER", "LOW", " ", List.of(), 0.5))
        .isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(() -> new Classification("OTHER", "LOW", "x".repeat(1001), List.of(), 0.5))
        .isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(
            () ->
                new Classification(
                    "OTHER", "LOW", "summary", Collections.nCopies(6, "question"), 0.5))
        .isInstanceOf(IllegalArgumentException.class);
  }
}
