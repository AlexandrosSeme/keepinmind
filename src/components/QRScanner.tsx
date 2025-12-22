import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle, XCircle, AlertCircle, Camera } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import type { Member } from "../types";

interface ValidationResult {
  valid: boolean;
  member: Member | null;
  message: string;
  reason?: string;
}

const QRScanner: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualId, setManualId] = useState<string>("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraId, setCameraId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current = null;
          })
          .catch(() => {
            scannerRef.current = null;
          });
      }
    };
  }, []);

  const validateMember = async (memberId: number): Promise<ValidationResult> => {
    if (!supabase) {
      return {
        valid: false,
        member: null,
        message: "Σφάλμα σύνδεσης",
        reason: "Η σύνδεση με τη βάση δεδομένων δεν είναι διαθέσιμη",
      };
    }

    try {
      const { data, error: fetchError } = await supabase
        .from("members")
        .select("*")
        .eq("id", memberId)
        .single();

      if (fetchError || !data) {
        return {
          valid: false,
          member: null,
          message: "Μη έγκυρο QR Code",
          reason: "Δεν βρέθηκε μέλος με αυτό το ID",
        };
      }

      const member = data as Member;

      // Check if subscription is active
      if (member.status === "expired") {
        return {
          valid: false,
          member,
          message: "Ληγμένη Συνδρομή",
          reason: `Η συνδρομή έληξε στις ${member.expiry}`,
        };
      }

      // Check if subscription is expiring soon (still valid but warning)
      if (member.status === "expiring_soon") {
        return {
          valid: true,
          member,
          message: "Ενεργή Συνδρομή (Λήγει Σύντομα)",
          reason: `Η συνδρομή λήγει στις ${member.expiry}`,
        };
      }

      // Active subscription
      if (member.status === "active") {
        return {
          valid: true,
          member,
          message: "Ενεργή Συνδρομή",
        };
      }

      return {
        valid: false,
        member,
        message: "Μη έγκυρη Κατάσταση",
        reason: "Η κατάσταση της συνδρομής δεν είναι έγκυρη",
      };
    } catch (err) {
      return {
        valid: false,
        member: null,
        message: "Σφάλμα Επικύρωσης",
        reason: "Σφάλμα κατά την επικοινωνία με τη βάση δεδομένων",
      };
    }
  };

  const startScanning = async () => {
    try {
      setError(null);
      setValidationResult(null);

      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      
      if (devices && devices.length > 0) {
        const selectedCameraId = cameraId || devices[0].id;
        setCameraId(selectedCameraId);

        await html5QrCode.start(
          selectedCameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            // Stop scanning after successful scan
            await html5QrCode.stop();
            setScanning(false);

            try {
              // Parse QR code data
              const qrData = JSON.parse(decodedText);
              const memberId = qrData.memberId;

              if (!memberId) {
                setValidationResult({
                  valid: false,
                  member: null,
                  message: "Μη έγκυρο QR Code",
                  reason: "Το QR code δεν περιέχει έγκυρα δεδομένα",
                });
                return;
              }

              // Validate member
              const result = await validateMember(memberId);
              setValidationResult(result);
            } catch (parseError) {
              setValidationResult({
                valid: false,
                member: null,
                message: "Μη έγκυρο QR Code",
                reason: "Δεν ήταν δυνατή η ανάγνωση του QR code",
              });
            }
          },
          () => {
            // Ignore scanning errors (they're frequent during scanning)
          }
        );

        setScanning(true);
      } else {
        setError("Δεν βρέθηκε κάμερα");
      }
    } catch (err: any) {
      setError(err.message || "Σφάλμα κατά την έναρξη της σάρωσης");
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        // Ignore errors when stopping
      }
    }
    setScanning(false);
  };

  const resetValidation = () => {
    setValidationResult(null);
    setManualId("");
  };

  const handleManualValidation = async () => {
    const id = parseInt(manualId);
    if (isNaN(id) || id <= 0) {
      setError("Παρακαλώ εισάγετε έγκυρο ID μέλους");
      return;
    }

    setError(null);
    const result = await validateMember(id);
    setValidationResult(result);
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">Σάρωση QR Code</h2>
        </div>
      </div>

      <div className="row">
        {/* Scanner Section */}
        <div className="col-12 col-md-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Κάμερα</h5>
                {!scanning ? (
                  <button
                    className="btn btn-primary"
                    onClick={startScanning}
                    disabled={scanning}
                  >
                    <Camera className="me-2" size={18} />
                    Έναρξη Σάρωσης
                  </button>
                ) : (
                  <button
                    className="btn btn-danger"
                    onClick={stopScanning}
                  >
                    Διακοπή Σάρωσης
                  </button>
                )}
              </div>

              <div
                id="qr-reader"
                style={{
                  width: "100%",
                  minHeight: "300px",
                }}
              ></div>

              {error && (
                <div className="alert alert-danger mt-3" role="alert">
                  {error}
                </div>
              )}

              {/* Manual Input */}
              <div className="mt-4 border-top pt-3">
                <h6 className="mb-3">Ή εισάγετε ID μέλους χειροκίνητα:</h6>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="ID μέλους"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleManualValidation();
                      }
                    }}
                  />
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={handleManualValidation}
                  >
                    Επικύρωση
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Result Section */}
        <div className="col-12 col-md-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">Αποτέλεσμα Επικύρωσης</h5>

              {!validationResult ? (
                <div className="text-center text-muted py-5">
                  <AlertCircle size={48} className="mb-3 opacity-50" />
                  <p>Σαρώστε ένα QR code για να δείτε το αποτέλεσμα</p>
                </div>
              ) : (
                <div>
                  <div
                    className={`alert ${
                      validationResult.valid
                        ? "alert-success"
                        : "alert-danger"
                    } d-flex align-items-center`}
                    role="alert"
                  >
                    {validationResult.valid ? (
                      <CheckCircle className="me-2" size={24} />
                    ) : (
                      <XCircle className="me-2" size={24} />
                    )}
                    <div>
                      <strong>{validationResult.message}</strong>
                      {validationResult.reason && (
                        <div className="small mt-1">
                          {validationResult.reason}
                        </div>
                      )}
                    </div>
                  </div>

                  {validationResult.member && (
                    <div className="mt-3">
                      <h6>Στοιχεία Μέλους:</h6>
                      <div className="border-top pt-3">
                        <div className="mb-2">
                          <small className="text-muted">Όνομα:</small>
                          <p className="mb-0 fw-semibold">
                            {validationResult.member.name}
                          </p>
                        </div>
                        <div className="mb-2">
                          <small className="text-muted">Τηλέφωνο:</small>
                          <p className="mb-0">
                            {validationResult.member.phone}
                          </p>
                        </div>
                        <div className="mb-2">
                          <small className="text-muted">Πακέτο:</small>
                          <p className="mb-0">
                            {validationResult.member.package}
                          </p>
                        </div>
                        <div>
                          <small className="text-muted">Λήξη:</small>
                          <p className="mb-0">
                            {validationResult.member.expiry}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-3">
                    <button
                      className="btn btn-outline-primary w-100"
                      onClick={resetValidation}
                    >
                      Νέα Σάρωση
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;

