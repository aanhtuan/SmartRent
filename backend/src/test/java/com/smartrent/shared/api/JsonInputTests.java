package com.smartrent.shared.api;

import static org.assertj.core.api.Assertions.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

class JsonInputTests {
  private ObjectMapper mapper() {
    var b = new Jackson2ObjectMapperBuilder();
    new JsonConfiguration().strictJson().customize(b);
    return b.build();
  }

  public record Input(Boolean read) {}

  @Test
  void rejectsDuplicateTrailingAndCoercedScalarValues() {
    var m = mapper();
    for (String text :
        new String[] {
          "{\"read\":true,\"read\":false}", "{\"read\":true} {}", "{\"read\":\"true\"}"
        })
      assertThatThrownBy(() -> m.readValue(text, Input.class))
          .isInstanceOf(com.fasterxml.jackson.core.JsonProcessingException.class);
  }

  @Test
  void boundsUntrustedJsonBeforeBusinessValidation() {
    var m = mapper();
    assertThatThrownBy(() -> m.readTree("{\"value\":\"" + "x".repeat(17000) + "\"}"))
        .isInstanceOf(com.fasterxml.jackson.core.JsonProcessingException.class);
    assertThatThrownBy(() -> m.readTree("[".repeat(60) + "0" + "]".repeat(60)))
        .isInstanceOf(com.fasterxml.jackson.core.JsonProcessingException.class);
  }
}
