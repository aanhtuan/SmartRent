package com.smartrent.maintenance;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.smartrent.identity.application.Actor;
import com.smartrent.identity.domain.AccountRole;
import com.smartrent.maintenance.application.MaintenanceQueries;
import com.smartrent.maintenance.application.MaintenanceWorkLogService;
import com.smartrent.maintenance.domain.MaintenanceWorkLog;
import com.smartrent.maintenance.domain.MaintenanceWorkLogRepository;
import com.smartrent.shared.api.ApiFailure;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class MaintenanceWorkLogServiceTests {
  private MaintenanceWorkLogRepository repository;
  private MaintenanceQueries maintenance;
  private MaintenanceWorkLogService service;

  private final UUID requestId = UUID.randomUUID();
  private final Actor landlord = new Actor(UUID.randomUUID(), AccountRole.LANDLORD);
  private final Actor tenant = new Actor(UUID.randomUUID(), AccountRole.TENANT);

  @BeforeEach
  void setUp() {
    repository = mock(MaintenanceWorkLogRepository.class);
    maintenance = mock(MaintenanceQueries.class);
    service = new MaintenanceWorkLogService(repository, maintenance);
  }

  @Test
  void listChecksRequestVisibilityAndReturnsRequestedPage() {
    var entry =
        new MaintenanceWorkLog(
            UUID.randomUUID(),
            requestId,
            landlord.id(),
            "Repairer",
            "Fixed the leak",
            Instant.now());
    when(repository.forRequest(requestId, 20, 10)).thenReturn(List.of(entry));

    var result = service.list(tenant, requestId, 3, 10);

    assertThat(result.items()).containsExactly(entry);
    assertThat(result.page()).isEqualTo(3);
    assertThat(result.pageSize()).isEqualTo(10);
    verify(maintenance).visible(requestId, tenant);
    verify(repository).forRequest(requestId, 20, 10);
  }

  @Test
  void addAttributesEntryToAuthenticatedLandlord() {
    when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

    var result = service.add(landlord, requestId, "Repairer", "Fixed the leak");

    assertThat(result.maintenanceRequestId()).isEqualTo(requestId);
    assertThat(result.recordedByUserId()).isEqualTo(landlord.id());
    assertThat(result.performedBy()).isEqualTo("Repairer");
    assertThat(result.workDescription()).isEqualTo("Fixed the leak");
    verify(maintenance).visible(requestId, landlord);
    verify(repository).save(any());
  }

  @Test
  void tenantCannotAddEntry() {
    assertThatThrownBy(() -> service.add(tenant, requestId, "Repairer", "Fixed the leak"))
        .isInstanceOfSatisfying(
            ApiFailure.class, failure -> assertThat(failure.status()).isEqualTo(403));

    verifyNoInteractions(repository, maintenance);
  }

  @Test
  void addRejectsBlankWorkDescription() {
    assertThatThrownBy(() -> service.add(landlord, requestId, "Repairer", " "))
        .isInstanceOfSatisfying(
            ApiFailure.class, failure -> assertThat(failure.status()).isEqualTo(400));

    verify(maintenance).visible(requestId, landlord);
    verifyNoInteractions(repository);
  }
}
