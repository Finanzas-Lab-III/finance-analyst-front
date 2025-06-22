'use client';

import React from 'react';
import Sidebar from '@/components/sidebar/left-sidebar/Sidebar';
import AIAgentSidebar from '@/components/sidebar/ai-agent-sidebar/AIAgentSidebar';
import { useFileContext } from '@/components/FileContext';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { selectedFile } = useFileContext();

  return (
    <div className="flex h-screen bg-[#2d2f30]">
      <Sidebar />
      <main className="flex-1 h-full overflow-hidden">
        {children}
      </main>
      {selectedFile && <AIAgentSidebar />}
    </div>
  );
};

export default AppLayout;
