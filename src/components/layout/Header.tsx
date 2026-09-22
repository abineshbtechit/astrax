import React, { useState } from 'react';
import { useDms } from '../../contexts/DmsContext';
import {
  Shield,
  Search,
  Bell,
  UserCheck,
  ChevronDown,
  AlertTriangle,
  Lock,
  ExternalLink,
  KeyRound,
  LogOut,
  Sliders,
  Check,
  Bot,
  Sparkles,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { triggerAiChat } from './AppLayout';

export const Header: React.FC<{ onOpenSearch: () => void }> = ({ onOpenSearch }) => {
  const { currentUser, users, switchUser, notifications, markNotificationRead, markAllNotificationsRead, alerts, logout, mongoStatus } = useDms();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const navigate = useNavigate();

  const unreadNotifs = notifications.filter((n) => !n.read);
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search trigger */}
      <div className="flex items-center gap-3 w-1/3">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition w-full max-w-sm text-sm group"
        >
          <Search className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
          <span className="flex-1 text-left truncate">Search cases, documents, SHA-256...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Database Status Indicator */}
        <div
          className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono bg-slate-950/80 border border-slate-800"
          title={mongoStatus?.message || 'Database status'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              mongoStatus?.connected
                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                : 'bg-amber-400'
            }`}
          />
          <span className={mongoStatus?.connected ? 'text-emerald-400' : 'text-slate-400'}>
            {mongoStatus?.connected
              ? (mongoStatus?.provider === 'AZURE_COSMOS_DB' ? 'AZURE COSMOS DB: ONLINE' : 'MONGODB: ONLINE')
              : (mongoStatus?.provider === 'AZURE_COSMOS_DB' ? 'AZURE COSMOS DB: READY' : 'MONGODB: READY')}
          </span>
        </div>

        {/* Security Alert Beacon */}
        <Link
          to="/security"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition ${
            activeAlerts.length > 0
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse hover:bg-rose-500/20'
              : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-300'
          }`}
          title="Security Threats & Alarms"
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${activeAlerts.length > 0 ? 'text-rose-400' : 'text-slate-400'}`} />
          <span>{activeAlerts.length} ALERTS</span>
        </Link>

        {/* MFA status pill */}
        <Link
          to="/settings"
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-slate-800/80 border border-slate-700 text-slate-300 hover:border-indigo-500/40 transition"
          title="Multi-Factor Authentication Status"
        >
          <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
          <span>MFA: {currentUser?.mfaEnabled ? 'ENFORCED' : 'OPTIONAL'}</span>
        </Link>

        {/* Azure AI Agent Chatbot Trigger */}
        <button
          onClick={() => triggerAiChat()}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#64EE00]/10 text-[#64EE00] border border-[#64EE00]/40 hover:bg-[#64EE00]/20 transition cursor-pointer"
          title="Open Azure AI Chatbot (hungry-agent-gx98rcf3rx)"
        >
          <Bot className="w-3.5 h-3.5 text-[#64EE00]" />
          <span>AI AGENT</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#64EE00] animate-pulse" />
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <span className="text-xs font-bold font-mono tracking-wider text-slate-300">SECURITY NOTIFICATIONS</span>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">No recent notifications</div>
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
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-800/50 transition ${
                        !n.read ? 'bg-slate-800/25 border-l-2 border-cyan-400' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-semibold text-slate-200">{n.title}</span>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-400 leading-relaxed text-[11px]">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-slate-800 bg-slate-950/40 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifMenu(false)}
                  className="text-xs text-slate-400 hover:text-cyan-400 font-medium"
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
            className="flex items-center gap-2.5 p-1.5 pl-2.5 pr-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold font-mono">
              {currentUser?.fullName.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[130px]">
                {currentUser?.fullName}
              </div>
              <div className="text-[10px] font-mono text-cyan-400 leading-tight">
                {currentUser?.department} • {currentUser?.role.replace('_', ' ')}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800">
              {/* Active user details */}
              <div className="p-3.5 bg-slate-950/80">
                <div className="text-xs text-slate-400 font-mono">ACTIVE CREDENTIALS</div>
                <div className="text-sm font-bold text-slate-100 mt-0.5">{currentUser?.fullName}</div>
                <div className="text-xs font-mono text-cyan-400">{currentUser?.email}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
                    Badge: {currentUser?.badgeNumber}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/30">
                    {currentUser?.securityClearance}
                  </span>
                </div>
              </div>

              {/* Department Persona Switcher */}
              <div className="p-2">
                <div className="px-2 py-1 text-[11px] font-mono text-slate-400 font-semibold flex items-center justify-between">
                  <span>SWITCH DEPARTMENT PERSONA</span>
                  <span className="text-[10px] text-cyan-400">TEST ACL</span>
                </div>
                <div className="space-y-1 mt-1 max-h-56 overflow-y-auto">
                  {users.map((u) => {
                    const isSelected = u.id === currentUser?.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-medium'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="truncate mr-2">
                          <div className="font-medium truncate">{u.fullName}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {u.department} — {u.role}
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* User actions */}
              <div className="p-1.5 bg-slate-950/50">
                <Link
                  to="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>My Profile & Clearance</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span>Security & MFA Settings</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition mt-0.5"
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
