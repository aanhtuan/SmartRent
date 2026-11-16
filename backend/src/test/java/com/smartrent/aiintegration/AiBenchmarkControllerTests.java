package com.smartrent.aiintegration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.smartrent.aiintegration.api.AiBenchmarkController;
import com.smartrent.aiintegration.application.AiGateway;
import com.smartrent.aiintegration.domain.Classification;
import com.smartrent.identity.application.Actor;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

class AiBenchmarkControllerTests {
  private AiGateway gateway;
  private AiBenchmarkController controller;
  private UUID userId;

  @BeforeEach
  void setUp() {
    gateway = mock(AiGateway.class);
    controller = new AiBenchmarkController(gateway);
    userId = UUID.randomUUID();

    var actor = new Actor(userId, com.smartrent.identity.domain.AccountRole.TENANT);
    var auth =
        new UsernamePasswordAuthenticationToken(
            actor, null, List.of(() -> "ROLE_TENANT"));
    var ctx = SecurityContextHolder.createEmptyContext();
    ctx.setAuthentication(auth);
    SecurityContextHolder.setContext(ctx);
  }

  @AfterEach
  void tearDown() {
    SecurityContextHolder.clearContext();
  }

  @Test
  void returnsBenchmarkSummaryWithTargetMetrics() {
    var response = controller.getBenchmarkSummary();
    assertThat(response.model()).isEqualTo("gemini-3.8-flash");
    assertThat(response.piiRedactionEnabled()).isTrue();
    assertThat(response.rateLimitPerMinute()).isEqualTo(5);
    assertThat(response.accuracyRate()).isEqualTo(1.0);
    assertThat(response.benchmarkCases()).hasSize(8);
    assertThat(response.benchmarkCases().get(0).expectedCategory()).isEqualTo("ELECTRICITY");
  }

  @Test
  void evaluatesPromptAndMeasuresLatency() {
    var prompt = "Hỏng bóng tuýp phòng 101, gọi 0987654321";
    var classification =
        new Classification("ELECTRICITY", "MEDIUM", "Bóng đèn tuýp hỏng", List.of(), 0.92);

    when(gateway.minimized(prompt)).thenReturn("Hỏng bóng tuýp phòng 101, gọi [REDACTED]");
    when(gateway.classify(eq(userId), eq(prompt))).thenReturn(classification);

    var res = controller.evaluate(new AiBenchmarkController.EvaluateRequest(prompt));

    assertThat(res.classification().category()).isEqualTo("ELECTRICITY");
    assertThat(res.piiRedacted()).isTrue();
    assertThat(res.sanitizedPrompt()).contains("[REDACTED]");
    assertThat(res.latencyMs()).isGreaterThanOrEqualTo(0);
  }
}
