import React, { useEffect, useRef, useState } from "react";
import { recordEntrance, validateMemberEntry } from "../api";
import type { ValidationResult } from "../types";
import { extractMemberId } from "../lib/parseScan";
import { useKeyboardScanner } from "../hooks/useKeyboardScanner";
import { useCaptureFocus } from "../hooks/useCaptureFocus";
import { useCameraScanner } from "../hooks/useCameraScanner";
import CameraControls from "../components/CameraControls";
import ScanResultCard from "../components/ScanResultCard";
import "./QRScannerPage.scss";

const QR_READER_ID = "qr-reader";

const invalidCode = (reason: string): ValidationResult => ({
  valid: false,
  member: null,
  message: "Μη εγκυρο QR Code",
  reason,
});

const QRScannerPage: React.FC = () => {
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualId, setManualId] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { focusIfIdle, refocusSoon, handleBlur } = useCaptureFocus(
    inputRef,
    true,
    true,
  );

  const checkIn = async (memberId: number, type: "qr_scan" | "manual") => {
    const validation = await validateMemberEntry(memberId);
    setResult(validation);
    await recordEntrance(validation, type);
  };

  const handleUsbScan = async (data: string) => {
    setError(null);
    setResult(null);
    try {
      const memberId = extractMemberId(data);
      if (!memberId) {
        setResult(
          invalidCode(
            `Δεν βρεθηκε εγκυρο Member ID. Δεδομενα: ${data.substring(0, 100)}`,
          ),
        );
        return;
      }
      await checkIn(memberId, "qr_scan");
    } catch {
      setResult({
        valid: false,
        member: null,
        message: "Σφαλμα Επεξεργασιας",
        reason: "Σφαλμα κατα την επεξεργασια του QR code",
      });
    } finally {
      refocusSoon();
    }
  };

  const handleCameraDecode = async (text: string) => {
    const memberId = extractMemberId(text);
    if (!memberId) {
      setResult(invalidCode("Το QR code δεν περιεχει εγκυρα δεδομενα"));
      return;
    }
    try {
      await checkIn(memberId, "qr_scan");
    } catch {
      setResult(invalidCode("Δεν ηταν δυνατη η αναγνωση του QR code"));
    }
  };

  useKeyboardScanner(inputRef, handleUsbScan, () =>
    setTimeout(focusIfIdle, 100),
  );
  const camera = useCameraScanner(QR_READER_ID, handleCameraDecode, setError);

  // Re-renders can steal focus from the capture input; grab it back after each change.
  useEffect(() => {
    refocusSoon();
  }, [result, error, camera.scanning, camera.cameraId, refocusSoon]);

  const handleManualValidation = async () => {
    const id = parseInt(manualId);
    if (isNaN(id) || id <= 0) {
      setError("Παρακαλω εισαγετε εγκυρο ID μελους");
      return;
    }
    setError(null);
    await checkIn(id, "manual");
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">Σαρωση QR Code</h2>
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-md-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <CameraControls
                cameras={camera.cameras}
                cameraId={camera.cameraId}
                loadingCameras={camera.loadingCameras}
                scanning={camera.scanning}
                quality={camera.quality}
                onQualityChange={camera.setQuality}
                onCameraChange={camera.changeCamera}
                onStart={() => {
                  setResult(null);
                  camera.start();
                }}
                onStop={camera.stop}
              />

              <div id={QR_READER_ID} className="km-qr-reader"></div>

              {error && (
                <div className="alert alert-danger mt-3" role="alert">
                  {error}
                </div>
              )}

              {/* Capture target for USB scanner keystrokes. */}
              <input
                ref={inputRef}
                data-scanner-capture=""
                type="text"
                autoFocus
                className="km-scanner-capture"
                tabIndex={0}
                onFocus={() => setInputFocused(true)}
                onBlur={(e) => {
                  setInputFocused(false);
                  handleBlur(e);
                }}
              />

              <div className="mt-4 border-top pt-3">
                <h6 className="mb-3">
                  Plug & Play QR Scanner (USB) η χειροκινητη εισαγωγη:
                </h6>
                <div className="alert alert-info mb-3" role="alert">
                  <small>
                    <strong>Plug & Play Scanner:</strong> Συνδεστε το USB QR
                    scanner και σκαναρετε απευθειας. Το scanner λειτουργει
                    αυτοματα - απλα σκαναρετε το QR code!
                    <br />
                    <span
                      className={inputFocused ? "text-success" : "text-warning"}
                    >
                      {inputFocused
                        ? "✅ Scanner Input: FOCUSED (Ready)"
                        : "⚠️ Scanner Input: NOT FOCUSED"}
                    </span>
                  </small>
                </div>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="ID μελους (η σκαναρετε με USB scanner)"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleManualValidation();
                    }}
                  />
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={handleManualValidation}
                  >
                    Επικυρωση
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 mb-4">
          <ScanResultCard
            result={result}
            onReset={() => {
              setResult(null);
              setManualId("");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default QRScannerPage;
