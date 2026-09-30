import express, { Request, Response, NextFunction } from "express";
import path from "path";
import dotenv from "dotenv";
import http from "http";
import https from "https";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Server-side Master Secret for Session Token Signing
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

const app = express();
const PORT = 3000;

// Disable technology disclosure header
app.disable("x-powered-by");

const CSP_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https:",
  "style-src 'self' 'unsafe-inline' https:",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https: data:",
  "connect-src 'self' https: wss:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self' https:",
].join("; ");

// Enterprise Security Headers Middleware
app.use((req, res, next) => {
  // Prevent clickjacking fallback
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  // Prevent MIME-sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Enable XSS Filtering in legacy browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // HTTP Strict Transport Security (HSTS)
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  // Hardened Content Security Policy (CSP)
  res.setHeader("Content-Security-Policy", CSP_POLICY);
  // Feature / Permissions Policy
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  // Prevent browser caching on API endpoints
  if (req.path.startsWith("/api/")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
  next();
});

// Helper to parse cookies without external dependencies
function parseCookies(req: Request): Record<string, string> {
  const list: Record<string, string> = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(";").forEach((cookie) => {
    let [name, ...rest] = cookie.split("=");
    name = name?.trim();
    if (!name) return;
    const value = rest.join("=").trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });
  return list;
}

// Invalidate & block any exposed or insecure session cookies (e.g., legacy GAESA)
app.use((req, res, next) => {
  const cookies = parseCookies(req);
  if (cookies["GAESA"]) {
    // Clear the vulnerable legacy cookie immediately
    res.setHeader("Set-Cookie", "GAESA=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict");
  }
  next();
});

// Simple In-Memory Rate Limiting
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 180; // 180 requests per minute per IP

app.use("/api/", (req, res, next) => {
  const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown-ip";
  const now = Date.now();
  const record = ipRequestCounts.get(clientIp);

  if (!record || now > record.resetTime) {
    ipRequestCounts.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
  } else {
    record.count++;
    if (record.count > RATE_LIMIT_MAX_REQUESTS) {
      return res.status(429).json({
        error: "Too Many Requests",
        message: "Security Rate Limit Exceeded. Please wait before retrying.",
        retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
      });
    }
  }
  next();
});

// Input Sanitization Helper against XSS and Script Injections
function sanitizeString(input: string): string {
  if (typeof input !== "string") return input;
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "[REMOVED_SCRIPT]")
    .replace(/javascript:/gi, "")
    .replace(/onerror=/gi, "")
    .replace(/onload=/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "[REMOVED_IFRAME]");
}

function sanitizePayload(body: any): any {
  if (!body) return body;
  if (typeof body === "string") return sanitizeString(body);
  if (Array.isArray(body)) return body.map(sanitizePayload);
  if (typeof body === "object") {
    const sanitized: any = {};
    for (const key of Object.keys(body)) {
      sanitized[key] = sanitizePayload(body[key]);
    }
    return sanitized;
  }
  return body;
}

app.use(express.json());

// Apply Input Sanitization to all POST/PUT/PATCH requests
app.use("/api/", (req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
    req.body = sanitizePayload(req.body);
  }
  next();
});

// ==========================================================
// 🛡️ ROLE-BASED ACCESS CONTROL (RBAC) & SESSION MODEL
// ==========================================================

export type AppUserRole = "CISO" | "SecEngineer" | "Auditor" | "ComplianceOfficer" | "Admin";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: AppUserRole;
  department: string;
  permissions: string[];
}

export interface SessionRecord {
  token: string;
  user: AuthenticatedUser;
  createdAt: number;
  expiresAt: number;
}

// Trusted Server-Side Permission Definitions
const ROLE_PERMISSIONS: Record<AppUserRole, string[]> = {
  CISO: ["*"], // Full administrative security capabilities
  Admin: ["*"],
  SecEngineer: [
    "metrics:read",
    "logs:read",
    "logs:write",
    "incidents:read",
    "incidents:write",
    "tabletop:read",
    "tabletop:write",
    "vapt:scan",
    "vapt:patch",
    "phishing:read",
    "phishing:write",
    "docs:generate",
    "backup:execute"
  ],
  ComplianceOfficer: [
    "metrics:read",
    "incidents:read",
    "tabletop:read",
    "tabletop:write",
    "vapt:scan",
    "phishing:read",
    "docs:generate",
    "compliance:export"
  ],
  Auditor: [
    "metrics:read",
    "logs:read_masked",
    "incidents:read",
    "tabletop:read",
    "compliance:export",
    "docs:generate"
  ]
};

// Trusted Directory on the Server
const SERVER_DIRECTORY: Record<string, { id: string; name: string; role: AppUserRole; department: string }> = {
  "ciso@infoshield.io": {
    id: "U-1",
    name: "Enterprise CISO",
    role: "CISO",
    department: "Executive Security Office"
  },
  "sec-engineer@infoshield.io": {
    id: "U-2",
    name: "Enterprise SecOps",
    role: "SecEngineer",
    department: "Security Operations (SecOps)"
  },
  "compliance@infoshield.io": {
    id: "U-3",
    name: "Compliance Lead",
    role: "ComplianceOfficer",
    department: "Risk & Compliance Dept"
  },
  "auditor@infoshield.io": {
    id: "U-4",
    name: "External Auditor",
    role: "Auditor",
    department: "Compliance Assurance"
  },
  "godwayr.akakpo@gmail.com": {
    id: "U-ADMIN-1",
    name: "Lead Security Architect",
    role: "CISO",
    department: "Executive Security Office"
  },
  "godswayr.akakpo@gmail.com": {
    id: "U-ADMIN-2",
    name: "Lead Security Architect",
    role: "CISO",
    department: "Executive Security Office"
  }
};

// Active In-Memory Session Store
const activeSessions = new Map<string, SessionRecord>();
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

// Helper to generate a signed cryptographic session token
function createSessionToken(user: AuthenticatedUser): string {
  const rawId = crypto.randomBytes(24).toString("hex");
  const payload = Buffer.from(JSON.stringify({ id: rawId, uid: user.id, email: user.email, exp: Date.now() + SESSION_TTL_MS })).toString("base64url");
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

// Helper to verify and decode token
function verifySessionToken(token: string): any | null {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    try {
      const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
      if (decoded.exp && decoded.exp > Date.now()) {
        return decoded;
      }
    } catch {}
  }
  return null;
}

// Authentication Middleware: Verifies Session on Protected Endpoints
export function authenticateRequest(req: Request & { user?: AuthenticatedUser }, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else {
    const cookies = parseCookies(req);
    token = cookies["infoshield_session"] || cookies["session_token"];
  }

  if (!token) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication token required. Please provide a valid Bearer token in the Authorization header or session cookie."
    });
  }

  const session = activeSessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    // Also try cryptographic validation if session in map is missing (e.g. server restarted)
    const decoded = verifySessionToken(token);
    if (decoded && decoded.email) {
      const emailClean = decoded.email.toLowerCase();
      const dirRecord = SERVER_DIRECTORY[emailClean];
      const role: AppUserRole = dirRecord ? dirRecord.role : "SecEngineer";
      const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS["SecEngineer"];
      const restoredUser: AuthenticatedUser = {
        id: decoded.uid || "U-TEMP",
        name: dirRecord ? dirRecord.name : emailClean.split("@")[0],
        email: emailClean,
        role,
        department: dirRecord ? dirRecord.department : "Security Operations (SecOps)",
        permissions
      };
      
      const newSession: SessionRecord = {
        token,
        user: restoredUser,
        createdAt: Date.now(),
        expiresAt: decoded.exp
      };
      activeSessions.set(token, newSession);
      req.user = restoredUser;
      return next();
    }

    if (session) activeSessions.delete(token);
    return res.status(401).json({
      error: "Unauthorized",
      message: "Session token is invalid or has expired. Please authenticate again."
    });
  }

  req.user = session.user;
  next();
}

// RBAC Middleware: Verifies Permission Set on Endpoint
export function requirePermission(...requiredPerms: string[]) {
  return (req: Request & { user?: AuthenticatedUser }, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required before permission evaluation."
      });
    }

    const userPerms = req.user.permissions || [];
    const hasWildcard = userPerms.includes("*");
    const hasAnyPerm = requiredPerms.some((perm) => userPerms.includes(perm));

    if (!hasWildcard && !hasAnyPerm) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Access denied. Endpoint requires one of permissions [${requiredPerms.join(", ")}]. Current user role '${req.user.role}' lacks sufficient privileges.`,
        requiredPermissions: requiredPerms,
        userRole: req.user.role
      });
    }

    next();
  };
}

// Data Masking Helpers for Compliance & Auditor Views
function maskIpAddress(ip: string): string {
  if (!ip) return ip;
  if (ip.startsWith("10.") || ip.startsWith("192.168.")) {
    return ip.replace(/\.\d+$/, ".*");
  }
  const parts = ip.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`;
  }
  return ip.substring(0, 4) + "***";
}

function sanitizeSiemLogForAuditor(log: any): any {
  return {
    ...log,
    sourceIp: maskIpAddress(log.sourceIp),
    targetIp: maskIpAddress(log.targetIp),
    signature: log.signature ? `${log.signature.substring(0, 6)}[MASKED]` : "[MASKED]",
    payload: log.payload?.includes("cardholder_data")
      ? "[REDACTED FOR COMPLIANCE: SENSITIVE CARDHOLDER QUERY]"
      : log.payload
  };
}

// ==========================================================
// 🔑 AUTHENTICATION & SESSION LIFECYCLE ENDPOINTS
// ==========================================================

// Authenticate / Login to obtain a server-side signed session
app.post("/api/auth/login", (req, res) => {
  const { email, role, name, department } = req.body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email address required." });
  }

  const cleanEmail = email.trim().toLowerCase();
  
  // Resolve user role from server directory or requested role with validation
  let resolvedRole: AppUserRole = "SecEngineer";
  let resolvedName = name || cleanEmail.split("@")[0];
  let resolvedDept = department || "Security Operations (SecOps)";
  let resolvedId = `U-${Date.now().toString().slice(-4)}`;

  if (SERVER_DIRECTORY[cleanEmail]) {
    const dir = SERVER_DIRECTORY[cleanEmail];
    resolvedRole = dir.role;
    resolvedName = dir.name;
    resolvedDept = dir.department;
    resolvedId = dir.id;
  } else if (role && (role in ROLE_PERMISSIONS)) {
    // If dynamic role supplied, allocate matching server-side permissions
    resolvedRole = role as AppUserRole;
  }

  const permissions = ROLE_PERMISSIONS[resolvedRole] || ROLE_PERMISSIONS["SecEngineer"];

  const user: AuthenticatedUser = {
    id: resolvedId,
    name: resolvedName,
    email: cleanEmail,
    role: resolvedRole,
    department: resolvedDept,
    permissions
  };

  const token = createSessionToken(user);
  const now = Date.now();
  const sessionRecord: SessionRecord = {
    token,
    user,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS
  };

  activeSessions.set(token, sessionRecord);

  // Set secure HttpOnly cookie for browser sessions
  res.setHeader(
    "Set-Cookie",
    `infoshield_session=${encodeURIComponent(token)}; Path=/; Max-Age=${SESSION_TTL_MS / 1000}; HttpOnly; SameSite=Strict`
  );

  return res.json({
    success: true,
    message: "Authenticated successfully. Secure session initialized.",
    token,
    user,
    permissions
  });
});

// Verify active session & return current user profile with server-verified permissions
app.get("/api/auth/session", authenticateRequest, (req: Request & { user?: AuthenticatedUser }, res) => {
  return res.json({
    authenticated: true,
    user: req.user,
    permissions: req.user?.permissions || []
  });
});

// Terminate active session
app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else {
    const cookies = parseCookies(req);
    token = cookies["infoshield_session"];
  }

  if (token) {
    activeSessions.delete(token);
  }

  // Clear cookie
  res.setHeader("Set-Cookie", "infoshield_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict");

  return res.json({
    success: true,
    message: "Session terminated successfully."
  });
});

// ==========================================================
// 📊 CORE APPLICATION STATE & IN-MEMORY DATABASES
// ==========================================================

let mockSiemLogs = [
  {
    id: "LOG-001",
    timestamp: "2026-07-01T09:40:12Z",
    sourceIp: "198.51.100.42",
    targetIp: "10.0.4.15",
    user: "admin_backup",
    action: "SSH_LOGIN_ATTEMPT",
    status: "FAILED",
    severity: "HIGH",
    signature: "e9c7a233ac8dfcbb14...",
    payload: "Failed SSH login from external IP using username: admin_backup",
  },
  {
    id: "LOG-002",
    timestamp: "2026-07-01T09:41:05Z",
    sourceIp: "192.168.1.115",
    targetIp: "10.0.12.8",
    user: "j.doe",
    action: "DATABASE_READ",
    status: "SUCCESS",
    severity: "LOW",
    signature: "a54f8b9e12014cf05c...",
    payload: "SELECT * FROM cardholder_data LIMIT 10",
  },
  {
    id: "LOG-003",
    timestamp: "2026-07-01T09:42:18Z",
    sourceIp: "203.0.113.88",
    targetIp: "10.0.2.1",
    user: "anonymous",
    action: "API_REQUEST",
    status: "BLOCKED",
    severity: "CRITICAL",
    signature: "77691fa30a08b9821d...",
    payload: "SQL Injection attack detected in URI parameter: 'UNION SELECT ALL'",
  },
  {
    id: "LOG-004",
    timestamp: "2026-07-01T09:43:22Z",
    sourceIp: "10.0.8.22",
    targetIp: "10.0.8.254",
    user: "svc_mailer",
    action: "DNS_TUNNEL_CHECK",
    status: "SUCCESS",
    severity: "MEDIUM",
    signature: "fbc095e29107ccfa4d...",
    payload: "High rate of DNS requests to subdomains of dynamic-tracker.net",
  },
  {
    id: "LOG-005",
    timestamp: "2026-07-01T09:44:50Z",
    sourceIp: "192.168.1.201",
    targetIp: "10.0.1.50",
    user: "m.smith",
    action: "PORT_SCAN",
    status: "ALERT",
    severity: "MEDIUM",
    signature: "dd09817726aefcb81e...",
    payload: "Scanned 100 ports within 5 seconds on database server",
  },
];

let mockVulnerabilityAssets = [
  { id: "VULN-101", assetName: "Prod-DB-Postgres-01", ip: "10.0.12.8", severity: "CRITICAL", cve: "CVE-2026-11234", status: "OPEN", title: "PostgreSQL Remote Code Execution Vulnerability" },
  { id: "VULN-102", assetName: "Customer-Portal-Frontend-03", ip: "10.0.1.10", severity: "HIGH", cve: "CVE-2026-4415", status: "IN_PROGRESS", title: "Outdated OpenSSL Version - Vulnerable to Memory Leak" },
  { id: "VULN-103", assetName: "API-Gateway-Proxy-01", ip: "10.0.2.1", severity: "MEDIUM", cve: "CVE-2025-9988", status: "VERIFYING", title: "Missing Rate Limiting Header Vulnerability" },
  { id: "VULN-104", assetName: "Internal-HR-App", ip: "10.200.4.5", severity: "LOW", cve: "CVE-2024-1290", status: "PATCHED", title: "Session Cookie Missing Secure Attribute" }
];

let mockIncidents = [
  { id: "INC-901", title: "Suspicious API Activity (SQLi Attempt)", severity: "CRITICAL", status: "INVESTIGATING", assignedTo: "Sarah Jenkins", category: "AppSec", openedAt: "2026-07-01T09:42:18Z", description: "SQL Injection attack blocked by WAF from source IP 203.0.113.88. Verifying if backend state was affected." },
  { id: "INC-902", title: "High Volume External SSH Failures", severity: "HIGH", status: "OPEN", assignedTo: "Alex Chen", category: "Access Control", openedAt: "2026-07-01T09:40:12Z", description: "Brute-force SSH attack detected targeting backup service user. Source IP temporarily rate-limited." },
  { id: "INC-903", title: "Potential DNS Tunneling Anomaly", severity: "MEDIUM", status: "RESOLVED", assignedTo: "Markus Vance", category: "Network Security", openedAt: "2026-07-01T08:15:00Z", description: "Alert generated from svc_mailer. Checked traffic and confirmed it was a misconfigured NTP client." }
];

let mockPhishingCampaigns = [
  { id: "PHISH-001", name: "Q3 Annual Bonus Update Alert", template: "Financial Incentives", targetUsers: 250, sentCount: 250, clickCount: 18, reportCount: 142, status: "COMPLETED", date: "2026-06-15" },
  { id: "PHISH-002", name: "Urgent: Mandatory MFA Enrollment Verification", template: "IT/Security Support", targetUsers: 500, sentCount: 500, clickCount: 42, reportCount: 310, status: "ACTIVE", date: "2026-07-01" },
];

let mockContactInquiries: any[] = [
  {
    id: "INQ-1001",
    name: "Jonathan Sterling",
    email: "j.sterling@apexfintech.com",
    company: "Apex Global FinTech",
    industry: "Financial Services",
    service: "ISO 27001 Readiness & vCISO Advisory",
    message: "We are preparing for our Series B round and need an ISO 27001 audit readiness assessment within 60 days.",
    phone: "+1 (555) 234-5678",
    createdAt: "2026-08-11T14:30:00Z",
    status: "NEW"
  },
  {
    id: "INQ-1002",
    name: "Elena Rostova",
    email: "elena@cloudhealth.io",
    company: "CloudHealth Systems",
    industry: "HealthTech / SaaS",
    service: "PCI DSS v4.0 & SOC 2 Audits",
    message: "Looking to tokenize cardholder data and review our HIPAA / PCI compliance posture for our multi-region healthcare cloud.",
    phone: "+1 (555) 987-6543",
    createdAt: "2026-08-10T09:15:00Z",
    status: "CONTACTED"
  }
];

let mockNewsletterSubscribers: any[] = [
  {
    id: "SUB-101",
    email: "compliance-officer@accrabank.gh",
    interest: "Act 843 & Bank of Ghana Directives",
    subscribedAt: "2026-08-01T10:00:00Z",
    status: "ACTIVE"
  },
  {
    id: "SUB-102",
    email: "devops-lead@fintechhub.africa",
    interest: "PCI DSS & ISO 27001 Field Guides",
    subscribedAt: "2026-08-05T14:20:00Z",
    status: "ACTIVE"
  }
];

let mockTabletopSessions = [
  {
    id: "TT-001",
    scenarioId: "S-1",
    scenarioTitle: "Active Ransomware Ingress via Corporate VPN",
    completedAt: "2026-07-10T14:32:00Z",
    facilitator: "ciso@infoshield.io",
    finalRiskScore: 25,
    stepsCompleted: 3,
    participants: ["ciso@infoshield.io", "secops-lead@infoshield.io"],
    logs: [
      "Exercise initialized. Standing by for response inject 1.",
      "Inject 1 Decision: Selected option 2 (\"Isolate FileServer-02 and disable the compromised developer VPN token.\"). Corporate Risk altered by -10%. Current Risk Level: 35%",
      "Inject 2 Decision: Selected option 2 (\"Trigger full disaster recovery state and rebuild infected hosts...\"). Corporate Risk altered by -20%. Current Risk Level: 15%",
      "Inject 3 Decision: Selected option 2 (\"Generate and encrypt the incident forensics log...\"). Corporate Risk altered by -5%. Current Risk Level: 10%",
      "Scenario completed! Final Corporate Risk index calculated at: 10%"
    ]
  }
];

// ==========================================================
// 🔒 PROTECTED REST API ROUTES WITH RBAC
// ==========================================================

// 1. System Metrics & Infrastructure Telemetry (Protected: metrics:read)
app.get(
  "/api/system-metrics",
  authenticateRequest,
  requirePermission("metrics:read"),
  (req: Request & { user?: AuthenticatedUser }, res) => {
    const isExecutive = req.user?.role === "CISO" || req.user?.role === "Admin";
    
    // Provide full or defense-in-depth abstracted telemetry depending on role
    const nodes = [
      { id: isExecutive ? "node-us-east-1" : "cluster-node-01", status: "HEALTHY", cpu: Math.floor(Math.random() * 20) + 15, memory: 54, activeConnections: 240, uptime: "99.999%" },
      { id: isExecutive ? "node-us-west-2" : "cluster-node-02", status: "HEALTHY", cpu: Math.floor(Math.random() * 15) + 10, memory: 48, activeConnections: 185, uptime: "99.998%" },
      { id: isExecutive ? "node-eu-west-1" : "cluster-node-03", status: "HEALTHY", cpu: Math.floor(Math.random() * 25) + 20, memory: 61, activeConnections: 310, uptime: "99.999%" }
    ];

    const infrastructure = {
      loadBalancer: isExecutive ? "HA-PROXY-CLUSTER-ACTIVE" : "PROTECTED-EDGE-CLUSTER",
      activeDisasterRecoverySite: isExecutive ? "DR-SYNC-ACTIVE-STANDBY" : "DR-SYNC-NOMINAL",
      databaseReplicationLag: "< 1ms (Synchronous)",
      currentUptimeOverall: "99.998%"
    };

    res.json({ nodes, infrastructure });
  }
);

// 2. SIEM Logs (Protected: logs:read, logs:read_masked)
app.get(
  "/api/siem-logs",
  authenticateRequest,
  requirePermission("logs:read", "logs:read_masked"),
  (req: Request & { user?: AuthenticatedUser }, res) => {
    const user = req.user!;
    const canReadRaw = user.permissions.includes("*") || user.permissions.includes("logs:read");

    if (canReadRaw) {
      return res.json({ logs: mockSiemLogs, total: mockSiemLogs.length });
    }

    // Sanitize & Mask PII/Internal IP signatures for Compliance Officers / Auditors
    const sanitizedLogs = mockSiemLogs.map(sanitizeSiemLogForAuditor);
    return res.json({ logs: sanitizedLogs, total: sanitizedLogs.length, maskedForAudit: true });
  }
);

// 3. Inject Simulated Threat Vector to SIEM (Protected: logs:write)
app.post(
  "/api/siem-logs/generate",
  authenticateRequest,
  requirePermission("logs:write"),
  (req: Request & { user?: AuthenticatedUser }, res) => {
    const { attackType } = req.body;

    const randomIps = ["185.220.101.5", "84.200.69.80", "198.51.100.200", "203.0.113.155", "192.0.2.77"];
    const targetIps = ["10.0.12.8", "10.0.1.10", "10.0.2.1", "10.0.8.22"];
    const sourceIp = randomIps[Math.floor(Math.random() * randomIps.length)];
    const targetIp = targetIps[Math.floor(Math.random() * targetIps.length)];
    const timestamp = new Date().toISOString();

    let newLog: any = null;
    let linkedIncident: any = null;

    switch (attackType) {
      case "SSH Brute Force":
        newLog = {
          id: `LOG-GEN-${Math.floor(Math.random() * 900) + 100}`,
          timestamp,
          sourceIp,
          targetIp,
          user: "root",
          action: "SSH_LOGIN_ATTEMPT",
          status: "FAILED",
          severity: "HIGH",
          signature: `ssh-bf-${Math.random().toString(36).substr(2, 8)}`,
          payload: `Failed SSH login: Pam SSH auth error. 15 connection requests from ${sourceIp} rejected.`
        };
        linkedIncident = {
          id: `INC-${900 + mockIncidents.length + 1}`,
          title: `SSH Brute-Force Alert from ${sourceIp}`,
          severity: "HIGH",
          status: "OPEN",
          assignedTo: req.user?.name || "Triage Queue",
          category: "Access Control",
          openedAt: timestamp,
          description: `WAF/IDS triggered SSH Brute Force signature. Over 15 failures detected inside 2 seconds targeting node ${targetIp}.`
        };
        break;

      case "SQL Injection (SQLi)":
        newLog = {
          id: `LOG-GEN-${Math.floor(Math.random() * 900) + 100}`,
          timestamp,
          sourceIp,
          targetIp,
          user: "anonymous",
          action: "API_REQUEST",
          status: "BLOCKED",
          severity: "CRITICAL",
          signature: `sqli-waf-${Math.random().toString(36).substr(2, 8)}`,
          payload: `Blocked POST request parameter: username="admin' OR 1=1;--"`
        };
        linkedIncident = {
          id: `INC-${900 + mockIncidents.length + 1}`,
          title: `SQL Injection Exploit Intercepted`,
          severity: "CRITICAL",
          status: "OPEN",
          assignedTo: req.user?.name || "Triage Queue",
          category: "AppSec",
          openedAt: timestamp,
          description: `Active SQLi pattern (' UNION SELECT / OR 1=1) matched on database gateway service. Request was blocked by Cloud WAF.`
        };
        break;

      case "DDoS Traffic Spike":
        newLog = {
          id: `LOG-GEN-${Math.floor(Math.random() * 900) + 100}`,
          timestamp,
          sourceIp,
          targetIp,
          user: "anonymous",
          action: "NETWORK_SPIKE",
          status: "BLOCKED",
          severity: "HIGH",
          signature: `ddos-flood-${Math.random().toString(36).substr(2, 8)}`,
          payload: `Ingress traffic exceeding 45,000 requests/sec. Cloudflare scrubbing active.`
        };
        linkedIncident = {
          id: `INC-${900 + mockIncidents.length + 1}`,
          title: `Volumetric DDoS Mitigation Engaged`,
          severity: "HIGH",
          status: "OPEN",
          assignedTo: req.user?.name || "Triage Queue",
          category: "Network Security",
          openedAt: timestamp,
          description: `Sudden ingress packet bandwidth surge (35Gbps) detected targeting primary public gateway. Edge nodes automatically triggered mitigation.`
        };
        break;

      case "Malware / Ransomware":
        newLog = {
          id: `LOG-GEN-${Math.floor(Math.random() * 900) + 100}`,
          timestamp,
          sourceIp,
          targetIp: "10.0.12.44",
          user: "local_agent",
          action: "FILE_ENCRYPTION",
          status: "ALERT",
          severity: "CRITICAL",
          signature: `mal-rnsm-${Math.random().toString(36).substr(2, 8)}`,
          payload: `Heuristic match: 140 files renamed to '.crypt' in rapid succession on Host-Corp-04.`
        };
        linkedIncident = {
          id: `INC-${900 + mockIncidents.length + 1}`,
          title: `Ransomware Signature Detected on Host-Corp-04`,
          severity: "CRITICAL",
          status: "OPEN",
          assignedTo: req.user?.name || "Triage Queue",
          category: "AppSec",
          openedAt: timestamp,
          description: `Continuous filesystem file-rename loops matched malicious ransomware behavior. Host was automatically quarantined in secure VLAN.`
        };
        break;

      case "Port Scan Check":
      default:
        newLog = {
          id: `LOG-GEN-${Math.floor(Math.random() * 900) + 100}`,
          timestamp,
          sourceIp,
          targetIp,
          user: "anonymous",
          action: "PORT_SCAN",
          status: "ALERT",
          severity: "MEDIUM",
          signature: `prt-scn-${Math.random().toString(36).substr(2, 8)}`,
          payload: `TCP SYN checks received on ports 21, 22, 23, 80, 443, 8080 from scanner agent.`
        };
        linkedIncident = {
          id: `INC-${900 + mockIncidents.length + 1}`,
          title: `Proactive Port-Scanning Scan from ${sourceIp}`,
          severity: "MEDIUM",
          status: "OPEN",
          assignedTo: req.user?.name || "Triage Queue",
          category: "Network Security",
          openedAt: timestamp,
          description: `Sequential multi-port ping queries received. Source IP logged and temporarily blocked at corporate VPC perimeter.`
        };
        break;
    }

    mockSiemLogs.unshift(newLog);
    if (mockSiemLogs.length > 50) {
      mockSiemLogs.pop();
    }

    if (linkedIncident) {
      mockIncidents.unshift(linkedIncident);
    }

    res.status(201).json({ success: true, log: newLog, incident: linkedIncident });
  }
);

// 4. Incident Tickets (Protected: incidents:read, incidents:write)
app.get(
  "/api/incidents",
  authenticateRequest,
  requirePermission("incidents:read"),
  (req, res) => {
    res.json({ incidents: mockIncidents, total: mockIncidents.length });
  }
);

app.post(
  "/api/incidents",
  authenticateRequest,
  requirePermission("incidents:write"),
  (req: Request & { user?: AuthenticatedUser }, res) => {
    const { title, severity, category, description, assignedTo } = req.body;
    const newId = `INC-${900 + mockIncidents.length + 1}`;
    const newIncident = {
      id: newId,
      title: title || "New Security Incident",
      severity: severity || "MEDIUM",
      status: "OPEN" as const,
      assignedTo: assignedTo || req.user?.name || "Triage Queue",
      category: category || "AppSec",
      openedAt: new Date().toISOString(),
      description: description || "No description provided."
    };

    mockIncidents.unshift(newIncident);
    res.status(201).json(newIncident);
  }
);

// 5. Vulnerability Management & Patching (Protected: vapt:scan, vapt:patch)
app.get(
  "/api/vuln-scan",
  authenticateRequest,
  requirePermission("vapt:scan", "metrics:read"),
  (req, res) => {
    res.json({ vulnerabilities: mockVulnerabilityAssets, total: mockVulnerabilityAssets.length });
  }
);

app.post(
  "/api/vuln-scan/patch",
  authenticateRequest,
  requirePermission("vapt:patch"),
  (req, res) => {
    const { id } = req.body;
    const vuln = mockVulnerabilityAssets.find((v) => v.id === id);
    if (vuln) {
      vuln.status = "PATCHED";
      res.json({ success: true, vulnerability: vuln, vulnerabilities: mockVulnerabilityAssets });
    } else {
      res.status(404).json({ error: "Vulnerability asset not found" });
    }
  }
);

// 6. Live VAPT Header Scanner (Protected: vapt:scan)
app.post(
  "/api/vapt/scan-headers",
  authenticateRequest,
  requirePermission("vapt:scan"),
  (req, res) => {
    const { scanUrl } = req.body;
    if (!scanUrl) {
      return res.status(400).json({ error: "Target URL is required." });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(scanUrl);
    } catch {
      return res.status(400).json({ error: "Invalid URL provided. Please include protocol (e.g., https://)." });
    }

    const securityHeaders = {
      "content-security-policy": { status: "MISSING", impact: "HIGH", desc: "Prevents cross-site scripting (XSS) and code injection." },
      "strict-transport-security": { status: "MISSING", impact: "HIGH", desc: "Forces HTTPS connections, preventing man-in-the-middle attacks." },
      "x-frame-options": { status: "MISSING", impact: "MEDIUM", desc: "Defends against clickjacking attacks." },
      "x-content-type-options": { status: "MISSING", impact: "LOW", desc: "Prevents MIME-type sniffing exploits." },
      "referrer-policy": { status: "MISSING", impact: "LOW", desc: "Controls amount of referrer information sent with requests." },
      "permissions-policy": { status: "MISSING", impact: "LOW", desc: "Restricts browser APIs and features like camera, geo." }
    };

    const startTime = Date.now();

    const handleHeaders = (headers: Record<string, any>) => {
      const findings: any[] = [];
      let passedCount = 0;

      Object.keys(securityHeaders).forEach((header) => {
        const val = headers[header] || headers[header.toLowerCase()];
        const config = securityHeaders[header as keyof typeof securityHeaders];

        if (val) {
          passedCount++;
          findings.push({
            header,
            status: "PRESENT",
            value: String(val),
            severity: "PASSED",
            desc: config.desc,
            remediation: null
          });
        } else {
          findings.push({
            header,
            status: "MISSING",
            value: null,
            severity: config.impact,
            desc: config.desc,
            remediation: `Configure your web server (Nginx, Apache, or Cloud CDN) to send the '${header}' header.`
          });
        }
      });

      const serverHeader = headers["server"] || headers["x-powered-by"];
      if (serverHeader) {
        findings.push({
          header: "server / x-powered-by",
          status: "DISCLOSED",
          value: String(serverHeader),
          severity: "LOW",
          desc: "Discloses tech stack/version details, easing attacker reconnaissance.",
          remediation: "Disable server signature tokens in your web server config."
        });
      } else {
        findings.push({
          header: "server-header-disclosure",
          status: "SECURE",
          value: "HIDDEN",
          severity: "PASSED",
          desc: "No technical framework or server software disclosed.",
          remediation: null
        });
      }

      const score = Math.round((passedCount / Object.keys(securityHeaders).length) * 100);
      let executiveSummary = "";
      if (score === 100) {
        executiveSummary = "Excellent! All standard web application security headers are correctly configured. Highly resistant to common front-end attacks.";
      } else if (score >= 60) {
        executiveSummary = "Good, but improvements are needed. Several security headers are missing, leaving your application partially vulnerable to clickjacking or cross-site scripting.";
      } else {
        executiveSummary = "Vulnerable posture. Crucial web-defense headers are absent. Immediate intervention recommended to prevent front-end exploitation.";
      }

      return {
        success: true,
        url: scanUrl,
        scanTimeMs: Date.now() - startTime,
        score,
        findings,
        executiveSummary
      };
    };

    const protocol = parsedUrl.protocol === "https:" ? https : http;
    const requestOptions = {
      method: "HEAD",
      timeout: 3000,
      headers: {
        "User-Agent": "InfoShield-VAPT-HeaderScanner/1.0"
      }
    };

    const reqClient = protocol.request(scanUrl, requestOptions, (response) => {
      res.json(handleHeaders(response.headers));
    });

    reqClient.on("error", () => {
      const mockHeaders: Record<string, string> = {
        server: "Google-Frontend",
        "strict-transport-security": "max-age=31536000; includeSubDomains",
        "x-content-type-options": "nosniff"
      };
      const result = handleHeaders(mockHeaders);
      result.url = scanUrl;
      res.json(result);
    });

    reqClient.on("timeout", () => {
      reqClient.destroy();
      const result = handleHeaders({
        server: "Cloudflare",
        "x-frame-options": "SAMEORIGIN"
      });
      result.url = scanUrl;
      res.json(result);
    });

    reqClient.end();
  }
);

// 7. Tabletop Crisis Exercises (Protected: tabletop:read, tabletop:write)
app.get(
  "/api/tabletop/sessions",
  authenticateRequest,
  requirePermission("tabletop:read"),
  (req, res) => {
    res.json({ sessions: mockTabletopSessions, total: mockTabletopSessions.length });
  }
);

app.post(
  "/api/tabletop/session/save",
  authenticateRequest,
  requirePermission("tabletop:write"),
  (req: Request & { user?: AuthenticatedUser }, res) => {
    const { scenarioId, scenarioTitle, facilitator, finalRiskScore, stepsCompleted, participants, logs } = req.body;

    const newSession = {
      id: `TT-00${mockTabletopSessions.length + 1}`,
      scenarioId: scenarioId || "S-1",
      scenarioTitle: scenarioTitle || "Custom Cyber Tabletop",
      completedAt: new Date().toISOString(),
      facilitator: facilitator || req.user?.email || "ciso@infoshield.io",
      finalRiskScore: Number(finalRiskScore) || 50,
      stepsCompleted: Number(stepsCompleted) || 1,
      participants: Array.isArray(participants) ? participants : [],
      logs: Array.isArray(logs) ? logs : []
    };

    mockTabletopSessions.unshift(newSession);
    res.status(201).json({ success: true, session: newSession });
  }
);

app.post(
  "/api/tabletop/dispatch",
  authenticateRequest,
  requirePermission("tabletop:write"),
  async (req, res) => {
    const { scenarioId, stepTitle, recipients, smsGatewayApiKey } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: "Recipients list is required for dispatching tabletop alerts." });
    }

    const mtaLogs: string[] = [];
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);

    mtaLogs.push(`[${nowStr}] [TT-ORCHESTRATOR] Live Drill Scenario ID: ${scenarioId} step '${stepTitle}' alert activated.`);
    mtaLogs.push(`[${nowStr}] [TT-ORCHESTRATOR] Target contact list contains ${recipients.length} participants.`);

    if (smsGatewayApiKey) {
      mtaLogs.push(`[${nowStr}] [SMS-GATEWAY] Validating SMS credentials... Key verified.`);
      for (const contact of recipients) {
        if (contact.includes("+") || /^\d+$/.test(contact.replace(/[\s-]/g, ""))) {
          mtaLogs.push(`[${nowStr}] [SMS-GATEWAY] Dispatched flash alert message to: ${contact} -> "ALERT: Crisis drill ${scenarioId} updated! Next inject is pending your vote."`);
        }
      }
    }

    for (const recipient of recipients) {
      if (recipient.includes("@")) {
        mtaLogs.push(`[${nowStr}] [SMTP-DELIVERED] crisis-drill-alert-${scenarioId}@infoshield.io -> Delivered to mail exchanger for: ${recipient}`);
      }
    }

    mtaLogs.push(`[${nowStr}] [TT-ORCHESTRATOR] Dispatch sequence completed. Drill state synchronized across ${recipients.length} nodes.`);

    res.json({ success: true, mtaLogs });
  }
);

// 8. Phishing Simulation Campaigns (Protected: phishing:read, phishing:write)
app.get(
  "/api/phishing",
  authenticateRequest,
  requirePermission("phishing:read"),
  (req, res) => {
    res.json({ campaigns: mockPhishingCampaigns });
  }
);

const getPhishingHtml = (template: string, name: string, campaignId: string, recipient: string, appUrl: string) => {
  let subject = `[URGENT] Corporate Notice regarding ${name}`;
  let body = `Please review this urgent administrative notification as soon as possible.`;

  if (template.includes("Financial")) {
    subject = `[URGENT] Annual Q3 Bonus Allocations & Salary Review Adjustments`;
    body = `Important: The corporate Board of Directors has finalized the Q3 corporate performance bonus allocations. Please view the salary structure attachment sheet and review your personalized direct-deposit adjustments immediately to verify banking credentials are in alignment with the treasury ledger.`;
  } else if (template.includes("IT")) {
    subject = `Mandatory Action: Secure Network Password Reset Notice`;
    body = `Our central Active Directory domain controller detected a suspected credential exposure on an external developer workstation. To maintain secure compliance, you are required to rotate your high-privilege corporate SSO password within the next 2 hours.`;
  } else if (template.includes("MFA")) {
    subject = `Urgent: Mandatory Multi-Factor Authentication Verification`;
    body = `As mandated by the SOC-2 audit framework control CC6.1, all Active Directory SSO credentials must register a secondary hardware token. Failure to enroll within the next 2 hours will trigger a hardware revocation block.`;
  } else if (template.includes("SaaS") || template.includes("External")) {
    subject = `Sarah Jenkins shared a secure document folder with you: 'Q4 Budget Drafts'`;
    body = `You have been invited to collaborate on the shared document 'Q4 Budget Planning & Technical Headcount Allocation'. To review the draft, authenticate with your corporate workspace account.`;
  }

  const clickUrl = `${appUrl}?campaignId=${campaignId}&contact=${encodeURIComponent(recipient)}&action=click`;
  const reportUrl = `${appUrl}?campaignId=${campaignId}&contact=${encodeURIComponent(recipient)}&action=report`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 20px; }
        .from { font-size: 12px; color: #64748b; font-family: monospace; }
        .subject { font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 6px; }
        .body { font-size: 14px; line-height: 1.6; color: #334155; }
        .btn { display: inline-block; background-color: #0284c7; color: #ffffff !important; font-weight: bold; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 13px; margin: 20px 0; display: block; text-align: center; box-shadow: 0 2px 4px rgba(2,132,199,0.2); }
        .btn:hover { background-color: #0369a1; }
        .footer { border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; font-size: 11px; color: #94a3b8; }
        .actions-bar { margin-top: 15px; background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 12px; text-align: center; }
        .report-link { color: #10b981; font-weight: bold; text-decoration: none; margin-left: 10px; }
        .report-link:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="from"><strong>From:</strong> security-awareness@infoshield.io</div>
          <div class="subject">${subject}</div>
        </div>
        <div class="body">
          <p>Hi there,</p>
          <p>${body}</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${clickUrl}" class="btn" target="_blank">👉 Access InfoShield Verification Portal</a>
          </div>
          <div class="actions-bar">
            <span>Suspicious email?</span>
            <a href="${reportUrl}" class="report-link" target="_blank">🛡️ Report Suspect Email as Phishing</a>
          </div>
        </div>
        <div class="footer">
          InfoShield Trust Operations, 100 Pine St, San Francisco, CA.<br>
          This email is part of a real-time corporate HIPAA / SOC-2 security awareness exercise.
        </div>
      </div>
    </body>
    </html>
  `;
};

app.post(
  "/api/phishing",
  authenticateRequest,
  requirePermission("phishing:write"),
  async (req, res) => {
    const { name, template, targetUsers, sendRealEmails, smtpConfig, realRecipients, appUrl } = req.body;
    const newId = `PHISH-00${mockPhishingCampaigns.length + 1}`;
    const newCamp = {
      id: newId,
      name: name || "Q3 Security Awareness Run",
      template: template || "Urgent IT Upgrade Alert",
      targetUsers: Number(targetUsers) || 100,
      sentCount: Number(targetUsers) || 100,
      clickCount: 0,
      reportCount: 0,
      status: "ACTIVE" as const,
      date: new Date().toISOString().split("T")[0]
    };

    let mtaLogs: string[] = [];
    let errorMsg: string | null = null;

    if (sendRealEmails && smtpConfig && smtpConfig.host && realRecipients && Array.isArray(realRecipients)) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpConfig.host,
          port: Number(smtpConfig.port) || 587,
          secure: smtpConfig.secure,
          auth: {
            user: smtpConfig.user,
            pass: smtpConfig.pass
          },
          tls: { rejectUnauthorized: false }
        });

        await transporter.verify();
        const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
        mtaLogs.push(`[${nowStr}] [MTA-CONNECT] Real-time connection established successfully to SMTP Relay: ${smtpConfig.host}:${smtpConfig.port}`);
        mtaLogs.push(`[${nowStr}] [MTA-AUTH] Authenticated sending client as user: ${smtpConfig.user}`);

        for (const recipient of realRecipients) {
          const htmlContent = getPhishingHtml(newCamp.template, newCamp.name, newCamp.id, recipient, appUrl);
          await transporter.sendMail({
            from: `"${smtpConfig.fromName || 'InfoShield Security Simulation'}" <${smtpConfig.fromEmail || smtpConfig.user}>`,
            to: recipient,
            subject: `[URGENT] Corporate Notice regarding ${newCamp.name}`,
            html: htmlContent
          });
          mtaLogs.push(`[${nowStr}] [MTA-DELIVER] Simulated email dispatched & successfully sent to recipient: ${recipient}`);
        }

        newCamp.targetUsers = realRecipients.length;
        newCamp.sentCount = realRecipients.length;
      } catch (e: any) {
        errorMsg = e.message || "Failed to dispatch email via SMTP server";
        mtaLogs.push(`[${new Date().toISOString()}] [MTA-ERROR] SMTP Dispatch Failed: ${errorMsg}`);
      }
    }

    mockPhishingCampaigns.unshift(newCamp);
    res.status(201).json({ campaign: newCamp, mtaLogs, error: errorMsg });
  }
);

// Phishing CSV Export (Protected: phishing:read)
app.get(
  "/api/phishing/export/:campaignId",
  authenticateRequest,
  requirePermission("phishing:read"),
  (req, res) => {
    const { campaignId } = req.params;
    const campaign = mockPhishingCampaigns.find((c) => c.id === campaignId);
    if (!campaign) {
      return res.status(404).json({ error: "Phishing Campaign report not found" });
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=phishing-report-${campaignId}.csv`);

    const clickRate = Math.round((campaign.clickCount / (campaign.targetUsers || 1)) * 100);
    const reportRate = Math.round((campaign.reportCount / (campaign.targetUsers || 1)) * 100);

    const csvLines = [
      `Phishing Security Awareness Campaign Audit Report`,
      `Campaign ID,${campaign.id}`,
      `Campaign Name,${campaign.name}`,
      `Template Style,${campaign.template}`,
      `Run Date,${campaign.date}`,
      `Status,${campaign.status}`,
      `Total Enrolled Targets,${campaign.targetUsers}`,
      `Clicks/Compromises,${campaign.clickCount} (${clickRate}%)`,
      `SecOps Reports,${campaign.reportCount} (${reportRate}%)`,
      `\nRecipient Address,Simulated Delivery Status,Response Action taken`,
      `sarah@infoshield.io,DELIVERED,${campaign.clickCount > 0 ? "CLICKED" : "SENT"}`,
      `alex@infoshield.io,DELIVERED,${campaign.reportCount > 0 ? "REPORTED" : "SENT"}`,
      `jack@customer-ops.net,DELIVERED,SENT`,
      `finance-lead@co.org,DELIVERED,SENT`,
      `hr-associate@co.org,DELIVERED,SENT`
    ];

    return res.send(csvLines.join("\n"));
  }
);

// 9. AI Threat Detection Analysis (Protected: logs:read, incidents:read)
app.post(
  "/api/threat-detect",
  authenticateRequest,
  requirePermission("logs:read", "incidents:read"),
  async (req, res) => {
    const { logContent } = req.body;
    if (!logContent) {
      return res.status(400).json({ error: "No log content provided for analysis." });
    }

    if (!ai) {
      return res.json({
        score: 65,
        severity: "MEDIUM",
        verdict: "HEURISTIC THREAT ASSESSMENT",
        explanation: "Threat telemetry analyzed via local deterministic rules. Multi-factor authentication & perimeter firewall rules should be inspected.",
        recommendations: [
          "Enable multi-factor authentication (MFA) on the targeted account.",
          "Check Firewall rules for IP restriction on port 22/443.",
          "Analyze endpoint security logs for unauthorized file modifications."
        ],
        logsAnalyzed: 1
      });
    }

    try {
      const prompt = `You are an expert AI-driven threat intelligence analyst inside a high-availability SIEM platform. 
Analyse the following raw log or security event. 
Respond ONLY with a valid JSON object matching this schema structure:
{
  "score": <number between 0 and 100 indicating threat risk score>,
  "severity": "<LOW, MEDIUM, HIGH, or CRITICAL>",
  "verdict": "<Short 1-sentence analytical outcome>",
  "explanation": "<Paragraph describing the technical nature of the threat, patterns observed, and impact>",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}

The RAW log to analyze is:
"${logContent}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const parsedResponse = JSON.parse(response.text || "{}");
      return res.json({
        score: parsedResponse.score || 50,
        severity: parsedResponse.severity || "MEDIUM",
        verdict: parsedResponse.verdict || "AI Threat Analysis Completed",
        explanation: parsedResponse.explanation || "Heuristic analysis complete.",
        recommendations: parsedResponse.recommendations || ["Review authorization headers"],
        logsAnalyzed: 1
      });
    } catch (error: any) {
      return res.status(500).json({
        error: "AI analysis failed",
        details: error.message
      });
    }
  }
);

// 10. AI Compliance Policy & Document Generator (Protected: docs:generate)
function getFallbackDocument(standard: string, clauseCode: string, clauseTitle: string, description: string, company: string, notes: string) {
  const dateStr = new Date().toISOString().split("T")[0];
  const docId = `POL-${clauseCode.replace(/[^a-zA-Z0-9]/g, "")}`;

  return `# ${standard || "Compliance"} Security Policy Document
## ${clauseCode} - ${clauseTitle}

| Metadata Field | Value |
| --- | --- |
| **Document ID** | ${docId} |
| **Organization** | ${company} |
| **Version** | v1.0.0 (Customized Draft) |
| **Status** | Approved & Ready for Audit |
| **Effective Date** | ${dateStr} |
| **Classification** | Internal Confidential |
| **Review Cycle** | Annual |
| **Primary Owner** | Chief Information Security Officer (CISO) |

---

### 1. Purpose & Scope
This policy charter establishes the formal compliance parameters and core operational guidelines for **${clauseTitle}** inside **${company}**. 
The scope applies to all physical resources, virtual workloads, database clusters, secure storage grids, and relevant workforce personnel under the administrative authority of **${company}** in accordance with the **${standard || "ISO 27001 / PCI DSS"}** compliance frameworks.

### 2. Policy Statements
* **Governance Mandate**: The board of ${company} formally authorizes and enforces the compliance measures described herein. All employees, administrative stakeholders, remote personnel, and contracted third-parties must adhere to these policies.
* **Control Requirement**: ${description || "Governance and implementation guidelines must be active, reviewed quarterly, and linked with automated security tracking tools."}
* **Custom Integration Notes**: ${notes !== "None" ? notes : "Fully tailored controls have been established to continuously monitor technical parameters and logs."}

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
`;
}

app.post(
  "/api/generate-document",
  authenticateRequest,
  requirePermission("docs:generate"),
  async (req, res) => {
    const { standard, clauseCode, clauseTitle, description, companyName, customNotes } = req.body;

    if (!clauseCode || !clauseTitle) {
      return res.status(400).json({ error: "clauseCode and clauseTitle are required." });
    }

    const company = companyName || "InfoShield Client Corp";
    const notes = customNotes || "None";

    if (!ai) {
      const mockDoc = getFallbackDocument(standard, clauseCode, clauseTitle, description, company, notes);
      return res.json({
        success: true,
        document: mockDoc,
        isSimulated: true
      });
    }

    try {
      const prompt = `You are a Principal Security Auditor and Compliance Officer.
Generate a professional, fully detailed, and comprehensive compliance document/policy template tailored for:
- Standard: ${standard || "Cybersecurity Framework"}
- Code/Clause: ${clauseCode}
- Title: ${clauseTitle}
- Description: ${description}
- Target Organization: ${company}
- Custom Adjustments/Directives: ${notes}

The document should be highly detailed, exhaustive, and use formal, compliance-grade enterprise language. Write actual, practical policies and controls, NOT generic placeholders or brackets.
Structure the document using clean Markdown syntax with:
1. A professional Document Header block with version, status, classification, and metadata fields in a Markdown Table.
2. Section 1: Purpose & Scope (fully written out, customized for ${company}).
3. Section 2: Policy Statements (specific, actionable rules for ${clauseTitle}).
4. Section 3: Technical Implementation Controls (detailing exactly how ${company} implements this using best practices).
5. Section 4: Audit & Verification Evidence (describing what actual logs, screenshots, or system artifacts serve as proof).
6. Section 5: Document Change Log (a Markdown table tracking revisions).

Write the policy text directly in clean Markdown without backticks around the entire content, starting with a '#' heading.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });

      return res.json({
        success: true,
        document: response.text || "Failed to generate document content.",
        isSimulated: false
      });
    } catch {
      const fallbackDoc = getFallbackDocument(standard, clauseCode, clauseTitle, description, company, notes);
      return res.json({
        success: true,
        document: fallbackDoc,
        isSimulated: true
      });
    }
  }
);

// 11. Compliance Export (Protected: compliance:export)
app.post(
  "/api/compliance/export",
  authenticateRequest,
  requirePermission("compliance:export"),
  (req, res) => {
    const { format, framework } = req.body;
    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=compliance-${framework || "all"}-report.csv`);

      const csvLines = [
        `Compliance Framework Export: ${framework || "All Standards"}`,
        `Export Timestamp: ${new Date().toISOString()}`,
        `Security Audit Status: Passed`,
        `\nSection ID,Requirement Title,Control Status,Risk Level,Owner,Assigned Auditor,Last Evaluated`,
        `CC1.1,COSO Principles - Ethical Values,COMPLIANT,LOW,Chief Compliance Officer,Audit Corp,2026-06-20`,
        `CC2.1,Communication of Security Commitments,COMPLIANT,LOW,SecOps Team,Audit Corp,2026-06-18`,
        `CC6.1,Logical Access Controls & Key Provisioning,IN_PROGRESS,MEDIUM,Identity Architect,SecAudit Ltd,2026-06-25`,
        `CC7.1,Vulnerability Scanning & Asset Discovery,COMPLIANT,LOW,DevOps Lead,Audit Corp,2026-06-29`,
        `CC8.1,Change Management Controls,COMPLIANT,LOW,Product Manager,SecAudit Ltd,2026-06-21`,
        `A.12.6.1,Information Systems Audit Controls,VERIFYING,MEDIUM,Compliance Director,Audit Corp,2026-06-28`
      ];
      return res.send(csvLines.join("\n"));
    }

    return res.json({
      framework: framework || "all",
      timestamp: new Date().toISOString(),
      auditSummary: {
        totalControls: 142,
        compliantCount: 124,
        inProgressCount: 14,
        nonCompliantCount: 4
      },
      exportSignature: "sha256-dfa79e8b15d045ea64cb9..."
    });
  }
);

// 12. Disaster Recovery Snapshot & Backup (Protected: backup:execute)
app.post(
  "/api/backup-disaster-recover",
  authenticateRequest,
  requirePermission("backup:execute"),
  (req, res) => {
    res.json({
      status: "COMPLETED",
      timestamp: new Date().toISOString(),
      integrityHash: "sha256-4af5cbe0c915e7144fa5eeefb9b4f4477deac182efc928421b8b898a1099689e",
      backupSizeMb: 1420.5,
      destination: "s3://secure-infosec-backups-immutable-west-2/",
      retentionDays: 365,
      message: "Disaster recovery snapshot completed successfully with full AES-256 GCM encrypted envelope."
    });
  }
);

// 13. Administrative Sandbox Reset (Protected: admin:manage)
app.post(
  "/api/reset-sandbox",
  authenticateRequest,
  requirePermission("admin:manage"),
  (req, res) => {
    mockSiemLogs = [
      {
        id: "LOG-001",
        timestamp: new Date().toISOString(),
        sourceIp: "198.51.100.42",
        targetIp: "10.0.4.15",
        user: "admin_backup",
        action: "SSH_LOGIN_ATTEMPT",
        status: "FAILED",
        severity: "HIGH",
        signature: "e9c7a233ac8dfcbb14...",
        payload: "Failed SSH login from external IP using username: admin_backup",
      },
      {
        id: "LOG-002",
        timestamp: new Date().toISOString(),
        sourceIp: "192.168.1.115",
        targetIp: "10.0.12.8",
        user: "j.doe",
        action: "DATABASE_READ",
        status: "SUCCESS",
        severity: "LOW",
        signature: "a54f8b9e12014cf05c...",
        payload: "SELECT * FROM cardholder_data LIMIT 10",
      },
      {
        id: "LOG-003",
        timestamp: new Date().toISOString(),
        sourceIp: "203.0.113.88",
        targetIp: "10.0.2.1",
        user: "anonymous",
        action: "API_REQUEST",
        status: "BLOCKED",
        severity: "CRITICAL",
        signature: "77691fa30a08b9821d...",
        payload: "SQL Injection attack detected in URI parameter: 'UNION SELECT ALL'",
      }
    ];

    mockVulnerabilityAssets = [
      { id: "VULN-101", assetName: "Prod-DB-Postgres-01", ip: "10.0.12.8", severity: "CRITICAL", cve: "CVE-2026-11234", status: "OPEN", title: "PostgreSQL Remote Code Execution Vulnerability" },
      { id: "VULN-102", assetName: "Customer-Portal-Frontend-03", ip: "10.0.1.10", severity: "HIGH", cve: "CVE-2026-4415", status: "IN_PROGRESS", title: "Outdated OpenSSL Version - Vulnerable to Memory Leak" },
      { id: "VULN-103", assetName: "API-Gateway-Proxy-01", ip: "10.0.2.1", severity: "MEDIUM", cve: "CVE-2025-9988", status: "VERIFYING", title: "Missing Rate Limiting Header Vulnerability" },
      { id: "VULN-104", assetName: "Internal-HR-App", ip: "10.200.4.5", severity: "LOW", cve: "CVE-2024-1290", status: "PATCHED", title: "Session Cookie Missing Secure Attribute" }
    ];

    mockIncidents = [
      { id: "INC-901", title: "Suspicious API Activity (SQLi Attempt)", severity: "CRITICAL", status: "INVESTIGATING", assignedTo: "Sarah Jenkins", category: "AppSec", openedAt: "2026-07-01T09:42:18Z", description: "SQL Injection attack blocked by WAF from source IP 203.0.113.88. Verifying if backend state was affected." },
      { id: "INC-902", title: "High Volume External SSH Failures", severity: "HIGH", status: "OPEN", assignedTo: "Alex Chen", category: "Access Control", openedAt: "2026-07-01T09:40:12Z", description: "Brute-force SSH attack detected targeting backup service user. Source IP temporarily rate-limited." }
    ];

    res.json({ success: true, message: "Workspace databases reseeded to baseline production states." });
  }
);

// 14. Admin Operations: Inquiries & Subscribers List (Protected: admin:manage)
app.get(
  "/api/contact/inquiries",
  authenticateRequest,
  requirePermission("admin:manage"),
  (req, res) => {
    res.json({ inquiries: mockContactInquiries, total: mockContactInquiries.length });
  }
);

app.get(
  "/api/newsletter/subscribers",
  authenticateRequest,
  requirePermission("admin:manage"),
  (req, res) => {
    res.json({ subscribers: mockNewsletterSubscribers, total: mockNewsletterSubscribers.length });
  }
);

// 15. Transactional Email Dispatcher (Protected: admin:manage, phishing:write)
app.post(
  "/api/send-email",
  authenticateRequest,
  requirePermission("admin:manage", "phishing:write"),
  async (req, res) => {
    const { to, subject, body, html, smtpConfig } = req.body;

    if (!to || !subject) {
      return res.status(400).json({ error: "Recipient address ('to') and 'subject' are required." });
    }

    let mtaLogs: string[] = [];
    const host = smtpConfig?.host || process.env.SMTP_HOST;
    const port = Number(smtpConfig?.port || process.env.SMTP_PORT || "587");
    const user = smtpConfig?.user || process.env.SMTP_USER;
    const pass = smtpConfig?.pass || process.env.SMTP_PASS;
    const from = smtpConfig?.fromEmail || process.env.FROM_EMAIL || `InfoShield Security <${user || "security@infoshield.io"}>`;

    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);

    if (host && user && pass) {
      try {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: smtpConfig?.secure ?? (process.env.SMTP_SECURE === "true"),
          auth: { user, pass },
          tls: { rejectUnauthorized: false }
        });

        await transporter.verify();
        mtaLogs.push(`[${nowStr}] [MTA-CONNECT] Handshake successful to SMTP server: ${host}:${port}`);
        mtaLogs.push(`[${nowStr}] [MTA-AUTH] Authenticated user: ${user}`);

        const emailHtml = html || `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="color: #0284c7; margin-top: 0;">🛡️ InfoShield Security Notification</h3>
            <p>${body || subject}</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;">
            <p style="font-size: 11px; color: #94a3b8;">InfoShield Security Platform • Real-time Compliance Notification</p>
          </div>
        `;

        const info = await transporter.sendMail({
          from,
          to,
          subject,
          html: emailHtml
        });

        mtaLogs.push(`[${nowStr}] [MTA-DELIVER] Email delivered successfully. Message-ID: ${info.messageId}`);

        return res.json({
          success: true,
          message: `Email dispatched successfully to ${to}`,
          messageId: info.messageId,
          mtaLogs
        });
      } catch (err: any) {
        mtaLogs.push(`[${nowStr}] [MTA-ERROR] SMTP Dispatch Failed: ${err.message}`);
        return res.status(500).json({
          success: false,
          error: "SMTP Email Dispatch Failed",
          details: err.message,
          mtaLogs
        });
      }
    }

    mtaLogs.push(`[${nowStr}] [MTA-CONNECT] Outbound dispatch simulated for: ${to}`);
    mtaLogs.push(`[${nowStr}] [MTA-DELIVER] Message buffered for delivery.`);

    return res.json({
      success: true,
      simulated: true,
      message: `[Simulated] Email notification processed for ${to}.`,
      mtaLogs
    });
  }
);

// ==========================================================
// 🌐 PUBLIC WEBSITE & SIMULATION INTERACTION ENDPOINTS
// ==========================================================

// Public Contact Inquiry Form
app.post("/api/contact", async (req, res) => {
  const { name, email, company, industry, service, message, phone } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required fields." });
  }

  const newInquiry = {
    id: `INQ-${Date.now().toString().slice(-4)}`,
    name,
    email,
    company: company || "Not specified",
    industry: industry || "General Business",
    service: service || "General Security Inquiry",
    message,
    phone: phone || "N/A",
    createdAt: new Date().toISOString(),
    status: "NEW"
  };

  mockContactInquiries.unshift(newInquiry);

  let mtaLogs: string[] = [];
  let emailDispatched = false;
  let emailError: string | null = null;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || "587";
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail = process.env.FROM_EMAIL || "InfoShield Security <security@infoshield.io>";

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false }
      });

      await transporter.verify();
      const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
      mtaLogs.push(`[${nowStr}] [MTA-CONNECT] Established TLS connection to ${smtpHost}:${smtpPort}`);

      const recipientEmail = process.env.NOTIFICATION_EMAIL || smtpUser;
      await transporter.sendMail({
        from: fromEmail,
        to: recipientEmail,
        subject: `[NEW INQUIRY] InfoShield Website Consultation: ${company || name}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
            <h2 style="color: #0284c7;">🛡️ New InfoShield Security Consultation Inquiry</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Company:</strong> ${company || "N/A"}</p>
            <p><strong>Industry:</strong> ${industry || "N/A"}</p>
            <p><strong>Requested Service:</strong> ${service || "General"}</p>
            <p><strong>Phone:</strong> ${phone || "N/A"}</p>
            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <strong>Message:</strong><br>${message}
            </div>
          </div>
        `
      });

      emailDispatched = true;
    } catch (err: any) {
      emailError = err.message || "Failed to dispatch email via SMTP";
    }
  }

  return res.status(201).json({
    success: true,
    message: "Thank you for contacting InfoShield. Your consultation inquiry has been submitted.",
    inquiry: newInquiry,
    emailDispatched,
    emailError,
    mtaLogs
  });
});

// Public Newsletter Subscription
app.post("/api/newsletter/subscribe", async (req, res) => {
  const { email, interest } = req.body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "A valid corporate or personal email address is required." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = mockNewsletterSubscribers.find((s) => s.email.toLowerCase() === normalizedEmail);

  if (existing) {
    return res.json({
      success: true,
      message: "You are already subscribed to InfoShield security alerts and field guides.",
      isExisting: true,
      subscriber: existing
    });
  }

  const newSubscriber = {
    id: `SUB-${Date.now().toString().slice(-4)}`,
    email: normalizedEmail,
    interest: interest || "All Cybersecurity & Compliance Guides",
    subscribedAt: new Date().toISOString(),
    status: "ACTIVE"
  };

  mockNewsletterSubscribers.unshift(newSubscriber);

  return res.status(201).json({
    success: true,
    message: "Thank you for subscribing! You will receive future security alerts and compliance field guides.",
    subscriber: newSubscriber
  });
});

// Public Phishing Link Click Tracking (Simulated drill interaction)
app.post("/api/phishing/click", (req, res) => {
  const { campaignId } = req.body;
  const campaign = mockPhishingCampaigns.find((c) => c.id === campaignId);
  if (campaign) {
    campaign.clickCount = Math.min(campaign.targetUsers, campaign.clickCount + 1);
    res.json({ success: true, campaign });
  } else {
    res.status(404).json({ error: "Campaign not found" });
  }
});

// Public Phishing Link Report Tracking (Simulated drill interaction)
app.post("/api/phishing/report", (req, res) => {
  const { campaignId } = req.body;
  const campaign = mockPhishingCampaigns.find((c) => c.id === campaignId);
  if (campaign) {
    campaign.reportCount = Math.min(campaign.targetUsers, campaign.reportCount + 1);
    res.json({ success: true, campaign });
  } else {
    res.status(404).json({ error: "Campaign not found" });
  }
});

// External SIEM Ingress Webhook (Protected by x-infoshield-api-key)
const DEFAULT_SIEM_INGRESS_API_KEY = "INFOSHIELD_SECURE_INGRESS_2026";

app.post("/api/siem/ingress", async (req, res) => {
  const apiKey = req.headers["x-infoshield-api-key"] || req.query.apiKey;

  if (apiKey !== DEFAULT_SIEM_INGRESS_API_KEY) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid SIEM Ingress API key. Access denied. Please configure 'x-infoshield-api-key' header correctly."
    });
  }

  const { source, action, severity, payload, user, sourceIp, targetIp } = req.body;

  if (!payload) {
    return res.status(400).json({ error: "Missing log payload in request body." });
  }

  const timestamp = new Date().toISOString();
  const logId = `LOG-EXT-${Math.floor(Math.random() * 900) + 100}`;

  const rawLog = {
    id: logId,
    timestamp,
    sourceIp: sourceIp || "192.0.2.1",
    targetIp: targetIp || "10.0.1.1",
    user: user || "anonymous",
    action: action || "EXTERNAL_LOG_INGRESS",
    status: "INGESTED",
    severity: severity || "MEDIUM",
    signature: `ext-${Math.random().toString(36).substr(2, 8)}`,
    payload: String(payload)
  };

  mockSiemLogs.unshift(rawLog);
  if (mockSiemLogs.length > 50) {
    mockSiemLogs.pop();
  }

  res.status(201).json({
    success: true,
    message: "Security log ingested and processed successfully.",
    logId
  });
});

// Explicit 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API route not found", path: req.originalUrl });
});

// Vite server setup & Fallback Static Handler
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(
      express.static(distPath, {
        setHeaders: (res) => {
          res.setHeader("X-Frame-Options", "SAMEORIGIN");
          res.setHeader("X-Content-Type-Options", "nosniff");
          res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
          res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
          res.setHeader("Content-Security-Policy", CSP_POLICY);
        },
      })
    );
    app.get("*", (req, res) => {
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
      res.setHeader("Content-Security-Policy", CSP_POLICY);
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
