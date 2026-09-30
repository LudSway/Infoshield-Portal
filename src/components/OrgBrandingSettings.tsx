import React, { useState, useEffect } from "react";
import { 
  Building2, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Save, 
  Upload, 
  Globe, 
  Mail, 
  MapPin, 
  Award, 
  RefreshCw, 
  Sliders, 
  Sparkles,
  Info
} from "lucide-react";
import { OrgBranding } from "../types";
import { saveDocument, syncDocument } from "../lib/firebase";

interface OrgBrandingSettingsProps {
  theme?: "light" | "dark";
  onOrgBrandingUpdated?: (branding: OrgBranding) => void;
}

export const DEFAULT_ORG_BRANDING: OrgBranding = {
  companyLegalName: "InfoShield Cyber Systems Corp.",
  tradeName: "InfoShield Advisory",
  taxRegistrationId: "EIN-98-4412093",
  websiteUrl: "https://infoshield.io",
  primaryAddress: "100 Pine Street, Suite 2400, San Francisco, CA 94111",
  industry: "Financial Services / Cyber Security",
  employeeHeadcount: "100-500 Employees",
  cisoName: "Dr. Marcus Vance",
  cisoTitle: "Chief Information Security Officer (CISO)",
  cisoEmail: "ciso@infoshield.io",
  cisoSignatureText: "[VERIFIED CISO SIGNATURE: DR. MARCUS VANCE - CISO OFFICE - INFOSHIELD TRUST BOARD]",
  customLogoUrl: "",
  policyFooterDisclaimer: "CONFIDENTIAL & PROPRIETARY SECURITY DOCUMENTATION. FOR AUTHORIZED AUDIT USE ONLY.",
  lastUpdated: new Date().toISOString()
};

export default function OrgBrandingSettings({ theme = "light", onOrgBrandingUpdated }: OrgBrandingSettingsProps) {
  const isLight = theme === "light";

  const [branding, setBranding] = useState<OrgBranding>(() => {
    const saved = localStorage.getItem("infoshield_org_branding");
    return saved ? JSON.parse(saved) : DEFAULT_ORG_BRANDING;
  });

  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Sync with Firestore
  useEffect(() => {
    const unsub = syncDocument<OrgBranding>("organization", "branding", (data) => {
      if (data) {
        setBranding(data);
        localStorage.setItem("infoshield_org_branding", JSON.stringify(data));
      }
    }, DEFAULT_ORG_BRANDING);
    return () => unsub();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...branding,
      lastUpdated: new Date().toISOString()
    };

    setBranding(updated);
    localStorage.setItem("infoshield_org_branding", JSON.stringify(updated));

    if (onOrgBrandingUpdated) {
      onOrgBrandingUpdated(updated);
    }

    try {
      await saveDocument("organization", "branding", updated);
    } catch (err) {
      console.warn("Firestore sync skipped for org branding.");
    }

    setIsSaved(true);
    setSaveMessage("Organization legal details & PDF branding signature successfully saved!");
    setTimeout(() => {
      setIsSaved(false);
      setSaveMessage(null);
    }, 4000);
  };

  const handleResetDefault = () => {
    if (window.confirm("Reset organization branding to default InfoShield baseline?")) {
      setBranding(DEFAULT_ORG_BRANDING);
      localStorage.setItem("infoshield_org_branding", JSON.stringify(DEFAULT_ORG_BRANDING));
      if (onOrgBrandingUpdated) onOrgBrandingUpdated(DEFAULT_ORG_BRANDING);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
        isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800"
      }`}>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Organization & PDF Audit Branding</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Configure real business legal details, CISO digital signatures, and custom logo marks applied across all ISO 27001, PCI DSS, and Policy PDF exports.
            </p>
          </div>
        </div>

        <button
          onClick={handleResetDefault}
          className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-cyan-500 transition cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {saveMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Corporate Legal Identity */}
        <div className={`p-6 sm:p-8 rounded-3xl border ${
          isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800"
        }`}>
          <div className="flex items-center gap-3 border-b pb-4 border-slate-100 dark:border-slate-800 mb-6">
            <Building2 className="h-5 w-5 text-cyan-500" />
            <h3 className="text-base font-bold">1. Corporate Legal Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold mb-2">Full Legal Entity Name *</label>
              <input
                type="text"
                required
                value={branding.companyLegalName}
                onChange={(e) => setBranding({ ...branding, companyLegalName: e.target.value })}
                placeholder="e.g. Acme Cyber Security Inc."
                className={`w-full px-4 py-2.5 rounded-xl text-xs border font-medium ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-2">Trade Name / DBA</label>
              <input
                type="text"
                value={branding.tradeName}
                onChange={(e) => setBranding({ ...branding, tradeName: e.target.value })}
                placeholder="e.g. Acme Security"
                className={`w-full px-4 py-2.5 rounded-xl text-xs border font-medium ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-2">Registration ID / Tax Number</label>
              <input
                type="text"
                value={branding.taxRegistrationId}
                onChange={(e) => setBranding({ ...branding, taxRegistrationId: e.target.value })}
                placeholder="e.g. EIN-98-1234567"
                className={`w-full px-4 py-2.5 rounded-xl text-xs border font-medium ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-2">Official Website URL</label>
              <input
                type="url"
                value={branding.websiteUrl}
                onChange={(e) => setBranding({ ...branding, websiteUrl: e.target.value })}
                placeholder="https://yourcompany.com"
                className={`w-full px-4 py-2.5 rounded-xl text-xs border font-medium ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-2">Primary Industry</label>
              <input
                type="text"
                value={branding.industry}
                onChange={(e) => setBranding({ ...branding, industry: e.target.value })}
                placeholder="e.g. FinTech / SaaS"
                className={`w-full px-4 py-2.5 rounded-xl text-xs border font-medium ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-2">Workforce Size Range</label>
              <input
                type="text"
                value={branding.employeeHeadcount}
                onChange={(e) => setBranding({ ...branding, employeeHeadcount: e.target.value })}
                placeholder="e.g. 50-250 Employees"
                className={`w-full px-4 py-2.5 rounded-xl text-xs border font-medium ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                }`}
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold mb-2">Primary Business / HQ Address</label>
              <input
                type="text"
                value={branding.primaryAddress}
                onChange={(e) => setBranding({ ...branding, primaryAddress: e.target.value })}
                placeholder="e.g. 100 Main Street, Suite 400, New York, NY 10001"
                className={`w-full px-4 py-2.5 rounded-xl text-xs border font-medium ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Executive CISO Sign-off & Digital Signature */}
        <div className={`p-6 sm:p-8 rounded-3xl border ${
          isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800"
        }`}>
          <div className="flex items-center gap-3 border-b pb-4 border-slate-100 dark:border-slate-800 mb-6">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <h3 className="text-base font-bold">2. Executive CISO Authorization & Signature Block</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold mb-2">CISO / Security Director Name *</label>
              <input
                type="text"
                required
                value={branding.cisoName}
                onChange={(e) => setBranding({ ...branding, cisoName: e.target.value })}
                placeholder="e.g. Dr. Marcus Vance"
                className={`w-full px-4 py-2.5 rounded-xl text-xs border font-medium ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-2">Official Designation / Title *</label>
              <input
                type="text"
                required
                value={branding.cisoTitle}
                onChange={(e) => setBranding({ ...branding, cisoTitle: e.target.value })}
                placeholder="Chief Information Security Officer"
                className={`w-full px-4 py-2.5 rounded-xl text-xs border font-medium ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-2">CISO Direct Email</label>
              <input
                type="email"
                value={branding.cisoEmail}
                onChange={(e) => setBranding({ ...branding, cisoEmail: e.target.value })}
                placeholder="ciso@yourcompany.com"
                className={`w-full px-4 py-2.5 rounded-xl text-xs border font-medium ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                }`}
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold mb-2">Digital Signature Stamp Text (Embedded on Reports)</label>
              <input
                type="text"
                value={branding.cisoSignatureText}
                onChange={(e) => setBranding({ ...branding, cisoSignatureText: e.target.value })}
                placeholder="[VERIFIED CISO SIGNATURE STAMP: DR. MARCUS VANCE]"
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-mono font-bold border text-emerald-600 dark:text-emerald-400 ${
                  isLight ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-950 border-emerald-500/30"
                }`}
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                This verification signature string is automatically stamped onto exported ISO 27001 Statement of Applicability (SoA) and policy evidence PDFs.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Document Footer & Classification */}
        <div className={`p-6 sm:p-8 rounded-3xl border ${
          isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800"
        }`}>
          <div className="flex items-center gap-3 border-b pb-4 border-slate-100 dark:border-slate-800 mb-6">
            <FileText className="h-5 w-5 text-blue-500" />
            <h3 className="text-base font-bold">3. Exported Document Policy Footer Disclaimer</h3>
          </div>

          <div>
            <label className="block text-xs font-bold mb-2">Report Footer Classification Note</label>
            <textarea
              rows={3}
              value={branding.policyFooterDisclaimer}
              onChange={(e) => setBranding({ ...branding, policyFooterDisclaimer: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl text-xs border font-medium ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
              }`}
            />
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <Info className="h-4 w-4" />
            <span>Last Updated: {new Date(branding.lastUpdated).toLocaleString()}</span>
          </div>

          <button
            type="submit"
            className="px-8 py-3.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/20 transition cursor-pointer flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Organization Branding Details</span>
          </button>
        </div>
      </form>
    </div>
  );
}
