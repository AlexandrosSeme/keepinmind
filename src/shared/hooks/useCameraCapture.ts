import React, { useEffect, useRef, useState } from "react";
import i18n from "@/shared/i18n";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function cameraErrorMessage(error: unknown): string {
  const name = (error as { name?: string })?.name;
  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return i18n.t("camera.denied") + i18n.t("camera.permissionHelp");
    case "NotFoundError":
    case "DevicesNotFoundError":
      return i18n.t("camera.notFound");
    case "NotReadableError":
    case "TrackStartError":
      return i18n.t("camera.inUse");
    case "OverconstrainedError":
    case "ConstraintNotSatisfiedError":
      return i18n.t("camera.overconstrained");
    case "SecurityError":
      return i18n.t("camera.security");
    default:
      return i18n.t("camera.generic");
  }
}

async function openCameraStream(): Promise<MediaStream> {
  const attempts: MediaStreamConstraints[] = [
    {
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    },
    { video: { width: { ideal: 1280 }, height: { ideal: 720 } } },
    { video: true },
  ];

  let lastError: unknown;
  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

function isSecureContextForCamera(): boolean {
  const { protocol, hostname } = window.location;
  return (
    protocol === "https:" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  );
}

/**
 * Photo capture via webcam with a file-upload fallback.
 * `photo` is a preview URL (data URL or existing remote URL), `photoFile` the new file to upload.
 */
export function useCameraCapture(initialPhoto: string | null = null) {
  const [photo, setPhoto] = useState<string | null>(initialPhoto);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [useFileInput, setUseFileInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fallbackToFileInput = (message: string) => {
    setCameraError(message);
    setUseFileInput(true);
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      fallbackToFileInput(i18n.t("camera.unsupported"));
      return;
    }

    if (!isSecureContextForCamera()) {
      fallbackToFileInput(i18n.t("camera.needsHttps"));
      return;
    }

    try {
      setCameraError(null);
      const stream = await openCameraStream();
      setCameraStream(stream);
      setShowCamera(true);
      setUseFileInput(false);
    } catch (error) {
      console.error("[Camera] Error accessing camera:", error);
      fallbackToFileInput(cameraErrorMessage(error));
    }
  };

  const stopCamera = () => {
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
    setShowCamera(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      setCameraError(i18n.t("camera.noVideo"));
      return;
    }

    if (video.readyState < 2) {
      setCameraError(i18n.t("camera.notReady"));
      setTimeout(() => {
        setCameraError(null);
        capturePhoto();
      }, 500);
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError(i18n.t("camera.noImage"));
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError(i18n.t("camera.captureError"));
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      context.drawImage(video, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setCameraError(i18n.t("camera.saveError"));
            return;
          }
          setPhotoFile(new File([blob], "photo.jpg", { type: "image/jpeg" }));
          setPhoto(canvas.toDataURL("image/jpeg"));
          stopCamera();
          setCameraError(null);
        },
        "image/jpeg",
        0.9,
      );
    } catch (error) {
      console.error("[Camera] Error capturing photo:", error);
      setCameraError(i18n.t("camera.captureError"));
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoFile(null);
    setCameraError(null);
    setUseFileInput(false);
  };

  const openFileInput = () => fileInputRef.current?.click();

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(i18n.t("camera.notImage"));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      alert(i18n.t("camera.tooLarge"));
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (event) => setPhoto(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Attach the stream once the camera modal (and its <video>) is rendered.
  useEffect(() => {
    const video = videoRef.current;
    if (!showCamera || !cameraStream || !video) return;

    video.srcObject = cameraStream;
    video.onloadedmetadata = () => {
      video.play().catch((err) => {
        console.error("[Camera] Error playing video:", err);
        setCameraError(i18n.t("camera.playError"));
      });
    };
    video.onerror = () => setCameraError(i18n.t("camera.previewError"));
    video.play().catch(() => {
      // Will retry on loadedmetadata.
    });
  }, [showCamera, cameraStream]);

  useEffect(() => {
    return () => {
      cameraStream?.getTracks().forEach((track) => track.stop());
    };
  }, [cameraStream]);

  return {
    photo,
    photoFile,
    showCamera,
    cameraError,
    useFileInput,
    fileInputRef,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capturePhoto,
    removePhoto,
    openFileInput,
    handleFileInputChange,
  };
}

export type CameraCapture = ReturnType<typeof useCameraCapture>;
