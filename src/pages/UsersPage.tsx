import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useDms } from '../contexts/DmsContext';
import { Users, CheckCircle2, UserPlus, Lock, Trash2 } from 'lucide-react';
import { DepartmentBadge } from '../components/ui/Badges';
import { AddOfficerModal } from '../components/modals/AddOfficerModal';

export const UsersPage: React.FC = () => {
  const { users, currentUser, updateUserStatus, deleteOfficer } = useDms();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Admin Role Guard
  if (currentUser?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleDeleteConfirm = (userId: string) => {
    deleteOfficer(userId);
    setDeletingUserId(null);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl brutal-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-black text-[#64EE00] border-2 border-black shadow-[2px_2px_0px_#000000]">
              <Users className="w-4 h-4 stroke-[2.5]" />
            </span>
            <h1 className="text-xl font-extrabold text-black font-mono tracking-tight">
              PERSONNEL ROSTER & ACCREDITATION
            </h1>
          </div>
          <p className="text-xs text-black/70 font-mono">
            Cryptographic clearance levels, TOTP MFA key status, and agency authority profiles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {currentUser?.role === 'ADMIN' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#64EE00] text-black font-mono text-xs font-extrabold border-2 border-black flex items-center gap-2 shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition"
            >
              <UserPlus className="w-4 h-4 text-black stroke-[2.5]" />
              <span>PROVISION NEW OFFICER</span>
            </button>
          )}

          <div className="text-xs font-mono bg-black text-white border-2 border-black px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-[2px_2px_0px_#000000]">
            <span className="w-2 h-2 rounded-full bg-[#64EE00]" />
            <span>Active:</span>
            <strong className="text-[#64EE00]">{currentUser?.fullName}</strong>
            <span className="text-white/60">({currentUser?.role})</span>
          </div>
        </div>
      </div>

      {/* High-Density Brutalist Personnel Table */}
      <div className="rounded-2xl brutal-card bg-white border-2 border-black overflow-hidden shadow-[6px_6px_0px_#000000]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white text-[11px] font-mono font-bold uppercase border-b-2 border-black tracking-wider">
                <th className="py-3.5 px-4">OFFICER IDENTIFIER & BADGE</th>
                <th className="py-3.5 px-4">DEPARTMENT CADRE</th>
                <th className="py-3.5 px-4">ENTITLEMENT ROLE</th>
                <th className="py-3.5 px-4">CLEARANCE LEVEL</th>
                <th className="py-3.5 px-4">MFA SECURITY</th>
                <th className="py-3.5 px-4 text-right">ACCREDITATION STATUS & ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/10 text-xs font-mono">
              {users.map((u) => {
                const isCurrentSession = u.id === currentUser?.id;
                const isConfirmingDelete = deletingUserId === u.id;

                return (
                  <tr
                    key={u.id}
                    className={`transition-colors ${
                      isCurrentSession
                        ? 'bg-[#64EE00]/10 hover:bg-[#64EE00]/20 font-semibold'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Officer Name & Badge */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-black border-2 border-black flex items-center justify-center font-bold text-xs text-[#64EE00] shadow-[2px_2px_0px_#000000] flex-shrink-0">
                          {u.fullName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-black flex items-center gap-2">
                            <span>{u.fullName}</span>
                            {isCurrentSession && (
                              <span className="text-[9px] bg-[#64EE00] text-black border border-black px-1.5 py-0.2 rounded font-extrabold shadow-[1px_1px_0px_#000000]">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-black/60 truncate">
                            {u.email} &bull; Badge: <code className="font-bold text-black">{u.badgeNumber}</code>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4">
                      <DepartmentBadge department={u.department} />
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4 font-bold text-black">
                      {u.role.replace('_', ' ')}
                    </td>

                    {/* Clearance Level */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono bg-black text-[#64EE00] px-2 py-0.5 rounded border border-black font-bold text-[11px]">
                        {u.securityClearance}
                      </span>
                    </td>

                    {/* MFA Security */}
                    <td className="py-3.5 px-4">
                      {u.isMfaEnabled || u.mfaEnabled ? (
                        <span className="inline-flex items-center gap-1.5 text-black bg-[#64EE00] px-2 py-0.5 rounded text-[10px] border border-black font-extrabold shadow-[1px_1px_0px_#000000]">
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>ENFORCED (TOTP)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-black/70 border border-black/40 px-2 py-0.5 rounded text-[10px] font-bold">
                          <Lock className="w-3 h-3" />
                          <span>OPTIONAL</span>
                        </span>
                      )}
                    </td>

                    {/* Actions & Status */}
                    <td className="py-3.5 px-4 text-right">
                      {currentUser?.role === 'ADMIN' && !isCurrentSession ? (
                        <div className="flex items-center justify-end gap-2">
                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteConfirm(u.id)}
                                className="px-2.5 py-1 rounded-xl bg-red-600 text-white font-mono text-[11px] font-extrabold border-2 border-black shadow-[2px_2px_0px_#000000] hover:bg-red-700 transition"
                              >
                                CONFIRM PURGE
                              </button>
                              <button
                                onClick={() => setDeletingUserId(null)}
                                className="px-2.5 py-1 rounded-xl bg-slate-200 text-black font-mono text-[11px] font-bold border-2 border-black shadow-[2px_2px_0px_#000000] hover:bg-slate-300 transition"
                              >
                                CANCEL
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => updateUserStatus(u.id, !u.active)}
                                className={`px-3 py-1 rounded-xl font-mono text-xs font-extrabold border-2 border-black shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition ${
                                  u.active
                                    ? 'bg-amber-300 text-black hover:bg-amber-400'
                                    : 'bg-[#64EE00] text-black hover:bg-lime-400'
                                }`}
                              >
                                {u.active ? 'SUSPEND' : 'ACTIVATE'}
                              </button>
                              <button
                                onClick={() => setDeletingUserId(u.id)}
                                title="Purge Officer Account"
                                className="p-1.5 rounded-xl bg-red-500 text-white font-mono text-xs font-extrabold border-2 border-black shadow-[2px_2px_0px_#000000] hover:bg-red-600 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition flex items-center justify-center"
                              >
                                <Trash2 className="w-4 h-4 stroke-[2.5]" />
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <span
                          className={`inline-block text-[10px] font-mono px-2.5 py-1 rounded-lg border-2 border-black font-extrabold ${
                            u.active ? 'bg-slate-100 text-black' : 'bg-red-200 text-red-900'
                          }`}
                        >
                          {u.active ? 'ACCREDITED' : 'SUSPENDED'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Officer Modal */}
      <AddOfficerModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};
