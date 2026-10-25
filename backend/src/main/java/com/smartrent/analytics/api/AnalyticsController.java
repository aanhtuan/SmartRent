package com.smartrent.analytics.api;

import com.smartrent.analytics.application.AnalyticsService;
import com.smartrent.identity.application.Actor;
import java.time.Instant;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Profile("!foundation-test")
@RequestMapping("/api/analytics")
public class AnalyticsController {
  private final AnalyticsService service;

  public AnalyticsController(AnalyticsService service) {
    this.service = service;
  }

  @GetMapping("/financial-summary")
  public AnalyticsService.FinancialSummary getFinancialSummary(
      @RequestParam(required = false) Integer year) {
    return service.getFinancialSummary(Actor.current(), year);
  }

  @GetMapping("/occupancy")
  public AnalyticsService.OccupancySummary getOccupancySummary() {
    return service.getOccupancySummary(Actor.current());
  }

  @GetMapping("/export/payments.csv")
  public ResponseEntity<byte[]> exportPaymentsCsv() {
    byte[] data = service.exportPaymentsCsv(Actor.current());
    String filename = "smartrent-payments-" + Instant.now().getEpochSecond() + ".csv";

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
        .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
        .body(data);
  }
}
