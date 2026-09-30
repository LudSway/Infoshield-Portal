import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { authFetch } from "../lib/api";
import { 
  Sparkles, 
  FileText, 
  Copy, 
  Download, 
  Save, 
  Edit3, 
  Eye, 
  RefreshCw, 
  Check, 
  Building, 
  FileDown, 
  Sliders,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

// Helper to convert Markdown to pristine inline-styled HTML for Word (.doc) exports
function markdownToHtml(markdown: string): string {
  if (!markdown) return "";
  const lines = markdown.split("\n");
  let inTable = false;
  let tableRows: string[][] = [];
  let currentListType: "ul" | "ol" | null = null;
  const htmlLines: string[] = [];

  const parseInlineHtml = (text: string) => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  };

  const closeActiveList = () => {
    if (currentListType === "ul") {
      htmlLines.push("</ul>");
    } else if (currentListType === "ol") {
      htmlLines.push("</ol>");
    }
    currentListType = null;
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    // Tables
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      closeActiveList();
      inTable = true;
      if (trimmed.includes("---")) return; // skip table dividers
      const cells = trimmed
        .split("|")
        .map((c) => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      tableRows.push(cells);
      return;
    } else {
      if (inTable && tableRows.length > 0) {
        // flush table
        let tableHtml = `<table style="width:100%; border-collapse:collapse; margin:16px 0; border:1px solid #cbd5e1; font-family:'Segoe UI',Arial,sans-serif; font-size:10pt;">`;
        tableRows.forEach((row, rIdx) => {
          tableHtml += "<tr>";
          row.forEach((cell) => {
            const isHeader = rIdx === 0;
            const tag = isHeader ? "th" : "td";
            const style = isHeader
              ? `background-color:#0f172a; border:1px solid #cbd5e1; padding:10px 12px; font-weight:bold; text-align:left; color:#ffffff;`
              : `border:1px solid #cbd5e1; padding:10px 12px; text-align:left; color:#334155; background-color:${rIdx % 2 === 1 ? '#f8fafc' : '#ffffff'};`;
            tableHtml += `<${tag} style="${style}">${parseInlineHtml(cell)}</${tag}>`;
          });
          tableHtml += "</tr>";
        });
        tableHtml += "</table>";
        htmlLines.push(tableHtml);
        tableRows = [];
        inTable = false;
      }
    }

    // Headers
    if (trimmed.startsWith("# ")) {
      closeActiveList();
      htmlLines.push(`<h1 style="font-family:'Segoe UI',Arial,sans-serif; font-size:22pt; font-weight:bold; color:#0f172a; border-bottom:3px solid #06b6d4; padding-bottom:10px; margin-top:28pt; margin-bottom:14pt;">${parseInlineHtml(trimmed.substring(2))}</h1>`);
    } else if (trimmed.startsWith("## ")) {
      closeActiveList();
      htmlLines.push(`<h2 style="font-family:'Segoe UI',Arial,sans-serif; font-size:15pt; font-weight:bold; color:#0f172a; border-bottom:1.5px solid #cbd5e1; padding-bottom:6px; margin-top:20pt; margin-bottom:10pt;">${parseInlineHtml(trimmed.substring(3))}</h2>`);
    } else if (trimmed.startsWith("### ")) {
      closeActiveList();
      htmlLines.push(`<h3 style="font-family:'Segoe UI',Arial,sans-serif; font-size:12pt; font-weight:bold; color:#475569; text-transform:uppercase; margin-top:16pt; margin-bottom:8pt; letter-spacing:0.5px;">${parseInlineHtml(trimmed.substring(4))}</h3>`);
    } else if (trimmed === "---") {
      closeActiveList();
      htmlLines.push(`<hr style="border:0; border-top:1.5px solid #e2e8f0; margin:20pt 0;" />`);
    } 
    // Bullet lists
    else if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      if (currentListType !== "ul") {
        closeActiveList();
        htmlLines.push(`<ul style="margin-top:4pt; margin-bottom:8pt; padding-left:24px;">`);
        currentListType = "ul";
      }
      htmlLines.push(`<li style="font-family:'Segoe UI',Arial,sans-serif; margin-bottom:5pt; font-size:11pt; color:#334155; line-height:1.6;">${parseInlineHtml(trimmed.substring(2))}</li>`);
    } 
    // Numbered lists
    else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)/);
      if (match) {
        if (currentListType !== "ol") {
          closeActiveList();
          htmlLines.push(`<ol style="margin-top:4pt; margin-bottom:8pt; padding-left:24px;">`);
          currentListType = "ol";
        }
        htmlLines.push(`<li style="font-family:'Segoe UI',Arial,sans-serif; margin-bottom:5pt; font-size:11pt; color:#334155; line-height:1.6;">${parseInlineHtml(match[2])}</li>`);
      }
    } 
    // Plain text / paragraph
    else if (trimmed.length > 0) {
      closeActiveList();
      htmlLines.push(`<p style="font-family:'Segoe UI',Arial,sans-serif; margin-top:0; margin-bottom:10pt; font-size:11pt; color:#334155; line-height:1.6;">${parseInlineHtml(trimmed)}</p>`);
    } else {
      closeActiveList();
    }
  });

  closeActiveList();

  // Flush table if leftover
  if (inTable && tableRows.length > 0) {
    let tableHtml = `<table style="width:100%; border-collapse:collapse; margin:16px 0; border:1px solid #cbd5e1; font-family:'Segoe UI',Arial,sans-serif; font-size:10pt;">`;
    tableRows.forEach((row, rIdx) => {
      tableHtml += "<tr>";
      row.forEach((cell) => {
        const isHeader = rIdx === 0;
        const tag = isHeader ? "th" : "td";
        const style = isHeader
          ? `background-color:#0f172a; border:1px solid #cbd5e1; padding:10px 12px; font-weight:bold; text-align:left; color:#ffffff;`
          : `border:1px solid #cbd5e1; padding:10px 12px; text-align:left; color:#334155; background-color:${rIdx % 2 === 1 ? '#f8fafc' : '#ffffff'};`;
        tableHtml += `<${tag} style="${style}">${parseInlineHtml(cell)}</${tag}>`;
      });
      tableHtml += "</tr>";
    });
    tableHtml += "</table>";
    htmlLines.push(tableHtml);
  }

  return htmlLines.join("\n");
}

interface EvidenceDocGeneratorProps {
  standard: "ISO 27001" | "PCI DSS";
  clauseCode: string;
  clauseTitle: string;
  description: string;
  theme?: "light" | "dark";
  onDocumentSaved?: (id: string, saved: boolean) => void;
}

// Simple custom markdown renderer to render generated policies cleanly without external dependencies
function renderMarkdown(markdown: string, isLight: boolean) {
  if (!markdown) return null;

  const lines = markdown.split("\n");
  let inTable = false;
  let tableRows: string[][] = [];
  const renderedElements: React.ReactNode[] = [];

  const parseInline = (text: string) => {
    // Bold helper
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className={`font-extrabold ${isLight ? "text-cyan-700" : "text-cyan-400"}`}>{part}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    // Parse Tables
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      inTable = true;
      const cells = trimmed
        .split("|")
        .map((c) => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      if (trimmed.includes("---")) {
        // Divider row, skip
        return;
      }

      tableRows.push(cells);
      return;
    } else {
      if (inTable) {
        // Render stored table
        renderedElements.push(
          <div key={`table-${lineIdx}`} className={`overflow-x-auto my-4 border ${isLight ? "border-slate-200" : "border-slate-800"} rounded-xl`}>
            <table className={`min-w-full divide-y ${isLight ? "divide-slate-200 text-slate-800" : "divide-slate-850 text-slate-300"} text-[11px] font-mono`}>
              <thead className={isLight ? "bg-slate-100" : "bg-slate-900/60"}>
                <tr>
                  {tableRows[0]?.map((cell, idx) => (
                    <th key={idx} className={`px-3 py-2 text-left ${isLight ? "text-slate-700" : "text-slate-400"} font-extrabold uppercase tracking-wider`}>
                      {cell.replace(/\*\*/g, "")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? "divide-slate-200 bg-white" : "divide-slate-850 bg-slate-950/20"}`}>
                {tableRows.slice(1).map((row, rIdx) => (
                  <tr key={rIdx} className={isLight && rIdx % 2 === 1 ? "bg-slate-50" : ""}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className={`px-3 py-2 ${isLight ? "text-slate-800" : "text-slate-300"}`}>
                        {parseInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    }

    // Parse Headers
    if (trimmed.startsWith("# ")) {
      renderedElements.push(
        <h1 key={lineIdx} className={`text-base font-black tracking-tight ${isLight ? "text-slate-900 border-slate-200" : "text-slate-100 border-slate-800"} mt-6 mb-3 border-b pb-1 flex items-center gap-2`}>
          <FileText className={`h-4 w-4 ${isLight ? "text-cyan-600" : "text-cyan-500"}`} /> {trimmed.substring(2)}
        </h1>
      );
    } else if (trimmed.startsWith("## ")) {
      renderedElements.push(
        <h2 key={lineIdx} className={`text-sm font-extrabold tracking-tight ${isLight ? "text-slate-800" : "text-slate-200"} mt-5 mb-2.5`}>
          {trimmed.substring(3)}
        </h2>
      );
    } else if (trimmed.startsWith("### ")) {
      renderedElements.push(
        <h3 key={lineIdx} className={`text-xs font-bold ${isLight ? "text-slate-600" : "text-slate-400"} mt-4 mb-2 uppercase tracking-wider font-mono`}>
          {trimmed.substring(4)}
        </h3>
      );
    }
    // Dividers
    else if (trimmed === "---") {
      renderedElements.push(<hr key={lineIdx} className={`${isLight ? "border-slate-200" : "border-slate-850"} my-5`} />);
    }
    // Lists
    else if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      renderedElements.push(
        <div key={lineIdx} className={`flex items-start gap-2 ml-2 my-1 text-[11.5px] ${isLight ? "text-slate-700" : "text-slate-300"} leading-relaxed`}>
          <span className={`${isLight ? "text-cyan-600" : "text-cyan-500"} mt-1`}>•</span>
          <span>{parseInline(trimmed.substring(2))}</span>
        </div>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)/);
      if (match) {
        renderedElements.push(
          <div key={lineIdx} className={`flex items-start gap-2 ml-2 my-1 text-[11.5px] ${isLight ? "text-slate-700" : "text-slate-300"} leading-relaxed`}>
            <span className={`${isLight ? "text-cyan-600" : "text-cyan-500"} font-mono text-[10px] mt-0.5`}>{match[1]}.</span>
            <span>{parseInline(match[2])}</span>
          </div>
        );
      }
    }
    // Paragraph
    else if (trimmed.length > 0) {
      renderedElements.push(
        <p key={lineIdx} className={`text-[11.5px] ${isLight ? "text-slate-700" : "text-slate-300"} leading-relaxed my-2`}>
          {parseInline(trimmed)}
        </p>
      );
    }
  });

  return <div className={`space-y-1 ${isLight ? "text-slate-800" : "text-slate-200"}`}>{renderedElements}</div>;
}

export default function EvidenceDocGenerator({
  standard,
  clauseCode,
  clauseTitle,
  description,
  theme = "dark",
  onDocumentSaved
}: EvidenceDocGeneratorProps) {
  const isLight = theme === "light";
  const docId = `${standard.toLowerCase().replace(" ", "")}_${clauseCode.replace(/[^a-zA-Z0-9]/g, "_")}`;

  const [companyName, setCompanyName] = useState(() => {
    return localStorage.getItem("infoshield_company_name") || "InfoShield Client Corp";
  });
  const [customNotes, setCustomNotes] = useState("");
  const [generatedDoc, setGeneratedDoc] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);

  // Load existing saved document on clause switch
  useEffect(() => {
    const savedDocs = JSON.parse(localStorage.getItem("infoshield_saved_policies") || "{}");
    if (savedDocs[docId]) {
      setGeneratedDoc(savedDocs[docId]);
      setSaved(true);
      // See if it had customized company
      const storedComp = localStorage.getItem("infoshield_company_name");
      if (storedComp) setCompanyName(storedComp);
    } else {
      setGeneratedDoc("");
      setSaved(false);
    }
    setCustomNotes("");
    setIsEditing(false);
  }, [docId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSaved(false);
    
    // Save company name globally for convenient persistence
    localStorage.setItem("infoshield_company_name", companyName);

    const steps = [
      "Securing session keys & parameters...",
      "Drafting specialized compliance clauses...",
      "Structuring professional metadata headers...",
      "Aligning controls with target standards...",
      "Formatting revision logs and tables...",
      "Polishing sample evidence template..."
    ];

    let stepIdx = 0;
    setStatusMessage(steps[0]);

    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setStatusMessage(steps[stepIdx]);
      }
    }, 800);

    try {
      const res = await authFetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          standard,
          clauseCode,
          clauseTitle,
          description,
          companyName,
          customNotes
        })
      });

      const data = await res.json();
      clearInterval(interval);

      if (data.success) {
        setGeneratedDoc(data.document);
        setIsSimulated(!!data.isSimulated);
      } else {
        throw new Error(data.error || "Generation error");
      }
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      setStatusMessage("Failed to connect to generator endpoint. Generating local draft...");
      
      const dateStr = new Date().toISOString().split('T')[0];
      const docId = `POL-${clauseCode.replace(/[^a-zA-Z0-9]/g, "")}`;
      
      const fallbackDoc = `# ${standard} Security Policy Document
## ${clauseCode} - ${clauseTitle}

| Metadata Field | Value |
| --- | --- |
| **Document ID** | ${docId} |
| **Organization** | ${companyName} |
| **Version** | v1.0.0 (Customized Draft) |
| **Status** | Approved & Ready for Audit |
| **Effective Date** | ${dateStr} |
| **Classification** | Internal Confidential |
| **Review Cycle** | Annual |
| **Primary Owner** | Chief Information Security Officer (CISO) |

---

### 1. Purpose & Scope
This policy charter establishes the formal compliance parameters and core operational guidelines for **${clauseTitle}** inside **${companyName}**. 
The scope applies to all physical resources, virtual workloads, database clusters, secure storage grids, and relevant workforce personnel under the administrative authority of **${companyName}** in accordance with the **${standard}** compliance framework.

### 2. Policy Statements
* **Governance Mandate**: The board of ${companyName} formally authorizes and enforces the compliance measures described herein. All employees, administrative stakeholders, remote personnel, and contracted third-parties must adhere to these policies.
* **Control Requirement**: ${description || "Governance and implementation guidelines must be active, reviewed quarterly, and linked with automated security tracking tools."}
* **Custom Integration Notes**: ${customNotes || "No custom override instructions specified. Standard compliance tracking rules apply."}

### 3. Technical Implementation Controls
1. **Access Control & Least Privilege**: All logical, administrative, and physical entry parameters must strictly enforce multi-factor authentication (MFA) and least-privilege mapping. Static, default, or unencrypted administrative accounts are prohibited.
2. **Review & Monitoring Logs**: Operational metrics, border gateway tables, and audit logs must undergo scheduled inspections at least quarterly. Automated telemetry logs are gathered and piped to central SIEM dashboards.
3. **Training & Awareness**: Personnel with high-privilege credentials must participate in regulatory-grade compliance briefs annually to verify awareness of their responsibilities.

### 4. Technical Compliance Evidence
To verify compliant execution for an external QSA or lead ISO auditor, the security team must maintain and present:
* Certified system configurations, asset inventories, and firewall rule lists.
* Automated server or database configuration build snapshots proving active encryption.
* InfoShield Security Champion training completion rosters showing 100% active coverage.

### 5. Change Log & Revision History
| Revision Date | Version | Editor | Summary of Change |
| --- | --- | --- | --- |
| ${dateStr} | 1.0.0 | Security Office | Initial customized template generation for compliance audit check. |

---
*Note: This regulatory-grade customized policy draft was built inside the secure environment local compliance handler.*`;
      setGeneratedDoc(fallbackDoc);
      setIsSimulated(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    const savedDocs = JSON.parse(localStorage.getItem("infoshield_saved_policies") || "{}");
    savedDocs[docId] = generatedDoc;
    localStorage.setItem("infoshield_saved_policies", JSON.stringify(savedDocs));
    setSaved(true);

    if (onDocumentSaved) {
      onDocumentSaved(clauseCode, true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDoc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMD = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedDoc], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `${standard.replace(" ", "_")}_${clauseCode}_Policy.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  const handleDownloadWord = () => {
    const filename = `${standard.replace(" ", "_")}_${clauseCode}_Policy`;
    const htmlContent = markdownToHtml(generatedDoc);
    
    const wordTemplate = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <title>Compliance Document</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.6;
          color: #333333;
          margin: 1in;
        }
        h1 {
          font-size: 20pt;
          color: #0369a1;
          border-bottom: 2px solid #06b6d4;
          padding-bottom: 8px;
          margin-top: 24pt;
          margin-bottom: 12pt;
        }
        h2 {
          font-size: 14pt;
          color: #0f172a;
          border-bottom: 1px solid #cbd5e1;
          padding-bottom: 4px;
          margin-top: 18pt;
          margin-bottom: 8pt;
        }
        h3 {
          font-size: 11pt;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 14pt;
          margin-bottom: 6pt;
        }
        p {
          margin-top: 0;
          margin-bottom: 8pt;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12pt;
          margin-bottom: 12pt;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 8px;
          text-align: left;
          font-size: 10pt;
        }
        th {
          background-color: #f1f5f9;
          font-weight: bold;
          color: #0f172a;
        }
        ul, ol {
          margin-top: 0;
          margin-bottom: 8pt;
          padding-left: 20px;
        }
        li {
          margin-bottom: 4pt;
        }
        hr {
          border: 0;
          border-top: 1px solid #cbd5e1;
          margin-top: 16pt;
          margin-bottom: 16pt;
        }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>`;

    const blob = new Blob(['\ufeff' + wordTemplate], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const element = document.createElement("a");
    element.href = url;
    element.download = `${filename}.doc`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - (margin * 2);
      let y = margin + 12;

      const addHeaderFooter = (pageNumber: number) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        
        // Header line & text
        doc.text(`${standard} Compliance Portfolio  |  Official Audit Evidence`, margin, 12);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.25);
        doc.line(margin, 14, pageWidth - margin, 14);
        
        // Footer line & text
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        doc.text(`Page ${pageNumber}`, pageWidth - margin - 12, pageHeight - 10);
        doc.text(`Confidential  |  Generated via InfoShield Compliance Hub`, margin, pageHeight - 10);
      };

      addHeaderFooter(1);
      let currentPage = 1;

      const lines = generatedDoc.split("\n");
      let inTable = false;
      let tableRows: string[][] = [];

      const addText = (text: string, fontSize = 10, fontStyle = "normal", color = [51, 51, 51], spacingAfter = 4, leftIndent = 0) => {
        doc.setFont("helvetica", fontStyle);
        doc.setFontSize(fontSize);
        doc.setTextColor(color[0], color[1], color[2]);

        const cleanText = text
          .replace(/\*\*([^*]+)\*\*/g, "$1")
          .replace(/\*([^*]+)\*/g, "$1")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">");

        const adjustedContentWidth = contentWidth - leftIndent;
        const wrapped = doc.splitTextToSize(cleanText, adjustedContentWidth);
        
        wrapped.forEach((line: string) => {
          if (y + 6 > pageHeight - margin - 15) {
            doc.addPage();
            currentPage++;
            y = margin + 12;
            addHeaderFooter(currentPage);
            doc.setFont("helvetica", fontStyle);
            doc.setFontSize(fontSize);
            doc.setTextColor(color[0], color[1], color[2]);
          }
          doc.text(line, margin + leftIndent, y);
          y += (fontSize * 0.42);
        });
        y += spacingAfter;
      };

      const drawTable = (rows: string[][]) => {
        if (rows.length === 0) return;
        
        const colCount = rows[0].length;
        const colWidth = contentWidth / colCount;
        const padding = 3;
        const lineSpacing = 4.2;

        rows.forEach((row, rIdx) => {
          const isHeader = rIdx === 0;
          doc.setFont("helvetica", isHeader ? "bold" : "normal");
          doc.setFontSize(8.5);

          // Pre-wrap text for each cell in this row and find the maximum height required
          const cellLinesList = row.map(cell => {
            const cleanCell = cell
              .replace(/\*\*([^*]+)\*\*/g, "$1")
              .replace(/\*([^*]+)\*/g, "$1");
            return doc.splitTextToSize(cleanCell, colWidth - (padding * 2));
          });

          const maxLines = Math.max(...cellLinesList.map(lines => lines.length), 1);
          const cellHeight = (maxLines * lineSpacing) + (padding * 2);

          // Check page fit
          if (y + cellHeight > pageHeight - margin - 15) {
            doc.addPage();
            currentPage++;
            y = margin + 12;
            addHeaderFooter(currentPage);
            doc.setFont("helvetica", isHeader ? "bold" : "normal");
            doc.setFontSize(8.5);
          }

          // Draw cells
          row.forEach((cell, cIdx) => {
            const x = margin + (cIdx * colWidth);
            
            // Alternating row styling & headers
            if (isHeader) {
              doc.setFillColor(15, 23, 42); // deep corporate blue/black
              doc.rect(x, y, colWidth, cellHeight, "F");
              doc.setTextColor(255, 255, 255);
            } else {
              if (rIdx % 2 === 1) {
                doc.setFillColor(248, 250, 252); // soft grey
              } else {
                doc.setFillColor(255, 255, 255);
              }
              doc.rect(x, y, colWidth, cellHeight, "F");
              doc.setTextColor(51, 51, 51);
            }

            // Cell border
            doc.setDrawColor(203, 213, 225);
            doc.setLineWidth(0.15);
            doc.rect(x, y, colWidth, cellHeight, "S");

            // Cell text lines
            const lines = cellLinesList[cIdx];
            lines.forEach((lineText: string, lIdx: number) => {
              const textY = y + padding + (lIdx * lineSpacing) + 2.5;
              doc.text(lineText, x + padding, textY);
            });
          });

          y += cellHeight;
        });
        y += 4;
      };

      lines.forEach((line) => {
        const trimmed = line.trim();

        if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
          inTable = true;
          if (trimmed.includes("---")) return;
          const cells = trimmed
            .split("|")
            .map((c) => c.trim())
            .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
          tableRows.push(cells);
          return;
        } else {
          if (inTable && tableRows.length > 0) {
            drawTable(tableRows);
            tableRows = [];
            inTable = false;
          }
        }

        if (trimmed.startsWith("# ")) {
          const title = trimmed.substring(2);
          // Beautiful large modern corporate banner
          doc.setFillColor(15, 23, 42);
          doc.rect(margin, y, contentWidth, 20, "F");
          doc.setFillColor(6, 182, 212); // cyan bar at left side as brand detail
          doc.rect(margin, y, 2.5, 20, "F");
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.setTextColor(255, 255, 255);
          doc.text(title, margin + 6, y + 12.5);
          y += 28;
        } else if (trimmed.startsWith("## ")) {
          y += 3;
          addText(trimmed.substring(3), 12, "bold", [15, 23, 42], 4);
          // Add a beautiful thin bottom line under sections
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.15);
          doc.line(margin, y - 2, pageWidth - margin, y - 2);
        } else if (trimmed.startsWith("### ")) {
          y += 2;
          addText(trimmed.substring(4), 9.5, "bold", [71, 85, 105], 3);
        } else if (trimmed === "---") {
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.2);
          doc.line(margin, y, pageWidth - margin, y);
          y += 5;
        } else if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          const itemText = trimmed.substring(2);
          // Draw list item bullet
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(6, 182, 212); // brand teal bullet color
          doc.text("•", margin + 1.5, y);
          addText(itemText, 10, "normal", [51, 51, 51], 2, 5.5);
        } else if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+)\.\s(.*)/);
          if (match) {
            const num = match[1];
            const itemText = match[2];
            // Draw list item number
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(15, 23, 42);
            doc.text(`${num}.`, margin, y);
            addText(itemText, 10, "normal", [51, 51, 51], 2, 6);
          }
        } else if (trimmed.length > 0) {
          addText(trimmed, 10, "normal", [51, 51, 51], 3);
        }
      });

      if (inTable && tableRows.length > 0) {
        drawTable(tableRows);
      }

      doc.save(`${standard.replace(" ", "_")}_${clauseCode}_Policy.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF document", err);
      alert("Error generating PDF document. Please try copying the document markdown as a fallback.");
    }
  };

  const isISO = standard === "ISO 27001";
  const textAccent = isISO ? "text-cyan-500" : "text-purple-400";
  const textAccentLight = isISO ? "text-cyan-600" : "text-purple-600";
  const bgAccent = isISO ? "bg-cyan-500/10" : "bg-purple-500/10";
  const borderAccent = isISO ? "border-cyan-500/20" : "border-purple-500/20";
  const ringAccent = isISO ? "focus:ring-cyan-500" : "focus:ring-purple-500";

  return (
    <div className={`mt-6 rounded-xl border p-5 space-y-5 transition-all duration-300 ${
      isLight 
        ? "bg-slate-50 border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]" 
        : "bg-slate-900/40 border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
    }`}>
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${bgAccent} border ${borderAccent}`}>
            <Sparkles className={`h-4.5 w-4.5 ${isLight ? textAccentLight : textAccent} animate-pulse`} />
          </div>
          <div>
            <h4 className={`text-xs font-black font-mono uppercase tracking-wider ${isLight ? "text-slate-900" : "text-slate-100"}`}>
              AI Compliance Document Generator
            </h4>
            <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-400"} mt-0.5`}>
              Generate fully detailed policy drafts and evidence logs customized to your corporate controls.
            </p>
          </div>
        </div>

        {saved && (
          <div className="self-start sm:self-auto flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider">
            <CheckCircle2 className="h-3.5 w-3.5" /> Custom Evidence Saved
          </div>
        )}
      </div>

      {/* Generation Parameters Row */}
      {!generatedDoc && !isGenerating && (
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`text-[10px] font-mono uppercase ${isLight ? "text-slate-600 font-extrabold" : "text-slate-400"} block mb-1.5`}>
                Target Organization Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Enterprise Corp"
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 ${ringAccent} transition-all duration-150 ${
                    isLight 
                      ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400" 
                      : "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`text-[10px] font-mono uppercase ${isLight ? "text-slate-600 font-extrabold" : "text-slate-400"} block mb-1.5`}>
                Specific Notes or Guidelines (Optional)
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Include that we perform daily encrypted backups in AWS KMS"
                rows={1}
                className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 ${ringAccent} transition-all duration-150 resize-none ${
                  isLight 
                    ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400" 
                    : "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600"
                }`}
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className={`w-full py-2.5 text-slate-950 text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r ${
              isISO 
                ? "from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-[0_2px_12px_rgba(6,182,212,0.15)]" 
                : "from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 shadow-[0_2px_12px_rgba(168,85,247,0.15)]"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Generate Custom Sample Policy & Evidence Document
          </button>
        </div>
      )}

      {/* Loading Progress State */}
      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <RefreshCw className={`h-8 w-8 ${isLight ? textAccentLight : textAccent} animate-spin`} />
          <div className="text-center space-y-1.5">
            <p className={`text-xs font-mono font-bold ${isLight ? "text-slate-800" : "text-slate-250"} animate-pulse`}>
              {statusMessage}
            </p>
            <p className="text-[10px] text-slate-500">
              Synthesizing compliance parameters into regulatory-grade templates...
            </p>
          </div>
        </div>
      )}

      {/* Result Display State */}
      {generatedDoc && !isGenerating && (
        <div className="space-y-4">
          {isSimulated && (
            <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-[10.5px] ${
              isLight 
                ? "bg-amber-500/5 border-amber-500/20 text-amber-800" 
                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
            }`}>
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-amber-500" />
              <div>
                <strong className="font-bold">Local Compliance Baseline Document:</strong> To trigger live customized enterprise documents tailored by AI models, set up your <code className={`px-1 py-0.5 rounded text-[9.5px] ${isLight ? "bg-slate-200/70" : "bg-slate-950/60"}`}>GEMINI_API_KEY</code> in the Secrets menu of AI Studio!
              </div>
            </div>
          )}

          {/* Document Workbar Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/50 dark:border-slate-800/60 pb-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  isEditing 
                    ? isLight
                      ? "bg-cyan-500/10 text-cyan-700 border border-cyan-500/20"
                      : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                    : isLight
                      ? "bg-slate-200 text-slate-800 hover:bg-slate-300/80 border border-slate-300/30"
                      : "bg-slate-800 text-slate-200 hover:bg-slate-700/90 border border-slate-700/30"
                }`}
              >
                {isEditing ? (
                  <>
                    <Eye className="h-3.5 w-3.5" /> Preview Document
                  </>
                ) : (
                  <>
                    <Edit3 className="h-3.5 w-3.5" /> Edit Document Content
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadWord}
                title="Download Microsoft Word Document (.doc)"
                className={`px-3.5 py-2 border rounded-xl transition-all duration-150 text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  isLight 
                    ? "bg-blue-50/80 hover:bg-blue-100/90 border-blue-200/80 text-blue-700" 
                    : "bg-blue-950/20 hover:bg-blue-900/30 border-blue-900/40 text-blue-400"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Word (.doc)</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                title="Download PDF Document"
                className={`px-3.5 py-2 border rounded-xl transition-all duration-150 text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  isLight 
                    ? "bg-rose-50/80 hover:bg-rose-100/90 border-rose-200/80 text-rose-700" 
                    : "bg-rose-950/20 hover:bg-rose-900/30 border-rose-900/40 text-rose-400"
                }`}
              >
                <FileDown className="h-3.5 w-3.5" />
                <span>PDF</span>
              </button>

              <button
                onClick={handleSave}
                title="Save locally"
                className={`px-3.5 py-2 rounded-xl transition-all duration-150 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  saved 
                    ? isLight
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold"
                      : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold" 
                    : isISO 
                      ? "bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold" 
                      : "bg-purple-600 hover:bg-purple-500 text-slate-950 font-bold"
                }`}
              >
                <Save className="h-3.5 w-3.5" />
                {saved ? "Saved" : "Save Record"}
              </button>
            </div>
          </div>

          {/* Interactive Editor Container */}
          <div className={`p-4 rounded-xl border overflow-y-auto max-h-[360px] font-sans transition-all duration-155 ${
            isLight ? "bg-white border-slate-200/80 text-slate-850 shadow-inner" : "bg-slate-950 border-slate-850 text-slate-200"
          }`}>
            {isEditing ? (
              <textarea
                value={generatedDoc}
                onChange={(e) => {
                  setGeneratedDoc(e.target.value);
                  setSaved(false);
                }}
                rows={12}
                className={`w-full bg-transparent font-mono text-[11px] ${isLight ? "text-slate-800" : "text-slate-200"} focus:outline-none resize-y`}
                style={{ minHeight: "260px" }}
              />
            ) : (
              <div className="prose prose-sm max-w-none">
                {renderMarkdown(generatedDoc, isLight)}
              </div>
            )}
          </div>

          {/* Regenerate Trigger */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
            <span>Verify regulatory controls or click to recreate</span>
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to regenerate this document? Your custom edits will be lost.")) {
                  handleGenerate();
                }
              }}
              className={`hover:underline flex items-center gap-1 cursor-pointer font-bold font-mono uppercase ${
                isLight ? "text-slate-705 hover:text-slate-900" : "text-cyan-500"
              }`}
            >
              <RefreshCw className="h-3 w-3" /> Regenerate Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
