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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...fetchOptions,
    headers: { ...headers, ...(fetchOptions.headers as Record<string, string>) },
  });

  // Guard against non-JSON responses (HTML error pages, rate limit messages, etc.)
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    if (res.status === 401 && token) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        const retryRes = await fetch(`${API_URL}/api/v1${path}`, {
          ...fetchOptions,
          headers: { ...headers, Authorization: `Bearer ${newToken}` },
        });
        return retryRes.json().catch(() => ({ success: false, error: `Server error (${retryRes.status})` }));
      }
    }
    return { success: false, error: `Server error (${res.status})` };
  }

  const body = await res.json().catch(() => ({ success: false, error: "Invalid server response" }));

  // Auto-refresh on 401 if we had a token (meaning it expired)
  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      const retryRes = await fetch(`${API_URL}/api/v1${path}`, {
        ...fetchOptions,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
      });
      return retryRes.json().catch(() => ({ success: false, error: "Invalid server response" }));
    }
  }

  return body;
}
