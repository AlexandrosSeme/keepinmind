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
  
  // For plug and play QR scanner (USB barcode scanner)
  const scannerInputRef = useRef<HTMLInputElement | null>(null);
  const scannerBufferRef = useRef<string>("");
  const scannerTimeoutRef = useRef<number | null>(null);
  const lastKeyTimeRef = useRef<number>(0);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (scannerTimeoutRef.current) {
        clearTimeout(scannerTimeoutRef.current);
      }
    };
  }, []);

  // Handle plug and play QR scanner (USB barcode scanner)
  // These scanners work as keyboard input - they type the QR code content and press Enter
  useEffect(() => {
    const handleScannerInput = (e: KeyboardEvent) => {
      console.log('[Scanner] Key pressed:', e.key, 'Target:', (e.target as HTMLElement)?.tagName);
      
      // Only process if not typing in an input field (unless it's our scanner input)
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' && target !== scannerInputRef.current) {
        console.log('[Scanner] Ignoring - user typing in another input');
        return; // User is typing in another input, ignore
      }

      const now = Date.now();
      const timeSinceLastKey = now - lastKeyTimeRef.current;

      // If more than 2000ms passed since last key, it's probably manual typing, not scanner
      // Scanners send keys very quickly (< 50ms between keys) but we allow more time for slow scanners
      if (timeSinceLastKey > 2000 && scannerBufferRef.current.length > 0) {
        console.log('[Scanner] Resetting buffer - manual typing detected (timeout:', timeSinceLastKey, 'ms)');
        // Reset buffer - this was probably manual typing
        scannerBufferRef.current = "";
      }

      lastKeyTimeRef.current = now;

      // Handle Enter key (scanner sends Enter at the end)
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        
        // Clear any pending timeout
        if (scannerTimeoutRef.current !== null) {
          clearTimeout(scannerTimeoutRef.current);
          scannerTimeoutRef.current = null;
        }
        
        const scannedData = scannerBufferRef.current.trim();
        console.log('[Scanner] Enter pressed, buffer:', scannedData);
        
        // Clear buffer immediately
        scannerBufferRef.current = "";
        
        // Reset last key time
        lastKeyTimeRef.current = Date.now();

        if (scannedData.length > 0) {
          console.log('[Scanner] Processing scanned data:', scannedData);
          // Process the scanned data
          processScannedData(scannedData);
        } else {
          console.log('[Scanner] Empty buffer, ignoring');
          // Refocus for next scan even if buffer is empty
          setTimeout(() => {
            if (scannerInputRef.current) {
              scannerInputRef.current.focus();
            }
          }, 100);
        }
        return;
      }

      // Handle regular characters (ignore special keys)
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Clear any existing timeout
        if (scannerTimeoutRef.current !== null) {
          clearTimeout(scannerTimeoutRef.current);
        }

        // Add character to buffer
        scannerBufferRef.current += e.key;
        console.log('[Scanner] Added to buffer:', e.key, 'Buffer now:', scannerBufferRef.current);

        // Set timeout to clear buffer if no more input comes (manual typing detection)
        // Increased to 2000ms to allow scanner to complete
        scannerTimeoutRef.current = window.setTimeout(() => {
          console.log('[Scanner] Timeout - clearing buffer (no input for 2 seconds)');
          scannerBufferRef.current = "";
        }, 2000);
      }
    };

    // Focus the hidden input on mount
    if (scannerInputRef.current) {
      scannerInputRef.current.focus();
    }

    // Add global keyboard listener
    window.addEventListener('keydown', handleScannerInput);

    return () => {
      window.removeEventListener('keydown', handleScannerInput);
      if (scannerTimeoutRef.current !== null) {
        clearTimeout(scannerTimeoutRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const processScannedData = async (scannedData: string) => {
    console.log('[Scanner] processScannedData called with:', scannedData);
    console.log('[Scanner] Full buffer length:', scannedData.length);
    try {
      setError(null);
      setValidationResult(null);

      // Clean the scanned data - remove any encoding issues
      let cleanedData = scannedData.trim();
      
      console.log('[QRScanner] Original scanned data:', scannedData);
      
      // If the data starts with a comma, it might be missing the opening brace
      // Try to reconstruct the JSON if it's incomplete
      if (cleanedData.startsWith(',') || cleanedData.startsWith('"')) {
        console.log('[QRScanner] Data appears incomplete, trying to reconstruct...');
        // Try to find if we have memberId or id in the data
        const hasMemberId = cleanedData.includes('"μεμβερΙδ"') || cleanedData.includes('"memberId"') || cleanedData.includes('"id"');
        if (!hasMemberId) {
          // The data is missing the first part, try to extract what we can
          console.log('[QRScanner] Missing first part of JSON, attempting extraction from partial data');
        }
      }
      
      // Try to fix common encoding issues
      // Step 1: Fix colon encoding first (before replacing field names)
      cleanedData = cleanedData.replace(/¨/g, ':');
      
      // Step 2: Fix Greek field names with encoding issues (with quotes)
      cleanedData = cleanedData
        .replace(/"μεμβερΙδ"/gi, '"memberId"')
        .replace(/"μεμβερΙΔ"/gi, '"memberId"')
        .replace(/"ναμε"/gi, '"name"')
        .replace(/"πηονε"/gi, '"phone"')
        .replace(/"τιμεσταμπ"/gi, '"timestamp"');
      
      // Step 3: Normalize quotes and clean other encoding issues
      cleanedData = cleanedData
        .replace(/["']/g, '"') // Normalize quotes
        .replace(/╩╧/g, '')
        .replace(/░┴╨┴─╨╧╘╦╧/g, '');
      
      console.log('[QRScanner] Cleaned data:', cleanedData);

      // Try to parse as JSON (QR code format)
      let memberId: number | undefined;
      try {
        // Try parsing as-is first
        let qrData: Record<string, unknown> | null = null;
        try {
          qrData = JSON.parse(cleanedData) as Record<string, unknown>;
          console.log('[QRScanner] Successfully parsed JSON:', qrData);
        } catch (parseError) {
          console.warn('[QRScanner] JSON parse failed, trying regex extraction:', parseError);
          // If parsing fails, try to extract memberId using regex
          // Try multiple patterns to handle encoding issues
          const patterns = [
            /["']?id["']?\s*[:=¨]\s*(\d+)/i, // Try id first (new format)
            /["']?ID["']?\s*[:=¨]\s*(\d+)/i,
            /["']?memberId["']?\s*[:=¨]\s*(\d+)/i,
            /["']?μεμβερΙδ["']?\s*[:=¨]\s*(\d+)/i, // Also match ¨ as separator
            /["']?μεμβερΙΔ["']?\s*[:=¨]\s*(\d+)/i,
            /id\s*[:=¨]\s*(\d+)/i, // Without quotes
            /μεμβερΙδ\s*[:=¨]\s*(\d+)/i, // Without quotes
            /memberId\s*[:=¨]\s*(\d+)/i,
          ];
          
          let found = false;
          for (const pattern of patterns) {
            const match = cleanedData.match(pattern);
            if (match) {
              memberId = parseInt(match[1]);
              console.log('[QRScanner] Found memberId via regex:', memberId);
              found = true;
              break;
            }
          }
          
          if (!found) {
            // Try to find the first small number (1-3 digits) which is usually the memberId
            // Phone numbers are 10 digits, timestamps are 13 digits, so memberId should be smaller
            const smallNumberMatch = cleanedData.match(/\b(\d{1,3})\b/);
            if (smallNumberMatch) {
              memberId = parseInt(smallNumberMatch[1]);
              console.log('[QRScanner] Found memberId via small number extraction:', memberId);
            } else {
              // Try to find any number in the string (fallback)
              const numberMatch = cleanedData.match(/\d+/);
              if (numberMatch) {
                memberId = parseInt(numberMatch[0]);
                console.log('[QRScanner] Found memberId via number extraction:', memberId);
              } else {
                // Try original data as last resort
                const originalSmallNumberMatch = scannedData.match(/\b(\d{1,3})\b/);
                if (originalSmallNumberMatch) {
                  memberId = parseInt(originalSmallNumberMatch[1]);
                  console.log('[QRScanner] Found memberId from original data (small number):', memberId);
                } else {
                  const originalNumberMatch = scannedData.match(/\d+/);
                  if (originalNumberMatch) {
                    memberId = parseInt(originalNumberMatch[0]);
                    console.log('[QRScanner] Found memberId from original data:', memberId);
                  } else {
                    throw new Error('No member ID found');
                  }
                }
              }
            }
          }
        }

        // If we got JSON data, extract memberId
        if (qrData && !memberId) {
          // Try different possible field names (case insensitive, with encoding issues)
          // Priority: id, memberId, then other variations
          memberId = (qrData.id as number) ||
                     (qrData.ID as number) ||
                     (qrData.memberId as number) || 
                     (qrData.memberid as number) || 
                     (qrData.member_id as number) ||
                     (qrData['μεμβερΙδ'] as number) ||
                     (qrData['μεμβερΙΔ'] as number);
        }
      } catch {
        // If not JSON, try to parse as direct member ID number
        // Extract first number found in the string
        const parsedId = parseInt(cleanedData.replace(/\D/g, '')); // Extract only digits
        if (!isNaN(parsedId) && parsedId > 0) {
          memberId = parsedId;
        } else {
          // Last resort: try to find any number in the original data
          const numberMatch = scannedData.match(/\d+/);
          if (numberMatch) {
            memberId = parseInt(numberMatch[0]);
          } else {
            setValidationResult({
              valid: false,
              member: null,
              message: "Μη έγκυρο QR Code",
              reason: `Το QR code δεν περιέχει έγκυρα δεδομένα. Δεδομένα: ${scannedData.substring(0, 100)}`,
            });
            return;
          }
        }
      }

      if (!memberId || isNaN(memberId) || memberId <= 0) {
        console.error('[QRScanner] ❌ Invalid memberId:', memberId);
        setValidationResult({
          valid: false,
          member: null,
          message: "Μη έγκυρο QR Code",
          reason: `Δεν βρέθηκε έγκυρο Member ID. Δεδομένα: ${scannedData.substring(0, 100)}`,
        });
        return;
      }

      // Log the extracted member ID
      console.log('QR Scanner - Member ID:', memberId);

      // Validate member
      const result = await validateMember(memberId);
      setValidationResult(result);
      
      // Log the user that was scanned - CLEAR AND SIMPLE
      if (result.member) {
        console.log('========================================');
        console.log('QR SCANNER - USER SCANNED:');
        console.log('ID:', result.member.id);
        console.log('Name:', result.member.name);
        console.log('Phone:', result.member.phone);
        console.log('Status:', result.member.status);
        console.log('Valid:', result.valid);
        console.log('========================================');
        
        const loggedEntrance = await logEntrance(
          result.member.id,
          result.member.name,
          result.member.phone,
          result.member.status,
          result.valid ? (result.member.status === 'expiring_soon' ? 'expiring_soon' : 'valid') : 'invalid',
          result.message,
          'qr_scan',
          result.reason
        );
        
        if (loggedEntrance) {
          console.log('Entrance logged - Member ID:', result.member.id);
        }
      } else {
        console.log('QR Scanner - No member found for ID:', memberId);
      }

      // Clear and refocus scanner input for next scan
      if (scannerInputRef.current) {
        scannerInputRef.current.value = "";
        // Clear buffer
        scannerBufferRef.current = "";
        // Clear timeout
        if (scannerTimeoutRef.current !== null) {
          clearTimeout(scannerTimeoutRef.current);
          scannerTimeoutRef.current = null;
        }
        // Reset last key time
        lastKeyTimeRef.current = Date.now();
        // Refocus immediately
        setTimeout(() => {
          if (scannerInputRef.current) {
            scannerInputRef.current.focus();
            console.log('[Scanner] Refocused input for next scan');
          }
        }, 200);
      }
    } catch {
      setValidationResult({
        valid: false,
        member: null,
        message: "Σφάλμα Επεξεργασίας",
        reason: "Σφάλμα κατά την επεξεργασία του QR code",
      });
    }
  };

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
              
              // Log the extracted member ID
              console.log('QR Scanner - Member ID:', memberId);

              if (!memberId) {
                console.log('QR Scanner - No memberId in QR data');
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
              
              // Log the user that was scanned - CLEAR AND SIMPLE
              if (result.member) {
                console.log('========================================');
                console.log('QR SCANNER - USER SCANNED:');
                console.log('ID:', result.member.id);
                console.log('Name:', result.member.name);
                console.log('Phone:', result.member.phone);
                console.log('Status:', result.member.status);
                console.log('Valid:', result.valid);
                console.log('========================================');
              } else {
                console.log('QR Scanner - No member found for ID:', memberId);
              }

              // Log entrance (already logged above)
              if (result.member) {
                const loggedEntrance = await logEntrance(
                  result.member.id,
                  result.member.name,
                  result.member.phone,
                  result.member.status,
                  result.valid ? (result.member.status === 'expiring_soon' ? 'expiring_soon' : 'valid') : 'invalid',
                  result.message,
                  'qr_scan',
                  result.reason
                );
                
                if (loggedEntrance) {
                  console.log('Entrance logged - Member ID:', result.member.id);
                }
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

              {/* Hidden input for plug and play QR scanner */}
              <input
                ref={scannerInputRef}
                type="text"
                autoFocus
                className="position-absolute"
                onFocus={() => console.log('[Scanner] Hidden input focused')}
                onBlur={() => {
                  console.log('[Scanner] Hidden input blurred - refocusing...');
                  // Refocus immediately if blurred (to keep scanner input ready)
                  setTimeout(() => {
                    if (scannerInputRef.current) {
                      scannerInputRef.current.focus();
                      console.log('[Scanner] Refocused after blur');
                    }
                  }, 50);
                }}
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  width: '1px',
                  height: '1px',
                  opacity: 0,
                  pointerEvents: 'none',
                }}
              />

              {/* Manual Input */}
              <div className="mt-4 border-top pt-3">
                <h6 className="mb-3">
                  Plug & Play QR Scanner (USB) ή χειροκίνητη εισαγωγή:
                </h6>
                <div className="alert alert-info mb-3" role="alert">
                  <small>
                    <strong>Plug & Play Scanner:</strong> Συνδέστε το USB QR scanner και σκανάρετε απευθείας. 
                    Το scanner λειτουργεί αυτόματα - απλά σκανάρετε το QR code!
                  </small>
                </div>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="ID μέλους (ή σκανάρετε με USB scanner)"
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
                          <small className="text-muted">ID:</small>
                          <p className="mb-0 fw-bold text-primary">
                            #{validationResult.member.id}
                          </p>
                        </div>
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

