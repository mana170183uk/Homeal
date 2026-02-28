const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3203";

// Maximum number of automatic retries on transient server errors (502, 503, 504)
const MAX_RETRIES = 2;
const RETRY_DELAYS = [1000, 2000]; // ms delay before each retry

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("homeal_refresh_token");
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return null;
    const data = await res.json().catch(() => null);
    if (data?.success && data.data?.token) {
      localStorage.setItem("homeal_token", data.data.token);
      return data.data.token;
    }
    return null;
  } catch {
    return null;
  }
}

/** Safely parse a JSON response — never throws */
async function safeJson(res: Response): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    return { success: false, error: `Server error (${res.status})` };
  }
  return res.json().catch(() => ({ success: false, error: "Invalid server response" }));
}

/** Check if an HTTP status is a transient server error worth retrying */
function isTransientError(status: number): boolean {
  return status === 502 || status === 503 || status === 504 || status === 0;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function api<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<{ success: boolean; data?: T; error?: string }> {
  const { token, ...fetchOptions } = options || {};
  const storedToken = token || (typeof window !== "undefined" ? localStorage.getItem("homeal_token") : null);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
  };

  const doFetch = (hdrs: Record<string, string>) =>
    fetch(`${API_URL}/api/v1${path}`, {
      ...fetchOptions,
      headers: { ...hdrs, ...(fetchOptions.headers as Record<string, string>) },
    });

  // Attempt with automatic retry on transient errors
  let lastError = "";
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await doFetch(headers);

      // Transient server error — retry after delay
      if (isTransientError(res.status) && attempt < MAX_RETRIES) {
        lastError = `Server error (${res.status})`;
        await wait(RETRY_DELAYS[attempt]);
        continue;
      }

      // 401 with token — try refresh
      if (res.status === 401 && storedToken) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const retryRes = await doFetch({ ...headers, Authorization: `Bearer ${newToken}` });
          return (await safeJson(retryRes)) as { success: boolean; data?: T; error?: string };
        }
        // Refresh failed — clear and redirect
        localStorage.removeItem("homeal_token");
        localStorage.removeItem("homeal_refresh_token");
        if (typeof window !== "undefined") window.location.href = "/login";
      }

      return (await safeJson(res)) as { success: boolean; data?: T; error?: string };
    } catch (err) {
      // Network error (offline, DNS failure, timeout)
      lastError = err instanceof Error ? err.message : "Network error";
      if (attempt < MAX_RETRIES) {
        await wait(RETRY_DELAYS[attempt]);
        continue;
      }
    }
  }

  return { success: false, error: lastError || "Failed to connect to server" };
}

/**
 * Wrapper for raw fetch calls that need auth + auto-refresh.
 * Use this for non-JSON requests (e.g. FormData uploads via XHR).
 * Returns a fresh token, or null if refresh failed (and redirects to login).
 */
export async function getValidToken(): Promise<string | null> {
  const token = localStorage.getItem("homeal_token");
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        localStorage.removeItem("homeal_token");
        localStorage.removeItem("homeal_refresh_token");
        window.location.href = "/login";
        return null;
      }
      return newToken;
    }
    return token;
  } catch {
    return token;
  }
}

/**
 * Drop-in replacement for fetch() that auto-refreshes on 401
 * AND retries on transient errors (502, 503, 504).
 */
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let lastRes: Response | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(input, init);

      // Transient error — retry
      if (isTransientError(res.status) && attempt < MAX_RETRIES) {
        lastRes = res;
        await wait(RETRY_DELAYS[attempt]);
        continue;
      }

      // 401 — try token refresh
      if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (!newToken) {
          localStorage.removeItem("homeal_token");
          localStorage.removeItem("homeal_refresh_token");
          window.location.href = "/login";
          return res;
        }
        const newHeaders = new Headers(init?.headers);
        newHeaders.set("Authorization", `Bearer ${newToken}`);
        return fetch(input, { ...init, headers: newHeaders });
      }

      return res;
    } catch {
      if (attempt < MAX_RETRIES) {
        await wait(RETRY_DELAYS[attempt]);
        continue;
      }
    }
  }

  // All retries exhausted — return last response or a synthetic error
  return lastRes || new Response(JSON.stringify({ success: false, error: "Failed to connect to server" }), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  });
}

export { API_URL };
