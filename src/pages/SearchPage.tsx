import React, { useState } from 'react';
import { useDms } from '../contexts/DmsContext';
import { Search, Scale, FileLock2, Binary, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClassificationBadge, IntegrityBadge } from '../components/ui/Badges';

export const SearchPage: React.FC = () => {
  const { documents, cases, evidence } = useDms();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'DOCS' | 'CASES' | 'EVIDENCE'>('ALL');

  const q = query.toLowerCase().trim();

  const matchedCases = cases.filter(
    (c) =>
      !q ||
      c.caseNumber.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      (c.firNumber && c.firNumber.toLowerCase().includes(q))
  );

  const matchedDocs = documents.filter(
    (d) =>
      !q ||
      d.documentName.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q) ||
      (d.documentId && d.documentId.toLowerCase().includes(q)) ||
      d.originalFilename.toLowerCase().includes(q) ||
      d.sha256Hash.toLowerCase().includes(q) ||
      (d.fileContent && d.fileContent.toLowerCase().includes(q)) ||
      (d.extractedText && d.extractedText.toLowerCase().includes(q))
  );

  const matchedEvidence = evidence.filter(
    (e) =>
      !q ||
      e.evidenceId.toLowerCase().includes(q) ||
      e.type.toLowerCase().includes(q) ||
      (e.sealNumber && e.sealNumber.toLowerCase().includes(q)) ||
      (e.description && e.description.toLowerCase().includes(q))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl brutal-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-black text-[#64EE00] border-2 border-black">
              <Search className="w-4 h-4 stroke-[2.5]" />
            </span>
            <h1 className="text-xl font-extrabold text-black font-mono">
              UNIVERSAL DISCOVERY & SEARCH
            </h1>
          </div>
          <p className="text-xs text-black/70 font-mono">
            Federated index across legal dossiers, Section 65B hash digests, and physical evidence seals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-black text-[#64EE00] border-2 border-black rounded-lg text-xs font-mono font-bold">
            INDEXED: {cases.length + documents.length + evidence.length} RECORDS
          </span>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="p-6 rounded-2xl brutal-card space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-black absolute left-4 top-3.5 stroke-[2.5]" />
          <input
            type="text"
            placeholder="Search by FIR number, case title, SHA-256 hash, or evidence seal..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white border-2 border-black rounded-xl pl-12 pr-4 py-3 text-sm font-mono text-black placeholder-black/40 focus:outline-none shadow-[2px_2px_0px_#000000]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-black font-mono font-bold">SCOPE:</span>
          {(['ALL', 'CASES', 'DOCS', 'EVIDENCE'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs transition border-2 border-black ${
                filterType === type
                  ? 'bg-[#64EE00] text-black font-bold shadow-[2px_2px_0px_#000000]'
                  : 'bg-white text-black hover:bg-slate-50'
              }`}
            >
              {type === 'ALL' && 'All Records'}
              {type === 'CASES' && `Cases (${matchedCases.length})`}
              {type === 'DOCS' && `Documents (${matchedDocs.length})`}
              {type === 'EVIDENCE' && `Evidence (${matchedEvidence.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {/* Cases Section */}
        {(filterType === 'ALL' || filterType === 'CASES') && matchedCases.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-black uppercase flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Matching Investigations ({matchedCases.length})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {matchedCases.map((c) => (
                <Link
                  key={c.id}
                  to={`/cases/${c.id}`}
                  className="p-4 rounded-xl brutal-card hover:bg-white transition block space-y-2 group"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="bg-[#64EE00] text-black px-2 py-0.5 rounded border border-black font-bold">
                      {c.caseNumber}
                    </span>
                    <span className="text-black/60 font-semibold">{c.status}</span>
                  </div>
                  <h4 className="text-sm font-bold text-black group-hover:underline">{c.title}</h4>
                  <p className="text-xs text-black/70 line-clamp-2">{c.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Documents Section */}
        {(filterType === 'ALL' || filterType === 'DOCS') && matchedDocs.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-black uppercase flex items-center gap-1.5">
              <FileLock2 className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Matching Vault Documents ({matchedDocs.length})</span>
            </h3>
            <div className="space-y-2">
              {matchedDocs.map((doc) => (
                <Link
                  key={doc.id}
                  to={`/documents/${doc.id}`}
                  className="p-4 rounded-xl brutal-card hover:bg-white transition block space-y-2 group"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-black text-[#64EE00] px-2 py-0.5 rounded border border-black">
                        {doc.documentId || doc.id}
                      </span>
                      <ClassificationBadge classification={doc.classification} size="sm" />
                      <IntegrityBadge status={doc.tamperState} />
                    </div>
                    <span className="text-xs font-mono text-black/60 font-bold">Case: {doc.caseNumber}</span>
                  </div>
                  <h4 className="text-sm font-bold text-black group-hover:underline">{doc.documentName}</h4>
                  <div className="text-[11px] font-mono text-black/80 bg-slate-50 p-1.5 rounded border border-black/20 truncate">
                    <span className="text-black font-bold mr-1">SHA-256:</span>
                    {doc.sha256Hash}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Evidence Section */}
        {(filterType === 'ALL' || filterType === 'EVIDENCE') && matchedEvidence.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-black uppercase flex items-center gap-1.5">
              <Binary className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Matching Evidence Exhibits ({matchedEvidence.length})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {matchedEvidence.map((ev) => (
                <Link
                  key={ev.id}
                  to={`/evidence/${ev.id}`}
                  className="p-4 rounded-xl brutal-card hover:bg-white transition block space-y-2 group"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="bg-[#64EE00] text-black px-2 py-0.5 rounded border border-black font-bold">
                      {ev.evidenceId}
                    </span>
                    <span className="text-black/70 font-bold">Seal #{ev.sealNumber}</span>
                  </div>
                  <h4 className="text-sm font-bold text-black group-hover:underline">
                    {ev.description || ev.type}
                  </h4>
                  <p className="text-xs text-black/70 line-clamp-2">
                    {ev.type} &bull; Custodian: {ev.currentCustodianName}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
