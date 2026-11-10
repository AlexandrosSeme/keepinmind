/**
 * Extracts a member id from raw scanner output.
 *
 * Handles plain numeric barcodes, the JSON payload of member QR codes, and the
 * garbled text USB scanners produce when the OS keyboard layout is Greek
 * (e.g. `"memberId"` arriving as `"μεμβερΙδ"` and `:` as `¨`).
 */
export function extractMemberId(raw: string): number | null {
  const trimmed = raw.trim();

  // Plain barcode, possibly wrapped in stray non-word characters.
  if (/^\d+$/.test(trimmed) || /^[^\w]*\d+[^\w]*$/.test(trimmed)) {
    const id = parseInt(trimmed.replace(/\D/g, ""));
    return id > 0 ? id : null;
  }

  const cleaned = normalizeScannerText(trimmed);

  // Well-formed JSON is trusted as-is: no id field means no member.
  const json = parseJsonObject(cleaned);
  if (json) return idFromRecord(json);

  const id =
    idFromPatterns(cleaned) ?? firstNumber(cleaned) ?? firstNumber(raw);
  return id && id > 0 ? id : null;
}

function normalizeScannerText(text: string): string {
  return text
    .replace(/¨/g, ":")
    .replace(/"μεμβερΙδ"/gi, '"memberId"')
    .replace(/"μεμβερΙΔ"/gi, '"memberId"')
    .replace(/"ναμε"/gi, '"name"')
    .replace(/"πηονε"/gi, '"phone"')
    .replace(/"τιμεσταμπ"/gi, '"timestamp"')
    .replace(/["']/g, '"')
    .replace(/╩╧/g, "")
    .replace(/░┴╨┴─╨╧╘╦╧/g, "");
}

function parseJsonObject(text: string): Record<string, unknown> | null {
  try {
    const data: unknown = JSON.parse(text);
    return data && typeof data === "object"
      ? (data as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function idFromRecord(record: Record<string, unknown>): number | null {
  const value =
    record.id ??
    record.ID ??
    record.memberId ??
    record.memberid ??
    record.member_id ??
    record["μεμβερΙδ"] ??
    record["μεμβερΙΔ"];
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
}

const ID_PATTERNS = [
  /["']?id["']?\s*[:=¨]\s*(\d+)/i,
  /["']?memberId["']?\s*[:=¨]\s*(\d+)/i,
  /["']?μεμβερΙδ["']?\s*[:=¨]\s*(\d+)/i,
  /id\s*[:=¨]\s*(\d+)/i,
  /μεμβερΙδ\s*[:=¨]\s*(\d+)/i,
  /memberId\s*[:=¨]\s*(\d+)/i,
];

function idFromPatterns(text: string): number | null {
  for (const pattern of ID_PATTERNS) {
    const match = text.match(pattern);
    if (match) return parseInt(match[1]);
  }
  return null;
}

/** Prefers a short (1–3 digit) number, since phones and timestamps are much longer. */
function firstNumber(text: string): number | null {
  const short = text.match(/\b(\d{1,3})\b/);
  if (short) return parseInt(short[1]);
  const any = text.match(/\d+/);
  return any ? parseInt(any[0]) : null;
}
