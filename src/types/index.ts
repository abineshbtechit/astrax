export type Role =
  | 'ADMIN'
  | 'SUPER_ADMIN'
  | 'POLICE_OFFICER'
  | 'INVESTIGATION_OFFICER'
  | 'FORENSIC_OFFICER'
  | 'LAWYER'
  | 'COURT_OFFICER'
  | 'AUDITOR'
  | 'SECURITY_OFFICER'
  | 'DEPARTMENT_ADMIN';

export type Department =
  | 'POLICE'
  | 'INVESTIGATION'
  | 'FORENSIC'
  | 'LEGAL'
  | 'COURT'
  | 'SECURITY'
  | 'ADMINISTRATION';

export type Classification = 'CONFIDENTIAL' | 'RESTRICTED' | 'PUBLIC_RECORD';

export type DocumentType =
  | 'FIR'
  | 'POLICE_REPORT'
  | 'INVESTIGATION_REPORT'
  | 'WITNESS_STATEMENT'
  | 'CHARGE_SHEET'
  | 'COURT_FILING'
  | 'EVIDENCE'
  | 'FORENSIC_REPORT'
  | 'LEGAL_NOTICE'
  | 'JUDGMENT'
  | 'OTHER';

export type WorkflowStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SIGNED'
  | 'FINAL';

export type CaseStatus =
  | 'UNDER_INVESTIGATION'
  | 'PENDING_REVIEW'
  | 'CHARGE_SHEET_FILED'
  | 'IN_COURT'
  | 'CLOSED';

export type CasePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type CaseAccessLevel = 'READ_ONLY' | 'READ_WRITE' | 'CASE_OWNER';

export type PermissionType = 'VIEW' | 'DOWNLOAD' | 'VERSION_UPLOAD' | 'SHARE';

export type EvidenceStatus =
  | 'COLLECTED'
  | 'SEALED'
  | 'IN_CUSTODY'
  | 'TRANSFERRED'
  | 'RECEIVED'
  | 'EXAMINED'
  | 'RELEASED'
  | 'ARCHIVED';

export type IntegrityStatus = 'VALID' | 'TAMPERED' | 'UNVERIFIED';

export type SignatureStatus = 'SIGNED' | 'NOT_SIGNED' | 'SIGNATURE_INVALID';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertStatus = 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  department: Department;
  badgeNumber: string;
  active: boolean;
  mfaEnabled: boolean;
  isMfaEnabled?: boolean;
  mfaSecret?: string;
  backupCodes?: string[];
  isMfaVerified?: boolean;
  requireMfaOnFirstLogin?: boolean;
  faceBiometricData?: string;
  faceHash?: string;
  isFaceEnrolled?: boolean;
  securityClearance: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'TOP_SECRET';
  createdAt: string;
}

export interface CaseMember {
  userId: string;
  fullName: string;
  role: Role;
  department: Department;
  accessLevel: CaseAccessLevel;
  assignedAt: string;
}

export interface Case {
  id: string;
  caseNumber: string; // e.g. "CR-2026-0842"
  title: string;
  crimeType: string;
  description: string;
  location: string;
  status: CaseStatus;
  priority: CasePriority;
  ownerDepartment: Department;
  investigatingOfficerId: string;
  investigatingOfficerName: string;
  participatingDepartments: Department[];
  members: CaseMember[];
  documentsCount: number;
  evidenceCount: number;
  firNumber?: string;
  jurisdictionCourt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersion {
  id?: string;
  versionNumber: number; // 1, 2, 3...
  storageKey: string;
  hash: string; // SHA-256
  sha256Hash?: string;
  uploaderId: string;
  uploaderName: string;
  uploadedByName?: string;
  uploaderRole: Role;
  uploaderDepartment: Department;
  uploadedByDepartment?: Department;
  sizeBytes: number;
  changeDescription: string;
  createdAt: string;
  uploadedAt?: string;
}

export interface DocumentAccessGrant {
  id: string;
  documentId: string;
  granteeType: 'USER' | 'DEPARTMENT' | 'ROLE';
  granteeId: string; // userId, department name, or role name
  granteeName: string;
  granteeDepartment?: Department;
  permissions: PermissionType[];
  purpose: string;
  startAt: string;
  expiresAt: string | null;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  grantedBy: string;
  grantedByName: string;
  grantedAt: string;
  revokedAt?: string;
  revokedBy?: string;
}

export interface AccessRequest {
  id: string;
  documentId: string;
  documentName: string;
  caseNumber: string;
  requesterId: string;
  requesterName: string;
  requestingUserName?: string;
  requesterRole: Role;
  requestingRole?: Role;
  requesterDepartment: Department;
  requestingDepartment?: Department;
  ownerDepartment?: Department;
  requestedPermissions: PermissionType[];
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewerId?: string;
  reviewerName?: string;
  reviewComment?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface DigitalSignature {
  id: string;
  documentId: string;
  versionNumber: number;
  signerId: string;
  signerName: string;
  signerRole: Role;
  signerDepartment: Department;
  documentHash: string;
  signatureValue: string; // PKI signature token
  certificateIssuer: string;
  certificateDetails?: {
    commonName?: string;
    issuer?: string;
    serialNumber?: string;
    validity?: string;
    algorithm?: string;
    validFrom?: string;
    validTo?: string;
  };
  signedDigest?: string;
  status: SignatureStatus;
  signedAt: string;
}

export interface DocumentItem {
  id: string;
  documentId?: string;
  caseId: string;
  caseNumber: string;
  caseTitle: string;
  documentName: string;
  originalFilename: string;
  type: DocumentType;
  classification: Classification;
  mimeType: string;
  sizeBytes: number;
  sha256Hash: string;
  originalHash: string; // Used for tamper simulation
  tamperState: IntegrityStatus;
  currentVersion: number;
  versions: DocumentVersion[];
  ownerUserId: string;
  ownerUserName: string;
  ownerDepartment: Department;
  workflowStatus: WorkflowStatus;
  signatureStatus: SignatureStatus;
  signature?: DigitalSignature;
  signatures?: DigitalSignature[];
  isSigned?: boolean;
  fileContent?: string;
  encryptionAlgorithm: string; // e.g. "AES-256-GCM"
  ocrStatus: 'COMPLETED' | 'PENDING' | 'FAILED' | 'SKIPPED';
  extractedText?: string;
  accessGrants: DocumentAccessGrant[];
  isLegalHold: boolean;
  retentionExpiryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceTransfer {
  id: string;
  evidenceId: string;
  fromUserId: string;
  fromUserName: string;
  fromDepartment: Department;
  toUserId: string;
  toUserName: string;
  toDepartment: Department;
  reason: string;
  transferTime: string;
  timestamp?: string;
  location: string;
  conditionBefore: string;
  conditionAfter?: string;
  signatureToken: string;
  status: 'PENDING_RECEIPT' | 'COMPLETED' | 'REJECTED';
  receivedAt?: string;
}

export interface EvidenceItem {
  id: string;
  evidenceId: string; // "EVD-2026-0042"
  caseId: string;
  caseNumber: string;
  type: string;
  description: string;
  collectorId: string;
  collectorName: string;
  collectorDepartment: Department;
  collectionLocation: string;
  collectionDateTime: string;
  sealNumber: string;
  condition: string;
  currentCustodianId: string;
  currentCustodianName: string;
  currentCustodianDepartment: Department;
  currentDepartment?: Department;
  storageLocation?: string;
  status: EvidenceStatus;
  digitalHash?: string;
  tamperState: IntegrityStatus;
  transfers: EvidenceTransfer[];
  chainOfCustody?: EvidenceTransfer[];
  isLabAnalyzed: boolean;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  caseNumber: string;
  eventType:
    | 'CASE_CREATED'
    | 'OFFICER_ASSIGNED'
    | 'DEPARTMENT_ADDED'
    | 'DOCUMENT_UPLOADED'
    | 'DOCUMENT_SHARED'
    | 'ACCESS_APPROVED'
    | 'EVIDENCE_COLLECTED'
    | 'EVIDENCE_TRANSFERRED'
    | 'FORENSIC_REPORT_UPLOADED'
    | 'DOCUMENT_SIGNED'
    | 'DOCUMENT_APPROVED'
    | 'COURT_FILED'
    | 'JUDGMENT_UPLOADED'
    | 'CASE_STATUS_CHANGED'
    | 'SECURITY_ALERT';
  title: string;
  description: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  actorDepartment: Department;
  timestamp: string;
  relatedResourceId?: string;
  relatedResourceType?: 'DOCUMENT' | 'EVIDENCE' | 'CASE' | 'USER';
}

export interface RelationshipNode {
  id: string;
  label: string;
  type: 'CASE' | 'DOCUMENT' | 'EVIDENCE' | 'PERSON' | 'LOCATION' | 'VEHICLE' | 'ORGANIZATION';
  subType?: string;
  department?: Department;
  status?: string;
  x?: number;
  y?: number;
}

export interface RelationshipEdge {
  id: string;
  source: string;
  target: string;
  label: string; // e.g. "INVOLVED_IN", "SUPPORTS", "COLLECTED", "BELONGS_TO", "OCCURRED_AT"
  type?: string;
}

export interface AuditLog {
  id: string;
  sequenceNumber: number;
  blockIndex?: number;
  actorId: string;
  actorName: string;
  actorBadgeNumber?: string;
  actorRole: Role;
  actorDepartment: Department;
  action: string;
  resourceType: 'CASE' | 'DOCUMENT' | 'EVIDENCE' | 'USER' | 'AUTH' | 'SECURITY';
  resourceId: string;
  resourceName: string;
  caseId?: string;
  caseNumber?: string;
  ipAddress: string;
  result: 'SUCCESS' | 'DENIED' | 'FAILED' | 'TAMPER_ALERT';
  status?: string;
  description: string;
  details?: Record<string, any>;
  timestamp: string;
  previousHash: string;
  currentHash: string;
}

export interface SecurityAlert {
  id: string;
  alertType:
    | 'TAMPER_DETECTED'
    | 'UNAUTHORIZED_ACCESS_ATTEMPT'
    | 'MULTIPLE_FAILED_LOGINS'
    | 'RAPID_DOWNLOADS'
    | 'EVIDENCE_SEAL_BREACH'
    | 'SUSPICIOUS_CROSS_DEPT_PROBE';
  type?: string;
  severity: AlertSeverity;
  actorId?: string;
  actorName?: string;
  actorDepartment?: Department;
  description: string;
  message?: string;
  details?: Record<string, any>;
  relatedResourceId?: string;
  relatedResourceType?: string;
  resourceId?: string;
  resourceType?: string;
  detectedAt: string;
  timestamp?: string;
  status: AlertStatus;
  resolutionNotes?: string;
  resolvedBy?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'SHARE' | 'REQUEST' | 'APPROVAL' | 'EVIDENCE' | 'SECURITY' | 'SIGNATURE';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface CaseReport {
  id: string;
  caseId: string;
  caseNumber: string;
  caseTitle: string;
  reportType: 'INVESTIGATION_DOSSIER' | 'EVIDENCE_CUSTODY_LEDGER' | 'COMPLIANCE_AUDIT_SUMMARY';
  generatedBy: string;
  generatedByName: string;
  generatedByDepartment: Department;
  generatedAt: string;
  content: {
    executiveSummary: string;
    timelineMilestones: string[];
    evidenceList: { id: string; desc: string; custodian: string; hash: string }[];
    documentsList: { name: string; type: string; version: number; hash: string; status: string }[];
    auditTrailCount: number;
    integrityVerified: boolean;
  };
  sha256Digest: string;
  digitalSeal: string;
}
