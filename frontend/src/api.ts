import type { Message, ChatResponse } from './types';

const API_BASE_URL = 'http://127.0.0.1:8000';

export async function sendChatMessage(messages: Message[]): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      temperature: 0.7,
      maxTokens: 512,
    }),
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  const data = (await response.json()) as ChatResponse;
  return data.text;
}