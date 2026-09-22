import React, { useState } from 'react';
import { useDms } from '../../contexts/DmsContext';
import { X, KeyRound, AlertCircle, Check } from 'lucide-react';
import { DocumentItem, PermissionType } from '../../types';

export const RequestAccessModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem;
}> = ({ isOpen, onClose, document }) => {
  const { submitAccessRequest } = useDms();
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionType[]>(['VIEW']);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const togglePermission = (perm: PermissionType) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPermissions.length === 0) {
      setError('Please select at least one permission level (e.g. VIEW).');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a legal or operational justification for access request.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitAccessRequest(document.id, selectedPermissions, reason.trim());
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Request failed');
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
              <KeyRound className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-black uppercase">Request Department Access</h3>
              <p className="text-xs text-black/70 font-bold">
                OWNING DEPARTMENT: {document.ownerDepartment}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border-2 border-black bg-white hover:bg-black hover:text-white text-black transition"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#64EE00] text-black border-2 border-black flex items-center justify-center mx-auto mb-2">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="text-sm font-black text-black uppercase">Access Request Dispatched</h4>
            <p className="text-xs text-black/70 font-bold">
              Document owner {document.ownerUserName} ({document.ownerDepartment}) has been notified.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-black text-white border-2 border-black text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#64EE00] flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-white border-2 border-black space-y-1 text-xs shadow-[2px_2px_0px_#000000]">
              <div className="text-[10px] text-black/60 uppercase font-bold">Target Confidential Document</div>
              <div className="text-sm font-black text-black">{document.documentName}</div>
              <div className="text-black/70 font-bold text-[11px]">
                Case: {document.caseNumber} &bull; Type: {document.type} &bull; Classification: {document.classification}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1.5">
                Requested Permission Levels
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['VIEW', 'DOWNLOAD', 'VERSION_UPLOAD', 'SHARE'] as PermissionType[]).map((perm) => {
                  const isChecked = selectedPermissions.includes(perm);
                  return (
                    <button
                      key={perm}
                      type="button"
                      onClick={() => togglePermission(perm)}
                      className={`p-2.5 rounded-xl border-2 border-black text-left text-xs transition flex items-center justify-between shadow-[2px_2px_0px_#000000] ${
                        isChecked
                          ? 'bg-[#64EE00] text-black font-black'
                          : 'bg-white text-black font-bold hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-mono text-xs">{perm}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Investigation Justification & Purpose
              </label>
              <textarea
                rows={3}
                placeholder="State statutory legal reason, court filing requirement, or cross-verifying forensic evidence..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-white border-2 border-black rounded-xl p-2.5 text-xs text-black placeholder-black/40 font-bold focus:outline-none shadow-[2px_2px_0px_#000000]"
                required
              />
              <div className="text-[10px] text-black/60 mt-1 font-bold">
                Audited under NCRB Cross-Department Discovery Regulations.
              </div>
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
                <KeyRound className="w-4 h-4 stroke-[2.5]" />
                <span>{isSubmitting ? 'Transmitting...' : 'Submit Request'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
