import React from "react";
import { QRCodeSVG } from "qrcode.react";
import Barcode from "react-barcode";
import type { Member } from "@/features/members";
import { buildMemberQrValue, isBarcodeMember } from "../lib";

interface MemberCodeProps {
  member: Pick<Member, "id" | "name" | "phone">;
  qrSize: number;
  qrLevel?: "L" | "M" | "Q" | "H";
  barcodeHeight: number;
  barcodeWidth?: number;
  barcodeFontSize?: number;
  /** Quiet zone around the QR code (default true). */
  qrMargin?: boolean;
  barcodeMargin?: number;
}

/** The member's entry code: a CODE128 barcode for legacy cards, otherwise a QR code. */
const MemberCode: React.FC<MemberCodeProps> = ({
  member,
  qrSize,
  qrLevel = "H",
  barcodeHeight,
  barcodeWidth = 2,
  barcodeFontSize,
  qrMargin = true,
  barcodeMargin,
}) =>
  isBarcodeMember(member.id) ? (
    <Barcode
      value={String(member.id)}
      format="CODE128"
      width={barcodeWidth}
      height={barcodeHeight}
      displayValue
      fontSize={barcodeFontSize}
      margin={barcodeMargin}
    />
  ) : (
    <QRCodeSVG
      value={buildMemberQrValue(member)}
      size={qrSize}
      level={qrLevel}
      includeMargin={qrMargin}
    />
  );

export default MemberCode;
