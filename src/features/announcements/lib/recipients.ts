import i18n from "@/shared/i18n";
import type { Member } from "@/features/members";
import type { RecipientGroup } from "../types";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const isExpiringWithinWeek = (m: Member, today = new Date()) => {
  const expiry = new Date(m.expiry);
  return expiry >= today && expiry <= new Date(today.getTime() + WEEK_MS);
};

const isOverdue = (m: Member) =>
  new Date(m.expiry) < new Date() && m.status === "expired";

const GROUP_FILTERS: Record<RecipientGroup, (m: Member) => boolean> = {
  all: () => true,
  active: (m) => m.status === "active",
  expiring: (m) => isExpiringWithinWeek(m),
  overdue: isOverdue,
  monthly: (m) => m.package.toLowerCase().includes("μηνιαι"),
  yearly: (m) => m.package.toLowerCase().includes("ετησι"),
};

export function filterMembersByGroup(
  members: Member[],
  group: RecipientGroup,
): Member[] {
  return members.filter(GROUP_FILTERS[group]);
}

export function buildRecipientOptions(members: Member[]) {
  return (Object.keys(GROUP_FILTERS) as RecipientGroup[]).map((group) => ({
    value: group,
    label: `${i18n.t(`announcements:groups.${group}`)} (${filterMembersByGroup(members, group).length})`,
  }));
}
