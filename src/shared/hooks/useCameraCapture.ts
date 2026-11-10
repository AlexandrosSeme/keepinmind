import React, { useEffect, useRef, useState } from "react";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const PERMISSION_HELP =
  '\n\nΟδηγιες για Chrome:\n1. Καντε κλικ στο εικονιδιο κλειδωματος (🔒) στην αριστερη πλευρα της γραμμης διευθυνσεων\n2. Βρειτε "Camera" και επιλεξτε "Allow"\n3. Καντε refresh τη σελιδα';

function cameraErrorMessage(error: unknown): string {
  const name = (error as { name?: string })?.name;
  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "Δεν δοθηκε αδεια προσβασης στην καμερα." + PERMISSION_HELP;
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "Δεν βρεθηκε καμερα. Παρακαλω χρησιμοποιηστε file upload.";
    case "NotReadableError":
    case "TrackStartError":
      return "Η καμερα χρησιμοποιειται απο αλλη εφαρμογη. Παρακαλω κλειστε την αλλη εφαρμογη.";
    case "OverconstrainedError":
    case "ConstraintNotSatisfiedError":
      return "Η καμερα δεν υποστηριζει τις απαιτουμενες ρυθμισεις.";
    case "SecurityError":
      return "Σφαλμα ασφαλειας. Βεβαιωθειτε οτι χρησιμοποιειτε HTTPS.";
    default:
      return "Δεν ηταν δυνατη η προσβαση στην καμερα.";
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
      fallbackToFileInput(
        "Το browser σας δεν υποστηριζει προσβαση στην καμερα. Χρησιμοποιηστε file upload.",
      );
      return;
    }

    if (!isSecureContextForCamera()) {
      fallbackToFileInput(
        "Η καμερα απαιτει HTTPS connection. Χρησιμοποιηστε file upload.",
      );
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
      setCameraError(
        "Σφαλμα: Δεν βρεθηκε video element. Παρακαλω δοκιμαστε ξανα.",
      );
      return;
    }

    if (video.readyState < 2) {
      setCameraError("Η καμερα δεν ειναι ετοιμη. Παρακαλω περιμενετε...");
      setTimeout(() => {
        setCameraError(null);
        capturePhoto();
      }, 500);
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError(
        "Η καμερα δεν βγαζει εικονα. Παρακαλω ελεγξτε τη συνδεση της καμερας.",
      );
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("Σφαλμα κατα την ληψη της φωτογραφιας.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      context.drawImage(video, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setCameraError("Σφαλμα κατα την αποθηκευση της φωτογραφιας.");
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
      setCameraError("Σφαλμα κατα την ληψη της φωτογραφιας.");
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
      alert("Παρακαλω επιλεξτε αρχειο εικονας.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      alert("Το αρχειο ειναι πολυ μεγαλο. Μεγιστο μεγεθος: 10MB.");
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
        setCameraError("Σφαλμα κατα την αναπαραγωγη του video.");
      });
    };
    video.onerror = () =>
      setCameraError("Σφαλμα κατα την προβολη της καμερας.");
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
