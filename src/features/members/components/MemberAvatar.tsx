import React from "react";
import { User } from "lucide-react";
import type { Member } from "../types";
import "./MemberAvatar.scss";

interface MemberAvatarProps {
  member: Pick<Member, "name" | "photo_url">;
  onPhotoClick?: (photoUrl: string) => void;
}

const MemberAvatar: React.FC<MemberAvatarProps> = ({ member, onPhotoClick }) =>
  member.photo_url ? (
    <img
      src={member.photo_url}
      alt={member.name}
      className="rounded-circle me-3 km-member-avatar km-member-avatar--photo"
      onClick={() => onPhotoClick?.(member.photo_url!)}
    />
  ) : (
    <div className="km-avatar-soft rounded-circle d-flex align-items-center justify-content-center me-3 km-member-avatar">
      <User size={20} className="text-primary" />
    </div>
  );

export default MemberAvatar;
