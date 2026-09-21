import React, { useState } from 'react';
import { X, ShieldAlert, ShieldCheck, Lock, FileText, CheckCircle2, AlertTriangle, Download, Eye } from 'lucide-react';

interface ModalWrapperProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({ title, onClose, children, maxWidth = '680px' }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <ShieldCheck size={20} color="#60a5fa" />
            {title}
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// 1. New Case Modal
export const NewCaseModal: React.FC<{ onClose: () => void; onCreate: (c: any) => void }> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [crimeType, setCrimeType] = useState('Cyber Crime / IT Act Sec 66D');
  const [priority, setPriority] = useState('HIGH');
  const [jurisdiction, setJurisdiction] = useState('Zone-1 Special Squad, CCB');
  const [synopsis, setSynopsis] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCase = {
      id: `CASE-2026-00${Math.floor(Math.random() * 90 + 10)}`,
      no: `CASE-2026-00${Math.floor(Math.random() * 90 + 10)}`,
      title: title || 'New Registered Investigation',
      type: crimeType,
      department: 'Central Crime Branch (CCB)',
      officer: 'DSP Sunita Rao',
      priority,
      status: 'UNDER INVESTIGATION',
      updated: 'Just now',
      docs: 0,
      evidence: 0,
      jurisdiction,
      synopsis,
      riskScore: 'LOW RISK (PROCEDURAL COMPLIANCE: 100%)',
      legalHoldActive: false
    };
    onCreate(newCase);
    onClose();
  };

  return (
    <ModalWrapper title="Register New Investigation Docket" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Docket Title / Incident Summary</label>
            <input
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Cross-Border Unauthorized Data Exfiltration"
              required
            />
          </div>
          <div className="grid-two" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label className="form-label">Crime Classification</label>
              <select className="form-select" value={crimeType} onChange={(e) => setCrimeType(e.target.value)}>
                <option>Cyber Crime / IT Act Sec 66D</option>
                <option>Financial Crime / Grand Larceny</option>
                <option>NDPS Act / Contraband Trafficking</option>
                <option>Human Trafficking / Special IPC</option>
                <option>Prevention of Corruption Act</option>
                <option>Homicide / Forensic Investigation</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Investigation Priority</label>
              <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="CRITICAL">CRITICAL (Top Priority)</option>
                <option value="HIGH">HIGH (Urgent Dispatch)</option>
                <option value="MEDIUM">MEDIUM (Standard Procedure)</option>
                <option value="LOW">LOW (Monitoring Scope)</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Police Jurisdiction / Station</label>
            <input
              className="form-input"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Incident Synopsis & First Responder Findings</label>
            <textarea
              className="form-textarea"
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Summarize initial findings, involved entities, and statutory provisions..."
              rows={3}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Initialize Case Docket</button>
        </div>
      </form>
    </ModalWrapper>
  );
};

// 2. Document Upload Modal
export const DocumentUploadModal: React.FC<{ onClose: () => void; onUpload: (d: any) => void; casesList: any[] }> = ({
  onClose,
  onUpload,
  casesList
}) => {
  const [caseId, setCaseId] = useState(casesList[0]?.id || 'CASE-2026-001');
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('FIR');
  const [classification, setClassification] = useState('CONFIDENTIAL');
  const [fileName, setFileName] = useState('');
  const [hashing, setHashing] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (!docName) setDocName(file.name.replace(/\.[^/.]+$/, ''));
      setHashing(true);
      setTimeout(() => setHashing(false), 600);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc = {
      id: `DOC-2026-00${Math.floor(Math.random() * 90 + 10)}`,
      name: docName || fileName || 'Uploaded Document',
      case: caseId,
      type: docType,
      classification,
      owner: 'Central Crime Branch',
      uploader: 'DSP Sunita Rao',
      version: 'v1.0',
      workflow: 'SUBMITTED',
      integrity: 'VALID',
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      cipher: 'AES-256-GCM / 256-bit Key',
      size: '2.4 MB',
      updated: 'Just now',
      ocrText: `DOCUMENT CONTENT PREVIEW:
Name: ${docName}
Binding Case: ${caseId}
Classification: ${classification}
Timestamp: ${new Date().toLocaleString()}
Validated under Section 65B of Indian Evidence Act.`
    };
    onUpload(newDoc);
    onClose();
  };

  return (
    <ModalWrapper title="Secure Document Ingress (SHA-256 Encrypted)" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Binding Investigation Docket</label>
            <select className="form-select" value={caseId} onChange={(e) => setCaseId(e.target.value)}>
              {casesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.no} — {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Official Document Name</label>
            <input
              className="form-input"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g., Forensic Lab Spectrometry Annexure"
              required
            />
          </div>
          <div className="grid-two" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label className="form-label">Evidentiary Document Type</label>
              <select className="form-select" value={docType} onChange={(e) => setDocType(e.target.value)}>
                <option value="FIR">FIR (First Information Report)</option>
                <option value="FORENSIC_REPORT">FORENSIC REPORT</option>
                <option value="WITNESS_STATEMENT">WITNESS STATEMENT</option>
                <option value="CHARGE_SHEET">CHARGE SHEET (Sec 173 CrPC)</option>
                <option value="INVESTIGATION_REPORT">INVESTIGATION REPORT</option>
                <option value="EVIDENCE">DIGITAL EVIDENCE MANIFEST</option>
                <option value="LEGAL_NOTICE">LEGAL NOTICE / COURT ORDER</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Security Classification</label>
              <select className="form-select" value={classification} onChange={(e) => setClassification(e.target.value)}>
                <option value="CONFIDENTIAL">CONFIDENTIAL (Law Enforcement Only)</option>
                <option value="RESTRICTED">RESTRICTED (Judicial / Counsel Access)</option>
                <option value="PUBLIC_RECORD">PUBLIC RECORD (Gazetted / Filed)</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Document Attachment</label>
            <input className="form-input" type="file" onChange={handleFile} required />
            {hashing && (
              <div style={{ fontSize: '11px', color: '#1d4ed8', marginTop: '4px' }}>
                Calculating SHA-256 digest and binding cryptographic hash...
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Ingress Document to Vault</button>
        </div>
      </form>
    </ModalWrapper>
  );
};

// 3. PII Redaction Modal
export const PiiRedactionModal: React.FC<{ doc: any; onClose: () => void }> = ({ doc, onClose }) => {
  const [maskAadhaar, setMaskAadhaar] = useState(true);
  const [maskPhone, setMaskPhone] = useState(true);
  const [maskAddress, setMaskAddress] = useState(true);
  const [applied, setApplied] = useState(false);

  let sanitized = doc.ocrText || 'No text extracted for this record.';
  if (maskAadhaar) {
    sanitized = sanitized.replace(/\b\d{4}-\d{4}-\d{4}\b/g, 'XXXX-XXXX-8812 [AADHAAR MASKED]');
  }
  if (maskPhone) {
    sanitized = sanitized.replace(/\+91\s\d{5}\s\d{5}/g, '+91 98401 XXXXX [PHONE MASKED]');
  }
  if (maskAddress) {
    sanitized = sanitized.replace(/No\.\s14,\sAnna\sNagar\s2nd\sAvenue,\sChennai\s600040\./g, '[RESIDENTIAL ADDRESS REDACTED UNDER COURT PRIVACY ORDER]');
  }

  return (
    <ModalWrapper title={`Automated PII Redaction Engine — ${doc.name}`} onClose={onClose} maxWidth="820px">
      <div className="modal-body">
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 16px', borderRadius: '8px', fontSize: '12px', color: '#1e40af' }}>
          <b>Statutory Data Protection Module:</b> Automatically censors sensitive Personally Identifiable Information (PII) before generating court-permitted discovery copies under Section 207 Cr.P.C.
        </div>
        <div>
          <h4 style={{ fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px', color: '#07192f' }}>Active Redaction Filters</h4>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" checked={maskAadhaar} onChange={(e) => setMaskAadhaar(e.target.checked)} />
              Mask 12-Digit UIDAI Aadhaar Numbers
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" checked={maskPhone} onChange={(e) => setMaskPhone(e.target.checked)} />
              Mask Mobile Phone Numbers
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" checked={maskAddress} onChange={(e) => setMaskAddress(e.target.checked)} />
              Mask Witness Residential Addresses
            </label>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: '12px', textTransform: 'uppercase', marginBottom: '6px', color: '#07192f' }}>Redacted Document Output View</h4>
          <div className="watermark-wrapper" style={{ minHeight: '260px' }}>
            <div className="watermark-overlay">REDACTED COURT COPY • SEC 207 CrPC</div>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)' }}>{sanitized}</pre>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>Close</button>
        <button
          className="btn btn-primary"
          onClick={() => {
            setApplied(true);
            setTimeout(() => {
              alert('Redacted court copy successfully generated and cryptographically signed.');
              onClose();
            }, 500);
          }}
        >
          <Download size={15} />
          {applied ? 'Exporting...' : 'Export Redacted Section 207 Discovery Copy'}
        </button>
      </div>
    </ModalWrapper>
  );
};

// 4. Custody Transfer Modal
export const CustodyTransferModal: React.FC<{ evidenceItem: any; onClose: () => void; onTransferred: () => void }> = ({
  evidenceItem,
  onClose,
  onTransferred
}) => {
  const [toUser, setToUser] = useState('Dr. Priya Nambiar (CFSL)');
  const [reason, setReason] = useState('Physical Bit-Stream Imaging and Forensic Hardware Extraction');
  const [location, setLocation] = useState('Central Forensic Science Laboratory, Chennai');
  const [condition, setCondition] = useState('Seal intact, zero physical tampering');
  const [sealIntact, setSealIntact] = useState(true);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sealIntact) {
      alert('WARNING: Custody cannot be transferred if seal integrity is compromised.');
      return;
    }
    alert(`Custody of exhibit ${evidenceItem.id} officially transferred to ${toUser}. Transfer logged to immutable audit ledger.`);
    onTransferred();
    onClose();
  };

  return (
    <ModalWrapper title={`Evidence Custody Transfer Handoff — ${evidenceItem.id}`} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="modal-body">
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', color: '#92400e' }}>
            <b>Legal Chain of Custody Protocol:</b> Every custody transfer requires seal verification and identity verification in accordance with Section 65B Evidence Act.
          </div>
          <div className="form-group">
            <label className="form-label">Exhibit Identification</label>
            <input className="form-input" value={`${evidenceItem.id} (${evidenceItem.name})`} readOnly />
          </div>
          <div className="form-group">
            <label className="form-label">Current Custodian</label>
            <input className="form-input" value={evidenceItem.custodian} readOnly />
          </div>
          <div className="form-group">
            <label className="form-label">Receiving Custodian</label>
            <select className="form-select" value={toUser} onChange={(e) => setToUser(e.target.value)}>
              <option>Dr. Priya Nambiar (CFSL Forensic Scientist)</option>
              <option>DSP Sunita Rao (Lead Investigating Officer)</option>
              <option>Inspector K. Arumugam (Station House Officer)</option>
              <option>Registrar Justice Meenakshi (Sessions Court Evidence Vault)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Transfer Reason / Judicial Purpose</label>
            <input className="form-input" value={reason} onChange={(e) => setReason(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Receiving Facility / Location</label>
            <input className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Physical & Seal Condition</label>
            <input className="form-input" value={condition} onChange={(e) => setCondition(e.target.value)} required />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#07192f', cursor: 'pointer' }}>
            <input type="checkbox" checked={sealIntact} onChange={(e) => setSealIntact(e.target.checked)} />
            I verify that Seal #{evidenceItem.seal} is unbroken and tamper tags are intact.
          </label>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Sign & Execute Custody Transfer</button>
        </div>
      </form>
    </ModalWrapper>
  );
};

// 5. Tamper Attack Simulator Modal
export const TamperSimulatorModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selectedDoc, setSelectedDoc] = useState('DOC-2026-001 (FIR-92/2026)');
  const [simulated, setSimulated] = useState(false);

  const originalHash = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08';
  const tamperedHash = '3a152d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f99ff';

  const runAttack = () => {
    setSimulated(true);
  };

  return (
    <ModalWrapper title="Cryptographic Tamper Attack Simulator" onClose={onClose} maxWidth="740px">
      <div className="modal-body">
        <p style={{ fontSize: '13px', color: '#475569' }}>
          This simulator demonstrates how the AstraX cryptographic verification engine instantly flags any bit-level modification or unauthorized alteration of evidentiary files.
        </p>
        <div className="form-group">
          <label className="form-label">Target Evidentiary Document</label>
          <select className="form-select" value={selectedDoc} onChange={(e) => setSelectedDoc(e.target.value)}>
            <option>DOC-2026-001 (FIR-92/2026)</option>
            <option>DOC-2026-002 (Forensic Hardware Extraction)</option>
            <option>DOC-2026-003 (Confidential Witness Statement)</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '14px', borderRadius: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a' }}>AUTHORITATIVE MASTER HASH (LEDGER)</span>
            <div className="mono-hash" style={{ marginTop: '6px', maxWidth: '100%', wordBreak: 'break-all', whiteSpace: 'normal' }}>
              {originalHash}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
              Anchored at ingestion • PKI Signed by DSP Sunita Rao
            </div>
          </div>

          <div style={{ background: simulated ? '#fef2f2' : '#f8fafc', border: simulated ? '1px solid #f87171' : '1px solid #cbd5e1', padding: '14px', borderRadius: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: simulated ? '#dc2626' : '#64748b' }}>
              {simulated ? 'RE-COMPUTED LIVE HASH (ALTERED)' : 'RE-COMPUTED LIVE HASH'}
            </span>
            <div className="mono-hash" style={{ marginTop: '6px', maxWidth: '100%', wordBreak: 'break-all', whiteSpace: 'normal', color: simulated ? '#dc2626' : 'inherit' }}>
              {simulated ? tamperedHash : originalHash}
            </div>
            <div style={{ fontSize: '11px', color: simulated ? '#dc2626' : '#64748b', marginTop: '6px', fontWeight: simulated ? 700 : 400 }}>
              {simulated ? 'BIT-FLIP INJECTED: 1 byte altered at offset 0x48A0' : 'Matching authoritative digest'}
            </div>
          </div>
        </div>

        {simulated && (
          <div style={{ background: '#fee2e2', border: '2px solid #ef4444', padding: '16px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <AlertTriangle size={24} color="#dc2626" />
            <div>
              <h4 style={{ color: '#b91c1c', fontSize: '14px', fontWeight: 800 }}>
                CRITICAL INTEGRITY ALARM: TAMPER DETECTED!
              </h4>
              <p style={{ fontSize: '12px', color: '#7f1d1d', marginTop: '4px' }}>
                The re-calculated SHA-256 digest fails to match the authoritative cryptographic baseline.
                Document automatically locked. Security Incident #ALT-2026-TAMPER logged with actor IP and node timestamp.
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>Close</button>
        {!simulated ? (
          <button className="btn btn-danger" onClick={runAttack}>
            <AlertTriangle size={15} />
            Simulate 1-Bit File Alteration Attack
          </button>
        ) : (
          <button className="btn btn-success" onClick={() => setSimulated(false)}>
            <CheckCircle2 size={15} />
            Restore Certified Original File
          </button>
        )}
      </div>
    </ModalWrapper>
  );
};

// 6. Section 65B Certificate Modal
export const Section65BCertificateModal: React.FC<{ doc: any; onClose: () => void }> = ({ doc, onClose }) => {
  return (
    <ModalWrapper title={`Section 65B Electronic Evidence Certificate — ${doc.name}`} onClose={onClose} maxWidth="820px">
      <div className="modal-body">
        <div style={{ border: '2px solid #07192f', padding: '24px', background: '#fff', borderRadius: '6px' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #07192f', paddingBottom: '12px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', color: '#07192f' }}>
              CERTIFICATE UNDER SECTION 65B OF THE INDIAN EVIDENCE ACT, 1872
            </h2>
            <p style={{ fontSize: '11px', color: '#475569' }}>
              (Regarding Electronic Records Output and Cryptographic Authenticity)
            </p>
          </div>
          <p style={{ fontSize: '12px', lineHeight: 1.6, marginBottom: '14px' }}>
            I, <b>Dr. Rajesh Sharma</b>, in my capacity as Systems Administrator and Evidence Custodian at the National Crime Records Bureau Digital Repository, do hereby solemnly declare and certify:
          </p>
          <ol style={{ fontSize: '12px', lineHeight: 1.6, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>The electronic record titled <b>{doc.name}</b> (Identifier: <b>{doc.id}</b>) was produced by the computer systems under my lawful control and operational custody.</li>
            <li>Throughout the period of handling, the computer systems and cryptographic storage clusters were operating properly and without any material malfunction.</li>
            <li>The authoritative SHA-256 cryptographic digest of the file is: <br /><span className="mono-hash" style={{ marginTop: '4px' }}>{doc.sha256}</span></li>
            <li>The file payload is encrypted using <b>{doc.cipher || 'AES-256-GCM'}</b>, ensuring zero unauthorized interception or alteration in transit or at rest.</li>
          </ol>
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #cbd5e1', paddingTop: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Date & Time: {new Date().toLocaleString()}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Jurisdiction: Chennai High Court Cyber Bench</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#07192f' }}>Dr. Rajesh Sharma</div>
              <div style={{ fontSize: '11px', color: '#475569' }}>Certified Digital Custodian (NCRB-ADM-001)</div>
              <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>[DIGITALLY SIGNED & HASH VERIFIED]</div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>Close</button>
        <button
          className="btn btn-primary"
          onClick={() => {
            window.print();
          }}
        >
          <Download size={15} />
          Print / Export Certified Section 65B PDF
        </button>
      </div>
    </ModalWrapper>
  );
};
