export type MemberStatus = "active" | "expiring_soon" | "expired";

export interface Member {
  id: number;
  name: string;
  phone: string;
  email?: string;
  status: MemberStatus;
  expiry: string;
  package: string;
  photo_url?: string;
  card_lost?: boolean;
}

export type MemberInput = Omit<Member, "id">;

export const EMPTY_MEMBER_INPUT: MemberInput = {
  name: "",
  phone: "",
  status: "active",
  expiry: "",
  package: "",
};
