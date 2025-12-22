import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle, XCircle, AlertCircle, Camera, Settings } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import type { Member } from "../types";
import { logEntrance } from "../services/entranceLogService";

interface ValidationResult {
  valid: boolean;
  member: Member | null;
  message: string;
  reason?: string;
}

interface CameraDevice {
  id: string;
  label: string;
}

const QRScanner: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualId, setManualId] = useState<string>("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraId, setCameraId] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [loadingCameras, setLoadingCameras] = useState(false);
  const [scanQuality, setScanQuality] = useState<'fast' | 'balanced' | 'accurate'>('fast');

  // Load available cameras on component mount
  useEffect(() => {
    const loadCameras = async () => {
      setLoadingCameras(true);
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          const cameras: CameraDevice[] = devices.map((device, index) => ({
            id: device.id,
            label: device.label || `Κάμερα ${index + 1}`,
          }));
          setAvailableCameras(cameras);
          // Set default camera if none selected
          if (!cameraId && cameras.length > 0) {
            setCameraId(cameras[0].id);
          }
        } else {
          setError("Δεν βρέθηκαν κάμερες");
        }
      } catch (err) {
        console.error("Error loading cameras:", err);
        setError("Σφάλμα κατά τη φόρτωση των καμερών");
      } finally {
        setLoadingCameras(false);
      }
    };

    loadCameras();
  }, []);

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
    } catch {
      return {
        valid: false,
        member: null,
        message: "Σφάλμα Επικύρωσης",
        reason: "Σφάλμα κατά την επικοινωνία με τη βάση δεδομένων",
      };
    }
  };

  const getScanConfig = () => {
    switch (scanQuality) {
      case 'fast':
        return {
          fps: 30,
          qrbox: { width: 400, height: 400 },
          aspectRatio: 1.0,
          disableFlip: false,
        };
      case 'balanced':
        return {
          fps: 20,
          qrbox: { width: 350, height: 350 },
          aspectRatio: 1.0,
          disableFlip: false,
        };
      case 'accurate':
        return {
          fps: 15,
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1.0,
          disableFlip: false,
        };
      default:
        return {
          fps: 30,
          qrbox: { width: 400, height: 400 },
          aspectRatio: 1.0,
          disableFlip: false,
        };
    }
  };

  const startScanning = async () => {
    if (!cameraId) {
      setError("Παρακαλώ επιλέξτε κάμερα");
      return;
    }

    try {
      setError(null);
      setValidationResult(null);

      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      const config = getScanConfig();

      await html5QrCode.start(
        cameraId,
        config,
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

              // Log the entrance attempt
              if (result.member) {
                await logEntrance(
                  result.member.id,
                  result.member.name,
                  result.member.phone,
                  result.member.status,
                  result.valid ? (result.member.status === 'expiring_soon' ? 'expiring_soon' : 'valid') : 'invalid',
                  result.message,
                  'qr_scan',
                  result.reason
                );
              }
            } catch {
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Σφάλμα κατά την έναρξη της σάρωσης";
      setError(errorMessage);
      setScanning(false);
    }
  };

  const handleCameraChange = async (newCameraId: string) => {
    try {
      const wasScanning = scanning;
      
      // Stop scanning if active
      if (wasScanning) {
        await stopScanning();
      }
      
      // Update camera selection
      setCameraId(newCameraId);
      
      // Restart scanning if it was active
      if (wasScanning) {
        // Small delay to ensure camera is released
        setTimeout(() => {
          startScanning();
        }, 500);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Σφάλμα κατά την αλλαγή κάμερας";
      setError(errorMessage);
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch {
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

    // Log the manual entrance attempt
    if (result.member) {
      await logEntrance(
        result.member.id,
        result.member.name,
        result.member.phone,
        result.member.status,
        result.valid ? (result.member.status === 'expiring_soon' ? 'expiring_soon' : 'valid') : 'invalid',
        result.message,
        'manual',
        result.reason
      );
    }
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
              {/* Camera Selection */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Επιλογή Κάμερας</label>
                {loadingCameras ? (
                  <div className="text-muted small">Φόρτωση καμερών...</div>
                ) : availableCameras.length > 0 ? (
                  <select
                    className="form-select"
                    value={cameraId || ""}
                    onChange={(e) => handleCameraChange(e.target.value)}
                    disabled={scanning}
                  >
                    {availableCameras.map((camera) => (
                      <option key={camera.id} value={camera.id}>
                        {camera.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="alert alert-warning mb-0" role="alert">
                    Δεν βρέθηκαν διαθέσιμες κάμερες
                  </div>
                )}
              </div>

              {/* Scan Quality Settings */}
              {!scanning && (
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    <Settings className="me-1" size={16} />
                    Ποιότητα Σάρωσης
                  </label>
                  <select
                    className="form-select"
                    value={scanQuality}
                    onChange={(e) => setScanQuality(e.target.value as 'fast' | 'balanced' | 'accurate')}
                  >
                    <option value="fast">⚡ Γρήγορη (30 FPS, Μεγάλο QR Box)</option>
                    <option value="balanced">⚖️ Ισορροπημένη (20 FPS, Μέτριο QR Box)</option>
                    <option value="accurate">🎯 Ακριβής (15 FPS, Μικρό QR Box)</option>
                  </select>
                  <small className="text-muted d-block mt-1">
                    {scanQuality === 'fast' && 'Γρήγορη σάρωση με μεγάλο scanning area - Προτεινόμενη'}
                    {scanQuality === 'balanced' && 'Ισορροπημένη ταχύτητα και ακρίβεια'}
                    {scanQuality === 'accurate' && 'Πιο ακριβής αλλά πιο αργή σάρωση'}
                  </small>
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Σάρωση</h5>
                {!scanning ? (
                  <button
                    className="btn btn-primary"
                    onClick={startScanning}
                    disabled={scanning || !cameraId || availableCameras.length === 0}
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
                  transform: "scaleX(-1)", // Mirror/flip horizontally
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

