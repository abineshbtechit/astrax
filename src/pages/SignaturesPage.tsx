import React from 'react';
import { useDms } from '../contexts/DmsContext';
import { PenTool, CheckCircle2, Shield, Hash, FileLock2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SignaturesPage: React.FC = () => {
  const { documents } = useDms();

  const signedDocuments = documents.filter((d) => d.signatures && d.signatures.length > 0);

  return (
    <div className="space-y-6 font-mono">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <PenTool className="w-5 h-5 text-black stroke-[2.5]" />
          <h1 className="text-xl font-black text-black tracking-tight uppercase">
            PKI Digital Signatures & Cryptographic Seals
          </h1>
        </div>
        <p className="text-xs text-black/70">
          Electronic signatures bound to SHA-256 document digests complying with the Information Technology Act & Section 65B.
        </p>
      </div>

      <div className="space-y-4">
        {signedDocuments.map((doc) => (
          <div
            key={doc.id}
            className="p-6 rounded-2xl brutal-card space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-black/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-black bg-[#64EE00] px-2 py-0.5 rounded border border-black">
                    {doc.documentId}
                  </span>
                  <span className="text-xs text-black/70">Case: {doc.caseNumber}</span>
                </div>
                <h3 className="text-base font-black text-black mt-1">{doc.documentName}</h3>
              </div>

              <Link
                to={`/documents/${doc.id}`}
                className="px-3.5 py-1.5 rounded-xl bg-black text-[#64EE00] hover:bg-neutral-800 text-xs font-bold border-2 border-black shadow-[2px_2px_0px_#000000] self-start"
              >
                Inspect Document &rarr;
              </Link>
            </div>

            {/* Signature Certificate Cards */}
            <div className="space-y-3">
              {(doc.signatures || (doc.signature ? [doc.signature] : [])).map((sig) => (
                <div
                  key={sig.id}
                  className="p-4 rounded-xl bg-white border-2 border-black space-y-3 shadow-[2px_2px_0px_#000000]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-black text-[#64EE00] flex items-center justify-center border border-black flex-shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-sm font-bold text-black">{sig.signerName}</span>
                      <span className="text-xs text-black/70 font-bold">
                        ({sig.signerRole} &bull; {sig.signerDepartment})
                      </span>
                    </div>

                    <span className="text-xs text-black/60 font-bold">
                      {new Date(sig.signedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-black/80 font-mono">
                    <div className="p-2 rounded bg-slate-50 border border-black/10">
                      <span className="text-black/60 block font-bold text-[10px]">CERTIFICATE AUTHORITY (CA):</span>
                      <span className="text-black font-bold">{sig.certificateDetails?.issuer || sig.certificateIssuer}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-black/10">
                      <span className="text-black/60 block font-bold text-[10px]">CERTIFICATE SERIAL NUMBER:</span>
                      <span className="text-black font-bold">{sig.certificateDetails?.serialNumber || 'N/A'}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-black/10">
                      <span className="text-black/60 block font-bold text-[10px]">KEY USAGE ALGORITHM:</span>
                      <span className="text-black font-bold">{sig.certificateDetails?.algorithm || 'RSA-4096-SHA256'}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-black/10">
                      <span className="text-black/60 block font-bold text-[10px]">VALIDITY PERIOD:</span>
                      <span className="text-black font-bold">
                        {sig.certificateDetails?.validFrom || '2026-01-01'} to {sig.certificateDetails?.validTo || '2028-01-01'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black text-white border border-black text-[11px] font-mono truncate">
                    <span className="text-[#64EE00] block text-[10px] font-bold">BOUND SHA-256 DIGEST:</span>
                    {sig.signedDigest || sig.documentHash}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
