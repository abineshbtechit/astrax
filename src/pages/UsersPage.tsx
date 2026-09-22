import React from 'react';
import { useDms } from '../contexts/DmsContext';
import { Users, Fingerprint, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { DepartmentBadge } from '../components/ui/Badges';

export const UsersPage: React.FC = () => {
  const { users, currentUser, switchUser } = useDms();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl brutal-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-black text-[#64EE00] border-2 border-black">
              <Users className="w-4 h-4 stroke-[2.5]" />
            </span>
            <h1 className="text-xl font-extrabold text-black font-mono">
              PERSONNEL ROSTER & ROLES
            </h1>
          </div>
          <p className="text-xs text-black/70 font-mono">
            Cryptographic clearance levels, MFA keys, and agency authority profiles.
          </p>
        </div>

        <div className="text-xs font-mono bg-black text-white border-2 border-black px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-[2px_2px_0px_#000000]">
          <span className="w-2 h-2 rounded-full bg-[#64EE00]" />
          <span>Active:</span>
          <strong className="text-[#64EE00]">{currentUser?.fullName}</strong>
          <span className="text-white/60">({currentUser?.role})</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          const isActive = u.id === currentUser?.id;
          return (
            <div
              key={u.id}
              className={`p-5 rounded-2xl brutal-card transition space-y-4 flex flex-col justify-between ${
                isActive
                  ? 'border-2 border-black bg-white ring-2 ring-[#64EE00] shadow-[5px_5px_0px_#000000]'
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-black border-2 border-black flex items-center justify-center font-bold text-xs text-[#64EE00] font-mono shadow-[2px_2px_0px_#000000]">
                      {u.fullName.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-black font-mono">{u.fullName}</h3>
                      <div className="text-xs text-black/60 font-mono">Badge: {u.badgeNumber}</div>
                    </div>
                  </div>

                  {isActive && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#64EE00] text-black border-2 border-black font-extrabold shadow-[1px_1px_0px_#000000]">
                      CURRENT
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-black/70">
                    <span className="font-semibold">Department:</span>
                    <DepartmentBadge department={u.department} />
                  </div>
                  <div className="flex items-center justify-between text-black/70">
                    <span className="font-semibold">Role:</span>
                    <span className="font-bold text-black">{u.role}</span>
                  </div>
                  <div className="flex items-center justify-between text-black/70">
                    <span className="font-semibold">Clearance:</span>
                    <span className="font-mono bg-black text-[#64EE00] px-1.5 py-0.5 rounded border border-black font-bold text-[11px]">
                      {u.securityClearance}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-black/70">
                    <span className="font-semibold">MFA Key:</span>
                    <span className="font-bold text-black flex items-center gap-1">
                      {u.isMfaEnabled || u.mfaEnabled ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                          <span className="text-black bg-[#64EE00] px-1.5 py-0.5 rounded text-[10px] border border-black">
                            ENFORCED
                          </span>
                        </>
                      ) : (
                        <span className="text-black/60 border border-black px-1.5 py-0.5 rounded text-[10px]">
                          OPTIONAL
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-black/10 flex items-center justify-between">
                <span className="text-[11px] font-mono text-black/60 truncate max-w-[140px]">
                  {u.email}
                </span>

                {!isActive && (
                  <button
                    onClick={() => switchUser(u.id)}
                    className="px-3 py-1 rounded-lg bg-black hover:bg-neutral-800 text-[#64EE00] font-mono text-xs font-bold border-2 border-black flex items-center gap-1 transition shadow-[2px_2px_0px_#000000]"
                  >
                    <span>Switch</span>
                    <ArrowRight className="w-3 h-3 text-[#64EE00]" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
