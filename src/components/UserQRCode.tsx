import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import type { Member } from "../types";
import { CheckCircle, XCircle, Clock } from "lucide-react";

const UserQRCode: React.FC = () => {
  const [searchParams] = useSearchParams();
  const memberId = searchParams.get("id");
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMember = async () => {
      if (!memberId) {
        setError("Δεν βρέθηκε ID μέλους");
        setLoading(false);
        return;
      }

      if (!supabase) {
        setError("Η σύνδεση με τη βάση δεδομένων δεν είναι διαθέσιμη");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("members")
          .select("*")
          .eq("id", memberId)
          .single();

        if (fetchError) {
          setError("Δεν βρέθηκε μέλος με αυτό το ID");
        } else {
          setMember(data as Member);
        }
      } catch (err) {
        setError("Σφάλμα κατά τη φόρτωση των δεδομένων");
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [memberId]);

  const getStatusInfo = () => {
    if (!member) return null;

    switch (member.status) {
      case "active":
        return {
          icon: <CheckCircle className="text-success" size={20} />,
          text: "Ενεργή Συνδρομή",
          color: "text-success",
          bgColor: "bg-success bg-opacity-10",
        };
      case "expiring_soon":
        return {
          icon: <Clock className="text-warning" size={20} />,
          text: "Λήγει Σύντομα",
          color: "text-warning",
          bgColor: "bg-warning bg-opacity-10",
        };
      case "expired":
        return {
          icon: <XCircle className="text-danger" size={20} />,
          text: "Ληγμένη Συνδρομή",
          color: "text-danger",
          bgColor: "bg-danger bg-opacity-10",
        };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Φόρτωση...</span>
          </div>
          <p className="text-muted">Φόρτωση...</p>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-5">
                <XCircle className="text-danger mb-3" size={64} />
                <h4 className="mb-3">Σφάλμα</h4>
                <p className="text-muted">{error || "Δεν βρέθηκε μέλος"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const qrValue = JSON.stringify({
    id: member.id,
    memberId: member.id,
    name: member.name,
    phone: member.phone,
    timestamp: Date.now(),
  });
  
  console.log('[UserQRCode] Generated QR JSON:', qrValue);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h3 className="mb-3">Το QR Code μου</h3>
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

              {/* QR Code */}
              <div className="d-flex justify-content-center mb-4">
                <div className="p-3 bg-white border rounded">
                  <QRCodeSVG
                    value={qrValue}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>

              {/* Member Info */}
              <div className="border-top pt-3">
                <div className="mb-2">
                  <small className="text-muted">Όνομα:</small>
                  <p className="mb-0 fw-semibold">{member.name}</p>
                </div>
                <div className="mb-2">
                  <small className="text-muted">Τηλέφωνο:</small>
                  <p className="mb-0">{member.phone}</p>
                </div>
                <div className="mb-2">
                  <small className="text-muted">Πακέτο:</small>
                  <p className="mb-0">{member.package}</p>
                </div>
                <div>
                  <small className="text-muted">Λήξη:</small>
                  <p className="mb-0">{member.expiry}</p>
                </div>
              </div>

              <div className="mt-4 text-center">
                <small className="text-muted">
                  Δείξτε αυτό το QR code στον διαχειριστή για να εισέλθετε
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserQRCode;

