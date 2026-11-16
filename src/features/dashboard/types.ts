/** A member whose subscription ends within the next days (derived from members). */
export interface UpcomingExpiry {
  /** Member id. */
  id: number;
  name: string;
  phone: string;
  expiry: string;
  days: number;
  package: string;
}
