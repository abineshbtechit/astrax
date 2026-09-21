export interface RoleInfo {
  role: string;
  name: string;
  title: string;
  department: string;
  badge: string;
  clearance: string;
}

export const ROLES: Record<string, RoleInfo> = {
  ADMIN: {
    role: 'ADMIN',
    name: 'Dr. Rajesh Sharma',
    title: 'Chief Cryptographic Systems Administrator',
    department: 'NCRB Cyber Command & Security Directorate',
    badge: 'NCRB-ADM-001',
    clearance: 'LEVEL-5 TOP SECRET (FULL CLEARANCE)'
  },
  INVESTIGATION_OFFICER: {
    role: 'INVESTIGATION_OFFICER',
    name: 'DSP Sunita Rao',
    title: 'Senior Investigating Officer',
    department: 'Central Crime Branch (CCB)',
    badge: 'CCB-DSP-4091',
    clearance: 'LEVEL-4 CONFIDENTIAL (INVESTIGATION LEAD)'
  },
  FORENSIC_OFFICER: {
    role: 'FORENSIC_OFFICER',
    name: 'Dr. Priya Nambiar',
    title: 'Senior Forensic Scientist & Evidence Custodian',
    department: 'Central Forensic Science Laboratory (CFSL)',
    badge: 'CFSL-EXP-2104',
    clearance: 'LEVEL-4 FORENSIC LAB (CUSTODIAN CLEARANCE)'
  },
  POLICE_OFFICER: {
    role: 'POLICE_OFFICER',
    name: 'Inspector K. Arumugam',
    title: 'Station House Officer (First Responder)',
    department: 'Greater Chennai Police - Law & Order',
    badge: 'TN-POL-7712',
    clearance: 'LEVEL-3 FIELD OFFICER (STATION SCOPE)'
  },
  JUDGE: {
    role: 'JUDGE',
    name: 'Hon. Justice Meenakshi Sundaram',
    title: 'Principal Sessions & Special NDPS Judge',
    department: 'High Court & City Civil Court',
    badge: 'JUD-TN-048',
    clearance: 'LEVEL-5 JUDICIAL AUTHORITY (COURT ORDERS)'
  },
  DEFENSE_LAWYER: {
    role: 'DEFENSE_LAWYER',
    name: 'Adv. Vikram Malhotra',
    title: 'Senior Defense Counsel (Bar Council Reg #14892)',
    department: 'Bar Association & Legal Aid Cell',
    badge: 'BAR-IND-14892',
    clearance: 'LEVEL-2 SEC 207 CrPC LIMITED COUNSEL ACCESS'
  },
  PROSECUTOR: {
    role: 'PROSECUTOR',
    name: 'Adv. Shalini Swaminathan',
    title: 'Chief Public Prosecutor',
    department: 'Directorate of Prosecution',
    badge: 'DOP-TN-081',
    clearance: 'LEVEL-4 PROSECUTION CLEARANCE'
  },
  COURT_OFFICER: {
    role: 'COURT_OFFICER',
    name: 'Registrar Justice Meenakshi',
    title: 'Sessions Court Judicial Registrar',
    department: 'Registrar General Office',
    badge: 'REG-CRT-109',
    clearance: 'LEVEL-4 JUDICIAL REGISTRY'
  }
};

export const DEMO_CREDENTIALS = [
  { role: 'ADMIN', user: 'admin@secure-dms.local', pass: 'admin123', name: 'Dr. Rajesh Sharma', title: 'System Administrator (Full Clearance)' },
  { role: 'POLICE_OFFICER', user: 'police@secure-dms.local', pass: 'police123', name: 'Inspector K. Arumugam', title: 'Police Station Officer (First Responder)' },
  { role: 'INVESTIGATION_OFFICER', user: 'investigator@secure-dms.local', pass: 'invest123', name: 'DSP Sunita Rao', title: 'Senior Investigating Officer (Lead)' },
  { role: 'FORENSIC_OFFICER', user: 'forensic@secure-dms.local', pass: 'forensic123', name: 'Dr. Priya Nambiar', title: 'CFSL Forensic Scientist (Evidence Custodian)' },
  { role: 'LAWYER', user: 'lawyer@secure-dms.local', pass: 'lawyer123', name: 'Adv. Vikram Malhotra', title: 'Prosecution / Defense Counsel' },
  { role: 'COURT_OFFICER', user: 'court@secure-dms.local', pass: 'court123', name: 'Registrar Justice Meenakshi', title: 'Sessions Court Judicial Registrar' }
];

export const cases = [
  {
    id: 'CASE-2026-001',
    no: 'CASE-2026-001',
    title: 'Commercial Vault Theft & Security Tampering',
    type: 'Financial Crime / Grand Larceny',
    department: 'Central Crime Branch (CCB)',
    officer: 'DSP Sunita Rao',
    priority: 'CRITICAL',
    status: 'UNDER INVESTIGATION',
    updated: '12 min ago',
    docs: 14,
    evidence: 6,
    jurisdiction: 'Zone-1 Special Financial Squad, Chennai',
    synopsis: 'Coordinated heist targeting high-security commercial depository involving electronic access bypass, physical biometric tampering, and forged authorization manifests.',
    riskScore: 'LOW RISK (98% PROCEDURAL ADHERENCE)',
    legalHoldActive: true
  },
  {
    id: 'CASE-2026-002',
    no: 'CASE-2026-002',
    title: 'Financial Phishing & Cyber Extortion Network',
    type: 'Cyber Crime / IT Act Sec 66D',
    department: 'Cyber Crime Cell',
    officer: 'Inspector Priya Nair',
    priority: 'HIGH',
    status: 'PENDING REVIEW',
    updated: '2 hours ago',
    docs: 19,
    evidence: 8,
    jurisdiction: 'State Cyber Division, HQ',
    synopsis: 'Organized syndicate operating fraudulent crypto escrow portals and trojanized banking software to syphon corporate treasuries across multiple jurisdictions.',
    riskScore: 'MEDIUM RISK (MISSING 1 WITNESS STATEMENT)',
    legalHoldActive: true
  },
  {
    id: 'CASE-2026-003',
    no: 'CASE-2026-003',
    title: 'Missing Vulnerable Youth Investigation',
    type: 'Human Trafficking / Special IPC',
    department: 'Anti-Human Trafficking Unit (AHTU)',
    officer: 'Inspector Vikram Singh',
    priority: 'HIGH',
    status: 'UNDER INVESTIGATION',
    updated: '4 hours ago',
    docs: 9,
    evidence: 4,
    jurisdiction: 'Metro Police Commissionerate',
    synopsis: 'Disappearance of two minors from interstate transit terminal with suspicious SIM activations and vehicle toll logs under forensic scrutiny.',
    riskScore: 'LOW RISK (95% PROCEDURAL ADHERENCE)',
    legalHoldActive: false
  },
  {
    id: 'CASE-2026-004',
    no: 'CASE-2026-004',
    title: 'Inter-State Narcotics Logistics Hub',
    type: 'NDPS Act / Contraband Smuggling',
    department: 'Narcotics Control Bureau (NCB)',
    officer: 'Superintendent Rajesh Verma',
    priority: 'CRITICAL',
    status: 'CHARGE SHEET FILED',
    updated: '1 day ago',
    docs: 32,
    evidence: 18,
    jurisdiction: 'Port Trust & Special Customs Zone',
    synopsis: 'Seizure of commercial quantities of synthetic opioids concealed in industrial cooling machinery imported through container terminals.',
    riskScore: 'SAFE (CHARGE SHEET CERTIFIED)',
    legalHoldActive: true
  },
  {
    id: 'CASE-2026-005',
    no: 'CASE-2026-005',
    title: 'Public Infrastructure Tender Kickback Probe',
    type: 'Prevention of Corruption Act',
    department: 'Directorate of Vigilance & Anti-Corruption',
    officer: 'Adv. Shalini Swaminathan',
    priority: 'MEDIUM',
    status: 'IN COURT',
    updated: '3 days ago',
    docs: 41,
    evidence: 12,
    jurisdiction: 'Special Anti-Corruption Court No. 3',
    synopsis: 'Discrepancies in municipal highway expansion tender evaluations and money laundering channels traced to offshore shelf companies.',
    riskScore: 'SAFE (IN JUDICIAL PROCEEDINGS)',
    legalHoldActive: false
  }
];

export const documents = [
  {
    id: 'DOC-2026-001',
    name: 'First Information Report (FIR-92/2026)',
    case: 'CASE-2026-001',
    type: 'FIR',
    classification: 'CONFIDENTIAL',
    owner: 'District Police',
    uploader: 'Inspector K. Arumugam',
    version: 'v1.0',
    workflow: 'SIGNED',
    integrity: 'VALID',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    cipher: 'AES-256-GCM / 256-bit Key',
    size: '1.4 MB',
    updated: '21 Sep 2026, 09:14 IST',
    ocrText: `GOVERNMENT OF TAMIL NADU - POLICE DEPARTMENT
FIRST INFORMATION REPORT (Under Section 154 Cr.P.C.)
1. District: Chennai City | Station: Central Crime Branch | Year: 2026 | FIR No: 92/2026
2. Acts & Sections: Section 379, 420, 120B IPC & Section 43/66 IT Act 2000.
3. Occurrence of Offence: Monday night between 22:00 to 04:30 hrs at Central Vault Facility.
4. Complainant / Informant: R. Santhosh Kumar, Chief Security Officer, Apex Depositories.
5. Suspects: Unknown masked operatives utilizing duplicated biometric tokens and master digital keycards.
6. Details of property stolen: Sovereign bullion and bearer bonds estimated at INR 14.8 Crores.
7. Investigating Officer Assigned: DSP Sunita Rao, CCB.`
  },
  {
    id: 'DOC-2026-002',
    name: 'Forensic Hardware Extraction & Flash Analysis',
    case: 'CASE-2026-001',
    type: 'FORENSIC_REPORT',
    classification: 'RESTRICTED',
    owner: 'Central Forensic Science Laboratory',
    uploader: 'Dr. Priya Nambiar',
    version: 'v2.1',
    workflow: 'APPROVED',
    integrity: 'VALID',
    sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    cipher: 'AES-256-CBC / Hardware Key',
    size: '4.8 MB',
    updated: '21 Sep 2026, 14:32 IST',
    ocrText: `CENTRAL FORENSIC SCIENCE LABORATORY (CFSL) - DIGITAL FORENSICS DIVISION
EXHIBIT ANALYSIS REPORT (Ref: CFSL/CYBER/2026/0891)
Exhibit Marked: EVD-2026-0042 (Samsung Galaxy S23 Ultra) & EVD-2026-0088 (Kingston NVMe SSD).
Methodology: Physical Bit-Stream Imaging via Tableau TX1 Forensic Imager. Hash matched: SHA-256 Verified.
Findings:
1. NAND flash extraction revealed active installation of covert memory wiper 'SledgeByte v3.1'.
2. Deleted encrypted SQLite database reconstructed containing geolocation coordinates for drop-off point near Chennai Port Dock #4.
3. Digital signature certificate extracted from hardware token belongs to ex-facility administrator.`
  },
  {
    id: 'DOC-2026-003',
    name: 'Confidential Witness Statement — Security Supervisor',
    case: 'CASE-2026-001',
    type: 'WITNESS_STATEMENT',
    classification: 'RESTRICTED',
    owner: 'Central Crime Branch (CCB)',
    uploader: 'DSP Sunita Rao',
    version: 'v1.0',
    workflow: 'UNDER_REVIEW',
    integrity: 'VALID',
    sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    cipher: 'AES-256-GCM',
    size: '890 KB',
    updated: '20 Sep 2026, 18:05 IST',
    ocrText: `STATEMENT OF WITNESS UNDER SECTION 161 Cr.P.C.
Name: Murugan Shanmugam | Age: 44 | Occupation: Shift Security Supervisor.
Address: No. 14, Anna Nagar 2nd Avenue, Chennai 600040.
Aadhaar No: 4892-1049-8812 | Mobile: +91 98401 23456.
Statement:
"On the night of September 20th at approximately 23:45 hrs, a courier delivery van bearing commercial registration TN-02-AK-9912 requested access citing emergency HVAC replacement. They presented authorization signed by the facility director. Later, camera feeds froze on Loop-3."`
  },
  {
    id: 'DOC-2026-004',
    name: 'Phishing Syndicate Server Triage & Wire Ledger',
    case: 'CASE-2026-002',
    type: 'INVESTIGATION_REPORT',
    classification: 'CONFIDENTIAL',
    owner: 'Cyber Crime Cell',
    uploader: 'Inspector Priya Nair',
    version: 'v1.2',
    workflow: 'FINAL',
    integrity: 'VALID',
    sha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    cipher: 'AES-256-GCM',
    size: '3.2 MB',
    updated: '19 Sep 2026, 11:20 IST',
    ocrText: `CYBER CRIME POLICE INVESTIGATION REPORT
Target: Rogue cloud VPS infrastructure hosted on foreign proxy subnets.
Triage Results:
- 1,420 fake banking login captures recovered.
- Automated API siphon scripts redirecting OTP authentication through clandestine Telegram bot endpoints.
- Extracted wallet addresses: 0x71C...49A with total illicit turnover exceeding USD 1.2M.`
  },
  {
    id: 'DOC-2026-005',
    name: 'Section 173 CrPC Charge Sheet — Vol I',
    case: 'CASE-2026-004',
    type: 'CHARGE_SHEET',
    classification: 'PUBLIC_RECORD',
    owner: 'Legal Department',
    uploader: 'Adv. Shalini Swaminathan',
    version: 'v1.0',
    workflow: 'SIGNED',
    integrity: 'VALID',
    sha256: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    cipher: 'AES-256-GCM',
    size: '12.4 MB',
    updated: '18 Sep 2026, 16:45 IST',
    ocrText: `IN THE COURT OF THE PRINCIPAL SPECIAL JUDGE FOR NDPS CASES
FINAL REPORT / CHARGE SHEET UNDER SECTION 173 Cr.P.C.
State Police vs. Accused A1 to A7.
1. Total accused named: 7 (4 in judicial custody, 3 absconding).
2. Seized contraband: 42.6 Kilograms Synthetic Methamphetamine tested by CFSL.
3. Cryptographic proof attached: SHA-256 forensic hashes and Section 65B Certificate #CERT-65B-9921.`
  }
];

export const evidence = [
  {
    id: 'EVD-2026-0042',
    name: 'Samsung Galaxy S23 Ultra (Phantom Black)',
    case: 'CASE-2026-001',
    type: 'DIGITAL HANDSET',
    custodian: 'Dr. Priya Nambiar (CFSL)',
    status: 'IN FORENSIC LAB',
    seal: 'SEAL-TN-92831',
    integrity: 'VALID',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    collected: '20 Sep 2026, 06:30 IST by DSP Sunita Rao',
    location: 'CFSL Evidence Vault, Locker E-14',
    condition: 'Physically intact; SIM extracted and bagged; Faraday cage sealed',
    aiConfidence: '99.4% Hardware Match',
    anomalyScore: 'LOW (0.02% Deviation)'
  },
  {
    id: 'EVD-2026-0043',
    name: 'Bypassed Vault Keypad Microcontroller & Wiring',
    case: 'CASE-2026-001',
    type: 'PHYSICAL / ELECTRONIC HARDWARE',
    custodian: 'Dr. Priya Nambiar (CFSL)',
    status: 'IN EXAMINATION',
    seal: 'SEAL-TN-92832',
    integrity: 'VALID',
    hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    collected: '20 Sep 2026, 08:15 IST by Inspector K. Arumugam',
    location: 'CFSL Hardware Reverse Engineering Bench 2',
    condition: 'Solder traces modified; unauthorized ESP32 WiFi sniffer piggybacked',
    aiConfidence: '96.8% Malicious Circuit Mod',
    anomalyScore: 'HIGH ANOMALY (Embedded Trojan)'
  },
  {
    id: 'EVD-2026-0088',
    name: 'Kingston 2TB NVMe M.2 Solid State Drive',
    case: 'CASE-2026-001',
    type: 'DIGITAL STORAGE MEDIA',
    custodian: 'Dr. Priya Nambiar (CFSL)',
    status: 'IMAGE VERIFIED',
    seal: 'SEAL-TN-92833',
    integrity: 'VALID',
    hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    collected: '20 Sep 2026, 09:40 IST by DSP Sunita Rao',
    location: 'Evidence Locker C-08',
    condition: 'Write-blocker mounted; EnCase E01 and Raw DD images generated',
    aiConfidence: '100% Forensic Bitstream Match',
    anomalyScore: 'ZERO DEVIATION'
  },
  {
    id: 'EVD-2026-0104',
    name: 'Rogue Wi-Fi Pineapple Interceptor Device',
    case: 'CASE-2026-002',
    type: 'CYBER WEAPONRY',
    custodian: 'Inspector Priya Nair',
    status: 'IN CUSTODY',
    seal: 'SEAL-TN-88129',
    integrity: 'VALID',
    hash: '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d',
    collected: '19 Sep 2026, 15:00 IST',
    location: 'Cyber Cell Station Evidence Room',
    condition: 'Antennas intact; power supply detached; MAC logged',
    aiConfidence: '98.1% Active Deauth Hardware',
    anomalyScore: 'CRITICAL SIGNALS DETECTED'
  }
];

export const legalHolds = [
  {
    id: 'HOLD-2026-041',
    caseId: 'CASE-2026-001',
    docket: 'Sessions Court Order Ref #SC-4421/2026',
    statutoryRule: 'Section 67C Information Technology Act & Sec 14 Bharatiya Sakshya Adhiniyam',
    issuedBy: 'Hon. Justice Meenakshi Sundaram (Principal Sessions Judge)',
    targetType: 'ALL CASE EXHIBITS & SERVER ACCESS LOGS',
    status: 'ACTIVE - IMMUTABLE PRESERVATION',
    retentionFreeze: 'LIFETIME OF PROSECUTION + 30 YEARS',
    effectiveDate: '20 Sep 2026',
    autoPurgeStatus: 'BLOCKED'
  },
  {
    id: 'HOLD-2026-038',
    caseId: 'CASE-2026-002',
    docket: 'High Court Writ Petition #WP-88219/2026',
    statutoryRule: 'Section 91 Cr.P.C. & Section 65B Evidentiary Preservation',
    issuedBy: 'Special Cyber Division Registrar',
    targetType: 'ISP TELECOM CDRs & IPDR AUDIT RECORDS',
    status: 'ACTIVE - IMMUTABLE PRESERVATION',
    retentionFreeze: 'MANDATORY STATUTORY HOLD',
    effectiveDate: '18 Sep 2026',
    autoPurgeStatus: 'BLOCKED'
  }
];

export const accessRequests = [
  {
    id: 'REQ-2026-092',
    documentId: 'DOC-2026-002',
    documentName: 'Forensic Hardware Extraction & Flash Analysis',
    case: 'CASE-2026-001',
    requester: 'Adv. Vikram Malhotra',
    role: 'DEFENSE_LAWYER',
    department: 'Defense Counsel / Bar Council',
    permissions: ['VIEW', 'EXAMINATION_COPY'],
    purpose: 'Section 207 Cr.P.C. Mandatory Discovery Material for Accused Bail Hearing',
    status: 'APPROVED',
    timeBoundExpiry: '24 Sep 2026, 23:59 IST',
    reviewedBy: 'Dr. Rajesh Sharma (ADMIN)'
  },
  {
    id: 'REQ-2026-094',
    documentId: 'DOC-2026-003',
    documentName: 'Confidential Witness Statement — Security Supervisor',
    case: 'CASE-2026-001',
    requester: 'Adv. Vikram Malhotra',
    role: 'DEFENSE_LAWYER',
    department: 'Defense Counsel',
    permissions: ['VIEW'],
    purpose: 'Cross-examination preparation under Indian Evidence Act',
    status: 'PENDING_REVIEW',
    timeBoundExpiry: 'Pending Judicial Discretion',
    reviewedBy: 'Under CCB Review'
  },
  {
    id: 'REQ-2026-088',
    documentId: 'DOC-2026-001',
    documentName: 'First Information Report (FIR-92/2026)',
    case: 'CASE-2026-001',
    requester: 'Inspector Priya Nair',
    role: 'INVESTIGATION_OFFICER',
    department: 'Cyber Crime Cell',
    permissions: ['VIEW', 'CROSS_CASE_LINK'],
    purpose: 'Correlating IPDR telemetry with Phishing Syndicate server nodes',
    status: 'APPROVED',
    timeBoundExpiry: '30 Sep 2026',
    reviewedBy: 'DSP Sunita Rao'
  }
];

export const retentionRules = [
  { category: 'First Information Reports (FIRs)', rule: 'Rule 420 State Police Manual', retentionYears: 25, supremacy: 'Subject to Active Legal Hold Supremacy', status: 'COMPLIANT' },
  { category: 'Charge Sheets & Final Judicial Reports', rule: 'Section 173 CrPC / Bharatiya Nagarik Suraksha Sanhita', retentionYears: 30, supremacy: 'Permanent Digital Archival', status: 'COMPLIANT' },
  { category: 'CFSL Digital Forensic Raw Images', rule: 'NIST SP 800-86 & FIPS 180-4 Guidelines', retentionYears: 20, supremacy: 'Immutable Hash Checksum Lock', status: 'COMPLIANT' },
  { category: 'Tamper & Security Audit Log Chains', rule: 'ISO/IEC 27001 & IT Act Section 67C', retentionYears: 35, supremacy: 'Non-Deletable Write-Once Ledger', status: 'COMPLIANT' }
];

export const auditLogs = [
  {
    id: 'AUD-88912',
    timestamp: '22 Sep 2026, 00:38 IST',
    actor: 'Dr. Rajesh Sharma',
    role: 'ADMIN',
    action: 'INTEGRITY_VERIFICATION_SWEEP',
    resource: 'SYSTEM_WIDE_SHA256_VERIFICATION',
    result: 'SUCCESS',
    prevHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    currHash: '11a6293931665a046c433eb1586a11e18987b2f9eb8b37f64d23fd469ef7e6d0'
  },
  {
    id: 'AUD-88911',
    timestamp: '21 Sep 2026, 23:15 IST',
    actor: 'Dr. Priya Nambiar',
    role: 'FORENSIC_OFFICER',
    action: 'EVIDENCE_SEAL_VERIFIED',
    resource: 'EVD-2026-0042 (Samsung Galaxy S23)',
    result: 'SUCCESS',
    prevHash: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
    currHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
  },
  {
    id: 'AUD-88910',
    timestamp: '21 Sep 2026, 21:40 IST',
    actor: 'DSP Sunita Rao',
    role: 'INVESTIGATION_OFFICER',
    action: 'DIGITAL_SIGNATURE_APPLIED',
    resource: 'DOC-2026-001 (FIR-92/2026)',
    result: 'SUCCESS',
    prevHash: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
    currHash: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b'
  },
  {
    id: 'AUD-88909',
    timestamp: '21 Sep 2026, 19:22 IST',
    actor: 'Adv. Vikram Malhotra',
    role: 'DEFENSE_LAWYER',
    action: 'ACCESS_REQUEST_SUBMITTED',
    resource: 'DOC-2026-002 (CFSL Report)',
    result: 'PENDING',
    prevHash: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
    currHash: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35'
  },
  {
    id: 'AUD-88908',
    timestamp: '21 Sep 2026, 17:04 IST',
    actor: 'Unknown IP (10.14.8.22)',
    role: 'ANONYMOUS_PROBE',
    action: 'UNAUTHORIZED_EXHIBIT_ACCESS_ATTEMPT',
    resource: 'EVD-2026-0088 (NVMe SSD)',
    result: 'DENIED',
    prevHash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    currHash: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'
  }
];

export const securityAlerts = [
  {
    id: 'ALT-2026-001',
    alertType: 'Tamper Alarm: Bit-Flip Anomaly Probe',
    severity: 'CRITICAL',
    actor: 'External Endpoint 10.14.8.22',
    description: 'Cryptographic checksum mismatch detected during automated node verification sweep.',
    detectedAt: '21 Sep 2026, 17:04 IST',
    status: 'ACTIVE_INVESTIGATING'
  },
  {
    id: 'ALT-2026-002',
    alertType: 'Velocity Warning: Rapid Bulk Download Attempt',
    severity: 'HIGH',
    actor: 'User Adv. Vikram Malhotra (Defense)',
    description: '8 forensic evidentiary annexures requested within 45 seconds exceeding threshold.',
    detectedAt: '21 Sep 2026, 15:30 IST',
    status: 'ACKNOWLEDGED'
  },
  {
    id: 'ALT-2026-003',
    alertType: 'Authentication Threshold: Multiple Failed Handshakes',
    severity: 'MEDIUM',
    actor: 'Station Terminal #04',
    description: '5 consecutive invalid PKI certificate challenges before account suspension trigger.',
    detectedAt: '21 Sep 2026, 12:18 IST',
    status: 'RESOLVED'
  }
];

export const timelineEvents = [
  {
    id: 'TL-1',
    time: '21 Sep 2026, 21:40 IST',
    actor: 'DSP Sunita Rao',
    role: 'INVESTIGATION_OFFICER',
    type: 'SIGNATURE',
    title: 'First Information Report Digitally Sealed',
    desc: 'FIR-92/2026 signed with cryptographic token and SHA-256 digest permanently anchored.',
    case: 'CASE-2026-001'
  },
  {
    id: 'TL-2',
    time: '21 Sep 2026, 14:32 IST',
    actor: 'Dr. Priya Nambiar',
    role: 'FORENSIC_OFFICER',
    type: 'FORENSICS',
    title: 'CFSL Hardware Analysis Concluded',
    desc: 'Bypassed keypad microcontroller firmware dumped. Clandestine ESP32 sniffer circuit identified.',
    case: 'CASE-2026-001'
  },
  {
    id: 'TL-3',
    time: '20 Sep 2026, 18:00 IST',
    actor: 'Hon. Justice Meenakshi Sundaram',
    role: 'JUDGE',
    type: 'LEGAL_HOLD',
    title: 'Statutory Preservation Order Enacted',
    desc: 'Court Order Ref #SC-4421/2026 issued under Section 67C IT Act freezing all depository logs.',
    case: 'CASE-2026-001'
  },
  {
    id: 'TL-4',
    time: '20 Sep 2026, 06:30 IST',
    actor: 'Inspector K. Arumugam',
    role: 'POLICE_OFFICER',
    type: 'CUSTODY',
    title: 'Evidence Seized and Tamper-Proof Sealed',
    desc: 'Samsung Galaxy S23 Ultra and hardware components seized at scene under SEAL-TN-92831.',
    case: 'CASE-2026-001'
  }
];

export const activity = [
  ['Document Approved', 'CFSL Hardware Extraction & Flash Analysis', '14 min ago', 'success'],
  ['Evidence Seal Verified', 'EVD-2026-0042 verified by Dr. Priya Nambiar', '42 min ago', 'success'],
  ['Legal Hold Active', 'Preservation Order #HOLD-2026-041 locked on CASE-2026-001', '2 hours ago', 'warning'],
  ['Access Request Approved', 'Adv. Vikram Malhotra granted 72-hr discovery view', '4 hours ago', 'info'],
  ['Security Probe Blocked', 'Unauthorized exhibit access attempt thwarted', '7 hours ago', 'danger']
];
