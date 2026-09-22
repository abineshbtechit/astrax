import React, { useState } from 'react';
import { useDms } from '../contexts/DmsContext';
import {
  ShieldCheck,
  ShieldAlert,
  Hash,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  Boxes,
  FileCode,
  ArrowRight,
  Shield,
  Clock,
  Terminal,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { IntegrityBadge } from '../components/ui/Badges';

export const IntegrityLabPage: React.FC = () => {
  const { documents, auditLogs, alerts, tamperDocument, restoreDocumentIntegrity, verifyAuditChain } = useDms();
  const [activeTab, setActiveTab] = useState<'validator' | 'tamper_test'>('validator');
  const [localFileHash, setLocalFileHash] = useState('');
  const [localFileName, setLocalFileName] = useState('');
  const [localFileSize, setLocalFileSize] = useState<number | null>(null);
  const [chainVerifyResult, setChainVerifyResult] = useState<{ isValid: boolean; message: string; totalVerified: number } | null>(null);
  const [isVerifyingChain, setIsVerifyingChain] = useState(false);

  const tamperedDocs = documents.filter((d) => d.tamperState === 'TAMPERED');
  const validDocs = documents.filter((d) => d.tamperState === 'VALID');
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');

  const handleLocalFileDrop = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLocalFileName(file.name);
      setLocalFileSize(file.size);
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setLocalFileHash(hashHex);
    }
  };

  const handleVerifyChain = async () => {
    setIsVerifyingChain(true);
    try {
      const res = await verifyAuditChain();
      setChainVerifyResult(res);
    } finally {
      setIsVerifyingChain(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="brutal-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#64EE00] shadow-[0_0_8px_#64EE00]" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-black bg-[#64EE00] px-2 py-0.5 rounded border border-black">
              FORENSIC CRYPTOGRAPHY LAB
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-black tracking-tight font-sans">
            Integrity Verification & Audit Center
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Real-time SHA-256 digital forensics, anti-tampering validation, and chained ledger audit verification.
          </p>
        </div>

        <button
          onClick={handleVerifyChain}
          disabled={isVerifyingChain}
          className="brutal-btn-green px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 text-black stroke-[2.5] ${isVerifyingChain ? 'animate-spin' : ''}`} />
          <span>{isVerifyingChain ? 'Computing Hashes...' : 'Verify Audit Chain'}</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between gap-4 border-b-2 border-black pb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('validator')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 ${
              activeTab === 'validator'
                ? 'bg-black text-[#64EE00] border-2 border-black shadow-[3px_3px_0px_#000000]'
                : 'bg-white text-slate-700 border-2 border-transparent hover:border-black'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>HASH FORENSICS & VERIFIER</span>
          </button>

          <button
            onClick={() => setActiveTab('tamper_test')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 ${
              activeTab === 'tamper_test'
                ? 'bg-black text-[#64EE00] border-2 border-black shadow-[3px_3px_0px_#000000]'
                : 'bg-white text-slate-700 border-2 border-transparent hover:border-black'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>TAMPER SIMULATION SUITE ({tamperedDocs.length})</span>
          </button>

          <Link
            to="/audit-logs"
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 bg-white text-slate-700 border-2 border-transparent hover:border-black"
          >
            <FileCode className="w-4 h-4 text-black" />
            <span>CHAINED AUDIT LEDGER ({auditLogs.length}) &rarr;</span>
          </Link>

          <Link
            to="/security"
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 bg-white text-slate-700 border-2 border-transparent hover:border-black"
          >
            <ShieldAlert className="w-4 h-4 text-black" />
            <span>SECURITY ALERTS {activeAlerts.length > 0 && `(${activeAlerts.length})`} &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Global Status Banner */}
      <div
        className={`p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000000] flex items-center justify-between gap-4 ${
          tamperedDocs.length === 0
            ? 'bg-[#64EE00] text-black font-bold'
            : 'bg-black text-white font-bold'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black text-[#64EE00] border border-white/20 flex items-center justify-center">
            {tamperedDocs.length === 0 ? (
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-[#64EE00] stroke-[2.5]" />
            )}
          </div>
          <div>
            <div className="text-sm font-mono font-extrabold uppercase tracking-wide">
              {tamperedDocs.length === 0
                ? 'ALL ENCLAVE DOCUMENTS PASS CRYPTOGRAPHIC INTEGRITY'
                : `TAMPER ALERT: ${tamperedDocs.length} UNVERIFIED DOCUMENTS IN VAULT`}
            </div>
            <div className="text-xs opacity-90 font-medium">
              {tamperedDocs.length === 0
                ? 'Zero hash divergence detected across all vaults and evidence registries.'
                : 'Cryptographic hash mismatch. Original content has been altered or unauthorized edits detected.'}
            </div>
          </div>
        </div>

        {chainVerifyResult && (
          <div className="hidden lg:block text-xs font-mono bg-black text-white px-3 py-1.5 rounded-xl border border-black">
            {chainVerifyResult.isValid ? 'Chain Validated' : 'Chain Fault Detected'}
          </div>
        )}
      </div>

      {/* Tab 1: Local File Hasher & Live Forensics */}
      {activeTab === 'validator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Hash Calculator */}
          <div className="brutal-card p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-black">
              <Hash className="w-5 h-5 text-black" />
              <h2 className="text-sm font-mono font-extrabold text-black uppercase">
                Section 65B Digital Hash Calculator
              </h2>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Upload any local evidence file to compute its client-side SHA-256 hash using the Web Crypto API without uploading data over the wire.
            </p>

            <label className="border-2 border-dashed border-black rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition text-center group">
              <Upload className="w-8 h-8 text-black mb-2 group-hover:scale-110 transition stroke-[2]" />
              <span className="text-xs font-mono font-bold text-black uppercase">
                Drop File Here or Click to Compute
              </span>
              <span className="text-[11px] font-mono text-slate-500 mt-1">
                Forensic bitstream hashing performed in browser sandbox
              </span>
              <input type="file" onChange={handleLocalFileDrop} className="hidden" />
            </label>

            {localFileName && (
              <div className="p-4 rounded-xl bg-slate-50 border-2 border-black space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-black">{localFileName}</span>
                  <span className="text-slate-500 font-semibold">{localFileSize} bytes</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-500">COMPUTED SHA-256:</span>
                  <div className="p-2 bg-black text-[#64EE00] font-mono text-xs rounded-lg mt-1 break-all select-all font-bold">
                    {localFileHash}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Audit Chain Health Matrix */}
          <div className="brutal-card p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-black">
              <Terminal className="w-5 h-5 text-black" />
              <h2 className="text-sm font-mono font-extrabold text-black uppercase">
                Audit Chain Link Verification
              </h2>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              AstraX implements an immutable SHA-256 cryptographic chain where each audit log incorporates the hash of the preceding block.
            </p>

            <div className="space-y-2.5 max-h-[280px] overflow-y-auto">
              {auditLogs.slice(-4).reverse().map((log, i) => (
                <div key={log.id} className="p-3 rounded-xl border border-black/80 bg-slate-50 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black bg-[#64EE00] px-1.5 py-0.5 rounded border border-black text-[10px]">
                      BLOCK #{auditLogs.length - i}
                    </span>
                    <span className="text-[10px] text-slate-500">{log.action}</span>
                  </div>
                  <div className="text-[11px] text-slate-700 font-semibold truncate">
                    Hash: {log.currentHash.substring(0, 24)}...
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Prev: {log.previousHash ? log.previousHash.substring(0, 24) + '...' : 'GENESIS_BLOCK'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tamper Simulation Suite */}
      {activeTab === 'tamper_test' && (
        <div className="brutal-card p-6 space-y-4">
          <div className="pb-3 border-b-2 border-black">
            <h2 className="text-sm font-mono font-extrabold text-black uppercase">
              Interactive Tamper Demonstration Suite
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Simulate unauthorized byte modifications on live legal documents to observe automatic breach detection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.slice(0, 6).map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border-2 border-black bg-white space-y-3 shadow-[3px_3px_0px_#000000]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-black">{doc.documentName}</h3>
                    <div className="text-[10px] font-mono text-slate-500">{doc.caseNumber}</div>
                  </div>
                  <IntegrityBadge status={doc.tamperState} />
                </div>

                <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2 rounded border border-black/10 truncate">
                  SHA: {doc.sha256Hash.substring(0, 20)}...
                </div>

                <div className="flex items-center gap-2">
                  {doc.tamperState === 'VALID' ? (
                    <button
                      onClick={() => tamperDocument(doc.id)}
                      className="w-full py-1.5 bg-black text-[#64EE00] rounded-lg text-xs font-mono font-bold hover:bg-neutral-900 transition border-2 border-black shadow-[2px_2px_0px_#000000]"
                    >
                      SIMULATE TAMPER
                    </button>
                  ) : (
                    <button
                      onClick={() => restoreDocumentIntegrity(doc.id)}
                      className="w-full py-1.5 brutal-btn-green rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>RESTORE INTEGRITY</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
