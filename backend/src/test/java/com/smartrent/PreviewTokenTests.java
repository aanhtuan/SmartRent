package com.smartrent;

import static org.assertj.core.api.Assertions.*;

import com.fasterxml.jackson.databind.*;
import com.smartrent.aiintegration.domain.Classification;
import com.smartrent.maintenance.application.PreviewTokens;
import com.smartrent.shared.api.ApiFailure;
import java.nio.file.*;
import java.time.*;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class PreviewTokenTests {
  @TempDir Path directory;
  private final ObjectMapper json =
      new ObjectMapper()
          .findAndRegisterModules()
          .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);

  private Path keys() throws Exception {
    byte[] bytes = new byte[32];
    new java.security.SecureRandom().nextBytes(bytes);
    var file = directory.resolve(UUID.randomUUID() + ".json");
    Files.writeString(
        file, json.writeValueAsString(Map.of("v1", Base64.getEncoder().encodeToString(bytes))));
    return file;
  }

  @Test
  void signatureBindingExpiryAndMissingInfoAreEnforced() throws Exception {
    var file = keys();
    var now = Instant.parse("2026-10-25T00:00:00Z");
    var codec = new PreviewTokens(json, Clock.fixed(now, ZoneOffset.UTC), file.toString(), "v1");
    UUID actor = UUID.randomUUID(), room = UUID.randomUUID();
    var c = new Classification("OTHER", "LOW", "summary", List.of(), 0.1);
    String token = codec.encode(actor, room, "digest", "CLASSIFIED", c);
    assertThat(codec.decode(token, actor, room, "digest").classification().category())
        .isEqualTo("OTHER");
    assertThatThrownBy(() -> codec.decode(token, UUID.randomUUID(), room, "digest"))
        .isInstanceOf(ApiFailure.class);
    assertThatThrownBy(() -> codec.decode(token, actor, UUID.randomUUID(), "digest"))
        .isInstanceOf(ApiFailure.class);
    assertThatThrownBy(() -> codec.decode(token, actor, room, "changed"))
        .isInstanceOf(ApiFailure.class);
    int i = token.lastIndexOf('.') + 8;
    String tampered =
        token.substring(0, i) + (token.charAt(i) == 'A' ? 'B' : 'A') + token.substring(i + 1);
    assertThatThrownBy(() -> codec.decode(tampered, actor, room, "digest"))
        .isInstanceOf(ApiFailure.class);
    var later =
        new PreviewTokens(
            json, Clock.fixed(now.plusSeconds(301), ZoneOffset.UTC), file.toString(), "v1");
    assertThatThrownBy(() -> later.decode(token, actor, room, "digest"))
        .isInstanceOf(ApiFailure.class)
        .extracting(e -> ((ApiFailure) e).status())
        .isEqualTo(409);
    String missing =
        codec.encode(
            actor,
            room,
            "digest",
            "NEEDS_INFORMATION",
            new Classification("OTHER", "LOW", "summary", List.of("question"), 0.5));
    assertThatThrownBy(() -> codec.decode(missing, actor, room, "digest"))
        .isInstanceOf(ApiFailure.class)
        .extracting(e -> ((ApiFailure) e).status())
        .isEqualTo(422);
  }

  @Test
  void retiredKeyFailsWhileRetainedKeyAllowsGracePeriod() throws Exception {
    var file = keys();
    var clock = Clock.systemUTC();
    UUID actor = UUID.randomUUID(), room = UUID.randomUUID();
    var old = new PreviewTokens(json, clock, file.toString(), "v1");
    String token = old.encode(actor, room, "digest", "UNAVAILABLE", null);
    var keyring =
        (com.fasterxml.jackson.databind.node.ObjectNode) json.readTree(Files.readString(file));
    byte[] bytes = new byte[32];
    new java.security.SecureRandom().nextBytes(bytes);
    keyring.put("v2", Base64.getEncoder().encodeToString(bytes));
    Files.writeString(file, json.writeValueAsString(keyring));
    var current = new PreviewTokens(json, clock, file.toString(), "v2");
    assertThat(current.decode(token, actor, room, "digest").state()).isEqualTo("UNAVAILABLE");
    keyring.remove("v1");
    Files.writeString(file, json.writeValueAsString(keyring));
    var retired = new PreviewTokens(json, clock, file.toString(), "v2");
    assertThatThrownBy(() -> retired.decode(token, actor, room, "digest"))
        .isInstanceOf(ApiFailure.class);
  }

  @Test
  void missingSigningKeysNeverInventDefaultSecret() {
    var codec = new PreviewTokens(json, Clock.systemUTC(), "", "v1");
    assertThatThrownBy(
            () -> codec.encode(UUID.randomUUID(), UUID.randomUUID(), "digest", "INVALID", null))
        .isInstanceOf(ApiFailure.class)
        .extracting(e -> ((ApiFailure) e).status())
        .isEqualTo(503);
  }
}
