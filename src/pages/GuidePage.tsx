import React from 'react';
import {
  FileLock2,
  ShieldCheck,
  Scale,
  Binary,
  CheckCircle2,
} from 'lucide-react';

export const GuidePage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-2xl brutal-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-black text-[#64EE00] border-2 border-black">
              <FileLock2 className="w-4 h-4 stroke-[2.5]" />
            </span>
            <h1 className="text-xl font-extrabold text-black font-mono">
              STANDARD OPERATING PROCEDURES & SECTION 65B MANUAL
            </h1>
          </div>
          <p className="text-xs text-black/70 font-mono">
            Statutory evidentiary guidelines, role-based boundary protocols, and cryptographic compliance specifications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#64EE00] text-black border-2 border-black rounded-lg text-xs font-mono font-extrabold">
            STATUTE COMPLIANT
          </span>
        </div>
      </div>

      {/* Pillar 1: Section 65B Evidence Act */}
      <div className="p-6 rounded-2xl brutal-card space-y-4">
        <div className="flex items-center gap-2 text-black font-mono text-xs font-bold uppercase pb-2 border-b-2 border-black/10">
          <Scale className="w-4 h-4 text-black stroke-[2.5]" />
          <span>Section 65B Legal Admissibility Compliance Framework</span>
        </div>

        <p className="text-xs text-black/80 font-mono leading-relaxed">
          Under Section 65B of the Indian Evidence Act, 1872 (and corresponding Bharatiya Sakshya Adhiniyam provisions), electronic records such as server logs, digital forensic images, and PDF case filings are admissible in a court of law only if the following statutory conditions are continuously satisfied:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000000] space-y-1">
            <strong className="text-black font-mono block font-bold">1. Regular Course of Activity</strong>
            <p className="text-black/70 text-[11px] font-mono">
              The electronic record must be produced during the regular conduct of official duties by authorized personnel.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000000] space-y-1">
            <strong className="text-black font-mono block font-bold">2. Continuous Unimpaired Operation</strong>
            <p className="text-black/70 text-[11px] font-mono">
              During the relevant period, the computer system operated properly without defects affecting evidentiary accuracy.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000000] space-y-1">
            <strong className="text-black font-mono block font-bold">3. Cryptographic Non-Repudiation</strong>
            <p className="text-black/70 text-[11px] font-mono">
              Every document is sealed with a 256-bit SHA-256 digest at moment of ingestion. Any byte-level alteration flags tamper state.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000000] space-y-1">
            <strong className="text-black font-mono block font-bold">4. Official Officer Certification</strong>
            <p className="text-black/70 text-[11px] font-mono">
              A signed certificate identifying the system, certifying hash digests, and verifying uninterrupted chain of custody.
            </p>
          </div>
        </div>
      </div>

      {/* Pillar 2: Inter-Agency RBAC Model */}
      <div className="p-6 rounded-2xl brutal-card space-y-4">
        <div className="flex items-center gap-2 text-black font-mono text-xs font-bold uppercase pb-2 border-b-2 border-black/10">
          <ShieldCheck className="w-4 h-4 text-black stroke-[2.5]" />
          <span>Inter-Agency Role-Based Access Control (RBAC) & Clearance Matrix</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-mono border-2 border-black">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-2.5 border-b-2 border-black">Department</th>
                <th className="p-2.5 border-b-2 border-black">Typical Role</th>
                <th className="p-2.5 border-b-2 border-black">Default Clearance</th>
                <th className="p-2.5 border-b-2 border-black">Inter-Agency Policy</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/20 text-black">
              <tr>
                <td className="p-2.5 font-bold">POLICE</td>
                <td className="p-2.5">INVESTIGATING_OFFICER</td>
                <td className="p-2.5"><span className="bg-[#64EE00] text-black px-1.5 py-0.5 rounded border border-black font-bold text-[10px]">CONFIDENTIAL</span></td>
                <td className="p-2.5 text-[11px]">Can register cases, seize exhibits, and submit requests to CFSL.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">FORENSIC</td>
                <td className="p-2.5">FORENSIC_ANALYST</td>
                <td className="p-2.5"><span className="bg-black text-[#64EE00] px-1.5 py-0.5 rounded border border-black font-bold text-[10px]">SECRET</span></td>
                <td className="p-2.5 text-[11px]">Receives physical drives, creates bitstream images, authors lab reports.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">LEGAL</td>
                <td className="p-2.5">PROSECUTOR</td>
                <td className="p-2.5"><span className="bg-black text-[#64EE00] px-1.5 py-0.5 rounded border border-black font-bold text-[10px]">SECRET</span></td>
                <td className="p-2.5 text-[11px]">Reviews witness transcripts, files charge sheets, signs court submissions.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">COURT</td>
                <td className="p-2.5">JUDICIAL_MAGISTRATE</td>
                <td className="p-2.5"><span className="bg-[#64EE00] text-black px-1.5 py-0.5 rounded border border-black font-extrabold text-[10px]">TOP_SECRET</span></td>
                <td className="p-2.5 text-[11px]">Unrestricted read access to submitted exhibits, issues warrants and orders.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">ADMIN</td>
                <td className="p-2.5">SUPER_ADMIN</td>
                <td className="p-2.5"><span className="bg-[#64EE00] text-black px-1.5 py-0.5 rounded border border-black font-extrabold text-[10px]">TOP_SECRET</span></td>
                <td className="p-2.5 text-[11px]">Audit verification, system configuration, user provisioning.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pillar 3: Engineering Architecture */}
      <div className="p-6 rounded-2xl brutal-card space-y-4">
        <div className="flex items-center gap-2 text-black font-mono text-xs font-bold uppercase pb-2 border-b-2 border-black/10">
          <Binary className="w-4 h-4 text-black stroke-[2.5]" />
          <span>Full-Stack Engineering & Database Cryptography</span>
        </div>

        <ul className="space-y-2 text-xs font-mono text-black">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-black flex-shrink-0 mt-0.5 stroke-[2.5]" />
            <span>
              <strong>React 19 + TypeScript + Brutalism & Glassmorphism:</strong> Web Crypto API SHA-256 calculation, DOM watermarking, and zero-secret client memory retention.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-black flex-shrink-0 mt-0.5 stroke-[2.5]" />
            <span>
              <strong>Statutory Blockchain Audit Ledger:</strong> Immutable SHA-256 block-hash linked list maintaining unforgeable chain of custody.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-black flex-shrink-0 mt-0.5 stroke-[2.5]" />
            <span>
              <strong>MongoDB Atlas Enclave:</strong> Dynamic database configuration with field-level encryption and real-time connectivity status.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
