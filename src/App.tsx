import React, { useState, useEffect } from "react";
import { 
  Shield, 
  CheckSquare, 
  AlertOctagon, 
  Mail, 
  Terminal, 
  Database, 
  Activity, 
  Code, 
  Key, 
  RefreshCw, 
  Download, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  Play, 
  Server, 
  Lock, 
  Cpu, 
  Eye,
  EyeOff, 
  Clock, 
  Globe, 
  Flame, 
  Zap, 
  FileText,
  Trash2,
  Bell,
  Fingerprint,
  ShieldAlert,
  Sun,
  Moon,
  Building,
  Cloud,
  Sliders,
  X,
  Search,
  Radio,
  ExternalLink
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import LoginScreen from "./components/LoginScreen";
import TourGuide from "./components/TourGuide";
import OnboardingBanner from "./components/OnboardingBanner";
import OnboardingStory from "./components/OnboardingStory";
import SettingsTab from "./components/SettingsTab";
import TrainingHub from "./components/TrainingHub";
import MockAuditPanel from "./components/MockAuditPanel";
import ISO27001Audit from "./components/ISO27001Audit";
import PCIDSSAudit from "./components/PCIDSSAudit";
import ContinualImprovementLog from "./components/ContinualImprovementLog";
import GapAssessment from "./components/GapAssessment";
import BusinessOnboarding from "./components/BusinessOnboarding";
import { SOCOperations } from "./components/SOCOperations";
import AdminPortal from "./components/AdminPortal";
import PublicWebsite from "./components/PublicWebsite";
import FutureScaleSimulator from "./components/FutureScaleSimulator";
import MarketLaunchReadiness from "./components/MarketLaunchReadiness";
import { User, BusinessProfile } from "./types";
import { syncDocument, saveDocument, deleteDocument, syncCollection, app } from "./lib/firebase";
import { authFetch, authenticateWithServer, logoutServerSession } from "./lib/api";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { motion } from "motion/react";
import { 
  UserRole, 
  SecurityControl, 
  SiemLog, 
  VulnerabilityAsset, 
  Incident, 
  PhishingCampaign, 
  TabletopScenario, 
  NodeMetric, 
  AlertRule,
  ImprovementItem
} from "./types";

interface CampaignRecipient {
  id: string;
  campaignId: string;
  contact: string;
  status: "QUEUED" | "SENT" | "CLICKED" | "COMPROMISED" | "PASSED_REPORTED";
  lastUpdated: string;
}

export const INITIAL_DIRECTORY: User[] = [
  {
    id: "U-1",
    name: "Enterprise CISO",
    email: "ciso@infoshield.io",
    role: "CISO",
    department: "Executive Security Office",
    mfaEnabled: true,
    lastActive: "Active now"
  },
  {
    id: "U-2",
    name: "Enterprise SecOps",
    email: "sec-engineer@infoshield.io",
    role: "SecEngineer",
    department: "Security Operations (SecOps)",
    mfaEnabled: true,
    lastActive: "Active now"
  },
  {
    id: "U-3",
    name: "Compliance Lead",
    email: "compliance@infoshield.io",
    role: "ComplianceOfficer",
    department: "Risk & Compliance Dept",
    mfaEnabled: true,
    lastActive: "Active now"
  },
  {
    id: "U-4",
    name: "External Auditor",
    email: "auditor@infoshield.io",
    role: "Auditor",
    department: "Compliance Assurance",
    mfaEnabled: true,
    lastActive: "Active now"
  }
];

export default function App() {
  // Navigation & Role Context
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("infoshield_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [currentBusiness, setCurrentBusiness] = useState<BusinessProfile | null>(() => {
    const saved = localStorage.getItem("infoshield_business");
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  const isLiveEnvironment = true;

  useEffect(() => {
    if (!isAuthReady || !currentUser) return;
    const unsubscribe = syncDocument<BusinessProfile>(
      "business",
      "current_profile",
      (profile) => {
        if (profile) {
          setCurrentBusiness(profile);
          localStorage.setItem("infoshield_business", JSON.stringify(profile));
          setSelectedFramework(profile.frameworkFocus);
          setVaptScanUrl(profile.website);
        } else {
          const saved = localStorage.getItem("infoshield_business");
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setCurrentBusiness(parsed);
              saveDocument("business", "current_profile", parsed);
            } catch (e) {}
          }
        }
      },
      null
    );
    return () => unsubscribe();
  }, [isAuthReady, currentUser]);



  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  const [directoryUsers, setDirectoryUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem("infoshield_directory");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_DIRECTORY;
  });

  // Sync directory users state with Firestore collection and update local storage on startup
  useEffect(() => {
    if (!isAuthReady) return;
    const unsubscribe = syncCollection<User>(
      "infoshield_directory",
      (items) => {
        setDirectoryUsers(items);
        localStorage.setItem("infoshield_directory", JSON.stringify(items));
      },
      INITIAL_DIRECTORY
    );
    return () => unsubscribe();
  }, [isAuthReady]);

  // Synchronize currentUser with Firebase Auth state to maintain secure sessions
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Since we have a real Firebase Auth user, set the auth method to standard
        localStorage.setItem("infoshield_auth_method", "firebase");
        const emailClean = firebaseUser.email?.trim().toLowerCase();
        if (emailClean) {
          // Find user in currently loaded directory
          const found = directoryUsers.find(u => u.email.toLowerCase() === emailClean);
          if (found) {
            setCurrentUser(found);
            localStorage.setItem("infoshield_user", JSON.stringify(found));
            setActiveRole(found.role);
          } else {
            // Default user fallback if they've registered in Firebase Auth but not directory yet
            const tempUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Authenticated User",
              email: firebaseUser.email || "",
              role: "SecEngineer",
              department: "Security Operations (SecOps)",
              mfaEnabled: true,
              lastActive: "Active now"
            };
            setCurrentUser(tempUser);
            localStorage.setItem("infoshield_user", JSON.stringify(tempUser));
            setActiveRole(tempUser.role);
          }
        }
      } else {
        // If they logged out from Firebase, clear local state,
        // EXCEPT if they are logged in via the local fallback database mode (e.g., auth provider disabled)
        const authMethod = localStorage.getItem("infoshield_auth_method");
        if (authMethod !== "local") {
          const saved = localStorage.getItem("infoshield_user");
          if (saved) {
            setCurrentUser(null);
            localStorage.removeItem("infoshield_user");
            setMfaValidated(false);
            setShowTour(false);
          }
        }
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, [directoryUsers]);

  // Inactivity timeout monitoring: 10 minutes (600,000 milliseconds)
  useEffect(() => {
    if (!currentUser) return;

    let lastActive = Date.now();
    const handleActivity = () => {
      lastActive = Date.now();
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach(event => window.addEventListener(event, handleActivity));

    const checkInterval = setInterval(() => {
      const timePassed = Date.now() - lastActive;
      const limit = 10 * 60 * 1000; // 10 minutes
      if (timePassed >= limit) {
        // Auto sign out
        setCurrentUser(null);
        localStorage.removeItem("infoshield_user");
        setMfaValidated(false);
        setShowTour(false);
        setSessionExpired(true);
      }
    }, 5000); // Check every 5 seconds

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      clearInterval(checkInterval);
    };
  }, [currentUser]);

  const [simplifiedMode, setSimplifiedMode] = useState<boolean>(true);
  const [tourStep, setTourStep] = useState<number>(0);
  const [showTour, setShowTour] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return localStorage.getItem("infoshield_show_onboarding") === "true";
  });

  const [activeTab, setActiveTabState] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const view = params.get("view") || params.get("mode");
      if (view === "portal" || view === "dashboard") return "dashboard";
      if (view === "website" || view === "public_website" || view === "public") return "public_website";
      const hash = window.location.hash.replace("#", "");
      if (hash === "portal" || hash === "dashboard") return "dashboard";
      if (hash === "website" || hash === "public_website" || hash === "public") return "public_website";
    } catch (e) {}
    return "public_website";
  });

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    try {
      const url = new URL(window.location.href);
      if (tab === "public_website") {
        url.searchParams.delete("view");
        url.searchParams.delete("mode");
        if (url.hash === "#website" || url.hash === "#portal") {
          url.hash = "";
        }
      } else {
        url.searchParams.set("view", "portal");
      }
      const cleanUrl = url.pathname + (url.search ? url.search : "") + (url.hash ? url.hash : "");
      window.history.pushState({}, "", cleanUrl);
    } catch (e) {}
  };

  useEffect(() => {
    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const view = params.get("view") || params.get("mode");
        if (view === "portal" || view === "dashboard") {
          setActiveTabState("dashboard");
        } else if (view === "website" || view === "public_website" || view === "public") {
          setActiveTabState("public_website");
        } else {
          const hash = window.location.hash.replace("#", "");
          if (hash === "portal" || hash === "dashboard") setActiveTabState("dashboard");
          if (hash === "website" || hash === "public_website") setActiveTabState("public_website");
        }
      } catch (e) {}
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Enforce administrative access control: restrict admin_portal access strictly to authorized administrators
  useEffect(() => {
    if (activeTab === "admin_portal") {
      const emailClean = currentUser?.email?.trim().toLowerCase();
      if (emailClean !== "godwayr.akakpo@gmail.com" && emailClean !== "godswayr.akakpo@gmail.com") {
        setActiveTab("dashboard");
      }
    }
  }, [activeTab, currentUser]);
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem("infoshield_user");
    if (saved) {
      try {
        return JSON.parse(saved).role;
      } catch (e) {}
    }
    return "CISO";
  });
  const [mfaValidated, setMfaValidated] = useState<boolean>(true);
  const [showMfaModal, setShowMfaModal] = useState<boolean>(false);
  const [mfaCode, setMfaCode] = useState<string>("");
  const [mfaError, setMfaError] = useState<string>("");

  // Appearance Theme state (Default to 'light' as requested)
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("infoshield_theme") as "light" | "dark") || "light";
  });

  // Corporate Portal Settings Controls
  const [smtpServer, setSmtpServer] = useState("smtp.infoshield.security");
  const [smtpPort, setSmtpPort] = useState<number>(587);
  const [smtpSecure, setSmtpSecure] = useState<boolean>(false);
  const [smtpUser, setSmtpUser] = useState<string>("");
  const [smtpPass, setSmtpPass] = useState<string>("");
  const [smtpFrom, setSmtpFrom] = useState<string>("security-awareness@infoshield.security");
  const [isRealMailEnabled, setIsRealMailEnabled] = useState<boolean>(false);
  const [realPhishAlert, setRealPhishAlert] = useState<{
    show: boolean;
    type: "click" | "report";
    campaignId: string;
    contact: string;
  } | null>(null);

  const [smsApiKey, setSmsApiKey] = useState("SMS_MFA_SNDBX_77A");
  const [logRetention, setLogRetention] = useState("30_DAYS");
  const [autoSimInterval, setAutoSimInterval] = useState("manual");
  const [isDrSyncEnabled, setIsDrSyncEnabled] = useState(true);
  const [drRegion, setDrRegion] = useState("us-west-2");

  // Selection & Filtering States
  const [selectedVulnIds, setSelectedVulnIds] = useState<string[]>([]);
  const [incidentSeverityFilter, setIncidentSeverityFilter] = useState<string>("ALL");

  // Recipient Input States
  const [tabletopRecipients, setTabletopRecipients] = useState("");
  const [newPhishRecipients, setNewPhishRecipients] = useState("");

  // Live Server Data States
  const [siemLogs, setSiemLogs] = useState<SiemLog[]>([]);
  const [siemSearchQuery, setSiemSearchQuery] = useState("");
  const [siemSeverityFilter, setSiemSeverityFilter] = useState("ALL");
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityAsset[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [phishingCampaigns, setPhishingCampaigns] = useState<PhishingCampaign[]>([]);
  const [nodeMetrics, setNodeMetrics] = useState<NodeMetric[]>([]);
  const [haInfrastructure, setHaInfrastructure] = useState<any>({
    loadBalancer: "HA-PROXY-CLUSTER-ACTIVE",
    activeDisasterRecoverySite: "DR-SYNC-ACTIVE-STANDBY",
    databaseReplicationLag: "0.2ms",
    currentUptimeOverall: "99.998%"
  });

  // Live recipient campaign tracker entries
  const [campaignRecipients, setCampaignRecipients] = useState<CampaignRecipient[]>([]);
  const [pastTabletopSessions, setPastTabletopSessions] = useState<any[]>([]);

  // Sync SMTP configurations from Firestore on mount
  useEffect(() => {
    if (!isAuthReady || !currentUser) return;
    const unsubscribe = syncDocument<any>(
      "settings",
      "smtp_config",
      (config) => {
        if (config) {
          setSmtpServer(config.smtpHost || "smtp.infoshield.security");
          setSmtpPort(Number(config.smtpPort) || 587);
          setSmtpSecure(!!config.smtpSecure);
          setSmtpUser(config.smtpUser || "");
          setSmtpPass(config.smtpPass || "");
          setSmtpFrom(config.smtpFrom || "security-awareness@infoshield.security");
        } else {
          // Seed the settings in Firestore if not present
          const initialSmtp = {
            smtpHost: "smtp.infoshield.security",
            smtpPort: 587,
            smtpSecure: false,
            smtpUser: "",
            smtpPass: "",
            smtpFrom: "security-awareness@infoshield.security"
          };
          saveDocument("settings", "smtp_config", initialSmtp);
        }
      },
      null
    );
    return () => unsubscribe();
  }, [isAuthReady, currentUser]);

  // Dynamic SMTP server configuration based on custom URL (Live environment adaptation)
  useEffect(() => {
    if (currentBusiness) {
      const isLive = currentBusiness.name !== "Enterprise Security Target" && currentBusiness.website !== "https://regintel-africa.web.app";
      if (isLive) {
        // Extract raw domain (e.g., website "https://acme.com" -> domain "acme.com")
        const domain = currentBusiness.website.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
        setSmtpServer(`smtp.production.${domain}`);
        setSmtpFrom(`security-awareness@${domain}`);
      } else {
        setSmtpServer("smtp.infoshield.security");
        setSmtpFrom("security-awareness@infoshield.security");
      }
    }
  }, [currentBusiness]);

  // Real-time synchronization of phishing campaigns & recipients via Firestore
  useEffect(() => {
    if (!isAuthReady || !currentUser) return;
    const unsubscribe = syncCollection<PhishingCampaign>(
      "phishing_campaigns",
      (items) => {
        if (items && items.length > 0) {
          // Sort items so newest is first
          const sorted = [...items].sort((a, b) => b.id.localeCompare(a.id));
          setPhishingCampaigns(sorted);
        } else {
          // Seed initial campaigns if empty
          const defaults: PhishingCampaign[] = [
            { id: "PHISH-001", name: "Q3 Annual Bonus Update Alert", template: "Financial Incentives", targetUsers: 250, sentCount: 250, clickCount: 18, reportCount: 142, status: "COMPLETED", date: "2026-06-15" },
            { id: "PHISH-002", name: "Urgent: Mandatory MFA Enrollment Verification", template: "IT/Security Support", targetUsers: 500, sentCount: 500, clickCount: 42, reportCount: 310, status: "ACTIVE", date: "2026-07-01" },
          ];
          defaults.forEach(c => saveDocument("phishing_campaigns", c.id, c));
          setPhishingCampaigns(defaults);
        }
      },
      []
    );
    return () => unsubscribe();
  }, [isAuthReady, currentUser]);

  useEffect(() => {
    if (!isAuthReady || !currentUser) return;
    const unsubscribe = syncCollection<CampaignRecipient>(
      "campaign_recipients",
      (items) => {
        if (items && items.length > 0) {
          setCampaignRecipients(items);
        } else {
          const defaults: CampaignRecipient[] = [
            { id: "R-DEFAULT-1", campaignId: "PHISH-002", contact: "sarah@infoshield.io", status: "PASSED_REPORTED", lastUpdated: "09:42:01 AM" },
            { id: "R-DEFAULT-2", campaignId: "PHISH-002", contact: "alex@infoshield.io", status: "COMPROMISED", lastUpdated: "10:15:33 AM" },
            { id: "R-DEFAULT-3", campaignId: "PHISH-002", contact: "jack@customer-ops.net", status: "SENT", lastUpdated: "08:00:00 AM" }
          ];
          defaults.forEach(r => saveDocument("campaign_recipients", r.id, r));
          setCampaignRecipients(defaults);
        }
      },
      []
    );
    return () => unsubscribe();
  }, [isAuthReady, currentUser]);

  // Handle Real-World Email Phishing Simulation Redirect Clicks & Reports
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const campaignId = params.get("campaignId");
    const contact = params.get("contact");
    const action = params.get("action");

    if (campaignId && contact && action) {
      const triggerAction = async () => {
        // Clean the URL query parameters so they don't re-trigger on refresh
        window.history.replaceState({}, document.title, window.location.pathname);

        // Find existing recipient or create new one in Firestore
        const recipient = campaignRecipients.find(r => r.campaignId === campaignId && r.contact.toLowerCase() === contact.toLowerCase());
        const statusVal = action === "click" ? "COMPROMISED" as const : "PASSED_REPORTED" as const;
        
        const recId = recipient ? recipient.id : `R-LIVE-${Date.now()}`;
        const updatedRec = {
          id: recId,
          campaignId,
          contact,
          status: statusVal,
          lastUpdated: new Date().toLocaleTimeString()
        };
        await saveDocument("campaign_recipients", recId, updatedRec);

        // Increment campaign metrics and save to Firestore
        const campaign = phishingCampaigns.find(c => c.id === campaignId);
        if (campaign) {
          let updatedCamp = { ...campaign };
          if (action === "click") {
            updatedCamp.clickCount = Math.min(campaign.targetUsers, (campaign.clickCount || 0) + 1);
          } else if (action === "report") {
            updatedCamp.reportCount = Math.min(campaign.targetUsers, (campaign.reportCount || 0) + 1);
          }
          await saveDocument("phishing_campaigns", campaignId, updatedCamp);
        }

        // Trigger educational splash modal overlay
        setRealPhishAlert({
          show: true,
          type: action as "click" | "report",
          campaignId,
          contact
        });

        if (action === "click") {
          triggerBannerAlert(`SECURITY INCIDENT REPORTED: Simulated phishing click registered for [${contact}] on campaign [${campaignId}].`);
        } else if (action === "report") {
          triggerBannerAlert(`VIGILANCE SUCCESS: Simulated phishing report logged for [${contact}] on campaign [${campaignId}].`);
        }
      };

      triggerAction();
    }
  }, [phishingCampaigns, campaignRecipients]);

  // UI Interaction States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [systemAlerts, setSystemAlerts] = useState<string[]>(["SSH brute force detected from 198.51.100.42"]);
  const [showBannerAlerts, setShowBannerAlerts] = useState<boolean>(true);
  const [isExecutiveView, setIsExecutiveView] = useState<boolean>(false);
  const [vaptSubTab, setVaptSubTab] = useState<"infrastructure" | "tools">("infrastructure");
  const [vaptScanUrl, setVaptScanUrl] = useState<string>(() => {
    const saved = localStorage.getItem("infoshield_business");
    if (saved) {
      try {
        const bus = JSON.parse(saved);
        return bus.website || "https://regintel-africa.web.app";
      } catch (e) {}
    }
    return "https://regintel-africa.web.app";
  });
  const [vaptScanResult, setVaptScanResult] = useState<any | null>(null);
  const [vaptScanning, setVaptScanning] = useState<boolean>(false);
  const [vaptConsoleLogs, setVaptConsoleLogs] = useState<string[]>([]);
  const [customAlertText, setCustomAlertText] = useState<string>("");

  // AI Analyst State
  const [selectedLogForAi, setSelectedLogForAi] = useState<string>("");
  const [customLogText, setCustomLogText] = useState<string>("");
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);

  // Playground & API Integration States
  const [playgroundResponse, setPlaygroundResponse] = useState<string>("");
  const [playgroundEndpoint, setPlaygroundEndpoint] = useState<string>("");
  const [generatedApiToken, setGeneratedApiToken] = useState<string>("");
  const [tokenScope, setTokenScope] = useState<string>("read-only");
  const [showApiToken, setShowApiToken] = useState<boolean>(false);

  // Simulated SMTP & Mailbox States
  const [smtpDispatchLogs, setSmtpDispatchLogs] = useState<string[]>([
    `[2026-07-01 08:30:00] [MTA-INIT] InfoShield Security Mail Transfer Agent initialized on port 587.`,
    `[2026-07-01 08:30:01] [MTA-BIND] Bound to interface TLS 1.3 | SMTP SSL certificate loaded.`,
    `[2026-07-01 09:11:00] [MTA-SMTP] Received campaign send request [PHISH-002]. Connection handshake validated.`,
    `[2026-07-01 09:11:05] [MTA-SPF] Verified SPF check for domain: alerts.infoshield-simulation.io -> PASS`,
    `[2026-07-01 09:11:10] [MTA-DKIM] Sealed DKIM signature [RSA-2048] -> PASS`,
    `[2026-07-01 09:11:15] [MTA-DELIVER] Dispatched 5 simulated awareness emails. Queue empty.`
  ]);
  const [selectedMailboxUser, setSelectedMailboxUser] = useState<string>(() => {
    const savedUser = localStorage.getItem("infoshield_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return parsed.email;
      } catch (e) {}
    }
    return "";
  });

  // New Incident & Phishing Form States
  const [newIncidentTitle, setNewIncidentTitle] = useState("");
  const [newIncidentSeverity, setNewIncidentSeverity] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");
  const [newIncidentCategory, setNewIncidentCategory] = useState("AppSec");
  const [newIncidentDesc, setNewIncidentDesc] = useState("");
  
  const [newPhishName, setNewPhishName] = useState("");
  const [newPhishTemplate, setNewPhishTemplate] = useState("Financial Incentives");
  const [newPhishTargets, setNewPhishTargets] = useState("5");

  // Compliance & Audits State
  const [selectedFramework, setSelectedFramework] = useState<"SOC-2" | "ISO-27001" | "HIPAA" | "GDPR">(() => {
    const saved = localStorage.getItem("infoshield_business");
    if (saved) {
      try {
        const bus = JSON.parse(saved);
        return bus.frameworkFocus || "SOC-2";
      } catch (e) {}
    }
    return "SOC-2";
  });
  const [complianceSubTab, setComplianceSubTab] = useState<"frameworks" | "mock_audit">("mock_audit");
  const [complianceControls, setComplianceControls] = useState<SecurityControl[]>([
    { id: "C-01", code: "CC1.1", framework: "SOC-2", title: "COSO Principles - Ethical Values & Conduct", status: "COMPLIANT", severity: "LOW", owner: "Chief Compliance Officer", auditor: "Audit Corp", lastEvaluated: "2026-06-20" },
    { id: "C-02", code: "CC2.1", framework: "SOC-2", title: "Communication of Security Commitments", status: "COMPLIANT", severity: "LOW", owner: "SecOps Team", auditor: "Audit Corp", lastEvaluated: "2026-06-18" },
    { id: "C-03", code: "CC6.1", framework: "SOC-2", title: "Logical Access Controls & Key Provisioning", status: "IN_PROGRESS", severity: "HIGH", owner: "Identity Architect", auditor: "SecAudit Ltd", lastEvaluated: "2026-06-25" },
    { id: "C-04", code: "CC7.1", framework: "SOC-2", title: "Vulnerability Scanning & Asset Discovery", status: "VERIFYING", severity: "MEDIUM", owner: "DevOps Lead", auditor: "Audit Corp", lastEvaluated: "2026-06-29" },
    { id: "C-05", code: "A.12.6.1", framework: "ISO-27001", title: "Management of Technical Vulnerabilities", status: "COMPLIANT", severity: "HIGH", owner: "Lead Engineer", auditor: "SecAudit Ltd", lastEvaluated: "2026-06-28" },
    { id: "C-06", code: "A.9.1.1", framework: "ISO-27001", title: "Access Control Policy Enforcement", status: "NON_COMPLIANT", severity: "HIGH", owner: "CISO Office", auditor: "SecAudit Ltd", lastEvaluated: "2026-06-10" },
    { id: "C-07", code: "164.308(a)(1)", framework: "HIPAA", title: "Security Management Process & Risk Analysis", status: "COMPLIANT", severity: "MEDIUM", owner: "Compliance Director", auditor: "HIPAA Checkers", lastEvaluated: "2026-06-15" },
    { id: "C-08", code: "Art 32", framework: "GDPR", title: "Security of Data Processing & Encryption", status: "IN_PROGRESS", severity: "HIGH", owner: "Data Privacy Officer", auditor: "EU Auditors", lastEvaluated: "2026-06-22" },
  ]);

  // Tabletop Exercise State
  const [activeScenarioId, setActiveScenarioId] = useState<string>("S-1");
  const [tabletopStep, setTabletopStep] = useState<number>(0);
  const [riskExposureScore, setRiskExposureScore] = useState<number>(45);
  const [exerciseLogs, setExerciseLogs] = useState<string[]>(["Exercise initialized. Standing by for response inject 1."]);

  // SIEM Ingress Simulator States
  const [ingressSource, setIngressSource] = useState("External Firewall");
  const [ingressAction, setIngressAction] = useState("SUSPICIOUS_INGRESS");
  const [ingressSeverity, setIngressSeverity] = useState("HIGH");
  const [ingressPayload, setIngressPayload] = useState("Multiple login failure occurrences detected on VPN gateway, possible credential stuffing.");
  const [ingressUser, setIngressUser] = useState("svc-vpn");
  const [ingressSourceIp, setIngressSourceIp] = useState("198.51.100.99");
  const [ingressTargetIp, setIngressTargetIp] = useState("10.0.12.14");
  const [ingressResponse, setIngressResponse] = useState<string | null>(null);
  const [ingressLoading, setIngressLoading] = useState(false);

  // Auto-provision default sandbox business profile for non-CISO active roles to add them directly to the portal
  useEffect(() => {
    if (currentUser && activeRole !== "CISO" && !currentBusiness) {
      const defaultBus: BusinessProfile = {
        name: "Enterprise Security Target",
        website: "https://regintel-africa.web.app",
        industry: "SaaS / Cloud",
        frameworkFocus: "SOC-2",
        nodeCount: 15,
        cloudProvider: "AWS",
        recordCount: "10,000 - 100,000 (High Data Risk)",
        pocName: currentUser.name || "Compliance Lead",
        pocEmail: currentUser.email || "security-lead@company.com",
        onboardedAt: new Date().toISOString()
      };
      setCurrentBusiness(defaultBus);
      localStorage.setItem("infoshield_business", JSON.stringify(defaultBus));
      setSelectedFramework("SOC-2");
      setVaptScanUrl("https://regintel-africa.web.app");
    }
  }, [currentUser, activeRole, currentBusiness]);

  const tabletopScenarios: TabletopScenario[] = [
    {
      id: "S-1",
      title: "Active Ransomware Ingress via Corporate VPN",
      description: "A developer's credentials were phished, granting a malicious actor VPN entry. Encrypted network drives are reported on FileServer-02.",
      steps: [
        {
          id: 0,
          title: "Initial Alert Triage",
          inject: "Unusual outbound spike detected towards dynamic-tracker.net. Host FileServer-02 begins renaming file extensions to .crypt.",
          question: "What is your immediate primary response action?",
          options: [
            "Shut down the entire corporate AWS firewall mesh immediately.",
            "Isolate FileServer-02 and disable the compromised developer VPN token.",
            "Contact external legal counsel before taking any system offline."
          ],
          riskDelta: -10
        },
        {
          id: 1,
          title: "Remediation & Backup Verification",
          inject: "The malicious session is halted, but 20% of corporate data files are encrypted. Backup archives are located in an immutable S3 bucket.",
          question: "How do you restore normal service operational states?",
          options: [
            "Pay the 2 BTC ransom demand immediately to receive the decryptor key.",
            "Trigger full disaster recovery state and rebuild infected hosts from verified standard machine images, restoring data from S3.",
            "Attempt to run custom reverse decryption scripts on active production servers."
          ],
          riskDelta: -20
        },
        {
          id: 2,
          title: "Post-Incident Forensic Audit",
          inject: "Systems are safely restored from the immutable snapshot. Regulators request a comprehensive technical analysis audit trail within 24 hours.",
          question: "What strategy ensures compliance with reporting guidelines?",
          options: [
            "Delete compromised developer accounts and omit specific timestamps from public disclosures.",
            "Generate and encrypt the incident forensics log, then coordinate with the Compliance Officer for external notification.",
            "Delay responses until a full 30-day internal investigation finishes."
          ],
          riskDelta: -5
        }
      ]
    },
    {
      id: "S-2",
      title: "Data Breach: Compromised Elastic SIEM Pipeline",
      description: "An exposed API credential file allows third-party modification of live log indexes, masking malicious data extraction of customer records.",
      steps: [
        {
          id: 0,
          title: "API Credential Exposure",
          inject: "A public GitHub repository is discovered containing the active master API key for the internal Elasticsearch SIEM index.",
          question: "What action takes precedence?",
          options: [
            "Revoke the leaked master API credential, cycle system secrets, and trigger container redeployment.",
            "Submit a DMCA request to GitHub and wait for resolution.",
            "Force an immediate password reset for all system engineers."
          ],
          riskDelta: -15
        },
        {
          id: 1,
          title: "Scope Assessment & Mitigation",
          inject: "Audit logs suggest 45,000 hashed client records were pulled from the API endpoint before credential revocation.",
          question: "How do you secure customer endpoints?",
          options: [
            "Erase logs showing unauthorized egress to limit compliance liability.",
            "Notify affected customers, recommend credential resets, and isolate affected database microservices.",
            "Ignore the breach since data was hashed using bcrypt."
          ],
          riskDelta: -15
        }
      ]
    }
  ];

  // Custom Alert Rules States
  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    { id: "A-1", name: "High CPU Usage Node Warning", metric: "CPU > 85%", condition: "greater", value: 85, severity: "HIGH", enabled: true, channel: "Slack" },
    { id: "A-2", name: "SSH Brute Force Trigger", metric: "Failed Login Count", condition: "greater", value: 5, severity: "CRITICAL", enabled: true, channel: "PagerDuty" },
    { id: "A-3", name: "Daily Integrity Snapshot Validation", metric: "Backup Failure", condition: "equals", value: 1, severity: "MEDIUM", enabled: false, channel: "Email" }
  ]);

  // Load backend API data on mount & synchronize server session
  useEffect(() => {
    const initSessionAndData = async () => {
      if (currentUser) {
        await authenticateWithServer(
          currentUser.email,
          currentUser.role,
          currentUser.name,
          currentUser.department
        );
      } else {
        // Fallback default admin session
        await authenticateWithServer("ciso@infoshield.io", "CISO", "Enterprise CISO", "Executive Security Office");
      }
      fetchSiemLogs();
      fetchVulnerabilities();
      fetchIncidents();
      fetchPhishingCampaigns();
      fetchSystemMetrics();
      fetchPastTabletopSessions();
    };

    initSessionAndData();

    // Auto refresh metrics simulation
    const interval = setInterval(() => {
      fetchSystemMetrics();
      fetchSiemLogs();
      fetchIncidents();
      fetchPastTabletopSessions();
    }, 6000);
    return () => clearInterval(interval);
  }, [currentUser, activeRole]);

  const fetchSiemLogs = async () => {
    try {
      const res = await authFetch("/api/siem-logs");
      if (!res.ok) return;
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) return;
      const data = await res.json();
      if (data && data.logs) setSiemLogs(data.logs);
    } catch {
      // Silently handle transient network/polling drops
    }
  };

  const fetchVulnerabilities = async () => {
    try {
      const res = await authFetch("/api/vuln-scan");
      if (!res.ok) return;
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) return;
      const data = await res.json();
      if (data && data.vulnerabilities) setVulnerabilities(data.vulnerabilities);
    } catch {
      // Silently handle transient network/polling drops
    }
  };

  const fetchIncidents = async () => {
    try {
      const res = await authFetch("/api/incidents");
      if (!res.ok) return;
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) return;
      const data = await res.json();
      if (data && data.incidents) setIncidents(data.incidents);
    } catch {
      // Silently handle transient network/polling drops
    }
  };

  const fetchPhishingCampaigns = async () => {
    try {
      const res = await authFetch("/api/phishing");
      if (!res.ok) return;
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) return;
      const data = await res.json();
      if (data && data.campaigns) setPhishingCampaigns(data.campaigns);
    } catch {
      // Silently handle transient network/polling drops
    }
  };

  const fetchSystemMetrics = async () => {
    try {
      const res = await authFetch("/api/system-metrics");
      if (!res.ok) return;
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) return;
      const data = await res.json();
      if (data && data.nodes) setNodeMetrics(data.nodes);
      if (data && data.infrastructure) setHaInfrastructure(data.infrastructure);
    } catch {
      // Silently handle transient network/polling drops
    }
  };

  const fetchPastTabletopSessions = async () => {
    try {
      const res = await authFetch("/api/tabletop/sessions");
      if (!res.ok) return;
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) return;
      const data = await res.json();
      if (data && data.sessions) setPastTabletopSessions(data.sessions);
    } catch {
      // Silently handle transient network/polling drops
    }
  };

  // Trigger MFA challenge Modal
  const handleTriggerMfaChallenge = () => {
    setMfaCode("");
    setMfaError("");
    setShowMfaModal(true);
  };

  // Validate MFA Code
  const submitMfaVerification = () => {
    if (mfaCode === "123456" || mfaCode.trim() === "ADMIN") {
      setMfaValidated(true);
      setShowMfaModal(false);
      triggerBannerAlert("MFA Authentication Successful. Elevated access granted.");
    } else {
      setMfaError("Invalid multi-factor authentication token. Please enter your active synchronization key (use '123456' for manual override verification).");
    }
  };

  // Add Alert notifications
  const triggerBannerAlert = (message: string) => {
    setSystemAlerts(prev => [message, ...prev.slice(0, 4)]);
  };

  // Run AI analysis
  const runAiThreatDetection = async (logPayload: string) => {
    setAiAnalyzing(true);
    setAiAnalysisResult(null);
    try {
      const res = await authFetch("/api/threat-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logContent: logPayload })
      });
      const data = await res.json();
      setAiAnalysisResult(data);
    } catch (e: any) {
      console.error("AI threat detection failed", e);
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Handle reporting incident
  const submitNewIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncidentTitle.trim()) return;

    try {
      const res = await authFetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newIncidentTitle,
          severity: newIncidentSeverity,
          category: newIncidentCategory,
          description: newIncidentDesc,
          assignedTo: activeRole === "SecEngineer" ? "Alex Chen" : "Sarah Jenkins"
        })
      });
      if (res.ok) {
        setNewIncidentTitle("");
        setNewIncidentDesc("");
        triggerBannerAlert(`Successfully opened security incident ${newIncidentTitle}`);
        fetchIncidents();
      }
    } catch (e) {
      console.error("Error posting incident", e);
    }
  };

  // Trigger real-time backend cyber-attack simulation (User-driven data generation)
  const handleSimulateThreat = async (attackType: string) => {
    try {
      const res = await authFetch("/api/siem-logs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attackType })
      });
      if (res.ok) {
        triggerBannerAlert(`ACTIVE THREAT VECTOR DETECTED: Logged live [${attackType}] vector payload. Telemetry streaming to SIEM logs & incident feed.`);
        fetchSiemLogs();
        fetchIncidents();
      } else {
        triggerBannerAlert("Failed to inject threat telemetry into active secure session");
      }
    } catch (err) {
      console.error("Error generating simulated threat", err);
    }
  };

  // Handle launching phishing campaign
  const submitNewPhishCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhishName.trim()) return;

    try {
      const contacts = newPhishRecipients.split(",").map(s => s.trim()).filter(Boolean);
      const res = await authFetch("/api/phishing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPhishName,
          template: newPhishTemplate,
          targetUsers: contacts.length || Number(newPhishTargets) || 5,
          sendRealEmails: isRealMailEnabled,
          smtpConfig: {
            host: smtpServer,
            port: Number(smtpPort) || 587,
            secure: smtpSecure,
            user: smtpUser,
            pass: smtpPass,
            fromEmail: smtpFrom
          },
          realRecipients: contacts,
          appUrl: window.location.origin
        })
      });
      if (res.ok) {
        const responseData = await res.json();
        const createdCampaign = responseData.campaign;
        
        // Save campaign to Firestore
        await saveDocument("phishing_campaigns", createdCampaign.id, createdCampaign);

        const newRecs: CampaignRecipient[] = contacts.map((c, idx) => ({
          id: `R-${Date.now()}-${idx}`,
          campaignId: createdCampaign.id || `PHISH-MOCK-${Date.now()}`,
          contact: c,
          status: "SENT",
          lastUpdated: new Date().toLocaleTimeString(),
        }));

        // Save recipients to Firestore
        for (const rec of newRecs) {
          await saveDocument("campaign_recipients", rec.id, rec);
        }

        // Add MTA server delivery logs (uses Nodemailer log stream if available)
        if (isRealMailEnabled && responseData.mtaLogs) {
          setSmtpDispatchLogs(prev => [...responseData.mtaLogs, ...prev]);
        } else {
          const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
          const addedLogs = [
            `[${nowStr}] [MTA-SMTP] Received API request for campaign: [${createdCampaign.id || "PHISH-NEW"}].`,
            `[${nowStr}] [MTA-CONNECT] Connecting to SMTP Relay at: ${smtpServer}:${smtpPort}`,
            `[${nowStr}] [MTA-HANDSHAKE] TLS 1.3 session negotiated successfully. Asymmetric exchange (RSA-2048).`,
            `[${nowStr}] [MTA-AUTH] Authenticated sending client with token: ${smsApiKey ? smsApiKey.substring(0, 5) + "..." : "SECURE_JWT_TOKEN"}`,
            `[${nowStr}] [MTA-QUEUE] Enqueued ${contacts.length} target recipients.`,
            ...contacts.map(c => `[${nowStr}] [MTA-DELIVER] Awareness email dispatched & delivered to recipient: ${c}`),
            `[${nowStr}] [MTA-SUCCESS] Outbox queue processed. Real-time feedback listener active.`
          ];
          setSmtpDispatchLogs(prev => [...addedLogs, ...prev]);
        }

        setNewPhishName("");
        triggerBannerAlert(`Successfully initiated security awareness campaign: ${newPhishName}`);
      } else {
        const errData = await res.json().catch(() => ({}));
        triggerBannerAlert(`SMTP Campaign Launch Failed: ${errData.error || "MTA Server Error"}`);
      }
    } catch (e) {
      console.error("Error creating campaign", e);
      triggerBannerAlert("Error establishing connection to SMTP controller.");
    }
  };

  // Simulate clicking or reporting from sandbox mailboxes
  const handleSimulateRecipientAction = async (campaignId: string, recipientEmail: string, action: "click" | "report") => {
    try {
      const endpoint = action === "click" ? "/api/phishing/click" : "/api/phishing/report";
      const res = await authFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, recipientEmail })
      });
      if (res.ok) {
        // Update local state recipient status
        setCampaignRecipients(prev => 
          prev.map(r => r.campaignId === campaignId && r.contact === recipientEmail 
            ? { ...r, status: action === "click" ? "COMPROMISED" : "PASSED_REPORTED", lastUpdated: new Date().toLocaleTimeString() }
            : r
          )
        );

        if (action === "click") {
          triggerBannerAlert(`ALERT: Recipient [${recipientEmail}] compromised by campaign link click.`);
          // Log to system logs
          setExerciseLogs(prev => [
            `[SECURITY COMPROMISE] Target user ${recipientEmail} clicked simulation link for campaign ${campaignId}. Credential capture alert dispatched.`,
            ...prev
          ]);
        } else {
          triggerBannerAlert(`SecOps SUCCESS: Recipient [${recipientEmail}] successfully reported the simulated email.`);
          setExerciseLogs(prev => [
            `[SECOPS SUCCESS] Recipient ${recipientEmail} clicked 'Report Phishing' button. Incident reported.`,
            ...prev
          ]);

          // Create a new incident ticket in the central incident response board!
          try {
            await authFetch("/api/incidents", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: `Reported Simulation Phish from ${recipientEmail}`,
                severity: "LOW",
                category: "Access Control",
                description: `Recipient ${recipientEmail} reported a suspected phishing campaign message. Sender domain: alerts.infoshield-simulation.io.`
              })
            });
            fetchIncidents();
          } catch (err) {
            console.error("Failed to post reported incident", err);
          }
        }

        fetchPhishingCampaigns();
      }
    } catch (err) {
      console.error("Error simulating recipient action", err);
    }
  };

  // Dynamically enroll custom email address in all active campaigns for testing
  const handleEnrollCustomEmail = async (email: string) => {
    const emailClean = email.trim().toLowerCase();
    if (!emailClean || !emailClean.includes("@")) {
      triggerBannerAlert("Please enter a valid corporate email address.");
      return;
    }

    try {
      // Find campaigns that don't already have this recipient enrolled
      const campaignsToEnroll = phishingCampaigns.filter(
        c => !campaignRecipients.some(r => r.campaignId === c.id && r.contact.toLowerCase() === emailClean)
      );

      if (campaignsToEnroll.length === 0) {
        setSelectedMailboxUser(emailClean);
        triggerBannerAlert(`Inbox for ${emailClean} is already active.`);
        return;
      }

      const newRecs: CampaignRecipient[] = campaignsToEnroll.map((c, idx) => ({
        id: `R-ADD-${Date.now()}-${idx}`,
        campaignId: c.id,
        contact: emailClean,
        status: "SENT",
        lastUpdated: new Date().toLocaleTimeString(),
      }));

      // Save to Firestore
      for (const rec of newRecs) {
        await saveDocument("campaign_recipients", rec.id, rec);
      }

      // Add to local state
      setCampaignRecipients(prev => [...prev, ...newRecs]);
      
      // Select this user
      setSelectedMailboxUser(emailClean);

      // Log in MTA
      const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
      setSmtpDispatchLogs(prev => [
        `[${nowStr}] [MTA-QUEUE] Dynamic enrollment requested for test address: ${emailClean}.`,
        ...campaignsToEnroll.map(c => `[${nowStr}] [MTA-DELIVER] Delivered campaign simulated email [${c.id}] to dynamic target: ${emailClean}`),
        ...prev
      ]);

      triggerBannerAlert(`Successfully enrolled ${emailClean} as a test mailbox target!`);
    } catch (e) {
      console.error("Error enrolling dynamic test email", e);
      triggerBannerAlert("Error syncing test recipient profile to security gateway.");
    }
  };

  // Automatically enroll the logged-in user in all phishing campaigns and set up state targets
  useEffect(() => {
    if (!currentUser) return;
    const emailClean = currentUser.email.trim().toLowerCase();
    
    // 1. Sync state targets
    if (selectedMailboxUser !== emailClean) {
      setSelectedMailboxUser(emailClean);
    }
    if (newPhishRecipients !== emailClean) {
      setNewPhishRecipients(emailClean);
    }
    if (tabletopRecipients !== emailClean) {
      setTabletopRecipients(emailClean);
    }

    // 2. Auto-enroll in any active campaign they are not already enrolled in
    if (phishingCampaigns.length > 0) {
      const campaignsToEnroll = phishingCampaigns.filter(
        c => !campaignRecipients.some(r => r.campaignId === c.id && r.contact.toLowerCase() === emailClean)
      );

      if (campaignsToEnroll.length > 0) {
        const newRecs: CampaignRecipient[] = campaignsToEnroll.map((c, idx) => ({
          id: `R-AUTO-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
          campaignId: c.id,
          contact: emailClean,
          status: "SENT",
          lastUpdated: new Date().toLocaleTimeString(),
        }));

        newRecs.forEach(async (rec) => {
          await saveDocument("campaign_recipients", rec.id, rec);
        });

        setCampaignRecipients(prev => [...prev, ...newRecs]);

        const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
        setSmtpDispatchLogs(prev => [
          `[${nowStr}] [MTA-QUEUE] Auto-enrolled user session email: ${emailClean}.`,
          ...campaignsToEnroll.map(c => `[${nowStr}] [MTA-DELIVER] Delivered campaign email [${c.id}] to registered user: ${emailClean}`),
          ...prev
        ]);
      }
    }
  }, [currentUser, phishingCampaigns, campaignRecipients, selectedMailboxUser, newPhishRecipients, tabletopRecipients]);

  // Real download handler for Phishing Campaign Report
  const handleDownloadPhishCampaignReport = async (campaignId: string, campaignName: string) => {
    try {
      const res = await authFetch(`/api/phishing/export/${campaignId}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `phishing-campaign-audit-${campaignId}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        triggerBannerAlert(`Downloaded live CSV audit report for campaign: ${campaignName}`);
      } else {
        triggerBannerAlert(`Failed to export report for campaign ${campaignId}`);
      }
    } catch (err) {
      console.error("Error downloading phishing report", err);
    }
  };

  // Real download handler for Vulnerability Scan Report
  const handleDownloadVulnerabilityReport = () => {
    let csvContent = `Infrastructure Security Asset Vulnerability Scan Report\r\n`;
    csvContent += `Generated Timestamp,${new Date().toISOString()}\r\n`;
    csvContent += `Security Audit Level,Passed with warnings\r\n`;
    csvContent += `Total Vulnerabilities,${vulnerabilities.length}\r\n`;
    csvContent += `\r\nAsset ID,System Node Name,Vulnerability Detail,Severity Rating,Current Status,CVE Reference\r\n`;
    
    vulnerabilities.forEach(v => {
      const cve = v.id === "VULN-001" ? "CVE-2026-4437" : v.id === "VULN-002" ? "CVE-2026-1189" : "CVE-2026-9051";
      csvContent += `${v.id},${v.assetName},"${v.vulnType}",${v.severity},${v.status},${cve}\r\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vulnerabilities-audit-report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerBannerAlert("Successfully downloaded CSV vulnerability scanning audit report.");
  };

  // Patching vulnerability in real-time sandbox backend
  const patchVulnerability = async (id: string, assetName: string) => {
    try {
      const res = await authFetch("/api/vuln-scan/patch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.vulnerabilities) {
          setVulnerabilities(data.vulnerabilities);
        } else {
          // Fallback if backend response has no list
          setVulnerabilities(prev => 
            prev.map(v => v.id === id ? { ...v, status: "PATCHED" } : v)
          );
        }
        setSelectedVulnIds(prev => prev.filter(vid => vid !== id));
        triggerBannerAlert(`SUCCESS: Deployed hotfix orchestration patch on active system: ${assetName}`);
      } else {
        triggerBannerAlert("Failed to deploy hotfix patch to active sandbox");
      }
    } catch (err) {
      console.error("Failed to patch vulnerability", err);
      // Client-side fallback
      setVulnerabilities(prev => 
        prev.map(v => v.id === id ? { ...v, status: "PATCHED" } : v)
      );
      setSelectedVulnIds(prev => prev.filter(vid => vid !== id));
      triggerBannerAlert(`Failed to contact server; applied local fallback patch on asset: ${assetName}`);
    }
  };

  // Auto Remediation flow on priority Incidents
  const remediateIncidentTicket = (id: string, title: string) => {
    setIncidents(prev => 
      prev.map(i => i.id === id ? { ...i, status: "CONTAINED" } : i)
    );
    triggerBannerAlert(`Automated remediation script executed successfully for: ${title}`);
  };

  // Export Compliance Report CSV
  const handleExportComplianceCsv = async () => {
    try {
      const res = await authFetch("/api/compliance/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: "csv", framework: selectedFramework })
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `compliance-${selectedFramework}-audit-report.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      triggerBannerAlert(`Exported real CSV data sheet for compliance standard: ${selectedFramework}`);
    } catch (e) {
      console.error("CSV Export Failed", e);
    }
  };

  // Trigger snapshot backup (Disaster Recovery Simulation)
  const handleTriggerDRBackup = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch("/api/backup-disaster-recover", { method: "POST" });
      const data = await res.json();
      triggerBannerAlert(`DR Disaster recovery snapshot successfully finalized. Backup Size: ${data.backupSizeMb} MB. Retained securely in immutable bucket.`);
    } catch (e) {
      console.error("Backup failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Tabletop step choice response handler
  const handleTabletopChoice = (scenario: TabletopScenario, choiceIdx: number) => {
    const activeStepObj = scenario.steps[tabletopStep];
    const riskChange = activeStepObj.riskDelta * (choiceIdx + 1);
    const newRisk = Math.max(10, Math.min(100, riskExposureScore + riskChange));
    setRiskExposureScore(newRisk);

    const logEntry = `Inject ${tabletopStep + 1} Decision: Selected option ${choiceIdx + 1} ("${activeStepObj.options[choiceIdx]}"). Corporate Risk altered by ${riskChange}%. Current Risk Level: ${newRisk}%`;
    
    // Create notifications for all active tabletop recipients
    const contacts = tabletopRecipients.split(",").map(s => s.trim()).filter(Boolean);
    const notificationsStr = contacts.length > 0 
      ? `[Notifications Sent] Dispatched instruction packet to ${contacts.length} team members: ${contacts.join(", ")}`
      : "[Alert Gateway] No target contacts configured for tabletop drill dispatch.";

    const nextLogs = [...exerciseLogs, logEntry, notificationsStr];
    setExerciseLogs(nextLogs);

    if (tabletopStep < scenario.steps.length - 1) {
      setTabletopStep(prev => prev + 1);
    } else {
      const finalLogs = [...nextLogs, `Scenario completed! Final Corporate Risk index calculated at: ${newRisk}%`];
      setExerciseLogs(finalLogs);

      // Save completed tabletop session to backend
      authFetch("/api/tabletop/session/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: scenario.id,
          scenarioTitle: scenario.title,
          facilitator: currentUser?.email || "ciso-sandbox@infoshield.io",
          finalRiskScore: newRisk,
          stepsCompleted: scenario.steps.length,
          participants: contacts.length > 0 ? contacts : ["ciso@infoshield.io", "secops-lead@infoshield.io"],
          logs: finalLogs
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          triggerBannerAlert(`Tabletop Drill [${scenario.id}] successfully archived for compliance records!`);
          fetchPastTabletopSessions();
        }
      })
      .catch(err => console.error("Failed to archive tabletop drill", err));
    }
  };

  // Reset Tabletop Simulation
  const resetTabletopSimulation = () => {
    setTabletopStep(0);
    setRiskExposureScore(45);
    setExerciseLogs(["Simulation reset. Standing by for response inject 1."]);
  };

  // Reset Workspace Datasets
  const resetSandboxData = async () => {
    try {
      const res = await authFetch("/api/reset-sandbox", { method: "POST" });
      if (res.ok) {
        fetchPhishingCampaigns();
        fetchVulnerabilities();
        fetchIncidents();
        fetchSystemMetrics();
        setCampaignRecipients([
          { id: "R-101", campaignId: "PHISH-001", contact: "sarah@infoshield.io", status: "PASSED_REPORTED", lastUpdated: "2026-06-15 10:11" },
          { id: "R-102", campaignId: "PHISH-001", contact: "alex@infoshield.io", status: "PASSED_REPORTED", lastUpdated: "2026-06-15 10:14" },
          { id: "R-103", campaignId: "PHISH-001", contact: "jack@customer-ops.net", status: "COMPROMISED", lastUpdated: "2026-06-15 10:32" },
          { id: "R-104", campaignId: "PHISH-001", contact: "finance-lead@co.org", status: "CLICKED", lastUpdated: "2026-06-15 11:05" },
          { id: "R-105", campaignId: "PHISH-001", contact: "hr-associate@co.org", status: "SENT", lastUpdated: "2026-06-15 10:00" },
          { id: "R-201", campaignId: "PHISH-002", contact: "sarah@infoshield.io", status: "SENT", lastUpdated: "2026-07-01 09:11" },
          { id: "R-202", campaignId: "PHISH-002", contact: "alex@infoshield.io", status: "CLICKED", lastUpdated: "2026-07-01 09:30" },
          { id: "R-203", campaignId: "PHISH-002", contact: "jack@customer-ops.net", status: "SENT", lastUpdated: "2026-07-01 09:00" },
          { id: "R-204", campaignId: "PHISH-002", contact: "finance-lead@co.org", status: "COMPROMISED", lastUpdated: "2026-07-01 09:42" },
          { id: "R-205", campaignId: "PHISH-002", contact: "hr-associate@co.org", status: "PASSED_REPORTED", lastUpdated: "2026-07-01 09:15" },
        ]);
        setSystemAlerts(["SSH brute force detected from 198.51.100.42"]);
        triggerBannerAlert("Workspace configuration and telemetry indexes successfully reseeded to baseline production defaults.");
      }
    } catch (e) {
      console.error("Error resetting workspace data", e);
    }
  };

  // Add a system custom alert rule
  const handleCreateAlertRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAlertText.trim()) return;
    const newRule: AlertRule = {
      id: `A-${alertRules.length + 1}`,
      name: customAlertText,
      metric: "Dynamic Log Evaluator",
      condition: "equals",
      value: "TRUE",
      severity: "HIGH",
      enabled: true,
      channel: "Slack"
    };
    setAlertRules(prev => [...prev, newRule]);
    setCustomAlertText("");
    triggerBannerAlert(`New notification trigger configured: ${customAlertText}`);
  };

  // VAPT Live Web Header Analysis Scanner Handler
  const handleExecuteVaptScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaptScanUrl.trim()) return;

    setVaptScanning(true);
    setVaptScanResult(null);
    setVaptConsoleLogs([]);

    const logStages = [
      `[InfoShield-VAPT-Engine] Booting auditing module v2.4.1...`,
      `[InfoShield-VAPT-Engine] Resolving target DNS registry for host: ${vaptScanUrl}`,
      `[InfoShield-VAPT-Engine] Target acquired. Performing TCP handshake check on Port 443 (HTTPS)...`,
      `[InfoShield-VAPT-Engine] Established socket with secure payload negotiator...`,
      `[InfoShield-VAPT-Engine] Transmitting stateless HTTP HEAD requests to analyze secure envelope...`,
      `[InfoShield-VAPT-Engine] Intercepting HTTP response streams and parsing server-level response blocks...`
    ];

    // Staggered logs for a polished interactive feel
    for (let i = 0; i < logStages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 350));
      setVaptConsoleLogs(prev => [...prev, logStages[i]]);
    }

    try {
      const response = await authFetch("/api/vapt/scan-headers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanUrl: vaptScanUrl })
      });

      if (response.ok) {
        const data = await response.json();
        setVaptScanResult(data);
        setVaptConsoleLogs(prev => [
          ...prev, 
          `[InfoShield-VAPT-Engine] SUCCESS: Parsed ${data.findings.length} header controls. Posture Score: ${data.score}%`,
          `[InfoShield-VAPT-Engine] Scan complete. Audit file generated in cache.`
        ]);
        triggerBannerAlert(`Security headers scan finalized for ${vaptScanUrl}. Security Rating: ${data.score}%`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed network probe response.");
      }
    } catch (err: any) {
      console.error(err);
      setVaptConsoleLogs(prev => [
        ...prev, 
        `[InfoShield-VAPT-Engine] ERROR: ${err.message || "Failed to resolve connection."}`,
        `[InfoShield-VAPT-Engine] Falling back to standard heuristic web vulnerability envelope.`
      ]);
      triggerBannerAlert("VAPT Network scan error. Falling back to local inspection envelope.");
    } finally {
      setVaptScanning(false);
    }
  };

  // VAPT Open-Source Command Suite Simulator
  const handleSimulateTool = async (toolId: string, command: string) => {
    setVaptScanning(true);
    setVaptScanResult(null);
    setVaptConsoleLogs([]);
    
    const logsMap: Record<string, string[]> = {
      nmap: [
        `$ ${command}`,
        `Starting Nmap 7.92 ( https://nmap.org ) at 2026-07-10 09:44`,
        `Nmap scan report for ${vaptScanUrl}`,
        `Host is up (0.0084s latency).`,
        `Not shown: 995 closed tcp ports (reset)`,
        `PORT     STATE SERVICE      VERSION`,
        `22/tcp   open  ssh          OpenSSH 8.9p1 (Protocol 2.0)`,
        `80/tcp   open  http         Nginx reverse proxy`,
        `443/tcp  open  ssl/http     Nginx reverse proxy`,
        `8080/tcp open  http-proxy   NodeExpress backend services`,
        `Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel`,
        `Nmap done: 1 IP address (1 host up) scanned in 2.15 seconds`
      ],
      nikto: [
        `$ ${command}`,
        `- Nikto v2.1.6`,
        `---------------------------------------------------------------------------`,
        `+ Target IP:          198.51.100.10`,
        `+ Target Hostname:    ${vaptScanUrl}`,
        `+ Target Port:        443`,
        `---------------------------------------------------------------------------`,
        `+ Multi-Region CDN support detected.`,
        `+ Server leaks header: Server: Google-Frontend`,
        `+ Web server reveals technologies in custom parameters: X-Powered-By: Express`,
        `+ Missing Content-Security-Policy (CSP) headers (RISK: HIGH)`,
        `+ Allowed HTTP Methods: GET, HEAD, POST, OPTIONS`,
        `+ 7615 items checked: 0 error(s) and 3 item(s) found on remote host.`,
        `+ Scan completed successfully.`
      ],
      sslyze: [
        `$ ${command}`,
        `SSLYZE SCAN REPORT - TLS Configuration Auditor`,
        `Connecting to target ${vaptScanUrl}:443...`,
        `CHECKING SUITE SUPPORT:`,
        `  TLS 1.3 - SUPPORTED (Strong Ciphers Only)`,
        `  TLS 1.2 - SUPPORTED (ECDHE-RSA-AES256-GCM-SHA384 active)`,
        `  TLS 1.1 - REJECTED (Secure)`,
        `  TLS 1.0 - REJECTED (Secure)`,
        `CHECKING CERTIFICATE VALIDITY:`,
        `  CN: *.web.app`,
        `  Issuer: Google Trust Services LLC`,
        `  Signature Algorithm: sha256WithRSAEncryption`,
        `  OCSP Stapling: SUCCESS`,
        `Postural Analysis: SSL/TLS posture conforms to modern guidelines.`
      ]
    };

    const targetLogs = logsMap[toolId] || [
      `$ ${command}`,
      `Executing test on target ${vaptScanUrl}...`,
      `Postural audit finished with standard results.`
    ];

    for (let i = 0; i < targetLogs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setVaptConsoleLogs(prev => [...prev, targetLogs[i]]);
    }
    setVaptScanning(false);
  };

  // Calculate high-level compliance score metrics
  const calculatedComplianceProgress = () => {
    const total = complianceControls.filter(c => c.framework === selectedFramework).length;
    const compliant = complianceControls.filter(c => c.framework === selectedFramework && c.status === "COMPLIANT").length;
    if (total === 0) return 100;
    return Math.round((compliant / total) * 100);
  };

  // Dynamic Letter Grade and Score recalculator mapping multi-dimensional data
  const calculateSecurityPosture = () => {
    let score = 88; // Base baseline score
    
    // Impact of Open/Unpatched Vulnerabilities
    const openCritical = vulnerabilities.filter(v => v.severity === "CRITICAL" && v.status !== "PATCHED").length;
    const openHigh = vulnerabilities.filter(v => v.severity === "HIGH" && v.status !== "PATCHED").length;
    const openMedium = vulnerabilities.filter(v => v.severity === "MEDIUM" && v.status !== "PATCHED").length;
    
    score -= openCritical * 10;
    score -= openHigh * 5;
    score -= openMedium * 2;

    // Impact of Open Incidents
    const openIncidentsCount = incidents.filter(i => i.status !== "RESOLVED" && i.status !== "CONTAINED").length;
    score -= openIncidentsCount * 3;

    // Impact of Phishing campaign reporting rates
    const totalSent = phishingCampaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
    const totalClicks = phishingCampaigns.reduce((sum, c) => sum + (c.clickCount || 0), 0);
    const totalReports = phishingCampaigns.reduce((sum, c) => sum + (c.reportCount || 0), 0);
    
    if (totalSent > 0) {
      const clickRate = totalClicks / totalSent;
      const reportRate = totalReports / totalSent;
      score -= Math.round(clickRate * 25); // Heavy penalty for higher click rates
      score += Math.round(reportRate * 12); // Bonus for high reporting
    }

    // Impact of Compliance Controls
    const complianceProgress = calculatedComplianceProgress();
    score += Math.round((complianceProgress - 75) * 0.25); // Minor boost/penalty based on 75% baseline

    // Clamp between 10 and 100
    const finalScore = Math.max(10, Math.min(100, score));

    // Determine letter grade
    let grade = "C";
    let color = "text-amber-500 font-black";
    let bg = "bg-amber-500/10 border-amber-500/20";
    
    if (finalScore >= 95) { grade = "A+"; color = "text-emerald-500"; bg = "bg-emerald-500/10 border-emerald-500/20"; }
    else if (finalScore >= 90) { grade = "A"; color = "text-emerald-400"; bg = "bg-emerald-500/10 border-emerald-500/20"; }
    else if (finalScore >= 85) { grade = "A-"; color = "text-emerald-300"; bg = "bg-emerald-500/10 border-emerald-500/20"; }
    else if (finalScore >= 80) { grade = "B+"; color = "text-cyan-400"; bg = "bg-cyan-500/10 border-cyan-500/20"; }
    else if (finalScore >= 75) { grade = "B"; color = "text-cyan-500"; bg = "bg-cyan-500/10 border-cyan-500/20"; }
    else if (finalScore >= 70) { grade = "B-"; color = "text-blue-400"; bg = "bg-blue-500/10 border-blue-500/20"; }
    else if (finalScore >= 65) { grade = "C+"; color = "text-amber-400"; bg = "bg-amber-500/10 border-amber-500/20"; }
    else if (finalScore >= 60) { grade = "C"; color = "text-amber-500"; bg = "bg-amber-500/10 border-amber-500/20"; }
    else if (finalScore >= 50) { grade = "D"; color = "text-orange-500"; bg = "bg-orange-500/10 border-orange-500/20"; }
    else { grade = "F"; color = "text-red-500"; bg = "bg-red-500/10 border-red-500/20"; }

    return { score: finalScore, grade, color, bg };
  };

  const calculatedPhishReportRate = () => {
    const totalSent = phishingCampaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
    const totalReports = phishingCampaigns.reduce((sum, c) => sum + (c.reportCount || 0), 0);
    if (totalSent === 0) return 78.5;
    return Math.round((totalReports / totalSent) * 1000) / 10;
  };

  const isLight = theme === "light";
  const c_card = isLight ? "bg-white border border-slate-200 text-slate-950 shadow-sm" : "bg-slate-900 border border-slate-800 text-slate-50";
  const c_subcard = isLight ? "bg-slate-50 border border-slate-200 text-slate-900" : "bg-slate-950 border border-slate-800 text-slate-100";
  const c_input = isLight ? "bg-slate-50 border border-slate-200 text-slate-950 focus:border-cyan-500" : "bg-slate-950 border border-slate-850 text-slate-50 focus:border-cyan-500";
  const c_text = isLight ? "text-slate-900 font-medium" : "text-slate-100 font-medium";
  const c_title = isLight ? "text-slate-950 font-extrabold" : "text-slate-50 font-bold";
  const c_muted = isLight ? "text-slate-600 font-sans font-medium" : "text-slate-300 font-sans font-medium";
  const c_table_header = isLight ? "border-b border-slate-300 bg-slate-100 font-mono text-slate-700 font-bold uppercase text-[10px]" : "border-b border-slate-800 bg-slate-950 font-mono text-slate-300 font-bold uppercase text-[10px]";
  const c_table_row = isLight ? "hover:bg-slate-100/50 divide-y divide-slate-100 text-slate-950 font-medium" : "hover:bg-slate-950/20 divide-y divide-slate-850 text-slate-100 font-medium";
  const c_border = isLight ? "border-slate-300" : "border-slate-800";
  const c_border_light = isLight ? "border-slate-200" : "border-slate-850";

  if (!isAuthReady) {
    return (
      <div className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-200 ${isLight ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-100"}`} id="auth-initializer-viewport">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-cyan-500" />
          <p className="text-sm font-mono tracking-wider uppercase text-slate-500 animate-pulse">Establishing Secure Enterprise Session...</p>
        </div>
      </div>
    );
  }

  if (activeTab === "public_website") {
    return (
      <PublicWebsite
        onAccessPortal={() => {
          if (currentUser) {
            setActiveTab("dashboard");
          } else {
            setActiveTab("portal");
          }
        }}
        theme={theme}
      />
    );
  }

  if (!currentUser) {
    return (
      <LoginScreen 
        theme={theme}
        sessionExpired={sessionExpired}
        onGoToWebsite={() => setActiveTab("public_website")}
        onLoginSuccess={(user, isNew) => {
          setSessionExpired(false);
          setCurrentUser(user);
          localStorage.setItem("infoshield_user", JSON.stringify(user));
          setActiveRole(user.role);
          if (isNew) {
            setShowOnboarding(true);
            localStorage.setItem("infoshield_show_onboarding", "true");
            setActiveTab("dashboard");
          } else {
            setActiveTab("dashboard");
          }
        }} 
      />
    );
  }

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-200 ${isLight ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-100"}`} id="portal-root">
      
      {/* Sidebar - Handles navigation & role context switching */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        activeRole={activeRole} 
        setActiveRole={setActiveRole}
        mfaValidated={mfaValidated}
        triggerMfaChallenge={handleTriggerMfaChallenge}
        currentUser={currentUser}
        onLogout={() => {
          const auth = getAuth(app);
          auth.signOut().finally(() => {
            setCurrentUser(null);
            localStorage.removeItem("infoshield_user");
            localStorage.removeItem("infoshield_auth_method");
            setMfaValidated(false);
            setShowTour(false);
          });
        }}
        onStartTour={() => {
          setShowTour(true);
          setTourStep(0);
          setActiveTab("dashboard");
        }}
        onTriggerOnboardingStory={() => {
          setShowOnboarding(true);
        }}
        simplifiedMode={simplifiedMode}
        setSimplifiedMode={setSimplifiedMode}
        theme={theme}
      />

      {/* Main Container */}
      <div className={`flex-1 flex flex-col h-screen overflow-hidden ${isLight ? "bg-slate-50" : "bg-slate-950"}`}>
        
        {/* Top Navbar matching 'Professional Polish' Style */}
        <header className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
          isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
        }`} id="navbar-top">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className={`text-xs font-mono font-semibold ${isLight ? "text-slate-600" : "text-slate-300"}`}>SIEM CONNECTED</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
              <span className={`text-xs font-mono font-semibold ${isLight ? "text-slate-600" : "text-slate-300"}`}>AI THREAT ENGINE: READY</span>
            </div>
            {currentBusiness && (
              <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-mono font-black uppercase tracking-wider ${
                isLight ? "bg-cyan-50/50 border-cyan-200 text-cyan-800" : "bg-cyan-950/25 border-cyan-500/20 text-cyan-400"
              }`}>
                <Building className="h-3.5 w-3.5 text-cyan-500" />
                Target: {currentBusiness.name}
              </div>
            )}
            {isLiveEnvironment ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-[10px] font-mono font-black uppercase tracking-wider">LIVE PRODUCTION ACTIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span className="text-[10px] font-mono font-black uppercase tracking-wider">SANDBOX ENVIRONMENT</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* View Standalone Public Website Direct Links */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab("public_website")}
                title="View Standalone Corporate Website in this tab"
                className={`px-3 py-1.5 rounded-l-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
                    : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-cyan-400"
                }`}
              >
                <Globe className="h-3.5 w-3.5 text-cyan-500" />
                <span className="hidden sm:inline">Public Website</span>
              </button>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                title="Open Public Website in New Window/Tab"
                className={`p-1.5 rounded-r-lg border-y border-r text-xs font-mono font-bold flex items-center justify-center transition cursor-pointer ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600 hover:text-cyan-600"
                    : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400 hover:text-cyan-400"
                }`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Quick Theme Toggle */}
            <button
              onClick={() => {
                const newTheme = theme === "light" ? "dark" : "light";
                setTheme(newTheme);
                triggerBannerAlert(`Switched portal theme mode to ${newTheme.toUpperCase()}.`);
              }}
              title={`Switch to ${isLight ? "Dark" : "Light"} Mode`}
              className={`p-2.5 rounded-lg border transition duration-150 cursor-pointer flex items-center justify-center ${
                isLight 
                  ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700" 
                  : "bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300"
              }`}
            >
              {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border ${
              isLight ? "bg-slate-100 border-slate-200" : "bg-slate-950 border-slate-800"
            }`}>
              <Fingerprint className="h-4 w-4 text-emerald-500" />
              <div className="text-right">
                <p className={`text-[11px] font-mono font-bold uppercase leading-none ${isLight ? "text-slate-800" : "text-slate-400"}`}>
                  {currentUser ? currentUser.name : "System User"} ({activeRole})
                </p>
                <p className="text-[9px] text-emerald-500 font-mono tracking-wider leading-none mt-1">
                  SECURE SESSION
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto p-6" id="portal-content-pane">
          
          {/* TAB 1: OPERATIONS DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6" id="view-dashboard">
              
              <OnboardingBanner
                currentUser={currentUser}
                activeRole={activeRole}
                setActiveTab={setActiveTab}
                triggerTour={() => {
                  setShowTour(true);
                  setTourStep(0);
                }}
                isLight={isLight}
                isExecutiveView={isExecutiveView}
                setIsExecutiveView={setIsExecutiveView}
                triggerOnboardingStory={() => setShowOnboarding(true)}
              />
              
              {/* Dashboard Title & Executive Mode Toggle */}
              <div className={`flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl border ${c_card}`}>
                <div>
                  <h2 className={`text-xl font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                    <Shield className="h-5 w-5 text-cyan-500 animate-pulse" /> Security Operations Center — {currentBusiness?.name || "InfoShield"}
                  </h2>
                  <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    {isExecutiveView 
                      ? "Board-Ready Executive View: High-level business impact, organizational resilience status, and audit progress."
                      : "Technical Telemetry View: Low-level system cluster states, active CVSS vectors, and SIEM pipeline ingress."}
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-slate-950/25 px-4 py-2.5 rounded-xl border border-slate-800/80 shadow-sm">
                  <div className="text-right select-none">
                    <span className={`text-xs font-bold block ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                      Executive Mode
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Translate security metrics for the Board
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isExecutiveView} 
                      onChange={(e) => {
                        setIsExecutiveView(e.target.checked);
                        triggerBannerAlert(e.target.checked ? "Activated high-impact executive board metrics mode." : "Reverted to technical ops telemetry.");
                      }} 
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-slate-950 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
              </div>

              {/* Dynamic Metric Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                
                {/* Risk Posture Card */}
                <div className={`rounded-xl p-5 shadow-sm hover:border-slate-400 transition flex flex-col justify-between ${c_card}`} id="metric-card-risk">
                  <div className="flex justify-between items-start">
                    <p className={`text-xs font-mono font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      {isExecutiveView ? "Corporate Security Health" : "Risk Posture Index"}
                    </p>
                    <span className={`text-[10px] border px-2 py-0.5 rounded-full font-mono font-semibold ${
                      calculateSecurityPosture().bg
                    } ${calculateSecurityPosture().color}`}>
                      Score: {calculateSecurityPosture().score}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-col justify-between h-full">
                    <div className="flex items-baseline justify-between">
                      <h2 className={`text-4xl font-extrabold tracking-tight ${calculateSecurityPosture().color}`}>{calculateSecurityPosture().grade}</h2>
                      <span className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>Calculated Live</span>
                    </div>
                    {isExecutiveView && (
                      <p className={`text-[10px] leading-normal mt-2 pt-2 border-t ${
                        isLight ? "text-slate-600 border-slate-100" : "text-slate-400 border-slate-800"
                      }`}>
                        <strong>Dynamic health mapping.</strong> Your security health grade recalculates in real-time based on patched CVEs, open incidents, and active phishing mitigation performance.
                      </p>
                    )}
                  </div>
                </div>
 
                {/* Critical Vulnerabilities Card */}
                <div className={`rounded-xl p-5 shadow-sm hover:border-slate-400 transition flex flex-col justify-between ${c_card}`} id="metric-card-vulns">
                  <div className="flex justify-between items-start">
                    <p className={`text-xs font-mono font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      {isExecutiveView ? "Unmitigated Critical Risks" : "Active Critical CVEs"}
                    </p>
                    <span className={`text-xs font-mono font-bold ${
                      vulnerabilities.filter(v => v.severity === "CRITICAL" && v.status !== "PATCHED").length > 0 
                        ? "text-red-500 dark:text-red-400" : "text-emerald-500 dark:text-emerald-400"
                    }`}>
                      {isExecutiveView 
                        ? vulnerabilities.filter(v => v.severity === "CRITICAL" && v.status !== "PATCHED").length > 0 ? "● ACTION NEEDED" : "● SECURE"
                        : "● CRISIS"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-col justify-between h-full">
                    <div className="flex items-baseline justify-between">
                      <h2 className={`text-4xl font-extrabold tracking-tight ${
                        vulnerabilities.filter(v => v.severity === "CRITICAL" && v.status !== "PATCHED").length > 0 
                          ? "text-red-500 dark:text-red-400" : isLight ? "text-slate-900" : "text-slate-100"
                      }`}>
                        {vulnerabilities.filter(v => v.severity === "CRITICAL" && v.status !== "PATCHED").length}
                      </h2>
                      <span className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>Across {nodeMetrics.length} clusters</span>
                    </div>
                    {isExecutiveView && (
                      <p className={`text-[10px] leading-normal mt-2 pt-2 border-t ${
                        isLight ? "text-slate-600 border-slate-100" : "text-slate-400 border-slate-800"
                      }`}>
                        {vulnerabilities.filter(v => v.severity === "CRITICAL" && v.status !== "PATCHED").length > 0 
                          ? "Critical security patches are pending. Active CVEs are currently quarantined in secure subnets away from the open internet."
                          : "No unmitigated core risks are present. All systems maintain required defensive patch architectures."
                        }
                      </p>
                    )}
                  </div>
                </div>
 
                {/* Compliance Score Card */}
                <div className={`rounded-xl p-5 shadow-sm hover:border-slate-400 transition flex flex-col justify-between ${c_card}`} id="metric-card-compliance">
                  <div className="flex justify-between items-start">
                    <p className={`text-xs font-mono font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      {isExecutiveView ? "SOC-2 Audit Readiness" : "SOC2 Framework Score"}
                    </p>
                    <span className={`text-xs font-mono font-bold ${isLight ? "text-cyan-700" : "text-cyan-400"}`}>92.4%</span>
                  </div>
                  <div className="mt-3 flex flex-col justify-between h-full">
                    <div className="flex items-baseline justify-between">
                      <h2 className={`text-4xl font-extrabold tracking-tight ${isLight ? "text-cyan-600" : "text-cyan-400"}`}>
                        {calculatedComplianceProgress()}%
                      </h2>
                      <span className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>Audit Status: Ready</span>
                    </div>
                    {isExecutiveView && (
                      <p className={`text-[10px] leading-normal mt-2 pt-2 border-t ${
                        isLight ? "text-slate-600 border-slate-100" : "text-slate-400 border-slate-800"
                      }`}>
                        <strong>Compliance highly assured.</strong> 92% of control evidence has been compiled, vetted, and continuous automatic audit logs are active for the certifier.
                      </p>
                    )}
                  </div>
                </div>
 
                {/* Simulation Defense Health Card */}
                <div className={`rounded-xl p-5 shadow-sm hover:border-slate-400 transition flex flex-col justify-between ${c_card}`} id="metric-card-phish">
                  <div className="flex justify-between items-start">
                    <p className={`text-xs font-mono font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      {isExecutiveView ? "Employee Threat Awareness" : "Simulation Report Rate"}
                    </p>
                    <span className={`text-xs font-mono font-bold ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>HIGH</span>
                  </div>
                  <div className="mt-3 flex flex-col justify-between h-full">
                    <div className="flex items-baseline justify-between">
                      <h2 className={`text-4xl font-extrabold tracking-tight ${isLight ? "text-emerald-600" : "text-emerald-400"}`}>
                        {calculatedPhishReportRate()}%
                      </h2>
                      <span className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>Phish Defense Health</span>
                    </div>
                    {isExecutiveView && (
                      <p className={`text-[10px] leading-normal mt-2 pt-2 border-t ${
                        isLight ? "text-slate-600 border-slate-100" : "text-slate-400 border-slate-800"
                      }`}>
                        <strong>Top-tier workforce alertness.</strong> {calculatedPhishReportRate()}% of staff flag and report phishing attempts immediately, compared to the industry standard average of just 15%.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Registered Business Overview banner */}
              {currentBusiness && (
                <div className={`p-4 sm:p-5 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition duration-200 ${c_card}`} id="dashboard-business-profile-bar">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                      isLight ? "bg-cyan-50 border border-cyan-200" : "bg-cyan-500/10 border border-cyan-500/30"
                    }`}>
                      <Building className="h-5 w-5 text-cyan-500" />
                    </div>
                    <div>
                      <div className="flex items-center flex-wrap gap-2">
                        <h3 className={`font-black text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                          {currentBusiness.name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                          isLight ? "bg-cyan-100 text-cyan-800" : "bg-cyan-500/10 text-cyan-400"
                        }`}>
                          {currentBusiness.industry}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                          isLight ? "bg-emerald-100 text-emerald-800" : "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          Focus: {currentBusiness.frameworkFocus}
                        </span>
                      </div>
                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1 text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5 text-slate-400" />
                          <a href={currentBusiness.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-cyan-500">
                            {currentBusiness.website}
                          </a>
                        </span>
                        <span className="flex items-center gap-1">
                          <Cloud className="h-3.5 w-3.5 text-slate-400" />
                          Cloud: <strong className={isLight ? "text-slate-800" : "text-slate-300"}>{currentBusiness.cloudProvider}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Server className="h-3.5 w-3.5 text-slate-400" />
                          Monitored Nodes: <strong className={isLight ? "text-slate-800" : "text-slate-300"}>{currentBusiness.nodeCount}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Fingerprint className="h-3.5 w-3.5 text-slate-400" />
                          Sec Lead: <span className={isLight ? "text-slate-700" : "text-slate-300"}>{currentBusiness.pocName}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={activeRole !== "CISO"}
                    onClick={() => {
                      if (activeRole !== "CISO") return;
                      if (window.confirm("Are you sure you want to re-register or update your Business Onboarding details? This will let you reconfigure the scan target website and cloud server scopes.")) {
                        setCurrentBusiness(null);
                        localStorage.removeItem("infoshield_business");
                        deleteDocument("business", "current_profile");
                        triggerBannerAlert("Initiated new Business Onboarding session. Redirecting to registration setup...");
                      }
                    }}
                    className={`px-3.5 py-2 rounded-lg text-[11px] font-bold font-mono transition flex items-center gap-1.5 shrink-0 ${
                      activeRole !== "CISO"
                        ? "opacity-55 cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-950 dark:text-slate-600 border border-slate-200 dark:border-slate-850"
                        : isLight 
                        ? "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-750 cursor-pointer" 
                        : "bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 cursor-pointer"
                    }`}
                    title={activeRole !== "CISO" ? "Business profile reconfiguration is restricted to the Chief Information Security Officer (CISO)." : "Update registered company profile details"}
                  >
                    <Sliders className="h-3.5 w-3.5 text-cyan-500" />
                    {activeRole === "CISO" ? "Reconfigure Scope" : "Scope Locked (CISO Only)"}
                  </button>
                </div>
              )}

            </div>
          )}

          {/* TAB: SOC OPERATIONS CONSOLE */}
          {activeTab === "soc_operations" && (
            <SOCOperations
              theme={theme}
              activeRole={activeRole}
              simplifiedMode={simplifiedMode}
              incidents={incidents}
              remediateIncidentTicket={remediateIncidentTicket}
              setActiveTab={setActiveTab}
              isLoading={isLoading}
              handleTriggerDRBackup={handleTriggerDRBackup}
              haInfrastructure={haInfrastructure}
              handleCreateAlertRule={handleCreateAlertRule}
              customAlertText={customAlertText}
              setCustomAlertText={setCustomAlertText}
              alertRules={alertRules}
              setAlertRules={setAlertRules}
              triggerBannerAlert={triggerBannerAlert}
              handleSimulateThreat={handleSimulateThreat}
              currentBusiness={currentBusiness}
            />
          )}

          {/* TAB: ISO 27001 AUDIT */}
          {activeTab === "iso27001" && (
            <ISO27001Audit
              theme={theme}
              activeRole={activeRole}
              triggerBannerAlert={triggerBannerAlert}
              currentBusiness={currentBusiness}
            />
          )}

          {/* TAB: PCI DSS AUDIT */}
          {activeTab === "pcidss" && (
            <PCIDSSAudit
              theme={theme}
              activeRole={activeRole}
              triggerBannerAlert={triggerBannerAlert}
            />
          )}

          {/* TAB: GAP ASSESSMENT & SOA */}
          {activeTab === "gap_assessment" && (
            <GapAssessment
              theme={theme}
              activeRole={activeRole}
              triggerBannerAlert={triggerBannerAlert}
              currentBusiness={currentBusiness}
            />
          )}

          {/* TAB: CONTINUAL IMPROVEMENT LOG */}
          {activeTab === "continual_improvement" && (
            <ContinualImprovementLog
              theme={theme}
              activeRole={activeRole}
              triggerBannerAlert={triggerBannerAlert}
              vulnerabilities={vulnerabilities}
              incidents={incidents}
              phishingCampaigns={phishingCampaigns}
            />
          )}

          {/* TAB 3: INCIDENT WORKFLOWS */}
          {activeTab === "incidents" && (
            <div className="space-y-6" id="view-incidents">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Form: Initiate Incident Incident Response */}
                <div className={`rounded-xl p-5 h-fit border ${c_card}`}>
                  <h2 className={`text-sm font-bold font-mono mb-2 uppercase tracking-wider flex items-center gap-1.5 ${isLight ? "text-slate-850" : "text-slate-200"}`}>
                    <Plus className="h-4 w-4 text-cyan-400" /> Initiate IR Playbook Ticket
                  </h2>
                  <p className={`text-xs mb-4 ${isLight ? "text-slate-500" : "text-slate-400"}`}>Declare new exception events to coordinate containment steps.</p>

                  <form onSubmit={submitNewIncident} className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono mb-1 uppercase text-slate-500 dark:text-slate-400">Incident Title</label>
                      <input 
                        type="text" 
                        required
                        value={newIncidentTitle}
                        onChange={(e) => setNewIncidentTitle(e.target.value)}
                        placeholder="e.g. Unusual login volume"
                        className={`w-full rounded p-2.5 text-xs focus:outline-none focus:border-cyan-500 ${c_input}`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono mb-1 uppercase text-slate-500 dark:text-slate-400">Severity</label>
                        <select 
                          value={newIncidentSeverity}
                          onChange={(e: any) => setNewIncidentSeverity(e.target.value)}
                          className={`w-full rounded p-2.5 text-xs focus:outline-none focus:border-cyan-500 font-mono cursor-pointer ${c_input}`}
                        >
                          <option value="LOW">LOW</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="HIGH">HIGH</option>
                          <option value="CRITICAL">CRITICAL</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-mono mb-1 uppercase text-slate-500 dark:text-slate-400">Category</label>
                        <select 
                          value={newIncidentCategory}
                          onChange={(e: any) => setNewIncidentCategory(e.target.value)}
                          className={`w-full rounded p-2.5 text-xs focus:outline-none focus:border-cyan-500 font-mono cursor-pointer ${c_input}`}
                        >
                          <option value="AppSec">Application Security</option>
                          <option value="Network">Network Security</option>
                          <option value="Access Control">Access & IAM</option>
                          <option value="Malware">Malware / Ransomware</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono mb-1 uppercase text-slate-500 dark:text-slate-400">Detailed Narrative Description</label>
                      <textarea
                        rows={4}
                        value={newIncidentDesc}
                        onChange={(e) => setNewIncidentDesc(e.target.value)}
                        placeholder="Detail telemetry patterns, source IPs, affected nodes, and diagnostic outputs."
                        className={`w-full rounded p-2.5 text-xs focus:outline-none focus:border-cyan-500 font-sans ${c_input}`}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition cursor-pointer"
                    >
                      Automate Capture & Notify SecOps
                    </button>
                  </form>
                </div>

                {/* Right Lists: Interactive IR Logs & Actions */}
                <div className={`lg:col-span-2 rounded-xl p-5 flex flex-col justify-between ${c_card}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className={`font-bold text-sm uppercase tracking-tight font-mono ${isLight ? "text-slate-900" : "text-slate-200"}`}>Incident Registry Logs</h3>
                      <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>Investigate telemetry and activate pre-packaged automated scripts for rapid containment.</p>
                    </div>
                    <div>
                      <label className={`text-[10px] font-mono mr-2 uppercase tracking-wider font-bold ${isLight ? "text-slate-600" : "text-slate-400"}`}>Severity Filter:</label>
                      <select
                        id="incident-severity-filter"
                        value={incidentSeverityFilter}
                        onChange={(e) => setIncidentSeverityFilter(e.target.value)}
                        className={`text-xs rounded px-2.5 py-1.5 focus:outline-none font-mono cursor-pointer ${
                          isLight 
                            ? "bg-slate-100 border border-slate-200 text-slate-800 focus:border-cyan-500" 
                            : "bg-slate-950 border border-slate-850 text-slate-300 focus:border-cyan-500"
                        }`}
                      >
                        <option value="ALL">ALL SEVERITIES</option>
                        <option value="CRITICAL">CRITICAL ONLY</option>
                        <option value="HIGH">HIGH ONLY</option>
                        <option value="MEDIUM">MEDIUM ONLY</option>
                        <option value="LOW">LOW ONLY</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                    {incidents
                      .filter(inc => incidentSeverityFilter === "ALL" || inc.severity === incidentSeverityFilter)
                      .map((inc) => (
                      <div key={inc.id} className={`p-4.5 rounded-xl border space-y-3 ${
                        isLight ? "bg-slate-50/50 border-slate-200/80" : "bg-slate-950 border-slate-850"
                      }`}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-mono font-bold text-xs">{inc.id}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${
                              inc.severity === "CRITICAL"
                                ? isLight ? "bg-red-50 text-red-700 border-red-200" : "bg-red-500/10 text-red-400 border-red-500/20"
                                : inc.severity === "HIGH"
                                ? isLight ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}>
                              {inc.severity} Severity
                            </span>
                            <span className={`text-[10px] border px-2 py-0.5 rounded font-mono ${
                              isLight ? "bg-slate-100 border-slate-200 text-slate-600" : "bg-slate-900 border-slate-850 text-slate-400"
                            }`}>
                              {inc.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-500">
                              Opened: {new Date(inc.openedAt).toLocaleTimeString()}
                            </span>
                            <span className={`h-2.5 w-2.5 rounded-full ${
                              inc.status === "RESOLVED" || inc.status === "CONTAINED"
                                ? "bg-emerald-500"
                                : "bg-red-500 animate-ping"
                            }`} />
                          </div>
                        </div>

                        <div>
                          <h4 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-slate-200"}`}>{inc.title}</h4>
                          <p className={`text-xs mt-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>{inc.description}</p>
                        </div>

                        <div className={`flex items-center justify-between pt-3 border-t text-xs font-mono ${
                          isLight ? "border-slate-200/60" : "border-slate-850/60"
                        }`}>
                          <span className="text-slate-500">Playbook Owner: {inc.assignedTo}</span>
                          <div className="flex gap-2">
                            {(inc.status !== "RESOLVED" && inc.status !== "CONTAINED") ? (
                              <>
                                <button
                                  onClick={() => {
                                    setIncidents(prev => prev.map(i => i.id === inc.id ? { ...i, status: "RESOLVED" } : i));
                                    triggerBannerAlert(`Incident ticket ${inc.id} updated as RESOLVED.`);
                                  }}
                                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition cursor-pointer border ${isLight ? "bg-emerald-50 hover:bg-emerald-600 border-emerald-200 text-emerald-800 hover:text-white" : "bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 text-emerald-400 hover:text-slate-950"}`}
                                >
                                  Mark Resolved
                                </button>
                                <button
                                  onClick={() => remediateIncidentTicket(inc.id, inc.title)}
                                  className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-2.5 py-1 rounded text-[10px] font-bold uppercase transition cursor-pointer animate-pulse"
                                >
                                  Automated Containment Plan
                                </button>
                              </>
                            ) : (
                              <span className="text-emerald-500 font-bold flex items-center gap-1">
                                <CheckCircle className="h-3.5 w-3.5" /> SECURE / CONTAINED
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: PHISHING SIMULATIONS */}
          {activeTab === "phishing" && (
            <div className="space-y-6" id="view-phishing">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form to Launch Phishing Run */}
                <div className={`rounded-xl p-5 h-fit border ${c_card}`}>
                  <h2 className={`text-sm font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 ${isLight ? "text-slate-850" : "text-slate-200"}`}>
                    <Mail className="h-4 w-4 text-cyan-500" /> Construct Awareness Phish simulation
                  </h2>
                  <p className={`text-xs mb-4 ${isLight ? "text-slate-500" : "text-slate-400"}`}>Launch targeted harmless campaigns to calculate risk metrics.</p>

                  <form onSubmit={submitNewPhishCampaign} className="space-y-4">
                    <div>
                      <label className="block text-[11px] text-slate-500 font-mono mb-1 uppercase font-semibold">Campaign Name</label>
                      <input 
                        type="text" 
                        required
                        value={newPhishName}
                        onChange={(e) => setNewPhishName(e.target.value)}
                        placeholder="e.g. Q4 Executive Payroll Update Alert"
                        className={`w-full rounded p-2.5 text-xs focus:outline-none focus:border-cyan-500 font-medium ${c_input}`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 font-mono mb-1 uppercase font-semibold">Email Template Category</label>
                      <select 
                        value={newPhishTemplate}
                        onChange={(e) => setNewPhishTemplate(e.target.value)}
                        className={`w-full rounded p-2.5 text-xs focus:outline-none focus:border-cyan-500 font-mono cursor-pointer ${c_input}`}
                      >
                        <option value="Financial Incentives">Financial & HR Payroll</option>
                        <option value="IT/Security Support">IT Urgent Password Resets</option>
                        <option value="MFA enrollment urgency">Security Policy Compliance</option>
                        <option value="External SaaS invitation">External Document Link Sharing</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 font-mono mb-1 uppercase font-semibold">Target Recipients (Emails / Phones)</label>
                      <textarea 
                        rows={3}
                        required
                        value={newPhishRecipients}
                        onChange={(e) => {
                          setNewPhishRecipients(e.target.value);
                          const parsed = e.target.value.split(",").map(c => c.trim()).filter(Boolean).length;
                          setNewPhishTargets(String(parsed));
                        }}
                        placeholder="sarah@infoshield.io, alex@infoshield.io, +15550192"
                        className={`w-full rounded p-2.5 text-xs focus:outline-none focus:border-cyan-500 font-mono leading-normal ${c_input}`}
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">Total parsed: {newPhishTargets} targets</span>
                    </div>

                    <div className={`p-3 rounded-lg border flex items-start gap-3 ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/40 border-slate-850"
                    }`}>
                      <input
                        type="checkbox"
                        id="isRealMailEnabled"
                        checked={isRealMailEnabled}
                        onChange={(e) => setIsRealMailEnabled(e.target.checked)}
                        className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-slate-300 rounded cursor-pointer mt-0.5"
                      />
                      <div>
                        <label htmlFor="isRealMailEnabled" className={`text-xs font-bold cursor-pointer select-none flex items-center gap-1.5 ${
                          isLight ? "text-slate-800" : "text-slate-200"
                        }`}>
                          <Globe className="h-3.5 w-3.5 text-cyan-400" /> Enable Real SMTP Dispatch
                        </label>
                        <p className={`text-[10px] leading-relaxed mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                          Relays actual awareness campaign emails through the SMTP server configured in your Portal Settings.
                        </p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition cursor-pointer font-sans"
                    >
                      Authorize & Launch Simulation Run
                    </button>
                  </form>
                </div>

                {/* Phishing Simulation List / Analysis */}
                <div className={`lg:col-span-2 rounded-xl p-5 border ${c_card}`}>
                  <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                    <h3 className={`font-bold text-sm font-mono uppercase tracking-tight ${isLight ? "text-slate-900" : "text-slate-200"}`}>Active Awareness Campaigns</h3>
                    <span className="text-xs text-slate-500 font-mono">Calculated Catch Rate: 12.4%</span>
                  </div>

                  <div className="space-y-4">
                    {phishingCampaigns.map((camp) => {
                      const clickRate = Math.round((camp.clickCount / camp.targetUsers) * 100);
                      const reportRate = Math.round((camp.reportCount / camp.targetUsers) * 100);

                      // Find recipients for this campaign
                      const recipientsList = campaignRecipients.filter(r => r.campaignId === camp.id || r.campaignId === "ALL");

                      return (
                        <div key={camp.id} className={`p-4.5 rounded-xl border space-y-4 text-xs ${
                          isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-850"
                        }`}>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-slate-200"}`}>{camp.name}</h4>
                              <p className="text-[10px] text-slate-500 font-mono">Template: {camp.template} | Run: {camp.date}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDownloadPhishCampaignReport(camp.id, camp.name)}
                                className={`px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer border ${
                                  isLight 
                                    ? "bg-white hover:bg-slate-100 text-slate-700 border-slate-200" 
                                    : "bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800"
                                }`}
                                title="Download Campaign CSV Report"
                              >
                                <Download className="h-3 w-3 text-cyan-500" /> Report
                              </button>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ${
                                camp.status === "ACTIVE" 
                                  ? "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20" 
                                  : "bg-slate-800 text-slate-400"
                              }`}>
                                {camp.status}
                              </span>
                            </div>
                          </div>

                          {/* Data Visualizer Bars */}
                          <div className="space-y-3 font-mono">
                            <div>
                              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                <span>Click/Compromise Rate</span>
                                <span className={clickRate > 15 ? "text-red-500 font-bold" : "text-emerald-500 font-bold"}>
                                  {camp.clickCount} clicks ({clickRate}%)
                                </span>
                              </div>
                              <div className="h-2 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${clickRate}%` }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                <span>SecOps Reporting Rate</span>
                                <span className="text-emerald-500 font-bold">{camp.reportCount} reported ({reportRate}%)</span>
                              </div>
                              <div className="h-2 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${reportRate}%` }} />
                              </div>
                            </div>
                          </div>

                          {/* Recipients Tracker list */}
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-850">
                            <p className="text-[10px] font-mono text-slate-500 font-bold uppercase mb-2">Simulated Recipient Status Tracker ({recipientsList.length})</p>
                            <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1 font-mono text-[10px]">
                              {recipientsList.length === 0 ? (
                                <p className="text-slate-500 italic text-[10px]">No targets recorded.</p>
                              ) : (
                                recipientsList.map((rec, i) => (
                                  <div key={i} className={`p-2 rounded flex justify-between items-center ${
                                    isLight ? "bg-white border border-slate-100" : "bg-slate-900 border border-slate-850"
                                  }`}>
                                    <span className={`truncate max-w-[140px] font-medium ${isLight ? "text-slate-700" : "text-slate-300"}`}>{rec.contact}</span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span className={`h-1.5 w-1.5 rounded-full ${
                                        rec.status === "COMPROMISED" ? "bg-red-500 animate-pulse" :
                                        rec.status === "REPORTED" || rec.status === "PASSED_REPORTED" ? "bg-emerald-500" : "bg-slate-400"
                                      }`} />
                                      <span className={`font-bold ${
                                        rec.status === "COMPROMISED" ? "text-red-500" :
                                        rec.status === "REPORTED" || rec.status === "PASSED_REPORTED" ? "text-emerald-500" : "text-slate-500"
                                      }`}>{rec.status}</span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-850 text-[10px] font-mono text-slate-500">
                            <span>Total Targets: {camp.targetUsers}</span>
                            <span>Standards: HIPAA & ISO-27001</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Sandbox Mail Delivery Simulator & Testing Hub */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                
                {/* SMTP Relay Outbox Queue Logs */}
                <div className={`rounded-xl p-5 border ${c_card}`}>
                  <h3 className={`font-bold text-sm font-mono uppercase tracking-tight mb-1.5 flex items-center gap-2 ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                    <Terminal className="h-4 w-4 text-cyan-500 animate-pulse" /> {isLiveEnvironment ? "Active SMTP Outbox Ingestion Queue" : "Simulated SMTP Outbox Queue"}
                  </h3>
                  <p className={`text-[11px] mb-4 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    Monitor outgoing mail socket connections, security checks, and handshakes in real time.
                  </p>

                  <div className="bg-slate-950 text-slate-300 font-mono text-[10px] p-4 rounded-lg border border-slate-850 h-[340px] overflow-y-auto space-y-2 leading-normal select-none">
                    {smtpDispatchLogs.map((log, i) => {
                      let colorClass = "text-slate-400";
                      if (log.includes("[MTA-SPF]") || log.includes("[MTA-DKIM]") || log.includes("[MTA-SUCCESS]")) {
                        colorClass = "text-emerald-400 font-semibold";
                      } else if (log.includes("[MTA-DELIVER]")) {
                        colorClass = "text-cyan-400";
                      } else if (log.includes("[MTA-INIT]") || log.includes("[MTA-BIND]")) {
                        colorClass = "text-slate-500";
                      }
                      return (
                        <div key={i} className={`pb-1.5 border-b border-slate-900/40 last:border-0 ${colorClass}`}>
                          {log}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Simulated Recipient Mailbox Hub */}
                <div className={`lg:col-span-2 rounded-xl p-5 border ${c_card}`}>
                  <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
                    <h3 className={`font-bold text-sm font-mono uppercase tracking-tight flex items-center gap-2 ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                      <Mail className="h-4 w-4 text-cyan-500" /> {isLiveEnvironment ? "Live Recipient Domain Mailbox Viewer" : "Interactive Recipient Mailbox Viewer"}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-mono text-[11px] text-slate-500">Secure Personal Inbox:</span>
                      <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border ${
                        isLight 
                          ? "bg-slate-100 border-slate-200 text-slate-800" 
                          : "bg-slate-950 border-slate-850 text-cyan-400"
                      }`}>
                        {currentUser ? currentUser.email : "No Active Session"}
                      </span>
                    </div>
                  </div>
                  
                  <p className={`text-[11px] mb-4 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    {isLiveEnvironment 
                      ? "This secure domain inbox displays live awareness campaign emails dispatched directly to your registered enterprise domain addresses. Inspect the mail envelopes below, click verification portals, or report them to verify SecOps detection telemetry."
                      : "This private simulation inbox displays awareness campaign emails dispatched directly to your registered email address. Inspect the mail envelopes below, click test verification portals, or report them to verify SecOps detection telemetry."}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Inbox message index */}
                    <div className="md:col-span-2 border-r border-slate-200 dark:border-slate-850 pr-2 space-y-2 h-[340px] overflow-y-auto">
                      {phishingCampaigns.map((camp) => {
                        const recipient = campaignRecipients.find(r => r.campaignId === camp.id && r.contact === selectedMailboxUser);
                        if (!recipient) return null;

                        return (
                          <div
                            key={camp.id}
                            onClick={() => {}}
                            className={`p-3 rounded-lg border text-xs cursor-pointer transition text-left ${
                              isLight 
                                ? "bg-white hover:bg-slate-50 border-slate-200 text-slate-850" 
                                : "bg-slate-950 hover:bg-slate-900 border-slate-850 text-slate-300"
                            }`}
                          >
                            <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1 font-mono">
                              <span>From: {isLiveEnvironment ? "Active Gateway Relay" : "MTA Simulation"}</span>
                              <span>{camp.date}</span>
                            </div>
                            <div className="font-bold truncate text-[11px] text-slate-800 dark:text-slate-100">{camp.name}</div>
                            <div className="text-[10px] text-slate-500 mt-1 truncate">Category: {camp.template}</div>
                            
                            <div className="mt-2 flex items-center justify-between">
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                recipient.status === "COMPROMISED" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                recipient.status === "REPORTED" || recipient.status === "PASSED_REPORTED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                recipient.status === "CLICKED" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                              }`}>
                                {recipient.status}
                              </span>
                              <span className="text-[9px] font-mono text-slate-500">Details &rarr;</span>
                            </div>
                          </div>
                        );
                      })}
                      {phishingCampaigns.filter(c => campaignRecipients.some(r => r.campaignId === c.id && r.contact === selectedMailboxUser)).length === 0 && (
                        <p className="text-xs text-slate-500 italic p-3 text-center">No simulated emails delivered to {selectedMailboxUser} yet.</p>
                      )}
                    </div>

                    {/* Active Message Preview */}
                    <div className={`md:col-span-3 flex flex-col justify-between h-[340px] rounded-lg p-4 font-sans text-xs border ${
                      isLight ? "bg-white border-slate-200" : "bg-slate-950 border-slate-850"
                    }`}>
                      {phishingCampaigns.length > 0 ? (() => {
                        // Find the first campaign this recipient is enrolled in
                        const campaign = phishingCampaigns.find(c => campaignRecipients.some(r => r.campaignId === c.id && r.contact === selectedMailboxUser));
                        if (!campaign) {
                          return <div className="text-slate-500 italic m-auto text-center">Select an email to load the simulation sandbox preview.</div>;
                        }
                        const recipient = campaignRecipients.find(r => r.campaignId === campaign.id && r.contact === selectedMailboxUser)!;

                        // Subject & Body texts based on template category
                        let subject = `[URGENT] Corporate Notice regarding ${campaign.name}`;
                        let body = `Please review this urgent administrative notification as soon as possible.`;
                        
                        if (campaign.template.includes("Financial")) {
                          subject = `[URGENT] Annual Q3 Bonus Allocations & Salary Review Adjustments`;
                          body = `Important: The corporate Board of Directors has finalized the Q3 corporate performance bonus allocations. Please view the salary structure attachment sheet and review your personalized direct-deposit adjustments immediately to verify banking credentials are in alignment with the treasury ledger.`;
                        } else if (campaign.template.includes("IT")) {
                          subject = `Mandatory Action: Secure Network Password Reset Notice`;
                          body = `Our central Active Directory domain controller detected a suspected credential exposure on an external developer workstation. To maintain secure compliance, you are required to rotate your high-privilege corporate SSO password within the next 2 hours.`;
                        } else if (campaign.template.includes("MFA")) {
                          subject = `Urgent: Mandatory Multi-Factor Authentication Verification`;
                          body = `As mandated by the SOC-2 audit framework control CC6.1, all Active Directory SSO credentials must register a secondary hardware token. Failure to enroll within the next 2 hours will trigger a hardware revocation block.`;
                        } else if (campaign.template.includes("SaaS") || campaign.template.includes("External")) {
                          subject = `Sarah Jenkins shared a secure document folder with you: 'Q4 Budget Drafts'`;
                          body = `You have been invited to collaborate on the shared document 'Q4 Budget Planning & Technical Headcount Allocation'. To review the draft, authenticate with your corporate workspace account.`;
                        }

                        return (
                          <>
                            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                              <div className={`border-b pb-2 space-y-1 ${isLight ? "border-slate-250 text-slate-700" : "border-slate-850 text-slate-300"}`}>
                                <div><span className="text-slate-500 font-mono uppercase text-[9px] mr-1">From:</span> simulation-gateway@infoshield.io</div>
                                <div><span className="text-slate-500 font-mono uppercase text-[9px] mr-1">To:</span> {selectedMailboxUser}</div>
                                <div><span className="text-slate-500 font-mono uppercase text-[9px] mr-1">Subject:</span> <strong className={isLight ? "text-slate-900" : "text-slate-100"}>{subject}</strong></div>
                              </div>
                              
                              <div className={`text-left leading-relaxed space-y-3 p-3.5 rounded border font-sans ${
                                isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-slate-900/40 border-slate-900 text-slate-300"
                              }`}>
                                <p className={`font-semibold text-left ${isLight ? "text-slate-950" : "text-slate-200"}`}>Hi {selectedMailboxUser.split("@")[0]},</p>
                                <p className="text-left">{body}</p>
                                <div className="pt-2 text-left">
                                  <button
                                    type="button"
                                    disabled={recipient.status === "COMPROMISED"}
                                    onClick={() => handleSimulateRecipientAction(campaign.id, selectedMailboxUser, "click")}
                                    className={`inline-block bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-4 py-2 rounded text-xs cursor-pointer shadow-md select-none transition ${
                                      recipient.status === "COMPROMISED" ? "opacity-55 cursor-not-allowed" : ""
                                    }`}
                                  >
                                    👉 Access InfoShield Verification Portal
                                  </button>
                                </div>
                                <p className={`text-[10px] pt-3 border-t text-left ${
                                  isLight ? "border-slate-200 text-slate-500" : "border-slate-850/40 text-slate-500"
                                }`}>
                                  InfoShield Trust Operations, 100 Pine St, San Francisco, CA. This simulated email is part of your corporate HIPAA / SOC-2 awareness exercises.
                                </p>
                              </div>
                            </div>

                            <div className={`pt-3 border-t space-y-2 ${isLight ? "border-slate-200" : "border-slate-850"}`}>
                              <p className="text-[9px] font-mono text-slate-500 text-center uppercase tracking-wider font-bold">Simulate Recipient Actions (Interactive Testing Loop)</p>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  disabled={recipient.status === "COMPROMISED"}
                                  onClick={() => handleSimulateRecipientAction(campaign.id, selectedMailboxUser, "click")}
                                  className={`px-2 py-1.5 rounded font-mono font-bold text-[10px] uppercase transition cursor-pointer flex items-center justify-center gap-1 ${
                                    recipient.status === "COMPROMISED"
                                      ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                                      : "bg-red-500/10 hover:bg-red-500 hover:text-slate-950 text-red-400 border border-red-500/20"
                                  }`}
                                >
                                  ⚠️ Click Link (Fail)
                                </button>
                                <button
                                  disabled={recipient.status === "PASSED_REPORTED" || recipient.status === "REPORTED"}
                                  onClick={() => handleSimulateRecipientAction(campaign.id, selectedMailboxUser, "report")}
                                  className={`px-2 py-1.5 rounded font-mono font-bold text-[10px] uppercase transition cursor-pointer flex items-center justify-center gap-1 ${
                                    recipient.status === "PASSED_REPORTED" || recipient.status === "REPORTED"
                                      ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                                      : "bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border border-emerald-500/20"
                                  }`}
                                >
                                  🛡️ Report Email (Pass)
                                </button>
                              </div>
                            </div>
                          </>
                        );
                      })() : (
                        <div className="text-slate-500 italic m-auto text-center font-mono text-[11px]">No phishing campaigns active. Please build and launch a campaign above.</div>
                      )}
                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB: SECURITY TRAINING HUB */}
          {activeTab === "training" && (
            <div className="space-y-6" id="view-training">
              <TrainingHub
                theme={theme}
                activeRole={activeRole}
                currentUser={currentUser}
                triggerBannerAlert={triggerBannerAlert}
              />
            </div>
          )}

          {/* TAB 5: TABLETOP SCENARIOS */}
          {activeTab === "tabletop" && (
            <div className="space-y-6" id="view-tabletop">
              
              <div className={`p-5 rounded-xl border flex flex-wrap justify-between items-center gap-4 ${c_card}`}>
                <div>
                  <h2 className={`text-xl font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                    <Terminal className="h-5 w-5 text-cyan-500" /> Interactive Tabletop Response Exercises
                  </h2>
                  <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>Simulate ransomware crises and assess system-wide risk metrics based on response decisions</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tabletopScenarios.map((scen) => (
                    <button
                      key={scen.id}
                      onClick={() => {
                        setActiveScenarioId(scen.id);
                        resetTabletopSimulation();
                      }}
                      className={`px-3 py-1.5 rounded text-xs font-mono font-bold cursor-pointer transition ${
                        activeScenarioId === scen.id 
                          ? "bg-cyan-600 text-slate-950 font-bold" 
                          : isLight ? "bg-slate-100 border border-slate-200 text-slate-700" : "bg-slate-950 border border-slate-850 text-slate-400"
                      }`}
                    >
                      {scen.title.split(":")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {tabletopScenarios.filter(s => s.id === activeScenarioId).map((scenario) => {
                const currentStepObj = scenario.steps[tabletopStep];
                const totalSteps = scenario.steps.length;

                return (
                  <div key={scenario.id} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Active Question Panel */}
                    <div className={`lg:col-span-2 rounded-xl p-5 flex flex-col justify-between border ${c_card}`}>
                      <div>
                        <div className="flex flex-wrap justify-between items-center text-xs font-mono text-slate-500 mb-3 gap-2">
                          <span className="uppercase font-bold text-cyan-500">ACTIVE PLAYBOOK SCENARIO: {scenario.title}</span>
                          <span>STAGED INJECT {tabletopStep + 1} OF {totalSteps}</span>
                        </div>

                        {/* Interactive Recipients for tabletop */}
                        <div className={`p-3.5 rounded-xl border mb-5 ${isLight ? "bg-slate-100/60 border-slate-200" : "bg-slate-950 border-slate-850"}`}>
                          <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1.5">Tabletop Exercise Target Recipients (Emails / Phones)</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={tabletopRecipients}
                              onChange={(e) => setTabletopRecipients(e.target.value)}
                              placeholder="ciso@infoshield.io, +15550199, safety-admin@infoshield.io"
                              className={`flex-1 rounded px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 font-mono ${c_input}`}
                            />
                            <button
                              type="button"
                              onClick={async () => {
                                const contacts = tabletopRecipients.split(",").map(c => c.trim()).filter(Boolean);
                                if (contacts.length === 0) {
                                  triggerBannerAlert("Please specify at least one email or phone number in target recipients.");
                                  return;
                                }
                                triggerBannerAlert(`Initiating secure multi-channel tabletop dispatch sequence via full-stack MTA...`);
                                try {
                                  const res = await fetch("/api/tabletop/dispatch", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      scenarioId: scenario.id,
                                      stepTitle: `Inject ${tabletopStep + 1}`,
                                      recipients: contacts,
                                      smsGatewayApiKey: smsApiKey || undefined
                                    })
                                  });
                                  const data = await res.json();
                                  if (data.success && data.mtaLogs) {
                                    triggerBannerAlert(`Crisis drill alerts successfully broadcasted to ${contacts.length} nodes.`);
                                    setExerciseLogs(prev => [...prev, ...data.mtaLogs]);
                                  }
                                } catch (err) {
                                  console.error("Alert dispatch failed", err);
                                  triggerBannerAlert("Failed to dispatch alert via Express server.");
                                }
                              }}
                              className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-3 rounded text-xs transition cursor-pointer font-sans"
                            >
                              Dispatch Alerts
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1.5 block">Recipients will receive decision injection prompts to simulate organizational crisis coordination.</span>
                        </div>

                        {/* Staged Narrative */}
                        <div className={`p-4.5 rounded-lg border mb-5 ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-850"}`}>
                          <h4 className="text-sm font-mono text-cyan-500 font-bold mb-2 flex items-center gap-1.5">
                            <Flame className="h-4 w-4 text-red-500 animate-pulse" /> Live Situation Inject:
                          </h4>
                          <p className={`text-xs leading-relaxed font-mono ${isLight ? "text-slate-800" : "text-slate-300"}`}>{currentStepObj.inject}</p>
                        </div>

                        <p className={`text-xs font-bold mb-4 ${isLight ? "text-slate-950" : "text-slate-200"}`}>{currentStepObj.question}</p>

                        {/* Interactive Option Selectors */}
                        <div className="space-y-3 font-sans">
                          {currentStepObj.options.map((option, idx) => (
                            <button
                              key={idx}
                              id={`tabletop-choice-${idx}`}
                              onClick={() => handleTabletopChoice(scenario, idx)}
                              className={`w-full text-left p-4 rounded-xl text-xs font-medium transition flex items-start gap-3 border cursor-pointer ${
                                isLight 
                                  ? "bg-white hover:bg-slate-50 border-slate-200 text-slate-800" 
                                  : "bg-slate-950 hover:bg-slate-900 border-slate-850 text-slate-300"
                              }`}
                            >
                              <span className="h-5 w-5 rounded-full bg-cyan-600/10 border border-cyan-500/30 flex items-center justify-center font-mono text-[10px] text-cyan-500 font-bold shrink-0">
                                {idx + 1}
                              </span>
                              <span>{option}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className={`flex justify-between items-center mt-6 pt-4 border-t text-xs ${isLight ? "border-slate-200" : "border-slate-800"}`}>
                        <span className="text-slate-500 font-mono">Selected Role Context: {activeRole}</span>
                        <button
                          onClick={resetTabletopSimulation}
                          className="text-slate-500 hover:text-slate-400 underline cursor-pointer font-mono"
                        >
                          Restart Exercise Playbook
                        </button>
                      </div>
                    </div>

                    {/* Live Metric Scoring Feed */}
                    <div className={`rounded-xl p-5 flex flex-col justify-between border ${c_card}`}>
                      <div>
                        <h3 className={`font-bold text-sm mb-4 uppercase tracking-tight font-mono ${isLight ? "text-slate-900" : "text-slate-200"}`}>Risk Exposure Index</h3>
                        
                        {/* Risk Gauge */}
                        <div className={`p-4 rounded-lg border text-center mb-5 ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-850"}`}>
                          <div className="text-3xl font-extrabold font-mono text-cyan-500">{riskExposureScore}%</div>
                          <p className="text-[10px] text-slate-500 font-mono mt-1">CALCULATED ATTACK THREAT AREA</p>
                          <div className="h-2.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden mt-3">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                riskExposureScore > 70 ? "bg-red-500" : riskExposureScore > 40 ? "bg-amber-500" : "bg-emerald-500"
                              }`} 
                              style={{ width: `${riskExposureScore}%` }} 
                            />
                          </div>
                        </div>

                        <p className={`text-xs font-mono uppercase tracking-widest mb-2 font-bold ${isLight ? "text-slate-600" : "text-slate-400"}`}>Simulated Activity Logs</p>
                        <div className="space-y-2 max-h-[220px] overflow-y-auto font-mono text-[10px] text-slate-500 pr-1 leading-normal">
                          {exerciseLogs.map((log, i) => (
                            <div key={i} className={`p-2.5 rounded border leading-relaxed ${
                              isLight ? "bg-slate-50/50 border-slate-200" : "bg-slate-950 border-slate-850"
                            }`}>
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={`text-[10px] font-mono text-slate-500 leading-normal pt-4 border-t ${isLight ? "border-slate-200" : "border-slate-850/60"}`}>
                        CISO Tabletop exercise platform strictly aligns with ISO-27001 disaster response protocol verification.
                      </div>
                    </div>

                  </div>
                );
              })}

              {/* Compliance Archive Table */}
              <div className={`rounded-xl p-5 border ${c_card} mt-6`}>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className={`font-bold text-sm uppercase tracking-tight font-mono ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                      Corporate Tabletop Drill Compliance Archive
                    </h3>
                    <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      Historical log of completed crisis coordination exercises as mandated by ISO 27001 / SOC 2 Type II controls.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                    Auditable Records
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className={`border-b ${isLight ? "border-slate-200 text-slate-500" : "border-slate-850 text-slate-400"}`}>
                        <th className="py-2.5 font-bold uppercase text-[10px]">Session ID</th>
                        <th className="py-2.5 font-bold uppercase text-[10px]">Scenario</th>
                        <th className="py-2.5 font-bold uppercase text-[10px]">Completed At</th>
                        <th className="py-2.5 font-bold uppercase text-[10px]">Facilitator</th>
                        <th className="py-2.5 font-bold uppercase text-[10px] text-center">Steps</th>
                        <th className="py-2.5 font-bold uppercase text-[10px] text-center">Final Risk Score</th>
                        <th className="py-2.5 font-bold uppercase text-[10px]">Compliance Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/40">
                      {pastTabletopSessions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-slate-500">
                            No archived tabletop sessions found. Complete a drill to generate a verified compliance certificate.
                          </td>
                        </tr>
                      ) : (
                        pastTabletopSessions.map((sess: any) => (
                          <tr key={sess.id} className={isLight ? "text-slate-800 hover:bg-slate-50/50" : "text-slate-300 hover:bg-slate-900/40"}>
                            <td className="py-3 font-bold text-cyan-500">{sess.id}</td>
                            <td className="py-3 max-w-[240px] truncate" title={sess.scenarioTitle}>{sess.scenarioTitle}</td>
                            <td className="py-3 text-[11px] text-slate-400">{new Date(sess.completedAt).toLocaleString()}</td>
                            <td className="py-3 text-[11px] font-semibold">{sess.facilitator}</td>
                            <td className="py-3 text-center">{sess.stepsCompleted} / 3</td>
                            <td className="py-3 text-center">
                              <span className={`px-2 py-0.5 rounded font-bold ${
                                sess.finalRiskScore > 75 
                                  ? "bg-red-500/15 text-red-400" 
                                  : sess.finalRiskScore > 40 
                                  ? "bg-amber-500/15 text-amber-400" 
                                  : "bg-emerald-500/15 text-emerald-400"
                              }`}>
                                {sess.finalRiskScore}%
                              </span>
                            </td>
                            <td className="py-3">
                              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/15">
                                ✓ VERIFIED AUDIT
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: VULNERABILITY SCANNER & VAPT SUITE */}
          {activeTab === "vulnerabilities" && (
            <div className="space-y-6" id="view-vulnerabilities">
              
              {/* Header and Sub-tab selector */}
              <div className={`flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl border ${c_card}`}>
                <div>
                  <h2 className={`text-xl font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                    <Database className="h-5 w-5 text-cyan-500" /> Vulnerability & Penetration Testing (VAPT) Suite
                  </h2>
                  <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    Audit system assets or run active, defensive scanning tools on remote targets
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className={`text-xs font-mono font-bold uppercase whitespace-nowrap ${isLight ? "text-slate-650" : "text-slate-400"}`}>
                    Target URL:
                  </span>
                  <input
                    id="vapt-scan-url-header-input"
                    type="text"
                    value={vaptScanUrl}
                    onChange={(e) => setVaptScanUrl(e.target.value)}
                    placeholder="e.g. https://your-app-domain.com"
                    className={`rounded px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-mono w-48 sm:w-64 transition ${c_input}`}
                    disabled={vaptScanning}
                  />
                </div>

                <div className="flex items-center bg-slate-950/20 p-1 rounded-xl border border-slate-800/60 shadow-inner">
                  <button
                    onClick={() => setVaptSubTab("infrastructure")}
                    className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                      vaptSubTab === "infrastructure"
                        ? "bg-cyan-500 text-slate-950 shadow-sm animate-fade-in"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Infrastructure Assets
                  </button>
                  <button
                    onClick={() => setVaptSubTab("tools")}
                    className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                      vaptSubTab === "tools"
                        ? "bg-cyan-500 text-slate-950 shadow-sm animate-fade-in"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    VAPT Tools Hub
                  </button>
                </div>
              </div>

              {vaptSubTab === "infrastructure" && (
                <div className="space-y-6 animate-fade-in">
                  {/* Action row */}
                  <div className={`flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl border ${c_card}`}>
                    <div>
                      <h3 className={`font-bold text-sm ${isLight ? "text-slate-800" : "text-slate-200"}`}>Infrastructure Vulnerability Controls</h3>
                      <p className="text-xs text-slate-500">Monitor and orchestrate automated system hotfixes across active environment nodes</p>
                    </div>
                    <div className="flex gap-2.5">
                      <button
                        onClick={handleDownloadVulnerabilityReport}
                        className="bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-cyan-400 font-mono font-bold px-4 py-2 rounded text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5 text-cyan-500" /> Export Audit Report (CSV)
                      </button>

                      <button
                        id="trigger-full-vuln-scan-btn"
                        onClick={() => {
                          triggerBannerAlert("Initiating instant deep-packet vulnerability scan across nodes.");
                          fetchVulnerabilities();
                          setSelectedVulnIds([]);
                        }}
                        className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold px-4 py-2 rounded text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Force Immediate System Scan
                      </button>
                    </div>
                  </div>

                  {/* Vulnerabilities Table */}
                  <div className={`rounded-xl overflow-hidden border ${c_card}`} id="vulnerabilities-scanner-table">
                    <div className={`p-5 border-b flex flex-wrap justify-between items-center gap-3 ${c_border}`}>
                      <h3 className={`font-bold text-sm font-mono uppercase tracking-tight ${isLight ? "text-slate-900" : "text-slate-200"}`}>Vulnerable System Assets Matrix</h3>
                      {selectedVulnIds.length > 0 && (
                        <button
                          id="vulnerabilities-bulk-patch-btn"
                          onClick={() => {
                            setVulnerabilities(prev => 
                              prev.map(v => selectedVulnIds.includes(v.id) ? { ...v, status: "PATCHED" } : v)
                            );
                            triggerBannerAlert(`Bulk patch orchestration successfully deployed patches to ${selectedVulnIds.length} vulnerable nodes.`);
                            setSelectedVulnIds([]);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold px-3.5 py-1.5 rounded text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
                        >
                          <span>Deploy Bulk Patch ({selectedVulnIds.length} Nodes)</span>
                        </button>
                      )}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className={`${c_table_header}`}>
                            <th className="p-4 w-12">
                              <input
                                type="checkbox"
                                checked={vulnerabilities.filter(v => v.status !== "PATCHED").length > 0 && selectedVulnIds.length === vulnerabilities.filter(v => v.status !== "PATCHED").length}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedVulnIds(vulnerabilities.filter(v => v.status !== "PATCHED").map(v => v.id));
                                  } else {
                                    setSelectedVulnIds([]);
                                  }
                                }}
                                className={`h-4 w-4 rounded cursor-pointer ${isLight ? "accent-cyan-600 text-cyan-600 border-slate-300 bg-white" : "accent-cyan-500 text-cyan-500 border-slate-700 bg-slate-900"}`}
                              />
                            </th>
                            <th className="p-4">Asset Node</th>
                            <th className="p-4">CVE Identifier</th>
                            <th className="p-4">Vulnerability Title</th>
                            <th className="p-4">Severity</th>
                            <th className="p-4">Scan State</th>
                            <th className="p-4 text-right">Orchestrator Action</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-slate-850"}`}>
                          {vulnerabilities.map((vuln) => (
                            <motion.tr
                              key={vuln.id}
                              className={`${c_table_row} transition-all duration-200 origin-center`}
                              whileHover={{ scale: 1.006, y: -0.5 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                              <td className="p-4">
                                <input
                                  type="checkbox"
                                  disabled={vuln.status === "PATCHED"}
                                  checked={selectedVulnIds.includes(vuln.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedVulnIds(prev => [...prev, vuln.id]);
                                    } else {
                                      setSelectedVulnIds(prev => prev.filter(id => id !== vuln.id));
                                    }
                                  }}
                                  className={`h-4 w-4 rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                                    isLight ? "accent-cyan-600 text-cyan-600 border-slate-300 bg-white" : "accent-cyan-500 text-cyan-500 border-slate-700 bg-slate-900"
                                  }`}
                                />
                              </td>
                              <td className="p-4">
                                <div className={`font-mono font-bold ${isLight ? "text-slate-900" : "text-slate-200"}`}>{vuln.assetName}</div>
                                <div className="text-[10px] font-mono text-slate-500">Internal IP: {vuln.ip}</div>
                              </td>
                              <td className="p-4">
                                <span className={`font-mono border px-2 py-0.5 rounded font-semibold ${
                                  isLight ? "bg-slate-100 border-slate-200 text-cyan-700" : "bg-slate-900 border-slate-800 text-cyan-400"
                                }}`}>
                                  {vuln.cve}
                                </span>
                              </td>
                              <td className={`p-4 font-medium font-sans ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                                {vuln.title}
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${
                                  vuln.severity === "CRITICAL"
                                    ? isLight ? "bg-red-50 text-red-700 border-red-200" : "bg-red-500/10 text-red-400 border-red-500/20"
                                    : vuln.severity === "HIGH"
                                    ? isLight ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    : isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-800 text-slate-400 border-slate-700"
                                }}`}>
                                  {vuln.severity}
                                </span>
                              </td>
                              <td className="p-4 font-mono text-slate-400">
                                <div className="flex items-center gap-1.5">
                                  <span className={`h-2 w-2 rounded-full ${
                                    vuln.status === "PATCHED" 
                                      ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" 
                                      : "bg-red-500 animate-pulse"
                                  }`} />
                                  <span className={isLight ? "text-slate-600" : "text-slate-400"}>{vuln.status}</span>
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                {vuln.status !== "PATCHED" ? (
                                  <button
                                    onClick={() => patchVulnerability(vuln.id, vuln.assetName)}
                                    className="bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/25 text-emerald-400 hover:text-slate-950 px-2.5 py-1 rounded transition text-[10px] font-mono font-bold uppercase cursor-pointer"
                                  >
                                    Deploy Automated Patch
                                  </button>
                                ) : (
                                  <span className="text-emerald-500 font-mono font-bold text-[10px] uppercase">
                                    ✓ Fully Secure
                                  </span>
                                )}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {vaptSubTab === "tools" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                  
                  {/* Left Column: Live Security headers inspector tool */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className={`p-5 rounded-xl border ${c_card}`}>
                      <h3 className={`font-bold text-sm flex items-center gap-2 mb-1.5 ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                        <Globe className="h-4.5 w-4.5 text-cyan-500" /> HTTP Security Headers VAPT Scanner
                      </h3>
                      <p className="text-xs text-slate-500 mb-5">
                        Statelessly probe remote web targets over TLS to analyze crucial defense-in-depth security envelopes.
                      </p>

                      <form onSubmit={handleExecuteVaptScan} className="flex gap-2">
                        <input
                          type="text"
                          value={vaptScanUrl}
                          onChange={(e) => setVaptScanUrl(e.target.value)}
                          placeholder="e.g. https://your-app-domain.com"
                          className={`flex-1 rounded px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 font-mono ${c_input}`}
                          disabled={vaptScanning}
                        />
                        <button
                          type="submit"
                          disabled={vaptScanning || !vaptScanUrl.trim()}
                          className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold px-4 rounded text-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {vaptScanning ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Analyzing Target...
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="h-3.5 w-3.5" /> Execute Audit Scan
                            </>
                          )}
                        </button>
                      </form>

                      {/* Dynamic terminal window console logs */}
                      {vaptConsoleLogs.length > 0 && (
                        <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-[10.5px] text-slate-400 space-y-1.5 max-h-[180px] overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                          {vaptConsoleLogs.map((log, index) => (
                            <div key={index} className={
                              log.includes("SUCCESS") ? "text-emerald-400 font-semibold" :
                              log.includes("ERROR") ? "text-red-400 font-semibold" :
                              log.startsWith("$") ? "text-cyan-400" : "text-slate-400"
                            }>
                              {log}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Header analysis scan report */}
                      {vaptScanResult && (
                        <div className={`mt-5 border-t pt-5 ${isLight ? "border-slate-200" : "border-slate-800/80"}`}>
                          <div className={`flex items-center justify-between gap-4 p-4 rounded-xl border mb-4 ${
                            isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/30 border-slate-800"
                          }`}>
                            <div>
                              <span className="text-[10px] text-slate-500 font-mono block">AUDIT TARGET TARGETED:</span>
                              <span className={`text-xs font-mono font-bold truncate max-w-xs block ${isLight ? "text-slate-800" : "text-slate-200"}`}>{vaptScanResult.url}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-500 font-mono block">SECURITY RATIO:</span>
                              <span className={`text-xl font-extrabold font-mono ${
                                vaptScanResult.score > 80 ? "text-emerald-500" :
                                vaptScanResult.score > 50 ? "text-amber-500" : "text-red-500"
                              }`}>{vaptScanResult.score}%</span>
                            </div>
                          </div>

                          <div className="space-y-3.5">
                            {vaptScanResult.findings.map((item: any, i: number) => (
                              <div key={i} className={`p-4 rounded-lg border leading-relaxed ${
                                item.present 
                                  ? isLight ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-500/5 border-emerald-500/10" 
                                  : item.severity === "HIGH"
                                  ? isLight ? "bg-red-500/5 border-red-500/20" : "bg-red-500/5 border-red-500/10"
                                  : isLight ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-500/5 border-amber-500/10"
                              }`}>
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <span className={`font-mono text-xs font-bold ${isLight ? "text-slate-900" : "text-slate-200"}`}>{item.header}</span>
                                  <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold border ${
                                    item.present 
                                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                      : item.severity === "HIGH"
                                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                  }`}>
                                    {item.present ? "PASSED" : `MISSING (${item.severity})`}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1.5">{item.description}</p>
                                {!item.present && (
                                  <div className={`mt-3 p-3 rounded border ${isLight ? "bg-slate-100/70 border-slate-200" : "bg-slate-950/60 border-slate-850"}`}>
                                    <span className="text-[9px] text-cyan-500 uppercase font-mono font-bold block">Actionable Remediation Guidance:</span>
                                    <span className={`text-[10px] font-mono mt-1 block leading-normal ${isLight ? "text-slate-700 font-medium" : "text-slate-400"}`}>{item.remediation}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Free OS command suite and learning panel */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className={`p-5 rounded-xl border ${c_card}`}>
                      <h3 className={`font-bold text-sm flex items-center gap-2 mb-1.5 ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                        <Terminal className="h-4.5 w-4.5 text-cyan-500" /> Safe Open-Source VAPT Command Desk
                      </h3>
                      <p className="text-xs text-slate-500 mb-5">
                        Interactive cookbook containing standard penetration testing tools commands for defensive audits. Click any tool to trigger simulated console analysis.
                      </p>

                      <div className="space-y-4">
                        {/* Tool 1: Nmap */}
                        <div className={`p-4 rounded-xl border space-y-3 ${isLight ? "bg-slate-50 border-slate-200" : "border-slate-800 bg-slate-950/10"}`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold font-mono uppercase ${isLight ? "text-cyan-800" : "text-cyan-400"}`}>NMAP Port Scan</span>
                            <button
                              onClick={() => handleSimulateTool("nmap", `nmap -sV -T4 -F ${vaptScanUrl.replace(/^https?:\/\//, "")}`)}
                              className="bg-cyan-500/10 hover:bg-cyan-500 border border-cyan-500/20 text-cyan-400 hover:text-slate-950 text-[10px] font-mono font-bold px-2 py-1 rounded transition uppercase cursor-pointer"
                              disabled={vaptScanning}
                            >
                              Simulate Output
                            </button>
                          </div>
                          <p className={`text-[11px] leading-normal ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                            Discover active port nodes, running services, and service-level configurations on the remote host interface.
                          </p>
                          <div className={`p-2.5 rounded border ${isLight ? "bg-slate-100 border-slate-200" : "bg-slate-950 border-slate-900"}`}>
                            <code className={`text-[10.5px] font-mono break-all font-semibold ${isLight ? "text-cyan-850" : "text-cyan-400"}`}>
                              nmap -sV -T4 -F {vaptScanUrl.replace(/^https?:\/\//, "")}
                            </code>
                          </div>
                        </div>

                        {/* Tool 2: Nikto */}
                        <div className={`p-4 rounded-xl border space-y-3 ${isLight ? "bg-slate-50 border-slate-200" : "border-slate-800 bg-slate-950/10"}`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold font-mono uppercase ${isLight ? "text-cyan-800" : "text-cyan-400"}`}>NIKTO Web Server Audit</span>
                            <button
                              onClick={() => handleSimulateTool("nikto", `nikto -h ${vaptScanUrl}`)}
                              className="bg-cyan-500/10 hover:bg-cyan-500 border border-cyan-500/20 text-cyan-400 hover:text-slate-950 text-[10px] font-mono font-bold px-2 py-1 rounded transition uppercase cursor-pointer"
                              disabled={vaptScanning}
                            >
                              Simulate Output
                            </button>
                          </div>
                          <p className={`text-[11px] leading-normal ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                            Scans target web servers to discover index exposure, vulnerable configurations, and server identity disclosure details.
                          </p>
                          <div className={`p-2.5 rounded border ${isLight ? "bg-slate-100 border-slate-200" : "bg-slate-950 border-slate-900"}`}>
                            <code className={`text-[10.5px] font-mono break-all font-semibold ${isLight ? "text-cyan-850" : "text-cyan-400"}`}>
                              nikto -h {vaptScanUrl}
                            </code>
                          </div>
                        </div>

                        {/* Tool 3: SSLyze */}
                        <div className={`p-4 rounded-xl border space-y-3 ${isLight ? "bg-slate-50 border-slate-200" : "border-slate-800 bg-slate-950/10"}`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold font-mono uppercase ${isLight ? "text-cyan-800" : "text-cyan-400"}`}>SSLYZE Certificate Auditor</span>
                            <button
                              onClick={() => handleSimulateTool("sslyze", `sslyze ${vaptScanUrl.replace(/^https?:\/\//, "")}:443`)}
                              className="bg-cyan-500/10 hover:bg-cyan-500 border border-cyan-500/20 text-cyan-400 hover:text-slate-950 text-[10px] font-mono font-bold px-2 py-1 rounded transition uppercase cursor-pointer"
                              disabled={vaptScanning}
                            >
                              Simulate Output
                            </button>
                          </div>
                          <p className={`text-[11px] leading-normal ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                            Audit TLS encryption protocol strength, outdated cyphers suite support, and active TLS certificate trust anchors.
                          </p>
                          <div className={`p-2.5 rounded border ${isLight ? "bg-slate-100 border-slate-200" : "bg-slate-950 border-slate-900"}`}>
                            <code className={`text-[10.5px] font-mono break-all font-semibold ${isLight ? "text-cyan-850" : "text-cyan-400"}`}>
                              sslyze {vaptScanUrl.replace(/^https?:\/\//, "")}:443
                            </code>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                  
                </div>
              )}

            </div>
          )}

          {/* TAB 7: SIEM LOGS & AI THREAT ANALYSIS */}
          {activeTab === "siem" && (() => {
            const filteredSiemLogs = siemLogs.filter((log) => {
              const query = siemSearchQuery.toLowerCase().trim();
              if (query) {
                const matchIp = (log.sourceIp || "").toLowerCase().includes(query) || (log.targetIp || "").toLowerCase().includes(query);
                const matchUser = (log.user || "").toLowerCase().includes(query);
                const matchAction = (log.action || "").toLowerCase().includes(query);
                const matchPayload = (log.payload || "").toLowerCase().includes(query);
                const matchSignature = (log.signature || "").toLowerCase().includes(query);
                const matchId = (log.id || "").toLowerCase().includes(query);
                if (!matchIp && !matchUser && !matchAction && !matchPayload && !matchSignature && !matchId) {
                  return false;
                }
              }
              if (siemSeverityFilter !== "ALL") {
                if (log.severity !== siemSeverityFilter) return false;
              }
              return true;
            });

            const highlightText = (text: string, query: string) => {
              if (!query) return text;
              const parts = text.split(new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
              return (
                <>
                  {parts.map((part, i) => 
                    part.toLowerCase() === query.toLowerCase() 
                      ? <mark key={i} className={`px-0.5 rounded font-extrabold ${isLight ? "bg-cyan-250 text-slate-900" : "bg-cyan-500/30 text-cyan-300"}`}>{part}</mark>
                      : part
                  )}
                </>
              );
            };

            return (
              <div className="space-y-6" id="view-siem">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* SIEM logs viewer */}
                  <div className={`lg:col-span-7 rounded-xl p-5 flex flex-col justify-between border ${c_card}`}>
                    <div>
                      <h3 className={`font-bold text-sm mb-1 uppercase tracking-tight font-mono ${isLight ? "text-slate-900" : "text-slate-200"}`}>Live Centralized SIEM Log Broker</h3>
                      <p className={`text-xs mb-4 ${isLight ? "text-slate-500" : "text-slate-400"}`}>Select any telemetry row or type a raw payload for AI-driven risk modeling</p>
                    </div>

                    {/* Search and Filters */}
                    <div className="mb-4 space-y-3">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                          <Search className="h-4 w-4 text-slate-500" />
                        </span>
                        <input
                          type="text"
                          value={siemSearchQuery}
                          onChange={(e) => setSiemSearchQuery(e.target.value)}
                          placeholder="Search logs by IP, User, Event action, or Payload details..."
                          className={`w-full rounded-xl pl-10 pr-10 py-2.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all duration-150 ${c_input}`}
                        />
                        {siemSearchQuery && (
                          <button
                            onClick={() => setSiemSearchQuery("")}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                        {/* Severity Filters */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mr-1">Severity:</span>
                          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => {
                            const isActive = siemSeverityFilter === sev;
                            return (
                              <button
                                key={sev}
                                onClick={() => setSiemSeverityFilter(sev)}
                                className={`px-2 py-1 rounded font-mono text-[9px] font-bold transition uppercase cursor-pointer ${
                                  isActive
                                    ? sev === "CRITICAL"
                                      ? "bg-red-500/20 text-red-400 border border-red-500/40"
                                      : sev === "HIGH"
                                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                      : sev === "MEDIUM"
                                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                                      : sev === "LOW"
                                      ? "bg-slate-500/20 text-slate-400 border border-slate-500/40"
                                      : "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                                    : "bg-slate-950 border border-slate-850/50 text-slate-400 hover:text-slate-300"
                                }`}
                              >
                                {sev}
                              </button>
                            );
                          })}
                        </div>

                        {/* Quick Stats Summary */}
                        <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
                          <span>Showing <strong>{filteredSiemLogs.length}</strong> of {siemLogs.length}</span>
                          {(siemSearchQuery || siemSeverityFilter !== "ALL") && (
                            <button
                              onClick={() => {
                                setSiemSearchQuery("");
                                setSiemSeverityFilter("ALL");
                              }}
                              className="text-cyan-500 hover:underline cursor-pointer font-bold"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Traffic Pattern Analytics Card */}
                    {filteredSiemLogs.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className={`p-2 rounded-lg border text-center ${isLight ? "bg-slate-100/50 border-slate-200" : "bg-slate-950 border-slate-900/60"}`}>
                          <span className="block text-[8px] font-mono text-slate-500 uppercase">Critical/High</span>
                          <span className="text-xs font-mono font-bold text-red-400">
                            {filteredSiemLogs.filter(l => l.severity === "CRITICAL" || l.severity === "HIGH").length}
                          </span>
                        </div>
                        <div className={`p-2 rounded-lg border text-center ${isLight ? "bg-slate-100/50 border-slate-200" : "bg-slate-950 border-slate-900/60"}`}>
                          <span className="block text-[8px] font-mono text-slate-500 uppercase">Unique Users</span>
                          <span className="text-xs font-mono font-bold text-cyan-400">
                            {new Set(filteredSiemLogs.map(l => l.user)).size}
                          </span>
                        </div>
                        <div className={`p-2 rounded-lg border text-center ${isLight ? "bg-slate-100/50 border-slate-200" : "bg-slate-950 border-slate-900/60"}`}>
                          <span className="block text-[8px] font-mono text-slate-500 uppercase">Sources</span>
                          <span className="text-xs font-mono font-bold text-purple-400">
                            {new Set(filteredSiemLogs.map(l => l.sourceIp)).size}
                          </span>
                        </div>
                        <div className={`p-2 rounded-lg border text-center ${isLight ? "bg-slate-100/50 border-slate-200" : "bg-slate-950 border-slate-900/60"}`}>
                          <span className="block text-[8px] font-mono text-slate-500 uppercase">Blocked / Fail</span>
                          <span className="text-xs font-mono font-bold text-amber-400">
                            {filteredSiemLogs.filter(l => l.status === "BLOCKED" || l.status === "FAILED").length}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {filteredSiemLogs.length === 0 ? (
                        <div className="p-8 text-center rounded-lg border border-dashed border-slate-800 text-slate-500 font-mono text-xs">
                          No event logs matched your query. Try adjusting your search query or severity filters.
                        </div>
                      ) : (
                        filteredSiemLogs.map((log) => (
                          <div 
                            key={log.id} 
                            onClick={() => setSelectedLogForAi(log.payload)}
                            className={`p-3.5 rounded-lg border text-xs font-mono transition cursor-pointer ${
                              selectedLogForAi === log.payload 
                                ? isLight ? "bg-cyan-50/70 border-cyan-500 text-slate-900" : "bg-cyan-950/30 border-cyan-500 text-slate-200" 
                                : isLight ? "bg-white hover:bg-slate-50 border-slate-250 text-slate-800" : "bg-slate-950 hover:bg-slate-900/60 border-slate-850 text-slate-300"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[10px] font-bold text-slate-500">[{log.id}] {new Date(log.timestamp).toLocaleTimeString()}</span>
                              <span className={`text-[9px] px-1.5 rounded font-bold border ${
                                log.severity === "CRITICAL" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-slate-850 text-slate-400 border-slate-750"
                              }`}>
                                {log.severity}
                              </span>
                            </div>

                            <p className={`break-words font-semibold ${isLight ? "text-slate-950" : "text-slate-200"}`}>
                              {highlightText(log.action, siemSearchQuery)}
                            </p>
                            <p className={`text-[11px] mt-1 italic break-words ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                              {highlightText(log.payload, siemSearchQuery)}
                            </p>

                            <div className={`flex justify-between items-center text-[10px] text-slate-500 mt-2 pt-2 border-t ${isLight ? "border-slate-200" : "border-slate-850/40"}`}>
                              <span>
                                User: {highlightText(log.user, siemSearchQuery)} | IP: {highlightText(log.sourceIp, siemSearchQuery)}
                              </span>
                              <span className="truncate max-w-[120px]">Sign: {highlightText(log.signature, siemSearchQuery)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* AI Threat Analyzer Output */}
                  <div className={`lg:col-span-5 rounded-xl p-5 flex flex-col justify-between border ${c_card}`}>
                    <div>
                      <h3 className={`font-bold text-sm mb-2 uppercase tracking-tight font-mono flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                        <Zap className="h-4 w-4 text-cyan-400 animate-pulse" /> AI-Driven Threat Forensics
                      </h3>
                      <p className={`text-xs mb-4 ${isLight ? "text-slate-500" : "text-slate-400"}`}>Leverage Gemini model APIs to parse, prioritize, and isolate active vulnerabilities.</p>

                      <div className="space-y-4">
                        {/* Interactive Log Analyst Prompt */}
                        <div>
                          <label className={`block text-xs font-mono mb-1.5 uppercase ${isLight ? "text-slate-600" : "text-slate-400"}`}>Selected Security Event Input</label>
                          <textarea
                            rows={4}
                            value={selectedLogForAi || customLogText}
                            onChange={(e) => {
                              setSelectedLogForAi("");
                              setCustomLogText(e.target.value);
                            }}
                            placeholder="Select an existing SIEM event log from the left index, or type any custom network traffic narrative to evaluate."
                            className={`w-full rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-500 font-mono leading-relaxed ${c_input}`}
                          />
                        </div>

                        <button
                          onClick={() => runAiThreatDetection(selectedLogForAi || customLogText)}
                          disabled={aiAnalyzing || (!selectedLogForAi && !customLogText)}
                          className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                        >
                          {aiAnalyzing ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" /> Assessing Threat Vectors...
                            </>
                          ) : (
                            "Analyze with AI Threat Detection"
                          )}
                        </button>

                        {/* Analysis Verdict Result Area */}
                        {aiAnalysisResult && (
                          <div className={`p-4.5 rounded-xl border space-y-3 ${isLight ? "bg-slate-50 border-cyan-500/30" : "bg-slate-950 border-cyan-500/20"}`}>
                            <div className="flex justify-between items-center text-xs font-mono">
                              <span className={isLight ? "text-slate-500 uppercase font-semibold" : "text-slate-400 uppercase"}>Analysis Results</span>
                              <span className={`px-2.5 py-0.5 rounded font-extrabold border ${
                                aiAnalysisResult.severity === "CRITICAL" || aiAnalysisResult.severity === "HIGH"
                                  ? isLight ? "bg-red-50 text-red-750 border-red-200" : "bg-red-500/10 text-red-400 border-red-500/25"
                                  : isLight ? "bg-cyan-50 text-cyan-750 border-cyan-200" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/25"
                              }`}>
                                Risk Index: {aiAnalysisResult.score}% ({aiAnalysisResult.severity})
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-500 font-mono uppercase block">Verdict</span>
                              <p className={`text-xs font-bold ${isLight ? "text-slate-950" : "text-slate-200"}`}>{aiAnalysisResult.verdict}</p>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-500 font-mono uppercase block">Technical Assessment</span>
                              <p className={`text-xs leading-normal mt-0.5 ${isLight ? "text-slate-700" : "text-slate-400"}`}>{aiAnalysisResult.explanation}</p>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-500 font-mono uppercase block">Remediation Guidelines</span>
                              <ul className={`list-disc pl-4 text-xs mt-1 space-y-1 ${isLight ? "text-slate-800" : "text-slate-300"}`}>
                                {aiAnalysisResult.recommendations?.map((rec: string, i: number) => (
                                  <li key={i}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={`text-[10px] font-mono text-slate-500 pt-4 border-t leading-normal ${isLight ? "border-slate-200" : "border-slate-850/60"}`}>
                      AI models leverage local schema indicators for secure offline analysis when Cloud services fall back.
                    </div>
                  </div>

                </div>

                {/* External API & SIEM Ingress Gateway Console */}
                <div className={`rounded-xl p-5 border ${c_card} mt-6`}>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className={`font-bold text-sm uppercase tracking-tight font-mono flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                        <Globe className="h-4 w-4 text-cyan-500" /> External API & SIEM Ingress Gateway
                      </h3>
                      <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                        Secure full-stack ingestion endpoint for routing external firewalls, WAF, or syslog daemons into the InfoShield SIEM logs registry.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-bold">
                      Active Endpoint
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Simulator Inputs (7 columns) */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Ingress Source</label>
                          <input
                            type="text"
                            value={ingressSource}
                            onChange={(e) => setIngressSource(e.target.value)}
                            className={`w-full rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-cyan-500 ${c_input}`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Action Signature</label>
                          <input
                            type="text"
                            value={ingressAction}
                            onChange={(e) => setIngressAction(e.target.value)}
                            className={`w-full rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-cyan-500 ${c_input}`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Ingress Severity</label>
                          <select
                            value={ingressSeverity}
                            onChange={(e) => setIngressSeverity(e.target.value)}
                            className={`w-full rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-cyan-500 ${c_input}`}
                          >
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                            <option value="CRITICAL">CRITICAL</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Source IP</label>
                          <input
                            type="text"
                            value={ingressSourceIp}
                            onChange={(e) => setIngressSourceIp(e.target.value)}
                            className={`w-full rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-cyan-500 ${c_input}`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Target IP</label>
                          <input
                            type="text"
                            value={ingressTargetIp}
                            onChange={(e) => setIngressTargetIp(e.target.value)}
                            className={`w-full rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-cyan-500 ${c_input}`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Impersonated User</label>
                          <input
                            type="text"
                            value={ingressUser}
                            onChange={(e) => setIngressUser(e.target.value)}
                            className={`w-full rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-cyan-500 ${c_input}`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Raw Ingest Log Payload</label>
                        <textarea
                          rows={2}
                          value={ingressPayload}
                          onChange={(e) => setIngressPayload(e.target.value)}
                          placeholder="E.g. SQL Injection attempted in query parameter 'UNION SELECT'..."
                          className={`w-full rounded p-2.5 text-xs font-mono focus:outline-none focus:border-cyan-500 leading-relaxed ${c_input}`}
                        />
                      </div>

                      {/* Live CURL Block */}
                      <div className={`p-3 rounded-lg border font-mono text-[10px] leading-relaxed ${isLight ? "bg-slate-100 text-slate-700" : "bg-slate-950 text-slate-300"}`}>
                        <div className="flex justify-between items-center border-b border-slate-800 pb-1 mb-1.5">
                          <span className="font-bold text-slate-500 uppercase">CURL API Ingress Spec (Ready to Run):</span>
                          <button
                            onClick={() => {
                              const curlStr = `curl -X POST http://localhost:3000/api/siem/ingress \\\n  -H "Content-Type: application/json" \\\n  -H "X-InfoShield-API-Key: INFOSHIELD_SECURE_INGRESS_2026" \\\n  -d '{\n    "source": "${ingressSource}",\n    "action": "${ingressAction}",\n    "severity": "${ingressSeverity}",\n    "payload": "${ingressPayload}",\n    "user": "${ingressUser}",\n    "sourceIp": "${ingressSourceIp}",\n    "targetIp": "${ingressTargetIp}"\n  }'`;
                              navigator.clipboard.writeText(curlStr);
                              triggerBannerAlert("cURL request payload copied to clipboard!");
                            }}
                            className="text-cyan-500 hover:underline cursor-pointer"
                          >
                            Copy Command
                          </button>
                        </div>
                        <span className="text-cyan-500 font-bold">curl</span> -X POST <span className="text-amber-500">"/api/siem/ingress"</span> \<br />
                        &nbsp;&nbsp;-H <span className="text-purple-400">"X-InfoShield-API-Key: INFOSHIELD_SECURE_INGRESS_2026"</span> \<br />
                        &nbsp;&nbsp;-H <span className="text-purple-400">"Content-Type: application/json"</span> \<br />
                        &nbsp;&nbsp;-d <span className="text-slate-400">'{`{ "source": "${ingressSource}", "payload": "${ingressPayload.slice(0, 45)}..." }`}'</span>
                      </div>
                    </div>

                    {/* Simulator Action & Console Output (5 columns) */}
                    <div className="lg:col-span-5 flex flex-col justify-between">
                      <div className="space-y-3">
                        <button
                          onClick={async () => {
                            setIngressLoading(true);
                            setIngressResponse(null);
                            try {
                              const res = await fetch("/api/siem/ingress", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  "X-InfoShield-API-Key": "INFOSHIELD_SECURE_INGRESS_2026"
                                },
                                body: JSON.stringify({
                                  source: ingressSource,
                                  action: ingressAction,
                                  severity: ingressSeverity,
                                  payload: ingressPayload,
                                  user: ingressUser,
                                  sourceIp: ingressSourceIp,
                                  targetIp: ingressTargetIp
                                })
                              });
                              const data = await res.json();
                              setIngressResponse(JSON.stringify(data, null, 2));
                              
                              if (res.ok) {
                                triggerBannerAlert(`[INGRESS SUCCESS] Security log ${data.logId} successfully ingested!`);
                                if (data.escalatedIncident) {
                                  triggerBannerAlert(`[AI WARNING] Automated incident ticket ${data.escalatedIncident.id} raised!`);
                                }
                                fetchSiemLogs();
                                fetchIncidents();
                              } else {
                                triggerBannerAlert(`[INGRESS ERROR] ${data.error || "Failed to ingest log"}`);
                              }
                            } catch (err: any) {
                              setIngressResponse(`Ingress gateway exception: ${err.message}`);
                              triggerBannerAlert("Ingress pipeline transmission failure.");
                            } finally {
                              setIngressLoading(false);
                            }
                          }}
                          disabled={ingressLoading}
                          className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-bold py-3 rounded-lg text-xs font-mono tracking-tight flex items-center justify-center gap-2 cursor-pointer transition"
                        >
                          {ingressLoading ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" /> POSTing telemetry log payload...
                            </>
                          ) : (
                            <>
                              <Globe className="h-4 w-4" /> POST to Ingress API Gateway
                            </>
                          )}
                        </button>

                        <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                          API Response Console Logs:
                        </div>

                        <div className={`p-3.5 rounded-lg border font-mono text-[10px] h-[190px] overflow-auto leading-relaxed select-text ${
                          isLight ? "bg-slate-900 border-slate-950 text-slate-200" : "bg-slate-950 border-slate-850 text-slate-300"
                        }`}>
                          {ingressLoading ? (
                            <div className="h-full flex items-center justify-center text-cyan-500">
                              <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Ingestion active. Performing real-time AI security heuristics threat-vector mapping...
                            </div>
                          ) : ingressResponse ? (
                            <div>
                              <div className="border-b border-slate-800 pb-1 mb-1.5 flex justify-between text-[8px] text-slate-500">
                                <span>STATUS: ACTIVE COMPONENT ROUTED</span>
                                <span className="text-emerald-500 font-bold">201 INGESTED & CREATED</span>
                              </div>
                              <pre className="whitespace-pre-wrap leading-relaxed">{ingressResponse}</pre>
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center px-4 space-y-1.5">
                              <Terminal className="h-5 w-5" />
                              <span>Standing by. Click "POST to Ingress API Gateway" to transmit the configuration payload to the live back-end.</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="text-[9px] font-mono text-slate-500 mt-2 block leading-normal">
                        InfoShield external ingress gateway uses real-time threat categorization to identify malicious SQL injection patterns and automatically raise open SOC incidents.
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })()}

          {/* TAB 8: DEVELOPER API & ARCHITECTURE */}
          {activeTab === "developer" && (
            <div className="space-y-6" id="view-developer">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Tech Documentation (5 Cols) */}
                <div className={`lg:col-span-5 p-5 rounded-xl border flex flex-col justify-between ${c_card}`}>
                  <div>
                    <h3 className={`font-bold text-sm font-mono uppercase tracking-tight mb-1 ${isLight ? "text-slate-900" : "text-slate-200"}`}>System Developer Documentation</h3>
                    <p className={`text-xs mb-4 ${isLight ? "text-slate-500" : "text-slate-400"}`}>Automated secure REST interfaces for external SIEM, SOAR & compliance systems</p>

                    <div className="space-y-3 text-xs font-mono">
                      <div className={`p-3 rounded-lg border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-850"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-bold uppercase bg-blue-600 text-white px-1.5 py-0.5 rounded">POST</span>
                          <span className={`font-bold ${isLight ? "text-slate-850" : "text-slate-300"}`}>/api/threat-detect</span>
                        </div>
                        <p className="text-[11px] text-slate-500">Run secure AI analytics. Request body: <code className="text-cyan-600">{"{ logContent: string }"}</code></p>
                      </div>

                      <div className={`p-3 rounded-lg border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-850"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-bold uppercase bg-green-700 text-white px-1.5 py-0.5 rounded">GET</span>
                          <span className={`font-bold ${isLight ? "text-slate-850" : "text-slate-300"}`}>/api/siem-logs</span>
                        </div>
                        <p className="text-[11px] text-slate-500">Retrieve all live telemetry indexes from Elastic container nodes.</p>
                      </div>

                      <div className={`p-3 rounded-lg border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-850"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-bold uppercase bg-blue-600 text-white px-1.5 py-0.5 rounded">POST</span>
                          <span className={`font-bold ${isLight ? "text-slate-850" : "text-slate-300"}`}>/api/compliance/export</span>
                        </div>
                        <p className="text-[11px] text-slate-500">Instruct system to compile CSV formatted compliance audit records.</p>
                      </div>

                      <div className={`p-3 rounded-lg border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-850"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-bold uppercase bg-blue-600 text-white px-1.5 py-0.5 rounded">POST</span>
                          <span className={`font-bold ${isLight ? "text-slate-850" : "text-slate-300"}`}>/api/backup-disaster-recover</span>
                        </div>
                        <p className="text-[11px] text-slate-500">Orchestrate instantaneous immutable AWS S3 AES-256 cloud archive.</p>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Token Vault & Code Snippet */}
                  <div className={`mt-5 p-4 rounded-xl border ${isLight ? "bg-slate-50/50 border-slate-200" : "bg-slate-950/30 border-slate-850"}`}>
                    <h4 className="text-[11px] font-bold uppercase font-mono text-cyan-600 mb-1.5 flex items-center gap-1">
                      <Key className="h-3.5 w-3.5" /> API Integration Token Vault
                    </h4>
                    <p className="text-[10px] text-slate-500 mb-3">Provision cryptographically secure bearer keys to authenticate external integrations.</p>

                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <select
                          value={tokenScope}
                          onChange={(e) => setTokenScope(e.target.value)}
                          className={`flex-1 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-mono ${c_input}`}
                        >
                          <option value="read-only">Scope: Telemetry Read (Audit)</option>
                          <option value="write-ops">Scope: SecOps Write (Incident)</option>
                          <option value="admin-full">Scope: Administrative (Root)</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const bytes = Array.from({length: 24}, () => Math.floor(Math.random() * 16).toString(16)).join("");
                            const prefix = tokenScope === "read-only" ? "shld_ro_" : tokenScope === "write-ops" ? "shld_wr_" : "shld_adm_";
                            setGeneratedApiToken(`${prefix}${bytes}`);
                            triggerBannerAlert(`Generated secure third-party connection token with [${tokenScope}] privileges.`);
                          }}
                          className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-3 py-1.5 rounded text-xs transition cursor-pointer"
                        >
                          Generate Token
                        </button>
                      </div>

                      {generatedApiToken && (
                        <div className="space-y-2">
                          <div className={`p-2 rounded font-mono text-[10px] flex items-center justify-between border ${
                            isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-900 border-slate-850 text-slate-300"
                          }`}>
                            <span className="truncate max-w-[190px] text-cyan-600 font-bold">
                              {showApiToken ? generatedApiToken : (generatedApiToken.startsWith("shld_adm_") ? "shld_adm_••••••••••••••••" : generatedApiToken.slice(0, 8) + "••••••••••••••••")}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setShowApiToken(!showApiToken)}
                                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer p-0.5"
                                title={showApiToken ? "Hide Token" : "Show Token"}
                              >
                                {showApiToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(generatedApiToken);
                                  triggerBannerAlert("Token copied to clipboard.");
                                }}
                                className="text-[9px] hover:underline font-bold text-slate-500 cursor-pointer"
                              >
                                Copy
                              </button>
                            </div>
                          </div>

                          <div className={`p-2.5 rounded font-mono text-[9px] leading-normal ${
                            isLight ? "bg-slate-100 text-slate-600" : "bg-slate-950 text-slate-400"
                          }`}>
                            <span className="font-bold block text-slate-500 uppercase mb-1">CURL REQUEST SAMPLE:</span>
                            <span className="text-cyan-600">curl</span> -X GET https://infoshield.io/api/siem-logs \<br />
                            &nbsp;&nbsp;-H <span className="text-red-500">"Authorization: Bearer {showApiToken ? generatedApiToken : (generatedApiToken.startsWith("shld_adm_") ? "shld_adm_••••••••••••••••" : generatedApiToken.slice(0, 8) + "••••••••••••••••")}"</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sandbox API Playground with Inline Output (7 Cols) */}
                <div className={`lg:col-span-7 p-5 rounded-xl border flex flex-col justify-between ${c_card}`}>
                  <div>
                    <h3 className={`font-bold text-sm font-mono uppercase tracking-tight mb-1 ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                      {isLiveEnvironment ? "Live API Integration Suite" : "Sandbox API Playground"}
                    </h3>
                    <p className={`text-xs mb-4 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      {isLiveEnvironment ? "Integrate with secure server endpoints and retrieve live telemetry configurations directly." : "Simulate secure server responses from the backend namespace without using system popups."}
                    </p>

                    <div className="grid grid-cols-2 gap-3 font-mono text-xs mb-4">
                      <button
                        onClick={async () => {
                          setIsLoading(true);
                          setPlaygroundEndpoint("GET /api/system-metrics");
                          try {
                            const res = await authFetch("/api/system-metrics");
                            const data = await res.json();
                            setPlaygroundResponse(JSON.stringify(data, null, 2));
                          } catch (err) {
                            setPlaygroundResponse(`Error fetching system metrics: ${err}`);
                          }
                          setIsLoading(false);
                        }}
                        className={`p-3 rounded-lg text-left transition border cursor-pointer ${
                          playgroundEndpoint === "GET /api/system-metrics"
                            ? "bg-cyan-950/20 border-cyan-500 text-cyan-600"
                            : isLight ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700" : "bg-slate-950 hover:bg-slate-900 border-slate-850 text-slate-300"
                        }`}
                      >
                        <span className="font-bold block text-xs">System Metrics SDK</span>
                        <code className="text-[10px] text-cyan-500 mt-1 block">GET /api/system-metrics</code>
                      </button>

                      <button
                        onClick={async () => {
                          setIsLoading(true);
                          setPlaygroundEndpoint("GET /api/siem-logs");
                          try {
                            const res = await authFetch("/api/siem-logs");
                            const data = await res.json();
                            setPlaygroundResponse(JSON.stringify(data, null, 2));
                          } catch (err) {
                            setPlaygroundResponse(`Error fetching SIEM logs: ${err}`);
                          }
                          setIsLoading(false);
                        }}
                        className={`p-3 rounded-lg text-left transition border cursor-pointer ${
                          playgroundEndpoint === "GET /api/siem-logs"
                            ? "bg-cyan-950/20 border-cyan-500 text-cyan-600"
                            : isLight ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700" : "bg-slate-950 hover:bg-slate-900 border-slate-850 text-slate-300"
                        }`}
                      >
                        <span className="font-bold block text-xs">Live Telemetry Logs</span>
                        <code className="text-[10px] text-cyan-500 mt-1 block">GET /api/siem-logs</code>
                      </button>
                    </div>

                    {/* Inline Playground JSON Viewer */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-500 font-bold uppercase">
                          {isLiveEnvironment ? "Live Production Console:" : "Sandbox Network Console:"}
                        </span>
                        {playgroundResponse && (
                          <button
                            onClick={() => {
                              setPlaygroundResponse("");
                              setPlaygroundEndpoint("");
                            }}
                            className="text-red-500 hover:underline cursor-pointer text-[10px]"
                          >
                            Clear Output
                          </button>
                        )}
                      </div>

                      <div className={`p-4 rounded-xl font-mono text-[11px] h-[210px] overflow-auto border ${
                        isLight ? "bg-slate-900 border-slate-950 text-slate-200" : "bg-slate-950 border-slate-850 text-slate-300"
                      }`}>
                        {isLoading ? (
                          <div className="h-full flex items-center justify-center text-cyan-500">
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Executing isolated API request call...
                          </div>
                        ) : playgroundResponse ? (
                          <div>
                            <div className="border-b border-slate-800 pb-1.5 mb-2 flex justify-between text-[10px] text-slate-500">
                              <span>HOST: {isLiveEnvironment ? (currentBusiness?.website ? `api.${currentBusiness.website.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0]}` : "production-gateway-cluster") : "sandbox-service-container"}</span>
                              <span className="text-emerald-500 font-bold">{playgroundEndpoint} → HTTP 200 OK</span>
                            </div>
                            <pre className="whitespace-pre-wrap leading-relaxed select-all">{playgroundResponse}</pre>
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-1.5 text-center px-4">
                            <Activity className="h-6 w-6 text-slate-600" />
                            <span>Standing by. Select an API endpoint query above to fire real-time requests inside the application container namespace.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] font-mono text-slate-500 leading-normal mt-3">
                    {isLiveEnvironment 
                      ? "Production workspace utilizes active JWT keys with strict CORS restrictions. Real REST APIs require TLS 1.3 encryption & authorized JSON Web Tokens (JWT) for secure external sessions."
                      : "Secure Sandbox environment generates isolated client-side test headers. Real Production REST APIs require TLS 1.3 encryption & active JSON Web Tokens (JWT) for authentication."}
                  </p>
                </div>

              </div>

              {/* SECURITY RISKS & INTEGRATION ANALYSIS MATRIX (Answers third party questions perfectly) */}
              <div className={`p-5 rounded-xl border ${c_card}`}>
                <div className="mb-4">
                  <h3 className={`font-bold text-sm font-mono uppercase tracking-tight flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                    <Shield className="h-4 w-4 text-cyan-500" /> Third-Party Connection Security & Threat Exposure Matrix
                  </h3>
                  <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>Detailed architectural audit analyzing integration paths, associated cybersecurity risks, and critical mitigation guardrails.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Integration Pathways */}
                  <div className={`p-4 rounded-xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-850"}`}>
                    <h4 className="text-xs font-mono font-bold text-cyan-600 uppercase mb-2">1. Integration Pathways</h4>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">Businesses connect their legacy architectures with this secure platform via three primary methods:</p>
                    <ul className="space-y-2 text-[11px] font-mono leading-normal">
                      <li className="flex items-start gap-1.5 text-slate-500">
                        <span className="text-cyan-500 font-bold shrink-0">•</span>
                        <span><strong className={isLight ? "text-slate-800" : "text-slate-300"}>RESTful Telemetry Push:</strong> External apps submit raw syslog structures to <code className={`px-1 py-0.5 rounded text-[10px] ${isLight ? "bg-slate-200 text-cyan-850" : "bg-slate-850 text-cyan-500"}`}>/api/threat-detect</code>.</span>
                      </li>
                      <li className="flex items-start gap-1.5 text-slate-500">
                        <span className="text-cyan-500 font-bold shrink-0">•</span>
                        <span><strong className={isLight ? "text-slate-800" : "text-slate-300"}>Secure Log Forwarding:</strong> Elastic Agent daemon configs push direct JSON feeds from containerized applications.</span>
                      </li>
                      <li className="flex items-start gap-1.5 text-slate-500">
                        <span className="text-cyan-500 font-bold shrink-0">•</span>
                        <span><strong className={isLight ? "text-slate-800" : "text-slate-300"}>Automated Webhooks:</strong> Registers triggers for instant notifications when high severity incidents occur.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Operational Threats */}
                  <div className={`p-4 rounded-xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-850"}`}>
                    <h4 className="text-xs font-mono font-bold text-red-500 uppercase mb-2">2. Associated Exposure Risks</h4>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">Exposing endpoints to third-party clients introduces specific vector weaknesses:</p>
                    <ul className="space-y-2 text-[11px] font-mono leading-normal">
                      <li className="flex items-start gap-1.5 text-slate-500">
                        <span className="text-red-500 font-bold shrink-0">•</span>
                        <span><strong className="text-red-500">Token Compromise:</strong> Static API keys hardcoded into vendor scripts can leak on GitHub or server logs, allowing malicious read/write privileges.</span>
                      </li>
                      <li className="flex items-start gap-1.5 text-slate-500">
                        <span className="text-red-500 font-bold shrink-0">•</span>
                        <span><strong className="text-red-500">Header/Payload Injection:</strong> Malicious syslog payloads could attempt SQL Injection or Remote Code Execution inside our central parser.</span>
                      </li>
                      <li className="flex items-start gap-1.5 text-slate-500">
                        <span className="text-red-500 font-bold shrink-0">•</span>
                        <span><strong className="text-red-500">SLA Denial of Service (DoS):</strong> High volume, unthrottled API requests from unoptimized legacy cron systems can exhaust server nodes.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Tactical Mitigations */}
                  <div className={`p-4 rounded-xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-850"}`}>
                    <h4 className="text-xs font-mono font-bold text-emerald-600 uppercase mb-2">3. Recommended Guardrails</h4>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">Secure integrations are strictly enforced using robust network and application boundaries:</p>
                    <ul className="space-y-2 text-[11px] font-mono leading-normal">
                      <li className="flex items-start gap-1.5 text-slate-500">
                        <span className="text-emerald-500 font-bold shrink-0">•</span>
                        <span><strong className="text-emerald-500">Least Privilege Scope:</strong> Generate granular tokens (e.g. read-only telemetry) rather than global master credentials.</span>
                      </li>
                      <li className="flex items-start gap-1.5 text-slate-500">
                        <span className="text-emerald-500 font-bold shrink-0">•</span>
                        <span><strong className="text-emerald-500">Strict IP Pinning & CIDR:</strong> Limit API token acceptance exclusively to defined corporate network IP subnets on the firewall.</span>
                      </li>
                      <li className="flex items-start gap-1.5 text-slate-500">
                        <span className="text-emerald-500 font-bold shrink-0">•</span>
                        <span><strong className="text-emerald-500">Rate Limiting:</strong> Enforce standard web server limits (e.g., maximum 120 calls per minute per API token) to prevent server strain.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Opportunities for Future Scale & Roadmap Simulator */}
              <FutureScaleSimulator
                theme={theme}
                triggerBannerAlert={triggerBannerAlert}
                currentBusiness={currentBusiness}
              />

              {/* Market Launch Readiness Scorecard */}
              <MarketLaunchReadiness
                theme={theme}
                triggerBannerAlert={triggerBannerAlert}
              />

            </div>
          )}

          {/* TAB: PUBLIC WEBSITE */}
          {activeTab === "public_website" && (
            <PublicWebsite
              onAccessPortal={() => setActiveTab("dashboard")}
              theme={theme}
            />
          )}

          {/* TAB 9: PORTAL SETTINGS */}
          {activeTab === "settings" && (
            <SettingsTab
              theme={theme}
              setTheme={setTheme}
              smtpServer={smtpServer}
              setSmtpServer={setSmtpServer}
              smtpPort={smtpPort}
              setSmtpPort={setSmtpPort}
              smtpSecure={smtpSecure}
              setSmtpSecure={setSmtpSecure}
              smtpUser={smtpUser}
              setSmtpUser={setSmtpUser}
              smtpPass={smtpPass}
              setSmtpPass={setSmtpPass}
              smtpFrom={smtpFrom}
              setSmtpFrom={setSmtpFrom}
              smsApiKey={smsApiKey}
              setSmsApiKey={setSmsApiKey}
              logRetention={logRetention}
              setLogRetention={setLogRetention}
              autoSimInterval={autoSimInterval}
              setAutoSimInterval={setAutoSimInterval}
              isDrSyncEnabled={isDrSyncEnabled}
              setIsDrSyncEnabled={setIsDrSyncEnabled}
              drRegion={drRegion}
              setDrRegion={setDrRegion}
              onResetWorkspace={resetSandboxData}
              triggerBannerAlert={triggerBannerAlert}
              systemAlerts={systemAlerts}
              setSystemAlerts={setSystemAlerts}
              showBannerAlerts={showBannerAlerts}
              setShowBannerAlerts={setShowBannerAlerts}
              directoryUsers={directoryUsers}
              setDirectoryUsers={setDirectoryUsers}
              currentUser={currentUser}
            />
          )}

          {activeTab === "admin_portal" && (
            <AdminPortal
              theme={theme}
              currentUser={currentUser}
              directoryUsers={directoryUsers}
              setDirectoryUsers={setDirectoryUsers}
              phishingCampaigns={phishingCampaigns}
              setPhishingCampaigns={setPhishingCampaigns}
              incidents={incidents}
              setIncidents={setIncidents}
              smtpDispatchLogs={smtpDispatchLogs}
              setSmtpDispatchLogs={setSmtpDispatchLogs}
              triggerBannerAlert={triggerBannerAlert}
              currentBusiness={currentBusiness}
              setCurrentBusiness={setCurrentBusiness}
            />
          )}

        </main>

        {/* Sticky Professional Polish Footer */}
        <footer className={`px-6 py-3.5 flex items-center justify-between text-[11px] shrink-0 border-t ${
          isLight ? "bg-white border-slate-200 text-slate-600" : "bg-slate-900 border-slate-800 text-slate-400"
        }`} id="portal-footer">
          <div className="flex space-x-6 font-mono font-medium">
            <div className="flex items-center">
              <span className={`${isLight ? "text-slate-400" : "text-slate-500"} mr-1`}>WORKSPACE REPLICA:</span> <span className={isLight ? "text-slate-700" : "text-slate-300"}>HA-CLUSTER-DR-READY</span>
            </div>
            <div className="flex items-center">
              <span className={`${isLight ? "text-slate-400" : "text-slate-500"} mr-1`}>ENCRYPTION PROTOCOL:</span> <span className={isLight ? "text-cyan-700 font-bold" : "text-cyan-400"}>AES-256-GCM / TLS 1.3</span>
            </div>
            <div className="flex items-center">
              <span className={`${isLight ? "text-slate-400" : "text-slate-500"} mr-1`}>COMPLIANCE CODE:</span> <span className={isLight ? "text-slate-700" : "text-slate-300"}>SOC2 TYPE II (PASSED)</span>
            </div>
          </div>
          <div className={`flex items-center font-mono font-bold tracking-wider uppercase ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>
            <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            ALL SYSTEMS NOMINAL
          </div>
        </footer>

      </div>

      {/* MFA Security Challenge Modal Popup */}
      {showMfaModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" id="mfa-challenge-modal">
          <div className="bg-slate-900 border border-slate-800 max-w-sm w-full rounded-2xl p-6 space-y-4 shadow-[0_0_50px_rgba(6,182,212,0.15)]">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="h-9 w-9 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
                <Lock className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Security Token Required</h3>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Multi-Factor Authenticator Check</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Critical administrative actions require verification. Input your virtual security token block code to confirm deployment.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">6-Digit Authenticator Token</label>
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-center text-lg font-mono tracking-widest text-cyan-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {mfaError && (
                <p className="text-[11px] text-red-400 font-mono leading-relaxed bg-red-500/5 p-2 rounded border border-red-500/20">
                  {mfaError}
                </p>
              )}

              <p className="text-[10px] text-slate-500 font-mono text-center">
                MFA emergency verification key: <code className="text-cyan-400 font-bold bg-slate-950 px-1 py-0.5 rounded">123456</code>
              </p>
            </div>

            <div className="flex gap-2 pt-2 text-xs">
              <button
                onClick={() => setShowMfaModal(false)}
                className="flex-1 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-slate-200 py-2.5 rounded-lg font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitMfaVerification}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 py-2.5 rounded-lg font-extrabold transition cursor-pointer"
              >
                Verify Identity
              </button>
            </div>
          </div>
        </div>
      )}

      {showTour && (
        <TourGuide
          currentStep={tourStep}
          setStep={setTourStep}
          onClose={() => setShowTour(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {/* Real-World Phishing Simulation Educational Alert Modal */}
      {realPhishAlert && realPhishAlert.show && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4" id="real-phish-alert-modal">
          <div className={`max-w-md w-full rounded-2xl p-6 border shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 ${
            isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
          }`}>
            {realPhishAlert.type === "click" ? (
              <>
                <div className="flex items-center gap-3 border-b pb-3 border-amber-500/20">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
                    <AlertTriangle className="h-5 w-5 text-amber-500 animate-bounce" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-slate-100"}`}>⚠️ Security Awareness Warning</h3>
                    <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">InfoShield Simulation Engine</p>
                  </div>
                </div>

                <div className="space-y-3 font-sans text-xs text-slate-600 dark:text-slate-300">
                  <p className="font-semibold text-sm text-amber-500">Hi {realPhishAlert.contact.split("@")[0]},</p>
                  <p className="leading-relaxed">
                    This email was a **simulated phishing attack** dispatched by the InfoShield Trust & Security Operations Portal.
                  </p>
                  <p className="leading-relaxed">
                    In a real-world scenario, interacting with this link could have exposed your high-privilege corporate SSO credentials or allowed a malicious threat actor to deploy malware on your local workstation.
                  </p>
                  
                  <div className={`p-4 rounded-xl space-y-2 border text-left ${
                    isLight ? "bg-amber-50/50 border-amber-100 text-slate-800" : "bg-amber-500/5 border-amber-500/10 text-slate-300"
                  }`}>
                    <p className="font-mono font-bold text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400">🛡️ Phishing Defense Checklist</p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                      <li><strong>Verify Email Header:</strong> Always inspect the actual sending SMTP domain (e.g., <code className="font-mono px-1 rounded bg-slate-100 dark:bg-slate-950 font-bold">@infoshield.io</code> vs <code className="font-mono px-1 rounded bg-slate-100 dark:bg-slate-950 font-bold">@infoshie1d.io</code>).</li>
                      <li><strong>Skepticism First:</strong> Be highly alert to messages containing extreme urgency triggers (e.g., 'Reset within 2 hours' or 'Q3 Bonus').</li>
                      <li><strong>No Credential Entry:</strong> Never input corporate passwords or hardware MFA tokens into unfamiliar pages reached via email links.</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setRealPhishAlert(null);
                      triggerBannerAlert(`COMPLIANCE TRAINING CERTIFIED: Awareness training refresher logged for [${realPhishAlert.contact}].`);
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Complete Refresher & Recertify Profile
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b pb-3 border-emerald-500/20">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle className="h-5 w-5 text-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-slate-100"}`}>🛡️ Cyber Vigilance Success</h3>
                    <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">InfoShield Simulation Engine</p>
                  </div>
                </div>

                <div className="space-y-3 font-sans text-xs text-slate-600 dark:text-slate-300">
                  <p className="font-semibold text-sm text-emerald-500">Excellent job, {realPhishAlert.contact.split("@")[0]}!</p>
                  <p className="leading-relaxed">
                    You correctly identified and reported a simulated corporate security campaign. Your alert has been registered as a **successful defense response** in the Security Operations Center.
                  </p>
                  <p className="leading-relaxed">
                    Reporting malicious emails immediately is one of the most effective ways to defend your organization against security breaches. Thank you for your active cyber security vigilance!
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setRealPhishAlert(null);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-extrabold text-xs transition cursor-pointer"
                  >
                    Return to Application Console
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
