import React, { useState } from 'react';
import { useDms } from '../../contexts/DmsContext';
import { X, ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react';
import { verifyTotpCode } from '../../utils/crypto';

interface StepUpMfaModalProps {
  isOpen: boolean;
  title?: string;
  actionDescription: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const StepUpMfaModal: React.FC<StepUpMfaModalProps> = ({
  isOpen,
  title = 'STEP-UP MULTI-FACTOR AUTHORIZATION',
  actionDescription,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useDms();
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (totpCode.trim().length !== 6) {
      setError('Please enter a valid 6-digit TOTP clearance code.');
      return;
    }

    setIsVerifying(true);

    const secret = currentUser?.mfaSecret || 'ASTRAXSECRETKEY1';
    const isValid = await verifyTotpCode(secret, totpCode);

    if (!isValid && totpCode !== '123456') {
      setError('Invalid authenticator clearance token.');
      setIsVerifying(false);
      return;
    }

    setIsVerifying(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-mono">
      <div className="bg-[#F2F4F7] border-2 border-black rounded-2xl w-full max-w-md shadow-[8px_8px_0px_#000000] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b-2 border-black flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#64EE00] text-black border-2 border-black shadow-[2px_2px_0px_#000000]">
              <KeyRound className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-black uppercase">{title}</h3>
              <p className="text-[11px] text-black/70 font-bold">ELEVATED CLEARANCE REQUIREMENT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border-2 border-black bg-white hover:bg-black hover:text-white text-black transition"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000000] space-y-1">
            <div className="text-[10px] font-bold text-black uppercase tracking-wide flex items-center gap-1.5 text-amber-600">
              <ShieldAlert className="w-3.5 h-3.5" />
              SENSITIVE OPERATION DETECTED
            </div>
            <div className="text-xs text-black font-semibold">{actionDescription}</div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-black text-white border-2 border-black text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#64EE00] animate-ping" />
              <span className="text-[#64EE00]">[DENIED]:</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Enter Current 6-Digit TOTP Token
              </label>
              <input
                type="text"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full bg-white border-2 border-black rounded-xl p-3 text-center text-2xl font-mono tracking-widest text-black focus:outline-none shadow-[3px_3px_0px_#000000]"
                autoFocus
              />
              <div className="text-[10px] text-black/60 font-mono text-center mt-1">
                Authenticator code from Google / Microsoft Authenticator app (Test: 123456)
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 rounded-xl bg-white border-2 border-black text-black text-xs font-mono font-bold hover:bg-slate-100 transition shadow-[2px_2px_0px_#000000]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isVerifying || totpCode.length !== 6}
                className="w-2/3 py-2.5 rounded-xl bg-[#64EE00] border-2 border-black text-black font-mono font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />
                <span>{isVerifying ? 'VERIFYING...' : 'AUTHORIZE ACTION'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
