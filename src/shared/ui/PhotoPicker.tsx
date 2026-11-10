import React from "react";
import { Camera, User, X } from "lucide-react";
import type { CameraCapture } from "@/shared/hooks/useCameraCapture";
import CameraModal from "./CameraModal";
import "./PhotoPicker.scss";

interface PhotoPickerProps {
  label: string;
  capture: CameraCapture;
  /** Called after the preview is cleared, so the owner can drop the stored URL. */
  onRemove?: () => void;
}

const PhotoPicker: React.FC<PhotoPickerProps> = ({
  label,
  capture,
  onRemove,
}) => {
  const {
    photo,
    showCamera,
    cameraError,
    useFileInput,
    fileInputRef,
    startCamera,
    removePhoto,
    openFileInput,
    handleFileInputChange,
  } = capture;

  const handleRemove = () => {
    removePhoto();
    onRemove?.();
  };

  return (
    <div className="mb-4">
      <label className="form-label">{label}</label>
      <div className="d-flex flex-column gap-3">
        <div className="d-flex align-items-center gap-3">
          {photo ? (
            <div className="position-relative">
              <img
                src={photo}
                alt="Profile"
                className="rounded-circle km-photo-picker__preview"
              />
              <button
                type="button"
                className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle km-photo-picker__remove"
                onClick={handleRemove}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center km-photo-picker__preview">
              <User size={40} className="text-muted" />
            </div>
          )}
          <div className="d-flex flex-column gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={useFileInput ? openFileInput : startCamera}
            >
              <Camera size={16} className="me-2" />
              {photo
                ? "Αλλαγη Φωτογραφιας"
                : useFileInput
                  ? "Επιλογη Αρχειου"
                  : "Ληψη Φωτογραφιας"}
            </button>
            {!useFileInput && (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={openFileInput}
              >
                Επιλογη απο Αρχειο
              </button>
            )}
          </div>
        </div>
        {cameraError && (
          <div className="alert alert-warning mb-0" role="alert">
            <small className="km-photo-picker__error">{cameraError}</small>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="d-none"
          onChange={handleFileInputChange}
        />
      </div>

      {showCamera && <CameraModal {...capture} />}
    </div>
  );
};

export default PhotoPicker;
