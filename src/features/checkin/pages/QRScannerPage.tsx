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
  const [inputFocused, setInputFocused] = useState(false);
  
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
            label: device.label || `Καμερα ${index + 1}`,
          }));
          setAvailableCameras(cameras);
          // Set default camera if none selected
          if (!cameraId && cameras.length > 0) {
            setCameraId(cameras[0].id);
          }
        } else {
          setError("Δεν βρεθηκαν καμερες");
        }
      } catch (err) {
        console.error("Error loading cameras:", err);
        setError("Σφαλμα κατα τη φορτωση των καμερων");
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
      console.log('[USB Scanner] 🔑 Key pressed:', e.key, '| Code:', e.code, '| Target:', (e.target as HTMLElement)?.tagName, '| Is our input?', (e.target as HTMLElement) === scannerInputRef.current);
      
      // Only process if not typing in an input field (unless it's our scanner input)
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' && target !== scannerInputRef.current) {
        console.log('[USB Scanner] ⚠️ Ignoring - user typing in another input field');
        return; // User is typing in another input, ignore
      }

      const now = Date.now();
      const timeSinceLastKey = now - lastKeyTimeRef.current;

      // If more than 2000ms passed since last key, it's probably manual typing, not scanner
      // Scanners send keys very quickly (< 50ms between keys) but we allow more time for slow scanners
      if (timeSinceLastKey > 2000 && scannerBufferRef.current.length > 0) {
        console.log('[USB Scanner] ⏱️ Resetting buffer - manual typing detected (timeout:', timeSinceLastKey, 'ms)');
        // Reset buffer - this was probably manual typing
        scannerBufferRef.current = "";
      }

      lastKeyTimeRef.current = now;

      // Handle Enter key (scanner sends Enter at the end)
      if (e.key === 'Enter' || e.code === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        
        // Clear any pending timeout
        if (scannerTimeoutRef.current !== null) {
          clearTimeout(scannerTimeoutRef.current);
          scannerTimeoutRef.current = null;
        }
        
        const scannedData = scannerBufferRef.current.trim();
        console.log('[USB Scanner] ✅ Enter pressed! Buffer content:', scannedData);
        console.log('[USB Scanner] 📏 Buffer length:', scannedData.length);
        
        // Clear buffer immediately
        scannerBufferRef.current = "";
        
        // Reset last key time
        lastKeyTimeRef.current = Date.now();

        if (scannedData.length > 0) {
          console.log('[USB Scanner] 🚀 Processing scanned data:', scannedData);
          // Process the scanned data
          processScannedData(scannedData);
        } else {
          console.log('[USB Scanner] ⚠️ Empty buffer, ignoring Enter press');
          // Refocus for next scan even if buffer is empty
          setTimeout(() => {
            if (scannerInputRef.current) {
              scannerInputRef.current.focus();
              console.log('[USB Scanner] 🔄 Refocused input after empty scan');
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
        console.log('[USB Scanner] ➕ Added char:', e.key, '| Buffer now:', scannerBufferRef.current, '| Length:', scannerBufferRef.current.length);

        // Set timeout to clear buffer if no more input comes (manual typing detection)
        // Increased to 2000ms to allow scanner to complete
        scannerTimeoutRef.current = window.setTimeout(() => {
          console.log('[USB Scanner] ⏰ Timeout - clearing buffer (no input for 2 seconds)');
          scannerBufferRef.current = "";
        }, 2000);
      } else {
        console.log('[USB Scanner] ⏭️ Ignoring special key:', e.key, '| Code:', e.code);
      }
    };

    // AGGRESSIVE focus on mount - multiple attempts to ensure it works
    const focusInput = () => {
      if (scannerInputRef.current) {
        scannerInputRef.current.focus();
        console.log('[USB Scanner] 🎯 Hidden input focused and ready for scanning');
      } else {
        console.log('[USB Scanner] ⚠️ Hidden input ref is null!');
      }
    };

    // Focus immediately with multiple attempts
    focusInput();
    requestAnimationFrame(focusInput);
    setTimeout(focusInput, 10);
    setTimeout(focusInput, 50);
    setTimeout(focusInput, 100);
    setTimeout(focusInput, 200);
    setTimeout(focusInput, 500);
    setTimeout(focusInput, 1000);

    // Also focus on window focus (when user comes back to tab)
    const handleWindowFocus = () => {
      console.log('[USB Scanner] 👁️ Window focused, refocusing input');
      focusInput();
    };
    window.addEventListener('focus', handleWindowFocus);
    
    // Also refocus on visibility change (when tab becomes visible)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('[USB Scanner] 👁️ Tab became visible, refocusing input');
        focusInput();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Add global keyboard listener
    window.addEventListener('keydown', handleScannerInput);
    console.log('[USB Scanner] 🎧 Global keyboard listener attached');

    return () => {
      window.removeEventListener('keydown', handleScannerInput);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (scannerTimeoutRef.current !== null) {
        clearTimeout(scannerTimeoutRef.current);
      }
      console.log('[USB Scanner] 🧹 Cleanup: listeners removed');
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // AGGRESSIVE Continuous focus monitoring - ensures input stays focused ALWAYS
  useEffect(() => {
    const forceFocus = () => {
      if (scannerInputRef.current) {
        // Only skip refocus if user is actively typing in manual input field
        const activeElement = document.activeElement as HTMLElement;
        const isManualInput = activeElement?.tagName === 'INPUT' && 
                             activeElement?.getAttribute('type') === 'number' &&
                             activeElement?.id !== 'scanner-input-hidden';
        
        if (!isManualInput && document.activeElement !== scannerInputRef.current) {
          scannerInputRef.current.focus();
          console.log('[USB Scanner] 🔄 Force-focused (aggressive monitoring)');
        }
      }
    };
    
    // Check focus VERY frequently (every 100ms) to ensure it stays focused
    const focusInterval = setInterval(forceFocus, 100);
    
    // Also use MutationObserver to refocus after DOM changes (re-renders)
    const observer = new MutationObserver(() => {
      // Small delay to let React finish rendering
      setTimeout(forceFocus, 50);
    });
    
    // Observe the entire document for changes
    if (scannerInputRef.current) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }
    
    return () => {
      clearInterval(focusInterval);
      observer.disconnect();
    };
  }, []);

  // Refocus whenever validation result changes (after scan completes) OR any state changes
  useEffect(() => {
    // Force focus after ANY state change (validationResult, error, scanning, etc.)
    const forceRefocus = () => {
      if (scannerInputRef.current) {
        const activeElement = document.activeElement as HTMLElement;
        const isManualInput = activeElement?.tagName === 'INPUT' && 
                             activeElement?.getAttribute('type') === 'number' &&
                             activeElement?.id !== 'scanner-input-hidden';
        
        if (!isManualInput) {
          scannerInputRef.current.focus();
          console.log('[USB Scanner] 🔄 Force-refocused after state change');
        }
      }
    };
    
    // Multiple aggressive attempts
    requestAnimationFrame(forceRefocus);
    setTimeout(forceRefocus, 10);
    setTimeout(forceRefocus, 50);
    setTimeout(forceRefocus, 100);
    setTimeout(forceRefocus, 200);
    setTimeout(forceRefocus, 300);
    setTimeout(forceRefocus, 500);
  }, [validationResult, error, scanning, cameraId]); // Refocus on ANY state change

  const processScannedData = async (scannedData: string) => {
    console.log('========================================');
    console.log('[QR Scanner] 🔍 PROCESSING SCANNED DATA');
    console.log('[QR Scanner] 📥 Raw scanned data:', scannedData);
    console.log('[QR Scanner] 📏 Data length:', scannedData.length);
    console.log('[QR Scanner] 📋 Data type:', typeof scannedData);
    console.log('========================================');
    
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
              message: "Μη εγκυρο QR Code",
              reason: `Το QR code δεν περιεχει εγκυρα δεδομενα. Δεδομενα: ${scannedData.substring(0, 100)}`,
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
          message: "Μη εγκυρο QR Code",
          reason: `Δεν βρεθηκε εγκυρο Member ID. Δεδομενα: ${scannedData.substring(0, 100)}`,
        });
        return;
      }

      // Log the extracted member ID
      console.log('[QR Scanner] ✅ Extracted Member ID:', memberId);
      console.log('[QR Scanner] 🔢 Member ID type:', typeof memberId, '| Valid?', !isNaN(memberId) && memberId > 0);

      // Validate member
      console.log('[QR Scanner] 🔎 Validating member with ID:', memberId);
      const result = await validateMember(memberId);
      setValidationResult(result);
      
      // Aggressive refocus after validation - multiple attempts to ensure it works
      const refocusAfterValidation = () => {
        if (scannerInputRef.current) {
          scannerInputRef.current.focus();
          console.log('[USB Scanner] 🔄 Refocused after validation (in processScannedData)');
        }
      };
      
      // Immediate refocus with multiple attempts
      requestAnimationFrame(refocusAfterValidation);
      setTimeout(refocusAfterValidation, 50);
      setTimeout(refocusAfterValidation, 100);
      setTimeout(refocusAfterValidation, 200);
      setTimeout(refocusAfterValidation, 300);
      
      // Log the user that was scanned - DETAILED LOGGING
      if (result.member) {
        console.log('========================================');
        console.log('🎯 QR SCANNER - USER SCANNED SUCCESSFULLY');
        console.log('========================================');
        console.log('👤 USER DETAILS:');
        console.log('   📋 ID:', result.member.id);
        console.log('   👨‍💼 Name:', result.member.name);
        console.log('   📞 Phone:', result.member.phone);
        console.log('   📧 Email:', result.member.email || 'N/A');
        console.log('   📦 Package:', result.member.package || 'N/A');
        console.log('   📅 Expiry:', result.member.expiry || 'N/A');
        console.log('   ✅ Status:', result.member.status);
        console.log('   🎫 Validation Status:', result.valid ? 'VALID' : 'INVALID');
        console.log('   💬 Message:', result.message);
        if (result.reason) {
          console.log('   📝 Reason:', result.reason);
        }
        console.log('========================================');
        
        console.log('[QR Scanner] 💾 Logging entrance to database...');
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
          console.log('========================================');
          console.log('✅ ENTRANCE LOGGED SUCCESSFULLY');
          console.log('========================================');
          console.log('📊 Log Details:');
          console.log('   🆔 Log ID:', loggedEntrance.id);
          console.log('   👤 Member ID:', loggedEntrance.memberId);
          console.log('   👨‍💼 Member Name:', loggedEntrance.memberName);
          console.log('   📞 Member Phone:', loggedEntrance.memberPhone);
          console.log('   📅 Timestamp:', loggedEntrance.timestamp);
          console.log('   🎫 Validation Status:', loggedEntrance.validationStatus);
          console.log('   📝 Validation Message:', loggedEntrance.validationMessage);
          console.log('   🔍 Entrance Type:', loggedEntrance.entranceType);
          console.log('========================================');
        } else {
          console.error('❌ [QR Scanner] Failed to log entrance!');
        }
      } else {
        console.log('========================================');
        console.log('❌ QR SCANNER - NO MEMBER FOUND');
        console.log('========================================');
        console.log('🔍 Searched for Member ID:', memberId);
        console.log('💬 Validation Message:', result.message);
        if (result.reason) {
          console.log('📝 Reason:', result.reason);
        }
        console.log('========================================');
      }

      // Clear and refocus scanner input for next scan - IMMEDIATELY
      // This ensures continuous scanning without manual clicks
      const refocusInput = () => {
        if (scannerInputRef.current) {
          scannerInputRef.current.focus();
          console.log('[USB Scanner] 🔄 Refocused input for next scan');
        }
      };

      // Clear input and buffer
      if (scannerInputRef.current) {
        scannerInputRef.current.value = "";
      }
      scannerBufferRef.current = "";
      
      // Clear timeout
      if (scannerTimeoutRef.current !== null) {
        clearTimeout(scannerTimeoutRef.current);
        scannerTimeoutRef.current = null;
      }
      
      // Reset last key time
      lastKeyTimeRef.current = Date.now();
      
      // Aggressive refocus - multiple attempts with different timings to ensure it works
      requestAnimationFrame(refocusInput);
      setTimeout(refocusInput, 10);
      setTimeout(refocusInput, 50);
      setTimeout(refocusInput, 100);
      setTimeout(refocusInput, 200);
      setTimeout(refocusInput, 300);
      setTimeout(refocusInput, 500);
    } catch {
      setValidationResult({
        valid: false,
        member: null,
        message: "Σφαλμα Επεξεργασιας",
        reason: "Σφαλμα κατα την επεξεργασια του QR code",
      });
    }
  };

  const validateMember = async (memberId: number): Promise<ValidationResult> => {
    if (!supabase) {
      return {
        valid: false,
        member: null,
        message: "Σφαλμα συνδεσης",
        reason: "Η συνδεση με τη βαση δεδομενων δεν ειναι διαθεσιμη",
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
          message: "Μη εγκυρο QR Code",
          reason: "Δεν βρεθηκε μελος με αυτο το ID",
        };
      }

      const member = data as Member;

      // Check if card is lost/revoked
      if (member.card_lost === true) {
        return {
          valid: false,
          member,
          message: "Καρτα Ακυρωμενη",
          reason: "Η καρτα εχει σημειωθει ως χαμενη/ακυρωμενη. Παρακαλω επικοινωνηστε με τον διαχειριστη.",
        };
      }

      // Check if subscription is active
      if (member.status === "expired") {
        return {
          valid: false,
          member,
          message: "Ληγμενη Συνδρομη",
          reason: `Η συνδρομη εληξε στις ${member.expiry}`,
        };
      }

      // Check if subscription is expiring soon (still valid but warning)
      if (member.status === "expiring_soon") {
        return {
          valid: true,
          member,
          message: "Ενεργη Συνδρομη (Ληγει Συντομα)",
          reason: `Η συνδρομη ληγει στις ${member.expiry}`,
        };
      }

      // Active subscription
      if (member.status === "active") {
        return {
          valid: true,
          member,
          message: "Ενεργη Συνδρομη",
        };
      }

      return {
        valid: false,
        member,
        message: "Μη εγκυρη Κατασταση",
        reason: "Η κατασταση της συνδρομης δεν ειναι εγκυρη",
      };
    } catch {
      return {
        valid: false,
        member: null,
        message: "Σφαλμα Επικυρωσης",
        reason: "Σφαλμα κατα την επικοινωνια με τη βαση δεδομενων",
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
      setError("Παρακαλω επιλεξτε καμερα");
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
                  message: "Μη εγκυρο QR Code",
                  reason: "Το QR code δεν περιεχει εγκυρα δεδομενα",
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
                message: "Μη εγκυρο QR Code",
                reason: "Δεν ηταν δυνατη η αναγνωση του QR code",
              });
            }
          },
          () => {
            // Ignore scanning errors (they're frequent during scanning)
          }
        );

        setScanning(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Σφαλμα κατα την εναρξη της σαρωσης";
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
      const errorMessage = err instanceof Error ? err.message : "Σφαλμα κατα την αλλαγη καμερας";
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
      setError("Παρακαλω εισαγετε εγκυρο ID μελους");
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
          <h2 className="mb-4">Σαρωση QR Code</h2>
        </div>
      </div>

      <div className="row">
        {/* Scanner Section */}
        <div className="col-12 col-md-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {/* Camera Selection */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Επιλογη Καμερας</label>
                {loadingCameras ? (
                  <div className="text-muted small">Φορτωση καμερων...</div>
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
                    Δεν βρεθηκαν διαθεσιμες καμερες
                  </div>
                )}
              </div>

              {/* Scan Quality Settings */}
              {!scanning && (
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    <Settings className="me-1" size={16} />
                    Ποιοτητα Σαρωσης
                  </label>
                  <select
                    className="form-select"
                    value={scanQuality}
                    onChange={(e) => setScanQuality(e.target.value as 'fast' | 'balanced' | 'accurate')}
                  >
                    <option value="fast">⚡ Γρηγορη (30 FPS, Μεγαλο QR Box)</option>
                    <option value="balanced">⚖️ Ισορροπημενη (20 FPS, Μετριο QR Box)</option>
                    <option value="accurate">🎯 Ακριβης (15 FPS, Μικρο QR Box)</option>
                  </select>
                  <small className="text-muted d-block mt-1">
                    {scanQuality === 'fast' && 'Γρηγορη σαρωση με μεγαλο scanning area - Προτεινομενη'}
                    {scanQuality === 'balanced' && 'Ισορροπημενη ταχυτητα και ακριβεια'}
                    {scanQuality === 'accurate' && 'Πιο ακριβης αλλα πιο αργη σαρωση'}
                  </small>
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Σαρωση</h5>
                {!scanning ? (
                  <button
                    className="btn btn-primary"
                    onClick={startScanning}
                    disabled={scanning || !cameraId || availableCameras.length === 0}
                  >
                    <Camera className="me-2" size={18} />
                    Εναρξη Σαρωσης
                  </button>
                ) : (
                  <button
                    className="btn btn-danger"
                    onClick={stopScanning}
                  >
                    Διακοπη Σαρωσης
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

              {/* Hidden input for plug and play QR scanner - ALWAYS FOCUSED */}
              <input
                id="scanner-input-hidden"
                ref={scannerInputRef}
                type="text"
                autoFocus
                className="position-absolute"
                onFocus={() => {
                  setInputFocused(true);
                  console.log('[USB Scanner] ✅ Hidden input FOCUSED - Ready to receive scans');
                }}
                onMouseEnter={() => {
                  if (scannerInputRef.current && document.activeElement !== scannerInputRef.current) {
                    scannerInputRef.current.focus();
                    console.log('[USB Scanner] 🔄 Refocused on mouse enter');
                  }
                }}
                onBlur={(e) => {
                  setInputFocused(false);
                  console.log('[USB Scanner] ⚠️ Hidden input BLURRED - FORCE REFOCUSING IMMEDIATELY...');
                  
                  // ALWAYS refocus - except if user is actively typing in manual input field
                  const relatedTarget = e.relatedTarget as HTMLElement;
                  const isManualInput = relatedTarget?.tagName === 'INPUT' && 
                                       relatedTarget?.getAttribute('type') === 'number' &&
                                       relatedTarget?.id !== 'scanner-input-hidden';
                  
                  if (!isManualInput) {
                    // ULTRA AGGRESSIVE refocusing - many attempts to ensure it ALWAYS works
                    const refocus = () => {
                      if (scannerInputRef.current) {
                        scannerInputRef.current.focus();
                        console.log('[USB Scanner] ✅ Force-refocused after blur');
                      }
                    };
                    
                    // Immediate refocus with MANY attempts
                    refocus(); // Immediate
                    requestAnimationFrame(refocus);
                    setTimeout(refocus, 5);
                    setTimeout(refocus, 10);
                    setTimeout(refocus, 20);
                    setTimeout(refocus, 50);
                    setTimeout(refocus, 100);
                    setTimeout(refocus, 200);
                    setTimeout(refocus, 300);
                    setTimeout(refocus, 500);
                  } else {
                    console.log('[USB Scanner] ⏸️ Not refocusing - user is typing in manual input field');
                    // But still refocus after a delay to be ready for next scan
                    setTimeout(() => {
                      if (scannerInputRef.current && document.activeElement?.tagName !== 'INPUT') {
                        scannerInputRef.current.focus();
                        console.log('[USB Scanner] ✅ Refocused after manual input delay');
                      }
                    }, 2000);
                  }
                }}
                onKeyDown={(e) => {
                  // Also log when keys are pressed directly on the input
                  console.log('[USB Scanner] ⌨️ Direct input keydown:', e.key, '| Code:', e.code);
                }}
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  width: '1px',
                  height: '1px',
                  opacity: 0,
                  pointerEvents: 'auto', // Changed to 'auto' to allow focus
                }}
                tabIndex={0}
              />

              {/* Manual Input */}
              <div className="mt-4 border-top pt-3">
                <h6 className="mb-3">
                  Plug & Play QR Scanner (USB) η χειροκινητη εισαγωγη:
                </h6>
                <div className="alert alert-info mb-3" role="alert">
                  <small>
                    <strong>Plug & Play Scanner:</strong> Συνδεστε το USB QR scanner και σκαναρετε απευθειας. 
                    Το scanner λειτουργει αυτοματα - απλα σκαναρετε το QR code!
                    <br />
                    <strong>Debug:</strong> Ανοιξε το Console (F12) για να δεις τα logs της σαρωσης.
                    <br />
                    <span className={inputFocused ? "text-success" : "text-warning"}>
                      {inputFocused ? "✅ Scanner Input: FOCUSED (Ready)" : "⚠️ Scanner Input: NOT FOCUSED"}
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
                    Επικυρωση
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
              <h5 className="mb-3">Αποτελεσμα Επικυρωσης</h5>

              {!validationResult ? (
                <div className="text-center text-muted py-5">
                  <AlertCircle size={48} className="mb-3 opacity-50" />
                  <p>Σαρωστε ενα QR code για να δειτε το αποτελεσμα</p>
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
                      <h6>Στοιχεια Μελους:</h6>
                      <div className="border-top pt-3">
                        <div className="mb-2">
                          <small className="text-muted">ID:</small>
                          <p className="mb-0 fw-bold text-primary">
                            #{validationResult.member.id}
                          </p>
                        </div>
                        <div className="mb-2">
                          <small className="text-muted">Ονομα:</small>
                          <p className="mb-0 fw-semibold">
                            {validationResult.member.name}
                          </p>
                        </div>
                        <div className="mb-2">
                          <small className="text-muted">Τηλεφωνο:</small>
                          <p className="mb-0">
                            {validationResult.member.phone}
                          </p>
                        </div>
                        <div className="mb-2">
                          <small className="text-muted">Πακετο:</small>
                          <p className="mb-0">
                            {validationResult.member.package}
                          </p>
                        </div>
                        <div>
                          <small className="text-muted">Ληξη:</small>
                          <p className="mb-0">
                            {validationResult.member.expiry}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-3">
                    <button
                      className="btn btn-outline-secondary w-100"
                      onClick={resetValidation}
                    >
                      Νεα Σαρωση
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

