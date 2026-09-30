import React, { useState } from "react";
import { 
  Shield, 
  Building, 
  Globe, 
  Server, 
  Mail, 
  User, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  Cloud, 
  Database, 
  Sliders, 
  Sparkles, 
  Check, 
  Activity, 
  Info,
  Laptop,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User as AppUser, BusinessProfile } from "../types";

interface BusinessOnboardingProps {
  currentUser: AppUser;
  onOnboardingComplete: (business: BusinessProfile) => void;
  theme: "light" | "dark";
}

export default function BusinessOnboarding({
  currentUser,
  onOnboardingComplete,
  theme
}: BusinessOnboardingProps) {
  const isLight = theme === "light";

  const c_card = isLight 
    ? "bg-white border border-slate-200 text-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.03)]" 
    : "bg-slate-900 border border-slate-800 text-slate-100 shadow-[0_15px_50px_rgba(6,182,212,0.12)]";

  const c_text_title = isLight ? "text-slate-900" : "text-white";
  const c_text_muted = isLight ? "text-slate-500 font-sans" : "text-slate-400 font-sans";

  // Guard: Only CISOs can complete formal organization registration
  if (currentUser.role !== "CISO") {
    return (
      <div className={`w-full max-w-2xl rounded-3xl p-6 sm:p-8 relative ${c_card}`} id="business-onboarding-restricted">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500 rounded-t-3xl" />
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            <ShieldAlert className="h-4 w-4 text-red-500 animate-pulse" /> Unauthorized Role
          </div>
          <h2 className={`text-2xl font-black tracking-tight ${c_text_title}`}>
            CISO Credentials Required
          </h2>
          <p className={`text-sm leading-relaxed max-w-md mx-auto ${c_text_muted}`}>
            Only users with the **Chief Information Security Officer (CISO)** role have authority to register, initialize, or reconfigure corporate domains, server counts, and regulatory baselines.
          </p>
          <div className="pt-4">
            <button
              onClick={() => {
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
                onOnboardingComplete(defaultBus);
              }}
              className={`px-5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 mx-auto cursor-pointer shadow-sm ${
                isLight 
                  ? "bg-slate-800 hover:bg-slate-900 text-white" 
                  : "bg-slate-100 hover:bg-slate-200 text-slate-950 font-black"
              }`}
            >
              Activate Enterprise Portal <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [step, setStep] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);

  // Form states
  const [businessName, setBusinessName] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [industry, setIndustry] = useState<string>("SaaS");
  const [cloudProvider, setCloudProvider] = useState<"AWS" | "GCP" | "Azure" | "Hybrid">("AWS");
  const [nodeCount, setNodeCount] = useState<number>(12);
  const [recordCount, setRecordCount] = useState<string>("10,000 - 100,000 (High Data Risk)");
  const [frameworkFocus, setFrameworkFocus] = useState<"SOC-2" | "ISO-27001" | "HIPAA" | "GDPR">("SOC-2");
  const [pocName, setPocName] = useState<string>(currentUser.name || "");
  const [pocEmail, setPocEmail] = useState<string>(currentUser.email || "");

  // Form error states
  const [nameError, setNameError] = useState<string>("");
  const [urlError, setUrlError] = useState<string>("");

  const isSettingUpLive = businessName.trim().length > 0 && 
    businessName.trim() !== "Enterprise Security Target" && 
    website.trim() !== "https://regintel-africa.web.app" &&
    website.trim().length > 0;

  const c_subcard = isLight 
    ? "bg-slate-50 border border-slate-200" 
    : "bg-slate-950 border border-slate-850";

  const c_input = isLight 
    ? "bg-white border-slate-200 focus:border-cyan-500 text-slate-900 placeholder-slate-400" 
    : "bg-slate-950 border-slate-850 focus:border-cyan-500 text-slate-50 placeholder-slate-650";

  // Validate Step 1
  const handleNextToStep2 = () => {
    let hasError = false;
    if (!businessName.trim()) {
      setNameError("Business or Organization name is required.");
      hasError = true;
    } else {
      setNameError("");
    }

    if (!website.trim()) {
      setUrlError("Target website or API domain is required.");
      hasError = true;
    } else {
      // Basic URL verification helper
      const cleanUrl = website.trim().toLowerCase();
      if (!cleanUrl.includes(".") || cleanUrl.length < 4) {
        setUrlError("Please provide a valid corporate domain or IP address.");
        hasError = true;
      } else {
        setUrlError("");
      }
    }

    if (!hasError) {
      setStep(2);
    }
  };

  // Run initial scan setup simulation before final save
  const handleTriggerSimulation = async () => {
    setStep(4);
    setIsSimulating(true);
    setSimulationStep(0);
    setSimulationLogs([]);

    const domainName = website.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];

    const logs = [
      `[MFT-INIT] Establishing security context for ${businessName}...`,
      `[SCANNER] Registering continuous vulnerability scope at: https://${domainName}`,
      `[CLOUD-ENG] Binding active cloud posture monitoring hook to ${cloudProvider} infrastructure...`,
      `[NODE-MON] Synced ${nodeCount} target server nodes in ${cloudProvider} cluster. Mapping IP perimeters...`,
      `[RISK-ENG] Risk severity initialized. Processing compliance baseline for targeting: ${frameworkFocus}...`,
      `[AUDIT-CORE] Seeding automated compliance checklist with 50+ controls...`,
      `[SIEM-GATE] Initializing simulated SIEM pipeline ingress for logs at ${domainName}...`,
      `[MFA-AUTH] Security point of contact validated as ${pocName} (${pocEmail}).`,
      `[SYSTEM] InfoShield deployment baseline successfully initialized! Continuous scanning is now ACTIVE.`
    ];

    for (let i = 0; i < logs.length; i++) {
      setSimulationLogs(prev => [...prev, logs[i]]);
      setSimulationStep(i + 1);
      await new Promise(resolve => setTimeout(resolve, 450 + Math.random() * 250));
    }

    setIsSimulating(false);
  };

  const handleSaveAndComplete = () => {
    let cleanWebsite = website.trim();
    if (!cleanWebsite.startsWith("http://") && !cleanWebsite.startsWith("https://")) {
      cleanWebsite = "https://" + cleanWebsite;
    }

    const businessProfile: BusinessProfile = {
      name: businessName.trim(),
      website: cleanWebsite,
      industry,
      cloudProvider,
      nodeCount,
      recordCount,
      frameworkFocus,
      pocName: pocName.trim(),
      pocEmail: pocEmail.trim(),
      onboardedAt: new Date().toISOString()
    };

    onOnboardingComplete(businessProfile);
  };

  const getNodeScopeLabel = (count: number) => {
    if (count <= 5) return "Low Exposure Perimeter";
    if (count <= 15) return "Standard SME Perimeter";
    if (count <= 50) return "Medium Enterprise Scale";
    if (count <= 150) return "High-Density Cluster Scope";
    return "Global Cloud Scale Infrastructure";
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-6 px-4" id="business-onboarding-viewport">
      
      {/* Progress timeline */}
      <div className="w-full max-w-2xl mb-6 flex justify-between items-center px-4" id="business-onboarding-progress">
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
            isLight ? "bg-cyan-50 border border-cyan-200" : "bg-cyan-500/10 border border-cyan-500/30"
          }`}>
            <Building className="h-4 w-4 text-cyan-500" />
          </div>
          <div>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest block ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Company Onboarding
            </span>
            <span className={`text-xs font-extrabold ${isLight ? "text-cyan-800" : "text-cyan-400"}`}>
              {step === 4 ? (isSettingUpLive ? "Provisioning Live Gateway" : "Activating Secure Portal") : `Step ${step} of 3`}
            </span>
          </div>
        </div>

        {/* Steps indicator bubbles */}
        <div className="flex items-center gap-2 font-mono text-[10px]">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <button
                disabled={s > step}
                onClick={() => setStep(s)}
                className={`h-6 w-6 rounded-full flex items-center justify-center font-bold transition-all border ${
                  s === step
                    ? isLight ? "bg-cyan-600 text-white border-cyan-600 shadow-sm" : "bg-cyan-500 text-slate-950 border-cyan-500 shadow-lg"
                    : s < step
                    ? isLight ? "bg-emerald-100 border-emerald-300 text-emerald-700" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : isLight ? "bg-slate-100 border-slate-200 text-slate-400" : "bg-slate-950 border-slate-850 text-slate-600"
                }`}
              >
                {s < step ? <Check className="h-3 w-3" /> : s}
              </button>
              {s < 3 && (
                <div className={`w-10 h-[2px] mx-1 ${
                  s < step 
                    ? "bg-emerald-500" 
                    : isLight ? "bg-slate-200" : "bg-slate-800"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main card viewport */}
      <div className={`w-full max-w-2xl rounded-3xl p-6 sm:p-8 relative ${c_card}`} id="business-onboarding-card">
        {/* Colorful top accent gradient line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-500 via-emerald-500 to-indigo-500 rounded-t-3xl" />

        <AnimatePresence mode="wait">
          
          {/* STEP 1: COMPANY CORE PROFILE */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Activity className="h-3 w-3 text-cyan-500 animate-pulse" /> Register Security Target
                </div>
                <h2 className={`text-2xl font-black tracking-tight ${c_text_title}`}>
                  Onboard Your Business Profile
                </h2>
                <p className={`text-sm leading-relaxed ${c_text_muted}`}>
                  To initialize continuous monitoring, scanning, and compliance tracking, we need to outline the organization profile on which the security operations will be conducted.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {/* Organization Name */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5 font-bold">
                    Business / Organization Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => {
                        setBusinessName(e.target.value);
                        if (e.target.value.trim()) setNameError("");
                      }}
                      placeholder="e.g., Acme FinTech Payments"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs transition focus:outline-none border font-medium ${c_input}`}
                    />
                  </div>
                  {nameError && (
                    <p className="text-[10px] text-red-500 font-medium mt-1.5">{nameError}</p>
                  )}
                </div>

                {/* Website / Target Domain */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                      Main Security Domain / App URL
                    </label>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Target for Vulnerability Checks</span>
                  </div>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => {
                        setWebsite(e.target.value);
                        if (e.target.value.trim()) setUrlError("");
                      }}
                      placeholder="e.g., https://regintel-africa.web.app"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs transition focus:outline-none border font-mono ${c_input}`}
                    />
                  </div>
                  {urlError ? (
                    <p className="text-[10px] text-red-500 font-medium mt-1.5">{urlError}</p>
                  ) : (
                    <p className="text-[9.5px] text-slate-500 mt-1.5 font-sans leading-normal">
                      Provide your web application URL, cloud portal, or API base domain. This URL populates the VAPT suite and threat scans dynamically.
                    </p>
                  )}
                </div>

                {/* Industry selector */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5 font-bold">
                    Business Operational Sector
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {["FinTech", "HealthTech", "SaaS / Cloud", "E-Commerce", "EdTech", "GovTech"].map((ind) => (
                      <button
                        key={ind}
                        type="button"
                        onClick={() => setIndustry(ind)}
                        className={`py-2.5 px-3 rounded-xl border text-[11px] font-semibold transition cursor-pointer text-center ${
                          industry === ind
                            ? isLight 
                              ? "bg-cyan-50 border-cyan-600 text-cyan-800 ring-1 ring-cyan-600" 
                              : "bg-cyan-950/20 border-cyan-500 text-cyan-400 font-bold"
                            : isLight
                            ? "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                            : "bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-300"
                        }`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Nav */}
              <div className="pt-6 border-t border-slate-250 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextToStep2}
                  className={`px-5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    isLight 
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white" 
                      : "bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black"
                  }`}
                >
                  Configure Server Scope <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: INFRASTRUCTURE SCOPE */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sliders className="h-3.5 w-3.5" /> Core Infrastructure Scope
                </div>
                <h2 className={`text-2xl font-black tracking-tight ${c_text_title}`}>
                  Define Cloud & Data Boundaries
                </h2>
                <p className={`text-sm leading-relaxed ${c_text_muted}`}>
                  To calibrate security alerts, threat logs, and compliance score weighting, define your cloud host counts and data exposure limits.
                </p>
              </div>

              <div className="space-y-5 pt-2">
                {/* Cloud provider cards */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2 font-bold">
                    Primary Hosting Cloud Provider
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: "AWS", name: "AWS S3/EC2", desc: "Amazon Web Services" },
                      { id: "GCP", name: "Google Cloud", desc: "Google Platform" },
                      { id: "Azure", name: "MS Azure", desc: "Microsoft Cloud" },
                      { id: "Hybrid", name: "Hybrid Stack", desc: "On-Premise / Multi" }
                    ].map((provider) => (
                      <button
                        key={provider.id}
                        type="button"
                        onClick={() => setCloudProvider(provider.id as any)}
                        className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between h-[95px] ${
                          cloudProvider === provider.id
                            ? isLight 
                              ? "bg-cyan-50/50 border-cyan-600 ring-1 ring-cyan-600 text-cyan-950" 
                              : "bg-cyan-950/20 border-cyan-500 text-cyan-400"
                            : isLight
                            ? "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                            : "bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-300"
                        }`}
                      >
                        <span className="flex justify-between items-center w-full">
                          <Cloud className={`h-4.5 w-4.5 ${cloudProvider === provider.id ? "text-cyan-500" : "text-slate-500"}`} />
                          {cloudProvider === provider.id && <CheckCircle className="h-3.5 w-3.5 text-cyan-500 fill-cyan-500/10" />}
                        </span>
                        <div>
                          <span className="text-[11px] font-black block mt-2">{provider.name}</span>
                          <span className="text-[9px] text-slate-500 font-medium block leading-none">{provider.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Node count slider */}
                <div className={`p-4 rounded-2xl border ${c_subcard} space-y-3`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Server className="h-3.5 w-3.5 text-cyan-500" /> Server Node/Microservice Count
                    </span>
                    <span className={`text-xs font-mono font-black px-2 py-0.5 rounded ${isLight ? "bg-slate-200 text-slate-800" : "bg-slate-800 text-slate-200"}`}>
                      {nodeCount} Nodes
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="150"
                    value={nodeCount}
                    onChange={(e) => setNodeCount(parseInt(e.target.value))}
                    className="w-full accent-cyan-500 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-slate-500">
                    <span>1 (Micro Node)</span>
                    <span className="text-cyan-500 font-bold uppercase tracking-wider">{getNodeScopeLabel(nodeCount)}</span>
                    <span>150+ (High Volume)</span>
                  </div>
                </div>

                {/* Total Protected Records */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5 font-bold">
                    Protected Record Size & Liability Exposure
                  </label>
                  <div className="relative">
                    <Database className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <select
                      value={recordCount}
                      onChange={(e) => setRecordCount(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs transition focus:outline-none border font-medium ${c_input}`}
                    >
                      <option value="Under 1,000 (Low Data Risk)">Under 1,000 (Low Data Risk)</option>
                      <option value="1,000 - 10,000 (Medium Data Risk)">1,000 - 10,000 (Medium Data Risk)</option>
                      <option value="10,000 - 100,000 (High Data Risk)">10,000 - 100,000 (High Data Risk)</option>
                      <option value="100,000 - 1,000,000+ (Critical Data Risk)">100,000 - 1,000,000+ (Critical Data Risk)</option>
                    </select>
                  </div>
                  <p className="text-[9.5px] text-slate-500 mt-1.5 leading-normal">
                    Used to gauge liability score impacts under privacy regulations (like GDPR and HIPAA).
                  </p>
                </div>
              </div>

              {/* Bottom Nav */}
              <div className="pt-6 border-t border-slate-250 dark:border-slate-800 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 ${
                    isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-600" : "bg-slate-950 hover:bg-slate-900 text-slate-400"
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className={`px-5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    isLight 
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white" 
                      : "bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black"
                  }`}
                >
                  Compliance Framework Focus <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: COMPLIANCE TARGET & POINT OF CONTACT */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-500" /> Compliance Alignment Focus
                </div>
                <h2 className={`text-2xl font-black tracking-tight ${c_text_title}`}>
                  Security Directives & Personnel
                </h2>
                <p className={`text-sm leading-relaxed ${c_text_muted}`}>
                  Select your primary regulatory framework target and confirm the lead security contact authorized to conduct audits and reviews.
                </p>
              </div>

              <div className="space-y-5 pt-2">
                {/* Framework Target */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2 font-bold">
                    Primary Regulatory Framework Focus
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: "SOC-2", title: "SOC-2 (Trust Criteria)", desc: "Best for SaaS, cloud host providers, and tech platforms." },
                      { id: "ISO-27001", title: "ISO-27001 (ISMS)", desc: "Global benchmark for formal corporate security standards." },
                      { id: "HIPAA", title: "HIPAA Safeguarding", desc: "Required for healthcare, wellness, and medical apps." },
                      { id: "GDPR", title: "GDPR Data Protection", desc: "Mandated privacy laws for EU user bases." }
                    ].map((frame) => (
                      <button
                        key={frame.id}
                        type="button"
                        onClick={() => setFrameworkFocus(frame.id as any)}
                        className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex gap-3 ${
                          frameworkFocus === frame.id
                            ? isLight 
                              ? "bg-cyan-50/50 border-cyan-600 ring-1 ring-cyan-600" 
                              : "bg-cyan-950/20 border-cyan-500"
                            : isLight
                            ? "bg-white border-slate-200 hover:bg-slate-50"
                            : "bg-slate-950 border-slate-850 hover:bg-slate-900"
                        }`}
                      >
                        <span className={`h-7 w-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                          frameworkFocus === frame.id
                            ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/25"
                            : isLight ? "bg-slate-100 text-slate-500" : "bg-slate-900 text-slate-500"
                        }`}>
                          <Lock className="h-4 w-4" />
                        </span>
                        <div>
                          <span className={`text-xs font-black block ${frameworkFocus === frame.id ? (isLight ? "text-cyan-950" : "text-cyan-400") : ""}`}>
                            {frame.title}
                          </span>
                          <span className="text-[10px] text-slate-500 leading-snug mt-0.5 block">{frame.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Point of Contact Credentials */}
                <div className={`p-4 rounded-2xl border ${c_subcard} space-y-3.5`}>
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                    Security Lead / Auditor Credentials
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">
                        Security Lead Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={pocName}
                          onChange={(e) => setPocName(e.target.value)}
                          placeholder="Lead Name"
                          className={`w-full pl-8 pr-3 py-2 rounded-lg text-xs transition focus:outline-none border font-medium ${c_input}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">
                        Incident/Alert Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                        <input
                          type="email"
                          required
                          value={pocEmail}
                          onChange={(e) => setPocEmail(e.target.value)}
                          placeholder="security-lead@company.com"
                          className={`w-full pl-8 pr-3 py-2 rounded-lg text-xs transition focus:outline-none border font-medium ${c_input}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Nav */}
              <div className="pt-6 border-t border-slate-250 dark:border-slate-800 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 ${
                    isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-600" : "bg-slate-950 hover:bg-slate-900 text-slate-400"
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleTriggerSimulation}
                  className={`px-6 py-3.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-md ${
                    isLight 
                      ? "bg-emerald-600 hover:bg-emerald-750 text-white" 
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black"
                  }`}
                >
                  <CheckCircle className="h-4.5 w-4.5" /> Initialize Continuous Scans <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: SECURE PORTAL INITIALIZATION SCREEN */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {isSimulating ? (
                    <>
                      <Laptop className="h-3.5 w-3.5 text-cyan-500 animate-spin" /> Spin Up Security Scope
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 animate-bounce" /> Active & Online
                    </>
                  )}
                </div>
                <h2 className={`text-2xl font-black tracking-tight ${c_text_title}`}>
                  {isSimulating ? "Deploying InfoShield Agent Hook" : "Corporate Profile Configured!"}
                </h2>
                <p className={`text-sm max-w-lg mx-auto ${c_text_muted}`}>
                  {isSimulating 
                    ? `Initializing background vulnerability scanning algorithms and compliance checks for ${businessName}.`
                    : `We have compiled the full-suite security compliance logs for ${businessName}. Continuously monitoring ${nodeCount} server nodes.`}
                </p>
              </div>

              {/* Progress Meter */}
              <div className="space-y-2 max-w-md mx-auto">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>DEPLOYMENT PROGRESS</span>
                  <span>{Math.round((simulationStep / 9) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${(simulationStep / 9) * 100}%` }}
                  />
                </div>
              </div>

              {/* Dynamic simulated log outputs */}
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 font-mono text-[11px] leading-relaxed text-slate-400 space-y-1.5 max-h-[200px] overflow-y-auto">
                {simulationLogs.map((log, index) => (
                  <div key={index} className={
                    log.includes("[SUCCESS]") || log.includes("ACTIVE") 
                      ? "text-emerald-400 font-bold" 
                      : log.includes("[MFT-INIT]") || log.includes("[SCANNER]")
                      ? "text-cyan-400"
                      : "text-slate-300"
                  }>
                    {log}
                  </div>
                ))}
              </div>

              {/* Final Complete Action Button */}
              <div className="pt-4 flex justify-center">
                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={handleSaveAndComplete}
                  className={`px-8 py-4 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-lg ${
                    isSimulating
                      ? "opacity-40 cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-850 dark:text-slate-600"
                      : isLight 
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.02]" 
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:scale-[1.02]"
                  }`}
                  id="business-onboarding-btn-complete"
                >
                  <CheckCircle className="h-4.5 w-4.5" /> Launch Active InfoShield Portal <ArrowRight className="h-4.5 w-4.5" />
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <p className="text-[10px] font-mono text-slate-500 text-center mt-6 uppercase tracking-wider">
        Conducting live CVE & ISO checklist auditing securely on your business scope.
      </p>
    </div>
  );
}
