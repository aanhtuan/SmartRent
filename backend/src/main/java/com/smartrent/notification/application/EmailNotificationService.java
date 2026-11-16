package com.smartrent.notification.application;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("!foundation-test")
public class EmailNotificationService {
  private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

  public record EmailMessage(String to, String subject, String body) {}

  public void sendAlertEmail(String recipientEmail, String subject, String body) {
    if (recipientEmail == null || recipientEmail.isBlank()) return;
    log.info(
        "[EMAIL ALERT SIMULATION] To: {} | Subject: {} | Body length: {} chars",
        recipientEmail,
        subject,
        body != null ? body.length() : 0);
  }
}
