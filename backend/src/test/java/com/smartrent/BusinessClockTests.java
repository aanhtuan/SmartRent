package com.smartrent;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.smartrent.contract.application.ContractQueries;
import com.smartrent.contract.domain.*;
import com.smartrent.payment.application.PaymentService;
import com.smartrent.payment.domain.*;
import java.time.*;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class BusinessClockTests {
  private final Clock clock =
      Clock.fixed(Instant.parse("2026-10-25T17:00:01Z"), ZoneId.of("Asia/Ho_Chi_Minh"));

  @Test
  void contractExpiryAndTenancyUseVietnamBusinessDate() {
    var repo = mock(ContractRepository.class);
    var queries = new ContractQueries(repo, clock);
    var c = new Contract();
    c.status = "ACTIVE";
    c.endDate = LocalDate.parse("2026-10-25");
    assertThat(queries.status(c)).isEqualTo("EXPIRED");
    UUID room = UUID.randomUUID();
    queries.occupied(room);
    verify(repo).effective(room, null, LocalDate.parse("2026-10-26"));
    c.status = "TERMINATED";
    assertThat(queries.status(c)).isEqualTo("TERMINATED");
  }

  @Test
  void overdueIsDerivedAndPaidRemainsTerminal() {
    var service =
        new PaymentService(
            mock(PaymentRepository.class),
            mock(com.smartrent.contract.application.ContractAccess.class),
            mock(com.smartrent.tenant.application.TenantAccess.class),
            clock,
            mock(org.springframework.context.ApplicationEventPublisher.class));
    var p = new Payment();
    p.status = "PENDING";
    p.dueDate = LocalDate.parse("2026-10-25");
    assertThat(service.status(p)).isEqualTo("OVERDUE");
    p.status = "OVERDUE";
    p.dueDate = LocalDate.parse("2026-10-26");
    assertThat(service.status(p)).isEqualTo("PENDING");
    p.status = "PAID";
    p.dueDate = LocalDate.parse("2026-10-25");
    assertThat(service.status(p)).isEqualTo("PAID");
  }
}
