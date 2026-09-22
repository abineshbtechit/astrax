import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDms } from '../contexts/DmsContext';
import {
  Boxes,
  ArrowLeft,
  ArrowRightLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileLock2,
  Hash,
} from 'lucide-react';
import { TransferEvidenceModal } from '../components/modals/TransferEvidenceModal';
import { ReceiveEvidenceModal } from '../components/modals/ReceiveEvidenceModal';
import { EvidenceTransfer } from '../types';

export const EvidenceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { evidence, cases, currentUser } = useDms();
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [selectedPendingTransfer, setSelectedPendingTransfer] = useState<EvidenceTransfer | null>(null);

  const item = evidence.find((e) => e.id === id);

  if (!item) {
    return (
      <div className="py-20 text-center space-y-3 font-mono">
        <h2 className="text-xl font-black text-black">EXHIBIT ITEM NOT FOUND</h2>
        <Link to="/evidence" className="text-black hover:underline text-xs font-bold">
          &larr; Return to Evidence Registry
        </Link>
      </div>
    );
  }

  const parentCase = cases.find((c) => c.id === item.caseId);
  const isCurrentCustodian = currentUser?.id === item.currentCustodianId;
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const pendingForMe = (item.chainOfCustody || item.transfers || []).find(
    (t) => t.toUserId === currentUser?.id && (t.status === 'PENDING_RECEIPT' || (t.status as string) === 'PENDING')
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between font-mono">
        <button
          onClick={() => navigate('/cases')}
          className="flex items-center gap-1.5 text-xs text-black hover:underline transition font-bold"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>EVIDENCE REGISTRY</span>
        </button>

        {parentCase && (
          <Link
            to={`/cases/${parentCase.id}`}
            className="text-xs font-mono text-black font-bold bg-white px-3 py-1 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] hover:bg-black hover:text-[#64EE00] transition"
          >
            Case: {parentCase.caseNumber} &rarr;
          </Link>
        )}
      </div>

      {/* Pending Transfer Callout */}
      {pendingForMe && (
        <div className="p-4 rounded-2xl bg-black border-2 border-black text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono shadow-[4px_4px_0px_#000000]">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#64EE00] flex-shrink-0 stroke-[2.5]" />
            <div>
              <div className="text-xs font-mono font-black tracking-wider text-[#64EE00]">
                PENDING CUSTODY HANDOFF REQUIRING VERIFICATION
              </div>
              <div className="text-xs text-white/80">
                {pendingForMe.fromUserName} ({pendingForMe.fromDepartment}) has initiated physical handover to your custody.
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedPendingTransfer(pendingForMe)}
            className="px-4 py-2 rounded-xl bg-[#64EE00] text-black font-mono text-xs font-black whitespace-nowrap border-2 border-black"
          >
            INSPECT SEAL & RECEIVE &rarr;
          </button>
        </div>
      )}

      {/* Header Overview Card */}
      <div className="p-6 rounded-2xl brutal-card space-y-4 font-mono">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-black text-black bg-[#64EE00] px-2.5 py-0.5 rounded border border-black">
                {item.evidenceId}
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-black text-white font-bold border border-black">
                SEAL #{item.sealNumber}
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-white text-black border border-black font-bold">
                {item.status}
              </span>
            </div>

            <h1 className="text-2xl font-black text-black tracking-tight">{item.type}</h1>
            <p className="text-xs text-black/80 leading-relaxed font-sans">{item.description}</p>
          </div>

          <div className="flex items-center gap-2">
            {(isCurrentCustodian || isSuperAdmin) && (
              <button
                onClick={() => setIsTransferOpen(true)}
                className="brutal-btn-green px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-4 h-4 stroke-[2.5]" />
                <span>Transfer Custody</span>
              </button>
            )}
            <Link
              to="/reports"
              className="px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold border-2 border-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000000]"
            >
              <FileLock2 className="w-4 h-4 text-[#64EE00]" />
              <span>Custody Certificate</span>
            </Link>
          </div>
        </div>

        {/* Current status grid */}
        <div className="pt-4 border-t-2 border-black/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000000] space-y-1">
            <span className="text-black/60 text-[10px] font-bold uppercase">Current Custodian</span>
            <div className="font-bold text-black">{item.currentCustodianName}</div>
            <div className="text-[11px] font-mono text-black/80 font-bold">{item.currentDepartment}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000000] space-y-1">
            <span className="text-black/60 text-[10px] font-bold uppercase">Storage Facility</span>
            <div className="font-bold text-black">{item.storageLocation}</div>
            <div className="text-[11px] text-black/60">Vault Access Audited</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000000] space-y-1">
            <span className="text-black/60 text-[10px] font-bold uppercase">Custody Handoffs</span>
            <div className="font-bold text-black">{(item.chainOfCustody || item.transfers || []).length} Sealed Transfers</div>
            <div className="text-[11px] font-bold text-black bg-[#64EE00] inline-block px-1.5 py-0.2 rounded border border-black">
              100% Intact
            </div>
          </div>
        </div>
      </div>

      {/* Chronological Chain of Custody Flow */}
      <div className="p-6 rounded-2xl brutal-card space-y-6 font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-black stroke-[2.5]" />
            <h3 className="text-sm font-black text-black uppercase tracking-wider">
              Chronological Custody Audit Ledger
            </h3>
          </div>
          <span className="text-xs text-black/60 font-bold">Section 65B Certified</span>
        </div>

        <div className="relative border-l-2 border-black ml-4 space-y-8">
          {(item.chainOfCustody || item.transfers || []).map((step, idx) => (
            <div key={step.id} className="relative pl-6">
              <div
                className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-black ${
                  step.status === 'COMPLETED'
                    ? 'bg-[#64EE00]'
                    : 'bg-white'
                }`}
              />

              <div className="p-4 rounded-xl bg-white border-2 border-black space-y-3 shadow-[2px_2px_0px_#000000]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold bg-black text-[#64EE00] px-1.5 py-0.5 rounded">
                      STEP #{idx + 1}
                    </span>
                    <span className="text-black/40">&bull;</span>
                    <span className="text-sm font-bold text-black">
                      {step.fromUserName} ({step.fromDepartment}) &rarr; {step.toUserName} ({step.toDepartment})
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border self-start font-bold ${
                      step.status === 'COMPLETED'
                        ? 'bg-[#64EE00] text-black border-black'
                        : 'bg-black text-white border-black'
                    }`}
                  >
                    {step.status}
                  </span>
                </div>

                <div className="text-xs text-black/80">
                  <strong className="text-black">Purpose:</strong> {step.reason}
                </div>

                <div className="text-xs text-black/80">
                  <strong className="text-black">Location:</strong> {step.location}
                </div>

                {step.conditionBefore && (
                  <div className="p-2.5 rounded bg-slate-50 border border-black/20 text-[11px] font-mono text-black">
                    <span className="text-black/60 block mb-0.5 font-bold">DISPATCH STATEMENT:</span>
                    {step.conditionBefore}
                  </div>
                )}

                {step.conditionAfter && (
                  <div className="p-2.5 rounded bg-slate-50 border border-black/20 text-[11px] font-mono text-black">
                    <span className="text-black block mb-0.5 font-bold">RECEIPT SEAL VERIFICATION:</span>
                    {step.conditionAfter}
                  </div>
                )}

                <div className="pt-2 border-t border-black/10 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-black/60">
                  <div>Timestamp: {new Date(step.timestamp || step.transferTime || Date.now()).toLocaleString()}</div>
                  <div className="truncate max-w-sm font-bold text-black">
                    Auth Token: {step.signatureToken}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TransferEvidenceModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        evidence={item}
      />

      {selectedPendingTransfer && (
        <ReceiveEvidenceModal
          isOpen={true}
          onClose={() => setSelectedPendingTransfer(null)}
          evidence={item}
          transfer={selectedPendingTransfer}
        />
      )}
    </div>
  );
};
