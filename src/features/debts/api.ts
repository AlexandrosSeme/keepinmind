import { createCollection } from "@/shared/api/collection";
import { logger } from "@/shared/lib/logger";
import type { Debt, DebtInput } from "./types";

const debts = createCollection<Debt, DebtInput>("debts");

export const fetchDebts = (): Promise<Debt[]> =>
  debts.list({ _sort: "id", _order: "asc" });

/** Debts of one member, matched case-insensitively by full name. */
export async function fetchMemberDebts(memberName: string): Promise<Debt[]> {
  const name = memberName.trim().toLowerCase();
  try {
    const all = await debts.list();
    return all.filter((d) => d.name.trim().toLowerCase() === name);
  } catch (error) {
    logger.error("[API] Error fetching member debts:", error);
    return [];
  }
}

export const createDebt = (debt: DebtInput): Promise<Debt | null> =>
  debts.create(debt);

export const updateDebt = (
  id: number,
  updates: Partial<DebtInput>,
): Promise<Debt | null> => debts.update(id, updates);

export const deleteDebt = (id: number): Promise<boolean> => debts.remove(id);
