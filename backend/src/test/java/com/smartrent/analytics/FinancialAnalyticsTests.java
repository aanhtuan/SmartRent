package com.smartrent.analytics;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.smartrent.analytics.application.AnalyticsService;
import com.smartrent.contract.application.ContractService;
import com.smartrent.contract.domain.Contract;
import com.smartrent.identity.application.Actor;
import com.smartrent.identity.domain.AccountRole;
import com.smartrent.payment.application.PaymentService;
import com.smartrent.payment.domain.Payment;
import com.smartrent.property.application.PropertyService;
import com.smartrent.property.domain.Property;
import com.smartrent.room.application.RoomService;
import com.smartrent.room.domain.Room;
import com.smartrent.shared.api.ApiFailure;
import com.smartrent.shared.api.PageResponse;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class FinancialAnalyticsTests {
  private PaymentService paymentService;
  private ContractService contractService;
  private PropertyService propertyService;
  private RoomService roomService;
  private Clock clock;
  private AnalyticsService service;
  private Actor landlord;
  private Actor tenant;

  @BeforeEach
  void setUp() {
    paymentService = mock(PaymentService.class);
    contractService = mock(ContractService.class);
    propertyService = mock(PropertyService.class);
    roomService = mock(RoomService.class);
    clock = Clock.fixed(Instant.parse("2026-10-26T00:00:00Z"), ZoneId.of("UTC"));

    service =
        new AnalyticsService(paymentService, contractService, propertyService, roomService, clock);

    landlord = new Actor(UUID.randomUUID(), AccountRole.LANDLORD);
    tenant = new Actor(UUID.randomUUID(), AccountRole.TENANT);
  }

  @Test
  void aggregatesMonthlyRevenueAndStatusBreakdown() {
    Payment p1 = new Payment();
    p1.id = UUID.randomUUID();
    p1.billingPeriod = LocalDate.of(2026, 1, 1);
    p1.dueDate = LocalDate.of(2026, 1, 10);
    p1.amount = new BigDecimal("4500000");
    p1.status = "PAID";

    Payment p2 = new Payment();
    p2.id = UUID.randomUUID();
    p2.billingPeriod = LocalDate.of(2026, 1, 1);
    p2.dueDate = LocalDate.of(2026, 1, 10);
    p2.amount = new BigDecimal("3500000");
    p2.status = "PENDING";

    Payment p3 = new Payment();
    p3.id = UUID.randomUUID();
    p3.billingPeriod = LocalDate.of(2026, 2, 1);
    p3.dueDate = LocalDate.of(2026, 2, 10);
    p3.amount = new BigDecimal("5000000");
    p3.status = "OVERDUE";

    when(paymentService.list(eq(landlord), any(), any(), eq(1), eq(1000)))
        .thenReturn(new PageResponse<>(List.of(p1, p2, p3), 1, 1000));

    when(paymentService.status(p1)).thenReturn("PAID");
    when(paymentService.status(p2)).thenReturn("PENDING");
    when(paymentService.status(p3)).thenReturn("OVERDUE");

    var summary = service.getFinancialSummary(landlord, 2026);

    assertThat(summary.year()).isEqualTo(2026);
    assertThat(summary.totalRevenue()).isEqualByComparingTo("4500000");
    assertThat(summary.totalPending()).isEqualByComparingTo("3500000");
    assertThat(summary.totalOverdue()).isEqualByComparingTo("5000000");
    assertThat(summary.monthlyBreakdown()).hasSize(12);

    var jan = summary.monthlyBreakdown().get(0);
    assertThat(jan.month()).isEqualTo(1);
    assertThat(jan.revenue()).isEqualByComparingTo("4500000");
    assertThat(jan.pending()).isEqualByComparingTo("3500000");
    assertThat(jan.transactionCount()).isEqualTo(2);

    var feb = summary.monthlyBreakdown().get(1);
    assertThat(feb.month()).isEqualTo(2);
    assertThat(feb.overdue()).isEqualByComparingTo("5000000");
    assertThat(feb.transactionCount()).isEqualTo(1);
  }

  @Test
  void deniesTenantAccessToFinancialAnalytics() {
    assertThatThrownBy(() -> service.getFinancialSummary(tenant, 2026))
        .isInstanceOf(ApiFailure.class);

    assertThatThrownBy(() -> service.getOccupancySummary(tenant))
        .isInstanceOf(ApiFailure.class);

    assertThatThrownBy(() -> service.exportPaymentsCsv(tenant))
        .isInstanceOf(ApiFailure.class);
  }

  @Test
  void calculatesOccupancySummaryCorrectly() {
    Property prop = new Property();
    prop.id = UUID.randomUUID();
    when(propertyService.list(eq(landlord), eq(1), eq(100)))
        .thenReturn(new PageResponse<>(List.of(prop), 1, 100));

    Room r1 = new Room();
    r1.id = UUID.randomUUID();
    Room r2 = new Room();
    r2.id = UUID.randomUUID();
    when(roomService.list(eq(landlord), eq(prop.id), eq(1), eq(100)))
        .thenReturn(new PageResponse<>(List.of(r1, r2), 1, 100));

    Contract activeContract = new Contract();
    activeContract.roomId = r1.id;
    when(contractService.list(eq(landlord), any(), eq("ACTIVE"), eq(1), eq(1000)))
        .thenReturn(new PageResponse<>(List.of(activeContract), 1, 1000));

    var occupancy = service.getOccupancySummary(landlord);

    assertThat(occupancy.totalRooms()).isEqualTo(2);
    assertThat(occupancy.occupiedRooms()).isEqualTo(1);
    assertThat(occupancy.availableRooms()).isEqualTo(1);
    assertThat(occupancy.occupancyRate()).isEqualTo(50.0);
  }

  @Test
  void exportsPaymentsToCsvWithUtf8BomAndVietnameseHeaders() {
    Payment p = new Payment();
    p.id = UUID.randomUUID();
    p.billingPeriod = LocalDate.of(2026, 10, 1);
    p.dueDate = LocalDate.of(2026, 10, 10);
    p.amount = new BigDecimal("4000000");
    p.contractId = UUID.randomUUID();

    when(paymentService.list(eq(landlord), any(), any(), eq(1), eq(2000)))
        .thenReturn(new PageResponse<>(List.of(p), 1, 2000));
    when(paymentService.status(p)).thenReturn("PAID");

    byte[] bytes = service.exportPaymentsCsv(landlord);
    String csv = new String(bytes, StandardCharsets.UTF_8);

    // Verify UTF-8 BOM
    assertThat(csv.charAt(0)).isEqualTo('\uFEFF');
    assertThat(csv).contains("Mã hóa đơn,Kỳ thanh toán,Hạn thanh toán,Số tiền (VNĐ),Trạng thái,Mã hợp đồng");
    assertThat(csv).contains("Đã thanh toán");
    assertThat(csv).contains("4000000");
    assertThat(csv).contains(p.id.toString());
  }
}
