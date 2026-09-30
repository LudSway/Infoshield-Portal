import React, { useState } from "react";
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Server, 
  Lock, 
  RefreshCw, 
  Sparkles,
  Sliders
} from "lucide-react";
import { authFetch } from "../lib/api";

interface EmailDiagnosticsProps {
  theme?: "light" | "dark";
}

export default function EmailDiagnostics({ theme = "light" }: EmailDiagnosticsProps) {
  const isLight = theme === "light";

  // SMTP Settings State
  const [smtpConfig, setSmtpConfig] = useState({
    host: "smtp.gmail.com",
    port: "587",
    user: "",
    pass: "",
    fromEmail: "",
    secure: false
  });

  // Test Email Form State
  const [testEmail, setTestEmail] = useState({
    to: "xtroluv@gmail.com",
    subject: "[INFOSHIELD] Real Transactional Compliance Test Email",
    templateType: "AUDIT_ALERT",
    body: "This is a real-time transactional security notification sent via the InfoShield Security Platform API gateway. All systems operating at nominal status."
  });

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setResult(null);
    setError(null);

    try {
      const res = await authFetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmail.to,
          subject: testEmail.subject,
          body: testEmail.body,
          templateType: testEmail.templateType,
          smtpConfig: smtpConfig.host && smtpConfig.user ? smtpConfig : undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || data.details || "Failed to dispatch email");
        setResult(data);
      }
    } catch (err: any) {
      setError("Network error connecting to email dispatch endpoint.");
    } finally {
      setSending(false);
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
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Transactional Email Delivery & SMTP Dispatch</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Configure real outbound SMTP relays (SendGrid, Resend, AWS SES, Gmail) and test live audit notifications and contact acknowledgments.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            MTA Dispatch Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: SMTP Configuration Panel */}
        <div className={`lg:col-span-5 p-6 sm:p-8 rounded-3xl border ${
          isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800"
        }`}>
          <div className="flex items-center gap-3 border-b pb-4 border-slate-100 dark:border-slate-800 mb-6">
            <Server className="h-5 w-5 text-cyan-500" />
            <h3 className="text-base font-bold">SMTP Relay Configuration</h3>
          </div>

          <div className="space-y-4 text-xs font-medium">
            <div>
              <label className="block text-xs font-bold mb-1.5">SMTP Host Server</label>
              <input
                type="text"
                placeholder="smtp.gmail.com / smtp.sendgrid.net"
                value={smtpConfig.host}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                className={`w-full px-3.5 py-2 rounded-xl text-xs border font-medium ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1.5">SMTP Port</label>
                <input
                  type="text"
                  placeholder="587 / 465"
                  value={smtpConfig.port}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border font-medium ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">TLS Encryption</label>
                <select
                  value={smtpConfig.secure ? "true" : "false"}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, secure: e.target.value === "true" })}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border font-medium ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                  }`}
                >
                  <option value="false">STARTTLS (Port 587)</option>
                  <option value="true">SSL/TLS (Port 465)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">SMTP Username / Email</label>
              <input
                type="text"
                placeholder="security@yourcompany.com"
                value={smtpConfig.user}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                className={`w-full px-3.5 py-2 rounded-xl text-xs border font-medium ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">SMTP Password / App Secret</label>
              <input
                type="password"
                placeholder="••••••••••••••••"
                value={smtpConfig.pass}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                className={`w-full px-3.5 py-2 rounded-xl text-xs border font-medium ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">Custom From Address Header</label>
              <input
                type="text"
                placeholder="InfoShield Security <security@yourcompany.com>"
                value={smtpConfig.fromEmail}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
                className={`w-full px-3.5 py-2 rounded-xl text-xs border font-medium ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                }`}
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
              <span className="font-bold block text-slate-700 dark:text-slate-300">💡 Server Environment Variables:</span>
              <p>You can also define `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` directly in your container's environment or `.env.example` file.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Live Dispatch Test & MTA Console Output */}
        <div className="lg:col-span-7 space-y-8">
          <div className={`p-6 sm:p-8 rounded-3xl border ${
            isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800"
          }`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <Send className="h-5 w-5 text-emerald-500" />
                <h3 className="text-base font-bold">Dispatch Real Test Email</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-500 font-bold">POST /api/send-email</span>
            </div>

            <form onSubmit={handleSendTestEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5">Target Recipient Address *</label>
                <input
                  type="email"
                  required
                  placeholder="recipient@company.com"
                  value={testEmail.to}
                  onChange={(e) => setTestEmail({ ...testEmail, to: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs border font-medium ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">Subject Line *</label>
                <input
                  type="text"
                  required
                  value={testEmail.subject}
                  onChange={(e) => setTestEmail({ ...testEmail, subject: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs border font-medium ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">Notification Body Text</label>
                <textarea
                  rows={3}
                  value={testEmail.body}
                  onChange={(e) => setTestEmail({ ...testEmail, body: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs border font-medium ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                {sending ? (
                  <span>Dispatching Outbound Email via SMTP...</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Transactional Test Email Now</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* MTA Output Terminal Log */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Terminal className="h-4 w-4" />
                <span>MTA LOG CONSOLE OUTPUT</span>
              </div>
              <span className="text-[10px] text-slate-500">Live Server Stream</span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
                {error}
              </div>
            )}

            {result ? (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  {result.message}
                </div>

                {result.mtaLogs && result.mtaLogs.length > 0 && (
                  <div className="space-y-1 text-[11px] text-slate-300 max-h-48 overflow-y-auto">
                    {result.mtaLogs.map((line: string, i: number) => (
                      <div key={i} className="leading-relaxed">{line}</div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-500 text-[11px]">
                No dispatch logs captured yet. Click "Send Transactional Test Email Now" to trigger a live SMTP handshake test.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
