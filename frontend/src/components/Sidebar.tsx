import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Files,
  Fingerprint,
  GitCommitVertical,
  Clock3,
  Share2,
  ShieldCheck,
  Search,
  FileBarChart,
  PenTool,
  ScrollText,
  ShieldAlert,
  Users,
  BookOpen,
  Lock,
  FileCheck,
  Flame
} from 'lucide-react';

interface SidebarProps {
  mini: boolean;
  onToggleMini: () => void;
  activeRole: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ mini, onToggleMini, activeRole }) => {
  const location = useLocation();

  const navSections = [
    {
      title: 'Command & Operations',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Investigation Center', path: '/investigation-center', icon: Flame },
        { label: 'Investigation Dockets', path: '/cases', icon: FolderKanban, count: 5 },
        { label: 'Document Vault', path: '/documents', icon: Files, count: 5 }
      ]
    },
    {
      title: 'Forensics & Custody',
      items: [
        { label: 'Evidence Ledger', path: '/evidence', icon: Fingerprint, count: 4 },
        { label: 'Chain of Custody', path: '/evidence-chain', icon: GitCommitVertical },
        { label: 'Legal Holds (Sec 67C)', path: '/legal-holds', icon: Lock, count: 2 },
        { label: 'Discovery / Sec 207', path: '/access-requests', icon: FileCheck, count: 3 }
      ]
    },
    {
      title: 'Intelligence & Graph',
      items: [
        { label: 'Investigation Timeline', path: '/timeline', icon: Clock3 },
        { label: 'Relationship Graph', path: '/graph', icon: Share2 },
        { label: 'Advanced Search', path: '/search', icon: Search }
      ]
    },
    {
      title: 'Cryptographic & Legal',
      items: [
        { label: 'Integrity Lab & Sweep', path: '/integrity-lab', icon: ShieldCheck },
        { label: 'Digital Signatures', path: '/signatures', icon: PenTool },
        { label: 'Section 65B Reports', path: '/reports', icon: FileBarChart },
        { label: 'Retention Schedule', path: '/retention', icon: BookOpen }
      ]
    },
    {
      title: 'Security & Governance',
      items: [
        { label: 'Audit Hash Chain', path: '/audit-logs', icon: ScrollText },
        { label: 'Security Center', path: '/security', icon: ShieldAlert, count: 3 },
        { label: 'User Administration', path: '/admin/users', icon: Users }
      ]
    }
  ];

  return (
    <aside className={`gov-sidebar ${mini ? 'mini' : ''}`}>
      <div className="sidebar-scroll">
        {navSections.map((section) => (
          <div key={section.title} className="sidebar-section">
            {!mini && <div className="sidebar-section-title">{section.title}</div>}
            <ul className="sidebar-nav-list">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                      title={item.label}
                    >
                      <span className="icon">
                        <Icon size={18} />
                      </span>
                      {!mini && <span>{item.label}</span>}
                      {!mini && item.count !== undefined && (
                        <span className="sidebar-badge-count">{item.count}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <Link to="/guide" className="sidebar-nav-btn" title="Legal & Technical SOP Guide">
          <span className="icon">
            <BookOpen size={18} />
          </span>
          {!mini && <span>SOP & User Guide</span>}
        </Link>
        <button
          onClick={onToggleMini}
          className="sidebar-nav-btn"
          style={{ cursor: 'pointer' }}
          title={mini ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <span className="icon">
            <ShieldCheck size={18} />
          </span>
          {!mini && <span>{mini ? 'Expand' : 'Compact View'}</span>}
        </button>
      </div>
    </aside>
  );
};
