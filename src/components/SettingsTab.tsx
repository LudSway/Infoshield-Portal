import React, { useState } from "react";
import { 
  Sliders, 
  RefreshCw, 
  Key, 
  Shield, 
  Cloud, 
  HardDrive, 
  Check, 
  AlertTriangle,
  Server,
  Database,
  Lock,
  Moon,
  Sun,
  Users,
  Trash2,
  Plus,
  Mail,
  Fingerprint,
  Building2,
  Terminal
} from "lucide-react";
import { saveDocument, deleteDocument } from "../lib/firebase";
import { User, UserRole } from "../types";
import OrgBrandingSettings from "./OrgBrandingSettings";
import EmailDiagnostics from "./EmailDiagnostics";

interface SettingsTabProps {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  smtpServer: string;
  setSmtpServer: (s: string) => void;
  smtpPort: number;
  setSmtpPort: (p: number) => void;
  smtpSecure: boolean;
  setSmtpSecure: (s: boolean) => void;
  smtpUser: string;
  setSmtpUser: (u: string) => void;
  smtpPass: string;
  setSmtpPass: (p: string) => void;
  smtpFrom: string;
  setSmtpFrom: (f: string) => void;
  smsApiKey: string;
  setSmsApiKey: (k: string) => void;
  logRetention: string;
  setLogRetention: (r: string) => void;
  autoSimInterval: string;
  setAutoSimInterval: (i: string) => void;
  isDrSyncEnabled: boolean;
  setIsDrSyncEnabled: (b: boolean) => void;
  drRegion: string;
  setDrRegion: (r: string) => void;
  onResetWorkspace: () => void;
  triggerBannerAlert: (msg: string) => void;
  systemAlerts: string[];
  setSystemAlerts: React.Dispatch<React.SetStateAction<string[]>>;
  showBannerAlerts: boolean;
  setShowBannerAlerts: (b: boolean) => void;
  
  // Directory state passed from App.tsx
  directoryUsers: User[];
  setDirectoryUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUser: User | null;
}

export default function SettingsTab({
  theme,
  setTheme,
  smtpServer,
  setSmtpServer,
  smtpPort,
  setSmtpPort,
  smtpSecure,
  setSmtpSecure,
  smtpUser,
  setSmtpUser,
  smtpPass,
  setSmtpPass,
  smtpFrom,
  setSmtpFrom,
  smsApiKey,
  setSmsApiKey,
  logRetention,
  setLogRetention,
  autoSimInterval,
  setAutoSimInterval,
  isDrSyncEnabled,
  setIsDrSyncEnabled,
  drRegion,
  setDrRegion,
  onResetWorkspace,
  triggerBannerAlert,
  systemAlerts,
  setSystemAlerts,
  showBannerAlerts,
  setShowBannerAlerts,
  directoryUsers,
  setDirectoryUsers,
  currentUser
}: SettingsTabProps) {
  const isLight = theme === "light";

  // Local state for temporary inputs to allow "Save Settings" behavior
  const [localSmtp, setLocalSmtp] = useState(smtpServer);
  const [localSmtpPort, setLocalSmtpPort] = useState(smtpPort);
  const [localSmtpSecure, setLocalSmtpSecure] = useState(smtpSecure);
  const [localSmtpUser, setLocalSmtpUser] = useState(smtpUser);
  const [localSmtpPass, setLocalSmtpPass] = useState(smtpPass);
  const [localSmtpFrom, setLocalSmtpFrom] = useState(smtpFrom);
  const [localSms, setLocalSms] = useState(smsApiKey);
  const [localRetention, setLocalRetention] = useState(logRetention);
  const [localSimInterval, setLocalSimInterval] = useState(autoSimInterval);
  const [localDrEnabled, setLocalDrEnabled] = useState(isDrSyncEnabled);
  const [localDrRegion, setLocalDrRegion] = useState(drRegion);
  const [encAlgo, setEncAlgo] = useState("AES-256-GCM");

  // New user form state
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("SecEngineer");
  const [newUserDept, setNewUserDept] = useState("Security Operations (SecOps)");
  const [newUserMfa, setNewUserMfa] = useState(true);
  const [formError, setFormError] = useState("");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSmtpServer(localSmtp);
    setSmtpPort(localSmtpPort);
    setSmtpSecure(localSmtpSecure);
    setSmtpUser(localSmtpUser);
    setSmtpPass(localSmtpPass);
    setSmtpFrom(localSmtpFrom);
    setSmsApiKey(localSms);
    setLogRetention(localRetention);
    setAutoSimInterval(localSimInterval);
    setIsDrSyncEnabled(localDrEnabled);
    setDrRegion(localDrRegion);

    // Save customized SMTP configurations to Firestore under settings/smtp_config
    const smtpConfigPayload = {
      smtpHost: localSmtp,
      smtpPort: Number(localSmtpPort),
      smtpSecure: localSmtpSecure,
      smtpUser: localSmtpUser,
      smtpPass: localSmtpPass,
      smtpFrom: localSmtpFrom
    };
    
    saveDocument("settings", "smtp_config", smtpConfigPayload)
      .then((success) => {
        if (success) {
          triggerBannerAlert("Corporate configurations & real SMTP parameters applied successfully and synced to cloud Firestore.");
        } else {
          triggerBannerAlert("Corporate configurations saved locally (Firestore sync was delayed).");
        }
      })
      .catch((err) => {
        console.error("Firestore settings save failed", err);
        triggerBannerAlert("Corporate configurations applied successfully to active local session.");
      });
  };

  const handleProvisionUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newUserName.trim()) {
      setFormError("Please enter a valid user name.");
      return;
    }
    if (!newUserEmail.trim() || !newUserEmail.includes("@")) {
      setFormError("Please enter a valid corporate email address.");
      return;
    }

    // Check if email already exists
    const exists = directoryUsers.some(
      u => u.email.toLowerCase() === newUserEmail.trim().toLowerCase()
    );
    if (exists) {
      setFormError("A profile with this email address already exists in the Active Directory.");
      return;
    }

    const newUser: User = {
      id: `U-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole,
      department: newUserDept.trim() || "Information Security Team",
      mfaEnabled: newUserMfa,
      lastActive: "Never logged in"
    };

    setDirectoryUsers(prev => [...prev, newUser]);
    saveDocument("infoshield_directory", newUser.id, newUser);
    triggerBannerAlert(`LDAP Identity Provisioned: [${newUser.name}] registered for CISO portal authorization.`);
    
    // Clear form inputs
    setNewUserName("");
    setNewUserEmail("");
    setNewUserDept(getDeptSuggestion(newUserRole));
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (currentUser && currentUser.id === userId) {
      triggerBannerAlert("Operation denied: You cannot delete your currently active administrative session profile.");
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to permanently revoke LDAP corporate credentials for [${userName}]?`);
    if (confirmed) {
      setDirectoryUsers(prev => prev.filter(u => u.id !== userId));
      deleteDocument("infoshield_directory", userId);
      triggerBannerAlert(`LDAP Revocation Complete: User [${userName}] credentials deleted from corporate directory.`);
    }
  };

  const getDeptSuggestion = (role: UserRole) => {
    switch (role) {
      case "CISO": return "Executive Security Office";
      case "SecEngineer": return "Security Operations (SecOps)";
      case "ComplianceOfficer": return "Risk & Compliance Dept";
      case "Auditor": return "Compliance Assurance";
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setNewUserRole(role);
    setNewUserDept(getDeptSuggestion(role));
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "CISO": return isLight ? "bg-red-50 text-red-700 border-red-200" : "bg-red-500/10 text-red-400 border-red-500/30";
      case "SecEngineer": return isLight ? "bg-cyan-50 text-cyan-700 border-cyan-200" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "ComplianceOfficer": return isLight ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Auditor": return isLight ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-amber-500/10 text-amber-400 border-amber-500/30";
    }
  };

  // Sub-tab state: "system" | "branding" | "email"
  const [activeSubTab, setActiveSubTab] = useState<"system" | "branding" | "email">("branding");

  return (
    <div className="space-y-6" id="view-settings">
      {/* Title & Navigation Bar */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isLight ? "bg-white border-slate-200" : "bg-slate-900/60 border-slate-800"
      }`}>
        <div>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}>
            <Sliders className="h-5 w-5 text-cyan-500" /> Administrative Settings & Controls
          </h2>
          <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            Manage custom PDF branding, CISO signatures, real email SMTP routes, and directory credentials.
          </p>
        </div>

        {/* Sub-tab Pills */}
        <div className={`flex items-center gap-1.5 p-1 rounded-xl border ${
          isLight ? "bg-slate-100 border-slate-200" : "bg-slate-950 border-slate-800"
        }`}>
          <button
            type="button"
            onClick={() => setActiveSubTab("branding")}
            className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "branding"
                ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Org & Branding</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("email")}
            className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "email"
                ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Mail className="h-4 w-4" />
            <span>Real Email Relay</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("system")}
            className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "system"
                ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Server className="h-4 w-4" />
            <span>System & Directory</span>
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE SUB-TAB CONTENT */}
      {activeSubTab === "branding" && (
        <OrgBrandingSettings theme={theme} />
      )}

      {activeSubTab === "email" && (
        <EmailDiagnostics theme={theme} />
      )}

      {activeSubTab === "system" && (
        <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Theme Toggle & Core Controls */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Appearance & Color Mode Card */}
          <div className={`p-5 rounded-xl border ${
            isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/40 border-slate-800"
          }`}>
            <h3 className={`font-bold text-sm font-mono uppercase tracking-wider mb-4 flex items-center gap-1.5 ${
              isLight ? "text-slate-800" : "text-slate-200"
            }`}>
              <Sun className="h-4 w-4 text-amber-500" /> Interface Appearance
            </h3>
            <p className={`text-xs mb-4 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              Choose your background appearance profile. Switch instantly between light or dark slate environments.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTheme("light");
                  localStorage.setItem("infoshield_theme", "light");
                  triggerBannerAlert("Switched interface layout to White/Light Theme (Default Mode)");
                }}
                className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition cursor-pointer text-xs ${
                  isLight 
                    ? "bg-slate-100 border-cyan-500 text-cyan-600 font-extrabold shadow-sm" 
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sun className="h-5 w-5" />
                <span>Light (Default)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTheme("dark");
                  localStorage.setItem("infoshield_theme", "dark");
                  triggerBannerAlert("Switched interface layout to Slate/Dark Theme (Custom Mode)");
                }}
                className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition cursor-pointer text-xs ${
                  !isLight 
                    ? "bg-cyan-950/30 border-cyan-500 text-cyan-400 font-extrabold" 
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
                }`}
              >
                <Moon className="h-5 w-5" />
                <span>Dark Slate</span>
              </button>
            </div>
          </div>

          {/* Security Threat & Alert Management */}
          <div className={`p-5 rounded-xl border ${
            isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/40 border-slate-800"
          }`}>
            <h3 className={`font-bold text-sm font-mono uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
              isLight ? "text-slate-800" : "text-slate-200"
            }`}>
              <Shield className="h-4 w-4 text-red-500 animate-pulse" /> Security Threat Center
            </h3>
            <p className={`text-xs mb-4 leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              Manage incoming system alerts and control banner positioning across the InfoShield administrative console.
            </p>

            {/* Display banner toggle */}
            <div className={`flex items-center justify-between p-3 rounded-lg mb-4 border ${
              isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/20 border-slate-800/40"
            }`}>
              <div>
                <span className={`text-xs font-semibold block ${isLight ? "text-slate-850" : "text-slate-200"}`}>
                  Top Notification Banner
                </span>
                <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                  Show red alert ticker at top of screen
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showBannerAlerts} 
                  onChange={(e) => {
                    setShowBannerAlerts(e.target.checked);
                    triggerBannerAlert(e.target.checked ? "Enabled persistent top notification banner alerts." : "Alert banner hidden. Active threats moved to Settings panel.");
                  }} 
                  className="sr-only peer" 
                />
                <div className={`w-9 h-5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-slate-950 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500 ${
                  isLight ? "bg-slate-200" : "bg-slate-850"
                }`}></div>
              </label>
            </div>

            {/* Active Alerts List */}
            <div className="space-y-2 mb-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Alert Queue Buffer ({systemAlerts.length})
              </span>
              
              {systemAlerts.length > 0 ? (
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {systemAlerts.map((alert, index) => (
                    <div 
                      key={index} 
                      className={`p-2.5 rounded-lg border flex flex-col justify-between gap-1 text-[11px] font-mono ${
                        isLight ? "bg-red-50 border-red-200 text-red-750 font-medium" : "bg-red-500/5 border-red-500/25 text-red-400"
                      }`}
                    >
                      <div className="flex items-start gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1 animate-ping shrink-0" />
                        <span className="leading-normal break-words">{alert}</span>
                      </div>
                      <div className={`flex justify-between items-center mt-1 pt-1 border-t ${isLight ? "border-red-100" : "border-red-500/10"}`}>
                        <span className="text-[9px] text-slate-500 font-semibold uppercase">Status: Unresolved</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSystemAlerts(prev => prev.filter((_, idx) => idx !== index));
                            triggerBannerAlert("Acknowledged security warning alert.");
                          }}
                          className="text-[9px] text-cyan-600 hover:text-cyan-500 underline font-bold cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`p-4 rounded-lg text-center text-[11px] font-mono border border-dashed ${
                  isLight ? "bg-slate-50 border-slate-250 text-slate-500" : "bg-slate-950/20 border-slate-800 text-slate-500"
                }`}>
                  ✓ Buffer clean. No threats active.
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSystemAlerts(["SSH brute force detected from 198.51.100.42"]);
                  triggerBannerAlert("Simulated SSH Brute Force threat warning seeded.");
                }}
                className={`py-1.5 rounded text-[10px] font-mono font-bold uppercase transition cursor-pointer text-center border ${
                  isLight 
                    ? "bg-slate-100 hover:bg-slate-200 border-slate-250 text-slate-700" 
                    : "bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300"
                }`}
              >
                Inject SSH Alert
              </button>
              
              <button
                type="button"
                disabled={systemAlerts.length === 0}
                onClick={() => {
                  setSystemAlerts([]);
                  triggerBannerAlert("All active telemetry buffers cleared and acknowledged.");
                }}
                className="bg-red-500/10 hover:bg-red-500 disabled:opacity-30 disabled:hover:bg-red-500/10 border border-red-500/25 text-red-500 hover:text-white py-1.5 rounded text-[10px] font-mono font-bold uppercase transition cursor-pointer text-center"
              >
                Clear Buffer
              </button>
            </div>
          </div>

          {/* Hard Reset/Seed Action */}
          <div className={`p-5 rounded-xl border ${
            isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/40 border-slate-800"
          }`}>
            <h3 className={`font-bold text-sm font-mono uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
              isLight ? "text-slate-800" : "text-slate-200"
            }`}>
              <AlertTriangle className="h-4 w-4 text-red-500" /> Destructive Operations
            </h3>
            <p className={`text-xs mb-4 leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              Reseed baseline system data. This operation returns vulnerability lists and awareness training scores back to production default cluster seeds.
            </p>

            <button
              type="button"
              onClick={() => {
                const confirmed = window.confirm("Are you sure you want to reset all custom active security events, awareness metrics and baseline production databases?");
                if (confirmed) {
                  onResetWorkspace();
                }
              }}
              className="w-full bg-red-500/10 hover:bg-red-500 border border-red-500/25 text-red-600 hover:text-white py-2.5 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Re-Seed Baseline Datasets
            </button>
          </div>

        </div>

        {/* Right Columns: Settings Form Matrix */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSaveSettings} className={`p-5 rounded-xl border space-y-6 ${
            isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/40 border-slate-800"
          }`}>
            
            <div className="border-b border-dashed pb-4 border-slate-200 dark:border-slate-800">
              <h3 className={`font-bold text-sm font-mono uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? "text-slate-800" : "text-slate-200"
              }`}>
                <Server className="h-4 w-4 text-cyan-500" /> Active Infrastructure Configuration
              </h3>
              <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Configure SMTP relay hubs and SMS notification gates for the Awareness Phish campaigns and Tabletop alerts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1.5 ${
                  isLight ? "text-slate-600" : "text-slate-400"
                }`}>
                  Real-world SMTP Relay Host
                </label>
                <input
                  type="text"
                  required
                  placeholder="smtp.gmail.com or smtp.mailtrap.io"
                  value={localSmtp}
                  onChange={(e) => setLocalSmtp(e.target.value)}
                  className={`w-full p-2.5 rounded-lg text-xs font-mono transition focus:outline-none ${
                    isLight 
                      ? "bg-slate-50 border border-slate-200 text-slate-800 focus:border-cyan-500" 
                      : "bg-slate-950 border border-slate-850 text-slate-100 focus:border-cyan-500"
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1.5 ${
                  isLight ? "text-slate-600" : "text-slate-400"
                }`}>
                  SMTP Port
                </label>
                <input
                  type="number"
                  required
                  value={localSmtpPort}
                  onChange={(e) => setLocalSmtpPort(Number(e.target.value))}
                  className={`w-full p-2.5 rounded-lg text-xs font-mono transition focus:outline-none ${
                    isLight 
                      ? "bg-slate-50 border border-slate-200 text-slate-800 focus:border-cyan-500" 
                      : "bg-slate-950 border border-slate-850 text-slate-100 focus:border-cyan-500"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1.5 ${
                  isLight ? "text-slate-600" : "text-slate-400"
                }`}>
                  Secure Connection (SSL/TLS)
                </label>
                <select
                  value={localSmtpSecure ? "true" : "false"}
                  onChange={(e) => setLocalSmtpSecure(e.target.value === "true")}
                  className={`w-full p-2.5 rounded-lg text-xs transition focus:outline-none font-mono ${
                    isLight 
                      ? "bg-slate-50 border border-slate-200 text-slate-800 focus:border-cyan-500 cursor-pointer" 
                      : "bg-slate-950 border border-slate-850 text-slate-100 focus:border-cyan-500 cursor-pointer"
                  }`}
                >
                  <option value="false">STARTTLS / Port 587 (Secure Off)</option>
                  <option value="true">SSL / Port 465 (Secure On)</option>
                </select>
              </div>

              <div>
                <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1.5 ${
                  isLight ? "text-slate-600" : "text-slate-400"
                }`}>
                  SMTP Auth Username
                </label>
                <input
                  type="text"
                  placeholder="SMTP User or API Key Email"
                  value={localSmtpUser}
                  onChange={(e) => setLocalSmtpUser(e.target.value)}
                  className={`w-full p-2.5 rounded-lg text-xs font-mono transition focus:outline-none ${
                    isLight 
                      ? "bg-slate-50 border border-slate-200 text-slate-800 focus:border-cyan-500" 
                      : "bg-slate-950 border border-slate-850 text-slate-100 focus:border-cyan-500"
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1.5 ${
                  isLight ? "text-slate-600" : "text-slate-400"
                }`}>
                  SMTP Password / API Token
                </label>
                <input
                  type="password"
                  placeholder="SMTP Password / Auth Token"
                  value={localSmtpPass}
                  onChange={(e) => setLocalSmtpPass(e.target.value)}
                  className={`w-full p-2.5 rounded-lg text-xs font-mono transition focus:outline-none ${
                    isLight 
                      ? "bg-slate-50 border border-slate-200 text-slate-800 focus:border-cyan-500" 
                      : "bg-slate-950 border border-slate-850 text-slate-100 focus:border-cyan-500"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1.5 ${
                  isLight ? "text-slate-600" : "text-slate-400"
                }`}>
                  Sender Address (From Email)
                </label>
                <input
                  type="email"
                  placeholder="security-awareness@company.com"
                  value={localSmtpFrom}
                  onChange={(e) => setLocalSmtpFrom(e.target.value)}
                  className={`w-full p-2.5 rounded-lg text-xs font-mono transition focus:outline-none ${
                    isLight 
                      ? "bg-slate-50 border border-slate-200 text-slate-800 focus:border-cyan-500" 
                      : "bg-slate-950 border border-slate-850 text-slate-100 focus:border-cyan-500"
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1.5 ${
                  isLight ? "text-slate-600" : "text-slate-400"
                }`}>
                  Tabletop SMS Gateway API Key
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">
                    <Key className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={localSms}
                    onChange={(e) => setLocalSms(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-lg text-xs font-mono transition focus:outline-none ${
                      isLight 
                        ? "bg-slate-50 border border-slate-200 text-slate-800 focus:border-cyan-500" 
                        : "bg-slate-950 border border-slate-850 text-slate-100 focus:border-cyan-500"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1.5 ${
                  isLight ? "text-slate-600" : "text-slate-400"
                }`}>
                  Log Retention Interval
                </label>
                <select
                  value={localRetention}
                  onChange={(e) => setLocalRetention(e.target.value)}
                  className={`w-full p-2.5 rounded-lg text-xs transition focus:outline-none font-mono ${
                    isLight 
                      ? "bg-slate-50 border border-slate-200 text-slate-800 focus:border-cyan-500 cursor-pointer" 
                      : "bg-slate-950 border border-slate-850 text-slate-100 focus:border-cyan-500 cursor-pointer"
                  }`}
                >
                  <option value="30_DAYS">30 Days (Standard Audit Trail)</option>
                  <option value="90_DAYS">90 Days (PCI-DSS Standard)</option>
                  <option value="365_DAYS">365 Days (SOX Audit Standard)</option>
                  <option value="UNLIMITED">Permanent / Immutable (DR Snapshots Only)</option>
                </select>
              </div>

              <div>
                <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1.5 ${
                  isLight ? "text-slate-600" : "text-slate-400"
                }`}>
                  Encryption Standards (Storage Block)
                </label>
                <select
                  value={encAlgo}
                  onChange={(e) => setEncAlgo(e.target.value)}
                  className={`w-full p-2.5 rounded-lg text-xs transition focus:outline-none font-mono ${
                    isLight 
                      ? "bg-slate-50 border border-slate-200 text-slate-800 focus:border-cyan-500 cursor-pointer" 
                      : "bg-slate-950 border border-slate-850 text-slate-100 focus:border-cyan-500 cursor-pointer"
                  }`}
                >
                  <option value="AES-256-GCM">AES-256-GCM (Military standard)</option>
                  <option value="CHACHA20-POLY1305">ChaCha20-Poly1305 (Ultra latency)</option>
                  <option value="RSA-4096-OAEP">RSA-4096-OAEP (Asymmetric vaulting)</option>
                </select>
              </div>
            </div>

            <div className="border-b border-dashed pb-4 border-slate-200 dark:border-slate-800 pt-2">
              <h3 className={`font-bold text-sm font-mono uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? "text-slate-800" : "text-slate-200"
              }`}>
                <Cloud className="h-4 w-4 text-cyan-500" /> Disaster Recovery Sync Parameters
              </h3>
              <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Coordinate multi-region clusters and continuous standby instances.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1.5 ${
                  isLight ? "text-slate-600" : "text-slate-400"
                }`}>
                  DR Standby Region Node
                </label>
                <select
                  value={localDrRegion}
                  onChange={(e) => setLocalDrRegion(e.target.value)}
                  className={`w-full p-2.5 rounded-lg text-xs transition focus:outline-none font-mono ${
                    isLight 
                      ? "bg-slate-50 border border-slate-200 text-slate-800 focus:border-cyan-500 cursor-pointer" 
                      : "bg-slate-950 border border-slate-850 text-slate-100 focus:border-cyan-500 cursor-pointer"
                  }`}
                >
                  <option value="us-west-2">US West (Oregon Standby)</option>
                  <option value="eu-west-1">EU West (Dublin Standby)</option>
                  <option value="ap-southeast-1">AP Southeast (Singapore Standby)</option>
                </select>
              </div>

              <div>
                <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1.5 ${
                  isLight ? "text-slate-600" : "text-slate-400"
                }`}>
                  Continuous Replication Sync
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="checkbox"
                    id="localDrEnabled"
                    checked={localDrEnabled}
                    onChange={(e) => setLocalDrEnabled(e.target.checked)}
                    className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor="localDrEnabled" className={`text-xs cursor-pointer select-none font-medium ${
                    isLight ? "text-slate-700" : "text-slate-300"
                  }`}>
                    Activate real-time replication stream to {localDrRegion}
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-850 flex justify-end gap-3 text-xs font-sans">
              <button
                type="button"
                onClick={() => {
                  setLocalSmtp(smtpServer);
                  setLocalSmtpPort(smtpPort);
                  setLocalSmtpSecure(smtpSecure);
                  setLocalSmtpUser(smtpUser);
                  setLocalSmtpPass(smtpPass);
                  setLocalSmtpFrom(smtpFrom);
                  setLocalSms(smsApiKey);
                  setLocalRetention(logRetention);
                  setLocalSimInterval(autoSimInterval);
                  setLocalDrEnabled(isDrSyncEnabled);
                  setLocalDrRegion(drRegion);
                  triggerBannerAlert("Reverted modifications to active settings.");
                }}
                className={`px-4 py-2.5 rounded-lg font-bold transition cursor-pointer ${
                  isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-600" : "bg-slate-950 hover:bg-slate-850 text-slate-400"
                }`}
              >
                Reset Changes
              </button>
              <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-5 py-2.5 rounded-lg font-extrabold shadow-md hover:shadow-cyan-500/10 transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" /> Save Corporate Configurations
              </button>
            </div>

          </form>
        </div>

      </div>

      {/* NEW SECTION: Enterprise Active Directory & Identity Provisioning */}
      <div className={`p-5 rounded-xl border mt-6 ${
        isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/40 border-slate-800"
      }`} id="user-management-section">
        
        <div className="border-b border-dashed pb-4 border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className={`font-bold text-sm font-mono uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? "text-slate-900" : "text-slate-100"
              }`}>
                <Users className="h-4 w-4 text-cyan-500" /> Enterprise Active Directory & Identity Provisioning
              </h3>
              <p className={`text-[11px] mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Simulate corporate LDAP Exchange and Directory access records. Create, manage, and audit team credentials and RBAC rules.
              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border ${
              isLight ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-slate-950 border-slate-850 text-cyan-400"
            }`}>
              <Database className="h-3.5 w-3.5 text-cyan-500 animate-pulse" />
              <span>{directoryUsers.length} Directory Records Sync</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* User List Table */}
          <div className="xl:col-span-2 space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Active Directory Records
            </span>

            <div className={`border rounded-xl overflow-hidden ${
              isLight ? "border-slate-200 bg-slate-50/20" : "border-slate-850 bg-slate-950/20"
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={isLight ? "bg-slate-100/80 border-b border-slate-200 text-slate-600 font-mono" : "bg-slate-950 border-b border-slate-800 text-slate-400 font-mono"}>
                      <th className="p-3 font-semibold uppercase text-[10px]">LDAP Account</th>
                      <th className="p-3 font-semibold uppercase text-[10px]">RBAC Role</th>
                      <th className="p-3 font-semibold uppercase text-[10px]">Department</th>
                      <th className="p-3 font-semibold uppercase text-[10px]">MFA</th>
                      <th className="p-3 font-semibold uppercase text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={isLight ? "divide-y divide-slate-100 text-slate-700" : "divide-y divide-slate-850 text-slate-300"}>
                    {directoryUsers.map((user) => {
                      const isSelf = currentUser?.id === user.id;
                      return (
                        <tr key={user.id} className={isLight ? "hover:bg-slate-100/45" : "hover:bg-slate-950/30"}>
                          <td className="p-3">
                            <div>
                              <p className="font-bold flex items-center gap-1.5">
                                {user.name} 
                                {isSelf && (
                                  <span className={`text-[8px] font-mono font-bold uppercase px-1 py-0.2 rounded border ${
                                    isLight ? "bg-cyan-50 border-cyan-150 text-cyan-700" : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                                  }`}>
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{user.email}</p>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getRoleBadgeColor(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-400">
                            {user.department}
                          </td>
                          <td className="p-3">
                            {user.mfaEnabled ? (
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                isLight ? "bg-emerald-50 border border-emerald-150 text-emerald-700" : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                              }`}>
                                ENFORCED
                              </span>
                            ) : (
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                isLight ? "bg-amber-50 border border-amber-150 text-amber-700" : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                              }`}>
                                OPTIONAL
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              disabled={isSelf}
                              title={isSelf ? "You cannot delete your own logged-in session profile." : "Revoke LDAP user credentials"}
                              className={`p-1.5 rounded transition inline-flex items-center justify-center cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed ${
                                isLight 
                                  ? "hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200" 
                                  : "hover:bg-red-500/10 text-slate-500 hover:text-red-400 border border-slate-800"
                              }`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* User Add Form */}
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Provision New Profile
            </span>

            <form onSubmit={handleProvisionUser} className={`p-5 rounded-xl border space-y-4 ${
              isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-850"
            }`}>
              
              {formError && (
                <div className={`p-2.5 rounded border text-[11px] font-mono ${
                  isLight ? "bg-red-50 border-red-200 text-red-700" : "bg-red-500/5 border-red-500/20 text-red-400"
                }`}>
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                  Full Account Name
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">
                    <Fingerprint className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Jane Foster"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs transition focus:outline-none ${
                      isLight 
                        ? "bg-white border border-slate-200 text-slate-800 focus:border-cyan-500" 
                        : "bg-slate-900 border border-slate-800 text-slate-100 focus:border-cyan-500"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                  Corporate Email address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="e.g. jane.foster@infoshield.io"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs transition focus:outline-none ${
                      isLight 
                        ? "bg-white border border-slate-200 text-slate-800 focus:border-cyan-500" 
                        : "bg-slate-900 border border-slate-800 text-slate-100 focus:border-cyan-500"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                  System Authorization Role (RBAC)
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className={`w-full p-2 rounded-lg text-xs transition focus:outline-none font-mono ${
                    isLight 
                      ? "bg-white border border-slate-200 text-slate-800 focus:border-cyan-500 cursor-pointer" 
                      : "bg-slate-900 border border-slate-800 text-slate-100 focus:border-cyan-500 cursor-pointer"
                  }`}
                >
                  <option value="CISO">Chief Info Security Officer (CISO)</option>
                  <option value="SecEngineer">Security Engineer (SecOps)</option>
                  <option value="ComplianceOfficer">Compliance Officer</option>
                  <option value="Auditor">External Auditor</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                  Department Assigned
                </label>
                <input
                  type="text"
                  required
                  value={newUserDept}
                  onChange={(e) => setNewUserDept(e.target.value)}
                  className={`w-full p-2 rounded-lg text-xs transition focus:outline-none ${
                    isLight 
                      ? "bg-white border border-slate-200 text-slate-800 focus:border-cyan-500" 
                      : "bg-slate-900 border border-slate-800 text-slate-100 focus:border-cyan-500"
                  }`}
                />
              </div>

              <div className="flex items-center gap-3 pt-1 opacity-60">
                <input
                  type="checkbox"
                  id="newUserMfa"
                  disabled
                  checked={false}
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-slate-300 rounded cursor-not-allowed"
                />
                <label htmlFor="newUserMfa" className={`text-xs cursor-not-allowed select-none font-medium ${
                  isLight ? "text-slate-700" : "text-slate-300"
                }`}>
                  Force Multi-Factor Authentication (MFA) <span className="text-cyan-500 font-mono text-[10px] ml-1">(Bypassed by Portal Rule)</span>
                </label>
              </div>

              {/* Dynamic Information Display about the selected role */}
              <div className={`p-3 rounded-lg border text-[10px] leading-relaxed font-mono ${
                isLight ? "bg-cyan-50/50 border-cyan-150 text-cyan-850" : "bg-cyan-950/15 border-cyan-950 text-cyan-400"
              }`}>
                <p className="font-bold flex items-center gap-1 mb-0.5">
                  <Lock className="h-3 w-3" /> Security Access Boundaries:
                </p>
                <p>
                  {newUserRole === "CISO" && "Full administrative write access to high-availability endpoints, log archives, awareness configurations, and compliance audit exports."}
                  {newUserRole === "SecEngineer" && "Threat operations workspace access: Manage alerts, run vulnerability scans, trigger CVE hot-patches, and edit IR playbook tickets."}
                  {newUserRole === "ComplianceOfficer" && "Governance & Risk access: Configure employee training curriculum, review phishing stats, launch simulations, and export checklists."}
                  {newUserRole === "Auditor" && "Read-only audit inspector access: Inspect standard SOC-2 controls, review training certificate records, and view system status telemetry."}
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 py-2.5 rounded-lg font-extrabold shadow-sm hover:shadow-cyan-500/10 transition cursor-pointer flex items-center justify-center gap-1.5 text-xs"
              >
                <Plus className="h-4 w-4" /> Provision Corporate Identity
              </button>

            </form>
          </div>
        </div>
      </div>
      </div>
      )}
    </div>
  );
}
