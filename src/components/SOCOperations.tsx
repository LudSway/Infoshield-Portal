import React from "react";
import { 
  Shield, 
  Radio, 
  Server, 
  Lock, 
  RefreshCw, 
  Bell 
} from "lucide-react";
import { UserRole } from "../types";

export interface SOCOperationsProps {
  theme: string;
  activeRole: UserRole;
  simplifiedMode: boolean;
  incidents: any[];
  remediateIncidentTicket: (id: string, title: string) => void;
  setActiveTab: (tab: string) => void;
  isLoading: boolean;
  handleTriggerDRBackup: () => void;
  haInfrastructure: any;
  handleCreateAlertRule: (e: React.FormEvent) => void;
  customAlertText: string;
  setCustomAlertText: (val: string) => void;
  alertRules: any[];
  setAlertRules: React.Dispatch<React.SetStateAction<any[]>>;
  triggerBannerAlert: (msg: string) => void;
  handleSimulateThreat: (attackType: string) => void;
  currentBusiness?: any;
}

export const SOCOperations: React.FC<SOCOperationsProps> = ({
  theme,
  activeRole,
  simplifiedMode,
  incidents,
  remediateIncidentTicket,
  setActiveTab,
  isLoading,
  handleTriggerDRBackup,
  haInfrastructure,
  handleCreateAlertRule,
  customAlertText,
  setCustomAlertText,
  alertRules,
  setAlertRules,
  triggerBannerAlert,
  handleSimulateThreat,
  currentBusiness,
}) => {
  const isLight = theme === "light";
  const isLiveEnvironment = !!(
    currentBusiness && 
    currentBusiness.name !== "Enterprise Security Target" && 
    currentBusiness.website !== "https://regintel-africa.web.app"
  );
  const c_card = isLight ? "bg-white border border-slate-200 text-slate-950 shadow-sm" : "bg-slate-900 border border-slate-800 text-slate-50";
  const c_subcard = isLight ? "bg-slate-50 border border-slate-200 text-slate-900" : "bg-slate-950 border border-slate-800 text-slate-100";
  const c_input = isLight ? "bg-slate-50 border border-slate-200 text-slate-950 focus:border-cyan-500" : "bg-slate-950 border border-slate-850 text-slate-50 focus:border-cyan-500";

  return (
    <div className="space-y-6" id="view-soc-operations">
      {/* Header Banner */}
      <div className={`p-5 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${c_card}`}>
        <div>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}>
            <Radio className="h-5 w-5 text-cyan-500 animate-pulse" /> Security Operations Center (SOC) Console
          </h2>
          <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            Active threat telemetry, real-time packet ingress analysis, {isLiveEnvironment ? "production domain vulnerability vectors" : "live sandboxed attack simulations"}, and security connector states.
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-bold ${
          isLight ? "bg-red-50 text-red-700 border-red-200" : "bg-red-500/10 text-red-400 border-red-500/20"
        }`}>
          <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
          LIVE INGRESS ACTIVE
        </div>
      </div>

      {/* Middle Section: SIEM Traffic Visualizer & Actionable Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Global Traffic & AI Threat Heatmap */}
        <div className={`lg:col-span-2 rounded-xl p-5 flex flex-col ${c_card}`} id="dashboard-heatmap-panel">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className={`font-bold text-sm flex items-center gap-2 ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                <span className="h-2 w-2 rounded-full bg-cyan-500 animate-ping" />
                Live Security Event Traffic Ingress Mesh
              </h3>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>Real-time packet audit flow matching active high-availability nodes</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono px-2.5 py-1 rounded border ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-slate-950 border-slate-850 text-slate-400"
              }`}>
                14,240 events/sec
              </span>
            </div>
          </div>

          {/* High Quality Visualization Stage */}
          <div className={`flex-1 rounded-lg p-4 border relative min-h-[320px] overflow-hidden flex flex-col justify-between ${
            isLight ? "bg-slate-50/70 border-slate-200" : "bg-slate-950 border-slate-850"
          }`}>
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-[size:14px_24px]" style={{ "--grid-color": isLight ? "#94a3b8" : "#1e293b" } as React.CSSProperties} />
            
            <div className="relative flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-2">
              {/* Radar visual column */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <div className={`w-32 h-32 border rounded-full flex items-center justify-center animate-pulse relative ${
                  isLight ? "border-cyan-500/30" : "border-cyan-500/25"
                }`}>
                  <div className={`w-24 h-24 border rounded-full flex items-center justify-center ${
                    isLight ? "border-cyan-500/40" : "border-cyan-500/40"
                  }`}>
                    <div className={`w-16 h-16 border rounded-full flex items-center justify-center ${
                      isLight ? "border-cyan-500/50" : "border-cyan-500/60"
                    }`}>
                      <Shield className={`h-6 w-6 ${isLight ? "text-cyan-600" : "text-cyan-400"} animate-spin`} style={{ animationDuration: "10s" }} />
                    </div>
                  </div>
                  {/* Interactive Ingress Blips */}
                  <span className="absolute top-2 left-6 h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_8px_#f87171] animate-bounce" />
                  <span className="absolute bottom-6 right-3 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                  <span className="absolute top-1/2 right-1 h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-ping" style={{ animationDuration: "3s" }} />
                </div>
                <p className={`mt-3 font-mono text-[9px] uppercase tracking-wider font-bold text-center ${isLight ? "text-cyan-700" : "text-cyan-400"}`}>Active AI Threat Guard</p>
              </div>

              {/* Simulator controls column */}
              <div className="md:col-span-7 space-y-2 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4 border-slate-800/40">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-500 block">
                  {isLiveEnvironment ? "Active Target Threat Injector" : "Sandbox Threat Injector"}
                </span>
                <p className="text-[10.5px] text-slate-500 leading-normal">
                  Click to inject a live cyber attack log and trigger corresponding real-time incidents:
                </p>
                <div className="grid grid-cols-1 gap-1.5 pt-1">
                  <button
                    onClick={() => handleSimulateThreat("SSH Brute Force")}
                    className={`px-2.5 py-1.5 rounded-md border text-left text-[11px] font-sans font-medium transition cursor-pointer flex items-center justify-between ${
                      isLight 
                        ? "bg-white hover:bg-red-50 hover:border-red-200 border-slate-200 text-slate-700" 
                        : "bg-slate-900/60 hover:bg-red-950/25 hover:border-red-500/30 border-slate-800 text-slate-200"
                    }`}
                  >
                    <span>🔑 SSH Brute Force</span>
                    <span className="text-[9px] font-mono text-red-500 font-bold uppercase">HIGH</span>
                  </button>
                  <button
                    onClick={() => handleSimulateThreat("SQL Injection (SQLi)")}
                    className={`px-2.5 py-1.5 rounded-md border text-left text-[11px] font-sans font-medium transition cursor-pointer flex items-center justify-between ${
                      isLight 
                        ? "bg-white hover:bg-red-50 hover:border-red-200 border-slate-200 text-slate-700" 
                        : "bg-slate-900/60 hover:bg-red-950/25 hover:border-red-500/30 border-slate-800 text-slate-200"
                    }`}
                  >
                    <span>💉 SQL Injection (SQLi)</span>
                    <span className="text-[9px] font-mono text-red-500 font-bold uppercase">CRITICAL</span>
                  </button>
                  <button
                    onClick={() => handleSimulateThreat("DDoS Traffic Spike")}
                    className={`px-2.5 py-1.5 rounded-md border text-left text-[11px] font-sans font-medium transition cursor-pointer flex items-center justify-between ${
                      isLight 
                        ? "bg-white hover:bg-red-50 hover:border-red-200 border-slate-200 text-slate-700" 
                        : "bg-slate-900/60 hover:bg-red-950/25 hover:border-red-500/30 border-slate-800 text-slate-200"
                    }`}
                  >
                    <span>💥 Volumetric DDoS Spike</span>
                    <span className="text-[9px] font-mono text-orange-500 font-bold uppercase">HIGH</span>
                  </button>
                  <button
                    onClick={() => handleSimulateThreat("Malware / Ransomware")}
                    className={`px-2.5 py-1.5 rounded-md border text-left text-[11px] font-sans font-medium transition cursor-pointer flex items-center justify-between ${
                      isLight 
                        ? "bg-white hover:bg-red-50 hover:border-red-200 border-slate-200 text-slate-700" 
                        : "bg-slate-900/60 hover:bg-red-950/25 hover:border-red-500/30 border-slate-800 text-slate-200"
                    }`}
                  >
                    <span>🛡️ Ransomware Heuristic</span>
                    <span className="text-[9px] font-mono text-red-500 font-bold uppercase">CRITICAL</span>
                  </button>
                  <button
                    onClick={() => handleSimulateThreat("Port Scan Check")}
                    className={`px-2.5 py-1.5 rounded-md border text-left text-[11px] font-sans font-medium transition cursor-pointer flex items-center justify-between ${
                      isLight 
                        ? "bg-white hover:bg-amber-50 hover:border-amber-200 border-slate-200 text-slate-700" 
                        : "bg-slate-900/60 hover:bg-amber-950/25 hover:border-amber-500/30 border-slate-800 text-slate-200"
                    }`}
                  >
                    <span>🔍 TCP Port Recon scan</span>
                    <span className="text-[9px] font-mono text-amber-500 font-bold uppercase">MEDIUM</span>
                  </button>
                </div>
              </div>
            </div>

            <div className={`relative pt-3 flex flex-wrap gap-4 items-center justify-between text-xs border-t ${
              isLight ? "border-slate-200 text-slate-600" : "border-slate-800/60 text-slate-400"
            }`}>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${
                isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
              }`}>
                <span className="text-slate-500 font-mono">NODE-01:</span>
                <span className={`font-mono font-bold ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>STABLE (14ms)</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${
                isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
              }`}>
                <span className="text-slate-500 font-mono">REDUNDANCY INGRESS:</span>
                <span className={`font-mono font-bold ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>3 COPIES ONLINE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Incidents Right Panel */}
        <div className={`rounded-xl p-5 flex flex-col justify-between ${c_card}`} id="dashboard-incidents-panel">
          <div>
            <h3 className={`font-bold text-sm mb-1 uppercase tracking-tight font-mono ${isLight ? "text-slate-900" : "text-slate-200"}`}>Priority Incident Feed</h3>
            <p className={`text-xs mb-4 ${isLight ? "text-slate-500" : "text-slate-400"}`}>Latest critical exceptions parsed from central SIEM broker</p>
          </div>

          <div className="flex-1 space-y-3.5 max-h-[310px] overflow-y-auto pr-1">
            {incidents.slice(0, 3).map((inc) => (
              <div 
                key={inc.id} 
                className={`p-3.5 rounded-lg border flex flex-col justify-between gap-2.5 transition ${
                  inc.status === "RESOLVED" || inc.status === "CONTAINED"
                    ? isLight 
                      ? "bg-emerald-50/50 border-emerald-100 text-slate-500 opacity-80"
                      : "bg-emerald-950/20 border-emerald-950 text-slate-400 opacity-60"
                    : inc.severity === "CRITICAL"
                    ? isLight
                      ? "bg-red-50/70 border-red-200/60"
                      : "bg-red-505/5 border-red-500/20"
                    : isLight
                    ? "bg-slate-50 border-slate-150 text-slate-800"
                    : "bg-slate-950 border-slate-850"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono font-extrabold text-slate-500">{inc.id}</span>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    inc.status === "CONTAINED" || inc.status === "RESOLVED"
                      ? isLight 
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : inc.severity === "CRITICAL"
                      ? isLight
                        ? "bg-red-100 text-red-800 border border-red-200 animate-pulse"
                        : "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse"
                      : isLight
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {inc.status}
                  </span>
                </div>

                <div>
                  <p className={`text-xs font-bold line-clamp-1 ${isLight ? "text-slate-900" : "text-slate-200"}`}>{inc.title}</p>
                  <p className={`text-[11px] mt-0.5 line-clamp-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>{inc.description}</p>
                </div>

                <div className={`flex items-center justify-between text-[10px] font-mono pt-1 border-t ${
                  isLight ? "border-slate-200/60" : "border-slate-800/40"
                }`}>
                  <span className="text-slate-500">Assigned: {inc.assignedTo}</span>
                  {(inc.status !== "CONTAINED" && inc.status !== "RESOLVED") && (
                    <button
                      onClick={() => remediateIncidentTicket(inc.id, inc.title)}
                      className={`font-bold px-2 py-1 rounded transition text-[9px] uppercase border cursor-pointer ${
                        isLight
                          ? "bg-red-100 hover:bg-red-600 text-red-800 hover:text-white border-red-200"
                          : "bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-slate-950 border-red-500/25"
                      }`}
                    >
                      Auto-Remediate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setActiveTab("incidents")}
            className={`mt-4 text-xs font-mono font-bold transition text-center block w-full py-2 rounded-lg border cursor-pointer ${
              isLight
                ? "bg-slate-100 hover:bg-slate-200 border-slate-200 hover:border-slate-300 text-cyan-700"
                : "bg-slate-950/40 border-slate-850 hover:border-slate-800 text-cyan-400 hover:text-cyan-300"
            }`}
          >
            View All Incident Workflows →
          </button>
        </div>
      </div>

      {/* Bottom Section: Integration Mesh & Immutable Backup */}
      {!simplifiedMode && (
        <div className={`rounded-xl p-5 ${c_card}`} id="integration-mesh-block">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h3 className={`text-xs font-bold font-mono uppercase tracking-widest flex items-center gap-1.5 ${isLight ? "text-slate-800" : "text-slate-400"}`}>
                <Server className={`h-4 w-4 ${isLight ? "text-cyan-600" : "text-cyan-400"}`} /> High Availability Infrastructure Integration Mesh
              </h3>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>Continuous diagnostic latency & encryption audits of existing security connectors</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                id="trigger-dr-snapshot-btn"
                onClick={handleTriggerDRBackup}
                disabled={isLoading}
                className="text-xs bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-3.5 py-1.5 rounded transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {isLoading ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Lock className="h-3 w-3" />
                )}
                Trigger Encrypted Snapshot Backup
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
            <div className={`p-3 rounded-lg flex items-center gap-3 ${c_subcard}`}>
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
              <div>
                <p className={`text-[10px] font-mono font-bold uppercase ${isLight ? "text-slate-700" : "text-slate-300"}`}>AWS CloudWatch</p>
                <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-550"}`}>Latency: 4ms</p>
              </div>
            </div>

            <div className={`p-3 rounded-lg flex items-center gap-3 ${c_subcard}`}>
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
              <div>
                <p className={`text-[10px] font-mono font-bold uppercase ${isLight ? "text-slate-700" : "text-slate-300"}`}>Okta MFA Core</p>
                <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-550"}`}>Status: Enforced</p>
              </div>
            </div>

            <div className={`p-3 rounded-lg flex items-center gap-3 ${c_subcard}`}>
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
              <div>
                <p className={`text-[10px] font-mono font-bold uppercase ${isLight ? "text-slate-700" : "text-slate-300"}`}>Kubernetes Ingress</p>
                <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-550"}`}>Pods: 142/142 Sync</p>
              </div>
            </div>

            <div className={`p-3 rounded-lg flex items-center gap-3 ${c_subcard}`}>
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
              <div>
                <p className={`text-[10px] font-mono font-bold uppercase ${isLight ? "text-slate-700" : "text-slate-300"}`}>Elastic SIEM</p>
                <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-550"}`}>Last Sync: &lt;1s</p>
              </div>
            </div>

            <div className={`p-3 rounded-lg flex items-center gap-3 ${c_subcard}`}>
              <span className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
              <div>
                <p className={`text-[10px] font-mono font-bold uppercase ${isLight ? "text-slate-700" : "text-slate-300"}`}>Encrypted Backup</p>
                <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-550"}`}>Daily 02:00 GMT</p>
              </div>
            </div>

            <div className={`p-3 rounded-lg flex items-center gap-3 ${c_subcard}`}>
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
              <div>
                <p className={`text-[10px] font-mono font-bold uppercase ${isLight ? "text-slate-700" : "text-slate-300"}`}>S3 Storage</p>
                <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-550"}`}>AES-256 Enabled</p>
              </div>
            </div>
          </div>

          {/* Live Node Metrics Subsection */}
          <div className={`mt-5 pt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono border-t ${
            isLight ? "border-slate-200" : "border-slate-850"
          }`}>
            <div className={`p-3 rounded-lg ${c_subcard}`}>
              <span className="text-slate-500">Active Load Balancer:</span>
              <p className={`font-bold mt-0.5 ${isLight ? "text-slate-800" : "text-slate-200"}`}>{haInfrastructure.loadBalancer}</p>
            </div>
            <div className={`p-3 rounded-lg ${c_subcard}`}>
              <span className="text-slate-500">DR Sync Target Site:</span>
              <p className={`font-bold mt-0.5 ${isLight ? "text-slate-800" : "text-slate-200"}`}>{haInfrastructure.activeDisasterRecoverySite}</p>
            </div>
            <div className={`p-3 rounded-lg ${c_subcard}`}>
              <span className="text-slate-500">Cross-Region DB Lag:</span>
              <p className={`font-bold mt-0.5 ${isLight ? "text-cyan-700" : "text-cyan-400"}`}>{haInfrastructure.databaseReplicationLag}</p>
            </div>
            <div className={`p-3 rounded-lg ${c_subcard}`}>
              <span className="text-slate-500">Composite Uptime Score:</span>
              <p className={`font-bold mt-0.5 ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>{haInfrastructure.currentUptimeOverall}</p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alerts Threshold Manager */}
      {!simplifiedMode && (
        <div className={`rounded-xl p-5 ${c_card}`} id="dashboard-custom-alerts">
          <h3 className={`text-sm font-bold font-mono mb-3 uppercase tracking-wider flex items-center gap-1.5 ${isLight ? "text-slate-800" : "text-slate-200"}`}>
            <Bell className={`h-4 w-4 ${isLight ? "text-cyan-600" : "text-cyan-400"}`} /> Configure Dynamic Alert Threshold Rules
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create New Trigger */}
            <form onSubmit={handleCreateAlertRule} className={`p-4 rounded-xl ${c_subcard}`}>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 font-mono mb-1.5 uppercase">Trigger/Alert Match Text</label>
                <input 
                  type="text" 
                  value={customAlertText}
                  onChange={(e) => setCustomAlertText(e.target.value)}
                  placeholder="e.g. Host CPU threshold exceeded on Node 03"
                  className={`w-full rounded px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 ${c_input}`}
                />
              </div>
              <button
                type="submit"
                className={`w-full font-semibold py-2 rounded text-xs transition cursor-pointer mt-3.5 ${
                  isLight
                    ? "bg-slate-800 hover:bg-slate-900 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-100"
                }`}
              >
                Register Live Notification Rule
              </button>
            </form>

            {/* Active Alert Rules Monitor */}
            <div className="lg:col-span-2 space-y-2">
              <p className={`text-xs font-mono uppercase tracking-widest ${isLight ? "text-slate-500" : "text-slate-400"}`}>Active Alarm Triggers</p>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2">
                {alertRules.map((rule) => (
                  <div key={rule.id} className={`flex items-center justify-between p-3 rounded-lg text-xs font-mono ${c_subcard}`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${rule.enabled ? "bg-emerald-500" : "bg-slate-600 animate-pulse"}`} />
                      <div>
                        <p className={`font-bold ${isLight ? "text-slate-800" : "text-slate-200"}`}>{rule.name}</p>
                        <p className="text-[10px] text-slate-500">Metric Condition: {rule.metric} | Integrations: {rule.channel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-2 py-0.5 rounded ${
                        rule.severity === "CRITICAL" 
                          ? isLight 
                            ? "bg-red-50 text-red-700 border border-red-200" 
                            : "bg-red-500/10 text-red-400 border border-red-500/25" 
                          : isLight
                          ? "bg-slate-100 text-slate-600"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {rule.severity}
                      </span>
                      <button 
                        onClick={() => {
                          setAlertRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r));
                          triggerBannerAlert(`Toggled rule execution status for alert ID: ${rule.id}`);
                        }}
                        className={`text-[10px] border px-2 py-1 rounded transition cursor-pointer ${
                          isLight
                            ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
                            : "bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
                        }`}
                      >
                        {rule.enabled ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
