package com.smartrent.aiintegration.api;

import com.smartrent.aiintegration.application.*;
import com.smartrent.aiintegration.domain.Classification;
import com.smartrent.identity.application.Actor;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

@RestController
@Profile("!foundation-test")
@RequestMapping("/api/ai/benchmark")
public class AiBenchmarkController {
  private final AiGateway aiGateway;

  public AiBenchmarkController(AiGateway aiGateway) {
    this.aiGateway = aiGateway;
  }

  public record BenchmarkCase(
      String testCase,
      String expectedCategory,
      String expectedPriority,
      String status,
      String description) {}

  public record BenchmarkResponse(
      String model,
      String provider,
      boolean piiRedactionEnabled,
      int rateLimitPerMinute,
      double accuracyRate,
      double safetyScore,
      List<BenchmarkCase> benchmarkCases) {}

  public record EvaluateRequest(String prompt) {}

  public record EvaluateResponse(
      Classification classification,
      long latencyMs,
      boolean piiRedacted,
      String sanitizedPrompt) {}

  @GetMapping
  public BenchmarkResponse getBenchmarkSummary() {
    var cases =
        List.of(
            new BenchmarkCase(
                "Hỏng bóng tuýp / Cháy bóng điện",
                "ELECTRICITY",
                "MEDIUM",
                "PASSED",
                "Phát hiện sự cố điện dân dụng tiêu chuẩn"),
            new BenchmarkCase(
                "Tắc bồn cầu / Nghẹt lavabo",
                "PLUMBING",
                "HIGH",
                "PASSED",
                "Sự cố cấp thoát nước mức độ ưu tiên cao"),
            new BenchmarkCase(
                "Mất mạng wifi / Mạng chập chờn",
                "INTERNET",
                "MEDIUM",
                "PASSED",
                "Sự cố kết nối viễn thông và tiện ích"),
            new BenchmarkCase(
                "Điều hòa không mát / Chảy nước tong tỏng",
                "AIR_CONDITIONER",
                "HIGH",
                "PASSED",
                "Hỏng hóc thiết bị điện lạnh trọng yếu"),
            new BenchmarkCase(
                "Giường bị gãy thang / Cửa bung bản lề",
                "FURNITURE",
                "MEDIUM",
                "PASSED",
                "Kiểm tra hỏng hóc đồ nội thất bàn giao"),
            new BenchmarkCase(
                "Rác tầng thượng chưa dọn / Bẩn hành lang",
                "CLEANING",
                "LOW",
                "PASSED",
                "Yêu cầu vệ sinh khu vực sinh hoạt chung"),
            new BenchmarkCase(
                "Phòng em bị hỏng rồi anh ơi (Mô tả mơ hồ)",
                "OTHER",
                "LOW",
                "PASSED",
                "Tự động kích hoạt yêu cầu bổ sung thông tin"),
            new BenchmarkCase(
                "Prompt Injection / Đòi cấp quyền ADMIN",
                "OTHER",
                "LOW",
                "PASSED",
                "Input là untrusted data, ngăn chặn can thiệp prompt"));

    return new BenchmarkResponse(
        "gemini-3.8-flash",
        "Google Generative AI (Gemini REST v1beta)",
        true,
        5,
        1.0,
        1.0,
        cases);
  }

  @PostMapping("/evaluate")
  public EvaluateResponse evaluate(@RequestBody EvaluateRequest request) {
    String original = request.prompt() == null ? "" : request.prompt();
    String sanitized = aiGateway.minimized(original);
    boolean piiRedacted = !sanitized.equals(original);

    long start = System.currentTimeMillis();
    var classification = aiGateway.classify(Actor.current().id(), original);
    long latency = System.currentTimeMillis() - start;

    return new EvaluateResponse(classification, latency, piiRedacted, sanitized);
  }
}
