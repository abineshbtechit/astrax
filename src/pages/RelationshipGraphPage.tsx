import React, { useState } from 'react';
import { useDms } from '../contexts/DmsContext';
import {
  Share2,
  Briefcase,
  FileText,
  Boxes,
  Users,
  Info,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface GraphNode {
  id: string;
  label: string;
  type: 'CASE' | 'DOCUMENT' | 'EVIDENCE' | 'PERSON' | 'ORGANIZATION';
  x: number;
  y: number;
  data: any;
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
}

export const RelationshipGraphPage: React.FC = () => {
  const { cases, documents, evidence } = useDms();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Build graph nodes
  const nodes: GraphNode[] = [
    // Case 1 Hub
    {
      id: 'case-1',
      label: 'CR-2026-0842 (Silverline Exfiltration)',
      type: 'CASE',
      x: 400,
      y: 220,
      data: cases[0],
    },
    // Case 2 Hub
    {
      id: 'case-2',
      label: 'CR-2026-1109 (ShadowGrid SCADA)',
      type: 'CASE',
      x: 750,
      y: 420,
      data: cases[1],
    },
    // Documents
    {
      id: 'doc-1',
      label: 'FIR No. 441/2026',
      type: 'DOCUMENT',
      x: 230,
      y: 120,
      data: documents[0],
    },
    {
      id: 'doc-2',
      label: 'Forensic Memory Dump Analysis',
      type: 'DOCUMENT',
      x: 550,
      y: 110,
      data: documents[1],
    },
    {
      id: 'doc-3',
      label: 'Witness Deposition (CTO)',
      type: 'DOCUMENT',
      x: 230,
      y: 330,
      data: documents[2],
    },
    {
      id: 'doc-4',
      label: 'Draft Charge Sheet & Prima Facie',
      type: 'DOCUMENT',
      x: 430,
      y: 380,
      data: documents[3],
    },
    // Evidence
    {
      id: 'ev-1',
      label: 'NVMe SSD (Samsung 990 Pro)',
      type: 'EVIDENCE',
      x: 580,
      y: 240,
      data: evidence[0],
    },
    {
      id: 'ev-2',
      label: 'iPhone 15 Pro (Seized)',
      type: 'EVIDENCE',
      x: 300,
      y: 230,
      data: evidence[1],
    },
    // Persons & Organizations
    {
      id: 'person-1',
      label: 'Vikram Aditya (Key Suspect)',
      type: 'PERSON',
      x: 100,
      y: 220,
      data: { role: 'Ex-VP of Security Architecture', status: 'Arrested & In Custody' },
    },
    {
      id: 'org-1',
      label: 'Silverline Technologies Corp',
      type: 'ORGANIZATION',
      x: 350,
      y: 50,
      data: { sector: 'Enterprise FinTech', status: 'Complainant Entity' },
    },
    {
      id: 'org-2',
      label: 'DarkLeak Syndicate',
      type: 'ORGANIZATION',
      x: 720,
      y: 200,
      data: { sector: 'Threat Actor Group', status: 'Coordinated Cyber Intruders' },
    },
  ];

  // Links
  const links: GraphLink[] = [
    { source: 'case-1', target: 'org-1', label: 'Complainant' },
    { source: 'case-1', target: 'doc-1', label: 'Primary FIR' },
    { source: 'case-1', target: 'doc-2', label: 'CFSL Report' },
    { source: 'case-1', target: 'doc-3', label: 'Deposition' },
    { source: 'case-1', target: 'doc-4', label: 'Charge Sheet' },
    { source: 'case-1', target: 'ev-1', label: 'Seized Disk' },
    { source: 'case-1', target: 'ev-2', label: 'Seized Phone' },
    { source: 'ev-1', target: 'doc-2', label: 'Forensic Source' },
    { source: 'person-1', target: 'ev-2', label: 'Owned Device' },
    { source: 'person-1', target: 'case-1', label: 'Prime Accused' },
    { source: 'doc-2', target: 'org-2', label: 'IP Attributed' },
    { source: 'case-2', target: 'org-2', label: 'Common Exploit' },
  ];

  const filteredNodes =
    filterType === 'ALL'
      ? nodes
      : nodes.filter((n) => n.type === filterType || n.type === 'CASE');

  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Share2 className="w-5 h-5 text-black stroke-[2.5]" />
            <h1 className="text-xl font-black text-black tracking-tight uppercase">
              Evidentiary Entity Relationship Graph
            </h1>
          </div>
          <p className="text-xs text-black/70">
            Interactive visual topology connecting cases, suspects, corporate entities, evidence items, and documents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-black font-bold">FILTER:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border-2 border-black rounded-xl px-3 py-1.5 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_#000000]"
          >
            <option value="ALL">Show All Entity Nodes</option>
            <option value="CASE">Cases</option>
            <option value="DOCUMENT">Documents</option>
            <option value="EVIDENCE">Evidence</option>
            <option value="PERSON">Persons & Suspects</option>
            <option value="ORGANIZATION">Organizations</option>
          </select>
        </div>
      </div>

      {/* Main Canvas & Details Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SVG Graph Canvas (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl bg-white border-2 border-black p-4 relative overflow-hidden shadow-[4px_4px_0px_#000000] min-h-[520px]">
          {/* Legend */}
          <div className="absolute top-4 left-4 z-10 p-2.5 rounded-xl bg-white/95 border-2 border-black flex items-center gap-3 text-[11px] font-mono font-bold flex-wrap shadow-[2px_2px_0px_#000000]">
            <span className="flex items-center gap-1 text-black">
              <span className="w-2.5 h-2.5 rounded-full bg-black" /> CASE
            </span>
            <span className="flex items-center gap-1 text-black">
              <span className="w-2.5 h-2.5 rounded-full bg-[#64EE00] border border-black" /> DOCUMENT
            </span>
            <span className="flex items-center gap-1 text-black">
              <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-black" /> EVIDENCE
            </span>
            <span className="flex items-center gap-1 text-black">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" /> PERSON
            </span>
            <span className="flex items-center gap-1 text-black">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" /> ORG
            </span>
          </div>

          <svg viewBox="0 0 900 500" className="w-full h-full min-h-[480px]">
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="900" height="500" fill="url(#grid)" />

            {/* Links */}
            {links.map((link, idx) => {
              const src = nodes.find((n) => n.id === link.source);
              const tgt = nodes.find((n) => n.id === link.target);
              if (!src || !tgt) return null;

              const isHighlighted =
                selectedNode &&
                (selectedNode.id === src.id || selectedNode.id === tgt.id);

              return (
                <g key={idx}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={isHighlighted ? '#000000' : '#94a3b8'}
                    strokeWidth={isHighlighted ? 3 : 1.5}
                    strokeDasharray={link.label === 'Common Exploit' ? '4,4' : undefined}
                    className="transition-all duration-300"
                  />
                  <text
                    x={(src.x + tgt.x) / 2}
                    y={(src.y + tgt.y) / 2 - 4}
                    fill={isHighlighted ? '#000000' : '#64748b'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {link.label}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isCase = node.type === 'CASE';
              const isDoc = node.type === 'DOCUMENT';

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  {/* Glow halo */}
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="28"
                      fill="#64EE00"
                      opacity="0.4"
                    />
                  )}
                  {/* Outer circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isCase ? 22 : 16}
                    fill={isCase ? '#000000' : isDoc ? '#64EE00' : '#ffffff'}
                    stroke="#000000"
                    strokeWidth={isSelected ? 3.5 : 2}
                  />
                  {/* Inner dot */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isCase ? 8 : 5}
                    fill={isCase ? '#64EE00' : '#000000'}
                  />
                  {/* Text label */}
                  <text
                    x={node.x}
                    y={node.y + (isCase ? 36 : 28)}
                    fill="#000000"
                    fontSize="10"
                    fontWeight={isSelected ? '900' : 'bold'}
                    textAnchor="middle"
                    className="select-none pointer-events-none"
                  >
                    {node.label.length > 25 ? `${node.label.slice(0, 24)}...` : node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Entity Inspector Sidebar (1 col) */}
        <div className="rounded-2xl brutal-card p-5 space-y-4 shadow-[4px_4px_0px_#000000]">
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-black stroke-[2.5]" />
              <h3 className="text-xs font-mono font-black uppercase tracking-wider text-black">
                Entity Inspector
              </h3>
            </div>
            {selectedNode && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black text-[#64EE00] font-bold">
                {selectedNode.type}
              </span>
            )}
          </div>

          {!selectedNode ? (
            <div className="py-16 text-center text-xs text-black/60 space-y-2">
              <Share2 className="w-8 h-8 text-black/40 mx-auto" />
              <p>Click on any node in the relationship graph to inspect details, connected exhibits, and dossiers.</p>
            </div>
          ) : (
            <div className="space-y-4 text-xs font-mono">
              <div>
                <span className="text-[10px] text-black/60 uppercase font-bold">Selected Record</span>
                <h4 className="text-sm font-black text-black mt-0.5">{selectedNode.label}</h4>
              </div>

              {selectedNode.type === 'CASE' && (
                <div className="space-y-2.5 p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000000]">
                  <div>
                    <span className="text-black/60 font-bold">Case Number:</span>{' '}
                    <strong className="text-black">{selectedNode.data?.caseNumber}</strong>
                  </div>
                  <div>
                    <span className="text-black/60 font-bold">Crime Type:</span>{' '}
                    <span className="text-black">{selectedNode.data?.crimeType}</span>
                  </div>
                  <div>
                    <span className="text-black/60 font-bold">Status:</span>{' '}
                    <span className="text-black">{selectedNode.data?.status}</span>
                  </div>
                  <Link
                    to={`/cases/${selectedNode.data?.id}`}
                    className="block text-center mt-2 px-3 py-1.5 rounded-xl bg-[#64EE00] text-black font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000]"
                  >
                    Open Dossier &rarr;
                  </Link>
                </div>
              )}

              {selectedNode.type === 'DOCUMENT' && (
                <div className="space-y-2.5 p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000000]">
                  <div>
                    <span className="text-black/60 font-bold">Classification:</span>{' '}
                    <span className="text-black font-bold">{selectedNode.data?.classification}</span>
                  </div>
                  <div>
                    <span className="text-black/60 font-bold">Owner Dept:</span>{' '}
                    <span className="text-black font-bold">{selectedNode.data?.ownerDepartment}</span>
                  </div>
                  <div>
                    <span className="text-black/60 font-bold">SHA-256:</span>{' '}
                    <code className="text-[10px] text-black block break-all font-mono font-bold">
                      {selectedNode.data?.sha256Hash}
                    </code>
                  </div>
                  <Link
                    to={`/documents/${selectedNode.data?.id}`}
                    className="block text-center mt-2 px-3 py-1.5 rounded-xl bg-black text-white hover:bg-neutral-800 font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000]"
                  >
                    Inspect Document &rarr;
                  </Link>
                </div>
              )}

              {selectedNode.type === 'EVIDENCE' && (
                <div className="space-y-2.5 p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000000]">
                  <div>
                    <span className="text-black/60 font-bold">Seal Number:</span>{' '}
                    <span className="text-black font-bold">{selectedNode.data?.sealNumber}</span>
                  </div>
                  <div>
                    <span className="text-black/60 font-bold">Current Custodian:</span>{' '}
                    <span className="text-black font-bold">{selectedNode.data?.currentCustodianName}</span>
                  </div>
                  <div>
                    <span className="text-black/60 font-bold">Storage Location:</span>{' '}
                    <span className="text-black font-bold">{selectedNode.data?.storageLocation}</span>
                  </div>
                  <Link
                    to={`/evidence/${selectedNode.data?.id}`}
                    className="block text-center mt-2 px-3 py-1.5 rounded-xl bg-[#64EE00] text-black font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000]"
                  >
                    Custody Timeline &rarr;
                  </Link>
                </div>
              )}

              {(selectedNode.type === 'PERSON' || selectedNode.type === 'ORGANIZATION') && (
                <div className="space-y-2.5 p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000000]">
                  <div>
                    <span className="text-black/60 font-bold">Role / Sector:</span>{' '}
                    <span className="text-black font-bold">{selectedNode.data?.role || selectedNode.data?.sector}</span>
                  </div>
                  <div>
                    <span className="text-black/60 font-bold">Status:</span>{' '}
                    <span className="text-black font-bold">{selectedNode.data?.status}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
