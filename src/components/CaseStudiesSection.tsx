import React, { useState } from "react";
import { 
  Building2, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Clock, 
  Award, 
  ShieldCheck, 
  MapPin, 
  FileText, 
  Star, 
  ArrowRight, 
  X, 
  Sparkles,
  Zap,
  Check,
  Eye,
  EyeOff,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { caseStudies, CaseStudy } from "../data/caseStudiesData";

interface CaseStudiesSectionProps {
  isLight: boolean;
  onConsultationRequest: (serviceName: string, initialMessage: string) => void;
}

export default function CaseStudiesSection({ isLight, onConsultationRequest }: CaseStudiesSectionProps) {
  const [selectedStudy, setSelectedStudy] = useState<CaseStudy | null>(null);
  const [expandedPreviews, setExpandedPreviews] = useState<Record<string, boolean>>({
    "alpha-maga-iso27001": false,
    "integrity-infinity-audit": false
  });

  const togglePreview = (id: string) => {
    setExpandedPreviews(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const areAllExpanded = Object.values(expandedPreviews).every(Boolean);

  const toggleAllPreviews = () => {
    const nextState = !areAllExpanded;
    const updated: Record<string, boolean> = {};
    caseStudies.forEach(cs => {
      updated[cs.id] = nextState;
    });
    setExpandedPreviews(updated);
  };

  const handleModalConsult = (study: CaseStudy) => {
    onConsultationRequest(
      "ISO 27001 Certification Consulting",
      `[Case Study Lead] We read the ${study.clientName} case study ("${study.title}") and would like a similar compliance roadmap for our institution.`
    );
    setSelectedStudy(null);
  };

  return (
    <section id="case-studies" className={`py-12 sm:py-16 md:py-20 border-t ${
      isLight ? "bg-slate-100/70 border-slate-200" : "bg-slate-900/40 border-slate-800"
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-10"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-3">
            <Award className="h-3.5 w-3.5 text-amber-500" />
            <span>PROVEN CLIENT SUCCESS STORIES IN GHANA</span>
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            How We Deliver Regulatory Clearances
          </h2>
          <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            Real case breakdowns demonstrating how InfoShield Security helps microfinance institutions and financial services achieve ISO 27001 certification and Bank of Ghana compliance rapidly.
          </p>

          {/* Quick Toggle Controls */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={toggleAllPreviews}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition border cursor-pointer ${
                areAllExpanded
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : isLight
                  ? "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                  : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
              }`}
            >
              {areAllExpanded ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 text-amber-500" />
                  <span>Collapse All Previews</span>
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 text-amber-500" />
                  <span>Expand All Roadmap Snippets</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Featured Case Study Hero: Alpha Maga */}
        {caseStudies[0] && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl border relative overflow-hidden mb-6 sm:mb-8 transition-shadow hover:shadow-2xl ${
              isLight ? "bg-white border-slate-200 shadow-xl" : "bg-slate-900 border-slate-800 shadow-2xl"
            }`}
          >
            <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-br from-amber-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              
              <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-amber-500 text-slate-950">
                    {caseStudies[0].badgeText}
                  </span>
                  <span className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3 text-cyan-500" />
                    <span>Certified in 58 Days</span>
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-snug sm:leading-tight">
                  {caseStudies[0].title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {caseStudies[0].subtitle}
                </p>

                {/* Client Info Bar */}
                <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="font-bold">{caseStudies[0].clientName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                    <span>{caseStudies[0].clientLocation}</span>
                  </div>
                </div>

                {/* Testimonial Snippet */}
                <div className="pl-3 border-l-2 border-amber-500 text-xs italic text-slate-600 dark:text-slate-300 font-medium">
                  "{caseStudies[0].testimonial.quote}"
                  <span className="block mt-1 font-bold not-italic text-slate-900 dark:text-slate-100 text-[11px]">
                    — {caseStudies[0].testimonial.role}
                  </span>
                </div>

                {/* Action Buttons: Expand Snippet & Open Modal */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => togglePreview(caseStudies[0].id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                      expandedPreviews[caseStudies[0].id]
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        : isLight
                        ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                        : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>{expandedPreviews[caseStudies[0].id] ? "Hide Roadmap Snippet" : "Quick Roadmap Preview"}</span>
                    {expandedPreviews[caseStudies[0].id] ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedStudy(caseStudies[0])}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 via-cyan-600 to-blue-600 hover:from-amber-500 hover:to-blue-500 shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Full Case Study Report</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Side Metrics Grid */}
              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                {caseStudies[0].impactMetrics.map((m, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.92 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.15 + idx * 0.08 }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-center flex flex-col justify-center transition-shadow hover:shadow-md ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl font-black text-amber-500 font-mono block">
                      {m.value}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mt-1">
                      {m.label}
                    </span>
                  </motion.div>
                ))}
              </div>

            </div>

            {/* 🌟 IN-GRID EXPANDABLE SNIPPET PREVIEW (ALPHA MAGA) */}
            <AnimatePresence>
              {expandedPreviews[caseStudies[0].id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 relative z-10"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4" />
                        <span>Execution Roadmap & Solution Phases (58 Days)</span>
                      </h4>
                      <span className="text-[11px] font-mono text-slate-400">ISO/IEC 27001:2022</span>
                    </div>

                    {/* Phases Grid Snippet */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {caseStudies[0].solutionPhases.map((phase, pIdx) => (
                        <div 
                          key={pIdx}
                          className={`p-3.5 rounded-xl border space-y-1.5 ${
                            isLight ? "bg-slate-50/80 border-slate-200" : "bg-slate-950/80 border-slate-800"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-amber-600 dark:text-amber-400">{phase.phase}</span>
                            <span className="text-slate-400 font-mono">{phase.timeline}</span>
                          </div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{phase.title}</div>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                            {phase.description}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Key Results Checklist Snippet */}
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                      <div className="text-[11px] font-bold uppercase text-amber-700 dark:text-amber-300">
                        Quantified Audit Outcomes:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {caseStudies[0].results.map((res, rIdx) => (
                          <div key={rIdx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>{res}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom CTA within Snippet */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() => setSelectedStudy(caseStudies[0])}
                        className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open full breakdown & Stage 1/2 audit notes</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>

                      <button
                        onClick={() => handleModalConsult(caseStudies[0])}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="h-3 w-3" />
                        <span>Request Similar 60-Day Roadmap</span>
                      </button>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

        {/* Secondary Case Study Card */}
        {caseStudies[1] && (
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl border relative transition-shadow hover:shadow-lg ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800"
            }`}
          >
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 sm:gap-6">
              <div className="space-y-2.5 sm:space-y-3 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {caseStudies[1].badgeText}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">30 Days Duration</span>
                </div>

                <h4 className="text-lg sm:text-xl font-bold">{caseStudies[1].title}</h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {caseStudies[1].subtitle}
                </p>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-emerald-500" />
                    {caseStudies[1].clientName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-cyan-500" />
                    {caseStudies[1].clientLocation}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={() => togglePreview(caseStudies[1].id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                    expandedPreviews[caseStudies[1].id]
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : isLight
                      ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                      : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                  <span>{expandedPreviews[caseStudies[1].id] ? "Hide Snippet" : "Quick Preview"}</span>
                  {expandedPreviews[caseStudies[1].id] ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>

                <button
                  onClick={() => setSelectedStudy(caseStudies[1])}
                  className={`w-full lg:w-auto px-5 py-2.5 rounded-xl text-xs font-bold border shrink-0 transition flex items-center justify-center gap-2 cursor-pointer ${
                    isLight ? "bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100" : "bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <span>View Case Study</span>
                  <ChevronRight className="h-4 w-4 text-cyan-500" />
                </button>
              </div>
            </div>

            {/* 🌟 IN-GRID EXPANDABLE SNIPPET PREVIEW (INTEGRITY INFINITY) */}
            <AnimatePresence>
              {expandedPreviews[caseStudies[1].id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4" />
                        <span>Remediation Roadmap & Bank of Ghana Directive Clearance</span>
                      </h4>
                      <span className="text-[11px] font-mono text-slate-400">3-Phase Audit</span>
                    </div>

                    {/* Phases Grid Snippet */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {caseStudies[1].solutionPhases.map((phase, pIdx) => (
                        <div 
                          key={pIdx}
                          className={`p-3.5 rounded-xl border space-y-1.5 ${
                            isLight ? "bg-slate-50/80 border-slate-200" : "bg-slate-950/80 border-slate-800"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-emerald-600 dark:text-emerald-400">{phase.phase}</span>
                            <span className="text-slate-400 font-mono">{phase.timeline}</span>
                          </div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{phase.title}</div>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                            {phase.description}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Impact Metrics Snippet */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      {caseStudies[1].impactMetrics.map((m, mIdx) => (
                        <div 
                          key={mIdx}
                          className={`p-2.5 rounded-xl border ${
                            isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                          }`}
                        >
                          <div className="text-base sm:text-lg font-black text-emerald-500 font-mono">{m.value}</div>
                          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{m.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Bottom CTA within Snippet */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() => setSelectedStudy(caseStudies[1])}
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open full vulnerability assessment report</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>

                      <button
                        onClick={() => onConsultationRequest("Vulnerability Assessment & Risk Assessment", "We would like to request a vulnerability assessment & Bank of Ghana compliance review similar to the Integrity Infinity case study.")}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="h-3 w-3" />
                        <span>Request Security Audit</span>
                      </button>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

      </div>

      {/* 📖 FULL CASE STUDY BREAKDOWN MODAL */}
      <AnimatePresence>
        {selectedStudy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 sm:p-8 ${
                isLight ? "bg-white text-slate-900 border-slate-200" : "bg-slate-900 text-slate-100 border-slate-800"
              }`}
            >
              
              {/* Modal Close Button */}
              <button
                onClick={() => setSelectedStudy(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>

              {/* Modal Header */}
              <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800 pr-10">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {selectedStudy.badgeText}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {selectedStudy.duration}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {selectedStudy.title}
                </h2>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Building2 className="h-4 w-4 text-amber-500" />
                    {selectedStudy.clientName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-cyan-500" />
                    {selectedStudy.clientLocation}
                  </span>
                </div>
              </div>

              {/* Impact Metrics Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {selectedStudy.impactMetrics.map((m, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono block">
                      {m.value}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Challenge Description */}
              <div className="mb-8 space-y-2">
                <h3 className="text-base font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Zap className="h-4 w-4" />
                  <span>The Regulatory Challenge & Background</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {selectedStudy.challenge}
                </p>
              </div>

              {/* Implementation Phases */}
              <div className="mb-8 space-y-4">
                <h3 className="text-base font-bold flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>InfoShield 4-Phase Implementation Roadmap</span>
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  {selectedStudy.solutionPhases.map((phase, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                    }`}>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-extrabold text-cyan-600 dark:text-cyan-400 font-mono uppercase">
                          {phase.phase}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-500">
                          {phase.timeline}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold mb-1">{phase.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                        {phase.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantified Audit Results */}
              <div className="mb-8 space-y-3">
                <h3 className="text-base font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Award className="h-4 w-4" />
                  <span>Verified Audit Results & Achievements</span>
                </h3>
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {selectedStudy.results.map((res, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{res}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonial Callout */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-amber-950 text-white mb-8 relative overflow-hidden">
                <p className="text-xs italic font-medium leading-relaxed relative z-10">
                  "{selectedStudy.testimonial.quote}"
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-amber-300 font-bold relative z-10">
                  <span>— {selectedStudy.testimonial.role}</span>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Modal Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setSelectedStudy(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer"
                >
                  Close Case Study
                </button>

                <button
                  onClick={() => handleModalConsult(selectedStudy)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 via-cyan-600 to-blue-600 hover:from-amber-500 hover:to-blue-500 shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Request a Similar ISO 27001 Roadmap</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
