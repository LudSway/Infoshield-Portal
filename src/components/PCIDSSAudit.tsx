import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { syncDocument, saveDocument } from "../lib/firebase";
import EvidenceDocGenerator from "./EvidenceDocGenerator";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  FileText,
  FileCheck,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Download,
  RotateCcw,
  Search,
  Lock,
  Terminal,
  ShieldAlert
} from "lucide-react";

interface SubRequirement {
  id: string;
  code: string;
  title: string;
  description: string;
  documentRequired: string;
  evidenceToPresent: string;
  standardRequirement?: string;
  documentEntail?: string;
  exactEvidence?: string;
  complianceAdvice?: string;
}

interface PCIRequirementGroup {
  number: number;
  title: string;
  description: string;
  subRequirements: SubRequirement[];
}

interface PCIDSSAuditProps {
  theme?: "light" | "dark";
  activeRole: string;
  triggerBannerAlert: (msg: string) => void;
}

// Highly detailed PCI DSS v4.0 requirements structure
const PCI_DATA: PCIRequirementGroup[] = [
  {
    number: 1,
    title: "Req 1: Network Security Controls (NSCs)",
    description: "Install and maintain firewalls and network restrictions to protect the Cardholder Data Environment (CDE).",
    subRequirements: [
      {
        id: "pci-sub-1.2.1",
        code: "1.2.1",
        title: "Restricted Inbound/Outbound Rules",
        description: "Restrict inbound and outbound traffic to that which is necessary for the cardholder data environment.",
        documentRequired: "Firewall Configuration and Inbound/Outbound Port Protocol Policy",
        evidenceToPresent: "Active firewall logs showing all unapproved inbound ports (like SSH, RDP) blocked from public IP ranges.",
        standardRequirement: "PCI DSS v4.0 Requirement 1.2.1 specifies that inbound and outbound traffic is restricted to that which is necessary for the cardholder data environment (CDE), and all other traffic is specifically denied.",
        documentEntail: "The Network Security Policy must detail: 1) Active inventory of all authorized ports, protocols, and services, 2) Business justification for each open port, 3) Process for reviewing and updating port configurations at least once every six months.",
        exactEvidence: "1) Exported firewall running configuration files showing default 'deny-all' inbound/outbound rulesets, 2) Network topology diagrams highlighting CDE zones, 3) Biannual firewall config review logs signed by the lead network architect.",
        complianceAdvice: "Do not allow generic outbound access from the CDE. For example, database servers storing primary account numbers must be completely blocked from initiating connections to the public internet, restricted only to secure backup endpoints."
      },
      {
        id: "pci-sub-1.3",
        code: "1.3.1",
        title: "All Public Ingress Points Secured",
        description: "Ensure that direct access between public networks and system components in the CDE is prohibited.",
        documentRequired: "Network Architecture Diagram & De-Militarized Zone (DMZ) Policy",
        evidenceToPresent: "DMZ routing table exports, boundary router configurations, and external firewall rule verification logs.",
        standardRequirement: "PCI DSS v4.0 Requirement 1.3.1 prohibits direct public network ingress and egress connections to any system component that stores, processes, or transmits cardholder data.",
        documentEntail: "The DMZ and Perimeter Security Policy must detail: 1) Network architecture standards establishing a de-militarized zone (DMZ) to filter internet traffic, 2) Complete prohibition of direct connections between the public internet and CDE database nodes.",
        exactEvidence: "1) Router/firewall access control lists (ACLs) demonstrating that internet traffic is routed strictly through proxy servers or load balancers in the DMZ, 2) Dynamic routing table verification logs.",
        complianceAdvice: "Never place database servers in a public-facing subnet. They must reside in a separate internal secure zone with traffic from DMZ nodes monitored and authorized."
      }
    ]
  },
  {
    number: 2,
    title: "Req 2: Secure Configurations Applied",
    description: "Change default vendor passwords, disable unnecessary services, and apply strict hardening baselines.",
    subRequirements: [
      {
        id: "pci-sub-2.2",
        code: "2.2.1",
        title: "Vendor Default Password Changes",
        description: "Verify that all vendor-default settings and passwords are changed immediately before deploying any system.",
        documentRequired: "System Hardening Baseline Standard (CIS Benchmarks)",
        evidenceToPresent: "Automated golden-image build scripts, configuration file snapshots, and verification logs of disabled default guest accounts.",
        standardRequirement: "PCI DSS v4.0 Requirement 2.2.1 requires changing all vendor-default settings and passwords immediately before deploying any system component onto the corporate network or CDE.",
        documentEntail: "The Corporate System Hardening Standard must detail: 1) Mandates to change passwords of all default accounts (e.g. root, admin) prior to staging, 2) Configuration rules to disable unnecessary services, ports, and protocols, 3) Specific hardening baselines mapped directly to Center for Internet Security (CIS) standards.",
        exactEvidence: "1) Automated server build script files (such as Terraform or Ansible templates) demonstrating custom secure default profiles, 2) Screenshots of disabled guest/administrator accounts, 3) Audit logs proving default credential checks are built into the CI/CD pipeline.",
        complianceAdvice: "Ensure you have a documented validation check. When a server boots up, an automated scan must verify default ports (such as Telnet or default database endpoints) are disabled and password policies are enforced before the server joins production groups."
      },
      {
        id: "pci-sub-2.3",
        code: "2.3.1",
        title: "Encrypted Administrative Non-Console Access",
        description: "Encrypt all non-console administrative access using strong cryptography (SSH, TLS, VPN).",
        documentRequired: "Remote System Administrative Guidelines",
        evidenceToPresent: "Web administration portal settings showing TLS 1.3 requirement, and terminal ports restricted to SSH v2.",
        standardRequirement: "PCI DSS v4.0 Requirement 2.3.1 specifies that all non-console administrative access must be encrypted using strong cryptography (such as SSH, TLS, or IPsec VPNs).",
        documentEntail: "The Remote Administration Standard must detail: 1) Strict prohibition of clear-text admin protocols (e.g. Telnet, HTTP, FTP), 2) Approved cryptographic algorithms (e.g., SSHv2, TLS 1.2 or 1.3), 3) Authorized remote administrative subnets and IP whitelists.",
        exactEvidence: "1) Server configuration profiles showing administrative portals configured exclusively for HTTPS on TLS 1.3, 2) Console port configuration settings proving Telnet is fully disabled and SSHv2 is required, 3) Port scan reports showing no clear-text administrative ports active.",
        complianceAdvice: "Never allow remote management directly from public networks. Require administrators to authenticate through a secure corporate VPN with Multi-Factor Authentication (MFA) enabled before gaining SSH or RDP console access to any CDE systems."
      }
    ]
  },
  {
    number: 3,
    title: "Req 3: Protect Stored Account Data",
    description: "Ensure Primary Account Numbers (PAN) and sensitive authorization data are encrypted or truncated.",
    subRequirements: [
      {
        id: "pci-sub-3.4",
        code: "3.4.1",
        title: "Primary Account Number (PAN) Encryption",
        description: "Render Primary Account Numbers (PAN) unreadable anywhere they are stored, using strong cryptography.",
        documentRequired: "Sensitive Data Retention, Disposal & Encryption Policy",
        evidenceToPresent: "Database schemas demonstrating encrypted card tables (AES-256), and SQL query outputs showing masked PAN (e.g. 1234-56XX-XXXX-3456).",
        standardRequirement: "PCI DSS v4.0 Requirement 3.4.1 mandates that primary account numbers (PAN) must be rendered unreadable anywhere they are stored, utilizing strong cryptography, truncation, index tokens, or hashing.",
        documentEntail: "The Sensitive Data Encryption & Disposal Policy must detail: 1) Approved cryptographic key sizes (AES-256 or higher), 2) PAN truncation specifications (first six and last four digits visible only), 3) Secure data disposal procedures using certified wiping utilities, 4) Strict prohibition of storing full card numbers in plain text.",
        exactEvidence: "1) Database schema declarations and table creation scripts showing data column encryption types (e.g. ciphertext columns), 2) SQL query execution screenshots showing masked output values, 3) Logs from automated file scanning utilities (like Trufflehog) verifying no plain-text card numbers exist in logs or backup spaces.",
        complianceAdvice: "If you do not have a business need to store the full 16-digit card number, do not store it at all! Truncate it to the first six and last four digits instead. Truncated data is out of scope for many stored data requirements, saving enormous audit scope."
      },
      {
        id: "pci-sub-3.5",
        code: "3.5.1",
        title: "Cryptographic Key Management Safeguards",
        description: "Protect keys used to encrypt cardholder data against disclosure, destruction, and modification.",
        documentRequired: "Cryptographic Key Management Standard Operating Procedure",
        evidenceToPresent: "Dual-custodian key generation sign-offs, hardware security module (HSM) export parameter locks, and key rotation logs.",
        standardRequirement: "PCI DSS v4.0 Requirement 3.5.1 mandates that all keys used for the encryption of cardholder data must be protected against unauthorized disclosure, modification, and destruction.",
        documentEntail: "The Key Management Standard Operating Procedure must detail: 1) Strict split-knowledge and dual-custodial rules for key generation and distribution, 2) Secure key storage in a Cloud Key Management Service (KMS) or Hardware Security Module (HSM), 3) Enforced annual cryptographic key rotation periods, 4) Procedure for immediate revoking of compromised keys.",
        exactEvidence: "1) Signed key generation ceremony logs containing dual-custodian signatures, 2) Cloud HSM/KMS configuration templates showing unexportable key parameters, 3) Automated key rotation policies and rotation history logs.",
        complianceAdvice: "Never hardcode cryptographic keys in your source code, configuration files, or database tables. Use a managed vault service (such as AWS KMS, Azure Key Vault, or GCP KMS) to encrypt/decrypt data dynamically, referencing keys strictly via IAM roles."
      }
    ]
  },
  {
    number: 4,
    title: "Req 4: Protect CHD in Transit",
    description: "Secure transmissions across open, public networks using TLS 1.2 or 1.3 encryption protocols.",
    subRequirements: [
      {
        id: "pci-sub-4.2",
        code: "4.2.1",
        title: "Strong TLS Encryption for Public Networks",
        description: "Use strong cryptography and security protocols to safeguard sensitive cardholder data during transmission.",
        documentRequired: "Data-in-Transit Encryption Guidelines",
        evidenceToPresent: "Certificate Authority (CA) certified SSL profiles, web server config proving disabled SSLv3/TLS1.0 protocols.",
        standardRequirement: "PCI DSS v4.0 Requirement 4.2.1 specifies that strong cryptography and secure protocols must be used to safeguard cardholder data during transmission across public or open networks.",
        documentEntail: "The Data-in-Transit Encryption Policy must detail: 1) Approved secure transport layer protocols (specifically TLS 1.2 or TLS 1.3), 2) Approved cipher suites with a minimum of 128-bit key lengths, 3) Complete disabling of insecure cipher protocols (like SSLv2, SSLv3, TLS 1.0, and TLS 1.1), 4) Requirements to verify SSL certificates are issued by trusted certificate authorities.",
        exactEvidence: "1) Server configuration snapshots showing TLS 1.3 parameters enabled, 2) Output files from external scanning utilities (such as SSL Labs) confirming that all connections using TLS 1.0/1.1 are actively rejected, 3) Active wildcard or domain SSL certificates signed by verified global authorities.",
        complianceAdvice: "Regularly run automated cipher scanners against your payment endpoints. Any server hosting a payment form that still accepts TLS 1.0 or TLS 1.1, or utilizes sweet32/triple-DES ciphers, will trigger immediate compliance failure."
      }
    ]
  },
  {
    number: 5,
    title: "Req 5: Protect Systems from Malware",
    description: "Deploy real-time anti-malware software, ensure continuous signature updates, and lock down system processes.",
    subRequirements: [
      {
        id: "pci-sub-5.2",
        code: "5.2.1",
        title: "Anti-Malware Active Running & Updates",
        description: "Deploy anti-malware solutions on all systems commonly affected by malicious software.",
        documentRequired: "Antivirus Endpoint Protection Strategy",
        evidenceToPresent: "Central EDR management console dashboards showing 100% endpoint registration rate and automatic definition update schedules.",
        standardRequirement: "PCI DSS v4.0 Requirement 5.2.1 mandates deploying anti-malware solutions on all systems commonly affected by malicious software, ensuring they are actively running, regularly updated, and generate security alert logs.",
        documentEntail: "The Antivirus and Endpoint Security Strategy must detail: 1) Approved Endpoint Detection and Response (EDR) software configurations, 2) Mandatory real-time background scanning settings, 3) Automatic signature definition update schedules (checked at least daily), 4) Strict rules prohibiting users or system administrators from disabling antivirus processes.",
        exactEvidence: "1) Screenshots from centralized endpoint security dashboard portals proving 100% registration of system instances, 2) Verification logs of daily automatic virus database definition updates, 3) Security logs demonstrating EDR alert notifications successfully reaching your central SIEM collector.",
        complianceAdvice: "Even if your CDE runs entirely on Linux container images, you must still document your malware assessment. If you claim a system is not commonly affected by malware (e.g. stateless serverless functions), you must present a documented business justification signed by compliance management."
      }
    ]
  },
  {
    number: 6,
    title: "Req 6: Develop Secure Systems & Software",
    description: "Integrate security into the SDLC, patch vulnerabilities immediately, and authorize code changes.",
    subRequirements: [
      {
        id: "pci-sub-6.3",
        code: "6.3.1",
        title: "Secure Coding Standards Integration",
        description: "Develop applications based on secure coding guidelines such as OWASP Top 10 baselines.",
        documentRequired: "Secure Software Development Life Cycle (SSDLC) Policy",
        evidenceToPresent: "Pre-deployment code inspection logs, static application security testing (SAST) summaries, and developer certification logs.",
        standardRequirement: "PCI DSS v4.0 Requirement 6.3.1 requires developing all bespoke software in accordance with secure software engineering guidelines (such as OWASP Top 10) and incorporating security checks throughout the development life cycle.",
        documentEntail: "The Secure Software Development Life Cycle (SSDLC) Policy must detail: 1) Mandatory developer secure coding training covering SQL injection, XSS, and buffer overflows, 2) Mandatory peer review processes for all code commits, 3) Automated Static Application Security Testing (SAST) checks for every release pipeline, 4) Secure staging-to-production deployment rules.",
        exactEvidence: "1) Certificates of completion of annual OWASP security training by active developers, 2) GitHub pull request logs demonstrating branch protection rules requiring at least one senior engineer's review and approval before merging, 3) Reports from SAST scanners (like SonarQube, Snyk) showing zero critical vulnerabilities remaining in the codebase.",
        complianceAdvice: "Enforce automated CI/CD pipeline blocks. Auditors will check if code can be pushed to production without passing automated static code scans. The cleanest proof is an active pipeline log showing Snyk or SonarQube passing successfully."
      },
      {
        id: "pci-sub-6.4",
        code: "6.4.3",
        title: "Browser Script Management on Payment Pages",
        description: "Authorize and manage all JavaScript scripts running on payment forms in the consumer browser.",
        documentRequired: "Web Application Script Integrity and CSP Policy",
        evidenceToPresent: "Active Content Security Policy (CSP) headers, Subresource Integrity (SRI) script hash logs on checkout directories.",
        standardRequirement: "PCI DSS v4.0 Requirement 6.4.3 specifies that all JavaScript scripts running on payment pages in consumer browsers must be authorized, verified for integrity, and actively monitored to prevent client-side web skimming (Magecart) attacks.",
        documentEntail: "The Client-Side Web Application Integrity Policy must detail: 1) Standard processes to review and authorize every third-party script loaded on checkout pages, 2) Enforced Content Security Policy (CSP) configurations to restrict where scripts can send collected payment data, 3) Mandatory use of Subresource Integrity (SRI) hashes on all script tags.",
        exactEvidence: "1) Master inventory of authorized checkout scripts with approved business justifications, 2) Web application header logs displaying active CSP directive strings, 3) HTML codebase files showcasing script elements formatted with 'integrity' and 'crossorigin' attributes, 4) Real-time alert logs from script monitoring services.",
        complianceAdvice: "This is a major new requirement in PCI DSS v4.0. Keep your checkout pages as lightweight as possible. Completely remove any non-essential trackers (such as Google Analytics, customer feedback widgets, or session recorders) from any pages that input credit card numbers to minimize Magecart threat surface."
      }
    ]
  },
  {
    number: 7,
    title: "Req 7: Restrict Access by Need-to-Know",
    description: "Limit access to CDE systems strictly based on active corporate roles and business justifications.",
    subRequirements: [
      {
        id: "pci-sub-7.2",
        code: "7.2.1",
        title: "Least Privilege Role Access Limits",
        description: "Define access privileges for each user role in the CDE based on lowest business operational requirement.",
        documentRequired: "Access Control privilege Assignment Policy",
        evidenceToPresent: "IAM Active Directory mapping tables, signed manager approvals for privileged developer profiles.",
        standardRequirement: "PCI DSS v4.0 Requirement 7.2.1 requires limiting access to system components in the CDE to only those individuals whose jobs require such access, strictly adhering to the principle of least privilege.",
        documentEntail: "The Access Control & Least Privilege Assignment Policy must detail: 1) Defined job roles and their corresponding authorized system privileges, 2) Requirement for formal written justification and manager approval before granting CDE access, 3) Process for immediate revocation of privileges for employees changing roles or resigning.",
        exactEvidence: "1) Role-based access control (RBAC) matrices showing mapping of user identities to specific CDE read/write permissions, 2) Signed system access request forms with management approval stamps, 3) System administrator lists confirming only a minimum number of users hold active root-level credentials.",
        complianceAdvice: "Establish a robust approval process. During audit, any user found to have administrative access without a matching, documented business justification and manager approval sheet will lead to an immediate non-compliance rating."
      }
    ]
  },
  {
    number: 8,
    title: "Req 8: Identify Users & Authenticate Access",
    description: "Assign unique IDs, enforce complex passwords, and implement MFA on all system endpoints.",
    subRequirements: [
      {
        id: "pci-sub-8.2",
        code: "8.2.1",
        title: "Unique Credentials for All Administrators",
        description: "Ensure that every administrative user in the CDE accesses components using a unique identifier.",
        documentRequired: "Corporate Identity Standard Policy",
        evidenceToPresent: "Disabled shared admin accounts logs, active directory single-user sign-on registries.",
        standardRequirement: "PCI DSS v4.0 Requirement 8.2.1 mandates that all administrative and system users must be identified with a unique ID before being allowed to access system components in the CDE.",
        documentEntail: "The User Identification & Password Complexity Standard must detail: 1) Complete ban on shared corporate administrative accounts (such as a shared 'admin' or 'developer' account), 2) Password requirements (minimum 12 characters, alphanumeric with special characters), 3) Account lockout parameters (locked out after 6 failed login attempts, locked for at least 30 minutes).",
        exactEvidence: "1) Okta/Active Directory user logs showing individual accounts for every engineer, 2) Screenshots of directory configuration panels proving shared system accounts are disabled or deleted, 3) Password filter rules showing enforced character complexity and lockout policies.",
        complianceAdvice: "Never use shared keys or shared Linux user credentials (e.g. sharing a single .pem file or logging in as 'ubuntu' directly). Require each engineer to log in with their personal SSH key mapped to their unique user account."
      },
      {
        id: "pci-sub-8.4",
        code: "8.4.2",
        title: "MFA for CDE Administrative and Remote Access",
        description: "Implement multi-factor authentication (MFA) for all access into the Cardholder Data Environment.",
        documentRequired: "MFA Configuration and Enrollment Standard",
        evidenceToPresent: "IAM tenant settings enforcing MFA, and SSO logs showing successful dual-factor triggers on developer log-ins.",
        standardRequirement: "PCI DSS v4.0 Requirement 8.4.2 requires implementing Multi-Factor Authentication (MFA) for all administrative and remote access into the Cardholder Data Environment (CDE).",
        documentEntail: "The MFA Configuration & Integration Standard must detail: 1) Mandatory multi-factor enforcement for all administrative access, 2) Required use of at least two independent authentication factors (Something you know, something you have, something you are), 3) Strict rule that MFA bypasses are completely forbidden.",
        exactEvidence: "1) Active single sign-on (SSO) configuration parameters proving MFA is strictly set to 'Enforced' for all users, 2) Log records showing dual-factor verification steps occurring during administrator console logins, 3) Screenshots of user profiles proving security keys or authenticator apps are active.",
        complianceAdvice: "Ensure MFA is implemented at the network layer AND the application layer. Connecting to the corporate network via VPN requires MFA, and logging into the database containing cardholder records must also require MFA."
      }
    ]
  },
  {
    number: 9,
    title: "Req 9: Restrict Physical Access",
    description: "Control physical entries to facilities, protect payment terminals, and shred physical data records.",
    subRequirements: [
      {
        id: "pci-sub-9.2",
        code: "9.2.1",
        title: "Physical Boundary Visitor Log Controls",
        description: "Restrict physical access to systems storing cardholder data using access authorization parameters.",
        documentRequired: "Physical Facility Entry and Camera Retention Policy",
        evidenceToPresent: "Visitor registration ledgers, security magnetic badge entry registers, and server room CCTV DVR storage archives.",
        standardRequirement: "PCI DSS v4.0 Requirement 9.2.1 mandates restricting physical access to systems that store, process, or transmit cardholder data, including physical boundaries, server rooms, and physical payment terminals.",
        documentEntail: "The Physical Boundary & Visitor Entry Policy must detail: 1) Authorized access lists for secure server rooms, 2) Visitor escort rules (visitors must be escorted at all times, wear prominent badges, and sign visitor logs), 3) Minimum CCTV storage retention periods (at least 90 days), 4) Annual physical security training for facility staff.",
        exactEvidence: "1) Visitor logbooks showing names, companies, escorted personnel, and entry/exit timestamps, 2) Digital badge swipe log records from secure data vaults showing individual key entries, 3) CCTV storage logs proving camera data is archived for over 90 days.",
        complianceAdvice: "If you host in AWS, GCP, or Azure, you do not manage server rooms. Present their current SOC 2 Type II or PCI DSS AoC (Attestation of Compliance) certifying their cloud physical security controls are fully compliant."
      }
    ]
  },
  {
    number: 10,
    title: "Req 10: Log & Monitor All Access",
    description: "Implement central SIEM logging, protect audit logs, and synchronize system clocks via NTP.",
    subRequirements: [
      {
        id: "pci-sub-10.2",
        code: "10.2.1",
        title: "Automated Audit Trails configuration",
        description: "Implement automated audit trails to record user actions, administrative commands, and invalid login attempts.",
        documentRequired: "Central Logging & SIEM Event Standard",
        evidenceToPresent: "Syslog agent daemon settings on checkout servers, central elasticsearch cluster dashboards, and daily inspection logs.",
        standardRequirement: "PCI DSS v4.0 Requirement 10.2.1 requires implementing automated audit trails for all system components to record user actions, administrative commands, and invalid authentication attempts.",
        documentEntail: "The Logging, Monitoring & SIEM Event Standard must detail: 1) Required events to log (e.g. administrative privilege escalations, failed login attempts, root command execution, database schema changes), 2) Logging format parameters (including timestamp, unique user ID, event type, affected system), 3) Daily log review procedures, 4) Secure log storage (logs must be stored for at least 1 year, with 3 months immediately online).",
        exactEvidence: "1) Active syslog server or cloud-logging daemon configuration files, 2) Daily log review checklist sign-off logs, 3) SIEM audit dashboards demonstrating centralized event aggregation, 4) Integrity check verification reports proving logs are stored in a write-once read-many (WORM) setup.",
        complianceAdvice: "Ensure administrative log-tampering is blocked. Auditors will check if a system administrator can delete or modify logs. Storing logs on a separate, dedicated read-only log cluster is essential to pass."
      }
    ]
  },
  {
    number: 11,
    title: "Req 11: Test Security Regularly",
    description: "Perform quarterly ASV scans, run internal penetration tests, and deploy file integrity monitoring (FIM).",
    subRequirements: [
      {
        id: "pci-sub-11.3",
        code: "11.3.1",
        title: "ASV Quarterly External Scan Clean Report",
        description: "Remediate vulnerabilities found during ASV scans and re-run until a fully clean score is reported.",
        documentRequired: "Vulnerability Scanning Pen-Testing Policy",
        evidenceToPresent: "Approved Scanning Vendor (ASV) quarterly clean reports (no score CVSS >= 4.0), and engineering hotfix logs.",
        standardRequirement: "PCI DSS v4.0 Requirement 11.3.1 mandates performing quarterly external vulnerability scans via an Approved Scanning Vendor (ASV), remediating all vulnerabilities found, and repeating scans until a fully clean passing report is generated.",
        documentEntail: "The Vulnerability Scanning and Penetration Testing Policy must detail: 1) Quarterly scanning cycles mapped to ASV vendors, 2) Scoring criteria (all vulnerabilities with a CVSS score of 4.0 or higher must be remediated), 3) Process for reporting and tracking scan results to C-level executives.",
        exactEvidence: "1) Four consecutive quarterly ASV passing reports showing zero vulnerabilities graded CVSS >= 4.0, 2) Vulnerability mitigation ticket logs (Jira or ServiceNow) proving rapid patch completion, 3) Re-scan logs showing successful transition from failed to passing status.",
        complianceAdvice: "Do not wait until the end of the quarter to run your ASV scans. Run monthly pre-scans so you have plenty of time to apply patches and re-scan before the quarterly compliance deadline."
      }
    ]
  },
  {
    number: 12,
    title: "Req 12: Maintain Information Security Policies",
    description: "Write and update comprehensive security programs, and run annual formal risk assessments.",
    subRequirements: [
      {
        id: "pci-sub-12.1",
        code: "12.1.1",
        title: "Annual Security Policy Review",
        description: "Establish, publish, and maintain an information security policy that is reviewed by executive board members.",
        documentRequired: "PCI Compliance Master Security Charter",
        evidenceToPresent: "Board signed review minutes, evidence of policy distribution to third-party partners.",
        standardRequirement: "PCI DSS v4.0 Requirement 12.1.1 requires establishing, publishing, and maintaining a comprehensive information security policy that is reviewed by the executive board at least annually and distributed to all staff and third-party partners.",
        documentEntail: "The PCI Compliance Master Security Charter must detail: 1) Annual board-level policy review timelines, 2) Process for distributing policies to employees, contractors, and partners, 3) Roles responsible for coordinating and enforcing compliance across the organization, 4) Process for tracking and managing third-party vendor compliance (such as maintaining a list of active vendor AoCs).",
        exactEvidence: "1) Board of Directors meeting minutes signed and dated, proving formal review of the Information Security Policy, 2) Intranet read-receipt logs from employees acknowledging the security policy, 3) List of third-party vendors with up-to-date PCI Attestation of Compliance (AoC) certificates.",
        complianceAdvice: "Maintain a vendor compliance folder. The auditor will ask for a random vendor's current AoC. Failing to produce an active AoC for a partner who processes credit cards on your behalf is a major non-conformance."
      }
    ]
  }
];

export default function PCIDSSAudit({
  theme = "dark",
  activeRole,
  triggerBannerAlert
}: PCIDSSAuditProps) {
  const isLight = theme === "light";

  // Persistent States
  const [readyDocs, setReadyDocs] = useState<string[]>([]);
  const [readyEvidence, setReadyEvidence] = useState<string[]>([]);
  const [auditNotes, setAuditNotes] = useState<Record<string, string>>({});

  // Navigation States
  const [expandedReq, setExpandedReq] = useState<number | null>(1); // Default Requirement 1 expanded
  const [selectedItemId, setSelectedItemId] = useState<string>("pci-sub-1.2.1");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "ready" | "pending">("all");

  // Sync PCI DSS Checklist Progress from Firestore Document
  useEffect(() => {
    // Initial load from local storage cache
    try {
      const storedDocs = localStorage.getItem("pcidss_audit_docs");
      const storedEvidence = localStorage.getItem("pcidss_audit_evidence");
      const storedNotes = localStorage.getItem("pcidss_audit_notes");

      if (storedDocs) setReadyDocs(JSON.parse(storedDocs));
      if (storedEvidence) setReadyEvidence(JSON.parse(storedEvidence));
      if (storedNotes) setAuditNotes(JSON.parse(storedNotes));
    } catch (e) {}

    const unsubscribe = syncDocument<any>(
      "compliance",
      "pcidss",
      (data) => {
        if (data) {
          if (Array.isArray(data.readyDocs)) {
            setReadyDocs(data.readyDocs);
            localStorage.setItem("pcidss_audit_docs", JSON.stringify(data.readyDocs));
          }
          if (Array.isArray(data.readyEvidence)) {
            setReadyEvidence(data.readyEvidence);
            localStorage.setItem("pcidss_audit_evidence", JSON.stringify(data.readyEvidence));
          }
          if (data.auditNotes) {
            setAuditNotes(data.auditNotes);
            localStorage.setItem("pcidss_audit_notes", JSON.stringify(data.auditNotes));
          }
        }
      },
      {
        readyDocs: [],
        readyEvidence: [],
        auditNotes: {}
      }
    );
    return () => unsubscribe();
  }, []);

  // Save state helper (syncs to Firestore and local storage)
  const saveState = (docs: string[], ev: string[], notes: Record<string, string>) => {
    localStorage.setItem("pcidss_audit_docs", JSON.stringify(docs));
    localStorage.setItem("pcidss_audit_evidence", JSON.stringify(ev));
    localStorage.setItem("pcidss_audit_notes", JSON.stringify(notes));
    saveDocument("compliance", "pcidss", {
      readyDocs: docs,
      readyEvidence: ev,
      auditNotes: notes
    });
  };

  const isItemFullyReady = (id: string) => {
    return readyDocs.includes(id) && readyEvidence.includes(id);
  };

  const isItemPartiallyReady = (id: string) => {
    return readyDocs.includes(id) || readyEvidence.includes(id);
  };

  const getControlPercent = (id: string) => {
    const hasDoc = readyDocs.includes(id);
    const hasEv = readyEvidence.includes(id);
    if (hasDoc && hasEv) return 100;
    if (hasDoc || hasEv) return 50;
    return 0;
  };

  const allItems = PCI_DATA.flatMap(g => g.subRequirements);
  const readyCount = allItems.filter(i => isItemFullyReady(i.id)).length;
  const overallPercentage = allItems.length > 0 ? Math.round((readyCount / allItems.length) * 100) : 0;

  // Toggle checks
  const handleToggleDoc = (id: string) => {
    if (activeRole === "Auditor") {
      triggerBannerAlert("ACCESS DENIED: Auditors have read-only access.");
      return;
    }
    const updated = readyDocs.includes(id)
      ? readyDocs.filter(item => item !== id)
      : [...readyDocs, id];
    setReadyDocs(updated);
    saveState(updated, readyEvidence, auditNotes);

    const target = allItems.find(i => i.id === id);
    if (target) {
      const isNowOk = updated.includes(id);
      if (isNowOk && readyEvidence.includes(id)) {
        triggerBannerAlert(`PCI COMPLIANT: Sub-req ${target.code} is now marked as FULLY AUDIT READY!`);
      } else {
        triggerBannerAlert(`${isNowOk ? "PCI Document Checked" : "PCI Document Cleared"} for sub-req ${target.code}`);
      }
    }
  };

  const handleToggleEvidence = (id: string) => {
    if (activeRole === "Auditor") {
      triggerBannerAlert("ACCESS DENIED: Auditors have read-only access.");
      return;
    }
    const updated = readyEvidence.includes(id)
      ? readyEvidence.filter(item => item !== id)
      : [...readyEvidence, id];
    setReadyEvidence(updated);
    saveState(readyDocs, updated, auditNotes);

    const target = allItems.find(i => i.id === id);
    if (target) {
      const isNowOk = updated.includes(id);
      if (isNowOk && readyDocs.includes(id)) {
        triggerBannerAlert(`PCI COMPLIANT: Sub-req ${target.code} is now marked as FULLY AUDIT READY!`);
      } else {
        triggerBannerAlert(`${isNowOk ? "PCI Telemetry Verified" : "PCI Telemetry Cleared"} for sub-req ${target.code}`);
      }
    }
  };

  const handleToggleItemMaster = (id: string) => {
    if (activeRole === "Auditor") {
      triggerBannerAlert("ACCESS DENIED: Auditors have read-only access.");
      return;
    }
    const fullyReady = isItemFullyReady(id);
    let updatedDocs = [...readyDocs];
    let updatedEv = [...readyEvidence];

    if (fullyReady) {
      updatedDocs = updatedDocs.filter(item => item !== id);
      updatedEv = updatedEv.filter(item => item !== id);
      triggerBannerAlert(`Reset preparedness status for ${id}`);
    } else {
      if (!updatedDocs.includes(id)) updatedDocs.push(id);
      if (!updatedEv.includes(id)) updatedEv.push(id);
      triggerBannerAlert(`SUCCESS: Marked ${id} as fully compliant (Document and Evidence both ready)`);
    }

    setReadyDocs(updatedDocs);
    setReadyEvidence(updatedEv);
    saveState(updatedDocs, updatedEv, auditNotes);
  };

  const handleSaveNotes = (id: string, notes: string) => {
    const updated = { ...auditNotes, [id]: notes };
    setAuditNotes(updated);
    saveState(readyDocs, readyEvidence, updated);
  };

  const handleQuickComplete = () => {
    if (activeRole === "Auditor") {
      triggerBannerAlert("ACCESS DENIED: Auditors cannot modify checklists.");
      return;
    }
    const allIds = allItems.map(i => i.id);
    setReadyDocs(allIds);
    setReadyEvidence(allIds);
    saveState(allIds, allIds, auditNotes);
    triggerBannerAlert("DEMO SPEED-UP: Filled all PCI DSS v4.0 requirements checklists as Compliant (100% compliant).");
  };

  const handleResetChecklist = () => {
    if (activeRole === "Auditor") {
      triggerBannerAlert("ACCESS DENIED: Auditors cannot modify checklists.");
      return;
    }
    if (window.confirm("Are you sure you want to clear all PCI DSS audit progress database? This will clear all checked documents, evidence files, and custom notes.")) {
      setReadyDocs([]);
      setReadyEvidence([]);
      setAuditNotes({});
      saveState([], [], {});
      triggerBannerAlert("Successfully reset and cleared all PCI DSS audit progress registries.");
    }
  };

  const handleDownloadCsv = () => {
    try {
      let csv = "data:text/csv;charset=utf-8,";
      csv += "PCI Requirement,Section,Sub-requirement Title,Requirement Detail,Document Required,Document Ready,Evidence Required,Evidence Ready,Audit Status,Audit Notes\n";

      allItems.forEach(item => {
        const isDocOk = readyDocs.includes(item.id) ? "READY" : "MISSING";
        const isEvOk = readyEvidence.includes(item.id) ? "VERIFIED" : "PENDING";
        const status = isItemFullyReady(item.id) ? "COMPLIANT" : "PENDING";
        const note = (auditNotes[item.id] || "").replace(/"/g, '""');

        const row = [
          `"Req ${item.code}"`,
          `"Requirement Group ${item.code.split(".")[0]}"`,
          `"${item.title.replace(/"/g, '""')}"`,
          `"${item.description.replace(/"/g, '""')}"`,
          `"${item.documentRequired.replace(/"/g, '""')}"`,
          isDocOk,
          `"${item.evidenceToPresent.replace(/"/g, '""')}"`,
          isEvOk,
          status,
          `"${note}"`
        ].join(",");
        csv += row + "\n";
      });

      const encodedUri = encodeURI(csv);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `InfoShield_PCI_DSS_v4_Audit_Readiness_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerBannerAlert("Successfully compiled and downloaded standard PCI DSS v4.0 workbook.");
    } catch (e) {
      console.error(e);
      triggerBannerAlert("Error exporting CSV data sheet.");
    }
  };

  const activeItem = allItems.find(i => i.id === selectedItemId) || allItems[0];

  const getReqProgress = (group: PCIRequirementGroup) => {
    const total = group.subRequirements.length;
    const ready = group.subRequirements.filter(sr => isItemFullyReady(sr.id)).length;
    const pct = total > 0 ? Math.round((ready / total) * 100) : 0;
    return { total, ready, pct };
  };

  const c_card = isLight ? "bg-white border-slate-200 shadow-sm text-slate-950" : "bg-slate-900 border-slate-850 text-slate-50 shadow-[0_4px_20px_rgba(0,0,0,0.3)]";
  const c_subcard = isLight ? "bg-slate-50 border-slate-150 hover:bg-slate-100/50 text-slate-900" : "bg-slate-950/40 border-slate-850 hover:bg-slate-950/70 text-slate-100";
  const c_input = isLight ? "bg-slate-50 border-slate-200 text-slate-950 focus:border-purple-500 font-medium" : "bg-slate-950 border-slate-850 text-slate-50 focus:border-purple-500 font-medium";

  return (
    <div className="space-y-6" id="pcidss-audit-page">
      {/* Top Banner */}
      <div className={`p-6 rounded-xl border flex flex-col xl:flex-row gap-6 items-center justify-between ${c_card}`}>
        <div className="space-y-1 text-center xl:text-left max-w-xl">
          <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2">
            <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wider uppercase">
              Financial Security Standard
            </span>
            <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wider uppercase">
              PCI DSS v4.0 Compliant
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight font-sans">
            PCI DSS Audit Readiness Check
          </h2>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>
            Audit-ready checklist mapping PCI Requirements (1 to 12). Review specific payment infrastructure configurations, network isolations, TLS certificate protocols, and audit logs.
          </p>
        </div>

        {/* Circular Gauge */}
        <div className="flex items-center gap-6">
          <div className={`p-4 rounded-xl border flex items-center gap-4 ${isLight ? "bg-slate-50 border-slate-150" : "bg-slate-950/40 border-slate-850"}`}>
            <div className="relative flex items-center justify-center w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="34" strokeWidth="5" stroke={isLight ? "#e2e8f0" : "#111827"} fill="transparent" />
                <circle cx="40" cy="40" r="34" strokeWidth="5" stroke="#a855f7" fill="transparent" 
                        strokeDasharray={213} strokeDashoffset={213 - (213 * overallPercentage) / 100} 
                        className="transition-all duration-500" />
              </svg>
              <span className="absolute text-sm font-extrabold font-mono text-purple-400">{overallPercentage}%</span>
            </div>
            <div>
              <p className={`text-[10px] font-mono uppercase tracking-widest ${isLight ? "text-slate-600 font-semibold" : "text-slate-500"}`}>CDE Environment</p>
              <p className="text-sm font-extrabold font-sans">PCI Readiness</p>
              <p className={`text-[10px] ${isLight ? "text-slate-600 font-medium" : "text-slate-400"} font-mono mt-0.5`}>
                {readyCount}/{allItems.length} Sub-reqs Compliant
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column menu list (5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Quick Search */}
          <div className={`p-4 rounded-xl border space-y-3.5 ${c_card}`}>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search PCI code, requirements, or documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 ${c_input}`}
              />
            </div>

            <div className="flex gap-1 bg-slate-950/30 p-1 rounded-md border border-slate-850/20 text-[10.5px]">
              {(["all", "ready", "pending"] as const).map((sf) => (
                <button
                  key={sf}
                  onClick={() => setStatusFilter(sf)}
                  className={`flex-1 py-1 rounded text-center font-mono font-medium transition cursor-pointer capitalize ${
                    statusFilter === sf
                      ? isLight
                        ? "bg-white text-purple-600 shadow-sm border border-slate-200"
                        : "bg-slate-800 text-purple-300 font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {sf === "all" ? "All Targets" : sf === "ready" ? "✓ Ready" : "⏰ Pending"}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Requirements accordion */}
          <div className={`p-4 rounded-xl border space-y-3 ${c_card}`}>
            <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isLight ? "text-slate-700 border-slate-200" : "text-slate-400 border-slate-800/20"} border-b pb-2`}>
              PCI DSS Core Requirements
            </h3>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {PCI_DATA.map((group) => {
                const isExpanded = expandedReq === group.number;
                const { total, ready, pct } = getReqProgress(group);

                const filteredSubs = group.subRequirements.filter(sr => {
                  const textMatch = searchQuery === "" ||
                    sr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    sr.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    sr.description.toLowerCase().includes(searchQuery.toLowerCase());
                  const isReady = isItemFullyReady(sr.id);
                  let statusMatch = true;
                  if (statusFilter === "ready") statusMatch = isReady;
                  if (statusFilter === "pending") statusMatch = !isReady;
                  return textMatch && statusMatch;
                });

                if (searchQuery !== "" && filteredSubs.length === 0) return null;

                return (
                  <div key={group.number} className="border border-slate-800/10 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedReq(isExpanded ? null : group.number)}
                      className={`w-full p-3 flex items-center justify-between transition text-left cursor-pointer ${
                        isExpanded 
                          ? isLight ? "bg-slate-100" : "bg-slate-950/80" 
                          : isLight ? "bg-slate-50/50 hover:bg-slate-50" : "bg-slate-950/20 hover:bg-slate-950/40"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className={`text-xs font-bold ${isLight ? "text-slate-800" : "text-slate-200"}`}>{group.title}</p>
                        <p className={`text-[10px] ${isLight ? "text-slate-600 font-medium" : "text-slate-400"} font-sans line-clamp-1`}>{group.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-extrabold ${
                          pct === 100 
                            ? "bg-purple-500/10 border border-purple-500/30 text-purple-400" 
                            : isLight ? "bg-slate-100 text-slate-600 border border-slate-200" : "bg-slate-850 text-slate-500 border border-slate-800"
                        }`}>
                          {ready}/{total}
                        </span>
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className={`border-t border-slate-800/10 overflow-hidden p-1.5 space-y-1 ${
                            isLight ? "bg-white" : "bg-slate-950/40"
                          }`}
                        >
                          {filteredSubs.length === 0 ? (
                            <p className={`text-[10px] ${isLight ? "text-slate-600" : "text-slate-500"} italic p-3 text-center`}>No matching sub-requirements under this section.</p>
                          ) : (
                            filteredSubs.map((sr) => {
                              const isSelected = selectedItemId === sr.id;
                              const isReady = isItemFullyReady(sr.id);
                              const pct = getControlPercent(sr.id);
                              return (
                                <button
                                  key={sr.id}
                                  onClick={() => setSelectedItemId(sr.id)}
                                  className={`w-full p-2.5 rounded-md text-left transition relative flex flex-col gap-2 ${
                                    isSelected
                                      ? isLight 
                                        ? "bg-purple-50 text-purple-800 border-l-4 border-purple-500 font-semibold pl-3"
                                        : "bg-purple-950/30 text-purple-300 border-l-4 border-purple-500 font-medium pl-3"
                                      : isLight
                                        ? "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                                        : "hover:bg-slate-800/20 text-slate-400 hover:text-slate-200"
                                  }`}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-1.5 pr-2">
                                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-extrabold ${
                                        isLight ? "bg-slate-100 border-slate-200 text-slate-700" : "bg-slate-850 border-slate-800 text-slate-300"
                                      }`}>
                                        Req {sr.code}
                                      </span>
                                      <span className={`text-xs font-bold truncate block max-w-[180px] ${isSelected ? (isLight ? "text-purple-950" : "text-purple-355") : (isLight ? "text-slate-850" : "text-slate-200")}`}>{sr.title}</span>
                                    </div>
                                    {isReady ? (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                    ) : isItemPartiallyReady(sr.id) ? (
                                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                                    ) : null}
                                  </div>

                                  {/* Animated Progress Bar */}
                                  <div className="w-full bg-slate-200/50 dark:bg-slate-950/40 h-1 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${pct}%` }}
                                      transition={{ duration: 0.3 }}
                                      className={`h-full ${
                                        pct === 100 
                                          ? "bg-emerald-500" 
                                          : pct === 50 
                                            ? "bg-amber-500" 
                                            : "bg-transparent"
                                      }`}
                                    />
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core Operations Controls */}
          <div className={`p-4 rounded-xl border space-y-3.5 ${c_card}`}>
            <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-400"} font-sans`}>Payment Security Ops</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleQuickComplete}
                className={`py-2 px-3 rounded-lg text-[10px] font-mono font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                  isLight ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100" : "bg-slate-950 hover:bg-slate-850 border-slate-850 text-slate-300"
                }`}
              >
                ⚡ Fill 100% Ready
              </button>
              <button
                onClick={handleResetChecklist}
                className="py-2 px-3 rounded-lg text-[10px] font-mono font-bold bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" /> Reset Page
              </button>
            </div>
            <button
              onClick={handleDownloadCsv}
              className="w-full py-2.5 rounded-lg text-[10.5px] font-mono font-bold bg-purple-600 hover:bg-purple-500 text-slate-950 transition flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.15)] cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Export Verifiable PCI Audit CSV Workbook
            </button>
          </div>

        </div>

        {/* Right column active detail (7 columns) */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {activeItem ? (
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className={`p-6 rounded-xl border space-y-6 h-full flex flex-col justify-between ${c_card}`}
              >
                {/* Header Information */}
                <div className="border-b border-slate-800/20 pb-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded font-mono font-bold text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400">
                        Req {activeItem.code}
                      </span>
                      <span className={`text-[10px] font-mono uppercase tracking-widest ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                        PCI DSS v4.0 Sub-Requirement Checklist
                      </span>
                    </div>

                    <div>
                      {isItemFullyReady(activeItem.id) ? (
                        <span className="px-3 py-1 text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center gap-1 shadow-[0_0_8px_rgba(52,211,153,0.1)]">
                          <CheckCircle2 className="h-3.5 w-3.5" /> PCI COMPLIANT
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="h-3.5 w-3.5" /> PENDING ATTESTATION
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className={`text-xl font-extrabold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                        {activeItem.title}
                      </h3>
                      <p className={`text-xs ${isLight ? "text-slate-900 font-extrabold" : "text-slate-200"} leading-relaxed mt-1`}>
                        {activeItem.description}
                      </p>
                    </div>

                    {/* Highly Visual Animated Detail Progress Bar */}
                    <div className={`p-3 rounded-xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/50 border-slate-850/50"} space-y-2`}>
                      <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider">
                        <span className={isLight ? "text-slate-600 font-bold" : "text-slate-400"}>Sub-Requirement Progress</span>
                        <span className={`font-extrabold ${
                          getControlPercent(activeItem.id) === 100 ? "text-emerald-400" : getControlPercent(activeItem.id) === 50 ? "text-amber-500 font-bold" : "text-slate-500"
                        }`}>{getControlPercent(activeItem.id)}%</span>
                      </div>
                      <div className="w-full bg-slate-200/60 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${getControlPercent(activeItem.id)}%` }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className={`h-full ${
                            getControlPercent(activeItem.id) === 100 
                              ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
                              : getControlPercent(activeItem.id) === 50 
                                ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]" 
                                : "bg-transparent"
                          }`}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-slate-500">
                        <span className={readyDocs.includes(activeItem.id) ? "text-emerald-400 font-bold" : "text-slate-500"}>
                          {readyDocs.includes(activeItem.id) ? "✓ Document Checked" : "✗ Document Pending"}
                        </span>
                        <span className={readyEvidence.includes(activeItem.id) ? "text-emerald-400 font-bold" : "text-slate-500"}>
                          {readyEvidence.includes(activeItem.id) ? "✓ Telemetry Verified" : "✗ Telemetry Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed PCI Standard Requirement */}
                <div className={`p-4 rounded-xl border space-y-2 ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-850/50"}`}>
                  <div className="flex items-center gap-1.5 text-purple-500">
                    <Lock className="h-4 w-4 text-purple-500" />
                    <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-purple-500">
                      1. What the Standard Says
                    </span>
                  </div>
                  <p className={`text-xs ${isLight ? "text-slate-900 font-extrabold bg-slate-100/50 p-2 rounded border border-slate-200/40" : "text-slate-100"} leading-relaxed font-serif italic`}>
                    {activeItem.standardRequirement || `PCI DSS v4.0 Requirement ${activeItem.code} requires technical consistency and governance of ${activeItem.title.toLowerCase()}.`}
                  </p>
                </div>

                {/* Checklist specifications */}
                <div className="space-y-4">
                  <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-500"}`}>
                    Mandatory Attestation Evidence Criteria
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Documentation required */}
                    <div
                      onClick={() => handleToggleDoc(activeItem.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 relative flex flex-col justify-between ${
                        readyDocs.includes(activeItem.id)
                          ? "bg-purple-950/20 border-purple-500/40"
                          : isLight ? "bg-slate-50 border-slate-200 hover:bg-slate-100" : "bg-slate-950/30 border-slate-850 hover:bg-slate-950/70"
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold font-mono flex items-center gap-1.5 ${isLight ? "text-slate-800" : ""}`}>
                            <FileText className={`h-3.5 w-3.5 ${readyDocs.includes(activeItem.id) ? (isLight ? "text-purple-600" : "text-purple-400") : "text-slate-500"}`} />
                            2. Policy / Document
                          </span>
                          <input
                            type="checkbox"
                            checked={readyDocs.includes(activeItem.id)}
                            readOnly
                            disabled={activeRole === "Auditor"}
                            className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className={`text-[11.5px] font-extrabold ${isLight ? "text-slate-800" : "text-slate-100"}`}>
                            {activeItem.documentRequired}
                          </p>
                          <div className={`border-t ${isLight ? "border-slate-200" : "border-slate-800/10"} pt-1.5 mt-1.5`}>
                            <p className={`text-[9px] font-mono uppercase ${isLight ? "text-purple-800" : "text-purple-400"} tracking-wider font-extrabold`}>What the Policy should entail:</p>
                            <p className={`text-[11px] ${isLight ? "text-slate-900 font-bold" : "text-slate-200"} leading-relaxed mt-1 whitespace-pre-line`}>
                              {activeItem.documentEntail || "Must contain the formal policy statements, operational objectives, and executive sign-off approval headers."}
                            </p>
                          </div>
                        </div>
                      </div>

                      {readyDocs.includes(activeItem.id) && (
                        <span className="self-start mt-3 text-[8px] font-mono bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded uppercase font-bold">
                          ✓ DRAFTED & APPROVED
                        </span>
                      )}
                    </div>

                    {/* Evidence to present */}
                    <div
                      onClick={() => handleToggleEvidence(activeItem.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 relative flex flex-col justify-between ${
                        readyEvidence.includes(activeItem.id)
                          ? "bg-purple-950/20 border-purple-500/40"
                          : isLight ? "bg-slate-50 border-slate-200 hover:bg-slate-100" : "bg-slate-950/30 border-slate-850 hover:bg-slate-950/70"
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold font-mono flex items-center gap-1.5 ${isLight ? "text-slate-800" : ""}`}>
                            <FileCheck className={`h-3.5 w-3.5 ${readyEvidence.includes(activeItem.id) ? (isLight ? "text-purple-600" : "text-purple-400") : "text-slate-500"}`} />
                            3. Linkable Evidence
                          </span>
                          <input
                            type="checkbox"
                            checked={readyEvidence.includes(activeItem.id)}
                            readOnly
                            disabled={activeRole === "Auditor"}
                            className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className={`text-[11.5px] font-extrabold ${isLight ? "text-slate-800" : "text-purple-100"}`}>
                            {activeItem.evidenceToPresent}
                          </p>
                          <div className={`border-t ${isLight ? "border-slate-200" : "border-slate-800/10"} pt-1.5 mt-1.5`}>
                            <p className={`text-[9px] font-mono uppercase ${isLight ? "text-purple-800" : "text-purple-400"} tracking-wider font-extrabold`}>What is required as exact evidence:</p>
                            <p className={`text-[11px] ${isLight ? "text-slate-900 font-bold" : "text-slate-200"} leading-relaxed mt-1 whitespace-pre-line`}>
                              {activeItem.exactEvidence || "Must present system-generated logs, audit reports, or executive workshop minutes."}
                            </p>
                          </div>
                        </div>
                      </div>

                      {readyEvidence.includes(activeItem.id) && (
                        <span className="self-start mt-3 text-[8px] font-mono bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded uppercase font-bold">
                          ✓ TELEMETRY LINKED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Attestation check buttons */}
                  {activeRole !== "Auditor" && (
                    <button
                      onClick={() => handleToggleItemMaster(activeItem.id)}
                      className={`w-full py-2.5 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                        isItemFullyReady(activeItem.id)
                          ? "bg-red-950/20 border-red-900/30 text-red-400 hover:bg-red-950/30"
                          : "bg-purple-600 hover:bg-purple-500 text-slate-950 shadow-[0_0_12px_rgba(168,85,247,0.1)]"
                      }`}
                    >
                      {isItemFullyReady(activeItem.id) ? (
                        "⏰ Clear Preparedness Status (Set Pending)"
                      ) : (
                        "✓ Sign Off Compliance & Telemetry Verification"
                      )}
                    </button>
                  )}
                </div>

                 {/* QSA assessor warning info */}
                <div className={`p-4 rounded-xl border space-y-1.5 ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-850/50"}`}>
                  <div className="flex items-center gap-1.5 text-purple-450">
                    <Sparkles className={`h-4 w-4 animate-spin ${isLight ? "text-purple-600" : "text-purple-400"}`} style={{ animationDuration: "12s" }} />
                    <span className={`text-xs font-mono font-extrabold uppercase tracking-widest ${isLight ? "text-purple-700" : "text-purple-400"}`}>
                      4. QSA Assessor Advisory - Payment Environment
                    </span>
                  </div>
                  <p className={`text-xs ${isLight ? "text-slate-700 font-medium" : "text-slate-300"} leading-normal whitespace-pre-line`}>
                    {activeItem.complianceAdvice || "PCI QSA (Qualified Security Assessors) will strictly inspect card data scope limitations. Ensure that you have configured robust network segregation, checked for plain-text primary account numbers in logs, and have 100% MFA enabled on all CDE routers."}
                  </p>
                </div>

                {/* AI Evidence & Policy Generator Workspace */}
                <EvidenceDocGenerator
                  standard="PCI DSS"
                  clauseCode={activeItem.code}
                  clauseTitle={activeItem.title}
                  description={activeItem.description}
                  theme={theme}
                  onDocumentSaved={(code, isSaved) => {
                    if (isSaved && !readyDocs.includes(activeItem.id)) {
                      handleToggleDoc(activeItem.id);
                    }
                  }}
                />

                {/* Remediation notes box */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className={`block text-xs font-mono font-bold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-500"}`}>
                      Internal Remediation Notes & assigned owners
                    </label>
                    <span className={`text-[9.5px] ${isLight ? "text-slate-600" : "text-slate-500"} font-mono italic`}>Saves automatically</span>
                  </div>
                  <textarea
                    rows={2.5}
                    disabled={activeRole === "Auditor"}
                    placeholder={
                      activeRole === "Auditor"
                        ? "Read-only access limits note edits."
                        : "e.g. Assigned to checkout gateway developer. Checked Subresource integrity scripts on payments pages, CSP rules set..."
                    }
                    value={auditNotes[activeItem.id] || ""}
                    onChange={(e) => handleSaveNotes(activeItem.id, e.target.value)}
                    className={`w-full rounded-lg p-3 text-xs focus:outline-none focus:ring-1 leading-relaxed ${c_input}`}
                  />
                </div>
              </motion.div>
            ) : (
              <div className="p-12 text-center rounded-xl border flex flex-col justify-center items-center h-full space-y-3">
                <CreditCard className="h-12 w-12 text-slate-600 animate-pulse" />
                <h3 className="text-sm font-bold font-mono text-slate-300 uppercase">No Active Target Selected</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Please select any sub-requirement from the left menu to begin reviewing PCI DSS attestation criteria.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
