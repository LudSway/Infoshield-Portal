export interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  clientName: string;
  clientLocation: string;
  clientType: string;
  duration: string;
  readTime: string;
  impactMetrics: { label: string; value: string }[];
  challenge: string;
  solutionPhases: { phase: string; title: string; description: string; timeline: string }[];
  results: string[];
  testimonial: { quote: string; author: string; role: string };
  badgeText: string;
  badgeColor: string;
}

export const caseStudies: CaseStudy[] = [
  {
    id: "alpha-maga-iso27001",
    title: "How We Helped Alpha Maga Microfinance Achieve ISO 27001 Certification in 60 Days",
    subtitle: "A step-by-step breakdown of how InfoShield Security guided Alpha Maga Microfinance Services Ltd from initial gap assessment to zero non-conformities Stage 2 audit pass.",
    clientName: "Alpha Maga Microfinance Services Ltd",
    clientLocation: "Mega City, Kasseh - Ada, Greater Accra, Ghana",
    clientType: "BoG Tier-2 Licensed Microfinance Institution",
    duration: "58 Days (Target: 60 Days)",
    readTime: "6 min read",
    badgeText: "Featured Case Study",
    badgeColor: "amber",
    impactMetrics: [
      { label: "Time to Certification", value: "58 Days" },
      { label: "Stage 2 Non-Conformities", value: "0" },
      { label: "BoG Cyber Directive Compliance", value: "100%" },
      { label: "Staff PII Trained", value: "100%" }
    ],
    challenge: "Alpha Maga Microfinance Services Ltd faced strict regulatory mandates from the Bank of Ghana (BoG) and Ghana Data Protection Commission (DPC Act 843). With customer PII spread across branch loan management systems in Mega City, Kasseh-Ada, they lacked formal Information Security Management System (ISMS) documentation, risk matrices, and incident response procedures. An impending regulatory audit required an accelerated, audit-proof certification roadmap without disturbing daily microfinance operations.",
    solutionPhases: [
      {
        phase: "Phase 1 (Days 1–10)",
        title: "ISMS Scoping & Comprehensive Gap Assessment",
        description: "InfoShield led an on-site asset discovery across all IT endpoints, databases, and loan disbursement workflows. We identified 24 control gaps against ISO/IEC 27001:2022 Annex A controls and Bank of Ghana cyber directives.",
        timeline: "Days 1 to 10"
      },
      {
        phase: "Phase 2 (Days 11–30)",
        title: "Policy Engineering & Risk Treatment Matrix",
        description: "Engineered 18 tailored security policies including Access Control, Asset Management, Mobile Money Data Protection, and Business Continuity Plans. Applied risk treatment matrices to address high-risk loan management vulnerabilities.",
        timeline: "Days 11 to 30"
      },
      {
        phase: "Phase 3 (Days 31–45)",
        title: "Control Implementation & Staff DPC Awareness",
        description: "Deployed multi-factor authentication (MFA), endpoint logging, and network segmentation. Conducted mandatory Data Protection Act (Act 843) staff workshops for all loan officers and administrators.",
        timeline: "Days 31 to 45"
      },
      {
        phase: "Phase 4 (Days 46–58)",
        title: "Internal Audit, Management Review & External Defense",
        description: "Conducted a rigorous simulated mock audit. Coordinated directly with external ISO 27001 certification auditors for Stage 1 (Documentation Review) and Stage 2 (On-Site Verification), securing full accreditation with zero non-conformities on Day 58.",
        timeline: "Days 46 to 58"
      }
    ],
    results: [
      "Official ISO/IEC 27001:2022 Certification achieved in 58 calendar days.",
      "100% compliance alignment with Ghana Data Protection Act (Act 843) & DPC registration.",
      "Zero major or minor non-conformities issued during external Stage 2 certification audit.",
      "Full Bank of Ghana cybersecurity framework clearance for Tier-2 microfinance licensing renewal."
    ],
    testimonial: {
      quote: "InfoShield led our complete Bank of Ghana cybersecurity framework gap analysis and Data Protection Act (Act 843) registration seamlessly. Their team under Godsway Akakpo and Isaac Apenteng gave us total regulatory confidence.",
      author: "Management Board",
      role: "Alpha Maga Microfinance Services Ltd"
    }
  },
  {
    id: "integrity-infinity-audit",
    title: "Integrity Infinity Microfinance: Vulnerability Remediation & Bank of Ghana Audit Alignment",
    subtitle: "Remediating critical endpoint vulnerabilities and aligning multi-branch operations in Swedru and Cape Coast with Bank of Ghana Cyber Guidelines.",
    clientName: "Integrity Infinity Microfinance Ltd",
    clientLocation: "Swedru & Cape Coast, Central Region, Ghana",
    clientType: "BoG Tier-2 Licensed Institution",
    duration: "30 Days",
    readTime: "4 min read",
    badgeText: "Security Audit Case Study",
    badgeColor: "emerald",
    impactMetrics: [
      { label: "Vulnerabilities Remediated", value: "100%" },
      { label: "Branch Offices Audited", value: "2 Branches" },
      { label: "Audit Readiness Score", value: "98/100" },
      { label: "Remediation Turnaround", value: "14 Days" }
    ],
    challenge: "Operating across Swedru and Cape Coast, Integrity Infinity Microfinance needed urgent vulnerability assessment and penetration testing to fulfill Bank of Ghana cyber directives prior to an external regulatory review.",
    solutionPhases: [
      {
        phase: "Phase 1",
        title: "Internal & External Penetration Testing",
        description: "InfoShield executed automated flaw scanning and manual exploitation tests across core banking servers, wireless branch networks, and employee workstations.",
        timeline: "Days 1 to 7"
      },
      {
        phase: "Phase 2",
        title: "Rapid Patching & Policy Hardening",
        description: "Delivered an prioritized remediation matrix. Patched unencrypted data transmission paths, hardened firewall rules, and implemented endpoint security policies.",
        timeline: "Days 8 to 21"
      },
      {
        phase: "Phase 3",
        title: "Final Verification & BoG Compliance Reporting",
        description: "Re-tested all assets to confirm 100% vulnerability resolution. Generated audit-ready compliance proof reports for Bank of Ghana examiners.",
        timeline: "Days 22 to 30"
      }
    ],
    results: [
      "All critical and high-severity network vulnerabilities remediated within 14 days.",
      "Comprehensive Bank of Ghana cyber compliance documentation submitted and approved.",
      "Multi-branch security posture fortified with centralized logging and access governance."
    ],
    testimonial: {
      quote: "The vulnerability assessment, penetration testing, and Bank of Ghana compliance review conducted under Godsway Akakpo and Isaac Apenteng uncovered critical endpoint exposures before our external audit. InfoShield is our trusted security partner.",
      author: "Executive Management",
      role: "Integrity Infinity Microfinance Ltd"
    }
  }
];
