package com.smartrent.identity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.smartrent.identity.application.*;
import com.smartrent.identity.domain.Account;
import com.smartrent.identity.domain.AccountRole;
import com.smartrent.identity.persistence.*;
import com.smartrent.shared.api.ApiFailure;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

class AuthSelfServiceTests {
  private EntityManager em;
  private PasswordEncoder passwordEncoder;
  private LoginService loginService;
  private AuthSelfService service;

  @BeforeEach
  void setUp() {
    em = mock(EntityManager.class);
    passwordEncoder = mock(PasswordEncoder.class);
    loginService = mock(LoginService.class);

    service = new AuthSelfService(passwordEncoder, loginService);
    ReflectionTestUtils.setField(service, "em", em);
  }

  @Test
  void registersNewTenantSuccessfully() {
    TypedQuery<UserRecord> query = mock(TypedQuery.class);
    when(em.createQuery(any(String.class), eq(UserRecord.class))).thenReturn(query);
    when(query.setParameter(eq("email"), any())).thenReturn(query);
    when(query.getResultList()).thenReturn(Collections.emptyList());

    when(passwordEncoder.encode("secret123")).thenReturn("$2a$10$hashed");
    when(loginService.login("newtenant@example.com", "secret123", "127.0.0.1"))
        .thenReturn(
            new LoginService.Result(
                "jwt-token",
                "Bearer",
                new LoginService.User(UUID.randomUUID(), "newtenant@example.com", AccountRole.TENANT)));

    var result =
        service.register(
            "newtenant@example.com",
            "secret123",
            "TENANT",
            "Nguyen Van A",
            "0901234567",
            "127.0.0.1");

    assertThat(result).isNotNull();
    assertThat(result.accessToken()).isEqualTo("jwt-token");
    verify(em).persist(any(UserRecord.class));
  }

  @Test
  void duplicateEmailRegistrationThrowsConflict() {
    TypedQuery<UserRecord> query = mock(TypedQuery.class);
    when(em.createQuery(any(String.class), eq(UserRecord.class))).thenReturn(query);
    when(query.setParameter(eq("email"), any())).thenReturn(query);
    var existingAccount =
        new Account(UUID.randomUUID(), "dup@example.com", "hash", AccountRole.TENANT, true);
    when(query.getResultList()).thenReturn(List.of(new UserRecord(existingAccount)));

    assertThatThrownBy(
            () ->
                service.register(
                    "dup@example.com", "password123", "TENANT", "A", "090", "127.0.0.1"))
        .isInstanceOf(ApiFailure.class)
        .hasFieldOrPropertyWithValue("status", 409);
  }

  @Test
  void forgotPasswordGeneratesResetToken() {
    TypedQuery<UserRecord> query = mock(TypedQuery.class);
    when(em.createQuery(any(String.class), eq(UserRecord.class))).thenReturn(query);
    when(query.setParameter(eq("email"), any())).thenReturn(query);

    var existingAccount =
        new Account(UUID.randomUUID(), "user@example.com", "hash", AccountRole.TENANT, true);
    UserRecord existingUser = new UserRecord(existingAccount);
    when(query.getResultList()).thenReturn(List.of(existingUser));

    var result = service.forgotPassword("user@example.com");

    assertThat(result).isNotNull();
    assertThat(result.resetToken()).isNotBlank();
    verify(em).persist(any(PasswordResetTokenRecord.class));
  }

  @Test
  void resetPasswordUpdatesHashAndMarksTokenUsed() {
    TypedQuery<PasswordResetTokenRecord> query = mock(TypedQuery.class);
    when(em.createQuery(any(String.class), eq(PasswordResetTokenRecord.class))).thenReturn(query);
    when(query.setParameter(eq("token"), any())).thenReturn(query);

    PasswordResetTokenRecord tokenRecord = new PasswordResetTokenRecord();
    tokenRecord.id = UUID.randomUUID();
    tokenRecord.userId = UUID.randomUUID();
    tokenRecord.token = "valid-token-123";
    tokenRecord.expiresAt = Instant.now().plusSeconds(600);
    tokenRecord.used = false;

    when(query.getResultList()).thenReturn(List.of(tokenRecord));

    var account =
        new Account(tokenRecord.userId, "user@example.com", "old-hash", AccountRole.TENANT, true);
    UserRecord user = new UserRecord(account);
    when(em.find(UserRecord.class, tokenRecord.userId)).thenReturn(user);
    when(passwordEncoder.encode("newPassword456")).thenReturn("$2a$10$newHash");

    service.resetPassword("valid-token-123", "newPassword456");

    assertThat(tokenRecord.used).isTrue();
    assertThat(user.passwordHash()).isEqualTo("$2a$10$newHash");
  }

  @Test
  void changePasswordVerifiesCurrentPassword() {
    UUID userId = UUID.randomUUID();
    Actor actor = new Actor(userId, AccountRole.TENANT);
    var account = new Account(userId, "user@example.com", "current-hash", AccountRole.TENANT, true);
    UserRecord user = new UserRecord(account);

    when(em.find(UserRecord.class, userId)).thenReturn(user);
    when(passwordEncoder.matches("wrongPassword", "current-hash")).thenReturn(false);

    assertThatThrownBy(() -> service.changePassword(actor, "wrongPassword", "newPassword123"))
        .isInstanceOf(ApiFailure.class)
        .hasFieldOrPropertyWithValue("status", 400);

    when(passwordEncoder.matches("correctPassword", "current-hash")).thenReturn(true);
    when(passwordEncoder.encode("newPassword123")).thenReturn("$2a$10$updated");

    service.changePassword(actor, "correctPassword", "newPassword123");
    assertThat(user.passwordHash()).isEqualTo("$2a$10$updated");
  }
}
