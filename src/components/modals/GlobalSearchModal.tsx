import React, { useState, useEffect } from 'react';
import { useDms } from '../../contexts/DmsContext';
import { Search, X, Briefcase, FileText, Boxes, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ClassificationBadge } from '../ui/Badges';

export const GlobalSearchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { cases, documents, evidence, evaluateDocumentAccess } = useDms();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredCases = q
    ? cases.filter(
        (c) =>
          c.caseNumber.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.crimeType.toLowerCase().includes(q)
      )
    : [];

  const filteredDocs = q
    ? documents.filter(
        (d) =>
          d.documentName.toLowerCase().includes(q) ||
          d.sha256Hash.toLowerCase().includes(q) ||
          d.caseNumber.toLowerCase().includes(q) ||
          (d.extractedText && d.extractedText.toLowerCase().includes(q))
      )
    : [];

  const filteredEvidence = q
    ? evidence.filter(
        (e) =>
          e.evidenceId.toLowerCase().includes(q) ||
          e.type.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.sealNumber.toLowerCase().includes(q)
      )
    : [];

  const handleSelectCase = (id: string) => {
    navigate(`/cases/${id}`);
    onClose();
  };

  const handleSelectDoc = (id: string) => {
    navigate(`/documents/${id}`);
    onClose();
  };

  const handleSelectEvidence = (id: string) => {
    navigate(`/evidence/${id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm p-4 font-mono">
      <div className="bg-[#F2F4F7] border-2 border-black rounded-2xl w-full max-w-2xl shadow-[8px_8px_0px_#000000] overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b-2 border-black flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-black stroke-[2.5]" />
          <input
            autoFocus
            type="text"
            placeholder="Type case number, document, hash, OCR keyword, or seal..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-0 text-black placeholder-black/40 focus:outline-none text-sm font-bold"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded-lg border border-black hover:bg-black hover:text-white text-black transition">
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-xs font-mono font-black bg-[#64EE00] text-black rounded border border-black shadow-[1px_1px_0px_#000000]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!q ? (
            <div className="py-12 text-center space-y-2">
              <div className="text-xs font-mono font-black uppercase tracking-wider text-black">
                SECURITY-CLEARANCE GLOBAL DISCOVERY
              </div>
              <p className="text-sm text-black/70 max-w-md mx-auto font-bold">
                Search across encrypted document stores, investigation dossiers, physical evidence custody logs, and OCR extracted texts.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => setQuery('Silverline')}
                  className="text-[11px] font-mono px-2 py-1 rounded-lg bg-white text-black font-bold border-2 border-black shadow-[2px_2px_0px_#000000]"
                >
                  Try: "Silverline"
                </button>
                <button
                  onClick={() => setQuery('FIR')}
                  className="text-[11px] font-mono px-2 py-1 rounded-lg bg-white text-black font-bold border-2 border-black shadow-[2px_2px_0px_#000000]"
                >
                  Try: "FIR"
                </button>
                <button
                  onClick={() => setQuery('SSD')}
                  className="text-[11px] font-mono px-2 py-1 rounded-lg bg-white text-black font-bold border-2 border-black shadow-[2px_2px_0px_#000000]"
                >
                  Try: "SSD"
                </button>
              </div>
            </div>
          ) : filteredCases.length === 0 && filteredDocs.length === 0 && filteredEvidence.length === 0 ? (
            <div className="py-12 text-center text-black/60 font-bold text-sm">
              No matching records found for "{query}".
            </div>
          ) : (
            <>
              {/* Cases */}
              {filteredCases.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono font-black text-black uppercase tracking-wider px-2">
                    INVESTIGATIONS ({filteredCases.length})
                  </div>
                  {filteredCases.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCase(c.id)}
                      className="p-3 rounded-xl bg-white hover:bg-slate-100 border-2 border-black cursor-pointer flex items-center justify-between transition shadow-[2px_2px_0px_#000000]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#64EE00] text-black border border-black">
                          <Briefcase className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div>
                          <div className="text-xs font-mono text-black font-black">{c.caseNumber}</div>
                          <div className="text-sm font-bold text-black">{c.title}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
                    </div>
                  ))}
                </div>
              )}

              {/* Documents */}
              {filteredDocs.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono font-black text-black uppercase tracking-wider px-2">
                    CONFIDENTIAL DOCUMENTS ({filteredDocs.length})
                  </div>
                  {filteredDocs.map((d) => {
                    const access = evaluateDocumentAccess(d);
                    return (
                      <div
                        key={d.id}
                        onClick={() => handleSelectDoc(d.id)}
                        className="p-3 rounded-xl bg-white hover:bg-slate-100 border-2 border-black cursor-pointer flex items-center justify-between transition shadow-[2px_2px_0px_#000000]"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg border border-black ${
                              access.canView
                                ? 'bg-[#64EE00] text-black'
                                : 'bg-black text-white'
                            }`}
                          >
                            {access.canView ? <FileText className="w-4 h-4 stroke-[2.5]" /> : <Lock className="w-4 h-4 stroke-[2.5]" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-black">{d.documentName}</span>
                              <ClassificationBadge classification={d.classification} size="sm" />
                            </div>
                            <div className="text-[11px] font-mono text-black/70 font-bold">
                              {d.caseNumber} &bull; Owner: {d.ownerDepartment} &bull; {access.canView ? 'ACCESS GRANTED' : 'LOCKED - REQUIRES CLEARANCE'}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Evidence */}
              {filteredEvidence.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono font-black text-black uppercase tracking-wider px-2">
                    PHYSICAL & DIGITAL EVIDENCE ({filteredEvidence.length})
                  </div>
                  {filteredEvidence.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => handleSelectEvidence(e.id)}
                      className="p-3 rounded-xl bg-white hover:bg-slate-100 border-2 border-black cursor-pointer flex items-center justify-between transition shadow-[2px_2px_0px_#000000]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-black text-[#64EE00] border border-black">
                          <Boxes className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div>
                          <div className="text-xs font-mono text-black font-black">
                            {e.evidenceId} &bull; Seal: {e.sealNumber}
                          </div>
                          <div className="text-sm font-bold text-black">{e.type}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
