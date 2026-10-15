import { useState, useRef } from 'react';
import { sendChatMessage } from './api';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { WelcomeScreen } from './components/WelcomeScreen';
import type { Message } from './types';
import './App.css';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    setTimeout(scrollToBottom, 100);

    try {
      const replyText = await sendChatMessage(updatedMessages);
      setMessages([...updatedMessages, { role: 'assistant', content: replyText }]);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: 'Connection error' },
      ]);
      setTimeout(scrollToBottom, 100);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <div className="chat-window">
        {messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <div className="chat-messages" ref={chatContainerRef}>
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}

            {isLoading && (
              <div className="message-wrapper assistant">
                <span className="message-label">AI</span>
                <div className="message-bubble typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>
        )}

        <ChatInput
          input={input}
          setInput={setInput}
          onSend={handleSend}
          isLoading={isLoading}
          isFirstMessage={messages.length === 0}
        />
      </div>
    </div>
  );
}

export default App;