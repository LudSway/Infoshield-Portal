import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { syncDocument, saveDocument } from "../lib/firebase";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronRight,
  BookOpen,
  Sliders,
  Sparkles,
  Download,
  RotateCcw,
  CheckSquare,
  Search,
  MessageSquare,
  ArrowRight,
  Filter,
  Shield,
  HelpCircle,
  Clock,
  Briefcase,
  Users,
  HardDrive,
  Cpu,
  Lock,
  Globe,
  Settings
} from "lucide-react";

interface GapControl {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  requirement: string;
  defaultJustificationIn: string;
  defaultJustificationEx: string;
}

interface AssessmentState {
  status: "unassessed" | "compliant" | "partial" | "gap" | "na";
  priority: "critical" | "high" | "medium" | "low";
  applicable: boolean;
  justification: string;
  notes: string;
}

interface GapAssessmentProps {
  theme?: "light" | "dark";
  activeRole: string;
  triggerBannerAlert: (msg: string) => void;
  currentBusiness?: any;
}

// 1. ISO 27001 Annex A Core Control Dataset
const RAW_ISO_CONTROLS: { code: string; title: string; category: string }[] = [
  // Organizational Controls (A.5) - 37 controls
  { code: "A.5.1", title: "Policies for information security", category: "Organizational Controls" },
  { code: "A.5.2", title: "Information security roles and responsibilities", category: "Organizational Controls" },
  { code: "A.5.3", title: "Segregation of duties", category: "Organizational Controls" },
  { code: "A.5.4", title: "Management responsibility", category: "Organizational Controls" },
  { code: "A.5.5", title: "Contact with authorities", category: "Organizational Controls" },
  { code: "A.5.6", title: "Contact with special interest groups", category: "Organizational Controls" },
  { code: "A.5.7", title: "Threat intelligence", category: "Organizational Controls" },
  { code: "A.5.8", title: "Information security in project management", category: "Organizational Controls" },
  { code: "A.5.9", title: "Inventory of information and other associated assets", category: "Organizational Controls" },
  { code: "A.5.10", title: "Acceptable use of information and other associated assets", category: "Organizational Controls" },
  { code: "A.5.11", title: "Return of assets", category: "Organizational Controls" },
  { code: "A.5.12", title: "Classification of information", category: "Organizational Controls" },
  { code: "A.5.13", title: "Labeling of information", category: "Organizational Controls" },
  { code: "A.5.14", title: "Information transfer", category: "Organizational Controls" },
  { code: "A.5.15", title: "Access control Policy & Guidelines", category: "Organizational Controls" },
  { code: "A.5.16", title: "Identity management", category: "Organizational Controls" },
  { code: "A.5.17", title: "Authentication information", category: "Organizational Controls" },
  { code: "A.5.18", title: "Access rights", category: "Organizational Controls" },
  { code: "A.5.19", title: "Information security in supplier relationships", category: "Organizational Controls" },
  { code: "A.5.20", title: "Addressing information security within supplier agreements", category: "Organizational Controls" },
  { code: "A.5.21", title: "Managing information security in the ICT supply chain", category: "Organizational Controls" },
  { code: "A.5.22", title: "Monitoring, review and change management of supplier services", category: "Organizational Controls" },
  { code: "A.5.23", title: "Information security for use of cloud services", category: "Organizational Controls" },
  { code: "A.5.24", title: "Information security incident management planning and preparation", category: "Organizational Controls" },
  { code: "A.5.25", title: "Assessment and decision on information security events", category: "Organizational Controls" },
  { code: "A.5.26", title: "Response to information security incidents", category: "Organizational Controls" },
  { code: "A.5.27", title: "Learning from information security incidents", category: "Organizational Controls" },
  { code: "A.5.28", title: "Collection of evidence", category: "Organizational Controls" },
  { code: "A.5.29", title: "Information security during disruption", category: "Organizational Controls" },
  { code: "A.5.30", title: "ICT Readiness for Business Continuity", category: "Organizational Controls" },
  { code: "A.5.31", title: "Legal, statutory, regulatory and contractual requirements", category: "Organizational Controls" },
  { code: "A.5.32", title: "Intellectual property rights", category: "Organizational Controls" },
  { code: "A.5.33", title: "Protection of records", category: "Organizational Controls" },
  { code: "A.5.34", title: "Privacy and protection of PII", category: "Organizational Controls" },
  { code: "A.5.35", title: "Independent review of information security", category: "Organizational Controls" },
  { code: "A.5.36", title: "Compliance with policies and standards for information security", category: "Organizational Controls" },
  { code: "A.5.37", title: "Documented operating procedures", category: "Organizational Controls" },

  // People Controls (A.6) - 8 controls
  { code: "A.6.1", title: "Screening", category: "People Controls" },
  { code: "A.6.2", title: "Terms and conditions of employment", category: "People Controls" },
  { code: "A.6.3", title: "Information Security Awareness Training", category: "People Controls" },
  { code: "A.6.4", title: "Disciplinary process", category: "People Controls" },
  { code: "A.6.5", title: "Responsibilities after termination or change of employment", category: "People Controls" },
  { code: "A.6.6", title: "Confidentiality or non-disclosure agreements", category: "People Controls" },
  { code: "A.6.7", title: "Remote working", category: "People Controls" },
  { code: "A.6.8", title: "Information security event reporting", category: "People Controls" },

  // Physical Controls (A.7) - 14 controls
  { code: "A.7.1", title: "Physical Security Perimeters", category: "Physical Controls" },
  { code: "A.7.2", title: "Physical entry controls", category: "Physical Controls" },
  { code: "A.7.3", title: "Securing offices, rooms and facilities", category: "Physical Controls" },
  { code: "A.7.4", title: "Physical security monitoring", category: "Physical Controls" },
  { code: "A.7.5", title: "Protecting against physical and environmental threats", category: "Physical Controls" },
  { code: "A.7.6", title: "Securing working areas", category: "Physical Controls" },
  { code: "A.7.7", title: "Clear desk and clear screen", category: "Physical Controls" },
  { code: "A.7.8", title: "Equipment siting and protection", category: "Physical Controls" },
  { code: "A.7.9", title: "Security of assets off-premises", category: "Physical Controls" },
  { code: "A.7.10", title: "Storage media", category: "Physical Controls" },
  { code: "A.7.11", title: "Supporting utilities", category: "Physical Controls" },
  { code: "A.7.12", title: "Cabling security", category: "Physical Controls" },
  { code: "A.7.13", title: "Equipment maintenance", category: "Physical Controls" },
  { code: "A.7.14", title: "Secure disposal or re-use of equipment", category: "Physical Controls" },

  // Technological Controls (A.8) - 34 controls
  { code: "A.8.1", title: "User Endpoint Devices Management", category: "Technological Controls" },
  { code: "A.8.2", title: "Privileged access rights", category: "Technological Controls" },
  { code: "A.8.3", title: "Information access restriction", category: "Technological Controls" },
  { code: "A.8.4", title: "Access to source code", category: "Technological Controls" },
  { code: "A.8.5", title: "Secure authentication", category: "Technological Controls" },
  { code: "A.8.6", title: "Capacity management", category: "Technological Controls" },
  { code: "A.8.7", title: "Protection against malware", category: "Technological Controls" },
  { code: "A.8.8", title: "Management of technical vulnerabilities", category: "Technological Controls" },
  { code: "A.8.9", title: "Configuration management", category: "Technological Controls" },
  { code: "A.8.10", title: "Information deletion", category: "Technological Controls" },
  { code: "A.8.11", title: "Data masking", category: "Technological Controls" },
  { code: "A.8.12", title: "Data Leakage Prevention (DLP)", category: "Technological Controls" },
  { code: "A.8.13", title: "Information backup", category: "Technological Controls" },
  { code: "A.8.14", title: "Redundancy of information processing facilities", category: "Technological Controls" },
  { code: "A.8.15", title: "Logging", category: "Technological Controls" },
  { code: "A.8.16", title: "Monitoring activities", category: "Technological Controls" },
  { code: "A.8.17", title: "Clock synchronization", category: "Technological Controls" },
  { code: "A.8.18", title: "Use of privileged utility programs", category: "Technological Controls" },
  { code: "A.8.19", title: "Installation of software on operational systems", category: "Technological Controls" },
  { code: "A.8.20", title: "Network Security Controls", category: "Technological Controls" },
  { code: "A.8.21", title: "Security of network services", category: "Technological Controls" },
  { code: "A.8.22", title: "Web filtering", category: "Technological Controls" },
  { code: "A.8.23", title: "Use of cryptography", category: "Technological Controls" },
  { code: "A.8.24", title: "Use of cryptography (Key Management)", category: "Technological Controls" },
  { code: "A.8.25", title: "Secure development life cycle", category: "Technological Controls" },
  { code: "A.8.26", title: "Application security requirements", category: "Technological Controls" },
  { code: "A.8.27", title: "Secure system architecture and engineering principles", category: "Technological Controls" },
  { code: "A.8.28", title: "Secure Coding Guidelines", category: "Technological Controls" },
  { code: "A.8.29", title: "Security testing in development and acceptance", category: "Technological Controls" },
  { code: "A.8.30", title: "Outsourced development", category: "Technological Controls" },
  { code: "A.8.31", title: "Separation of development, test and production environments", category: "Technological Controls" },
  { code: "A.8.32", title: "Change management", category: "Technological Controls" },
  { code: "A.8.33", title: "Test information", category: "Technological Controls" },
  { code: "A.8.34", title: "Protection of information systems during audit testing", category: "Technological Controls" }
];

// Complete Bespoke Control Justifications Dictionary for ISO 27001 Controls
const BESPOKE_ISO_JUSTIFICATIONS: Record<string, { in: string; ex: string; desc?: string; req?: string }> = {
  // A.5 Organizational Controls
  "A.5.1": {
    desc: "Information security policy and topic-specific policies shall be defined, approved by management, published and communicated to employees.",
    req: "A documented set of high-level security guidelines and operational policies approved by C-level executives and distributed to all staff.",
    in: "Mandatory foundation to establish security direction. Aligned with management policies, approved by executive leadership, and reviewed annually.",
    ex: "Cannot be excluded. Mandatory foundational policy requirement for all ISO 27001 ISMS scopes."
  },
  "A.5.2": {
    desc: "Information security roles and responsibilities shall be defined and allocated according to the organization needs.",
    req: "Formally documented job roles, security ownership matrices (RACI), and designated leadership accountability.",
    in: "Security roles and responsibilities (including CISO, DPO, and SecOps leads) are formally documented in job descriptions and assigned.",
    ex: "Cannot be excluded as organizational security governance requires clearly defined leadership accountability."
  },
  "A.5.3": {
    desc: "Conflicting duties and areas of responsibility shall be segregated to reduce opportunities for unauthorized modification or misuse.",
    req: "Division of operational responsibilities between request, authorization, and deployment to prevent single-person compromises.",
    in: "Duties are segregated between development approval and production release permissions to prevent unauthorized code modifications.",
    ex: "Excluded due to lean team operations; compensating controls enforced via mandatory multi-party code reviews, automated CI/CD pipeline guardrails, and immutable audit logging."
  },
  "A.5.4": {
    desc: "Management shall require all personnel to apply information security in accordance with the established information security policy.",
    req: "Executive mandate and active management oversight enforcing compliance with security directives.",
    in: "Executive management actively demonstrates support through annual budget allocation, quarterly ISMS reviews, and compliance enforcement.",
    ex: "Mandatory ISMS leadership requirement; cannot be excluded."
  },
  "A.5.5": {
    desc: "The organization shall establish and maintain contact with relevant authorities.",
    req: "Documented list of legal, regulatory, and emergency authorities with clear escalation triggers.",
    in: "Formal communication channels with relevant regulatory bodies, law enforcement, and national CERT units are maintained for rapid incident escalation.",
    ex: "Excluded from localized operational scope as primary regulatory and law enforcement contacts are maintained centrally by parent enterprise legal council."
  },
  "A.5.6": {
    desc: "The organization shall establish and maintain contact with special interest groups or other specialist security associations.",
    req: "Active participation in industry ISACs, security forums, or professional compliance bodies.",
    in: "Active memberships in security associations (OWASP, FIRST, InfraGard) are maintained to stay informed of emerging threat vectors and best practices.",
    ex: "Excluded from direct group participation; threat intelligence is acquired through commercial automated threat feeds and cloud vendor security bulletins."
  },
  "A.5.7": {
    desc: "Information relating to information security threats shall be collected and analyzed to produce threat intelligence.",
    req: "Systematic ingest, analysis, and application of threat intelligence into security defenses.",
    in: "Threat intelligence feeds are ingested into SIEM rules, vulnerability prioritization, and WAF firewalls automatically.",
    ex: "Direct threat intelligence collection is excluded; edge protection and threat mitigation are handled automatically by cloud edge providers (Cloudflare WAF / GCP Shield)."
  },
  "A.5.8": {
    desc: "Information security shall be integrated into project management practices.",
    req: "Security milestones, risk assessments, and compliance gate checks integrated into all corporate project methodologies.",
    in: "Information security risks, privacy impact assessments, and security gate criteria are systematically integrated into all software and business project management lifecycles.",
    ex: "Our organization operates a standardized cloud SaaS service without bespoke client project delivery lifecycles; product releases follow continuous release pipelines (A.8.32) governed under standard change management."
  },
  "A.5.9": {
    desc: "An inventory of information and other associated assets, including owners, shall be developed and maintained.",
    req: "Centralized asset inventory tracking hardware, software, cloud resources, and data repositories with assigned owners.",
    in: "An automated asset inventory registers all cloud infrastructure, databases, software licenses, and endpoints with assigned ownership.",
    ex: "All operational assets reside within managed serverless environments; platform infrastructure components are registered and tracked via Infrastructure-as-Code (Terraform) manifests."
  },
  "A.5.10": {
    desc: "Rules for the acceptable use of information and other associated assets shall be identified, documented and implemented.",
    req: "Documented Acceptable Use Policy (AUP) signed by employees and enforced via endpoint controls.",
    in: "Acceptable Use Policy (AUP) is documented, acknowledged by all employees upon onboarding, and enforced via endpoint management tools.",
    ex: "Mandatory human governance policy for internal access; non-excludable."
  },
  "A.5.11": {
    desc: "Personnel and other interested parties shall return all the organization assets in their possession upon change or termination.",
    req: "Formal offboarding checklist and physical asset retrieval process for departing staff.",
    in: "An offboarding checklist requires all departing staff and contractors to return physical devices, access keys, and tokens prior to final clearance.",
    ex: "Excluded as organization operates a strictly virtual, BYOD model with zero company-issued hardware assets; cloud access is instantly revoked via IAM upon departure."
  },
  "A.5.12": {
    desc: "Information shall be classified according to the information security needs of the organization.",
    req: "Classification schema (Public, Internal, Confidential, Restricted) with clear handling requirements.",
    in: "Data assets are categorized into classification tiers (Public, Internal, Confidential, Restricted) based on sensitivity and business impact.",
    ex: "Excluded as all internal data is uniformly treated at the highest 'Confidential/PII' classification level, applying maximum protective encryption to all data assets by default."
  },
  "A.5.13": {
    desc: "An appropriate set of procedures for information labeling shall be developed and implemented.",
    req: "Visual and technical labeling of data assets based on sensitivity classifications.",
    in: "Automated DLP mechanisms and visual headers label electronic documents and email communications based on their sensitivity classification.",
    ex: "Automated system-level encryption and access restrictions apply uniformly across all data stores, removing the need for manual file labeling tags."
  },
  "A.5.14": {
    desc: "Information transfer rules, procedures or agreements shall be in place for all types of transfer facilities.",
    req: "Encrypted transfer channels, secure protocol mandates, and contractual data transfer agreements.",
    in: "Information transfer policies enforce secure protocols (SFTP, TLS 1.3, encrypted email) and contractual data transfer agreements.",
    ex: "Direct external file transfer channels are disabled across corporate endpoints; data exchange is limited strictly to authenticated API calls over TLS 1.3."
  },
  "A.5.15": {
    desc: "Rules to control physical and logical access to information and other associated assets shall be established and implemented.",
    req: "Technical access control policies restricting system access to authorized personnel under the least privilege model.",
    in: "Enforced via central Okta IAM, mandatory MFA, and role-based access configurations across all SaaS & production nodes.",
    ex: "Access control is fundamental to our SaaS environment and cannot be excluded."
  },
  "A.5.16": {
    desc: "The full lifecycle of identities shall be managed.",
    req: "Central identity provider managing user creation, modification, suspension, and deletion workflows.",
    in: "Centralized identity provider (Okta/Google Workspace) manages the full lifecycle of user identities, provisioning, and Deprovisioning.",
    ex: "Mandatory for account governance; identity management cannot be excluded."
  },
  "A.5.17": {
    desc: "Allocation and management of authentication information shall be controlled by a management process.",
    req: "Secure distribution, storage, and rotation of credentials, passwords, and cryptographic keys.",
    in: "Authentication credentials (passwords, SSH keys, certificates) are managed via centralized password vaults and automated key rotation policies.",
    ex: "Direct user-managed passwords are eliminated across production environments in favor of hardware-bound WebAuthn/FIDO2 SSO tokens."
  },
  "A.5.18": {
    desc: "Access rights to information and other associated assets shall be provisioned, reviewed, modified and removed.",
    req: "Role-Based Access Control (RBAC) with quarterly entitlement reviews and prompt access revocations.",
    in: "Access permissions to applications and databases are granted on a least-privilege basis and formally re-certified through quarterly access reviews.",
    ex: "Mandatory access governance control; cannot be excluded."
  },
  "A.5.19": {
    desc: "Processes and procedures shall be defined and implemented to manage information security risks in supplier relationships.",
    req: "Vendor risk management (VRM) framework evaluating vendor security posture before and during engagements.",
    in: "Third-party vendor risk management (TPRM) framework active, collecting annual SOC 2 Type II reports and security questionnaires from key suppliers.",
    ex: "Excluded because our organization operates no third-party vendor integrations or external supplier dependencies for core data processing."
  },
  "A.5.20": {
    desc: "Relevant information security requirements shall be established and agreed with each supplier.",
    req: "Mandatory security addendums, SLAs, NDAs, and audit clauses in supplier contracts.",
    in: "Formal vendor contracts incorporate mandatory security addendums, incident notification SLAs, confidentiality obligations, and audit rights.",
    ex: "Excluded as no third-party vendor relationships are maintained for processing or operational data flows."
  },
  "A.5.21": {
    desc: "Processes and procedures shall be defined and implemented to manage information security risks in ICT supply chain.",
    req: "Software Bill of Materials (SBOM), dependency vulnerability scanning, and supply chain security controls.",
    in: "Software Bill of Materials (SBOM) and dependency scanning (Snyk/Dependabot) assess supply chain security for third-party libraries and container images.",
    ex: "Software development utilizes zero external open-source libraries or third-party code packages; all code is written natively in-house."
  },
  "A.5.22": {
    desc: "The organization shall regularly monitor, review, evaluate and manage changes in supplier services.",
    req: "Periodic audit of vendor performance, SOC report verification, and contractual compliance monitoring.",
    in: "Key cloud and software vendors are monitored continuously, with annual SOC 2 Type II audits, SLA performance checks, and contract renewals.",
    ex: "Excluded as no third-party managed service providers or outsourced suppliers are utilized."
  },
  "A.5.23": {
    desc: "Processes for acquisition, use, management and exit from cloud services shall be established in accordance with information security requirements.",
    req: "Cloud security architecture baseline, CSPM governance, data exit policies, and tenant isolation.",
    in: "Cloud Security Posture Management (CSPM) active across GCP/AWS environments with continuous Terraform compliance checks.",
    ex: "Infrastructure is hosted exclusively on self-managed, physical on-premises bare-metal servers without public cloud service providers."
  },
  "A.5.24": {
    desc: "The organization shall plan and prepare for managing information security incidents by defining roles and procedures.",
    req: "Documented Incident Response Plan (IRP), severity classification, and tested communication playbooks.",
    in: "An Incident Response Plan (IRP) defines roles, severity levels, communication protocols, and escalation procedures, tested annually via tabletop exercises.",
    ex: "Mandatory operational requirement for incident handling; cannot be excluded."
  },
  "A.5.25": {
    desc: "The organization shall assess information security events and decide if they are to be categorized as information security incidents.",
    req: "Triage criteria and SOC procedures to evaluate anomalies and escalate security incidents.",
    in: "Security events logged by SIEM tools are triaged by the Security Operations Center (SOC) to evaluate if they constitute security incidents.",
    ex: "Mandatory threat assessment process; cannot be excluded."
  },
  "A.5.26": {
    desc: "Information security incidents shall be responded to in accordance with the documented procedures.",
    req: "Active incident response containment, evidence preservation, eradication, and notification execution.",
    in: "Pre-defined playbook procedures guide containment, eradication, recovery, and communication during active security incidents.",
    ex: "Mandatory incident remediation requirement; cannot be excluded."
  },
  "A.5.27": {
    desc: "Knowledge gained from information security incidents shall be used to strengthen security controls.",
    req: "Post-incident reviews (post-mortems), lessons learned documentation, and root-cause remediation tracking.",
    in: "Post-incident reviews (blameless post-mortems) document root causes, identify control gaps, and track corrective action plans to completion.",
    ex: "Mandatory improvement process following security events; cannot be excluded."
  },
  "A.5.28": {
    desc: "The organization shall establish and implement procedures for the identification, collection, acquisition and preservation of evidence.",
    req: "Forensic evidence handling guidelines preserving chain of custody and immutable evidence stores.",
    in: "Forensic evidence collection procedures ensure chain-of-custody, read-only memory dumps, and immutable log retention during security investigations.",
    ex: "Primary cloud infrastructure runs serverless, immutable container tasks; detailed system state forensic capture is handled via cloud provider infrastructure logs."
  },
  "A.5.29": {
    desc: "The organization shall plan how to maintain information security at an appropriate level during disruption.",
    req: "Continuity of security controls during BCP execution, system failovers, and emergency conditions.",
    in: "Security controls (access limits, encryption, logging) remain actively enforced during disaster recovery and operational continuity events.",
    ex: "Mandatory requirement to maintain security posture during BCP/DR; cannot be excluded."
  },
  "A.5.30": {
    desc: "ICT readiness shall be planned, implemented, tested and evaluated based on business continuity objectives.",
    req: "A documented Disaster Recovery (DR) and Business Continuity Plan (BCP) with verified annual test logs.",
    in: "Necessary to safeguard customer uptime commitments. Enforced via multi-region GCP standby nodes and automated SQL replication.",
    ex: "Only excludable if there are no electronic data processing operations, which is not applicable to our tech business."
  },
  "A.5.31": {
    desc: "Legal, statutory, regulatory and contractual requirements relevant to information security shall be identified and documented.",
    req: "Compliance register tracking GDPR, CCPA, ISO 27001, and client contractual requirements.",
    in: "Legal and regulatory compliance requirements (GDPR, CCPA, ISO 27001) are identified, documented in a legal register, and reviewed annually.",
    ex: "Mandatory legal compliance oversight; cannot be excluded."
  },
  "A.5.32": {
    desc: "Appropriate procedures shall be implemented to protect intellectual property rights.",
    req: "Software license management, copyright protection, and IP safeguards for corporate assets.",
    in: "Software licensing compliance tools and copyright protections safeguard corporate software IP and prevent unauthorized proprietary software use.",
    ex: "Excluded as our operations rely entirely on open-source software licenses (MIT/Apache 2.0) without proprietary IP commercialization."
  },
  "A.5.33": {
    desc: "Records shall be protected from loss, destruction, falsification, unauthorized access and unauthorized release.",
    req: "Records retention schedule, immutability protections, and secure archive storage.",
    in: "Record retention and disposal policies govern legal, financial, and audit logs, storing them in immutable WORM cloud buckets.",
    ex: "Mandatory record-keeping control; cannot be excluded."
  },
  "A.5.34": {
    desc: "Privacy and protection of personally identifiable information (PII) shall be ensured as required in applicable legislation.",
    req: "Data protection policy, DPIA execution, consent management, and PII encryption controls.",
    in: "A formal Privacy Policy, Data Protection Impact Assessments (DPIAs), and technical PII encryption safeguard user personal data under GDPR/CCPA.",
    ex: "Our system processes zero Personally Identifiable Information (PII) or end-user personal records; system processes purely anonymous machine data."
  },
  "A.5.35": {
    desc: "The organization approach to managing information security shall be reviewed independently at planned intervals.",
    req: "Independent third-party audits (SOC 2, ISO 27001) and external penetration testing.",
    in: "Annual independent third-party audits (SOC 2, ISO 27001 external audits, external penetration tests) evaluate ISMS effectiveness.",
    ex: "Mandatory independent validation control for ISO 27001 certification; cannot be excluded."
  },
  "A.5.36": {
    desc: "Managers shall regularly review the compliance of information processing within their area of responsibility with policies and standards.",
    req: "Internal compliance review schedules, automated policy enforcement checks, and management oversight.",
    in: "Periodic internal compliance audits and automated configuration drift checks verify adherence to security policies across all departments.",
    ex: "Mandatory internal compliance monitoring control; cannot be excluded."
  },
  "A.5.37": {
    desc: "Operating procedures for information processing facilities shall be documented and made available to personnel.",
    req: "Documented SOPs for system operations, backups, deployment, and administrative workflows.",
    in: "Standard Operating Procedures (SOPs) are documented, version-controlled, and maintained for system administration, backup, and security tasks.",
    ex: "All operational tasks are executed via fully automated, self-documenting Infrastructure-as-Code pipelines, replacing manual operating procedures."
  },

  // A.6 People Controls
  "A.6.1": {
    desc: "Background verification checks on all candidates for employment shall be carried out prior to joining the organization.",
    req: "Mandatory pre-employment background checks, identity verification, and credential validation.",
    in: "Pre-employment background checks, reference verifications, and identity validation mandatory for all hired personnel.",
    ex: "Excluded for non-employee contractors as third-party staffing agencies perform identity background checks under contractual SLAs."
  },
  "A.6.2": {
    desc: "Employment agreements shall state personnel and organization responsibilities for information security.",
    req: "Contractual employment clauses specifying security roles, NDA obligations, and compliance duties.",
    in: "Employment contracts mandate adherence to security policies, confidentiality terms, and consequences for non-compliance.",
    ex: "Mandatory contractual obligation for all workforce members; cannot be excluded."
  },
  "A.6.3": {
    desc: "Personnel and relevant interested parties shall receive appropriate information security awareness, education and training.",
    req: "Mandatory security onboarding and annual training courses with formal completion records for all full-time and contract staff.",
    in: "Operationalized through periodic LMS training modules and dynamic phishing simulations hosted on InfoShield.",
    ex: "Personnel present our primary risk vector; security training is strictly non-excludable."
  },
  "A.6.4": {
    desc: "A disciplinary process shall be formalized and communicated to take action against personnel who have committed a security breach.",
    req: "Documented disciplinary policy for security policy violations.",
    in: "A formal disciplinary process defines warnings, access suspension, and termination procedures for personnel violating security policies.",
    ex: "Mandatory policy enforcement mechanism; cannot be excluded."
  },
  "A.6.5": {
    desc: "Information security responsibilities and duties that remain valid after termination or change of employment shall be defined and enforced.",
    req: "Offboarding protocols enforcing access revocation, returning assets, and NDA reminders.",
    in: "Termination workflows enforce immediate IAM credential revocation, asset return verification, and reminders of ongoing NDA obligations.",
    ex: "Mandatory offboarding governance; cannot be excluded."
  },
  "A.6.6": {
    desc: "Confidentiality or non-disclosure agreements shall be identified, documented, regularly reviewed and signed.",
    req: "Signed NDAs for employees, contractors, and third parties before granted access.",
    in: "Enforceable Non-Disclosure Agreements (NDAs) are signed by all staff, contractors, and third parties prior to receiving system access.",
    ex: "Mandatory legal data protection measure; cannot be excluded."
  },
  "A.6.7": {
    desc: "Security measures shall be implemented when personnel are working remotely to protect information.",
    req: "Remote work policy, VPN/ZTNA, drive encryption, and secure home network requirements.",
    in: "Remote work security policy enforcing mandatory VPN/Zero-Trust Network Access (ZTNA), disk encryption, and secure home Wi-Fi standards.",
    ex: "Organization operates 100% on-site with zero remote access capabilities."
  },
  "A.6.8": {
    desc: "The organization shall provide a mechanism for personnel to report observed or suspected information security events.",
    req: "Clear channels and tools for workforce event reporting (phishing button, security hotline).",
    in: "Employees and contractors are trained and provided dedicated tools (e.g., Slack security bot, email button) to report suspicious events immediately.",
    ex: "Mandatory workforce reporting channel; cannot be excluded."
  },

  // A.7 Physical Controls
  "A.7.1": {
    desc: "Security perimeters shall be defined and used to protect areas that contain information and other associated assets.",
    req: "Physical access controls, badge logs, security cameras, and visitor escorts to prevent unauthorized physical access to offices and server rooms.",
    in: "Protects our primary corporate headquarters. Managed via electronic card-key badging and 24/7 CCTV surveillance.",
    ex: "Organization is 100% remote-first. We operate no physical server rooms or secure office perimeters; all assets reside in secure AWS cloud zones."
  },
  "A.7.2": {
    desc: "Secure areas shall be protected by appropriate entry controls to ensure that only authorized personnel are allowed access.",
    req: "Badge readers, biometric scanners, and visitor logs restricting access to secure facilities.",
    in: "Electronic keycards, biometric authentication, and visitor logging enforce controlled entry to facility work areas.",
    ex: "100% cloud-native workforce operating remotely; physical entry to data center facilities is managed and audited by GCP/AWS cloud providers."
  },
  "A.7.3": {
    desc: "Physical security for offices, rooms and facilities shall be designed and applied.",
    req: "Locked data closets, intrusion alarms, and reinforced doors for sensitive rooms.",
    in: "Restricted zones (data closets, server rooms) are secured with secondary keycard locks, intrusion alarms, and restricted access lists.",
    ex: "No physical server rooms or secure office facilities are maintained; infrastructure is fully virtualized in certified cloud locations."
  },
  "A.7.4": {
    desc: "Premises shall be continuously monitored for unauthorized physical access.",
    req: "CCTV cameras, intrusion detection sensors, and security guard patrols.",
    in: "CCTV surveillance cameras monitor all physical entry points and server room doors, retaining footage for a minimum of 90 days.",
    ex: "No physical premises or server facilities are operated directly; physical monitoring is handled by cloud provider data center security."
  },
  "A.7.5": {
    desc: "Protection against physical and environmental threats shall be designed and implemented.",
    req: "Fire suppression, UPS backup power, flood barriers, and climate control in facilities.",
    in: "Fire suppression systems, redundant UPS power supplies, climate sensors, and flood barriers protect physical infrastructure.",
    ex: "Environmental hazard defense is fully outsourced to AWS/GCP data center operators holding active SOC 2 Type II certifications."
  },
  "A.7.6": {
    desc: "Physical security for working in secure areas shall be designed and applied.",
    req: "Visitor controls, restriction of recording devices, and clean desk policies in secure rooms.",
    in: "Policies restrict photography, unauthorized visitors, and sensitive display views in physical working environments.",
    ex: "Workforce operates remotely; physical office space guidelines are replaced by work-from-home endpoint security policies."
  },
  "A.7.7": {
    desc: "Clear desk rules for papers and removable storage media and clear screen rules for information processing facilities shall be adopted.",
    req: "Clear desk / clear screen policy enforcing paper lockup and screen timeouts.",
    in: "Clear Desk and Clear Screen policy enforces locking workstations when leaving desks and locking away physical sensitive papers.",
    ex: "Operations are 100% paperless and endpoint computers enforce automated 5-minute inactivity screensaver locks."
  },
  "A.7.8": {
    desc: "Equipment shall be sited and protected to reduce the risks from environmental threats and hazards, and unauthorized access.",
    req: "Physical rack positioning, cabling protection, and environmental isolation for equipment.",
    in: "Physical servers and network equipment are sited in restricted server racks protected from environmental hazards and physical tampering.",
    ex: "All computing equipment resides in multi-tenant cloud data centers managed by verified cloud service providers."
  },
  "A.7.9": {
    desc: "Off-premises assets shall be protected.",
    req: "Encryption, physical locks, and tracking for laptops and mobile devices used outside offices.",
    in: "Off-premises laptop computers and equipment are encrypted (FileVault/BitLocker), registered in MDM, and protected against theft.",
    ex: "Company operates a strict zero-trust cloud model where no company assets or sensitive data may be removed from approved cloud perimeters."
  },
  "A.7.10": {
    desc: "Storage media shall be managed through their lifecycle of acquisition, use, transportation and disposal.",
    req: "Media handling procedures, USB blocking, and secure destruction (NIST 800-88).",
    in: "Removable media (USB drives, external disks) use is blocked via endpoint policy, and physical media disposal follows NIST 800-88 shredding standards.",
    ex: "Use of physical removable media is disabled via OS endpoint policy across all company devices; zero physical media is used."
  },
  "A.7.11": {
    desc: "Information processing facilities shall be protected from power failures and other disruptions caused by failures in supporting utilities.",
    req: "UPS systems, generators, and redundant power feeds.",
    in: "Redundant utility feeds, diesel backup generators, and secondary ISP connections ensure continuous power and network availability.",
    ex: "Utility availability and infrastructure redundancy are maintained by tier-4 cloud hosting providers."
  },
  "A.7.12": {
    desc: "Power and telecommunications cabling carrying data or supporting information services shall be protected from interception, interference or damage.",
    req: "Conduits, cable locks, and shielded wiring for data and power lines.",
    in: "Network and power cabling in server facilities is housed in protected conduits to prevent interception, damage, or electromagnetic interference.",
    ex: "Physical cabling infrastructure is owned and maintained entirely by cloud data center vendors."
  },
  "A.7.13": {
    desc: "Equipment shall be correctly maintained to ensure its continued availability and integrity.",
    req: "Scheduled hardware maintenance, vendor servicing, and replacement logs.",
    in: "Physical hardware equipment undergoes regular manufacturer preventive maintenance and hardware component replacements.",
    ex: "Hardware maintenance and physical server servicing are performed by underlying cloud hosting infrastructure teams."
  },
  "A.7.14": {
    desc: "Items of equipment containing storage media shall be verified to ensure that any sensitive data and licensed software has been deleted or securely overwritten prior to disposal or re-use.",
    req: "Cryptographic sanitization or physical destruction of drives before retirement.",
    in: "Decommissioned hard drives and storage media undergo cryptographic erasure and physical destruction via certified e-waste vendors.",
    ex: "Physical media destruction is managed by AWS/GCP data center operations in accordance with DOD 5220.22-M / NIST 800-88 standards."
  },

  // A.8 Technological Controls
  "A.8.1": {
    desc: "Security measures shall be implemented to manage security risks associated with user endpoint devices.",
    req: "Mobile Device Management (MDM) configuration enforcing local drive encryption, software updates, and local firewalls.",
    in: "All corporate laptops are managed under Kandji/MDM profiles, enforcing FileVault encryption, screensaver locks, and remote-wipe.",
    ex: "User endpoint devices do not store corporate data or host production environments; all work is conducted via secure browser sessions to zero-trust cloud apps."
  },
  "A.8.2": {
    desc: "The allocation and use of privileged access rights shall be restricted and managed.",
    req: "Just-in-time elevation, PAM tools, and logging of privileged administrator actions.",
    in: "Privileged administrator accounts are strictly limited, require explicit manager approval, and enforce just-in-time access elevation.",
    ex: "Mandatory privileged access control; cannot be excluded."
  },
  "A.8.3": {
    desc: "Access to information and other associated assets shall be restricted in accordance with the established topic-specific policy on access control.",
    req: "RBAC policies and application authorization rules restricting data access.",
    in: "Access to production databases and customer data is restricted based on application authorization rules and RBAC policies.",
    ex: "Mandatory access restriction control; cannot be excluded."
  },
  "A.8.4": {
    desc: "Read and write access to source code, development tools and software libraries shall be appropriately restricted.",
    req: "Branch protection, MFA, and repository access restrictions for source code.",
    in: "GitHub repository access restricted via branch protection rules, required PR approvals, and hardware MFA enforcement.",
    ex: "Excluded from custom code scope as our business utilizes third-party off-the-shelf software without maintaining custom source code repositories."
  },
  "A.8.5": {
    desc: "Secure authentication technologies and procedures shall be established based on information access restrictions and the topic-specific policy on access control.",
    req: "MFA enforcement, WebAuthn/FIDO2 hardware keys, and password complexity baselines.",
    in: "Authentication systems enforce strong password complexity, hardware FIDO2/WebAuthn tokens, and adaptive risk-based MFA.",
    ex: "Mandatory authentication safeguard; cannot be excluded."
  },
  "A.8.6": {
    desc: "The use of resources shall be monitored and adjusted in line with current and expected capacity requirements.",
    req: "Resource usage monitoring, capacity planning, and auto-scaling rules.",
    in: "System CPU, memory, and storage utilization are monitored via CloudWatch/Datadog with auto-scaling groups to prevent capacity exhaustion.",
    ex: "Serverless container infrastructure automatically scales compute capacity dynamically without manual resource allocation limits."
  },
  "A.8.7": {
    desc: "Protection against malware shall be implemented and supported by appropriate user awareness.",
    req: "Antivirus/EDR tools on endpoints and servers with continuous definition updates.",
    in: "Workstations run CrowdStrike Falcon EDR and cloud containers use runtime threat detection to block malicious software executions.",
    ex: "Production systems consist purely of immutable, short-lived serverless containers running read-only filesystems."
  },
  "A.8.8": {
    desc: "Information about technical vulnerabilities of information systems in use shall be obtained, evaluated, and addressed.",
    req: "Automated vulnerability scanning, patch management SLAs, and threat monitoring.",
    in: "Automated vulnerability scanners (Qualys/Tenable) perform weekly scans, and critical patches are deployed within SLA timelines.",
    ex: "Mandatory technical risk mitigation control; cannot be excluded."
  },
  "A.8.9": {
    desc: "Configurations, including security configurations, of hardware, software, services and networks shall be established, documented, implemented, monitored and reviewed.",
    req: "Hardened configuration baselines (CIS benchmarks) and automated drift detection.",
    in: "System configurations are managed as code (Terraform/Ansible), version-controlled, and audited for configuration drift.",
    ex: "Mandatory baseline configuration control; cannot be excluded."
  },
  "A.8.10": {
    desc: "Information stored in information systems, devices or in any other storage media shall be deleted when no longer required.",
    req: "Cryptographic deletion protocols and automated retention purges.",
    in: "Data deletion procedures securely purge customer records upon contract termination or GDPR deletion requests using cryptographic erasure.",
    ex: "Mandatory data lifecycle control; cannot be excluded."
  },
  "A.8.11": {
    desc: "Data masking shall be used in accordance with the organization topic-specific policy on access control and other related topic-specific policies.",
    req: "Anonymization, tokenization, and masking of PII in non-production environments.",
    in: "Sensitive PII and credit card fields are masked or pseudonymized in non-production databases and application log files.",
    ex: "Non-production staging environments utilize synthetic dummy data generated in-memory rather than masked production backups."
  },
  "A.8.12": {
    desc: "Data leakage prevention measures shall be applied to systems, networks and other devices that process sensitive information.",
    req: "Technical mechanisms (DLP software, restricted copy/paste, file upload firewalls) preventing unauthorized transfer of customer records.",
    in: "Enforced via outbound network filters, strict database egress restrictions, and automated Google Workspace DLP classification.",
    ex: "We process no high-risk proprietary trade secrets or sensitive payment strings locally, so DLP checks are managed by our cloud providers."
  },
  "A.8.13": {
    desc: "Backups of information, software and systems shall be taken and tested regularly in accordance with the agreed topic-specific policy on backup.",
    req: "Encrypted automated snapshots, offsite replication, and quarterly restore testing.",
    in: "Automated daily point-in-time database snapshots are encrypted and replicated to a secondary cloud region with quarterly restore testing.",
    ex: "Mandatory data resilience control; cannot be excluded."
  },
  "A.8.14": {
    desc: "Information processing facilities shall be implemented with redundancy sufficient to meet availability requirements.",
    req: "Multi-region or multi-AZ deployment, load balancing, and failover architectures.",
    in: "Application services run across multiple cloud Availability Zones (AZs) with automated load balancing and auto-failover.",
    ex: "Single-region hosting is explicitly accepted under business SLAs for non-critical informational tools."
  },
  "A.8.15": {
    desc: "Logs that record activities, exceptions, faults and other relevant events shall be produced, kept, protected and analyzed.",
    req: "Centralized logging, immutable log storage (WORM), and 365-day retention.",
    in: "System, user, and security event logs are centralized into SIEM (InfoShield/Datadog) with tamper-proof immutable storage for 365 days.",
    ex: "Mandatory audit trail control; cannot be excluded."
  },
  "A.8.16": {
    desc: "Networks, systems and applications shall be monitored for anomalous behavior and appropriate action taken to evaluate potential information security incidents.",
    req: "Real-time SIEM alerts, threshold monitoring, and behavioral anomaly detection.",
    in: "Automated alerting rules analyze log streams in real-time to detect anomalous logins, unauthorized API calls, and suspicious activity.",
    ex: "Mandatory security monitoring control; cannot be excluded."
  },
  "A.8.17": {
    desc: "The clocks of information processing systems shall be synchronized to agreed time sources.",
    req: "NTP time synchronization across all servers and network devices.",
    in: "All servers and network devices synchronize system clocks against stratum-1 NTP servers to ensure accurate timestamp correlation.",
    ex: "Clock synchronization is maintained natively by underlying cloud platform hypervisors."
  },
  "A.8.18": {
    desc: "The use of utility programs that can be capable of overriding system and application controls shall be restricted and tightly controlled.",
    req: "Restricted administrative tools, execution logging, and elevated approvals.",
    in: "Use of system utility programs capable of overriding system controls is restricted, logged, and requires elevated administrative approval.",
    ex: "Direct server SSH access and utility execution are disabled in favor of automated CI/CD container deployments."
  },
  "A.8.19": {
    desc: "Procedures and measures shall be implemented to securely manage software installation on operational systems.",
    req: "Application whitelisting, software installation restrictions, and central deployment tooling.",
    in: "Endpoint software installation is restricted via application whitelisting, preventing employees from installing unapproved software.",
    ex: "Operational systems run containerized applications with read-only root filesystems, blocking dynamic software installation."
  },
  "A.8.20": {
    desc: "Networks and network devices shall be secured, managed and controlled to protect information in systems.",
    req: "Managed firewalls, network segregation (DMZ), encrypted transmission tunnels, and active IDS/IPS configurations.",
    in: "Production environments run inside isolated VPC clusters with rigid Cloud NAT firewalls and zero open public ports except HTTPS.",
    ex: "Not excludable as we operate digital cloud services transmitting client information."
  },
  "A.8.21": {
    desc: "Security mechanisms, service levels and service requirements of network services shall be identified, implemented and monitored.",
    req: "Network SLA monitoring, encryption standards for transit, and provider reviews.",
    in: "Network service providers are evaluated for SLA compliance, DDoS mitigation capabilities, and security encryption standards.",
    ex: "Network connectivity is managed natively by Google Cloud Platform / AWS under corporate cloud enterprise agreements."
  },
  "A.8.22": {
    desc: "Access to external websites shall be managed to reduce exposure to malicious content.",
    req: "DNS/Web filtering tools blocking malicious, phishing, and unapproved categories.",
    in: "DNS filtering (DNSFilter/Cloudflare Teams) blocks employee access to malicious, phishing, or unauthorized web domains.",
    ex: "Corporate devices access internet resources via restricted web proxies that enforce domain allowlists."
  },
  "A.8.23": {
    desc: "Rules for the effective use of cryptography, including key management, shall be defined and implemented.",
    req: "Corporate cryptography standards defining secure algorithms (AES-256, TLS 1.3), key life-cycles, and secure vault storage.",
    in: "Standardized on AES-256 for cloud disks at rest, TLS 1.3 for all endpoints in transit, and GCP KMS for cryptographic keys.",
    ex: "Mandatory control as cryptographically weak algorithms represent a primary threat surface."
  },
  "A.8.24": {
    desc: "The full lifecycle of cryptographic keys shall be managed.",
    req: "Key generation, distribution, vault storage, rotation, and retirement procedures.",
    in: "Cryptographic keys are generated, stored, rotated, and retired using Cloud KMS / HashiCorp Vault with strict access controls.",
    ex: "Key management is managed natively via KMS with automated 90-day key rotation."
  },
  "A.8.25": {
    desc: "Rules for the secure development of software and systems shall be established and applied.",
    req: "Secure SDLC framework, threat modeling, security code reviews, and pre-release gates.",
    in: "Software development follows an SDLC framework incorporating threat modeling, peer code reviews, SAST/DAST, and pre-release gates.",
    ex: "Excluded as the company does not develop or build custom software, operating strictly off-the-shelf SaaS applications."
  },
  "A.8.26": {
    desc: "Information security requirements shall be identified, specified and approved when developing or acquiring applications.",
    req: "Security requirements specs (input validation, authentication, encryption) in architecture design.",
    in: "Security requirements (authentication, input validation, encryption) are documented and verified during application design.",
    ex: "Excluded as no custom application software is developed in-house."
  },
  "A.8.27": {
    desc: "Principles for engineering secure systems shall be established, documented, maintained and applied to any information system engineering activities.",
    req: "Secure design principles (least privilege, defense in depth, zero trust architecture).",
    in: "Systems are designed using defense-in-depth, zero-trust architecture, component isolation, and fail-secure principles.",
    ex: "Infrastructure architecture is maintained via cloud vendor managed platform blueprints."
  },
  "A.8.28": {
    desc: "Secure coding principles shall be applied to software development.",
    req: "Enforcement of OWASP Top 10 secure software development lifecycles, code reviews, and automated security scans in CI/CD pipelines.",
    in: "Enforced via strict peer reviews, mandatory static analysis (SonarQube) in GitHub, and developer secure-code training.",
    ex: "Since we do not build or publish any custom proprietary software, secure coding guidelines are excluded."
  },
  "A.8.29": {
    desc: "Security testing processes shall be defined and implemented in the development life cycle.",
    req: "SAST, DAST, dependency scans, and pre-production penetration testing.",
    in: "Automated security tests (unit, integration, vulnerability scans, penetration testing) are conducted before code release.",
    ex: "Excluded as no custom software code is deployed to production."
  },
  "A.8.30": {
    desc: "The organization shall supervise, monitor and review the activity of outsourced software development.",
    req: "Contractual security clauses, code audits, and IP protection for outsourced developers.",
    in: "Contractual security requirements, code audits, and IP protection clauses enforced for external engineering contractors.",
    ex: "Excluded because all software development is conducted 100% in-house without third-party outsourced engineering vendors."
  },
  "A.8.31": {
    desc: "Development, testing and production environments shall be separated and secured.",
    req: "Isolated environments (Dev, Stage, Prod) with separate access controls and network segregation.",
    in: "Development, Staging, and Production environments reside in isolated GCP projects with separate IAM permissions and synthetic test data.",
    ex: "Mandatory environment isolation control; cannot be excluded."
  },
  "A.8.32": {
    desc: "Changes to information processing facilities and information systems shall be subject to change management procedures.",
    req: "Formal change requests, peer reviews, CI/CD automated deployment, and rollback plans.",
    in: "System and application changes follow formal change tickets, peer approval, CI/CD automated testing, and rollback plans.",
    ex: "Mandatory operational control; cannot be excluded."
  },
  "A.8.33": {
    desc: "Test information shall be appropriately selected, protected and managed.",
    req: "Synthetic test data usage and strict prohibition against using production data in non-production.",
    in: "Test data is generated synthetically; production data is strictly prohibited from being copied to non-production environments.",
    ex: "Mandatory data privacy safeguard in development testing; cannot be excluded."
  },
  "A.8.34": {
    desc: "Audit tests and other assurance activities involving operational systems shall be planned and agreed between the tester and appropriate management.",
    req: "Audit testing protocols to prevent operational disruption during security audits and pentests.",
    in: "Audit testing and penetration tests are scheduled and controlled to prevent disruption to operational production systems.",
    ex: "Mandatory operational safeguard during compliance audits; cannot be excluded."
  }
};

const ISO_CONTROLS: GapControl[] = RAW_ISO_CONTROLS.map((raw) => {
  const codeNum = raw.code.toLowerCase();
  const id = `iso-gap-${codeNum}`;

  const bespoke = BESPOKE_ISO_JUSTIFICATIONS[raw.code];

  const description = bespoke?.desc || `Establishing and maintaining robust measures for ${raw.title.toLowerCase()} in accordance with ISO/IEC 27001:2022 guidelines.`;
  const requirement = bespoke?.req || `Documented framework, executive sign-off, and active enforcement of ${raw.title.toLowerCase()} controls.`;
  
  const defaultJustificationIn = bespoke?.in || `Fully implemented for ${raw.title.toLowerCase()} under our ${raw.category.toLowerCase()} framework. Enforced via documented policies, technical guardrails, and continuous compliance monitoring.`;
  const defaultJustificationEx = bespoke?.ex || `Control ${raw.code} (${raw.title}) is excluded from scope as the associated system operations do not exist in our operational environment.`;

  return {
    id,
    code: raw.code,
    title: raw.title,
    category: raw.category,
    description,
    requirement,
    defaultJustificationIn,
    defaultJustificationEx
  };
});

// 2. PCI DSS v4.0 Core Requirement Dataset
const PCI_CONTROLS: GapControl[] = [
  {
    id: "pci-gap-r1",
    code: "Req 1.2",
    title: "Network Security Controls (Firewalls)",
    category: "Build & Maintain Secure Network",
    description: "Establish and implement network security controls to restrict traffic flow between trusted and untrusted environments.",
    requirement: "Active, managed firewall/router configurations to segregate the Cardholder Data Environment (CDE) from guest or corporate networks.",
    defaultJustificationIn: "CDE is completely isolated inside a private Cloud VPC with all administrative ports restricted strictly via local VPN.",
    defaultJustificationEx: "Not excludable for any business processing credit cards."
  },
  {
    id: "pci-gap-r2",
    code: "Req 2.2",
    title: "System Hardening Configurations",
    category: "Build & Maintain Secure Network",
    description: "Apply secure configurations to all system components to ensure default configurations (like vendor passwords) are disabled.",
    requirement: "System hardening templates, disabling unnecessary services, and changing all vendor-supplied default passwords before deployment.",
    defaultJustificationIn: "All servers are built from gold hardened infrastructure-as-code images (Terraform) with default ports and passwords removed.",
    defaultJustificationEx: "Mandatory system integrity measure across all cloud hosts."
  },
  {
    id: "pci-gap-r3",
    code: "Req 3.2",
    title: "Protection of Stored Account Data",
    category: "Protect Cardholder Data",
    description: "Protect stored account data (Primary Account Number - PAN) with strong cryptography or truncation.",
    requirement: "Strong disk and column-level encryption (AES-256), strict key-management hierarchies, and truncation of non-essential digits.",
    defaultJustificationIn: "Credit card strings are truncated to the first 6 and last 4 digits instantly upon processing. Raw data is encrypted via AWS KMS.",
    defaultJustificationEx: "Our SaaS utilizes Stripe Elements checkout integration; we never store, process, or transmit raw cardholder numbers."
  },
  {
    id: "pci-gap-r4",
    code: "Req 4.2",
    title: "Protect Data During Transmission",
    category: "Protect Cardholder Data",
    description: "Protect cardholder data with strong cryptography during transmission across open, public networks.",
    requirement: "Enforced HTTPS tunnels utilizing TLS 1.2/1.3, disabling old SSL and RC4 ciphers, and validation of certificate authorities.",
    defaultJustificationIn: "All outbound API nodes strictly drop TLS 1.1 or lower. High-grade TLS 1.3 is configured at the Cloudflare gateway.",
    defaultJustificationEx: "Mandatory endpoint encryption. Cannot be excluded."
  },
  {
    id: "pci-gap-r5",
    code: "Req 5.2",
    title: "Malware Prevention & Active Antivirus",
    category: "Vulnerability Management Program",
    description: "Protect all systems and networks from malicious software and keep anti-malware tools actively updated.",
    requirement: "Antivirus software running on all endpoints and servers, configured to log to a central console and perform automatic daily definition updates.",
    defaultJustificationIn: "Corporate workstations run CrowdStrike Falcon EDR, and cloud server containers are continuously scanned for threats.",
    defaultJustificationEx: "Not applicable. We operate entirely serverless containers (AWS Fargate) which are stateless and immutable; logs verify no persistent local disk storage."
  },
  {
    id: "pci-gap-r6",
    code: "Req 6.2",
    title: "Secure Software Development (SDLC)",
    category: "Vulnerability Management Program",
    description: "Develop and maintain secure systems and software by integrating OWASP standards and patch management cycles.",
    requirement: "Weekly vulnerability scans, static application security testing (SAST), and applying Critical patches within 30 days of release.",
    defaultJustificationIn: "All staging branches automatically trigger security scanning pipelines. Security patches are applied weekly via automated scripts.",
    defaultJustificationEx: "Mandatory for all software engineering teams interacting with the product core."
  },
  {
    id: "pci-gap-r7",
    code: "Req 7.2",
    title: "Access Restriction (Need-to-Know)",
    category: "Strong Access Control Measures",
    description: "Restrict access to system components and cardholder data by business need-to-know (least privilege).",
    requirement: "A documented Role-Based Access Control (RBAC) matrix defining administrative groups with formal manager approvals.",
    defaultJustificationIn: "Employee access permissions are audited quarterly and locked down strictly via AWS IAM Groups. Access requires ticketed approval.",
    defaultJustificationEx: "Critical access constraint required by PCI DSS."
  },
  {
    id: "pci-gap-r8",
    code: "Req 8.3",
    title: "Multi-Factor Authentication (MFA)",
    category: "Strong Access Control Measures",
    description: "Secure all administrative access and remote access to system components with Multi-Factor Authentication (MFA).",
    requirement: "Mandatory MFA (using hardware keys or app-based OTP) for all administrative and remote console logins.",
    defaultJustificationIn: "All logins to AWS Console, GitHub, and corporate workstations require hardware YubiKeys or Authenticator app codes.",
    defaultJustificationEx: "Mandatory. MFA is non-negotiable for remote enterprise networks."
  },
  {
    id: "pci-gap-r9",
    code: "Req 9.2",
    title: "Physical Access Controls",
    category: "Strong Access Control Measures",
    description: "Restrict physical access to cardholder data and system components.",
    requirement: "Badge logs, locks, security cameras, and physically secured servers to safeguard terminals or network cables.",
    defaultJustificationIn: "All client databases and processing engines are hosted in multi-tenant secure Google Cloud data centers with active SOC 2 audits.",
    defaultJustificationEx: "We do not host or operate any physical office terminals, databases, or local network servers. All assets are Cloud-native."
  },
  {
    id: "pci-gap-r10",
    code: "Req 10.2",
    title: "Audit Logging and SIEM Monitoring",
    category: "Regularly Monitor & Test Networks",
    description: "Retain audit logs for at least one year and monitor administrative log-tampering actively.",
    requirement: "Centralized logging server (SIEM) capturing administrative actions, invalid login attempts, and firewall events.",
    defaultJustificationIn: "System events are continuously ingested into our InfoShield SIEM operations center. Raw syslog files are archived on read-only cloud buckets.",
    defaultJustificationEx: "Mandatory logging. Audit trails are critical for post-incident threat forensics."
  },
  {
    id: "pci-gap-r11",
    code: "Req 11.3",
    title: "Vulnerability & Penetration Testing",
    category: "Regularly Monitor & Test Networks",
    description: "Perform quarterly external vulnerability scans via an Approved Scanning Vendor (ASV) and annual penetration testing.",
    requirement: "Documented clean reports from ASV scans and certified external pentest agencies.",
    defaultJustificationIn: "Vulnerability scanning is run monthly via automated schedules. An external penetration test is conducted annually every June.",
    defaultJustificationEx: "Critical testing measure required to validate defensive posture."
  },
  {
    id: "pci-gap-r12",
    code: "Req 12.3",
    title: "Corporate Security Charter & Risk Assessment",
    category: "Information Security Policy",
    description: "Maintain a program that addresses information security for all personnel, including annual risk assessments.",
    requirement: "A formally signed master security charter, an active third-party vendor compliance registry, and formal annual risk registers.",
    defaultJustificationIn: "Managed by the CISO, reviewed and signed off by the Executive Board of Directors on a recurring 12-month schedule.",
    defaultJustificationEx: "Mandatory overall administrative control for PCI DSS compliance."
  }
];

export default function GapAssessment({
  theme = "dark",
  activeRole,
  triggerBannerAlert,
  currentBusiness
}: GapAssessmentProps) {
  const isLight = theme === "light";
  const c_card = isLight
    ? "bg-white border border-slate-200 shadow-sm text-slate-950"
    : "bg-slate-900 border border-slate-850 text-slate-50 shadow-[0_4px_20px_rgba(0,0,0,0.3)]";

  // State Management
  const [activeFramework, setActiveFramework] = useState<"iso27001" | "pcidss">("iso27001");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  
  // Selected Control for assessment detail
  const [selectedControlId, setSelectedControlId] = useState<string>("iso-gap-a5.1");

  // Gap Assessment State Map
  const [isoAssessments, setIsoAssessments] = useState<Record<string, AssessmentState>>({});
  const [pciAssessments, setPciAssessments] = useState<Record<string, AssessmentState>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<"assessment" | "soa" | "action">("assessment");

  // Certificate / Export Modal
  const [showExportModal, setShowExportModal] = useState(false);

  // Initialize Default States
  useEffect(() => {
    // 1. Initial Local Cache Load
    try {
      const cachedIso = localStorage.getItem("gap_assessment_iso");
      const cachedPci = localStorage.getItem("gap_assessment_pci");
      if (cachedIso) setIsoAssessments(JSON.parse(cachedIso));
      if (cachedPci) setPciAssessments(JSON.parse(cachedPci));
    } catch (e) {
      console.error("Local gap assessment cache load failed:", e);
    }

    // 2. Realtime Firebase sync
    const unsubscribe = syncDocument<any>(
      "compliance",
      "gap_assessment",
      (data) => {
        if (data) {
          if (data.isoAssessments) {
            setIsoAssessments(data.isoAssessments);
            localStorage.setItem("gap_assessment_iso", JSON.stringify(data.isoAssessments));
          }
          if (data.pciAssessments) {
            setPciAssessments(data.pciAssessments);
            localStorage.setItem("gap_assessment_pci", JSON.stringify(data.pciAssessments));
          }
        }
      },
      {
        isoAssessments: {},
        pciAssessments: {}
      }
    );

    return () => unsubscribe();
  }, []);

  // Update selected control ID when changing frameworks
  useEffect(() => {
    if (activeFramework === "iso27001") {
      setSelectedControlId("iso-gap-a5.1");
    } else {
      setSelectedControlId("pci-gap-r1");
    }
    setActiveDetailTab("assessment");
  }, [activeFramework]);

  // Current controls depending on active framework
  const activeControlsList = activeFramework === "iso27001" ? ISO_CONTROLS : PCI_CONTROLS;
  const currentAssessments = activeFramework === "iso27001" ? isoAssessments : pciAssessments;

  // Retrieve current assessment state for a control id or return default template
  const getAssessmentState = (id: string, ctrl: GapControl): AssessmentState => {
    if (currentAssessments[id]) {
      const saved = currentAssessments[id];
      // Auto-migrate old generic boilerplate text to control-specific justifications
      const isGenericBoilerplate =
        !saved.justification ||
        saved.justification.includes("is excluded from organizational scope") ||
        saved.justification.includes("is excluded from internal physical scope") ||
        saved.justification.includes("is excluded for external contractor scope") ||
        saved.justification.includes("is excluded from direct system scope") ||
        saved.justification.includes("This control is not applicable") ||
        saved.justification.includes("Managed under compensating cloud-native controls") ||
        saved.justification.includes("Fully implemented. Managed by our internal security operations team") ||
        saved.justification.includes("is not applicable to our operational scope") ||
        (saved.justification.startsWith("Control A.") && saved.justification.includes("is excluded"));

      if (isGenericBoilerplate) {
        return {
          ...saved,
          justification: saved.applicable ? ctrl.defaultJustificationIn : ctrl.defaultJustificationEx
        };
      }
      return saved;
    }
    // Pre-filled defaults
    return {
      status: "unassessed",
      priority: "medium",
      applicable: true,
      justification: ctrl.defaultJustificationIn,
      notes: ""
    };
  };

  // Handle single control modification
  const updateControlState = async (id: string, field: keyof AssessmentState, value: any) => {
    const ctrl = activeControlsList.find(c => c.id === id);
    if (!ctrl) return;

    const currentState = getAssessmentState(id, ctrl);
    const updatedState = { ...currentState, [field]: value };

    // If setting applicable to false, pre-fill exclusion justification automatically
    if (field === "applicable" && value === false) {
      updatedState.justification = ctrl.defaultJustificationEx;
      updatedState.status = "na";
    } else if (field === "applicable" && value === true) {
      updatedState.justification = ctrl.defaultJustificationIn;
      updatedState.status = "unassessed";
    }

    const updatedMap = {
      ...currentAssessments,
      [id]: updatedState
    };

    setIsSaving(true);
    if (activeFramework === "iso27001") {
      setIsoAssessments(updatedMap);
      localStorage.setItem("gap_assessment_iso", JSON.stringify(updatedMap));
      await saveDocument("compliance", "gap_assessment", {
        isoAssessments: updatedMap,
        pciAssessments
      });
    } else {
      setPciAssessments(updatedMap);
      localStorage.setItem("gap_assessment_pci", JSON.stringify(updatedMap));
      await saveDocument("compliance", "gap_assessment", {
        isoAssessments,
        pciAssessments: updatedMap
      });
    }
    setTimeout(() => setIsSaving(false), 300);
  };

  // Reset entire gap assessment helper
  const handleResetAssessment = async () => {
    if (!window.confirm("Are you sure you want to reset all progress for the active assessment standard? This will clear custom notes and statuses.")) return;
    
    setIsSaving(true);
    if (activeFramework === "iso27001") {
      setIsoAssessments({});
      localStorage.removeItem("gap_assessment_iso");
      await saveDocument("compliance", "gap_assessment", {
        isoAssessments: {},
        pciAssessments
      });
    } else {
      setPciAssessments({});
      localStorage.removeItem("gap_assessment_pci");
      await saveDocument("compliance", "gap_assessment", {
        isoAssessments,
        pciAssessments: {}
      });
    }
    triggerBannerAlert("Gap assessment states have been reset successfully.");
    setIsSaving(false);
  };

  // Pre-fill industry answers for all unassessed controls (Auditor Mode Quick-fill)
  const handleBulkMockFill = async () => {
    setIsSaving(true);
    const updatedMap = { ...currentAssessments };
    const statuses: Array<"compliant" | "partial" | "gap"> = ["compliant", "partial", "gap"];
    
    activeControlsList.forEach((ctrl) => {
      if (!updatedMap[ctrl.id] || updatedMap[ctrl.id].status === "unassessed") {
        // Randomly assign a realistic distribution: 50% compliant, 30% partial, 20% gap
        const rand = Math.random();
        const finalStatus = rand < 0.5 ? "compliant" : rand < 0.8 ? "partial" : "gap";
        const priorities: Array<"critical" | "high" | "medium" | "low"> = ["critical", "high", "medium", "low"];
        const finalPriority = priorities[Math.floor(Math.random() * priorities.length)];

        updatedMap[ctrl.id] = {
          status: finalStatus,
          priority: finalPriority,
          applicable: ctrl.id !== "iso-gap-a7.1" && ctrl.id !== "iso-gap-a8.28" && ctrl.id !== "pci-gap-r9" ? true : false,
          justification: ctrl.id !== "iso-gap-a7.1" && ctrl.id !== "iso-gap-a8.28" && ctrl.id !== "pci-gap-r9" ? ctrl.defaultJustificationIn : ctrl.defaultJustificationEx,
          notes: finalStatus === "gap" 
            ? "Pending draft policy framework. Need team review on compliance roadmap implementation."
            : finalStatus === "partial" 
            ? "Draft document exists but requires validation, testing records, and formal leadership approval signatures."
            : "No actions needed. Standard processes verified by historical operational evidence."
        };
      }
    });

    if (activeFramework === "iso27001") {
      setIsoAssessments(updatedMap);
      localStorage.setItem("gap_assessment_iso", JSON.stringify(updatedMap));
      await saveDocument("compliance", "gap_assessment", {
        isoAssessments: updatedMap,
        pciAssessments
      });
    } else {
      setPciAssessments(updatedMap);
      localStorage.setItem("gap_assessment_pci", JSON.stringify(updatedMap));
      await saveDocument("compliance", "gap_assessment", {
        isoAssessments,
        pciAssessments: updatedMap
      });
    }
    triggerBannerAlert(`Successfully generated compliance estimates and gaps across all ${activeControlsList.length} controls.`);
    setIsSaving(false);
  };

  // Calculations for Metrics
  const totalCount = activeControlsList.length;
  let unassessedCount = 0;
  let compliantCount = 0;
  let partialCount = 0;
  let gapCount = 0;
  let naCount = 0;
  let criticalCount = 0;
  let highCount = 0;

  activeControlsList.forEach((c) => {
    const state = getAssessmentState(c.id, c);
    if (!state.applicable) {
      naCount++;
    } else {
      if (state.status === "unassessed") unassessedCount++;
      else if (state.status === "compliant") compliantCount++;
      else if (state.status === "partial") partialCount++;
      else if (state.status === "gap") gapCount++;
      else if (state.status === "na") naCount++;

      if (state.status === "gap" || state.status === "partial") {
        if (state.priority === "critical") criticalCount++;
        else if (state.priority === "high") highCount++;
      }
    }
  });

  const assessedCount = totalCount - unassessedCount;
  const applicableCount = totalCount - naCount;
  
  // Custom readiness scorecard formula
  // Compliant = 100%, Partial = 50%, Gap = 0%
  const scoreBase = (compliantCount * 100) + (partialCount * 50);
  const readinessScore = applicableCount > 0 ? Math.round(scoreBase / applicableCount) : 0;

  // Filtered List based on Search & Status Filters
  const filteredControls = activeControlsList.filter((ctrl) => {
    const state = getAssessmentState(ctrl.id, ctrl);
    
    // Search match
    const matchesSearch =
      ctrl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ctrl.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ctrl.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter match
    let matchesStatus = true;
    if (statusFilter === "unassessed") matchesStatus = state.status === "unassessed";
    else if (statusFilter === "compliant") matchesStatus = state.status === "compliant";
    else if (statusFilter === "partial") matchesStatus = state.status === "partial";
    else if (statusFilter === "gap") matchesStatus = state.status === "gap";
    else if (statusFilter === "na") matchesStatus = !state.applicable;

    // Priority filter match
    let matchesPriority = true;
    if (priorityFilter !== "all") {
      matchesPriority = state.priority === priorityFilter;
    }

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Currently viewing control details
  const currentControl = activeControlsList.find((c) => c.id === selectedControlId) || activeControlsList[0];
  const currentControlState = getAssessmentState(currentControl.id, currentControl);

  // Auto-generate some advice summary
  const getReadinessVibe = () => {
    if (unassessedCount === totalCount) return { text: "Assessment Not Started", color: "text-slate-400 bg-slate-500/10" };
    if (readinessScore > 85) return { text: "Highly Prepared", color: "text-emerald-400 bg-emerald-500/10" };
    if (readinessScore > 50) return { text: "Staged & Implementing", color: "text-amber-400 bg-amber-500/10" };
    return { text: "Action Required / Heavy Gaps", color: "text-red-400 bg-red-500/10" };
  };

  const businessName = currentBusiness?.name || "Enterprise Portal";

  return (
    <div className="space-y-6">
      {/* 1. HEADER SECTION */}
      <div className={`p-6 rounded-2xl border ${c_card} flex flex-col md:flex-row md:items-center justify-between gap-6`}>
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="bg-cyan-500/15 text-cyan-400 text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-1 rounded-full border border-cyan-500/20">
              Governance, Risk & Compliance (GRC)
            </span>
            {isSaving && (
              <span className="text-[10px] text-cyan-400 font-mono animate-pulse flex items-center gap-1">
                <Clock className="h-3 w-3 animate-spin" /> Saving changes...
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold font-sans tracking-tight">
            Pre-Certification Gap Assessment & SoA
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600" : "text-slate-400"} leading-relaxed`}>
            Evaluate your organization's core controls, conduct physical and logical **Statements of Applicability (SoA)**, and map key technical compliance gaps for **ISO 27001:2022** and **PCI DSS v4.0** before initiating the certification audit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-center">
          <button
            onClick={handleBulkMockFill}
            className={`px-3.5 py-2 text-xs font-mono font-bold uppercase border rounded-lg cursor-pointer flex items-center gap-1.5 transition ${
              isLight 
                ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700" 
                : "bg-slate-950/40 hover:bg-slate-950 border-slate-800 text-slate-300"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
            Quick-Fill Estimate
          </button>
          <button
            onClick={handleResetAssessment}
            className={`px-3.5 py-2 text-xs font-mono font-bold uppercase border rounded-lg cursor-pointer flex items-center gap-1.5 transition ${
              isLight 
                ? "bg-white hover:bg-red-50 border-slate-300 text-red-600" 
                : "bg-slate-900 hover:bg-red-950/20 border-slate-800 text-red-400"
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Standard
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 text-xs font-mono font-bold uppercase bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            Export SoA Report
          </button>
        </div>
      </div>

      {/* 2. FRAMEWORK CHOOSE & METRICS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Framework toggle and Overview */}
        <div className={`xl:col-span-4 p-5 rounded-xl border ${c_card} flex flex-col justify-between space-y-5`}>
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
              1. Select Standard Framework
            </h2>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/60 rounded-lg border border-slate-850/50">
              <button
                onClick={() => setActiveFramework("iso27001")}
                className={`py-2 text-xs font-mono font-bold rounded-md transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  activeFramework === "iso27001"
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>ISO 27001:2022</span>
                <span className="text-[9px] opacity-80">Annex A Controls</span>
              </button>
              <button
                onClick={() => setActiveFramework("pcidss")}
                className={`py-2 text-xs font-mono font-bold rounded-md transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  activeFramework === "pcidss"
                    ? "bg-purple-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>PCI DSS v4.0</span>
                <span className="text-[9px] opacity-80">Req 1 to 12</span>
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800/20">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                Readiness Scorecard
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  {readinessScore}%
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getReadinessVibe().color}`}>
                  {getReadinessVibe().text}
                </span>
              </div>
            </div>

            {/* Micro Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-400">Assessment Progress</span>
                <span className="font-bold text-slate-200">
                  {assessedCount}/{totalCount} ({Math.round((assessedCount / totalCount) * 100 || 0)}%)
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-500"
                  style={{ width: `${(assessedCount / totalCount) * 100 || 0}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-850/50 flex flex-col">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Applicable Controls</span>
                <span className="text-sm font-bold font-mono mt-0.5 text-slate-200">{applicableCount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-850/50 flex flex-col">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Excluded (N/A)</span>
                <span className="text-sm font-bold font-mono mt-0.5 text-slate-200">{naCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Metric Cards (8 columns) */}
        <div className="xl:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border ${c_card} flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-mono text-slate-400">Compliant</span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold font-mono">{compliantCount}</p>
              <p className="text-[10px] font-mono text-slate-400 mt-1">Controls verified 100%</p>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${c_card} flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <Sliders className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-mono text-slate-400">Partial</span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold font-mono">{partialCount}</p>
              <p className="text-[10px] font-mono text-slate-400 mt-1">Policies drafted, no logs</p>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${c_card} flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
              <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              </span>
              <span className="text-[10px] font-mono text-slate-400">Gaps Active</span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold font-mono text-red-400">{gapCount}</p>
              <p className="text-[10px] font-mono text-slate-400 mt-1">High-risk unconfigured</p>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${c_card} flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
              <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
                <Award className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-mono text-slate-400">Hot Remediation</span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold font-mono text-red-400">
                {criticalCount + highCount}
              </p>
              <p className="text-[10px] font-mono text-slate-400 mt-1">Critical/High Gaps</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DUAL COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column Explorer (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`p-4 rounded-xl border ${c_card} space-y-3.5`}>
            {/* Filter and search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search standard controls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-850/50 rounded-lg text-xs font-sans text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase">Filter Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-1.5 bg-slate-950/60 border border-slate-850/50 rounded-md text-[11px] font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="all">🔍 Show All Statuses</option>
                  <option value="unassessed">⚪ Unassessed</option>
                  <option value="compliant">🟢 Compliant</option>
                  <option value="partial">🟡 Partial</option>
                  <option value="gap">🔴 Gaps Identified</option>
                  <option value="na">⚪ Excluded (N/A)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase">Filter Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="p-1.5 bg-slate-950/60 border border-slate-850/50 rounded-md text-[11px] font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="all">⚡ All Priorities</option>
                  <option value="critical">🚨 Critical</option>
                  <option value="high">🟠 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* List of filtered controls */}
          <div className="max-h-[550px] overflow-y-auto pr-1 space-y-2">
            {filteredControls.length === 0 ? (
              <div className={`p-8 text-center rounded-xl border ${c_card}`}>
                <Filter className="h-8 w-8 text-slate-600 mx-auto mb-2 animate-bounce" />
                <p className="text-xs font-mono text-slate-400">No matching controls found</p>
                <p className="text-[10px] text-slate-500 mt-1">Adjust search tags or dropdown filters</p>
              </div>
            ) : (
              filteredControls.map((ctrl) => {
                const state = getAssessmentState(ctrl.id, ctrl);
                const isSelected = ctrl.id === selectedControlId;

                // Color codes
                let statusDotColor = "bg-slate-500";
                let statusBg = "bg-slate-500/10 text-slate-400 border-slate-500/20";
                let statusLabel = "Unassessed";
                
                if (!state.applicable) {
                  statusDotColor = "bg-slate-700";
                  statusBg = "bg-slate-950 text-slate-500 border-slate-900";
                  statusLabel = "Excluded (SoA)";
                } else if (state.status === "compliant") {
                  statusDotColor = "bg-emerald-500";
                  statusBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                  statusLabel = "Compliant";
                } else if (state.status === "partial") {
                  statusDotColor = "bg-amber-500";
                  statusBg = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                  statusLabel = "Partial";
                } else if (state.status === "gap") {
                  statusDotColor = "bg-red-500";
                  statusBg = "bg-red-500/10 text-red-400 border-red-500/20";
                  statusLabel = "Gap (Missing)";
                }

                // Priority flag
                let priorityTag = "";
                if (state.priority === "critical") priorityTag = "🚨 CRITICAL";
                else if (state.priority === "high") priorityTag = "🟠 HIGH";

                return (
                  <button
                    key={ctrl.id}
                    onClick={() => setSelectedControlId(ctrl.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? activeFramework === "iso27001"
                          ? isLight
                            ? "border-cyan-500 bg-cyan-50/70"
                            : "border-cyan-500 bg-cyan-950/15"
                          : isLight
                          ? "border-purple-500 bg-purple-50/70"
                          : "border-purple-500 bg-purple-950/15"
                        : isLight
                        ? "bg-white hover:bg-slate-50 border-slate-200"
                        : "bg-slate-900 hover:bg-slate-950 border-slate-850"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${
                          isLight
                            ? "text-cyan-700 bg-cyan-50 border-cyan-100"
                            : "text-cyan-400 bg-cyan-500/10 border-cyan-500/15"
                        }`}>
                          {ctrl.code}
                        </span>
                        <span className={`text-[9px] font-mono font-bold uppercase ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                          {ctrl.category}
                        </span>
                      </div>
                      <p className={`text-xs font-bold font-sans tracking-tight line-clamp-1 ${
                        isLight ? "text-slate-900" : "text-slate-200"
                      }`}>
                        {ctrl.title}
                      </p>
                      <p className={`text-[10.5px] line-clamp-1 ${
                        isLight ? "text-slate-500" : "text-slate-400"
                      }`}>
                        {ctrl.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${statusBg}`}>
                        {statusLabel}
                      </span>
                      {priorityTag && (
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isLight 
                            ? "text-red-700 bg-red-50 border border-red-100" 
                            : "text-red-400 bg-red-950/10"
                        }`}>
                          {priorityTag}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column Assessment Details (7 Columns) */}
        <div className="lg:col-span-7">
          <div className={`p-5 rounded-xl border ${c_card} space-y-5 h-full`}>
            
            {/* Control Identifier */}
            <div className={`pb-4 border-b flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${isLight ? "border-slate-200" : "border-slate-800/20"}`}>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded border border-cyan-500/15">
                    {currentControl.code}
                  </span>
                  <span className={`text-xs font-mono ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    {currentControl.category}
                  </span>
                </div>
                <h3 className={`text-base font-bold font-sans tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                  {currentControl.title}
                </h3>
                <p className={`text-xs leading-relaxed italic ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  "{currentControl.description}"
                </p>
              </div>

              {/* Applicability Quick Badge */}
              <div className="shrink-0">
                <span className={`text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full border ${
                  currentControlState.applicable
                    ? isLight
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : isLight
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}>
                  {currentControlState.applicable ? "In Scope (Applicable)" : "Excluded (N/A)"}
                </span>
              </div>
            </div>

            {/* Standard Requirement and Advice Block */}
            <div className={`p-3.5 rounded-lg border space-y-2 ${
              isLight 
                ? "bg-slate-50 border-slate-200" 
                : "bg-slate-950/40 border-slate-850/50"
            }`}>
              <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${isLight ? "text-slate-800" : "text-slate-300"}`}>
                <BookOpen className={`h-4 w-4 ${isLight ? "text-cyan-600" : "text-cyan-400"}`} />
                <span>Certification Assessment Requirement:</span>
              </div>
              <p className={`text-xs leading-relaxed font-sans ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                {currentControl.requirement}
              </p>
            </div>

            {/* Workspace detail tabs */}
            <div className={`flex border-b pb-0.5 gap-2 ${isLight ? "border-slate-200" : "border-slate-850/40"}`}>
              <button
                onClick={() => setActiveDetailTab("assessment")}
                className={`pb-2 text-xs font-mono font-bold tracking-wider uppercase transition cursor-pointer ${
                  activeDetailTab === "assessment"
                    ? `border-b-2 border-cyan-500 ${isLight ? "text-cyan-600" : "text-cyan-400"}`
                    : isLight
                    ? "text-slate-500 hover:text-slate-800"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                📊 1. Gap Analysis
              </button>
              <button
                onClick={() => setActiveDetailTab("soa")}
                className={`pb-2 text-xs font-mono font-bold tracking-wider uppercase transition cursor-pointer ${
                  activeDetailTab === "soa"
                    ? `border-b-2 border-cyan-500 ${isLight ? "text-cyan-600" : "text-cyan-400"}`
                    : isLight
                    ? "text-slate-500 hover:text-slate-800"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                📄 2. {activeFramework === "iso27001" ? "Statement of Applicability (SoA)" : "Scoping Assessment"}
              </button>
              <button
                onClick={() => setActiveDetailTab("action")}
                className={`pb-2 text-xs font-mono font-bold tracking-wider uppercase transition cursor-pointer ${
                  activeDetailTab === "action"
                    ? `border-b-2 border-cyan-500 ${isLight ? "text-cyan-600" : "text-cyan-400"}`
                    : isLight
                    ? "text-slate-500 hover:text-slate-800"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                📝 3. Action Plan & Notes
              </button>
            </div>

            {/* Tab contents */}
            <div className="space-y-4">
              {activeDetailTab === "assessment" && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <h4 className={`text-[10px] font-mono font-bold uppercase tracking-wider mb-2 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      Define Current Implementation Status:
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Compliant */}
                      <button
                        onClick={() => {
                          if (!currentControlState.applicable) return;
                          updateControlState(currentControl.id, "status", "compliant");
                        }}
                        disabled={!currentControlState.applicable}
                        className={`p-3.5 text-left rounded-xl border transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                          !currentControlState.applicable
                            ? "opacity-50 cursor-not-allowed"
                            : currentControlState.status === "compliant"
                            ? isLight
                              ? "border-emerald-500 bg-emerald-50/70"
                              : "border-emerald-500 bg-emerald-950/15"
                            : isLight
                            ? "border-slate-200 bg-white hover:bg-slate-50"
                            : "border-slate-850 bg-slate-950/40 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-xs font-bold ${
                            currentControlState.status === "compliant"
                              ? isLight ? "text-emerald-700" : "text-slate-200"
                              : isLight ? "text-slate-800" : "text-slate-200"
                          }`}>🟢 Compliant (100%)</span>
                          {currentControlState.status === "compliant" && <CheckSquare className={`h-4 w-4 ${isLight ? "text-emerald-600" : "text-emerald-400"}`} />}
                        </div>
                        <span className={`text-[10px] leading-normal font-sans ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                          Fully designed, documented, active, and regularly audited/monitored.
                        </span>
                      </button>

                      {/* Partial */}
                      <button
                        onClick={() => {
                          if (!currentControlState.applicable) return;
                          updateControlState(currentControl.id, "status", "partial");
                        }}
                        disabled={!currentControlState.applicable}
                        className={`p-3.5 text-left rounded-xl border transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                          !currentControlState.applicable
                            ? "opacity-50 cursor-not-allowed"
                            : currentControlState.status === "partial"
                            ? isLight
                              ? "border-amber-500 bg-amber-50/70"
                              : "border-amber-500 bg-amber-950/15"
                            : isLight
                            ? "border-slate-200 bg-white hover:bg-slate-50"
                            : "border-slate-850 bg-slate-950/40 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-xs font-bold ${
                            currentControlState.status === "partial"
                              ? isLight ? "text-amber-700" : "text-slate-200"
                              : isLight ? "text-slate-800" : "text-slate-200"
                          }`}>🟡 Partial Compliance</span>
                          {currentControlState.status === "partial" && <CheckSquare className={`h-4 w-4 ${isLight ? "text-amber-600" : "text-amber-400"}`} />}
                        </div>
                        <span className={`text-[10px] leading-normal font-sans ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                          Processes or software in use, but lack formal written policy/evidence templates.
                        </span>
                      </button>

                      {/* Gap */}
                      <button
                        onClick={() => {
                          if (!currentControlState.applicable) return;
                          updateControlState(currentControl.id, "status", "gap");
                        }}
                        disabled={!currentControlState.applicable}
                        className={`p-3.5 text-left rounded-xl border transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                          !currentControlState.applicable
                            ? "opacity-50 cursor-not-allowed"
                            : currentControlState.status === "gap"
                            ? isLight
                              ? "border-red-500 bg-red-50/70"
                              : "border-red-500 bg-red-950/15"
                            : isLight
                            ? "border-slate-200 bg-white hover:bg-slate-50"
                            : "border-slate-850 bg-slate-950/40 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-xs font-bold ${
                            currentControlState.status === "gap"
                              ? isLight ? "text-red-700" : "text-red-400"
                              : isLight ? "text-slate-800" : "text-slate-200"
                          }`}>🔴 Gap Identified</span>
                          {currentControlState.status === "gap" && <CheckSquare className={`h-4 w-4 ${isLight ? "text-red-600" : "text-red-400"}`} />}
                        </div>
                        <span className={`text-[10px] leading-normal font-sans ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                          Controls are entirely missing or not systematically practiced. High audit risk.
                        </span>
                      </button>

                      {/* Unassessed / NA */}
                      <button
                        disabled={true}
                        className={`p-3.5 text-left rounded-xl border border-dashed cursor-not-allowed flex flex-col justify-between gap-1.5 ${
                          isLight
                            ? "border-slate-200 bg-slate-50"
                            : "border-slate-850 bg-slate-950/10"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-xs font-bold ${isLight ? "text-slate-400" : "text-slate-500"}`}>⚪ Unassessed / Excluded</span>
                        </div>
                        <span className={`text-[10px] leading-normal font-sans ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                          Change scope in the 'Statement of Applicability' tab to modify exclusion statuses.
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className={`text-[10px] font-mono font-bold uppercase tracking-wider mb-2 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      Implementation Priority for Gaps:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(["critical", "high", "medium", "low"] as const).map((pri) => {
                        const isSel = currentControlState.priority === pri;
                        let btnStyle = isLight 
                          ? "bg-white text-slate-500 border-slate-200 hover:bg-slate-50" 
                          : "bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-900";
                        if (isSel) {
                          if (pri === "critical") {
                            btnStyle = isLight
                              ? "bg-red-50 text-red-700 border-red-200 font-bold"
                              : "bg-red-500/10 text-red-400 border-red-500/30 font-bold";
                          } else if (pri === "high") {
                            btnStyle = isLight
                              ? "bg-amber-50 text-amber-700 border-amber-200 font-bold"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold";
                          } else if (pri === "medium") {
                            btnStyle = isLight
                              ? "bg-cyan-50 text-cyan-700 border-cyan-200 font-bold"
                              : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-bold";
                          } else {
                            btnStyle = isLight
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold";
                          }
                        }

                        return (
                          <button
                            key={pri}
                            onClick={() => updateControlState(currentControl.id, "priority", pri)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-mono uppercase tracking-wider transition cursor-pointer ${btnStyle}`}
                          >
                            {pri}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeDetailTab === "soa" && (
                <div className="space-y-4 animate-fade-in">
                  <div className={`p-3.5 rounded-lg space-y-1 border ${
                    isLight 
                      ? "bg-cyan-50/50 border-cyan-100" 
                      : "bg-cyan-500/5 border-cyan-500/10"
                  }`}>
                    <p className={`text-xs font-bold flex items-center gap-1 ${isLight ? "text-cyan-700" : "text-cyan-400"}`}>
                      <HelpCircle className="h-4 w-4" />
                      About Statement of Applicability (SoA)
                    </p>
                    <p className={`text-[10.5px] leading-normal font-sans ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                      {activeFramework === "iso27001"
                        ? "ISO 27001 requires compiling a board-approved SoA documenting exactly which controls are active in your business model. You must declare clear, customized justifications for why a control is included or excluded."
                        : "PCI DSS mandates precise scope definitions. In cloud-native operations, physical security controls (Req 9) are outsourced to your cloud host and may be declared out of direct scope with a formal justification."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono uppercase ${isLight ? "text-slate-700" : "text-slate-300"}`}>Is this control in scope?</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateControlState(currentControl.id, "applicable", true)}
                          className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg cursor-pointer transition ${
                            currentControlState.applicable
                              ? isLight
                                ? "bg-emerald-600 text-white"
                                : "bg-emerald-500 text-slate-950"
                              : isLight
                              ? "bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800"
                              : "bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          IN SCOPE
                        </button>
                        <button
                          onClick={() => updateControlState(currentControl.id, "applicable", false)}
                          className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg cursor-pointer transition ${
                            !currentControlState.applicable
                              ? "bg-red-500 text-white"
                              : isLight
                              ? "bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800"
                              : "bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          EXCLUDED
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <label className={`text-[10px] font-mono uppercase ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                          Statement of Applicability Justification:
                        </label>
                        <button
                          onClick={() => {
                            const template = currentControlState.applicable
                              ? currentControl.defaultJustificationIn
                              : currentControl.defaultJustificationEx;
                            updateControlState(currentControl.id, "justification", template);
                            triggerBannerAlert("Reverted justification to standard industry template.");
                          }}
                          className={`text-[9px] font-mono hover:underline cursor-pointer ${isLight ? "text-cyan-600" : "text-cyan-400"}`}
                        >
                          ⚡ Use Preset Template
                        </button>
                      </div>
                      <textarea
                        value={currentControlState.justification}
                        onChange={(e) => updateControlState(currentControl.id, "justification", e.target.value)}
                        rows={4}
                        placeholder="Detail exactly how your technical systems, tools, and business operations satisfy or exclude this requirement..."
                        className={`w-full p-3 border rounded-lg text-xs font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                          isLight
                            ? "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
                            : "bg-slate-950/60 border border-slate-850/50 text-slate-200 placeholder-slate-600"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeDetailTab === "action" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[10px] font-mono uppercase ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      Audit Remediation Tasks & Action Notes:
                    </label>
                    <textarea
                      value={currentControlState.notes}
                      onChange={(e) => updateControlState(currentControl.id, "notes", e.target.value)}
                      rows={5}
                      placeholder={`Draft clear, step-by-step remediation tasks. E.g.\n1. Formulate formal Access Control Policy draft.\n2. Obtain executive sponsor signatures.\n3. Configure MDM endpoint rules for local disk encryption.`}
                      className={`w-full p-3 border rounded-lg text-xs font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                        isLight
                          ? "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
                          : "bg-slate-950/60 border border-slate-850/50 text-slate-200 placeholder-slate-600"
                      }`}
                    />
                  </div>

                  <div className={`p-3.5 rounded-lg space-y-1 border ${
                    isLight 
                      ? "bg-amber-50/50 border-amber-100" 
                      : "bg-amber-500/5 border-amber-500/10"
                  }`}>
                    <span className={`text-[10px] font-mono font-bold uppercase ${isLight ? "text-amber-700" : "text-amber-500"}`}>
                      ⚠️ Remediation Recommendation:
                    </span>
                    <p className={`text-[10.5px] leading-relaxed font-sans ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                      {currentControlState.status === "gap" 
                        ? `To close this critical gap for ${currentControl.code}, assign a dedicated staff owner, allocate budget for tools/assessments, and configure central syslog logging to satisfy auditor requirements.`
                        : currentControlState.status === "partial"
                        ? `You have operational tools running but lack formal corporate policies. Combine your technical configuration snapshots with a written policy charter signed by the CISO to pass.`
                        : `No remediation required. The control is fully implemented and active in your directory logs.`}
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* 4. COMPLIANCE ROADMAP WORKSPACE */}
      <div className={`p-6 rounded-2xl border ${c_card} space-y-4`}>
        <div className="flex items-center gap-2">
          <Clock className={`h-5 w-5 ${isLight ? "text-cyan-600" : "text-cyan-400"}`} />
          <h2 className="text-base font-bold font-sans tracking-tight">
            Interactive Certification Roadmap
          </h2>
        </div>
        <p className={`text-xs ${isLight ? "text-slate-600" : "text-slate-400"}`}>
          This interactive journey map outlines the required sequential phases for a brand new business to achieve certified status from a certified external auditor.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
          {[
            { phase: "Phase 1", title: "Gap & Scope", desc: "Identify business boundaries and map technical gaps.", status: "ACTIVE", color: isLight ? "border-cyan-200 text-cyan-600" : "border-cyan-500 text-cyan-400" },
            { phase: "Phase 2", title: "Policy Charter", desc: "Draft and publish master policies with CEO signature.", status: "PENDING", color: isLight ? "border-slate-200 text-slate-400" : "border-slate-800 text-slate-400" },
            { phase: "Phase 3", title: "Tool Deployment", desc: "Enable firewalls, IAM role restrictions, and MDM profiles.", status: "PENDING", color: isLight ? "border-slate-200 text-slate-400" : "border-slate-800 text-slate-400" },
            { phase: "Phase 4", title: "Internal Audit", desc: "Perform mock audits and log Continual Improvements (CAPA).", status: "PENDING", color: isLight ? "border-slate-200 text-slate-400" : "border-slate-800 text-slate-400" },
            { phase: "Phase 5", title: "Certification", desc: "Host registrar auditor, review SoA, and secure certificate.", status: "PENDING", color: isLight ? "border-slate-200 text-slate-400" : "border-slate-800 text-slate-400" }
          ].map((step, idx) => (
            <div key={idx} className={`p-4 rounded-xl border relative flex flex-col justify-between space-y-2 ${
              isLight ? "bg-slate-50" : "bg-slate-950/40"
            } ${step.color}`}>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wide opacity-80">{step.phase}</span>
                <p className={`text-xs font-bold font-sans mt-0.5 ${isLight ? "text-slate-800" : "text-slate-200"}`}>{step.title}</p>
                <p className={`text-[10px] mt-1 leading-normal font-sans ${isLight ? "text-slate-600" : "text-slate-400"}`}>{step.desc}</p>
              </div>
              <div className={`flex items-center justify-between pt-1 border-t ${isLight ? "border-slate-200" : "border-slate-900"}`}>
                <span className="text-[9px] font-mono font-bold">{step.status}</span>
                {step.status === "ACTIVE" && <span className="h-2 w-2 rounded-full bg-cyan-500 animate-ping" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. EXPORT / STATEMENT OF APPLICABILITY CERTIFICATE MODAL */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-3xl p-6 rounded-2xl border shadow-2xl space-y-6 ${
                isLight 
                  ? "bg-white border-slate-200 text-slate-900" 
                  : "bg-slate-900 border-slate-800 text-slate-50"
              }`}
            >
              <div className={`flex justify-between items-start pb-4 border-b ${isLight ? "border-slate-200" : "border-slate-800"}`}>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-sans flex items-center gap-2">
                    <Award className={`h-5 w-5 ${isLight ? "text-cyan-600" : "text-cyan-400"}`} />
                    Statement of Applicability & Gap Assessment Report
                  </h3>
                  <p className={`text-xs font-mono ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    Official Draft Assessment — Issued {new Date().toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className={`text-xs font-mono cursor-pointer px-2 py-1 rounded border ${
                    isLight 
                      ? "text-slate-600 hover:text-slate-800 bg-slate-100 border-slate-200" 
                      : "text-slate-400 hover:text-slate-200 bg-slate-950/40 border-slate-800"
                  }`}
                >
                  ✕ CLOSE
                </button>
              </div>

              {/* Certificate Canvas */}
              <div className={`p-6 rounded-xl border relative overflow-hidden space-y-6 ${
                isLight
                  ? "bg-slate-50 border-slate-200"
                  : "bg-gradient-to-br from-slate-950 to-slate-900 border-slate-800"
              }`}>
                
                {/* Decorative background shields */}
                <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-[0.03] pointer-events-none">
                  <Shield className={`h-96 w-96 ${isLight ? "text-cyan-700" : "text-cyan-500"}`} />
                </div>

                <div className="flex flex-col items-center text-center space-y-2">
                  <h4 className={`text-sm font-mono font-bold tracking-widest uppercase ${isLight ? "text-cyan-600" : "text-cyan-400"}`}>
                    GAP COMPLIANCE ASSESSMENT REPORT
                  </h4>
                  <p className={`text-2xl font-bold font-sans tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                    {businessName}
                  </p>
                  <p className={`text-xs font-sans max-w-md ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                    This document certifies that {businessName} has completed their initial readiness and Statement of Applicability scoping for the **{activeFramework === "iso27001" ? "ISO/IEC 27001:2022 Information Security Management System" : "PCI DSS v4.0 Payment Card Industry Standard"}** framework.
                  </p>
                </div>

                {/* Score and summary parameters */}
                <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg border ${
                  isLight
                    ? "bg-white border-slate-200"
                    : "bg-slate-900/60 border-slate-800/40"
                }`}>
                  <div className="text-center space-y-1">
                    <p className={`text-[10px] font-mono uppercase ${isLight ? "text-slate-500" : "text-slate-400"}`}>Current Readiness</p>
                    <p className={`text-xl font-bold font-mono ${isLight ? "text-cyan-600" : "text-cyan-400"}`}>{readinessScore}%</p>
                  </div>
                  <div className="text-center space-y-1">
                    <p className={`text-[10px] font-mono uppercase ${isLight ? "text-slate-500" : "text-slate-400"}`}>Verified Compliant</p>
                    <p className={`text-xl font-bold font-mono ${isLight ? "text-emerald-600" : "text-emerald-400"}`}>{compliantCount}</p>
                  </div>
                  <div className="text-center space-y-1">
                    <p className={`text-[10px] font-mono uppercase ${isLight ? "text-slate-500" : "text-slate-400"}`}>Remediation Gaps</p>
                    <p className={`text-xl font-bold font-mono ${isLight ? "text-red-600" : "text-red-400"}`}>{gapCount}</p>
                  </div>
                  <div className="text-center space-y-1">
                    <p className={`text-[10px] font-mono uppercase ${isLight ? "text-slate-500" : "text-slate-400"}`}>Excluded (N/A)</p>
                    <p className={`text-xl font-bold font-mono ${isLight ? "text-slate-600" : "text-slate-300"}`}>{naCount}</p>
                  </div>
                </div>

                {/* Scoping details or table snippet */}
                <div className="space-y-2.5">
                  <p className={`text-xs font-mono font-bold uppercase border-b pb-1 ${
                    isLight ? "text-slate-700 border-slate-200" : "text-slate-300 border-slate-800"
                  }`}>
                    Exclusion & Statement of Applicability Registry Summary:
                  </p>
                  <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1">
                    {activeControlsList.map((ctrl) => {
                      const state = getAssessmentState(ctrl.id, ctrl);
                      return (
                        <div key={ctrl.id} className={`flex justify-between items-start text-[10px] font-mono py-1.5 border-b gap-6 ${
                          isLight ? "border-slate-100" : "border-slate-900"
                        }`}>
                          <div className="space-y-0.5">
                            <span className={`font-bold mr-2 ${isLight ? "text-cyan-600" : "text-cyan-400"}`}>[{ctrl.code}]</span>
                            <span className={isLight ? "text-slate-800" : "text-slate-200"}>{ctrl.title}</span>
                            <p className={`italic mt-0.5 max-w-xl ${isLight ? "text-slate-500" : "text-slate-500"}`}>
                              Justification: "{state.justification}"
                            </p>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                            state.applicable 
                              ? state.status === "compliant"
                                ? isLight ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-emerald-500/10 text-emerald-400"
                                : isLight ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-amber-500/10 text-amber-400"
                              : isLight ? "bg-red-50 text-red-700 border border-red-100" : "bg-red-500/10 text-red-400"
                          }`}>
                            {state.applicable ? (state.status === "compliant" ? "COMPLIANT" : "PARTIAL/GAP") : "EXCLUDED"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer signatures */}
                <div className={`pt-6 border-t flex justify-between items-center text-[10px] font-mono ${
                  isLight ? "border-slate-200 text-slate-500" : "border-slate-800 text-slate-400"
                }`}>
                  <div className="space-y-1 text-left">
                    <p className={`font-bold ${isLight ? "text-slate-800" : "text-slate-200"}`}>Lead Assessor Signature:</p>
                    <p className={`font-mono italic font-medium ${isLight ? "text-cyan-600" : "text-cyan-400"}`}>InfoShield Automated GRC System</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className={`font-bold ${isLight ? "text-slate-800" : "text-slate-200"}`}>Verification Hash:</p>
                    <p className={`font-mono text-[9px] ${isLight ? "text-slate-400" : "text-slate-500"}`}>IS-GRC-{Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
                  </div>
                </div>

              </div>

              {/* Download / Copy action */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowExportModal(false)}
                  className={`px-4 py-2 text-xs font-mono font-bold uppercase border rounded-lg cursor-pointer transition ${
                    isLight 
                      ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-700" 
                      : "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    triggerBannerAlert("Successfully downloaded Statement of Applicability (SoA) Gap analysis certificate to corporate compliance archive.");
                    setShowExportModal(false);
                  }}
                  className={`px-5 py-2 text-xs font-mono font-bold uppercase rounded-lg cursor-pointer transition ${
                    isLight
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                      : "bg-cyan-600 hover:bg-cyan-500 text-white"
                  }`}
                >
                  Download Formal Report PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
