import React from "react";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "@/shared/ui";
import { MemberCode } from "@/features/qr-codes";
import { useMemberSession } from "../session/useMemberSession";

const MemberQRPage: React.FC = () => {
  const { t } = useTranslation("memberPortal");
  const { member } = useMemberSession();
  if (!member) return null;

  return (
    <div>
      <h1 className="mp-page-title">{t("qr.title")}</h1>
      <p className="mp-page-sub">{t("qr.subtitle")}</p>

      <div className="mp-qr-wrap">
        <MemberCode
          member={member}
          qrSize={220}
          qrLevel="M"
          barcodeHeight={80}
        />
        <div className="text-center">
          <div className="fw-bold">{member.name}</div>
          <small className="text-muted">#{member.id}</small>
          <div className="mt-2">
            <StatusBadge status={member.status} />
          </div>
        </div>
      </div>

      {member.card_lost && (
        <div className="mp-card mp-card--danger mt-3">
          <StatusBadge status="card_lost" />
          <p className="mb-0 mt-2 text-muted mp-text-sm">{t("qr.cardLost")}</p>
        </div>
      )}
    </div>
  );
};

export default MemberQRPage;
