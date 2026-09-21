# Secure Inter-Department Investigation & Legal Document Management System — Backend

Spring Boot 3 + Java 17 + MongoDB Atlas REST backend implementing the Master SRS
for secure cross-department investigation record and document sharing.

> All secrets and URLs in configuration are **dummy placeholders**. Copy
> `.env.example` → `.env` (or set environment variables) and replace them with
> your real MongoDB Atlas URI, JWT secret, CORS origins, etc.

---

## Tech stack

| Layer            | Technology                                                    |
|------------------|--------------------------------------------------------------|
| Language/Runtime | Java 17                                                       |
| Framework        | Spring Boot 3.2.x (Web, Security, Validation, Actuator)       |
| Persistence      | Spring Data MongoDB (MongoDB Atlas)                           |
| Auth             | JWT (jjwt) + Spring Security, stateless, BCrypt password hash |
| File typing/OCR  | Apache Tika (MIME detection + text extraction)               |
| API docs         | springdoc-openapi (Swagger UI)                               |
| Build            | Maven                                                         |
| Tests            | JUnit 5, Spring Boot Test, Flapdoodle embedded MongoDB        |

---

## Project structure

```
src/main/java/com/investigation/dms
├── DmsApplication.java            # Spring Boot entry point
├── common
│   ├── dto        # ApiResponse, ErrorResponse, PageResponse
│   ├── enums      # All domain enums (Role, CaseStatus, DocumentType, ...)
│   └── exception  # ApiException hierarchy + GlobalExceptionHandler
├── config         # Security, CORS, Mongo, OpenAPI, Async, properties, DataSeeder
├── security       # JwtService, JwtAuthenticationFilter, UserPrincipal, handlers
├── storage        # StorageService abstraction + LocalFileStorageService
├── model          # 17 MongoDB @Document entities
├── repository     # 17 Spring Data Mongo repositories
├── dto            # Request/response DTOs grouped by domain
├── service        # Business logic (auth, cases, documents, sharing, evidence,
│                  #   integrity, signatures, OCR, search, audit, alerts,
│                  #   notifications, reports, dashboard, access control)
└── controller     # REST controllers matching the SRS endpoint table
```

---

## Configuration (environment variables)

See `.env.example` for the full list. Key values (all default to **dummy** values
for local dev):

| Variable                | Purpose                                             |
|-------------------------|-----------------------------------------------------|
| `MONGODB_URI`           | MongoDB Atlas SRV connection string                 |
| `JWT_SECRET`            | HS256 signing secret (>= 32 bytes)                  |
| `JWT_EXPIRATION_MS`     | Access-token lifetime (ms)                          |
| `CORS_ALLOWED_ORIGINS`  | Comma-separated allowed frontend origins            |
| `STORAGE_LOCAL_ROOT`    | Local dir for document binaries (dev only)          |
| `SERVER_PORT`           | HTTP port (default 8080)                            |
| `SEED_ENABLED`          | Seed dummy departments + admin on first run         |
| `SEED_ADMIN_*`          | Bootstrap admin credentials (dev only)             |
| `AI_*`, `OCR_ENGINE_*`  | Placeholders for optional external AI/OCR services |

> **Production:** set `SEED_ENABLED=false`, provide a strong `JWT_SECRET` from a
> secret manager, use a real `MONGODB_URI`, restrict `CORS_ALLOWED_ORIGINS`, and
> replace `LocalFileStorageService` with encrypted object storage or GridFS.

---

## Running locally

Prerequisites: JDK 17, Maven, and a reachable MongoDB (local or Atlas).

```bash
# 1. Configure environment
cp .env.example .env      # then edit values, or export them in your shell

# 2. (option A) export the essentials and run
export MONGODB_URI="mongodb://localhost:27017/investigation_dms"
export JWT_SECRET="a-long-random-dev-secret-at-least-32-bytes-xxxxx"
mvn spring-boot:run

# 2. (option B) build a fat jar and run it
mvn clean package
java -jar target/dms-backend-1.0.0.jar
```

- API base URL: `http://localhost:8080`
- Swagger UI:   `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- Health:       `http://localhost:8080/api/health` and `/actuator/health`

With `SEED_ENABLED=true` a bootstrap admin is created (default
`admin` / `Admin@12345`) — change/disable for anything beyond local dev.

### Quick auth check

```bash
# Login (public)
curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"Admin@12345"}'

# Use the returned accessToken:
curl -s http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

### Uploading a document (multipart)

`POST /api/documents/upload` takes two parts: `file` (the binary) and
`metadata` (JSON string):

```bash
curl -X POST http://localhost:8080/api/documents/upload \
  -H "Authorization: Bearer <TOKEN>" \
  -F 'file=@/path/to/report.pdf' \
  -F 'metadata={"investigationId":"<CASE_ID>","documentName":"FIR",
        "type":"FIR","classification":"RESTRICTED"};type=application/json'
```

---

## Testing

```bash
mvn test
```

- `HashUtilTest` — SHA-256 integrity digest correctness.
- `AuditChainTest` — chained audit-hash generation & tamper detection (no DB).
- `ApplicationContextTest` — full Spring context boots on embedded MongoDB.

---

## Implemented REST API

Matches the SRS endpoint table (section 14). Highlights:

- **Auth:** `/api/auth/login|register|me|change-password|forgot-password|reset-password`
- **Users/Profile:** `GET/POST /api/users`, `GET/PUT /api/users/{id}`, `GET/PUT /api/profile`
- **Departments:** `/api/departments`
- **Cases:** `/api/cases` CRUD, `/members`, `/timeline`, `/relationships`, `/report`
- **Documents:** `/api/documents` list/upload/get, `/upload-version`, `/versions`,
  `/preview-secure`, `/download`, `/verify`, `/sign`, `/submit`, `/approve`,
  `/reject`, `/finalize`, `/share`, `/shares`
- **Access requests:** `/api/access-requests` + `/{id}/approve|reject`
- **Evidence:** `/api/evidence` + `/transfer`, `/receive`, `/chain`, `/verify`
- **Search:** `/api/search/documents`, `/api/global-search`
- **Audit:** `/api/audit-logs`, `/api/audit-logs/verify-chain`
- **Security:** `/api/security/alerts`, `/api/security/alerts/{id}/status`
- **Notifications:** `/api/notifications`, `/{id}/read`, `/read-all`
- **Dashboard:** `/api/stats/dashboard`

---

## Key SRS features covered

- **Cross-department access control** (`AccessControlService`): role + department +
  case membership + classification + ownership + explicit grants + workflow state
  evaluated server-side before any metadata/binary is returned (SRS §16).
- **Document lifecycle:** upload, immutable versioning, DRAFT→…→FINAL workflow,
  approval/rejection, finalization, secure preview (with watermark metadata) and
  authorized download.
- **Integrity:** server-side SHA-256 at ingestion; `verify` recomputes from stored
  bytes → `VALID`/`TAMPERED` and raises a security alert on mismatch.
- **Digital signatures:** bound to the document hash (dev value; wire an approved
  PKI provider for production — see SRS §19.2 / Appendix B).
- **Evidence & chain of custody:** registry, transfer/receive, chronological chain.
- **Chained audit log** (`AuditService`): each record stores the previous hash and a
  content hash; `verify-chain` detects the first broken record.
- **Security alerts:** failed logins, repeated denied access, integrity failure,
  unauthorized evidence transfer.
- **OCR/search:** async Tika text extraction; authorization-aware advanced + global
  search that never returns records the caller cannot access.
- **Notifications, dashboard stats, case reports, RBAC-guarded admin.**
- **Standardized errors** via `GlobalExceptionHandler`; no stack traces leaked.

---

## Production hardening checklist (from SRS §23)

- [ ] Real `JWT_SECRET` from a secret manager; never commit `.env`.
- [ ] `SEED_ENABLED=false`; remove all dummy credentials.
- [ ] Replace `LocalFileStorageService` with encrypted object storage / GridFS.
- [ ] Restrict `CORS_ALLOWED_ORIGINS` to real frontend origins.
- [ ] Terminate TLS/HTTPS at the proxy; HSTS is already enabled.
- [ ] Integrate an approved PKI provider for digital signatures.
- [ ] Configure MongoDB Atlas indexes/backups and point-in-time recovery.
- [ ] Add rate limiting / brute-force protection at the gateway for login.
```
