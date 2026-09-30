import React, { useState } from "react";
import { User, UserRole } from "../types";
import { 
  Compass, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Terminal, 
  FileCheck2, 
  GraduationCap, 
  X
} from "lucide-react";
import { motion } from "motion/react";

interface OnboardingBannerProps {
  currentUser: User;
  activeRole: UserRole;
  setActiveTab: (tab: string) => void;
  triggerTour: () => void;
  isLight: boolean;
  isExecutiveView?: boolean;
  setIsExecutiveView?: (val: boolean) => void;
  triggerOnboardingStory?: () => void;
}

export default function OnboardingBanner({
  currentUser,
  activeRole,
  setActiveTab,
  triggerTour,
  isLight,
  isExecutiveView = false,
  setIsExecutiveView,
  triggerOnboardingStory
}: OnboardingBannerProps) {
  const [isVisible, setIsVisible] = useState(() => {
    const saved = localStorage.getItem("infoshield_onboarding_visible");
    return saved !== "false";
  });

  const [simulationLog, setSimulationLog] = useState<string | null>(null);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("infoshield_onboarding_visible", "false");
  };

  const handleShow = () => {
    setIsVisible(true);
    localStorage.setItem("infoshield_onboarding_visible", "true");
  };

  const triggerActionNotification = (text: string) => {
    setSimulationLog(text);
    setTimeout(() => {
      setSimulationLog(null);
    }, 4500);
  };

  if (!isVisible) {
    return (
      <div className="flex justify-end mb-4">
        <button
          onClick={handleShow}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono border transition duration-200 cursor-pointer ${
            isLight 
              ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-750" 
              : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
          }`}
          title="Show Role Onboarding Guide"
        >
          <Compass className={`h-3.5 w-3.5 ${isLight ? "text-cyan-600" : "text-cyan-500"} animate-spin`} style={{ animationDuration: "12s" }} />
          Show Onboarding Guidance Advisor
        </button>
      </div>
    );
  }

  // Define role specific guidelines with dynamic light/dark styling
  const getRoleGuidance = (role: UserRole) => {
    switch (role) {
      case "CISO":
        return {
          title: "Chief Information Security Officer (CISO) Mission",
          icon: <ShieldCheck className={`h-5 w-5 ${isLight ? "text-cyan-700" : "text-cyan-400"}`} />,
          description: "You oversee overall corporate security governance, threat exposure, and compliance audits. Let's maximize executive clarity and tabletop resilience.",
          colorClass: isLight 
            ? "border-cyan-200 bg-cyan-50/70 text-cyan-950" 
            : "border-cyan-500/20 bg-cyan-950/20 text-cyan-300",
          steps: [
            {
              text: "Board-Ready Metrics Mode",
              desc: "Toggle Executive Mode directly from here to translate dry technical statistics into executive risk assessments suitable for the Board.",
              action: () => {
                if (setIsExecutiveView) {
                  setIsExecutiveView(!isExecutiveView);
                  triggerActionNotification(`Board-Ready metrics Mode ${!isExecutiveView ? "ENABLED" : "DISABLED"}`);
                }
              },
              actionText: isExecutiveView ? "Disable Board View" : "Enable Board View"
            },
            {
              text: "Incident Simulation (Tabletop Playbooks)",
              desc: "Test security leadership responses by launching staged drills with active threat injects in the Cyber Incident Simulator.",
              action: () => {
                setActiveTab("tabletop");
                triggerActionNotification("Redirected to Tabletop Drills section");
              },
              actionText: "Launch Tabletop"
            },
            {
              text: "Workforce Training Campaigns",
              desc: "Ensure your employees are cyber-aware. Assign, update, and review specialized training courses and pass rates.",
              action: () => {
                setActiveTab("training");
                triggerActionNotification("Navigated to Training Hub Manager");
              },
              actionText: "Manage Training"
            }
          ]
        };
      case "SecEngineer":
        return {
          title: "Security Engineer (SecOps) Mission",
          icon: <Terminal className={`h-5 w-5 ${isLight ? "text-emerald-700" : "text-emerald-400"}`} />,
          description: "You manage tactical perimeter defense, deploy Docker node patches, and handle deep forensic threat packet investigations.",
          colorClass: isLight 
            ? "border-emerald-200 bg-emerald-50/70 text-emerald-950" 
            : "border-emerald-500/20 bg-emerald-950/20 text-emerald-300",
          steps: [
            {
              text: "Cluster Vulnerability & Patch Center",
              desc: "Review active high/critical CVEs. Instantly apply verified code patches and watch host vulnerability levels decrease.",
              action: () => {
                setActiveTab("vulnerabilities");
                triggerActionNotification("Navigated to Live Vulnerability Patch center");
              },
              actionText: "Scan and Patch"
            },
            {
              text: "AI-Powered Threat Forensics",
              desc: "Analyze suspicious log flows. Leverage server-side Gemini threat modeling to decrypt raw packets and draft firewall rules.",
              action: () => {
                setActiveTab("siem");
                triggerActionNotification("Redirected to AI SIEM Threat investigator");
              },
              actionText: "Investigate SIEM Logs"
            },
            {
              text: "Portal Alerts & SSH Guard",
              desc: "Manage portal notifications and monitor threat logs closely to keep perimeter integrity safe.",
              action: () => {
                setActiveTab("settings");
                triggerActionNotification("Navigated to Settings alert configuration dashboard");
              },
              actionText: "Check Alerts"
            }
          ]
        };
      case "ComplianceOfficer":
        return {
          title: "Compliance Officer Mission",
          icon: <FileCheck2 className={`h-5 w-5 ${isLight ? "text-amber-700" : "text-amber-400"}`} />,
          description: "You align daily technical controls with SOC-2, ISO-27001, GDPR, and HIPAA frameworks. Keep policy evidence pristine.",
          colorClass: isLight 
            ? "border-amber-200 bg-amber-50/70 text-amber-950" 
            : "border-amber-500/20 bg-amber-950/20 text-amber-300",
          steps: [
            {
              text: "ISO 27001 Audit Readiness Check",
              desc: "Track the active readiness status of critical ISO 27001 controls. Assess compliance categories and check progress.",
              action: () => {
                setActiveTab("iso27001");
                triggerActionNotification("Navigated to ISO 27001 Audit Readiness Check");
              },
              actionText: "Check Readiness"
            },
            {
              text: "Security Training Hub",
              desc: "Add, review, and edit corporate training courses. Upload mandatory courses and monitor employee assignment progress.",
              action: () => {
                setActiveTab("training");
                triggerActionNotification("Redirected to Curriculum Uploader");
              },
              actionText: "Upload Material"
            },
            {
              text: "System Portal Settings",
              desc: "Maintain system configurations, and manage critical threat warnings to keep the primary operations center smooth.",
              action: () => {
                setActiveTab("settings");
                triggerActionNotification("Redirected to configuration center");
              },
              actionText: "Configure Portal"
            }
          ]
        };
      case "Auditor":
        return {
          title: "External Auditor Mission",
          icon: <GraduationCap className={`h-5 w-5 ${isLight ? "text-indigo-700" : "text-indigo-400"}`} />,
          description: "You verify independent, objective security proof, examine audit logs, and download signed control attestations.",
          colorClass: isLight 
            ? "border-indigo-200 bg-indigo-50/70 text-indigo-950" 
            : "border-indigo-500/20 bg-indigo-950/20 text-indigo-300",
          steps: [
            {
              text: "ISO 27001 Audit Readiness Check",
              desc: "Review the exact verification histories, compliance levels, and active control statuses for ISO-27001.",
              action: () => {
                setActiveTab("iso27001");
                triggerActionNotification("Inspecting ISO 27001 audit readiness evidence");
              },
              actionText: "Inspect Evidence"
            },
            {
              text: "Workforce Certification Logs",
              desc: "Inspect employee participation logs and course completion percentages to verify mandatory security compliance.",
              action: () => {
                setActiveTab("training");
                triggerActionNotification("Opened compliance training certifications");
              },
              actionText: "Verify Certificates"
            },
            {
              text: "Portal Configuration Audits",
              desc: "Inspect active policy declarations, configuration flags, and active token session validations.",
              action: () => {
                setActiveTab("settings");
                triggerActionNotification("Inspecting configuration details");
              },
              actionText: "Verify Core Config"
            }
          ]
        };
    }
  };

  const guidance = getRoleGuidance(activeRole);

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className={`relative rounded-2xl p-5 border shadow-md transition duration-200 ${
        isLight 
          ? "bg-white border-slate-200 text-slate-900" 
          : "bg-slate-900/95 border-slate-800 text-slate-100"
      }`}
      id="onboarding-guidance-card"
    >
      {/* Absolute Header Ribbon Decorator */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 rounded-t-2xl" />

      {/* Close/Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition cursor-pointer p-1 rounded-lg"
        title="Hide Guidance Guide"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Main Grid: Info on left, Actions on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
        {/* Left Side: Role Identity & Welcome */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className={`p-2.5 rounded-xl border flex items-center justify-center ${
              isLight ? "bg-cyan-50 border-cyan-200 text-cyan-750" : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
            }`}>
              <Compass className="h-5 w-5 animate-spin" style={{ animationDuration: "10s" }} />
            </span>
            <div>
              <h3 className={`font-bold text-sm tracking-tight flex items-center gap-1 ${isLight ? "text-slate-855" : "text-slate-100"}`}>
                Role Guidance Advisor
                <Sparkles className={`h-3.5 w-3.5 animate-pulse ${isLight ? "text-cyan-600" : "text-cyan-400"}`} />
              </h3>
              <p className={`text-[10px] font-mono tracking-wider uppercase ${isLight ? "text-slate-500" : "text-slate-400"}`}>Adaptive Onboarding Engine</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>
              Welcome, <span className={`${isLight ? "text-cyan-700" : "text-cyan-400"} font-extrabold`}>{currentUser.name}</span>!
            </h2>
            <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${guidance.colorClass}`}>
              <div className="mt-0.5 shrink-0">{guidance.icon}</div>
              <div className="space-y-1">
                <p className={`text-xs font-bold leading-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>{guidance.title}</p>
                <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-700" : "text-slate-300"}`}>{guidance.description}</p>
              </div>
            </div>
          </div>

          {/* Core Interactive Walkthrough Button */}
          <div className="pt-2 space-y-2">
            {triggerOnboardingStory && (
              <button
                onClick={triggerOnboardingStory}
                className={`w-full font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition duration-200 cursor-pointer ${
                  isLight 
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-250" 
                    : "bg-slate-950 hover:bg-slate-900 text-slate-200 border border-slate-800"
                }`}
              >
                <Compass className="h-3.5 w-3.5 text-cyan-500" /> Read Portal Storybook
              </button>
            )}
            <button
              onClick={triggerTour}
              className={`w-full font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition duration-200 cursor-pointer ${
                isLight 
                  ? "bg-cyan-600 hover:bg-cyan-700 text-white" 
                  : "bg-cyan-600 hover:bg-cyan-500 text-slate-950"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> Start Interactive Quick Tour
            </button>
            <p className="text-[10px] text-slate-500 text-center font-mono mt-1">Take a 6-step layout walk-through</p>
          </div>
        </div>

        {/* Right Side: Role Specific Focus Steps */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <p className={`text-[10px] font-mono uppercase tracking-widest font-bold ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Suggested Next Actions For Your Access Level
            </p>
            {simulationLog && (
              <motion.span 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[9px] font-mono text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20"
              >
                {simulationLog}
              </motion.span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {guidance.steps.map((step, index) => (
              <div 
                key={index}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all duration-200 ${
                  isLight 
                    ? "bg-slate-50 hover:bg-slate-100 border-slate-200" 
                    : "bg-slate-950/60 hover:bg-slate-900 border-slate-850"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`flex h-5 w-5 rounded-full text-[10px] font-bold items-center justify-center font-mono ${
                      isLight ? "bg-cyan-100 text-cyan-800" : "bg-cyan-500/10 text-cyan-400"
                    }`}>
                      {index + 1}
                    </span>
                    <h4 className={`text-xs font-bold tracking-tight leading-tight truncate ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                      {step.text}
                    </h4>
                  </div>
                  <p className={`text-[11px] leading-normal ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                    {step.desc}
                  </p>
                </div>

                <div className={`pt-3 mt-2 border-t ${isLight ? "border-slate-100" : "border-slate-800/30"}`}>
                  <button
                    onClick={step.action}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition duration-200 cursor-pointer border ${
                      isLight 
                        ? "bg-white hover:bg-slate-50 border-slate-250 hover:border-slate-350 text-slate-800 shadow-xs" 
                        : "bg-slate-950 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    {step.actionText} <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
