/** Keeps only the digits of a phone number. */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}
