import React, { useState } from 'react';
import { useDms } from '../../contexts/DmsContext';
import { X, Briefcase, FileUp, Box, Check, Shield } from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ isOpen, onClose }) => {
  const { createCase, uploadDocument, createEvidence, currentUser } = useDms();
  const [tab, setTab] = useState<'case' | 'document' | 'evidence'>('case');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [caseTitle, setCaseTitle] = useState('');
  const [crimeType, setCrimeType] = useState('Cyber Financial Fraud');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');

  const [docName, setDocName] = useState('');
  const [docContent, setDocContent] = useState('');
  const [classification, setClassification] = useState<'RESTRICTED' | 'CONFIDENTIAL' | 'PUBLIC_RECORD'>('CONFIDENTIAL');

  const [evidenceName, setEvidenceName] = useState('');
  const [evidenceType, setEvidenceType] = useState<string>('DIGITAL_FORENSIC');

  if (!isOpen) return null;

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseTitle.trim()) return;
    setLoading(true);
    try {
      await createCase({
        title: caseTitle,
        crimeType,
        priority,
        description: `Initiated via quick action by ${currentUser?.fullName}`,
      });
      setSuccessMsg('Investigation case created successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;
    setLoading(true);
    try {
      await uploadDocument({
        caseId: 'CASE-001',
        documentName: docName,
        originalFilename: `${docName.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        type: 'LEGAL_NOTICE',
        classification,
        fileContent: docContent || `CONFIDENTIAL LEGAL RECORD\nTitle: ${docName}\nAuthor: ${currentUser?.fullName}`,
      });
      setSuccessMsg('Document securely vaulted with SHA-256 seal!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceName.trim()) return;
    setLoading(true);
    try {
      await createEvidence({
        type: evidenceType,
        description: evidenceName,
        caseId: 'CASE-001',
        caseNumber: 'CR-2026-1049',
        collectionLocation: 'Primary Digital Seizure',
      });
      setSuccessMsg('Evidence registered with unbroken chain of custody!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-lg bg-white border-2 border-black shadow-[8px_8px_0px_#000000] rounded-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-black text-white px-6 py-4 flex items-center justify-between border-b-2 border-black">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#64EE00] text-black font-bold flex items-center justify-center text-xs">
              AX
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight text-white font-mono uppercase">
                Quick Enclave Action
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">Create or register legal exhibits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 border-b-2 border-black bg-slate-100 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setTab('case')}
            className={`py-2 text-xs font-bold font-mono rounded-lg transition flex items-center justify-center gap-1.5 ${
              tab === 'case'
                ? 'bg-black text-[#64EE00] border-2 border-black shadow-[2px_2px_0px_#000000]'
                : 'text-slate-600 hover:bg-white/80'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>CASE</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('document')}
            className={`py-2 text-xs font-bold font-mono rounded-lg transition flex items-center justify-center gap-1.5 ${
              tab === 'document'
                ? 'bg-black text-[#64EE00] border-2 border-black shadow-[2px_2px_0px_#000000]'
                : 'text-slate-600 hover:bg-white/80'
            }`}
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>DOCUMENT</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('evidence')}
            className={`py-2 text-xs font-bold font-mono rounded-lg transition flex items-center justify-center gap-1.5 ${
              tab === 'evidence'
                ? 'bg-black text-[#64EE00] border-2 border-black shadow-[2px_2px_0px_#000000]'
                : 'text-slate-600 hover:bg-white/80'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>EVIDENCE</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 bg-[#64EE00] border-b-2 border-black text-black font-bold text-xs font-mono flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab Forms */}
        <div className="p-6">
          {tab === 'case' && (
            <form onSubmit={handleCreateCase} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-black mb-1">
                  CASE TITLE / INVESTIGATION NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State vs Cyber Syndicate 409"
                  value={caseTitle}
                  onChange={(e) => setCaseTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-black mb-1">
                    CRIME TYPE
                  </label>
                  <select
                    value={crimeType}
                    onChange={(e) => setCrimeType(e.target.value)}
                    className="w-full p-2 bg-slate-50 border-2 border-black rounded-xl text-xs font-medium focus:outline-none"
                  >
                    <option value="Cyber Financial Fraud">Cyber Financial Fraud</option>
                    <option value="Data Breach & Espionage">Data Breach & Espionage</option>
                    <option value="Crypto Extortion">Crypto Extortion</option>
                    <option value="Unauthorized Database Tamper">Unauthorized Database Tamper</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-black mb-1">
                    PRIORITY LEVEL
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border-2 border-black rounded-xl text-xs font-medium focus:outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 brutal-btn-green rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 mt-4"
              >
                {loading ? 'Creating...' : 'Register Investigation Case'}
              </button>
            </form>
          )}

          {tab === 'document' && (
            <form onSubmit={handleUploadDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-black mb-1">
                  DOCUMENT LABEL
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sworn Affidavit Section 65B"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border-2 border-black rounded-xl text-sm font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-black mb-1">
                  CLASSIFICATION LEVEL
                </label>
                <select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border-2 border-black rounded-xl text-xs font-medium focus:outline-none"
                >
                  <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                  <option value="RESTRICTED">RESTRICTED</option>
                  <option value="PUBLIC_RECORD">PUBLIC RECORD</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-black mb-1">
                  PRELIMINARY TEXT CONTENT
                </label>
                <textarea
                  rows={3}
                  placeholder="Insert forensic legal text or metadata..."
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border-2 border-black rounded-xl text-xs font-mono focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 brutal-btn-green rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 mt-4"
              >
                {loading ? 'Vaulting...' : 'Secure & Vault Document'}
              </button>
            </form>
          )}

          {tab === 'evidence' && (
            <form onSubmit={handleCreateEvidence} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-black mb-1">
                  EVIDENCE NAME / EXH-TAG
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Extracted NVMe SSD (Encrypted)"
                  value={evidenceName}
                  onChange={(e) => setEvidenceName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border-2 border-black rounded-xl text-sm font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-black mb-1">
                  EXHIBIT TYPE
                </label>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border-2 border-black rounded-xl text-xs font-medium focus:outline-none"
                >
                  <option value="DIGITAL_FORENSIC">DIGITAL FORENSIC (Bitstream)</option>
                  <option value="PHYSICAL_ITEM">PHYSICAL SEIZURE</option>
                  <option value="FORENSIC_REPORT">FORENSIC AUDIT REPORT</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 brutal-btn-green rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 mt-4"
              >
                {loading ? 'Registering...' : 'Log Evidence with SHA-256 Seal'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
