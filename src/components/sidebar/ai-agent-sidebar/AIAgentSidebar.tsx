'use client';

import React, { useState, useEffect } from 'react';
import { useFileContext } from '@/components/FileContext';
import {
  ChatInterface,
  ResizableSidebar
} from './components';
import { Plus, X } from 'lucide-react';

interface Message {
  id: string;
  message: string;
  sender: 'ai' | 'user';
  timestamp?: string;
}

const AIAgentSidebar: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { selectedFile } = useFileContext();
  const [attendedFiles, setAttendedFiles] = useState<string[]>([]);
  const [isManuallyModified, setIsManuallyModified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedFile && !isManuallyModified) {
      setAttendedFiles([selectedFile]);
    } else if (!selectedFile && !isManuallyModified) {
      setAttendedFiles([]);
    }
  }, [selectedFile, isManuallyModified]);

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
      // Determine endpoint based on whether selected file contains "+"
      // TODO: change ts
      const endpoint = selectedFile && selectedFile.includes('+') 
        ? 'http://localhost:8000/analyze/projection'
        : 'http://localhost:8000/analyze/budget_variation';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        message: data.answer,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
      };
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

  const handleQuickAction = (action: string) => {
    // TODO: Implement quick action handling
    console.log('Quick action:', action);
  };

  const handleAddFile = () => {
    // TODO: Implement file selection modal
    console.log('Add file clicked');
    setIsManuallyModified(true);
  };

  const handleRemoveFile = (fileToRemove: string) => {
    setAttendedFiles(prev => prev.filter(file => file !== fileToRemove));
    setIsManuallyModified(true);
  };

  return (
    <ResizableSidebar
      defaultWidth={320}
      minWidth={250}
      maxWidth={500}
      position="right"
      className="bg-[#1D1F20] text-white"
    >
      <div className="h-full flex flex-col p-4">
        <div className="mb-4 border-b border-gray-700 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleAddFile} className="p-1.5 hover:bg-gray-700 rounded-md text-gray-400 hover:text-white">
              <Plus size={16} />
            </button>
            {attendedFiles.length > 0 ? (
              attendedFiles.map(file => (
                <div key={file} className="flex items-center bg-gray-800/50 py-1 pl-1 pr-2 rounded-full">
                  <button onClick={() => handleRemoveFile(file)} className="p-0.5 hover:bg-gray-700/50 rounded-full text-gray-400 hover:text-white mr-1">
                    <X size={14} />
                  </button>
                  <span className="text-sm truncate text-gray-300">{file.split('/').pop()}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-xs text-gray-500 px-2">
                No file in context.
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            onQuickAction={handleQuickAction}
            disabled={isLoading}
          />
        </div>
      </div>
    </ResizableSidebar>
  );
};

export default AIAgentSidebar; 