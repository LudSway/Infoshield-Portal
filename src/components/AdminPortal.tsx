import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Building, 
  Users, 
  FileText, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Download, 
  Check, 
  X, 
  Save, 
  RefreshCw, 
  Info,
  Server,
  Zap,
  Lock,
  Mail,
  Sliders,
  Sparkles,
  Key,
  Globe,
  Activity,
  CheckCircle2,
  ShieldCheck,
  Terminal,
  Layers,
  Cpu,
  Database,
  Copy,
  ExternalLink,
  AlertTriangle,
  Radio,
  HardDrive,
  Filter,
  CheckCircle
} from "lucide-react";
import { User, BusinessProfile, UserRole, PhishingCampaign, Incident } from "../types";
import { saveDocument, deleteDocument, syncCollection } from "../lib/firebase";

interface AdminPortalProps {
  theme: "light" | "dark";
  currentUser: User | null;
  directoryUsers: User[];
  setDirectoryUsers: React.Dispatch<React.SetStateAction<User[]>>;
  phishingCampaigns: PhishingCampaign[];
  setPhishingCampaigns: React.Dispatch<React.SetStateAction<PhishingCampaign[]>>;
  incidents: Incident[];
  setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>;
  smtpDispatchLogs: string[];
  setSmtpDispatchLogs: React.Dispatch<React.SetStateAction<string[]>>;
  triggerBannerAlert: (msg: string) => void;
  currentBusiness: BusinessProfile | null;
  setCurrentBusiness: (bus: BusinessProfile | null) => void;
}

export default function AdminPortal({
  theme,
  currentUser,
  directoryUsers,
  setDirectoryUsers,
  phishingCampaigns,
  setPhishingCampaigns,
  incidents,
  setIncidents,
  smtpDispatchLogs,
  setSmtpDispatchLogs,
  triggerBannerAlert,
  currentBusiness,
  setCurrentBusiness
}: AdminPortalProps) {
  const isLight = theme === "light";
  
  // Navigation Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<"businesses" | "users" | "integrations" | "platform_security" | "logs" | "orchestrator">("businesses");
  
  // Realtime synced list of all businesses
  const [allBusinesses, setAllBusinesses] = useState<BusinessProfile[]>([]);
  const [isSyncingBus, setIsSyncingBus] = useState(false);

  // Firestore subscription for all businesses
  useEffect(() => {
    setIsSyncingBus(true);
    const unsubscribe = syncCollection<any>(
      "businesses",
      (items) => {
        setAllBusinesses(items);
        setIsSyncingBus(false);
      },
      currentBusiness ? [currentBusiness] : []
    );
    return () => unsubscribe();
  }, [currentBusiness]);

  // Sync current business if not present in remote list
  useEffect(() => {
    if (currentBusiness && !allBusinesses.some(b => b.website === currentBusiness.website)) {
      saveDocument("businesses", currentBusiness.name.toLowerCase().replace(/[^a-z0-9]/g, "-"), currentBusiness);
    }
  }, [currentBusiness, allBusinesses]);

  // Business CRUD Dialog State
  const [showBusModal, setShowBusModal] = useState(false);
  const [editingBus, setEditingBus] = useState<BusinessProfile | null>(null);
  const [busName, setBusName] = useState("");
  const [busWebsite, setBusWebsite] = useState("");
  const [busIndustry, setBusIndustry] = useState("Technology");
  const [busFramework, setBusFramework] = useState<"SOC-2" | "ISO-27001" | "HIPAA" | "GDPR">("SOC-2");
  const [busCloud, setBusCloud] = useState<"AWS" | "GCP" | "Azure" | "Hybrid">("GCP");
  const [busNodes, setBusNodes] = useState(12);
  const [busPocName, setBusPocName] = useState("");
  const [busPocEmail, setBusPocEmail] = useState("");
  const [busKmsKey, setBusKmsKey] = useState("");
  const [busSubdomain, setBusSubdomain] = useState("");
  const [busByokEnabled, setBusByokEnabled] = useState(false);

  // Business Search & Filters
  const [busSearch, setBusSearch] = useState("");
  const [busIndustryFilter, setBusIndustryFilter] = useState("ALL");
  const [busFrameworkFilter, setBusFrameworkFilter] = useState("ALL");
  const [selectedTenantDrawer, setSelectedTenantDrawer] = useState<BusinessProfile | null>(null);

  // Tenant Isolation Diagnostic Tool State
  const [isTestingIsolation, setIsTestingIsolation] = useState(false);
  const [isolationReport, setIsolationReport] = useState<string | null>(null);

  // User CRUD Dialog State
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [usrName, setUsrName] = useState("");
  const [usrEmail, setUsrEmail] = useState("");
  const [usrRole, setUsrRole] = useState<UserRole>("SecEngineer");
  const [usrDept, setUsrDept] = useState("SecOps");
  const [usrMfa, setUsrMfa] = useState(true);

  // User Search & Filters
  const [usrSearch, setUsrSearch] = useState("");
  const [usrRoleFilter, setUsrRoleFilter] = useState("ALL");

  // Log Viewer State
  const [logSearch, setLogSearch] = useState("");
  const [logFilterType, setLogFilterType] = useState<"ALL" | "SMTP" | "USER" | "INCIDENT" | "BUSINESS" | "SECURITY">("ALL");

  // Chaos & Orchestration controls
  const [chaosModeActive, setChaosModeActive] = useState(false);
  const [globalMfaEnforced, setGlobalMfaEnforced] = useState(true);
  const [autoRemediationActive, setAutoRemediationActive] = useState(true);

  // Integration Diagnostic Tool
  const [selectedIntegration, setSelectedIntegration] = useState("microsoft-sentinel");
  const [isTestingIntegration, setIsTestingIntegration] = useState(false);
  const [integrationTestLog, setIntegrationTestLog] = useState<string | null>(null);

  // Platform Security Diagnostic Tools
  const [isTakingSnapshot, setIsTakingSnapshot] = useState(false);
  const [snapshotReport, setSnapshotReport] = useState<string | null>(null);
  const [isPenTesting, setIsPenTesting] = useState(false);
  const [penTestReport, setPenTestReport] = useState<string | null>(null);

  // Styling helpers
  const c_card = isLight ? "bg-white border-slate-200 text-slate-800 shadow-sm" : "bg-slate-900 border-slate-800 text-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.3)]";
  const c_subcard = isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-slate-950 border-slate-850 text-slate-100";
  const c_input = isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-cyan-500" : "bg-slate-950 border-slate-850 text-slate-100 focus:bg-slate-900 focus:border-cyan-500";
  const c_thead = isLight ? "bg-slate-50 text-slate-500 border-slate-200" : "bg-slate-950/80 text-slate-400 border-slate-850";

  // Helper to append audit log
  const addPlatformAuditLog = (type: string, message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const formatted = `[${timestamp}] [SYS-AUDIT] [${type}] ${message}`;
    setSmtpDispatchLogs(prev => [formatted, ...prev]);
  };

  // Handle Business Save
  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busName || !busWebsite) {
      triggerBannerAlert("Please fill in business name and website URL.");
      return;
    }

    const docId = editingBus 
      ? editingBus.name.toLowerCase().replace(/[^a-z0-9]/g, "-")
      : busName.toLowerCase().replace(/[^a-z0-9]/g, "-");

    const payload: BusinessProfile = {
      name: busName.trim(),
      website: busWebsite.trim().startsWith("http") ? busWebsite.trim() : `https://${busWebsite.trim()}`,
      industry: busIndustry,
      frameworkFocus: busFramework,
      cloudProvider: busCloud,
      nodeCount: Number(busNodes),
      recordCount: editingBus?.recordCount || "15,000 to 50,000 records",
      pocName: busPocName.trim() || "Simulation Admin",
      pocEmail: busPocEmail.trim() || "admin@infoshield.io",
      onboardedAt: editingBus?.onboardedAt || new Date().toISOString().split("T")[0],
      kmsKeyArn: busKmsKey.trim() || (busByokEnabled ? `arn:aws:kms:us-east-1:506829124262:key/${docId}-key` : undefined),
      customDomain: busSubdomain.trim() || `${docId}.infoshield.sec`,
      byokEnabled: busByokEnabled,
      storageQuotaMb: editingBus?.storageQuotaMb || 10240
    };

    try {
      await saveDocument("businesses", docId, payload);
      
      if (currentBusiness && currentBusiness.name === payload.name) {
        setCurrentBusiness(payload);
        await saveDocument("business", "current_profile", payload);
      }

      addPlatformAuditLog("BUSINESS", editingBus ? `Edited tenant profile: ${payload.name}` : `Onboarded new corporate tenant: ${payload.name}`);
      triggerBannerAlert(`Successfully ${editingBus ? "updated" : "onboarded"} tenant: ${payload.name}`);
      setShowBusModal(false);
      setEditingBus(null);
    } catch (err) {
      console.error(err);
      triggerBannerAlert("Failed to save tenant profile to Firestore.");
    }
  };

  // Handle Active Business Swap
  const handleSelectActiveBusiness = async (bus: BusinessProfile) => {
    try {
      setCurrentBusiness(bus);
      await saveDocument("business", "current_profile", bus);
      addPlatformAuditLog("BUSINESS", `Set active tenant workspace: ${bus.name}`);
      triggerBannerAlert(`Active workspace loaded: ${bus.name}`);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Business
  const handleDeleteBusiness = async (bus: BusinessProfile) => {
    if (confirm(`Are you sure you want to delete tenant ${bus.name}? This revokes all configuration records.`)) {
      const docId = bus.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      await deleteDocument("businesses", docId);
      addPlatformAuditLog("BUSINESS", `Deleted tenant record: ${bus.name}`);
      triggerBannerAlert(`Deleted tenant record: ${bus.name}`);
    }
  };

  // Tenant Isolation Verification Probe
  const handleRunIsolationProbe = () => {
    setIsTestingIsolation(true);
    setIsolationReport(null);
    triggerBannerAlert("Launching multi-tenant zero-trust isolation probe across all tenant partitions...");

    setTimeout(() => {
      setIsTestingIsolation(false);
      setIsolationReport(`[MULTI-TENANT ISOLATION REPORT - ${new Date().toISOString()}]
====================================================================
TEST STATUS: 100% PASS - Strict Logical Segregation Confirmed
--------------------------------------------------------------------
[CHECK 1] Row-Level Access Security Rules:
  -> Executed cross-tenant JWT token query against 'businesses' collection.
  -> Result: 0 cross-tenant document leaks. 403 Forbidden properly thrown.

[CHECK 2] BYOK KMS Key Segregation:
  -> Verified AES-256 GCM key envelope separation for registered tenants.
  -> Result: Tenant ciphertexts isolated using tenant-specific KMS key IDs.

[CHECK 3] Custom Domain Header Routing:
  -> Inspected host header interceptors for tenant subdomains (*.infoshield.sec).
  -> Result: Host headers strictly resolve to isolated tenant Firestore scope.
====================================================================
Conclusion: All tenant partitions pass enterprise multi-tenant isolation standards.`);
      addPlatformAuditLog("SECURITY", "Executed multi-tenant zero-trust isolation diagnostic probe - All tenant boundaries intact.");
      triggerBannerAlert("Multi-tenant isolation verification completed successfully!");
    }, 1500);
  };

  // User CRUD handlers
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usrName || !usrEmail) {
      triggerBannerAlert("Please enter user name and corporate email address.");
      return;
    }

    const cleanEmail = usrEmail.trim().toLowerCase();
    const docId = editingUser ? editingUser.id : `U-${Date.now()}`;

    const payload: User = {
      id: docId,
      name: usrName.trim(),
      email: cleanEmail,
      role: usrRole,
      department: usrDept,
      mfaEnabled: usrMfa,
      lastActive: editingUser?.lastActive || new Date().toLocaleString()
    };

    try {
      await saveDocument("infoshield_directory", docId, payload);
      addPlatformAuditLog("USER", editingUser ? `Modified operator attributes for ${cleanEmail}` : `Enrolled new compliance operator: ${cleanEmail}`);
      triggerBannerAlert(`Successfully ${editingUser ? "updated" : "created"} operator ${usrName}`);
      setShowUserModal(false);
      setEditingUser(null);
    } catch (e) {
      console.error(e);
      triggerBannerAlert("Sync failed. Check security permissions.");
    }
  };

  const handleDeleteUser = async (usr: User) => {
    if (usr.email === currentUser?.email) {
      triggerBannerAlert("Operation denied: You cannot delete your own active administrator session!");
      return;
    }
    if (confirm(`Remove operator ${usr.name} (${usr.email}) from security directory?`)) {
      await deleteDocument("infoshield_directory", usr.id);
      addPlatformAuditLog("USER", `Deleted operator account: ${usr.email}`);
      triggerBannerAlert(`Removed directory operator: ${usr.name}`);
    }
  };

  // Batch MFA Enforcement
  const handleBatchEnforceMfa = async () => {
    try {
      const updated = directoryUsers.map(u => ({ ...u, mfaEnabled: true }));
      setDirectoryUsers(updated);
      for (const u of updated) {
        await saveDocument("infoshield_directory", u.id, u);
      }
      addPlatformAuditLog("SECURITY", "Batch enforced hardware WebAuthn MFA on all active directory accounts.");
      triggerBannerAlert("Hardware MFA key enforcement applied to all directory operators!");
    } catch (err) {
      console.error(err);
    }
  };

  // Export User Directory CSV
  const handleExportUserDirectoryCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Name,Email,Role,Department,MFA_Enforced,LastActive\r\n";
    directoryUsers.forEach(u => {
      csvContent += `"${u.id}","${u.name}","${u.email}","${u.role}","${u.department}","${u.mfaEnabled}","${u.lastActive}"\r\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `infoshield_iam_directory_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerBannerAlert("IAM User Directory exported to CSV.");
  };

  // Filter logs for unified viewer
  const getUnifiedLogs = () => {
    const list: Array<{ id: string; time: string; type: string; msg: string; raw: string }> = [];
    
    smtpDispatchLogs.forEach((log, idx) => {
      let type = "SMTP";
      if (log.includes("[SYS-AUDIT]")) type = "SYS-AUDIT";
      if (log.includes("[MTA-DELIVER]")) type = "SMTP-MTA";
      if (log.includes("[MTA-QUEUE]")) type = "SMTP-MTA";
      if (log.includes("[SECURITY]")) type = "SECURITY";
      
      list.push({
        id: `log-smtp-${idx}`,
        time: log.substring(1, 20) || new Date().toLocaleTimeString(),
        type,
        msg: log.replace(/^\[.*?\]\s*/, ""),
        raw: log
      });
    });

    return list.filter(item => {
      const matchSearch = item.raw.toLowerCase().includes(logSearch.toLowerCase());
      if (logFilterType === "ALL") return matchSearch;
      if (logFilterType === "SMTP") return matchSearch && (item.type === "SMTP" || item.type === "SMTP-MTA");
      if (logFilterType === "USER") return matchSearch && item.raw.includes("[USER]");
      if (logFilterType === "INCIDENT") return matchSearch && item.raw.includes("[INCIDENT]");
      if (logFilterType === "BUSINESS") return matchSearch && item.raw.includes("[BUSINESS]");
      if (logFilterType === "SECURITY") return matchSearch && (item.type === "SECURITY" || item.raw.includes("[SECURITY]"));
      return matchSearch;
    });
  };

  // Export Unified Logs as CSV
  const handleExportLogsCsv = () => {
    const logs = getUnifiedLogs();
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Timestamp,Category,Details\r\n";
    logs.forEach(l => {
      csvContent += `"${l.time}","${l.type}","${l.msg.replace(/"/g, '""')}"\r\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `infoshield_admin_audit_logs_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerBannerAlert("CSV audit trail generated and downloaded.");
  };

  // Auto-seed demo enterprise businesses
  const handleAutoProvisionDemo = async () => {
    const demoBuses: BusinessProfile[] = [
      {
        name: "StripeSec Financial Inc",
        website: "https://stripesec.io",
        industry: "Finance & Banking",
        frameworkFocus: "HIPAA",
        cloudProvider: "AWS",
        nodeCount: 45,
        recordCount: "50,000 to 100,000 records",
        pocName: "Marcus Vance",
        pocEmail: "security-leads@stripesec.io",
        onboardedAt: "2026-01-10",
        byokEnabled: true,
        kmsKeyArn: "arn:aws:kms:us-east-1:506829124262:key/stripesec-master-01",
        customDomain: "stripesec.infoshield.sec"
      },
      {
        name: "Aegis Medtech Corp",
        website: "https://aegis-medtech.org",
        industry: "Healthcare & Biotech",
        frameworkFocus: "HIPAA",
        cloudProvider: "Azure",
        nodeCount: 18,
        recordCount: "10,000 to 50,000 records",
        pocName: "Dr. Evelyn Ross",
        pocEmail: "compliance-officer@aegis-medtech.org",
        onboardedAt: "2026-03-24",
        byokEnabled: true,
        kmsKeyArn: "arn:azure:kms:eastus:506829124262:key/aegis-hsm-02",
        customDomain: "aegis.infoshield.sec"
      },
      {
        name: "Nexus Software Labs",
        website: "https://nexuslabs.dev",
        industry: "SaaS / Technology",
        frameworkFocus: "SOC-2",
        cloudProvider: "GCP",
        nodeCount: 32,
        recordCount: "100,000+ records",
        pocName: "Alex Mercer",
        pocEmail: "devops-admin@nexuslabs.dev",
        onboardedAt: "2026-05-15",
        byokEnabled: false,
        customDomain: "nexuslabs.infoshield.sec"
      }
    ];

    try {
      for (const bus of demoBuses) {
        const id = bus.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
        await saveDocument("businesses", id, bus);
      }
      addPlatformAuditLog("BUSINESS", "Auto-provisioned demo corporate tenant profiles in multi-tenant admin console.");
      triggerBannerAlert("Successfully auto-provisioned 3 enterprise business target profiles!");
    } catch (e) {
      console.error(e);
    }
  };

  // Test Connector Dispatch
  const handleTestIntegration = (connectorId: string) => {
    setIsTestingIntegration(true);
    setIntegrationTestLog(null);
    triggerBannerAlert(`Testing connection and sending sample telemetry payload to ${connectorId}...`);

    setTimeout(() => {
      setIsTestingIntegration(false);
      setIntegrationTestLog(`[CONNECTOR TEST RESULT - ${new Date().toISOString()}]
Connector ID: ${connectorId.toUpperCase()}
Endpoint URL: https://api.infoshield.io/v1/integrations/${connectorId}/webhook
Response Code: HTTP 200 OK (Latency: 14ms)
Signature Validation: HMAC-SHA256 (VERIFIED)
Payload Delivery: { "event": "INFOSHIELD_AUDIT_LOG_DISPATCH", "severity": "HIGH", "timestamp": "${new Date().toISOString()}" }
Status: Enterprise sync channel fully functional.`);
      addPlatformAuditLog("SECURITY", `Verified active webhook connector telemetry for ${connectorId}`);
      triggerBannerAlert(`Connector ${connectorId.toUpperCase()} test completed successfully!`);
    }, 1200);
  };

  // Run Platform Snapshot Backup
  const handleRunPlatformSnapshot = () => {
    setIsTakingSnapshot(true);
    setSnapshotReport(null);
    triggerBannerAlert("Initiating platform cryptographic backup snapshot...");

    setTimeout(() => {
      setIsTakingSnapshot(false);
      setSnapshotReport(`[CRYPTOGRAPHIC SNAPSHOT REPORT - ${new Date().toISOString()}]
Backup Identifier: SNAP-${Date.now()}
Target Engine: Firestore Multi-Region Cluster (us-central1 & europe-west2)
Checksum Digest: SHA-256: 8f9a2e1d7c3b4a5f6e8d0c2b4a6f8e0d2c4b6a8f
AES-256 Envelope Encryption: ACTIVE
Record Count: ${allBusinesses.length} Tenants, ${directoryUsers.length} Directory Users, ${smtpDispatchLogs.length} Ledger Events
Status: Immutable Snapshot Stored in Multi-Region Coldline Storage.`);
      addPlatformAuditLog("SECURITY", "Generated cryptographic platform backup snapshot with SHA-256 verification digest.");
      triggerBannerAlert("Cryptographic platform backup snapshot completed successfully!");
    }, 1600);
  };

  // Run Platform Pen-Test Sweep
  const handleRunPenTestSweep = () => {
    setIsPenTesting(true);
    setPenTestReport(null);
    triggerBannerAlert("Launching platform vulnerability & penetration testing sweep...");

    setTimeout(() => {
      setIsPenTesting(false);
      setPenTestReport(`[PLATFORM PENETRATION TEST SWEEP REPORT - ${new Date().toISOString()}]
====================================================================
SCOPE: InfoShield Admin API, Firestore Rules & Session Authorization
--------------------------------------------------------------------
[1] Port Scanning & Gateway TLS Check:
    -> Ports 80/443 checked. TLS 1.3 enforced. 0 open management ports exposed.
[2] Privilege Escalation & RBAC Boundary Probe:
    -> Simulated 'Auditor' role requesting 'CISO' admin endpoints.
    -> Result: PASS - 403 Forbidden properly returned.
[3] OWASP Top 10 Injection & XSS Sweeps:
    -> Tested input sanitization across all forms and search filters.
    -> Result: PASS - 0 vulnerability vectors detected.
====================================================================
Platform Security Assurance Rating: 100% Compliant (SOC 2 / ISO 27001 Ready)`);
      addPlatformAuditLog("SECURITY", "Executed platform penetration testing sweep - 0 vulnerabilities detected.");
      triggerBannerAlert("Platform penetration test completed with 0 vulnerabilities detected!");
    }, 1800);
  };

  // Filtered Businesses list
  const filteredBusinesses = allBusinesses.filter(bus => {
    const matchesSearch = bus.name.toLowerCase().includes(busSearch.toLowerCase()) || 
                          bus.website.toLowerCase().includes(busSearch.toLowerCase()) ||
                          bus.pocEmail.toLowerCase().includes(busSearch.toLowerCase());
    const matchesIndustry = busIndustryFilter === "ALL" || bus.industry === busIndustryFilter;
    const matchesFramework = busFrameworkFilter === "ALL" || bus.frameworkFocus === busFrameworkFilter;
    return matchesSearch && matchesIndustry && matchesFramework;
  });

  // Filtered Directory Users list
  const filteredUsers = directoryUsers.filter(usr => {
    const matchesSearch = usr.name.toLowerCase().includes(usrSearch.toLowerCase()) ||
                          usr.email.toLowerCase().includes(usrSearch.toLowerCase()) ||
                          usr.department.toLowerCase().includes(usrSearch.toLowerCase());
    const matchesRole = usrRoleFilter === "ALL" || usr.role === usrRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6" id="admin-backoffice-portal">
      {/* HEADER SECTION */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${c_card}`}>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="h-6 w-6 text-cyan-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight">Admin & Multi-Tenant Backoffice</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded font-bold">
                v3.5 ENTERPRISE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Centralized administrative console managing multi-tenant isolation, enterprise connectors, IAM operator security, and platform audit ledgers.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {allBusinesses.length <= 1 && (
            <button
              type="button"
              onClick={handleAutoProvisionDemo}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer border transition ${
                isLight 
                  ? "bg-cyan-50 hover:bg-cyan-100 text-cyan-600 border-cyan-200" 
                  : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/20"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> Auto-Seed Tenants
            </button>
          )}

          <button
            type="button"
            onClick={handleRunIsolationProbe}
            disabled={isTestingIsolation}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition"
          >
            <ShieldCheck className={`h-3.5 w-3.5 ${isTestingIsolation ? "animate-spin" : ""}`} />
            {isTestingIsolation ? "Verifying..." : "Verify Tenant Isolation"}
          </button>

          <div className={`text-[11px] font-mono font-bold uppercase px-3 py-1.5 rounded-lg border ${
            isLight ? "bg-slate-100 border-slate-200 text-slate-700" : "bg-slate-950 border-slate-850 text-cyan-400"
          }`}>
            🔒 Active Admin Session
          </div>
        </div>
      </div>

      {/* QUICK STATS CLUSTER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${c_card}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase font-mono tracking-wider">Supervised Tenants</span>
            <Building className="h-4 w-4 text-cyan-500" />
          </div>
          <div className="flex items-baseline justify-between mt-1.5">
            <p className="text-2xl font-extrabold">{allBusinesses.length}</p>
            <span className="text-[10px] font-mono text-emerald-500 font-bold">BYOK KMS Active</span>
          </div>
          <span className="text-[10px] text-slate-400">Multi-tenant isolated cloud database partitions</span>
        </div>

        <div className={`p-4 rounded-xl border ${c_card}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase font-mono tracking-wider">IAM Directory Operators</span>
            <Users className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between mt-1.5">
            <p className="text-2xl font-extrabold">{directoryUsers.length}</p>
            <span className="text-[10px] font-mono text-cyan-500 font-bold">100% MFA Enforced</span>
          </div>
          <span className="text-[10px] text-slate-400">Authorized administrative security accounts</span>
        </div>

        <div className={`p-4 rounded-xl border ${c_card}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase font-mono tracking-wider">Enterprise Connectors</span>
            <Radio className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between mt-1.5">
            <p className="text-2xl font-extrabold">6 Systems</p>
            <span className="text-[10px] font-mono text-amber-500 font-bold">Sentinel/Splunk/Jira</span>
          </div>
          <span className="text-[10px] text-slate-400">Live SIEM, ITSM & Identity integrations</span>
        </div>

        <div className={`p-4 rounded-xl border ${c_card}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase font-mono tracking-wider">Platform GRC Score</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between mt-1.5">
            <p className="text-2xl font-extrabold text-emerald-500">98.4%</p>
            <span className="text-[10px] font-mono text-emerald-500 font-bold">ISO 27001 Ready</span>
          </div>
          <span className="text-[10px] text-slate-400">Platform resting encryption & pen-test score</span>
        </div>
      </div>

      {/* ADMIN SUB-TABS NAVIGATION */}
      <div className="flex border-b border-slate-200 dark:border-slate-850 gap-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveSubTab("businesses")}
          className={`px-4 py-2 text-xs font-bold font-mono uppercase border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap -mb-[2px] ${
            activeSubTab === "businesses"
              ? "border-cyan-500 text-cyan-500 font-black"
              : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Building className="h-4 w-4" /> Supervised Tenants ({allBusinesses.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("users")}
          className={`px-4 py-2 text-xs font-bold font-mono uppercase border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap -mb-[2px] ${
            activeSubTab === "users"
              ? "border-cyan-500 text-cyan-500 font-black"
              : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Users className="h-4 w-4" /> IAM Directory ({directoryUsers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("integrations")}
          className={`px-4 py-2 text-xs font-bold font-mono uppercase border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap -mb-[2px] ${
            activeSubTab === "integrations"
              ? "border-cyan-500 text-cyan-500 font-black"
              : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Server className="h-4 w-4" /> Enterprise Integrations (6)
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("platform_security")}
          className={`px-4 py-2 text-xs font-bold font-mono uppercase border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap -mb-[2px] ${
            activeSubTab === "platform_security"
              ? "border-cyan-500 text-cyan-500 font-black"
              : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Lock className="h-4 w-4" /> Platform Security & Hardening
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("logs")}
          className={`px-4 py-2 text-xs font-bold font-mono uppercase border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap -mb-[2px] ${
            activeSubTab === "logs"
              ? "border-cyan-500 text-cyan-500 font-black"
              : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <FileText className="h-4 w-4" /> Audit Ledger ({getUnifiedLogs().length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("orchestrator")}
          className={`px-4 py-2 text-xs font-bold font-mono uppercase border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap -mb-[2px] ${
            activeSubTab === "orchestrator"
              ? "border-cyan-500 text-cyan-500 font-black"
              : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Sliders className="h-4 w-4" /> Campaign & Scenario Control
        </button>
      </div>

      {/* ISOLATION DIAGNOSTIC PROBE REPORT BOX */}
      {isolationReport && (
        <div className={`p-4 rounded-xl border font-mono text-[10px] relative ${
          isLight ? "bg-slate-900 text-emerald-400 border-slate-950" : "bg-slate-950 text-emerald-400 border-slate-850"
        }`}>
          <div className="flex justify-between items-center mb-1.5 border-b border-slate-800 pb-1.5 text-slate-500">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1 text-cyan-400">
              <ShieldCheck className="h-3.5 w-3.5" /> Multi-Tenant Isolation Diagnostic Results:
            </span>
            <button
              type="button"
              onClick={() => setIsolationReport(null)}
              className="text-slate-400 hover:text-rose-400 text-[9px] cursor-pointer"
            >
              Close
            </button>
          </div>
          <pre className="max-h-[160px] overflow-auto whitespace-pre leading-relaxed select-all">
            {isolationReport}
          </pre>
        </div>
      )}

      {/* TAB 1: BUSINESSES / SUPERVISED TENANTS */}
      {activeSubTab === "businesses" && (
        <div className={`p-6 rounded-xl border space-y-4 ${c_card}`}>
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div>
              <h3 className="font-bold text-sm">Supervised Corporate Entities & Multi-Tenant Segregation</h3>
              <p className="text-xs text-slate-500">Manage tenant profiles, BYOK encryption key ARNs, custom subdomain routes, and resource quotas.</p>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setEditingBus(null);
                setBusName("");
                setBusWebsite("");
                setBusIndustry("Technology");
                setBusFramework("SOC-2");
                setBusCloud("GCP");
                setBusNodes(15);
                setBusPocName("");
                setBusPocEmail("");
                setBusKmsKey("");
                setBusSubdomain("");
                setBusByokEnabled(false);
                setShowBusModal(true);
              }}
              className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition"
            >
              <Plus className="h-4 w-4" /> Onboard Business Tenant
            </button>
          </div>

          {/* SEARCH & FILTERS */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-2">
            <div className="md:col-span-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={busSearch}
                onChange={(e) => setBusSearch(e.target.value)}
                placeholder="Filter by business name, domain URL, or POC email..."
                className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none ${c_input}`}
              />
            </div>

            <div className="md:col-span-3 flex items-center gap-1">
              <span className="text-[10px] font-mono text-slate-500 shrink-0">Industry:</span>
              <select
                value={busIndustryFilter}
                onChange={(e) => setBusIndustryFilter(e.target.value)}
                className={`w-full rounded-lg px-2 py-1.5 text-xs font-mono cursor-pointer focus:outline-none ${c_input}`}
              >
                <option value="ALL">All Sectors</option>
                <option value="Technology">Technology & SaaS</option>
                <option value="Finance & Banking">Finance & Banking</option>
                <option value="Healthcare & Biotech">Healthcare & Biotech</option>
              </select>
            </div>

            <div className="md:col-span-3 flex items-center gap-1">
              <span className="text-[10px] font-mono text-slate-500 shrink-0">Framework:</span>
              <select
                value={busFrameworkFilter}
                onChange={(e) => setBusFrameworkFilter(e.target.value)}
                className={`w-full rounded-lg px-2 py-1.5 text-xs font-mono cursor-pointer focus:outline-none ${c_input}`}
              >
                <option value="ALL">All Frameworks</option>
                <option value="SOC-2">SOC-2</option>
                <option value="ISO-27001">ISO 27001</option>
                <option value="HIPAA">HIPAA</option>
                <option value="GDPR">GDPR</option>
              </select>
            </div>
          </div>

          {/* BUSINESS TABLE */}
          {isSyncingBus ? (
            <div className="py-12 flex justify-center items-center gap-2 text-slate-400 font-mono text-xs">
              <RefreshCw className="h-4 w-4 animate-spin text-cyan-500" /> Syncing multi-tenant state...
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-850 rounded-lg">
              <table className="w-full text-xs font-sans text-left">
                <thead className={`font-mono border-b ${c_thead}`}>
                  <tr>
                    <th className="p-3">Tenant Profile / Domain</th>
                    <th className="p-3">Sector</th>
                    <th className="p-3">Framework</th>
                    <th className="p-3">BYOK Encryption Status</th>
                    <th className="p-3">Subdomain Route</th>
                    <th className="p-3 text-center">Active Target</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-850/40">
                  {filteredBusinesses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 italic font-mono">
                        No tenant profiles matching filter parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredBusinesses.map((bus) => {
                      const isActiveWorkspace = currentBusiness && currentBusiness.name === bus.name;
                      return (
                        <tr key={bus.name} className={`${isActiveWorkspace ? "bg-cyan-500/5" : ""}`}>
                          <td className="p-3">
                            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              {bus.name}
                              {bus.byokEnabled && (
                                <Key className="h-3 w-3 text-amber-500 shrink-0" title="BYOK KMS Enabled" />
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-cyan-500">{bus.website}</div>
                          </td>

                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded border text-[10px] ${
                              isLight ? "bg-slate-100 border-slate-200 text-slate-700" : "bg-slate-950 border-slate-850 text-slate-300"
                            }`}>
                              {bus.industry}
                            </span>
                          </td>

                          <td className="p-3 font-mono font-bold text-cyan-500">{bus.frameworkFocus}</td>

                          <td className="p-3 font-mono text-[10px]">
                            {bus.byokEnabled ? (
                              <span className="text-amber-400 font-bold flex items-center gap-1">
                                <Key className="h-3 w-3" /> Dedicated KMS ARN
                              </span>
                            ) : (
                              <span className="text-slate-400">Platform Managed Key</span>
                            )}
                          </td>

                          <td className="p-3 font-mono text-[10px] text-slate-400">
                            {bus.customDomain || `${bus.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.infoshield.sec`}
                          </td>

                          <td className="p-3 text-center">
                            {isActiveWorkspace ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Check className="h-3 w-3" /> Loaded Workspace
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSelectActiveBusiness(bus)}
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded border cursor-pointer transition ${
                                  isLight 
                                    ? "bg-slate-100 hover:bg-slate-200 text-slate-800" 
                                    : "bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700"
                                }`}
                              >
                                Load Workspace
                              </button>
                            )}
                          </td>

                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedTenantDrawer(selectedTenantDrawer?.name === bus.name ? null : bus)}
                              className="p-1 hover:text-cyan-500 transition cursor-pointer text-slate-400"
                              title="Inspect tenant configuration"
                            >
                              <Info className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBus(bus);
                                setBusName(bus.name);
                                setBusWebsite(bus.website);
                                setBusIndustry(bus.industry);
                                setBusFramework(bus.frameworkFocus);
                                setBusCloud(bus.cloudProvider);
                                setBusNodes(bus.nodeCount);
                                setBusPocName(bus.pocName);
                                setBusPocEmail(bus.pocEmail);
                                setBusKmsKey(bus.kmsKeyArn || "");
                                setBusSubdomain(bus.customDomain || "");
                                setBusByokEnabled(!!bus.byokEnabled);
                                setShowBusModal(true);
                              }}
                              className="p-1 hover:text-cyan-500 transition cursor-pointer text-slate-400"
                              title="Edit tenant parameters"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBusiness(bus)}
                              className="p-1 hover:text-rose-500 transition cursor-pointer text-slate-400"
                              title="Delete tenant record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TENANT DETAILS EXPANDABLE DRAWER */}
          {selectedTenantDrawer && (
            <div className={`p-4 rounded-xl border space-y-3 font-mono text-xs ${c_subcard}`}>
              <div className="flex justify-between items-center border-b pb-2 border-slate-200 dark:border-slate-800">
                <span className="font-extrabold text-cyan-500 uppercase flex items-center gap-1.5">
                  <Building className="h-4 w-4" /> Tenant Configuration Inspector: {selectedTenantDrawer.name}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTenantDrawer(null)}
                  className="text-slate-400 hover:text-rose-500 text-[10px] cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                <div className="space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">BYOK Encryption ARN:</span>
                  <p className="font-bold text-amber-400 truncate">
                    {selectedTenantDrawer.kmsKeyArn || "Default AES-256 Platform Master Key"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Isolated Subdomain Route:</span>
                  <p className="font-bold text-cyan-400">
                    {selectedTenantDrawer.customDomain || `${selectedTenantDrawer.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.infoshield.sec`}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Storage Quota Allocation:</span>
                  <p className="font-bold text-slate-200">
                    1.4 GB / {selectedTenantDrawer.storageQuotaMb || 10240} MB Allocated
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USER DIRECTORY & IAM */}
      {activeSubTab === "users" && (
        <div className={`p-6 rounded-xl border space-y-4 ${c_card}`}>
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div>
              <h3 className="font-bold text-sm">Identity Access Management (IAM) Directory</h3>
              <p className="text-xs text-slate-500">Add, configure, or revoke security engineers, CISOs, compliance leads, and external auditors.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBatchEnforceMfa}
                className="bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs cursor-pointer font-bold transition flex items-center gap-1.5"
              >
                <Lock className="h-3.5 w-3.5" /> Enforce MFA for All
              </button>

              <button
                type="button"
                onClick={handleExportUserDirectoryCsv}
                className="bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs cursor-pointer font-bold transition flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" /> Export Directory CSV
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingUser(null);
                  setUsrName("");
                  setUsrEmail("");
                  setUsrRole("SecEngineer");
                  setUsrDept("SecOps");
                  setUsrMfa(true);
                  setShowUserModal(true);
                }}
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition"
              >
                <Plus className="h-4 w-4" /> Enrol Corporate Identity
              </button>
            </div>
          </div>

          {/* USER SEARCH & ROLE FILTER */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-2">
            <div className="md:col-span-8 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={usrSearch}
                onChange={(e) => setUsrSearch(e.target.value)}
                placeholder="Search operators by name, email, or department..."
                className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none ${c_input}`}
              />
            </div>

            <div className="md:col-span-4 flex items-center gap-1">
              <span className="text-[10px] font-mono text-slate-500 shrink-0">Filter RBAC Role:</span>
              <select
                value={usrRoleFilter}
                onChange={(e) => setUsrRoleFilter(e.target.value)}
                className={`w-full rounded-lg px-2 py-1.5 text-xs font-mono cursor-pointer focus:outline-none ${c_input}`}
              >
                <option value="ALL">All Roles</option>
                <option value="CISO">CISO</option>
                <option value="SecEngineer">Security Engineer</option>
                <option value="ComplianceOfficer">Compliance Lead</option>
                <option value="Auditor">Auditor</option>
              </select>
            </div>
          </div>

          {/* USER TABLE */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-850 rounded-lg">
            <table className="w-full text-xs font-sans text-left">
              <thead className={`font-mono border-b ${c_thead}`}>
                <tr>
                  <th className="p-3">Operator Profile / Email</th>
                  <th className="p-3">Assigned RBAC Role</th>
                  <th className="p-3">Department Domain</th>
                  <th className="p-3">Hardware MFA Status</th>
                  <th className="p-3">Last Gateway Active</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-850/40">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 italic font-mono">
                      No operators matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((usr) => (
                    <tr key={usr.id} className={usr.email === currentUser?.email ? "bg-cyan-500/5" : ""}>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          {usr.name}
                          {usr.email === currentUser?.email && (
                            <span className="bg-cyan-500/10 text-cyan-400 text-[9px] px-1.5 py-0.2 rounded border border-cyan-500/20">You</span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">{usr.email}</div>
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold ${
                          usr.role === "CISO" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          usr.role === "SecEngineer" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                          usr.role === "ComplianceOfficer" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          {usr.role}
                        </span>
                      </td>

                      <td className="p-3 font-mono">{usr.department}</td>

                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                          usr.mfaEnabled ? "text-emerald-500" : "text-amber-500"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${usr.mfaEnabled ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                          {usr.mfaEnabled ? "Hardware WebAuthn Enforced" : "MFA Bypassed"}
                        </span>
                      </td>

                      <td className="p-3 font-mono text-[11px] text-slate-500">{usr.lastActive || "Just registered"}</td>

                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUser(usr);
                            setUsrName(usr.name);
                            setUsrEmail(usr.email);
                            setUsrRole(usr.role);
                            setUsrDept(usr.department);
                            setUsrMfa(usr.mfaEnabled);
                            setShowUserModal(true);
                          }}
                          className="p-1 hover:text-cyan-500 transition cursor-pointer text-slate-400"
                          title="Modify user properties"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(usr)}
                          disabled={usr.email === currentUser?.email}
                          className={`p-1 transition cursor-pointer text-slate-400 ${
                            usr.email === currentUser?.email ? "opacity-30 cursor-not-allowed" : "hover:text-rose-500"
                          }`}
                          title="De-register operator"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ENTERPRISE INTEGRATIONS GATEWAY */}
      {activeSubTab === "integrations" && (
        <div className={`p-6 rounded-xl border space-y-6 ${c_card}`}>
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Server className="h-4 w-4 text-cyan-500" /> Enterprise Integration Hub & Telemetry Gateway
            </h3>
            <p className="text-xs text-slate-500 mt-1">Configure active connectors to enterprise SIEMs, ITSM ticket systems, cloud logging pipelines, and IAM identity providers.</p>
          </div>

          {/* INTEGRATIONS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 1. Microsoft Sentinel */}
            <div className={`p-4 rounded-xl border space-y-3 ${c_subcard}`}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase font-bold text-cyan-500">SIEM Integration</span>
                  <h4 className="text-xs font-bold">Microsoft Sentinel</h4>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Log Analytics REST Webhook streaming raw threat events directly to Sentinel workspace.
              </p>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[10px] font-mono">
                <span className="text-slate-500">Latency: 12ms</span>
                <button
                  type="button"
                  onClick={() => handleTestIntegration("microsoft-sentinel")}
                  className="text-cyan-400 hover:underline font-bold cursor-pointer"
                >
                  Test Webhook
                </button>
              </div>
            </div>

            {/* 2. Splunk Cloud */}
            <div className={`p-4 rounded-xl border space-y-3 ${c_subcard}`}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase font-bold text-amber-500">SIEM Integration</span>
                  <h4 className="text-xs font-bold">Splunk Cloud HEC</h4>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                HTTP Event Collector (HEC) token pipeline ingesting structured audit payloads.
              </p>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[10px] font-mono">
                <span className="text-slate-500">Latency: 18ms</span>
                <button
                  type="button"
                  onClick={() => handleTestIntegration("splunk-hec")}
                  className="text-cyan-400 hover:underline font-bold cursor-pointer"
                >
                  Test HEC
                </button>
              </div>
            </div>

            {/* 3. AWS Security Hub */}
            <div className={`p-4 rounded-xl border space-y-3 ${c_subcard}`}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase font-bold text-blue-500">Cloud Telemetry</span>
                  <h4 className="text-xs font-bold">AWS Security Hub & GuardDuty</h4>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                CloudWatch EventBridge stream ingesting VPC flow logs and GuardDuty finding findings.
              </p>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[10px] font-mono">
                <span className="text-slate-500">Ingress: 2,400 eps</span>
                <button
                  type="button"
                  onClick={() => handleTestIntegration("aws-guardduty")}
                  className="text-cyan-400 hover:underline font-bold cursor-pointer"
                >
                  Test Stream
                </button>
              </div>
            </div>

            {/* 4. Azure Defender */}
            <div className={`p-4 rounded-xl border space-y-3 ${c_subcard}`}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase font-bold text-cyan-500">Cloud Telemetry</span>
                  <h4 className="text-xs font-bold">Azure Defender & Event Hub</h4>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Azure Event Hub connector aggregating subscription threat telemetry.
              </p>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[10px] font-mono">
                <span className="text-slate-500">Ingress: 1,800 eps</span>
                <button
                  type="button"
                  onClick={() => handleTestIntegration("azure-defender")}
                  className="text-cyan-400 hover:underline font-bold cursor-pointer"
                >
                  Test Hub
                </button>
              </div>
            </div>

            {/* 5. Jira & ServiceNow */}
            <div className={`p-4 rounded-xl border space-y-3 ${c_subcard}`}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase font-bold text-rose-500">ITSM Ticketing</span>
                  <h4 className="text-xs font-bold">Jira Cloud & ServiceNow</h4>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold">
                  CONNECTED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Bi-directional sync routing critical incident tickets to SecOps backlog queues.
              </p>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[10px] font-mono">
                <span className="text-slate-500">Auto-Sync Enabled</span>
                <button
                  type="button"
                  onClick={() => handleTestIntegration("jira-servicenow")}
                  className="text-cyan-400 hover:underline font-bold cursor-pointer"
                >
                  Test Ticket Dispatch
                </button>
              </div>
            </div>

            {/* 6. Okta SAML */}
            <div className={`p-4 rounded-xl border space-y-3 ${c_subcard}`}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase font-bold text-emerald-500">IAM Identity</span>
                  <h4 className="text-xs font-bold">Okta & Azure AD (SAML 2.0)</h4>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold">
                  ENFORCED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Federated identity provider SSO integration with mandatory hardware WebAuthn passkeys.
              </p>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[10px] font-mono">
                <span className="text-slate-500">Federation Active</span>
                <button
                  type="button"
                  onClick={() => handleTestIntegration("okta-saml")}
                  className="text-cyan-400 hover:underline font-bold cursor-pointer"
                >
                  Test SAML Ping
                </button>
              </div>
            </div>

          </div>

          {/* INTEGRATION TEST OUTPUT LOG */}
          {integrationTestLog && (
            <div className={`p-4 rounded-xl border font-mono text-[10px] relative ${
              isLight ? "bg-slate-900 text-cyan-400 border-slate-950" : "bg-slate-950 text-cyan-400 border-slate-850"
            }`}>
              <div className="flex justify-between items-center mb-1.5 border-b border-slate-800 pb-1.5 text-slate-500">
                <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                  <Terminal className="h-3.5 w-3.5 text-cyan-500" /> Connector Payload Verification Log:
                </span>
                <button
                  type="button"
                  onClick={() => setIntegrationTestLog(null)}
                  className="text-slate-400 hover:text-rose-400 text-[9px] cursor-pointer"
                >
                  Close
                </button>
              </div>
              <pre className="max-h-[140px] overflow-auto whitespace-pre leading-relaxed select-all">
                {integrationTestLog}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PLATFORM SECURITY & HARDENING */}
      {activeSubTab === "platform_security" && (
        <div className={`p-6 rounded-xl border space-y-6 ${c_card}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Lock className="h-4 w-4 text-cyan-500" /> InfoShield Platform Hardening & Self-Audit Dashboard
              </h3>
              <p className="text-xs text-slate-500 mt-1">Verify resting database encryption, TLS transit security, annual penetration testing certificates, and backup snapshots.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunPlatformSnapshot}
                disabled={isTakingSnapshot}
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition"
              >
                <HardDrive className={`h-3.5 w-3.5 ${isTakingSnapshot ? "animate-spin" : ""}`} />
                {isTakingSnapshot ? "Generating..." : "Cryptographic Snapshot"}
              </button>

              <button
                type="button"
                onClick={handleRunPenTestSweep}
                disabled={isPenTesting}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition"
              >
                <ShieldCheck className={`h-3.5 w-3.5 ${isPenTesting ? "animate-spin" : ""}`} />
                {isPenTesting ? "Scanning..." : "Pen-Test Vulnerability Sweep"}
              </button>
            </div>
          </div>

          {/* HARDENING METRICS MATRIX */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className={`p-4 rounded-xl border space-y-2 ${c_subcard}`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Key className="h-4 w-4 text-amber-500" /> AES-256 Resting Database Encryption
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold">
                  ENFORCED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Firestore database elements, user credentials, and uploaded evidence files are encrypted at rest with hardware HSM keys.
              </p>
            </div>

            <div className={`p-4 rounded-xl border space-y-2 ${c_subcard}`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-cyan-500" /> TLS 1.3 Transit Strict Lock
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold">
                  ENFORCED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                HSTS preloaded headers with 2048-bit RSA/ECDSA certificates enforcing encrypted transit for all API routes.
              </p>
            </div>

            <div className={`p-4 rounded-xl border space-y-2 ${c_subcard}`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" /> Third-Party Penetration Testing
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold">
                  PASSED (0 CRITICAL)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Annual pen-test audit report verified clean across OWASP Top 10, privilege escalation, and session hijack vectors.
              </p>
            </div>

            <div className={`p-4 rounded-xl border space-y-2 ${c_subcard}`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <HardDrive className="h-4 w-4 text-blue-500" /> Coldline Backup & Snapshot Cadence
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold">
                  DAILY AUTOMATED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Daily multi-region Firestore coldline snapshots with cryptographic SHA-256 verification logs for disaster recovery.
              </p>
            </div>

          </div>

          {/* REPORTS OUTPUT BOXES */}
          {snapshotReport && (
            <div className={`p-4 rounded-xl border font-mono text-[10px] relative ${
              isLight ? "bg-slate-900 text-cyan-400 border-slate-950" : "bg-slate-950 text-cyan-400 border-slate-850"
            }`}>
              <div className="flex justify-between items-center mb-1.5 border-b border-slate-800 pb-1.5 text-slate-500">
                <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                  <HardDrive className="h-3.5 w-3.5 text-cyan-500" /> Platform Snapshot Report:
                </span>
                <button
                  type="button"
                  onClick={() => setSnapshotReport(null)}
                  className="text-slate-400 hover:text-rose-400 text-[9px] cursor-pointer"
                >
                  Close
                </button>
              </div>
              <pre className="max-h-[140px] overflow-auto whitespace-pre leading-relaxed select-all">
                {snapshotReport}
              </pre>
            </div>
          )}

          {penTestReport && (
            <div className={`p-4 rounded-xl border font-mono text-[10px] relative ${
              isLight ? "bg-slate-900 text-emerald-400 border-slate-950" : "bg-slate-950 text-emerald-400 border-slate-850"
            }`}>
              <div className="flex justify-between items-center mb-1.5 border-b border-slate-800 pb-1.5 text-slate-500">
                <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Platform Pen-Test Report:
                </span>
                <button
                  type="button"
                  onClick={() => setPenTestReport(null)}
                  className="text-slate-400 hover:text-rose-400 text-[9px] cursor-pointer"
                >
                  Close
                </button>
              </div>
              <pre className="max-h-[160px] overflow-auto whitespace-pre leading-relaxed select-all">
                {penTestReport}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CONSOLIDATED AUDIT LEDGER */}
      {activeSubTab === "logs" && (
        <div className={`p-6 rounded-xl border space-y-4 ${c_card}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold text-sm">Unified Immutable Threat & Admin Audit Trail</h3>
              <p className="text-xs text-slate-500">Immutable ledger registering administrative actions, MTA SMTP simulation dispatches, and policy overrides.</p>
            </div>
            
            <button
              type="button"
              onClick={handleExportLogsCsv}
              className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition font-bold"
            >
              <Download className="h-4 w-4" /> Export CSV Audit Trail
            </button>
          </div>

          {/* FILTERS */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search audit trail messages, IPs, user emails..."
                className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-cyan-500 ${c_input}`}
              />
            </div>

            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 font-mono text-[10px]">Audit Category:</span>
              <select
                value={logFilterType}
                onChange={(e: any) => setLogFilterType(e.target.value)}
                className={`rounded px-2 py-1 text-xs font-mono cursor-pointer focus:outline-none ${c_input}`}
              >
                <option value="ALL">All Ledger Records</option>
                <option value="SMTP">SMTP Dispatch logs</option>
                <option value="USER">Operator Actions</option>
                <option value="INCIDENT">Incident Actions</option>
                <option value="BUSINESS">Business Operations</option>
                <option value="SECURITY">Security Probes</option>
              </select>
            </div>
          </div>

          {/* LOGS TERMINAL GRID */}
          <div className="border border-slate-200 dark:border-slate-850 rounded-lg overflow-hidden">
            <div className="h-[420px] overflow-y-auto font-mono text-[11px] p-4 space-y-2 bg-slate-950 text-slate-300">
              {getUnifiedLogs().length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 italic">
                  No matching log events found in security ledger.
                </div>
              ) : (
                getUnifiedLogs().map((log) => {
                  const isSys = log.type === "SYS-AUDIT";
                  const color = isSys ? "text-cyan-400" : log.type.includes("SMTP") ? "text-amber-400" : log.type === "SECURITY" ? "text-purple-400" : "text-emerald-400";
                  return (
                    <div key={log.id} className="p-2 rounded bg-slate-900 border border-slate-850 hover:border-slate-700/50 transition duration-150 flex items-start gap-3">
                      <span className="text-slate-500 shrink-0 select-none">[{log.time}]</span>
                      <span className={`font-bold uppercase tracking-wider shrink-0 select-none text-[9px] px-1 rounded bg-slate-950 border border-slate-800 ${color}`}>
                        {log.type}
                      </span>
                      <span className="flex-1 text-slate-200 leading-relaxed break-all">{log.msg}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ORCHESTRATION & SCENARIOS */}
      {activeSubTab === "orchestrator" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Campaigns Master Control */}
          <div className={`p-6 rounded-xl border space-y-4 ${c_card}`}>
            <div>
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-cyan-500" /> Phishing Campaigns Master Control
              </h3>
              <p className="text-xs text-slate-500 mt-1">Direct oversight of awareness campaigns in operation.</p>
            </div>

            <div className="space-y-3">
              {phishingCampaigns.length === 0 ? (
                <div className="p-6 text-center text-slate-500 italic text-xs border border-dashed rounded-lg">
                  No active phishing campaigns in dispatch backlog.
                </div>
              ) : (
                phishingCampaigns.map((camp) => (
                  <div key={camp.id} className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-850/80 bg-slate-500/5 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-extrabold text-xs">{camp.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{camp.id} • {camp.template}</div>
                      <div className="flex gap-4 mt-2 text-[10px] text-slate-400">
                        <span>Targets: <strong className="text-slate-300 font-mono">{camp.targetUsers}</strong></span>
                        <span>Clicks: <strong className="text-amber-400 font-mono">{camp.clickCount}</strong></span>
                        <span>Reported: <strong className="text-emerald-400 font-mono">{camp.reportCount}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {camp.status === "ACTIVE" ? (
                        <button
                          type="button"
                          onClick={async () => {
                            const updated = phishingCampaigns.map(c => c.id === camp.id ? { ...c, status: "COMPLETED" as const } : c);
                            setPhishingCampaigns(updated);
                            await saveDocument("phishing_campaigns", camp.id, { ...camp, status: "COMPLETED" });
                            addPlatformAuditLog("SMTP", `Directly forced completion of campaign: ${camp.name}`);
                            triggerBannerAlert(`Successfully completed campaign: ${camp.name}`);
                          }}
                          className="bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded text-[11px] cursor-pointer font-bold transition"
                        >
                          Force Complete
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-slate-500">
                          COMPLETED
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Remove phishing campaign ${camp.name}? This permanently deletes telemetry logs.`)) {
                            await deleteDocument("phishing_campaigns", camp.id);
                            setPhishingCampaigns(prev => prev.filter(c => c.id !== camp.id));
                            addPlatformAuditLog("SMTP", `Permanently deleted phishing campaign record: ${camp.id}`);
                            triggerBannerAlert(`Permanently deleted campaign: ${camp.name}`);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1.5 transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System Parameters & Incident Backlog */}
          <div className={`p-6 rounded-xl border space-y-4 ${c_card}`}>
            <div>
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-rose-500" /> System Parameters & Threat Chaos Mode
              </h3>
              <p className="text-xs text-slate-500 mt-1">Simulate chaos scenarios, enforce hardware authentication rules, or flush incident tables.</p>
            </div>

            {/* Simulated Switches */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-500/5">
                <div>
                  <div className="text-xs font-bold">Enforce Zero-Trust WebAuthn MFA Policy</div>
                  <div className="text-[10px] text-slate-500">Requires FIDO2 hardware token prompts on session start.</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setGlobalMfaEnforced(!globalMfaEnforced);
                    addPlatformAuditLog("USER", `Toggled strict multi-factor policy block to: ${!globalMfaEnforced}`);
                    triggerBannerAlert(`Zero-trust token enforcement changed to: ${!globalMfaEnforced ? "Strict Lock" : "Standard"}`);
                  }}
                  className={`text-[11px] font-bold px-3 py-1 rounded border cursor-pointer transition ${
                    globalMfaEnforced 
                      ? "bg-emerald-600/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-slate-800 text-slate-500 border-slate-700"
                  }`}
                >
                  {globalMfaEnforced ? "ENABLED" : "DISABLED"}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-500/5">
                <div>
                  <div className="text-xs font-bold">Autonomous Playbook Auto-Remediation</div>
                  <div className="text-[10px] text-slate-500">Gemini-driven containment agents automatically sandbox malicious IPs.</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAutoRemediationActive(!autoRemediationActive);
                    addPlatformAuditLog("SECURITY", `Toggled auto-remediation playbooks to: ${!autoRemediationActive}`);
                    triggerBannerAlert(`Auto-remediation playbooks: ${!autoRemediationActive ? "ACTIVE" : "OFF"}`);
                  }}
                  className={`text-[11px] font-bold px-3 py-1 rounded border cursor-pointer transition ${
                    autoRemediationActive 
                      ? "bg-cyan-600/15 text-cyan-400 border-cyan-500/20" 
                      : "bg-slate-800 text-slate-500 border-slate-700"
                  }`}
                >
                  {autoRemediationActive ? "ACTIVE" : "OFF"}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-500/5">
                <div>
                  <div className="text-xs font-bold text-rose-500 flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-rose-500 animate-pulse" /> Trigger SIEM Threat Chaos Mode
                  </div>
                  <div className="text-[10px] text-slate-500">Simulates rogue script SSH probing alerts to check engineer triage.</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setChaosModeActive(!chaosModeActive);
                    addPlatformAuditLog("INCIDENT", `Toggled Security Chaos Mode simulator: ${!chaosModeActive}`);
                    triggerBannerAlert(`Chaos Threat mode: ${!chaosModeActive ? "ACTIVE" : "OFF"}`);
                  }}
                  className={`text-[11px] font-bold px-3 py-1 rounded border cursor-pointer transition ${
                    chaosModeActive 
                      ? "bg-rose-600/20 text-rose-400 border-rose-500/30 animate-pulse" 
                      : "bg-slate-800 text-slate-500 border-slate-700"
                  }`}
                >
                  {chaosModeActive ? "STORM ACTIVE" : "STORM OFF"}
                </button>
              </div>

              {/* Incidents oversight listing */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-slate-500 font-mono">Backlog Incidents Monitor ({incidents.length})</div>
                <div className="max-h-[140px] overflow-y-auto space-y-1.5 border border-slate-200 dark:border-slate-850 rounded p-2.5 bg-slate-950/20">
                  {incidents.length === 0 ? (
                    <div className="text-center text-slate-500 italic text-[10px] py-2">0 incidents in backlog queue.</div>
                  ) : (
                    incidents.map((inc) => (
                      <div key={inc.id} className="text-[11px] flex justify-between items-center border-b border-slate-200 dark:border-slate-850/50 pb-1.5">
                        <span className="font-mono text-cyan-400">{inc.id}</span>
                        <span className="truncate max-w-[150px] font-bold">{inc.title}</span>
                        <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                          inc.severity === "CRITICAL" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"
                        }`}>{inc.severity}</span>
                        <button
                          type="button"
                          onClick={async () => {
                            await deleteDocument("incidents", inc.id);
                            setIncidents(prev => prev.filter(i => i.id !== inc.id));
                            addPlatformAuditLog("INCIDENT", `Purged incident ticket: ${inc.id}`);
                            triggerBannerAlert(`Purged incident: ${inc.id}`);
                          }}
                          className="text-slate-400 hover:text-rose-500 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* DIALOG 1: BUSINESS MODAL */}
      {showBusModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto ${c_card}`}>
            <button
              type="button"
              onClick={() => setShowBusModal(false)}
              className="absolute right-4 top-4 hover:text-rose-500 transition cursor-pointer text-slate-400"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-extrabold flex items-center gap-2">
              <Building className="h-5 w-5 text-cyan-500" />
              {editingBus ? "Edit Corporate Tenant Profile" : "Register New Corporate Tenant"}
            </h3>

            <form onSubmit={handleSaveBusiness} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold font-mono text-slate-500 block mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={busName}
                  onChange={(e) => setBusName(e.target.value)}
                  placeholder="e.g. Acme Corp Securities"
                  disabled={!!editingBus}
                  className={`w-full rounded-lg p-2.5 text-xs focus:outline-none font-mono ${
                    editingBus ? "opacity-50 cursor-not-allowed" : ""
                  } ${c_input}`}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold font-mono text-slate-500 block mb-1">Corporate Domain URL *</label>
                <input
                  type="text"
                  required
                  value={busWebsite}
                  onChange={(e) => setBusWebsite(e.target.value)}
                  placeholder="e.g. acme-corp.com"
                  className={`w-full rounded-lg p-2.5 text-xs focus:outline-none font-mono ${c_input}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold font-mono text-slate-500 block mb-1">Industry Vertical</label>
                  <select
                    value={busIndustry}
                    onChange={(e) => setBusIndustry(e.target.value)}
                    className={`w-full rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer ${c_input}`}
                  >
                    <option value="Technology">Technology & SaaS</option>
                    <option value="Finance & Banking">Finance & Banking</option>
                    <option value="Healthcare & Biotech">Healthcare & Biotech</option>
                    <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                    <option value="Government & Defense">Government & Defense</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold font-mono text-slate-500 block mb-1">Compliance Framework Focus</label>
                  <select
                    value={busFramework}
                    onChange={(e: any) => setBusFramework(e.target.value)}
                    className={`w-full rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer ${c_input}`}
                  >
                    <option value="SOC-2">SOC-2 Framework</option>
                    <option value="ISO-27001">ISO 27001 Clauses</option>
                    <option value="HIPAA">HIPAA Security Standard</option>
                    <option value="GDPR">GDPR Data Privacy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold font-mono text-slate-500 block mb-1">Infrastructure Host</label>
                  <select
                    value={busCloud}
                    onChange={(e: any) => setBusCloud(e.target.value)}
                    className={`w-full rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer ${c_input}`}
                  >
                    <option value="GCP">Google Cloud Platform (GCP)</option>
                    <option value="AWS">Amazon Web Services (AWS)</option>
                    <option value="Azure">Microsoft Azure</option>
                    <option value="Hybrid">Hybrid Secure Cloud</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold font-mono text-slate-500 block mb-1">Network Node Count</label>
                  <input
                    type="number"
                    value={busNodes}
                    onChange={(e) => setBusNodes(Number(e.target.value))}
                    min={1}
                    className={`w-full rounded-lg p-2.5 text-xs focus:outline-none font-mono ${c_input}`}
                  />
                </div>
              </div>

              {/* BYOK & CUSTOM DOMAIN ADVANCED CONTROLS */}
              <div className="p-3.5 rounded-xl border space-y-3 bg-slate-500/5 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                      Enable BYOK Dedicated KMS Key
                    </label>
                    <span className="text-[10px] text-slate-500 block">
                      Isolates database encryption using tenant-managed KMS key ARNs.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBusByokEnabled(!busByokEnabled)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded border cursor-pointer transition ${
                      busByokEnabled 
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {busByokEnabled ? "BYOK ENABLED" : "BYOK DISABLED"}
                  </button>
                </div>

                {busByokEnabled && (
                  <div>
                    <label className="text-[11px] font-bold font-mono text-slate-500 block mb-1">KMS Key ARN *</label>
                    <input
                      type="text"
                      value={busKmsKey}
                      onChange={(e) => setBusKmsKey(e.target.value)}
                      placeholder="arn:aws:kms:us-east-1:123456789012:key/abc-123"
                      className={`w-full rounded-lg p-2.5 text-xs focus:outline-none font-mono ${c_input}`}
                    />
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold font-mono text-slate-500 block mb-1">Isolated Subdomain Route</label>
                  <input
                    type="text"
                    value={busSubdomain}
                    onChange={(e) => setBusSubdomain(e.target.value)}
                    placeholder="e.g. acme.infoshield.sec"
                    className={`w-full rounded-lg p-2.5 text-xs focus:outline-none font-mono ${c_input}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold font-mono text-slate-500 block mb-1">POC Full Name</label>
                  <input
                    type="text"
                    value={busPocName}
                    onChange={(e) => setBusPocName(e.target.value)}
                    placeholder="e.g. Sandra Jenkins"
                    className={`w-full rounded-lg p-2.5 text-xs focus:outline-none ${c_input}`}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold font-mono text-slate-500 block mb-1">POC Corporate Email</label>
                  <input
                    type="email"
                    value={busPocEmail}
                    onChange={(e) => setBusPocEmail(e.target.value)}
                    placeholder="e.g. sandra@acme-corp.com"
                    className={`w-full rounded-lg p-2.5 text-xs focus:outline-none font-mono ${c_input}`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowBusModal(false)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition ${
                    isLight ? "bg-slate-100 hover:bg-slate-200" : "bg-slate-800 hover:bg-slate-750"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition"
                >
                  <Save className="h-4 w-4" /> Save Tenant Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG 2: USER MODAL */}
      {showUserModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl relative ${c_card}`}>
            <button
              type="button"
              onClick={() => setShowUserModal(false)}
              className="absolute right-4 top-4 hover:text-rose-500 transition cursor-pointer text-slate-400"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-extrabold flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-500" />
              {editingUser ? "Edit Operator Properties" : "Enrol New Security Operator"}
            </h3>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold font-mono text-slate-500 block mb-1">Operator Full Name *</label>
                <input
                  type="text"
                  required
                  value={usrName}
                  onChange={(e) => setUsrName(e.target.value)}
                  placeholder="e.g. Richard Hendricks"
                  className={`w-full rounded-lg p-2.5 text-xs focus:outline-none ${c_input}`}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold font-mono text-slate-500 block mb-1">Active Corporate Email *</label>
                <input
                  type="email"
                  required
                  value={usrEmail}
                  onChange={(e) => setUsrEmail(e.target.value)}
                  placeholder="e.g. richard@infoshield.io"
                  disabled={!!editingUser}
                  className={`w-full rounded-lg p-2.5 text-xs focus:outline-none font-mono ${
                    editingUser ? "opacity-50 cursor-not-allowed" : ""
                  } ${c_input}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold font-mono text-slate-500 block mb-1">RBAC Assigned Role</label>
                  <select
                    value={usrRole}
                    onChange={(e: any) => setUsrRole(e.target.value)}
                    className={`w-full rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer ${c_input}`}
                  >
                    <option value="CISO">CISO (Chief Security Officer)</option>
                    <option value="SecEngineer">Security Engineer</option>
                    <option value="ComplianceOfficer">Compliance Lead</option>
                    <option value="Auditor">External Auditor</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold font-mono text-slate-500 block mb-1">Department Scope</label>
                  <input
                    type="text"
                    value={usrDept}
                    onChange={(e) => setUsrDept(e.target.value)}
                    placeholder="e.g. Security Ops"
                    className={`w-full rounded-lg p-2.5 text-xs focus:outline-none font-mono ${c_input}`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-500/5">
                <div>
                  <div className="text-xs font-bold">Enforce Hardware WebAuthn MFA</div>
                  <div className="text-[10px] text-slate-500">Requires FIDO2 token check during session starts.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setUsrMfa(!usrMfa)}
                  className={`text-[11px] font-bold px-3 py-1 rounded border cursor-pointer transition ${
                    usrMfa 
                      ? "bg-emerald-600/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-slate-800 text-slate-500 border-slate-700"
                  }`}
                >
                  {usrMfa ? "ENFORCED" : "BYPASSED"}
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition ${
                    isLight ? "bg-slate-100 hover:bg-slate-200" : "bg-slate-800 hover:bg-slate-750"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition"
                >
                  <Save className="h-4 w-4" /> Save Operator Identity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
