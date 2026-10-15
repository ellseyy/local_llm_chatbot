import { useRef, useEffect } from 'react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  isFirstMessage: boolean;
}

export function ChatInput({
  input,
  setInput,
  onSend,
  isLoading,
  isFirstMessage,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!input && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="input-container">
      <div className="input-box">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={
            isFirstMessage
              ? 'Send a message to start a conversation'
              : 'Send a message...'
          }
          disabled={isLoading}
        />
        <button
          type="button"
          className="send-btn"
          onClick={onSend}
          disabled={isLoading || !input.trim()}
        >
          <img src="/send-icon.svg" alt="Send" />
        </button>
      </div>
    </div>
  );
}