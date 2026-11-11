import React from "react";
import { useTranslation } from "react-i18next";
import { Camera, Settings } from "lucide-react";
import type { CameraDevice, ScanQuality } from "../hooks/useCameraScanner";

const QUALITIES: ScanQuality[] = ["fast", "balanced", "accurate"];

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
}) => {
  const { t } = useTranslation("checkin");

  return (
    <>
      <div className="mb-3">
        <label className="form-label fw-semibold">{t("camera.label")}</label>
        {loadingCameras ? (
          <div className="text-muted small">{t("camera.loading")}</div>
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
            {t("camera.noneAvailable")}
          </div>
        )}
      </div>

      {!scanning && (
        <div className="mb-3">
          <label className="form-label fw-semibold">
            <Settings className="me-1" size={16} />
            {t("camera.quality")}
          </label>
          <select
            className="form-select"
            value={quality}
            onChange={(e) => onQualityChange(e.target.value as ScanQuality)}
          >
            {QUALITIES.map((q) => (
              <option key={q} value={q}>
                {t(`camera.qualityOptions.${q}`)}
              </option>
            ))}
          </select>
          <small className="text-muted d-block mt-1">
            {t(`camera.qualityHints.${quality}`)}
          </small>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">{t("camera.scan")}</h5>
        {!scanning ? (
          <button
            className="btn btn-primary"
            onClick={onStart}
            disabled={!cameraId || cameras.length === 0}
          >
            <Camera className="me-2" size={18} />
            {t("camera.start")}
          </button>
        ) : (
          <button className="btn btn-danger" onClick={onStop}>
            {t("camera.stop")}
          </button>
        )}
      </div>
    </>
  );
};

export default CameraControls;
