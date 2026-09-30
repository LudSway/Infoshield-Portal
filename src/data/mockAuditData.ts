export interface AuditItem {
  id: string;
  code: string;
  title: string;
  description: string;
  documentRequired: string;
  evidenceToPresent: string;
  standard: "ISO-27001" | "PCI-DSS";
  type: "clause" | "control";
}

export const ISO_27001_CLAUSES: AuditItem[] = [
  {
    id: "ISO-CL-4.1",
    code: "Clause 4.1",
    title: "Understanding the Organization & Context",
    description: "Determine external and internal issues that are relevant to the organization's purpose and affect its ability to achieve intended outcomes of the ISMS.",
    documentRequired: "Context of the Organization (ISMS Scope Definition & SWOT Analysis document)",
    evidenceToPresent: "Internal and external issue logs, stakeholder SWOT analysis, or minutes from context assessment workshops.",
    standard: "ISO-27001",
    type: "clause"
  },
  {
    id: "ISO-CL-4.2",
    code: "Clause 4.2",
    title: "Needs & Expectations of Interested Parties",
    description: "Identify interested parties that are relevant to the ISMS, and determine their specific security requirements.",
    documentRequired: "Interested Parties Registry / SLA Requirements Matrix",
    evidenceToPresent: "Legal, regulatory, and contractual requirement registries, stakeholder SLA clauses, and corporate agreements.",
    standard: "ISO-27001",
    type: "clause"
  },
  {
    id: "ISO-CL-4.3",
    code: "Clause 4.3",
    title: "Determining the Scope of the ISMS",
    description: "Establish the physical, organizational, and technological boundaries and applicability of the ISMS.",
    documentRequired: "ISMS Scope Statement & System Boundary diagram",
    evidenceToPresent: "Detailed network architecture diagram showing trust boundaries, physical facility layouts, and business divisions covered.",
    standard: "ISO-27001",
    type: "clause"
  },
  {
    id: "ISO-CL-5.1",
    code: "Clause 5.1",
    title: "Leadership and Commitment",
    description: "Demonstrate executive leadership commitment to supporting the integration of security into the organizational processes.",
    documentRequired: "Executive Security Mandate / Signed Security Charter",
    evidenceToPresent: "Minutes from executive board meetings with security budget approvals, staffing allocations, and signed governance charters.",
    standard: "ISO-27001",
    type: "clause"
  },
  {
    id: "ISO-CL-5.2",
    code: "Clause 5.2",
    title: "Information Security Policy",
    description: "Establish an information security policy that is aligned with corporate objectives, published, and communicated to staff.",
    documentRequired: "Information Security Policy (ISP)",
    evidenceToPresent: "Document version control history, evidence of policy publication on corporate intranet, and digital staff read-acknowledgment logs.",
    standard: "ISO-27001",
    type: "clause"
  },
  {
    id: "ISO-CL-6.1",
    code: "Clause 6.1",
    title: "Actions to Address Risks & Opportunities",
    description: "Define a systematic information security risk assessment and risk treatment methodology that produces consistent results.",
    documentRequired: "Information Security Risk Assessment and Treatment Procedure",
    evidenceToPresent: "Active corporate Risk Register, documented threat modeling reports, and signed risk treatment plans.",
    standard: "ISO-27001",
    type: "clause"
  },
  {
    id: "ISO-CL-6.2",
    code: "Clause 6.2",
    title: "Information Security Objectives",
    description: "Establish measurable security objectives at relevant functions and levels, with clear plans on how they will be achieved.",
    documentRequired: "ISMS Security Objectives Plan & Key Performance Indicators (KPIs) Matrix",
    evidenceToPresent: "Active roadmap logs, KPI tracking spreadsheets, and evidence of performance review against security benchmarks.",
    standard: "ISO-27001",
    type: "clause"
  },
  {
    id: "ISO-CL-7.2",
    code: "Clause 7.2",
    title: "Competence Assessment",
    description: "Ensure that employees and external contractors are competent on the basis of appropriate education, training, or experience.",
    documentRequired: "Job Descriptions, Training Matrix & HR Qualifications standard",
    evidenceToPresent: "Professional certificates (e.g., CISSP, CISM, Sec+), academic degree transcripts, and verification of background screenings.",
    standard: "ISO-27001",
    type: "clause"
  },
  {
    id: "ISO-CL-7.3",
    code: "Clause 7.3",
    title: "Security Awareness Program",
    description: "Ensure that persons doing work under the organization's control are aware of the security policy and their contribution to the ISMS.",
    documentRequired: "Employee Security Training and Awareness Curriculum",
    evidenceToPresent: "LMS training completion rate records, phishing simulation reports, and corporate policy update notification newsletters.",
    standard: "ISO-27001",
    type: "clause"
  },
  {
    id: "ISO-CL-8.2",
    code: "Clause 8.2",
    title: "Information Security Risk Assessment",
    description: "Perform information security risk assessments at planned intervals, or when significant changes are proposed or occur.",
    documentRequired: "Risk Assessment Report",
    evidenceToPresent: "Historical risk assessment logs, comparative threat registers, and executive approval stamps on identified risks.",
    standard: "ISO-27001",
    type: "clause"
  },
  {
    id: "ISO-CL-9.1",
    code: "Clause 9.1",
    title: "Monitoring, Measurement & Evaluation",
    description: "Determine what needs to be monitored, the methods for monitoring, and when monitoring data will be analyzed.",
    documentRequired: "ISMS Performance Monitoring Procedure",
    evidenceToPresent: "SIEM log analysis reports, system uptime dashboards, service desk ticket SLAs, and network diagnostic reports.",
    standard: "ISO-27001",
    type: "clause"
  },
  {
    id: "ISO-CL-9.2",
    code: "Clause 9.2",
    title: "Internal Audit Program",
    description: "Conduct internal audits at planned intervals to verify whether the ISMS conforms to requirements and is effectively implemented.",
    documentRequired: "Internal Audit Plan & Procedure",
    evidenceToPresent: "Completed Internal Audit Report, formal audit findings log, and corrective action recommendations signed off by the auditor.",
    standard: "ISO-27001",
    type: "clause"
  },
  {
    id: "ISO-CL-10.1",
    code: "Clause 10.1",
    title: "Continual Improvement (CAPA)",
    description: "React to nonconformities, take corrective actions to control and correct them, and eliminate the root cause.",
    documentRequired: "Corrective and Preventive Action (CAPA) Standard Operating Procedure",
    evidenceToPresent: "Active CAPA Tracker database, root cause analysis documents for past outages, and post-incident review retrospectives.",
    standard: "ISO-27001",
    type: "clause"
  }
];

export const ISO_27001_CONTROLS: AuditItem[] = (() => {
  const A5_TITLES: Record<number, string> = {
    1: "Policies for information security",
    2: "Information security roles and responsibilities",
    3: "Segregation of duties",
    4: "Management responsibilities",
    5: "Contact with authorities",
    6: "Contact with special interest groups",
    7: "Threat intelligence",
    8: "Information security in project management",
    9: "Inventory of information and other associated assets",
    10: "Acceptable use of information and other associated assets",
    11: "Return of assets",
    12: "Classification of information",
    13: "Labelling of information",
    14: "Information transfer",
    15: "Access control",
    16: "Identity management",
    17: "Authentication information",
    18: "Access rights",
    19: "Information security in supplier relationships",
    20: "Addressing information security in supplier agreements",
    21: "Managing information security in the ICT supply chain",
    22: "Monitoring, review and change management of supplier services",
    23: "Information security for use of cloud services",
    24: "Information security incident management planning and preparation",
    25: "Assessment and decision on information security events",
    26: "Response to information security incidents",
    27: "Learning from information security incidents",
    28: "Collection of evidence",
    29: "Information security during disruption",
    30: "ICT readiness for business continuity",
    31: "Legal, statutory, regulatory and contractual requirements",
    32: "Intellectual property rights",
    33: "Protection of records",
    34: "Privacy and protection of personally identifiable information (PII)",
    35: "Independent review of information security",
    36: "Compliance with policies and standards for information security",
    37: "Documented operating procedures"
  };

  const A6_TITLES: Record<number, string> = {
    1: "Screening",
    2: "Terms and conditions of employment",
    3: "Information security awareness, education and training",
    4: "Disciplinary process",
    5: "Responsibilities after termination or change of employment",
    6: "Confidentiality or non-disclosure agreements",
    7: "Remote working",
    8: "Information security event reporting"
  };

  const A7_TITLES: Record<number, string> = {
    1: "Physical security perimeters",
    2: "Physical entry controls",
    3: "Securing offices, rooms and facilities",
    4: "Physical security monitoring",
    5: "Protecting against physical and environmental threats",
    6: "Working in secure areas",
    7: "Clear desk and clear screen",
    8: "Equipment siting and protection",
    9: "Security of assets off-premises",
    10: "Storage media",
    11: "Supporting utilities",
    12: "Cabling security",
    13: "Equipment maintenance",
    14: "Secure disposal or re-use of equipment"
  };

  const A8_TITLES: Record<number, string> = {
    1: "User endpoint devices",
    2: "Privileged access rights",
    3: "Information access restriction",
    4: "Access to source code",
    5: "Secure authentication",
    6: "Capacity management",
    7: "Protection against malware",
    8: "Management of technical vulnerabilities",
    9: "Configuration management",
    10: "Information deletion",
    11: "Data masking",
    12: "Data leakage prevention",
    13: "Information backup",
    14: "Redundancy of information processing facilities",
    15: "Logging",
    16: "Monitoring activities",
    17: "Clock synchronization",
    18: "Use of privileged utility programs",
    19: "Installation of software on operational systems",
    20: "Networks security",
    21: "Security of network services",
    22: "Segregation of networks",
    23: "Web filtering",
    24: "Use of cryptography",
    25: "Secure development life cycle",
    26: "Application security requirements",
    27: "Secure system architecture and engineering principles",
    28: "Secure coding",
    29: "Security testing in development and acceptance",
    30: "Outsourced development",
    31: "Separation of development, test and production environments",
    32: "Change management",
    33: "Test information",
    34: "Protection of information systems during auditing testing"
  };

  const controls: AuditItem[] = [];

  const getDetails = (code: string, title: string): AuditItem => {
    let description = `Formally govern, implement, and maintain ${title.toLowerCase()} in accordance with organizational risk appetite and ISO 27001:2022 standards.`;
    let documentRequired = `${title} Governance Standard Operating Procedure`;
    let evidenceToPresent = `Signed approval logs, configuration parameters, and quarterly assessment records for ${title.toLowerCase()}.`;

    if (code.startsWith("A.5.")) {
      documentRequired = `Annex A ${code} ${title} Policy Standard`;
      evidenceToPresent = `Executive leadership meeting minutes, CISO approval logs, and governance risk register records for ${title.toLowerCase()}.`;
    } else if (code.startsWith("A.6.")) {
      documentRequired = `Annex A ${code} ${title} HR Security Standard`;
      evidenceToPresent = `HR onboarding/offboarding checklists, LMS training logs, and signed confidentiality agreements for ${title.toLowerCase()}.`;
    } else if (code.startsWith("A.7.")) {
      documentRequired = `Annex A ${code} ${title} Physical Security Standard`;
      evidenceToPresent = `Keycard access logs, CCTV camera coverage maps, and data center SOC 2 Type II audit reports for ${title.toLowerCase()}.`;
    } else if (code.startsWith("A.8.")) {
      documentRequired = `Annex A ${code} ${title} Technical Specification Baseline`;
      evidenceToPresent = `Cloud platform console exports, IAM rule listings, SIEM log telemetry, and vulnerability scan reports for ${title.toLowerCase()}.`;
    }

    if (code === "A.5.15") {
      description = "Rules to control physical and logical access to information and other associated assets are established and implemented.";
      documentRequired = "Access Control & Identity Management Policy";
      evidenceToPresent = "Active IAM directory user registry, firewall rules showing restricted SSH/RDP ingress, and quarterly privilege access review logs.";
    } else if (code === "A.5.30") {
      description = "Ensure that information communication technology readiness is planned, implemented, and tested for continuity.";
      documentRequired = "Business Continuity Plan (BCP) & Disaster Recovery (DR) Strategy";
      evidenceToPresent = "Disaster Recovery tabletop simulation results, database backup restoration validation logs, and failover network switch records.";
    } else if (code === "A.6.3") {
      description = "Staff receive appropriate security awareness training and regular updates on organizational policies.";
      documentRequired = "Staff Security Training Plan & Standard Operating Procedure";
      evidenceToPresent = "Phishing report submission rate metrics, training completion logs from the HR department, and signed physical policy handbooks.";
    } else if (code === "A.7.4") {
      description = "Physical facilities are monitored for unauthorized physical access or safety hazards.";
      documentRequired = "Physical Security & Facility Entry Guidelines";
      evidenceToPresent = "CCTV surveillance camera placement maps, visitor registration ledgers, and magnetic badge swipe audit reports for server vaults.";
    } else if (code === "A.8.8") {
      description = "Information about technical vulnerabilities of information systems is obtained, evaluated, and addressed.";
      documentRequired = "Vulnerability Management & Patching Policy";
      evidenceToPresent = "Clean Approved Scanning Vendor (ASV) report, VAPT reports with evidence of remediation, and associated deployment logs.";
    } else if (code === "A.8.20") {
      description = "Networks and network devices are secured, managed, and monitored to protect information in transit.";
      documentRequired = "Network Architecture Guidelines & Hardening Checklist";
      evidenceToPresent = "Active WAF configuration settings, IDS sensor positioning logs, routing tables, and firewall rulesets forbidding legacy SSL protocols.";
    } else if (code === "A.8.24") {
      description = "Rules for the effective use of cryptography, including key management, are established and implemented.";
      documentRequired = "Key Management & Encryption Policy";
      evidenceToPresent = "Encryption key rotation schedules, TLS certificates showing strong RSA 4096 / ECC algorithms, and database table-level encryption parameters.";
    }

    return {
      id: `ISO-${code}`,
      code,
      title,
      description,
      documentRequired,
      evidenceToPresent,
      standard: "ISO-27001",
      type: "control"
    };
  };

  Object.entries(A5_TITLES).forEach(([numStr, title]) => {
    controls.push(getDetails(`A.5.${numStr}`, title));
  });
  Object.entries(A6_TITLES).forEach(([numStr, title]) => {
    controls.push(getDetails(`A.6.${numStr}`, title));
  });
  Object.entries(A7_TITLES).forEach(([numStr, title]) => {
    controls.push(getDetails(`A.7.${numStr}`, title));
  });
  Object.entries(A8_TITLES).forEach(([numStr, title]) => {
    controls.push(getDetails(`A.8.${numStr}`, title));
  });

  return controls;
})();

export const PCI_DSS_REQS: AuditItem[] = [
  {
    id: "PCI-REQ-1",
    code: "Requirement 1",
    title: "Network Security Controls (NSCs)",
    description: "Install and maintain network security controls, such as firewalls, to protect systems storing and processing cardholder data.",
    documentRequired: "Firewall Configuration and Inbound/Outbound Protocol Policy",
    evidenceToPresent: "Network topology diagrams, documented business justification for all open ports, and bi-annual firewall rule configuration reviews.",
    standard: "PCI-DSS",
    type: "clause"
  },
  {
    id: "PCI-REQ-2",
    code: "Requirement 2",
    title: "Secure Configurations",
    description: "Apply secure configurations to all system components. Ensure default vendor passwords and configuration settings are changed immediately.",
    documentRequired: "System Hardening Standards (CIS Benchmarks baseline)",
    evidenceToPresent: "Automated configuration compliance logs, server build templates, and documentation confirming disabled default accounts.",
    standard: "PCI-DSS",
    type: "clause"
  },
  {
    id: "PCI-REQ-3",
    code: "Requirement 3",
    title: "Protect Stored Account Data",
    description: "Protect stored account data (SAD) with strong cryptography, truncation, or tokenization, and limit its retention.",
    documentRequired: "Cardholder Data (CHD) Retention & Disposal Policy",
    evidenceToPresent: "Database schema proving field-level AES-256 encryption, key-custodian key shares protocols, and automated cron job logs deleting expired data.",
    standard: "PCI-DSS",
    type: "clause"
  },
  {
    id: "PCI-REQ-4",
    code: "Requirement 4",
    title: "Protect Cardholder Data in Transit",
    description: "Protect cardholder data with strong cryptography during transmission across open, public networks.",
    documentRequired: "Data in Transit Cryptography Standard (TLS 1.2/1.3 protocol requirement)",
    evidenceToPresent: "Web server HTTPS configurations, certificate validation logs, and network protocol analyses checking for cleartext HTTP traffic.",
    standard: "PCI-DSS",
    type: "clause"
  },
  {
    id: "PCI-REQ-5",
    code: "Requirement 5",
    title: "Protect Systems from Malware",
    description: "Protect all systems and networks from malicious software and ensure anti-malware software is actively running and updated.",
    documentRequired: "Malware Defense Strategy & Update Standard",
    evidenceToPresent: "Central anti-virus management console screenshots, real-time alert logs, and system update logs proving weekly engine updates.",
    standard: "PCI-DSS",
    type: "clause"
  },
  {
    id: "PCI-REQ-6",
    code: "Requirement 6",
    title: "Develop Secure Systems & Software",
    description: "Develop and maintain secure systems and software, applying security patches and following secure coding frameworks.",
    documentRequired: "Software Development Life Cycle (SDLC) & Change Control Policy",
    evidenceToPresent: "OWASP Top 10 code review guidelines, static/dynamic analysis (SAST/DAST) scans, and pre-deployment CAB sign-offs.",
    standard: "PCI-DSS",
    type: "clause"
  },
  {
    id: "PCI-REQ-7",
    code: "Requirement 7",
    title: "Restrict Access by Need-to-Know",
    description: "Restrict access to system components and cardholder data by business need-to-know, ensuring least-privilege standards are met.",
    documentRequired: "Identity and Access Management (IAM) Policy & Privilege Matrix",
    evidenceToPresent: "Active Active Directory/IAM role mappings, access request approvals, and list of administrators with business justifications.",
    standard: "PCI-DSS",
    type: "clause"
  },
  {
    id: "PCI-REQ-8",
    code: "Requirement 8",
    title: "Identify Users & Authenticate Access",
    description: "Identify users and authenticate access to system components. Ensure multi-factor authentication (MFA) is deployed for administrative access.",
    documentRequired: "Multi-Factor Authentication (MFA) Configuration Standard",
    evidenceToPresent: "IAM parameters enforcing MFA on all administrative users, Active Directory password length rules, and lockout configurations.",
    standard: "PCI-DSS",
    type: "clause"
  },
  {
    id: "PCI-REQ-9",
    code: "Requirement 9",
    title: "Restrict Physical Access",
    description: "Restrict physical access to cardholder data. Prevent unauthorized physical access to physical devices storing cardholder data.",
    documentRequired: "Facility Physical Security Guidelines & Access Policy",
    evidenceToPresent: "Physical entry logs (visitor badges), video surveillance retention logs, and locking hardware records for server racks.",
    standard: "PCI-DSS",
    type: "clause"
  },
  {
    id: "PCI-REQ-10",
    code: "Requirement 10",
    title: "Log & Monitor All Access",
    description: "Log and monitor all access to system components and cardholder data, ensuring clocks are synchronized via NTP.",
    documentRequired: "SIEM Logging Policy & Event Management Standard",
    evidenceToPresent: "NTP server synchronization audits, central log engine routing parameters, and proof of daily log review audits.",
    standard: "PCI-DSS",
    type: "clause"
  },
  {
    id: "PCI-REQ-11",
    code: "Requirement 11",
    title: "Test Security of Systems Regularly",
    description: "Test security of systems and networks regularly. Conduct quarterly external and internal vulnerability scans.",
    documentRequired: "Vulnerability Scanning and Pen-Testing Standard",
    evidenceToPresent: "Approved Scanning Vendor (ASV) quarterly scans, annual penetration testing reports, and IDS alerts verification.",
    standard: "PCI-DSS",
    type: "clause"
  },
  {
    id: "PCI-REQ-12",
    code: "Requirement 12",
    title: "Support InfoSec with Policies",
    description: "Support information security with organizational policies and programs. Perform annual formal risk assessments.",
    documentRequired: "Information Security Policy & Annual Risk Management Mandate",
    evidenceToPresent: "Formal risk assessment executive briefs, third-party vendor review logs, and employee security handbook signing records.",
    standard: "PCI-DSS",
    type: "clause"
  }
];

export const PCI_DSS_SUB_CONTROLS: AuditItem[] = [
  {
    id: "PCI-SUB-1.2.1",
    code: "Req 1.2.1",
    title: "Restricted Ingress/Egress Rule Base",
    description: "Restrict inbound and outbound traffic to that which is necessary for the cardholder data environment (CDE).",
    documentRequired: "Network Ports and Routing Approved Specifications",
    evidenceToPresent: "Firewall rulesets showing all unrequested inbound ports (SSH, RDP) blocked from public IP ranges.",
    standard: "PCI-DSS",
    type: "control"
  },
  {
    id: "PCI-SUB-3.4.1",
    code: "Req 3.4.1",
    title: "Primary Account Number (PAN) Protection",
    description: "Render primary account number (PAN) unreadable anywhere it is stored, using strong cryptography.",
    documentRequired: "Sensitive Data Storage Standards & DB Schema Guides",
    evidenceToPresent: "Database schema verification files and SQL SELECT outputs demonstrating masked PAN (e.g. 1234-56XX-XXXX-3456).",
    standard: "PCI-DSS",
    type: "control"
  },
  {
    id: "PCI-SUB-6.4.3",
    code: "Req 6.4.3",
    title: "Script Management & Integrity on Payment Pages",
    description: "All user-facing JavaScripts executed in the browser on payment pages are authorized and protected.",
    documentRequired: "Script Management Standard & Web Application Integrity Policy",
    evidenceToPresent: "Active Content Security Policy (CSP) configurations and Subresource Integrity (SRI) hashes on index.html.",
    standard: "PCI-DSS",
    type: "control"
  },
  {
    id: "PCI-SUB-8.4.2",
    code: "Req 8.4.2",
    title: "MFA for Administrative and Remote Access",
    description: "Implement multi-factor authentication (MFA) for all access to system components.",
    documentRequired: "MFA Enrollment Mandate",
    evidenceToPresent: "SSO directory parameters showing MFA enrollment enforcement rate is 100% across all developer accounts.",
    standard: "PCI-DSS",
    type: "control"
  },
  {
    id: "PCI-SUB-11.3.1",
    code: "Req 11.3.1",
    title: "ASV Vulnerability Hotfixes",
    description: "Remediate vulnerabilities identified during Approved Scanning Vendor (ASV) scans, and re-scan until clean status is confirmed.",
    documentRequired: "Quarterly ASV Patch Verification Protocol",
    evidenceToPresent: "ASV clean report certificate proving absence of any HIGH/CRITICAL (CVSS >= 4.0) vulnerability on public endpoints.",
    standard: "PCI-DSS",
    type: "control"
  }
];

export const ALL_AUDIT_ITEMS = [
  ...ISO_27001_CLAUSES,
  ...ISO_27001_CONTROLS,
  ...PCI_DSS_REQS,
  ...PCI_DSS_SUB_CONTROLS
];
