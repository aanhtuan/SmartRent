package com.smartrent.identity.application;

import com.smartrent.identity.domain.Account;
import com.smartrent.identity.domain.AccountRole;
import com.smartrent.identity.persistence.PasswordResetTokenRecord;
import com.smartrent.identity.persistence.UserRecord;
import com.smartrent.shared.api.ApiFailure;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@Profile("!foundation-test")
public class AuthSelfService {
  @PersistenceContext private EntityManager em;
  private final PasswordEncoder passwordEncoder;
  private final LoginService loginService;

  public AuthSelfService(PasswordEncoder passwordEncoder, LoginService loginService) {
    this.passwordEncoder = passwordEncoder;
    this.loginService = loginService;
  }

  public record ProfileView(
      UUID id, String email, String role, String fullName, String phoneNumber) {}

  public record ForgotPasswordResult(String message, String resetToken) {}

  public LoginService.Result register(
      String email, String password, String roleStr, String fullName, String phoneNumber, String ip) {
    if (email == null || email.isBlank() || password == null || password.length() < 6) {
      throw ApiFailure.invalid();
    }
    String normalizedEmail = email.strip().toLowerCase(Locale.ROOT);

    var existing =
        em.createQuery("SELECT u FROM UserRecord u WHERE u.email = :email", UserRecord.class)
            .setParameter("email", normalizedEmail)
            .getResultList();
    if (!existing.isEmpty()) {
      throw ApiFailure.conflict();
    }

    String chosenRole = (roleStr != null && roleStr.equalsIgnoreCase("LANDLORD")) ? "LANDLORD" : "TENANT";
    AccountRole role = AccountRole.valueOf(chosenRole);
    String hashed = passwordEncoder.encode(password);

    var account = new Account(UUID.randomUUID(), normalizedEmail, hashed, role, true);
    var user = new UserRecord(account);
    user.fullName = fullName != null ? fullName.trim() : null;
    user.phoneNumber = phoneNumber != null ? phoneNumber.trim() : null;

    em.persist(user);
    em.flush();

    return loginService.login(normalizedEmail, password, ip != null ? ip : "127.0.0.1");
  }

  public ForgotPasswordResult forgotPassword(String email) {
    if (email == null || email.isBlank()) throw ApiFailure.invalid();
    String normalizedEmail = email.strip().toLowerCase(Locale.ROOT);

    var users =
        em.createQuery("SELECT u FROM UserRecord u WHERE u.email = :email", UserRecord.class)
            .setParameter("email", normalizedEmail)
            .getResultList();

    if (users.isEmpty()) {
      // Do not leak email existence
      return new ForgotPasswordResult(
          "Nếu tài khoản tồn tại, hướng dẫn đặt lại mật khẩu đã được xử lý.", null);
    }

    var user = users.get(0);
    String token = UUID.randomUUID().toString().replace("-", "");
    var resetToken = new PasswordResetTokenRecord();
    resetToken.id = UUID.randomUUID();
    resetToken.userId = user.id();
    resetToken.token = token;
    resetToken.expiresAt = Instant.now().plus(Duration.ofMinutes(15));
    resetToken.used = false;
    resetToken.createdAt = Instant.now();

    em.persist(resetToken);
    em.flush();

    return new ForgotPasswordResult(
        "Mã đặt lại mật khẩu đã được tạo thành công (hiệu lực 15 phút).", token);
  }

  public void resetPassword(String token, String newPassword) {
    if (token == null || token.isBlank() || newPassword == null || newPassword.length() < 6) {
      throw ApiFailure.invalid();
    }

    var tokens =
        em.createQuery(
                "SELECT t FROM PasswordResetTokenRecord t WHERE t.token = :token AND t.used = false",
                PasswordResetTokenRecord.class)
            .setParameter("token", token.trim())
            .getResultList();

    if (tokens.isEmpty()) {
      throw new ApiFailure(400, "INVALID_TOKEN", "Mã đặt lại mật khẩu không hợp lệ hoặc đã sử dụng.");
    }

    var resetToken = tokens.get(0);
    if (resetToken.expiresAt.isBefore(Instant.now())) {
      throw new ApiFailure(400, "EXPIRED_TOKEN", "Mã đặt lại mật khẩu đã hết hạn.");
    }

    var user = em.find(UserRecord.class, resetToken.userId);
    if (user == null) {
      throw ApiFailure.missing();
    }

    user.setPasswordHash(passwordEncoder.encode(newPassword));
    resetToken.used = true;
    em.flush();
  }

  public void changePassword(Actor actor, String currentPassword, String newPassword) {
    if (actor == null || currentPassword == null || newPassword == null || newPassword.length() < 6) {
      throw ApiFailure.invalid();
    }

    var user = em.find(UserRecord.class, actor.id());
    if (user == null) throw ApiFailure.missing();

    if (!passwordEncoder.matches(currentPassword, user.passwordHash())) {
      throw new ApiFailure(400, "INVALID_PASSWORD", "Mật khẩu hiện tại không chính xác.");
    }

    user.setPasswordHash(passwordEncoder.encode(newPassword));
    em.flush();
  }

  @Transactional(readOnly = true)
  public ProfileView getProfile(Actor actor) {
    var user = em.find(UserRecord.class, actor.id());
    if (user == null) throw ApiFailure.missing();
    return new ProfileView(user.id(), user.email(), user.toAccount().role().name(), user.fullName, user.phoneNumber);
  }

  public ProfileView updateProfile(Actor actor, String fullName, String phoneNumber) {
    var user = em.find(UserRecord.class, actor.id());
    if (user == null) throw ApiFailure.missing();

    if (fullName != null) user.fullName = fullName.trim();
    if (phoneNumber != null) user.phoneNumber = phoneNumber.trim();
    em.flush();

    return new ProfileView(user.id(), user.email(), user.toAccount().role().name(), user.fullName, user.phoneNumber);
  }
}
