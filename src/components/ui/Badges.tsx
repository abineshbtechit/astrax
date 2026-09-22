import React from 'react';
import { Classification, WorkflowStatus, IntegrityStatus, CaseStatus, CasePriority, AlertSeverity, Role, Department } from '../../types';
import { Lock, ShieldCheck, FileCheck2, Binary, CheckCircle2, ShieldAlert, Clock, Scale } from 'lucide-react';

export const ClassificationBadge: React.FC<{ classification: Classification; size?: 'sm' | 'md' }> = ({
  classification,
  size = 'md',
}) => {
  const isSm = size === 'sm';
  switch (classification) {
    case 'CONFIDENTIAL':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-mono font-bold rounded-md bg-black text-white border-2 border-black ${
            isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <Lock className="w-3 h-3 text-[#64EE00]" />
          CONFIDENTIAL
        </span>
      );
    case 'RESTRICTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-mono font-bold rounded-md bg-white text-black border-2 border-black ${
            isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#64EE00] border border-black" />
          RESTRICTED
        </span>
      );
    case 'PUBLIC_RECORD':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-mono font-bold rounded-md bg-[#64EE00] text-black border-2 border-black ${
            isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <FileCheck2 className="w-3 h-3 text-black" />
          PUBLIC RECORD
        </span>
      );
    default:
      return null;
  }
};

export const WorkflowBadge: React.FC<{ status: WorkflowStatus }> = ({ status }) => {
  const configs: Record<WorkflowStatus, { label: string; bg: string; text: string; border: string }> = {
    DRAFT: { label: 'Draft', bg: 'bg-white', text: 'text-black', border: 'border-black' },
    SUBMITTED: { label: 'Submitted', bg: 'bg-black', text: 'text-white', border: 'border-black' },
    UNDER_REVIEW: { label: 'Under Review', bg: 'bg-white', text: 'text-black font-semibold', border: 'border-black' },
    APPROVED: { label: 'Approved', bg: 'bg-[#64EE00]', text: 'text-black font-bold', border: 'border-black' },
    REJECTED: { label: 'Rejected', bg: 'bg-black', text: 'text-white line-through', border: 'border-black' },
    SIGNED: { label: 'Digitally Signed', bg: 'bg-black', text: 'text-[#64EE00] font-bold', border: 'border-[#64EE00]' },
    FINAL: { label: 'Final Record', bg: 'bg-[#64EE00]', text: 'text-black font-extrabold', border: 'border-black' },
  };

  const c = configs[status] || configs.DRAFT;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono border-2 ${c.bg} ${c.text} ${c.border}`}>
      {c.label}
    </span>
  );
};

export const IntegrityBadge: React.FC<{ status: IntegrityStatus; showIcon?: boolean }> = ({ status, showIcon = true }) => {
  if (status === 'VALID') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-[#64EE00] text-black border-2 border-black">
        {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-black stroke-[2.5]" />}
        SHA-256 VALID
      </span>
    );
  }
  if (status === 'TAMPERED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-black text-white border-2 border-black animate-pulse">
        {showIcon && <ShieldAlert className="w-3.5 h-3.5 text-[#64EE00]" />}
        [TAMPER DETECTED]
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-medium bg-white text-black border-2 border-black">
      {showIcon && <Clock className="w-3.5 h-3.5 text-black" />}
      UNVERIFIED
    </span>
  );
};

export const CaseStatusBadge: React.FC<{ status: CaseStatus }> = ({ status }) => {
  const mapping: Record<CaseStatus, { label: string; cls: string }> = {
    UNDER_INVESTIGATION: { label: 'Under Investigation', cls: 'bg-black text-[#64EE00] border-black font-bold' },
    PENDING_REVIEW: { label: 'Pending Review', cls: 'bg-white text-black border-black font-semibold' },
    CHARGE_SHEET_FILED: { label: 'Charge Sheet Filed', cls: 'bg-black text-white border-black font-bold' },
    IN_COURT: { label: 'In Judicial Trial', cls: 'bg-[#64EE00] text-black border-black font-extrabold' },
    CLOSED: { label: 'Case Closed', cls: 'bg-white text-black/60 border-black/40' },
  };

  const m = mapping[status] || mapping.UNDER_INVESTIGATION;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono border-2 ${m.cls}`}>
      {m.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: CasePriority }> = ({ priority }) => {
  const colors: Record<CasePriority, string> = {
    CRITICAL: 'bg-black text-[#64EE00] border-black font-bold',
    HIGH: 'bg-black text-white border-black font-bold',
    MEDIUM: 'bg-[#64EE00] text-black border-black font-semibold',
    LOW: 'bg-white text-black border-black',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono border-2 ${colors[priority]}`}>
      {priority}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: AlertSeverity }> = ({ severity }) => {
  const colors: Record<AlertSeverity, { label: string; cls: string }> = {
    CRITICAL: { label: 'CRITICAL', cls: 'bg-black text-[#64EE00] border-black font-extrabold' },
    HIGH: { label: 'HIGH', cls: 'bg-black text-white border-black font-bold' },
    MEDIUM: { label: 'MEDIUM', cls: 'bg-[#64EE00] text-black border-black font-bold' },
    LOW: { label: 'LOW', cls: 'bg-white text-black border-black font-medium' },
  };
  const c = colors[severity];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono border-2 ${c.cls}`}>{c.label}</span>;
};

export const DepartmentBadge: React.FC<{ department: Department }> = ({ department }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-white text-black border-2 border-black">
      {department}
    </span>
  );
};
