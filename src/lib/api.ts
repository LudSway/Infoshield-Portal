/**
 * InfoShield Secure API Client
 * Manages server-side session authentication tokens and authenticated HTTP fetch calls.
 */

const TOKEN_STORAGE_KEY = "infoshield_auth_token";
let inMemoryToken: string | null = null;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  permissions: string[];
}

export interface AuthSessionResponse {
  success: boolean;
  token: string;
  user: SessionUser;
  permissions: string[];
}

/**
 * Get active session token from memory or sessionStorage
 */
export function getAuthToken(): string | null {
  if (inMemoryToken) return inMemoryToken;
  try {
    const stored = sessionStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      inMemoryToken = stored;
      return stored;
    }
  } catch {}
  return null;
}

/**
 * Save active session token
 */
export function setAuthToken(token: string | null) {
  inMemoryToken = token;
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {}
}

/**
 * Establish or synchronize server-side authenticated session
 */
export async function authenticateWithServer(email: string, role?: string, name?: string, department?: string): Promise<AuthSessionResponse | null> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        role,
        name,
        department
      })
    });

    if (!res.ok) {
      console.warn("Server-side auth failed with status:", res.status);
      return null;
    }

    const data: AuthSessionResponse = await res.json();
    if (data && data.token) {
      setAuthToken(data.token);
      return data;
    }
  } catch (err) {
    console.error("Error authenticating session with backend:", err);
  }
  return null;
}

/**
 * Validate active session with backend
 */
export async function verifyServerSession(): Promise<AuthSessionResponse | null> {
  const token = getAuthToken();
  try {
    const res = await fetch("/api/auth/session", {
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      credentials: "include"
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data && data.user) {
      return data;
    }
  } catch {
    // network or offline
  }
  return null;
}

/**
 * End authenticated session on server
 */
export async function logoutServerSession(): Promise<void> {
  const token = getAuthToken();
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      credentials: "include"
    });
  } catch {}
  setAuthToken(null);
}

/**
 * Authenticated Fetch wrapper ensuring Bearer token and credentials are sent on all API calls
 */
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const enhancedInit: RequestInit = {
    ...init,
    headers,
    credentials: init?.credentials || "include"
  };

  const response = await fetch(input, enhancedInit);

  // If 401 Unauthorized or 403 Forbidden is received, log warning
  if (response.status === 401) {
    console.warn(`[AUTH GUARD] Unauthorized 401 for request to: ${typeof input === "string" ? input : input.toString()}`);
  } else if (response.status === 403) {
    console.warn(`[AUTH GUARD] Forbidden 403 (RBAC) for request to: ${typeof input === "string" ? input : input.toString()}`);
  }

  return response;
}
