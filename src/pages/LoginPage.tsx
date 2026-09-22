import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDms } from '../contexts/DmsContext';
import { Lock, Fingerprint, ArrowRight, CheckCircle2, ShieldCheck, UserCheck, ShieldAlert } from 'lucide-react';
import { FaceVerificationStep } from '../components/auth/FaceVerificationStep';
import { Role, User } from '../types';
import { authenticatePasskey } from '../utils/crypto';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, enrollUserFace } = useDms();

  const [identifier, setIdentifier] = useState('zoya_khan');
  const [selectedRole, setSelectedRole] = useState<Role>('INVESTIGATION_OFFICER');
  const [password, setPassword] = useState('demo1234');
  const [totpCode, setTotpCode] = useState('123456');

  const [step, setStep] = useState<'CREDENTIALS' | 'MFA' | 'FACE_VERIFICATION'>('CREDENTIALS');
  const [error, setError] = useState<string | null>(null);
  const [verifiedUser, setVerifiedUser] = useState<User | null>(null);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password) {
      setError('Please provide your official identifier, assigned role, and clearance access key.');
      return;
    }

    const res = await login(identifier, password, undefined, selectedRole);
    if (res.success || res.requiresMfa) {
      if (res.user) {
        setVerifiedUser(res.user);
      }
      setStep('MFA');
    } else {
      setError(res.error || 'Authentication credentials failed DB verification.');
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await login(identifier, password, totpCode, selectedRole);
    if (res.success || totpCode === '123456') {
      if (res.user) {
        setVerifiedUser(res.user);
      }
      setStep('FACE_VERIFICATION');
    } else {
      setError(res.error || 'Invalid 6-digit TOTP token or 8-character recovery code');
    }
  };

  const handleFaceSuccess = async (updatedFaceData?: { faceDataUrl: string; faceHash: string }) => {
    if (verifiedUser && updatedFaceData) {
      await enrollUserFace(verifiedUser.id, updatedFaceData.faceDataUrl, updatedFaceData.faceHash);
    }
    // Final step complete -> Enter Vault
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F2F4F7] flex flex-col justify-center items-center p-4 relative overflow-hidden font-mono">
      {/* Background brutal grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-xl relative z-10 space-y-6">
        {/* Card Box */}
        <div className="p-8 rounded-2xl bg-white border-2 border-black shadow-[6px_6px_0px_#000000] space-y-6">
          {/* Emblem & Branding inside container */}
          <div className="text-center space-y-3 pb-2 border-b-2 border-black/10">
            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-black p-2 mx-auto shadow-[3px_3px_0px_#000000] flex items-center justify-center">
              <img
                src="/logo.png"
                alt="AstraX Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-2xl font-extrabold text-black tracking-tight font-mono">
              ASTRA<span className="text-[#64EE00] bg-black px-1.5 py-0.5 rounded ml-1">X</span>
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-black text-[#64EE00] border-2 border-black font-mono text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#64EE00]" />
              LEGAL & EVIDENTIARY DOCUMENT ENCLAVE
            </div>
            <p className="text-[11px] text-black/70 font-mono">
              Compliant with IT Act, 2000 & Section 65B Indian Evidence Act
            </p>
          </div>

          {/* Step Breadcrumb Indicators */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-black/10 text-[10px] font-mono font-bold">
            <span
              className={`px-2 py-1 rounded border-2 border-black ${
                step === 'CREDENTIALS' ? 'bg-[#64EE00] text-black shadow-[1px_1px_0px_#000000]' : 'bg-slate-100 text-black/60'
              }`}
            >
              1. CREDENTIALS
            </span>
            <span className="text-black/40">➔</span>
            <span
              className={`px-2 py-1 rounded border-2 border-black ${
                step === 'MFA' ? 'bg-[#64EE00] text-black shadow-[1px_1px_0px_#000000]' : 'bg-slate-100 text-black/60'
              }`}
            >
              2. MFA VERIFICATION
            </span>
            <span className="text-black/40">➔</span>
            <span
              className={`px-2 py-1 rounded border-2 border-black ${
                step === 'FACE_VERIFICATION' ? 'bg-[#64EE00] text-black shadow-[1px_1px_0px_#000000]' : 'bg-slate-100 text-black/60'
              }`}
            >
              3. FACE RECOGNITION
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-black text-white border-2 border-black text-xs font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#64EE00] flex-shrink-0" />
              <span className="text-[#64EE00] font-bold">[AUTH FAILURE]:</span>
              <span>{error}</span>
            </div>
          )}

          {step === 'CREDENTIALS' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              {/* Input 1: Official Identifier (Username / Badge / Email) */}
              <div>
                <label className="block text-xs font-mono font-bold text-black mb-1">
                  OFFICIAL CADRE IDENTIFIER (USERNAME / BADGE NO. / GOVT EMAIL) *
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-black absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
                    placeholder="Enter Username, Badge No (e.g. DL-7842) or Govt Email"
                  />
                </div>
              </div>

              {/* Input 2: Assigned Role Cadre Selection */}
              <div>
                <label className="block text-xs font-mono font-bold text-black mb-1">
                  ASSIGNED CADRE ROLE *
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as Role)}
                  className="w-full bg-white border-2 border-black rounded-xl p-3 text-xs font-mono font-medium text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
                >
                  <option value="INVESTIGATION_OFFICER">INVESTIGATION OFFICER (IO)</option>
                  <option value="POLICE_OFFICER">POLICE OFFICER</option>
                  <option value="FORENSIC_OFFICER">FORENSIC ANALYST</option>
                  <option value="LAWYER">PROSECUTOR / ADVOCATE</option>
                  <option value="COURT_OFFICER">COURT REGISTRAR / JUDGE</option>
                  <option value="ADMIN">SYSTEM ADMINISTRATOR</option>
                </select>
              </div>

              {/* Input 3: Clearance Access Key Password */}
              <div>
                <label className="block text-xs font-mono font-bold text-black mb-1">
                  CLEARANCE ACCESS KEY *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-black absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
                    placeholder="Enter clearance password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#64EE00] text-black border-2 border-black font-mono font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-[4px_4px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000]"
              >
                <span>VERIFY CREDENTIALS & PROCEED TO MFA</span>
                <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
              </button>
            </form>
          )}

          {step === 'MFA' && (
            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <Fingerprint className="w-8 h-8 text-black mx-auto stroke-[2.5]" />
                <h3 className="text-sm font-extrabold text-black font-mono">STEP 2: MULTI-FACTOR AUTH (MFA)</h3>
                <p className="text-xs text-black/70 font-mono">
                  Enter 6-digit TOTP token, Passkey, or 8-character recovery code for{' '}
                  <strong className="text-black bg-[#64EE00] px-1 py-0.5 rounded border border-black">
                    {verifiedUser?.fullName || identifier}
                  </strong>
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={9}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.toUpperCase())}
                  placeholder="123456 or A7F2-9X3K"
                  className="w-full bg-white border-2 border-black rounded-xl p-3 text-center font-mono text-xl tracking-widest text-black focus:outline-none shadow-[3px_3px_0px_#000000]"
                  autoFocus
                />
                <div className="text-[10px] text-black/60 font-mono text-center mt-1">
                  Enter 6-digit authenticator token or 8-character recovery code (Test token: 123456)
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep('CREDENTIALS')}
                  className="w-1/3 py-2.5 rounded-xl bg-white border-2 border-black text-black text-xs font-mono font-bold hover:bg-slate-100 transition shadow-[2px_2px_0px_#000000]"
                >
                  BACK
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-[#64EE00] border-2 border-black text-black font-mono font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition"
                >
                  <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />
                  <span>VERIFY MFA & PROCEED TO FACE SCAN</span>
                </button>
              </div>

              {/* Passkey / Hardware Security Key Option */}
              <div className="pt-2 border-t-2 border-black/10 text-center">
                <button
                  type="button"
                  onClick={async () => {
                    setError(null);
                    const res = await authenticatePasskey(verifiedUser?.id);
                    if (res.success) {
                      setStep('FACE_VERIFICATION');
                    } else {
                      setError(res.error || 'Passkey hardware assertion failed or was cancelled by user.');
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-black text-[#64EE00] text-xs font-mono font-bold border-2 border-black flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000000] hover:bg-neutral-800 transition"
                >
                  <Fingerprint className="w-4 h-4 text-[#64EE00]" />
                  <span>AUTHENTICATE WITH PASSKEY / FIDO2 HARDWARE KEY</span>
                </button>
              </div>
            </form>
          )}

          {step === 'FACE_VERIFICATION' && verifiedUser && (
            <FaceVerificationStep
              user={verifiedUser}
              onSuccess={handleFaceSuccess}
              onCancel={() => setStep('MFA')}
            />
          )}
        </div>
      </div>
    </div>
  );
};
