import { useState, useRef } from 'react';
import './App.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  id: string;
  text: string;
  usage: any;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  const scrollDownALittle = () => {
    if (chatContainerRef.current) {
        const lines = 20; 
        const lineHeightInPixels = 22.5; 
        const pixelsToScroll = lines * lineHeightInPixels;

        chatContainerRef.current.scrollBy({ top: pixelsToScroll, behavior: "smooth" });
    }
  };
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      scrollToBottom();
    }, 100);

    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          temperature: 0.7,
          maxTokens: 512
        }),
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data: ChatResponse = await response.json();
      setMessages([...updatedMessages, { role: 'assistant', content: data.text }]);

      setTimeout(() => {
        scrollDownALittle();
      }, 100);

    } catch (error) {
      console.error(error);
      setMessages([...updatedMessages, { role: 'assistant', content: 'Connection error' }]);
      
      setTimeout(() => {
        scrollDownALittle();
      }, 100);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app-wrapper">
      <div className="chat-window">
        
        <div className="chat-messages" ref={chatContainerRef}>
          
          <div className="welcome-screen">
            <img src="/app-icon.svg" alt="App Icon" className="main-logo" />
            <h1>Ask AI anything</h1>
          </div>

          {messages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.role}`}>
              {msg.role === 'assistant' && <span className="message-label">AI</span>}
              <div className="message-bubble">
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-wrapper assistant">
              <span className="message-label">AI</span>
              <div className="message-bubble typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
        </div>

        

        <div className="input-container">
          <div className="input-box">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={messages.length === 0 ? "Ask me anything about your projects" : ""}
              disabled={isLoading}
            />
            <button className="send-btn" onClick={handleSend} disabled={isLoading || !input.trim()}>
              <img src="/send-icon.svg" alt="Send" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;