import React, { useState } from 'react';
import { useDms } from '../../contexts/DmsContext';
import { X, Upload, FileText, Hash, AlertCircle } from 'lucide-react';
import { Classification, DocumentType } from '../../types';
import { sha256String } from '../../utils/crypto';

export const UploadDocumentModal: React.FC<{ isOpen: boolean; onClose: () => void; defaultCaseId?: string }> = ({
  isOpen,
  onClose,
  defaultCaseId,
}) => {
  const { cases, uploadDocument } = useDms();
  const [caseId, setCaseId] = useState(defaultCaseId || (cases[0]?.id || ''));
  const [documentName, setDocumentName] = useState('');
  const [docType, setDocType] = useState<DocumentType>('INVESTIGATION_REPORT');
  const [classification, setClassification] = useState<Classification>('RESTRICTED');
  const [fileContent, setFileContent] = useState('');
  const [filename, setFilename] = useState('');
  const [isLegalHold, setIsLegalHold] = useState(false);
  const [previewHash, setPreviewHash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFilename(file.name);
      if (!documentName) {
        setDocumentName(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = (event.target?.result as string) || '';
        setFileContent(text);
        const hash = await sha256String(text);
        setPreviewHash(hash);
      };
      reader.readAsText(file);
    }
  };

  const handleManualTextChange = async (text: string) => {
    setFileContent(text);
    if (!filename) setFilename('evidence_report.txt');
    const hash = await sha256String(text);
    setPreviewHash(hash);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseId || !documentName.trim()) {
      setError('Please select an investigation and specify document title.');
      return;
    }
    const content = fileContent || `OFFICIAL RECORD: ${documentName}\nRegistered in DMS at ${new Date().toISOString()}`;
    const fname = filename || `${documentName.toLowerCase().replace(/\s+/g, '_')}.pdf`;

    setIsSubmitting(true);
    try {
      await uploadDocument({
        caseId,
        documentName: documentName.trim(),
        originalFilename: fname,
        type: docType,
        classification,
        fileContent: content,
        isLegalHold,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto font-mono">
      <div className="bg-[#F2F4F7] border-2 border-black rounded-2xl w-full max-w-xl shadow-[8px_8px_0px_#000000] overflow-hidden my-8">
        <div className="p-4 md:p-5 border-b-2 border-black flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#64EE00] text-black border-2 border-black">
              <Upload className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-black uppercase">Upload Confidential Document</h3>
              <p className="text-xs text-black/70 font-bold">ENCRYPTED AT REST (AES-256) & SHA-256 HASHED</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border-2 border-black bg-white hover:bg-black hover:text-white text-black transition"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-black text-white border-2 border-black text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#64EE00] flex-shrink-0" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          {/* Investigation Case Selection */}
          <div>
            <label className="block text-xs font-bold text-black mb-1">Investigation Case</label>
            <select
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber} — {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Title and Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-black mb-1">Document Title</label>
              <input
                type="text"
                placeholder="e.g. Forensic Memory Dump"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-xs font-bold text-black placeholder-black/40 focus:outline-none shadow-[2px_2px_0px_#000000]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-black mb-1">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
              >
                <option value="FIR">First Information Report (FIR)</option>
                <option value="POLICE_REPORT">Police General Diary Report</option>
                <option value="INVESTIGATION_REPORT">Investigation Officer Report</option>
                <option value="FORENSIC_REPORT">CFSL Forensic Report</option>
                <option value="WITNESS_STATEMENT">Witness Deposition Statement</option>
                <option value="CHARGE_SHEET">Police Final Charge Sheet</option>
                <option value="COURT_FILING">Judicial Court Filing / Order</option>
                <option value="LEGAL_NOTICE">Legal Notice / Subpoena</option>
                <option value="EVIDENCE">Digital Evidence Attachment</option>
              </select>
            </div>
          </div>

          {/* Classification Selection */}
          <div>
            <label className="block text-xs font-bold text-black mb-1.5">
              Security Classification Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['RESTRICTED', 'CONFIDENTIAL', 'PUBLIC_RECORD'] as Classification[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setClassification(level)}
                  className={`p-2.5 rounded-xl border-2 border-black text-left text-xs transition shadow-[2px_2px_0px_#000000] ${
                    classification === level
                      ? 'bg-[#64EE00] text-black font-black'
                      : 'bg-white text-black font-bold hover:bg-slate-100'
                  }`}
                >
                  <div className="font-mono text-[11px] font-black">{level}</div>
                  <div className="text-[10px] text-black/70 mt-0.5 font-bold">
                    {level === 'CONFIDENTIAL'
                      ? 'Explicit grant'
                      : level === 'RESTRICTED'
                      ? 'Dept clearance'
                      : 'Participants'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* File input */}
          <div>
            <label className="block text-xs font-bold text-black mb-1">
              File Attachment or Content Body
            </label>
            <div className="border-2 border-dashed border-black rounded-2xl p-4 bg-white text-center cursor-pointer relative shadow-[2px_2px_0px_#000000]">
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <FileText className="w-8 h-8 text-black stroke-[2.5] mx-auto mb-1.5" />
              <div className="text-xs text-black font-bold">
                {filename ? <span className="font-mono font-black text-black bg-[#64EE00] px-2 py-0.5 rounded border border-black">{filename}</span> : 'Click or Drag document file here (PDF, DOCX, TXT)'}
              </div>
              <div className="text-[10px] text-black/60 mt-1 font-mono font-bold">
                SHA-256 calculated automatically before transmission
              </div>
            </div>
          </div>

          {/* Quick paste / editor for demonstration */}
          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Document Text / Excerpt Preview
            </label>
            <textarea
              rows={3}
              placeholder="Paste or type document findings, executive notes, or affidavit text..."
              value={fileContent}
              onChange={(e) => handleManualTextChange(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-xl p-2.5 text-xs text-black placeholder-black/40 font-mono font-bold focus:outline-none shadow-[2px_2px_0px_#000000]"
            />
          </div>

          {/* Hash Preview */}
          {previewHash && (
            <div className="p-2.5 rounded-xl bg-white border-2 border-black flex items-start gap-2 text-xs shadow-[2px_2px_0px_#000000]">
              <Hash className="w-4 h-4 text-black stroke-[2.5] flex-shrink-0 mt-0.5" />
              <div className="overflow-hidden">
                <div className="text-[10px] font-mono font-bold text-black/60">INGESTION SHA-256 CHECKSUM:</div>
                <div className="font-mono text-black font-bold text-[11px] truncate">{previewHash}</div>
              </div>
            </div>
          )}

          {/* Legal Hold Option */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="legalHold"
              checked={isLegalHold}
              onChange={(e) => setIsLegalHold(e.target.checked)}
              className="w-4 h-4 rounded border-2 border-black accent-[#64EE00] cursor-pointer"
            />
            <label htmlFor="legalHold" className="text-xs text-black font-bold cursor-pointer">
              Enforce Statutory Legal Hold (Prevents archival or retention purging)
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t-2 border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-black hover:text-white text-black text-xs font-bold border-2 border-black transition shadow-[2px_2px_0px_#000000]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="brutal-btn-green px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Hashing & Encrypting...' : 'Commit to Vault'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
