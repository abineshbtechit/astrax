export const cases=[
{id:'1',no:'INV-2026-0142',title:'Harbor Freight Diversion',type:'Financial Crime',department:'Investigation Bureau',officer:'Arjun Mehta',priority:'Critical',status:'UNDER INVESTIGATION',updated:'18 min ago',docs:28,evidence:14},
{id:'2',no:'INV-2026-0138',title:'North District Cyber Intrusion',type:'Cyber Crime',department:'Cyber Crime Cell',officer:'Priya Nair',priority:'High',status:'PENDING REVIEW',updated:'2 hours ago',docs:19,evidence:7},
{id:'3',no:'INV-2026-0127',title:'State Highway Collision',type:'Traffic / Forensic',department:'Forensic Sciences',officer:'Vikram Singh',priority:'Medium',status:'CHARGE SHEET FILED',updated:'Yesterday',docs:34,evidence:21},
{id:'4',no:'INV-2026-0119',title:'Public Tender Irregularities',type:'Anti-Corruption',department:'Legal Department',officer:'Kavya Rao',priority:'High',status:'IN COURT',updated:'2 days ago',docs:42,evidence:9},
{id:'5',no:'INV-2026-0094',title:'Warehouse Fire Inquiry',type:'Arson',department:'District Police',officer:'Mohammed Ali',priority:'Low',status:'CLOSED',updated:'12 Sep 2026',docs:16,evidence:11}];
export const documents=[
{id:'DOC-8821',name:'Forensic Analysis Report — Device A12',case:'INV-2026-0138',type:'FORENSIC REPORT',classification:'RESTRICTED',owner:'Forensic Sciences',version:'v2.1',workflow:'UNDER REVIEW',integrity:'VALID',updated:'21 Sep 2026'},
{id:'DOC-8817',name:'First Information Report',case:'INV-2026-0142',type:'FIR',classification:'CONFIDENTIAL',owner:'District Police',version:'v1.0',workflow:'SIGNED',integrity:'VALID',updated:'21 Sep 2026'},
{id:'DOC-8792',name:'Witness Statement — W-004',case:'INV-2026-0142',type:'WITNESS STATEMENT',classification:'RESTRICTED',owner:'Investigation Bureau',version:'v1.0',workflow:'APPROVED',integrity:'VALID',updated:'20 Sep 2026'},
{id:'DOC-8741',name:'Digital Transaction Ledger',case:'INV-2026-0119',type:'EVIDENCE',classification:'CONFIDENTIAL',owner:'Anti-Corruption Unit',version:'v3.0',workflow:'FINAL',integrity:'VALID',updated:'19 Sep 2026'},
{id:'DOC-8688',name:'Charge Sheet — Final',case:'INV-2026-0127',type:'CHARGE SHEET',classification:'PUBLIC RECORD',owner:'Legal Department',version:'v1.2',workflow:'FINAL',integrity:'VALID',updated:'18 Sep 2026'}];
export const evidence=[
{id:'EVD-2026-0481',name:'Encrypted mobile device',case:'INV-2026-0138',type:'DIGITAL DEVICE',custodian:'Dr. Neha Kapoor',status:'IN EXAMINATION',seal:'SL-77841',integrity:'VALID'},
{id:'EVD-2026-0477',name:'Shipping manifest originals',case:'INV-2026-0142',type:'DOCUMENT',custodian:'Arjun Mehta',status:'IN CUSTODY',seal:'SL-77802',integrity:'VALID'},
{id:'EVD-2026-0469',name:'Warehouse CCTV drive',case:'INV-2026-0094',type:'DIGITAL MEDIA',custodian:'Evidence Locker B',status:'SEALED',seal:'SL-77691',integrity:'VALID'},
{id:'EVD-2026-0432',name:'Vehicle brake assembly',case:'INV-2026-0127',type:'PHYSICAL',custodian:'Forensic Lab 3',status:'IN EXAMINATION',seal:'SL-77218',integrity:'PENDING'}];
export const activity=[['Document approved','Forensic Analysis Report — Device A12','8 min ago','success'],['Access granted','Legal Department received VIEW access','24 min ago','info'],['Evidence transferred','EVD-2026-0481 received by Dr. Neha Kapoor','1 hour ago','warning'],['Integrity verified','DOC-8741 hash matched authoritative file','2 hours ago','success'],['Security alert','Repeated denied access from user account','3 hours ago','danger']];
