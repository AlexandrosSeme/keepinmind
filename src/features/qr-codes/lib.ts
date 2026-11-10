import type { Member } from "@/features/members";

/** Members 1001–1005 carry legacy barcode cards instead of QR codes. */
export const isBarcodeMember = (memberId: number): boolean =>
  memberId >= 1001 && memberId <= 1005;

/** JSON payload encoded in member QR codes; parsed by the check-in scanners. */
export const buildMemberQrValue = (
  member: Pick<Member, "id" | "name" | "phone">,
): string =>
  JSON.stringify({
    id: member.id,
    memberId: member.id,
    name: member.name,
    phone: member.phone,
    timestamp: Date.now(),
  });
