import React from "react";
import { useTranslation } from "react-i18next";
import { User } from "lucide-react";
import { StatusBadge } from "@/shared/ui";
import { stripAccents } from "@/shared/lib/text";
import type { Member } from "../types";

interface MemberProfileCardProps {
  member: Member;
  yearAttendance: number;
  onPhotoClick: () => void;
}

const MemberProfileCard: React.FC<MemberProfileCardProps> = ({
  member,
  yearAttendance,
  onPhotoClick,
}) => {
  const { t } = useTranslation("members");
  const fields = [
    { label: t("fields.phone"), value: member.phone },
    {
      label: t("fields.email"),
      value: member.email ? stripAccents(member.email) : "—",
    },
    {
      label: t("fields.package"),
      value: member.package ? stripAccents(member.package) : t("fields.notSet"),
    },
    { label: t("fields.expiry"), value: member.expiry || "—" },
    { label: t("fields.yearAttendance"), value: yearAttendance },
  ];

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-3">
        <div className="km-member__profile">
          {member.photo_url ? (
            <img
              src={member.photo_url}
              alt={stripAccents(member.name)}
              className="km-member__photo"
              onClick={onPhotoClick}
            />
          ) : (
            <div className="km-member__photo-fallback">
              <User size={36} />
            </div>
          )}

          <div className="flex-grow-1 min-w-0">
            <h3 className="km-member__name">{stripAccents(member.name)}</h3>
            <div className="mb-2">
              <StatusBadge status={member.status} />
              {member.card_lost && (
                <span className="ms-2">
                  <StatusBadge status="card_lost" />
                </span>
              )}
            </div>
            <div className="km-member__meta">
              {fields.map((field) => (
                <div key={field.label}>
                  <div className="km-member__field-label">{field.label}</div>
                  <div className="km-member__field-value">{field.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfileCard;
