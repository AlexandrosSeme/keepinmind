/**
 * Locally this talks to json-server (`npm run api`, proxied at `/data`).
 * A Vercel build with VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY talks to Supabase instead.
 */
import { ApiError } from "./apiError";
import { supabaseCount, supabaseRequest, usingSupabase } from "./supabaseApi";

export { ApiError };

const API_BASE = usingSupabase
  ? "supabase"
  : (import.meta.env.VITE_API_URL ?? "/data");

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  if (usingSupabase) return supabaseRequest<T>(method, path, body);
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
  if (usingSupabase) return supabaseCount(collection);
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
export { usingSupabase };
