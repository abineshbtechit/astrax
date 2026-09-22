import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDms } from '../contexts/DmsContext';
import {
  Briefcase,
  FileText,
  Boxes,
  Clock,
  Users,
  Upload,
  ArrowLeft,
  Lock,
  CheckCircle2,
  KeyRound,
  FileLock2,
  Scale,
} from 'lucide-react';
import { CaseStatusBadge, PriorityBadge, ClassificationBadge, IntegrityBadge, WorkflowBadge } from '../components/ui/Badges';
import { UploadDocumentModal } from '../components/modals/UploadDocumentModal';
import { RequestAccessModal } from '../components/modals/RequestAccessModal';
import { CaseStatus, DocumentItem } from '../types';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cases, documents, evidence, timeline, updateCase, evaluateDocumentAccess } = useDms();
  const [activeTab, setActiveTab] = useState<'documents' | 'evidence' | 'timeline' | 'team'>('documents');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDocForRequest, setSelectedDocForRequest] = useState<DocumentItem | null>(null);

  const currentCase = cases.find((c) => c.id === id);

  if (!currentCase) {
    return (
      <div className="py-20 text-center space-y-3 font-mono">
        <h2 className="text-xl font-black text-black">INVESTIGATION DOSSIER NOT FOUND</h2>
        <Link to="/cases" className="text-black hover:underline text-xs font-bold">
          &larr; Return to Investigation Registers
        </Link>
      </div>
    );
  }

  const caseDocs = documents.filter((d) => d.caseId === currentCase.id);
  const caseEvidence = evidence.filter((e) => e.caseId === currentCase.id);
  const caseTimeline = timeline.filter((t) => t.caseId === currentCase.id);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Status Navigation */}
      <div className="flex items-center justify-between font-mono">
        <button
          onClick={() => navigate('/cases')}
          className="flex items-center gap-1.5 text-xs text-black hover:underline transition font-bold"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>INVESTIGATION REGISTERS</span>
        </button>

        {/* Change Case Status Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-black font-bold">STATUS:</span>
          <select
            value={currentCase.status}
            onChange={(e) => updateCase(currentCase.id, { status: e.target.value as CaseStatus })}
            className="bg-white border-2 border-black rounded-xl px-2.5 py-1 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
          >
            <option value="UNDER_INVESTIGATION">Under Investigation</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="CHARGE_SHEET_FILED">Charge Sheet Filed</option>
            <option value="IN_COURT">In Court</option>
            <option value="CLOSED">Case Closed</option>
          </select>
        </div>
      </div>

      {/* Case Header Card */}
      <div className="p-6 rounded-2xl brutal-card space-y-4 font-mono">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-bold text-black bg-[#64EE00] px-2.5 py-0.5 rounded border border-black">
                {currentCase.caseNumber}
              </span>
              <PriorityBadge priority={currentCase.priority} />
              <CaseStatusBadge status={currentCase.status} />
              <span className="text-xs text-black/70">
                Opened: {new Date(currentCase.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl font-black text-black tracking-tight">{currentCase.title}</h1>
            <p className="text-xs text-black/80 leading-relaxed font-sans">{currentCase.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="brutal-btn-green px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>Add Document</span>
            </button>
            <Link
              to="/reports"
              className="px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold border-2 border-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000000]"
            >
              <FileLock2 className="w-4 h-4 text-[#64EE00]" />
              <span>Export Dossier</span>
            </Link>
          </div>
        </div>

        {/* Agency Badges & Metadata row */}
        <div className="pt-4 border-t-2 border-black/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <span className="text-black/60 text-[11px] font-bold">LEAD INVESTIGATOR:</span>{' '}
              <span className="text-black font-bold">{currentCase.investigatingOfficerName}</span>
            </div>
            <div>
              <span className="text-black/60 text-[11px] font-bold">CRIME TYPE:</span>{' '}
              <span className="text-black font-bold">{currentCase.crimeType}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-black/60 text-[11px] font-bold">AGENCIES:</span>
            {currentCase.participatingDepartments.map((dept) => (
              <span key={dept} className="px-2 py-0.5 rounded bg-white text-black font-bold text-[10px] border border-black shadow-[1px_1px_0px_#000000]">
                {dept}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b-2 border-black pb-2 flex items-center gap-2 font-mono flex-wrap">
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition border-2 ${
            activeTab === 'documents'
              ? 'bg-black text-[#64EE00] border-black shadow-[3px_3px_0px_#000000]'
              : 'bg-white text-black border-transparent hover:border-black'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Case Documents ({caseDocs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition border-2 ${
            activeTab === 'evidence'
              ? 'bg-black text-[#64EE00] border-black shadow-[3px_3px_0px_#000000]'
              : 'bg-white text-black border-transparent hover:border-black'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Evidence ({caseEvidence.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition border-2 ${
            activeTab === 'timeline'
              ? 'bg-black text-[#64EE00] border-black shadow-[3px_3px_0px_#000000]'
              : 'bg-white text-black border-transparent hover:border-black'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Timeline ({caseTimeline.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition border-2 ${
            activeTab === 'team'
              ? 'bg-black text-[#64EE00] border-black shadow-[3px_3px_0px_#000000]'
              : 'bg-white text-black border-transparent hover:border-black'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Clearance & Team</span>
        </button>
      </div>

      {/* Tab 1: Documents */}
      {activeTab === 'documents' && (
        <div className="space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black uppercase">
              CONFIDENTIAL CASE REPOSITORY ({caseDocs.length} RECORDS)
            </span>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="brutal-btn-green px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caseDocs.map((doc) => {
              const access = evaluateDocumentAccess(doc);
              return (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl brutal-card space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          to={`/documents/${doc.id}`}
                          className="text-sm font-bold text-black hover:underline truncate block"
                        >
                          {doc.documentName}
                        </Link>
                        <div className="text-[11px] text-black/60 mt-0.5 font-bold">
                          Owner Dept: <strong className="text-black">{doc.ownerDepartment}</strong>
                        </div>
                      </div>
                      <ClassificationBadge classification={doc.classification} size="sm" />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <WorkflowBadge status={doc.workflowStatus} />
                      <IntegrityBadge status={doc.tamperState} showIcon={false} />
                      <span className="text-[10px] px-2 py-0.5 rounded bg-black text-white font-bold">
                        V{doc.currentVersion}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-black font-mono text-[10px] text-black font-bold truncate">
                      SHA-256: {doc.sha256Hash}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-black/10 flex items-center justify-between text-xs">
                    {access.canView ? (
                      <span className="text-black font-bold text-xs flex items-center gap-1 bg-[#64EE00] px-2 py-0.5 rounded border border-black">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        AUTHORIZED
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedDocForRequest(doc)}
                        className="text-black hover:underline font-bold text-xs flex items-center gap-1"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Request Access</span>
                      </button>
                    )}

                    <Link
                      to={`/documents/${doc.id}`}
                      className="px-3 py-1 rounded-xl bg-black text-white hover:bg-neutral-800 text-xs font-bold border border-black shadow-[2px_2px_0px_#000000]"
                    >
                      View &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Evidence */}
      {activeTab === 'evidence' && (
        <div className="space-y-4 font-mono">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {caseEvidence.map((ev) => (
              <div
                key={ev.id}
                onClick={() => navigate(`/evidence/${ev.id}`)}
                className="p-5 rounded-2xl brutal-card space-y-3 cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-black bg-[#64EE00] px-2 py-0.5 rounded border border-black">
                      SEAL #{ev.sealNumber}
                    </span>
                    <IntegrityBadge status={ev.tamperState} />
                  </div>
                  <h3 className="text-sm font-bold text-black">{ev.description || ev.type}</h3>
                  <p className="text-xs text-black/70">{ev.type} &bull; {ev.collectionLocation}</p>
                </div>

                <div className="pt-2 border-t border-black/10 text-[11px]">
                  <div className="flex justify-between">
                    <span>CUSTODIAN:</span>
                    <span className="font-bold text-black">{ev.currentCustodianName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Timeline */}
      {activeTab === 'timeline' && (
        <div className="space-y-4 font-mono">
          <div className="p-6 rounded-2xl brutal-card space-y-4">
            {caseTimeline.map((item, idx) => (
              <div key={item.id || idx} className="flex items-start gap-3 border-l-2 border-black pl-4 py-2 relative">
                <span className="w-3 h-3 rounded-full bg-[#64EE00] border-2 border-black absolute -left-[7px] top-3" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-black">{item.title}</div>
                  <div className="text-xs text-black/70">{item.description}</div>
                  <div className="text-[10px] text-black/50">{new Date(item.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Clearance & Team */}
      {activeTab === 'team' && (
        <div className="space-y-4 font-mono">
          <div className="p-6 rounded-2xl brutal-card space-y-4">
            <h3 className="text-sm font-bold text-black uppercase">Authorized Multi-Agency Taskforce</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {currentCase.participatingDepartments.map((dept) => (
                <div key={dept} className="p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000000]">
                  <div className="text-xs font-bold text-black">{dept}</div>
                  <div className="text-[11px] text-black/60">Inter-agency Clearance Level 3</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <UploadDocumentModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} defaultCaseId={currentCase.id} />
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
