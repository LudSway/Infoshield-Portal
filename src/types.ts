export type UserRole = "CISO" | "SecEngineer" | "Auditor" | "ComplianceOfficer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  mfaEnabled: boolean;
  lastActive: string;
}

export interface SecurityControl {
  id: string;
  code: string;
  framework: "SOC-2" | "ISO-27001" | "HIPAA" | "GDPR";
  title: string;
  status: "COMPLIANT" | "IN_PROGRESS" | "NON_COMPLIANT" | "VERIFYING";
  severity: "LOW" | "MEDIUM" | "HIGH";
  owner: string;
  auditor: string;
  lastEvaluated: string;
}

export interface SiemLog {
  id: string;
  timestamp: string;
  sourceIp: string;
  targetIp: string;
  user: string;
  action: string;
  status: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  signature: string;
  payload: string;
}

export interface VulnerabilityAsset {
  id: string;
  assetName: string;
  ip: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  cve: string;
  status: "OPEN" | "IN_PROGRESS" | "VERIFYING" | "PATCHED";
  title: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "OPEN" | "INVESTIGATING" | "CONTAINED" | "RESOLVED";
  assignedTo: string;
  category: string;
  openedAt: string;
  description: string;
}

export interface PhishingCampaign {
  id: string;
  name: string;
  template: string;
  targetUsers: number;
  sentCount: number;
  clickCount: number;
  reportCount: number;
  status: "ACTIVE" | "COMPLETED" | "DRAFT";
  date: string;
}

export interface TabletopScenario {
  id: string;
  title: string;
  description: string;
  currentStep?: number;
  steps: {
    id: number;
    title: string;
    inject: string;
    question: string;
    options: string[];
    riskDelta: number;
  }[];
}

export interface NodeMetric {
  id: string;
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  cpu: number;
  memory: number;
  activeConnections: number;
  uptime: string;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: "greater" | "less" | "equals";
  value: number | string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  enabled: boolean;
  channel: "Email" | "Slack" | "PagerDuty";
}

export interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  category: "PHISHING" | "MFA" | "COMPLIANCE" | "INCIDENT_RESPONSE" | "CUSTOM";
  estimatedMinutes: number;
  content: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
  materialUrl?: string;
  uploadedBy?: string;
}

export interface TrainingAssignment {
  id: string;
  courseId: string;
  courseTitle: string;
  assignedToUser: string;
  assignedToRole?: UserRole | "ALL";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  completedAt?: string;
  quizScore?: string;
}

export interface BusinessProfile {
  name: string;
  website: string;
  industry: string;
  frameworkFocus: "SOC-2" | "ISO-27001" | "HIPAA" | "GDPR";
  nodeCount: number;
  cloudProvider: "AWS" | "GCP" | "Azure" | "Hybrid";
  recordCount: string;
  pocName: string;
  pocEmail: string;
  onboardedAt: string;
  kmsKeyArn?: string;
  customDomain?: string;
  byokEnabled?: boolean;
  storageQuotaMb?: number;
}

export interface OrgBranding {
  companyLegalName: string;
  tradeName: string;
  taxRegistrationId: string;
  websiteUrl: string;
  primaryAddress: string;
  industry: string;
  employeeHeadcount: string;
  cisoName: string;
  cisoTitle: string;
  cisoEmail: string;
  cisoSignatureText: string;
  customLogoUrl: string;
  policyFooterDisclaimer: string;
  lastUpdated: string;
}

export interface ImprovementItem {
  id: string;
  source: string; // "Vulnerability Scanner", "Incident Workflow", "Phishing Campaign", "SIEM Log Broker", "ISO 27001", "PCI DSS", "Tabletop Exercise", "Employee Suggestion", "Manual Input"
  title: string;
  rootCause: string;
  remediationAction: string;
  assignedTo: string; // Role or individual name
  expectedCloseDate: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  linkedId?: string; // Optional reference to source id (e.g. CVE-2026-001, INC-002, etc.)
  loggedAt: string;
}



