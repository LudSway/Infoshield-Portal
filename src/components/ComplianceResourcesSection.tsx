import React, { useState } from "react";
import { 
  BookOpen, 
  Search, 
  Clock, 
  Tag, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  CheckCircle2, 
  Copy, 
  Check, 
  X, 
  Send, 
  ShieldCheck, 
  ArrowUpRight,
  Sparkles,
  FileText,
  UserCheck,
  Mail,
  Bell,
  Loader2,
  Lock,
  Zap,
  BarChart3,
  Timer,
  Eye,
  EyeOff,
  ListChecks,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { complianceResources, ComplianceResource, calculateGuideReadingStats } from "../data/complianceResourcesData";

interface ComplianceResourcesSectionProps {
  isLight: boolean;
  onConsultationRequest: (serviceName: string, initialMessage: string) => void;
}

export default function ComplianceResourcesSection({ isLight, onConsultationRequest }: ComplianceResourcesSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGuide, setSelectedGuide] = useState<ComplianceResource | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [expandedSnippets, setExpandedSnippets] = useState<Record<string, boolean>>({});

  // Email Subscription State
  const [newsletterEmail, setNewsletterEmail] = useState<string>("");
  const [newsletterInterest, setNewsletterInterest] = useState<string>("All Regulatory & Security Alerts");
  const [subscribing, setSubscribing] = useState<boolean>(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState<boolean>(false);
  const [subscribeMessage, setSubscribeMessage] = useState<string>("");
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  const interestOptions = [
    "All Regulatory & Security Alerts",
    "Act 843 & DPC Directives",
    "Bank of Ghana Cyber Guidelines",
    "ISO 27001 / PCI DSS v4.0",
    "Penetration Testing & Threat Briefs"
  ];

  const toggleSnippet = (id: string) => {
    setExpandedSnippets(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const areAllExpanded = complianceResources.length > 0 && complianceResources.every(g => expandedSnippets[g.id]);

  const toggleAllSnippets = () => {
    const nextState = !areAllExpanded;
    const updated: Record<string, boolean> = {};
    complianceResources.forEach(g => {
      updated[g.id] = nextState;
    });
    setExpandedSnippets(updated);
  };

  const handleCopySnippetText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      setSubscribeError("Please enter a valid corporate or personal email address.");
      return;
    }

    setSubscribing(true);
    setSubscribeError(null);

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newsletterEmail,
          interest: newsletterInterest
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubscribeSuccess(true);
        setSubscribeMessage(data.message || "Thank you for subscribing! You will receive future security alerts and compliance field guides.");
        setNewsletterEmail("");
      } else {
        setSubscribeError(data.error || "Failed to subscribe. Please try again.");
      }
    } catch {
      setSubscribeError("Network error. Please verify your connection and try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const categories = [
    "All",
    "Act 843",
    "ISO 27001",
    "Bank of Ghana",
    "PCI DSS",
    "Penetration Testing",
    "Policies & Strategy"
  ];

  const filteredResources = complianceResources.filter(resource => {
    const matchesCategory = activeCategory === "All" || resource.category === activeCategory;
    const matchesSearch = 
      searchQuery === "" ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const handleCopyChecklist = (itemText: string, index: number) => {
    navigator.clipboard.writeText(itemText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleGuideConsult = (guide: ComplianceResource) => {
    let serviceName = "Ghana Data Protection Act (Act 843)";
    if (guide.category === "ISO 27001") serviceName = "ISO 27001 Certification Consulting";
    if (guide.category === "PCI DSS") serviceName = "PCI DSS v4.0 Certification Consulting";
    if (guide.category === "Penetration Testing") serviceName = "Vulnerability Assessment & Risk Assessment";

    onConsultationRequest(
      serviceName,
      `[Resource Lead] We read your compliance guide "${guide.title}" and would like expert assistance implementing these requirements for our organization.`
    );
    setSelectedGuide(null);
  };

  return (
    <section id="resources" className={`py-12 sm:py-16 md:py-20 border-t ${
      isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 mb-3">
            <BookOpen className="h-3.5 w-3.5 text-cyan-500" />
            <span>KNOWLEDGE HUB & FIELD GUIDES</span>
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Compliance & Cybersecurity Field Resources
          </h2>
          <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            Practical, actionable regulatory compliance guides written specifically for financial institutions, FinTechs, microfinance firms, and enterprises operating in Ghana and West Africa.
          </p>
        </motion.div>

        {/* Filter Controls & Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mb-8 sm:mb-10 space-y-3.5 sm:space-y-4 max-w-4xl mx-auto"
        >
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 sm:left-4 top-3 sm:top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search guides e.g. Act 843, Bank of Ghana, ISO 27001, DPO, PCI DSS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 sm:pl-11 pr-14 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-semibold border transition focus:outline-hidden focus:border-cyan-500 ${
                isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800"
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-2.5 sm:top-3.5 text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills & Expand All Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs font-bold transition cursor-pointer border whitespace-nowrap shrink-0 ${
                    activeCategory === cat
                      ? "bg-cyan-600 text-white border-cyan-600 shadow-sm"
                      : isLight
                      ? "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick Actions & Guide Counter */}
            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
              <span className="text-[11px] font-mono font-semibold text-slate-400">
                {filteredResources.length} {filteredResources.length === 1 ? "Guide" : "Guides"}
              </span>

              <button
                onClick={toggleAllSnippets}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition border cursor-pointer ${
                  areAllExpanded
                    ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30"
                    : isLight
                    ? "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                    : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
                }`}
              >
                {areAllExpanded ? (
                  <>
                    <EyeOff className="h-3 w-3 text-cyan-500" />
                    <span>Collapse Previews</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 text-cyan-500" />
                    <span>Expand All Snippets</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Guides Grid - Responsive 1 col mobile, 2 cols tablet, 3 cols desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-start">
          {filteredResources.map((guide, idx) => {
            const stats = calculateGuideReadingStats(guide);
            const isExpanded = !!expandedSnippets[guide.id];

            return (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.45, delay: (idx % 3) * 0.08, ease: "easeOut" }}
                className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl border flex flex-col justify-between transition-all hover:shadow-xl ${
                  isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      guide.category === "Act 843" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" :
                      guide.category === "ISO 27001" ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20" :
                      guide.category === "Bank of Ghana" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" :
                      guide.category === "PCI DSS" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" :
                      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                    }`}>
                      {guide.category}
                    </span>

                    {/* Calculated Reading Time Badge */}
                    <span 
                      className="text-[11px] text-cyan-700 dark:text-cyan-300 font-mono flex items-center gap-1 font-bold bg-cyan-500/10 dark:bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/20"
                      title={`Calculated reading time: ${stats.minutes} min (${stats.wordCount} words at 200 wpm)`}
                    >
                      <Clock className="h-3 w-3 text-cyan-500" />
                      <span>{stats.readTimeFormatted}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold leading-snug mb-2 sm:mb-2.5 hover:text-cyan-600 dark:hover:text-cyan-400 transition cursor-pointer"
                      onClick={() => setSelectedGuide(guide)}>
                    {guide.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-3.5 sm:mb-4 line-clamp-3">
                    {guide.summary}
                  </p>

                  {/* Key Takeaways Preview Snippet Trigger */}
                  <div className="p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 mb-3 space-y-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        KEY TAKEAWAY:
                      </span>
                      <button
                        onClick={() => toggleSnippet(guide.id)}
                        className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>{isExpanded ? "Hide Snippet" : "Quick Snippet"}</span>
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{guide.keyTakeaways[0]}</span>
                    </div>
                  </div>

                  {/* 🌟 IN-GRID EXPANDABLE SNIPPET ACCORDION */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="mb-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-3 overflow-hidden"
                      >
                        {/* Skim vs Read Stats Bar */}
                        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold text-cyan-700 dark:text-cyan-300">
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-amber-500" />
                            <span>Skim: {stats.skimTimeFormatted}</span>
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3 text-cyan-500" />
                            <span>{guide.contentSections.length} Sections</span>
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3 text-emerald-500" />
                            <span>{stats.wordCount} words</span>
                          </span>
                        </div>

                        {/* All Key Takeaways */}
                        <div className="space-y-1.5">
                          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                            <span>Core Takeaways:</span>
                            <button
                              onClick={() => handleCopySnippetText(guide.keyTakeaways.join("\n• "), guide.id)}
                              className="text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                            >
                              {copiedSnippetId === guide.id ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-500" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy Takeaways</span>
                                </>
                              )}
                            </button>
                          </div>
                          <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                            {guide.keyTakeaways.map((point, pIdx) => (
                              <li key={pIdx} className="flex items-start gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0 mt-1.5" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Actionable Checklist Preview if available */}
                        {guide.contentSections[0]?.checklist && guide.contentSections[0].checklist.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <ListChecks className="h-3 w-3 text-cyan-500" />
                              <span>Step 1 Checklist Teaser:</span>
                            </div>
                            <div className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                              {guide.contentSections[0].checklist.slice(0, 2).map((chk, cIdx) => (
                                <div key={cIdx} className="flex items-start gap-1.5">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  <span className="line-clamp-2">{chk}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Direct Modal Launcher from Snippet */}
                        <div className="pt-1 flex items-center justify-between">
                          <button
                            onClick={() => setSelectedGuide(guide)}
                            className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <span>Open Full Reader</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>

                          <button
                            onClick={() => handleGuideConsult(guide)}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition cursor-pointer"
                          >
                            Get Advisory
                          </button>
                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

                {/* Bottom Card Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
                    <span>{guide.datePublished}</span>
                    <span>•</span>
                    <span className="text-slate-500">{stats.wordCount.toLocaleString()} w</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSnippet(guide.id)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        isExpanded
                          ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400"
                          : isLight
                          ? "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                      }`}
                      title={isExpanded ? "Collapse preview" : "Expand preview snippet"}
                    >
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>

                    <button
                      onClick={() => setSelectedGuide(guide)}
                      className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Read Guide</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12 text-slate-500 font-medium text-xs">
            No compliance guides found matching "{searchQuery}". Try selecting "All" categories or clearing your search.
          </div>
        )}

        {/* 📬 STAY UPDATED - EMAIL SUBSCRIPTION COMPONENT */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className={`mt-12 sm:mt-16 p-6 sm:p-8 md:p-10 rounded-3xl border relative overflow-hidden transition-all ${
            isLight
              ? "bg-gradient-to-br from-cyan-50/80 via-white to-blue-50/80 border-cyan-200/80 shadow-lg"
              : "bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/30 border-cyan-500/20 shadow-2xl"
          }`}
        >
          {/* Ambient Background Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              
              {/* Left Column: Heading & Description */}
              <div className="lg:max-w-xl space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                  <Bell className="h-3.5 w-3.5 text-cyan-500" />
                  <span>REGULATORY DISPATCH & FIELD BRIEFS</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  Stay Updated on Ghana & West Africa Compliance
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  Join hundreds of CISOs, compliance officers, and IT leaders. Receive direct alerts whenever the Data Protection Commission (Act 843) or Bank of Ghana issues new directives, plus field checklists for ISO 27001 and PCI DSS.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-500" />
                    <span>Quarterly Field Reports</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-500" />
                    <span>Instant Regulatory Circulars</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-500" />
                    <span>Zero spam guaranteed</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Subscription Form / Success State */}
              <div className="w-full lg:w-96 shrink-0">
                {subscribeSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-2xl border text-center space-y-3 ${
                      isLight
                        ? "bg-white/90 border-emerald-300 text-slate-800 shadow-md"
                        : "bg-slate-950/80 border-emerald-500/30 text-slate-100"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Subscription Active!
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {subscribeMessage}
                    </p>
                    <button
                      onClick={() => setSubscribeSuccess(false)}
                      className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-bold pt-2 cursor-pointer"
                    >
                      Subscribe another address
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleNewsletterSubscribe} className="space-y-3.5">
                    {/* Topic / Interest Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                        Primary Topic Interest:
                      </label>
                      <select
                        value={newsletterInterest}
                        onChange={(e) => setNewsletterInterest(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer focus:outline-hidden focus:border-cyan-500 ${
                          isLight
                            ? "bg-white border-slate-300 text-slate-800"
                            : "bg-slate-950 border-slate-800 text-slate-200"
                        }`}
                      >
                        {interestOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Email Input & Submit Button */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                        Work or Corporate Email:
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="e.g. ciso@yourcompany.com"
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs font-semibold border transition focus:outline-hidden focus:border-cyan-500 ${
                            isLight
                              ? "bg-white border-slate-300 text-slate-900 shadow-sm"
                              : "bg-slate-950 border-slate-800 text-slate-100"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Error message */}
                    {subscribeError && (
                      <p className="text-xs text-rose-500 font-semibold">{subscribeError}</p>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={subscribing}
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md hover:shadow-cyan-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                    >
                      {subscribing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Subscribing...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>Subscribe to Security Field Guides</span>
                        </>
                      )}
                    </button>

                    {/* Privacy Anti-Spam Guarantee */}
                    <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
                      <Lock className="h-3 w-3 text-cyan-500 shrink-0" />
                      <span>Zero spam. Unsubscribe anytime in 1 click.</span>
                    </p>
                  </form>
                )}
              </div>

            </div>
          </div>
        </motion.div>

      </div>

      {/* 📖 FULL FIELD GUIDE READER MODAL */}
      <AnimatePresence>
        {selectedGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 sm:p-8 ${
                isLight ? "bg-white text-slate-900 border-slate-200" : "bg-slate-900 text-slate-100 border-slate-800"
              }`}
            >
              
              {/* Modal Close Button */}
              <button
                onClick={() => setSelectedGuide(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>

              {/* Modal Header */}
              {(() => {
                const selectedGuideStats = calculateGuideReadingStats(selectedGuide);
                return (
                  <>
                    <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800 pr-10 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                          {selectedGuide.category}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-cyan-500" />
                          <span>{selectedGuideStats.readTimeFormatted}</span>
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {selectedGuideStats.wordCount.toLocaleString()} words
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          Published: {selectedGuide.datePublished}
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                        {selectedGuide.title}
                      </h2>

                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <UserCheck className="h-4 w-4 text-cyan-500" />
                        <span>Author: {selectedGuide.author}</span>
                      </div>
                    </div>

                    {/* ⏱️ TIME MANAGEMENT & REVIEW BUDGET DASHBOARD */}
                    <div className={`p-4 rounded-2xl border mb-6 ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/80 border-slate-800"
                    }`}>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                          <Timer className="h-4 w-4 text-cyan-500" />
                          <span>Time Management & Content Scope</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">Standard 200 WPM</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                          isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
                        }`}>
                          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400">Full Read</div>
                            <div className="font-bold text-slate-900 dark:text-slate-100">{selectedGuideStats.readTimeFormatted}</div>
                          </div>
                        </div>

                        <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                          isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
                        }`}>
                          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                            <Zap className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400">Quick Skim</div>
                            <div className="font-bold text-slate-900 dark:text-slate-100">{selectedGuideStats.skimTimeFormatted}</div>
                          </div>
                        </div>

                        <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                          isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
                        }`}>
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <BarChart3 className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400">Content Scope</div>
                            <div className="font-bold text-slate-900 dark:text-slate-100">{selectedGuideStats.wordCount.toLocaleString()} w • {selectedGuide.contentSections.length} sections</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                        <span><strong>Recommendation:</strong> Allocate a {selectedGuideStats.minutes + 3}-minute calendar block to review sections and implement checklist items.</span>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Executive Summary Takeaways */}
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-6 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  <span>Executive Summary & Key Takeaways</span>
                </div>
                <ul className="space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
                  {selectedGuide.keyTakeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-500 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Structured Content Sections */}
              <div className="space-y-6 mb-8 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {selectedGuide.contentSections.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1.5">
                      {section.heading}
                    </h3>
                    
                    {section.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="font-medium leading-relaxed">
                        {p}
                      </p>
                    ))}

                    {/* Actionable Checklist if present */}
                    {section.checklist && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 mt-2">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                          <span>Actionable Checklist Items</span>
                          <span className="text-[10px] text-cyan-500 font-mono">Click copy icon to save</span>
                        </div>
                        {section.checklist.map((item, cIdx) => (
                          <div key={cIdx} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                            <span className="font-medium text-slate-800 dark:text-slate-200">{item}</span>
                            <button
                              onClick={() => handleCopyChecklist(item, cIdx)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-cyan-500 transition shrink-0 cursor-pointer"
                              title="Copy item"
                            >
                              {copiedIndex === cIdx ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Keywords Pills */}
              <div className="mb-8 pt-4 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-2">
                  TARGETED REGULATORY KEYWORDS:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedGuide.keywords.map((kw, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Modal Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setSelectedGuide(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer"
                >
                  Close Field Guide
                </button>

                <button
                  onClick={() => handleGuideConsult(selectedGuide)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Request Expert Assistance for This Standard</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
