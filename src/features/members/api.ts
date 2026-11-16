import { createCollection } from "@/shared/api/collection";
import { logger } from "@/shared/lib/logger";
import { withoutUndefined } from "@/shared/lib/object";
import type { Member, MemberInput } from "./types";

const members = createCollection<Member, MemberInput>("members");

export const fetchMembers = (): Promise<Member[]> =>
  members.list({ _sort: "id", _order: "asc" });

export async function fetchMemberById(id: number): Promise<Member | null> {
  try {
    return await members.get(id);
  } catch (error) {
    logger.error("[API] Error fetching member:", error);
    return null;
  }
}

export const createMember = (member: MemberInput): Promise<Member | null> =>
  members.create(withoutUndefined(member));

export const updateMember = (
  id: number,
  updates: Partial<MemberInput>,
): Promise<Member | null> => members.update(id, withoutUndefined(updates));

export const deleteMember = (id: number): Promise<boolean> =>
  members.remove(id);
