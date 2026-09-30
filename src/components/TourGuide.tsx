import React from "react";
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle, HelpCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface TourStep {
  id: number;
  title: string;
  description: string;
  targetId?: string; // HTML element ID to highlight if visible
  tabToForce?: string; // Change parent tab to show the feature
}

interface TourGuideProps {
  currentStep: number;
  setStep: (step: number) => void;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: "Welcome to Infoshield Portal!",
    description: "Welcome to your newly streamlined cybersecurity command center. To maximize vertical space, we have consolidated the sidebar into 5 high-level accordion sections. Clicking any section dynamically expands to reveal its child tools!",
    tabToForce: "dashboard"
  },
  {
    id: 2,
    title: "Simplified View Toggle",
    description: "We have placed the 'Simplified View' toggle at the bottom of your sidebar. Activating this instant-toggle keeps your panels clean, hiding advanced system logs and terminal metrics for non-analyst sessions.",
    targetId: "simplified-toggle",
    tabToForce: "dashboard"
  },
  {
    id: 3,
    title: "Role-Based Access Control (RBAC)",
    description: "The portal implements strict RBAC rules. Switch between CISO, Security Engineer, Compliance Officer, and External Auditor roles using the integrated selector. Watch how the expanded accordion contents adjust dynamically!",
    targetId: "rbac-role-select",
    tabToForce: "dashboard"
  },
  {
    id: 4,
    title: "SOC: Vulnerability Scanner",
    description: "Let's explore the active vulnerabilities! When you click on the 'SOC Operations' accordion, it dynamically expands to reveal the 'Vulnerability Scanner' where you can patch container cluster CVEs with a single click.",
    targetId: "view-vulnerabilities",
    tabToForce: "vulnerabilities"
  },
  {
    id: 5,
    title: "SOC: AI-Threat Forensics",
    description: "Need help investigating a payload? The 'SIEM Logs' tab is nested under the SOC Operations accordion. Pick any packet on the left and select 'Analyze with AI Threat Detection' for real-time playbooks powered by Gemini AI.",
    targetId: "view-siem",
    tabToForce: "siem"
  },
  {
    id: 6,
    title: "Simulations: Cyber Tabletop Game",
    description: "Ready to test your response leadership? Under the 'Simulations & Training' accordion, you will find our interactive 'Tabletop Scenarios'. Test different responses to active mock threat injects and lower your real-time risk exposure score!",
    targetId: "view-tabletop",
    tabToForce: "tabletop"
  }
];

export default function TourGuide({
  currentStep,
  setStep,
  onClose,
  activeTab,
  setActiveTab
}: TourGuideProps) {
  const stepData = TOUR_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const nextStep = TOUR_STEPS[currentStep + 1];
      if (nextStep.tabToForce) {
        setActiveTab(nextStep.tabToForce);
      }
      setStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = TOUR_STEPS[currentStep - 1];
      if (prevStep.tabToForce) {
        setActiveTab(prevStep.tabToForce);
      }
      setStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-1" id="tour-guide-widget">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        className="bg-slate-900 border-2 border-cyan-500/40 rounded-2xl shadow-[0_10px_40px_rgba(6,182,212,0.25)] overflow-hidden"
      >
        {/* Banner header */}
        <div className="bg-gradient-to-r from-cyan-950 to-slate-900 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-cyan-500/15 flex items-center justify-center border border-cyan-500/30">
              <Sparkles className="h-4 w-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest leading-none">Interactive Tour</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Step {currentStep + 1} of {TOUR_STEPS.length}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="Skip Tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              {stepData.title}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {stepData.description}
            </p>
          </div>

          {stepData.targetId && (
            <div className="p-2 bg-slate-950/60 border border-cyan-500/10 rounded-lg text-[10px] font-mono text-cyan-400/80 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              Target Element: <code className="text-slate-200 font-bold bg-slate-900 px-1 py-0.2 rounded">#{stepData.targetId}</code> is active!
            </div>
          )}

          {/* Progress dots bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
            <div className="flex gap-1">
              {TOUR_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all ${
                    idx === currentStep ? "w-4 bg-cyan-400" : "w-1 bg-slate-700"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2 text-xs font-semibold">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-3.5 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer font-bold"
              >
                {currentStep === TOUR_STEPS.length - 1 ? (
                  <>Finish <CheckCircle className="h-3.5 w-3.5" /></>
                ) : (
                  <>Next <ArrowRight className="h-3.5 w-3.5" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
