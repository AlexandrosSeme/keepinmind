export const GREEK_MONTHS_SHORT = [
  "Ιαν",
  "Φεβ",
  "Μαρ",
  "Απρ",
  "Μαι",
  "Ιουν",
  "Ιουλ",
  "Αυγ",
  "Σεπ",
  "Οκτ",
  "Νοε",
  "Δεκ",
] as const;

const pad2 = (n: number) => String(n).padStart(2, "0");

/** DD/MM/YYYY */
export function formatDate(date: Date): string {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** DD/MM/YYYY HH:mm — returns the input unchanged if it is not a valid date. */
export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${formatDate(date)} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/** Today as DD/MM/YYYY. */
export const todayGR = (): string => formatDate(new Date());

/** Parses DD/MM/YYYY (also accepts `.` or `-` separators). */
export function parseGRDate(value: string): Date | null {
  const parts = value.trim().split(/[./-]/);
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts.map(Number);
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(yyyy, mm - 1, dd);
  return Number.isNaN(d.getTime()) ? null : d;
}
