import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDms } from '../contexts/DmsContext';
import { Lock, Fingerprint, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, Binary } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { users, login, switchUser, recordAudit } = useDms();

  const [selectedUser, setSelectedUser] = useState<string>(users[2]?.id || users[0]?.id);
  const [password, setPassword] = useState('demo1234');
  const [totpCode, setTotpCode] = useState('123456');
  const [step, setStep] = useState<'CREDENTIALS' | 'MFA'>('CREDENTIALS');
  const [error, setError] = useState<string | null>(null);

  const targetUserObj = users.find((u) => u.id === selectedUser);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (targetUserObj?.isMfaEnabled || targetUserObj?.mfaEnabled) {
      setStep('MFA');
    } else {
      const res = await login(selectedUser, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error || 'Authentication clearance failed');
      }
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await login(selectedUser, password, totpCode);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Invalid 6-digit TOTP clearance token');
    }
  };

  const handleQuickLogin = (userId: string) => {
    switchUser(userId);
    recordAudit({
      action: 'USER_LOGIN',
      resourceType: 'AUTH',
      status: 'SUCCESS',
      details: {
        method: 'PERSONA_DIRECT_AUTH',
        ipAddress: '10.24.180.42',
      },
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F2F4F7] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background brutal grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-xl relative z-10 space-y-6">
        {/* Emblem & Branding */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-2xl bg-white border-2 border-black p-2 mx-auto shadow-[4px_4px_0px_#000000] flex items-center justify-center">
            <img
              src="/logo.png"
              alt="AstraX Logo"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-3xl font-extrabold text-black tracking-tight font-mono">
            ASTRA<span className="text-[#64EE00] bg-black px-1.5 py-0.5 rounded ml-1">X</span>
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-black text-[#64EE00] border-2 border-black font-mono text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#64EE00]" />
            LEGAL & EVIDENTIARY DOCUMENT ENCLAVE
          </div>
          <p className="text-xs text-black/70 font-mono">
            Compliant with IT Act, 2000 & Section 65B Indian Evidence Act
          </p>
        </div>

        {/* Card Box (60% White with 30% Black borders and 10% #64EE00 accent) */}
        <div className="p-8 rounded-2xl bg-white border-2 border-black shadow-[6px_6px_0px_#000000] space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-black text-white border-2 border-black text-xs font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#64EE00] animate-ping" />
              <span className="text-[#64EE00] font-bold">[AUTH FAILURE]:</span>
              <span>{error}</span>
            </div>
          )}

          {step === 'CREDENTIALS' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-black mb-1">
                  OFFICIAL CADRE IDENTIFIER
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-xl p-3 text-xs font-mono font-medium text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} — {u.role} ({u.department}) [Badge: {u.badgeNumber}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-black mb-1">
                  CLEARANCE ACCESS KEY
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-black absolute left-3 top-3.5" />
                  <input
                    type="password"
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
                <span>PROCEED TO MULTI-FACTOR VERIFICATION</span>
                <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <Fingerprint className="w-8 h-8 text-black mx-auto stroke-[2.5]" />
                <h3 className="text-sm font-extrabold text-black font-mono">TIME-BASED OTP (TOTP)</h3>
                <p className="text-xs text-black/70 font-mono">
                  Enter 6-digit cryptographic token for{' '}
                  <strong className="text-black bg-[#64EE00] px-1 py-0.5 rounded border border-black">
                    {targetUserObj?.fullName}
                  </strong>
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full bg-white border-2 border-black rounded-xl p-3 text-center font-mono text-2xl tracking-widest text-black focus:outline-none shadow-[3px_3px_0px_#000000]"
                  autoFocus
                />
                <div className="text-[10px] text-black/60 font-mono text-center mt-1">
                  Standard test token: 123456
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
                  <span>VERIFY TOKEN & ENTER VAULT</span>
                </button>
              </div>
            </form>
          )}

          {/* Quick Persona Switcher for Evaluators */}
          <div className="pt-4 border-t-2 border-black/10 space-y-2">
            <div className="text-[10px] font-mono text-black uppercase font-bold text-center tracking-wider">
              Quick Role-Based Access Demo Switcher
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u.id)}
                  className="p-2 rounded-xl bg-white hover:bg-slate-50 border-2 border-black text-left transition flex flex-col justify-between shadow-[2px_2px_0px_#000000] group"
                >
                  <div className="text-[11px] font-bold text-black truncate">{u.fullName}</div>
                  <div className="text-[9px] font-mono text-black/60 group-hover:text-black font-semibold truncate">
                    {u.department}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
