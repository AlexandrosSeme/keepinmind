import { createCollection } from "@/shared/api/collection";
import type { UpcomingExpiry } from "./types";

const upcomingExpiries = createCollection<UpcomingExpiry>("upcoming_expiries");

export const fetchUpcomingExpiries = (): Promise<UpcomingExpiry[]> =>
  upcomingExpiries.list({ _sort: "id", _order: "asc" });
