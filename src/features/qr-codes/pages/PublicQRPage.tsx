import React from "react";
import { useSearchParams } from "react-router-dom";
import { ScanLine, XCircle } from "lucide-react";
import { isBarcodeMember } from "../lib";
import { useMemberLookup } from "../hooks/useMemberLookup";
import { getMemberStatusInfo } from "../components/memberStatusInfo";
import MemberCode from "../components/MemberCode";
import QrLoading from "../components/QrLoading";
import "./PublicQRPage.scss";

/** Public member QR page (`/my-qr?id=` or `?phone=`). */
const PublicQRPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { member, loading, error } = useMemberLookup({
    id: searchParams.get("id"),
    phone: searchParams.get("phone"),
  });

  if (loading) return <QrLoading className="km-public-qr" />;

  if (error || !member) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 km-public-qr">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
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
      </div>
    );
  }

  const statusInfo = getMemberStatusInfo(member.status, 24);
  const isBarcode = isBarcodeMember(member.id);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 km-public-qr">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card border-0 shadow-lg">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="mb-3 fw-bold">
                    {isBarcode ? "Το Barcode μου" : "Το QR Code μου"}
                  </h2>
                  <div className="d-flex justify-content-center mb-3">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className="rounded-circle km-public-qr__photo"
                      />
                    ) : (
                      <div
                        className={`p-3 rounded-circle ${statusInfo?.bgColor || "bg-light"}`}
                      >
                        {statusInfo?.icon}
                      </div>
                    )}
                  </div>
                  <p
                    className={`mb-2 fw-semibold ${statusInfo?.color || "text-muted"}`}
                  >
                    {statusInfo?.text}
                  </p>
                </div>

                <div className="d-flex justify-content-center mb-4">
                  <div className="p-4 bg-white border rounded-3 shadow-sm">
                    {isBarcode ? (
                      <div className="d-flex flex-column align-items-center">
                        <MemberCode
                          member={member}
                          qrSize={320}
                          barcodeHeight={100}
                          barcodeFontSize={20}
                        />
                        <div className="mt-3 text-center">
                          <ScanLine size={24} className="text-info mb-2" />
                          <p className="mb-0 small text-muted">
                            Barcode ID: <strong>{member.id}</strong>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <MemberCode
                        member={member}
                        qrSize={320}
                        barcodeHeight={100}
                      />
                    )}
                  </div>
                </div>

                <div className="border-top pt-4">
                  <div className="row g-3">
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Ονομα</small>
                      <p className="mb-0 fw-semibold">{member.name}</p>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">
                        Τηλεφωνο
                      </small>
                      <p className="mb-0">{member.phone}</p>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Πακετο</small>
                      <p className="mb-0">{member.package}</p>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Ληξη</small>
                      <p className="mb-0">{member.expiry}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <div className="alert alert-light border mb-0" role="alert">
                    <small className="d-block mb-1">
                      <strong>📱 Οδηγιες:</strong>
                    </small>
                    <small className="text-muted">
                      {isBarcode
                        ? "Δειξτε αυτο το barcode στον διαχειριστη για να εισελθετε στο γυμναστηριο"
                        : "Δειξτε αυτο το QR code στον διαχειριστη για να εισελθετε στο γυμναστηριο"}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicQRPage;
