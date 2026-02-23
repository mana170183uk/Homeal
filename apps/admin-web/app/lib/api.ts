const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3203";

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("homeal_refresh_token");
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();
    if (data.success && data.data?.token) {
      localStorage.setItem("homeal_token", data.data.token);
      return data.data.token;
    }
    return null;
  } catch {
    return null;
  }
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

  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...fetchOptions,
    headers: { ...headers, ...(fetchOptions.headers as Record<string, string>) },
  });

  const body = await res.json();

  // Auto-refresh on 401 if we had a token (meaning it expired)
  if (res.status === 401 && storedToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      const retryRes = await fetch(`${API_URL}/api/v1${path}`, {
        ...fetchOptions,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
      });
      return retryRes.json();
    }
    // Refresh failed — clear tokens and redirect to login
    localStorage.removeItem("homeal_token");
    localStorage.removeItem("homeal_refresh_token");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  return body;
}

/**
 * Wrapper for raw fetch calls that need auth + auto-refresh.
 * Use this for non-JSON requests (e.g. FormData uploads via XHR).
 * Returns a fresh token, or null if refresh failed (and redirects to login).
 */
export async function getValidToken(): Promise<string | null> {
  const token = localStorage.getItem("homeal_token");
  if (!token) return null;

  // Quick check: try a lightweight request to see if token is still valid
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
 * Drop-in replacement for fetch() that auto-refreshes on 401.
 * Existing code can simply swap `fetch(url, opts)` → `authFetch(url, opts)`.
 */
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status !== 401) return res;

  // Try to refresh the token
  const newToken = await refreshAccessToken();
  if (!newToken) {
    localStorage.removeItem("homeal_token");
    localStorage.removeItem("homeal_refresh_token");
    window.location.href = "/login";
    return res;
  }

  // Update stored token and retry with new token in Authorization header
  const newHeaders = new Headers(init?.headers);
  newHeaders.set("Authorization", `Bearer ${newToken}`);
  return fetch(input, { ...init, headers: newHeaders });
}

export { API_URL };
