package com.smartrent.identity.application;

import com.smartrent.identity.domain.*;
import com.smartrent.shared.api.ApiFailure;
import java.time.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

@Service
@Profile("!foundation-test")
public class LoginService {
  private final AccountRepository accounts;
  private final PasswordEncoder passwords;
  private final LoginLimiter limiter;
  private final JwtEncoder jwt;
  private final String issuer, audience, dummy;

  public LoginService(
      AccountRepository accounts,
      PasswordEncoder passwords,
      LoginLimiter limiter,
      JwtEncoder jwt,
      @Value("${SMARTRENT_JWT_ISSUER:urn:smartrent:backend}") String issuer,
      @Value("${SMARTRENT_JWT_AUDIENCE:smartrent-api}") String audience) {
    this.accounts = accounts;
    this.passwords = passwords;
    this.limiter = limiter;
    this.jwt = jwt;
    this.issuer = issuer;
    this.audience = audience;
    dummy = passwords.encode(UUID.randomUUID().toString());
  }

  public record User(UUID id, String email, AccountRole role) {}

  public record Result(String accessToken, String tokenType, User user) {}

  public Result login(String email, String password, String ip) {
    email = email.strip().toLowerCase(Locale.ROOT);
    limiter.attempt(ip, email);
    var account = accounts.findByEmail(email);
    boolean matches = false;
    try {
      matches = passwords.matches(password, account.map(Account::passwordHash).orElse(dummy));
    } catch (IllegalArgumentException ignored) {
    }
    if (account.isEmpty() || !matches || !account.orElseThrow().active()) {
      limiter.failed(ip, email);
      throw ApiFailure.unauthenticated();
    }
    var a = account.orElseThrow();
    var now = Instant.now();
    var claims =
        JwtClaimsSet.builder()
            .issuer(issuer)
            .audience(List.of(audience))
            .subject(a.id().toString())
            .issuedAt(now)
            .notBefore(now)
            .expiresAt(now.plusSeconds(1800))
            .id(UUID.randomUUID().toString())
            .build();
    var token =
        jwt.encode(
                JwtEncoderParameters.from(JwsHeader.with(SignatureAlgorithm.RS256).build(), claims))
            .getTokenValue();
    return new Result(token, "Bearer", new User(a.id(), a.email(), a.role()));
  }
}
