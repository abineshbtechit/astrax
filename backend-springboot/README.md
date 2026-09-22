# AstraX Legal & Evidentiary DMS — Spring Boot Backend

Production-grade Spring Boot 3 backend service for the **AstraX Legal DMS** digital evidentiary repository and investigation platform, fully integrated with **MongoDB Atlas**.

---

## 1. Architecture Overview
- **Framework**: Spring Boot 3.2.3 (Java 17+)
- **Database**: MongoDB Atlas (`ncrb_legal_dms` cluster database) via Spring Data MongoDB
- **Security & Cross-Origin**: Configured for React SPA on port `3000` / Cloud Run
- **Collections Persisted**:
  - `cases`: Criminal investigation dossiers, participating police units, FIR metadata
  - `documents`: Section 65B certified legal documents, SHA-256 bitstream checksums, version history
  - `evidence`: Physical & digital evidence registry with tamper-evident seal barcodes and chain-of-custody transfer handoffs
  - `audit_logs`: Append-only tamper-evident blockchain-style cryptographic audit trail
  - `access_requests`: Cross-departmental authorization workflows (Police, Forensic Lab, Prosecution, Judiciary)

---

## 2. Configuration (`application.properties`)
The backend connects directly to your MongoDB Atlas cluster using the standard connection string:

```properties
server.port=8080
spring.application.name=astrax-legal-dms-backend

# MongoDB Atlas Connection
spring.data.mongodb.uri=${MONGODB_URI:mongodb+srv://abineshas788207_db_user:<db_password>@cluster0.blbm9h7.mongodb.net/ncrb_legal_dms?retryWrites=true&w=majority}
spring.data.mongodb.database=ncrb_legal_dms
```

You can also pass `MONGODB_URI` via environment variables:
```bash
export MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.blbm9h7.mongodb.net/ncrb_legal_dms?retryWrites=true&w=majority"
```

---

## 3. Endpoints Aligned with Frontend

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health and MongoDB ping status |
| `GET` | `/api/cases` | Retrieve all investigation cases from MongoDB |
| `POST` | `/api/cases` | Create and register a new case dossier |
| `PUT` | `/api/cases/{id}` | Update case status, jurisdiction, or parameters |
| `GET` | `/api/documents` | Retrieve all documents and version trees |
| `POST` | `/api/documents` | Upload a new legal record and compute SHA-256 hash |
| `POST` | `/api/documents/{id}/version` | Commit a new document version to MongoDB |
| `POST` | `/api/documents/{id}/verify` | Cryptographic Section 65B hash verification |
| `GET` | `/api/evidence` | List all exhibits and tamper-proof seals |
| `POST` | `/api/evidence` | Register physical or digital evidence item |
| `POST` | `/api/evidence/{id}/transfer` | Record chronological custody handoff node |
| `GET` | `/api/audit-logs` | Retrieve chronological legal audit trail |
| `POST` | `/api/audit-logs` | Record immutable security audit log |
| `GET` | `/api/access-requests` | View pending cross-department access requests |
| `POST` | `/api/access-requests` | Submit access clearance request |
| `PUT` | `/api/access-requests/{id}/status` | Approve or reject document clearance |
| `POST` | `/api/seed` | Seed or bulk-sync data into MongoDB collections |

---

## 4. How to Run

### Prerequisite
Ensure Java 17+ and Maven are installed:
```bash
java -version
mvn -version
```

### Run Locally
```bash
cd backend-springboot
mvn clean spring-boot:run
```
The Spring Boot REST API will be accessible on `http://localhost:8080/api/health`.

### Package JAR for Production
```bash
mvn clean package -DskipTests
java -jar target/astrax-legal-dms-backend-1.0.0-SNAPSHOT.jar
```
