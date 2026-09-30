import React from "react";
import { 
  Shield, 
  CheckSquare, 
  AlertOctagon, 
  Mail, 
  Terminal, 
  Database, 
  Code, 
  RefreshCw,
  Users,
  LogOut,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Sliders,
  GraduationCap,
  CreditCard,
  Radio,
  Cpu,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Award,
  Globe,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserRole } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  mfaValidated: boolean;
  triggerMfaChallenge: () => void;
  currentUser?: any;
  onLogout?: () => void;
  onStartTour?: () => void;
  simplifiedMode: boolean;
  setSimplifiedMode: (val: boolean) => void;
  theme?: "light" | "dark";
  onTriggerOnboardingStory?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  activeRole,
  setActiveRole,
  mfaValidated,
  triggerMfaChallenge,
  currentUser,
  onLogout,
  onStartTour,
  simplifiedMode,
  setSimplifiedMode,
  theme = "light",
  onTriggerOnboardingStory
}: SidebarProps) {
  const isLight = theme === "light";
  const isGodwayr =
    currentUser?.email?.trim().toLowerCase() === "godwayr.akakpo@gmail.com" ||
    currentUser?.email?.trim().toLowerCase() === "godswayr.akakpo@gmail.com" ||
    currentUser?.email?.trim().toLowerCase() === "xtroluv@gmail.com";

  // Definition of the 5 high-level sidebar sections (including Portal Settings)
  const groups = [
    {
      id: "overview",
      label: "Security Overview",
      icon: Shield,
      items: [
        { id: "dashboard", label: "Security Dashboard", icon: Shield, minRoles: ["CISO", "SecEngineer", "Auditor", "ComplianceOfficer"] },
        { id: "public_website", label: "Public Website", icon: Globe, minRoles: ["CISO", "SecEngineer", "Auditor", "ComplianceOfficer"] }
      ]
    },
    {
      id: "soc",
      label: "SOC Operations",
      icon: Radio,
      items: [
        { id: "soc_operations", label: "Operations Console", icon: Radio, minRoles: ["CISO", "SecEngineer"] },
        { id: "incidents", label: "Incident Workflows", icon: AlertOctagon, minRoles: ["CISO", "SecEngineer"] },
        { id: "vulnerabilities", label: "Vulnerability Scanner", icon: Database, minRoles: ["CISO", "SecEngineer", "Auditor"] },
        { id: "siem", label: "SIEM Logs (AI Threat)", icon: Cpu, minRoles: ["CISO", "SecEngineer"], advanced: true }
      ]
    },
    {
      id: "simulations",
      label: "Simulations & Training",
      icon: GraduationCap,
      items: [
        { id: "phishing", label: "Phishing Simulations", icon: Mail, minRoles: ["CISO", "SecEngineer", "ComplianceOfficer"] },
        { id: "tabletop", label: "Tabletop Scenarios", icon: Terminal, minRoles: ["CISO", "SecEngineer", "ComplianceOfficer", "Auditor"] },
        { id: "training", label: "Security Training Hub", icon: GraduationCap, minRoles: ["CISO", "SecEngineer", "ComplianceOfficer", "Auditor"] }
      ]
    },
    {
      id: "compliance",
      label: "Compliance & Audit",
      icon: CheckSquare,
      items: [
        { id: "iso27001", label: "ISO 27001 Readiness", icon: CheckSquare, minRoles: ["CISO", "Auditor", "ComplianceOfficer"] },
        { id: "pcidss", label: "PCI DSS Readiness", icon: CreditCard, minRoles: ["CISO", "Auditor", "ComplianceOfficer"] },
        { id: "gap_assessment", label: "Gap Assessment & SoA", icon: Award, minRoles: ["CISO", "Auditor", "ComplianceOfficer"] },
        { id: "continual_improvement", label: "Improvement Log", icon: RefreshCw, minRoles: ["CISO", "SecEngineer", "Auditor", "ComplianceOfficer"] }
      ]
    },
    ...(isGodwayr ? [
      {
        id: "admin_backoffice",
        label: "Admin Backoffice",
        icon: ShieldAlert,
        items: [
          { id: "admin_portal", label: "Admin Control Center", icon: ShieldAlert, minRoles: ["CISO", "SecEngineer", "ComplianceOfficer", "Auditor"] }
        ]
      }
    ] : []),
    {
      id: "settings_group",
      label: "Portal Settings",
      icon: Sliders,
      items: [
        { id: "settings", label: "Portal Configuration", icon: Sliders, minRoles: ["CISO", "SecEngineer", "ComplianceOfficer", "Auditor"] },
        { id: "developer", label: "Dev API & Architecture", icon: Code, minRoles: ["CISO", "SecEngineer", "ComplianceOfficer", "Auditor"], advanced: true }
      ]
    }
  ];

  // State to manage which group is expanded. Default to the "overview" section.
  const [expandedGroupId, setExpandedGroupId] = React.useState<string | null>("overview");

  // Keep expandedGroupId in sync when activeTab is changed from anywhere else (e.g. Tour Guide)
  React.useEffect(() => {
    const matchingGroup = groups.find(group => 
      group.items.some(item => item.id === activeTab)
    );
    if (matchingGroup) {
      setExpandedGroupId(matchingGroup.id);
    }
  }, [activeTab]);

  // Handle accordion header clicks
  const handleGroupHeaderClick = (groupId: string) => {
    if (expandedGroupId === groupId) {
      setExpandedGroupId(null);
    } else {
      setExpandedGroupId(groupId);
      
      // Auto-navigate to first allowed item in the expanded group if no item in this group is currently selected
      const targetGroup = groups.find(g => g.id === groupId);
      if (targetGroup) {
        const isAlreadySelected = targetGroup.items.some(item => item.id === activeTab);
        if (!isAlreadySelected) {
          const firstAllowed = targetGroup.items.find(item => 
            item.minRoles.includes(activeRole) && !(simplifiedMode && item.advanced)
          );
          if (firstAllowed) {
            setActiveTab(firstAllowed.id);
          }
        }
      }
    }
  };

  // Helper to describe role badge colors
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "CISO": return isLight ? "bg-red-50 text-red-700 border-red-200" : "bg-red-500/15 text-red-400 border-red-500/30";
      case "SecEngineer": return isLight ? "bg-cyan-50 text-cyan-700 border-cyan-200" : "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
      case "ComplianceOfficer": return isLight ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "Auditor": return isLight ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-amber-500/15 text-amber-400 border-amber-500/30";
    }
  };

  const getTabRecommendation = (tabId: string, role: UserRole) => {
    if (role === "CISO") {
      if (tabId === "iso27001") return { text: "ISO Signoff", color: isLight ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-amber-500/10 text-amber-400 border-amber-500/20" };
      if (tabId === "pcidss") return { text: "PCI Signoff", color: isLight ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-purple-500/10 text-purple-400 border-purple-500/20" };
      if (tabId === "soc_operations") return { text: "Console", color: isLight ? "bg-cyan-50 text-cyan-700 border-cyan-200 animate-pulse" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse" };
      if (tabId === "tabletop") return { text: "★ Drill", color: isLight ? "bg-red-50 text-red-700 border-red-200" : "bg-red-500/10 text-red-400 border-red-500/20" };
      if (tabId === "training") return { text: "Assign", color: isLight ? "bg-cyan-50 text-cyan-700 border-cyan-200" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" };
    }
    if (role === "SecEngineer") {
      if (tabId === "soc_operations") return { text: "Live Ingress", color: isLight ? "bg-red-50 text-red-700 border-red-200" : "bg-red-500/10 text-red-400 border-red-500/20" };
      if (tabId === "vulnerabilities") return { text: "Scan CVE", color: isLight ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
      if (tabId === "siem") return { text: "AI Threat", color: isLight ? "bg-cyan-50 text-cyan-700 border-cyan-200" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" };
    }
    if (role === "ComplianceOfficer") {
      if (tabId === "iso27001") return { text: "Clauses 4-10", color: isLight ? "bg-cyan-50 text-cyan-700 border-cyan-200" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" };
      if (tabId === "pcidss") return { text: "PCI v4.0", color: isLight ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-purple-500/10 text-purple-400 border-purple-500/20" };
      if (tabId === "training") return { text: "Curriculum", color: isLight ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
    }
    if (role === "Auditor") {
      if (tabId === "iso27001") return { text: "Audit ISO", color: isLight ? "bg-cyan-50 text-cyan-700 border-cyan-200" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" };
      if (tabId === "pcidss") return { text: "Audit PCI", color: isLight ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-purple-500/10 text-purple-400 border-purple-500/20" };
      if (tabId === "training") return { text: "Vetted Certs", color: isLight ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" };
    }
    return null;
  };

  return (
    <aside className={`w-80 border-r flex flex-col h-screen overflow-hidden shrink-0 select-none ${
      isLight ? "bg-white border-slate-200" : "bg-slate-900/50 border-slate-800"
    }`}>
      {/* 🤝 UNIFIED SUPER-COMPACT LOGO & RBAC CONTEXT HEADER */}
      <div className={`p-4 border-b flex flex-col gap-3 shrink-0 ${
        isLight ? "border-slate-100 bg-slate-50/40" : "border-slate-800 bg-slate-950/20"
      }`}>
        {/* Logo and quick controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center border animate-pulse ${
              isLight ? "bg-cyan-50 border-cyan-200 shadow-sm" : "bg-cyan-500/10 border-cyan-500/30"
            }`}>
              <Shield className="h-4.5 w-4.5 text-cyan-500" />
            </div>
            <div>
              <h1 className={`text-sm font-extrabold tracking-tight font-sans ${isLight ? "text-slate-800" : "text-slate-100"}`}>
                Infoshield
              </h1>
              <span className="text-[8px] font-mono text-cyan-500 font-semibold tracking-widest uppercase block -mt-0.5">
                PORTAL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onTriggerOnboardingStory && (
              <button
                onClick={onTriggerOnboardingStory}
                className="text-[10px] font-mono text-cyan-500 hover:text-cyan-600 transition cursor-pointer font-bold"
                title="View onboarding story"
              >
                Story
              </button>
            )}
            {onStartTour && (
              <button
                id="start-tour-btn"
                onClick={onStartTour}
                className="text-[10px] font-mono text-cyan-500 hover:text-cyan-600 flex items-center gap-1 transition cursor-pointer font-bold"
                title="Take quick tour"
              >
                <Sparkles className="h-3 w-3 animate-bounce text-cyan-400" /> Tour
              </button>
            )}
          </div>
        </div>

        {/* Integrated select control with absolute context badge indicator */}
        <div className="relative">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            <Users className="h-3.5 w-3.5 text-cyan-500" />
          </div>
          <select 
            id="rbac-role-select"
            value={activeRole}
            onChange={(e) => {
              const newRole = e.target.value as UserRole;
              setActiveRole(newRole);
              
              // Auto-redirect if current active tab is not allowed under the new role
              const allTabs = groups.flatMap(g => g.items);
              const currentTabObj = allTabs.find(t => t.id === activeTab);
              if (currentTabObj && !currentTabObj.minRoles.includes(newRole)) {
                setActiveTab("dashboard");
              }
            }}
            className={`w-full border rounded-lg pl-8 pr-2.5 py-1.5 text-xs font-sans font-medium cursor-pointer transition appearance-none ${
              isLight 
                ? "bg-white border-slate-200 text-slate-800 focus:ring-cyan-500/20 focus:border-cyan-500 hover:border-slate-300" 
                : "bg-slate-900 border-slate-800 text-slate-100 focus:ring-cyan-500/40 focus:border-cyan-500 hover:border-slate-700"
            }`}
          >
            <option value="CISO">CISO (Full Access)</option>
            <option value="SecEngineer">Security Engineer</option>
            <option value="ComplianceOfficer">Compliance Officer</option>
            <option value="Auditor">External Auditor</option>
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1">
            <span className={`text-[8px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded border leading-none ${getRoleBadgeColor(activeRole)}`}>
              {activeRole} Active
            </span>
          </div>
        </div>
      </div>

      {/* 🚀 SINGLE FLUID SCROLLABLE ACCORDION BODY */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 min-h-0 select-none flex flex-col justify-between">
        {/* Main Accordion Groups */}
        <nav className="space-y-2.5">
          {groups.map((group) => {
            const GroupIcon = group.icon;
            const isExpanded = expandedGroupId === group.id;
            
            // Filter visible items in simplifiedMode
            const visibleItems = group.items.filter(t => !(simplifiedMode && t.advanced));
            const totalCount = visibleItems.length;
            const allowedCount = visibleItems.filter(t => t.minRoles.includes(activeRole)).length;

            // Don't render group if no items are visible in it
            if (totalCount === 0) return null;

            return (
              <div 
                key={group.id} 
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? isLight
                      ? "bg-slate-50/50 border-cyan-500/30 shadow-sm"
                      : "bg-slate-900/40 border-cyan-500/20 shadow-[0_4px_12px_rgba(6,182,212,0.05)]"
                    : isLight
                      ? "bg-transparent border-slate-100 hover:border-slate-200"
                      : "bg-transparent border-slate-800/40 hover:border-slate-800"
                }`}
              >
                {/* 🌟 ACCORDION SECTION BUTTON */}
                <button
                  id={`group-header-${group.id}`}
                  onClick={() => handleGroupHeaderClick(group.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 transition text-left cursor-pointer ${
                    isExpanded 
                      ? isLight ? "text-cyan-600 bg-slate-100/50" : "text-cyan-400 bg-slate-900/60"
                      : isLight ? "text-slate-700 hover:text-slate-900" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <GroupIcon className={`h-4.5 w-4.5 shrink-0 ${
                      isExpanded ? "text-cyan-500" : "text-slate-400"
                    }`} />
                    <span className="text-xs font-bold tracking-tight truncate">{group.label}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded border font-bold ${
                      isExpanded
                        ? isLight ? "bg-cyan-50 border-cyan-100 text-cyan-700" : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                        : isLight ? "bg-slate-100/80 border-slate-200 text-slate-500" : "bg-slate-950/60 border-slate-800 text-slate-500"
                    }`}>
                      {allowedCount}/{totalCount}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    )}
                  </div>
                </button>

                {/* 🛡️ EXPANDED SUB-ITEMS CONTAINER */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-1.5 pb-2.5 pt-1 space-y-0.5 bg-transparent border-t border-slate-100/50 dark:border-slate-850/40">
                        {visibleItems.map((tab) => {
                          const TabIcon = tab.icon;
                          const allowed = tab.minRoles.includes(activeRole);
                          const isActive = activeTab === tab.id;
                          const rec = getTabRecommendation(tab.id, activeRole);

                          if (tab.id === "public_website") {
                            return (
                              <div key={tab.id} className="flex items-center gap-1 w-full">
                                <button
                                  id={`nav-tab-${tab.id}`}
                                  disabled={!allowed}
                                  onClick={() => setActiveTab(tab.id)}
                                  className={`flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-sans transition-all text-left relative cursor-pointer ${
                                    isActive
                                      ? isLight 
                                        ? "bg-slate-100 border-l-2 border-cyan-500 text-cyan-600 font-bold shadow-sm"
                                        : "bg-cyan-950/30 border-l-2 border-cyan-400 text-cyan-300 font-medium"
                                      : isLight
                                        ? "text-slate-600 hover:bg-slate-100/50 hover:text-slate-850"
                                        : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
                                  }`}
                                >
                                  <TabIcon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-cyan-500" : "text-slate-400"}`} />
                                  <span className="truncate">{tab.label}</span>
                                </button>

                                <a
                                  href="/"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Open Standalone Website in New Tab"
                                  className={`p-1.5 rounded-lg border transition cursor-pointer shrink-0 ${
                                    isLight
                                      ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-500 hover:text-cyan-600"
                                      : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400 hover:text-cyan-400"
                                  }`}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            );
                          }

                          return (
                            <button
                              key={tab.id}
                              id={`nav-tab-${tab.id}`}
                              disabled={!allowed}
                              onClick={() => setActiveTab(tab.id)}
                              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-sans transition-all text-left relative cursor-pointer ${
                                !allowed 
                                  ? "opacity-30 cursor-not-allowed hover:bg-transparent"
                                  : isActive
                                  ? isLight 
                                    ? "bg-slate-100 border-l-2 border-cyan-500 text-cyan-600 font-bold shadow-sm"
                                    : "bg-cyan-950/30 border-l-2 border-cyan-400 text-cyan-300 font-medium"
                                  : isLight
                                    ? "text-slate-600 hover:bg-slate-100/50 hover:text-slate-850"
                                    : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
                              }`}
                            >
                              <TabIcon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-cyan-500" : "text-slate-400"}`} />
                              <span className="truncate">{tab.label}</span>
                              
                              {rec && allowed && (
                                <span className={`ml-auto text-[7px] font-mono font-extrabold uppercase px-1 py-0.5 rounded border ${rec.color}`}>
                                  {rec.text}
                                </span>
                              )}
                              {!allowed && (
                                <span className="ml-auto text-[7px] font-mono bg-slate-100 dark:bg-slate-850 px-1 py-0.5 rounded text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800/50">
                                  LOCKED
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* 🛠️ INTEGRATED FOOTER */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-3 mt-4">
          {/* Simplified View Switcher with ID for Tour */}
          <div className="flex items-center justify-between px-2">
            <div className="text-left">
              <span className={`text-[10px] font-bold block ${isLight ? "text-slate-700" : "text-slate-300"}`}>Simplified View</span>
              <span className="text-[8.5px] text-slate-400 dark:text-slate-555 block">Hide advanced panels</span>
            </div>
            <button
              id="simplified-toggle"
              onClick={() => setSimplifiedMode(!simplifiedMode)}
              className="text-cyan-500 hover:text-cyan-600 transition cursor-pointer"
            >
              {simplifiedMode ? (
                <ToggleRight className="h-7 w-7" />
              ) : (
                <ToggleLeft className="h-7 w-7 text-slate-400" />
              )}
            </button>
          </div>

          {/* HA Status Cluster Indicators */}
          <div className={`p-2.5 rounded-lg border flex flex-col gap-1.5 ${
            isLight ? "bg-slate-50 border-slate-150" : "bg-slate-950/40 border-slate-850"
          }`}>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-455">
              <span>HA Cluster Status</span>
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                3/3 Sync
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
              <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
              <div className="h-1 flex-1 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Sign Out Action */}
          {onLogout && (
            <button
              onClick={onLogout}
              id="sidebar-signout-btn"
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-sans font-bold transition-all border cursor-pointer ${
                isLight
                  ? "bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                  : "bg-red-500/5 hover:bg-red-500/15 border-red-500/10 text-red-400"
              }`}
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              <span>Sign Out of Portal</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
