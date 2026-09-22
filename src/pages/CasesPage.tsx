import React, { useState } from 'react';
import { useDms } from '../contexts/DmsContext';
import {
  Briefcase,
  Search,
  Plus,
  Filter,
  ArrowRight,
  Shield,
  FileText,
  Boxes,
  Calendar,
  X,
  AlertCircle,
  GitBranch,
  Clock,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { CaseStatusBadge, PriorityBadge, IntegrityBadge } from '../components/ui/Badges';
import { CasePriority, CaseStatus, Department } from '../types';

export const CasesPage: React.FC = () => {
  const { cases, evidence, createCase, currentUser } = useDms();
  const [activeTab, setActiveTab] = useState<'cases' | 'evidence' | 'chain'>('cases');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const navigate = useNavigate();

  // Form states for creating a new case
  const [newTitle, setNewTitle] = useState('');
  const [newCrimeType, setNewCrimeType] = useState('Cyber Financial Fraud');
  const [newPriority, setNewPriority] = useState<CasePriority>('HIGH');
  const [newDescription, setNewDescription] = useState('');
  const [newDepts, setNewDepts] = useState<Department[]>(['POLICE', 'INVESTIGATION', 'FORENSIC']);

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.crimeType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const filteredEvidence = evidence.filter((ev) =>
    (ev.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (ev.sealNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (ev.evidenceId || '').toLowerCase().includes(search.toLowerCase()) ||
    ev.caseNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createCase({
      title: newTitle.trim(),
      crimeType: newCrimeType,
      priority: newPriority,
      description: newDescription.trim(),
      participatingDepartments: newDepts,
    });

    setIsCreateOpen(false);
    setNewTitle('');
    setNewDescription('');
  };

  const toggleDept = (dept: Department) => {
    setNewDepts((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="brutal-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#64EE00] shadow-[0_0_8px_#64EE00]" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-black bg-[#64EE00] px-2 py-0.5 rounded border border-black">
              EVIDENTIARY REPOSITORY
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-black tracking-tight font-sans">
            Investigation & Evidence Hub
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Multi-agency evidentiary cases, seized physical/digital exhibits, and unbroken chain of custody.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="brutal-btn-green px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Register New Case</span>
          </button>
        </div>
      </div>

      {/* Unified Tab Selector (Reduces Navigation Noise) */}
      <div className="flex items-center justify-between gap-4 border-b-2 border-black pb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('cases')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 ${
              activeTab === 'cases'
                ? 'bg-black text-[#64EE00] border-2 border-black shadow-[3px_3px_0px_#000000]'
                : 'bg-white text-slate-700 border-2 border-transparent hover:border-black'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>CASES ({cases.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 ${
              activeTab === 'evidence'
                ? 'bg-black text-[#64EE00] border-2 border-black shadow-[3px_3px_0px_#000000]'
                : 'bg-white text-slate-700 border-2 border-transparent hover:border-black'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>EXHIBITS & EVIDENCE ({evidence.length})</span>
          </button>

          <Link
            to="/evidence-chain"
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 bg-white text-slate-700 border-2 border-transparent hover:border-black"
          >
            <GitBranch className="w-4 h-4 text-black" />
            <span>CHAIN OF CUSTODY MAP &rarr;</span>
          </Link>
        </div>

        {/* Global Case Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter by name, ID, crime..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-black rounded-xl pl-9 pr-3 py-1.5 text-xs text-black font-medium focus:outline-none shadow-[2px_2px_0px_#000000]"
          />
        </div>
      </div>

      {/* Tab 1: Cases View */}
      {activeTab === 'cases' && (
        <div className="space-y-4">
          {/* Filters row */}
          <div className="p-3.5 brutal-card flex flex-col sm:flex-row gap-3 items-center justify-between">
            <span className="text-xs font-mono font-bold text-black uppercase">
              Showing {filteredCases.length} Investigation Files
            </span>

            <div className="flex items-center gap-2.5 overflow-x-auto w-full sm:w-auto">
              <span className="text-xs font-mono font-bold text-slate-500">STATUS:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border-2 border-black rounded-lg px-2 py-1 text-xs font-mono font-bold text-black focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="UNDER_INVESTIGATION">Under Investigation</option>
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="CHARGE_SHEET_FILED">Charge Sheet Filed</option>
                <option value="IN_COURT">In Court</option>
                <option value="CLOSED">Closed</option>
              </select>

              <span className="text-xs font-mono font-bold text-slate-500 ml-2">PRIORITY:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-white border-2 border-black rounded-lg px-2 py-1 text-xs font-mono font-bold text-black focus:outline-none"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {/* Cases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCases.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/cases/${c.id}`)}
                className="p-5 rounded-2xl border-2 border-black bg-white hover:bg-slate-50 cursor-pointer transition space-y-4 group flex flex-col justify-between shadow-[4px_4px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000]"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-extrabold text-black bg-slate-100 px-2 py-0.5 rounded border border-black">
                          {c.caseNumber}
                        </span>
                        <PriorityBadge priority={c.priority} />
                      </div>
                      <h3 className="text-base font-bold text-black group-hover:text-black transition">
                        {c.title}
                      </h3>
                    </div>
                    <CaseStatusBadge status={c.status} />
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-medium">
                    {c.description}
                  </p>
                </div>

                <div className="pt-3 border-t-2 border-black/10 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-700">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-mono font-bold">
                        <FileText className="w-3.5 h-3.5 text-black" />
                        {c.documentsCount} Docs
                      </span>
                      <span className="flex items-center gap-1 font-mono font-bold">
                        <Boxes className="w-3.5 h-3.5 text-black" />
                        {c.evidenceCount} Exhibits
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      Lead: {c.investigatingOfficerName}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 flex-wrap">
                      {c.participatingDepartments.map((dept) => (
                        <span
                          key={dept}
                          className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 text-black border border-black rounded"
                        >
                          {dept}
                        </span>
                      ))}
                    </div>

                    <span className="text-xs font-mono font-bold text-black flex items-center gap-1 group-hover:underline">
                      Inspect &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Evidence Exhibits View */}
      {activeTab === 'evidence' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvidence.map((ev) => (
              <div
                key={ev.id}
                onClick={() => navigate(`/evidence/${ev.id}`)}
                className="p-5 rounded-2xl border-2 border-black bg-white hover:bg-slate-50 cursor-pointer transition space-y-3 shadow-[4px_4px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-black bg-[#64EE00] px-2 py-0.5 rounded border border-black">
                      {ev.sealNumber || ev.evidenceId}
                    </span>
                    <IntegrityBadge status={ev.tamperState} />
                  </div>

                  <h3 className="text-sm font-bold text-black group-hover:text-black">
                    {ev.description || ev.type}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2">{ev.type} &bull; {ev.collectionLocation}</p>
                </div>

                <div className="pt-2 border-t-2 border-black/10 space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>CUSTODIAN:</span>
                    <span className="font-bold text-black">{ev.currentCustodianName}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>CASE:</span>
                    <span className="text-black">{ev.caseNumber}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Case Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white border-2 border-black shadow-[8px_8px_0px_#000000] rounded-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-black text-white px-6 py-4 flex items-center justify-between border-b-2 border-black">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#64EE00]" />
                <h3 className="font-extrabold text-sm font-mono uppercase tracking-tight">
                  Register New Investigation Case
                </h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-black mb-1">
                  CASE TITLE
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CBI vs Crypto Syndicate 902"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border-2 border-black rounded-xl text-sm font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-black mb-1">
                    CRIME TYPE
                  </label>
                  <select
                    value={newCrimeType}
                    onChange={(e) => setNewCrimeType(e.target.value)}
                    className="w-full p-2 bg-slate-50 border-2 border-black rounded-xl text-xs font-medium focus:outline-none"
                  >
                    <option value="Cyber Financial Fraud">Cyber Financial Fraud</option>
                    <option value="Data Breach & Espionage">Data Breach & Espionage</option>
                    <option value="Crypto Extortion">Crypto Extortion</option>
                    <option value="Identity Theft">Identity Theft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-black mb-1">
                    PRIORITY
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border-2 border-black rounded-xl text-xs font-medium focus:outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-black mb-1">
                  BRIEF INCIDENT SUMMARY
                </label>
                <textarea
                  rows={3}
                  placeholder="Details of seizure, initial FIR, or court directive..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border-2 border-black rounded-xl text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 brutal-btn-green rounded-xl text-xs font-mono font-bold uppercase tracking-wider mt-4"
              >
                Register & Open Case Enclave
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
