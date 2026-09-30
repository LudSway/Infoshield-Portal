import React, { useState, useEffect } from "react";
import { 
  RefreshCw, 
  Plus, 
  Search, 
  X, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertOctagon, 
  Calendar, 
  User, 
  ShieldAlert, 
  Filter, 
  ArrowUpRight, 
  Zap, 
  Mail, 
  Database, 
  Terminal, 
  CheckSquare, 
  Sliders,
  Check,
  Clock
} from "lucide-react";
import { UserRole, ImprovementItem, VulnerabilityAsset, Incident, PhishingCampaign } from "../types";
import { syncCollection, saveDocument, deleteDocument } from "../lib/firebase";

interface ContinualImprovementLogProps {
  theme?: "light" | "dark";
  activeRole: UserRole;
  triggerBannerAlert: (msg: string) => void;
  vulnerabilities: VulnerabilityAsset[];
  incidents: Incident[];
  phishingCampaigns: PhishingCampaign[];
}

export default function ContinualImprovementLog({
  theme = "dark",
  activeRole,
  triggerBannerAlert,
  vulnerabilities,
  incidents,
  phishingCampaigns
}: ContinualImprovementLogProps) {
  const isLight = theme === "light";

  // Style variables matching App.tsx guidelines
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

  const defaultImprovements: ImprovementItem[] = [
    {
      id: "IMP-2026-001",
      source: "Vulnerability Scanner",
      title: "Upgrade OpenSSH servers on production hosts",
      rootCause: "Regression vulnerability in OpenSSH Server (CVE-2026-4409) allows unauthenticated remote code execution.",
      remediationAction: "Run package manager updates to secure OpenSSH build v9.8p1+ across all public-facing edge compute VMs.",
      assignedTo: "SecEngineer (Alex Rivera)",
      expectedCloseDate: "2026-07-20",
      status: "IN_PROGRESS",
      severity: "CRITICAL",
      linkedId: "CVE-2026-4409",
      loggedAt: "2026-07-10"
    },
    {
      id: "IMP-2026-002",
      source: "Incident Response",
      title: "Revise AWS security groups post API credential exposure",
      rootCause: "Overly permissive security group configurations allowed unrestricted internet egress/ingress to relational storage port 5432.",
      remediationAction: "Apply strict security group limits restricted strictly to authorized Bastion node ip ranges & office static IP tunnels.",
      assignedTo: "SecEngineer (Alex Rivera)",
      expectedCloseDate: "2026-07-18",
      status: "OPEN",
      severity: "HIGH",
      linkedId: "INC-2026-003",
      loggedAt: "2026-07-11"
    },
    {
      id: "IMP-2026-003",
      source: "ISO 27001 Audit",
      title: "Standardize annual Internal ISMS Auditing Plan",
      rootCause: "Clause 9.2 gap identified: lack of documented procedural schedule and reviewer checklist templates for internal reviews.",
      remediationAction: "Author a formal ISMS internal review policy draft, allocate board calendar slots, and lock in the 2026 pre-audit schedule.",
      assignedTo: "ComplianceOfficer (Jessica Chen)",
      expectedCloseDate: "2026-08-01",
      status: "CLOSED",
      severity: "MEDIUM",
      linkedId: "ISO-C-9.2",
      loggedAt: "2026-07-05"
    },
    {
      id: "IMP-2026-004",
      source: "Phishing Campaign",
      title: "Deploy targeted phishing awareness module for Finance group",
      rootCause: "June wire-transfer mock attack reported 18.2% click-through rate, significantly higher than our 5% corporate tolerance limit.",
      remediationAction: "Schedule a high-intensity simulation debriefing & auto-enroll failing accounts in the wire security training course.",
      assignedTo: "ComplianceOfficer (Jessica Chen)",
      expectedCloseDate: "2026-07-25",
      status: "OPEN",
      severity: "HIGH",
      linkedId: "PHISH-001",
      loggedAt: "2026-07-12"
    }
  ];

  const defaultSuggestions = [
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
      category: "Cryptography & Keys",
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

  const [improvements, setImprovements] = useState<ImprovementItem[]>(() => {
    const saved = localStorage.getItem("infoshield_continual_improvements");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return defaultImprovements;
  });

  const [employeeSuggestions, setEmployeeSuggestions] = useState<any[]>(() => {
    const saved = localStorage.getItem("iso27001_employee_suggestions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {}
    }
    return defaultSuggestions;
  });

  // Sync improvements from Firestore with local storage as backup
  useEffect(() => {
    const unsubscribe = syncCollection<ImprovementItem>(
      "continual_improvements",
      (items) => {
        setImprovements(items);
        localStorage.setItem("infoshield_continual_improvements", JSON.stringify(items));
      },
      improvements.length > 0 ? improvements : defaultImprovements
    );
    return () => unsubscribe();
  }, []);

  // Sync employee suggestions from Firestore with local storage as backup
  useEffect(() => {
    const unsubscribe = syncCollection<any>(
      "iso27001_employee_suggestions",
      (items) => {
        setEmployeeSuggestions(items);
        localStorage.setItem("iso27001_employee_suggestions", JSON.stringify(items));
      },
      employeeSuggestions.length > 0 ? employeeSuggestions : defaultSuggestions
    );
    return () => unsubscribe();
  }, []);

  // UI state filters
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Selection & Forms state
  const [selectedItem, setSelectedItem] = useState<ImprovementItem | null>(improvements[0] || null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"log" | "intake">("log");

  // Form Field States
  const [formSource, setFormSource] = useState("Manual Input");
  const [formTitle, setFormTitle] = useState("");
  const [formRootCause, setFormRootCause] = useState("");
  const [formRemediation, setFormRemediation] = useState("");
  const [formAssignedTo, setFormAssignedTo] = useState("");
  const [formCloseDate, setFormCloseDate] = useState("");
  const [formSeverity, setFormSeverity] = useState<"CRITICAL" | "HIGH" | "MEDIUM" | "LOW">("HIGH");
  const [formStatus, setFormStatus] = useState<"OPEN" | "IN_PROGRESS" | "CLOSED">("OPEN");
  const [formLinkedId, setFormLinkedId] = useState("");

  // Quick reset for form
  const resetForm = () => {
    setFormSource("Manual Input");
    setFormTitle("");
    setFormRootCause("");
    setFormRemediation("");
    setFormAssignedTo("");
    setFormCloseDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setFormSeverity("HIGH");
    setFormStatus("OPEN");
    setFormLinkedId("");
    setIsEditing(false);
  };

  // Create manual or prefilled improvement
  const handleSaveImprovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formRootCause.trim() || !formRemediation.trim() || !formAssignedTo.trim()) {
      triggerBannerAlert("Please complete all mandatory fields.");
      return;
    }

    if (isEditing && selectedItem) {
      // Edit existing
      const updated = improvements.map(item => {
        if (item.id === selectedItem.id) {
          const edited: ImprovementItem = {
            ...item,
            source: formSource,
            title: formTitle.trim(),
            rootCause: formRootCause.trim(),
            remediationAction: formRemediation.trim(),
            assignedTo: formAssignedTo.trim(),
            expectedCloseDate: formCloseDate,
            severity: formSeverity,
            status: formStatus,
            linkedId: formLinkedId.trim() || undefined
          };
          saveDocument("continual_improvements", edited.id, edited);
          setSelectedItem(edited);
          return edited;
        }
        return item;
      });
      setImprovements(updated);
      setIsCreating(false);
      triggerBannerAlert(`Successfully updated Log entry ${selectedItem.id}`);
    } else {
      // Log new
      const newId = `IMP-2026-${String(improvements.length + 1).padStart(3, '0')}`;
      const newItem: ImprovementItem = {
        id: newId,
        source: formSource,
        title: formTitle.trim(),
        rootCause: formRootCause.trim(),
        remediationAction: formRemediation.trim(),
        assignedTo: formAssignedTo.trim(),
        expectedCloseDate: formCloseDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: formStatus,
        severity: formSeverity,
        linkedId: formLinkedId.trim() || undefined,
        loggedAt: new Date().toISOString().split("T")[0]
      };
      saveDocument("continual_improvements", newItem.id, newItem);
      setImprovements([newItem, ...improvements]);
      setSelectedItem(newItem);
      setIsCreating(false);
      triggerBannerAlert(`Successfully recorded Continual Improvement Log ${newId}`);
    }
    resetForm();
  };

  // Open Edit Mode
  const handleStartEdit = (item: ImprovementItem) => {
    setSelectedItem(item);
    setFormSource(item.source);
    setFormTitle(item.title);
    setFormRootCause(item.rootCause);
    setFormRemediation(item.remediationAction);
    setFormAssignedTo(item.assignedTo);
    setFormCloseDate(item.expectedCloseDate);
    setFormSeverity(item.severity);
    setFormStatus(item.status);
    setFormLinkedId(item.linkedId || "");
    setIsEditing(true);
    setIsCreating(false);
  };

  // Delete Log
  const handleDeleteItem = (id: string) => {
    if (window.confirm(`Are you sure you want to remove item ${id} from the Continual Improvement Log?`)) {
      const filtered = improvements.filter(i => i.id !== id);
      setImprovements(filtered);
      deleteDocument("continual_improvements", id);
      if (selectedItem?.id === id) {
        setSelectedItem(filtered[0] || null);
      }
      triggerBannerAlert(`Removed Log entry ${id}`);
    }
  };

  // Quick Action: Import feed from external source page
  const handleIntakeImport = (type: string, sourceObj: any) => {
    setIsCreating(true);
    setIsEditing(false);
    setActiveSubTab("log"); // return to log screen to complete form

    if (type === "VULN") {
      setFormSource("Vulnerability Scanner");
      setFormTitle(`Mitigate unpatched threat on ${sourceObj.assetName}`);
      setFormRootCause(`Severe vulnerability flagged: ${sourceObj.title} (${sourceObj.cve || "No CVE"}). Asset IP: ${sourceObj.ip}. Security state is currently ${sourceObj.status}.`);
      setFormRemediation(`Apply system patches, secure dependencies, verify port locks, and run container scanner updates.`);
      setFormSeverity(sourceObj.severity);
      setFormLinkedId(sourceObj.cve || sourceObj.id);
      setFormAssignedTo("SecEngineer (Alex Rivera)");
      setFormCloseDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    } else if (type === "INCIDENT") {
      setFormSource("Incident Response");
      setFormTitle(`Post-Mortem Corrective Action: ${sourceObj.title}`);
      setFormRootCause(`Root Cause Analysis of security breach ${sourceObj.id} (${sourceObj.category}): ${sourceObj.description}`);
      setFormRemediation(`Define long-term safeguards, apply network boundary restrictions, and implement automated continuous audit alerts.`);
      setFormSeverity(sourceObj.severity);
      setFormLinkedId(sourceObj.id);
      setFormAssignedTo(sourceObj.assignedTo || "CISO");
      setFormCloseDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    } else if (type === "PHISH") {
      setFormSource("Phishing Campaign");
      setFormTitle(`Intervention training for ${sourceObj.name}`);
      setFormRootCause(`High click failure rate detected in phish campaign ${sourceObj.id}. Sent: ${sourceObj.sentCount}, Clicked: ${sourceObj.clickCount}. Click rate of ${Math.round((sourceObj.clickCount/sourceObj.sentCount)*100)}% triggers corporate remediation limits.`);
      setFormRemediation(`Construct tailored anti-phishing material in the Security Training Hub, auto-assign failing user cohorts, and test again in 30 days.`);
      setFormSeverity("HIGH");
      setFormLinkedId(sourceObj.id);
      setFormAssignedTo("ComplianceOfficer (Jessica Chen)");
      setFormCloseDate(new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    } else if (type === "SUGGESTION") {
      setFormSource("Employee Suggestion");
      setFormTitle(`Implement staff improvement idea: ${sourceObj.category}`);
      setFormRootCause(`Proactive employee suggestion ${sourceObj.id} from ${sourceObj.name} (${sourceObj.department}): "${sourceObj.suggestion}"`);
      setFormRemediation(`Assess the suggested control updates, verify technical compatibility with current active workloads, and rollout corresponding configurations.`);
      setFormSeverity("MEDIUM");
      setFormLinkedId(sourceObj.id);
      setFormAssignedTo("SecEngineer (Alex Rivera)");
      setFormCloseDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);

      // Also update suggestion status in Firestore and localStorage if matching
      const updatedSuggestions = employeeSuggestions.map(s => {
        if (s.id === sourceObj.id) {
          const updated = { ...s, status: "PROMOTED_TO_CAPA" };
          saveDocument("iso27001_employee_suggestions", s.id, updated);
          return updated;
        }
        return s;
      });
      localStorage.setItem("iso27001_employee_suggestions", JSON.stringify(updatedSuggestions));
      setEmployeeSuggestions(updatedSuggestions);
    }

    triggerBannerAlert(`Successfully imported feedback from ${type}! Refined data is prefilled below. Please finalize details.`);
  };

  // Apply search query and multi-select filter logic
  const filteredImprovements = improvements.filter(item => {
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchRoot = item.rootCause.toLowerCase().includes(query);
      const matchAction = item.remediationAction.toLowerCase().includes(query);
      const matchAssigned = item.assignedTo.toLowerCase().includes(query);
      const matchId = item.id.toLowerCase().includes(query);
      if (!matchTitle && !matchRoot && !matchAction && !matchAssigned && !matchId) return false;
    }

    if (sourceFilter !== "ALL" && item.source !== sourceFilter) return false;
    if (severityFilter !== "ALL" && item.severity !== severityFilter) return false;
    if (statusFilter !== "ALL" && item.status !== statusFilter) return false;

    return true;
  });

  // Calculate Overdue Status Helper
  const getExpectedDateBadge = (expectedCloseDate: string, status: string) => {
    if (status === "CLOSED") {
      return (
        <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-mono">
          <CheckCircle2 className="h-3.5 w-3.5" /> Resolved
        </span>
      );
    }
    const today = new Date();
    const expDate = new Date(expectedCloseDate);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse">
          OVERDUE ({Math.abs(diffDays)}d ago)
        </span>
      );
    } else if (diffDays <= 5) {
      return (
        <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
          CLOSING SOON ({diffDays}d left)
        </span>
      );
    } else {
      return (
        <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
          <Clock className="h-3 w-3" /> {expectedCloseDate} ({diffDays}d left)
        </span>
      );
    }
  };

  const getSeverityBadgeClass = (sev: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW") => {
    switch (sev) {
      case "CRITICAL": return isLight ? "bg-red-100 text-red-800 border-red-300" : "bg-red-500/10 text-red-400 border-red-500/20";
      case "HIGH": return isLight ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "MEDIUM": return isLight ? "bg-cyan-100 text-cyan-800 border-cyan-300" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "LOW": return isLight ? "bg-slate-100 text-slate-800 border-slate-300" : "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getStatusBadgeClass = (st: "OPEN" | "IN_PROGRESS" | "CLOSED") => {
    switch (st) {
      case "OPEN": return isLight ? "bg-red-50 text-red-700 border-red-200" : "bg-red-500/10 text-red-400 border-red-500/25";
      case "IN_PROGRESS": return isLight ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-amber-500/10 text-amber-400 border-amber-500/25";
      case "CLOSED": return isLight ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "Vulnerability Scanner": return <Database className="h-3.5 w-3.5 text-orange-400" />;
      case "Incident Response": return <AlertOctagon className="h-3.5 w-3.5 text-red-400" />;
      case "Phishing Campaign": return <Mail className="h-3.5 w-3.5 text-yellow-400" />;
      case "ISO 27001 Audit": return <CheckSquare className="h-3.5 w-3.5 text-blue-400" />;
      case "Employee Suggestion": return <Zap className="h-3.5 w-3.5 text-purple-400 animate-pulse" />;
      default: return <Sliders className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6" id="view-continual-improvement">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`text-xl font-bold font-sans tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>
            ISO 27001 Clause 10 — Continual Improvement Log
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            Centralized registry aggregating security gaps, compliance weaknesses, incident reviews, scanner vulnerabilities, and employee feedback.
          </p>
        </div>

        {/* SUBTAB CONTROLS */}
        <div className="flex bg-slate-950/40 border border-slate-800/40 p-1 rounded-xl shrink-0 select-none">
          <button
            onClick={() => setActiveSubTab("log")}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "log" 
                ? "bg-cyan-600 text-slate-950 shadow" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${activeSubTab === "log" ? "animate-spin" : ""}`} /> Active Improvement Registry
          </button>
          <button
            onClick={() => setActiveSubTab("intake")}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 relative cursor-pointer ${
              activeSubTab === "intake" 
                ? "bg-cyan-600 text-slate-950 shadow" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-yellow-500" /> Intake Feed Pipeline
            {/* Notification Badge */}
            {(vulnerabilities.filter(v => v.status !== "PATCHED").length + incidents.filter(i => i.status !== "RESOLVED").length + employeeSuggestions.filter(s => s.status === "PENDING_REVIEW").length) > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* QUICK STATISTICS BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${c_card}`}>
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Total Logged Items</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold">{improvements.length}</span>
            <span className="text-xs text-slate-500 font-mono">active isms</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex flex-col justify-between ${c_card}`}>
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Open Backlog</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-red-500">
              {improvements.filter(i => i.status === "OPEN").length}
            </span>
            <span className="text-xs text-slate-500 font-mono">requires action</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex flex-col justify-between ${c_card}`}>
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Under Remediation</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-amber-500">
              {improvements.filter(i => i.status === "IN_PROGRESS").length}
            </span>
            <span className="text-xs text-slate-500 font-mono">in progress</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex flex-col justify-between ${c_card}`}>
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Closed & Resolved</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-emerald-500">
              {improvements.filter(i => i.status === "CLOSED").length}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {improvements.length > 0 ? Math.round((improvements.filter(i => i.status === "CLOSED").length / improvements.length) * 100) : 0}% success
            </span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex flex-col justify-between ${c_card} col-span-2 lg:col-span-1`}>
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Critical/High Gaps</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-red-400">
              {improvements.filter(i => i.severity === "CRITICAL" || i.severity === "HIGH").length}
            </span>
            <span className="text-xs text-slate-500 font-mono">top priority</span>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: REGISTRY LOG SCREEN */}
      {activeSubTab === "log" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* LEFT AREA: SEARCH, FILTERS & MAIN LOG TABLE/CARDS (7 Columns) */}
          <div className="xl:col-span-7 space-y-4">
            
            {/* Search and Filters panel */}
            <div className={`p-4 rounded-xl border space-y-3 ${c_card}`}>
              <div className="flex flex-col md:flex-row gap-2.5">
                
                {/* Text Search Input */}
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Title, Root Cause, Remediation action, Owner..."
                    className={`w-full pl-9 pr-8 py-2 text-xs rounded-lg ${c_input}`}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")} 
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Quick Add Log Button */}
                <button
                  onClick={() => {
                    resetForm();
                    setIsCreating(true);
                  }}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold uppercase text-xs rounded-lg transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Log Correction Item
                </button>
              </div>

              {/* Multi-Select Dropdowns */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">Filter Source</label>
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className={`w-full rounded-lg p-1.5 text-[10px] ${c_input}`}
                  >
                    <option value="ALL">All Sources</option>
                    <option value="Vulnerability Scanner">Vulnerability Scanner</option>
                    <option value="Incident Response">Incident Response</option>
                    <option value="Phishing Campaign">Phishing Campaign</option>
                    <option value="ISO 27001 Audit">ISO 27001 Audit</option>
                    <option value="Employee Suggestion">Employee Suggestion</option>
                    <option value="Manual Input">Manual Input</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">Filter Severity</label>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className={`w-full rounded-lg p-1.5 text-[10px] ${c_input}`}
                  >
                    <option value="ALL">All Severities</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">Filter Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`w-full rounded-lg p-1.5 text-[10px] ${c_input}`}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="CLOSED">Closed & Resolved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Log Items Grid */}
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {filteredImprovements.length === 0 ? (
                <div className={`p-12 text-center rounded-xl border border-dashed text-slate-500 font-mono text-xs ${c_card}`}>
                  <AlertOctagon className="h-8 w-8 text-slate-600 mx-auto mb-2 animate-pulse" />
                  No continual improvement records matched your filters.
                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      setSourceFilter("ALL");
                      setSeverityFilter("ALL");
                      setStatusFilter("ALL");
                    }}
                    className="block text-cyan-500 hover:underline mx-auto mt-2 font-bold cursor-pointer"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                filteredImprovements.map(item => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedItem(item);
                        setIsCreating(false);
                        setIsEditing(false);
                      }}
                      className={`p-4 rounded-xl border transition text-xs cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? isLight ? "bg-cyan-50/70 border-cyan-500 text-slate-900 shadow-sm" : "bg-cyan-950/20 border-cyan-500 text-slate-100"
                          : c_card
                      }`}
                    >
                      <div>
                        {/* Header Row */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-slate-500">[{item.id}]</span>
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[9px] bg-slate-950/40 text-slate-400 border border-slate-800 font-semibold uppercase">
                              {getSourceIcon(item.source)}
                              {item.source}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold border ${getSeverityBadgeClass(item.severity)}`}>
                              {item.severity}
                            </span>
                            <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold border ${getStatusBadgeClass(item.status)}`}>
                              {item.status.replace("_", " ")}
                            </span>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className={`font-bold text-sm mb-1 leading-snug ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                          {item.title}
                        </h3>
                        
                        {/* Root Cause Preview */}
                        <p className={`text-[11px] mb-2.5 italic line-clamp-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                          <strong>Root Cause:</strong> {item.rootCause}
                        </p>

                        {/* Assignee & Expected Close */}
                        <div className={`flex flex-wrap justify-between items-center text-[10px] text-slate-500 pt-2.5 border-t ${isLight ? "border-slate-200" : "border-slate-850/40"}`}>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3 text-slate-500" /> Assigned: <strong className={isLight ? "text-slate-800" : "text-slate-300"}>{item.assignedTo}</strong>
                          </span>
                          
                          {getExpectedDateBadge(item.expectedCloseDate, item.status)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT AREA: DETAIL VIEWER / EDITING PANEL / CREATION FORM (5 Columns) */}
          <div className="xl:col-span-5">
            
            {/* 1. CREATING OR EDITING TICKET FORM */}
            {(isCreating || isEditing) ? (
              <form onSubmit={handleSaveImprovement} className={`p-5 rounded-xl border space-y-4 ${c_card}`}>
                <div className="flex justify-between items-center border-b pb-3 border-slate-800/40">
                  <h3 className="text-sm font-extrabold font-mono uppercase tracking-wider text-cyan-400">
                    {isEditing ? `Edit Log [${selectedItem?.id}]` : "Log New Continual Improvement Entry"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setIsEditing(false);
                    }}
                    className="text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Source Category *</label>
                    <select
                      value={formSource}
                      onChange={(e) => setFormSource(e.target.value)}
                      className={`w-full rounded-lg p-2 text-xs ${c_input}`}
                    >
                      <option value="Manual Input">Manual Input</option>
                      <option value="Vulnerability Scanner">Vulnerability Scanner</option>
                      <option value="Incident Response">Incident Response</option>
                      <option value="Phishing Campaign">Phishing Campaign</option>
                      <option value="ISO 27001 Audit">ISO 27001 Audit</option>
                      <option value="Employee Suggestion">Employee Suggestion</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Linked ID / Ref</label>
                    <input
                      type="text"
                      placeholder="e.g. CVE-2026-001, INC-03"
                      value={formLinkedId}
                      onChange={(e) => setFormLinkedId(e.target.value)}
                      className={`w-full rounded-lg p-2 text-xs ${c_input}`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Improvement Target Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="Briefly state the improvement objective..."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className={`w-full rounded-lg p-2.5 text-xs ${c_input}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Determined Root Cause *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="What failure, gap, or vulnerability triggered this improvement need?"
                    value={formRootCause}
                    onChange={(e) => setFormRootCause(e.target.value)}
                    className={`w-full rounded-lg p-2 text-xs ${c_input}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Remediation Action Required *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Step-by-step remediation action plan to close this risk..."
                    value={formRemediation}
                    onChange={(e) => setFormRemediation(e.target.value)}
                    className={`w-full rounded-lg p-2 text-xs ${c_input}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Owner Assigned *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SecEngineer (Alex Rivera)"
                      value={formAssignedTo}
                      onChange={(e) => setFormAssignedTo(e.target.value)}
                      className={`w-full rounded-lg p-2 text-xs ${c_input}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Expected Date to Close *</label>
                    <input
                      type="date"
                      required
                      value={formCloseDate}
                      onChange={(e) => setFormCloseDate(e.target.value)}
                      className={`w-full rounded-lg p-2 text-xs ${c_input}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Severity Priority</label>
                    <select
                      value={formSeverity}
                      onChange={(e) => setFormSeverity(e.target.value as any)}
                      className={`w-full rounded-lg p-2 text-xs ${c_input}`}
                    >
                      <option value="CRITICAL">Critical Priority</option>
                      <option value="HIGH">High Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="LOW">Low Priority</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Workflow Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className={`w-full rounded-lg p-2 text-xs ${c_input}`}
                    >
                      <option value="OPEN">Open (Backlog)</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="CLOSED">Closed & Resolved</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold py-3 text-xs uppercase tracking-wider rounded-lg transition mt-2 cursor-pointer"
                >
                  {isEditing ? "💾 Save Log Amendments" : "🚀 Publish Continual Improvement Log"}
                </button>
              </form>
            ) : selectedItem ? (
              
              /* 2. READ-ONLY LOG entry DETAIL VIEWER */
              <div className={`p-5 rounded-xl border space-y-5 ${c_card}`}>
                <div className="flex justify-between items-start border-b pb-3 border-slate-850/40">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500">REGISTRY RECORD</span>
                    <h3 className={`text-base font-extrabold ${isLight ? "text-slate-900" : "text-cyan-400 font-sans tracking-tight"}`}>
                      {selectedItem.id}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    {activeRole !== "Auditor" && (
                      <>
                        <button
                          onClick={() => handleStartEdit(selectedItem)}
                          className="p-1.5 rounded-lg border border-slate-800 hover:border-cyan-500 text-slate-400 hover:text-cyan-400 transition cursor-pointer"
                          title="Edit Registry Record"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(selectedItem.id)}
                          className="p-1.5 rounded-lg border border-slate-800 hover:border-red-500 text-slate-400 hover:text-red-500 transition cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Title Section */}
                  <div>
                    <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider mb-1">Improvement Target Objective</span>
                    <p className={`text-xs font-bold leading-normal ${isLight ? "text-slate-950" : "text-slate-200"}`}>
                      {selectedItem.title}
                    </p>
                  </div>

                  {/* Root Cause Section */}
                  <div>
                    <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider mb-1">Determined Root Cause</span>
                    <div className={`p-3.5 rounded-lg text-xs leading-relaxed ${c_subcard}`}>
                      {selectedItem.rootCause}
                    </div>
                  </div>

                  {/* Remediation Action Required */}
                  <div>
                    <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider mb-1">Remediation Action Required</span>
                    <div className={`p-3.5 rounded-lg text-xs leading-relaxed border border-cyan-500/10 ${isLight ? "bg-cyan-50/20" : "bg-cyan-950/10 text-cyan-200"}`}>
                      {selectedItem.remediationAction}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3.5 pt-1">
                    <div>
                      <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Source Origin</span>
                      <p className={`text-xs font-mono font-semibold mt-1 flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                        {getSourceIcon(selectedItem.source)}
                        {selectedItem.source}
                      </p>
                    </div>

                    <div>
                      <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Linked reference ID</span>
                      <p className="text-xs font-mono font-bold mt-1 text-slate-400">
                        {selectedItem.linkedId || "N/A"}
                      </p>
                    </div>

                    <div>
                      <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Assigned Lead / Owner</span>
                      <p className={`text-xs font-semibold mt-1 flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                        <User className="h-3.5 w-3.5 text-slate-500" />
                        {selectedItem.assignedTo}
                      </p>
                    </div>

                    <div>
                      <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Expected Closure Target</span>
                      <div className="mt-1">
                        {getExpectedDateBadge(selectedItem.expectedCloseDate, selectedItem.status)}
                      </div>
                    </div>
                  </div>

                  {/* Workflow Status Modifier */}
                  {activeRole !== "Auditor" && (
                    <div className={`pt-4 border-t ${c_border_light}`}>
                      <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider mb-2">Advance Workflow Progress</span>
                      <div className="flex gap-2">
                        {selectedItem.status !== "OPEN" && (
                          <button
                            onClick={() => {
                              const updatedItem = { ...selectedItem, status: "OPEN" as const };
                              saveDocument("continual_improvements", selectedItem.id, updatedItem);
                              const updated = improvements.map(i => i.id === selectedItem.id ? updatedItem : i);
                              setImprovements(updated);
                              setSelectedItem(updatedItem);
                              triggerBannerAlert(`Set status of ${selectedItem.id} back to OPEN`);
                            }}
                            className={`flex-1 py-1.5 rounded text-[10px] font-mono font-bold uppercase border cursor-pointer ${
                              isLight ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800" : "bg-slate-950 hover:bg-slate-900/60 border-slate-850 text-slate-300"
                            }`}
                          >
                            Set Open
                          </button>
                        )}

                        {selectedItem.status !== "IN_PROGRESS" && (
                          <button
                            onClick={() => {
                              const updatedItem = { ...selectedItem, status: "IN_PROGRESS" as const };
                              saveDocument("continual_improvements", selectedItem.id, updatedItem);
                              const updated = improvements.map(i => i.id === selectedItem.id ? updatedItem : i);
                              setImprovements(updated);
                              setSelectedItem(updatedItem);
                              triggerBannerAlert(`Set status of ${selectedItem.id} to IN PROGRESS`);
                            }}
                            className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded text-[10px] font-mono font-bold uppercase transition cursor-pointer"
                          >
                            Remediate
                          </button>
                        )}

                        {selectedItem.status !== "CLOSED" && (
                          <button
                            onClick={() => {
                              const updatedItem = { ...selectedItem, status: "CLOSED" as const };
                              saveDocument("continual_improvements", selectedItem.id, updatedItem);
                              const updated = improvements.map(i => i.id === selectedItem.id ? updatedItem : i);
                              setImprovements(updated);
                              setSelectedItem(updatedItem);
                              triggerBannerAlert(`SUCCESS: Verified & closed continual improvement item ${selectedItem.id}`);
                            }}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded text-[10px] font-mono font-bold uppercase transition cursor-pointer"
                          >
                            Resolve & Close
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={`p-12 text-center rounded-xl border border-dashed text-slate-500 ${c_card}`}>
                Select an improvement item from the left registry index to view full root-cause forensics and expected actions.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: INTAKE FEED PIPELINE (Pulls live data from all other sections) */}
      {activeSubTab === "intake" && (
        <div className="space-y-6">
          <div className={`p-5 rounded-xl border ${c_card}`}>
            <h3 className={`text-sm font-extrabold font-mono uppercase tracking-wider mb-1 flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-slate-200"}`}>
              <Zap className="h-4 w-4 text-yellow-500 animate-pulse" /> Compliance Intake Pipelines
            </h3>
            <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              This pipeline automatically scans live telemetry and operational datasets across all Infoshield pages. Promote unresolved threat-vectors or operational audit gaps directly into formal corrective actions with a single click.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* INTAKE 1: UNPATCHED VULNERABILITIES */}
            <div className={`p-5 rounded-xl border flex flex-col justify-between ${c_card}`}>
              <div>
                <div className="flex justify-between items-center border-b pb-2 mb-4 border-slate-800/40">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                    <Database className="h-4 w-4" /> Unresolved Vulnerability Scanner Feeds ({vulnerabilities.filter(v => v.status !== "PATCHED").length})
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">Live CVE Feeds</span>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {vulnerabilities.filter(v => v.status !== "PATCHED").length === 0 ? (
                    <p className="text-xs font-mono text-slate-500 italic py-6 text-center">
                      ✓ Clean Scanner State: All vulnerabilities are currently verified or fully patched!
                    </p>
                  ) : (
                    vulnerabilities.filter(v => v.status !== "PATCHED").map(v => (
                      <div key={v.id} className={`p-3 rounded-lg border text-xs flex justify-between items-start ${c_subcard}`}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-500 font-mono">{v.cve || v.id}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${v.severity === "CRITICAL" || v.severity === "HIGH" ? "bg-red-500/10 text-red-400" : "bg-cyan-500/10 text-cyan-400"}`}>
                              {v.severity}
                            </span>
                          </div>
                          <p className={`font-semibold ${isLight ? "text-slate-900" : "text-slate-200"}`}>{v.title}</p>
                          <p className="text-[10px] text-slate-500">Asset: {v.assetName} ({v.ip}) | Status: <strong>{v.status}</strong></p>
                        </div>

                        <button
                          onClick={() => handleIntakeImport("VULN", v)}
                          className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-[9px] font-extrabold uppercase rounded transition flex items-center gap-0.5 cursor-pointer"
                        >
                          Promote <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-500 border-t pt-2.5 mt-4">
                Pulls directly from active asset registries inside Vulnerability Scanner tab.
              </div>
            </div>

            {/* INTAKE 2: ACTIVE INCIDENTS */}
            <div className={`p-5 rounded-xl border flex flex-col justify-between ${c_card}`}>
              <div>
                <div className="flex justify-between items-center border-b pb-2 mb-4 border-slate-800/40">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    <AlertOctagon className="h-4 w-4" /> Incident post-mortem Corrective Actions ({incidents.filter(i => i.status !== "RESOLVED").length})
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">IR Backlog</span>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {incidents.filter(i => i.status !== "RESOLVED").length === 0 ? (
                    <p className="text-xs font-mono text-slate-500 italic py-6 text-center">
                      ✓ Satisfied Incidents: No active or unclosed security breaches in current queue.
                    </p>
                  ) : (
                    incidents.filter(i => i.status !== "RESOLVED").map(inc => (
                      <div key={inc.id} className={`p-3 rounded-lg border text-xs flex justify-between items-start ${c_subcard}`}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-500 font-mono">{inc.id}</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/10 text-purple-400 font-mono">
                              {inc.category}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${inc.status === "OPEN" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"}`}>
                              {inc.status}
                            </span>
                          </div>
                          <p className={`font-semibold ${isLight ? "text-slate-900" : "text-slate-200"}`}>{inc.title}</p>
                          <p className="text-[10px] text-slate-500 italic line-clamp-1">"{inc.description}"</p>
                        </div>

                        <button
                          onClick={() => handleIntakeImport("INCIDENT", inc)}
                          className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-[9px] font-extrabold uppercase rounded transition flex items-center gap-0.5 cursor-pointer"
                        >
                          Promote <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-500 border-t pt-2.5 mt-4">
                Pulls directly from active Incident response playbook cards and tickets.
              </div>
            </div>

            {/* INTAKE 3: LOW PHISHING REPORT CAMPAIGNS */}
            <div className={`p-5 rounded-xl border flex flex-col justify-between ${c_card}`}>
              <div>
                <div className="flex justify-between items-center border-b pb-2 mb-4 border-slate-800/40">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-yellow-500 flex items-center gap-1.5">
                    <Mail className="h-4 w-4" /> Phishing Simulation Remediation Needs ({phishingCampaigns.length})
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">Sim Targets</span>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {phishingCampaigns.length === 0 ? (
                    <p className="text-xs font-mono text-slate-500 italic py-6 text-center">
                      No phishing campaigns simulated yet to ingest corrective actions from.
                    </p>
                  ) : (
                    phishingCampaigns.map(cam => {
                      const clickRate = Math.round((cam.clickCount / cam.sentCount) * 100);
                      const reportRate = Math.round((cam.reportCount / cam.sentCount) * 100);
                      const requiresCorrection = clickRate > 10;
                      return (
                        <div key={cam.id} className={`p-3 rounded-lg border text-xs flex justify-between items-start ${c_subcard}`}>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-500 font-mono">{cam.id}</span>
                              <span className="text-slate-400 font-mono text-[10px]">{cam.date}</span>
                            </div>
                            <p className={`font-semibold ${isLight ? "text-slate-900" : "text-slate-200"}`}>{cam.name}</p>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                              <span>Sent: <strong>{cam.sentCount}</strong></span>
                              <span>Clicked: <strong className={clickRate > 10 ? "text-red-400" : "text-emerald-400"}>{cam.clickCount} ({clickRate}%)</strong></span>
                              <span>Reported: <strong className="text-cyan-400">{cam.reportCount} ({reportRate}%)</strong></span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleIntakeImport("PHISH", cam)}
                            className={`px-2 py-1 text-slate-950 font-mono text-[9px] font-extrabold uppercase rounded transition flex items-center gap-0.5 cursor-pointer ${
                              requiresCorrection ? "bg-cyan-600 hover:bg-cyan-500" : "bg-slate-800 hover:bg-slate-700 text-slate-400"
                            }`}
                          >
                            {requiresCorrection ? "Trigger Correction" : "Log Action"} <ArrowUpRight className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-500 border-t pt-2.5 mt-4">
                Red flags simulation runs with credential click success thresholds exceeding 10%.
              </div>
            </div>

            {/* INTAKE 4: EMPLOYEE COMPLIANCE SUGGESTIONS */}
            <div className={`p-5 rounded-xl border flex flex-col justify-between ${c_card}`}>
              <div>
                <div className="flex justify-between items-center border-b pb-2 mb-4 border-slate-800/40">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-purple-400" /> Employee Continual Suggestions ({employeeSuggestions.filter(s => s.status === "PENDING_REVIEW").length})
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">Staff Feedback</span>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {employeeSuggestions.filter(s => s.status === "PENDING_REVIEW").length === 0 ? (
                    <p className="text-xs font-mono text-slate-500 italic py-6 text-center">
                      ✓ Fully Reviewed: All employee suggestions have been cataloged or promoted!
                    </p>
                  ) : (
                    employeeSuggestions.filter(s => s.status === "PENDING_REVIEW").map(sug => (
                      <div key={sug.id} className={`p-3 rounded-lg border text-xs flex justify-between items-start ${c_subcard}`}>
                        <div className="space-y-1 flex-1 mr-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-500 font-mono">{sug.id}</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-950/20 text-cyan-400 border border-cyan-500/10">
                              {sug.category}
                            </span>
                          </div>
                          <p className={`italic ${isLight ? "text-slate-900" : "text-slate-200"}`}>"{sug.suggestion}"</p>
                          <p className="text-[10px] text-slate-500">Submitted by: <strong>{sug.name}</strong> ({sug.department})</p>
                        </div>

                        <button
                          onClick={() => handleIntakeImport("SUGGESTION", sug)}
                          className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-[9px] font-extrabold uppercase rounded transition flex items-center gap-0.5 cursor-pointer shrink-0"
                        >
                          Promote <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-500 border-t pt-2.5 mt-4">
                Staff suggestions from the ISO 27001 Clause 10.2 feedback form.
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
