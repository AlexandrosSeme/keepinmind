/** Basic shape check: something@domain.tld */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** 8–15 digits after removing +, spaces, dashes, dots and parentheses. */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[+\s\-().]/g, "");
  return /^[0-9]{8,15}$/.test(cleaned);
}
