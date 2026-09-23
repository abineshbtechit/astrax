import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useDms } from '../../contexts/DmsContext';
import { Sidebar } from './Sidebar';
import { GlobalSearchModal } from '../modals/GlobalSearchModal';
import { QuickActionModal } from '../modals/QuickActionModal';
import { AiChatModal } from '../modals/AiChatModal';
import { Bot, Sparkles } from 'lucide-react';
import { DocumentItem } from '../../types';

export const triggerAiChat = (doc?: DocumentItem, prompt?: string) => {
  window.dispatchEvent(new CustomEvent('astrax:open-ai-chat', { detail: { doc, prompt } }));
};

export const AppLayout: React.FC = () => {
  const { currentUser } = useDms();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [selectedDocForAi, setSelectedDocForAi] = useState<DocumentItem | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ doc?: DocumentItem; prompt?: string }>;
      if (customEvent.detail?.doc) {
        setSelectedDocForAi(customEvent.detail.doc);
      }
      setIsAiChatOpen(true);
    };
    window.addEventListener('astrax:open-ai-chat', handler);
    return () => window.removeEventListener('astrax:open-ai-chat', handler);
  }, []);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-white text-black flex relative selection:bg-[#64EE00] selection:text-black">
      {/* Sleek Floating Hover-Expanding Sidebar (Navigation Bar) */}
      <Sidebar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
        onOpenAiChat={() => {
          setSelectedDocForAi(null);
          setIsAiChatOpen(true);
        }}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 min-w-0 pl-[76px] transition-all duration-300">
        <main className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Chatbot Action Button (Bottom-Right) */}
      <button
        onClick={() => {
          setSelectedDocForAi(null);
          setIsAiChatOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 p-3.5 bg-black text-[#64EE00] hover:bg-neutral-900 border-2 border-black rounded-2xl shadow-[4px_4px_0px_#64EE00] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#64EE00] transition flex items-center gap-2.5 font-mono cursor-pointer group"
        title="Open Azure AI Chatbot (hungry-agent-gx98rcf3rx)"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-[#64EE00] stroke-[2.5] group-hover:scale-110 transition" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#64EE00] animate-ping" />
        </div>
        <span className="text-xs font-black text-white hidden sm:inline-block">
          AI CHATBOT
        </span>
        <Sparkles className="w-3.5 h-3.5 text-[#64EE00] hidden sm:inline-block animate-pulse" />
      </button>

      {/* Global Search Modal (⌘K) */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Quick Action Modal (+) */}
      <QuickActionModal isOpen={isQuickActionOpen} onClose={() => setIsQuickActionOpen(false)} />

      {/* Azure AI Agent Chatbot Modal */}
      <AiChatModal
        isOpen={isAiChatOpen}
        onClose={() => {
          setIsAiChatOpen(false);
          setSelectedDocForAi(null);
        }}
        initialDoc={selectedDocForAi}
      />
    </div>
  );
};
