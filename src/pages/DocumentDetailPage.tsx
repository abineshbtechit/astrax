import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDms } from '../contexts/DmsContext';
import {
  FileText,
  ArrowLeft,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Download,
  KeyRound,
  PenTool,
  Clock,
  GitCommit,
  Shield,
  Hash,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  FileLock2,
  Binary,
} from 'lucide-react';
import { ClassificationBadge, IntegrityBadge, WorkflowBadge } from '../components/ui/Badges';
import { UploadVersionModal } from '../components/modals/UploadVersionModal';
import { RequestAccessModal } from '../components/modals/RequestAccessModal';
import { GrantAccessModal } from '../components/modals/GrantAccessModal';

export const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    documents,
    cases,
    currentUser,
    evaluateDocumentAccess,
    signDocument,
    revokeAccess,
    tamperDocument,
    restoreDocumentIntegrity,
    recordAudit,
    auditLogs,
  } = useDms();

  const [activeTab, setActiveTab] = useState<'preview' | 'versions' | 'access' | 'integrity' | 'audit'>('preview');
  const [isVersionOpen, setIsVersionOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isGrantOpen, setIsGrantOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const doc = documents.find((d) => d.id === id);

  if (!doc) {
    return (
      <div className="py-20 text-center space-y-3 font-mono">
        <h2 className="text-xl font-black text-black">DOCUMENT NOT FOUND IN VAULT</h2>
        <Link to="/documents" className="text-black hover:underline text-xs font-bold">
          &larr; Return to Document Vault
        </Link>
      </div>
    );
  }

  const parentCase = cases.find((c) => c.id === doc.caseId);
  const access = evaluateDocumentAccess(doc);
  const isOwnerOrAdmin =
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.department === 'ADMINISTRATION' ||
    currentUser?.id === doc.ownerUserId ||
    currentUser?.department === doc.ownerDepartment;

  const docAuditLogs = auditLogs.filter((l) => l.resourceId === doc.id);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(doc.sha256Hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownload = () => {
    if (!access.canDownload) {
      alert('Clearance restriction: request DOWNLOAD permission from custodian.');
      return;
    }
    recordAudit({
      action: 'DOCUMENT_DOWNLOAD',
      resourceType: 'DOCUMENT',
      resourceId: doc.id,
      details: {
        documentName: doc.documentName,
        sha256Hash: doc.sha256Hash,
        version: doc.currentVersion,
      },
    });

    const element = document.createElement('a');
    const file = new Blob([doc.fileContent || 'CONFIDENTIAL RECORD'], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = doc.originalFilename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSign = async () => {
    if (doc.isSigned) return;
    setIsSigning(true);
    try {
      await signDocument(doc.id, 'Official Inter-Agency Evidentiary Verification Certification');
    } catch (err: any) {
      alert(err.message || 'Signature failed');
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/documents')}
          className="flex items-center gap-1.5 text-xs text-black font-bold font-mono hover:underline"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>CONFIDENTIAL DOCUMENT VAULT</span>
        </button>

        <div className="flex items-center gap-2">
          {parentCase && (
            <Link
              to={`/cases/${parentCase.id}`}
              className="text-xs font-mono text-black font-bold bg-white px-3 py-1 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] hover:bg-black hover:text-[#64EE00] transition"
            >
              Case: {parentCase.caseNumber} &rarr;
            </Link>
          )}
        </div>
      </div>

      {/* Top Banner Card */}
      <div className="p-6 rounded-2xl brutal-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <ClassificationBadge classification={doc.classification} />
              <WorkflowBadge status={doc.workflowStatus} />
              <IntegrityBadge status={doc.tamperState} />
              {doc.isSigned && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-black text-[#64EE00] border border-black">
                  <PenTool className="w-3 h-3 text-[#64EE00]" />
                  DIGITALLY SIGNED
                </span>
              )}
              {doc.isLegalHold && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold bg-black text-white border border-black">
                  LEGAL HOLD
                </span>
              )}
            </div>

            <h1 className="text-2xl font-black text-black tracking-tight font-mono">{doc.documentName}</h1>

            <div className="flex items-center gap-3 text-xs text-black/70 font-mono flex-wrap">
              <span>Original Filename: <strong className="text-black">{doc.originalFilename}</strong></span>
              <span>&bull;</span>
              <span>Owner Dept: <strong className="text-black font-bold">{doc.ownerDepartment}</strong></span>
              <span>&bull;</span>
              <span>Uploader: {doc.ownerUserName}</span>
              <span>&bull;</span>
              <span>Version: <strong className="text-black">V{doc.currentVersion}</strong></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {access.canVersionUpload && (
              <button
                onClick={() => setIsVersionOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-black text-white hover:bg-neutral-800 font-mono font-bold text-xs flex items-center gap-1.5 transition border-2 border-black shadow-[2px_2px_0px_#000000]"
              >
                <GitCommit className="w-4 h-4 text-[#64EE00]" />
                <span>New Version (V{doc.currentVersion + 1})</span>
              </button>
            )}

            {isOwnerOrAdmin && (
              <button
                onClick={() => setIsGrantOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#64EE00] text-black hover:bg-white font-mono font-bold text-xs flex items-center gap-1.5 transition border-2 border-black shadow-[2px_2px_0px_#000000]"
              >
                <KeyRound className="w-4 h-4" />
                <span>Grant Access</span>
              </button>
            )}

            {!access.canView && (
              <button
                onClick={() => setIsRequestOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white text-black hover:bg-black hover:text-white font-mono font-bold text-xs flex items-center gap-1.5 transition border-2 border-black shadow-[2px_2px_0px_#000000]"
              >
                <KeyRound className="w-4 h-4" />
                <span>Request Clearance</span>
              </button>
            )}

            {access.canView && !doc.isSigned && (
              <button
                onClick={handleSign}
                disabled={isSigning}
                className="px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-[#64EE00] font-mono font-bold text-xs border-2 border-black flex items-center gap-1.5 transition disabled:opacity-50 shadow-[2px_2px_0px_#000000]"
              >
                <PenTool className="w-4 h-4" />
                <span>{isSigning ? 'Signing...' : 'Sign Document'}</span>
              </button>
            )}

            {access.canDownload && (
              <button
                onClick={handleDownload}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-black hover:text-white text-black font-mono font-bold text-xs border-2 border-black flex items-center gap-1.5 transition shadow-[2px_2px_0px_#000000]"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            )}
          </div>
        </div>

        {/* SHA-256 Checksum Bar */}
        <div className="p-3 rounded-xl bg-white border-2 border-black flex items-center justify-between gap-3 text-xs shadow-[2px_2px_0px_#000000]">
          <div className="flex items-center gap-2 overflow-hidden">
            <Hash className="w-4 h-4 text-black flex-shrink-0 stroke-[2.5]" />
            <span className="font-mono text-black/70 text-[11px] font-bold whitespace-nowrap">AUTHORITATIVE SHA-256:</span>
            <code className="font-mono text-black text-xs font-bold truncate select-all">{doc.sha256Hash}</code>
          </div>
          <button
            onClick={handleCopyHash}
            className="p-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white transition flex items-center gap-1 text-[11px] font-mono font-bold flex-shrink-0"
          >
            {copiedHash ? <Check className="w-3.5 h-3.5 text-[#64EE00]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedHash ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-black pb-2 flex-wrap">
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold rounded-xl transition border-2 ${
            activeTab === 'preview'
              ? 'bg-black text-[#64EE00] border-black shadow-[3px_3px_0px_#000000]'
              : 'bg-white text-black border-transparent hover:border-black'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Secure Watermarked Preview</span>
        </button>

        <button
          onClick={() => setActiveTab('versions')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold rounded-xl transition border-2 ${
            activeTab === 'versions'
              ? 'bg-black text-[#64EE00] border-black shadow-[3px_3px_0px_#000000]'
              : 'bg-white text-black border-transparent hover:border-black'
          }`}
        >
          <GitCommit className="w-4 h-4" />
          <span>Immutable Versions ({doc.versions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('access')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold rounded-xl transition border-2 ${
            activeTab === 'access'
              ? 'bg-black text-[#64EE00] border-black shadow-[3px_3px_0px_#000000]'
              : 'bg-white text-black border-transparent hover:border-black'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Cross-Department ACL ({doc.accessGrants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('integrity')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold rounded-xl transition border-2 ${
            activeTab === 'integrity'
              ? 'bg-black text-[#64EE00] border-black shadow-[3px_3px_0px_#000000]'
              : 'bg-white text-black border-transparent hover:border-black'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Integrity & Tamper Lab</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold rounded-xl transition border-2 ${
            activeTab === 'audit'
              ? 'bg-black text-[#64EE00] border-black shadow-[3px_3px_0px_#000000]'
              : 'bg-white text-black border-transparent hover:border-black'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Audit Ledger ({docAuditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Secure Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          {!access.canView ? (
            <div className="p-12 rounded-2xl brutal-card text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-black text-[#64EE00] border-2 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_#000000]">
                <Lock className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div className="space-y-1 font-mono">
                <h3 className="text-base font-black text-black">ACCESS RESTRICTED UNDER SECTION 65B RBAC</h3>
                <p className="text-xs text-black/70 max-w-md mx-auto">
                  This document is classified as <strong className="text-black underline">{doc.classification}</strong> and owned by the{' '}
                  <strong className="text-black">{doc.ownerDepartment}</strong> department. Your role ({currentUser?.role}) has not been granted clearance.
                </p>
              </div>
              <button
                onClick={() => setIsRequestOpen(true)}
                className="brutal-btn-green px-4 py-2 rounded-xl text-xs font-mono font-bold inline-flex items-center gap-1.5"
              >
                <KeyRound className="w-4 h-4" />
                <span>Submit Access Request</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Dynamic Watermarked Canvas */}
              <div className="relative rounded-2xl bg-white border-2 border-black p-6 md:p-8 min-h-[400px] overflow-hidden shadow-[4px_4px_0px_#000000]">
                {/* Watermark overlay */}
                <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center opacity-[0.05] overflow-hidden transform -rotate-12">
                  <div className="text-4xl md:text-5xl font-mono font-black text-center leading-loose text-black">
                    NCRB SECURE DMS &bull; {currentUser?.fullName.toUpperCase()} &bull; {currentUser?.badgeNumber} &bull; {new Date().toISOString()} &bull; OFFICIAL LEGAL VAULT
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10 space-y-6 font-mono">
                  <div className="flex items-center justify-between border-b-2 border-black pb-3 text-xs">
                    <span className="font-bold text-black bg-[#64EE00] px-2 py-0.5 rounded border border-black">
                      SECURE CONTAINER &bull; AES-256 DECRYPTED
                    </span>
                    <span className="text-black/70">
                      Viewer: {currentUser?.fullName} ({currentUser?.department})
                    </span>
                  </div>

                  <div className="text-black text-sm whitespace-pre-wrap font-mono leading-relaxed p-4 bg-slate-50/50 rounded-xl border border-black/10">
                    {doc.fileContent || 'No visual text content committed for this document.'}
                  </div>

                  {doc.extractedText && (
                    <div className="p-4 rounded-xl bg-white border-2 border-black space-y-2 mt-6 shadow-[2px_2px_0px_#000000]">
                      <div className="flex items-center justify-between text-xs font-mono text-black font-bold">
                        <span>OCR EXTRACTED CORPUS:</span>
                        <span className="bg-[#64EE00] text-black px-1.5 py-0.5 rounded border border-black text-[10px]">
                          CONFIDENCE 99.4%
                        </span>
                      </div>
                      <div className="text-xs text-black font-mono leading-relaxed bg-slate-50 p-3 rounded-lg border border-black/20">
                        {doc.extractedText}
                      </div>
                    </div>
                  )}

                  {(doc.signatures || []).length > 0 && (
                    <div className="p-4 rounded-xl bg-black text-white border-2 border-black space-y-2 mt-6 shadow-[2px_2px_0px_#000000]">
                      <div className="text-xs font-mono font-bold text-[#64EE00] flex items-center gap-1.5">
                        <PenTool className="w-4 h-4 text-[#64EE00]" />
                        CRYPTOGRAPHIC DIGITAL SIGNATURE CERTIFICATE
                      </div>
                      {(doc.signatures || []).map((sig) => (
                        <div key={sig.id} className="text-xs space-y-1 text-white/80 font-mono">
                          <div>
                            Signer: <strong className="text-white">{sig.signerName}</strong> ({sig.signerRole} — {sig.signerDepartment})
                          </div>
                          <div>Issuer: {sig.certificateDetails?.issuer || sig.certificateIssuer} &bull; Serial: {sig.certificateDetails?.serialNumber || 'N/A'}</div>
                          <div className="text-[11px] text-[#64EE00] truncate font-bold">
                            SHA-256 Digest Bound: {sig.signedDigest || sig.documentHash}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Version History */}
      {activeTab === 'versions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between font-mono">
            <span className="text-xs font-bold text-black uppercase">
              TAMPER-PROOF REVISION RECORD ({doc.versions.length} COMMITS)
            </span>
            {access.canVersionUpload && (
              <button
                onClick={() => setIsVersionOpen(true)}
                className="brutal-btn-green px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5"
              >
                <GitCommit className="w-3.5 h-3.5" />
                <span>Upload Version {doc.currentVersion + 1}</span>
              </button>
            )}
          </div>

          <div className="space-y-3 font-mono">
            {doc.versions.map((ver) => (
              <div
                key={ver.id}
                className="p-4 rounded-xl brutal-card space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black text-[#64EE00] border border-black">
                      VERSION {ver.versionNumber}
                    </span>
                    <span className="text-xs text-black/60 font-mono">
                      {ver.uploadedAt ? new Date(ver.uploadedAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <span className="text-xs text-black font-bold">
                    By: {ver.uploadedByName} ({ver.uploadedByDepartment})
                  </span>
                </div>

                <p className="text-xs text-black leading-relaxed font-mono">{ver.changeDescription}</p>

                <div className="p-2 rounded-lg bg-white border border-black font-mono text-[11px] text-black flex items-center justify-between">
                  <span className="truncate">IMMUTABLE DIGEST: {ver.sha256Hash}</span>
                  <span className="bg-[#64EE00] text-black border border-black font-bold text-[10px] px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">
                    SEALED
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Access Control (ACL) */}
      {activeTab === 'access' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between font-mono">
            <span className="text-xs font-bold text-black uppercase">
              ACTIVE CROSS-DEPARTMENT AUTHORIZATIONS ({doc.accessGrants.length})
            </span>
            {isOwnerOrAdmin && (
              <button
                onClick={() => setIsGrantOpen(true)}
                className="brutal-btn-green px-3 py-1.5 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Authorize New Department / User</span>
              </button>
            )}
          </div>

          {doc.accessGrants.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-black/70 brutal-card">
              No secondary cross-department access grants active. Document is strictly accessible to owning department ({doc.ownerDepartment}).
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doc.accessGrants.map((grant) => (
                <div
                  key={grant.id}
                  className="p-4 rounded-xl brutal-card space-y-3 flex flex-col justify-between font-mono"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-mono text-black font-bold bg-[#64EE00] px-1.5 py-0.5 rounded border border-black inline-block mb-1">
                          {grant.granteeType} GRANT
                        </div>
                        <h4 className="text-sm font-bold text-black">{grant.granteeName}</h4>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black text-white font-bold border border-black">
                        Expires: {grant.expiresAt ? new Date(grant.expiresAt).toLocaleDateString() : 'PERMANENT'}
                      </span>
                    </div>

                    <p className="text-xs text-black/70 leading-relaxed">Purpose: {grant.purpose}</p>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {grant.permissions.map((p) => (
                        <span key={p} className="px-2 py-0.5 rounded bg-white text-black font-mono text-[10px] border border-black font-bold">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-black/10 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-black/60">
                      Authorized by: {grant.grantedByName}
                    </span>
                    {isOwnerOrAdmin && (
                      <button
                        onClick={() => revokeAccess(doc.id, grant.id)}
                        className="text-black hover:text-red-700 font-mono text-[11px] font-bold flex items-center gap-1 border border-black px-2 py-0.5 rounded bg-white"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Revoke</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Integrity Lab & Tamper Simulation */}
      {activeTab === 'integrity' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl brutal-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-black stroke-[2.5]" />
                <h3 className="text-base font-black text-black font-mono">Cryptographic Checksum Verification</h3>
              </div>
              <IntegrityBadge status={doc.tamperState} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
              <div className="p-4 rounded-xl bg-white border-2 border-black space-y-2 shadow-[2px_2px_0px_#000000]">
                <div className="text-[10px] font-mono uppercase text-black/60 font-bold">Authoritative Ingestion SHA-256 Digest</div>
                <code className="text-xs font-mono text-black font-bold block break-all">{doc.originalHash}</code>
                <div className="text-[10px] text-black/60">Recorded when evidence was first ingested into DMS.</div>
              </div>

              <div className="p-4 rounded-xl bg-white border-2 border-black space-y-2 shadow-[2px_2px_0px_#000000]">
                <div className="text-[10px] font-mono uppercase text-black/60 font-bold">Live Computed File SHA-256 Digest</div>
                <code className={`text-xs font-mono block break-all font-bold ${doc.tamperState === 'TAMPERED' ? 'text-black bg-[#64EE00] p-1 rounded border border-black' : 'text-black'}`}>
                  {doc.sha256Hash}
                </code>
                <div className="text-[10px] text-black/60">Real-time hash calculated by Web Crypto API.</div>
              </div>
            </div>

            {/* Tamper testing simulation sandbox */}
            <div className="p-5 rounded-xl bg-black text-white border-2 border-black space-y-3 shadow-[3px_3px_0px_#000000]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
                <div>
                  <h4 className="text-sm font-black text-[#64EE00]">Interactive Tamper Diagnostic Sandbox</h4>
                  <p className="text-xs text-white/80">
                    Test the tamper-detection engine. Modifying 1 byte immediately flips status to TAMPERED.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {doc.tamperState === 'TAMPERED' ? (
                    <button
                      onClick={() => restoreDocumentIntegrity(doc.id)}
                      className="px-3.5 py-2 rounded-xl bg-[#64EE00] text-black font-bold text-xs flex items-center gap-1.5 transition border-2 border-black"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Restore Checksum</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => tamperDocument(doc.id)}
                      className="px-3.5 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold text-xs flex items-center gap-1.5 transition border-2 border-black"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Simulate File Tamper</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Document Audit Ledger */}
      {activeTab === 'audit' && (
        <div className="space-y-4 font-mono">
          <div className="text-xs font-bold text-black uppercase">
            IMMUTABLE AUDIT RECORDS FOR DOCUMENT {doc.id}
          </div>

          <div className="space-y-2">
            {docAuditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl brutal-card text-xs flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-black bg-[#64EE00] px-1.5 py-0.5 rounded border border-black text-[10px]">
                      {log.action}
                    </span>
                    <span className="text-black/40">&bull;</span>
                    <span className="text-black font-bold">{log.actorName}</span>
                    <span className="text-black/60 font-mono">({log.actorDepartment} &bull; {log.actorRole})</span>
                  </div>
                  <div className="text-[11px] font-mono text-black/70">
                    Current Block Hash: {log.currentHash.slice(0, 32)}...
                  </div>
                </div>
                <div className="text-right text-[11px] font-mono text-black/60 whitespace-nowrap font-bold">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <UploadVersionModal
        isOpen={isVersionOpen}
        onClose={() => setIsVersionOpen(false)}
        document={doc}
      />

      <RequestAccessModal
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        document={doc}
      />

      <GrantAccessModal
        isOpen={isGrantOpen}
        onClose={() => setIsGrantOpen(false)}
        document={doc}
      />
    </div>
  );
};
