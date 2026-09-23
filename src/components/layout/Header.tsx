import React, { useState } from 'react';
import { useDms } from '../../contexts/DmsContext';
import {
  Search,
  Bell,
  UserCheck,
  ChevronDown,
  AlertTriangle,
  KeyRound,
  LogOut,
  Sliders,
  Bot,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { triggerAiChat } from './AppLayout';

export const Header: React.FC<{ onOpenSearch: () => void }> = ({ onOpenSearch }) => {
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead, alerts, logout, mongoStatus } = useDms();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const navigate = useNavigate();

  const unreadNotifs = notifications.filter((n) => !n.read);
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');

  return (
    <header className="h-16 bg-white border-b-2 border-black px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Search trigger */}
      <div className="flex items-center gap-3 w-1/3">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border-2 border-black text-black hover:bg-neutral-50 transition w-full max-w-sm text-sm group"
        >
          <Search className="w-4 h-4 text-black group-hover:text-black transition" />
          <span className="flex-1 text-left truncate font-medium text-black">Search cases, documents, SHA-256...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-black text-white rounded font-bold">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Database Status Indicator */}
        <div
          className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono bg-black text-white border-2 border-black"
          title={mongoStatus?.message || 'Database status'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              mongoStatus?.connected
                ? 'bg-[#64EE00]'
                : 'bg-white'
            }`}
          />
          <span className="text-white font-bold">
            {mongoStatus?.connected
              ? (mongoStatus?.provider === 'AZURE_COSMOS_DB' ? 'AZURE COSMOS DB: ONLINE' : 'MONGODB: ONLINE')
              : (mongoStatus?.provider === 'AZURE_COSMOS_DB' ? 'AZURE COSMOS DB: READY' : 'MONGODB: READY')}
          </span>
        </div>

        {/* Security Alert Beacon */}
        <Link
          to="/security"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold border-2 transition ${
            activeAlerts.length > 0
              ? 'bg-[#64EE00] text-black border-black animate-pulse'
              : 'bg-white text-black border-black hover:bg-neutral-100'
          }`}
          title="Security Threats & Alarms"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-black" />
          <span>{activeAlerts.length} ALERTS</span>
        </Link>

        {/* MFA status pill */}
        <Link
          to="/settings"
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-white border-2 border-black text-black hover:bg-neutral-100 transition font-bold"
          title="Multi-Factor Authentication Status"
        >
          <KeyRound className="w-3.5 h-3.5 text-black" />
          <span>MFA: {currentUser?.mfaEnabled ? 'ENFORCED' : 'OPTIONAL'}</span>
        </Link>

        {/* Azure AI Agent Chatbot Trigger */}
        <button
          onClick={() => triggerAiChat()}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-black bg-[#64EE00] text-black border-2 border-black hover:translate-y-[-1px] transition cursor-pointer"
          title="Open Azure AI Chatbot"
        >
          <Bot className="w-3.5 h-3.5 text-black" />
          <span>AI AGENT</span>
          <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-lg bg-white hover:bg-neutral-100 text-black border-2 border-black transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-black" />
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#64EE00] text-black font-black text-[10px] rounded-full border border-black flex items-center justify-center">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#000000] z-50 overflow-hidden">
              <div className="p-3 border-b-2 border-black flex items-center justify-between bg-black text-white">
                <span className="text-xs font-bold font-mono tracking-wider text-white">SECURITY NOTIFICATIONS</span>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-[#64EE00] hover:underline font-bold"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-black/10">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-black/60 font-mono">No recent notifications</div>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.actionUrl) {
                          navigate(n.actionUrl);
                          setShowNotifMenu(false);
                        }
                      }}
                      className={`p-3 text-xs cursor-pointer hover:bg-neutral-50 transition ${
                        !n.read ? 'bg-[#64EE00]/10 border-l-4 border-black' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-bold text-black">{n.title}</span>
                        <span className="text-[10px] text-black/60 font-mono whitespace-nowrap">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-black/80 leading-relaxed text-[11px]">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t-2 border-black bg-neutral-50 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifMenu(false)}
                  className="text-xs text-black hover:text-[#64EE00] font-bold font-mono"
                >
                  View All Notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Persona Switcher & Current User */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 pl-2.5 pr-2 rounded-lg bg-white hover:bg-neutral-100 border-2 border-black transition"
          >
            <div className="w-7 h-7 rounded-full bg-black text-[#64EE00] flex items-center justify-center text-xs font-black font-mono border border-black">
              {currentUser?.fullName.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-black leading-tight truncate max-w-[130px]">
                {currentUser?.fullName}
              </div>
              <div className="text-[10px] font-mono text-black/70 leading-tight font-semibold">
                {currentUser?.department} • {currentUser?.role.replace('_', ' ')}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-black" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#000000] z-50 overflow-hidden">
              {/* Active user details */}
              <div className="p-3.5 bg-black text-white border-b-2 border-black">
                <div className="text-xs text-[#64EE00] font-mono font-bold">ACTIVE CREDENTIALS</div>
                <div className="text-sm font-extrabold text-white mt-0.5">{currentUser?.fullName}</div>
                <div className="text-xs font-mono text-white/80">{currentUser?.email}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-white text-black font-bold rounded border border-black">
                    Badge: {currentUser?.badgeNumber}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-[#64EE00] text-black font-black rounded border border-black">
                    {currentUser?.securityClearance}
                  </span>
                </div>
              </div>

              {/* User actions */}
              <div className="p-1.5 bg-white">
                <Link
                  to="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-black hover:bg-neutral-100 rounded-lg transition font-medium"
                >
                  <UserCheck className="w-3.5 h-3.5 text-black" />
                  <span>My Profile & Clearance</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-black hover:bg-neutral-100 rounded-lg transition font-medium"
                >
                  <Sliders className="w-3.5 h-3.5 text-black" />
                  <span>Security & MFA Settings</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-black hover:bg-black hover:text-white rounded-lg transition mt-0.5 font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
