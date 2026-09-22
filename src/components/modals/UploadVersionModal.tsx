import React, { useState } from 'react';
import { useDms } from '../../contexts/DmsContext';
import { X, GitCommit, Hash, AlertTriangle } from 'lucide-react';
import { DocumentItem } from '../../types';
import { sha256String } from '../../utils/crypto';

export const UploadVersionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem;
}> = ({ isOpen, onClose, document }) => {
  const { uploadDocumentVersion } = useDms();
  const [changeDescription, setChangeDescription] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [previewHash, setPreviewHash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const nextVer = document.currentVersion + 1;

  const handleContentChange = async (text: string) => {
    setFileContent(text);
    const hash = await sha256String(text || `${document.documentName}_v${nextVer}_${Date.now()}`);
    setPreviewHash(hash);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeDescription.trim()) {
      setError('Please provide change notes describing what changed in this version.');
      return;
    }
    const content = fileContent || `VERSION ${nextVer} UPDATE: ${document.documentName}\nNotes: ${changeDescription}\nCommitted at ${new Date().toISOString()}`;

    setIsSubmitting(true);
    try {
      await uploadDocumentVersion(document.id, changeDescription.trim(), content);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Version upload failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-mono">
      <div className="bg-[#F2F4F7] border-2 border-black rounded-2xl w-full max-w-lg shadow-[8px_8px_0px_#000000] overflow-hidden">
        <div className="p-4 border-b-2 border-black flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#64EE00] text-black border-2 border-black">
              <GitCommit className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-black uppercase">Upload New Version (V{nextVer})</h3>
              <p className="text-xs text-black/70 font-bold">CURRENT: V{document.currentVersion} &rarr; TARGET: V{nextVer}</p>
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
            <div className="p-3 rounded-xl bg-black text-white border-2 border-black text-xs font-bold">
              {error}
            </div>
          )}

          <div className="p-3 rounded-xl bg-white border-2 border-black text-xs text-black flex items-start gap-2 shadow-[2px_2px_0px_#000000]">
            <AlertTriangle className="w-4 h-4 text-black stroke-[2.5] flex-shrink-0 mt-0.5" />
            <span className="font-bold">
              Immutability Guarantee: Version {document.currentVersion} and all preceding versions will be preserved with their authoritative SHA-256 digests in tamper-proof version logs.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Change Description & Addendum Justification
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Added supplementary forensic mobile phone report analysis and witness annexure D..."
              value={changeDescription}
              onChange={(e) => setChangeDescription(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-xl p-2.5 text-xs text-black placeholder-black/40 font-bold focus:outline-none shadow-[2px_2px_0px_#000000]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Updated Document Text / Differential Excerpt
            </label>
            <textarea
              rows={4}
              placeholder="Paste updated document clauses, addendums, or revised analysis text..."
              value={fileContent}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-xl p-2.5 text-xs text-black placeholder-black/40 font-mono font-bold focus:outline-none shadow-[2px_2px_0px_#000000]"
            />
          </div>

          {previewHash && (
            <div className="p-2.5 rounded-xl bg-white border-2 border-black flex items-start gap-2 text-xs shadow-[2px_2px_0px_#000000]">
              <Hash className="w-4 h-4 text-black stroke-[2.5] flex-shrink-0 mt-0.5" />
              <div className="overflow-hidden">
                <div className="text-[10px] font-mono text-black/60 font-bold">VERSION {nextVer} NEW SHA-256:</div>
                <div className="font-mono text-black font-bold text-[11px] truncate">{previewHash}</div>
              </div>
            </div>
          )}

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
              <GitCommit className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Calculating Checksum...' : `Commit Version ${nextVer}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
