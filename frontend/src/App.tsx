import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import * as I from 'lucide-react';
import {
  ROLES,
  DEMO_CREDENTIALS,
  cases as initialCases,
  documents as initialDocs,
  evidence as initialEvidence,
  legalHolds as initialHolds,
  accessRequests as initialRequests,
  retentionRules,
  auditLogs,
  securityAlerts,
  timelineEvents,
  activity
} from './data';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import {
  NewCaseModal,
  DocumentUploadModal,
  PiiRedactionModal,
  CustodyTransferModal,
  TamperSimulatorModal,
  Section65BCertificateModal
} from './components/Modals';

// Helper for status badge styling
const getBadgeClass = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('valid') || s.includes('approved') || s.includes('signed') || s.includes('final') || s.includes('success') || s.includes('active')) {
    return 'badge-status valid';
  }
  if (s.includes('tamper') || s.includes('denied') || s.includes('critical') || s.includes('danger') || s.includes('alarm')) {
    return 'badge-status tampered';
  }
  if (s.includes('review') || s.includes('pending') || s.includes('medium') || s.includes('examination')) {
    return 'badge-status under-review';
  }
  if (s.includes('encrypt') || s.includes('custody') || s.includes('info')) {
    return 'badge-status encrypted';
  }
  return 'badge-status signed';
};

export const AppContext = React.createContext<any>(null);

function Layout() {
  const [mini, setMini] = useState(false);
  const [currentRole, setCurrentRole] = useState('ADMIN');
  const [cases, setCases] = useState(initialCases);
  const [docs, setDocs] = useState(initialDocs);
  const [evidenceItems, setEvidenceItems] = useState(initialEvidence);
  const [holds, setHolds] = useState(initialHolds);
  const [requests, setRequests] = useState(initialRequests);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalTarget, setModalTarget] = useState<any>(null);

  const navigate = useNavigate();

  const handleRoleChange = (role: string) => {
    setCurrentRole(role);
  };

  const contextValue = {
    currentRole,
    cases,
    setCases,
    docs,
    setDocs,
    evidenceItems,
    setEvidenceItems,
    holds,
    setHolds,
    requests,
    setRequests,
    openModal: (type: string, target?: any) => {
      setActiveModal(type);
      setModalTarget(target || null);
    },
    closeModal: () => {
      setActiveModal(null);
      setModalTarget(null);
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="app-container">
        <Header
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          onSearchClick={() => navigate('/search')}
          onNotificationsClick={() => navigate('/notifications')}
        />
        <div className="app-body">
          <Sidebar mini={mini} onToggleMini={() => setMini(!mini)} activeRole={currentRole} />
          <main className="main-content">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/investigation-center" element={<InvestigationCenter />} />
              <Route path="/cases" element={<CasesList />} />
              <Route path="/cases/:id" element={<CaseDetail />} />
              <Route path="/documents" element={<DocumentsList />} />
              <Route path="/documents/:id" element={<DocumentDetail />} />
              <Route path="/evidence" element={<EvidenceList />} />
              <Route path="/evidence/:id" element={<EvidenceDetail />} />
              <Route path="/evidence-chain" element={<EvidenceChain />} />
              <Route path="/legal-holds" element={<LegalHolds />} />
              <Route path="/access-requests" element={<AccessRequests />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/graph" element={<RelationshipGraph />} />
              <Route path="/search" element={<AdvancedSearch />} />
              <Route path="/integrity-lab" element={<IntegrityLab />} />
              <Route path="/security/integrity" element={<IntegrityLab />} />
              <Route path="/signatures" element={<Signatures />} />
              <Route path="/retention" element={<RetentionSchedule />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/security" element={<SecurityCenter />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/guide" element={<UserGuide />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
        <Footer />

        {/* Dynamic Modals */}
        {activeModal === 'NEW_CASE' && (
          <NewCaseModal
            onClose={() => setActiveModal(null)}
            onCreate={(newC) => setCases([newC, ...cases])}
          />
        )}
        {activeModal === 'UPLOAD_DOC' && (
          <DocumentUploadModal
            casesList={cases}
            onClose={() => setActiveModal(null)}
            onUpload={(newDoc) => setDocs([newDoc, ...docs])}
          />
        )}
        {activeModal === 'PII_REDACTION' && modalTarget && (
          <PiiRedactionModal doc={modalTarget} onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'CUSTODY_TRANSFER' && modalTarget && (
          <CustodyTransferModal
            evidenceItem={modalTarget}
            onClose={() => setActiveModal(null)}
            onTransferred={() => {}}
          />
        )}
        {activeModal === 'TAMPER_SIMULATOR' && (
          <TamperSimulatorModal onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'SECTION_65B' && modalTarget && (
          <Section65BCertificateModal doc={modalTarget} onClose={() => setActiveModal(null)} />
        )}
      </div>
    </AppContext.Provider>
  );
}

// 1. Dashboard View
function Dashboard() {
  const { cases, docs, evidenceItems, holds, openModal } = React.useContext(AppContext);

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">NATIONAL CRIME RECORDS BUREAU • ACTIVE CUSTODY NODE</div>
          <div className="page-title">
            <h1>Operational Command Dashboard</h1>
          </div>
          <p>Real-time oversight of investigations, cryptographic custody chains, and judicial preservation.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => openModal('TAMPER_SIMULATOR')}>
            <I.AlertTriangle size={15} color="#dc2626" />
            Simulate Tamper Attack
          </button>
          <button className="btn btn-primary" onClick={() => openModal('NEW_CASE')}>
            <I.Plus size={15} />
            Register Investigation
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-metric-card border-blue">
          <span className="label">Active Investigation Dockets</span>
          <span className="value">{cases.length}</span>
          <span className="sub"><I.ArrowUpRight size={14} color="#16a34a" /> 3 registered this cycle</span>
        </div>
        <div className="stat-metric-card border-purple">
          <span className="label">Classified Legal Documents</span>
          <span className="value">{docs.length}</span>
          <span className="sub"><I.CheckCircle2 size={14} color="#16a34a" /> 100% SHA-256 Validated</span>
        </div>
        <div className="stat-metric-card border-green">
          <span className="label">Sealed Evidentiary Exhibits</span>
          <span className="value">{evidenceItems.length}</span>
          <span className="sub"><I.Lock size={14} color="#16a34a" /> All Seals Verified Intact</span>
        </div>
        <div className="stat-metric-card border-amber">
          <span className="label">Active Legal Holds (Sec 67C)</span>
          <span className="value">{holds.length}</span>
          <span className="sub"><I.ShieldAlert size={14} color="#d97706" /> Deletion Freeze Active</span>
        </div>
      </div>

      {/* Two Columns */}
      <div className="grid-two">
        {/* Recent Dockets */}
        <div className="gov-card">
          <div className="gov-card-header">
            <h2><I.FolderKanban size={18} /> Active Investigation Dockets</h2>
            <Link to="/cases" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }}>
              View All Dockets
            </Link>
          </div>
          <div className="gov-table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Docket #</th>
                  <th>Title & Classification</th>
                  <th>Lead Officer</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {cases.slice(0, 4).map((c: any) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/cases/${c.id}`} style={{ fontWeight: 700, color: '#1d4ed8', textDecoration: 'none' }}>
                        {c.no}
                      </Link>
                    </td>
                    <td>
                      <b>{c.title}</b>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{c.type}</div>
                    </td>
                    <td>{c.officer}</td>
                    <td>
                      <span className={`badge-pill priority-${c.priority.toLowerCase()}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td>
                      <span className={getBadgeClass(c.status)}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Custody Ledger Activity */}
        <div className="gov-card">
          <div className="gov-card-header">
            <h2><I.GitCommitVertical size={18} /> Recent Evidentiary & Custody Events</h2>
            <Link to="/evidence-chain" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }}>
              Inspect Chain
            </Link>
          </div>
          <div className="gov-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {activity.map(([title, desc, time, type], idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: type === 'danger' ? '#fee2e2' : type === 'warning' ? '#fef3c7' : '#dcfce7',
                  color: type === 'danger' ? '#dc2626' : type === 'warning' ? '#d97706' : '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {type === 'danger' ? <I.AlertTriangle size={16} /> : <I.ShieldCheck size={16} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b style={{ fontSize: '13px', color: '#07192f' }}>{title}</b>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{time}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// 2. Investigation Center View
function InvestigationCenter() {
  const { cases, openModal } = React.useContext(AppContext);

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">TACTICAL COMMAND • MULTI-AGENCY COORDINATION</div>
          <div className="page-title">
            <h1>Investigation Operations Center</h1>
          </div>
          <p>Real-time coordination between Police, Cyber Command, Forensic Science Labs, and Judiciary.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => openModal('NEW_CASE')}>
            <I.Plus size={15} />
            Register Investigation Docket
          </button>
        </div>
      </div>

      <div className="grid-two">
        <div className="gov-card">
          <div className="gov-card-header">
            <h3><I.ShieldAlert size={18} /> High-Priority Active Workspaces</h3>
          </div>
          <div className="gov-card-body">
            {cases.filter((c: any) => c.priority === 'CRITICAL' || c.priority === 'HIGH').map((c: any) => (
              <div key={c.id} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link to={`/cases/${c.id}`} style={{ fontWeight: 700, fontSize: '14px', color: '#1d4ed8', textDecoration: 'none' }}>
                    {c.no} — {c.title}
                  </Link>
                  <span className={`badge-pill priority-${c.priority.toLowerCase()}`}>{c.priority}</span>
                </div>
                <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>{c.synopsis}</p>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '11px', color: '#64748b' }}>
                  <span><b>Lead:</b> {c.officer}</span>
                  <span><b>Dept:</b> {c.department}</span>
                  <span><b>Hold Status:</b> {c.legalHoldActive ? 'PRESERVED (Sec 67C)' : 'Standard'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="gov-card">
          <div className="gov-card-header">
            <h3><I.Activity size={18} /> Procedural Adherence & Vulnerability Engine</h3>
          </div>
          <div className="gov-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <b style={{ fontSize: '13px', color: '#07192f' }}>CASE-2026-001 (Commercial Vault Theft)</b>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#16a34a' }}>98% COMPLIANT</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b' }}>All evidence sealed within statutory 12-hour window. Chain of custody continuous.</p>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <b style={{ fontSize: '13px', color: '#07192f' }}>CASE-2026-002 (Financial Phishing)</b>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#d97706' }}>82% COMPLIANT</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Pending secondary witness statement verification under Section 161 Cr.P.C.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// 3. Cases List
function CasesList() {
  const { cases, openModal } = React.useContext(AppContext);
  const [filter, setFilter] = useState('');

  const filtered = cases.filter((c: any) =>
    c.title.toLowerCase().includes(filter.toLowerCase()) ||
    c.no.toLowerCase().includes(filter.toLowerCase()) ||
    c.type.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">CENTRAL REGISTRY • CRIME & EVIDENTIARY DOCKETS</div>
          <div className="page-title">
            <h1>Investigation Registry</h1>
          </div>
          <p>Browse, filter, and audit cross-departmental investigation proceedings.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => openModal('NEW_CASE')}>
            <I.Plus size={15} />
            Register Investigation
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
        <div className="quick-search-box" style={{ width: '380px', background: '#fff', border: '1px solid #cbd5e1', color: '#07192f' }}>
          <I.Search size={16} color="#64748b" />
          <input
            style={{ color: '#07192f' }}
            placeholder="Filter by docket #, title, or crime category..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="gov-table-container">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Docket #</th>
              <th>Investigation Title</th>
              <th>Crime Category</th>
              <th>Lead Agency / Officer</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Evidentiary Records</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c: any) => (
              <tr key={c.id}>
                <td>
                  <Link to={`/cases/${c.id}`} style={{ fontWeight: 700, color: '#1d4ed8', textDecoration: 'none' }}>
                    {c.no}
                  </Link>
                </td>
                <td>
                  <b>{c.title}</b>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{c.jurisdiction}</div>
                </td>
                <td>{c.type}</td>
                <td>
                  <b>{c.department}</b>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{c.officer}</div>
                </td>
                <td><span className={`badge-pill priority-${c.priority.toLowerCase()}`}>{c.priority}</span></td>
                <td><span className={getBadgeClass(c.status)}>{c.status}</span></td>
                <td><b>{c.docs}</b> docs • <b>{c.evidence}</b> exhibits</td>
                <td>
                  <Link to={`/cases/${c.id}`} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                    Workspace
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// 4. Case Detail Workspace
function CaseDetail() {
  const { id } = useParams();
  const { cases, docs, evidenceItems, openModal } = React.useContext(AppContext);
  const [tab, setTab] = useState('Overview');

  const c = cases.find((x: any) => x.id === id) || cases[0];
  const caseDocs = docs.filter((d: any) => d.case === c.id);
  const caseEvidence = evidenceItems.filter((e: any) => e.case === c.id);

  return (
    <>
      <div style={{ marginBottom: '12px', fontSize: '12px', color: '#64748b' }}>
        <Link to="/cases" style={{ color: '#1d4ed8', textDecoration: 'none' }}>Investigations</Link> / <b>{c.no}</b>
      </div>

      <div className="page-header">
        <div>
          <div className="page-eyebrow">DOCKET WORKSPACE • {c.no}</div>
          <div className="page-title">
            <h1>{c.title}</h1>
          </div>
          <p>{c.type} • {c.department} • Lead: {c.officer}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => openModal('SECTION_65B', caseDocs[0] || docs[0])}>
            <I.FileBarChart size={15} />
            Generate Sec 65B Report
          </button>
          <button className="btn btn-primary" onClick={() => openModal('UPLOAD_DOC')}>
            <I.Upload size={15} />
            Ingress Document
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        {['Overview', `Documents (${caseDocs.length})`, `Evidence (${caseEvidence.length})`, 'Timeline', 'Procedural Risk'].map((t) => (
          <button
            key={t}
            className={`tab-btn ${tab === t.split(' ')[0] ? 'active' : ''}`}
            onClick={() => setTab(t.split(' ')[0])}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="grid-two">
          <div className="gov-card">
            <div className="gov-card-header">
              <h3><I.Info size={18} /> Docket Overview & Incident Synopsis</h3>
            </div>
            <div className="gov-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#334155' }}>{c.synopsis}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>JURISDICTION</span>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{c.jurisdiction}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>PROCEDURAL POSTURE</span>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#16a34a' }}>{c.riskScore}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>LEGAL HOLD STATUTE</span>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: c.legalHoldActive ? '#d97706' : '#64748b' }}>
                    {c.legalHoldActive ? 'ACTIVE (Section 67C IT Act)' : 'None'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>ACCESS CLEARANCE</span>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#1d4ed8' }}>FULL READ/WRITE/SIGN</div>
                </div>
              </div>
            </div>
          </div>

          <div className="gov-card">
            <div className="gov-card-header">
              <h3><I.ShieldCheck size={18} /> Participating Enforcement Agencies</h3>
            </div>
            <div className="gov-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge-pill" style={{ background: '#eff6ff', color: '#1d4ed8' }}>LEAD</span>
                <b>Central Crime Branch (CCB)</b> — Forensic Financial Squad
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge-pill">FORENSIC</span>
                <b>Central Forensic Science Laboratory (CFSL)</b> — Cyber & Hardware Labs
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge-pill">JUDICIAL</span>
                <b>Special Sessions Court Registry</b> — Discovery Desk
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'Documents' && (
        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Classification</th>
                <th>Type</th>
                <th>Workflow</th>
                <th>SHA-256 Digest</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {caseDocs.map((d: any) => (
                <tr key={d.id}>
                  <td>
                    <Link to={`/documents/${d.id}`} style={{ fontWeight: 700, color: '#1d4ed8', textDecoration: 'none' }}>
                      {d.name}
                    </Link>
                  </td>
                  <td><span className="badge-pill">{d.classification}</span></td>
                  <td>{d.type}</td>
                  <td><span className={getBadgeClass(d.workflow)}>{d.workflow}</span></td>
                  <td><span className="mono-hash">{d.sha256}</span></td>
                  <td>
                    <Link to={`/documents/${d.id}`} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                      Inspect Record
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Evidence' && (
        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Exhibit ID</th>
                <th>Description</th>
                <th>Type</th>
                <th>Current Custodian</th>
                <th>Seal Tag</th>
                <th>AI Forensic Match</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {caseEvidence.map((e: any) => (
                <tr key={e.id}>
                  <td>
                    <Link to={`/evidence/${e.id}`} style={{ fontWeight: 700, color: '#1d4ed8', textDecoration: 'none' }}>
                      {e.id}
                    </Link>
                  </td>
                  <td><b>{e.name}</b></td>
                  <td>{e.type}</td>
                  <td>{e.custodian}</td>
                  <td><span className="badge-pill">{e.seal}</span></td>
                  <td><span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>{e.aiConfidence}</span></td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => openModal('CUSTODY_TRANSFER', e)}>
                      Transfer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Timeline' && (
        <div className="timeline-container" style={{ marginTop: '16px' }}>
          {timelineEvents.map((t) => (
            <div key={t.id} className="timeline-event-item">
              <div className="timeline-node-icon">
                <I.Clock3 size={15} />
              </div>
              <div className="timeline-event-card">
                <div className="timeline-header">
                  <h4>{t.title}</h4>
                  <span className="timeline-time">{t.time}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 700, marginBottom: '4px' }}>
                  {t.actor} ({t.role.replace('_', ' ')})
                </div>
                <p className="timeline-desc">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Procedural' && (
        <div className="gov-card">
          <div className="gov-card-header">
            <h3><I.ShieldCheck size={18} /> Procedural Adherence Checklist (Section 65B Compliance)</h3>
          </div>
          <div className="gov-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a' }}>
              <I.CheckCircle2 size={16} />
              <span style={{ fontSize: '13px', color: '#07192f' }}>First Information Report registered and digitally signed by Station House Officer within statutory timeline.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a' }}>
              <I.CheckCircle2 size={16} />
              <span style={{ fontSize: '13px', color: '#07192f' }}>Physical exhibits sealed with barcoded tamper-evident security tags at recovery location.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a' }}>
              <I.CheckCircle2 size={16} />
              <span style={{ fontSize: '13px', color: '#07192f' }}>Forensic Bit-Stream imaging conducted via write-blocker; hash verification matched.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a' }}>
              <I.CheckCircle2 size={16} />
              <span style={{ fontSize: '13px', color: '#07192f' }}>Section 67C IT Act Judicial Hold actively preserves electronic server dumps.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// 5. Document Vault
function DocumentsList() {
  const { docs, openModal } = React.useContext(AppContext);
  const [filter, setFilter] = useState('');

  const filtered = docs.filter((d: any) =>
    d.name.toLowerCase().includes(filter.toLowerCase()) ||
    d.case.toLowerCase().includes(filter.toLowerCase()) ||
    d.type.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">EVIDENTIARY VAULT • SHA-256 HASHED & AES-256 ENCRYPTED</div>
          <div className="page-title">
            <h1>Classified Document Repository</h1>
          </div>
          <p>Cryptographically validated investigation records with watermarking and redaction pipelines.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => openModal('UPLOAD_DOC')}>
            <I.Upload size={15} />
            Ingress Document
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div className="quick-search-box" style={{ width: '380px', background: '#fff', border: '1px solid #cbd5e1', color: '#07192f' }}>
          <I.Search size={16} color="#64748b" />
          <input
            style={{ color: '#07192f' }}
            placeholder="Search document name, case, or OCR text..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="gov-table-container">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Investigation Docket</th>
              <th>Classification</th>
              <th>Originating Department</th>
              <th>Workflow</th>
              <th>Integrity</th>
              <th>SHA-256 Hash</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d: any) => (
              <tr key={d.id}>
                <td>
                  <Link to={`/documents/${d.id}`} style={{ fontWeight: 700, color: '#1d4ed8', textDecoration: 'none' }}>
                    {d.name}
                  </Link>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{d.id} • {d.version}</div>
                </td>
                <td><Link to="/cases" style={{ color: '#07192f' }}>{d.case}</Link></td>
                <td><span className="badge-pill">{d.classification}</span></td>
                <td>{d.owner}</td>
                <td><span className={getBadgeClass(d.workflow)}>{d.workflow}</span></td>
                <td><span className={getBadgeClass(d.integrity)}>{d.integrity}</span></td>
                <td><span className="mono-hash">{d.sha256}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Link to={`/documents/${d.id}`} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                      <I.Eye size={12} />
                    </Link>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '11px' }}
                      title="Generate Redacted Section 207 Discovery Copy"
                      onClick={() => openModal('PII_REDACTION', d)}
                    >
                      <I.ShieldAlert size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// 6. Document Detail with Secure Watermark Preview
function DocumentDetail() {
  const { id } = useParams();
  const { docs, currentRole, openModal } = React.useContext(AppContext);
  const user = ROLES[currentRole] || ROLES.ADMIN;

  const d = docs.find((x: any) => x.id === id) || docs[0];

  return (
    <>
      <div style={{ marginBottom: '12px', fontSize: '12px', color: '#64748b' }}>
        <Link to="/documents" style={{ color: '#1d4ed8', textDecoration: 'none' }}>Documents</Link> / <b>{d.id}</b>
      </div>

      <div className="page-header">
        <div>
          <div className="page-eyebrow">DOCUMENT RECORD • {d.id}</div>
          <div className="page-title">
            <h1>{d.name}</h1>
          </div>
          <p>{d.type} • Origin: {d.owner} • {d.version}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => openModal('SECTION_65B', d)}>
            <I.FileBarChart size={15} />
            Section 65B Certificate
          </button>
          <button className="btn btn-secondary" onClick={() => openModal('PII_REDACTION', d)}>
            <I.ShieldAlert size={15} color="#d97706" />
            PII Redaction Engine
          </button>
          <button
            className="btn btn-primary"
            onClick={() => alert(`Authoritative file hash verified against MongoDB Atlas: ${d.sha256}`)}
          >
            <I.ShieldCheck size={15} />
            Verify SHA-256 Digest
          </button>
        </div>
      </div>

      <div className="grid-two">
        {/* Secure Watermark Container */}
        <div>
          <div className="watermark-header-stamp">
            <b>SECURE EVIDENTIARY RENDERING PIPELINE:</b> Authorized clearance granted to {user.name} ({user.title}).
            Tamper logs active. Dynamic watermark bound to session IP.
          </div>
          <div className="watermark-wrapper">
            <div className="watermark-overlay">
              {`${d.classification} • ${d.case} • ${user.name} • ${new Date().toLocaleDateString()}`}
            </div>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)' }}>{d.ocrText}</pre>
          </div>
        </div>

        {/* Cryptographic & Legal Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="gov-card">
            <div className="gov-card-header">
              <h3><I.Lock size={18} /> Cryptographic Proof & Ledger Status</h3>
            </div>
            <div className="gov-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>SHA-256 AUTHORITATIVE HASH</span>
                <div className="mono-hash" style={{ maxWidth: '100%', wordBreak: 'break-all', whiteSpace: 'normal', marginTop: '4px' }}>
                  {d.sha256}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>CIPHER SUITE</span>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{d.cipher}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>INTEGRITY STATUS</span>
                  <div><span className={getBadgeClass(d.integrity)}>{d.integrity}</span></div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>WORKFLOW STATUS</span>
                  <div><span className={getBadgeClass(d.workflow)}>{d.workflow}</span></div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>DIGITAL SIGNATURE</span>
                  <div style={{ fontWeight: 700, color: '#16a34a', fontSize: '12px' }}>VERIFIED (PKI SEALED)</div>
                </div>
              </div>
            </div>
          </div>

          <div className="gov-card">
            <div className="gov-card-header">
              <h3><I.Users size={18} /> Access & Section 207 Discovery Grants</h3>
            </div>
            <div className="gov-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <div>
                  <b>Adv. Vikram Malhotra (Defense Counsel)</b>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Section 207 Discovery Grant • Expires 24 Sep 2026</div>
                </div>
                <span className="badge-pill" style={{ background: '#dcfce7', color: '#15803d' }}>AUTHORIZED</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <b>Cyber Crime Cell (Special Unit)</b>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Permanent Joint Investigation Member</div>
                </div>
                <span className="badge-pill" style={{ background: '#eff6ff', color: '#1d4ed8' }}>FULL ACCESS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// 7. Evidence Registry
function EvidenceList() {
  const { evidenceItems, openModal } = React.useContext(AppContext);

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">PHYSICAL & DIGITAL FORENSIC VAULT • SECTION 65B CHAIN</div>
          <div className="page-title">
            <h1>Evidence Exhibit Ledger</h1>
          </div>
          <p>Sealed digital and physical exhibits with automated tamper tracking and AI classification.</p>
        </div>
        <div className="page-actions">
          <Link to="/evidence-chain" className="btn btn-secondary">
            <I.GitCommitVertical size={15} />
            View Custody Chain
          </Link>
        </div>
      </div>

      <div className="gov-table-container">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Exhibit ID</th>
              <th>Description</th>
              <th>Category</th>
              <th>Current Custodian</th>
              <th>Security Seal #</th>
              <th>AI Confidence</th>
              <th>Anomaly Detection</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {evidenceItems.map((e: any) => (
              <tr key={e.id}>
                <td>
                  <Link to={`/evidence/${e.id}`} style={{ fontWeight: 700, color: '#1d4ed8', textDecoration: 'none' }}>
                    {e.id}
                  </Link>
                </td>
                <td>
                  <b>{e.name}</b>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{e.location}</div>
                </td>
                <td>{e.type}</td>
                <td>{e.custodian}</td>
                <td><span className="badge-pill">{e.seal}</span></td>
                <td><span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>{e.aiConfidence}</span></td>
                <td>
                  <span style={{ fontSize: '11px', color: e.anomalyScore.includes('HIGH') ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                    {e.anomalyScore}
                  </span>
                </td>
                <td>
                  <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => openModal('CUSTODY_TRANSFER', e)}>
                    Transfer Custody
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// 8. Evidence Detail View
function EvidenceDetail() {
  const { id } = useParams();
  const { evidenceItems, openModal } = React.useContext(AppContext);
  const e = evidenceItems.find((x: any) => x.id === id) || evidenceItems[0];

  return (
    <>
      <div style={{ marginBottom: '12px', fontSize: '12px', color: '#64748b' }}>
        <Link to="/evidence" style={{ color: '#1d4ed8', textDecoration: 'none' }}>Evidence</Link> / <b>{e.id}</b>
      </div>

      <div className="page-header">
        <div>
          <div className="page-eyebrow">FORENSIC EXHIBIT • {e.id}</div>
          <div className="page-title">
            <h1>{e.name}</h1>
          </div>
          <p>{e.type} • Seal #{e.seal} • Case: {e.case}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => openModal('CUSTODY_TRANSFER', e)}>
            <I.GitCommitVertical size={15} />
            Execute Custody Transfer
          </button>
        </div>
      </div>

      <div className="grid-two">
        <div className="gov-card">
          <div className="gov-card-header">
            <h3><I.Fingerprint size={18} /> Exhibit Custody Particulars</h3>
          </div>
          <div className="gov-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b' }}>CURRENT OFFICIAL CUSTODIAN</span>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#07192f' }}>{e.custodian}</div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b' }}>COLLECTION DETAILS</span>
              <div style={{ fontSize: '13px' }}>{e.collected}</div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b' }}>CURRENT STORAGE LOCATION</span>
              <div style={{ fontSize: '13px' }}>{e.location}</div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b' }}>PHYSICAL & SEAL CONDITION</span>
              <div style={{ fontSize: '13px' }}>{e.condition}</div>
            </div>
          </div>
        </div>

        <div className="gov-card">
          <div className="gov-card-header">
            <h3><I.Cpu size={18} /> AI Forensic & Continuity Intelligence</h3>
          </div>
          <div className="gov-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>HARDWARE CLASSIFICATION CONFIDENCE</span>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#16a34a' }}>{e.aiConfidence}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>ANOMALY / REVERSE-ENGINEERING ALERT</span>
              <div style={{ fontSize: '14px', fontWeight: 700, color: e.anomalyScore.includes('HIGH') ? '#dc2626' : '#16a34a' }}>
                {e.anomalyScore}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// 9. Evidence Chain of Custody View
function EvidenceChain() {
  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">IMMUTABLE HANDOFF LEDGER • SECTION 65B EVIDENCE ACT</div>
          <div className="page-title">
            <h1>Chain of Custody Ledger</h1>
          </div>
          <p>Chronological, tamper-proof record of every handoff between law enforcement, forensic labs, and judiciary.</p>
        </div>
      </div>

      <div className="timeline-container">
        {[
          { step: 1, title: 'Exhibit Seizure & On-Scene Sealing', actor: 'DSP Sunita Rao (CCB)', desc: 'Mobile handset & flash memory seized at scene. Bagged in anti-static Faraday pouch and sealed with Tag SEAL-TN-92831.', time: '20 Sep 2026, 06:30 IST', loc: 'Depository Vault, Chennai' },
          { step: 2, title: 'Transit to Forensic Science Laboratory', actor: 'Inspector K. Arumugam → Dr. Priya Nambiar', desc: 'Seal verified unbroken upon physical handoff at CFSL Cyber Division receipt counter.', time: '20 Sep 2026, 09:15 IST', loc: 'CFSL Reception Desk' },
          { step: 3, title: 'Bit-Stream Forensic Imaging', actor: 'Dr. Priya Nambiar (CFSL Custodian)', desc: 'Physical DD image created via hardware write-blocker. Authoritative SHA-256 computed and bound.', time: '20 Sep 2026, 14:00 IST', loc: 'Forensic Lab Workstation #4' },
          { step: 4, title: 'Hardware Firmware Extraction Completed', actor: 'Dr. Priya Nambiar (CFSL)', desc: 'Malicious ESP32 sniffer circuit identified. Report Ref CFSL/CYBER/2026/0891 generated and signed.', time: '21 Sep 2026, 14:32 IST', loc: 'CFSL Reverse Engineering Bench' }
        ].map((c) => (
          <div key={c.step} className="timeline-event-item">
            <div className="timeline-node-icon" style={{ background: '#1d4ed8', color: '#fff', border: 'none' }}>
              {c.step}
            </div>
            <div className="timeline-event-card">
              <div className="timeline-header">
                <h4>{c.title}</h4>
                <span className="timeline-time">{c.time}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 700, marginBottom: '4px' }}>
                {c.actor} • {c.loc}
              </div>
              <p className="timeline-desc">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// 10. Legal Holds (Section 67C IT Act)
function LegalHolds() {
  const { holds } = React.useContext(AppContext);

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">STATUTORY INTERLOCKING • SECTION 67C IT ACT & BHARATIYA SAKSHYA ADHINIYAM</div>
          <div className="page-title">
            <h1>Legal Holds & Judicial Preservation</h1>
          </div>
          <p>Mandatory court-ordered preservation freezes preventing automated deletion or retention purging.</p>
        </div>
      </div>

      <div className="gov-table-container">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Hold ID</th>
              <th>Docket Reference</th>
              <th>Statutory Rule</th>
              <th>Issuing Authority</th>
              <th>Target Scope</th>
              <th>Preservation Status</th>
              <th>Auto-Purge Override</th>
            </tr>
          </thead>
          <tbody>
            {holds.map((h: any) => (
              <tr key={h.id}>
                <td><b>{h.id}</b></td>
                <td>
                  <b>{h.docket}</b>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Case: {h.caseId}</div>
                </td>
                <td>{h.statutoryRule}</td>
                <td>{h.issuedBy}</td>
                <td>{h.targetType}</td>
                <td><span className="badge-status valid">{h.status}</span></td>
                <td><span className="badge-status tampered" style={{ background: '#fee2e2', color: '#b91c1c' }}>BLOCKED</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// 11. Access Requests (Section 207 CrPC Discovery)
function AccessRequests() {
  const { requests, setRequests } = React.useContext(AppContext);

  const approve = (id: string) => {
    setRequests(requests.map((r: any) => r.id === id ? { ...r, status: 'APPROVED' } : r));
    alert('Access request officially authorized. Section 207 discovery grant logged to audit ledger.');
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">SECTION 207 Cr.P.C. WORKFLOWS • DISCOVERY QUEUE</div>
          <div className="page-title">
            <h1>Cross-Department & Counsel Access Requests</h1>
          </div>
          <p>Time-bound authorization requests from defense counsel, external investigators, and forensic labs.</p>
        </div>
      </div>

      <div className="gov-table-container">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Requested Document</th>
              <th>Requester & Role</th>
              <th>Statutory Purpose</th>
              <th>Status</th>
              <th>Expiry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r: any) => (
              <tr key={r.id}>
                <td><b>{r.id}</b></td>
                <td>
                  <b>{r.documentName}</b>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{r.case}</div>
                </td>
                <td>
                  <b>{r.requester}</b>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{r.role.replace('_', ' ')}</div>
                </td>
                <td>{r.purpose}</td>
                <td><span className={getBadgeClass(r.status)}>{r.status}</span></td>
                <td>{r.timeBoundExpiry}</td>
                <td>
                  {r.status === 'PENDING_REVIEW' ? (
                    <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => approve(r.id)}>
                      Authorize Discovery
                    </button>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>Authorized</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// 12. Timeline
function Timeline() {
  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">INTELLIGENCE LOG • CHRONOLOGICAL AUDIT</div>
          <div className="page-title">
            <h1>Unified Investigation Timeline</h1>
          </div>
          <p>Chronological aggregation of FIR filings, forensic tests, witness depositions, and judicial orders.</p>
        </div>
      </div>

      <div className="timeline-container">
        {timelineEvents.map((t) => (
          <div key={t.id} className="timeline-event-item">
            <div className="timeline-node-icon">
              <I.Clock3 size={15} />
            </div>
            <div className="timeline-event-card">
              <div className="timeline-header">
                <h4>{t.title}</h4>
                <span className="timeline-time">{t.time}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 700, marginBottom: '4px' }}>
                {t.actor} ({t.role.replace('_', ' ')}) • Case: {t.case}
              </div>
              <p className="timeline-desc">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// 13. Relationship Graph
function RelationshipGraph() {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const nodes = [
    { id: 'n1', label: 'CASE-2026-001', type: 'CASE', x: 450, y: 220, color: '#1d4ed8', info: 'Commercial Vault Theft Investigation' },
    { id: 'n2', label: 'Dr. Priya Nambiar', type: 'PERSON', x: 200, y: 110, color: '#16a34a', info: 'Forensic Scientist & Evidence Custodian (CFSL)' },
    { id: 'n3', label: 'Apex Depositories', type: 'ORG', x: 700, y: 110, color: '#7c3aed', info: 'Commercial Vault Facility Victim' },
    { id: 'n4', label: 'EVD-2026-0042', type: 'EVIDENCE', x: 180, y: 350, color: '#d97706', info: 'Samsung Galaxy S23 Ultra Exhibit' },
    { id: 'n5', label: 'Chennai Port Dock #4', type: 'LOCATION', x: 710, y: 350, color: '#dc2626', info: 'Suspected Drop-Off Geolocation' }
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">CRIMINAL LINK ANALYSIS • ENTITY CORRELATION</div>
          <div className="page-title">
            <h1>Investigation Relationship Graph</h1>
          </div>
          <p>Interactive graph linking suspect entities, forensic exhibits, geolocations, and criminal dockets.</p>
        </div>
      </div>

      <div className="grid-two">
        <div className="gov-card" style={{ padding: 0 }}>
          <svg viewBox="0 0 900 460" style={{ width: '100%', height: 'auto', background: '#f8fafc' }}>
            <g stroke="#cbd5e1" strokeWidth="2">
              <line x1="450" y1="220" x2="200" y2="110" />
              <line x1="450" y1="220" x2="700" y2="110" />
              <line x1="450" y1="220" x2="180" y2="350" />
              <line x1="450" y1="220" x2="710" y2="350" />
            </g>
            {nodes.map((n) => (
              <g
                key={n.id}
                onClick={() => setSelectedNode(n)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={n.x} cy={n.y} r={46} fill="#ffffff" stroke={n.color} strokeWidth="3" />
                <text x={n.x} y={n.y - 6} textAnchor="middle" fontSize="10" fontWeight="800" fill="#64748b">
                  {n.type}
                </text>
                <text x={n.x} y={n.y + 12} textAnchor="middle" fontSize="11" fontWeight="700" fill="#07192f">
                  {n.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="gov-card">
          <div className="gov-card-header">
            <h3><I.Share2 size={18} /> Entity Inspector & Telemetry</h3>
          </div>
          <div className="gov-card-body">
            {selectedNode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span className="badge-pill" style={{ width: 'fit-content' }}>{selectedNode.type}</span>
                <h2 style={{ fontSize: '18px', color: '#07192f' }}>{selectedNode.label}</h2>
                <p style={{ fontSize: '13px', color: '#475569' }}>{selectedNode.info}</p>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>CORRELATED DOCKETS</span>
                  <div style={{ fontWeight: 600, fontSize: '13px', marginTop: '4px' }}>CASE-2026-001</div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                <I.Share2 size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p>Click on any graph node to inspect evidentiary connections and metadata.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// 14. Advanced Search
function AdvancedSearch() {
  const [q, setQ] = useState('');
  const { docs, evidenceItems, cases } = React.useContext(AppContext);

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">GLOBAL OCR DISCOVERY • AUTHORIZED CLEARANCE ONLY</div>
          <div className="page-title">
            <h1>Advanced Investigation Search</h1>
          </div>
          <p>Full-text OCR discovery across FIRs, CFSL forensic reports, witness statements, and exhibit manifests.</p>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <input
          className="form-input"
          placeholder="Search by keywords, Aadhaar, IMEI, SHA-256 hash, or OCR extracted text..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary">
          <I.Search size={15} />
          Search Records
        </button>
      </div>

      {q ? (
        <div className="gov-card">
          <div className="gov-card-header">
            <h3>Search Results matching "{q}"</h3>
          </div>
          <div className="gov-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {docs.filter((d: any) => d.name.toLowerCase().includes(q.toLowerCase()) || d.ocrText.toLowerCase().includes(q.toLowerCase())).map((d: any) => (
              <div key={d.id} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <Link to={`/documents/${d.id}`} style={{ fontWeight: 700, color: '#1d4ed8', fontSize: '14px', textDecoration: 'none' }}>
                  {d.name}
                </Link>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Case: {d.case} • Classification: {d.classification}
                </div>
                <p style={{ fontSize: '12px', color: '#334155', marginTop: '6px', background: '#f8fafc', padding: '8px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                  ...{d.ocrText.slice(0, 180)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <I.Search size={44} style={{ opacity: 0.4, marginBottom: '12px' }} />
          <h3 style={{ color: '#07192f' }}>Search Across Your Authorized Scope</h3>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Backend RBAC filters enforce zero unauthorized document leakage.</p>
        </div>
      )}
    </>
  );
}

// 15. Integrity Lab
function IntegrityLab() {
  const { docs, openModal } = React.useContext(AppContext);
  const [runningSweep, setRunningSweep] = useState(false);
  const [sweepResult, setSweepResult] = useState<string | null>(null);

  const runSweep = () => {
    setRunningSweep(true);
    setSweepResult(null);
    setTimeout(() => {
      setRunningSweep(false);
      setSweepResult('Cryptographic sweep complete. All 142 records match authoritative SHA-256 hashes.');
    }, 1200);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">NIST FIPS 180-4 • REAL-TIME CHECKSUM VERIFICATION</div>
          <div className="page-title">
            <h1>Cryptographic Integrity Laboratory</h1>
          </div>
          <p>Real-time hash comparison, Bit-Flip attack simulation, and automated cryptographic sweeps.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => openModal('TAMPER_SIMULATOR')}>
            <I.AlertTriangle size={15} color="#dc2626" />
            Simulate Tamper Attack
          </button>
          <button className="btn btn-primary" onClick={runSweep} disabled={runningSweep}>
            <I.ShieldCheck size={15} />
            {runningSweep ? 'Sweeping Node...' : 'Run Cryptographic Sweep'}
          </button>
        </div>
      </div>

      {sweepResult && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', padding: '14px 18px', borderRadius: '8px', color: '#15803d', fontWeight: 600, fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <I.CheckCircle2 size={18} />
          {sweepResult}
        </div>
      )}

      <div className="gov-table-container">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Case Docket</th>
              <th>Authoritative Ledger Hash</th>
              <th>Re-Computed Hash</th>
              <th>Integrity Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d: any) => (
              <tr key={d.id}>
                <td><b>{d.name}</b></td>
                <td>{d.case}</td>
                <td><span className="mono-hash">{d.sha256}</span></td>
                <td><span className="mono-hash" style={{ color: '#16a34a' }}>{d.sha256}</span></td>
                <td><span className="badge-status valid">100% VALID</span></td>
                <td>
                  <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => openModal('SECTION_65B', d)}>
                    Section 65B
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// 16. Digital Signatures
function Signatures() {
  const { docs } = React.useContext(AppContext);

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">PKI TOKENS • STATUTORY AFFIRMATION</div>
          <div className="page-title">
            <h1>Digital Signatures & Cryptographic Seals</h1>
          </div>
          <p>Binding official signatures to SHA-256 document digests with non-repudiation guarantees.</p>
        </div>
      </div>

      <div className="gov-table-container">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Signer</th>
              <th>Authority / Role</th>
              <th>Timestamp</th>
              <th>Signature Status</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d: any) => (
              <tr key={d.id}>
                <td><b>{d.name}</b></td>
                <td>{d.uploader}</td>
                <td>Lead Officer / CFSL Scientist</td>
                <td>{d.updated}</td>
                <td><span className="badge-status signed">DIGITALLY SEALED</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// 17. Retention Schedule
function RetentionSchedule() {
  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">GOVERNANCE • POLICE MANUAL & JUDICIAL ARCHIVAL</div>
          <div className="page-title">
            <h1>Statutory Retention Schedule</h1>
          </div>
          <p>Compliance with State Police Manual and Judicial Preservation Supremacy rules.</p>
        </div>
      </div>

      <div className="gov-table-container">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Statutory Mandate</th>
              <th>Retention Period</th>
              <th>Judicial Preservation Supremacy</th>
              <th>Compliance Posture</th>
            </tr>
          </thead>
          <tbody>
            {retentionRules.map((r, i) => (
              <tr key={i}>
                <td><b>{r.category}</b></td>
                <td>{r.rule}</td>
                <td><b>{r.retentionYears} Years</b></td>
                <td><span className="badge-pill" style={{ background: '#fef3c7', color: '#b45309' }}>{r.supremacy}</span></td>
                <td><span className="badge-status valid">{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// 18. Section 65B Reports
function Reports() {
  const { docs, openModal } = React.useContext(AppContext);

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">EVIDENTIARY CERTIFICATION • SECTION 65B INDIAN EVIDENCE ACT</div>
          <div className="page-title">
            <h1>Evidentiary Certification & Reports</h1>
          </div>
          <p>Generate certified electronic evidence certificates for trial admission.</p>
        </div>
      </div>

      <div className="gov-table-container">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Case</th>
              <th>Authoritative Digest</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d: any) => (
              <tr key={d.id}>
                <td><b>{d.name}</b></td>
                <td>{d.case}</td>
                <td><span className="mono-hash">{d.sha256}</span></td>
                <td>
                  <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => openModal('SECTION_65B', d)}>
                    Generate Section 65B Certificate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// 19. Audit Logs
function AuditLogs() {
  const [verifying, setVerifying] = useState(false);

  const verifyChain = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      alert('Audit Merkle Chain Verified: 100% Intact. No broken hash links.');
    }, 1000);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">IMMUTABLE LEDGER • CHAINED MERKLE HASHES</div>
          <div className="page-title">
            <h1>Chained Audit Logs</h1>
          </div>
          <p>Cryptographically linked audit blocks where each record anchors the SHA-256 hash of the previous record.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={verifyChain} disabled={verifying}>
            <I.Link size={15} />
            {verifying ? 'Verifying Chain...' : 'Verify Audit Hash Chain'}
          </button>
        </div>
      </div>

      <div className="gov-table-container">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor & Role</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Previous Hash</th>
              <th>Current Hash</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((a) => (
              <tr key={a.id}>
                <td style={{ fontSize: '11px', color: '#64748b' }}>{a.timestamp}</td>
                <td>
                  <b>{a.actor}</b>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>{a.role}</div>
                </td>
                <td><b>{a.action}</b></td>
                <td>{a.resource}</td>
                <td><span className="mono-hash">{a.prevHash}</span></td>
                <td><span className="mono-hash">{a.currHash}</span></td>
                <td><span className={getBadgeClass(a.result)}>{a.result}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// 20. Security Center
function SecurityCenter() {
  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">SOC TELEMETRY • ANOMALY DETECTION</div>
          <div className="page-title">
            <h1>Security Operations Center</h1>
          </div>
          <p>Real-time monitoring of brute-force attacks, rapid download spikes, and tamper anomalies.</p>
        </div>
      </div>

      <div className="gov-table-container">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Alert Identifier</th>
              <th>Severity</th>
              <th>Target / Actor</th>
              <th>Description</th>
              <th>Detected Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {securityAlerts.map((a) => (
              <tr key={a.id}>
                <td><b>{a.alertType}</b></td>
                <td><span className={`badge-pill priority-${a.severity.toLowerCase()}`}>{a.severity}</span></td>
                <td>{a.actor}</td>
                <td>{a.description}</td>
                <td>{a.detectedAt}</td>
                <td><span className="badge-status tampered">{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// 21. Notifications
function Notifications() {
  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">INBOX • HIGH-PRIORITY SYSTEM ALERTS</div>
          <div className="page-title">
            <h1>Notifications & Action Items</h1>
          </div>
          <p>Evidentiary assignments, judicial hold enactments, and access request notices.</p>
        </div>
      </div>

      <div className="gov-card">
        <div className="gov-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activity.map(([t, d, time], idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <div>
                <b>{t}</b>
                <p style={{ fontSize: '12px', color: '#475569' }}>{d}</p>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b' }}>{time}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// 22. User Management
function UserManagement() {
  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">ADMINISTRATION • RBAC IDENTITY DIRECTORY</div>
          <div className="page-title">
            <h1>User Identity & Role Directory</h1>
          </div>
          <p>Authorized police officers, forensic custodians, public prosecutors, and court registrars.</p>
        </div>
      </div>

      <div className="gov-table-container">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Officer Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Official Badge #</th>
              <th>Clearance Level</th>
              <th>Account Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(ROLES).map((u) => (
              <tr key={u.role}>
                <td><b>{u.name}</b></td>
                <td><span className="badge-pill">{u.role}</span></td>
                <td>{u.department}</td>
                <td><span className="mono-hash">{u.badge}</span></td>
                <td style={{ fontSize: '11px', fontWeight: 600 }}>{u.clearance}</td>
                <td><span className="badge-status valid">ACTIVE</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// 23. Profile
function Profile() {
  const { currentRole } = React.useContext(AppContext);
  const u = ROLES[currentRole] || ROLES.ADMIN;

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">CREDENTIALS • OFFICIAL PROFILE</div>
          <div className="page-title">
            <h1>Officer Profile & Clearance</h1>
          </div>
        </div>
      </div>

      <div className="gov-card" style={{ maxWidth: '680px' }}>
        <div className="gov-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>FULL NAME</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#07192f' }}>{u.name}</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>OFFICIAL TITLE & RANK</span>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>{u.title}</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>ASSIGNED DEPARTMENT</span>
            <div style={{ fontSize: '14px' }}>{u.department}</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>BADGE NUMBER</span>
            <div><span className="mono-hash">{u.badge}</span></div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>SECURITY CLEARANCE</span>
            <div><span className="badge-status encrypted">{u.clearance}</span></div>
          </div>
        </div>
      </div>
    </>
  );
}

// 24. Settings
function Settings() {
  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">NODE CONFIGURATION • ENCRYPTION PREFERENCES</div>
          <div className="page-title">
            <h1>System & Node Settings</h1>
          </div>
        </div>
      </div>

      <div className="gov-card" style={{ maxWidth: '680px' }}>
        <div className="gov-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked />
            Mandatory Watermarking on all PDF Viewport Previews
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked />
            Automated PII Redaction Warning on Court Discovery Exports
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked />
            Real-time Checksum Verification during File Ingress
          </label>
        </div>
      </div>
    </>
  );
}

// 25. User Guide
function UserGuide() {
  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">STANDARD OPERATING PROCEDURE • NCRB COMPLIANCE MANUAL</div>
          <div className="page-title">
            <h1>AstraX Standard Operating Procedure (SOP)</h1>
          </div>
        </div>
      </div>

      <div className="gov-card">
        <div className="gov-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', lineHeight: 1.6 }}>
          <h3 style={{ color: '#07192f' }}>1. First Information Report (FIR) Ingress Protocol</h3>
          <p style={{ fontSize: '13px', color: '#334155' }}>
            The Station House Officer must upload the FIR within statutory timeframes. The backend immediately computes the authoritative SHA-256 digest and binds it to the immutable case docket.
          </p>
          <h3 style={{ color: '#07192f' }}>2. Forensic Exhibit Seizure & Custody Continuity</h3>
          <p style={{ fontSize: '13px', color: '#334155' }}>
            Every exhibit must have a physical barcoded tamper-evident seal. When handing over to CFSL or court registrars, both parties must affirm seal integrity via the Custody Transfer dialog.
          </p>
          <h3 style={{ color: '#07192f' }}>3. Section 65B Electronic Evidence Certification</h3>
          <p style={{ fontSize: '13px', color: '#334155' }}>
            Clicking "Generate Section 65B Certificate" creates an affirmation compliant with Section 65B(4) of the Indian Evidence Act, affirming continuous computer operation and hash validity.
          </p>
        </div>
      </div>
    </>
  );
}

// 26. Login Component with 1-Click Role Pre-Fill Cards
function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin@secure-dms.local');
  const [password, setPassword] = useState('admin123');

  const prefill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('sidms_token', 'session_active');
    navigate('/dashboard');
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        {/* Brand Left Panel */}
        <div className="login-brand-panel">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div className="emblem-badge" style={{ width: '48px', height: '48px' }}>
                <I.ShieldCheck size={28} />
              </div>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '-0.02em' }}>AstraX</h1>
                <span className="pki-tag">PKI SECURED</span>
              </div>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, lineHeight: 1.3, marginBottom: '12px' }}>
              Every Record Protected.<br />Every Action Accountable.
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
              Centralized evidentiary document management platform for Police, Central Forensic Laboratories, Public Prosecutors, and the Judiciary.
            </p>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.12)', paddingTop: '16px', fontSize: '11px', color: '#94a3b8' }}>
            <span>NIST FIPS 180-4 • SECTION 65B EVIDENCE ACT • IT ACT SEC 67C</span>
          </div>
        </div>

        {/* Form Right Panel */}
        <div className="login-form-panel">
          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              SECURE GOVERNMENT CLEARANCE
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#07192f', marginTop: '4px' }}>Sign In to Workspace</h2>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Enter your authorized official credentials.</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Official Email / Username</label>
              <input
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '10px', marginTop: '6px' }}>
              Sign In Securely <I.ArrowRight size={15} />
            </button>
          </form>

          {/* Quick-Test 1-Click Role Pre-Fill */}
          <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                DEMO CREDENTIALS (CLICK TO PREFILL):
              </span>
              <span style={{ fontSize: '9px', background: '#e2e8f0', color: '#475569', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                1-CLICK
              </span>
            </div>

            <div className="prefill-grid">
              {DEMO_CREDENTIALS.map((d) => (
                <button
                  key={d.role}
                  type="button"
                  className="prefill-btn"
                  onClick={() => prefill(d.user, d.pass)}
                >
                  <b>{d.role.replace('_', ' ')}</b>
                  <span>{d.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Login />} />
      <Route path="/forgot-password" element={<Login />} />
      <Route path="/*" element={<Layout />} />
    </Routes>
  );
}
