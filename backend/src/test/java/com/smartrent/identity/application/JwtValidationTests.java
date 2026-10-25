package com.smartrent.identity.application;

import static org.assertj.core.api.Assertions.*;

import com.smartrent.TestJwtKeys;
import java.time.*;
import java.util.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.*;

class JwtValidationTests {
  private final JwtConfiguration config = new JwtConfiguration();
  private final JwtEncoder encoder =
      config.jwtEncoder(TestJwtKeys.privateFile(), TestJwtKeys.publicFile());
  private final JwtDecoder decoder =
      config.jwtDecoder(TestJwtKeys.publicFile(), "urn:smartrent:backend", "smartrent-api");

  private String token(String defect) {
    var now = Instant.now();
    var c =
        JwtClaimsSet.builder()
            .issuer(defect.equals("issuer") ? "urn:other" : "urn:smartrent:backend")
            .audience(List.of(defect.equals("audience") ? "other" : "smartrent-api"))
            .subject(defect.equals("subject") ? "not-a-uuid" : UUID.randomUUID().toString())
            .issuedAt(
                defect.equals("future-iat")
                    ? now.plusSeconds(120)
                    : defect.equals("expired") ? now.minusSeconds(3600) : now)
            .notBefore(defect.equals("future-nbf") ? now.plusSeconds(120) : now.minusSeconds(3600))
            .expiresAt(
                defect.equals("expired")
                    ? now.minusSeconds(60)
                    : defect.equals("ttl") ? now.plusSeconds(3600) : now.plusSeconds(1800));
    if (!defect.equals("jti")) c.id(UUID.randomUUID().toString());
    return encoder
        .encode(
            JwtEncoderParameters.from(JwsHeader.with(SignatureAlgorithm.RS256).build(), c.build()))
        .getTokenValue();
  }

  @Test
  void acceptsApprovedRs256Claims() {
    assertThat(decoder.decode(token("none")).getAudience()).containsExactly("smartrent-api");
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "issuer",
        "audience",
        "subject",
        "expired",
        "future-iat",
        "future-nbf",
        "ttl",
        "jti"
      })
  void rejectsInvalidClaims(String defect) {
    String t = token(defect);
    assertThatThrownBy(() -> decoder.decode(t)).isInstanceOf(JwtException.class);
  }

  @Test
  void rejectsTamperedSignature() {
    String t = token("none");
    int index = t.lastIndexOf('.') + 10;
    String changed =
        t.substring(0, index) + (t.charAt(index) == 'A' ? 'B' : 'A') + t.substring(index + 1);
    assertThatThrownBy(() -> decoder.decode(changed)).isInstanceOf(JwtException.class);
  }

  @Test
  void rejectsHmacAlgorithmConfusion() throws Exception {
    var jwt =
        new com.nimbusds.jwt.SignedJWT(
            new com.nimbusds.jose.JWSHeader(com.nimbusds.jose.JWSAlgorithm.HS256),
            new com.nimbusds.jwt.JWTClaimsSet.Builder()
                .subject(UUID.randomUUID().toString())
                .build());
    byte[] key = new byte[32];
    new java.security.SecureRandom().nextBytes(key);
    jwt.sign(new com.nimbusds.jose.crypto.MACSigner(key));
    assertThatThrownBy(() -> decoder.decode(jwt.serialize())).isInstanceOf(JwtException.class);
  }

  @Test
  void missingExternalKeyFailsClosed() {
    assertThatThrownBy(() -> config.jwtEncoder("/nonexistent/private", "/nonexistent/public"))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("matching RSA JWT keys");
  }
}
