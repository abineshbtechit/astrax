import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { GlobalSearchModal } from '../modals/GlobalSearchModal';
import { QuickActionModal } from '../modals/QuickActionModal';

export const AppLayout: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F2F4F7] text-[#0A0D14] flex relative selection:bg-[#64EE00] selection:text-black">
      {/* Sleek Floating Hover-Expanding Sidebar (No Top Navbar!) */}
      <Sidebar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
      />

      {/* Main Canvas Area - Padded on the left to accommodate collapsed sidebar */}
      <div className="flex-1 min-w-0 pl-[76px] transition-all duration-300">
        <main className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen">
          <Outlet />
        </main>
      </div>

      {/* Global Search Modal (⌘K) */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Quick Action Modal (+) */}
      <QuickActionModal isOpen={isQuickActionOpen} onClose={() => setIsQuickActionOpen(false)} />
    </div>
  );
};
