import React, { useState } from 'react';
import { useDms } from '../../contexts/DmsContext';
import { X, ArrowRightLeft } from 'lucide-react';
import { EvidenceItem } from '../../types';

export const TransferEvidenceModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  evidence: EvidenceItem;
}> = ({ isOpen, onClose, evidence }) => {
  const { users, currentUser, transferEvidence } = useDms();
  const eligibleRecipients = users.filter((u) => u.id !== currentUser?.id);
  const [toUserId, setToUserId] = useState(eligibleRecipients[0]?.id || '');
  const [reason, setReason] = useState('');
  const [location, setLocation] = useState('Central Forensic Science Laboratory, Intake Desk');
  const [conditionBefore, setConditionBefore] = useState(
    `Tamper-evident seal ${evidence.sealNumber} intact. Physical integrity verified with zero breach.`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toUserId) {
      setError('Please select a recipient officer.');
      return;
    }
    if (!reason.trim()) {
      setError('Please specify operational transfer reason.');
      return;
    }

    setIsSubmitting(true);
    try {
      await transferEvidence(evidence.id, toUserId, reason.trim(), location.trim(), conditionBefore.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Transfer failed');
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
              <ArrowRightLeft className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-black uppercase">Transfer Evidence Custody</h3>
              <p className="text-xs text-black/70 font-bold">SEAL: {evidence.sealNumber}</p>
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

          <div className="p-3 rounded-xl bg-white border-2 border-black space-y-1 text-xs shadow-[2px_2px_0px_#000000]">
            <div className="text-[10px] text-black/60 font-bold">EVIDENCE ITEM</div>
            <div className="font-black text-black">{evidence.type}</div>
            <div className="text-black/70 font-mono text-[11px] font-bold truncate">
              ID: {evidence.evidenceId} &bull; Case: {evidence.caseNumber}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Select Receiving Custodian / Officer
            </label>
            <select
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
            >
              {eligibleRecipients.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.department} — {u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">Transfer Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Transfer Reason & Investigation Directive
            </label>
            <input
              type="text"
              placeholder="e.g. Bit-stream physical imaging and forensic artifact analysis"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-xs font-bold text-black placeholder-black/40 focus:outline-none shadow-[2px_2px_0px_#000000]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Condition & Seal Verification Statement
            </label>
            <textarea
              rows={2}
              value={conditionBefore}
              onChange={(e) => setConditionBefore(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-xl p-2.5 text-xs text-black font-mono font-bold focus:outline-none shadow-[2px_2px_0px_#000000]"
              required
            />
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
              <ArrowRightLeft className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Stamping...' : 'Initiate Transfer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
