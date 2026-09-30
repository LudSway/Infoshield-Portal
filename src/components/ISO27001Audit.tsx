import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { syncCollection, syncDocument, saveDocument } from "../lib/firebase";
import EvidenceDocGenerator from "./EvidenceDocGenerator";
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  FileText,
  FileCheck,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Sliders,
  Sparkles,
  Download,
  RotateCcw,
  CheckSquare,
  Square,
  Search,
  MessageSquare,
  Award,
  Plus
} from "lucide-react";

interface SubClause {
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

interface ClauseGroup {
  number: number;
  title: string;
  description: string;
  subClauses: SubClause[];
}

interface ControlItem {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  documentRequired: string;
  evidenceToPresent: string;
  standardRequirement?: string;
  documentEntail?: string;
  exactEvidence?: string;
  complianceAdvice?: string;
}

interface ISO27001AuditProps {
  theme?: "light" | "dark";
  activeRole: string;
  triggerBannerAlert: (msg: string) => void;
  currentBusiness?: any;
}

// Highly detailed ISO 27001 Clauses 4 to 10 structure
const CLAUSES_DATA: ClauseGroup[] = [
  {
    number: 4,
    title: "Clause 4: Context of the Organization",
    description: "Understand internal and external challenges, interested parties, and establish boundaries of your ISMS.",
    subClauses: [
      {
        id: "iso-sub-4.1",
        code: "4.1",
        title: "Understanding the Organization & Context",
        description: "Determine external and internal issues that are relevant to the organization's purpose and affect its ability to achieve ISMS objectives.",
        documentRequired: "Context of the Organization Policy (SWOT Analysis or PESTLE Report)",
        evidenceToPresent: "Minutes from annual business context workshops, corporate issue log, and executive board approval signature.",
        standardRequirement: "ISO 27001:2022 Clause 4.1 specifies that the organization must identify all external and internal issues that are relevant to its strategic purpose and that affect its ability to achieve the intended outcomes of its Information Security Management System (ISMS).",
        documentEntail: "The Context of the Organization Policy must detail: 1) Company strategic objectives, 2) External environmental analysis (legal, regulatory, technological, and competitive), 3) Internal capability analysis (culture, systems, staff, and technologies), 4) SWOT/PESTLE matrix showing direct maps to digital and physical asset risks.",
        exactEvidence: "1) A copy of the board-approved 'ISMS Context & Issues Registry' with formal version history, 2) Annual workshop minutes or emails showing that the internal/external issues list was formally reviewed and updated by C-level executives, 3) Signed approval sign-off from the CISO and executive sponsor.",
        complianceAdvice: "Ensure that your SWOT/PESTLE issues are not generic business issues. Each entry must directly relate to information assets, network perimeters, or processing risks (e.g., instead of just 'high competitor activity', write 'competitor-driven reverse engineering threat to code assets')."
      },
      {
        id: "iso-sub-4.2",
        code: "4.2",
        title: "Interested Parties' Needs & Expectations",
        description: "Identify stakeholders (customers, vendors, regulatory bodies) relevant to information security and their specific requirements.",
        documentRequired: "Interested Parties Registry & SLA Compliance Grid",
        evidenceToPresent: "Customer contractual SLA matrices, regulatory registrations, and internal stakeholder mapping checklists.",
        standardRequirement: "ISO 27001:2022 Clause 4.2 mandates that the organization must identify stakeholders (interested parties) relevant to the ISMS, determine their security-related requirements, and establish how these requirements will be met.",
        documentEntail: "The Interested Parties Registry must contain: 1) Identification of internal & external stakeholders (e.g. clients, regulatory bodies, staff, supply chain vendors), 2) Contractual, legal, or industry security obligations (e.g. GDPR, SOC 2, HIPAA, PCI DSS), 3) Specific controls or processes mapped to satisfy each stakeholder requirement.",
        exactEvidence: "1) A centralized 'Interested Parties Matrix & SLA compliance grid', 2) Contract security schedules signed with key clients, 3) GDPR/Data Protection legal compliance assessment documents.",
        complianceAdvice: "Auditors will verify if your registry is synchronized with client SLA requirements. If you guarantee 99.9% availability or immediate breach notification within 24 hours to clients, your interested parties table must show the exact operational procedures designed to fulfill those promises."
      },
      {
        id: "iso-sub-4.3",
        code: "4.3",
        title: "Determining the Scope of the ISMS",
        description: "Establish the physical, logical, geographical, and organizational boundaries of the security management framework.",
        documentRequired: "ISMS Formal Scope Statement & Exclusion Justification",
        evidenceToPresent: "Network topology diagram detailing trust zones, physical data center floor plan scope, and business process flowcharts.",
        standardRequirement: "ISO 27001:2022 Clause 4.3 requires the organization to define and document the boundaries and applicability of the ISMS to establish its scope, considering internal/external issues, interested parties' requirements, and operational dependencies.",
        documentEntail: "The ISMS Scope Statement must explicitly define: 1) Physical perimeters (offices, server spaces, remote employee setups), 2) Logical perimeters (cloud host accounts, networks, database endpoints), 3) Included departments or legal entities, 4) Exclusions with solid, non-security-jeopardizing engineering justifications.",
        exactEvidence: "1) A signed 'ISMS Scope & Boundaries Declaration' with version-control, 2) Detailed corporate network topology diagram visualizing cloud virtual private clouds (VPCs) and corporate sites, 3) Signed board minutes approving the specified boundaries.",
        complianceAdvice: "Ensure that no customer-facing data processing is excluded from the scope. If you exclude the core software engineering department but include the customer success team, the auditor will issue a major non-conformance."
      },
      {
        id: "iso-sub-4.4",
        code: "4.4",
        title: "Information Security Management System",
        description: "Establish, implement, maintain, and continually improve the ISMS in accordance with ISO 27001 standards.",
        documentRequired: "ISMS Manual & Governance Charter",
        evidenceToPresent: "ISMS operational calendar, process mapping worksheets, and proof of integration with core company operations.",
        standardRequirement: "ISO 27001:2022 Clause 4.4 states that the organization must establish, implement, maintain and continually improve an ISMS, including the processes needed and their interactions, in accordance with the standard.",
        documentEntail: "The ISMS Manual & Governance Charter must outline: 1) The security organization hierarchy, 2) Core ISMS cycles (risk assessment, training, internal audits, management reviews), 3) Policy lifecycle processes (drafting, editing, publishing, enforcing).",
        exactEvidence: "1) The approved 'ISMS Master Manual' or intranet portal URL, 2) The annual ISMS master operational calendar, 3) Cross-functional process mapping flowcharts showing security touchpoints.",
        complianceAdvice: "A digital wiki or interactive dashboard (like Confluence or Notion) is highly recommended. It shows the auditor that the ISMS is an active, living business process integrated with daily operations rather than a set of static, unread folders."
      }
    ]
  },
  {
    number: 5,
    title: "Clause 5: Leadership",
    description: "Demonstrate senior executive commitment, define core policies, and allocate clear corporate roles.",
    subClauses: [
      {
        id: "iso-sub-5.1",
        code: "5.1",
        title: "Leadership and Commitment",
        description: "Top management must show hands-on leadership, align security to business strategy, and ensure sufficient resources.",
        documentRequired: "Executive Security Charter & Financial Budget Allocation Matrix",
        evidenceToPresent: "Minutes of annual executive committee review showing security headcount, capital expenditure signs, and goals approval.",
        standardRequirement: "Top management shall demonstrate leadership and commitment with respect to the ISMS by ensuring the integration of security into processes, establishing objectives, and ensuring resources are available.",
        documentEntail: "The Executive Security Charter & Budget Allocation document must detail: 1) A clear statement of executive support for info security goals, 2) Financial resource commitments (CAPA/OPEX allocation), 3) Integration of security metrics in corporate performance criteria.",
        exactEvidence: "1) Annual strategic security budget sign-off sheet, 2) C-level executive meeting minutes where the CISO presented security performance dashboard metrics, 3) Signed executive commitment letter.",
        complianceAdvice: "During audits, the Lead Auditor will interview top executives (CEO, CFO, or COO). Ensure that executives can speak clearly about the organization's information security objectives, risk appetite, and their personal role in sponsoring security initiatives."
      },
      {
        id: "iso-sub-5.2",
        code: "5.2",
        title: "Information Security Policy",
        description: "Establish a high-level security policy that is appropriate, provides objective targets, and is shared with all workers.",
        documentRequired: "Corporate Information Security Policy (ISP)",
        evidenceToPresent: "Intranet publication log timestamps, corporate handbook read-receipt acknowledgments, and policy review board approvals.",
        standardRequirement: "Top management shall establish an information security policy that is appropriate, provides a framework for objectives, and includes a commitment to satisfy applicable requirements.",
        documentEntail: "The Corporate Information Security Policy (ISP) must entail: 1) High-level goals (Confidentiality, Integrity, Availability principles), 2) Clear commitment to satisfy legal, contractual, and regulatory standards, 3) Mandatory annual review schedules, 4) Scope of applicability for all employees and contractors.",
        exactEvidence: "1) Approved 'Master Information Security Policy', 2) Version history logging annual board review, 3) Proof of distribution, such as HR learning management system (LMS) completion reports or employee handbook receipt acknowledgments.",
        complianceAdvice: "Keep the high-level policy short (under 3-4 pages) and readable. Avoid cluttering it with technical details like port numbers or firewall protocols; those should live in lower-level system hardening guidelines."
      },
      {
        id: "iso-sub-5.3",
        code: "5.3",
        title: "Organizational Roles, Responsibilities & Authorities",
        description: "Assign and communicate responsibilities for ensuring ISMS conformance and reporting on security performance.",
        documentRequired: "Security Org Chart & RACI Responsibility Matrix",
        evidenceToPresent: "Official appointment letter for the CISO, specific security engineer job descriptions, and access control approval matrices.",
        standardRequirement: "Top management shall ensure that the responsibilities and authorities for roles relevant to information security are assigned and communicated.",
        documentEntail: "The Security Organizational Chart and RACI Responsibility Matrix must entail: 1) Clear definition of security roles (e.g. CISO, Security Engineers, Asset Owners, Compliance Managers), 2) Responsibility, Accountability, Consulted, and Informed definitions for security processes, 3) Direct escalation channels to the board.",
        exactEvidence: "1) CISO appointment letter signed by the board, 2) Specific security responsibilities included in job descriptions, 3) Formally assigned RACI matrix showing task-by-task security ownership.",
        complianceAdvice: "Even in small startups, roles cannot be overlapping. The person writing software code shouldn't be the sole person approving code releases without a secondary review role; RACI must clearly reflect this separation of duties."
      }
    ]
  },
  {
    number: 6,
    title: "Clause 6: Planning",
    description: "Formulate risk assessment methodologies, compile risk registers, and outline measurable objectives.",
    subClauses: [
      {
        id: "iso-sub-6.1.1",
        code: "6.1.1",
        title: "Actions to Address Risks & Opportunities - General",
        description: "Plan the framework to prevent undesired effects and achieve continuous improvement in the risk envelope.",
        documentRequired: "ISMS Risk Planning Framework & Opportunity Registry",
        evidenceToPresent: "Risk appetite statement approved by CISO, and scheduled timeline charts for enterprise-level risk scanning.",
        standardRequirement: "Plan the actions to address risks and opportunities, ensuring the ISMS can achieve its intended outcomes, prevent or reduce undesired effects, and achieve continual improvement.",
        documentEntail: "The ISMS Risk Planning & Opportunities Registry must outline: 1) Risk identification scope, 2) Framework for managing risk opportunities, 3) Evaluation criteria to assess the positive and negative impacts of security initiatives on business enablement.",
        exactEvidence: "1) A signed 'Risk Management Framework Planning' sheet, 2) Minutes of the risk planning committee, 3) Operational plan mapping security opportunities (e.g. migration to zero-trust architecture).",
        complianceAdvice: "Focus on opportunities, not just risks. Showing that security enables business (e.g., qualifying for enterprise contracts) demonstrates an advanced and healthy compliance culture."
      },
      {
        id: "iso-sub-6.1.2",
        code: "6.1.2",
        title: "Information Security Risk Assessment",
        description: "Define and execute a repeatable risk assessment process that identifies vulnerabilities, asset owners, and impact levels.",
        documentRequired: "Risk Assessment Methodology & Criteria Policy",
        evidenceToPresent: "Active corporate Risk Register, asset inventory valuations, threat-likelihood matrices, and historical assessment records.",
        standardRequirement: "Define and apply an information security risk assessment process that establishes and maintains risk criteria, produces consistent results, and identifies risk owners.",
        documentEntail: "The Risk Assessment Methodology Policy must entail: 1) Numerical or qualitative risk evaluation scales (e.g. 1-5 impact vs. likelihood matrices), 2) Asset identification guidelines, 3) Criteria for estimating threat probabilities, 4) Identification of designated corporate risk owners for each asset category.",
        exactEvidence: "1) The active 'Corporate Risk Register' listing current risks, 2) Documented risk evaluation methodologies, 3) Risk owner sign-offs on identified vulnerabilities.",
        complianceAdvice: "Risks must be owned by business managers, not the CISO. If a customer database risk is identified, the database owner (e.g., VP of Engineering) must be listed as the risk owner, not the security team."
      },
      {
        id: "iso-sub-6.1.3",
        code: "6.1.3",
        title: "Information Security Risk Treatment",
        description: "Formulate a risk treatment plan, select mitigating controls from Annex A, and sign off on residual risks.",
        documentRequired: "Risk Treatment Plan & Statement of Applicability (SoA)",
        evidenceToPresent: "Statement of Applicability detailing justifications for included/excluded controls, and signed residual risk acceptance waivers.",
        standardRequirement: "Define and apply an information security risk treatment process to select appropriate treatment options, determine necessary controls, and formulate a treatment plan.",
        documentEntail: "The Risk Treatment Plan & Statement of Applicability (SoA) must entail: 1) Categorized treatment decisions (Mitigate, Transfer, Accept, Avoid), 2) Comprehensive mapping of all Annex A controls showing which are applicable and which are excluded, 3) Formal business and technical justifications for exclusions.",
        exactEvidence: "1) The formal 'Statement of Applicability (SoA)' with CISO signature, 2) An active 'Risk Treatment Action Plan', 3) Signed residual risk acceptance waivers for any high risks accepted by executives.",
        complianceAdvice: "The Statement of Applicability is the most critical document in an ISO audit. Ensure every single control has a clear, custom status statement (e.g., 'Implemented via Okta SSO and multi-factor authentication on all corporate endpoints' instead of a simple 'Yes' or 'No')."
      },
      {
        id: "iso-sub-6.2",
        code: "6.2",
        title: "Information Security Objectives & Planning",
        description: "Establish measurable security objectives (e.g. system uptime, patching latency) across appropriate functional levels.",
        documentRequired: "ISMS Security Objectives Plan & KPI Matrix",
        evidenceToPresent: "Quarterly security benchmark reviews, SLA tracking dashboards, and project roadmap milestones for security tasks.",
        standardRequirement: "Establish information security objectives at relevant functions and levels. Objectives shall be measurable, aligned with policy, and monitored.",
        documentEntail: "The Security Objectives & KPI Matrix must entail: 1) Specific, Measurable, Achievable, Relevant, and Time-bound (SMART) security goals (e.g., 'All critical vulnerabilities patched within 14 days', 'Zero phishing training failures over 2 quarters'), 2) Assigned owners, 3) Resource requirements and tracking frequency.",
        exactEvidence: "1) The 'Corporate Security Objectives & KPI Sheet', 2) Performance dashboard exports showing active tracking of objectives, 3) Minutes of meeting reviewing goal achievements.",
        complianceAdvice: "Ensure objectives are genuinely measurable. Avoid vague statements like 'Improve team security'. Use measurable metrics like 'Achieve 95% completion rate on security awareness training within 30 days of employee onboard'."
      }
    ]
  },
  {
    number: 7,
    title: "Clause 7: Support",
    description: "Manage human resources, ensure professional competence, drive awareness campaigns, and control ISMS documents.",
    subClauses: [
      {
        id: "iso-sub-7.1",
        code: "7.1",
        title: "Resources Management",
        description: "Determine and provide the resources (people, infrastructure, software licenses) necessary for the ISMS.",
        documentRequired: "Resource Allocations & CapEx/OpEx Planning Standard",
        evidenceToPresent: "Server infrastructure capacity logs, licenses for active compliance auditing software, and hiring pipeline logs.",
        standardRequirement: "Determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the ISMS.",
        documentEntail: "The Resource Allocation Standard must detail: 1) Personnel headcount allocations for security, 2) Capital expenditure (CapEx) and operational expenditure (OpEx) budgets for tools (SIEM, EDR, firewalls), 3) Infrastructure/software resource requirements.",
        exactEvidence: "1) CISO approved hardware and software license inventory, 2) Security team hiring pipelines or consulting contracts, 3) Allocated organizational budgets.",
        complianceAdvice: "Make sure you can prove that there is a budget and staff dedicated to operating the ISMS. If one part-time IT administrator handles all security, IT, and compliance, the auditor may note an issue regarding resource adequacy."
      },
      {
        id: "iso-sub-7.2",
        code: "7.2",
        title: "Competence Assessment",
        description: "Ensure that employees and external contractors are competent on the basis of appropriate education, training, or experience.",
        documentRequired: "HR Hiring Standard & Security Competency Matrix",
        evidenceToPresent: "Verification of security certificates (e.g. CISSP, CISM), academic transcripts, and background vetting screening checks.",
        standardRequirement: "Ensure that persons doing work under its control are competent on the basis of appropriate education, training or experience; and take actions to acquire competence.",
        documentEntail: "The HR Vetting & Competency Standard must entail: 1) Required qualifications and credentials for security roles, 2) Standard background check procedures for all new hires, 3) Training and continuing education guidelines for maintaining professional competence (e.g. CISSP, CISA).",
        exactEvidence: "1) Background screening reports (redacted for privacy), 2) CVs and professional certificates of the security team, 3) Completed employee competence checklists.",
        complianceAdvice: "Auditors will pull random samples of newly hired employee files to check if background checks were performed before they were given production access. Ensure background check logs have clear timestamped approvals."
      },
      {
        id: "iso-sub-7.3",
        code: "7.3",
        title: "Security Awareness Program",
        description: "Ensure that personnel doing work under company control are aware of the security policy and their contribution to the ISMS.",
        documentRequired: "Employee Security Training Plan & Curriculum",
        evidenceToPresent: "LMS training completion rosters, phishing simulation report card results, and posters/newsletter broadcast metrics.",
        standardRequirement: "Ensure that persons doing work under the organization’s control are aware of the security policy, their contribution to ISMS effectiveness, and the implications of non-conformance.",
        documentEntail: "The Security Awareness Training Policy must entail: 1) Mandatory onboarding training schedules, 2) Ongoing training cycles (e.g., annual refresher, quarterly phishing tests), 3) Training content requirements covering password safety, social engineering, and incident reporting.",
        exactEvidence: "1) LMS completion records showing 100% staff coverage, 2) Phishing test reports showing simulation results and click-through rates, 3) Training slide decks or vendor curriculum.",
        complianceAdvice: "A common audit finding is incomplete training for contractors or part-time staff. Ensure that everyone on the payroll with access to company systems is included in the training cohort and logs."
      },
      {
        id: "iso-sub-7.4",
        code: "7.4",
        title: "Internal and External Communications",
        description: "Determine the need for internal and external communications relevant to the ISMS, including who, when, and how to communicate.",
        documentRequired: "InfoSec Communication Protocol & Media Guidelines",
        evidenceToPresent: "Regulatory reporting procedures for security breaches, customer notification templates, and internal Slack/email warning archives.",
        standardRequirement: "Determine the internal and external communications relevant to the ISMS, including on what to communicate, when, with whom, and how.",
        documentEntail: "The Corporate Communications Protocol must detail: 1) Internal announcement schedules for policy updates, 2) External incident reporting lines (e.g., to regulators like ICO/FTC, or to affected customers), 3) Approved PR spokespersons and media statement guidelines.",
        exactEvidence: "1) Corporate incident communications flowcharts, 2) Signed contracts with external PR or legal firms, 3) Communication templates for breach notifications.",
        complianceAdvice: "Keep external communication plans highly structured. Clearly define who has the authority to declare a security breach and who is allowed to contact regulatory authorities or law enforcement, avoiding uncoordinated public statements."
      },
      {
        id: "iso-sub-7.5",
        code: "7.5",
        title: "Documented Information Control",
        description: "Ensure that ISMS documents are properly created, formatted, reviewed for adequacy, and distributed securely.",
        documentRequired: "Document Control & Records Retention Policy",
        evidenceToPresent: "Document master registry with explicit versioning, editor/approver logs, and digital encryption signatures.",
        standardRequirement: "Ensure documented information required by the ISMS is controlled, including its creation, update, distribution, retrieval, retention, and protection.",
        documentEntail: "The Document Control and Records Retention Policy must entail: 1) Standard document formatting and metadata requirements, 2) Approval workflow rules (who edits, who approves), 3) Document encryption, backup, and classification rules, 4) Explicit document retention lifetimes.",
        exactEvidence: "1) Central document directory or SharePoint file system, 2) Document version histories showing author and approver names, 3) Database backups of active document repositories.",
        complianceAdvice: "Every policy must have a clear header indicating: Version Number, Effective Date, Last Reviewed Date, Document Owner, and Classification (e.g., Internal Use Only, Confidential). Ensure these headers are present across all PDFs."
      }
    ]
  },
  {
    number: 8,
    title: "Clause 8: Operation",
    description: "Execute the plans, run security risk assessments, and implement agreed risk treatment checklists.",
    subClauses: [
      {
        id: "iso-sub-8.1",
        code: "8.1",
        title: "Operational Planning and Control",
        description: "Implement processes to meet security requirements, control changes, and manage outsourced elements.",
        documentRequired: "Change Management Policy & Vendor Security Guidelines",
        evidenceToPresent: "Jira Change Advisory Board (CAB) ticket logs, outsourced service contract review audits, and configuration change records.",
        standardRequirement: "Plan, implement and control the processes needed to meet information security requirements, and to implement the actions determined in Clause 6.",
        documentEntail: "The Change Management & Outsourcing Policy must entail: 1) Definition of standard, minor, and major system changes, 2) Peer code-review guidelines (e.g. pull request approvals), 3) Testing and rollback requirements for deployments, 4) Third-party service delivery risk evaluation procedures.",
        exactEvidence: "1) Closed change tickets (e.g. Jira or ServiceNow) showing tester and manager approvals, 2) GitHub pull request logs demonstrating enforced branch protection rules and peer approval, 3) SLA review audit reports for outsourced contractors.",
        complianceAdvice: "Enforce branch protection rules on GitHub. An auditor will ask you to open a random pull request in your repository to check if developers are blocked from pushing code directly to the master branch without peer approval."
      },
      {
        id: "iso-sub-8.2",
        code: "8.2",
        title: "Information Security Risk Assessment",
        description: "Perform information security risk assessments at planned intervals, or when major infrastructure changes occur.",
        documentRequired: "Risk Assessment Run-book",
        evidenceToPresent: "Historical risk assessment reports, vulnerability scans prior to deployment, and comparative risk scorecards.",
        standardRequirement: "Perform information security risk assessments at planned intervals or when significant changes are proposed or occur.",
        documentEntail: "The Risk Assessment Run-book must detail: 1) Criteria for triggering an unscheduled ad-hoc risk assessment (e.g. migrating core databases, expanding offices), 2) Step-by-step risk scanning workflows, 3) Documentation templates for change-related risk assessments.",
        exactEvidence: "1) Vulnerability scan reports ran before a major launch, 2) Completed 'Change Risk Assessment Impact' sheets, 3) Risk register entries representing new assets.",
        complianceAdvice: "Document assessments for major architectural modifications. If you switch from AWS to Google Cloud, you must show a documented risk assessment analyzing the migration's impact on data confidentiality."
      },
      {
        id: "iso-sub-8.3",
        code: "8.3",
        title: "Information Security Risk Treatment",
        description: "Implement the planned risk treatment roadmap and verify that selected security controls are active.",
        documentRequired: "Risk Treatment Progress Report",
        evidenceToPresent: "Proof of system mitigations (firewalls enabled, patch deployments), and engineering sign-offs verifying completed patches.",
        standardRequirement: "Implement the information security risk treatment plan in accordance with Section 6.1.3 and monitor progress.",
        documentEntail: "The Risk Treatment Progress Standard must outline: 1) Remediation milestones, 2) Technical mitigation deployment standards (e.g. firewall updates, database encryption rules), 3) Procedures for certifying completed technical mitigations.",
        exactEvidence: "1) Active task logs demonstrating patch deployments, 2) Network configuration settings showing activated firewall blocks, 3) Signature sign-offs from engineering team confirming risk mitigation.",
        complianceAdvice: "Keep an active remediation tracker. If an audit is coming up and you have active risks, show the auditor the treatment tasks currently in flight with allocated budgets and engineering deadlines."
      }
    ]
  },
  {
    number: 9,
    title: "Clause 9: Performance Evaluation",
    description: "Monitor SIEM analytics, conduct formal internal audits, and hold C-level management review meetings.",
    subClauses: [
      {
        id: "iso-sub-9.1",
        code: "9.1",
        title: "Monitoring, Measurement, Analysis & Evaluation",
        description: "Determine what metrics must be monitored, who evaluates them, and how results are verified.",
        documentRequired: "ISMS Performance Metrics & Monitoring Standard",
        evidenceToPresent: "SIEM console alert analysis reports, firewall uptime charts, database backup verify audits, and API availability logs.",
        standardRequirement: "Evaluate the information security performance and the effectiveness of the ISMS. Determine what needs to be monitored, the methods for monitoring, and when it shall be performed.",
        documentEntail: "The Performance Monitoring Standard must entail: 1) What technical assets are monitored (SIEM alerts, server uptimes, database failures), 2) Frequency of log reviews, 3) Key performance indicators (KPIs) for evaluating security tools.",
        exactEvidence: "1) SIEM console dashboards showing active log ingestion, 2) Monthly security reports analyzing alerts and system anomalies, 3) Verification logs showing routine backup restoration tests.",
        complianceAdvice: "Ensure you have logs showing backup integrity. Just having a backup policy is not enough; you must present timestamped verification logs proving you successfully restored a test backup to confirm its validity."
      },
      {
        id: "iso-sub-9.2",
        code: "9.2",
        title: "Internal Audit Program",
        description: "Conduct independent internal audits at scheduled intervals to verify ISMS effectiveness and ISO conformance.",
        documentRequired: "Internal Audit Plan & Standard Procedure",
        evidenceToPresent: "Completed internal audit reports, documented non-conformances tracking sheet, and signed credentials of the auditor.",
        standardRequirement: "Conduct internal audits at planned intervals to provide information on whether the ISMS conforms to the organization’s own requirements and the ISO standard.",
        documentEntail: "The Internal Audit Procedure must detail: 1) Selection criteria for an independent internal auditor, 2) Audit scope, objectives, and audit checklists, 3) Corrective actions workflow for non-conformities identified during internal audits.",
        exactEvidence: "1) Copy of the completed 'Internal Audit Report', 2) Evidence of the internal auditor's independence (e.g. certified external consultant or cross-departmental lead), 3) Non-conformity tracking register.",
        complianceAdvice: "The internal audit must be completed BEFORE your external certification audit. The external auditor will immediately ask to see your internal audit report and how you remediated any findings."
      },
      {
        id: "iso-sub-9.3",
        code: "9.3",
        title: "Management Review",
        description: "Top management must review the ISMS at planned intervals to ensure its continuing suitability, adequacy, and effectiveness.",
        documentRequired: "Management Review Meeting Agenda & Material Inputs",
        evidenceToPresent: "Signed executive minutes from annual management review, approved corporate safety strategies, and task tracking board updates.",
        standardRequirement: "Top management shall review the organization’s ISMS at planned intervals to ensure its continuing suitability, adequacy and effectiveness.",
        documentEntail: "The Management Review Charter must outline: 1) Review inputs (status of actions, changes in issues, risk assessment results, audit findings, metrics), 2) Authorized attendees (C-level executives, CISO), 3) Standard outputs (decisions on resources, policy changes).",
        exactEvidence: "1) Signed minutes of the annual 'Management Review Meeting', 2) The slide deck or report presented to the executives, 3) Tracking tickets showing approved resource actions.",
        complianceAdvice: "The minutes must have a formal sign-off from the CEO or COO. It must show explicit discussion on the status of corrective actions, outstanding risks, and resource requirements."
      }
    ]
  },
  {
    number: 10,
    title: "Clause 10: Improvement",
    description: "Track nonconformities, implement corrective actions (CAPA), and drive continual ISMS enhancement.",
    subClauses: [
      {
        id: "iso-sub-10.1",
        code: "10.1",
        title: "Nonconformity and Corrective Action (CAPA)",
        description: "React to security incidents/findings, control them, analyze root causes, and implement preventive measures.",
        documentRequired: "Corrective and Preventive Action (CAPA) Standard Procedure",
        evidenceToPresent: "Active CAPA database logs, root cause analysis (RCA) incident retrospectives, and verified check-back reviews.",
        standardRequirement: "When a nonconformity occurs, the organization shall react, control and cope with it, evaluate the need for corrective action to eliminate the cause, and review effectiveness.",
        documentEntail: "The Corrective and Preventive Action (CAPA) Standard must entail: 1) Intake channels for registering security incident nonconformities, 2) Root Cause Analysis (RCA) methodology (e.g., 5 Whys), 3) Implementation tracking workflows for permanent corrective actions.",
        exactEvidence: "1) CAPA database registry logs, 2) Completed Root Cause Analysis reports for recent incidents, 3) Follow-up audit logs proving the fix resolved the underlying issue.",
        complianceAdvice: "Do not close CAPA cases immediately after a patch is applied. The standard requires you to wait a predetermined duration (e.g., 30-90 days) to verify that the corrective action actually prevented the issue from recurring."
      },
      {
        id: "iso-sub-10.2",
        code: "10.2",
        title: "Continual Improvement",
        description: "Continually improve the suitability, adequacy, and effectiveness of the information security management system.",
        documentRequired: "ISMS Continual Improvement Plan & Strategy",
        evidenceToPresent: "Lessons-learned logs, automated security audit optimization logs, and historical capability level matrices.",
        standardRequirement: "Continually improve the suitability, adequacy and effectiveness of the information security management system.",
        documentEntail: "The Continual Improvement Plan must detail: 1) Metrics for evaluating ISMS maturity over time, 2) Standard processes for gathering and integrating employee security suggestions, 3) Reviews of technological upgrades to optimize compliance workloads.",
        exactEvidence: "1) Maturity scorecard progression reports over the last 3 years, 2) Logs of staff feedback on security policies, 3) Implementation files of new automated compliance monitoring tools.",
        complianceAdvice: "Show the auditor that your security controls are evolving. Integrating tools that automate manual checks (like moving from manual spreadsheet audits to real-time configuration compliance monitoring) is perfect evidence of continuous improvement."
      }
    ]
  }
];

// Detailed ISO 27001 Controls (Annex A Categories)
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

const generateControls = (): ControlItem[] => {
  const controls: ControlItem[] = [];

  const getDetails = (code: string, title: string, category: string): ControlItem => {
    let description = `Formally govern, implement, and maintain ${title.toLowerCase()} in accordance with organizational risk appetite and ISO/IEC 27001:2022 guidelines.`;
    let documentRequired = `${title} Standard Operating Procedure & Policy`;
    let evidenceToPresent = `Signed CISO approval logs, configuration parameters, and quarterly assessment records for ${title.toLowerCase()}.`;
    let standardRequirement = `Annex A ${code} specifies that the organization must define, authorize, and enforce measures for ${title.toLowerCase()} to safeguard information assets and maintain regulatory compliance.`;
    let documentEntail = `The policy for ${title.toLowerCase()} must include: 1) Executive sign-off and version control headers, 2) Precise roles and responsibilities, 3) Specific configuration baselines, 4) Auditable verification intervals.`;
    let exactEvidence = `1) Formal ${title} standard document, 2) Screenshots of configured parameters or systems proving enforcement, 3) Meeting minutes or system audit logs verifying operational compliance.`;
    let complianceAdvice = `For Annex A ${code} (${title}), ensure that rules are not just documented but actively enforced with automated alerts or technical controls. Perform internal audits at regular intervals to maintain compliance readiness.`;

    // Category-tailored defaults
    if (category.includes("Organizational")) {
      documentRequired = `Annex A ${code} ${title} Governance Standard`;
      evidenceToPresent = `Executive governance committee minutes, risk register entries, and approved policy documents for ${title.toLowerCase()}.`;
      standardRequirement = `Annex A ${code} requires executive leadership to establish formal governance policies, roles, and oversight for ${title.toLowerCase()}.`;
      documentEntail = `The ${title} policy must detail: 1) CISO & Board oversight, 2) Defined operational roles and responsibilities, 3) Annual review schedule, 4) Escalation protocol.`;
      exactEvidence = `1) Board-approved ${title} Policy document, 2) Governance meeting minutes, 3) Quarterly compliance status reports.`;
      complianceAdvice = `Auditors check for executive sign-offs dated within the last 12 months. Ensure policy version control reflects current operational practices.`;
    } else if (category.includes("People")) {
      documentRequired = `Annex A ${code} ${title} HR & Workforce Security Standard`;
      evidenceToPresent = `HR onboarding/offboarding logs, training completion metrics, and signed confidentiality agreements for ${title.toLowerCase()}.`;
      standardRequirement = `Annex A ${code} requires that personnel understand, accept, and continuously fulfill their security responsibilities regarding ${title.toLowerCase()}.`;
      documentEntail = `The ${title} standard must detail: 1) Screening and contractual obligations, 2) Ongoing awareness training requirements, 3) Formal disciplinary process for non-compliance.`;
      exactEvidence = `1) HR hiring checklists, 2) LMS security training completion certificates, 3) Signed NDA and Acceptable Use policies.`;
      complianceAdvice = `Cross-reference active HR employee lists with system access logs to prove 100% training coverage and prompt revocation upon departure.`;
    } else if (category.includes("Physical")) {
      documentRequired = `Annex A ${code} ${title} Facility & Perimeter Security Standard`;
      evidenceToPresent = `Physical keycard access logs, CCTV camera coverage maps, and data center SOC 2 Type II reports for ${title.toLowerCase()}.`;
      standardRequirement = `Annex A ${code} mandates physical perimeters and environmental controls to secure infrastructure associated with ${title.toLowerCase()}.`;
      documentEntail = `The ${title} procedure must outline: 1) Physical perimeter security zones, 2) Visitor escort protocols, 3) Environmental threat monitoring and hardware maintenance.`;
      exactEvidence = `1) Physical badge swipe logs, 2) Data center SOC 2 Type II audit report, 3) Physical security inspection records.`;
      complianceAdvice = `If operating in a cloud-native or remote-first environment, present cloud vendor SOC 2 reports and remote endpoint MDM policies as compensating evidence.`;
    } else if (category.includes("Technological")) {
      documentRequired = `Annex A ${code} ${title} Technical Baseline & Architecture Standard`;
      evidenceToPresent = `Cloud console configuration exports, IAM access rulesets, SIEM alerting logs, and vulnerability scan reports for ${title.toLowerCase()}.`;
      standardRequirement = `Annex A ${code} specifies technical guardrails, access controls, network boundaries, or cryptographic safeguards for ${title.toLowerCase()}.`;
      documentEntail = `The ${title} specification must detail: 1) Hardened system baselines, 2) Automated enforcement mechanisms, 3) Continuous monitoring metrics and alert thresholds.`;
      exactEvidence = `1) Terraform / IaC baseline configurations, 2) Automated monitoring dashboards and SIEM alerts, 3) Technical scan outputs.`;
      complianceAdvice = `Leverage Infrastructure-as-Code (IaC) templates and automated configuration checks to provide unalterable technical audit evidence.`;
    }

    // Override some specific popular ones for extra authenticity
    if (code === "A.5.15") {
      description = "Rules to control physical and logical access to information and other associated assets are established and implemented.";
      documentRequired = "Access Control & Identity Management (IAM) Policy";
      evidenceToPresent = "Active directory user registers, firewall rules showing restricted SSH/RDP ingress, and quarterly user privilege reviews.";
      standardRequirement = "Annex A 5.15 specifies that rules to control physical and logical access to information and other associated assets must be established and implemented based on business and security requirements.";
      documentEntail = "The Access Control & Identity Management (IAM) Policy must detail: 1) Account lifecycle guidelines (creation, modification, termination), 2) Password complexity and multi-factor authentication requirements, 3) Strict rule of least privilege, 4) Quarterly user privilege entitlement audit frequencies.";
      exactEvidence = "1) Active Directory / Okta configuration settings showing role-to-group mappings, 2) Firewall/IAM logs detailing restricted administrative console logins, 3) Signed quarterly privilege audit sheets with manager reviews.";
      complianceAdvice = "Ensure that there are no active accounts belonging to terminated employees. Auditors will cross-reference HR termination lists with Active Directory user registers.";
    } else if (code === "A.5.30") {
      description = "Ensure that information communication technology readiness is planned, implemented, tested, and evaluated for continuity.";
      documentRequired = "Business Continuity Plan (BCP) & Disaster Recovery (DR) Strategy";
      evidenceToPresent = "Disaster Recovery tabletop simulation logs, database restoration reports, and standby server cluster heartbeats.";
      standardRequirement = "Annex A 5.30 requires that ICT readiness must be planned, implemented, tested and evaluated based on business continuity objectives and ICT continuity requirements.";
      documentEntail = "The Business Continuity Plan (BCP) & Disaster Recovery (DR) Strategy must detail: 1) Recovery Time Objective (RTO) and Recovery Point Objective (RPO) parameters, 2) Alternative data center/cloud failover pathways, 3) Emergency roles and contact directories, 4) Annual simulation testing requirements.";
      exactEvidence = "1) Disaster Recovery tabletop simulation log reports with participant signatures, 2) Automated database replication/backup integrity verify logs, 3) Standby hot/cold site cluster heartbeat checks.";
      complianceAdvice = "A policy alone is a major compliance gap. You must prove you test your DR plans at least once a year. A tabletop scenario log or automated backup restoration report is ideal evidence.";
    } else if (code === "A.6.3") {
      description = "Personnel receive appropriate security awareness training and regular updates on organizational policies.";
      documentRequired = "Staff Training & Awareness Policy";
      evidenceToPresent = "Phishing report submission rate metrics, completion logs from HR training platforms, and signed handbook policies.";
      standardRequirement = "Annex A 6.3 specifies that personnel of the organization and relevant interested parties must receive appropriate information security awareness, education and training, and regular updates.";
      documentEntail = "The Staff Training and Awareness Policy must detail: 1) Standard onboarding training timelines, 2) Ongoing annual/quarterly training curriculum details, 3) Phishing simulation cycles and remediation for repeated failures.";
      exactEvidence = "1) Security awareness training logs from your LMS platform demonstrating 100% staff completion, 2) Phishing simulation report metrics showing failure and report rates.";
      complianceAdvice = "QSAs look for onboarding training records. Ensure every new employee has completed security training before they are issued keys or system credentials.";
    } else if (code === "A.7.4") {
      description = "Physical facilities are monitored for unauthorized physical access or environmental safety hazards.";
      documentRequired = "Facility Physical Security & Entry Procedures";
      evidenceToPresent = "CCTV surveillance camera coverage layouts, security visitor badges, and physical badge swipe logs for secure server vaults.";
      standardRequirement = "Annex A 7.4 mandates that physical facilities must be monitored for unauthorized physical access or environmental safety hazards.";
      documentEntail = "The Facility Physical Security & Entry Policy must detail: 1) Secure area boundary designations, 2) CCTV surveillance requirements (angles, camera locations, 90-day storage limits), 3) Visitor escort rules, 4) Intruder alarm systems and physical guard patrols.";
      exactEvidence = "1) CCTV camera coverage maps and configuration retention logs, 2) Digital badge swipe log exports from server vaults, 3) Visitor registration sheets.";
      complianceAdvice = "If using a cloud provider (like AWS/GCP), physical security is outsourced. Obtain and present their SOC 2 Type II report as your physical security verification evidence.";
    } else if (code === "A.8.8") {
      description = "Information about technical vulnerabilities of systems is obtained, evaluated, and resolved through timely patching.";
      documentRequired = "Vulnerability Management & Patching Policy";
      evidenceToPresent = "Clean ASV scanning reports, internal VAPT penetration test reports, and configuration build scripts.";
      standardRequirement = "Annex A 8.8 specifies that information about technical vulnerabilities of information systems in use must be obtained, evaluated, and addressed through appropriate and timely patching.";
      documentEntail = "The Vulnerability Management & Patching Policy must detail: 1) Vulnerability scanning cycles (e.g., weekly internal, quarterly external), 2) Risk classification standards (using CVSS scores), 3) Enforced patching deadlines (e.g. Critical within 7 days, High within 30 days).";
      exactEvidence = "1) Clean internal vulnerability scan reports (Nessus, Qualys), 2) Completed penetration test (VAPT) summaries with proof of remediation, 3) Patch deployment logs.";
      complianceAdvice = "Ensure your patch logs clearly match the dates specified in your policy. If a Critical patch is found, you must prove it was applied within your 7-day policy window.";
    } else if (code === "A.8.20") {
      description = "Networks and devices are secured, managed, and monitored to protect information in transit.";
      documentRequired = "Network Architecture & Device Hardening Standards";
      evidenceToPresent = "Active WAF rule configurations, IDS sensor monitoring charts, and routing tables forbidding insecure protocols (TLS 1.0/1.1).";
      standardRequirement = "Annex A 8.20 requires that networks and network devices must be secured, managed and monitored to protect information in systems and applications.";
      documentEntail = "The Network Architecture & Hardening Standards must detail: 1) Firewall configuration baselines, 2) Intrusion Detection/Prevention (IDS/IPS) rules, 3) Network segmentation boundaries (CDE vs corporate), 4) Strict prohibition of insecure clear-text protocols (such as FTP, HTTP, Telnet).";
      exactEvidence = "1) Active Web Application Firewall (WAF) rulesets, 2) boundary router routing tables, 3) SIEM syslog ingress logs from network switches.";
      complianceAdvice = "Disable all legacy clear-text administration protocols. Any open ports on HTTP or Telnet will trigger immediate audit failure; enforce HTTPS and SSHv2 exclusively.";
    } else if (code === "A.8.24") {
      description = "Rules for the effective use of cryptography, including key management, are established and implemented.";
      documentRequired = "Key Management & Cryptographic Enrolment Policy";
      evidenceToPresent = "Encryption key rotation records, SSL/TLS parameter listings (preferring AES-GCM and SHA-256), and database table encryption audits.";
      standardRequirement = "Annex A 8.24 specifies that rules for the effective use of cryptography, including cryptographic key management, must be established and implemented.";
      documentEntail = "The Key Management & Cryptographic Enrolment Policy must detail: 1) Approved cipher suites and key lengths (e.g., AES-256, RSA-3072, TLS 1.3), 2) Secure key generation, storage, and rotation protocols, 3) Strict split-knowledge / dual-custody rules for master keys.";
      exactEvidence = "1) System encryption profile listings, 2) Database encryption audits demonstrating Transparent Data Encryption (TDE) active, 3) Key generation ceremony logs with witness signatures.";
      complianceAdvice = "Always use managed key vaults (such as AWS KMS or GCP KMS). This automates rotation logs which serves as perfect, unalterable compliance evidence for the auditor.";
    }

    return {
      id: `iso-ctrl-${code.toLowerCase().replace("a.", "a")}`,
      code,
      title,
      category,
      description,
      documentRequired,
      evidenceToPresent,
      standardRequirement,
      documentEntail,
      exactEvidence,
      complianceAdvice
    };
  };

  // 1. A.5 Organizational Controls (1 to 37)
  Object.entries(A5_TITLES).forEach(([numStr, title]) => {
    controls.push(getDetails(`A.5.${numStr}`, title, "A.5 Organizational Controls"));
  });

  // 2. A.6 People Controls (1 to 8)
  Object.entries(A6_TITLES).forEach(([numStr, title]) => {
    controls.push(getDetails(`A.6.${numStr}`, title, "A.6 People Controls"));
  });

  // 3. A.7 Physical Controls (1 to 14)
  Object.entries(A7_TITLES).forEach(([numStr, title]) => {
    controls.push(getDetails(`A.7.${numStr}`, title, "A.7 Physical Controls"));
  });

  // 4. A.8 Technological Controls (1 to 34)
  Object.entries(A8_TITLES).forEach(([numStr, title]) => {
    controls.push(getDetails(`A.8.${numStr}`, title, "A.8 Technological Controls"));
  });

  return controls;
};

const CONTROLS_DATA = generateControls();

export interface CapaItem {
  id: string;
  title: string;
  standardRef: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED_VERIFIED";
  owner: string;
  description: string;
  rootCause: string;
  actionPlan: string;
  targetDate: string;
  createdAt: string;
}

export interface EmployeeSuggestion {
  id: string;
  name: string;
  department: string;
  suggestion: string;
  category: string;
  submittedAt: string;
  status: "PENDING_REVIEW" | "PROMOTED_TO_CAPA" | "INTEGRATED";
}

export default function ISO27001Audit({
  theme = "dark",
  activeRole,
  triggerBannerAlert,
  currentBusiness
}: ISO27001AuditProps) {
  const isLight = theme === "light";
  const isLiveEnvironment = !!(
    currentBusiness && 
    currentBusiness.name !== "Enterprise Security Target" && 
    currentBusiness.website !== "https://regintel-africa.web.app"
  );

  // Persistent States with local cache
  const [readyDocs, setReadyDocs] = useState<string[]>([]);
  const [readyEvidence, setReadyEvidence] = useState<string[]>([]);
  const [auditNotes, setAuditNotes] = useState<Record<string, string>>({});

  // Continual Improvement (CAPA) State
  const [mainTab, setMainTab] = useState<"checklist" | "capa">("checklist");
  const [selectedCapaId, setSelectedCapaId] = useState<string>("CAPA-2026-001");
  const [isCreatingCapa, setIsCreatingCapa] = useState<boolean>(false);
  
  // CAPA Form state
  const [capaFormTitle, setCapaFormTitle] = useState("");
  const [capaFormRef, setCapaFormRef] = useState("");
  const [capaFormSeverity, setCapaFormSeverity] = useState<"CRITICAL" | "HIGH" | "MEDIUM" | "LOW">("HIGH");
  const [capaFormOwner, setCapaFormOwner] = useState("");
  const [capaFormDesc, setCapaFormDesc] = useState("");
  const [capaFormRca, setCapaFormRca] = useState("");
  const [capaFormAction, setCapaFormAction] = useState("");
  const [capaFormDate, setCapaFormDate] = useState("");

  const defaultCapaItems: CapaItem[] = [
    {
      id: "CAPA-2026-001",
      title: "Unencrypted Cloud Backup Bucket",
      standardRef: "Annex A.8.14 (Redundancy of information processing facilities)",
      severity: "HIGH",
      status: "IN_PROGRESS",
      owner: "David K. (Cloud Architect)",
      description: "Primary database backup bucket in our staging AWS cluster was identified as unencrypted at rest during automated audits.",
      rootCause: "The legacy infrastructure deployment script did not declare ServerSideEncryptionConfiguration, falling back to AWS default unencrypted configuration.",
      actionPlan: "1) Re-deploy bucket configuration with strict AES-256 bucket-key enabled.\n2) Implement AWS Config validation rules to quarantine non-compliant assets.",
      targetDate: "2026-07-20",
      createdAt: "2026-07-01"
    },
    {
      id: "CAPA-2026-002",
      title: "Development Port MFA Security Bypass Active",
      standardRef: "Clause 10.1 (Corrective Action) / Annex A.5.15 (Access control)",
      severity: "CRITICAL",
      status: "RESOLVED_VERIFIED",
      owner: "Sarah L. (SecOps Lead)",
      description: "Staging dashboard administrative ports allowed identity verification bypass which was originally implemented to accommodate quick development staging testing.",
      rootCause: "The gateway configuration was set to read-all instead of restricting bypass strictly to isolated local development namespaces.",
      actionPlan: "1) Permanently restrict bypass to localhost contexts and require MFA validation tokens on all active sessions.\n2) Verify identity requirements are strictly enforced across all staging and production nodes.",
      targetDate: "2026-07-10",
      createdAt: "2026-07-02"
    },
    {
      id: "CAPA-2026-003",
      title: "Bastion Host SSH Key Lifespans Exceeded",
      standardRef: "Annex A.5.17 (Authentication information)",
      severity: "MEDIUM",
      status: "OPEN",
      owner: "Marcus J. (Security Engineer)",
      description: "Four active SSH keys on production bastion nodes have surpassed the mandatory 90-day corporate key rotation guideline, remaining active for over 180 days.",
      rootCause: "Manual key-rotation checklist was skipped during the Q2 infrastructure migration cycle, with no automated rotation alert trigger connected to our SIEM dashboard.",
      actionPlan: "1) Instantly disable the stale SSH keys and provision fresh 4096-bit RSA keys.\n2) Hook key-lifespan monitoring to InfoShield telemetry endpoints for automated security alerting.",
      targetDate: "2026-08-01",
      createdAt: "2026-07-05"
    }
  ];

  const [capaItems, setCapaItems] = useState<CapaItem[]>(() => {
    const saved = localStorage.getItem("iso27001_capa_items");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return defaultCapaItems;
  });

  const defaultSuggestions: EmployeeSuggestion[] = [
    {
      id: "SUG-2026-001",
      name: "Alex Rivera",
      department: "Customer Operations",
      suggestion: "We should implement auto-lockout policies on administrative sessions after 10 minutes of inactivity to prevent physical terminal hijacking in open workspaces.",
      category: "Access Control",
      submittedAt: "2026-07-09",
      status: "PENDING_REVIEW"
    },
    {
      id: "SUG-2026-002",
      name: "Jessica Chen",
      department: "Engineering",
      suggestion: "Let's automate SSL/TLS expiry checks using a daily cron script on our SIEM broker instead of relying on calendar reminders to avoid unexpected certificate outages.",
      category: "Network Security",
      submittedAt: "2026-07-10",
      status: "PENDING_REVIEW"
    },
    {
      id: "SUG-2026-003",
      name: "Marcus Vance",
      department: "Security Operations",
      suggestion: "Implement a one-click phishing report button directly in our corporate mail client to log suspect headers straight to the InfoShield API and automate containment playbooks.",
      category: "Phishing Simulation",
      submittedAt: "2026-07-11",
      status: "PENDING_REVIEW"
    },
    {
      id: "SUG-2026-004",
      name: "Elena Rostova",
      department: "Legal & Compliance",
      suggestion: "Draft and enforce a standard Acceptable Use Policy (AUP) for commercial Generative AI assistants to block employees from submitting proprietary IP or source code.",
      category: "Information Security Policy",
      submittedAt: "2026-07-12",
      status: "PENDING_REVIEW"
    },
    {
      id: "SUG-2026-005",
      name: "David Kim",
      department: "DevOps & Infrastructure",
      suggestion: "Configure our CI/CD runner pipelines to obtain short-lived OIDC federation tokens instead of storing persistent SSH keys as global repository secrets.",
      category: "System Integrity",
      submittedAt: "2026-07-13",
      status: "PENDING_REVIEW"
    }
  ];

  const [employeeSuggestions, setEmployeeSuggestions] = useState<EmployeeSuggestion[]>(() => {
    const saved = localStorage.getItem("iso27001_employee_suggestions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return defaultSuggestions;
  });

  const [suggestionFormName, setSuggestionFormName] = useState("");
  const [suggestionFormDept, setSuggestionFormDept] = useState("Engineering");
  const [suggestionFormText, setSuggestionFormText] = useState("");
  const [suggestionFormCat, setSuggestionFormCat] = useState("Access Control");

  const promoteSuggestionToCapa = (sug: EmployeeSuggestion) => {
    setIsCreatingCapa(true);
    setCapaFormTitle(`Suggestion Ref ${sug.id}: Session Lockouts`);
    setCapaFormRef(`Clause 10.2 / Employee Feedback ${sug.id}`);
    setCapaFormSeverity("MEDIUM");
    setCapaFormOwner(`${sug.name} (${sug.department})`);
    setCapaFormDesc(`Audit feedback submitted by ${sug.name} (${sug.department}):\n\n"${sug.suggestion}"`);
    setCapaFormRca("Evaluation of administrative and technical policy changes triggered by employee proactive reporting portal.");
    setCapaFormAction("1) Technical review of suggested configuration overrides.\n2) Rollout platform-wide group policy updates to enforce inactivity lockouts.");
    setCapaFormDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);

    // Mark suggestion as Promoted
    const updated: EmployeeSuggestion = { ...sug, status: "PROMOTED_TO_CAPA" };
    setEmployeeSuggestions(prev => prev.map(s => s.id === sug.id ? updated : s));
    saveDocument("iso27001_employee_suggestions", sug.id, updated);
    triggerBannerAlert(`Suggestion ${sug.id} loaded into CAPA entry form!`);
  };

  // UI Navigation States
  const [activeMode, setActiveMode] = useState<"clauses" | "controls">("clauses");
  const [expandedClause, setExpandedClause] = useState<number | null>(4); // Default expand Clause 4
  const [selectedItemId, setSelectedItemId] = useState<string>("iso-sub-4.1");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "ready" | "pending">("all");

  // Sync Checklist Progress from Firestore Document
  useEffect(() => {
    // Initial loading from local storage as quick cache
    try {
      const storedDocs = localStorage.getItem("iso27001_audit_docs");
      const storedEvidence = localStorage.getItem("iso27001_audit_evidence");
      const storedNotes = localStorage.getItem("iso27001_audit_notes");
      if (storedDocs) setReadyDocs(JSON.parse(storedDocs));
      if (storedEvidence) setReadyEvidence(JSON.parse(storedEvidence));
      if (storedNotes) setAuditNotes(JSON.parse(storedNotes));
    } catch (e) {}

    const unsubscribe = syncDocument<any>(
      "compliance",
      "iso27001",
      (data) => {
        if (data) {
          if (Array.isArray(data.readyDocs)) {
            setReadyDocs(data.readyDocs);
            localStorage.setItem("iso27001_audit_docs", JSON.stringify(data.readyDocs));
          }
          if (Array.isArray(data.readyEvidence)) {
            setReadyEvidence(data.readyEvidence);
            localStorage.setItem("iso27001_audit_evidence", JSON.stringify(data.readyEvidence));
          }
          if (data.auditNotes) {
            setAuditNotes(data.auditNotes);
            localStorage.setItem("iso27001_audit_notes", JSON.stringify(data.auditNotes));
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

  // Sync CAPA items from Firestore Collection
  useEffect(() => {
    const unsubscribe = syncCollection<CapaItem>(
      "iso27001_capa_items",
      (items) => {
        setCapaItems(items);
        localStorage.setItem("iso27001_capa_items", JSON.stringify(items));
      },
      capaItems.length > 0 ? capaItems : defaultCapaItems
    );
    return () => unsubscribe();
  }, []);

  // Sync Employee Suggestions from Firestore Collection
  useEffect(() => {
    const unsubscribe = syncCollection<EmployeeSuggestion>(
      "iso27001_employee_suggestions",
      (items) => {
        setEmployeeSuggestions(items);
        localStorage.setItem("iso27001_employee_suggestions", JSON.stringify(items));
      },
      employeeSuggestions.length > 0 ? employeeSuggestions : defaultSuggestions
    );
    return () => unsubscribe();
  }, []);

  // Save states helper (also updates Firestore)
  const saveState = (docs: string[], ev: string[], notes: Record<string, string>) => {
    localStorage.setItem("iso27001_audit_docs", JSON.stringify(docs));
    localStorage.setItem("iso27001_audit_evidence", JSON.stringify(ev));
    localStorage.setItem("iso27001_audit_notes", JSON.stringify(notes));
    saveDocument("compliance", "iso27001", {
      readyDocs: docs,
      readyEvidence: ev,
      auditNotes: notes
    });
  };

  // Check if item is fully ready (both checked)
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

  // Calculate Progress Stats
  const getAllItems = () => {
    const clauses = CLAUSES_DATA.flatMap(g => g.subClauses);
    return [...clauses, ...CONTROLS_DATA];
  };

  const allItems = getAllItems();
  const readyCount = allItems.filter(i => isItemFullyReady(i.id)).length;
  const overallPercentage = allItems.length > 0 ? Math.round((readyCount / allItems.length) * 100) : 0;

  // Toggle checklist states
  const handleToggleDoc = (id: string) => {
    if (activeRole === "Auditor") {
      triggerBannerAlert("ACCESS DENIED: Auditors have read-only permissions on checklists.");
      return;
    }
    const updated = readyDocs.includes(id)
      ? readyDocs.filter(item => item !== id)
      : [...readyDocs, id];
    setReadyDocs(updated);
    saveState(updated, readyEvidence, auditNotes);
    
    // Alert user
    const target = allItems.find(i => i.id === id);
    if (target) {
      const isNowOk = updated.includes(id);
      if (isNowOk && readyEvidence.includes(id)) {
        triggerBannerAlert(`COMPLIANT: ${target.code} is now FULLY AUDIT READY!`);
      } else {
        triggerBannerAlert(`${isNowOk ? "Policy Document Checked" : "Policy Document Cleared"} for ${target.code}`);
      }
    }
  };

  const handleToggleEvidence = (id: string) => {
    if (activeRole === "Auditor") {
      triggerBannerAlert("ACCESS DENIED: Auditors have read-only permissions on checklists.");
      return;
    }
    const updated = readyEvidence.includes(id)
      ? readyEvidence.filter(item => item !== id)
      : [...readyEvidence, id];
    setReadyEvidence(updated);
    saveState(readyDocs, updated, auditNotes);

    // Alert user
    const target = allItems.find(i => i.id === id);
    if (target) {
      const isNowOk = updated.includes(id);
      if (isNowOk && readyDocs.includes(id)) {
        triggerBannerAlert(`COMPLIANT: ${target.code} is now FULLY AUDIT READY!`);
      } else {
        triggerBannerAlert(`${isNowOk ? "Audit Evidence Linked" : "Audit Evidence Cleared"} for ${target.code}`);
      }
    }
  };

  const handleToggleItemMaster = (id: string) => {
    if (activeRole === "Auditor") {
      triggerBannerAlert("ACCESS DENIED: Auditors have read-only permissions.");
      return;
    }
    const fullyReady = isItemFullyReady(id);
    let updatedDocs = [...readyDocs];
    let updatedEv = [...readyEvidence];

    if (fullyReady) {
      updatedDocs = updatedDocs.filter(item => item !== id);
      updatedEv = updatedEv.filter(item => item !== id);
      triggerBannerAlert(`Reset status of item ${id} to pending.`);
    } else {
      if (!updatedDocs.includes(id)) updatedDocs.push(id);
      if (!updatedEv.includes(id)) updatedEv.push(id);
      triggerBannerAlert(`SUCCESS: Marked ${id} as fully compliant.`);
    }

    setReadyDocs(updatedDocs);
    setReadyEvidence(updatedEv);
    saveState(updatedDocs, updatedEv, auditNotes);
  };

  const handleSaveNotes = (id: string, text: string) => {
    const updated = { ...auditNotes, [id]: text };
    setAuditNotes(updated);
    saveState(readyDocs, readyEvidence, updated);
  };

  // Quick sandbox commands
  const handleQuickComplete = () => {
    if (activeRole === "Auditor") {
      triggerBannerAlert("ACCESS DENIED: Auditors cannot modify checklists.");
      return;
    }
    const allIds = allItems.map(item => item.id);
    setReadyDocs(allIds);
    setReadyEvidence(allIds);
    saveState(allIds, allIds, auditNotes);
    triggerBannerAlert("DEMO ORCHESTRATION: Filled all ISO 27001 checklists and evidences as Compliant (100% compliant).");
  };

  const handleResetChecklist = () => {
    if (activeRole === "Auditor") {
      triggerBannerAlert("ACCESS DENIED: Auditors cannot modify checklists.");
      return;
    }
    if (window.confirm("Reset all ISO 27001 readiness checks? This will delete all checked policies, evidence files, and notes.")) {
      setReadyDocs([]);
      setReadyEvidence([]);
      setAuditNotes({});
      saveState([], [], {});
      triggerBannerAlert("Successfully cleared and reset all ISO 27001 audit progress databases.");
    }
  };

  const handleDownloadCsv = () => {
    try {
      let csv = "data:text/csv;charset=utf-8,";
      csv += "ISO Reference,Type,Title,Requirement Detail,Document Required,Document Ready,Evidence Required,Evidence Ready,Audit Status,Audit Notes\n";
      
      allItems.forEach(item => {
        const isDocOk = readyDocs.includes(item.id) ? "READY" : "MISSING";
        const isEvOk = readyEvidence.includes(item.id) ? "VERIFIED" : "PENDING";
        const status = isItemFullyReady(item.id) ? "AUDIT_READY" : "IN_PROGRESS";
        const note = (auditNotes[item.id] || "").replace(/"/g, '""');

        const row = [
          `"${item.code}"`,
          `"${"category" in item ? "ANNEX_A_CONTROL" : "CORE_CLAUSE"}"`,
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
      link.setAttribute("download", `InfoShield_ISO_27001_Audit_Readiness_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerBannerAlert("Successfully compiled and downloaded standard ISO 27001:2022 workbook.");
    } catch (e) {
      console.error(e);
      triggerBannerAlert("Error exporting CSV data sheet.");
    }
  };

  // Get active item object
  const getSelectedObject = () => {
    return allItems.find(i => i.id === selectedItemId) || allItems[0];
  };

  const activeItem = getSelectedObject();

  // Helper to count progress on subclauses of a ClauseGroup
  const getClauseProgress = (group: ClauseGroup) => {
    const total = group.subClauses.length;
    const ready = group.subClauses.filter(sc => isItemFullyReady(sc.id)).length;
    const pct = total > 0 ? Math.round((ready / total) * 100) : 0;
    return { total, ready, pct };
  };

  // Styles
  const c_card = isLight 
    ? "bg-white border-slate-200 shadow-sm text-slate-950" 
    : "bg-slate-900 border-slate-850 text-slate-50 shadow-[0_4px_20px_rgba(0,0,0,0.3)]";
  const c_subcard = isLight ? "bg-slate-50 border-slate-150 hover:bg-slate-100/50 text-slate-900" : "bg-slate-950/40 border-slate-850 hover:bg-slate-950/70 text-slate-100";
  const c_input = isLight ? "bg-slate-50 border-slate-200 text-slate-950 focus:border-cyan-500 font-medium" : "bg-slate-950 border-slate-850 text-slate-50 focus:border-cyan-500 font-medium";

  return (
    <div className="space-y-6" id="iso-audit-page">
      {/* Top Banner and Scorecard */}
      <div className={`p-6 rounded-xl border flex flex-col xl:flex-row gap-6 items-center justify-between ${c_card}`}>
        <div className="space-y-1 text-center xl:text-left max-w-xl">
          <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2">
            <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wider uppercase">
              Regulatory Core
            </span>
            <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wider uppercase">
              ISO/IEC 27001:2022
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight font-sans">
            ISO 27001 Audit Readiness Check
          </h2>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>
            Audit-ready checklist mapping administrative ISMS Clauses (4 to 10) and technological controls. Select, verify mandatory documentation, link inspection evidence, and sign off compliance.
          </p>
        </div>

        {/* Global Progress Rings */}
        <div className="flex items-center gap-6">
          <div className={`p-4 rounded-xl border flex items-center gap-4 ${isLight ? "bg-slate-50 border-slate-150" : "bg-slate-950/40 border-slate-850"}`}>
            <div className="relative flex items-center justify-center w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="34" strokeWidth="5" stroke={isLight ? "#e2e8f0" : "#111827"} fill="transparent" />
                <circle cx="40" cy="40" r="34" strokeWidth="5" stroke="#06b6d4" fill="transparent" 
                        strokeDasharray={213} strokeDashoffset={213 - (213 * overallPercentage) / 100} 
                        className="transition-all duration-500" />
              </svg>
              <span className="absolute text-sm font-extrabold font-mono text-cyan-400">{overallPercentage}%</span>
            </div>
            <div>
              <p className={`text-[10px] font-mono uppercase tracking-widest ${isLight ? "text-slate-600 font-semibold" : "text-slate-500"}`}>ISMS Status</p>
              <p className="text-sm font-extrabold font-sans">Audit Readiness</p>
              <p className={`text-[10px] ${isLight ? "text-slate-600 font-medium" : "text-slate-400"} font-mono mt-0.5`}>
                {readyCount}/{allItems.length} Elements Approved
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tab switcher */}
      <div className="flex border-b border-slate-800/10 pb-1 gap-2">
        <button
          onClick={() => {
            setMainTab("checklist");
            setIsCreatingCapa(false);
          }}
          className={`px-4 py-2.5 border-b-2 text-xs font-mono font-bold tracking-wider uppercase transition flex items-center gap-2 cursor-pointer ${
            mainTab === "checklist"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          📋 Standard Audit Checklist
        </button>
        <button
          onClick={() => setMainTab("capa")}
          className={`px-4 py-2.5 border-b-2 text-xs font-mono font-bold tracking-wider uppercase transition flex items-center gap-2 cursor-pointer ${
            mainTab === "capa"
              ? "border-purple-500 text-purple-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          🔄 Continual Improvement & CAPA Registry
          <span className="text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-mono font-bold">
            {capaItems.filter(c => c.status !== "RESOLVED_VERIFIED").length} Active
          </span>
        </button>
      </div>

      {mainTab === "checklist" ? (
        /* Main Dual Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column Explorer (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Controls vs Clauses Mode Switcher */}
          <div className={`p-4 rounded-xl border space-y-3.5 ${c_card}`}>
            <div className="flex p-1 rounded-lg bg-slate-950/60 border border-slate-850/50">
              <button
                onClick={() => {
                  setActiveMode("clauses");
                  // Auto select first clause
                  setSelectedItemId("iso-sub-4.1");
                }}
                className={`flex-1 py-2 text-center rounded-md font-sans text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
                  activeMode === "clauses"
                    ? "bg-cyan-600 text-slate-950 font-bold shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                📜 Clauses 4 to 10
              </button>
              <button
                onClick={() => {
                  setActiveMode("controls");
                  // Auto select first control
                  setSelectedItemId("iso-ctrl-a5.15");
                }}
                className={`flex-1 py-2 text-center rounded-md font-sans text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
                  activeMode === "controls"
                    ? "bg-cyan-600 text-slate-950 font-bold shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                ⚙️ Annex A Controls
              </button>
            </div>

            {/* Quick Search and Status Filter */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search code, title, or required files..."
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
                          ? "bg-white text-cyan-600 shadow-sm border border-slate-200"
                          : "bg-slate-800 text-cyan-300 font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {sf === "all" ? "All Targets" : sf === "ready" ? "✓ Ready" : "⏰ Pending"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Cascading Clauses Menu */}
          <div className={`p-4 rounded-xl border space-y-3 ${c_card}`}>
            <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isLight ? "text-slate-700 border-slate-200" : "text-slate-400 border-slate-800/20"} border-b pb-2 flex justify-between items-center`}>
              <span>{activeMode === "clauses" ? "ISMS Section Blueprint" : "Technical Controls Index"}</span>
              <span className={`text-[10px] ${isLight ? "text-slate-600 font-medium" : "text-slate-500"}`}>{activeMode === "clauses" ? "Clauses 4-10" : "Annex A"}</span>
            </h3>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {activeMode === "clauses" ? (
                // Clauses cascading expand menu
                CLAUSES_DATA.map((group) => {
                  const isExpanded = expandedClause === group.number;
                  const { total, ready, pct } = getClauseProgress(group);

                  // Filter the subClauses of this group based on search and statusFilter
                  const filteredSubs = group.subClauses.filter(sc => {
                    const textMatch = searchQuery === "" ||
                      sc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      sc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      sc.description.toLowerCase().includes(searchQuery.toLowerCase());
                    const isReady = isItemFullyReady(sc.id);
                    let statusMatch = true;
                    if (statusFilter === "ready") statusMatch = isReady;
                    if (statusFilter === "pending") statusMatch = !isReady;
                    return textMatch && statusMatch;
                  });

                  if (searchQuery !== "" && filteredSubs.length === 0) return null;

                  return (
                    <div key={group.number} className="border border-slate-800/10 rounded-lg overflow-hidden">
                      {/* Accordion Trigger */}
                      <button
                        onClick={() => setExpandedClause(isExpanded ? null : group.number)}
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
                              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" 
                              : isLight ? "bg-slate-100 text-slate-600 border border-slate-200" : "bg-slate-850 text-slate-500 border border-slate-800"
                          }`}>
                            {ready}/{total}
                          </span>
                          {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                        </div>
                      </button>

                      {/* Cascade list */}
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
                              <p className={`text-[10px] ${isLight ? "text-slate-600" : "text-slate-500"} italic p-3 text-center`}>No matching sub-clauses under this section.</p>
                            ) : (
                              filteredSubs.map((sc) => {
                                const isSelected = selectedItemId === sc.id;
                                const isReady = isItemFullyReady(sc.id);
                                const pct = getControlPercent(sc.id);
                                return (
                                  <button
                                    key={sc.id}
                                    onClick={() => setSelectedItemId(sc.id)}
                                    className={`w-full p-2.5 rounded-md text-left transition relative flex flex-col gap-2 ${
                                      isSelected
                                        ? isLight 
                                          ? "bg-cyan-50 text-cyan-800 border-l-4 border-cyan-500 font-semibold pl-3"
                                          : "bg-cyan-950/30 text-cyan-400 border-l-4 border-cyan-500 font-medium pl-3"
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
                                          {sc.code}
                                        </span>
                                        <span className={`text-xs font-bold truncate block max-w-[180px] ${isSelected ? (isLight ? "text-cyan-950" : "text-cyan-300") : (isLight ? "text-slate-850" : "text-slate-200")}`}>{sc.title}</span>
                                      </div>
                                      {isReady ? (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                      ) : isItemPartiallyReady(sc.id) ? (
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
                })
              ) : (
                // Annex A controls listed out
                CONTROLS_DATA.filter((ctrl) => {
                  const textMatch = searchQuery === "" ||
                    ctrl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    ctrl.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    ctrl.description.toLowerCase().includes(searchQuery.toLowerCase());
                  const isReady = isItemFullyReady(ctrl.id);
                  let statusMatch = true;
                  if (statusFilter === "ready") statusMatch = isReady;
                  if (statusFilter === "pending") statusMatch = !isReady;
                  return textMatch && statusMatch;
                }).map((ctrl) => {
                  const isSelected = selectedItemId === ctrl.id;
                  const isReady = isItemFullyReady(ctrl.id);

                  return (
                    <button
                      key={ctrl.id}
                      onClick={() => setSelectedItemId(ctrl.id)}
                      className={`w-full p-3 rounded-lg border text-left transition relative flex flex-col gap-3 justify-between ${
                        isSelected
                          ? isLight ? "bg-cyan-50 border-cyan-400 pl-4" : "bg-cyan-950/30 border-cyan-500/50 pl-4"
                          : c_subcard
                      }`}
                    >
                      {isSelected && <span className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500" />}
                      <div className="flex items-start justify-between w-full">
                        <div className="space-y-1 pr-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded font-mono font-extrabold text-[9px] ${
                              isLight ? "bg-slate-100 border border-slate-200 text-slate-700" : "bg-slate-850 border border-slate-800 text-slate-300"
                            }`}>
                              {ctrl.code}
                            </span>
                            <span className={`text-[9px] ${isLight ? "text-slate-600" : "text-slate-500"} font-mono uppercase tracking-widest`}>{ctrl.category}</span>
                          </div>
                          <h4 className={`text-xs font-bold ${isSelected ? (isLight ? "text-cyan-950" : "text-cyan-300") : (isLight ? "text-slate-800" : "text-slate-200")}`}>{ctrl.title}</h4>
                          <p className={`text-[10px] ${isLight ? "text-slate-800 font-semibold" : "text-slate-300"} font-sans line-clamp-1`}>{ctrl.description}</p>
                        </div>

                        {isReady ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        ) : isItemPartiallyReady(ctrl.id) ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                        ) : null}
                      </div>

                      {/* Animated Progress Bar */}
                      <div className="w-full bg-slate-200/50 dark:bg-slate-950/40 h-1.5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${getControlPercent(ctrl.id)}%` }}
                          transition={{ duration: 0.3 }}
                          className={`h-full ${
                            getControlPercent(ctrl.id) === 100 
                              ? "bg-emerald-500" 
                              : getControlPercent(ctrl.id) === 50 
                                ? "bg-amber-500" 
                                : "bg-transparent"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Core Audit Operations Block */}
          <div className={`p-4 rounded-xl border space-y-3.5 ${c_card}`}>
            <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-400"}`}>{isLiveEnvironment ? "ISMS Live Audit Operations" : "ISMS Sandbox Operations"}</h4>
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
              className="w-full py-2.5 rounded-lg text-[10.5px] font-mono font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.15)] cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Export Verifiable ISO Audit CSV Workbook
            </button>
          </div>

        </div>

        {/* Right Column Active Detail Card (7 Columns) */}
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
                      <span className="px-2.5 py-1 rounded font-mono font-bold text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                        {activeItem.code}
                      </span>
                      <span className={`text-[10px] font-mono uppercase tracking-widest ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                        {"category" in activeItem ? "Annex A Control Spec" : "ISO 27001 Clauses 4-10 Framework"}
                      </span>
                    </div>

                    <div>
                      {isItemFullyReady(activeItem.id) ? (
                        <span className="px-3 py-1 text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center gap-1 shadow-[0_0_8px_rgba(52,211,153,0.1)]">
                          <CheckCircle2 className="h-3.5 w-3.5" /> COMPLIANT
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="h-3.5 w-3.5" /> PENDING INSPECTION
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
                        <span className={isLight ? "text-slate-600 font-bold" : "text-slate-400"}>Control Attestation Progress</span>
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
                          {readyDocs.includes(activeItem.id) ? "✓ Document Prepared" : "✗ Document Pending"}
                        </span>
                        <span className={readyEvidence.includes(activeItem.id) ? "text-emerald-400 font-bold" : "text-slate-500"}>
                          {readyEvidence.includes(activeItem.id) ? "✓ Evidence Verified" : "✗ Evidence Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed ISO Standard Requirement */}
                <div className={`p-4 rounded-xl border space-y-2 ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-850/50"}`}>
                  <div className="flex items-center gap-1.5 text-cyan-500">
                    <Shield className="h-4 w-4 text-cyan-500" />
                    <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-cyan-500">
                      1. What the Standard Says
                    </span>
                  </div>
                  <p className={`text-xs ${isLight ? "text-slate-900 font-extrabold bg-slate-100/50 p-2 rounded border border-slate-200/40" : "text-slate-100"} leading-relaxed font-serif italic`}>
                    {activeItem.standardRequirement || (
                      "category" in activeItem 
                        ? `Annex A Control ${activeItem.code} requires technical consistency and governance of ${activeItem.title.toLowerCase()}.`
                        : `ISO 27001 Clause ${activeItem.code} requires establishing clear organizational framework rules for ${activeItem.title.toLowerCase()}.`
                    )}
                  </p>
                </div>

                {/* Audit Criteria Required Files */}
                <div className="space-y-4">
                  <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-500"}`}>
                    Mandatory Audit Evidence Criteria
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Documentation criteria */}
                    <div
                      onClick={() => handleToggleDoc(activeItem.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 relative flex flex-col justify-between ${
                        readyDocs.includes(activeItem.id)
                          ? "bg-cyan-950/20 border-cyan-500/40"
                          : isLight ? "bg-slate-50 border-slate-200 hover:bg-slate-100" : "bg-slate-950/30 border-slate-850 hover:bg-slate-950/70"
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold font-mono flex items-center gap-1.5 ${isLight ? "text-slate-800" : ""}`}>
                            <FileText className={`h-3.5 w-3.5 ${readyDocs.includes(activeItem.id) ? (isLight ? "text-cyan-600" : "text-cyan-400") : "text-slate-500"}`} />
                            2. Policy / Document
                          </span>
                          <input
                            type="checkbox"
                            checked={readyDocs.includes(activeItem.id)}
                            readOnly
                            disabled={activeRole === "Auditor"}
                            className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className={`text-[11.5px] font-extrabold ${isLight ? "text-slate-800" : "text-slate-100"}`}>
                            {activeItem.documentRequired}
                          </p>
                          <div className={`border-t ${isLight ? "border-slate-200" : "border-slate-800/10"} pt-1.5 mt-1.5`}>
                            <p className={`text-[9px] font-mono uppercase ${isLight ? "text-cyan-800" : "text-cyan-400"} tracking-wider font-extrabold`}>What the Policy should entail:</p>
                            <p className={`text-[11px] ${isLight ? "text-slate-900 font-bold" : "text-slate-200"} leading-relaxed mt-1 whitespace-pre-line`}>
                              {activeItem.documentEntail || "Must contain the formal policy statements, operational objectives, and executive sign-off approval headers."}
                            </p>
                          </div>
                        </div>
                      </div>

                      {readyDocs.includes(activeItem.id) && (
                        <span className="self-start mt-3 text-[8px] font-mono bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded uppercase font-bold">
                          ✓ DRAFTED & PUBLISHED
                        </span>
                      )}
                    </div>

                    {/* Evidence criteria */}
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
                          ✓ EVIDENCE LOGGED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Active master trigger buttons */}
                  {activeRole !== "Auditor" && (
                    <button
                      onClick={() => handleToggleItemMaster(activeItem.id)}
                      className={`w-full py-2.5 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                        isItemFullyReady(activeItem.id)
                          ? "bg-red-950/20 border-red-900/30 text-red-400 hover:bg-red-950/30"
                          : "bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                      }`}
                    >
                      {isItemFullyReady(activeItem.id) ? (
                        "⏰ Clear Preparedness Status (Set Pending)"
                      ) : (
                        "✓ Mark Clause & Evidence as Fully Compliant"
                      )}
                    </button>
                  )}
                </div>

                 {/* Professional Advisor insights box */}
                <div className={`p-4 rounded-xl border space-y-1.5 ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-850/50"}`}>
                  <div className="flex items-center gap-1.5 text-cyan-500">
                    <Sparkles className={`h-4 w-4 animate-spin ${isLight ? "text-cyan-600" : "text-cyan-400"}`} style={{ animationDuration: "12s" }} />
                    <span className={`text-xs font-mono font-extrabold uppercase tracking-widest ${isLight ? "text-cyan-700" : "text-cyan-400"}`}>
                      4. Assessor's Compliance Advisory
                    </span>
                  </div>
                  <p className={`text-xs ${isLight ? "text-slate-700 font-medium" : "text-slate-300"} leading-normal whitespace-pre-line`}>
                    {activeItem.complianceAdvice || (
                      "category" in activeItem ? (
                        `Annex A Control ${activeItem.code} requires technical consistency. Always keep active SIEM alarms configured, restrict direct root logins, and verify that any access granted corresponds strictly to role requirements.`
                      ) : (
                        `ISO 27001 Clause ${activeItem.code} defines your Information Security Management System. Remember that a policy is only audit-proof if you have documented audit trail records proving your team actively reviews, publishes, and adapts it to changing corporate context yearly.`
                      )
                    )}
                  </p>
                </div>

                {/* AI Evidence & Policy Generator Workspace */}
                <EvidenceDocGenerator
                  standard="ISO 27001"
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

                {/* Internal notes input */}
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
                        : "e.g. Action assigned to compliance officers. Core context slides prepared, awaiting CISO approval before Monday..."
                    }
                    value={auditNotes[activeItem.id] || ""}
                    onChange={(e) => handleSaveNotes(activeItem.id, e.target.value)}
                    className={`w-full rounded-lg p-3 text-xs focus:outline-none focus:ring-1 leading-relaxed ${c_input}`}
                  />
                </div>
              </motion.div>
            ) : (
              <div className="p-12 text-center rounded-xl border flex flex-col justify-center items-center h-full space-y-3">
                <Shield className="h-12 w-12 text-slate-600 animate-pulse" />
                <h3 className="text-sm font-bold font-mono text-slate-300 uppercase">No Active Target Selected</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Please select any sub-clause or control from the left menu explorer to begin reviewing evidence specifications.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        </div>
      ) : (
        /* Continual Improvement and CAPA Registry Tab */
        <div className="space-y-6">
          {/* CAPA Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${c_card}`}>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Total Logged CAPA</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-extrabold">{capaItems.length}</span>
                <span className="text-[9px] font-mono text-slate-500">Corporate Registry</span>
              </div>
            </div>
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${c_card}`}>
              <span className="text-[10px] font-mono font-bold text-red-400 uppercase">Open Nonconformities</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-extrabold text-red-400">{capaItems.filter(c => c.status === "OPEN").length}</span>
                <span className="text-[9px] font-mono text-red-500">Immediate Action</span>
              </div>
            </div>
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${c_card}`}>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">In Remediation</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-extrabold text-amber-400">{capaItems.filter(c => c.status === "IN_PROGRESS").length}</span>
                <span className="text-[9px] font-mono text-amber-500">Active Corrective Path</span>
              </div>
            </div>
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${c_card}`}>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Maturity Performance</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-extrabold text-emerald-400">
                  {capaItems.length > 0 ? Math.round((capaItems.filter(c => c.status === "RESOLVED_VERIFIED").length / capaItems.length) * 100) : 0}%
                </span>
                <span className="text-[9px] font-mono text-emerald-500 font-extrabold">Resolved Index</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* CAPA Left List (5 Columns) */}
            <div className="lg:col-span-5 space-y-4">
              <div className={`p-4 rounded-xl border space-y-4 ${c_card}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">CAPA Incident Records</h3>
                  {activeRole !== "Auditor" && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingCapa(true);
                        setCapaFormTitle("");
                        setCapaFormRef("");
                        setCapaFormSeverity("HIGH");
                        setCapaFormOwner("");
                        setCapaFormDesc("");
                        setCapaFormRca("");
                        setCapaFormAction("");
                        setCapaFormDate(new Date().toISOString().split("T")[0]);
                      }}
                      className="px-2.5 py-1 text-[10px] font-mono font-bold bg-purple-600 hover:bg-purple-500 text-slate-950 rounded transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> Log Ticket
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {capaItems.map(item => {
                    const isSelected = item.id === selectedCapaId && !isCreatingCapa;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedCapaId(item.id);
                          setIsCreatingCapa(false);
                        }}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 relative block cursor-pointer ${
                          isSelected
                            ? "border-purple-500 bg-purple-950/10 shadow-sm"
                            : c_subcard
                        }`}
                      >
                        {isSelected && <span className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950/55 border border-slate-800 text-slate-300">
                              {item.id}
                            </span>
                            <span className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              item.status === "RESOLVED_VERIFIED"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : item.status === "IN_PROGRESS"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}>
                              {item.status.replace("_", " ")}
                            </span>
                          </div>

                          <h4 className={`text-xs font-bold leading-snug ${isSelected ? "text-purple-300" : ""}`}>
                            {item.title}
                          </h4>

                          <div className="flex items-center gap-2 pt-1 text-[9px] font-mono text-slate-500">
                            <span className={`font-bold px-1 py-0.2 rounded ${
                              item.severity === "CRITICAL" ? "bg-red-950/40 text-red-400" :
                              item.severity === "HIGH" ? "bg-amber-950/40 text-amber-400" :
                              item.severity === "MEDIUM" ? "bg-cyan-950/40 text-cyan-400" : "bg-slate-950/40 text-slate-400"
                            }`}>
                              {item.severity}
                            </span>
                            <span>• Owner: {item.owner.split(" ")[0]}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Informational Advisory Box */}
              <div className={`p-4 rounded-xl border space-y-2 ${c_card}`}>
                <div className="flex items-center gap-1.5 text-purple-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <Award className="h-4 w-4" /> Continual Clause 10 Guidance
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Corrective and Preventive Action (CAPA) is the cornerstone of <strong>Clause 10 Continual Improvement</strong>. Under ISO 27001, auditors will check if you maintain a standardized registry, capture employee feedback, perform root cause investigations (e.g. 5 Whys), and verify that remedial efforts are successful over time.
                </p>
              </div>
            </div>

            {/* CAPA Right Detail (7 Columns) */}
            <div className="lg:col-span-7">
              {isCreatingCapa ? (
                /* CREATE NEW CAPA TICKET FORM */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!capaFormTitle.trim() || !capaFormDesc.trim() || !capaFormRca.trim() || !capaFormAction.trim()) {
                      triggerBannerAlert("Please fill in all mandatory fields before logging this CAPA ticket.");
                      return;
                    }

                    const newCapa: CapaItem = {
                      id: `CAPA-2026-00${capaItems.length + 1}`,
                      title: capaFormTitle.trim(),
                      standardRef: capaFormRef.trim() || "General ISMS",
                      severity: capaFormSeverity,
                      status: "OPEN",
                      owner: capaFormOwner.trim() || "Security Operations Team",
                      description: capaFormDesc.trim(),
                      rootCause: capaFormRca.trim(),
                      actionPlan: capaFormAction.trim(),
                      targetDate: capaFormDate || new Date().toISOString().split("T")[0],
                      createdAt: new Date().toISOString().split("T")[0]
                    };

                    setCapaItems(prev => [newCapa, ...prev]);
                    saveDocument("iso27001_capa_items", newCapa.id, newCapa);
                    setSelectedCapaId(newCapa.id);
                    setIsCreatingCapa(false);
                    triggerBannerAlert(`SUCCESS: Corrective Action Ticket [${newCapa.id}] logged in database!`);
                  }}
                  className={`p-6 rounded-xl border space-y-4 ${c_card}`}
                >
                  <div className="border-b border-slate-800/10 pb-3 flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-extrabold font-mono uppercase tracking-wider text-purple-400">Log New Corrective/Preventive Action (CAPA)</h3>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Define nonconformity, initiate root cause analysis, and map remediation path.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCreatingCapa(false)}
                      className="px-2.5 py-1 text-[10px] font-mono bg-slate-950 border border-slate-800 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Nonconformity Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Stale SSH keys active on dev box"
                        value={capaFormTitle}
                        onChange={(e) => setCapaFormTitle(e.target.value)}
                        className={`w-full rounded-lg p-2.5 text-xs ${c_input}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Standard / Clause Reference</label>
                      <input
                        type="text"
                        placeholder="e.g. Annex A.5.15 or Clause 9.1"
                        value={capaFormRef}
                        onChange={(e) => setCapaFormRef(e.target.value)}
                        className={`w-full rounded-lg p-2.5 text-xs ${c_input}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Severity Level</label>
                      <select
                        value={capaFormSeverity}
                        onChange={(e) => setCapaFormSeverity(e.target.value as any)}
                        className={`w-full rounded-lg p-2.5 text-xs ${c_input}`}
                      >
                        <option value="CRITICAL">CRITICAL RISK</option>
                        <option value="HIGH">HIGH SEVERITY</option>
                        <option value="MEDIUM">MEDIUM SEVERITY</option>
                        <option value="LOW">LOW RISK</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Assigned Owner *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sarah J. (SecOps Lead)"
                        value={capaFormOwner}
                        onChange={(e) => setCapaFormOwner(e.target.value)}
                        className={`w-full rounded-lg p-2.5 text-xs ${c_input}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Target Resolution Date *</label>
                      <input
                        type="date"
                        required
                        value={capaFormDate}
                        onChange={(e) => setCapaFormDate(e.target.value)}
                        className={`w-full rounded-lg p-2.5 text-xs ${c_input}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Problem Statement & Description *</label>
                    <textarea
                      rows={2.5}
                      required
                      placeholder="What exactly went wrong? Describe the nonconformity, context, and potential risk exposure in detail."
                      value={capaFormDesc}
                      onChange={(e) => setCapaFormDesc(e.target.value)}
                      className={`w-full rounded-lg p-3 text-xs ${c_input}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 font-extrabold text-purple-400">Root Cause Analysis (RCA) *</label>
                    <textarea
                      rows={2.5}
                      required
                      placeholder="e.g. Why did it happen? Describe the failure vector or perform a 5 Whys analysis of the administrative/technical breakdown."
                      value={capaFormRca}
                      onChange={(e) => setCapaFormRca(e.target.value)}
                      className={`w-full rounded-lg p-3 text-xs ${c_input}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Corrective & Preventive Action Plan *</label>
                    <textarea
                      rows={2.5}
                      required
                      placeholder="1) Short-term containment plan to mitigate immediate damage.\n2) Long-term systematic preventive safeguards to prevent recurrence."
                      value={capaFormAction}
                      onChange={(e) => setCapaFormAction(e.target.value)}
                      className={`w-full rounded-lg p-3 text-xs ${c_input}`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-slate-950 font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg transition cursor-pointer"
                  >
                    🚀 Write CAPA Record to ISMS Directory
                  </button>
                </form>
              ) : (() => {
                const item = capaItems.find(c => c.id === selectedCapaId);
                if (!item) {
                  return (
                    <div className="p-12 text-center rounded-xl border flex flex-col justify-center items-center h-full space-y-3">
                      <Shield className="h-12 w-12 text-slate-600 animate-pulse" />
                      <h3 className="text-sm font-bold font-mono text-slate-300 uppercase">No Active CAPA Selected</h3>
                      <p className="text-xs text-slate-500 max-w-xs">Select any Corrective Action record from the list on the left to review root cause analysis and progress.</p>
                    </div>
                  );
                }
                return (
                  <div className={`p-6 rounded-xl border space-y-6 h-full ${c_card}`}>
                    {/* Header */}
                    <div className="border-b border-slate-800/10 pb-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-mono font-extrabold text-xs bg-purple-500/10 border border-purple-500/25 text-purple-400">
                            {item.id}
                          </span>
                          <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-widest">
                            {item.standardRef}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {(["OPEN", "IN_PROGRESS", "RESOLVED_VERIFIED"] as const).map(st => (
                            <button
                              key={st}
                              disabled={activeRole === "Auditor"}
                              type="button"
                              onClick={() => {
                                const updated = { ...item, status: st };
                                setCapaItems(prev => prev.map(c => c.id === item.id ? updated : c));
                                saveDocument("iso27001_capa_items", item.id, updated);
                                triggerBannerAlert(`CAPA Status updated to [${st.replace("_", " ")}] for ${item.id}`);
                              }}
                              className={`px-2 py-1 rounded font-mono text-[8.5px] font-bold transition uppercase cursor-pointer ${
                                item.status === st
                                  ? st === "RESOLVED_VERIFIED"
                                    ? "bg-emerald-500 text-slate-950 font-bold"
                                    : st === "IN_PROGRESS"
                                    ? "bg-amber-500 text-slate-950 font-bold"
                                    : "bg-red-500 text-slate-950 font-bold bg-red-500"
                                  : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-300"
                              }`}
                            >
                              {st.split("_")[0]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <h3 className="text-lg font-extrabold tracking-tight">{item.title}</h3>
                    </div>

                    {/* Section 1: Nonconformity Detail */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">1. Statement of Nonconformity</h4>
                      <div className={`p-4 rounded-xl border leading-relaxed text-xs ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/40 border-slate-850"}`}>
                        {item.description}
                      </div>
                    </div>

                    {/* Section 2: Root Cause Analysis */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">2. Root Cause Analysis (RCA - 5 Whys Mapping)</h4>
                      <div className={`p-4 rounded-xl border leading-relaxed text-xs border-purple-500/25 ${isLight ? "bg-purple-50/20" : "bg-purple-950/5"}`}>
                        <p className="whitespace-pre-line text-[11.5px]">{item.rootCause}</p>
                      </div>
                    </div>

                    {/* Section 3: Remediation Plan */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">3. Corrective & Preventive Action Plan</h4>
                      <div className={`p-4 rounded-xl border leading-relaxed text-xs border-emerald-500/25 ${isLight ? "bg-emerald-50/20" : "bg-emerald-950/5"}`}>
                        <p className="whitespace-pre-line text-[11.5px]">{item.actionPlan}</p>
                      </div>
                    </div>

                    {/* Footer Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800/10 text-[10px] font-mono text-slate-500">
                      <div>
                        <span className="block font-bold uppercase text-slate-400">Assigned Owner</span>
                        <span className="text-xs font-semibold">{item.owner}</span>
                      </div>
                      <div>
                        <span className="block font-bold uppercase text-slate-400">Target Resolution</span>
                        <span className="text-xs font-semibold">{item.targetDate}</span>
                      </div>
                      <div>
                        <span className="block font-bold uppercase text-slate-400">Record Created</span>
                        <span className="text-xs font-semibold">{item.createdAt}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Section: Employee Security Suggestions & Feedback Loop */}
          <div className="border-t border-slate-800/20 pt-8 mt-6">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className={`text-sm font-mono font-bold uppercase tracking-wider ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                Employee Security Suggestions & Feedback (Clause 10.2)
              </h3>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950/20 text-cyan-400 border border-cyan-500/10 font-bold">
                Continual Improvement
              </span>
            </div>

            <p className={`text-xs mb-6 max-w-4xl leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              ISO 27001:2022 requires organisations to establish channels that empower staff to contribute proactive suggestions for improving security posture. Staff can submit ideas here; security leads can review, flag as integrated, or instantly escalate to formal CAPA tickets.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form to submit a new suggestion (4 columns) */}
              <div className="lg:col-span-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!suggestionFormName.trim() || !suggestionFormText.trim()) {
                      triggerBannerAlert("Please provide both your name and suggestion content.");
                      return;
                    }
                    const newSug: EmployeeSuggestion = {
                      id: `SUG-2026-00${employeeSuggestions.length + 1}`,
                      name: suggestionFormName.trim(),
                      department: suggestionFormDept,
                      suggestion: suggestionFormText.trim(),
                      category: suggestionFormCat,
                      submittedAt: new Date().toISOString().split("T")[0],
                      status: "PENDING_REVIEW"
                    };
                    setEmployeeSuggestions(prev => [newSug, ...prev]);
                    saveDocument("iso27001_employee_suggestions", newSug.id, newSug);
                    setSuggestionFormName("");
                    setSuggestionFormText("");
                    triggerBannerAlert(`Thank you! Suggestion ${newSug.id} has been submitted to the compliance queue.`);
                  }}
                  className={`p-5 rounded-xl border space-y-4 ${c_card}`}
                >
                  <h4 className={`text-xs font-mono font-bold uppercase tracking-wider border-b pb-2 ${isLight ? "text-slate-700 border-slate-200" : "text-slate-400 border-slate-850"}`}>
                    Submit Improvement Suggestion
                  </h4>

                  <div className="space-y-1">
                    <label className={`block text-[10px] font-mono font-bold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-400"}`}>Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Liam Thompson"
                      value={suggestionFormName}
                      onChange={(e) => setSuggestionFormName(e.target.value)}
                      className={`w-full rounded-lg p-2.5 text-xs ${c_input}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className={`block text-[10px] font-mono font-bold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-400"}`}>Department</label>
                      <select
                        value={suggestionFormDept}
                        onChange={(e) => setSuggestionFormDept(e.target.value)}
                        className={`w-full rounded-lg p-2 text-[11px] ${c_input}`}
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Operations">Operations</option>
                        <option value="Sales/CS">Sales / CS</option>
                        <option value="HR / Admin">HR / Admin</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className={`block text-[10px] font-mono font-bold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-400"}`}>Category</label>
                      <select
                        value={suggestionFormCat}
                        onChange={(e) => setSuggestionFormCat(e.target.value)}
                        className={`w-full rounded-lg p-2 text-[11px] ${c_input}`}
                      >
                        <option value="Access Control">Access Control</option>
                        <option value="Network Security">Network Security</option>
                        <option value="Physical Security">Physical Security</option>
                        <option value="Incident Response">Incident Response</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className={`block text-[10px] font-mono font-bold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-400"}`}>Improvement Idea *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="What security gap did you notice? How can we resolve or automate it to optimize compliance workloads?"
                      value={suggestionFormText}
                      onChange={(e) => setSuggestionFormText(e.target.value)}
                      className={`w-full rounded-lg p-2.5 text-xs ${c_input}`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold uppercase tracking-wider text-xs rounded-lg transition cursor-pointer"
                  >
                    Submit Suggestion
                  </button>
                </form>
              </div>

              {/* Suggestions Queue & Actions (8 columns) */}
              <div className="lg:col-span-8">
                <div className={`p-5 rounded-xl border h-full ${c_card}`}>
                  <h4 className={`text-xs font-mono font-bold uppercase tracking-wider border-b pb-2 mb-4 ${isLight ? "text-slate-700 border-slate-200" : "text-slate-400 border-slate-850"}`}>
                    Active Feedback Queue ({employeeSuggestions.length})
                  </h4>

                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {employeeSuggestions.length === 0 ? (
                      <p className="text-xs font-mono text-slate-500 text-center py-12 border border-dashed border-slate-800 rounded-lg">
                        No suggestions in the queue. Complete the form to submit one!
                      </p>
                    ) : (
                      employeeSuggestions.map((sug) => (
                        <div
                          key={sug.id}
                          className={`p-3.5 rounded-lg border text-xs leading-relaxed transition ${c_subcard}`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-mono font-bold text-slate-500">
                              [{sug.id}] {sug.submittedAt} | Category: <span className="text-cyan-400">{sug.category}</span>
                            </span>
                            
                            <div className="flex items-center gap-1.5">
                              {sug.status === "PENDING_REVIEW" && (
                                <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  Pending Review
                                </span>
                              )}
                              {sug.status === "PROMOTED_TO_CAPA" && (
                                <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                  Promoted to CAPA
                                </span>
                              )}
                              {sug.status === "INTEGRATED" && (
                                <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Integrated
                                </span>
                              )}
                            </div>
                          </div>

                          <p className={`font-medium ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                            "{sug.suggestion}"
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2.5 border-t border-slate-800/10 text-[10px] font-mono text-slate-500">
                            <span>Submitted by: <strong>{sug.name}</strong> ({sug.department})</span>
                            
                            {activeRole !== "Auditor" && (
                              <div className="flex items-center gap-2">
                                {sug.status === "PENDING_REVIEW" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated: EmployeeSuggestion = { ...sug, status: "INTEGRATED" };
                                        setEmployeeSuggestions(prev => prev.map(s => s.id === sug.id ? updated : s));
                                        saveDocument("iso27001_employee_suggestions", sug.id, updated);
                                        triggerBannerAlert(`Marked suggestion ${sug.id} as integrated!`);
                                      }}
                                      className="px-2 py-0.5 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 rounded transition bg-emerald-500/5 cursor-pointer"
                                    >
                                      Mark Integrated
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => promoteSuggestionToCapa(sug)}
                                      className="px-2 py-0.5 text-[9px] font-bold text-purple-400 hover:text-purple-300 border border-purple-500/20 hover:border-purple-500/40 rounded transition bg-purple-500/5 cursor-pointer"
                                    >
                                      Promote to CAPA
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
