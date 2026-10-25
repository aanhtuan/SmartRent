export interface AssistantQuestionRequest {
  question: string;
}

export interface AssistantAnswerResponse {
  answer: string;
  requires_more_information: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  requiresMoreInfo?: boolean;
  isError?: boolean;
}

export interface BenchmarkCase {
  test_case: string;
  expected_category: string;
  expected_priority: string;
  status: string;
  description: string;
}

export interface BenchmarkResponse {
  model: string;
  provider: string;
  pii_redaction_enabled: boolean;
  rate_limit_per_minute: number;
  accuracy_rate: number;
  safety_score: number;
  benchmark_cases: BenchmarkCase[];
}

export interface EvaluateResponse {
  classification: {
    category: string;
    priority: string;
    summary: string;
    missing_information: string[];
    confidence: number;
  };
  latency_ms: number;
  pii_redacted: boolean;
  sanitized_prompt: string;
}
