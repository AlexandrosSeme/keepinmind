import { stripAccents } from "./text";

/** "Νίκος Παπαδόπουλος" → "Παπαδόπουλος Νίκος". A single word stays as it is. */
export function surnameFirst(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] ?? "";
  return `${parts[parts.length - 1]} ${parts.slice(0, -1).join(" ")}`;
}

function fold(value: string): string {
  return stripAccents(value).toLocaleLowerCase("el").replace(/ς/g, "σ");
}

/** Alphabetical order by surname, then by the remaining given names. */
export function comparePersonNames(a: string, b: string): number {
  return fold(surnameFirst(a)).localeCompare(fold(surnameFirst(b)), "el", {
    sensitivity: "base",
  });
}

/** Matches the stored "given surname" order and the displayed "surname given" order. */
export function personNameMatches(name: string, query: string): boolean {
  const q = fold(query.trim());
  if (!q) return true;
  return fold(name).includes(q) || fold(surnameFirst(name)).includes(q);
}
