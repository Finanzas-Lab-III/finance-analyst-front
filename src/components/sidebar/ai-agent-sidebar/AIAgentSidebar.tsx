'use client';

import React, { useState } from 'react';
import {
  ChatInterface,
  ResizableSidebar
} from './components';
import { Plus, X } from 'lucide-react';

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

interface Message {
  id: string;
  message: string;
  sender: 'ai' | 'user';
  timestamp?: string;
  scenarioData?: InflationScenarioData;
}

interface AIAgentSidebarProps {
  excelFilePath: string;
}

const AIAgentSidebar: React.FC<AIAgentSidebarProps> = ({ excelFilePath }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_SERVICE_URL;
      const endpoint = `${baseUrl}/api/analyze/budget_variation`;

      const requestBody = {
        question: message,
        agent_type: 'budget_variation',
        excel_file: excelFilePath
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      console.log('Scenario data from API:', data.is_inflation_scenario, data.monthly);

      // Check for monthly inflation scenario data
      const scenarioData = data.is_inflation_scenario && data.monthly ? {
        is_inflation_scenario: data.is_inflation_scenario,
        monthly: data.monthly
      } : undefined;
      // Validate the response format
      if (data.errors) {
        throw new Error(data.errors.excel_file?.[0] || 'Invalid request data');
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        message: data.answer,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
        scenarioData: scenarioData,
      };
      console.log('AI Message created:', aiMessage);
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error fetching analysis:', error);
      const errorMessage: Message = {
        id: `ai-error-${Date.now()}`,
        message: 'Sorry, I encountered an error trying to get your analysis. Please try again.',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResizableSidebar
      defaultWidth={400}
      minWidth={350}
      maxWidth={600}
      position="right"
      className="bg-white text-gray-900 border-l border-gray-200"
    >
      <div className="h-full flex flex-col p-4">
        <div className="flex-1 min-h-0">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            disabled={isLoading}
          />
        </div>
      </div>
    </ResizableSidebar>
  );
};

export default AIAgentSidebar; 