import React, { useState } from 'react';
import { useDms } from '../contexts/DmsContext';
import {
  Scale,
  Binary,
  ShieldCheck,
  ArrowRight,
  FileLock2,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const EvidenceChainPage: React.FC = () => {
  const { evidence, cases } = useDms();
  const [selectedCaseId, setSelectedCaseId] = useState<string>('ALL');

  const filteredEvidence =
    selectedCaseId === 'ALL'
      ? evidence
      : evidence.filter((e) => e.caseId === selectedCaseId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl brutal-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-black text-[#64EE00] border-2 border-black">
              <Scale className="w-4 h-4 stroke-[2.5]" />
            </span>
            <h1 className="text-xl font-extrabold text-black font-mono">
              MASTER CHAIN OF CUSTODY MATRIX
            </h1>
          </div>
          <p className="text-xs text-black/70 font-mono">
            Unbroken physical and digital handover audit trail across Police, Forensics, Prosecution, and Judiciary.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs font-bold">
          <span className="text-black">INVESTIGATION:</span>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="bg-white border-2 border-black rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
          >
            <option value="ALL">All Investigations</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} — {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Statistics Banner */}
      <div className="p-4 rounded-2xl brutal-card grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
        <div className="p-3.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000000]">
          <span className="text-black/60 block text-[10px] font-bold">MONITORED EXHIBITS</span>
          <div className="text-2xl font-black text-black mt-0.5">{filteredEvidence.length} Units</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#64EE00] border-2 border-black shadow-[2px_2px_0px_#000000]">
          <span className="text-black block text-[10px] font-bold">VERIFIED HANDOFF NODES</span>
          <div className="text-2xl font-black text-black mt-0.5">
            {filteredEvidence.reduce((acc, e) => acc + (e.chainOfCustody?.length || e.transfers?.length || 0), 0)} Handshakes
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-black text-white border-2 border-black shadow-[2px_2px_0px_#000000]">
          <span className="text-white/60 block text-[10px] font-bold">CUSTODY CONTINUITY</span>
          <div className="text-2xl font-black text-[#64EE00] mt-0.5">100.0% Continuous</div>
        </div>
      </div>

      {/* Visual Chain Timeline Cards */}
      <div className="space-y-6">
        {filteredEvidence.map((ev) => (
          <div
            key={ev.id}
            className="p-6 rounded-2xl brutal-card space-y-5"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-black/10">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold bg-[#64EE00] text-black px-2 py-0.5 rounded border border-black">
                    {ev.evidenceId}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black text-white border border-black font-bold">
                    SEAL #{ev.sealNumber}
                  </span>
                  <span className="text-xs font-mono text-black/70 font-semibold">Case: {ev.caseNumber}</span>
                </div>
                <h3 className="text-base font-bold text-black font-mono mt-1">{ev.type}</h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-white text-black border-2 border-black font-bold">
                  {ev.status}
                </span>
                <Link
                  to={`/evidence/${ev.id}`}
                  className="px-3 py-1 rounded-xl bg-black hover:bg-neutral-800 text-[#64EE00] text-xs font-mono font-bold border-2 border-black shadow-[2px_2px_0px_#000000]"
                >
                  Inspect Handoffs &rarr;
                </Link>
              </div>
            </div>

            {/* Stepper visual pipeline */}
            <div className="overflow-x-auto pb-2">
              <div className="flex items-start gap-4 min-w-[650px]">
                {(ev.chainOfCustody || ev.transfers || []).map((transfer, idx) => (
                  <div key={transfer.id} className="flex-1 relative">
                    {/* Step Card */}
                    <div className="p-3.5 rounded-xl bg-white border-2 border-black space-y-2 h-full flex flex-col justify-between shadow-[2px_2px_0px_#000000]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="bg-black text-[#64EE00] px-1.5 py-0.5 rounded font-bold">
                            NODE {idx + 1}
                          </span>
                          <span className="font-bold text-black">{transfer.status}</span>
                        </div>
                        <div className="text-xs font-bold text-black font-mono">
                          {transfer.fromUserName} &rarr; {transfer.toUserName}
                        </div>
                        <div className="text-[11px] font-mono font-semibold text-black/70">
                          {transfer.fromDepartment} &rarr; {transfer.toDepartment}
                        </div>
                        <p className="text-[11px] font-mono text-black/70 line-clamp-2 mt-1">
                          {transfer.reason}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-black/10 text-[10px] font-mono text-black/60 font-semibold">
                        {new Date(transfer.timestamp || transfer.transferTime || Date.now()).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Connecting arrow if not last */}
                    {idx < (ev.chainOfCustody || ev.transfers || []).length - 1 && (
                      <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-black">
                        <ArrowRight className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Current Custodian Footer */}
            <div className="p-3 rounded-xl bg-white border-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono shadow-[2px_2px_0px_#000000]">
              <div className="flex items-center gap-2 flex-wrap">
                <ShieldCheck className="w-4 h-4 text-black stroke-[2.5]" />
                <span className="text-black/70">Authoritative Possession:</span>
                <strong className="text-black font-bold">{ev.currentCustodianName}</strong>
                <span className="bg-[#64EE00] text-black px-1.5 py-0.5 rounded border border-black font-bold">
                  {ev.currentCustodianDepartment || ev.currentDepartment}
                </span>
              </div>
              <div className="text-black/60 font-mono text-[11px]">
                Storage Facility: {ev.storageLocation}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
