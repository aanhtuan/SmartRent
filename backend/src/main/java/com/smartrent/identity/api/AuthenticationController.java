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
  private final AuthSelfService selfService;

  public AuthenticationController(
      LoginService login, IdentityQueries identities, AuthSelfService selfService) {
    this.login = login;
    this.identities = identities;
    this.selfService = selfService;
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

  public record RegisterRequest(
      @NotBlank @Email @Size(max = 320) String email,
      @NotBlank @Size(min = 6, max = 1024) String password,
      String role,
      String full_name,
      String phone_number) {}

  @PostMapping("/api/auth/register")
  Object register(@Valid @RequestBody RegisterRequest request, HttpServletRequest http) {
    return selfService.register(
        request.email(),
        request.password(),
        request.role(),
        request.full_name(),
        request.phone_number(),
        http.getRemoteAddr());
  }

  public record ForgotPasswordRequest(@NotBlank @Email String email) {}

  @PostMapping("/api/auth/forgot-password")
  Object forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
    return selfService.forgotPassword(request.email());
  }

  public record ResetPasswordRequest(
      @NotBlank String token, @NotBlank @Size(min = 6) String new_password) {}

  @PostMapping("/api/auth/reset-password")
  void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    selfService.resetPassword(request.token(), request.new_password());
  }

  public record ChangePasswordRequest(
      @NotBlank String current_password, @NotBlank @Size(min = 6) String new_password) {}

  @PostMapping("/api/auth/change-password")
  void changePassword(@Valid @RequestBody ChangePasswordRequest request) {
    selfService.changePassword(Actor.current(), request.current_password(), request.new_password());
  }

  public record UpdateProfileRequest(String full_name, String phone_number) {}

  @GetMapping("/api/users/profile")
  Object getProfile() {
    return selfService.getProfile(Actor.current());
  }

  @PutMapping("/api/users/profile")
  Object updateProfile(@RequestBody UpdateProfileRequest request) {
    return selfService.updateProfile(Actor.current(), request.full_name(), request.phone_number());
  }

  public record Me(java.util.UUID id, String email, Object role, boolean isActive) {}

  @GetMapping("/api/users/me")
  Object me() {
    var a = identities.active(Actor.current().id());
    return new Me(a.id(), a.email(), a.role(), a.active());
  }
}
