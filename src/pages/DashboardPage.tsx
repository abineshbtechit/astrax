import React, { useState } from 'react';
import { useDms } from '../contexts/DmsContext';
import {
  Briefcase,
  FileText,
  Boxes,
  ShieldAlert,
  FileCode,
  KeyRound,
  Plus,
  Upload,
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  Activity,
  AlertTriangle,
  Lock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Search,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ClassificationBadge, CaseStatusBadge, PriorityBadge, IntegrityBadge } from '../components/ui/Badges';
import { UploadDocumentModal } from '../components/modals/UploadDocumentModal';

export const DashboardPage: React.FC = () => {
  const {
    cases,
    documents,
    evidence,
    alerts,
    auditLogs,
    accessRequests,
    currentUser,
    verifyAuditChain,
    mongoStatus,
  } = useDms();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [chainVerifyStatus, setChainVerifyStatus] = useState<string | null>(null);
  const [isVerifyingChain, setIsVerifyingChain] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'HIGH_PRIORITY'>('ALL');
  const navigate = useNavigate();

  const activeCases = cases.filter((c) => c.status !== 'CLOSED');
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');
  const pendingRequests = accessRequests.filter((r) => r.status === 'PENDING');
  const tamperedDocs = documents.filter((d) => d.tamperState === 'TAMPERED');

  const filteredCases = cases.filter((c) => {
    if (activeFilter === 'ACTIVE') return c.status !== 'CLOSED';
    if (activeFilter === 'HIGH_PRIORITY') return c.priority === 'HIGH' || c.priority === 'CRITICAL';
    return true;
  });

  const handleVerifyChain = async () => {
    setIsVerifyingChain(true);
    try {
      const res = await verifyAuditChain();
      setChainVerifyStatus(
        res.isValid
          ? `✓ 100% Intact. ${res.totalVerified} chained blocks verified.`
          : `⚠ Tamper Alert: ${res.message}`
      );
    } catch {
      setChainVerifyStatus('Verification error encountered.');
    } finally {
      setIsVerifyingChain(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Row 1: Top Bento Greeting & Live Command Strip */}
      <div className="brutal-card p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#64EE00] shadow-[0_0_8px_#64EE00] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-black uppercase bg-[#64EE00] px-2 py-0.5 rounded-md border border-black">
              SECURE LEGAL VAULT • SECTION 65B CERTIFIED
            </span>
            <span className="text-[11px] font-mono text-slate-500 font-semibold hidden sm:inline">
              NODE v20 • {mongoStatus?.connected ? (mongoStatus?.provider === 'AZURE_COSMOS_DB' ? 'AZURE COSMOS DB' : 'MONGODB ATLAS') : 'STORAGE SYNCED'}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight font-sans">
            Ready for Evidence Intel,{' '}
            <span className="underline decoration-[#64EE00] decoration-4 underline-offset-4">
              {currentUser?.fullName.split(' ')[0]}
            </span>
            ?
          </h1>

          <p className="text-xs text-slate-600 max-w-2xl font-medium">
            Authorized session for{' '}
            <strong className="text-black font-mono font-bold">
              {currentUser?.role} ({currentUser?.department})
            </strong>
            . Cryptographic chain-of-custody and real-time tamper protection enforced.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="brutal-btn-green px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-black stroke-[2.5]" />
            <span>Upload Document</span>
          </button>

          <Link
            to="/cases"
            className="brutal-btn-dark px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4 text-[#64EE00]" />
            <span>All Investigations</span>
          </Link>
        </div>
      </div>

      {/* Critical Alert Bar if Tampered Docs Exist */}
      {tamperedDocs.length > 0 && (
        <div className="p-4 rounded-xl bg-black border-2 border-black text-white font-bold shadow-[4px_4px_0px_#000000] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-[#64EE00] border border-[#64EE00]">
              <AlertTriangle className="w-5 h-5 text-[#64EE00]" />
            </div>
            <div>
              <div className="text-xs font-mono font-extrabold uppercase text-[#64EE00]">
                SECURITY ALERT: {tamperedDocs.length} UNVERIFIED DOCUMENT DETECTED
              </div>
              <div className="text-xs font-mono text-white/80">
                SHA-256 digest mismatch identified. Immediate audit review required.
              </div>
            </div>
          </div>
          <Link
            to="/integrity-lab"
            className="px-3 py-1.5 bg-[#64EE00] text-black rounded-lg text-xs font-mono uppercase font-bold hover:bg-white transition border border-black"
          >
            Open Integrity Lab &rarr;
          </Link>
        </div>
      )}

      {/* Row 2: 4-Column Bento Metric Cards (Matching Uploaded Dashboard Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Active Cases */}
        <div className="brutal-card p-5 flex flex-col justify-between relative overflow-hidden group hover:translate-y-[-2px] transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">
              Active Investigations
            </span>
            <span className="text-[10px] font-mono font-bold bg-black text-[#64EE00] px-2 py-0.5 rounded-full border border-black">
              +14% MO
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl font-black text-black tracking-tight font-mono">
              {activeCases.length}{' '}
              <span className="text-xs font-normal text-slate-500">/ {cases.length} Total</span>
            </div>
            <div className="text-xs text-slate-600 font-medium mt-0.5">
              Cases across 5 inter-agencies
            </div>
          </div>

          {/* Mini Sparkline Bar representation */}
          <div className="flex items-end gap-1.5 h-7 pt-2">
            {[40, 65, 50, 80, 55, 95, 75, 100].map((h, i) => (
              <div
                key={i}
                style={{ height: `${h}%` }}
                className={`flex-1 rounded-sm transition ${
                  i >= 5 ? 'bg-[#64EE00] border border-black' : 'bg-black/80'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Metric 2: Vaulted Documents & Evidence */}
        <div className="brutal-card p-5 flex flex-col justify-between relative overflow-hidden group hover:translate-y-[-2px] transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">
              Classified Documents
            </span>
            <span className="text-[10px] font-mono font-bold bg-[#64EE00] text-black px-2 py-0.5 rounded-full border border-black">
              SEC 65B
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl font-black text-black tracking-tight font-mono">
              {documents.length}
            </div>
            <div className="text-xs text-slate-600 font-medium mt-0.5">
              {evidence.length} physical/digital exhibits sealed
            </div>
          </div>

          {/* Progress Segmented Bar (Like Image 1/5) */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-500 font-bold">
              <span>VAULT ALLOCATION</span>
              <span className="text-black">78%</span>
            </div>
            <div className="flex gap-1 h-2">
              <div className="w-[50%] bg-black rounded-sm" />
              <div className="w-[28%] bg-[#64EE00] rounded-sm border border-black" />
              <div className="w-[22%] bg-slate-200 rounded-sm" />
            </div>
          </div>
        </div>

        {/* Metric 3: Cryptographic Integrity */}
        <div className="brutal-card p-5 flex flex-col justify-between relative overflow-hidden group hover:translate-y-[-2px] transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">
              SHA-256 Integrity
            </span>
            <span className="text-[10px] font-mono font-bold bg-black text-white px-2 py-0.5 rounded-full">
              BLOCKCHAIN-TIER
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl font-black text-black tracking-tight font-mono flex items-center gap-2">
              <span>{tamperedDocs.length === 0 ? '100%' : 'WARNING'}</span>
              {tamperedDocs.length === 0 && (
                <CheckCircle2 className="w-6 h-6 text-[#64EE00] fill-black" />
              )}
            </div>
            <div className="text-xs text-slate-600 font-medium mt-0.5">
              {auditLogs.length} cryptographically chained logs
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg border border-black/10 text-[10px] font-mono text-slate-600 truncate">
            <Shield className="w-3.5 h-3.5 text-black min-w-[14px]" />
            <span className="truncate">Root CA: {auditLogs[auditLogs.length - 1]?.currentHash?.substring(0, 16)}...</span>
          </div>
        </div>

        {/* Metric 4: Dark Hero Bento Box (30% Black Solid Feature Card) */}
        <div className="brutal-card-dark p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#64EE00] uppercase">
              Automated Audit Chain
            </span>
            <span className="w-2 h-2 rounded-full bg-[#64EE00] animate-ping" />
          </div>

          <div className="my-2">
            <div className="text-sm font-extrabold text-white tracking-tight">
              One-Click Ledger Verification
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              Compute hash pointers across all Section 65B exhibits and user operations.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleVerifyChain}
              disabled={isVerifyingChain}
              className="w-full brutal-btn-green py-2 px-3 rounded-lg text-xs font-mono uppercase font-bold flex items-center justify-center gap-1.5"
            >
              {isVerifyingChain ? 'Verifying...' : 'Verify Audit Chain'}
            </button>
            {chainVerifyStatus && (
              <div className="text-[10px] font-mono text-[#64EE00] truncate text-center">
                {chainVerifyStatus}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Middle Bento Grid - Case Analytics & Quick Transfer Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Investigation Dossier Matrix */}
        <div className="lg:col-span-2 brutal-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-black">
            <div>
              <h2 className="text-base font-extrabold text-black font-sans uppercase tracking-tight flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-black" />
                <span>Active Investigation Dossiers</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Multi-agency cross-jurisdictional cases with strict access barriers
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-black">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition ${
                  activeFilter === 'ALL'
                    ? 'bg-black text-white'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                ALL ({cases.length})
              </button>
              <button
                onClick={() => setActiveFilter('ACTIVE')}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition ${
                  activeFilter === 'ACTIVE'
                    ? 'bg-[#64EE00] text-black'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                ACTIVE ({activeCases.length})
              </button>
              <button
                onClick={() => setActiveFilter('HIGH_PRIORITY')}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition ${
                  activeFilter === 'HIGH_PRIORITY'
                    ? 'bg-black text-white'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                CRITICAL
              </button>
            </div>
          </div>

          {/* Cases List in Bento Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredCases.slice(0, 4).map((c) => (
              <Link
                key={c.id}
                to={`/cases/${c.id}`}
                className="p-4 rounded-xl border-2 border-black bg-white hover:bg-slate-50 shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-extrabold text-black bg-slate-100 px-2 py-0.5 rounded border border-black">
                      {c.caseNumber}
                    </span>
                    <PriorityBadge priority={c.priority} />
                  </div>

                  <h3 className="text-sm font-bold text-black tracking-tight group-hover:text-black transition">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-slate-200 text-slate-600">
                  <span className="font-semibold text-black">{c.ownerDepartment}</span>
                  <div className="flex items-center gap-2">
                    <span>{c.documentsCount} Docs</span>
                    <span className="text-black font-bold">&bull;</span>
                    <span>{c.evidenceCount} Evid</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              to="/cases"
              className="text-xs font-mono font-bold text-black hover:text-slate-700 flex items-center gap-1 group"
            >
              <span>View all {cases.length} investigation dossiers</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>

        {/* Right Column (1/3): Chain of Custody & Security Live Stream */}
        <div className="brutal-card p-6 flex flex-col justify-between space-y-4">
          <div className="pb-3 border-b-2 border-black">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-black font-sans uppercase tracking-tight flex items-center gap-2">
                <Boxes className="w-4 h-4 text-black" />
                <span>Evidence Ledger</span>
              </h2>
              <span className="text-[10px] font-mono font-bold bg-[#64EE00] text-black px-2 py-0.5 rounded-full border border-black">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Recent physical & digital seizures</p>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[340px]">
            {evidence.slice(0, 4).map((ev) => (
              <Link
                key={ev.id}
                to={`/evidence/${ev.id}`}
                className="p-3 rounded-xl border border-black/80 bg-slate-50 hover:bg-white transition flex items-center justify-between group"
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-black bg-white px-1.5 py-0.2 rounded border border-black">
                      {ev.sealNumber || ev.evidenceId}
                    </span>
                    <IntegrityBadge status={ev.tamperState} />
                  </div>
                  <div className="text-xs font-bold text-black truncate">{ev.description || ev.type}</div>
                  <div className="text-[10px] font-mono text-slate-500 truncate">
                    Holder: {ev.currentCustodianName} ({ev.currentCustodianDepartment})
                  </div>
                </div>

                <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center group-hover:bg-[#64EE00] group-hover:text-black transition">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t-2 border-black flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500">Unbroken transfer records</span>
            <Link
              to="/evidence-chain"
              className="text-xs font-mono font-bold text-black hover:underline"
            >
              Exhibits Map &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Row 4: Transaction & Document Ledger (Modeled on Image 1/6) */}
      <div className="brutal-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-black">
          <div>
            <h2 className="text-base font-extrabold text-black font-sans uppercase tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-black" />
              <span>Certified Document Ledger & Cryptographic Integrity</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Tamper-evident legal briefs, forensic reports, and court certificates
            </p>
          </div>

          <Link
            to="/documents"
            className="brutal-btn-dark px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-bold flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Vault</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#64EE00]" />
          </Link>
        </div>

        {/* Table Rows */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-black text-[11px] font-mono font-bold text-black uppercase bg-slate-100/80">
                <th className="py-2.5 px-3">DOCUMENT LABEL</th>
                <th className="py-2.5 px-3">CLASSIFICATION</th>
                <th className="py-2.5 px-3">SHA-256 HASH SEAL</th>
                <th className="py-2.5 px-3">OWNER / DEPT</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 text-xs font-medium">
              {documents.slice(0, 5).map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-black">{doc.documentName}</div>
                    <div className="text-[10px] font-mono text-slate-500">{doc.originalFilename}</div>
                  </td>
                  <td className="py-3 px-3">
                    <ClassificationBadge classification={doc.classification} />
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-black/20 text-slate-900 font-bold">
                      {doc.sha256Hash.substring(0, 14)}...
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px]">
                    <div className="font-bold text-black">{doc.ownerDepartment}</div>
                    <div className="text-slate-500">{doc.ownerUserName}</div>
                  </td>
                  <td className="py-3 px-3">
                    <IntegrityBadge status={doc.tamperState} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      to={`/documents/${doc.id}`}
                      className="px-2.5 py-1 rounded bg-black text-white hover:bg-[#64EE00] hover:text-black font-mono font-bold text-[10px] transition border border-black"
                    >
                      INSPECT
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Document Modal */}
      <UploadDocumentModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
};
