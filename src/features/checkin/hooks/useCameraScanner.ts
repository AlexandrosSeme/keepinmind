import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export type ScanQuality = "fast" | "balanced" | "accurate";

export interface CameraDevice {
  id: string;
  label: string;
}

const SCAN_CONFIGS: Record<ScanQuality, { fps: number; box: number }> = {
  fast: { fps: 30, box: 400 },
  balanced: { fps: 20, box: 350 },
  accurate: { fps: 15, box: 300 },
};

const scanConfig = (quality: ScanQuality) => {
  const { fps, box } = SCAN_CONFIGS[quality];
  return {
    fps,
    qrbox: { width: box, height: box },
    aspectRatio: 1.0,
    disableFlip: false,
  };
};

/**
 * Webcam QR scanning via html5-qrcode, rendered into the element with `elementId`.
 * Scanning stops after the first successful decode.
 */
export function useCameraScanner(
  elementId: string,
  onDecoded: (text: string) => void,
  onError: (message: string | null) => void,
) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [cameraId, setCameraId] = useState<string | null>(null);
  const [loadingCameras, setLoadingCameras] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [quality, setQuality] = useState<ScanQuality>("fast");

  const onDecodedRef = useRef(onDecoded);
  const onErrorRef = useRef(onError);
  onDecodedRef.current = onDecoded;
  onErrorRef.current = onError;

  useEffect(() => {
    const loadCameras = async () => {
      setLoadingCameras(true);
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          const list = devices.map((device, index) => ({
            id: device.id,
            label: device.label || `Καμερα ${index + 1}`,
          }));
          setCameras(list);
          setCameraId((current) => current ?? list[0].id);
        } else {
          onErrorRef.current("Δεν βρεθηκαν καμερες");
        }
      } catch (err) {
        console.error("Error loading cameras:", err);
        onErrorRef.current("Σφαλμα κατα τη φορτωση των καμερων");
      } finally {
        setLoadingCameras(false);
      }
    };

    loadCameras();

    return () => {
      scannerRef.current?.stop().catch(() => undefined);
      scannerRef.current = null;
    };
  }, []);

  const start = async (deviceId: string | null = cameraId) => {
    if (!deviceId) {
      onErrorRef.current("Παρακαλω επιλεξτε καμερα");
      return;
    }

    try {
      onErrorRef.current(null);
      const html5QrCode = new Html5Qrcode(elementId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        deviceId,
        scanConfig(quality),
        async (decodedText) => {
          await html5QrCode.stop();
          setScanning(false);
          onDecodedRef.current(decodedText);
        },
        () => {
          // Per-frame decode failures are expected while scanning.
        },
      );

      setScanning(true);
    } catch (err) {
      onErrorRef.current(
        err instanceof Error
          ? err.message
          : "Σφαλμα κατα την εναρξη της σαρωσης",
      );
      setScanning(false);
    }
  };

  const stop = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // Already stopped.
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const changeCamera = async (newCameraId: string) => {
    const wasScanning = scanning;
    if (wasScanning) await stop();
    setCameraId(newCameraId);
    // Give the browser a moment to release the previous camera.
    if (wasScanning) setTimeout(() => start(newCameraId), 500);
  };

  return {
    cameras,
    cameraId,
    loadingCameras,
    scanning,
    quality,
    setQuality,
    start: () => start(),
    stop,
    changeCamera,
  };
}
