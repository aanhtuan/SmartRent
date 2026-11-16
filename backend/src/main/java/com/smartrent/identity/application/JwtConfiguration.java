package com.smartrent.identity.application;

import com.nimbusds.jose.jwk.*;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import java.nio.file.*;
import java.security.*;
import java.security.interfaces.*;
import java.security.spec.*;
import java.time.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.*;

@Configuration
@Profile("!foundation-test")
public class JwtConfiguration {
  static byte[] pem(String path, String label) {
    try {
      return Base64.getMimeDecoder()
          .decode(
              Files.readString(Path.of(path))
                  .replace("-----BEGIN " + label + "-----", "")
                  .replace("-----END " + label + "-----", ""));
    } catch (Exception e) {
      throw new IllegalStateException("Configure readable external JWT key files.");
    }
  }

  @Bean
  JwtEncoder jwtEncoder(
      @Value("${SMARTRENT_JWT_PRIVATE_KEY_FILE:}") String path,
      @Value("${SMARTRENT_JWT_PUBLIC_KEY_FILE:}") String pub) {
    try {
      var k = KeyFactory.getInstance("RSA");
      var privateKey =
          (RSAPrivateKey) k.generatePrivate(new PKCS8EncodedKeySpec(pem(path, "PRIVATE KEY")));
      var publicKey =
          (RSAPublicKey) k.generatePublic(new X509EncodedKeySpec(pem(pub, "PUBLIC KEY")));
      if (publicKey.getModulus().bitLength() < 2048
          || !privateKey.getModulus().equals(publicKey.getModulus()))
        throw new IllegalStateException();
      return new NimbusJwtEncoder(
          new ImmutableJWKSet<>(
              new JWKSet(
                  new com.nimbusds.jose.jwk.RSAKey.Builder(publicKey)
                      .privateKey(privateKey)
                      .keyID("smartrent-rs256-v1")
                      .build())));
    } catch (Exception e) {
      throw new IllegalStateException("Configure matching RSA JWT keys of at least 2048 bits.");
    }
  }

  @Bean
  JwtDecoder jwtDecoder(
      @Value("${SMARTRENT_JWT_PUBLIC_KEY_FILE:}") String path,
      @Value("${SMARTRENT_JWT_ISSUER:urn:smartrent:backend}") String issuer,
      @Value("${SMARTRENT_JWT_AUDIENCE:smartrent-api}") String audience) {
    if (issuer.isBlank() || audience.isBlank())
      throw new IllegalStateException("Configure nonblank JWT issuer and audience.");
    try {
      var publicKey =
          (RSAPublicKey)
              KeyFactory.getInstance("RSA")
                  .generatePublic(new X509EncodedKeySpec(pem(path, "PUBLIC KEY")));
      if (publicKey.getModulus().bitLength() < 2048) throw new IllegalStateException();
      var decoder =
          NimbusJwtDecoder.withPublicKey(publicKey)
              .signatureAlgorithm(SignatureAlgorithm.RS256)
              .build();
      OAuth2TokenValidator<Jwt> required =
          jwt -> {
            try {
              UUID.fromString(jwt.getSubject());
              if (jwt.getIssuedAt() == null
                  || jwt.getNotBefore() == null
                  || jwt.getExpiresAt() == null
                  || jwt.getId() == null
                  || jwt.getId().isBlank()
                  || !jwt.getAudience().contains(audience)
                  || jwt.getExpiresAt().isAfter(jwt.getIssuedAt().plusSeconds(1800))
                  || !jwt.getExpiresAt().isAfter(jwt.getIssuedAt())
                  || jwt.getIssuedAt().isAfter(Instant.now().plusSeconds(30)))
                throw new IllegalArgumentException();
              return OAuth2TokenValidatorResult.success();
            } catch (Exception e) {
              return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token"));
            }
          };
      decoder.setJwtValidator(
          new DelegatingOAuth2TokenValidator<>(
              new JwtTimestampValidator(Duration.ofSeconds(30)),
              new JwtIssuerValidator(issuer),
              required));
      return decoder;
    } catch (Exception e) {
      throw new IllegalStateException("Configure a valid RSA JWT public key.");
    }
  }
}
