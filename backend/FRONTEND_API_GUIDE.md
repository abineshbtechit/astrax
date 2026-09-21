# Frontend Integration Guide — Secure Investigation & Legal DMS API

> **For the frontend developer.** This is the complete, authoritative API contract
> for the Spring Boot backend. It is generated directly from the backend source
> (controllers, DTOs, enums) so field names, types, and enum values match exactly.
> Build the React app against this document — no backend project access required.
>
> If anything here seems ambiguous, the backend also serves **live, always-correct
> API docs** once running:
> - Swagger UI: `http://localhost:8080/swagger-ui.html`
> - OpenAPI JSON: `http://localhost:8080/v3/api-docs`  ← import this into Postman / generate a TS client with `openapi-typescript` or `orval`

---

## 1. Base URL, environment & CORS

| Item              | Value (dev default)                                    |
|-------------------|--------------------------------------------------------|
| Base URL          | `http://localhost:8080`                                |
| All API paths     | prefixed with `/api`                                    |
| Auth scheme       | JWT Bearer token in `Authorization` header             |
| CORS allowed origins | `http://localhost:5173`, `http://localhost:3000` (Vite/CRA) |

The backend already allows those origins with credentials. If you run the React
dev server on a different port, ask backend to add it to `CORS_ALLOWED_ORIGINS`.

**Suggested frontend `.env`:**
```
VITE_API_BASE_URL=http://localhost:8080
```

---

## 2. Authentication flow

1. `POST /api/auth/login` with `{ username, password }` → returns `accessToken`.
2. Store the token (memory + `localStorage`/`sessionStorage`).
3. Send `Authorization: Bearer <accessToken>` on **every** other request.
4. Token is stateless JWT; default lifetime **24h** (`expiresInMs` in the response).
5. On `401` → token missing/expired/invalid → redirect to login.
6. On `403` → authenticated but not authorized for that resource (show "access denied").

There is **no refresh-token endpoint** — when the token expires, the user logs in
again. (If you need refresh tokens, request it from backend.)

**Dev bootstrap admin** (only when seeding is on): `admin` / `Admin@12345`.

---

## 3. Standard envelope — read this first

### 3.1 Success responses
Almost every JSON endpoint returns this wrapper:

```json
{
  "success": true,
  "message": "optional human message",
  "data": { /* the actual payload (object, array, or page) */ }
}
```

So in the frontend, **read `response.data.data`** for the real payload.

Two exceptions that do NOT use the wrapper:
- `GET /api/documents/{id}/download` → returns the **raw file bytes** (binary), with `Content-Disposition: attachment`.
- `GET /api/health` and `/actuator/health` → return a plain status object.

### 3.2 Error responses
All errors use this shape (HTTP status set accordingly):

```json
{
  "timestamp": "2026-09-21T09:40:00Z",
  "status": 403,
  "code": "ACCESS_DENIED",
  "message": "Access denied",
  "path": "/api/documents/123",
  "details": ["field: message", "..."]   // present only for validation errors (400)
}
```

| HTTP | `code` examples                    | Meaning / frontend action                        |
|------|------------------------------------|--------------------------------------------------|
| 400  | `VALIDATION_ERROR`, `BAD_REQUEST`  | Show field errors from `details[]`               |
| 401  | `UNAUTHENTICATED`, `INVALID_CREDENTIALS` | Redirect to login                          |
| 403  | `ACCESS_DENIED`                    | Show "not authorized"                            |
| 404  | `RESOURCE_NOT_FOUND`               | Not found / not visible under access policy       |
| 409  | `CONFLICT`                         | Duplicate (e.g. username/case number)            |
| 413  | `FILE_TOO_LARGE`                   | File exceeds max size                            |
| 415  | `UNSUPPORTED_MEDIA_TYPE`           | Disallowed file type                             |
| 422  | `BUSINESS_VALIDATION_ERROR`        | Invalid state transition, etc.                   |
| 500  | `INTERNAL_ERROR`                   | Generic; retry / report                          |

### 3.3 Pagination envelope (`PageResponse`)
Used by `GET /api/search/documents`. The `data` looks like:
```json
{
  "content": [ /* items */ ],
  "page": 0,
  "size": 20,
  "totalElements": 137,
  "totalPages": 7,
  "last": false
}
```

### 3.4 Date/time & IDs
- All timestamps are **ISO-8601 UTC strings** (e.g. `2026-09-21T09:40:00Z`). Render in the user's timezone client-side.
- All `id` fields are **Mongo ObjectId strings** (24-hex chars).

---

## 4. Enums (use these EXACT string values)

```ts
export type Role =
  | "ADMIN" | "POLICE_OFFICER" | "INVESTIGATION_OFFICER" | "FORENSIC_OFFICER"
  | "LAWYER" | "COURT_OFFICER" | "AUDITOR" | "DEPARTMENT_ADMIN";

export type DepartmentType =
  | "POLICE" | "INVESTIGATION" | "FORENSIC" | "LEGAL" | "COURT" | "ADMINISTRATION";

export type CaseStatus =
  | "UNDER_INVESTIGATION" | "PENDING_REVIEW" | "CHARGE_SHEET_FILED" | "IN_COURT" | "CLOSED";

export type CasePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AccessLevel = "READ_ONLY" | "READ_WRITE" | "CASE_OWNER";

export type DocumentType =
  | "FIR" | "POLICE_REPORT" | "INVESTIGATION_REPORT" | "WITNESS_STATEMENT"
  | "CHARGE_SHEET" | "COURT_FILING" | "EVIDENCE" | "FORENSIC_REPORT"
  | "LEGAL_NOTICE" | "JUDGMENT" | "OTHER";

export type Classification = "CONFIDENTIAL" | "RESTRICTED" | "PUBLIC_RECORD";

export type WorkflowStatus =
  | "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "SIGNED" | "FINAL";

export type IntegrityStatus = "VALID" | "TAMPERED" | "NOT_VERIFIED";
export type SignatureStatus = "SIGNED" | "NOT_SIGNED" | "SIGNATURE_INVALID";
export type OcrStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "NOT_APPLICABLE";

export type GranteeType = "USER" | "DEPARTMENT" | "ROLE" | "INVESTIGATION_PARTICIPANT";
export type Permission = "VIEW" | "DOWNLOAD" | "VERSION_UPLOAD" | "SHARE";
export type GrantStatus = "ACTIVE" | "EXPIRED" | "REVOKED";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type EvidenceStatus =
  | "COLLECTED" | "SEALED" | "IN_TRANSIT" | "RECEIVED" | "IN_ANALYSIS" | "RETURNED" | "DISPOSED";
export type TransferStatus = "PENDING" | "RECEIVED" | "REJECTED";
export type TamperState = "INTACT" | "TAMPERED" | "NOT_APPLICABLE";

export type AlertType =
  | "MULTIPLE_FAILED_LOGINS" | "RAPID_DOWNLOADS" | "REPEATED_DENIED_ACCESS"
  | "UNUSUAL_ACCESS" | "INTEGRITY_FAILURE" | "UNAUTHORIZED_EVIDENCE_TRANSFER";
export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AlertStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED" | "DISMISSED";

export type NotificationType =
  | "SHARE" | "APPROVAL" | "ASSIGNMENT" | "EVIDENCE" | "SECURITY"
  | "WORKFLOW" | "ACCESS_REQUEST" | "GENERAL";

export type NodeType =
  | "CASE" | "DOCUMENT" | "EVIDENCE" | "PERSON" | "LOCATION" | "VEHICLE" | "ORGANIZATION";

export type ReportType = "CASE_SUMMARY" | "INVESTIGATION_REPORT" | "EVIDENCE_REPORT" | "AUDIT_REPORT";
export type ReportStatus = "PENDING" | "GENERATING" | "COMPLETED" | "FAILED";

export type AuditAction =
  | "LOGIN" | "LOGOUT" | "LOGIN_FAILED" | "CASE_CREATED" | "CASE_UPDATED"
  | "CASE_STATUS_CHANGED" | "MEMBER_ASSIGNED" | "DOCUMENT_UPLOADED" | "DOCUMENT_VIEWED"
  | "DOCUMENT_DOWNLOADED" | "DOCUMENT_UPDATED" | "DOCUMENT_DELETED" | "VERSION_UPLOADED"
  | "DOCUMENT_SHARED" | "SHARE_REVOKED" | "ACCESS_REQUESTED" | "ACCESS_REQUEST_APPROVED"
  | "ACCESS_REQUEST_REJECTED" | "DOCUMENT_SUBMITTED" | "DOCUMENT_APPROVED" | "DOCUMENT_REJECTED"
  | "DOCUMENT_FINALIZED" | "DOCUMENT_VERIFIED" | "INTEGRITY_VERIFIED" | "TAMPER_DETECTED"
  | "DOCUMENT_SIGNED" | "EVIDENCE_COLLECTED" | "EVIDENCE_SEALED" | "EVIDENCE_TRANSFERRED"
  | "EVIDENCE_RECEIVED" | "EVIDENCE_VERIFIED" | "USER_CREATED" | "USER_UPDATED"
  | "USER_DISABLED" | "PERMISSION_CHANGED" | "UNAUTHORIZED_ACCESS_ATTEMPT" | "SECURITY_ALERT"
  | "AUDIT_VERIFIED" | "REPORT_GENERATED";
```

---

## 5. Endpoint reference

Legend: 🔓 = public (no token); everything else requires `Authorization: Bearer`.
"Roles" = server-enforced role restriction (in addition to resource-level checks).

### 5.1 Auth — `/api/auth`
| Method | Path | Body | Returns | Notes |
|--------|------|------|---------|-------|
| POST 🔓 | `/login` | `LoginRequest` | `LoginResponse` | |
| POST | `/register` | `RegisterRequest` | `UserResponse` | Roles: ADMIN, DEPARTMENT_ADMIN |
| GET | `/me` | — | `UserResponse` | Current user |
| POST | `/change-password` | `ChangePasswordRequest` | message | |
| POST 🔓 | `/forgot-password` | `ForgotPasswordRequest` | `{ devResetToken? }` | Dev echoes token; prod emails it |
| POST 🔓 | `/reset-password` | `ResetPasswordRequest` | message | |

### 5.2 Users & Profile — `/api`
| Method | Path | Body | Returns | Roles |
|--------|------|------|---------|-------|
| GET | `/users` | — | `UserResponse[]` | ADMIN, DEPARTMENT_ADMIN, AUDITOR |
| POST | `/users` | `RegisterRequest` | `UserResponse` | ADMIN, DEPARTMENT_ADMIN |
| GET | `/users/{id}` | — | `UserResponse` | ADMIN, DEPARTMENT_ADMIN, AUDITOR |
| PUT | `/users/{id}` | `UpdateUserRequest` | `UserResponse` | ADMIN, DEPARTMENT_ADMIN |
| GET | `/profile` | — | `UserResponse` | any authenticated |
| PUT | `/profile` | `UpdateProfileRequest` | `UserResponse` | any authenticated |

### 5.3 Departments — `/api/departments`
| Method | Path | Body | Returns | Roles |
|--------|------|------|---------|-------|
| GET | `` | — | `DepartmentResponse[]` | any |
| POST | `` | `DepartmentRequest` | `DepartmentResponse` | ADMIN |
| GET | `/{id}` | — | `DepartmentResponse` | any |

### 5.4 Cases / Investigations — `/api/cases`
| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | `` | — | `CaseResponse[]` (only cases you can see) |
| POST | `` | `CreateCaseRequest` | `CaseResponse` (roles: ADMIN/POLICE_OFFICER/INVESTIGATION_OFFICER) |
| GET | `/{id}` | — | `CaseResponse` |
| PUT | `/{id}` | `UpdateCaseRequest` | `CaseResponse` |
| POST | `/{id}/members` | `AddMemberRequest` | `MemberResponse` |
| GET | `/{id}/members` | — | `MemberResponse[]` |
| GET | `/{id}/timeline` | — | `TimelineEventResponse[]` |
| POST | `/{id}/timeline` | `TimelineEventRequest` | `TimelineEventResponse` |
| GET | `/{id}/relationships` | — | `RelationshipResponse` |
| GET | `/{id}/report` | — | `ReportResponse` (generates a case report) |

### 5.5 Documents — `/api/documents`
| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | `?investigationId=` | — | `DocumentResponse[]` (filter optional) |
| POST | `/upload` | **multipart** (see §6) | `DocumentResponse` |
| GET | `/{id}` | — | `DocumentResponse` |
| POST | `/{id}/upload-version` | **multipart** | `VersionResponse` |
| GET | `/{id}/versions` | — | `VersionResponse[]` |
| GET | `/{id}/preview-secure` | — | `PreviewResponse` (base64 + watermark) |
| GET | `/{id}/download` | — | **raw file bytes** (not wrapped) |
| POST | `/{id}/verify` | — | `VerifyResponse` (SHA-256 integrity) |
| POST | `/{id}/sign` | `SignRequest` (optional) | `SignatureResponse` |
| GET | `/{id}/signatures` | — | `SignatureResponse[]` |
| POST | `/{id}/submit` | — | `DocumentResponse` |
| POST | `/{id}/approve` | — | `DocumentResponse` |
| POST | `/{id}/reject` | `RejectRequest` | `DocumentResponse` |
| POST | `/{id}/finalize` | — | `DocumentResponse` |
| POST | `/{id}/share` | `ShareRequest` | `ShareResponse` |
| GET | `/{id}/shares` | — | `ShareResponse[]` |
| DELETE | `/{id}/shares/{shareId}` | — | message |

**Workflow state machine** (drive button visibility with this):
`DRAFT ──submit──▶ SUBMITTED ──approve──▶ APPROVED ──sign──▶ SIGNED ──finalize──▶ FINAL`
`SUBMITTED ──reject──▶ REJECTED ──submit──▶ SUBMITTED`. `APPROVED` can also finalize directly.

### 5.6 Access Requests — `/api/access-requests`
| Method | Path | Body | Returns |
|--------|------|------|---------|
| POST | `` | `AccessRequestDto` | `AccessRequestResponse` |
| PUT | `/{id}/approve` | `DecisionRequest` (optional) | `AccessRequestResponse` (creates an active grant) |
| PUT | `/{id}/reject` | `DecisionRequest` (optional) | `AccessRequestResponse` |

### 5.7 Evidence & Chain of Custody — `/api/evidence`
| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | `?investigationId=` | — | `EvidenceResponse[]` |
| POST | `` | `CreateEvidenceRequest` | `EvidenceResponse` |
| GET | `/{id}` | — | `EvidenceResponse` |
| POST | `/{id}/transfer` | `TransferRequest` | `TransferResponse` |
| POST | `/{id}/receive` | `ReceiveRequest` (optional) | `TransferResponse` |
| GET | `/{id}/chain` | — | `TransferResponse[]` (chronological) |
| POST | `/{id}/verify` | — | `EvidenceResponse` |

### 5.8 Search — `/api`
| Method | Path | Query params | Returns |
|--------|------|--------------|---------|
| GET | `/search/documents` | fields of `DocumentSearchRequest` + `page`, `size` | `PageResponse<DocumentResponse>` |
| GET | `/global-search` | `q` | `GlobalSearchResult` |

### 5.9 Audit — `/api/audit-logs` (Roles: ADMIN, AUDITOR, COURT_OFFICER)
| Method | Path | Returns |
|--------|------|---------|
| GET | `` | `AuditLogResponse[]` |
| POST | `/verify-chain` | `AuditChainVerifyResponse` |

### 5.10 Security Alerts — `/api/security` (Roles: ADMIN, AUDITOR)
| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | `/alerts` | — | `SecurityAlertResponse[]` |
| PUT | `/alerts/{id}/status` | `AlertStatusRequest` | `SecurityAlertResponse` |

### 5.11 Notifications — `/api/notifications`
| Method | Path | Returns |
|--------|------|---------|
| GET | `` | `NotificationResponse[]` |
| POST | `/{id}/read` | message |
| POST | `/read-all` | message |

### 5.12 Dashboard — `/api/stats/dashboard`
| Method | Path | Returns |
|--------|------|---------|
| GET | `` | `DashboardStats` |

### 5.13 Health — `/api/health` 🔓
Returns `{ status: "UP", service, timestamp }` (not wrapped).

---

## 6. File upload & download details (important)

### Upload a document — `POST /api/documents/upload`
`multipart/form-data` with **two parts**:
- `file` — the binary file part.
- `metadata` — a **JSON string** matching `UploadDocumentRequest`.

```ts
const fd = new FormData();
fd.append("file", fileFromInput);
fd.append("metadata", JSON.stringify({
  investigationId: caseId,
  documentName: "FIR Report",
  type: "FIR",                 // DocumentType
  classification: "RESTRICTED" // Classification
}));
await axios.post(`${BASE}/api/documents/upload`, fd, {
  headers: { Authorization: `Bearer ${token}` }
  // DO NOT set Content-Type manually; let the browser set the multipart boundary.
});
```

### Upload a new version — `POST /api/documents/{id}/upload-version`
Parts: `file` (binary) and optional `changeDescription` (plain string, not JSON).

### Allowed files (default, configurable server-side)
- Extensions: `pdf, doc, docx, jpg, jpeg, png, txt`
- Max size: **25 MB** (server returns `413 FILE_TOO_LARGE` / `415 UNSUPPORTED_MEDIA_TYPE`).
- The backend validates the **actual content signature** (Apache Tika), not just the extension — sending a mislabeled file will be rejected.

### Download — `GET /api/documents/{id}/download`
Returns raw bytes with `Content-Disposition: attachment; filename="..."`. Fetch as a blob:
```ts
const res = await axios.get(`${BASE}/api/documents/${id}/download`, {
  headers: { Authorization: `Bearer ${token}` },
  responseType: "blob",
});
// then create an object URL from res.data to trigger the download
```
Requires the `DOWNLOAD` permission — otherwise `403`.

### Secure preview — `GET /api/documents/{id}/preview-secure`
Returns `PreviewResponse` with `contentBase64` (decode to render inline) plus
`watermarkText` and `classification` to overlay. Requires `VIEW` permission.

---

## 7. Request/response payload shapes (TypeScript)

Fields marked `?` are optional in requests; responses always include all listed fields
(nullable ones may be `null`). Validation rules from the backend are noted.

```ts
// ---------- Auth ----------
interface LoginRequest { username: string; password: string; }          // both required
interface LoginResponse {
  accessToken: string; tokenType: "Bearer"; expiresInMs: number;
  userId: string; username: string; fullName: string;
  roles: Role[]; departmentId: string | null;
}
interface RegisterRequest {                 // used by /auth/register AND POST /users
  fullName: string;                         // required
  username: string;                         // required, 3–50 chars
  email: string;                            // required, valid email
  departmentId?: string;
  badgeNumber?: string;
  roles: Role[];                            // required, non-empty
  password: string;                         // required, 8–100 chars
}
interface ChangePasswordRequest { currentPassword: string; newPassword: string; } // newPassword 8–100
interface ForgotPasswordRequest { email: string; }                       // valid email
interface ResetPasswordRequest { token: string; newPassword: string; }   // newPassword 8–100

// ---------- Users ----------
interface UserResponse {
  id: string; username: string; email: string; fullName: string;
  badgeNumber: string | null; roles: Role[]; departmentId: string | null;
  active: boolean; createdAt: string; updatedAt: string;
}
interface UpdateUserRequest {   // all optional
  fullName?: string; email?: string; badgeNumber?: string;
  departmentId?: string; roles?: Role[]; active?: boolean;
}
interface UpdateProfileRequest { fullName?: string; email?: string; badgeNumber?: string; }

// ---------- Departments ----------
interface DepartmentRequest { departmentCode: string; name: string; type: DepartmentType; } // all required
interface DepartmentResponse { id: string; departmentCode: string; name: string; type: DepartmentType; status: string; }

// ---------- Cases ----------
interface CreateCaseRequest {
  caseNumber?: string;          // auto-generated if omitted (e.g. CASE-2026-00042)
  title: string;                // required
  crimeType: string;            // required
  description?: string;
  location?: string;
  priority: CasePriority;       // required
  ownerDepartmentId?: string;   // defaults to creator's department
  investigatingOfficer?: string;
  participatingDepartmentIds?: string[];
}
interface UpdateCaseRequest {   // all optional; setting status appends to history
  title?: string; crimeType?: string; description?: string; location?: string;
  priority?: CasePriority; status?: CaseStatus; statusNote?: string;
  investigatingOfficer?: string; participatingDepartmentIds?: string[];
}
interface CaseResponse {
  id: string; caseNumber: string; title: string; crimeType: string;
  description: string | null; location: string | null;
  status: CaseStatus; priority: CasePriority;
  ownerDepartmentId: string | null; createdBy: string; investigatingOfficer: string | null;
  participatingDepartmentIds: string[];
  documentCount: number; evidenceCount: number;
  createdAt: string; updatedAt: string;
}
interface AddMemberRequest { userId: string; departmentId?: string; accessLevel: AccessLevel; } // userId & accessLevel required
interface MemberResponse {
  id: string; investigationId: string; userId: string; userFullName: string | null;
  departmentId: string | null; accessLevel: AccessLevel; assignedAt: string;
}
interface TimelineEventRequest {
  eventType: string;            // required
  title: string;                // required
  description?: string; relatedDocumentId?: string; relatedEvidenceId?: string;
}
interface TimelineEventResponse {
  id: string; investigationId: string; eventType: string; title: string;
  description: string | null; actor: string; actorRole: string | null;
  timestamp: string; relatedDocumentId: string | null; relatedEvidenceId: string | null;
}
interface RelationshipResponse {
  nodes: { id: string; nodeType: NodeType; label: string }[];
  edges: { id: string; source: string; target: string; relationshipType: string; properties: Record<string, unknown> }[];
}

// ---------- Documents ----------
interface UploadDocumentRequest {   // sent as the `metadata` JSON part
  investigationId: string; documentName: string; type: DocumentType; classification: Classification;
}
interface DocumentResponse {
  id: string; investigationId: string; documentName: string;
  type: DocumentType; classification: Classification;
  originalFilename: string; mimeType: string; size: number; sha256: string;
  currentVersion: number; ownerUserId: string; ownerDepartmentId: string | null;
  workflowStatus: WorkflowStatus; integrityStatus: IntegrityStatus;
  signatureStatus: SignatureStatus; ocrStatus: OcrStatus;
  finalized: boolean; rejectionReason: string | null;
  createdAt: string; updatedAt: string;
}
interface VersionResponse {
  id: string; documentId: string; versionNumber: number; hash: string;
  uploaderId: string; size: number; mimeType: string; originalFilename: string;
  changeDescription: string | null; createdAt: string;
}
interface PreviewResponse {
  documentId: string; documentName: string; mimeType: string;
  classification: string; watermarkText: string; contentBase64: string;
}
interface VerifyResponse {
  documentId: string; status: IntegrityStatus;
  storedHash: string; recalculatedHash: string; match: boolean;
}
interface SignRequest { certificateIssuer?: string; reason?: string; }   // body optional
interface SignatureResponse {
  id: string; documentId: string; versionNumber: number;
  signerId: string; signerRole: string | null; documentHash: string;
  signatureValue: string; certificateIssuer: string; status: SignatureStatus; signedAt: string;
}
interface RejectRequest { reason: string; }   // required

// ---------- Sharing / Access ----------
interface ShareRequest {
  granteeType: GranteeType;     // required
  granteeId: string;            // required (userId | departmentId | Role string | investigationId)
  permissions: Permission[];    // required, non-empty
  purpose?: string; startAt?: string; expiresAt?: string;  // ISO timestamps
}
interface ShareResponse {
  id: string; documentId: string; granteeType: GranteeType; granteeId: string;
  permissions: Permission[]; purpose: string | null;
  startAt: string | null; expiresAt: string | null; status: GrantStatus;
  grantedBy: string; approvedBy: string | null; createdAt: string;
}
interface AccessRequestDto {
  documentId: string; requestedPermissions: Permission[]; reason: string;  // all required
}
interface AccessRequestResponse {
  id: string; documentId: string; requesterId: string;
  requestedPermissions: Permission[]; reason: string; status: RequestStatus;
  reviewerId: string | null; decisionNote: string | null;
  decidedAt: string | null; createdAt: string;
}
interface DecisionRequest { note?: string; expiresAt?: string; }  // for approve/reject

// ---------- Evidence ----------
interface CreateEvidenceRequest {
  investigationId: string;      // required
  type: string;                 // required
  description?: string;
  collector: string;            // required
  collectionLocation?: string; collectionDateTime?: string;
  sealNumber?: string; condition?: string;
  currentCustodian?: string; currentCustodianRole?: string;
}
interface EvidenceResponse {
  id: string; evidenceId: string;   // human id like EVD-2026-0001
  investigationId: string; type: string; description: string | null;
  collector: string; collectionLocation: string | null; collectionDateTime: string;
  currentCustodian: string; currentCustodianRole: string | null;
  status: EvidenceStatus; sealNumber: string | null; condition: string | null;
  hash: string | null; tamperState: TamperState; createdAt: string; updatedAt: string;
}
interface TransferRequest { toUser: string; reason: string; location?: string; conditionBefore?: string; signature?: string; } // toUser & reason required
interface ReceiveRequest { conditionAfter?: string; sealVerification?: string; signature?: string; sealIntact?: boolean; }
interface TransferResponse {
  id: string; evidenceId: string; fromUser: string; toUser: string; reason: string;
  transferTime: string; location: string | null; conditionBefore: string | null;
  conditionAfter: string | null; signature: string | null; status: TransferStatus;
  receivedAt: string | null; createdAt: string;
}

// ---------- Search ----------
interface DocumentSearchRequest {   // sent as query params
  keyword?: string; caseNumber?: string; type?: DocumentType; crimeType?: string;
  location?: string; departmentId?: string; classification?: Classification;
  workflowStatus?: WorkflowStatus; integrityStatus?: IntegrityStatus; signatureStatus?: SignatureStatus;
  fromDate?: string; toDate?: string; page?: number; size?: number; // defaults page=0 size=20
}
interface GlobalSearchResult {
  cases: SearchHit[]; documents: SearchHit[]; evidence: SearchHit[]; people: SearchHit[];
}
interface SearchHit { id: string; type: string; title: string; subtitle: string | null; }

// ---------- Audit / Security / Notifications / Dashboard ----------
interface AuditLogResponse {
  id: string; actor: string; actorRole: string | null; action: AuditAction;
  investigationId: string | null; documentId: string | null; evidenceId: string | null;
  result: string; description: string; previousHash: string; currentHash: string;
  sequence: number; timestamp: string;
}
interface AuditChainVerifyResponse {
  valid: boolean; recordsChecked: number;
  firstBrokenRecordId: string | null; firstBrokenSequence: number | null; message: string;
}
interface SecurityAlertResponse {
  id: string; alertType: AlertType; severity: AlertSeverity; actor: string;
  description: string; detectedAt: string; status: AlertStatus;
  resolvedBy: string | null; resolvedAt: string | null; resolutionNote: string | null;
}
interface AlertStatusRequest { status: AlertStatus; note?: string; }  // status required
interface NotificationResponse {
  id: string; title: string; message: string; type: NotificationType;
  read: boolean; actionUrl: string | null; createdAt: string;
}
interface DashboardStats {
  totalCases: number; activeInvestigations: number; pendingReviews: number;
  totalDocuments: number; totalEvidence: number; openSecurityAlerts: number; unreadNotifications: number;
  casesByStatus: Record<string, number>;      // e.g. { UNDER_INVESTIGATION: 5 }
  documentsByType: Record<string, number>;
  recentActivities: { action: string; actor: string; description: string; timestamp: string }[];
}
interface ReportResponse {
  id: string; investigationId: string; reportType: ReportType; generatedBy: string;
  status: ReportStatus; content: Record<string, unknown>; createdAt: string;
}
```

---

## 8. Recommended API client setup (axios)

```ts
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // http://localhost:8080
});

// Attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap { success, data } and handle auth errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    // err.response.data is the ErrorResponse shape { code, message, details }
    return Promise.reject(err);
  }
);

// Example call:
export async function listCases(): Promise<CaseResponse[]> {
  const res = await api.get("/api/cases");
  return res.data.data;   // note the double .data (axios + envelope)
}
```

---

## 9. Cross-department access rules the UI must respect (SRS §16)

The backend is the source of truth and enforces all of this — the frontend should
**mirror it for UX only**, never rely on hiding alone:

- Belonging to the same case does **not** auto-grant document access. Access comes
  from: ownership, owning-department membership, `PUBLIC_RECORD` classification, or
  an explicit **active, in-window grant**.
- List endpoints already return **only what the user may see** — do not assume a
  document exists just because you have its id; expect `403`/`404`.
- A user without `DOWNLOAD` permission can preview (if `VIEW`) but download returns `403`.
- Expired or revoked grants immediately deny access.
- Hide action buttons the user can't use, but always handle a `403` gracefully in
  case state changed server-side.

**Role capability quick map for menus/buttons:**
| Capability | Roles |
|------------|-------|
| Create case | ADMIN, POLICE_OFFICER, INVESTIGATION_OFFICER |
| Register/create users | ADMIN, DEPARTMENT_ADMIN |
| Create department | ADMIN |
| View audit logs | ADMIN, AUDITOR, COURT_OFFICER |
| View/resolve security alerts | ADMIN, AUDITOR |
| Approve/reject/finalize docs | case members with write access + owner/admin (resource-checked) |
| Transfer evidence | current custodian, or ADMIN/FORENSIC_OFFICER/INVESTIGATION_OFFICER |

---

## 10. Badges you'll want to render (from status enums)
- **Case status** → `CaseStatus`
- **Classification** → `Classification` (color-code CONFIDENTIAL/RESTRICTED/PUBLIC_RECORD prominently)
- **Workflow** → `WorkflowStatus`
- **Signature** → `SignatureStatus`
- **Integrity** → `IntegrityStatus` (highlight `TAMPERED` in red)
- **Evidence** → `EvidenceStatus` + `TamperState`
- **Alert severity/status** → `AlertSeverity` / `AlertStatus`

---

### Summary for your frontend dev
Everything needed to build against this backend is here: base URL/CORS, JWT flow,
the `{ success, data }` envelope + error shape, every enum, every endpoint, every
request/response type, the multipart upload contract, and the access-control rules.
For a guaranteed-in-sync machine-readable contract, run the backend and grab
`/v3/api-docs` (OpenAPI JSON) to auto-generate a typed client.
