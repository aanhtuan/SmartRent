package com.smartrent.aiintegration.persistence;

import static org.assertj.core.api.Assertions.*;

import com.fasterxml.jackson.databind.*;
import com.smartrent.aiintegration.application.*;
import com.sun.net.httpserver.HttpServer;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.junit.jupiter.api.*;

class GeminiAdapterContractTests {
  private HttpServer server;
  private RestGeminiAdapter adapter;
  private final ObjectMapper json = new ObjectMapper();
  private String output;
  private int status;
  private String requestBody;
  private String key;
  private long delayMillis;

  @BeforeEach
  void start() throws Exception {
    status = 200;
    output = "";
    server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    server.createContext(
        "/models/",
        exchange -> {
          if (delayMillis > 0) {
            try {
              Thread.sleep(delayMillis);
            } catch (InterruptedException e) {
              Thread.currentThread().interrupt();
            }
          }
          requestBody =
              new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
          key = exchange.getRequestHeaders().getFirst("x-goog-api-key");
          byte[] body = output.getBytes(StandardCharsets.UTF_8);
          exchange.sendResponseHeaders(status, body.length);
          try (var out = exchange.getResponseBody()) {
            out.write(body);
          }
        });
    server.start();
    adapter =
        new RestGeminiAdapter(
            json, URI.create("http://127.0.0.1:" + server.getAddress().getPort() + "/models/"));
  }

  @AfterEach
  void stop() {
    server.stop(0);
  }

  private void frame(String text) throws Exception {
    output =
        json.writeValueAsString(
            Map.of(
                "candidates",
                List.of(
                    Map.of(
                        "finishReason",
                        "STOP",
                        "content",
                        Map.of("parts", List.of(Map.of("text", text)))))));
  }

  @Test
  void sendsStructuredSchemaWithoutToolsAndValidatesOutput() throws Exception {
    frame(
        "{\"category\":\"PLUMBING\",\"priority\":\"HIGH\",\"summary\":\"Rò rỉ"
            + " nước\",\"missing_information\":[],\"confidence\":0.8}");
    var result = adapter.classify("Vòi nước rò");
    assertThat(result.category()).isEqualTo("PLUMBING");
    var sent = json.readTree(requestBody);
    assertThat(sent.has("tools")).isFalse();
    assertThat(sent.path("generationConfig").path("responseMimeType").asText())
        .isEqualTo("application/json");
    assertThat(key).isEqualTo("synthetic-test-key");
  }

  @Test
  void rejectsMissingFieldAndWrongTypes() throws Exception {
    frame(
        "{\"category\":\"PLUMBING\",\"priority\":\"HIGH\",\"summary\":\"summary\",\"missing_information\":[],\"confidence\":\"0.8\"}");
    assertThatThrownBy(() -> adapter.classify("description")).isInstanceOf(AiInvalid.class);
  }

  @Test
  void rejectsMalformedJsonAndProviderRefusal() {
    output = "not json";
    assertThatThrownBy(() -> adapter.classify("description")).isInstanceOf(AiInvalid.class);
    output = "{\"candidates\":[]}";
    assertThatThrownBy(() -> adapter.classify("description")).isInstanceOf(AiInvalid.class);
  }

  @Test
  void unavailableAndOversizeBodiesFailSafely() {
    status = 429;
    output = "unavailable";
    assertThatThrownBy(() -> adapter.classify("description")).isInstanceOf(AiUnavailable.class);
    status = 200;
    output = "x".repeat(70000);
    assertThatThrownBy(() -> adapter.classify("description")).isInstanceOf(AiUnavailable.class);
  }

  @Test
  void validatesAssistantBooleanAndAnswer() throws Exception {
    frame("{\"answer\":\"Cần thêm thông tin\",\"requires_more_information\":true}");
    assertThat(adapter.answer("question", "{}").requiresMoreInformation()).isTrue();
    frame("{\"answer\":\"answer\",\"requires_more_information\":\"yes\"}");
    assertThatThrownBy(() -> adapter.answer("question", "{}")).isInstanceOf(AiInvalid.class);
  }

  @Test
  void disabledProviderDoesNotContactAnyEndpoint() {
    var disabled = new RestGeminiAdapter(json, false, "", "");
    assertThatThrownBy(() -> disabled.classify("synthetic description"))
        .isInstanceOf(AiUnavailable.class);
    assertThat(requestBody).isNull();
  }

  @Test
  void providerDeadlineIsBounded() {
    delayMillis = 11000;
    output = "{}";
    long started = System.nanoTime();
    assertThatThrownBy(() -> adapter.classify("synthetic description"))
        .isInstanceOf(AiUnavailable.class);
    assertThat(java.time.Duration.ofNanos(System.nanoTime() - started).toSeconds()).isLessThan(13);
  }
}
