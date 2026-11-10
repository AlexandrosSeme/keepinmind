import React from "react";
import { useSearchParams } from "react-router-dom";
import { ScanLine, XCircle } from "lucide-react";
import { isBarcodeMember } from "../lib";
import { useMemberLookup } from "../hooks/useMemberLookup";
import { getMemberStatusInfo } from "../components/memberStatusInfo";
import MemberCode from "../components/MemberCode";
import QrLoading from "../components/QrLoading";

/** Admin preview of a member's QR code (`/user-qr?id=`). */
const UserQRCodePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { member, loading, error } = useMemberLookup({
    id: searchParams.get("id"),
  });

  if (loading) return <QrLoading />;

  if (error || !member) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-5">
                <XCircle className="text-danger mb-3" size={64} />
                <h4 className="mb-3">Σφαλμα</h4>
                <p className="text-muted">{error || "Δεν βρεθηκε μελος"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getMemberStatusInfo(member.status, 20);
  const isBarcode = isBarcodeMember(member.id);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h3 className="mb-3">
                  {isBarcode ? "Το Barcode μου" : "Το QR Code μου"}
                </h3>
                <div className="d-flex justify-content-center mb-3">
                  <div
                    className={`p-3 rounded-circle ${statusInfo?.bgColor || "bg-light"}`}
                  >
                    {statusInfo?.icon}
                  </div>
                </div>
                <p className={`mb-2 ${statusInfo?.color || "text-muted"}`}>
                  {statusInfo?.text}
                </p>
              </div>

              <div className="d-flex justify-content-center mb-4">
                <div className="p-3 bg-white border rounded">
                  {isBarcode ? (
                    <div className="d-flex flex-column align-items-center">
                      <MemberCode
                        member={member}
                        qrSize={256}
                        barcodeHeight={80}
                        barcodeFontSize={18}
                      />
                      <div className="mt-2 text-center">
                        <ScanLine size={20} className="text-info mb-1" />
                        <p className="mb-0 small text-muted">
                          Barcode ID: <strong>{member.id}</strong>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <MemberCode
                      member={member}
                      qrSize={256}
                      barcodeHeight={80}
                    />
                  )}
                </div>
              </div>

              <div className="border-top pt-3">
                <div className="mb-2">
                  <small className="text-muted">Ονομα:</small>
                  <p className="mb-0 fw-semibold">{member.name}</p>
                </div>
                <div className="mb-2">
                  <small className="text-muted">Τηλεφωνο:</small>
                  <p className="mb-0">{member.phone}</p>
                </div>
                <div className="mb-2">
                  <small className="text-muted">Πακετο:</small>
                  <p className="mb-0">{member.package}</p>
                </div>
                <div>
                  <small className="text-muted">Ληξη:</small>
                  <p className="mb-0">{member.expiry}</p>
                </div>
              </div>

              <div className="mt-4 text-center">
                <small className="text-muted">
                  {isBarcode
                    ? "Δειξτε αυτο το barcode στον διαχειριστη για να εισελθετε"
                    : "Δειξτε αυτο το QR code στον διαχειριστη για να εισελθετε"}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserQRCodePage;
