import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../lib/supabaseClient";
import type { Member } from "../types";
import { CheckCircle, XCircle, Clock } from "lucide-react";

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
        setError("Δεν βρέθηκε ID ή τηλέφωνο μέλους");
        setLoading(false);
        return;
      }

      if (!supabase) {
        setError("Η σύνδεση με τη βάση δεδομένων δεν είναι διαθέσιμη");
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
          setError("Δεν βρέθηκε μέλος");
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
  }, [memberId, phone]);

  const getStatusInfo = () => {
    if (!member) return null;

    switch (member.status) {
      case "active":
        return {
          icon: <CheckCircle className="text-success" size={24} />,
          text: "Ενεργή Συνδρομή",
          color: "text-success",
          bgColor: "bg-success bg-opacity-10",
        };
      case "expiring_soon":
        return {
          icon: <Clock className="text-warning" size={24} />,
          text: "Λήγει Σύντομα",
          color: "text-warning",
          bgColor: "bg-warning bg-opacity-10",
        };
      case "expired":
        return {
          icon: <XCircle className="text-danger" size={24} />,
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
            <span className="visually-hidden">Φόρτωση...</span>
          </div>
          <p className="text-muted">Φόρτωση...</p>
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
                  <h4 className="mb-3">Σφάλμα</h4>
                  <p className="text-muted">{error || "Δεν βρέθηκε μέλος"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const qrValue = JSON.stringify({
    memberId: member.id,
    name: member.name,
    phone: member.phone,
    timestamp: Date.now(),
  });

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
                  <h2 className="mb-3 fw-bold">Το QR Code μου</h2>
                  <div className="d-flex justify-content-center mb-3">
                    <div
                      className={`p-3 rounded-circle ${statusInfo?.bgColor || "bg-light"}`}
                    >
                      {statusInfo?.icon}
                    </div>
                  </div>
                  <p className={`mb-2 fw-semibold ${statusInfo?.color || "text-muted"}`}>
                    {statusInfo?.text}
                  </p>
                </div>

                {/* QR Code - Large and Centered */}
                <div className="d-flex justify-content-center mb-4">
                  <div className="p-4 bg-white border rounded-3 shadow-sm">
                    <QRCodeSVG
                      value={qrValue}
                      size={320}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                </div>

                {/* Member Info */}
                <div className="border-top pt-4">
                  <div className="row g-3">
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Όνομα</small>
                      <p className="mb-0 fw-semibold">{member.name}</p>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Τηλέφωνο</small>
                      <p className="mb-0">{member.phone}</p>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Πακέτο</small>
                      <p className="mb-0">{member.package}</p>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Λήξη</small>
                      <p className="mb-0">{member.expiry}</p>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-4 text-center">
                  <div className="alert alert-light border mb-0" role="alert">
                    <small className="d-block mb-1">
                      <strong>📱 Οδηγίες:</strong>
                    </small>
                    <small className="text-muted">
                      Δείξτε αυτό το QR code στον διαχειριστή για να εισέλθετε στο γυμναστήριο
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

