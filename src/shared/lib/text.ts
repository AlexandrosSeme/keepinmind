const GREEK_ACCENT_MAP: Record<string, string> = {
  ά: "α",
  έ: "ε",
  ή: "η",
  ί: "ι",
  ό: "ο",
  ύ: "υ",
  ώ: "ω",
  Ά: "Α",
  Έ: "Ε",
  Ή: "Η",
  Ί: "Ι",
  Ό: "Ο",
  Ύ: "Υ",
  Ώ: "Ω",
  ϊ: "ι",
  ϋ: "υ",
  ΐ: "ι",
  ΰ: "υ",
};

/** Removes Greek tonos/dialytika so text renders consistently in uppercase display fonts. */
export function stripAccents(text: string): string {
  return [...text].map((c) => GREEK_ACCENT_MAP[c] || c).join("");
}
