import React from "react";
import { Camera, Settings } from "lucide-react";
import type { CameraDevice, ScanQuality } from "../hooks/useCameraScanner";

const QUALITY_HINTS: Record<ScanQuality, string> = {
  fast: "Γρηγορη σαρωση με μεγαλο scanning area - Προτεινομενη",
  balanced: "Ισορροπημενη ταχυτητα και ακριβεια",
  accurate: "Πιο ακριβης αλλα πιο αργη σαρωση",
};

interface CameraControlsProps {
  cameras: CameraDevice[];
  cameraId: string | null;
  loadingCameras: boolean;
  scanning: boolean;
  quality: ScanQuality;
  onQualityChange: (quality: ScanQuality) => void;
  onCameraChange: (cameraId: string) => void;
  onStart: () => void;
  onStop: () => void;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  cameras,
  cameraId,
  loadingCameras,
  scanning,
  quality,
  onQualityChange,
  onCameraChange,
  onStart,
  onStop,
}) => (
  <>
    <div className="mb-3">
      <label className="form-label fw-semibold">Επιλογη Καμερας</label>
      {loadingCameras ? (
        <div className="text-muted small">Φορτωση καμερων...</div>
      ) : cameras.length > 0 ? (
        <select
          className="form-select"
          value={cameraId || ""}
          onChange={(e) => onCameraChange(e.target.value)}
          disabled={scanning}
        >
          {cameras.map((camera) => (
            <option key={camera.id} value={camera.id}>
              {camera.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="alert alert-warning mb-0" role="alert">
          Δεν βρεθηκαν διαθεσιμες καμερες
        </div>
      )}
    </div>

    {!scanning && (
      <div className="mb-3">
        <label className="form-label fw-semibold">
          <Settings className="me-1" size={16} />
          Ποιοτητα Σαρωσης
        </label>
        <select
          className="form-select"
          value={quality}
          onChange={(e) => onQualityChange(e.target.value as ScanQuality)}
        >
          <option value="fast">⚡ Γρηγορη (30 FPS, Μεγαλο QR Box)</option>
          <option value="balanced">
            ⚖️ Ισορροπημενη (20 FPS, Μετριο QR Box)
          </option>
          <option value="accurate">🎯 Ακριβης (15 FPS, Μικρο QR Box)</option>
        </select>
        <small className="text-muted d-block mt-1">
          {QUALITY_HINTS[quality]}
        </small>
      </div>
    )}

    <div className="d-flex justify-content-between align-items-center mb-3">
      <h5 className="mb-0">Σαρωση</h5>
      {!scanning ? (
        <button
          className="btn btn-primary"
          onClick={onStart}
          disabled={!cameraId || cameras.length === 0}
        >
          <Camera className="me-2" size={18} />
          Εναρξη Σαρωσης
        </button>
      ) : (
        <button className="btn btn-danger" onClick={onStop}>
          Διακοπη Σαρωσης
        </button>
      )}
    </div>
  </>
);

export default CameraControls;
