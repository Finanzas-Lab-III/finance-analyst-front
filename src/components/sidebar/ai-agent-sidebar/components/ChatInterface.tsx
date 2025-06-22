import React, { useState } from 'react';
import { Send } from 'lucide-react';
import ChatMessage from './ChatMessage';

interface Message {
  id: string;
  message: string;
  sender: 'ai' | 'user';
  timestamp?: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
}

interface ChatInterfaceProps {
  messages?: Message[];
  onSendMessage?: (message: string) => void;
  onQuickAction?: (action: string) => void;
  quickActions?: QuickAction[];
  disabled?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages = [], 
  onSendMessage,
  disabled = true 
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim() && onSendMessage && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages Area - Takes all available space */}
      <div className="flex-1 overflow-y-auto pb-4">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p className="text-sm">Start a conversation with the AI agent</p>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg.message}
                sender={msg.sender}
                timestamp={msg.timestamp}
              />
            ))
          )}
          {disabled && (
            <div className="flex justify-center items-center p-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 flex items-center space-x-2 pt-4 border-t border-gray-700">
        <input
          type="text"
          placeholder="Ask me about your data..."
          className="flex-1 bg-[#1D1F20] border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
        />
        <button
          className="bg-transparent hover:bg-gray-700/50 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full w-10 h-10 flex items-center justify-center text-white transition-all duration-200 hover:scale-[1.03]"
          onClick={handleSendMessage}
          disabled={disabled}
        >
          <Send size={17} />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface; 