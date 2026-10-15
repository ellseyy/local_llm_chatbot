export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  id: string;
  text: string;
  usage?: Record<string, unknown>;
}