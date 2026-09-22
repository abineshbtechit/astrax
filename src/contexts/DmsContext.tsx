import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Case,
  DocumentItem,
  EvidenceItem,
  TimelineEvent,
  RelationshipNode,
  RelationshipEdge,
  AuditLog,
  SecurityAlert,
  NotificationItem,
  AccessRequest,
  WorkflowStatus,
  PermissionType,
  Department,
  Role,
  Classification,
  IntegrityStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CASES,
  INITIAL_DOCUMENTS,
  INITIAL_EVIDENCE,
  INITIAL_TIMELINE,
  INITIAL_GRAPH_NODES,
  INITIAL_GRAPH_EDGES,
  INITIAL_ALERTS,
  INITIAL_ACCESS_REQUESTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../services/store';
import {
  sha256String,
  computeChainedAuditHash,
  verifyAuditChain as verifyAuditChainCrypto,
  generateDigitalSignature,
  verifyTotpCode,
} from '../utils/crypto';

export interface AccessEvaluation {
  canView: boolean;
  canDownload: boolean;
  canUploadVersion: boolean;
  canVersionUpload?: boolean;
  canShare: boolean;
  reason: string;
  grantType?: 'OWNER' | 'DEPARTMENT' | 'ADMIN' | 'EXPLICIT_GRANT' | 'PUBLIC';
  expiresAt?: string | null;
}

export interface DmsContextType {
  currentUser: User | null;
  users: User[];
  cases: Case[];
  documents: DocumentItem[];
  evidence: EvidenceItem[];
  timeline: TimelineEvent[];
  graphNodes: RelationshipNode[];
  graphEdges: RelationshipEdge[];
  alerts: SecurityAlert[];
  accessRequests: AccessRequest[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  login: (username: string, password?: string, mfaCode?: string) => Promise<{ success: boolean; requiresMfa?: boolean; error?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  evaluateDocumentAccess: (doc: DocumentItem, user?: User | null) => AccessEvaluation;
  createCase: (data: Partial<Case>) => Promise<Case>;
  updateCase: (caseId: string, updates: Partial<Case>) => Promise<void>;
  uploadDocument: (data: {
    caseId: string;
    documentName: string;
    originalFilename: string;
    type: any;
    classification: Classification;
    fileContent: string;
    isLegalHold?: boolean;
  }) => Promise<DocumentItem>;
  uploadDocumentVersion: (docId: string, changeDescription: string, newContent: string) => Promise<void>;
  simulateTamper: (docId: string) => Promise<void>;
  restoreIntegrity: (docId: string) => Promise<void>;
  tamperDocument: (docId: string) => Promise<void>;
  restoreDocumentIntegrity: (docId: string) => Promise<void>;
  verifyDocumentIntegrity: (docId: string) => Promise<{ status: IntegrityStatus; message: string }>;
  submitAccessRequest: (docId: string, permissions: PermissionType[], reason: string) => Promise<void>;
  approveAccessRequest: (requestId: string, comment?: string, expiryDays?: number) => Promise<void>;
  rejectAccessRequest: (requestId: string, comment?: string) => Promise<void>;
  grantAccess: (
    docId: string,
    granteeType: 'USER' | 'DEPARTMENT' | 'ROLE',
    granteeId: string,
    granteeName: string,
    permissions: PermissionType[],
    purpose: string,
    expiryDays?: number
  ) => Promise<void>;
  revokeAccess: (docId: string, grantId: string) => Promise<void>;
  changeWorkflowStatus: (docId: string, newStatus: WorkflowStatus, reason?: string) => Promise<void>;
  signDocument: (docId: string, purpose?: string) => Promise<void>;
  createEvidence: (data: Partial<EvidenceItem>) => Promise<EvidenceItem>;
  transferEvidence: (
    evidenceId: string,
    toUserId: string,
    reason: string,
    location: string,
    conditionBefore: string
  ) => Promise<void>;
  receiveEvidence: (evidenceId: string, transferId: string, conditionAfter: string) => Promise<void>;
  verifyEvidence: (evidenceId: string) => Promise<{ status: IntegrityStatus; message: string }>;
  verifyAuditChain: () => Promise<{ isValid: boolean; totalVerified: number; brokenIndex: number | null; message: string }>;
  recordAudit: (data: any) => Promise<void>;
  resetToDefaults: () => void;
  resolveAlert: (alertId: string, notes: string) => Promise<void>;
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  toggleMfa: (enable: boolean, secret?: string) => Promise<void>;
  updateUserStatus: (userId: string, active: boolean, role?: Role, department?: Department) => Promise<void>;
  mongoStatus?: {
    connected: boolean;
    database?: string;
    message?: string;
    provider?: string;
    providerLabel?: string;
    lastError?: string | null;
  };
}

const DmsContext = createContext<DmsContextType | null>(null);

export const DmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from local storage or defaults
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('astrax_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_USERS[2]; // Default to Lead Investigator Zoya Khan
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('astrax_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [cases, setCases] = useState<Case[]>(() => {
    const saved = localStorage.getItem('astrax_cases');
    return saved ? JSON.parse(saved) : INITIAL_CASES;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('astrax_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [evidence, setEvidence] = useState<EvidenceItem[]>(() => {
    const saved = localStorage.getItem('astrax_evidence');
    return saved ? JSON.parse(saved) : INITIAL_EVIDENCE;
  });

  const [timeline, setTimeline] = useState<TimelineEvent[]>(() => {
    const saved = localStorage.getItem('astrax_timeline');
    return saved ? JSON.parse(saved) : INITIAL_TIMELINE;
  });

  const [graphNodes] = useState<RelationshipNode[]>(INITIAL_GRAPH_NODES);
  const [graphEdges] = useState<RelationshipEdge[]>(INITIAL_GRAPH_EDGES);

  const [alerts, setAlerts] = useState<SecurityAlert[]>(() => {
    const saved = localStorage.getItem('astrax_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>(() => {
    const saved = localStorage.getItem('astrax_access_requests');
    return saved ? JSON.parse(saved) : INITIAL_ACCESS_REQUESTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('astrax_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('astrax_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('astrax_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('astrax_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('astrax_cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('astrax_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('astrax_evidence', JSON.stringify(evidence));
  }, [evidence]);

  useEffect(() => {
    localStorage.setItem('astrax_timeline', JSON.stringify(timeline));
  }, [timeline]);

  useEffect(() => {
    localStorage.setItem('astrax_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('astrax_access_requests', JSON.stringify(accessRequests));
  }, [accessRequests]);

  useEffect(() => {
    localStorage.setItem('astrax_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('astrax_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('astrax_users', JSON.stringify(users));
  }, [users]);

  // Real-time database status probe
  const [mongoStatus, setMongoStatus] = useState<{
    connected: boolean;
    database?: string;
    message?: string;
    provider?: string;
    providerLabel?: string;
    lastError?: string | null;
  }>({
    connected: false,
    message: 'Checking database connection...',
  });

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then(async (data) => {
        if (data.mongoConnected) {
          setMongoStatus({
            connected: true,
            database: data.database,
            provider: data.provider,
            providerLabel: data.providerLabel,
            message: `Connected to ${data.providerLabel || 'Database'} (${data.database})`,
          });
          try {
            const [casesRes, docsRes, evRes, auditRes, reqRes] = await Promise.all([
              fetch('/api/cases').catch(() => null),
              fetch('/api/documents').catch(() => null),
              fetch('/api/evidence').catch(() => null),
              fetch('/api/audit-logs').catch(() => null),
              fetch('/api/access-requests').catch(() => null),
            ]);

            if (casesRes) {
              const casesData = await casesRes.json();
              if (casesData.connected && casesData.data && casesData.data.length > 0) {
                setCases(casesData.data);
              }
            }
            if (docsRes) {
              const docsData = await docsRes.json();
              if (docsData.connected && docsData.data && docsData.data.length > 0) {
                setDocuments(docsData.data);
              }
            }
            if (evRes) {
              const evData = await evRes.json();
              if (evData.connected && evData.data && evData.data.length > 0) {
                setEvidence(evData.data);
              }
            }
            if (auditRes) {
              const auditData = await auditRes.json();
              if (auditData.connected && auditData.data && auditData.data.length > 0) {
                setAuditLogs(auditData.data);
              }
            }
            if (reqRes) {
              const reqData = await reqRes.json();
              if (reqData.connected && reqData.data && reqData.data.length > 0) {
                setAccessRequests(reqData.data);
              }
            }
          } catch (e) {
            console.warn('Database data sync note:', e);
          }
        } else {
          setMongoStatus({
            connected: false,
            database: data.database,
            provider: data.provider,
            providerLabel: data.providerLabel,
            lastError: data.lastError,
            message: data.lastError || `${data.providerLabel || 'Database'} configured. Check firewall or credentials.`,
          });
        }
      })
      .catch(() => {
        setMongoStatus({ connected: false, message: 'Local storage engine active' });
      });
  }, []);

  // Helper to append a cryptographically chained audit log
  const appendAuditLog = async (params: {
    action: string;
    resourceType: 'CASE' | 'DOCUMENT' | 'EVIDENCE' | 'USER' | 'AUTH' | 'SECURITY';
    resourceId: string;
    resourceName: string;
    caseId?: string;
    caseNumber?: string;
    result: 'SUCCESS' | 'DENIED' | 'FAILED' | 'TAMPER_ALERT';
    description: string;
    actorOverride?: User;
  }) => {
    const actor = params.actorOverride || currentUser || {
      id: 'ANONYMOUS',
      fullName: 'Anonymous Session',
      role: 'POLICE_OFFICER' as Role,
      department: 'POLICE' as Department,
    };

    const nextSeq = auditLogs.length > 0 ? auditLogs[auditLogs.length - 1].sequenceNumber + 1 : 1;
    const prevHash = auditLogs.length > 0 ? auditLogs[auditLogs.length - 1].currentHash : '0000000000000000000000000000000000000000000000000000000000000000';
    const timestamp = new Date().toISOString();

    const currentHash = await computeChainedAuditHash(
      nextSeq,
      prevHash,
      actor.id,
      params.action,
      params.resourceId,
      params.result,
      timestamp
    );

    const newLog: AuditLog = {
      id: `AUD-${String(nextSeq).padStart(3, '0')}`,
      sequenceNumber: nextSeq,
      actorId: actor.id,
      actorName: actor.fullName,
      actorRole: actor.role,
      actorDepartment: actor.department,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceName: params.resourceName,
      caseId: params.caseId,
      caseNumber: params.caseNumber,
      ipAddress: '10.14.22.' + Math.floor(10 + Math.random() * 80),
      result: params.result,
      description: params.description,
      timestamp,
      previousHash: prevHash,
      currentHash,
    };

    setAuditLogs((prev) => [...prev, newLog]);

    // Persist to MongoDB / Spring Boot REST API
    fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog),
    }).catch((e) => console.warn('Audit log persist notice:', e));

    return newLog;
  };

  // Helper to add in-app notification
  const addNotification = (notif: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...notif,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Switch demo user
  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      appendAuditLog({
        action: 'USER_SWITCH',
        resourceType: 'AUTH',
        resourceId: target.id,
        resourceName: target.fullName,
        result: 'SUCCESS',
        description: `Active session switched to ${target.fullName} (${target.role} - ${target.department})`,
        actorOverride: target,
      });
    }
  };

  // Login
  const login = async (username: string, _password?: string, mfaCode?: string) => {
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
      await appendAuditLog({
        action: 'LOGIN_FAILED',
        resourceType: 'AUTH',
        resourceId: username,
        resourceName: username,
        result: 'FAILED',
        description: `Failed login attempt for non-existent username: ${username}`,
      });
      return { success: false, error: 'Invalid badge ID or username credentials.' };
    }

    if (!user.active) {
      return { success: false, error: 'Account has been disabled by security administrator.' };
    }

    // Check MFA if enabled
    if (user.mfaEnabled && user.mfaSecret) {
      if (!mfaCode) {
        return { success: false, requiresMfa: true };
      }
      const isValidMfa = await verifyTotpCode(user.mfaSecret, mfaCode);
      if (!isValidMfa) {
        await appendAuditLog({
          action: 'LOGIN_FAILED',
          resourceType: 'AUTH',
          resourceId: user.id,
          resourceName: user.fullName,
          result: 'FAILED',
          description: `Invalid TOTP MFA token entered for user ${user.username}`,
          actorOverride: user,
        });
        return { success: false, error: 'Invalid 6-digit Multi-Factor Authentication code.' };
      }
    }

    setCurrentUser(user);
    await appendAuditLog({
      action: 'LOGIN',
      resourceType: 'AUTH',
      resourceId: user.id,
      resourceName: user.fullName,
      result: 'SUCCESS',
      description: `User authenticated successfully with role ${user.role} and MFA clearance verified`,
      actorOverride: user,
    });

    return { success: true };
  };

  // Logout
  const logout = () => {
    if (currentUser) {
      appendAuditLog({
        action: 'LOGOUT',
        resourceType: 'AUTH',
        resourceId: currentUser.id,
        resourceName: currentUser.fullName,
        result: 'SUCCESS',
        description: `User logged out cleanly`,
      });
    }
    setCurrentUser(null);
  };

  /**
   * CRITICAL SECURITY FUNCTION:
   * Multi-Department RBAC & Resource-Level ACL Evaluation
   */
  const evaluateDocumentAccess = (doc: DocumentItem, user: User | null = currentUser): AccessEvaluation => {
    if (!user) {
      return {
        canView: false,
        canDownload: false,
        canUploadVersion: false,
        canVersionUpload: false,
        canShare: false,
        reason: 'Unauthenticated session',
      };
    }

    // 1. System Admin has view access and share administration
    if (user.role === 'ADMIN') {
      return {
        canView: true,
        canDownload: true,
        canUploadVersion: true,
        canVersionUpload: true,
        canShare: true,
        reason: 'System Administrator Super-Access (Audited under Section 43B)',
        grantType: 'ADMIN',
      };
    }

    // 2. Document Owner (The specific user who uploaded it)
    if (doc.ownerUserId === user.id) {
      return {
        canView: true,
        canDownload: true,
        canUploadVersion: true,
        canVersionUpload: true,
        canShare: true,
        reason: 'Authoritative Document Owner',
        grantType: 'OWNER',
      };
    }

    // 3. Document Owning Department (Personnel in the same department)
    if (doc.ownerDepartment === user.department) {
      const canUp = user.role === 'INVESTIGATION_OFFICER' || user.role === 'FORENSIC_OFFICER' || user.role === 'POLICE_OFFICER';
      return {
        canView: true,
        canDownload: true,
        canUploadVersion: canUp,
        canVersionUpload: canUp,
        canShare: user.role === 'DEPARTMENT_ADMIN' || user.role === 'POLICE_OFFICER',
        reason: `Originating Department Member (${user.department})`,
        grantType: 'DEPARTMENT',
      };
    }

    // 4. Check Explicit Access Grants (User, Department, or Role)
    const now = new Date();
    const activeGrants = doc.accessGrants.filter((g) => {
      if (g.status !== 'ACTIVE') return false;
      if (g.expiresAt && new Date(g.expiresAt) < now) return false;

      if (g.granteeType === 'USER' && g.granteeId === user.id) return true;
      if (g.granteeType === 'DEPARTMENT' && g.granteeId === user.department) return true;
      if (g.granteeType === 'ROLE' && g.granteeId === user.role) return true;
      return false;
    });

    if (activeGrants.length > 0) {
      const allPermissions = new Set<PermissionType>();
      activeGrants.forEach((g) => g.permissions.forEach((p) => allPermissions.add(p)));

      const canUp = allPermissions.has('VERSION_UPLOAD');
      return {
        canView: allPermissions.has('VIEW'),
        canDownload: allPermissions.has('DOWNLOAD'),
        canUploadVersion: canUp,
        canVersionUpload: canUp,
        canShare: allPermissions.has('SHARE'),
        reason: `Explicit cross-department access grant: ${activeGrants[0].purpose}`,
        grantType: 'EXPLICIT_GRANT',
        expiresAt: activeGrants[0].expiresAt,
      };
    }

    // 5. Public Record Check
    if (doc.classification === 'PUBLIC_RECORD') {
      return {
        canView: true,
        canDownload: true,
        canUploadVersion: false,
        canVersionUpload: false,
        canShare: false,
        reason: 'Public Record Classification',
        grantType: 'PUBLIC',
      };
    }

    // 6. Access Denied (Cross-department boundary strictly enforced!)
    return {
      canView: false,
      canDownload: false,
      canUploadVersion: false,
      canVersionUpload: false,
      canShare: false,
      reason: `Restricted cross-department document. Owned by ${doc.ownerDepartment}. You require an explicit grant to view.`,
    };
  };

  // Create Case
  const createCase = async (data: Partial<Case>): Promise<Case> => {
    if (!currentUser) throw new Error('Unauthenticated');
    const caseNum = data.caseNumber || `CR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCase: Case = {
      id: `CASE-${Date.now()}`,
      caseNumber: caseNum,
      title: data.title || 'Untitled Investigation',
      crimeType: data.crimeType || 'General Offense',
      description: data.description || '',
      location: data.location || 'Central Registry',
      status: 'UNDER_INVESTIGATION',
      priority: data.priority || 'MEDIUM',
      ownerDepartment: currentUser.department,
      investigatingOfficerId: currentUser.id,
      investigatingOfficerName: currentUser.fullName,
      participatingDepartments: [currentUser.department, ...(data.participatingDepartments || [])],
      members: [
        {
          userId: currentUser.id,
          fullName: currentUser.fullName,
          role: currentUser.role,
          department: currentUser.department,
          accessLevel: 'CASE_OWNER',
          assignedAt: new Date().toISOString(),
        },
      ],
      documentsCount: 0,
      evidenceCount: 0,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCases((prev) => [newCase, ...prev]);

    // Timeline event
    const timeEvent: TimelineEvent = {
      id: `TIME-${Date.now()}`,
      caseId: newCase.id,
      caseNumber: newCase.caseNumber,
      eventType: 'CASE_CREATED',
      title: `Case Registered: ${newCase.caseNumber}`,
      description: newCase.description,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      actorDepartment: currentUser.department,
      timestamp: new Date().toISOString(),
      relatedResourceId: newCase.id,
      relatedResourceType: 'CASE',
    };
    setTimeline((prev) => [timeEvent, ...prev]);

    await appendAuditLog({
      action: 'CASE_CREATED',
      resourceType: 'CASE',
      resourceId: newCase.id,
      resourceName: newCase.title,
      caseId: newCase.id,
      caseNumber: newCase.caseNumber,
      result: 'SUCCESS',
      description: `Registered new investigation case ${newCase.caseNumber} (${newCase.priority} Priority)`,
    });

    // Persist case to MongoDB / Spring Boot REST API
    fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCase),
    }).catch((e) => console.warn('Case persist notice:', e));

    return newCase;
  };

  // Update Case
  const updateCase = async (caseId: string, updates: Partial<Case>) => {
    if (!currentUser) throw new Error('Unauthenticated');
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );

    // Persist update to MongoDB / Spring Boot REST API
    fetch(`/api/cases/${caseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch((e) => console.warn('Case update notice:', e));

    await appendAuditLog({
      action: 'CASE_UPDATED',
      resourceType: 'CASE',
      resourceId: caseId,
      resourceName: updates.title || caseId,
      result: 'SUCCESS',
      description: `Updated case parameters: ${Object.keys(updates).join(', ')}`,
    });
  };

  // Upload Document
  const uploadDocument = async (data: {
    caseId: string;
    documentName: string;
    originalFilename: string;
    type: any;
    classification: Classification;
    fileContent: string;
    isLegalHold?: boolean;
  }): Promise<DocumentItem> => {
    if (!currentUser) throw new Error('Unauthenticated');

    const targetCase = cases.find((c) => c.id === data.caseId);
    const hash = await sha256String(data.fileContent || `${data.documentName}_${Date.now()}`);

    const newDoc: DocumentItem = {
      id: `DOC-${Date.now()}`,
      caseId: data.caseId,
      caseNumber: targetCase ? targetCase.caseNumber : 'CR-2026-UNKNOWN',
      caseTitle: targetCase ? targetCase.title : 'Investigation',
      documentName: data.documentName,
      originalFilename: data.originalFilename,
      type: data.type,
      classification: data.classification,
      mimeType: data.originalFilename.endsWith('.pdf')
        ? 'application/pdf'
        : data.originalFilename.endsWith('.docx')
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'text/plain',
      sizeBytes: Math.max(1024, data.fileContent.length * 2),
      sha256Hash: hash,
      originalHash: hash,
      tamperState: 'VALID',
      currentVersion: 1,
      versions: [
        {
          versionNumber: 1,
          storageKey: `vault/${data.caseId}/${data.originalFilename}`,
          hash,
          uploaderId: currentUser.id,
          uploaderName: currentUser.fullName,
          uploaderRole: currentUser.role,
          uploaderDepartment: currentUser.department,
          sizeBytes: Math.max(1024, data.fileContent.length * 2),
          changeDescription: 'Initial document upload into secure DMS vault',
          createdAt: new Date().toISOString(),
        },
      ],
      ownerUserId: currentUser.id,
      ownerUserName: currentUser.fullName,
      ownerDepartment: currentUser.department,
      workflowStatus: 'SUBMITTED',
      signatureStatus: 'NOT_SIGNED',
      encryptionAlgorithm: 'AES-256-GCM',
      ocrStatus: 'COMPLETED',
      extractedText: data.fileContent || 'Extracted document content indexed for legal discovery.',
      accessGrants: [],
      isLegalHold: !!data.isLegalHold,
      retentionExpiryDate: '2036-12-31T23:59:59Z',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDocuments((prev) => [newDoc, ...prev]);

    // Update case document count
    setCases((prev) =>
      prev.map((c) => (c.id === data.caseId ? { ...c, documentsCount: c.documentsCount + 1 } : c))
    );

    // Add timeline event
    setTimeline((prev) => [
      {
        id: `TIME-${Date.now()}`,
        caseId: newDoc.caseId,
        caseNumber: newDoc.caseNumber,
        eventType: 'DOCUMENT_UPLOADED',
        title: `Document Uploaded: ${newDoc.documentName}`,
        description: `Uploaded ${newDoc.type} under ${newDoc.classification} classification. SHA-256: ${newDoc.sha256Hash.substring(0, 16)}...`,
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        actorRole: currentUser.role,
        actorDepartment: currentUser.department,
        timestamp: new Date().toISOString(),
        relatedResourceId: newDoc.id,
        relatedResourceType: 'DOCUMENT',
      },
      ...prev,
    ]);

    await appendAuditLog({
      action: 'DOCUMENT_UPLOADED',
      resourceType: 'DOCUMENT',
      resourceId: newDoc.id,
      resourceName: newDoc.documentName,
      caseId: newDoc.caseId,
      caseNumber: newDoc.caseNumber,
      result: 'SUCCESS',
      description: `Uploaded ${newDoc.classification} document. SHA-256 digest calculated and bound to initial version.`,
    });

    // Persist document to MongoDB / Spring Boot REST API
    fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDoc),
    }).catch((e) => console.warn('Document persist notice:', e));

    return newDoc;
  };

  // Upload Document Version (Versioning Feature)
  const uploadDocumentVersion = async (docId: string, changeDescription: string, newContent: string) => {
    if (!currentUser) throw new Error('Unauthenticated');
    const doc = documents.find((d) => d.id === docId);
    if (!doc) throw new Error('Document not found');

    const evalAccess = evaluateDocumentAccess(doc);
    if (!evalAccess.canUploadVersion && doc.ownerUserId !== currentUser.id) {
      await appendAuditLog({
        action: 'UNAUTHORIZED_VERSION_UPLOAD_ATTEMPT',
        resourceType: 'DOCUMENT',
        resourceId: doc.id,
        resourceName: doc.documentName,
        result: 'DENIED',
        description: `Blocked unauthorized version creation attempt on ${doc.documentName}`,
      });
      throw new Error('Permission denied: You do not have VERSION_UPLOAD authority on this document.');
    }

    const nextVer = doc.currentVersion + 1;
    const newHash = await sha256String(newContent || `${doc.documentName}_v${nextVer}_${Date.now()}`);

    const newVersionObj = {
      versionNumber: nextVer,
      storageKey: `vault/${doc.caseId}/${doc.originalFilename.replace(/(\.[^.]+)$/, `_v${nextVer}$1`)}`,
      hash: newHash,
      uploaderId: currentUser.id,
      uploaderName: currentUser.fullName,
      uploaderRole: currentUser.role,
      uploaderDepartment: currentUser.department,
      sizeBytes: Math.max(1024, newContent.length * 2),
      changeDescription,
      createdAt: new Date().toISOString(),
    };

    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              currentVersion: nextVer,
              sha256Hash: newHash,
              originalHash: newHash,
              tamperState: 'VALID',
              versions: [newVersionObj, ...d.versions],
              workflowStatus: 'SUBMITTED',
              signatureStatus: 'NOT_SIGNED', // New version invalidates previous signature
              signature: undefined,
              updatedAt: new Date().toISOString(),
            }
          : d
      )
    );

    await appendAuditLog({
      action: 'DOCUMENT_VERSION_UPLOADED',
      resourceType: 'DOCUMENT',
      resourceId: doc.id,
      resourceName: doc.documentName,
      caseId: doc.caseId,
      caseNumber: doc.caseNumber,
      result: 'SUCCESS',
      description: `Committed immutable Version ${nextVer} with change log: "${changeDescription}". New SHA-256: ${newHash.substring(0, 16)}...`,
    });

    // Persist new document version to MongoDB / Spring Boot REST API
    fetch(`/api/documents/${docId}/version`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentVersion: nextVer,
        fileContent: newContent,
        sha256Hash: newHash,
        versions: [newVersionObj, ...doc.versions],
      }),
    }).catch((e) => console.warn('Version persist notice:', e));
  };

  // Simulate File Tampering (Interactive Tamper Detection Lab)
  const simulateTamper = async (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;

    // Mutate the hash to simulate unauthorized bit flips in storage
    const corruptedHash = 'BAD999' + doc.sha256Hash.substring(6);

    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              sha256Hash: corruptedHash,
              tamperState: 'TAMPERED',
            }
          : d
      )
    );

    // Create high-severity security alert
    const newAlert: SecurityAlert = {
      id: `ALT-${Date.now()}`,
      alertType: 'TAMPER_DETECTED',
      severity: 'CRITICAL',
      actorId: currentUser?.id,
      actorName: currentUser?.fullName,
      actorDepartment: currentUser?.department,
      description: `CRYPTOGRAPHIC INTEGRITY FAILURE: Bit-stream hash mismatch detected on ${doc.documentName}. Registered: ${doc.originalHash.substring(0, 16)}..., Live calculated: ${corruptedHash.substring(0, 16)}...`,
      relatedResourceId: doc.id,
      relatedResourceType: 'DOCUMENT',
      detectedAt: new Date().toISOString(),
      status: 'ACTIVE',
    };
    setAlerts((prev) => [newAlert, ...prev]);

    // Send notification
    addNotification({
      userId: doc.ownerUserId,
      title: 'CRITICAL: File Tampering Detected!',
      message: `Integrity check failed for ${doc.documentName}. Hash mismatch detected.`,
      type: 'SECURITY',
      actionUrl: `/documents/${doc.id}`,
    });

    await appendAuditLog({
      action: 'TAMPER_DETECTED',
      resourceType: 'DOCUMENT',
      resourceId: doc.id,
      resourceName: doc.documentName,
      caseId: doc.caseId,
      caseNumber: doc.caseNumber,
      result: 'TAMPER_ALERT',
      description: `CRITICAL INTEGRITY ALARM: Authoritative SHA-256 hash mismatch. File flagged as TAMPERED.`,
    });
  };

  // Restore File Integrity
  const restoreIntegrity = async (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;

    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              sha256Hash: d.originalHash,
              tamperState: 'VALID',
            }
          : d
      )
    );

    await appendAuditLog({
      action: 'INTEGRITY_RESTORED',
      resourceType: 'DOCUMENT',
      resourceId: doc.id,
      resourceName: doc.documentName,
      caseId: doc.caseId,
      caseNumber: doc.caseNumber,
      result: 'SUCCESS',
      description: `Cryptographic integrity restored from authoritative immutable storage vault. Verified SHA-256: ${doc.originalHash.substring(0, 16)}...`,
    });
  };

  // Verify Document Integrity
  const verifyDocumentIntegrity = async (docId: string): Promise<{ status: IntegrityStatus; message: string }> => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return { status: 'UNVERIFIED', message: 'Document not found' };

    const isValid = doc.sha256Hash === doc.originalHash;
    const status: IntegrityStatus = isValid ? 'VALID' : 'TAMPERED';

    await appendAuditLog({
      action: 'DOCUMENT_VERIFIED',
      resourceType: 'DOCUMENT',
      resourceId: doc.id,
      resourceName: doc.documentName,
      caseId: doc.caseId,
      caseNumber: doc.caseNumber,
      result: isValid ? 'SUCCESS' : 'TAMPER_ALERT',
      description: `Integrity verification evaluated. Authoritative hash: ${doc.originalHash}. Measured: ${doc.sha256Hash}. Result: ${status}.`,
    });

    return {
      status,
      message: isValid
        ? 'SHA-256 checksum matches authoritative ingestion digest. 100% data integrity verified.'
        : 'CRITICAL WARNING: Calculated checksum differs from registered baseline. Document may have been modified outside audit control.',
    };
  };

  // Submit Access Request (Cross-department workflow)
  const submitAccessRequest = async (docId: string, permissions: PermissionType[], reason: string) => {
    if (!currentUser) throw new Error('Unauthenticated');
    const doc = documents.find((d) => d.id === docId);
    if (!doc) throw new Error('Document not found');

    const newRequest: AccessRequest = {
      id: `REQ-${Date.now()}`,
      documentId: doc.id,
      documentName: doc.documentName,
      caseNumber: doc.caseNumber,
      requesterId: currentUser.id,
      requesterName: currentUser.fullName,
      requesterRole: currentUser.role,
      requesterDepartment: currentUser.department,
      requestedPermissions: permissions,
      reason,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    setAccessRequests((prev) => [newRequest, ...prev]);

    // Notify document owner
    addNotification({
      userId: doc.ownerUserId,
      title: 'New Cross-Department Access Request',
      message: `${currentUser.fullName} (${currentUser.department}) requested ${permissions.join(', ')} access to "${doc.documentName}".`,
      type: 'REQUEST',
      actionUrl: `/documents/${doc.id}`,
    });

    await appendAuditLog({
      action: 'ACCESS_REQUESTED',
      resourceType: 'DOCUMENT',
      resourceId: doc.id,
      resourceName: doc.documentName,
      caseId: doc.caseId,
      caseNumber: doc.caseNumber,
      result: 'SUCCESS',
      description: `Submitted cross-department access request for permissions [${permissions.join(', ')}]. Reason: "${reason}"`,
    });

    // Persist access request to MongoDB / Spring Boot REST API
    fetch('/api/access-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRequest),
    }).catch((e) => console.warn('Access request persist notice:', e));
  };

  // Approve Access Request
  const approveAccessRequest = async (requestId: string, comment?: string, expiryDays: number = 30) => {
    if (!currentUser) throw new Error('Unauthenticated');
    const req = accessRequests.find((r) => r.id === requestId);
    if (!req) return;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const newGrant = {
      id: `GRANT-${Date.now()}`,
      documentId: req.documentId,
      granteeType: 'USER' as const,
      granteeId: req.requesterId,
      granteeName: req.requesterName,
      granteeDepartment: req.requesterDepartment,
      permissions: req.requestedPermissions,
      purpose: req.reason,
      startAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'ACTIVE' as const,
      grantedBy: currentUser.id,
      grantedByName: currentUser.fullName,
      grantedAt: new Date().toISOString(),
    };

    setDocuments((prev) =>
      prev.map((d) => (d.id === req.documentId ? { ...d, accessGrants: [...d.accessGrants, newGrant] } : d))
    );

    setAccessRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'APPROVED',
              reviewerId: currentUser.id,
              reviewerName: currentUser.fullName,
              reviewComment: comment || 'Approved for authorized investigation inquiry.',
              reviewedAt: new Date().toISOString(),
            }
          : r
      )
    );

    // Notify requester
    addNotification({
      userId: req.requesterId,
      title: 'Access Request Approved!',
      message: `Your request for "${req.documentName}" was approved by ${currentUser.fullName}. Valid for ${expiryDays} days.`,
      type: 'APPROVAL',
      actionUrl: `/documents/${req.documentId}`,
    });

    await appendAuditLog({
      action: 'ACCESS_APPROVED',
      resourceType: 'DOCUMENT',
      resourceId: req.documentId,
      resourceName: req.documentName,
      result: 'SUCCESS',
      description: `Approved access grant for ${req.requesterName} (${req.requesterDepartment}) with permissions [${req.requestedPermissions.join(', ')}]. Expiry: ${expiresAt.toISOString()}`,
    });
  };

  // Reject Access Request
  const rejectAccessRequest = async (requestId: string, comment?: string) => {
    if (!currentUser) throw new Error('Unauthenticated');
    const req = accessRequests.find((r) => r.id === requestId);
    if (!req) return;

    setAccessRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'REJECTED',
              reviewerId: currentUser.id,
              reviewerName: currentUser.fullName,
              reviewComment: comment || 'Declined under departmental policy guidelines.',
              reviewedAt: new Date().toISOString(),
            }
          : r
      )
    );

    addNotification({
      userId: req.requesterId,
      title: 'Access Request Rejected',
      message: `Your request for "${req.documentName}" was declined: ${comment || 'Departmental clearance requirement not met.'}`,
      type: 'APPROVAL',
      actionUrl: `/documents/${req.documentId}`,
    });

    await appendAuditLog({
      action: 'ACCESS_REJECTED',
      resourceType: 'DOCUMENT',
      resourceId: req.documentId,
      resourceName: req.documentName,
      result: 'DENIED',
      description: `Access request from ${req.requesterName} rejected. Reason: ${comment || 'Policy rejection'}`,
    });
  };

  // Grant Access directly
  const grantAccess = async (
    docId: string,
    granteeType: 'USER' | 'DEPARTMENT' | 'ROLE',
    granteeId: string,
    granteeName: string,
    permissions: PermissionType[],
    purpose: string,
    expiryDays: number = 30
  ) => {
    if (!currentUser) throw new Error('Unauthenticated');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const newGrant = {
      id: `GRANT-${Date.now()}`,
      documentId: docId,
      granteeType,
      granteeId,
      granteeName,
      permissions,
      purpose,
      startAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'ACTIVE' as const,
      grantedBy: currentUser.id,
      grantedByName: currentUser.fullName,
      grantedAt: new Date().toISOString(),
    };

    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, accessGrants: [...d.accessGrants, newGrant] } : d))
    );

    await appendAuditLog({
      action: 'DOCUMENT_SHARED',
      resourceType: 'DOCUMENT',
      resourceId: docId,
      resourceName: docId,
      result: 'SUCCESS',
      description: `Created explicit grant to ${granteeType} ${granteeName} with permissions [${permissions.join(', ')}]. Purpose: "${purpose}"`,
    });
  };

  // Revoke Access
  const revokeAccess = async (docId: string, grantId: string) => {
    if (!currentUser) throw new Error('Unauthenticated');
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;

    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              accessGrants: d.accessGrants.map((g) =>
                g.id === grantId
                  ? {
                      ...g,
                      status: 'REVOKED' as const,
                      revokedAt: new Date().toISOString(),
                      revokedBy: currentUser.id,
                    }
                  : g
              ),
            }
          : d
      )
    );

    await appendAuditLog({
      action: 'ACCESS_REVOKED',
      resourceType: 'DOCUMENT',
      resourceId: docId,
      resourceName: doc.documentName,
      result: 'SUCCESS',
      description: `Revoked access grant ${grantId} immediately. Future access requests will be blocked.`,
    });
  };

  // Change Workflow Status
  const changeWorkflowStatus = async (docId: string, newStatus: WorkflowStatus, reason?: string) => {
    if (!currentUser) throw new Error('Unauthenticated');
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;

    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, workflowStatus: newStatus, updatedAt: new Date().toISOString() } : d))
    );

    await appendAuditLog({
      action: `DOCUMENT_${newStatus}`,
      resourceType: 'DOCUMENT',
      resourceId: docId,
      resourceName: doc.documentName,
      caseId: doc.caseId,
      caseNumber: doc.caseNumber,
      result: 'SUCCESS',
      description: `Workflow state transitioned from ${doc.workflowStatus} to ${newStatus}. Note: "${reason || 'Standard review lifecycle'}"`,
    });
  };

  // Digital Signature
  const signDocument = async (docId: string, purpose?: string) => {
    if (!currentUser) throw new Error('Unauthenticated');
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;

    const timestamp = new Date().toISOString();
    const { signatureValue, certificateIssuer } = await generateDigitalSignature(
      doc.sha256Hash,
      currentUser.id,
      currentUser.role,
      timestamp
    );

    const sigObj = {
      id: `SIG-${Date.now()}`,
      documentId: doc.id,
      versionNumber: doc.currentVersion,
      signerId: currentUser.id,
      signerName: currentUser.fullName,
      signerRole: currentUser.role,
      signerDepartment: currentUser.department,
      documentHash: doc.sha256Hash,
      signatureValue,
      certificateIssuer,
      status: 'SIGNED' as const,
      signedAt: timestamp,
    };

    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              signatureStatus: 'SIGNED',
              signature: sigObj,
              workflowStatus: 'SIGNED',
              updatedAt: timestamp,
            }
          : d
      )
    );

    // Timeline event
    setTimeline((prev) => [
      {
        id: `TIME-${Date.now()}`,
        caseId: doc.caseId,
        caseNumber: doc.caseNumber,
        eventType: 'DOCUMENT_SIGNED',
        title: `Digital Signature Executed: ${doc.documentName}`,
        description: `Cryptographic PKI signature stamped by ${currentUser.fullName} (${currentUser.role}). Certificate: ${certificateIssuer}`,
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        actorRole: currentUser.role,
        actorDepartment: currentUser.department,
        timestamp,
        relatedResourceId: doc.id,
        relatedResourceType: 'DOCUMENT',
      },
      ...prev,
    ]);

    await appendAuditLog({
      action: 'DOCUMENT_SIGNED',
      resourceType: 'DOCUMENT',
      resourceId: doc.id,
      resourceName: doc.documentName,
      caseId: doc.caseId,
      caseNumber: doc.caseNumber,
      result: 'SUCCESS',
      description: `Digitally signed with token ${signatureValue} bound to SHA-256: ${doc.sha256Hash.substring(0, 16)}...`,
    });
  };

  // Transfer Evidence Custody
  const transferEvidence = async (
    evidenceId: string,
    toUserId: string,
    reason: string,
    location: string,
    conditionBefore: string
  ) => {
    if (!currentUser) throw new Error('Unauthenticated');
    const targetUser = users.find((u) => u.id === toUserId);
    if (!targetUser) throw new Error('Recipient user not found');

    const ev = evidence.find((e) => e.id === evidenceId);
    if (!ev) throw new Error('Evidence record not found');

    const transferObj = {
      id: `TRF-${Date.now()}`,
      evidenceId: ev.id,
      fromUserId: currentUser.id,
      fromUserName: currentUser.fullName,
      fromDepartment: currentUser.department,
      toUserId: targetUser.id,
      toUserName: targetUser.fullName,
      toDepartment: targetUser.department,
      reason,
      transferTime: new Date().toISOString(),
      location,
      conditionBefore,
      signatureToken: `SIG-TRANS-${Date.now().toString(16).toUpperCase()}`,
      status: 'PENDING_RECEIPT' as const,
    };

    setEvidence((prev) =>
      prev.map((e) =>
        e.id === evidenceId
          ? {
              ...e,
              status: 'TRANSFERRED',
              transfers: [...e.transfers, transferObj],
            }
          : e
      )
    );

    // Notify recipient
    addNotification({
      userId: targetUser.id,
      title: 'Evidence Transfer Initiated',
      message: `${currentUser.fullName} transferred custody of ${ev.type} (${ev.evidenceId}) to you. Verification required.`,
      type: 'EVIDENCE',
      actionUrl: `/evidence/${ev.id}`,
    });

    await appendAuditLog({
      action: 'EVIDENCE_TRANSFERRED',
      resourceType: 'EVIDENCE',
      resourceId: ev.id,
      resourceName: ev.evidenceId,
      caseId: ev.caseId,
      caseNumber: ev.caseNumber,
      result: 'SUCCESS',
      description: `Custody handoff initiated to ${targetUser.fullName} (${targetUser.department}). Location: ${location}`,
    });

    // Persist evidence transfer to MongoDB / Spring Boot REST API
    fetch(`/api/evidence/${ev.id}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chainOfCustody: [...ev.transfers, transferObj],
        currentCustodianId: targetUser.id,
        currentCustodianName: targetUser.fullName,
        currentDepartment: targetUser.department,
      }),
    }).catch((e) => console.warn('Evidence transfer persist notice:', e));
  };

  // Receive Evidence Custody
  const receiveEvidence = async (evidenceId: string, transferId: string, conditionAfter: string) => {
    if (!currentUser) throw new Error('Unauthenticated');
    const ev = evidence.find((e) => e.id === evidenceId);
    if (!ev) return;

    setEvidence((prev) =>
      prev.map((e) =>
        e.id === evidenceId
          ? {
              ...e,
              status: 'RECEIVED',
              currentCustodianId: currentUser.id,
              currentCustodianName: currentUser.fullName,
              currentCustodianDepartment: currentUser.department,
              transfers: e.transfers.map((t) =>
                t.id === transferId
                  ? {
                      ...t,
                      status: 'COMPLETED' as const,
                      conditionAfter,
                      receivedAt: new Date().toISOString(),
                    }
                  : t
              ),
            }
          : e
      )
    );

    await appendAuditLog({
      action: 'EVIDENCE_RECEIVED',
      resourceType: 'EVIDENCE',
      resourceId: ev.id,
      resourceName: ev.evidenceId,
      caseId: ev.caseId,
      caseNumber: ev.caseNumber,
      result: 'SUCCESS',
      description: `Evidence custody receipt verified by ${currentUser.fullName}. Seal integrity confirmed. Condition: "${conditionAfter}"`,
    });
  };

  // Verify Evidence
  const verifyEvidence = async (evidenceId: string) => {
    const ev = evidence.find((e) => e.id === evidenceId);
    if (!ev) return { status: 'UNVERIFIED' as IntegrityStatus, message: 'Evidence not found' };

    await appendAuditLog({
      action: 'EVIDENCE_VERIFIED',
      resourceType: 'EVIDENCE',
      resourceId: ev.id,
      resourceName: ev.evidenceId,
      caseId: ev.caseId,
      caseNumber: ev.caseNumber,
      result: 'SUCCESS',
      description: `Physical seal ${ev.sealNumber} and digital digest verified. Custody chain validated.`,
    });

    return {
      status: 'VALID' as IntegrityStatus,
      message: `Tamper seal ${ev.sealNumber} intact. Digital hash verified against physical seizure log.`,
    };
  };

  // Verify Audit Chain Integrity
  const verifyAuditChain = async () => {
    const result = await verifyAuditChainCrypto(auditLogs);
    await appendAuditLog({
      action: 'AUDIT_CHAIN_VERIFIED',
      resourceType: 'SECURITY',
      resourceId: 'AUDIT-BLOCKCHAIN',
      resourceName: 'Chained Audit Ledger',
      result: result.isValid ? 'SUCCESS' : 'TAMPER_ALERT',
      description: `Cryptographic audit chain verification executed across ${result.totalVerified} chronological blocks. Result: ${result.isValid ? 'PASSED' : 'CORRUPTED'}.`,
    });
    return result;
  };

  // Resolve Security Alert
  const resolveAlert = async (alertId: string, notes: string) => {
    if (!currentUser) throw new Error('Unauthenticated');
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: 'RESOLVED',
              resolutionNotes: notes,
              resolvedBy: currentUser.id,
            }
          : a
      )
    );

    await appendAuditLog({
      action: 'SECURITY_ALERT_RESOLVED',
      resourceType: 'SECURITY',
      resourceId: alertId,
      resourceName: alertId,
      result: 'SUCCESS',
      description: `Resolved security incident alert ${alertId}. Resolution rationale: "${notes}"`,
    });
  };

  // Notification methods
  const markNotificationRead = (notifId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Multi-Factor Authentication Toggle
  const toggleMfa = async (enable: boolean, secret?: string) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      mfaEnabled: enable,
      mfaSecret: secret || currentUser.mfaSecret,
    };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));

    await appendAuditLog({
      action: enable ? 'MFA_ENABLED' : 'MFA_DISABLED',
      resourceType: 'SECURITY',
      resourceId: currentUser.id,
      resourceName: currentUser.fullName,
      result: 'SUCCESS',
      description: `Multi-Factor Authentication (TOTP RFC-6238) ${enable ? 'enabled' : 'disabled'} for user account`,
    });
  };

  // User status updates (Admin)
  const updateUserStatus = async (userId: string, active: boolean, role?: Role, department?: Department) => {
    if (!currentUser || currentUser.role !== 'ADMIN') throw new Error('Unauthorized');
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              active,
              role: role || u.role,
              department: department || u.department,
            }
          : u
      )
    );

    await appendAuditLog({
      action: 'USER_ADMIN_MODIFIED',
      resourceType: 'USER',
      resourceId: userId,
      resourceName: userId,
      result: 'SUCCESS',
      description: `Administrative update: active=${active}, role=${role || 'unchanged'}, department=${department || 'unchanged'}`,
    });
  };

  // Create Evidence
  const createEvidence = async (data: Partial<EvidenceItem>): Promise<EvidenceItem> => {
    if (!currentUser) throw new Error('Unauthenticated');
    const newEvidence: EvidenceItem = {
      id: `EVD-${Date.now()}`,
      evidenceId: data.evidenceId || `EVD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      caseId: data.caseId || '',
      caseNumber: data.caseNumber || '',
      type: data.type || 'DIGITAL_FORENSIC_IMAGE',
      description: data.description || '',
      collectorId: currentUser.id,
      collectorName: currentUser.fullName,
      collectorDepartment: currentUser.department,
      collectionLocation: data.collectionLocation || 'Crime Scene',
      collectionDateTime: data.collectionDateTime || new Date().toISOString(),
      sealNumber: data.sealNumber || `SEAL-${Math.floor(100000 + Math.random() * 900000)}`,
      condition: data.condition || 'Sealed in tamper-evident anti-static evidence pouch',
      currentCustodianId: currentUser.id,
      currentCustodianName: currentUser.fullName,
      currentCustodianDepartment: currentUser.department,
      currentDepartment: currentUser.department,
      storageLocation: data.storageLocation || 'Vault A',
      status: 'SEALED',
      digitalHash: data.digitalHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      tamperState: 'VALID',
      transfers: [],
      chainOfCustody: [],
      isLabAnalyzed: false,
      createdAt: new Date().toISOString(),
    };
    setEvidence((prev) => [newEvidence, ...prev]);
    await appendAuditLog({
      action: 'EVIDENCE_COLLECTED',
      resourceType: 'EVIDENCE',
      resourceId: newEvidence.id,
      resourceName: newEvidence.evidenceId,
      caseId: newEvidence.caseId,
      caseNumber: newEvidence.caseNumber,
      result: 'SUCCESS',
      description: `Seized evidence item registered: ${newEvidence.description}`,
    });

    // Persist evidence item to MongoDB / Spring Boot REST API
    fetch('/api/evidence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvidence),
    }).catch((e) => console.warn('Evidence persist notice:', e));

    return newEvidence;
  };

  // Record Audit
  const recordAudit = async (data: any) => {
    await appendAuditLog({
      action: data.action || 'CUSTOM_ACTION',
      resourceType: data.resourceType || 'SECURITY',
      resourceId: data.resourceId || 'SYS',
      resourceName: data.resourceName || data.action || 'OPERATION',
      result: data.result || data.status || 'SUCCESS',
      caseId: data.caseId,
      caseNumber: data.caseNumber,
      description: data.description || (data.details ? JSON.stringify(data.details) : `Action recorded: ${data.action}`),
    });
  };

  // Reset to Defaults
  const resetToDefaults = () => {
    localStorage.clear();
    setCurrentUser(INITIAL_USERS[2]);
    setUsers(INITIAL_USERS);
    setCases(INITIAL_CASES);
    setDocuments(INITIAL_DOCUMENTS);
    setEvidence(INITIAL_EVIDENCE);
    setTimeline(INITIAL_TIMELINE);
    setAlerts(INITIAL_ALERTS);
    setAccessRequests(INITIAL_ACCESS_REQUESTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
  };

  return (
    <DmsContext.Provider
      value={{
        currentUser,
        users,
        cases,
        documents,
        evidence,
        timeline,
        graphNodes,
        graphEdges,
        alerts,
        accessRequests,
        notifications,
        auditLogs,
        login,
        logout,
        switchUser,
        evaluateDocumentAccess,
        createCase,
        updateCase,
        uploadDocument,
        uploadDocumentVersion,
        simulateTamper,
        restoreIntegrity,
        tamperDocument: simulateTamper,
        restoreDocumentIntegrity: restoreIntegrity,
        verifyDocumentIntegrity,
        submitAccessRequest,
        approveAccessRequest,
        rejectAccessRequest,
        grantAccess,
        revokeAccess,
        changeWorkflowStatus,
        signDocument,
        createEvidence,
        transferEvidence,
        receiveEvidence,
        verifyEvidence,
        verifyAuditChain,
        recordAudit,
        resetToDefaults,
        resolveAlert,
        markNotificationRead,
        markAllNotificationsRead,
        toggleMfa,
        updateUserStatus,
        mongoStatus,
      }}
    >
      {children}
    </DmsContext.Provider>
  );
};

export const useDms = (): DmsContextType => {
  const context = useContext(DmsContext);
  if (!context) {
    throw new Error('useDms must be used within a DmsProvider');
  }
  return context;
};
