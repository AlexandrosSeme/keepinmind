/**
 * Client for the local JSON data server (`npm run api`, json-server on :3001).
 * Vite proxies `/data/*` to it, so the app and the API share one origin.
 */
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "/data";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new ApiError(
      response.status,
      `${method} ${path} failed (${response.status}). Is \`npm run api\` running?`,
    );
  }
  return (await response.json()) as T;
}

/** Builds a query string, skipping undefined values. */
export function query(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) search.set(key, String(value));
  });
  const text = search.toString();
  return text ? `?${text}` : "";
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  delete: (path: string) => request<unknown>("DELETE", path),
};

/** GET that resolves to null on 404 instead of throwing. */
export async function getOrNull<T>(path: string): Promise<T | null> {
  try {
    return await api.get<T>(path);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** Total number of records in a collection (json-server `X-Total-Count`). */
export async function countRecords(collection: string): Promise<number> {
  const response = await fetch(`${API_BASE}/${collection}?_limit=1`);
  if (!response.ok) {
    throw new ApiError(response.status, `Count of ${collection} failed`);
  }
  return Number(response.headers.get("X-Total-Count") ?? 0);
}

/** Round-trip time of a tiny request in ms; throws when the API is down. */
export async function pingApi(): Promise<number> {
  const started = performance.now();
  await countRecords("packages");
  return Math.round(performance.now() - started);
}

export const API_BASE_URL = API_BASE;
