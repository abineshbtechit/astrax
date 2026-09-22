import React, { useState } from 'react';
import { useDms } from '../contexts/DmsContext';
import {
  FileText,
  Search,
  Upload,
  Filter,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  KeyRound,
  Eye,
  Download,
  PenTool,
  Clock,
  Check,
  Bot,
  Sparkles,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ClassificationBadge, IntegrityBadge, WorkflowBadge } from '../components/ui/Badges';
import { UploadDocumentModal } from '../components/modals/UploadDocumentModal';
import { RequestAccessModal } from '../components/modals/RequestAccessModal';
import { Classification, Department, DocumentItem, WorkflowStatus } from '../types';
import { triggerAiChat } from '../components/layout/AppLayout';

export const DocumentsPage: React.FC = () => {
  const { documents, accessRequests, evaluateDocumentAccess, currentUser } = useDms();
  const [activeTab, setActiveTab] = useState<'documents' | 'signatures' | 'access'>('documents');
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDocForRequest, setSelectedDocForRequest] = useState<DocumentItem | null>(null);
  const navigate = useNavigate();

  const filteredDocs = documents.filter((doc) => {
    const q = search.toLowerCase();
    const matchesSearch =
      doc.documentName.toLowerCase().includes(q) ||
      doc.caseNumber.toLowerCase().includes(q) ||
      doc.sha256Hash.toLowerCase().includes(q) ||
      (doc.extractedText && doc.extractedText.toLowerCase().includes(q));

    const matchesClass = classFilter === 'ALL' || doc.classification === classFilter;
    const matchesDept = deptFilter === 'ALL' || doc.ownerDepartment === deptFilter;

    return matchesSearch && matchesClass && matchesDept;
  });

  const tamperedCount = documents.filter((d) => d.tamperState === 'TAMPERED').length;
  const pendingRequests = accessRequests.filter((r) => r.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="brutal-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#64EE00] shadow-[0_0_8px_#64EE00]" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-black bg-[#64EE00] px-2 py-0.5 rounded border border-black">
              VAULT LEVEL 4 • TAMPER-SEALED
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-black tracking-tight font-sans">
            Confidential Legal Vault & Signatures
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Cryptographically sealed repository with Section 65B certifications and cross-department ACL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerAiChat()}
            className="px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 bg-black text-[#64EE00] hover:bg-neutral-800 border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer"
            title="Open Azure AI Chatbot"
          >
            <Bot className="w-4 h-4 stroke-[2.5]" />
            <span>AI Assistant</span>
            <Sparkles className="w-3.5 h-3.5 text-[#64EE00]" />
          </button>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="brutal-btn-green px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-black stroke-[3]" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Unified Tab Selector */}
      <div className="flex items-center justify-between gap-4 border-b-2 border-black pb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 ${
              activeTab === 'documents'
                ? 'bg-black text-[#64EE00] border-2 border-black shadow-[3px_3px_0px_#000000]'
                : 'bg-white text-slate-700 border-2 border-transparent hover:border-black'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>ALL VAULTED FILES ({documents.length})</span>
          </button>

          <Link
            to="/signatures"
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 bg-white text-slate-700 border-2 border-transparent hover:border-black"
          >
            <PenTool className="w-4 h-4 text-black" />
            <span>DIGITAL SIGNATURES &rarr;</span>
          </Link>

          <Link
            to="/access-requests"
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 bg-white text-slate-700 border-2 border-transparent hover:border-black"
          >
            <KeyRound className="w-4 h-4 text-black" />
            <span>
              ACCESS REQUESTS {pendingRequests.length > 0 && `(${pendingRequests.length})`} &rarr;
            </span>
          </Link>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search documents or SHA hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-black rounded-xl pl-9 pr-3 py-1.5 text-xs text-black font-medium focus:outline-none shadow-[2px_2px_0px_#000000]"
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-3.5 brutal-card flex flex-col sm:flex-row gap-3 items-center justify-between">
        <span className="text-xs font-mono font-bold text-black uppercase">
          Showing {filteredDocs.length} Vaulted Documents
        </span>

        <div className="flex items-center gap-2.5 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs font-mono font-bold text-slate-500">SECURITY LEVEL:</span>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="bg-white border-2 border-black rounded-lg px-2 py-1 text-xs font-mono font-bold text-black focus:outline-none"
          >
            <option value="ALL">All Levels</option>
            <option value="TOP_SECRET">Top Secret</option>
            <option value="SECRET">Secret</option>
            <option value="CONFIDENTIAL">Confidential</option>
            <option value="RESTRICTED">Restricted</option>
          </select>

          <span className="text-xs font-mono font-bold text-slate-500 ml-2">DEPARTMENT:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-white border-2 border-black rounded-lg px-2 py-1 text-xs font-mono font-bold text-black focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="POLICE">Police</option>
            <option value="INVESTIGATION">Investigation</option>
            <option value="FORENSIC">Forensic</option>
            <option value="PROSECUTION">Prosecution</option>
            <option value="JUDICIARY">Judiciary</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map((doc) => {
          const access = evaluateDocumentAccess(doc, currentUser);
          return (
            <div
              key={doc.id}
              className="p-5 rounded-2xl border-2 border-black bg-white hover:bg-slate-50 transition space-y-4 shadow-[4px_4px_0px_#000000] flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold text-black bg-slate-100 px-2 py-0.5 rounded border border-black">
                    {doc.caseNumber}
                  </span>
                  <ClassificationBadge classification={doc.classification} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-black tracking-tight line-clamp-1">
                    {doc.documentName}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-500">{doc.originalFilename}</p>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 border border-black/10 font-mono text-[10px] text-slate-700 truncate">
                  <span className="text-slate-500 mr-1">SHA:</span>
                  <span className="font-bold text-black">{doc.sha256Hash.substring(0, 20)}...</span>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-black/10 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
                  <span>DEPT: {doc.ownerDepartment}</span>
                  <IntegrityBadge status={doc.tamperState} />
                </div>

                <div className="flex items-center justify-between gap-2">
                  {access.canView ? (
                    <Link
                      to={`/documents/${doc.id}`}
                      className="w-full py-2 bg-black text-white rounded-xl text-xs font-mono font-bold hover:bg-[#64EE00] hover:text-black transition flex items-center justify-center gap-1.5 border-2 border-black"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>INSPECT VAULT</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => setSelectedDocForRequest(doc)}
                      className="w-full py-2 bg-white text-black border-2 border-black rounded-xl text-xs font-mono font-bold hover:bg-black hover:text-white transition flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000000]"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>REQUEST CLEARANCE</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <UploadDocumentModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      {selectedDocForRequest && (
        <RequestAccessModal
          document={selectedDocForRequest}
          isOpen={true}
          onClose={() => setSelectedDocForRequest(null)}
        />
      )}
    </div>
  );
};
