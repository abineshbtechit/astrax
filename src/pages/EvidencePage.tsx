import React, { useState } from 'react';
import { useDms } from '../contexts/DmsContext';
import {
  Boxes,
  Search,
  Plus,
  ArrowRightLeft,
  Shield,
  ArrowRight,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { EvidenceItem } from '../types';
import { TransferEvidenceModal } from '../components/modals/TransferEvidenceModal';

export const EvidencePage: React.FC = () => {
  const { evidence, cases, createEvidence } = useDms();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState<EvidenceItem | null>(null);

  // Create form state
  const [caseId, setCaseId] = useState(cases[0]?.id || '');
  const [evidenceType, setEvidenceType] = useState('Digital - Seized Hard Drive');
  const [sealNumber, setSealNumber] = useState(`NCRB-SEAL-${Math.floor(100000 + Math.random() * 900000)}`);
  const [storageLocation, setStorageLocation] = useState('Central Forensic Science Lab, Secure Locker #12');
  const [description, setDescription] = useState('');

  const filtered = evidence.filter((e) => {
    const q = search.toLowerCase();
    const matchesSearch =
      e.evidenceId.toLowerCase().includes(q) ||
      e.type.toLowerCase().includes(q) ||
      e.sealNumber.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !caseId) return;

    createEvidence({
      caseId,
      type: evidenceType,
      sealNumber,
      storageLocation,
      description: description.trim(),
    });

    setIsCreateOpen(false);
    setDescription('');
    setSealNumber(`NCRB-SEAL-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000000]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-[#64EE00] text-black border-2 border-black">
              <Boxes className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h1 className="text-xl font-black text-black uppercase tracking-tight">Physical & Digital Evidence Registry</h1>
          </div>
          <p className="text-xs text-black/70 font-bold">
            Chain of custody tracking with tamper-proof seals under Section 65B legal admissibility standards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/evidence-chain"
            className="brutal-btn px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Shield className="w-4 h-4 stroke-[2.5]" />
            <span>Custody Chain</span>
          </Link>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="brutal-btn-green px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Register Evidence</span>
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_#000000] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-black absolute left-3 top-2.5 stroke-[2.5]" />
          <input
            type="text"
            placeholder="Search evidence ID, seal number, type, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F2F4F7] border-2 border-black rounded-xl pl-9 pr-3 py-1.5 text-xs text-black placeholder-black/40 font-bold focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-black uppercase">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F2F4F7] border-2 border-black rounded-xl px-2.5 py-1.5 text-xs text-black font-bold focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SEIZED">Seized</option>
            <option value="IN_LAB">In Forensic Lab</option>
            <option value="SUBMITTED_IN_COURT">Submitted in Court</option>
            <option value="DISPOSED">Disposed</option>
          </select>
        </div>
      </div>

      {/* Grid of Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_#000000] transition space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-black bg-[#64EE00] px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000000]">
                      {item.evidenceId}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black text-white font-bold">
                      SEAL: {item.sealNumber}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-black mt-2">{item.type}</h3>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-black text-white font-bold border border-black">
                  {item.status}
                </span>
              </div>

              <p className="text-xs text-black/70 font-bold leading-relaxed">{item.description}</p>
            </div>

            <div className="pt-3 border-t-2 border-black/10 space-y-3">
              <div className="p-3 rounded-xl bg-[#F2F4F7] border-2 border-black text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-black/60 font-bold">Current Custodian:</span>
                  <span className="font-black text-black">
                    {item.currentCustodianName} ({item.currentDepartment})
                  </span>
                </div>
                <div className="flex items-center justify-between text-black/60 text-[11px] font-bold">
                  <span>Vault Storage:</span>
                  <span className="truncate max-w-[200px] text-black font-black">{item.storageLocation}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono font-bold text-black/60">
                  {(item.chainOfCustody || item.transfers || []).length} Transfers
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTransferTarget(item)}
                    className="brutal-btn-green px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Transfer</span>
                  </button>
                  <Link
                    to={`/evidence/${item.id}`}
                    className="brutal-btn px-3 py-1 rounded-lg text-black text-xs font-bold flex items-center gap-1"
                  >
                    <span>Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Register Evidence Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-mono">
          <div className="bg-[#F2F4F7] border-2 border-black rounded-2xl w-full max-w-lg shadow-[8px_8px_0px_#000000] overflow-hidden">
            <div className="p-4 border-b-2 border-black flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-[#64EE00] text-black border-2 border-black">
                  <Boxes className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className="text-base font-black text-black uppercase">Register Evidentiary Item</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-xl border-2 border-black bg-white hover:bg-black hover:text-white text-black transition"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-black mb-1">Evidence Type</label>
                  <input
                    type="text"
                    value={evidenceType}
                    onChange={(e) => setEvidenceType(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black mb-1">
                    Seal Barcode
                  </label>
                  <input
                    type="text"
                    value={sealNumber}
                    onChange={(e) => setSealNumber(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-xs font-bold text-black font-mono focus:outline-none shadow-[2px_2px_0px_#000000]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Storage Vault / Facility</label>
                <input
                  type="text"
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  Item Description & Seizure Context
                </label>
                <textarea
                  rows={3}
                  placeholder="Physical description, make/model, serial numbers, seizure spot, condition on intake..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-xl p-2.5 text-xs text-black font-bold placeholder-black/40 focus:outline-none shadow-[2px_2px_0px_#000000]"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-black hover:text-white text-black text-xs font-bold border-2 border-black transition shadow-[2px_2px_0px_#000000]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="brutal-btn-green px-5 py-2 rounded-xl font-bold text-xs"
                >
                  Register Evidence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {transferTarget && (
        <TransferEvidenceModal
          isOpen={true}
          onClose={() => setTransferTarget(null)}
          evidence={transferTarget}
        />
      )}
    </div>
  );
};
