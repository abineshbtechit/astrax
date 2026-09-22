import React, { useState } from 'react';
import { useDms } from '../contexts/DmsContext';
import {
  FileCheck2,
  Printer,
  Shield,
  FileLock2,
  Scale,
  CheckCircle2,
  PenTool,
  Bot,
  Sparkles,
} from 'lucide-react';
import { triggerAiChat } from '../components/layout/AppLayout';

export const ReportsPage: React.FC = () => {
  const { cases, documents, evidence, currentUser } = useDms();
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || '');
  const [reportType, setReportType] = useState<'65B_CERTIFICATE' | 'FULL_DOSSIER' | 'CHAIN_REPORT'>('65B_CERTIFICATE');

  const selectedCase = cases.find((c) => c.id === selectedCaseId);
  const caseDocs = documents.filter((d) => d.caseId === selectedCaseId);
  const caseEvidence = evidence.filter((e) => e.caseId === selectedCaseId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden font-mono">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scale className="w-5 h-5 text-black stroke-[2.5]" />
            <h1 className="text-xl font-black text-black tracking-tight uppercase">
              Court Compliance & Evidence Certification
            </h1>
          </div>
          <p className="text-xs text-black/70">
            Generate printable, digitally sealed certificates under Section 65B Indian Evidence Act.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const currentCase = cases.find((c) => c.id === selectedCaseId);
              const firstDoc = caseDocs[0];
              triggerAiChat(
                firstDoc,
                `Provide an executive legal dossier summary for Case ${currentCase?.caseNumber || ''} ("${currentCase?.title || ''}"). Summarize all ${caseDocs.length} vaulted documents and ${caseEvidence.length} evidence items.`
              );
            }}
            className="px-4 py-2 rounded-xl bg-black text-[#64EE00] hover:bg-neutral-800 font-mono font-bold text-xs flex items-center gap-1.5 border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer"
            title="Summarize Case Dossier with Azure AI Agent"
          >
            <Bot className="w-4 h-4 stroke-[2.5]" />
            <span>AI Executive Brief</span>
            <Sparkles className="w-3.5 h-3.5 text-[#64EE00]" />
          </button>

          <button
            onClick={handlePrint}
            className="brutal-btn-green px-4 py-2 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Print Official Certificate</span>
          </button>
        </div>
      </div>

      {/* Report Controls (Hidden in Print) */}
      <div className="p-4 rounded-2xl brutal-card flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden font-mono">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="space-y-1 w-full sm:w-auto">
            <label className="text-[11px] font-bold text-black block uppercase">SELECT INVESTIGATION:</label>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="bg-white border-2 border-black rounded-xl px-3 py-1.5 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_#000000] w-full"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber} — {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] flex-wrap">
          <button
            onClick={() => setReportType('65B_CERTIFICATE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition border ${
              reportType === '65B_CERTIFICATE' ? 'bg-black text-[#64EE00] border-black' : 'bg-transparent text-black border-transparent hover:border-black'
            }`}
          >
            Section 65B Certificate
          </button>
          <button
            onClick={() => setReportType('FULL_DOSSIER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition border ${
              reportType === 'FULL_DOSSIER' ? 'bg-black text-[#64EE00] border-black' : 'bg-transparent text-black border-transparent hover:border-black'
            }`}
          >
            Full Dossier
          </button>
          <button
            onClick={() => setReportType('CHAIN_REPORT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition border ${
              reportType === 'CHAIN_REPORT' ? 'bg-black text-[#64EE00] border-black' : 'bg-transparent text-black border-transparent hover:border-black'
            }`}
          >
            Custody Ledger
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white border-2 border-black rounded-2xl p-8 md:p-12 space-y-8 text-black max-w-4xl mx-auto shadow-[4px_4px_0px_#000000] print:border-none print:shadow-none print:p-0 font-mono">
        {/* Certificate Header */}
        <div className="text-center space-y-2 border-b-2 border-black pb-6">
          <div className="inline-block px-3 py-1 rounded-lg bg-black text-[#64EE00] font-mono text-xs font-bold border border-black">
            GOVERNMENT OF INDIA &bull; NATIONAL CRIME RECORDS BUREAU (NCRB)
          </div>
          <h2 className="text-2xl font-black text-black tracking-wide uppercase">
            Certificate of Admissibility of Electronic Records
          </h2>
          <p className="text-xs text-black/70">
            Issued under Section 65B(4) of the Indian Evidence Act, 1872 / Bharatiya Sakshya Adhiniyam
          </p>
        </div>

        {/* Section 65B Certificate Body */}
        {reportType === '65B_CERTIFICATE' && (
          <div className="space-y-6 text-sm leading-relaxed">
            <p className="text-black leading-relaxed">
              I, <strong className="underline">{currentUser?.fullName}</strong>, holding the position of{' '}
              <strong className="bg-[#64EE00] px-1 rounded border border-black text-black">{currentUser?.role}</strong> in the{' '}
              <strong>{currentUser?.department}</strong> department, Government of India,
              bearing Official Badge Number <strong className="font-mono bg-black text-white px-1.5 py-0.5 rounded">{currentUser?.badgeNumber}</strong>,
              do hereby solemnly affirm and state on oath as follows:
            </p>

            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border-2 border-black text-xs">
              <div className="font-black uppercase tracking-wider text-black">
                1. Case Particulars:
              </div>
              <div>Case Number: <strong className="font-mono text-black font-bold">{selectedCase?.caseNumber}</strong></div>
              <div>Title: <strong className="text-black">{selectedCase?.title}</strong></div>
              <div>Court Jurisdiction: <strong className="text-black">{selectedCase?.jurisdictionCourt}</strong></div>
              <div>FIR No.: <strong className="font-mono text-black">{selectedCase?.firNumber}</strong></div>
            </div>

            <div className="space-y-3">
              <div className="font-black text-xs uppercase tracking-wider text-black">
                2. Identification of Electronic Records & Cryptographic Checksums:
              </div>
              <p className="text-xs text-black/80">
                The electronic records detailed below were produced by the NCRB Secure Legal DMS server cluster during regular
                operational duties, operating under strict cryptographic verification without software anomaly or intrusion:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono border-2 border-black text-left">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="p-2 border-b-2 border-black">Document ID</th>
                      <th className="p-2 border-b-2 border-black">Filename</th>
                      <th className="p-2 border-b-2 border-black">SHA-256 Digest</th>
                      <th className="p-2 border-b-2 border-black">Integrity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {caseDocs.map((d) => (
                      <tr key={d.id} className="border-b border-black">
                        <td className="p-2 font-bold text-black">{d.documentId}</td>
                        <td className="p-2 text-black font-medium">{d.originalFilename}</td>
                        <td className="p-2 text-[10px] break-all text-black">{d.sha256Hash}</td>
                        <td className="p-2 font-bold text-black">
                          <span className="bg-[#64EE00] text-black px-1.5 py-0.5 rounded border border-black text-[10px]">
                            {d.tamperState}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-xs text-black/80">
              3. I certify that during the period over which the electronic records were captured and stored, the computer systems
              and cryptographic hashes were operating properly, and that nothing occurred to impair the authentic integrity
              of the electronic evidence.
            </p>

            {/* Signature & Seal Block */}
            <div className="pt-8 flex items-end justify-between border-t-2 border-black text-xs">
              <div className="space-y-1">
                <div className="font-mono text-[10px] text-black/60 font-bold">
                  DIGITALLY CERTIFIED UNDER SEC 65B
                </div>
                <div className="font-mono text-black font-bold">
                  HASH: {caseDocs[0]?.sha256Hash.slice(0, 32)}...
                </div>
                <div className="text-[10px] text-black/60 font-bold">Date: {new Date().toLocaleDateString()}</div>
              </div>

              <div className="text-right space-y-2">
                <div className="w-44 border-b-2 border-black pb-1 font-serif text-center font-bold text-black text-base">
                  {currentUser?.fullName}
                </div>
                <div className="text-[11px] text-black/80 font-bold">
                  {currentUser?.role} ({currentUser?.department})<br />
                  Badge: {currentUser?.badgeNumber}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Investigation Dossier */}
        {reportType === 'FULL_DOSSIER' && (
          <div className="space-y-6 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border-2 border-black space-y-2">
              <h3 className="text-sm font-black text-black uppercase">Case Synopsis</h3>
              <p className="text-black/80 leading-relaxed font-sans">{selectedCase?.description}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-black text-black uppercase">Enrolled Exhibits & Seals ({caseEvidence.length})</h3>
              <div className="space-y-2">
                {caseEvidence.map((e) => (
                  <div key={e.id} className="p-3 rounded-xl bg-white border-2 border-black flex justify-between items-center font-mono shadow-[2px_2px_0px_#000000]">
                    <div>
                      <span className="font-bold text-black bg-[#64EE00] px-1.5 py-0.5 rounded border border-black">{e.evidenceId}</span> &bull; {e.type} (Seal: {e.sealNumber})
                    </div>
                    <div className="text-black/70 font-bold">Custodian: {e.currentCustodianName}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chain Report */}
        {reportType === 'CHAIN_REPORT' && (
          <div className="space-y-4 text-xs font-mono">
            <h3 className="text-sm font-black text-black uppercase">Inter-Agency Transfer Ledger</h3>
            <div className="space-y-3">
              {caseEvidence.map((e) => (
                <div key={e.id} className="space-y-2">
                  <div className="font-bold text-black">Exhibit {e.evidenceId} ({e.type}):</div>
                  {(e.chainOfCustody || e.transfers || []).map((t, i) => (
                    <div key={t.id} className="p-2.5 rounded-xl bg-slate-50 border-2 border-black text-[11px]">
                      Handoff #{i + 1}: {t.fromUserName} ({t.fromDepartment}) &rarr; {t.toUserName} ({t.toDepartment}) on {new Date(t.timestamp || t.transferTime || Date.now()).toLocaleDateString()}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
