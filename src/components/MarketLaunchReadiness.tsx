import React, { useState } from "react";
import { 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  Server, 
  Cpu, 
  FileCheck2, 
  Users, 
  Activity, 
  ShieldAlert,
  ArrowRight,
  Code,
  Copy,
  Lock,
  RefreshCw,
  TrendingUp,
  Fingerprint
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MarketLaunchReadinessProps {
  theme?: "light" | "dark";
  triggerBannerAlert: (msg: string) => void;
}

interface ReadinessGap {
  id: string;
  title: string;
  category: string;
  icon: React.ComponentType<any>;
  currentStatus: "Implemented (Sandbox)" | "Partially Implemented" | "Planned (Roadmap)";
  statusColor: string;
  description: string;
  subRequirements: { text: string; done: boolean }[];
  technicalApproach: string;
  codeSnippetTitle: string;
  codeSnippet: string;
}

export default function MarketLaunchReadiness({
  theme = "dark",
  triggerBannerAlert
}: MarketLaunchReadinessProps) {
  const isLight = theme === "light";

  // Themes
  const c_card = isLight ? "bg-white border border-slate-200 text-slate-950 shadow-sm" : "bg-slate-900 border border-slate-800 text-slate-50 shadow-[0_4px_20px_rgba(0,0,0,0.3)]";
  const c_subcard = isLight ? "bg-slate-50 border border-slate-200 text-slate-900" : "bg-slate-950 border border-slate-850 text-slate-100";
  const c_muted = isLight ? "text-slate-500 font-sans" : "text-slate-400 font-sans";
  const c_input = isLight ? "bg-slate-50 border border-slate-200 text-slate-950" : "bg-slate-950 border border-slate-850 text-slate-50";

  // State
  const [selectedGap, setSelectedGap] = useState<string>("real-integrations");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  // Gaps List
  const readinessGaps: ReadinessGap[] = [
    {
      id: "real-integrations",
      title: "Real Integrations Engine",
      category: "Enterprise Connectivity",
      icon: Server,
      currentStatus: "Partially Implemented",
      statusColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      description: "Enterprise buyers require seamless integrations with modern SIEM, Ticketing, Cloud Providers, and Identity Access Management (IAM) systems.",
      subRequirements: [
        { text: "SIEM log streaming (Microsoft Sentinel, Splunk)", done: false },
        { text: "Ticketing bi-directional sync (Jira Service Desk, ServiceNow)", done: false },
        { text: "Cloud resource monitors (AWS CloudTrail, GCP Asset Inventory, Azure Monitor)", done: true },
        { text: "Hardware-enforced Single Sign-On (Okta SAML, Azure AD)", done: true }
      ],
      technicalApproach: "Using serverless cloud run queues or pub/sub topics, establish standardized webhook nodes. Telemetry payloads from cloud providers are ingested into `/api/threat-detect`, and high-severity incidents automatically emit JSON-LD payloads to configured enterprise SIEM endpoints.",
      codeSnippetTitle: "Enterprise SIEM Webhook Dispatcher Sample",
      codeSnippet: `// Node.js/TypeScript Secure Webhook Dispatch
export async function dispatchSIEMAlert(incidentId: string, payload: object) {
  const siemEndpoint = process.env.ENTERPRISE_SIEM_WEBHOOK;
  const apiKey = process.env.SIEM_HMAC_SECRET;
  
  if (!siemEndpoint || !apiKey) return;

  const body = JSON.stringify({
    timestamp: new Date().toISOString(),
    schema: "https://infoshield.io/schemas/v1/incident.json",
    incidentId,
    details: payload
  });

  // Secure payload signing with SHA-256 HMAC
  const crypto = require("crypto");
  const signature = crypto.createHmac("sha256", apiKey).update(body).digest("hex");

  await fetch(siemEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shield-Signature": signature
    },
    body
  });
}`
    },
    {
      id: "evidence-integrity",
      title: "Cryptographic Evidence Integrity",
      category: "Audit Assurance",
      icon: FileCheck2,
      currentStatus: "Implemented (Sandbox)",
      statusColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      description: "Compliance records and uploaded evidence files must be tamper-proof, tracked with historical version controls, cryptographically signed, and subject to strict data retention limits.",
      subRequirements: [
        { text: "Immutable audit logs of all user activities (integrated via Firestore)", done: true },
        { text: "SHA-256 integrity hash verification for all file uploads", done: true },
        { text: "Digital signatures on compliance sign-offs and approvals", done: true },
        { text: "Automatic data retention policy scheduler (e.g. 7-year GRC holding)", done: false }
      ],
      technicalApproach: "When a compliance officer uploads evidence, the system calculates a SHA-256 checksum client-side. The file metadata is committed to Firestore with the checksum. Firestore Security Rules enforce that evidence metadata, once written with an active signature, is immutable and cannot be deleted or modified by any user role.",
      codeSnippetTitle: "Immutable Document Validation Rules",
      codeSnippet: `// Firestore Rules demonstrating complete evidence immutability
match /evidence/{evidenceId} {
  allow read: if request.auth != null;
  
  // Immutability Check: Prevent update and delete of signed evidence
  allow create: if request.auth != null && 
                request.resource.data.sha256Hash != null && 
                request.resource.data.digitalSignature != null;
  allow update, delete: if false; 
}`
    },
    {
      id: "multi-tenant-saas",
      title: "Multi-Tenant SaaS Architecture",
      category: "Infrastructure & Scaling",
      icon: Users,
      currentStatus: "Planned (Roadmap)",
      statusColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      description: "Serving multiple enterprise organizations concurrently requires strict logical tenant isolation, database row-level segregation, custom domain resolution, and white-label design assets.",
      subRequirements: [
        { text: "Dynamic tenant scoping via request header interceptors", done: false },
        { text: "Strict row-level data isolation inside database systems", done: true },
        { text: "Configurable white-label branding, logos, and SMTP endpoints", done: false },
        { text: "Domain routing (e.g. partner.infoshield.io)", done: false }
      ],
      technicalApproach: "Enforce multi-tenancy at the database level. Every Firestore collection record contains an `organizationId` index. Secure Firestore Security Rules compare this attribute dynamically against the custom claims stored on the verified JSON Web Token (JWT) of the logged-in user profile, preventing cross-tenant leakage.",
      codeSnippetTitle: "Multi-Tenant Firestore Row Isolation",
      codeSnippet: `// Row-Level Multi-Tenant Data Isolation Rule
match /compliance_records/{recordId} {
  allow read, write: if request.auth != null && 
    resource.data.organizationId == request.auth.token.organizationId;
}`
    },
    {
      id: "automated-testing",
      title: "Automated Control Testing (CCM)",
      category: "Continuous Audit",
      icon: Activity,
      currentStatus: "Partially Implemented",
      statusColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      description: "Move from seasonal, manual evidence snapshots to dynamic Continuous Control Monitoring (CCM) querying APIs around the clock to detect active vulnerabilities and misconfigurations.",
      subRequirements: [
        { text: "Continuous IAM MFA compliance auditing via cloud APIs", done: true },
        { text: "Automated network port scanners checking VPC vulnerability gates", done: true },
        { text: "Scheduled GRC gap checks yielding real-time remediation alerts", done: true },
        { text: "Auto-remediation scripts responding to failed audit gates", done: false }
      ],
      technicalApproach: "Cron microservices run containerized API probes that query configurations (e.g. GCP/AWS API key rotation timers or IAM parameters). If a policy breach occurs (e.g. developer account lacking active MFA), an event is written to Firestore, instantly alerting security personnel via the active incident timeline.",
      codeSnippetTitle: "Scheduled Continuous Control Probe",
      codeSnippet: `// Autonomous continuous audit probe simulating compliance checks
export async function executeContinuousComplianceAudit() {
  const iamReport = await queryIAMDirectories();
  const violations = iamReport.users.filter(u => !u.mfaEnabled);
  
  if (violations.length > 0) {
    await registerComplianceAlert({
      controlId: "iso-gap-a5.15", // Access Control
      severity: "CRITICAL",
      description: \`Detected \${violations.length} active enterprise accounts missing hardware MFA keys.\`,
      remediationPlan: "Trigger mandatory password resets and enforce MFA session lockdowns."
    });
  }
}`
    },
    {
      id: "security-assurance",
      title: "Platform Security & GRC Auditing",
      category: "Platform Hardening",
      icon: Lock,
      currentStatus: "Implemented (Sandbox)",
      statusColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      description: "As a GRC repository for sensitive customer compliance reports, InfoShield itself must utilize maximum defensive features, including robust encryption pipelines, strict session rules, audit trails, and automated backups.",
      subRequirements: [
        { text: "AES-256 resting encryption for Firestore database elements", done: true },
        { text: "Session timeouts, credential rotating prompts, and custom salts", done: true },
        { text: "Comprehensive pen-testing schedules with code scanning pipelines", done: true },
        { text: "Platform GRC self-audit for eventual SOC 2 Type II report", done: false }
      ],
      technicalApproach: "Enforce TLS 1.3 exclusively across all endpoints in transit. Configure server-side API proxy routers to handle any database exchanges or Gemini AI interactions, keeping security credentials strictly secure inside the environment container backend without any client exposures.",
      codeSnippetTitle: "Enterprise Salt & Session Rotation Setup",
      codeSnippet: `// High-security session and cryptographic token verification
import crypto from "crypto";

export function generateCryptoSignOfProof(payload: string, key: string) {
  return crypto
    .createHmac("sha512", key)
    .update(payload)
    .digest("hex");
}`
    }
  ];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    triggerBannerAlert("Technical approach code snippet copied successfully.");
  };

  const currentGap = readinessGaps.find(g => g.id === selectedGap) || readinessGaps[0];
  const CurrentIcon = currentGap.icon;

  // Run Simulated Continuous Control Audit
  const handleSimulateCCM = () => {
    setIsScanning(true);
    setScanResult(null);
    triggerBannerAlert("Initiating continuous control monitoring (CCM) automation suite...");
    
    setTimeout(() => {
      setIsScanning(false);
      setScanResult(`[CCM SCAN REPORT - ${new Date().toISOString()}]
==================================================
STATUS: SCAN COMPLETED WITH WARNINGS
OBJECT: InfoShield Enterprise Cloud Space (GCP Sandbox-01)
--------------------------------------------------
[PASSED] CONTROL A.8.24 (Cryptography) - Verified active TLS 1.3 encryption on all public endpoints.
[PASSED] CONTROL A.8.1  (Endpoint MDM) - Checked 12 MDM laptops; 100% compliant with file-vault locks.
[WARNING] CONTROL A.5.15 (Access Control) - Found 2 testing accounts with disabled MFA protocols.
          -> ACTION INITIATED: Automatic SSO alert triggered for user 'dev-test-01@infoshield.io'.
[PASSED] CONTROL A.8.12 (Data Leakage) - Checked egress nodes; outbound data rate within normal baseline.
==================================================
CCM Engine: "All critical controls in healthy compliance states. Continuous logs synced to Firestore."`);
      triggerBannerAlert("Continuous control sweep finalized. Dynamic audit log submitted.");
    }, 1800);
  };

  return (
    <div className={`p-5 rounded-xl border space-y-6 ${c_card}`} id="market-launch-readiness-module">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-cyan-500" />
            <h3 className="font-bold text-base font-mono uppercase tracking-tight">Market Launch & Compliance Readiness Console</h3>
          </div>
          <p className={`text-xs ${c_muted}`}>Analyze enterprise gap-closures, secure digital evidence pipelines, multi-tenant row-isolation layers, and continuous control monitoring strategies.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSimulateCCM}
            disabled={isScanning}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
              isScanning
                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                : "bg-cyan-600 hover:bg-cyan-500 text-slate-950"
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? "animate-spin" : ""}`} />
            {isScanning ? "Scanning controls..." : "Run CCM Sweep"}
          </button>
        </div>
      </div>

      {/* Main Content: Left Checklist, Right Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
            Enterprise Launch Dimensions:
          </span>
          <div className="space-y-2">
            {readinessGaps.map(gap => {
              const isSelected = gap.id === selectedGap;
              const GapIconComponent = gap.icon;
              return (
                <button
                  key={gap.id}
                  type="button"
                  onClick={() => setSelectedGap(gap.id)}
                  className={`w-full p-3.5 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? "border-cyan-500 bg-cyan-500/5 text-cyan-500"
                      : isLight 
                        ? "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700" 
                        : "bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400"
                  }`}
                >
                  <GapIconComponent className="h-4 w-4 mt-0.5 shrink-0 text-cyan-500" />
                  <div className="space-y-1 overflow-hidden flex-1">
                    <div className="flex justify-between items-center gap-2">
                      <h4 className="text-xs font-bold truncate tracking-tight">{gap.title}</h4>
                      <span className={`text-[8px] px-1.5 py-0.5 font-mono rounded-full font-bold border ${gap.statusColor}`}>
                        {gap.currentStatus.split(" ")[0]}
                      </span>
                    </div>
                    <p className={`text-[10px] truncate ${isLight ? "text-slate-500" : "text-slate-400"}`}>{gap.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Continuous Control Scan Output */}
          <AnimatePresence>
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`p-3.5 rounded-xl border font-mono text-[10px] leading-relaxed relative ${
                  isLight ? "bg-slate-900 text-emerald-400 border-slate-950" : "bg-slate-950 text-emerald-400 border-slate-850"
                }`}
              >
                <div className="flex justify-between items-center mb-1.5 border-b border-slate-800 pb-1.5 text-slate-500">
                  <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                    <Activity className="h-3 w-3 text-cyan-500" /> Continuous Control Sweeper:
                  </span>
                  <button
                    onClick={() => setScanResult(null)}
                    className="text-red-500 hover:underline text-[9px] cursor-pointer"
                  >
                    Close Log
                  </button>
                </div>
                <pre className="max-h-[140px] overflow-auto whitespace-pre leading-relaxed select-all">
                  {scanResult}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Details (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className={`p-5 rounded-xl border space-y-4 ${c_subcard}`}>
            
            {/* Title Block */}
            <div className="flex items-start gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <CurrentIcon className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                  {currentGap.category}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  {currentGap.title}
                  <span className={`text-[9px] font-mono border px-2 py-0.5 rounded ${currentGap.statusColor}`}>
                    {currentGap.currentStatus}
                  </span>
                </h4>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h5 className="text-[10px] font-mono uppercase font-extrabold text-slate-500 tracking-wider">Gap & Constraint Overview</h5>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {currentGap.description}
              </p>
            </div>

            {/* Dynamic Requirements List */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-mono uppercase font-extrabold text-slate-500 tracking-wider">Key Compliance Criteria</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {currentGap.subRequirements.map((req, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${req.done ? "text-emerald-500" : "text-slate-400 dark:text-slate-600"}`} />
                    <span className={req.done ? "text-slate-900 dark:text-slate-300 font-medium" : "text-slate-400 line-through decoration-slate-300 dark:decoration-slate-800"}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Implementation Strategy */}
            <div className="space-y-1.5">
              <h5 className="text-[10px] font-mono uppercase font-extrabold text-slate-500 tracking-wider">Technical Mitigation & Architecture Path</h5>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-sans">
                {currentGap.technicalApproach}
              </p>
            </div>

            {/* Code Snippet Box */}
            <div className={`rounded-xl border p-4 font-mono text-[10px] relative ${
              isLight ? "bg-slate-900 text-slate-100 border-slate-950" : "bg-slate-950 text-slate-300 border-slate-850"
            }`}>
              <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-1.5 text-slate-500">
                <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                  <Code className="h-3.5 w-3.5 text-cyan-500" /> {currentGap.codeSnippetTitle}:
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(currentGap.codeSnippet)}
                  className="text-cyan-500 hover:text-cyan-400 font-bold uppercase text-[9px] cursor-pointer"
                >
                  Copy Snippet
                </button>
              </div>
              <pre className="max-h-[140px] overflow-auto whitespace-pre leading-relaxed select-all">
                {currentGap.codeSnippet}
              </pre>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
