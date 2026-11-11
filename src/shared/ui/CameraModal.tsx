import React from "react";
import { useTranslation } from "react-i18next";
import { Camera } from "lucide-react";
import type { CameraCapture } from "@/shared/hooks/useCameraCapture";
import Modal from "./Modal";
import StatusBadge from "./StatusBadge";
import "./CameraModal.scss";

type CameraModalProps = Pick<
  CameraCapture,
  "videoRef" | "canvasRef" | "cameraError" | "stopCamera" | "capturePhoto"
>;

const CameraModal: React.FC<CameraModalProps> = ({
  videoRef,
  canvasRef,
  cameraError,
  stopCamera,
  capturePhoto,
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      title={t("photo.take")}
      onClose={stopCamera}
      size="lg"
      centered
      dark
      closeOnBackdrop={false}
      bodyClassName="p-0"
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={stopCamera}
          >
            {t("actions.cancel")}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={capturePhoto}
          >
            <Camera size={16} className="me-2" />
            {t("photo.take")}
          </button>
        </>
      }
    >
      <div className="km-camera position-relative">
        <video
          ref={videoRef}
          className="km-camera__video"
          autoPlay
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="d-none" />
        {cameraError ? (
          <div className="position-absolute top-0 start-0 w-100 p-3">
            <div className="alert alert-danger mb-0">
              <small>{cameraError}</small>
            </div>
          </div>
        ) : (
          videoRef.current &&
          videoRef.current.readyState >= 2 && (
            <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3">
              <StatusBadge tone="success" label={t("camera.active")} />
            </div>
          )
        )}
      </div>
    </Modal>
  );
};

export default CameraModal;
