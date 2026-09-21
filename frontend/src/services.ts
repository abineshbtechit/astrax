import {api, requestBlob, uploadWithProgress} from './api';

export type Id=string;
export type Page<T>={content:T[];page?:number;size?:number;totalElements?:number;totalPages?:number;items?:T[];total?:number};
export type Query=Record<string,string|number|boolean|undefined|null>;
export type User={id:Id;username:string;email:string;fullName:string;role?:string;roles?:string[];departmentId?:Id;department?:string;active:boolean};
export type AuthResponse={accessToken?:string;token?:string;tokenType?:string;expiresIn?:number;user?:User};
export type CaseRecord={id:Id;caseNumber:string;title:string;crimeType:string;description?:string;location?:string;priority:string;status:string;ownerDepartmentId?:Id;investigatingOfficer?:unknown;createdAt?:string;updatedAt?:string};
export type DocumentRecord={id:Id;investigationId:Id;documentName:string;type:string;classification:string;workflowStatus:string;sha256?:string;integrityStatus?:string;signatureStatus?:string;currentVersion?:number;ownerUserId?:Id;ownerDepartmentId?:Id;createdAt?:string};
export type EvidenceRecord={id:Id;evidenceId:string;investigationId:Id;type:string;description:string;currentCustodian?:unknown;status:string;sealNumber?:string;condition?:string;hash?:string;tamperState?:string};
export type AccessGrant={id:Id;documentId:Id;granteeType:string;granteeId:Id;permissions:string[];purpose?:string;startAt?:string;expiresAt?:string;status:string};
export type Notification={id:Id;title:string;message:string;type:string;read:boolean;actionUrl?:string;createdAt:string};
export type ApiList<T>=Page<T>|T[];
export const qs=(q:Query={})=>{const p=new URLSearchParams();Object.entries(q).forEach(([k,v])=>{if(v!==undefined&&v!==null&&v!=='')p.set(k,String(v))});const s=p.toString();return s?`?${s}`:''};

export const authService={
 login:(credentials:{username:string;password:string})=>api.post<AuthResponse>('/auth/login',credentials),
 register:(body:{fullName:string;username:string;email:string;departmentId:Id;role:string;password:string})=>api.post<User>('/auth/register',body),
 me:()=>api.get<User>('/auth/me'),
 forgotPassword:(body:{email:string})=>api.post<{devResetToken?:string}>('/auth/forgot-password',body),
 resetPassword:(body:{token:string;newPassword:string})=>api.post<void>('/auth/reset-password',body),
 changePassword:(body:{currentPassword:string;newPassword:string})=>api.post<void>('/auth/change-password',body),
 logout:()=>{localStorage.removeItem('sidms_token');localStorage.removeItem('sidms_user')}
};
export const departmentService={list:()=>api.get<any[]>('/departments'),get:(id:Id)=>api.get<any>(`/departments/${id}`),create:(body:{departmentCode:string;name:string;type:string})=>api.post<any>('/departments',body)};
export const userService={
 list:(q:Query={})=>api.get<ApiList<User>>('/users'+qs(q)),create:(body:Partial<User>&{password?:string})=>api.post<User>('/users',body),
 get:(id:Id)=>api.get<User>(`/users/${id}`),update:(id:Id,body:Partial<User>)=>api.put<User>(`/users/${id}`,body)
};
export const caseService={
 list:(q:Query={})=>api.get<ApiList<CaseRecord>>('/cases'+qs(q)),create:(body:Partial<CaseRecord>)=>api.post<CaseRecord>('/cases',body),
 get:(id:Id)=>api.get<CaseRecord>(`/cases/${id}`),update:(id:Id,body:Partial<CaseRecord>)=>api.put<CaseRecord>(`/cases/${id}`,body),
 addMember:(id:Id,body:{userId:Id;departmentId?:Id;accessLevel:string})=>api.post<any>(`/cases/${id}/members`,body),members:(id:Id)=>api.get<any[]>(`/cases/${id}/members`),
 timeline:(id:Id,q:Query={})=>api.get<ApiList<any>>(`/cases/${id}/timeline`+qs(q)),addTimeline:(id:Id,body:any)=>api.post<any>(`/cases/${id}/timeline`,body),
 relationships:(id:Id)=>api.get<any>(`/cases/${id}/relationships`),report:(id:Id)=>api.get<any>(`/cases/${id}/report`)
};
export const documentService={
 list:(q:Query={})=>api.get<ApiList<DocumentRecord>>('/documents'+qs(q)),get:(id:Id)=>api.get<DocumentRecord>(`/documents/${id}`),
 upload:(metadata:{investigationId:Id;documentName:string;type:string;classification:string},file:File,onProgress?:(percent:number)=>void)=>{const f=new FormData();f.append('file',file);f.append('metadata',JSON.stringify(metadata));return uploadWithProgress<DocumentRecord>('/documents/upload',f,onProgress)},
 uploadVersion:(id:Id,file:File,changeDescription:string,onProgress?:(p:number)=>void)=>{const f=new FormData();f.append('file',file);f.append('changeDescription',changeDescription);return uploadWithProgress<any>(`/documents/${id}/upload-version`,f,onProgress)},
 versions:(id:Id)=>api.get<any[]>(`/documents/${id}/versions`),preview:(id:Id)=>api.get<any>(`/documents/${id}/preview-secure`),download:(id:Id)=>requestBlob(`/documents/${id}/download`),signatures:(id:Id)=>api.get<any[]>(`/documents/${id}/signatures`),
 verify:(id:Id)=>api.post<any>(`/documents/${id}/verify`),sign:(id:Id,body:Record<string,unknown>={})=>api.post<any>(`/documents/${id}/sign`,body),
 submit:(id:Id,body:Record<string,unknown>={})=>api.post<any>(`/documents/${id}/submit`,body),approve:(id:Id,body:Record<string,unknown>={})=>api.post<any>(`/documents/${id}/approve`,body),
 reject:(id:Id,reason:string)=>api.post<any>(`/documents/${id}/reject`,{reason}),finalize:(id:Id)=>api.post<any>(`/documents/${id}/finalize`),
 share:(id:Id,body:{granteeType:string;granteeId:Id;permissions:string[];purpose?:string;startAt?:string;expiresAt?:string})=>api.post<AccessGrant>(`/documents/${id}/share`,body),
 shares:(id:Id)=>api.get<AccessGrant[]>(`/documents/${id}/shares`),revokeShare:(id:Id,shareId:Id)=>api.delete<void>(`/documents/${id}/shares/${shareId}`)
};
export const accessRequestService={create:(body:{documentId:Id;requestedPermissions:string[];reason:string})=>api.post<any>('/access-requests',body),approve:(id:Id,body:{note?:string;expiresAt?:string}={})=>api.put<any>(`/access-requests/${id}/approve`,body),reject:(id:Id,note?:string)=>api.put<any>(`/access-requests/${id}/reject`,{note})};
export const evidenceService={
 list:(q:Query={})=>api.get<ApiList<EvidenceRecord>>('/evidence'+qs(q)),create:(body:Partial<EvidenceRecord>)=>api.post<EvidenceRecord>('/evidence',body),get:(id:Id)=>api.get<EvidenceRecord>(`/evidence/${id}`),
 transfer:(id:Id,body:{toUser:Id;reason:string;location?:string;conditionBefore?:string;signature?:string})=>api.post<any>(`/evidence/${id}/transfer`,body),
 receive:(id:Id,body:{conditionAfter?:string;sealVerification?:string;signature?:string;sealIntact?:boolean}={})=>api.post<any>(`/evidence/${id}/receive`,body),chain:(id:Id)=>api.get<any[]>(`/evidence/${id}/chain`),verify:(id:Id)=>api.post<any>(`/evidence/${id}/verify`)
};
export const searchService={documents:(q:Query)=>api.get<ApiList<DocumentRecord>>('/search/documents'+qs(q)),global:(q:Query)=>api.get<any>('/global-search'+qs(q))};
export const auditService={list:(q:Query={})=>api.get<ApiList<any>>('/audit-logs'+qs(q)),verifyChain:()=>api.post<any>('/audit-logs/verify-chain')};
export const securityService={alerts:(q:Query={})=>api.get<ApiList<any>>('/security/alerts'+qs(q)),updateAlert:(id:Id,status:string,note?:string)=>api.put<any>(`/security/alerts/${id}/status`,{status,note})};
export const notificationService={list:(q:Query={})=>api.get<ApiList<Notification>>('/notifications'+qs(q)),read:(id:Id)=>api.post<void>(`/notifications/${id}/read`),readAll:()=>api.post<void>('/notifications/read-all')};
export const dashboardService={stats:()=>api.get<any>('/stats/dashboard')};
export const profileService={get:()=>api.get<User>('/profile'),update:(body:{fullName?:string;email?:string;badgeNumber?:string})=>api.put<User>('/profile',body)};
export const healthService={check:()=>api.get<{status:string;service:string;timestamp:string}>('/health')};
