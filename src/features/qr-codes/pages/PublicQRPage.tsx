import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Barcode from "react-barcode";
import { supabase } from "../lib/supabaseClient";
import type { Member } from "../types";
import { CheckCircle, XCircle, Clock, ScanLine } from "lucide-react";

// Helper function to check if member uses barcode (IDs 1001-1005)
const isBarcodeMember = (memberId: number): boolean => {
  return memberId >= 1001 && memberId <= 1005;
};

const UserQRPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const memberId = searchParams.get("id");
  const phone = searchParams.get("phone");
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMember = async () => {
      if (!memberId && !phone) {
        setError("Δεν βρεθηκε ID η τηλεφωνο μελους");
        setLoading(false);
        return;
      }

      if (!supabase) {
        setError("Η συνδεση με τη βαση δεδομενων δεν ειναι διαθεσιμη");
        setLoading(false);
        return;
      }

      try {
        let query = supabase.from("members").select("*");
        
        if (memberId) {
          query = query.eq("id", memberId);
        } else if (phone) {
          query = query.eq("phone", phone);
        }

        const { data, error: fetchError } = await query.single();

        if (fetchError || !data) {
          setError("Δεν βρεθηκε μελος");
        } else {
          setMember(data as Member);
        }
      } catch (err) {
        setError("Σφαλμα κατα τη φορτωση των δεδομενων");
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [memberId, phone]);

  const getStatusInfo = () => {
    if (!member) return null;

    switch (member.status) {
      case "active":
        return {
          icon: <CheckCircle className="text-success" size={24} />,
          text: "Ενεργη Συνδρομη",
          color: "text-success",
          bgColor: "bg-success bg-opacity-10",
        };
      case "expiring_soon":
        return {
          icon: <Clock className="text-warning" size={24} />,
          text: "Ληγει Συντομα",
          color: "text-warning",
          bgColor: "bg-warning bg-opacity-10",
        };
      case "expired":
        return {
          icon: <XCircle className="text-danger" size={24} />,
          text: "Ληγμενη Συνδρομη",
          color: "text-danger",
          bgColor: "bg-danger bg-opacity-10",
        };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center vh-100"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Φορτωση...</span>
          </div>
          <p className="text-muted">Φορτωση...</p>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div
        className="d-flex justify-content-center align-items-center vh-100"
        style={{ backgroundColor: "#f8f9fa" }}
      >
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

  const statusInfo = getStatusInfo();
  const isBarcode = isBarcodeMember(member.id);
  const qrValue = JSON.stringify({
    id: member.id,
    memberId: member.id,
    name: member.name,
    phone: member.phone,
    timestamp: Date.now(),
  });
  
  console.log('[UserQRPage] Generated QR JSON:', qrValue);

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card border-0 shadow-lg">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <h2 className="mb-3 fw-bold">
                    {isBarcode ? "Το Barcode μου" : "Το QR Code μου"}
                  </h2>
                  <div className="d-flex justify-content-center mb-3">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className="rounded-circle"
                        style={{ width: '120px', height: '120px', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                      />
                    ) : (
                      <div
                        className={`p-3 rounded-circle ${statusInfo?.bgColor || "bg-light"}`}
                      >
                        {statusInfo?.icon}
                      </div>
                    )}
                  </div>
                  <p className={`mb-2 fw-semibold ${statusInfo?.color || "text-muted"}`}>
                    {statusInfo?.text}
                  </p>
                </div>

                {/* QR Code or Barcode - Large and Centered */}
                <div className="d-flex justify-content-center mb-4">
                  <div className="p-4 bg-white border rounded-3 shadow-sm">
                    {isBarcode ? (
                      <div className="d-flex flex-column align-items-center">
                        <Barcode
                          value={member.id.toString()}
                          format="CODE128"
                          width={2}
                          height={100}
                          displayValue={true}
                          fontSize={20}
                        />
                        <div className="mt-3 text-center">
                          <ScanLine size={24} className="text-info mb-2" />
                          <p className="mb-0 small text-muted">
                            Barcode ID: <strong>{member.id}</strong>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <QRCodeSVG
                        value={qrValue}
                        size={320}
                        level="H"
                        includeMargin={true}
                      />
                    )}
                  </div>
                </div>

                {/* Member Info */}
                <div className="border-top pt-4">
                  <div className="row g-3">
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Ονομα</small>
                      <p className="mb-0 fw-semibold">{member.name}</p>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Τηλεφωνο</small>
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

                {/* Instructions */}
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

export default UserQRPage;

