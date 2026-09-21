# Backend integration coverage

The API client follows section 14 of the Master SRS. Implementations are in `src/services.ts`; shared JWT, errors, binary downloads and progress-aware multipart uploads are in `src/api.ts`.

## Implemented service groups

- Authentication: login, register, current user, forgot/change password
- Users and departments: list, create, update/status, department list
- Cases: list, create, read, update, members, timeline read/write, graph, report
- Documents: list/detail, multipart upload, versions, preview/download, SHA-256 verification, sign, submit/approve/reject/finalize
- Sharing: create/list/revoke grant; request/approve/reject access
- Evidence: list/create/detail, transfer, receive, custody chain, integrity verification
- Search: advanced document search and global search
- Audit: list and chained-hash verification
- Security: alerts and status updates
- Notifications: list, mark one/all read
- Dashboard statistics

## Runtime modes

Set `VITE_DEMO_MODE=false` to make login use `POST /api/auth/login`. The preview uses `true` because no backend is supplied. Other screens still show representative SRS fixtures; their forms and loaders can call the exported service functions once exact backend DTOs are confirmed.

The SRS defines endpoint paths but not exact JSON envelopes. Types therefore follow the SRS field names and support common paginated (`content`) and array responses. Adjust response adapters if the actual Spring Boot DTOs differ.
