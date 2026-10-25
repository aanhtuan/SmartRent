import { apiClient } from './client';
import {
  AssistantAnswerResponse,
  AssistantQuestionRequest,
  BenchmarkResponse,
  EvaluateResponse,
} from '../types';

export const assistantApi = {
  ask: async (data: AssistantQuestionRequest): Promise<AssistantAnswerResponse> => {
    return apiClient<AssistantAnswerResponse>('/api/ai-assistant/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getBenchmark: async (): Promise<BenchmarkResponse> => {
    return apiClient<BenchmarkResponse>('/api/ai/benchmark', {
      method: 'GET',
    });
  },

  evaluateBenchmark: async (prompt: string): Promise<EvaluateResponse> => {
    return apiClient<EvaluateResponse>('/api/ai/benchmark/evaluate', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  },
};
