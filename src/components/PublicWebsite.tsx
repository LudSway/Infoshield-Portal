import React, { useState, useEffect } from "react";
import { 
  Shield, 
  CheckCircle2, 
  Award, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldAlert, 
  Send, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Lock,
  Building2,
  Sparkles,
  Calculator,
  Check,
  Star,
  ShieldCheck,
  FileSearch,
  KeyRound,
  EyeOff,
  BookOpen,
  FileText
} from "lucide-react";
import CaseStudiesSection from "./CaseStudiesSection";
import ComplianceResourcesSection from "./ComplianceResourcesSection";

interface PublicWebsiteProps {
  onAccessPortal: () => void;
  theme?: "light" | "dark";
}

export default function PublicWebsite({ onAccessPortal, theme = "light" }: PublicWebsiteProps) {
  const isLight = theme === "light";

  // Contact Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    service: "Ghana Data Protection Act (Act 843)",
    message: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // FAQ Toggle State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Quiz State
  const [quizOrgType, setQuizOrgType] = useState<string>("microfinance");
  const [quizGoals, setQuizGoals] = useState<string[]>(["act843"]);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const orgCategories = [
    { id: "microfinance", label: "Microfinance & Savings Institution" },
    { id: "banking", label: "Commercial / Rural Bank" },
    { id: "fintech", label: "FinTech & Payment Service Provider (PSP)" },
    { id: "vasp", label: "Virtual Asset Firm / Crypto (VASP)" },
    { id: "telecom", label: "Telecom / ISP Provider" },
    { id: "healthtech", label: "Healthcare / HealthTech" },
    { id: "public_sector", label: "Government / NGO / Education" },
    { id: "enterprise", label: "Enterprise, Retail & E-Commerce" },
  ];

  const quizGoalsList = [
    { id: "act843", label: "Ghana DPC Registration (Act 843)" },
    { id: "iso27001", label: "ISO 27001:2022 Certification Consulting" },
    { id: "pcidss", label: "PCI DSS v4.0 Payment Compliance" },
    { id: "audit", label: "Vulnerability Assessment & Penetration Audit" },
    { id: "bog_framework", label: "Bank of Ghana Cyber Guidelines Check" },
    { id: "policy_eng", label: "Information Security Policy Engineering" },
  ];

  const toggleQuizGoal = (goalId: string) => {
    setQuizGoals(prev => {
      if (prev.includes(goalId)) {
        if (prev.length === 1) return prev; // keep at least 1
        return prev.filter(g => g !== goalId);
      } else {
        return [...prev, goalId];
      }
    });
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitSuccess(true);
        setFormData({
          name: "",
          email: "",
          company: "",
          phone: "",
          service: "Ghana Data Protection Act (Act 843)",
          message: ""
        });
      } else {
        setSubmitError(data.error || "Failed to send message. Please try again.");
      }
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuizSubmitted(true);

    const selectedCategoryLabel = orgCategories.find(c => c.id === quizOrgType)?.label || quizOrgType;
    const selectedGoalsLabels = quizGoals.map(gId => quizGoalsList.find(g => g.id === gId)?.label || gId);
    
    let primaryService = "Ghana Data Protection Act (Act 843)";
    if (quizGoals.includes("iso27001")) primaryService = "ISO 27001 Certification Consulting";
    else if (quizGoals.includes("pcidss")) primaryService = "PCI DSS v4.0 Certification Consulting";
    else if (quizGoals.includes("audit")) primaryService = "Vulnerability Assessment & Risk Assessment";

    setFormData(prev => ({
      ...prev,
      service: primaryService,
      message: `[Readiness Assessment Summary]\nOrganization Type: ${selectedCategoryLabel}\nImmediate Focus Areas:\n- ${selectedGoalsLabels.join("\n- ")}\n\nWe request a consultation tailored to these requirements.`
    }));
  };

  const handleSubcomponentConsultation = (serviceName: string, initialMessage: string) => {
    setFormData(prev => ({
      ...prev,
      service: serviceName,
      message: initialMessage
    }));
    const contactElem = document.getElementById("contact");
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  const faqs = [
    {
      q: "What data protection compliance is required for microfinance institutions in Ghana?",
      a: "Microfinance firms and financial institutions handling customer PII must register with Ghana's Data Protection Commission (DPC) under the Data Protection Act, 2012 (Act 843). InfoShield guides firms through registration, Data Protection Officer (DPO) assignment, and Bank of Ghana cybersecurity guidelines."
    },
    {
      q: "How long does full ISO 27001:2022 certification take?",
      a: "A typical ISO 27001 implementation and certification engagement takes 4 to 6 months. InfoShield conducts gap assessments, policy engineering, Annex A control implementation, internal audits, and direct Stage 1 & Stage 2 external auditor liaison until certification is achieved."
    },
    {
      q: "Do you support PCI DSS v4.0 for payment platforms and FinTechs?",
      a: "Yes. We consult on Cardholder Data Environment (CDE) scoping, network segmentation, SAQ/ROC preparation, and QSA defense for payment gateways, banks, and FinTechs."
    },
    {
      q: "Where does InfoShield Security operate and can you assist institutions outside Accra?",
      a: "InfoShield operates anywhere in Ghana! We provide full-scope cybersecurity compliance, ISO 27001/PCI DSS consulting, and Ghana DPC registration for institutions in Greater Accra, Ashanti, Central, Western, Northern, and all other regions across Ghana."
    },
    {
      q: "What is included in a Vulnerability Assessment & Security Risk Audit?",
      a: "We perform automated and manual vulnerability testing, application flaw analysis, configuration reviews, and Bank of Ghana cyber framework gap checks. You receive an executive remediation report and audit-ready proof documentation."
    },
    {
      q: "How secure is the InfoShield portal against unauthorized changes?",
      a: "InfoShield uses enterprise server-side encryption and strict access controls. All client records and compliance data are protected on secure backend servers with multi-factor authorization and audit logs."
    }
  ];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 relative ${
      isLight ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-100"
    }`}>
      
      {/* 🟢 TOP NAVIGATION */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${
        isLight ? "bg-white/95 border-slate-200" : "bg-slate-950/95 border-slate-800"
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight block group-hover:text-cyan-500 transition">InfoShield Security</span>
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-bold uppercase tracking-wider block flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5 inline" /> Ghana Nationwide Operations
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            <a href="#services" className="hover:text-cyan-500 transition">Services</a>
            <a href="#case-studies" className="hover:text-cyan-500 transition">Case Studies</a>
            <a href="#resources" className="hover:text-cyan-500 transition">Resources</a>
            <a href="#clients" className="hover:text-cyan-500 transition">Clients</a>
            <a href="#assessment" className="hover:text-cyan-500 transition">Readiness Quiz</a>
            <a href="#faq" className="hover:text-cyan-500 transition">FAQ</a>
            <a href="#contact" className="hover:text-cyan-500 transition">Contact</a>
          </nav>

          <button
            onClick={onAccessPortal}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
          >
            <Lock className="h-3.5 w-3.5 text-cyan-500" />
            <span>Client Portal</span>
          </button>
        </div>

        {/* Mobile Quick Navigation bar */}
        <div className="lg:hidden flex items-center justify-around px-4 py-2 bg-slate-100/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 text-[11px] font-bold gap-1.5 overflow-x-auto whitespace-nowrap">
          <a href="#services" className="text-slate-600 dark:text-slate-400 hover:text-cyan-500">Services</a>
          <a href="#case-studies" className="text-slate-600 dark:text-slate-400 hover:text-cyan-500">Case Studies</a>
          <a href="#resources" className="text-slate-600 dark:text-slate-400 hover:text-cyan-500">Resources</a>
          <a href="#clients" className="text-slate-600 dark:text-slate-400 hover:text-cyan-500">Clients</a>
          <a href="#assessment" className="text-slate-600 dark:text-slate-400 hover:text-cyan-500">Quiz</a>
          <a href="#contact" className="text-slate-600 dark:text-slate-400 hover:text-cyan-500">Contact</a>
        </div>
      </header>

      {/* 🚀 HERO SECTION */}
      <section className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 mb-6">
          <MapPin className="h-3.5 w-3.5 text-cyan-500" />
          <span>Operating Nationwide Across Ghana</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span>Microfinance, FinTech & Enterprise Compliance</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
          Cybersecurity & Compliance <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Made Simple</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
          InfoShield delivers full <strong>ISO 27001</strong> & <strong>PCI DSS</strong> certification consulting, <strong>Ghana Data Protection Act (Act 843)</strong> registration, and specialized cybersecurity risk audits.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#contact"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Request a Consultation</span>
            <ChevronRight className="h-4 w-4" />
          </a>

          <a
            href="#assessment"
            className={`w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold border ${
              isLight ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50" : "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800"
            } transition flex items-center justify-center gap-2 cursor-pointer`}
          >
            <Calculator className="h-4 w-4 text-cyan-500" />
            <span>60s Readiness Quiz</span>
          </a>
        </div>
      </section>

      {/* 🏛️ TRUSTED CLIENTS & REGULATORY ACCREDITATIONS */}
      <section id="clients" className={`py-16 border-y ${
        isLight ? "bg-slate-100/70 border-slate-200" : "bg-slate-900/40 border-slate-800"
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Trust Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className={`p-4 rounded-2xl border text-center ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800"
            }`}>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 block font-mono">100%</span>
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block mt-1">BoG & Act 843 Audit Pass Rate</span>
            </div>
            <div className={`p-4 rounded-2xl border text-center ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800"
            }`}>
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 block font-mono">100%</span>
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block mt-1">Audit Readiness Success Rate</span>
            </div>
            <div className={`p-4 rounded-2xl border text-center ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800"
            }`}>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-500 block font-mono">Ghana</span>
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block mt-1">Nationwide Service Coverage</span>
            </div>
          </div>

          <p className="text-center text-xs font-mono font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-2">
            PROVEN TRACK RECORD IN GHANA
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-center tracking-tight mb-8">
            Trusted by Microfinance & Financial Leaders Across Ghana
          </h3>

          {/* Client Showcase with Official Business Vector Crest Logos and Verified Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            
            {/* Client 1: Alpha Maga Microfinance Services Ltd */}
            <div className={`p-6 rounded-3xl border relative flex flex-col justify-between ${
              isLight ? "bg-white border-slate-200 shadow-md" : "bg-slate-900 border-slate-800"
            }`}>
              <div>
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  
                  {/* Authentic Business Vector Logo */}
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 border border-amber-500/40 p-2 flex flex-col items-center justify-center shrink-0 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-6 h-6 bg-amber-500/10 rounded-full blur-xs"></div>
                    <Building2 className="h-6 w-6 text-amber-400 mb-0.5" />
                    <span className="text-[8px] font-black tracking-widest text-amber-300 font-mono">ALPHA</span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold flex items-center gap-1.5">
                      <span>Alpha Maga Microfinance Services Ltd</span>
                      <ShieldCheck className="h-4 w-4 text-cyan-500 inline shrink-0" />
                    </h4>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-cyan-500 shrink-0" />
                      <span>Mega City, Kasseh - Ada, Greater Accra, Ghana</span>
                    </p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      BoG Tier 2 Licensed • Act 843 Partner
                    </span>
                  </div>
                </div>

                <div className="relative pl-3 border-l-2 border-cyan-500 text-xs text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed mb-4">
                  "InfoShield led our complete Bank of Ghana cybersecurity framework gap analysis and Data Protection Act (Act 843) registration seamlessly. Their team under Godsway Akakpo and Isaac Apenteng gave us total regulatory confidence."
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Verified Client Partnership</span>
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-500" />
                  ))}
                </div>
              </div>
            </div>

            {/* Client 2: Integrity Infinity Microfinance Ltd */}
            <div className={`p-6 rounded-3xl border relative flex flex-col justify-between ${
              isLight ? "bg-white border-slate-200 shadow-md" : "bg-slate-900 border-slate-800"
            }`}>
              <div>
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  
                  {/* Authentic Business Vector Logo */}
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-950 via-teal-950 to-emerald-950 border border-emerald-500/40 p-2 flex flex-col items-center justify-center shrink-0 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-6 h-6 bg-emerald-500/10 rounded-full blur-xs"></div>
                    <ShieldCheck className="h-6 w-6 text-emerald-400 mb-0.5" />
                    <span className="text-[8px] font-black tracking-widest text-emerald-300 font-mono">INFINITY</span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold flex items-center gap-1.5">
                      <span>Integrity Infinity Microfinance Ltd</span>
                      <ShieldCheck className="h-4 w-4 text-blue-500 inline shrink-0" />
                    </h4>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-cyan-500 shrink-0" />
                      <span>Swedru & Cape Coast, Central Region, Ghana</span>
                    </p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                      BoG Tier 2 Licensed • Security Audit Client
                    </span>
                  </div>
                </div>

                <div className="relative pl-3 border-l-2 border-blue-500 text-xs text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed mb-4">
                  "The vulnerability assessment, penetration testing, and Bank of Ghana compliance review conducted under Godsway Akakpo and Isaac Apenteng uncovered critical endpoint exposures before our external audit. InfoShield is our trusted security partner."
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Verified Client Partnership</span>
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-500" />
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Regulatory Accreditation Seals */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 max-w-4xl mx-auto text-center">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block mb-4">
              GOVERNANCE & ACCREDITATION STANDARDS
            </span>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 opacity-80 hover:opacity-100 transition">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-xs font-bold">
                <ShieldCheck className="h-4 w-4 text-amber-500" />
                <span>Ghana DPC (Act 843) Registered</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-xs font-bold">
                <Award className="h-4 w-4 text-cyan-500" />
                <span>ISO/IEC 27001:2022 Lead Auditor</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-xs font-bold">
                <Lock className="h-4 w-4 text-emerald-500" />
                <span>PCI DSS v4.0 Qualified Partner</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-xs font-bold">
                <Building2 className="h-4 w-4 text-blue-500" />
                <span>Bank of Ghana Cyber Guidelines</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 🛡️ CORE SERVICES */}
      <section id="services" className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-2">
            OUR CORE SERVICES
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Protecting Your Operations</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
            Clear, practical cybersecurity and regulatory solutions designed for financial institutions and enterprises nationwide in Ghana.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Service 1 */}
          <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
            isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800"
          }`}>
            <div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold mb-2">Ghana Data Protection Act (Act 843)</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-4">
                Complete alignment with Ghana's Data Protection Act, 2012. We handle DPC registration, Data Protection Officer (DPO) advisory, and risk audits.
              </p>
            </div>
            <ul className="space-y-1.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>DPC Registration Support</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>DPO Advisory Services</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Microfinance Data Risk Reviews</span>
              </li>
            </ul>
          </div>

          {/* Service 2 */}
          <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
            isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800"
          }`}>
            <div>
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-4">
                <Award className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold mb-2">ISO 27001 & PCI DSS Certification</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-4">
                Hands-on consulting from day one until your firm receives official ISO 27001:2022 or PCI DSS v4.0 certification.
              </p>
            </div>
            <ul className="space-y-1.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                <span>ISMS Implementation & Policies</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                <span>PCI DSS CDE Scope Isolation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                <span>Stage 1 & 2 External Audit Defense</span>
              </li>
            </ul>
          </div>

          {/* Service 3 */}
          <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
            isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800"
          }`}>
            <div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                <FileSearch className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold mb-2">Vulnerability & Risk Assessments</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-4">
                Comprehensive vulnerability testing, penetration testing, Bank of Ghana cyber framework gap audits, and security policy engineering.
              </p>
            </div>
            <ul className="space-y-1.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Vulnerability & Penetration Testing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Bank of Ghana Cyber Guidelines Alignment</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Information Security Policy Engineering</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* 🏆 CASE STUDIES & SUCCESS STORIES SECTION */}
      <CaseStudiesSection 
        isLight={isLight} 
        onConsultationRequest={handleSubcomponentConsultation} 
      />

      {/* 📊 60-SECOND READINESS QUIZ */}
      <section id="assessment" className={`py-16 border-t ${
        isLight ? "bg-slate-100/60 border-slate-200" : "bg-slate-900/30 border-slate-800"
      }`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Free Interactive Tool</span>
            </span>
            <h3 className="text-2xl font-extrabold tracking-tight">Compliance Readiness Assessment</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select your organization parameters to identify applicable Ghana & international standards.
            </p>
          </div>

          <div className={`p-6 sm:p-8 rounded-3xl border ${
            isLight ? "bg-white border-slate-200 shadow-md" : "bg-slate-900 border-slate-800"
          }`}>
            <form onSubmit={handleQuizSubmit} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold">1. Select Organization Category:</label>
                  <span className="text-[10px] text-slate-400 font-mono">1 Selected</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {orgCategories.map((type) => (
                    <button
                      type="button"
                      key={type.id}
                      onClick={() => setQuizOrgType(type.id)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                        quizOrgType === type.id
                          ? "border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold shadow-xs"
                          : isLight ? "bg-slate-50 border-slate-200 hover:bg-slate-100" : "bg-slate-950 border-slate-800 hover:bg-slate-900"
                      }`}
                    >
                      <span className="leading-snug">{type.label}</span>
                      {quizOrgType === type.id && <Check className="h-4 w-4 text-cyan-500 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold">2. Select Immediate Focus Areas (Select All That Apply):</label>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-bold">
                    {quizGoals.length} Selected
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {quizGoalsList.map((goal) => {
                    const isSelected = quizGoals.includes(goal.id);
                    return (
                      <button
                        type="button"
                        key={goal.id}
                        onClick={() => toggleQuizGoal(goal.id)}
                        className={`p-3 rounded-xl border text-xs font-semibold text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? "border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold shadow-xs"
                            : isLight ? "bg-slate-50 border-slate-200 hover:bg-slate-100" : "bg-slate-950 border-slate-800 hover:bg-slate-900"
                        }`}
                      >
                        <span className="leading-snug">{goal.label}</span>
                        <div className={`h-4 w-4 rounded-md flex items-center justify-center border transition shrink-0 ${
                          isSelected ? "bg-cyan-500 border-cyan-500 text-white" : "border-slate-300 dark:border-slate-700"
                        }`}>
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Calculator className="h-4 w-4" />
                <span>Generate Recommended Framework Roadmap</span>
              </button>
            </form>

            {quizSubmitted && (
              <div className="mt-6 p-4.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-cyan-600 dark:text-cyan-400">
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                  <span>Custom Compliance Roadmap Prepared</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  We have mapped out a tailored compliance strategy for <strong>{orgCategories.find(c => c.id === quizOrgType)?.label}</strong> covering {quizGoals.length} focus area{quizGoals.length > 1 ? "s" : ""}:
                </p>
                <ul className="list-disc list-inside space-y-1 font-semibold text-slate-700 dark:text-slate-200 pl-1">
                  {quizGoals.map(gId => (
                    <li key={gId}>{quizGoalsList.find(g => g.id === gId)?.label}</li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-1.5 font-bold text-cyan-600 dark:text-cyan-400 underline hover:text-cyan-500 pt-1"
                >
                  <span>Click here to send these requirements directly to our consultants below ↓</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 📚 COMPLIANCE KNOWLEDGE HUB & RESOURCES */}
      <ComplianceResourcesSection
        isLight={isLight}
        onConsultationRequest={handleSubcomponentConsultation}
      />

      {/* ❓ FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section id="faq" className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-2">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Got Questions? We Have Answers.</h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border transition ${
                isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
              }`}
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left font-bold text-sm flex items-center justify-between gap-4 cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="h-4 w-4 text-cyan-500 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 font-medium border-t border-slate-100 dark:border-slate-800/80 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 📬 SIMPLE CONTACT FORM & DIRECT CONTACTS */}
      <section id="contact" className={`py-16 border-t ${
        isLight ? "bg-slate-100/60 border-slate-200" : "bg-slate-900/30 border-slate-800"
      }`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`p-8 rounded-3xl border ${
            isLight ? "bg-white border-slate-200 shadow-md" : "bg-slate-900 border-slate-800"
          }`}>
            <div className="mb-6 border-b pb-4 border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold">Get in Touch with Our Leadership</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-cyan-500" />
                <span>Operating Nationwide Across Ghana • Headquartered in Amasaman, Accra. Reach our executive team directly below.</span>
              </p>
            </div>

            {/* Executive Direct Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              
              {/* Godsway Akakpo */}
              <div>
                <span className="font-bold block text-slate-900 dark:text-slate-100 text-sm">Godsway Akakpo</span>
                <span className="text-[11px] text-slate-500 block mb-2">Managing Director & Lead Consultant</span>
                <div className="space-y-1 text-[11px]">
                  <a href="mailto:godsway.akakpo@infoshieldsec.com" className="text-cyan-600 hover:underline flex items-center gap-1 font-mono">
                    <Mail className="h-3 w-3" /> godsway.akakpo@infoshieldsec.com
                  </a>
                  <a href="tel:0247744312" className="text-slate-700 dark:text-slate-300 hover:text-cyan-500 flex items-center gap-1 font-mono">
                    <Phone className="h-3 w-3 text-cyan-500" /> 0247744312 / 0508313380
                  </a>
                </div>
              </div>

              {/* Isaac Apenteng */}
              <div>
                <span className="font-bold block text-slate-900 dark:text-slate-100 text-sm">Isaac Apenteng</span>
                <span className="text-[11px] text-slate-500 block mb-2">CTO & Lead Incident Specialist</span>
                <div className="space-y-1 text-[11px]">
                  <a href="mailto:isaac.apenteng@infoshieldsec.com" className="text-cyan-600 hover:underline flex items-center gap-1 font-mono">
                    <Mail className="h-3 w-3" /> isaac.apenteng@infoshieldsec.com
                  </a>
                  <a href="tel:0249438458" className="text-slate-700 dark:text-slate-300 hover:text-cyan-500 flex items-center gap-1 font-mono">
                    <Phone className="h-3 w-3 text-cyan-500" /> 0249438458
                  </a>
                </div>
              </div>

            </div>

            {submitSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h4 className="text-lg font-bold">Thank You!</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Your message has been received. Godsway Akakpo or Isaac Apenteng will contact you shortly.
                </p>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitContact} className="space-y-4">
                {submitError && (
                  <div className="p-3 rounded-xl bg-red-500/10 text-red-600 text-xs font-semibold">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kwesi Mensah"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs border font-medium ${
                        isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="kwesi@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs border font-medium ${
                        isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Phone or Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Alpha Maga Microfinance"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs border font-medium ${
                        isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Service Requested</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs border font-medium ${
                        isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                      }`}
                    >
                      <option value="Ghana Data Protection Act (Act 843)">Ghana Data Protection Act (Act 843)</option>
                      <option value="ISO 27001 Certification Consulting">ISO 27001 Certification Consulting</option>
                      <option value="PCI DSS v4.0 Certification Consulting">PCI DSS v4.0 Certification Consulting</option>
                      <option value="Vulnerability & Risk Assessment">Vulnerability & Risk Assessment</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5">How can we help you? *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe your security goals or compliance timeline..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border font-medium ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span>Sending Message...</span>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Send Consultation Request</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 📄 FOOTER */}
      <footer className={`border-t py-8 ${isLight ? "bg-white border-slate-200" : "bg-slate-950 border-slate-800"}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-medium">
            <Shield className="h-4 w-4 text-cyan-500" />
            <span>© 2026 InfoShield Security Operations • Operating Nationwide Across Ghana</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#services" className="hover:text-cyan-500">Services</a>
            <a href="#clients" className="hover:text-cyan-500">Clients</a>
            <a href="#assessment" className="hover:text-cyan-500">Readiness Quiz</a>
            <a href="#faq" className="hover:text-cyan-500">FAQ</a>
            <button onClick={onAccessPortal} className="text-cyan-600 font-bold hover:underline cursor-pointer">
              Client Portal
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
