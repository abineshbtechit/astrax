import React, { useState } from 'react';
import { useDms } from '../../contexts/DmsContext';
import { X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { EvidenceItem, EvidenceTransfer } from '../../types';

export const ReceiveEvidenceModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  evidence: EvidenceItem;
  transfer: EvidenceTransfer;
}> = ({ isOpen, onClose, evidence, transfer }) => {
  const { receiveEvidence } = useDms();
  const [conditionAfter, setConditionAfter] = useState(
    `Received in person. Tamper-evident seal ${evidence.sealNumber} intact and verified under laboratory UV scan. Deposited into Evidence Vault Safe #04.`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conditionAfter.trim()) {
      setError('Please provide receipt inspection condition statement.');
      return;
    }

    setIsSubmitting(true);
    try {
      await receiveEvidence(evidence.id, transfer.id, conditionAfter.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Receipt verification failed');
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
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-black uppercase">Verify & Receive Custody</h3>
              <p className="text-xs text-black/70 font-bold">SEAL INTEGRITY CONFIRMATION</p>
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

          <div className="p-3 rounded-xl bg-white border-2 border-black space-y-2 text-xs shadow-[2px_2px_0px_#000000]">
            <div className="flex justify-between items-center text-[10px] font-mono text-black/60 font-bold">
              <span>TRANSFER AUDIT RECORD</span>
              <span className="text-black bg-[#64EE00] px-1.5 py-0.5 rounded border border-black">PENDING RECEIPT</span>
            </div>
            <div className="font-black text-black">{evidence.type} ({evidence.evidenceId})</div>
            <div className="text-black/70 font-bold">
              Transferred By: <span className="text-black font-black">{transfer.fromUserName}</span> ({transfer.fromDepartment})
            </div>
            <div className="text-black/70 font-bold">
              Reason: <span className="text-black">{transfer.reason}</span>
            </div>
            <div className="text-[11px] font-mono text-black font-black bg-slate-50 p-1 rounded border border-black/20 truncate">
              Token: {transfer.signatureToken}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Recipient Physical Seal & Condition Confirmation
            </label>
            <textarea
              rows={3}
              value={conditionAfter}
              onChange={(e) => setConditionAfter(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-xl p-2.5 text-xs text-black font-mono font-bold focus:outline-none shadow-[2px_2px_0px_#000000]"
              required
            />
            <div className="text-[10px] text-black/60 mt-1 font-bold">
              Your digital signature and badge ID will be permanently bound to this receipt milestone.
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
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Verifying Seal...' : 'Accept Custody & Sign Receipt'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
