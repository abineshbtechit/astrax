import React, { useState } from 'react';
import { useDms } from '../contexts/DmsContext';
import {
  Fingerprint,
  ShieldCheck,
  CheckCircle2,
  Clock,
  QrCode,
  Lock,
} from 'lucide-react';
import { MfaSetupModal } from '../components/modals/MfaSetupModal';
import { DepartmentBadge } from '../components/ui/Badges';

export const ProfilePage: React.FC = () => {
  const { currentUser, auditLogs } = useDms();
  const [isMfaOpen, setIsMfaOpen] = useState(false);

  if (!currentUser) return null;

  const myLogs = auditLogs.filter((l) => l.actorId === currentUser.id).slice(0, 8);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-2xl brutal-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-black text-[#64EE00] border-2 border-black">
              <Fingerprint className="w-4 h-4 stroke-[2.5]" />
            </span>
            <h1 className="text-xl font-extrabold text-black font-mono">
              PERSONNEL DOSSIER & SECURITY PROFILE
            </h1>
          </div>
          <p className="text-xs text-black/70 font-mono">
            Cryptographic identity credentials, TOTP authenticator status, and role entitlements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-black text-[#64EE00] border-2 border-black rounded-lg text-xs font-mono font-bold">
            SECURITY CADRE #{currentUser.badgeNumber}
          </span>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="p-6 rounded-2xl brutal-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-black/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-black border-2 border-black text-[#64EE00] flex items-center justify-center font-mono font-bold text-xl shadow-[3px_3px_0px_#000000]">
              {currentUser.fullName.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-black font-mono">{currentUser.fullName}</h2>
                <DepartmentBadge department={currentUser.department} />
              </div>
              <div className="text-xs text-black/70 font-mono">
                Official Badge: <strong className="text-black">{currentUser.badgeNumber}</strong> &bull; {currentUser.email}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-mono text-black/60 block uppercase font-bold">Security Clearance</span>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded bg-[#64EE00] text-black border-2 border-black inline-block mt-1 shadow-[2px_2px_0px_#000000]">
              {currentUser.securityClearance}
            </span>
          </div>
        </div>

        {/* Multi-Factor Authentication Section */}
        <div className="p-5 rounded-xl bg-white border-2 border-black shadow-[3px_3px_0px_#000000] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-black text-[#64EE00] border-2 border-black shadow-[2px_2px_0px_#000000]">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-black font-mono">MULTI-FACTOR AUTHENTICATION (TOTP)</h3>
                <p className="text-xs text-black/70 font-mono">
                  RFC 6238 time-based cryptographic token authorization for sensitive records.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsMfaOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-[#64EE00] font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition border-2 border-black shadow-[2px_2px_0px_#000000]"
            >
              <QrCode className="w-4 h-4 text-[#64EE00]" />
              <span>{currentUser.isMfaEnabled || currentUser.mfaEnabled ? 'Reconfigure Authenticator' : 'Setup Authenticator'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-black font-bold">Status:</span>
            {currentUser.isMfaEnabled || currentUser.mfaEnabled ? (
              <span className="text-black bg-[#64EE00] border border-black px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" /> ACTIVE & ENFORCED
              </span>
            ) : (
              <span className="text-black bg-white border-2 border-black px-2 py-0.5 rounded font-bold">
                PENDING CONFIGURATION
              </span>
            )}
          </div>
        </div>

        {/* Roles & Permissions Table */}
        <div className="space-y-2 text-xs font-mono">
          <h3 className="text-black uppercase font-bold text-[11px] tracking-wider">
            Assigned RBAC Entitlements
          </h3>
          <div className="p-4 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000000] grid grid-cols-1 sm:grid-cols-2 gap-3 text-black">
            <div>&bull; Role: <strong className="text-black bg-slate-100 px-1.5 py-0.5 rounded border border-black">{currentUser.role}</strong></div>
            <div>&bull; Department: <strong className="text-black bg-slate-100 px-1.5 py-0.5 rounded border border-black">{currentUser.department}</strong></div>
            <div>&bull; Clearance Scope: <strong className="text-black bg-[#64EE00] px-1.5 py-0.5 rounded border border-black font-bold">Department Classified</strong></div>
            <div>&bull; PKI Signing Authority: <strong className="text-black bg-[#64EE00] px-1.5 py-0.5 rounded border border-black font-bold">Enabled</strong></div>
          </div>
        </div>

        {/* Recent Activity Logged */}
        <div className="space-y-3 pt-2">
          <h3 className="font-mono text-black uppercase font-bold text-[11px] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-black stroke-[2.5]" />
            <span>Recent Officer Audit Ledger</span>
          </h3>

          <div className="space-y-2">
            {myLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000000] text-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold bg-black text-[#64EE00] px-2 py-0.5 rounded border border-black">
                    {log.action}
                  </span>
                  <span className="text-black font-mono text-[11px] font-semibold">
                    Block #{log.blockIndex}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-black/60 font-semibold">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MfaSetupModal isOpen={isMfaOpen} onClose={() => setIsMfaOpen(false)} />
    </div>
  );
};
