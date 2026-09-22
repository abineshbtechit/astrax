import React, { useState } from 'react';
import { useDms } from '../contexts/DmsContext';
import {
  KeyRound,
  CheckCircle2,
  XCircle,
  FileLock2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AccessRequestsPage: React.FC = () => {
  const { accessRequests, approveAccessRequest, rejectAccessRequest, documents } = useDms();
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = accessRequests.filter((req) => {
    return statusFilter === 'ALL' || req.status === statusFilter;
  });

  const pendingCount = accessRequests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <KeyRound className="w-5 h-5 text-black stroke-[2.5]" />
            <h1 className="text-xl font-black text-black tracking-tight uppercase">
              Cross-Department Access Requests
            </h1>
          </div>
          <p className="text-xs text-black/70">
            Authorization workflow for accessing confidential case documents across inter-agency boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-black font-bold">FILTER:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border-2 border-black rounded-xl px-3 py-1.5 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
          >
            <option value="ALL">All Requests ({accessRequests.length})</option>
            <option value="PENDING">Pending Clearance ({pendingCount})</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-xs font-bold text-black/60 brutal-card">
            No access requests matching current filter.
          </div>
        ) : (
          filtered.map((req) => {
            return (
              <div
                key={req.id}
                className="p-5 rounded-2xl brutal-card space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-black text-black bg-[#64EE00] px-2 py-0.5 rounded border border-black">
                        {req.requestingDepartment} &rarr; {req.ownerDepartment}
                      </span>
                      <span className="text-black/40">&bull;</span>
                      <span className="text-xs text-black/60 font-mono font-bold">
                        {new Date(req.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-black mt-1">
                      {req.requestingUserName}{' '}
                      <span className="text-xs text-black/70 font-normal">
                        ({req.requestingRole}) is requesting clearance for:
                      </span>
                    </h3>

                    <Link
                      to={`/documents/${req.documentId}`}
                      className="inline-flex items-center gap-1.5 text-sm font-black text-black hover:underline mt-1"
                    >
                      <FileLock2 className="w-4 h-4 stroke-[2.5]" />
                      <span>{req.documentName}</span>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    <span
                      className={`text-[10px] font-mono px-2.5 py-1 rounded border-2 border-black font-black ${
                        req.status === 'PENDING'
                          ? 'bg-white text-black'
                          : req.status === 'APPROVED'
                          ? 'bg-[#64EE00] text-black'
                          : 'bg-black text-white'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>

                {/* Stated reason */}
                <div className="p-3 rounded-xl bg-slate-50 border border-black/20 space-y-1 text-xs">
                  <div className="text-[10px] font-mono text-black/60 uppercase font-bold">Stated Evidentiary Rationale</div>
                  <p className="text-black/80 leading-relaxed font-sans">{req.reason}</p>
                </div>

                {/* Permissions requested & action buttons */}
                <div className="pt-2 border-t-2 border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-black/60 font-mono text-[11px] font-bold">REQUESTED:</span>
                    {req.requestedPermissions.map((p) => (
                      <span key={p} className="px-2 py-0.5 rounded bg-white text-black font-mono text-[10px] border border-black font-bold shadow-[1px_1px_0px_#000000]">
                        {p}
                      </span>
                    ))}
                  </div>

                  {req.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => rejectAccessRequest(req.id)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-black hover:text-white text-black font-mono text-xs font-bold border-2 border-black flex items-center gap-1 transition shadow-[2px_2px_0px_#000000]"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Deny Request</span>
                      </button>
                      <button
                        onClick={() => approveAccessRequest(req.id)}
                        className="brutal-btn-green px-4 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Authorize & Grant</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
