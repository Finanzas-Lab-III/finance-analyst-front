import React from 'react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: string;
  sender: 'ai' | 'user';
  timestamp?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, sender, timestamp }) => {
  const isUser = sender === 'user';
  const isAI = sender === 'ai';

  const userMessageClasses = 'bg-white/5 border border-white/10 rounded-lg p-3 text-sm';
  const aiMessageClasses = 'py-2 text-sm';

  return (
    <div className={isUser ? userMessageClasses : aiMessageClasses}>
      {isAI ? (
        <ReactMarkdown
          components={{
            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal list-inside" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc list-inside" {...props} />,
          }}
        >
          {message}
        </ReactMarkdown>
      ) : (
        message
      )}
      {timestamp && (
        <div className="text-xs mt-1 text-gray-400">
          {timestamp}
        </div>
      )}
    </div>
  );
};

export default ChatMessage; 