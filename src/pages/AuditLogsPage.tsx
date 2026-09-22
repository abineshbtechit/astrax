import React, { useState } from 'react';
import { useDms } from '../contexts/DmsContext';
import {
  FileCode,
  Search,
  RefreshCw,
  CheckCircle2,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { DepartmentBadge } from '../components/ui/Badges';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs, verifyAuditChain } = useDms();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [verificationResult, setVerificationResult] = useState<{ isValid: boolean; message: string; totalVerified: number } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const filteredLogs = auditLogs.filter((log) => {
    const q = search.toLowerCase();
    const matchesSearch =
      log.action.toLowerCase().includes(q) ||
      log.actorName.toLowerCase().includes(q) ||
      (log.actorBadgeNumber && log.actorBadgeNumber.toLowerCase().includes(q)) ||
      log.currentHash.toLowerCase().includes(q) ||
      log.resourceType.toLowerCase().includes(q);

    const matchesDept = deptFilter === 'ALL' || log.actorDepartment === deptFilter;
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchesSearch && matchesDept && matchesAction;
  });

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const res = await verifyAuditChain();
      setVerificationResult(res);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleExportAuditJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ncrb_chained_audit_ledger_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCode className="w-5 h-5 text-black stroke-[2.5]" />
            <h1 className="text-xl font-black text-black tracking-tight uppercase">
              Chained Audit Ledger
            </h1>
          </div>
          <p className="text-xs text-black/70">
            Immutable audit blocks linked via SHA-256 parent digests. Tamper-evident and court-admissible.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAuditJson}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-black hover:text-white text-black text-xs font-bold border-2 border-black flex items-center gap-1.5 transition shadow-[2px_2px_0px_#000000]"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="brutal-btn-green px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 stroke-[2.5] ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Recalculating Blocks...' : 'Verify Ledger Chain'}</span>
          </button>
        </div>
      </div>

      {/* Verification Status Banner if verified */}
      {verificationResult && (
        <div
          className={`p-4 rounded-2xl border-2 border-black flex items-center justify-between gap-3 text-xs font-mono shadow-[3px_3px_0px_#000000] ${
            verificationResult.isValid
              ? 'bg-[#64EE00] text-black'
              : 'bg-black text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {verificationResult.isValid ? (
              <CheckCircle2 className="w-5 h-5 text-black stroke-[2.5] flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-[#64EE00] stroke-[2.5] flex-shrink-0" />
            )}
            <div>
              <span className="font-black">
                {verificationResult.isValid ? 'AUDIT LEDGER INTEGRITY VERIFIED' : 'LEDGER BREACH DETECTED'}
              </span>
              <div className="text-[11px] font-bold">{verificationResult.message}</div>
            </div>
          </div>
          <span className="text-[10px] bg-white text-black px-2.5 py-1 rounded-lg border border-black font-black">
            {verificationResult.totalVerified} BLOCKS VALIDATED
          </span>
        </div>
      )}

      {/* Search and filters */}
      <div className="p-4 rounded-2xl brutal-card flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-black/50 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search action, actor, badge, hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-black rounded-xl pl-9 pr-3 py-1.5 text-xs text-black placeholder-black/40 focus:outline-none shadow-[2px_2px_0px_#000000] font-bold"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-white border-2 border-black rounded-xl px-2.5 py-1.5 text-xs text-black font-bold focus:outline-none shadow-[2px_2px_0px_#000000]"
          >
            <option value="ALL">All Departments</option>
            <option value="POLICE">POLICE</option>
            <option value="INVESTIGATION">INVESTIGATION</option>
            <option value="FORENSIC">FORENSIC</option>
            <option value="LEGAL">LEGAL</option>
            <option value="COURT">COURT</option>
            <option value="SECURITY">SECURITY</option>
            <option value="ADMINISTRATION">ADMINISTRATION</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-white border-2 border-black rounded-xl px-2.5 py-1.5 text-xs text-black font-bold focus:outline-none shadow-[2px_2px_0px_#000000]"
          >
            <option value="ALL">All Actions</option>
            <option value="USER_LOGIN">User Login</option>
            <option value="DOCUMENT_UPLOAD">Document Upload</option>
            <option value="DOCUMENT_VIEW">Document View</option>
            <option value="DOCUMENT_DOWNLOAD">Document Download</option>
            <option value="DOCUMENT_VERSION_UPLOAD">Version Upload</option>
            <option value="ACCESS_GRANTED">Access Granted</option>
            <option value="ACCESS_REQUESTED">Access Requested</option>
            <option value="DOCUMENT_SIGNED">Digital Signature</option>
            <option value="EVIDENCE_TRANSFERRED">Evidence Transferred</option>
            <option value="DOCUMENT_TAMPER_DETECTED">Tamper Alert</option>
          </select>
        </div>
      </div>

      {/* Ledger Block Stream */}
      <div className="space-y-3">
        {filteredLogs.map((block) => (
          <div
            key={block.id}
            className="p-4 rounded-2xl brutal-card space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-black text-black bg-[#64EE00] px-2 py-0.5 rounded border border-black">
                  BLOCK #{block.blockIndex}
                </span>
                <span className="text-xs font-mono font-bold text-white bg-black px-2 py-0.5 rounded border border-black">
                  {block.action}
                </span>
                <span className="text-xs text-black font-bold">
                  {block.actorName}
                </span>
                <DepartmentBadge department={block.actorDepartment} />
                <span className="text-[10px] font-mono text-black/60 font-bold">Badge: {block.actorBadgeNumber}</span>
              </div>

              <span className="text-xs font-mono text-black/60 font-bold">
                {new Date(block.timestamp).toLocaleString()}
              </span>
            </div>

            {/* Block Payload Details */}
            <div className="p-3 rounded-xl bg-white border border-black/20 text-xs space-y-1">
              <div className="flex items-center justify-between text-black/70">
                <span>Resource: <strong className="text-black font-bold">{block.resourceType} ({block.resourceId || 'N/A'})</strong></span>
                <span className="font-mono text-black font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-black/10">Status: {block.status}</span>
              </div>
              {block.details && (
                <div className="text-[11px] font-mono text-black/60 truncate">
                  Details: {JSON.stringify(block.details)}
                </div>
              )}
            </div>

            {/* Cryptographic Hashes Chaining */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono pt-1">
              <div className="p-2 rounded-lg bg-slate-50 border border-black/20 truncate">
                <span className="text-black/60 block font-bold">PREVIOUS BLOCK HASH (PARENT):</span>
                <span className="text-black font-bold">{block.previousHash}</span>
              </div>
              <div className="p-2 rounded-lg bg-white border-2 border-black truncate">
                <span className="text-black block font-bold">CURRENT BLOCK AUTHORITATIVE HASH:</span>
                <span className="text-black font-black">{block.currentHash}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
