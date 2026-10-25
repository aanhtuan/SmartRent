package com.smartrent.maintenance.application;

import com.fasterxml.jackson.databind.*;
import com.smartrent.aiintegration.domain.Classification;
import com.smartrent.shared.api.ApiFailure;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.*;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class PreviewTokens {
  private final ObjectMapper json;
  private final Clock clock;
  private final Map<String, byte[]> keys = new HashMap<>();
  private final String active;

  public PreviewTokens(
      ObjectMapper j,
      Clock c,
      @Value("${SMARTRENT_PREVIEW_KEYS_FILE:}") String file,
      @Value("${SMARTRENT_PREVIEW_ACTIVE_KID:v1}") String kid) {
    json = j;
    clock = c;
    active = kid;
    if (!file.isBlank())
      try {
        var values = j.readTree(java.nio.file.Files.readString(java.nio.file.Path.of(file)));
        var fields = values.fields();
        while (fields.hasNext()) {
          var f = fields.next();
          var bytes = Base64.getDecoder().decode(f.getValue().asText());
          if (!f.getKey().matches("[A-Za-z0-9_-]{1,40}") || bytes.length < 32)
            throw new IllegalArgumentException();
          keys.put(f.getKey(), bytes);
        }
        if (!keys.containsKey(kid)) throw new IllegalArgumentException();
      } catch (Exception e) {
        throw new IllegalStateException("Configure preview signing keys with at least 256 bits.");
      }
  }

  public record Payload(
      UUID actor,
      UUID room,
      String digest,
      String state,
      Classification classification,
      long exp) {}

  private byte[] sign(String kid, String input) {
    try {
      var key = keys.get(kid);
      if (key == null) throw new IllegalArgumentException();
      var mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(key, "HmacSHA256"));
      return mac.doFinal(input.getBytes(StandardCharsets.US_ASCII));
    } catch (Exception e) {
      throw ApiFailure.invalid();
    }
  }

  public String encode(UUID actor, UUID room, String digest, String state, Classification c) {
    if (!keys.containsKey(active))
      throw new ApiFailure(
          503,
          "AI_PROVIDER_ERROR",
          "Preview signing is not configured; manual submission remains available.");
    try {
      var payload =
          new Payload(
              actor, room, digest, state, c, clock.instant().plusSeconds(300).getEpochSecond());
      String input =
          active
              + "."
              + Base64.getUrlEncoder()
                  .withoutPadding()
                  .encodeToString(json.writeValueAsBytes(payload));
      return input
          + "."
          + Base64.getUrlEncoder().withoutPadding().encodeToString(sign(active, input));
    } catch (ApiFailure e) {
      throw e;
    } catch (Exception e) {
      throw ApiFailure.invalid();
    }
  }

  public Payload decode(String token, UUID actor, UUID room, String digest) {
    try {
      if (token.length() > 16384) throw ApiFailure.invalid();
      var bits = token.split("\\.");
      if (bits.length != 3) throw ApiFailure.invalid();
      String input = bits[0] + "." + bits[1];
      if (!MessageDigest.isEqual(sign(bits[0], input), Base64.getUrlDecoder().decode(bits[2])))
        throw ApiFailure.invalid();
      var payload = json.readValue(Base64.getUrlDecoder().decode(bits[1]), Payload.class);
      if (!actor.equals(payload.actor())
          || !room.equals(payload.room())
          || !digest.equals(payload.digest())) throw ApiFailure.invalid();
      if (payload.exp() <= clock.instant().getEpochSecond()) throw ApiFailure.conflict();
      if (!Set.of("CLASSIFIED", "NEEDS_INFORMATION", "UNAVAILABLE", "INVALID")
          .contains(payload.state())) throw ApiFailure.invalid();
      if (payload.state().equals("NEEDS_INFORMATION")) throw ApiFailure.state();
      return payload;
    } catch (ApiFailure e) {
      throw e;
    } catch (Exception e) {
      throw ApiFailure.invalid();
    }
  }

  public Instant expires() {
    return clock.instant().plusSeconds(300);
  }
}
