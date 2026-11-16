import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assistantApi } from '../../shared/api/assistantApi';
import * as client from '../../shared/api/client';

describe('AI Benchmark and Live Evaluation API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches benchmark summary report with Vietnamese test cases', async () => {
    const mockBenchmarkResponse = {
      model: 'gemini-3.8-flash',
      provider: 'Google Generative AI (Gemini REST v1beta)',
      pii_redaction_enabled: true,
      rate_limit_per_minute: 5,
      accuracy_rate: 1.0,
      safety_score: 1.0,
      benchmark_cases: [
        {
          test_case: 'Hỏng bóng tuýp / Cháy bóng điện',
          expected_category: 'ELECTRICITY',
          expected_priority: 'MEDIUM',
          status: 'PASSED',
          description: 'Phát hiện sự cố điện dân dụng',
        },
      ],
    };

    const spy = vi.spyOn(client, 'apiClient').mockResolvedValueOnce(mockBenchmarkResponse as any);

    const res = await assistantApi.getBenchmark();

    expect(spy).toHaveBeenCalledWith('/api/ai/benchmark', { method: 'GET' });
    expect(res.model).toBe('gemini-3.8-flash');
    expect(res.pii_redaction_enabled).toBe(true);
    expect(res.benchmark_cases).toHaveLength(1);
    expect(res.benchmark_cases[0].expected_category).toBe('ELECTRICITY');
  });

  it('evaluates prompt with PII masking and latency measurement', async () => {
    const mockEvalResponse = {
      classification: {
        category: 'PLUMBING',
        priority: 'HIGH',
        summary: 'Tắc bồn cầu vệ sinh',
        missing_information: [],
        confidence: 0.94,
      },
      latency_ms: 120,
      pii_redacted: true,
      sanitized_prompt: 'Tắc bồn cầu, gọi [REDACTED]',
    };

    const spy = vi.spyOn(client, 'apiClient').mockResolvedValueOnce(mockEvalResponse as any);

    const res = await assistantApi.evaluateBenchmark('Tắc bồn cầu, gọi 0987654321');

    expect(spy).toHaveBeenCalledWith('/api/ai/benchmark/evaluate', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Tắc bồn cầu, gọi 0987654321' }),
    });
    expect(res.classification.category).toBe('PLUMBING');
    expect(res.pii_redacted).toBe(true);
    expect(res.sanitized_prompt).toContain('[REDACTED]');
    expect(res.latency_ms).toBe(120);
  });
});
