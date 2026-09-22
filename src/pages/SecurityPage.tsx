import React, { useState } from 'react';
import { useDms } from '../contexts/DmsContext';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { SeverityBadge } from '../components/ui/Badges';

export const SecurityPage: React.FC = () => {
  const { alerts, resolveAlert, recordAudit } = useDms();
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');
  const resolvedAlerts = alerts.filter((a) => a.status === 'RESOLVED');

  const filtered = alerts.filter((a) => {
    return filterSeverity === 'ALL' || a.severity === filterSeverity;
  });

  const handleSimulateBruteForce = () => {
    recordAudit({
      action: 'USER_LOGIN',
      resourceType: 'AUTH',
      status: 'FAILED',
      details: {
        reason: 'Multiple invalid credentials received from IP 192.168.1.189',
        attempts: 5,
        accountTargeted: 'adv.karan@legal.gov.in',
      },
    });
    alert('Simulated anomaly recorded in audit ledger.');
  };

  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-black stroke-[2.5]" />
            <h1 className="text-xl font-black text-black tracking-tight uppercase">
              Security Incident & Threat Monitoring
            </h1>
          </div>
          <p className="text-xs text-black/70">
            Real-time intrusion detection, integrity drift monitoring, and Section 65B compliance alerting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateBruteForce}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-black hover:text-white text-black font-mono font-bold text-xs border-2 border-black flex items-center gap-1.5 transition shadow-[2px_2px_0px_#000000]"
          >
            <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
            <span>Simulate Anomaly</span>
          </button>
        </div>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl brutal-card space-y-1">
          <span className="text-xs font-bold uppercase text-black/60">ACTIVE THREAT ALARMS</span>
          <div className={`text-2xl font-black ${activeAlerts.length > 0 ? 'text-black bg-[#64EE00] inline-block px-2 py-0.5 rounded border border-black' : 'text-black'}`}>
            {activeAlerts.length} Active
          </div>
          <div className="text-[11px] text-black/60 font-bold">Requires SOC acknowledgement</div>
        </div>

        <div className="p-5 rounded-2xl brutal-card space-y-1">
          <span className="text-xs font-bold uppercase text-black/60">SYSTEM SECURITY SCORE</span>
          <div className="text-2xl font-black text-black">
            {activeAlerts.length === 0 ? '98 / 100' : `${Math.max(60, 98 - activeAlerts.length * 15)} / 100`}
          </div>
          <div className="text-[11px] text-black/60 font-bold">ISO 27001 Security Baseline</div>
        </div>

        <div className="p-5 rounded-2xl brutal-card space-y-1">
          <span className="text-xs font-bold uppercase text-black/60">RESOLVED INCIDENTS</span>
          <div className="text-2xl font-black text-black">{resolvedAlerts.length} Mitigated</div>
          <div className="text-[11px] text-black/60 font-bold">With post-incident forensic log</div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase text-black font-black">
              SECURITY INCIDENT LEDGER ({filtered.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-black font-bold">SEVERITY:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-white border-2 border-black rounded-xl px-2.5 py-1 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border-2 border-black transition space-y-3 shadow-[3px_3px_0px_#000000] ${
                alert.status === 'ACTIVE'
                  ? 'bg-white'
                  : 'bg-slate-100/80 opacity-85'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SeverityBadge severity={alert.severity} />
                    <span className="text-xs font-mono text-black font-black uppercase">{alert.type}</span>
                    <span className="text-xs font-mono text-black/60">
                      {new Date(alert.timestamp || alert.detectedAt || Date.now()).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-black">{alert.message || alert.description}</h3>
                </div>

                <div className="flex items-center gap-2 self-start">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border border-black font-bold ${
                      alert.status === 'ACTIVE'
                        ? 'bg-black text-[#64EE00]'
                        : 'bg-white text-black'
                    }`}
                  >
                    {alert.status}
                  </span>

                  {alert.status === 'ACTIVE' && (
                    <button
                      onClick={() => resolveAlert(alert.id, 'Mitigated via Security Operations Center manual override')}
                      className="brutal-btn-green px-3 py-1 rounded-xl font-bold text-xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mitigate & Resolve</span>
                    </button>
                  )}
                </div>
              </div>

              {alert.details && (
                <div className="p-3 rounded-xl bg-slate-50 border border-black/20 font-mono text-[11px] text-black space-y-1">
                  <div className="font-bold">Source: {alert.resourceType} ({alert.resourceId || 'N/A'})</div>
                  {Object.entries(alert.details).map(([k, v]) => (
                    <div key={k} className="text-black/70">
                      {k}: <span className="text-black font-bold">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
