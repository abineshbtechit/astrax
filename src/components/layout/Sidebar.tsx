import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Fingerprint,
  Scale,
  FileLock2,
  Binary,
  SlidersHorizontal,
  Search,
  Plus,
  LogOut,
  Users,
  Bot,
  Sparkles,
} from 'lucide-react';
import { useDms } from '../../contexts/DmsContext';

interface SidebarProps {
  onOpenSearch: () => void;
  onOpenQuickAction: () => void;
  onOpenAiChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenSearch, onOpenQuickAction, onOpenAiChat }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { currentUser, logout, alerts, documents, mongoStatus } = useDms();

  const activeAlertsCount = alerts.filter((a) => a.status === 'ACTIVE').length;
  const tamperedDocsCount = documents.filter((d) => d.tamperState === 'TAMPERED').length;

  // Navigation hubs with professional security icons
  const navItems = [
    {
      id: 'dashboard',
      label: 'Overview',
      subtitle: 'Bento Command',
      path: '/dashboard',
      icon: Fingerprint,
    },
    {
      id: 'cases',
      label: 'Cases & Evidence',
      subtitle: 'Chain of Custody',
      path: '/cases',
      icon: Scale,
    },
    {
      id: 'documents',
      label: 'Document Vault',
      subtitle: 'Section 65B & Hashes',
      path: '/documents',
      icon: FileLock2,
    },
    ...(currentUser?.role === 'ADMIN'
      ? [
          {
            id: 'users',
            label: 'Personnel & Users',
            subtitle: 'Accreditation & Roster',
            path: '/users',
            icon: Users,
          },
        ]
      : []),
    {
      id: 'integrity-lab',
      label: 'Integrity & Audits',
      subtitle: 'SHA-256 Bitstream',
      path: '/integrity-lab',
      icon: Binary,
      badge: tamperedDocsCount > 0 ? `${tamperedDocsCount}` : activeAlertsCount > 0 ? `${activeAlertsCount}` : undefined,
      badgeColor: tamperedDocsCount > 0 ? 'bg-red-500 text-white' : 'bg-[#64EE00] text-black font-black',
    },
    {
      id: 'settings',
      label: 'Security & Config',
      subtitle: 'Atlas DB & Policies',
      path: '/settings',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed top-0 left-0 h-screen z-50 transition-all duration-300 ease-in-out flex flex-col justify-between py-5 px-3 select-none ${
        isHovered
          ? 'w-64 bg-black/95 backdrop-blur-2xl border-r-2 border-black shadow-[8px_0px_24px_rgba(0,0,0,0.35)]'
          : 'w-[76px] bg-black/90 backdrop-blur-xl border-r-2 border-black'
      }`}
    >
      {/* Top Section: App Logo & Quick Add */}
      <div className="flex flex-col items-center w-full space-y-4">
        {/* Logo */}
        <NavLink
          to="/dashboard"
          className="flex items-center gap-3 w-full px-1.5 py-1 group transition"
          title="AstraX Legal DMS"
        >
          <div className="w-11 h-11 min-w-[44px] rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#64EE00] flex items-center justify-center p-1 relative overflow-hidden transition group-hover:scale-105">
            <img
              src="/logo.png"
              alt="AstraX Logo"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <div
            className={`flex flex-col overflow-hidden transition-all duration-300 ${
              isHovered ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0 pointer-events-none'
            }`}
          >
            <span className="font-black text-sm tracking-tight text-white whitespace-nowrap flex items-center gap-1.5 font-mono">
              ASTRA<span className="text-[#64EE00]">X</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-[#64EE00] text-black font-mono font-bold rounded-sm border border-black">
                DMS
              </span>
            </span>
            <span className="text-[9px] font-mono text-white/70 whitespace-nowrap tracking-wider font-bold">
              LEGAL ENCLAVE
            </span>
          </div>
        </NavLink>

        {/* Quick Action Button (+) */}
        <button
          onClick={onOpenQuickAction}
          className="flex items-center justify-center gap-2 rounded-xl transition font-bold brutal-btn-green w-full h-11 min-h-[44px]"
          title="Quick Action: New Investigation / Upload"
        >
          <Plus className="w-5 h-5 text-black stroke-[3]" />
          <span
            className={`whitespace-nowrap text-xs font-mono font-black transition-all duration-300 ${
              isHovered ? 'inline-block opacity-100' : 'hidden opacity-0'
            }`}
          >
            NEW CASE / DOC
          </span>
        </button>

        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 w-full h-10 min-h-[40px] px-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white transition group"
          title="Global Search (⌘K)"
        >
          <div className="w-6 h-6 flex items-center justify-center min-w-[24px]">
            <Search className="w-4 h-4 text-white/70 group-hover:text-[#64EE00] stroke-[2.5] transition" />
          </div>
          <div
            className={`flex items-center justify-between flex-1 overflow-hidden transition-all duration-300 ${
              isHovered ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0 pointer-events-none'
            }`}
          >
            <span className="text-xs font-bold text-white/80 font-mono whitespace-nowrap">Search...</span>
            <kbd className="text-[10px] font-mono font-bold bg-black border border-white/30 px-1.5 py-0.5 rounded text-[#64EE00]">
              ⌘K
            </kbd>
          </div>
        </button>

        {/* Azure AI Agent Chatbot Button */}
        <button
          onClick={onOpenAiChat}
          className="flex items-center gap-3 w-full h-11 min-h-[44px] px-2.5 rounded-xl border border-[#64EE00]/50 bg-[#64EE00]/10 hover:bg-[#64EE00]/25 text-[#64EE00] transition group relative shadow-[0_0_15px_rgba(100,238,0,0.15)] cursor-pointer"
          title="AstraX Azure AI Agent (gpt-5-mini) • PDF Summarizer"
        >
          <div className="w-7 h-7 rounded-lg bg-black border border-[#64EE00] flex items-center justify-center min-w-[28px] group-hover:scale-110 transition shadow-[0_0_8px_#64EE00]">
            <Bot className="w-4 h-4 text-[#64EE00] stroke-[2.5]" />
          </div>
          <div
            className={`flex items-center justify-between flex-1 overflow-hidden transition-all duration-300 ${
              isHovered ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0 pointer-events-none'
            }`}
          >
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-white font-mono whitespace-nowrap flex items-center gap-1">
                AI CHATBOT
                <Sparkles className="w-3 h-3 text-[#64EE00]" />
              </span>
              <span className="text-[9px] font-mono text-[#64EE00] font-bold truncate">
                Azure AI &bull; gpt-5-mini
              </span>
            </div>
            <span className="text-[8px] font-mono font-black bg-[#64EE00] text-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#FFFFFF]">
              GPT-5
            </span>
          </div>

          {/* Pulse dot when collapsed */}
          {!isHovered && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#64EE00] shadow-[0_0_8px_#64EE00]" />
          )}
        </button>

        {/* Divider */}
        <div className="w-full border-t border-white/20 my-1" />

        {/* Streamlined Core Navigation Items */}
        <nav className="w-full space-y-1.5 font-mono">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 w-full h-12 min-h-[48px] px-2.5 rounded-xl transition group relative ${
                    isActive
                      ? 'bg-[#64EE00] text-black font-black border-2 border-black shadow-[3px_3px_0px_#000000]'
                      : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`w-7 h-7 min-w-[28px] rounded-lg flex items-center justify-center transition ${
                        isActive
                          ? 'bg-black text-[#64EE00]'
                          : 'bg-white/10 group-hover:bg-white/20 text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[2.5]" />
                    </div>

                    <div
                      className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${
                        isHovered ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0 pointer-events-none'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-xs whitespace-nowrap tracking-tight ${
                            isActive ? 'text-black font-black' : 'text-white font-bold'
                          }`}
                        >
                          {item.label}
                        </span>

                        {item.badge && (
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[9px] font-mono whitespace-nowrap truncate font-medium ${
                          isActive ? 'text-black/80' : 'text-white/50'
                        }`}
                      >
                        {item.subtitle}
                      </span>
                    </div>

                    {/* Small dot when collapsed for active items with badges */}
                    {!isHovered && item.badge && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#64EE00] border border-black shadow-[0_0_6px_#64EE00]" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: MongoDB Status & User Profile */}
      <div className="w-full flex flex-col items-center space-y-3 pt-3 border-t border-white/20 relative font-mono">
        {/* Live MongoDB Status Widget */}
        <div
          className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-xl border border-white/20 bg-white/5 text-[11px] font-mono transition"
          title={mongoStatus?.message || 'MongoDB status'}
        >
          <div className="w-6 h-6 min-w-[24px] flex items-center justify-center">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                mongoStatus?.connected
                  ? 'bg-[#64EE00] shadow-[0_0_8px_#64EE00]'
                  : 'bg-white'
              }`}
            />
          </div>
          <div
            className={`flex flex-col overflow-hidden transition-all duration-300 ${
              isHovered ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0 pointer-events-none'
            }`}
          >
            <span className="text-[10px] font-bold text-white whitespace-nowrap">
              {mongoStatus?.connected
                ? (mongoStatus?.provider === 'AZURE_COSMOS_DB' ? 'AZURE COSMOS DB' : 'ATLAS CLUSTER')
                : (mongoStatus?.provider === 'AZURE_COSMOS_DB' ? 'AZURE READY' : 'MONGODB READY')}
            </span>
            <span
              className={`text-[9px] font-bold whitespace-nowrap truncate ${
                mongoStatus?.connected ? 'text-[#64EE00]' : 'text-white/70'
              }`}
            >
              {mongoStatus?.connected ? 'ONLINE & SYNCED' : 'CONFIG SAVED'}
            </span>
          </div>
        </div>

        {/* User Account & Sign Out */}
        <div className="w-full space-y-2">
          <div
            className="w-full flex items-center gap-2 p-1.5 rounded-xl border border-white/20 bg-white/5 text-left transition"
            title="Authenticated Enclave Officer"
          >
            <div className="w-8 h-8 min-w-[32px] rounded-lg bg-white border border-black flex items-center justify-center text-xs font-mono font-black text-black">
              {currentUser ? currentUser.fullName.substring(0, 2).toUpperCase() : 'AX'}
            </div>

            <div
              className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${
                isHovered ? 'opacity-100 max-w-[140px]' : 'opacity-0 max-w-0 pointer-events-none'
              }`}
            >
              <span className="text-xs font-bold text-white whitespace-nowrap truncate">
                {currentUser?.fullName || 'Not logged in'}
              </span>
              <span className="text-[9px] font-mono text-white/60 whitespace-nowrap truncate font-bold">
                {currentUser?.role.replace('_', ' ')} &bull; {currentUser?.department}
              </span>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 p-2 rounded-xl bg-red-500 text-white hover:bg-red-600 border border-red-500/40 text-left transition font-mono text-xs font-bold"
            title="Sign Out Session"
          >
            <LogOut className="w-4 h-4 min-w-[16px] stroke-[2.5]" />
            <span
              className={`transition-all duration-300 whitespace-nowrap truncate ${
                isHovered ? 'opacity-100 max-w-[140px]' : 'opacity-0 max-w-0 pointer-events-none'
              }`}
            >
              Sign Out Session
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};
