import React from 'react';
import ReactMarkdown from 'react-markdown';
import ProjectionChart from './ProjectionChart';

interface ChartData {
  labels: string[];
  series: { name: string; data: number[]; }[];
}

interface ChatMessageProps {
  message: string;
  sender: 'ai' | 'user';
  timestamp?: string;
  chartData?: ChartData;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, sender, timestamp, chartData }) => {
  const isUser = sender === 'user';
  const isAI = sender === 'ai';
  
  const userMessageClasses = 'bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-gray-900';
  const aiMessageClasses = 'py-2 text-sm text-gray-900';

  return (
    <div className={isUser ? userMessageClasses : aiMessageClasses}>
      {isAI ? (
        <>
          <ReactMarkdown
            components={{
              p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal list-inside" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc list-inside" {...props} />,
            }}
          >
            {message}
          </ReactMarkdown>
          {chartData && (
            <ProjectionChart chartData={chartData} />
          )}
        </>
      ) : (
        message
      )}
      {timestamp && (
        <div className="text-xs mt-1 text-gray-500">
          {timestamp}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
