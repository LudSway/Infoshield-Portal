import React, { useState } from "react";
import { 
  Zap, 
  Layers, 
  Lock, 
  Database, 
  Cpu, 
  Compass, 
  TrendingUp, 
  Shield, 
  Terminal, 
  Code,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  Server,
  Cloud
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FutureScaleSimulatorProps {
  theme?: "light" | "dark";
  triggerBannerAlert: (msg: string) => void;
  currentBusiness?: {
    name: string;
    website?: string;
    nodeCount?: number;
    recordCount?: string;
    cloudProvider?: string;
  };
}

type HorizonLevel = "H1" | "H2" | "H3";

interface ScalingFeature {
  id: string;
  label: string;
  category: string;
  description: string;
  impactScore: number;
  unlockedAt: HorizonLevel;
}

export default function FutureScaleSimulator({
  theme = "dark",
  triggerBannerAlert,
  currentBusiness
}: FutureScaleSimulatorProps) {
  const isLight = theme === "light";

  // Card & Input themes matching InfoShield guidelines
  const c_card = isLight ? "bg-white border border-slate-200 text-slate-950 shadow-sm" : "bg-slate-900 border border-slate-800 text-slate-50 shadow-[0_4px_20px_rgba(0,0,0,0.3)]";
  const c_subcard = isLight ? "bg-slate-50 border border-slate-200 text-slate-900" : "bg-slate-950 border border-slate-850 text-slate-100";
  const c_input = isLight ? "bg-slate-50 border border-slate-200 text-slate-950 focus:border-cyan-500" : "bg-slate-950 border border-slate-850 text-slate-50 focus:border-cyan-500";
  const c_text = isLight ? "text-slate-800" : "text-slate-300";
  const c_muted = isLight ? "text-slate-500 font-sans" : "text-slate-400 font-sans";

  // State
  const [activeHorizon, setActiveHorizon] = useState<HorizonLevel>("H2");
  const [enabledToggles, setEnabledToggles] = useState<string[]>([
    "federated-sso", "cont-monitoring", "ml-parser"
  ]);

  // Static Features
  const scalingFeatures: ScalingFeature[] = [
    {
      id: "federated-sso",
      label: "Federated Identity (SAML 2.0 / OIDC)",
      category: "IAM Integration",
      description: "Secure federation to external IDPs (Okta, Azure AD) with hardware-backed WebAuthn keys.",
      impactScore: 15,
      unlockedAt: "H2"
    },
    {
      id: "cont-monitoring",
      label: "Continuous Controls Monitoring (CCM)",
      category: "GRC Automation",
      description: "Continuous compliance sweeps querying cloud provider APIs and generating evidence files in Firestore.",
      impactScore: 25,
      unlockedAt: "H2"
    },
    {
      id: "ml-parser",
      label: "ML-Powered Threat Pattern Detection",
      category: "SecOps Intelligence",
      description: "Low-latency streaming models identifying advanced multi-vector attack paths in SIEM raw logs.",
      impactScore: 20,
      unlockedAt: "H2"
    },
    {
      id: "biometric-auth",
      label: "Zero-Trust Cryptographic WebAuthn Passkeys",
      category: "IAM Integration",
      description: "Passwordless biometric entry completely mitigating phishing & credential hijacking threats.",
      impactScore: 20,
      unlockedAt: "H3"
    },
    {
      id: "auto-remediation",
      label: "Autonomous Incident Playbook Remediation",
      category: "SecOps Intelligence",
      description: "Gemini-powered runtime execution agents acting instantly to sandbox IP subnets & block leaked keys.",
      impactScore: 30,
      unlockedAt: "H3"
    },
    {
      id: "multi-cloud-mesh",
      label: "Multi-Cloud Mesh Architecture",
      category: "Infrastructure Resilience",
      description: "Active-Active synchronous data sharding across GCP, AWS & Azure clusters with sub-50ms failovers.",
      impactScore: 25,
      unlockedAt: "H3"
    }
  ];

  const handleToggleFeature = (id: string) => {
    if (enabledToggles.includes(id)) {
      setEnabledToggles(prev => prev.filter(t => t !== id));
    } else {
      setEnabledToggles(prev => [...prev, id]);
    }
  };

  // Calculations based on state
  const getHorizonDetails = (horizon: HorizonLevel) => {
    switch (horizon) {
      case "H1":
        return {
          title: "Horizon 1: Mid-Market Foundation",
          subtitle: "Current operational baseline for standard audits",
          throughput: "10,000 eps",
          database: "Single-Region Firestore Cluster",
          overhead: "Medium (24 hours/week manual reviews)",
          auditSpeed: "30 - 45 days",
          cost: "Standard operational runtime",
          description: "Our current implementation of InfoShield GRC & SecOps. It delivers a full-featured compliant baseline with localized event triggers and manual evidence collection checks."
        };
      case "H2":
        return {
          title: "Horizon 2: Global Enterprise Integration",
          subtitle: "Automated integrations & cross-system sharding",
          throughput: "250,000 eps",
          database: "Active-Standby Multi-Region Firestore DB",
          overhead: "Low (8 hours/week continuous alerts)",
          auditSpeed: "5 - 7 days",
          cost: "+35% server compute & routing cost",
          description: "Enterprise scale. Integrates live Active Directory, automated syslog ingress gateways, continuous security log forwarders, and real-time incident escalation endpoints."
        };
      case "H3":
        return {
          title: "Horizon 3: Autonomous Zero-Trust GRC",
          subtitle: "Visionary self-healing security mesh",
          throughput: ">1,500,000 eps",
          database: "Globally Distributed Synchronous Multi-Cloud Mesh",
          overhead: "Near Zero (Autonomous agent-monitored loops)",
          auditSpeed: "< 2 hours (Real-time Continuous Auditing)",
          cost: "+80% cloud infrastructure scaling budget",
          description: "Ultimate state. Leverages decentralized, peer-to-peer secure ledger entries, zero-trust cryptographic passkeys, and Gemini-driven autonomous containment agents."
        };
    }
  };

  const horizonData = getHorizonDetails(activeHorizon);

  // Calculate simulated indices
  const baseComplianceScore = activeHorizon === "H1" ? 68 : activeHorizon === "H2" ? 84 : 95;
  const toggleContributions = scalingFeatures
    .filter(f => enabledToggles.includes(f.id))
    .reduce((acc, f) => acc + f.impactScore, 0);

  const finalScore = Math.min(100, baseComplianceScore + Math.floor(toggleContributions * 0.3));
  const activeFeatureCount = enabledToggles.length;

  const getSlaTier = () => {
    if (activeHorizon === "H3" && activeFeatureCount >= 4) return "99.999% Zero-Downtime Guarantee";
    if (activeHorizon === "H2" || activeFeatureCount >= 3) return "99.99% High Availability SLA";
    return "99.9% Standard Service SLA";
  };

  // Generate Code Blueprint
  const generateBlueprint = () => {
    return JSON.stringify({
      version: "3.2.0-scale",
      targetBusiness: currentBusiness?.name || "InfoShield Enterprise Account",
      targetHorizon: activeHorizon === "H1" ? "Mid-Market" : activeHorizon === "H2" ? "Enterprise" : "Autonomous",
      slaCommitment: getSlaTier(),
      metrics: {
        throughputLimit: horizonData.throughput,
        storageEngine: horizonData.database,
        targetAuditDuration: horizonData.auditSpeed
      },
      activatedModules: scalingFeatures
        .filter(f => enabledToggles.includes(f.id) || f.unlockedAt === activeHorizon)
        .map(f => ({ id: f.id, module: f.label, category: f.category }))
    }, null, 2);
  };

  const copyBlueprintToClipboard = () => {
    navigator.clipboard.writeText(generateBlueprint());
    triggerBannerAlert("Scale blueprint copied successfully.");
  };

  return (
    <div className={`p-5 rounded-xl border space-y-6 ${c_card}`} id="future-scale-module">
      
      {/* Module Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-500 animate-pulse" />
            <h3 className="font-bold text-base font-mono uppercase tracking-tight">Opportunities for Future Scale & Roadmap Planner</h3>
          </div>
          <p className={`text-xs ${c_muted}`}>Simulate enterprise integration pathways, advanced GRC scaling architectures, and multi-cloud telemetry pipelines.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold bg-cyan-600/10 text-cyan-500 border border-cyan-500/20 px-2 py-1 rounded">
            SCALE: READY FOR ENTERPRISE
          </span>
        </div>
      </div>

      {/* Two Column Layout: Controls and Visual Simulators */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 Cols): Selection Controls */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Horizon Toggles */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wide flex items-center gap-1.5 text-cyan-500">
              <Compass className="h-3.5 w-3.5" /> 1. Select Scaling Horizon
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {(["H1", "H2", "H3"] as HorizonLevel[]).map(level => {
                const isSelected = activeHorizon === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      setActiveHorizon(level);
                      // Set default logical toggles based on level
                      if (level === "H1") {
                        setEnabledToggles([]);
                      } else if (level === "H2") {
                        setEnabledToggles(["federated-sso", "cont-monitoring", "ml-parser"]);
                      } else {
                        setEnabledToggles(["federated-sso", "cont-monitoring", "ml-parser", "biometric-auth", "auto-remediation"]);
                      }
                      triggerBannerAlert(`Switched simulation context to ${level === "H1" ? "Horizon 1" : level === "H2" ? "Horizon 2" : "Horizon 3"}.`);
                    }}
                    className={`p-3.5 rounded-xl border font-mono text-xs text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "border-cyan-500 bg-cyan-500/5 text-cyan-500 font-bold"
                        : isLight 
                          ? "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700" 
                          : "bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400"
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">
                      {level === "H1" ? "Baseline" : level === "H2" ? "Integration" : "Autonomous"}
                    </span>
                    <span className="text-xs truncate font-bold">
                      {level === "H1" ? "Horizon 1" : level === "H2" ? "Horizon 2" : "Horizon 3"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feature Add-ons Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wide flex items-center gap-1.5 text-cyan-500">
              <Cpu className="h-3.5 w-3.5" /> 2. Enable Advanced Modules & Microservices
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scalingFeatures.map(feature => {
                const isEnabled = enabledToggles.includes(feature.id);
                const isUnlockedInHorizon = activeHorizon === "H3" || 
                  (activeHorizon === "H2" && feature.unlockedAt !== "H3") ||
                  (feature.unlockedAt === "H1");

                return (
                  <div
                    key={feature.id}
                    onClick={() => {
                      if (isUnlockedInHorizon) {
                        handleToggleFeature(feature.id);
                      } else {
                        triggerBannerAlert(`Module requires ${feature.unlockedAt === "H2" ? "Horizon 2" : "Horizon 3"} scalability framework.`);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition duration-150 cursor-pointer flex flex-col justify-between ${
                      !isUnlockedInHorizon
                        ? "opacity-40 cursor-not-allowed bg-slate-950/20 border-slate-900"
                        : isEnabled
                          ? "border-cyan-500/60 bg-cyan-600/5 text-cyan-500"
                          : isLight ? "bg-slate-50 border-slate-200 hover:bg-slate-100/70" : "bg-slate-950/40 border-slate-850 hover:bg-slate-900"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-mono uppercase font-bold tracking-wider opacity-60">
                          {feature.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {!isUnlockedInHorizon && (
                            <span className="text-[8px] font-mono px-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded">
                              LOCKED ({feature.unlockedAt})
                            </span>
                          )}
                          <div className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                            isEnabled ? "bg-cyan-500 border-cyan-500 text-slate-950" : "border-slate-500"
                          }`}>
                            {isEnabled && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                      <h5 className="text-[11px] font-bold tracking-tight mb-1">{feature.label}</h5>
                      <p className={`text-[10px] leading-relaxed ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column (5 Cols): Live Architecture Metrics & Code Generation */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          
          {/* Live Projections & Metrics Dashboard */}
          <div className={`p-4 rounded-xl border space-y-3 flex-1 ${c_subcard}`}>
            <h4 className="text-xs font-mono font-bold uppercase text-cyan-500 tracking-wider flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-cyan-500" /> Architecture Projections
            </h4>

            {/* Current Active Horizon Highlight */}
            <div className="space-y-1 pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-500">
                Current Projected Target:
              </span>
              <h5 className="text-sm font-extrabold tracking-tight text-cyan-600 dark:text-cyan-400">
                {horizonData.title}
              </h5>
              <p className="text-[10px] leading-relaxed opacity-80 font-sans">
                {horizonData.description}
              </p>
            </div>

            {/* Simulated Live Metrics */}
            <div className="space-y-2 text-xs font-mono pt-1">
              
              {/* COMPLIANCE RATING */}
              <div>
                <div className="flex justify-between items-center text-[10px] mb-1">
                  <span className="text-slate-500 font-bold uppercase">Estimated Compliance Score:</span>
                  <span className="font-bold text-emerald-500">{finalScore}% Score</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${finalScore}%` }}
                  />
                </div>
              </div>

              {/* SLA TIER */}
              <div className="flex justify-between items-center border-b pb-2 border-slate-200 dark:border-slate-800 pt-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase">SLA Commitment:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{getSlaTier()}</span>
              </div>

              {/* TELEMETRY LIMITS */}
              <div className="flex justify-between items-center border-b pb-2 border-slate-200 dark:border-slate-800 pt-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase">Max Telemetry EPS:</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">{horizonData.throughput}</span>
              </div>

              {/* STORAGE TYPE */}
              <div className="flex justify-between items-center border-b pb-2 border-slate-200 dark:border-slate-800 pt-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase">Storage Strategy:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right truncate max-w-[170px]">{horizonData.database}</span>
              </div>

              {/* OVERHEAD */}
              <div className="flex justify-between items-center border-b pb-2 border-slate-200 dark:border-slate-800 pt-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase">Security Team Overhead:</span>
                <span className="font-bold text-amber-500">{horizonData.overhead}</span>
              </div>

              {/* AUDIT CLOSURE */}
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase">Audit Completion Speed:</span>
                <span className="font-bold text-emerald-500">{horizonData.auditSpeed}</span>
              </div>

            </div>
          </div>

          {/* Interactive Export Block */}
          <div className={`p-3 rounded-xl border font-mono text-[10px] leading-normal ${
            isLight ? "bg-slate-100 text-slate-700" : "bg-slate-950 text-slate-400"
          }`}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-bold text-slate-500 uppercase flex items-center gap-1">
                <Code className="h-3.5 w-3.5 text-cyan-500" /> Scale Blueprint YAML:
              </span>
              <button
                type="button"
                onClick={copyBlueprintToClipboard}
                className="text-cyan-600 hover:text-cyan-500 font-bold uppercase text-[9px] cursor-pointer flex items-center gap-1"
              >
                <Copy className="h-3 w-3" /> Copy Config
              </button>
            </div>
            <pre className="max-h-[110px] overflow-auto whitespace-pre leading-relaxed select-all scrollbar-thin">
              {generateBlueprint()}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
}
