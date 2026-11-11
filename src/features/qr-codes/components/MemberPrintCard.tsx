import React from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, CreditCard, Printer } from "lucide-react";
import type { Member } from "@/features/members";
import { isBarcodeMember } from "../lib";
import MemberCode from "./MemberCode";
import GymLogo from "./GymLogo";

const STATUS_DOT: Record<Member["status"], string> = {
  active: "status-active",
  expiring_soon: "status-warning",
  expired: "status-expired",
};

interface MemberPrintCardProps {
  member: Member;
  selected: boolean;
  /** Start a new printed page before this card. */
  pageBreak: boolean;
  onToggleSelect: () => void;
  onPrint: () => void;
  onToggleCardLost: () => void;
  onPrintNew: () => void;
}

/** Credit-card sized member card (85.60mm x 53.98mm) with on-screen management actions. */
const MemberPrintCard: React.FC<MemberPrintCardProps> = ({
  member,
  selected,
  pageBreak,
  onToggleSelect,
  onPrint,
  onToggleCardLost,
  onPrintNew,
}) => {
  const { t } = useTranslation(["qrCodes", "common"]);
  const isLost = member.card_lost === true;
  const statusKey = member.status in STATUS_DOT ? member.status : "expired";

  return (
    <div
      data-member-id={member.id}
      className={`col-12 col-sm-6 col-md-4 col-lg-3 credit-card-container ${!selected ? "d-print-none" : ""} ${pageBreak ? "page-break-before" : ""}`}
    >
      <div
        className={`credit-card ${selected ? "card-selected" : "card-unselected"} ${isLost ? "card-lost" : ""}`}
        onClick={onToggleSelect}
      >
        <div className="card-checkbox d-print-none">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            onClick={(e) => e.stopPropagation()}
            className="form-check-input"
          />
        </div>

        {isLost && (
          <div className="card-lost-badge d-print-none">
            <AlertTriangle size={14} />
            <span>{t("card.lost")}</span>
          </div>
        )}

        <div
          className="card-actions d-print-none"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="btn btn-sm btn-primary mb-1 w-100"
            onClick={onPrint}
            title={t("card.printThis")}
          >
            <Printer size={12} className="me-1" />
            {t("common:actions.print")}
          </button>

          {isLost ? (
            <>
              <button
                className="btn btn-sm btn-success mb-1 w-100"
                onClick={onToggleCardLost}
                title={t("card.activateTitle")}
              >
                <CreditCard size={12} className="me-1" />
                {t("card.activate")}
              </button>
              <button
                className="btn btn-sm btn-warning w-100"
                onClick={onPrintNew}
                title={t("card.printNewTitle")}
              >
                <Printer size={12} className="me-1" />
                {t("card.printNew")}
              </button>
            </>
          ) : (
            <button
              className="btn btn-sm btn-danger w-100"
              onClick={onToggleCardLost}
              title={t("card.cancelTitle")}
            >
              <AlertTriangle size={12} className="me-1" />
              {t("common:actions.cancel")}
            </button>
          )}
        </div>

        <div className="card-header-custom">
          <div className="logo-section">
            <div className="logo-placeholder">
              <GymLogo />
            </div>
            <div className="gym-name">
              <div className="gym-name-main">COLOSSEUM</div>
              <div className="gym-name-sub">GYM</div>
            </div>
          </div>
        </div>

        <div className="card-body-custom">
          <div className="member-name">{member.name}</div>

          <div className="code-section">
            <div
              className={
                isBarcodeMember(member.id)
                  ? "barcode-container"
                  : "qr-container"
              }
            >
              <MemberCode
                member={member}
                qrSize={60}
                qrMargin={false}
                barcodeHeight={40}
                barcodeFontSize={12}
                barcodeMargin={0}
              />
            </div>
          </div>

          <div className="member-info">
            <div className="info-row">
              <span className="info-label">ID:</span>
              <span className="info-value">{member.id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{t("card.phone")}</span>
              <span className="info-value">{member.phone}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{t("card.package")}</span>
              <span className="info-value-small">{member.package}</span>
            </div>
            <div className="status-badge">
              <span className={`status-dot ${STATUS_DOT[statusKey]}`}></span>
              <span className="status-text">
                {t(`card.status.${statusKey}`)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberPrintCard;
