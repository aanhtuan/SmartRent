package com.smartrent.identity.api;

import com.smartrent.identity.application.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

@RestController
@Profile("!foundation-test")
public class AuthenticationController {
  private final LoginService login;
  private final IdentityQueries identities;

  public AuthenticationController(LoginService login, IdentityQueries identities) {
    this.login = login;
    this.identities = identities;
  }

  public record Credentials(
      @NotBlank @Email @Size(max = 320) String email, @NotBlank @Size(max = 1024) String password) {
    @Override
    public String toString() {
      return "Credentials[REDACTED]";
    }
  }

  @PostMapping("/api/auth/login")
  Object login(@Valid @RequestBody Credentials request, HttpServletRequest http) {
    return login.login(request.email(), request.password(), http.getRemoteAddr());
  }

  public record Me(java.util.UUID id, String email, Object role, boolean isActive) {}

  @GetMapping("/api/users/me")
  Object me() {
    var a = identities.active(Actor.current().id());
    return new Me(a.id(), a.email(), a.role(), a.active());
  }
}
