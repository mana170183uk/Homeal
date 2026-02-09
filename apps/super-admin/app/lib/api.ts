const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100";

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

  return res.json();
}

export { API_URL };
