import React, { useState } from "react";
import { 
  Shield, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Play, 
  Terminal, 
  Lock, 
  Flame, 
  Compass, 
  Award,
  BookOpen,
  Briefcase,
  Layers,
  Fingerprint,
  RefreshCw,
  Eye,
  Check,
  Zap,
  CheckSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, UserRole } from "../types";

interface OnboardingStoryProps {
  currentUser: User;
  activeRole: UserRole;
  setActiveTab: (tab: string) => void;
  onComplete: () => void;
  theme: "light" | "dark";
}

export default function OnboardingStory({
  currentUser,
  activeRole,
  setActiveTab,
  onComplete,
  theme
}: OnboardingStoryProps) {
  const isLight = theme === "light";
  const [currentChapter, setCurrentChapter] = useState<number>(1);
  const [interactiveCompleted, setInteractiveCompleted] = useState<boolean>(false);
  const [isSimulatingPatch, setIsSimulatingPatch] = useState<boolean>(false);
  const [riskValue, setRiskValue] = useState<number>(85);
  const [selectedFocus, setSelectedFocus] = useState<string>("");

  const chaptersCount = 4;

  const c_card = isLight 
    ? "bg-white border border-slate-200 text-slate-800 shadow-[0_10px_45px_rgba(0,0,0,0.04)]" 
    : "bg-slate-900 border border-slate-800 text-slate-100 shadow-[0_15px_50px_rgba(6,182,212,0.12)]";

  const c_subcard = isLight 
    ? "bg-slate-50 border border-slate-200" 
    : "bg-slate-950 border border-slate-850";

  const c_text_title = isLight ? "text-slate-900" : "text-white";
  const c_text_muted = isLight ? "text-slate-600 font-sans" : "text-slate-400 font-sans";

  // Simulate applying a patch in the story mini-sandbox
  const handleSimulatePatch = () => {
    setIsSimulatingPatch(true);
    setTimeout(() => {
      setInteractiveCompleted(true);
      setIsSimulatingPatch(false);
      setRiskValue(15);
    }, 1800);
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case "CISO":
        return {
          header: "Enterprise Protector & Strategic Leader",
          mission: "Translate complex tech metrics into Board-Ready business insights, handle high-stakes crises, and coordinate overall corporate posture.",
          focusKey: "Resilience Strategy",
          quote: "Security is not about saying NO; it is about enabling the business to scale securely with measurable, board-ready risk frameworks."
        };
      case "SecEngineer":
        return {
          header: "Tactical Guardian & Perimeter Defender",
          mission: "Hunt active security CVE anomalies, audit network security wrappers, analyze logs with server-side Gemini AI, and deploy instant CVE hotfixes.",
          focusKey: "Vulnerability Auditing",
          quote: "The best firewalls are the ones backed by rapid, automated patch orchestration and rigorous continuous integration monitoring."
        };
      case "ComplianceOfficer":
        return {
          header: "GRC Architect & Quality Auditor",
          mission: "Align technical configurations with leading regulations (SOC-2, ISO 27001, HIPAA, GDPR), assign employee training, and compile flawless reports.",
          focusKey: "Regulatory Compliance",
          quote: "Compliance is not a point-in-time snapshot. It is the rhythmic, continuous verification of corporate policies across all systems."
        };
      case "Auditor":
        return {
          header: "Objective Evaluator & Certificate Inspector",
          mission: "Analyze cryptographic proof histories, audit user permission logs, examine training completion records, and issue compliance attestations.",
          focusKey: "Cryptographic Attestation",
          quote: "Trust, but cryptographically verify. We examine immutable system snapshots to validate operational safety boundaries."
        };
    }
  };

  const roleStory = getRoleDescription(activeRole);

  const handleGoToFeature = (tab: string) => {
    setActiveTab(tab);
    onComplete();
  };

  return (
    <div className={`min-h-[85vh] flex flex-col justify-center items-center py-6 px-4`} id="onboarding-story-container">
      {/* Narrative Progress Indicator */}
      <div className="w-full max-w-3xl mb-6 flex justify-between items-center px-4" id="onboarding-progress-header">
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
            isLight ? "bg-cyan-50 border border-cyan-200" : "bg-cyan-500/10 border border-cyan-500/30"
          }`}>
            <Shield className="h-4 w-4 text-cyan-500" />
          </div>
          <div>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest block ${isLight ? "text-slate-500" : "text-slate-400"}`}>Onboarding Journey</span>
            <span className={`text-xs font-extrabold ${isLight ? "text-cyan-800" : "text-cyan-400"}`}>Chapter {currentChapter} of {chaptersCount}</span>
          </div>
        </div>

        {/* Timeline Bubbles */}
        <div className="flex items-center gap-2 font-mono text-[10px]">
          {Array.from({ length: chaptersCount }).map((_, i) => (
            <div key={i} className="flex items-center">
              <button
                disabled={i + 1 > currentChapter}
                onClick={() => setCurrentChapter(i + 1)}
                className={`h-6 w-6 rounded-full flex items-center justify-center font-bold transition-all border ${
                  i + 1 === currentChapter
                    ? isLight ? "bg-cyan-600 text-white border-cyan-600" : "bg-cyan-500 text-slate-950 border-cyan-500"
                    : i + 1 < currentChapter
                    ? isLight ? "bg-emerald-100 border-emerald-300 text-emerald-700" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : isLight ? "bg-slate-100 border-slate-200 text-slate-400" : "bg-slate-950 border-slate-850 text-slate-600"
                }`}
                id={`onboarding-step-indicator-${i + 1}`}
              >
                {i + 1 < currentChapter ? <Check className="h-3 w-3" /> : i + 1}
              </button>
              {i < chaptersCount - 1 && (
                <div className={`w-6 h-[2px] mx-1 ${
                  i + 1 < currentChapter 
                    ? "bg-emerald-500" 
                    : isLight ? "bg-slate-200" : "bg-slate-800"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Narrative Card */}
      <div className={`w-full max-w-3xl rounded-3xl p-6 sm:p-8 relative ${c_card}`} id="onboarding-story-card">
        {/* Colorful top bar decoration */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 rounded-t-3xl" />

        <AnimatePresence mode="wait">
          {/* CHAPTER 1: WELCOME & SYSTEM NARRATIVE */}
          {currentChapter === 1 && (
            <motion.div
              key="chapter-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
              id="onboarding-story-chapter-1"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Compass className="h-3 w-3 animate-spin" style={{ animationDuration: '8s' }} /> InfoShield Chronicles
                </div>
                <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${c_text_title}`}>
                  The Story of Secure Resilience
                </h2>
                <p className={`text-sm leading-relaxed ${c_text_muted}`}>
                  Welcome to InfoShield, your highly resilient, continuous security operations portal. InfoShield is not just a dashboard of numbers; it is an active defense ecosystem built on four core pillars.
                </p>
              </div>

              {/* 4 Pillars Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className={`p-4 rounded-2xl border transition hover:border-cyan-500/30 flex gap-3.5 ${c_subcard}`}>
                  <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-500">
                    <Terminal className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider font-mono ${isLight ? "text-slate-800" : "text-slate-200"}`}>SIEM & Threat Logs</h4>
                    <p className={`text-[11px] leading-normal mt-1 ${c_text_muted}`}>
                      Continuous stream of simulated active syslog records. Hook up suspicious payloads with server-side Gemini AI for dynamic threat forensics.
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border transition hover:border-emerald-500/30 flex gap-3.5 ${c_subcard}`}>
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-500">
                    <CheckSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider font-mono ${isLight ? "text-slate-800" : "text-slate-200"}`}>Compliance Audits</h4>
                    <p className={`text-[11px] leading-normal mt-1 ${c_text_muted}`}>
                      Map operational configs to global frameworks (SOC-2, ISO 27001 checklists, PCIDSS 93 controls) with owner and auditor tracking.
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border transition hover:border-indigo-500/30 flex gap-3.5 ${c_subcard}`}>
                  <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-500">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider font-mono ${isLight ? "text-slate-800" : "text-slate-200"}`}>Cyber Incident Sim</h4>
                    <p className={`text-[11px] leading-normal mt-1 ${c_text_muted}`}>
                      Tabletop disaster response drill scenarios where C-level managers make instant defense inject choices affecting risk ratios.
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border transition hover:border-amber-500/30 flex gap-3.5 ${c_subcard}`}>
                  <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-500">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider font-mono ${isLight ? "text-slate-800" : "text-slate-200"}`}>Workforce Awareness</h4>
                    <p className={`text-[11px] leading-normal mt-1 ${c_text_muted}`}>
                      A comprehensive training hub that lets compliance teams enroll, edit, and audit simulated phishing awareness campaigns.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Row Navigation */}
              <div className="pt-6 border-t border-slate-250 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setCurrentChapter(2)}
                  className={`px-5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    isLight 
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white" 
                      : "bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black"
                  }`}
                  id="onboarding-btn-next-1"
                >
                  Meet Your Role Mission <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* CHAPTER 2: MEET YOUR ROLE MISSION */}
          {currentChapter === 2 && (
            <motion.div
              key="chapter-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
              id="onboarding-story-chapter-2"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Award className="h-3.5 w-3.5" /> Security Role Assignment
                </div>
                <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${c_text_title}`}>
                  Welcome, <span className={`${isLight ? "text-cyan-700" : "text-cyan-400"} font-extrabold`}>{currentUser.name}</span>
                </h2>
                <p className={`text-sm ${c_text_muted}`}>
                  InfoShield enforces granular **Role-Based Access Control (RBAC)** to organize defense responsibilities. Since you registered as a <strong className={isLight ? "text-cyan-800 font-bold" : "text-cyan-400 font-bold"}>{activeRole}</strong>, this is the story of your corporate mission:
                </p>
              </div>

              {/* Role Bio Panel */}
              <div className={`p-5 rounded-2xl border space-y-4 ${c_subcard}`}>
                <div className="flex items-center gap-3">
                  <span className={`h-11 w-11 rounded-xl border flex items-center justify-center ${
                    isLight ? "bg-cyan-50 border-cyan-200 text-cyan-700" : "bg-cyan-500/10 border-cyan-500/25 text-cyan-400"
                  }`}>
                    {activeRole === "CISO" && <Shield className="h-6 w-6" />}
                    {activeRole === "SecEngineer" && <Terminal className="h-6 w-6" />}
                    {activeRole === "ComplianceOfficer" && <Layers className="h-6 w-6" />}
                    {activeRole === "Auditor" && <Award className="h-6 w-6" />}
                  </span>
                  <div>
                    <h3 className={`font-black text-sm uppercase tracking-wide font-mono ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                      {roleStory.header}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Active Security Role: {activeRole}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">CORE TASKS & PERMISSIONS</span>
                    <p className={`text-xs leading-relaxed ${c_text_muted}`}>{roleStory.mission}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">TACTICAL FOCUS KEY</span>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Sparkles className="h-3.5 w-3.5" /> {roleStory.focusKey}
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border-l-4 border-cyan-500 italic text-xs leading-relaxed ${
                  isLight ? "bg-white text-slate-700" : "bg-slate-950 text-slate-300"
                }`}>
                  "{roleStory.quote}"
                </div>
              </div>

              {/* Interactive Multi-Select Interest Focus */}
              <div className="space-y-3">
                <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest font-bold">Customize Your Onboarding Focus Area</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    "Defensive Threat Hunting",
                    "Continuous Compliance Checklists",
                    "C-Level tabletop Disaster Drills"
                  ].map((focus) => (
                    <button
                      key={focus}
                      type="button"
                      onClick={() => setSelectedFocus(focus)}
                      className={`p-3 rounded-xl border text-[11px] font-semibold text-center transition cursor-pointer ${
                        selectedFocus === focus
                          ? isLight 
                            ? "bg-cyan-50 border-cyan-600 text-cyan-800 ring-1 ring-cyan-600" 
                            : "bg-cyan-950/20 border-cyan-500 text-cyan-400 font-bold"
                          : isLight
                          ? "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                          : "bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-300"
                      }`}
                    >
                      {focus}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Row Navigation */}
              <div className="pt-6 border-t border-slate-250 dark:border-slate-800 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentChapter(1)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                    isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-600" : "bg-slate-950 hover:bg-slate-900 text-slate-400"
                  }`}
                >
                  Back to Intro
                </button>
                <button
                  onClick={() => setCurrentChapter(3)}
                  className={`px-5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    isLight 
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white" 
                      : "bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black"
                  }`}
                  id="onboarding-btn-next-2"
                >
                  Enter Safe Defense Simulator <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* CHAPTER 3: INTERACTIVE ACTION SIMULATION */}
          {currentChapter === 3 && (
            <motion.div
              key="chapter-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
              id="onboarding-story-chapter-3"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Zap className="h-3.5 w-3.5 text-rose-500 animate-pulse" /> Chapter 3: Practice Action Simulator
                </div>
                <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${c_text_title}`}>
                  Interactive Incident Orchestration
                </h2>
                <p className={`text-sm ${c_text_muted}`}>
                  InfoShield streamlines high-stakes security operations. Let's go through a guided walkthrough of our continuous response capabilities. A live simulated security vulnerability alert has triggered on Node 04:
                </p>
              </div>

              {/* Live Threat Interactive Simulator Frame */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                interactiveCompleted 
                  ? "border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.05)]" 
                  : "border-red-500/20 bg-red-500/5"
              }`}>
                {/* Simulator Title Header */}
                <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${interactiveCompleted ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-red-500 animate-ping"}`} />
                    <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider">SEC-ORCHESTRATOR // ACTIVE ALARM</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">Node: cluster-04-prod</span>
                </div>

                {/* Threat Indicators Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-xl border ${c_subcard} text-center`}>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">Simulated Corporate Risk</p>
                    <p className={`text-2xl font-black font-mono mt-1 ${interactiveCompleted ? "text-emerald-500" : "text-rose-500"}`}>{riskValue}%</p>
                  </div>
                  <div className={`p-3 rounded-xl border ${c_subcard} text-center`}>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">CVE Identifier</p>
                    <p className={`text-xs font-black font-mono mt-1.5 px-2 py-0.5 rounded self-center inline-block ${
                      isLight ? "bg-slate-200 text-slate-800" : "bg-slate-800 text-slate-200"
                    }`}>CVE-2026-4437</p>
                  </div>
                </div>

                {/* Simulated Log Output Terminal */}
                <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 font-mono text-[10.5px] leading-relaxed text-slate-400 space-y-1">
                  <div className="text-cyan-400">$ scan --target prod-node-04</div>
                  <div>[SCANNING] Probing file allocation tables ...</div>
                  {interactiveCompleted ? (
                    <>
                      <div className="text-emerald-400 font-bold">[SUCCESS] Applied cryptographic patch hash: SHA256-4D9E2F</div>
                      <div className="text-emerald-400 font-bold">[SUCCESS] Vulnerability closed. Risk mitigated! Posture secure.</div>
                    </>
                  ) : (
                    <>
                      <div className="text-red-400 font-bold">[WARNING] Found active memory pointer leak!</div>
                      <div className="text-red-400 font-bold">[WARNING] Unauthorized SSH credentials access attempt flagged.</div>
                    </>
                  )}
                </div>

                {/* Simulator Primary Action Button */}
                {!interactiveCompleted ? (
                  <button
                    type="button"
                    disabled={isSimulatingPatch}
                    onClick={handleSimulatePatch}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold py-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                  >
                    {isSimulatingPatch ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> Orchestrating Automated Node Patch...
                      </>
                    ) : (
                      <>
                        <Flame className="h-4 w-4 animate-bounce" /> Click to Deploy Automated Patch & Mitigate Risk
                      </>
                    )}
                  </button>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3 text-xs text-emerald-500 font-semibold">
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    <span>Fantastic job! You've successfully patched your first vulnerability. In the real portal dashboard, you can deploy bulk hotfixes just as easily under the VAPT Suite.</span>
                  </div>
                )}
              </div>

              {/* Bottom Row Navigation */}
              <div className="pt-6 border-t border-slate-250 dark:border-slate-800 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentChapter(2)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                    isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-600" : "bg-slate-950 hover:bg-slate-900 text-slate-400"
                  }`}
                >
                  Back to Role Mission
                </button>
                <button
                  onClick={() => setCurrentChapter(4)}
                  disabled={!interactiveCompleted}
                  className={`px-5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    !interactiveCompleted
                      ? "opacity-50 cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-850 dark:text-slate-600"
                      : isLight 
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white" 
                      : "bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black"
                  }`}
                  id="onboarding-btn-next-3"
                >
                  Review Tailored Action Plan <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* CHAPTER 4: CORE NAVIGATION GUIDE & CALL-TO-ACTION */}
          {currentChapter === 4 && (
            <motion.div
              key="chapter-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
              id="onboarding-story-chapter-4"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckSquare className="h-3.5 w-3.5 text-emerald-500" /> Chapter 4: Your Tailored Guide
                </div>
                <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${c_text_title}`}>
                  Your Personal Path & Action Plan
                </h2>
                <p className={`text-sm ${c_text_muted}`}>
                  Excellent! You are now fully certified to access InfoShield. We have compiled a **tailored checklist** matching your role access level to help you navigate and inspect the features:
                </p>
              </div>

              {/* Personalized Action Checklist */}
              <div className="space-y-3">
                {activeRole === "CISO" && (
                  <>
                    <div className={`p-4 rounded-2xl border flex items-start gap-3.5 transition hover:bg-slate-50/50 dark:hover:bg-slate-900/40 ${c_subcard}`}>
                      <div className="h-6 w-6 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0 font-mono text-[10px] font-bold">1</div>
                      <div className="space-y-1">
                        <h4 className={`text-xs font-bold font-sans ${isLight ? "text-slate-900" : "text-slate-100"}`}>Engage in a Cyber Tabletop Crisis Simulation</h4>
                        <p className={`text-[11px] leading-relaxed ${c_text_muted}`}>Go to the **Cyber Game Simulator** tab, select a threat inject, and practice C-level crisis management.</p>
                        <button onClick={() => handleGoToFeature("tabletop")} className="text-[10px] font-mono text-cyan-500 hover:underline mt-1 font-bold flex items-center gap-1">Jump to Simulator <ArrowRight className="h-3 w-3" /></button>
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl border flex items-start gap-3.5 transition hover:bg-slate-50/50 dark:hover:bg-slate-900/40 ${c_subcard}`}>
                      <div className="h-6 w-6 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0 font-mono text-[10px] font-bold">2</div>
                      <div className="space-y-1">
                        <h4 className={`text-xs font-bold font-sans ${isLight ? "text-slate-900" : "text-slate-100"}`}>Toggle 'Board-Ready Executive View' Mode</h4>
                        <p className={`text-[11px] leading-relaxed ${c_text_muted}`}>On the main dashboard, use the header switch to translate raw logs into intuitive high-impact summaries.</p>
                        <button onClick={() => handleGoToFeature("dashboard")} className="text-[10px] font-mono text-cyan-500 hover:underline mt-1 font-bold flex items-center gap-1">Jump to Dashboard <ArrowRight className="h-3 w-3" /></button>
                      </div>
                    </div>
                  </>
                )}

                {activeRole === "SecEngineer" && (
                  <>
                    <div className={`p-4 rounded-2xl border flex items-start gap-3.5 transition hover:bg-slate-50/50 dark:hover:bg-slate-900/40 ${c_subcard}`}>
                      <div className="h-6 w-6 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 shrink-0 font-mono text-[10px] font-bold">1</div>
                      <div className="space-y-1">
                        <h4 className={`text-xs font-bold font-sans ${isLight ? "text-slate-900" : "text-slate-100"}`}>Analyze Threat logs with server-side Gemini AI</h4>
                        <p className={`text-[11px] leading-relaxed ${c_text_muted}`}>Go to the **SIEM Logs & AI Threat** tab, click any telemetry packet, and evaluate it with modern AI models.</p>
                        <button onClick={() => handleGoToFeature("siem")} className="text-[10px] font-mono text-cyan-500 hover:underline mt-1 font-bold flex items-center gap-1">Jump to AI Forensics <ArrowRight className="h-3 w-3" /></button>
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl border flex items-start gap-3.5 transition hover:bg-slate-50/50 dark:hover:bg-slate-900/40 ${c_subcard}`}>
                      <div className="h-6 w-6 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 shrink-0 font-mono text-[10px] font-bold">2</div>
                      <div className="space-y-1">
                        <h4 className={`text-xs font-bold font-sans ${isLight ? "text-slate-900" : "text-slate-100"}`}>Orchestrate Cluster Hotfixes & Auditing</h4>
                        <p className={`text-[11px] leading-relaxed ${c_text_muted}`}>Go to the **VAPT Suite** tab, check active high-severity CVE records, and apply real-time single or bulk patches.</p>
                        <button onClick={() => handleGoToFeature("vulnerabilities")} className="text-[10px] font-mono text-cyan-500 hover:underline mt-1 font-bold flex items-center gap-1">Jump to VAPT Suite <ArrowRight className="h-3 w-3" /></button>
                      </div>
                    </div>
                  </>
                )}

                {activeRole === "ComplianceOfficer" && (
                  <>
                    <div className={`p-4 rounded-2xl border flex items-start gap-3.5 transition hover:bg-slate-50/50 dark:hover:bg-slate-900/40 ${c_subcard}`}>
                      <div className="h-6 w-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 font-mono text-[10px] font-bold">1</div>
                      <div className="space-y-1">
                        <h4 className={`text-xs font-bold font-sans ${isLight ? "text-slate-900" : "text-slate-100"}`}>Evaluate the Complete 93-Control ISO 27001 Checklist</h4>
                        <p className={`text-[11px] leading-relaxed ${c_text_muted}`}>Navigate to the dedicated **ISO 27001 Audit Readiness Check** tab to check the exhaustive listing of controls (A5, A6, A7, etc.) and audit progress.</p>
                        <button onClick={() => handleGoToFeature("iso27001")} className="text-[10px] font-mono text-cyan-500 hover:underline mt-1 font-bold flex items-center gap-1">Jump to ISO 27001 Checklist <ArrowRight className="h-3 w-3" /></button>
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl border flex items-start gap-3.5 transition hover:bg-slate-50/50 dark:hover:bg-slate-900/40 ${c_subcard}`}>
                      <div className="h-6 w-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 font-mono text-[10px] font-bold">2</div>
                      <div className="space-y-1">
                        <h4 className={`text-xs font-bold font-sans ${isLight ? "text-slate-900" : "text-slate-100"}`}>Manage Employee Training & Campaigns</h4>
                        <p className={`text-[11px] leading-relaxed ${c_text_muted}`}>Navigate to the **Training & Awareness** tab to audit courses and dispatch simulated phishing emails to test workforce vigilance.</p>
                        <button onClick={() => handleGoToFeature("training")} className="text-[10px] font-mono text-cyan-500 hover:underline mt-1 font-bold flex items-center gap-1">Jump to Awareness Hub <ArrowRight className="h-3 w-3" /></button>
                      </div>
                    </div>
                  </>
                )}

                 {activeRole === "Auditor" && (
                  <>
                    <div className={`p-4 rounded-2xl border flex items-start gap-3.5 transition hover:bg-slate-50/50 dark:hover:bg-slate-900/40 ${c_subcard}`}>
                      <div className="h-6 w-6 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 font-mono text-[10px] font-bold">1</div>
                      <div className="space-y-1">
                        <h4 className={`text-xs font-bold font-sans ${isLight ? "text-slate-900" : "text-slate-100"}`}>Validate ISO 27001 Readiness Evidence</h4>
                        <p className={`text-[11px] leading-relaxed ${c_text_muted}`}>Navigate to the **ISO 27001 Audit Readiness Check** tab to inspect verified owner signatures, timestamps, and download certified reports.</p>
                        <button onClick={() => handleGoToFeature("iso27001")} className="text-[10px] font-mono text-cyan-500 hover:underline mt-1 font-bold flex items-center gap-1">Jump to ISO 27001 Checklist <ArrowRight className="h-3 w-3" /></button>
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl border flex items-start gap-3.5 transition hover:bg-slate-50/50 dark:hover:bg-slate-900/40 ${c_subcard}`}>
                      <div className="h-6 w-6 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 font-mono text-[10px] font-bold">2</div>
                      <div className="space-y-1">
                        <h4 className={`text-xs font-bold font-sans ${isLight ? "text-slate-900" : "text-slate-100"}`}>Inspect Immutable Training & CVE Attestations</h4>
                        <p className={`text-[11px] leading-relaxed ${c_text_muted}`}>Review courses pass percentages and verify node security ratios without modifying environment state.</p>
                        <button onClick={() => handleGoToFeature("training")} className="text-[10px] font-mono text-cyan-500 hover:underline mt-1 font-bold flex items-center gap-1">Jump to Training Certifications <ArrowRight className="h-3 w-3" /></button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Bottom Row Navigation */}
              <div className="pt-6 border-t border-slate-250 dark:border-slate-800 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentChapter(3)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                    isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-600" : "bg-slate-950 hover:bg-slate-900 text-slate-400"
                  }`}
                >
                  Back to Action Simulator
                </button>
                <button
                  onClick={onComplete}
                  className={`px-6 py-3.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer shadow-md ${
                    isLight 
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                  }`}
                  id="onboarding-btn-complete"
                >
                  <CheckCircle className="h-4.5 w-4.5 animate-pulse" /> Complete Onboarding & Enter Portal
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Narrative Footer Quote */}
      <p className="text-[10.5px] font-mono text-slate-500 text-center mt-6 uppercase tracking-wider">
        InfoShield is designed with pristine compliance & role-based defense alignment.
      </p>
    </div>
  );
}
