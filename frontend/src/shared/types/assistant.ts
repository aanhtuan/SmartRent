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
