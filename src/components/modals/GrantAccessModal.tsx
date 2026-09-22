import React, { useState } from 'react';
import { useDms } from '../../contexts/DmsContext';
import { X, UserPlus, Check } from 'lucide-react';
import { DocumentItem, PermissionType, Department, Role } from '../../types';

export const GrantAccessModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem;
}> = ({ isOpen, onClose, document }) => {
  const { users, grantAccess } = useDms();
  const [granteeType, setGranteeType] = useState<'USER' | 'DEPARTMENT' | 'ROLE'>('USER');
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || '');
  const [selectedDepartment, setSelectedDepartment] = useState<Department>('LEGAL');
  const [selectedRole, setSelectedRole] = useState<Role>('LAWYER');
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionType[]>(['VIEW', 'DOWNLOAD']);
  const [expiryDays, setExpiryDays] = useState(30);
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const togglePermission = (perm: PermissionType) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPermissions.length === 0) {
      setError('Please select at least one permission level.');
      return;
    }
    if (!purpose.trim()) {
      setError('Please provide authorization notes / purpose for this explicit grant.');
      return;
    }

    let targetId = selectedUserId;
    let targetName = users.find((u) => u.id === selectedUserId)?.fullName || 'User';

    if (granteeType === 'DEPARTMENT') {
      targetId = selectedDepartment;
      targetName = `${selectedDepartment} Department`;
    } else if (granteeType === 'ROLE') {
      targetId = selectedRole;
      targetName = `All ${selectedRole.replace('_', ' ')}s`;
    }

    setIsSubmitting(true);
    try {
      await grantAccess(
        document.id,
        granteeType,
        targetId,
        targetName,
        selectedPermissions,
        purpose.trim(),
        expiryDays
      );
      onClose();
    } catch (err: any) {
      setError(err.message || 'Grant creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-mono">
      <div className="bg-[#F2F4F7] border-2 border-black rounded-2xl w-full max-w-lg shadow-[8px_8px_0px_#000000] overflow-hidden">
        <div className="p-4 border-b-2 border-black flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#64EE00] text-black border-2 border-black">
              <UserPlus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-black uppercase">Grant Clearance</h3>
              <p className="text-xs text-black/70 font-bold">DOCUMENT ACL AUTHORIZATION</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border-2 border-black bg-white hover:bg-black hover:text-white text-black transition"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-black text-white border-2 border-black text-xs font-bold">
              {error}
            </div>
          )}

          {/* Grantee Type Selection */}
          <div>
            <label className="block text-xs font-bold text-black mb-1.5">Grantee Scope</label>
            <div className="grid grid-cols-3 gap-2">
              {(['USER', 'DEPARTMENT', 'ROLE'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setGranteeType(type)}
                  className={`p-2.5 rounded-xl border-2 border-black text-center text-xs font-mono font-bold transition shadow-[2px_2px_0px_#000000] ${
                    granteeType === type
                      ? 'bg-[#64EE00] text-black font-black'
                      : 'bg-white text-black hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Specific Grantee Target */}
          {granteeType === 'USER' && (
            <div>
              <label className="block text-xs font-bold text-black mb-1">Target Personnel</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.department} — {u.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          {granteeType === 'DEPARTMENT' && (
            <div>
              <label className="block text-xs font-bold text-black mb-1">Target Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value as Department)}
                className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
              >
                <option value="POLICE">POLICE Department</option>
                <option value="INVESTIGATION">INVESTIGATION Department</option>
                <option value="FORENSIC">FORENSIC Science Laboratory</option>
                <option value="LEGAL">LEGAL Prosecution Cell</option>
                <option value="COURT">COURT Judiciary Registry</option>
                <option value="SECURITY">SECURITY Vigilance</option>
              </select>
            </div>
          )}

          {granteeType === 'ROLE' && (
            <div>
              <label className="block text-xs font-bold text-black mb-1">Target Role Category</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as Role)}
                className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
              >
                <option value="POLICE_OFFICER">Police Officers</option>
                <option value="INVESTIGATION_OFFICER">Investigation Officers</option>
                <option value="FORENSIC_OFFICER">Forensic Officers</option>
                <option value="LAWYER">Lawyers / Public Prosecutors</option>
                <option value="COURT_OFFICER">Judges / Court Officers</option>
                <option value="AUDITOR">Auditors</option>
              </select>
            </div>
          )}

          {/* Permissions */}
          <div>
            <label className="block text-xs font-bold text-black mb-1.5">Permitted Actions</label>
            <div className="grid grid-cols-2 gap-2">
              {(['VIEW', 'DOWNLOAD', 'VERSION_UPLOAD', 'SHARE'] as PermissionType[]).map((perm) => {
                const isChecked = selectedPermissions.includes(perm);
                return (
                  <button
                    key={perm}
                    type="button"
                    onClick={() => togglePermission(perm)}
                    className={`p-2.5 rounded-xl border-2 border-black text-left text-xs transition flex items-center justify-between shadow-[2px_2px_0px_#000000] ${
                      isChecked
                        ? 'bg-[#64EE00] text-black font-black'
                        : 'bg-white text-black font-bold hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-mono text-xs">{perm}</span>
                    {isChecked && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expiry Duration */}
          <div>
            <label className="block text-xs font-bold text-black mb-1">Access Expiration Period</label>
            <select
              value={expiryDays}
              onChange={(e) => setExpiryDays(Number(e.target.value))}
              className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
            >
              <option value={7}>7 Days (Expedited Inquiry)</option>
              <option value={14}>14 Days (Standard Review)</option>
              <option value={30}>30 Days (Active Prosecution)</option>
              <option value={90}>90 Days (Judicial Proceedings)</option>
              <option value={365}>1 Year (Permanent Case Tenure)</option>
            </select>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Purpose & Authorization Rationale
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Approved for cross-verifying forensic evidence with witness deposition..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-xl p-2.5 text-xs text-black placeholder-black/40 font-bold focus:outline-none shadow-[2px_2px_0px_#000000]"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t-2 border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-black hover:text-white text-black text-xs font-bold border-2 border-black transition shadow-[2px_2px_0px_#000000]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="brutal-btn-green px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Issuing Grant...' : 'Authorize Grant'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
