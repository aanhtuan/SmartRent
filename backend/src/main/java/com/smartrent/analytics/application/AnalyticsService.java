package com.smartrent.analytics.application;

import com.smartrent.contract.application.ContractService;
import com.smartrent.identity.application.Actor;
import com.smartrent.payment.application.PaymentService;
import com.smartrent.payment.domain.Payment;
import com.smartrent.property.application.PropertyService;
import com.smartrent.room.application.RoomService;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.LocalDate;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Profile("!foundation-test")
public class AnalyticsService {
  private final PaymentService paymentService;
  private final ContractService contractService;
  private final PropertyService propertyService;
  private final RoomService roomService;
  private final Clock clock;

  public AnalyticsService(
      PaymentService paymentService,
      ContractService contractService,
      PropertyService propertyService,
      RoomService roomService,
      Clock clock) {
    this.paymentService = paymentService;
    this.contractService = contractService;
    this.propertyService = propertyService;
    this.roomService = roomService;
    this.clock = clock;
  }

  public record MonthlyRevenue(
      int month,
      BigDecimal revenue,
      BigDecimal pending,
      BigDecimal overdue,
      int transactionCount) {}

  public record FinancialSummary(
      int year,
      BigDecimal totalRevenue,
      BigDecimal totalPending,
      BigDecimal totalOverdue,
      List<MonthlyRevenue> monthlyBreakdown) {}

  public record OccupancySummary(
      int totalRooms,
      int occupiedRooms,
      int availableRooms,
      double occupancyRate) {}

  @Transactional(readOnly = true)
  public FinancialSummary getFinancialSummary(Actor actor, Integer targetYear) {
    actor.requireLandlord();
    int year = (targetYear != null) ? targetYear : LocalDate.now(clock).getYear();

    var payments = paymentService.list(actor, null, null, 1, 1000).items();

    BigDecimal totalRev = BigDecimal.ZERO;
    BigDecimal totalPend = BigDecimal.ZERO;
    BigDecimal totalOver = BigDecimal.ZERO;

    Map<Integer, BigDecimal> monthRev = new HashMap<>();
    Map<Integer, BigDecimal> monthPend = new HashMap<>();
    Map<Integer, BigDecimal> monthOver = new HashMap<>();
    Map<Integer, Integer> monthTxCount = new HashMap<>();

    for (int m = 1; m <= 12; m++) {
      monthRev.put(m, BigDecimal.ZERO);
      monthPend.put(m, BigDecimal.ZERO);
      monthOver.put(m, BigDecimal.ZERO);
      monthTxCount.put(m, 0);
    }

    for (Payment p : payments) {
      if (p.billingPeriod != null && p.billingPeriod.getYear() == year) {
        int m = p.billingPeriod.getMonthValue();
        String st = paymentService.status(p);
        BigDecimal amt = p.amount != null ? p.amount : BigDecimal.ZERO;

        monthTxCount.put(m, monthTxCount.get(m) + 1);

        if ("PAID".equals(st)) {
          monthRev.put(m, monthRev.get(m).add(amt));
          totalRev = totalRev.add(amt);
        } else if ("OVERDUE".equals(st)) {
          monthOver.put(m, monthOver.get(m).add(amt));
          totalOver = totalOver.add(amt);
        } else {
          monthPend.put(m, monthPend.get(m).add(amt));
          totalPend = totalPend.add(amt);
        }
      }
    }

    List<MonthlyRevenue> breakdown = new ArrayList<>();
    for (int m = 1; m <= 12; m++) {
      breakdown.add(
          new MonthlyRevenue(
              m, monthRev.get(m), monthPend.get(m), monthOver.get(m), monthTxCount.get(m)));
    }

    return new FinancialSummary(year, totalRev, totalPend, totalOver, breakdown);
  }

  @Transactional(readOnly = true)
  public OccupancySummary getOccupancySummary(Actor actor) {
    actor.requireLandlord();
    var properties = propertyService.list(actor, 1, 100).items();

    int totalRooms = 0;
    Set<UUID> allRoomIds = new HashSet<>();

    for (var prop : properties) {
      var rooms = roomService.list(actor, prop.id, 1, 100).items();
      totalRooms += rooms.size();
      for (var r : rooms) {
        allRoomIds.add(r.id);
      }
    }

    var contracts = contractService.list(actor, null, "ACTIVE", 1, 1000).items();
    Set<UUID> occupiedRoomIds = new HashSet<>();
    for (var c : contracts) {
      if (allRoomIds.contains(c.roomId)) {
        occupiedRoomIds.add(c.roomId);
      }
    }

    int occupied = occupiedRoomIds.size();
    int available = Math.max(0, totalRooms - occupied);
    double rate = totalRooms > 0 ? (occupied * 100.0 / totalRooms) : 0.0;
    // Round to 1 decimal place
    rate = Math.round(rate * 10.0) / 10.0;

    return new OccupancySummary(totalRooms, occupied, available, rate);
  }

  @Transactional(readOnly = true)
  public byte[] exportPaymentsCsv(Actor actor) {
    actor.requireLandlord();
    var payments = paymentService.list(actor, null, null, 1, 2000).items();

    StringBuilder sb = new StringBuilder();
    // UTF-8 BOM for Microsoft Excel on Windows to support Vietnamese diacritics
    sb.append('\uFEFF');
    sb.append("Mã hóa đơn,Kỳ thanh toán,Hạn thanh toán,Số tiền (VNĐ),Trạng thái,Mã hợp đồng\r\n");

    for (Payment p : payments) {
      String st = paymentService.status(p);
      String statusVi =
          switch (st) {
            case "PAID" -> "Đã thanh toán";
            case "OVERDUE" -> "Quá hạn";
            case "PENDING" -> "Chờ thanh toán";
            default -> st;
          };

      sb.append('"').append(p.id).append('"').append(',');
      sb.append('"').append(p.billingPeriod != null ? p.billingPeriod.toString() : "").append('"').append(',');
      sb.append('"').append(p.dueDate != null ? p.dueDate.toString() : "").append('"').append(',');
      sb.append(p.amount != null ? p.amount.toPlainString() : "0").append(',');
      sb.append('"').append(statusVi).append('"').append(',');
      sb.append('"').append(p.contractId != null ? p.contractId.toString() : "").append("\"\r\n");
    }

    return sb.toString().getBytes(StandardCharsets.UTF_8);
  }
}
