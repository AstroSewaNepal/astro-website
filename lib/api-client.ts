type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  status: number;
};

async function request<T>(
  url: string,
  token: string,
  method: HttpMethod = "GET",
  body?: unknown,
): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    return { data: null, error: "Unauthorized", status: 401 };
  }
  if (!res.ok) {
    const text = await res.text();
    return { data: null, error: text || `HTTP ${res.status}`, status: res.status };
  }

  const data: T = await res.json();
  return { data, error: null, status: res.status };
}

export function createApiClient(token: string) {
  return {
    get: <T>(url: string) => request<T>(url, token, "GET"),
    post: <T>(url: string, body: unknown) => request<T>(url, token, "POST", body),
    patch: <T>(url: string, body: unknown) => request<T>(url, token, "PATCH", body),
    delete: <T>(url: string) => request<T>(url, token, "DELETE"),
  };
}
