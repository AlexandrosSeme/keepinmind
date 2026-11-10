import type { Member } from "../types";

export interface MemberRowActions {
  onView: (member: Member) => void;
  onEdit: (member: Member) => void;
  onToggleCardLost: (member: Member) => void;
  onPrintCard: (member: Member) => void;
  onDelete: (member: Member) => void;
  onPhotoClick: (photoUrl: string) => void;
}
