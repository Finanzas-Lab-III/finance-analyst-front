import React from 'react';
import ReactMarkdown from 'react-markdown';
import MonthlyInflationChart from './MonthlyInflationChart';

interface MonthlyData {
  categories: string[];
  original_values: number[];
  modified_values: number[];
  chart_type: string;
}

interface InflationScenarioData {
  is_inflation_scenario: boolean;
  monthly: MonthlyData;
}

interface ChatMessageProps {
  message: string;
  sender: 'ai' | 'user';
  timestamp?: string;
  scenarioData?: InflationScenarioData;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, sender, timestamp, scenarioData }) => {
  const isUser = sender === 'user';
  const isAI = sender === 'ai';
  
  console.log('ChatMessage props:', { 
    message: message.substring(0, 50) + '...', 
    sender, 
    scenarioData 
  });

  const userMessageClasses = 'bg-white/5 border border-white/10 rounded-lg p-3 text-sm';
  const aiMessageClasses = 'py-2 text-sm';

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
          {scenarioData && scenarioData.is_inflation_scenario && (
            <MonthlyInflationChart scenarioData={scenarioData} />
          )}
        </>
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