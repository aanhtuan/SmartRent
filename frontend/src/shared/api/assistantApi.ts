import { apiClient } from './client';
import { AssistantAnswerResponse, AssistantQuestionRequest } from '../types';

export const assistantApi = {
  ask: async (data: AssistantQuestionRequest): Promise<AssistantAnswerResponse> => {
    return apiClient<AssistantAnswerResponse>('/api/ai-assistant/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
