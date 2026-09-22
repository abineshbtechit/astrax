import React, { useState } from 'react';
import { useDms } from '../contexts/DmsContext';
import { Clock, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TimelinePage: React.FC = () => {
  const { timeline, cases } = useDms();
  const [selectedCase, setSelectedCase] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const filteredTimeline = timeline.filter((item) => {
    const matchesCase = selectedCase === 'ALL' || item.caseId === selectedCase;
    const matchesType = selectedType === 'ALL' || item.eventType === selectedType;
    return matchesCase && matchesType;
  });

  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-black stroke-[2.5]" />
            <h1 className="text-xl font-black text-black tracking-tight uppercase">
              Chronological Investigation Timeline
            </h1>
          </div>
          <p className="text-xs text-black/70">
            Unified evidentiary time sequence across FIR registration, seizures, forensic reports, and court filings.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCase}
            onChange={(e) => setSelectedCase(e.target.value)}
            className="bg-white border-2 border-black rounded-xl px-3 py-1.5 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
          >
            <option value="ALL">All Investigations</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.caseNumber}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-white border-2 border-black rounded-xl px-3 py-1.5 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
          >
            <option value="ALL">All Event Categories</option>
            <option value="CASE_CREATED">Case Registered</option>
            <option value="EVIDENCE_SEIZED">Evidence Seizure</option>
            <option value="FORENSIC_ANALYSIS">Forensic Analysis</option>
            <option value="CHARGE_SHEET_FILED">Charge Sheet Filing</option>
            <option value="COURT_HEARING">Judicial Hearing</option>
            <option value="ACCESS_REQUEST">Access Clearance</option>
            <option value="SECURITY_ALERT">Security Alert</option>
          </select>
        </div>
      </div>

      <div className="p-6 rounded-2xl brutal-card space-y-6">
        <div className="relative border-l-2 border-black ml-4 space-y-8">
          {filteredTimeline.map((item) => (
            <div key={item.id} className="relative pl-6">
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#64EE00] border-2 border-black" />

              <div className="p-4 rounded-xl bg-white border-2 border-black space-y-2 shadow-[2px_2px_0px_#000000]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-black text-black">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black text-[#64EE00] font-bold border border-black">
                      {item.eventType}
                    </span>
                    {item.caseNumber && (
                      <Link
                        to={`/cases/${item.caseId}`}
                        className="text-[11px] font-mono font-bold text-black hover:underline"
                      >
                        {item.caseNumber}
                      </Link>
                    )}
                  </div>

                  <span className="text-xs text-black/70 font-bold">
                    Logged by: {item.actorName} ({item.actorDepartment})
                  </span>
                </div>

                <h3 className="text-sm font-black text-black">{item.title}</h3>
                <p className="text-xs text-black/80 leading-relaxed font-mono">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
