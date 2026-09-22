import React, { useState } from 'react';
import { useDms } from '../../contexts/DmsContext';
import { X, UserPlus, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Department, Role } from '../../types';

export const AddOfficerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { addOfficer } = useDms();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [department, setDepartment] = useState<Department>('POLICE');
  const [role, setRole] = useState<Role>('POLICE_OFFICER');
  const [securityClearance, setSecurityClearance] = useState<'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'TOP_SECRET'>('LEVEL_2');
  const [password, setPassword] = useState('officer2026');
  const [requireMfaOnFirstLogin, setRequireMfaOnFirstLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !badgeNumber) {
      setError('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await addOfficer({
        fullName,
        email,
        username: email.split('@')[0].toLowerCase(),
        badgeNumber,
        department,
        role,
        securityClearance,
        requireMfaOnFirstLogin,
        mfaEnabled: requireMfaOnFirstLogin,
      });

      setSuccessMsg(`Officer ${fullName} provisioned successfully! Badge: ${badgeNumber}`);
      setTimeout(() => {
        setSuccessMsg('');
        setIsSubmitting(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to provision officer account.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-mono">
      <div className="bg-[#F2F4F7] border-2 border-black rounded-2xl w-full max-w-lg shadow-[8px_8px_0px_#000000] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b-2 border-black flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-black text-[#64EE00] border-2 border-black shadow-[2px_2px_0px_#000000]">
              <UserPlus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-black uppercase tracking-tight">Provision Officer Cadre</h3>
              <p className="text-xs text-black/70 font-bold">ADMIN PERSONNEL ACCREDITATION</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border-2 border-black bg-white hover:bg-black hover:text-white text-black transition shadow-[2px_2px_0px_#000000]"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-black text-white border-2 border-black text-xs font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-[#64EE00] text-black border-2 border-black text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-black stroke-[3]" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-black mb-1">
                  OFFICER FULL NAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Inspector Rajesh Verma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-xl p-2.5 text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-black mb-1">
                  BADGE / SERVICE NO. *
                </label>
                <input
                  type="text"
                  required
                  placeholder="DL-7842"
                  value={badgeNumber}
                  onChange={(e) => setBadgeNumber(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-xl p-2.5 text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-black mb-1">
                  GOVT EMAIL *
                </label>
                <input
                  type="email"
                  required
                  placeholder="r.verma@delhipolice.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-xl p-2.5 text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-black mb-1">
                  DEPARTMENT CADRE
                </label>
                <select
                  value={department}
                  onChange={(e) => {
                    const dept = e.target.value as Department;
                    setDepartment(dept);
                    if (dept === 'POLICE') setRole('POLICE_OFFICER');
                    else if (dept === 'FORENSIC') setRole('FORENSIC_OFFICER');
                    else if (dept === 'LEGAL') setRole('LAWYER');
                    else if (dept === 'COURT') setRole('COURT_OFFICER');
                    else if (dept === 'INVESTIGATION') setRole('INVESTIGATION_OFFICER');
                  }}
                  className="w-full bg-white border-2 border-black rounded-xl p-2.5 text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
                >
                  <option value="POLICE">POLICE DEPARTMENT</option>
                  <option value="INVESTIGATION">CRIME BRANCH (INVESTIGATION)</option>
                  <option value="FORENSIC">FORENSIC SCIENCE LAB (FSL)</option>
                  <option value="LEGAL">PROSECUTION & LEGAL AID</option>
                  <option value="COURT">HIGH COURT / JUDICIARY</option>
                  <option value="SECURITY">CYBER AUDIT & SECURITY</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-black mb-1">
                  ASSIGNED ROLE ENTITLEMENT
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full bg-white border-2 border-black rounded-xl p-2.5 text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
                >
                  <option value="POLICE_OFFICER">POLICE OFFICER</option>
                  <option value="INVESTIGATION_OFFICER">INVESTIGATION OFFICER (IO)</option>
                  <option value="FORENSIC_OFFICER">FORENSIC ANALYST</option>
                  <option value="LAWYER">PROSECUTOR / ADVOCATE</option>
                  <option value="COURT_OFFICER">COURT REGISTRAR / JUDGE</option>
                  <option value="AUDITOR">AUDITOR</option>
                  <option value="ADMIN">SYSTEM ADMIN</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-black mb-1">
                  CLEARANCE LEVEL
                </label>
                <select
                  value={securityClearance}
                  onChange={(e) => setSecurityClearance(e.target.value as any)}
                  className="w-full bg-white border-2 border-black rounded-xl p-2.5 text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
                >
                  <option value="LEVEL_1">LEVEL 1 (RESTRICTED)</option>
                  <option value="LEVEL_2">LEVEL 2 (CONFIDENTIAL)</option>
                  <option value="LEVEL_3">LEVEL 3 (SECRET)</option>
                  <option value="TOP_SECRET">TOP SECRET (EVIDENTIARY VAULT)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-black mb-1">
                INITIAL CLEARANCE PASSWORD
              </label>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border-2 border-black rounded-xl p-2.5 text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
              />
              <span className="text-[10px] text-black/60">
                Officer will be asked to change or verify this on first login.
              </span>
            </div>

            {/* Mandatory MFA Policy Checkbox */}
            <div className="p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-between">
              <div>
                <div className="font-bold text-black text-xs">Require Mandatory TOTP MFA</div>
                <div className="text-[10px] text-black/60">Officer must set up 2FA on first login</div>
              </div>
              <input
                type="checkbox"
                checked={requireMfaOnFirstLogin}
                onChange={(e) => setRequireMfaOnFirstLogin(e.target.checked)}
                className="w-5 h-5 accent-[#64EE00] border-2 border-black rounded cursor-pointer"
              />
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white border-2 border-black text-black font-bold hover:bg-slate-100 transition shadow-[2px_2px_0px_#000000]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#64EE00] border-2 border-black text-black font-extrabold shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4 stroke-[2.5]" />
                <span>{isSubmitting ? 'Provisioning...' : 'Provision Officer'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
