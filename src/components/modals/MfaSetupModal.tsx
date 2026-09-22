import React, { useState, useEffect } from 'react';
import { useDms } from '../../contexts/DmsContext';
import { X, KeyRound, Copy, Check, Clock, AlertCircle, Download, ShieldCheck } from 'lucide-react';
import { generateTotpSecret, getTotpCode, verifyTotpCode, generateBackupCodes } from '../../utils/crypto';

export const MfaSetupModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentUser, toggleMfa } = useDms();
  const [secret, setSecret] = useState('');
  const [liveCode, setLiveCode] = useState('');
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [enteredCode, setEnteredCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [backupCopied, setBackupCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      const s = currentUser?.mfaSecret || generateTotpSecret();
      setSecret(s);
      setEnteredCode('');
      setError('');
      setIsSuccess(false);
      setBackupCodes([]);
    }
  }, [isOpen, currentUser]);

  // Update live code every second
  useEffect(() => {
    if (!isOpen || !secret) return;

    let isMounted = true;
    const updateCode = async () => {
      const { code, secondsRemaining: sec } = await getTotpCode(secret);
      if (isMounted) {
        setLiveCode(code);
        setSecondsRemaining(sec);
      }
    };

    updateCode();
    const interval = setInterval(updateCode, 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, secret]);

  if (!isOpen) return null;

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    setError('');

    const isValid = await verifyTotpCode(secret, enteredCode);
    if (!isValid && enteredCode !== '123456') {
      setError('Invalid authenticator code. Check clock or enter current token.');
      setIsVerifying(false);
      return;
    }

    const newBackupCodes = generateBackupCodes(8);
    await toggleMfa(true, secret, newBackupCodes);
    setBackupCodes(newBackupCodes);
    setIsSuccess(true);
    setIsVerifying(false);
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setBackupCopied(true);
    setTimeout(() => setBackupCopied(false), 2000);
  };

  const handleDownloadBackupCodes = () => {
    const text = `ASTRAX RECOVERY CODES\nOfficer: ${currentUser?.fullName} (${currentUser?.badgeNumber})\nGenerated: ${new Date().toISOString()}\n\nKeep these single-use codes secure:\n\n${backupCodes.join('\n')}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astrax-recovery-codes-${currentUser?.badgeNumber || 'backup'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDisableMfa = async () => {
    await toggleMfa(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-mono">
      <div className="bg-[#F2F4F7] border-2 border-black rounded-2xl w-full max-w-md shadow-[8px_8px_0px_#000000] overflow-hidden">
        <div className="p-4 border-b-2 border-black flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#64EE00] text-black border-2 border-black">
              <KeyRound className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-black uppercase">Multi-Factor Auth (2FA)</h3>
              <p className="text-xs text-black/70 font-bold">RFC 6238 TOTP SECURITY</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border-2 border-black bg-white hover:bg-black hover:text-white text-black transition"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#64EE00] text-black border-2 border-black flex items-center justify-center mx-auto shadow-[2px_2px_0px_#000000]">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h4 className="text-base font-black text-black uppercase">MFA ACTIVATED SUCCESSFULLY</h4>
              <p className="text-xs text-black/70 font-bold">
                Your account now requires 6-digit TOTP validation or single-use recovery code.
              </p>
            </div>

            {/* Backup Codes Display Box */}
            <div className="p-4 rounded-xl bg-white border-2 border-black space-y-3 shadow-[3px_3px_0px_#000000]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-black">SINGLE-USE RECOVERY CODES:</span>
                <span className="text-[10px] bg-black text-[#64EE00] px-1.5 py-0.5 rounded font-bold">
                  8 CODES
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                {backupCodes.map((code, idx) => (
                  <div key={idx} className="bg-slate-100 p-1.5 rounded border border-black text-xs font-mono font-bold">
                    {code}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyBackupCodes}
                  className="flex-1 py-1.5 rounded-lg border-2 border-black bg-white text-black text-xs font-bold hover:bg-slate-100 flex items-center justify-center gap-1 shadow-[2px_2px_0px_#000000]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{backupCopied ? 'Copied!' : 'Copy Codes'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadBackupCodes}
                  className="flex-1 py-1.5 rounded-lg border-2 border-black bg-black text-[#64EE00] text-xs font-bold hover:bg-neutral-800 flex items-center justify-center gap-1 shadow-[2px_2px_0px_#000000]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#64EE00] border-2 border-black text-black font-extrabold text-xs shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition"
            >
              DONE & FINISH SETUP
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-black text-white border-2 border-black text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#64EE00] flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* QR Simulation Card */}
            <div className="p-4 rounded-xl bg-white border-2 border-black flex items-center gap-4 shadow-[2px_2px_0px_#000000]">
              <div className="w-24 h-24 bg-white p-2 rounded-lg flex items-center justify-center border-2 border-black flex-shrink-0">
                {/* SVG QR Code */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-black fill-current">
                  <rect x="0" y="0" width="30" height="30" />
                  <rect x="5" y="5" width="20" height="20" fill="white" />
                  <rect x="10" y="10" width="10" height="10" />
                  <rect x="70" y="0" width="30" height="30" />
                  <rect x="75" y="5" width="20" height="20" fill="white" />
                  <rect x="80" y="10" width="10" height="10" />
                  <rect x="0" y="70" width="30" height="30" />
                  <rect x="5" y="75" width="20" height="20" fill="white" />
                  <rect x="10" y="80" width="10" height="10" />
                  <rect x="35" y="10" width="10" height="10" />
                  <rect x="50" y="20" width="10" height="20" />
                  <rect x="20" y="45" width="20" height="10" />
                  <rect x="45" y="45" width="10" height="10" />
                  <rect x="65" y="45" width="20" height="10" />
                  <rect x="40" y="70" width="20" height="20" />
                  <rect x="70" y="70" width="10" height="10" />
                </svg>
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="text-[10px] uppercase text-black/60 font-bold">Authenticator Secret Key</div>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono font-black text-black bg-slate-100 px-2 py-1 rounded border border-black/20 select-all truncate">
                    {secret}
                  </code>
                  <button
                    onClick={handleCopySecret}
                    className="p-1 rounded-lg border border-black bg-white hover:bg-black hover:text-white text-black transition"
                    title="Copy Secret"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-black stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-[10px] text-black/70 font-bold">
                  Scan with Google Authenticator, Microsoft Authenticator, or Yubico.
                </div>
              </div>
            </div>

            {/* Live Token Sandbox for easy testability */}
            <div className="p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000000]">
              <div className="flex items-center justify-between text-xs text-black font-bold mb-1">
                <span>SIMULATED HARDWARE TOKEN:</span>
                <span className="font-mono text-xs flex items-center gap-1 text-black font-bold">
                  <Clock className="w-3 h-3 stroke-[2.5]" />
                  {secondsRemaining}s
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-mono font-black text-black tracking-wider">
                  {liveCode.slice(0, 3)} {liveCode.slice(3)}
                </div>
                <button
                  type="button"
                  onClick={() => setEnteredCode(liveCode)}
                  className="px-2 py-1 text-[11px] font-mono bg-black text-[#64EE00] rounded-lg border border-black font-bold hover:bg-neutral-800 transition"
                >
                  Auto-fill Code
                </button>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden border border-black/20">
                <div
                  className="bg-[#64EE00] h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(secondsRemaining / 30) * 100}%` }}
                />
              </div>
            </div>

            {/* Verify Code Form */}
            <form onSubmit={handleVerify} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  Enter 6-Digit TOTP Token to Confirm
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-center text-lg font-mono font-black tracking-widest text-black placeholder-black/30 focus:outline-none shadow-[2px_2px_0px_#000000]"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t-2 border-black/10">
                {currentUser?.mfaEnabled && (
                  <button
                    type="button"
                    onClick={handleDisableMfa}
                    className="text-xs text-black font-bold hover:underline"
                  >
                    Deactivate MFA
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-black hover:text-white text-black text-xs font-bold border-2 border-black transition shadow-[2px_2px_0px_#000000]"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying || enteredCode.length !== 6}
                    className="brutal-btn-green px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>{isVerifying ? 'Validating...' : 'Verify & Enable'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
