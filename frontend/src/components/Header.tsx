import React from 'react';
import { ShieldCheck, Search, Bell, ChevronDown, Lock } from 'lucide-react';
import { ROLES, RoleInfo } from '../data';

interface HeaderProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
  onSearchClick: () => void;
  onNotificationsClick: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onSearchClick,
  onNotificationsClick,
  unreadCount = 3
}) => {
  const user: RoleInfo = ROLES[currentRole] || ROLES.ADMIN;

  return (
    <header className="gov-header">
      <div className="header-inner">
        {/* Brand */}
        <div className="brand-section">
          <div className="emblem-badge" title="National Crime Records Bureau — Digital Custody Node">
            <ShieldCheck size={26} />
          </div>
          <div className="brand-text">
            <h1>
              AstraX
              <span className="pki-tag">PKI SECURED</span>
            </h1>
            <p>Secure Legal & Evidentiary Document Management System</p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="header-actions">
          {/* Quick Search */}
          <div className="quick-search-box" onClick={onSearchClick} role="button" tabIndex={0}>
            <Search size={15} />
            <input placeholder="Search dockets, hash, OCR text…" readOnly />
            <kbd>⌘ K</kbd>
          </div>

          {/* Quick Role Switcher */}
          <div className="role-switcher-widget">
            <span className="role-switcher-label">Clearance:</span>
            <select
              className="role-switcher-select"
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value)}
              title="Switch Active Role Clearance"
            >
              {Object.keys(ROLES).map((r) => (
                <option key={r} value={r}>
                  {r.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Notification Bell */}
          <button
            className="notif-bell-btn"
            title="System & Security Alerts"
            onClick={onNotificationsClick}
          >
            <Bell size={17} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          {/* Officer Profile Badge */}
          <div className="user-profile-widget" title={`${user.title} (${user.department})`}>
            <div className="user-avatar">
              {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div className="user-info">
              <span className="name">{user.name}</span>
              <span className="role-pill">{user.badge}</span>
            </div>
            <ChevronDown size={14} style={{ color: '#94a3b8' }} />
          </div>
        </div>
      </div>
    </header>
  );
};
