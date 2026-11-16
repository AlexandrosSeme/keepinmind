import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "./apiError";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/** Live deployments set these on Vercel. Local `npm run dev` leaves them empty and uses json-server. */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const usingSupabase = supabase !== null;

type Row = Record<string, unknown>;

/** Frontend field → column, only where the existing Supabase tables use snake_case. */
const RENAMES: Record<string, Record<string, string>> = {
  bookings: {
    memberId: "member_id",
    memberName: "member_name",
    memberPhone: "member_phone",
    startTime: "start_time",
    endTime: "end_time",
    maxParticipants: "max_participants",
    currentParticipants: "current_participants",
  },
  entrance_logs: {
    memberId: "member_id",
    memberName: "member_name",
    memberPhone: "member_phone",
    memberStatus: "member_status",
    validationStatus: "validation_status",
    validationMessage: "validation_message",
    entranceType: "entrance_type",
  },
  payments: { memberId: "member_id" },
  debts: { memberId: "member_id" },
  staff: {
    fullName: "full_name",
    createdAt: "created_at",
    lastSignInAt: "last_sign_in_at",
  },
};

const NUMERIC = new Set([
  "id",
  "amount",
  "price",
  "daysOverdue",
  "memberId",
  "maxParticipants",
  "currentParticipants",
]);

function column(table: string, field: string) {
  return RENAMES[table]?.[field] ?? field;
}

function toDb(table: string, row: Row): Row {
  const out: Row = {};
  Object.entries(row).forEach(([key, value]) => {
    if (value !== undefined) out[column(table, key)] = value;
  });
  return out;
}

function fromDb(table: string, row: Row): Row {
  const map = RENAMES[table] ?? {};
  const reverse: Record<string, string> = {};
  Object.entries(map).forEach(([field, col]) => {
    reverse[col] = field;
  });
  const out: Row = {};
  Object.entries(row).forEach(([key, value]) => {
    const field = reverse[key] ?? key;
    out[field] =
      NUMERIC.has(field) && typeof value === "string" && value !== ""
        ? Number(value)
        : value;
  });
  return out;
}

function fail(error: { code?: string; message: string }): never {
  throw new ApiError(error.code === "PGRST116" ? 404 : 500, error.message);
}

interface ListQuery {
  eq: (column: string, value: unknown) => ListQuery;
  gte: (column: string, value: string) => ListQuery;
  lte: (column: string, value: string) => ListQuery;
  order: (column: string, options: { ascending: boolean }) => ListQuery;
  range: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: Row[] | null; error: { code?: string; message: string } | null }>;
}

function filtered(table: string, params: URLSearchParams): { query: ListQuery; limit: number | null; sort: string; ascending: boolean } {
  const client = supabase;
  if (!client) throw new ApiError(500, "Supabase is not configured");
  let query = client.from(table).select("*") as unknown as ListQuery;
  let limit: number | null = null;
  let sort = "id";
  let ascending = true;

  params.forEach((raw, key) => {
    if (key === "_limit") {
      limit = Number(raw);
      return;
    }
    if (key === "_sort") {
      sort = column(table, raw);
      return;
    }
    if (key === "_order") {
      ascending = raw !== "desc";
      return;
    }
    if (key.endsWith("_gte")) {
      query = query.gte(column(table, key.slice(0, -4)), raw);
      return;
    }
    if (key.endsWith("_lte")) {
      query = query.lte(column(table, key.slice(0, -4)), raw);
      return;
    }
    const value = raw === "true" ? true : raw === "false" ? false : raw;
    query = query.eq(column(table, key), value);
  });

  return { query, limit, sort, ascending };
}

async function list(table: string, params: URLSearchParams): Promise<Row[]> {
  const pageSize = 1000;
  const rows: Row[] = [];
  let offset = 0;

  for (;;) {
    const { query, limit, sort, ascending } = filtered(table, params);
    const cap = limit ?? Number.POSITIVE_INFINITY;
    const size = Math.min(pageSize, cap - rows.length);
    const { data, error } = await query
      .order(sort, { ascending })
      .range(offset, offset + size - 1);
    if (error) fail(error);
    const batch = data ?? [];
    batch.forEach((row) => rows.push(fromDb(table, row)));
    if (batch.length < size || rows.length >= cap) break;
    offset += batch.length;
  }

  return rows;
}

function parse(path: string) {
  const url = new URL(path, "http://local");
  const [table, id] = url.pathname.split("/").filter(Boolean);
  return { table, id: id ? Number(id) : null, params: url.searchParams };
}

export async function supabaseRequest<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  const client = supabase;
  if (!client) throw new ApiError(500, "Supabase is not configured");
  const { table, id, params } = parse(path);
  if (!table) throw new ApiError(404, "Missing collection");

  if (method === "GET" && id == null) {
    return (await list(table, params)) as T;
  }

  if (method === "GET" && id != null) {
    const { data, error } = await client
      .from(table)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) fail(error);
    if (!data) throw new ApiError(404, `${table}/${id} not found`);
    return fromDb(table, data as Row) as T;
  }

  if (method === "POST") {
    const { data, error } = await client
      .from(table)
      .insert(toDb(table, (body ?? {}) as Row))
      .select("*")
      .single();
    if (error) fail(error);
    return fromDb(table, data as Row) as T;
  }

  if (method === "PATCH" && id != null) {
    const { data, error } = await client
      .from(table)
      .update(toDb(table, (body ?? {}) as Row))
      .eq("id", id)
      .select("*")
      .single();
    if (error) fail(error);
    return fromDb(table, data as Row) as T;
  }

  if (method === "DELETE" && id != null) {
    const { error } = await client.from(table).delete().eq("id", id);
    if (error) fail(error);
    return undefined as T;
  }

  throw new ApiError(404, `${method} ${path} is not supported`);
}

export async function supabaseCount(table: string): Promise<number> {
  const client = supabase;
  if (!client) throw new ApiError(500, "Supabase is not configured");
  const { count, error } = await client
    .from(table)
    .select("id", { count: "exact", head: true });
  if (error) fail(error);
  return count ?? 0;
}
