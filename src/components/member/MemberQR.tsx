import React from "react";
import { QRCodeSVG } from "qrcode.react";
import Barcode from "react-barcode";
import { useMemberSession } from "../../contexts/MemberSessionContext";
import StatusBadge from "../ui/StatusBadge";

const isBarcodeMember = (memberId: number) =>
  memberId >= 1001 && memberId <= 1005;

const MemberQR: React.FC = () => {
  const { member } = useMemberSession();
  if (!member) return null;

  const qrValue = JSON.stringify({
    id: member.id,
    memberId: member.id,
    name: member.name,
    phone: member.phone,
    timestamp: Date.now(),
  });

  return (
    <div>
      <h1 className="mp-page-title">QR εισοδου</h1>
      <p className="mp-page-sub">
        Δειξε αυτο στην εισοδο για check-in.
      </p>

      <div className="mp-qr-wrap">
        {isBarcodeMember(member.id) ? (
          <Barcode
            value={String(member.id)}
            format="CODE128"
            width={2}
            height={80}
            displayValue
          />
        ) : (
          <QRCodeSVG value={qrValue} size={220} level="M" includeMargin />
        )}
        <div className="text-center">
          <div className="fw-bold">{member.name}</div>
          <small className="text-muted">#{member.id}</small>
          <div className="mt-2">
            <StatusBadge status={member.status} />
          </div>
        </div>
      </div>

      {member.card_lost && (
        <div className="mp-card mt-3" style={{ borderColor: "rgba(214,59,59,0.4)" }}>
          <StatusBadge status="card_lost" />
          <p className="mb-0 mt-2 text-muted" style={{ fontSize: "0.9rem" }}>
            Η καρτα σου εχει ακυρωθει. Περασε απο reception για νεα καρτα.
          </p>
        </div>
      )}
    </div>
  );
};

export default MemberQR;
