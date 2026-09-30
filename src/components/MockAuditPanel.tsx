import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  CheckCircle2,
  FileCheck,
  FileText,
  Search,
  RotateCcw,
  ClipboardList,
  AlertTriangle,
  FileQuestion,
  HelpCircle,
  FileCode,
  CheckSquare,
  BookOpen,
  ArrowRight,
  Info,
  ChevronRight,
  Sparkles,
  Download
} from "lucide-react";
import { 
  ISO_27001_CLAUSES, 
  ISO_27001_CONTROLS, 
  PCI_DSS_REQS, 
  PCI_DSS_SUB_CONTROLS, 
  AuditItem 
} from "../data/mockAuditData";

interface MockAuditPanelProps {
  theme?: "light" | "dark";
  activeRole: string;
  triggerBannerAlert: (msg: string) => void;
}

export default function MockAuditPanel({
  theme = "dark",
  activeRole,
  triggerBannerAlert
}: MockAuditPanelProps) {
  const isLight = theme === "light";

  // Persistent States
  const [readyDocs, setReadyDocs] = useState<string[]>([]);
  const [readyEvidence, setReadyEvidence] = useState<string[]>([]);
  const [auditNotes, setAuditNotes] = useState<Record<string, string>>({});

  // Navigation / Filter States
  const [selectedStandard, setSelectedStandard] = useState<"ISO-27001" | "PCI-DSS">("ISO-27001");
  const [selectedType, setSelectedType] = useState<"all" | "clause" | "control">("all");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "ready" | "pending">("all");

  // Load state from LocalStorage on mount
  useEffect(() => {
    try {
      const storedDocs = localStorage.getItem("infoshield_audit_docs");
      const storedEvidence = localStorage.getItem("infoshield_audit_evidence");
      const storedNotes = localStorage.getItem("infoshield_audit_notes");

      if (storedDocs) setReadyDocs(JSON.parse(storedDocs));
      if (storedEvidence) setReadyEvidence(JSON.parse(storedEvidence));
      if (storedNotes) setAuditNotes(JSON.parse(storedNotes));
    } catch (e) {
      console.error("Failed to load audit state from localStorage", e);
    }
  }, []);

  // Save states helper
  const saveState = (docs: string[], evidence: string[], notes: Record<string, string>) => {
    localStorage.setItem("infoshield_audit_docs", JSON.stringify(docs));
    localStorage.setItem("infoshield_audit_evidence", JSON.stringify(evidence));
    localStorage.setItem("infoshield_audit_notes", JSON.stringify(notes));
  };

  // Compile active standard lists
  const currentItems: AuditItem[] = selectedStandard === "ISO-27001" 
    ? [...ISO_27001_CLAUSES, ...ISO_27001_CONTROLS] 
    : [...PCI_DSS_REQS, ...PCI_DSS_SUB_CONTROLS];

  // Auto-select first item on standard change or mount
  useEffect(() => {
    if (currentItems.length > 0) {
      // Find first item that matches filters if current selected is not in list
      const matches = currentItems.filter(item => {
        const typeMatch = selectedType === "all" || item.type === selectedType;
        const textMatch = searchQuery === "" || 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return typeMatch && textMatch;
      });
      if (matches.length > 0 && !matches.some(m => m.id === selectedItemId)) {
        setSelectedItemId(matches[0].id);
      }
    }
  }, [selectedStandard, selectedType, searchQuery]);

  // Is an item fully ready? (both document and evidence checked)
  const isItemFullyReady = (id: string) => {
    return readyDocs.includes(id) && readyEvidence.includes(id);
  };

  const isItemPartiallyReady = (id: string) => {
    return readyDocs.includes(id) || readyEvidence.includes(id);
  };

  // Progress Calculations
  const getProgressStats = (standard: "ISO-27001" | "PCI-DSS") => {
    const items = standard === "ISO-27001" 
      ? [...ISO_27001_CLAUSES, ...ISO_27001_CONTROLS] 
      : [...PCI_DSS_REQS, ...PCI_DSS_SUB_CONTROLS];
    
    const clauses = items.filter(i => i.type === "clause");
    const controls = items.filter(i => i.type === "control");

    const readyClausesCount = clauses.filter(i => isItemFullyReady(i.id)).length;
    const readyControlsCount = controls.filter(i => isItemFullyReady(i.id)).length;
    const totalReadyCount = items.filter(i => isItemFullyReady(i.id)).length;

    const readyDocsCount = items.filter(i => readyDocs.includes(i.id)).length;
    const readyEvCount = items.filter(i => readyEvidence.includes(i.id)).length;

    const overallPercentage = items.length > 0 ? Math.round((totalReadyCount / items.length) * 100) : 0;
    const docPercentage = items.length > 0 ? Math.round((readyDocsCount / items.length) * 100) : 0;
    const evPercentage = items.length > 0 ? Math.round((readyEvCount / items.length) * 100) : 0;

    return {
      total: items.length,
      ready: totalReadyCount,
      percentage: overallPercentage,
      docPercentage,
      evPercentage,
      clausesTotal: clauses.length,
      clausesReady: readyClausesCount,
      controlsTotal: controls.length,
      controlsReady: readyControlsCount
    };
  };

  const isoStats = getProgressStats("ISO-27001");
  const pciStats = getProgressStats("PCI-DSS");

  const currentStats = selectedStandard === "ISO-27001" ? isoStats : pciStats;

  // Toggle handlers
  const handleToggleDoc = (id: string) => {
    if (activeRole === "Auditor") {
      triggerBannerAlert("ACCESS DENIED: Auditors have read-only access to audit checklists.");
      return;
    }
    const updated = readyDocs.includes(id)
      ? readyDocs.filter(item => item !== id)
      : [...readyDocs, id];
    setReadyDocs(updated);
    saveState(updated, readyEvidence, auditNotes);
    
    // Notify user
    const item = currentItems.find(i => i.id === id);
    if (item) {
      const isNowChecked = updated.includes(id);
      if (isNowChecked && readyEvidence.includes(id)) {
        triggerBannerAlert(`COMPLIANT: ${item.code} is now marked as FULLY AUDIT READY!`);
      } else {
        triggerBannerAlert(`${isNowChecked ? "Document Marked Ready" : "Document Removed"} for ${item.code}`);
      }
    }
  };

  const handleToggleEvidence = (id: string) => {
    if (activeRole === "Auditor") {
      triggerBannerAlert("ACCESS DENIED: Auditors have read-only access to audit checklists.");
      return;
    }
    const updated = readyEvidence.includes(id)
      ? readyEvidence.filter(item => item !== id)
      : [...readyEvidence, id];
    setReadyEvidence(updated);
    saveState(readyDocs, updated, auditNotes);

    // Notify user
    const item = currentItems.find(i => i.id === id);
    if (item) {
      const isNowChecked = updated.includes(id);
      if (isNowChecked && readyDocs.includes(id)) {
        triggerBannerAlert(`COMPLIANT: ${item.code} is now marked as FULLY AUDIT READY!`);
      } else {
        triggerBannerAlert(`${isNowChecked ? "Evidence Gathered & Checked" : "Evidence Removed"} for ${item.code}`);
      }
    }
  };

  const handleToggleItemMaster = (id: string) => {
    if (activeRole === "Auditor") {
      triggerBannerAlert("ACCESS DENIED: Auditors have read-only access to audit checklists.");
      return;
    }
    const fullyReady = isItemFullyReady(id);
    let updatedDocs = [...readyDocs];
    let updatedEv = [...readyEvidence];

    if (fullyReady) {
      // Mark as unready
      updatedDocs = updatedDocs.filter(item => item !== id);
      updatedEv = updatedEv.filter(item => item !== id);
      triggerBannerAlert(`Reset preparedness status for ${id}`);
    } else {
      // Mark as fully ready
      if (!updatedDocs.includes(id)) updatedDocs.push(id);
      if (!updatedEv.includes(id)) updatedEv.push(id);
      triggerBannerAlert(`SUCCESS: Marked item ${id} as fully compliant (Document & Evidence both ready)`);
    }

    setReadyDocs(updatedDocs);
    setReadyEvidence(updatedEv);
    saveState(updatedDocs, updatedEv, auditNotes);
  };

  const handleSaveNotes = (id: string, notes: string) => {
    const updated = { ...auditNotes, [id]: notes };
    setAuditNotes(updated);
    saveState(readyDocs, readyEvidence, updated);
  };

  const handleResetAudit = () => {
    if (activeRole === "Auditor") {
      triggerBannerAlert("ACCESS DENIED: Auditors cannot modify audit parameters.");
      return;
    }
    if (window.confirm("Are you sure you want to reset all mock audit readiness data? This will clear all checked documents, evidence, and custom notes for both ISO 27001 and PCI DSS.")) {
      setReadyDocs([]);
      setReadyEvidence([]);
      setAuditNotes({});
      saveState([], [], {});
      triggerBannerAlert("Successfully reset and cleared all mock audit records.");
    }
  };

  const handleQuickCompleteStandard = () => {
    if (activeRole === "Auditor") {
      triggerBannerAlert("ACCESS DENIED: Auditors cannot modify audit checklists.");
      return;
    }
    const allIds = currentItems.map(item => item.id);
    setReadyDocs(prev => Array.from(new Set([...prev, ...allIds])));
    setReadyEvidence(prev => Array.from(new Set([...prev, ...allIds])));
    
    const updatedDocs = Array.from(new Set([...readyDocs, ...allIds]));
    const updatedEv = Array.from(new Set([...readyEvidence, ...allIds]));
    saveState(updatedDocs, updatedEv, auditNotes);
    
    triggerBannerAlert(`DEMO SPEED-UP: Simulated full audit preparation compliance for ${selectedStandard}. All items marked as READY!`);
  };

  // Download Mock Audit Report
  const handleExportMockAuditReport = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Standard,Type,Code,Title,Document Required,Document Ready,Evidence To Present,Evidence Ready,Overall Status,Notes\n";

      const allItemsReport = [
        ...ISO_27001_CLAUSES,
        ...ISO_27001_CONTROLS,
        ...PCI_DSS_REQS,
        ...PCI_DSS_SUB_CONTROLS
      ];

      allItemsReport.forEach(item => {
        const docOk = readyDocs.includes(item.id) ? "YES" : "NO";
        const evOk = readyEvidence.includes(item.id) ? "YES" : "NO";
        const totalOk = isItemFullyReady(item.id) ? "AUDIT_READY" : "PENDING";
        const note = (auditNotes[item.id] || "").replace(/"/g, '""');

        const row = [
          item.standard,
          item.type.toUpperCase(),
          `"${item.code}"`,
          `"${item.title.replace(/"/g, '""')}"`,
          `"${item.documentRequired.replace(/"/g, '""')}"`,
          docOk,
          `"${item.evidenceToPresent.replace(/"/g, '""')}"`,
          evOk,
          totalOk,
          `"${note}"`
        ].join(",");
        csvContent += row + "\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `InfoShield_Mock_Audit_Report_${selectedStandard}_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      triggerBannerAlert("Successfully downloaded full mock audit readiness CSV workbook.");
    } catch (err) {
      console.error(err);
      triggerBannerAlert("Failed to generate CSV export.");
    }
  };

  // Filtered List compilation
  const filteredItems = currentItems.filter((item) => {
    const typeMatch = selectedType === "all" || item.type === selectedType;
    
    const textMatch = searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const isFullyOk = isItemFullyReady(item.id);
    let statusMatch = true;
    if (statusFilter === "ready") statusMatch = isFullyOk;
    if (statusFilter === "pending") statusMatch = !isFullyOk;

    return typeMatch && textMatch && statusMatch;
  });

  // Fetch active item details
  const activeItem = currentItems.find(i => i.id === selectedItemId) || filteredItems[0] || currentItems[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Overview */}
      <div className={`p-6 rounded-xl border flex flex-col xl:flex-row gap-6 items-center justify-between ${
        isLight ? "bg-white border-slate-200 text-slate-950 shadow-sm" : "bg-slate-900 border-slate-850 text-slate-50"
      }`}>
        <div className="space-y-1 text-center xl:text-left max-w-xl">
          <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2.5">
            <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">
              Compliance Module
            </span>
            <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">
              ISO 27001:2022 & PCI DSS V4.0
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight font-sans">
            Mock Audit Readiness & Evidence Tracker
          </h2>
          <p className="text-xs text-slate-400">
            Select standard clauses or physical controls, review compliance checklists, verify drafting documentation, and assemble inspection-ready evidence files.
          </p>
        </div>

        {/* Global Progress Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          {/* ISO Circular Gauge */}
          <div className={`p-4 rounded-xl border flex items-center gap-4 ${
            isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-slate-850"
          }`}>
            <div className="relative flex items-center justify-center w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="34" strokeWidth="5" stroke={isLight ? "#e2e8f0" : "#111827"} fill="transparent" />
                <circle cx="40" cy="40" r="34" strokeWidth="5" stroke="#06b6d4" fill="transparent" 
                        strokeDasharray={213} strokeDashoffset={213 - (213 * isoStats.percentage) / 100} 
                        className="transition-all duration-500" />
              </svg>
              <span className="absolute text-sm font-extrabold font-mono text-cyan-400">{isoStats.percentage}%</span>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">ISO 27001:2022</p>
              <p className="text-sm font-extrabold font-sans">Audit Readiness</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                {isoStats.ready}/{isoStats.total} Elements Ready
              </p>
            </div>
          </div>

          {/* PCI Circular Gauge */}
          <div className={`p-4 rounded-xl border flex items-center gap-4 ${
            isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-slate-850"
          }`}>
            <div className="relative flex items-center justify-center w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="34" strokeWidth="5" stroke={isLight ? "#e2e8f0" : "#111827"} fill="transparent" />
                <circle cx="40" cy="40" r="34" strokeWidth="5" stroke="#8b5cf6" fill="transparent" 
                        strokeDasharray={213} strokeDashoffset={213 - (213 * pciStats.percentage) / 100} 
                        className="transition-all duration-500" />
              </svg>
              <span className="absolute text-sm font-extrabold font-mono text-purple-400">{pciStats.percentage}%</span>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">PCI DSS V4.0</p>
              <p className="text-sm font-extrabold font-sans">Audit Readiness</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                {pciStats.ready}/{pciStats.total} Elements Ready
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Audit Matrix Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Control Center (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Filter & Action Bar */}
          <div className={`p-4 rounded-xl border space-y-4 ${
            isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-850"
          }`}>
            {/* Standard Switcher Tab */}
            <div className="flex p-1 rounded-lg bg-slate-950/60 border border-slate-850/50">
              <button
                onClick={() => {
                  setSelectedStandard("ISO-27001");
                  setSelectedItemId("");
                }}
                className={`flex-1 py-2 text-center rounded-md font-sans text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
                  selectedStandard === "ISO-27001"
                    ? "bg-cyan-600 text-slate-950 font-bold shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                🔒 ISO 27001:2022
              </button>
              <button
                onClick={() => {
                  setSelectedStandard("PCI-DSS");
                  setSelectedItemId("");
                }}
                className={`flex-1 py-2 text-center rounded-md font-sans text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
                  selectedStandard === "PCI-DSS"
                    ? "bg-purple-600 text-slate-950 font-bold shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                💳 PCI DSS V4.0
              </button>
            </div>

            {/* Sub-Filters / Search */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search code, title, or details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 ${
                    isLight 
                      ? "bg-slate-50 border-slate-200 text-slate-800 focus:border-cyan-500 focus:ring-cyan-500" 
                      : "bg-slate-950 border-slate-850 text-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
                  }`}
                />
              </div>

              {/* Grid selectors for clauses and controls */}
              <div className="flex gap-2">
                {(["all", "clause", "control"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition border ${
                      selectedType === type
                        ? isLight 
                          ? "bg-slate-800 text-white border-slate-800" 
                          : "bg-slate-250 border-slate-300 text-slate-950 font-bold"
                        : isLight 
                          ? "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800" 
                          : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {type === "all" ? "All" : type === "clause" ? "Clauses" : "Controls"}
                  </button>
                ))}
              </div>

              {/* Status checkboxes filters */}
              <div className="flex gap-1 bg-slate-950/30 p-1 rounded-md border border-slate-850/20 text-[10.5px]">
                {(["all", "ready", "pending"] as const).map((sf) => (
                  <button
                    key={sf}
                    onClick={() => setStatusFilter(sf)}
                    className={`flex-1 py-1 rounded text-center font-mono font-medium transition cursor-pointer capitalize ${
                      statusFilter === sf
                        ? isLight
                          ? "bg-white text-cyan-600 shadow-sm border border-slate-200"
                          : "bg-slate-800 text-cyan-300 font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {sf === "all" ? "All Stats" : sf === "ready" ? "✓ Ready" : "⏰ Pending"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Clauses & Controls Interactive List */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-850"
          }`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/20">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                {selectedStandard === "ISO-27001" ? "ISO Clauses & Annex A" : "PCI Requirements"} ({filteredItems.length})
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {currentStats.ready} of {currentStats.total} Compliant
              </span>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <FileQuestion className="h-8 w-8 text-slate-500 mx-auto animate-bounce" />
                  <p className="text-xs text-slate-500 font-mono">No matching audit targets found.</p>
                  <button 
                    onClick={() => { setSearchQuery(""); setSelectedType("all"); setStatusFilter("all"); }}
                    className="text-[10px] font-mono text-cyan-400 hover:underline cursor-pointer"
                  >
                    Clear Filter Locks
                  </button>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = activeItem?.id === item.id;
                  const docOk = readyDocs.includes(item.id);
                  const evOk = readyEvidence.includes(item.id);
                  const isReady = isItemFullyReady(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all duration-150 relative overflow-hidden group ${
                        isSelected
                          ? selectedStandard === "ISO-27001"
                            ? isLight 
                              ? "bg-cyan-50/55 border-cyan-300 shadow-sm" 
                              : "bg-gradient-to-r from-cyan-950/40 to-slate-950 border-cyan-500/50"
                            : isLight
                              ? "bg-purple-50/55 border-purple-300 shadow-sm"
                              : "bg-gradient-to-r from-purple-950/40 to-slate-950 border-purple-500/50"
                          : isLight
                            ? "bg-slate-50 hover:bg-slate-100/50 border-slate-200"
                            : "bg-slate-950/40 hover:bg-slate-950/90 border-slate-850"
                      }`}
                    >
                      {/* Left border active highlight indicator */}
                      {isSelected && (
                        <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                          selectedStandard === "ISO-27001" ? "bg-cyan-500" : "bg-purple-500"
                        }`} />
                      )}

                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded font-extrabold border leading-none ${
                              item.type === "clause"
                                ? isLight 
                                  ? "bg-slate-200 border-slate-300 text-slate-700" 
                                  : "bg-slate-850 border-slate-800 text-slate-300"
                                : isLight 
                                  ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                                  : "bg-emerald-950/30 border-emerald-900/50 text-emerald-400"
                            }`}>
                              {item.code}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                              {item.type === "clause" ? "Section Blueprint" : "Operational Control"}
                            </span>
                          </div>
                          
                          <h4 className={`text-xs font-bold leading-snug group-hover:text-white transition ${
                            isLight ? "text-slate-800" : "text-slate-200"
                          }`}>
                            {item.title}
                          </h4>
                          
                          <p className="text-[11px] text-slate-400 font-sans line-clamp-1">
                            {item.description}
                          </p>
                        </div>

                        {/* Status Check badge */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0 self-center">
                          {isReady ? (
                            <span className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.15)]">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </span>
                          ) : isItemPartiallyReady(item.id) ? (
                            <span className="text-[9px] font-mono uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                              DRAFTED
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono uppercase bg-slate-950 border border-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                              TODO
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Small visual tracker for Document / Evidence checks */}
                      <div className="mt-2 pt-2 border-t border-slate-800/10 flex items-center gap-3 text-[9px] font-mono">
                        <span className="flex items-center gap-1">
                          <span className={`h-1.5 w-1.5 rounded-full ${docOk ? "bg-cyan-500" : "bg-slate-700"}`} />
                          <span className={docOk ? "text-slate-300" : "text-slate-500"}>DOC</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className={`h-1.5 w-1.5 rounded-full ${evOk ? "bg-purple-500" : "bg-slate-700"}`} />
                          <span className={evOk ? "text-slate-300" : "text-slate-500"}>EVIDENCE</span>
                        </span>
                        {auditNotes[item.id] && (
                          <span className="ml-auto text-slate-500 italic text-[8.5px]">
                            📝 Notes attached
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Sandbox Controls */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-850"
          }`}>
            <h4 className="text-xs font-mono font-bold uppercase text-slate-400">
              Quick Audit Assessment Controls
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleQuickCompleteStandard}
                className={`py-2 px-3 rounded-lg text-[10px] font-mono font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                  isLight 
                    ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700" 
                    : "bg-slate-950 hover:bg-slate-850 border-slate-850 text-slate-300"
                }`}
              >
                ⚡ Autofill {selectedStandard}
              </button>
              <button
                onClick={handleResetAudit}
                className="py-2 px-3 rounded-lg text-[10px] font-mono font-bold bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" /> Reset Tracker
              </button>
            </div>
            <button
              onClick={handleExportMockAuditReport}
              className="w-full py-2.5 rounded-lg text-[10.5px] font-mono font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.15)] cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Download Full CSV Audit Workbook
            </button>
          </div>

        </div>

        {/* Right Active Clause Detail Center (7 Cols) */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {activeItem ? (
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className={`p-6 rounded-xl border space-y-6 h-full ${
                  isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-850"
                }`}
              >
                {/* Clause Header */}
                <div className="border-b border-slate-800/20 pb-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded font-mono font-bold text-xs border ${
                        selectedStandard === "ISO-27001"
                          ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                          : "bg-purple-500/10 border-purple-500/20 text-purple-400"
                      }`}>
                        {activeItem.code}
                      </span>
                      <span className="text-[10.5px] font-mono uppercase tracking-widest text-slate-400">
                        {selectedStandard === "ISO-27001" ? "ISO 27001:2022 ISMS Framework" : "PCI DSS V4.0 Compliance Core"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isItemFullyReady(activeItem.id) ? (
                        <span className="px-3 py-1 text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                          <CheckCircle2 className="h-3.5 w-3.5" /> AUDIT READY
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="h-3.5 w-3.5" /> PENDING EVIDENCE
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-xl font-extrabold ${isLight ? "text-slate-950" : "text-slate-100"}`}>
                      {activeItem.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">
                      {activeItem.description}
                    </p>
                  </div>
                </div>

                {/* Verification Checkboxes */}
                <div className="space-y-4">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                    Dual Audit Criteria Verification Checklist
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Document Criteria Block */}
                    <div 
                      onClick={() => handleToggleDoc(activeItem.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 select-none relative ${
                        readyDocs.includes(activeItem.id)
                          ? "bg-cyan-950/20 border-cyan-500/40"
                          : isLight ? "bg-slate-50 hover:bg-slate-100 border-slate-200" : "bg-slate-950/30 hover:bg-slate-950/70 border-slate-850"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="pt-0.5">
                          <input
                            type="checkbox"
                            checked={readyDocs.includes(activeItem.id)}
                            readOnly
                            disabled={activeRole === "Auditor"}
                            className="h-4.5 w-4.5 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <FileText className={`h-4 w-4 ${readyDocs.includes(activeItem.id) ? "text-cyan-400" : "text-slate-500"}`} />
                            <span className="text-xs font-bold font-mono">1. Document Required</span>
                          </div>
                          <p className={`text-[11px] font-sans font-medium ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                            {activeItem.documentRequired}
                          </p>
                          <p className="text-[10.5px] text-slate-400 font-sans leading-normal">
                            You must draft, approve, and formalize this policy document to verify administrative compliance.
                          </p>
                        </div>
                      </div>
                      
                      {readyDocs.includes(activeItem.id) && (
                        <span className="absolute top-2 right-2 text-[8px] font-mono bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded">
                          DRAFTED
                        </span>
                      )}
                    </div>

                    {/* Evidence Criteria Block */}
                    <div 
                      onClick={() => handleToggleEvidence(activeItem.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 select-none relative ${
                        readyEvidence.includes(activeItem.id)
                          ? "bg-purple-950/20 border-purple-500/40"
                          : isLight ? "bg-slate-50 hover:bg-slate-100 border-slate-200" : "bg-slate-950/30 hover:bg-slate-950/70 border-slate-850"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="pt-0.5">
                          <input
                            type="checkbox"
                            checked={readyEvidence.includes(activeItem.id)}
                            readOnly
                            disabled={activeRole === "Auditor"}
                            className="h-4.5 w-4.5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <FileCheck className={`h-4 w-4 ${readyEvidence.includes(activeItem.id) ? "text-purple-400" : "text-slate-500"}`} />
                            <span className="text-xs font-bold font-mono">2. Verifiable Evidence</span>
                          </div>
                          <p className={`text-[11px] font-sans font-medium ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                            {activeItem.evidenceToPresent}
                          </p>
                          <p className="text-[10.5px] text-slate-400 font-sans leading-normal">
                            Prepare logs, screenshots, or system export files. This is what the auditor inspects.
                          </p>
                        </div>
                      </div>

                      {readyEvidence.includes(activeItem.id) && (
                        <span className="absolute top-2 right-2 text-[8px] font-mono bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">
                          VERIFIED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Master status click-action */}
                  {activeRole !== "Auditor" && (
                    <button
                      onClick={() => handleToggleItemMaster(activeItem.id)}
                      className={`w-full py-2.5 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                        isItemFullyReady(activeItem.id)
                          ? "bg-red-950/20 border-red-900/30 text-red-400 hover:bg-red-950/30"
                          : "bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                      }`}
                    >
                      {isItemFullyReady(activeItem.id) ? (
                        "⏰ Clear Preparedness Status (Set Pending)"
                      ) : (
                        "✓ Mark Clause & Evidence as Fully Compliant"
                      )}
                    </button>
                  )}
                </div>

                {/* Professional Auditor Advisory (Insightful, structured advice) */}
                <div className={`p-4 rounded-xl border space-y-1.5 ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-850/50"
                }`}>
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <Sparkles className="h-4 w-4 text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />
                    <span className="text-xs font-mono font-extrabold uppercase tracking-widest">
                      Assessor's Compliance Advisory
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    {activeItem.standard === "ISO-27001" ? (
                      activeItem.type === "clause" 
                        ? "ISO auditors focus heavily on process recurrence. A perfect policy document is useless if you cannot prove there is an executive management steering group reviewing the ISMS metrics at least annually."
                        : "For technological Annex A controls, ensure your configuration audits match current employee lists. If an employee listed in Jira has left, verify their permissions are immediately deleted in Active Directory within 24 hours."
                    ) : (
                      "PCI DSS v4.0 is highly prescriptive. Remember that a single missing quarterly vulnerability scan or a password complexity baseline below 12 characters will trigger an automatic FAIL on the entire assessment."
                    )}
                  </p>
                  <div className="pt-2 border-t border-slate-800/10 flex justify-between text-[10px] font-mono text-slate-500">
                    <span>Audit Severity Weight: HIGH</span>
                    <span>Direct Impact: Core Certification</span>
                  </div>
                </div>

                {/* Remediation Notes Box */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                      Internal Remediation Notes & Assigned Owners
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono italic">
                      Saves automatically on change
                    </span>
                  </div>
                  <textarea
                    disabled={activeRole === "Auditor"}
                    rows={3}
                    placeholder={
                      activeRole === "Auditor"
                        ? "Auditor read-only mode active."
                        : "e.g. Assigned to Sarah (IT). Draft policy approved by CISO. Need to pull active AD configuration reports by next Tuesday..."
                    }
                    value={auditNotes[activeItem.id] || ""}
                    onChange={(e) => handleSaveNotes(activeItem.id, e.target.value)}
                    className={`w-full rounded-lg p-3 text-xs focus:outline-none focus:ring-1 leading-relaxed ${
                      isLight 
                        ? "bg-slate-50 border-slate-200 text-slate-800 focus:border-cyan-500 focus:ring-cyan-500" 
                        : "bg-slate-950 border-slate-850 text-slate-100 focus:border-cyan-500 focus:ring-cyan-500"
                    }`}
                  />
                </div>

                {/* Audit Context Tips Footer */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/20">
                  <span className="flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Interactive ISO 27001 & PCI DSS Audit Hub
                  </span>
                  <span>
                    Item ID Reference: <span className="font-mono">{activeItem.id}</span>
                  </span>
                </div>
              </motion.div>
            ) : (
              <div className={`p-12 text-center rounded-xl border flex flex-col justify-center items-center h-full space-y-3 ${
                isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-850"
              }`}>
                <ClipboardList className="h-12 w-12 text-slate-600 animate-pulse" />
                <h3 className="text-sm font-bold font-mono text-slate-300 uppercase">No Active Target Selected</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Please select any clause or control target from the left sidebar tracker menu to begin reviewing evidence requirements.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
