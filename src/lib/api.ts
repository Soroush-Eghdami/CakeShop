const RAW_BASE_URL =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const hasBody =
    init.body !== undefined &&
    init.body !== null &&
    init.method !== undefined &&
    init.method.toUpperCase() !== "GET" &&
    init.method.toUpperCase() !== "HEAD";

  const res = await fetch(url, {
    ...init,
    credentials: "include",

    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });

  const body = await parseBody(res);

  if (!res.ok) {
    const message =
      (typeof body === "object" &&
        body !== null &&
        ("detail" in body || "error" in body) &&
        String(
          (body as Record<string, unknown>).detail ??
            (body as Record<string, unknown>).error,
        )) ||
      `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message, body);
  }

  return body as T;
}
