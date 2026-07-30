import React, { useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Member } from "../types";
import { logEntrance } from "../services/entranceLogService";

interface ValidationResult {
  valid: boolean;
  member: Member | null;
  message: string;
  reason?: string;
}

const GlobalQRScanner: React.FC = () => {
  
  // For plug and play QR scanner (USB barcode scanner)
  const scannerInputRef = useRef<HTMLInputElement | null>(null);
  const scannerBufferRef = useRef<string>("");
  const scannerTimeoutRef = useRef<number | null>(null);
  const lastKeyTimeRef = useRef<number>(0);

  const validateMember = async (memberId: number): Promise<ValidationResult> => {
    console.log('[GlobalQRScanner] 🔍 Validating member with ID:', memberId);
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

  // Helper function to check if a modal is open
  const isModalOpen = (): boolean => {
    // Check for Bootstrap modals
    const modals = document.querySelectorAll('.modal.show');
    return modals.length > 0;
  };

  // Helper function to check if user is typing in a form input
  const isUserTypingInForm = (): boolean => {
    const activeElement = document.activeElement as HTMLElement;
    if (!activeElement) return false;
    
    // Check if it's an input, textarea, or select
    const isFormField = activeElement.tagName === 'INPUT' || 
                       activeElement.tagName === 'TEXTAREA' || 
                       activeElement.tagName === 'SELECT';
    
    // Check if it's not our scanner input
    const isNotScannerInput = activeElement.id !== 'global-scanner-input-hidden';
    
    // Check if it's inside a modal
    const isInModal = activeElement.closest('.modal') !== null;
    
    return isFormField && isNotScannerInput && isInModal;
  };

  const processScannedData = async (scannedData: string) => {
    try {
      // Clean the scanned data - remove any encoding issues
      let cleanedData = scannedData.trim();
      
      // Check if it's a simple barcode (just numbers, possibly with leading/trailing characters)
      // Barcodes are typically just numeric strings
      const isLikelyBarcode = /^\d+$/.test(cleanedData) || /^[^\w]*\d+[^\w]*$/.test(cleanedData);
      
      if (isLikelyBarcode) {
        // Direct barcode scan - extract the number
        const barcodeId = parseInt(cleanedData.replace(/\D/g, ''));
        if (!isNaN(barcodeId) && barcodeId > 0) {
          console.log('[GlobalQRScanner] 📊 Barcode detected:', barcodeId);
          const result = await validateMember(barcodeId);
          
          if (result.member) {
            await logEntrance(
              result.member.id,
              result.member.name,
              result.member.phone,
              result.member.status,
              result.valid ? (result.member.status === 'expiring_soon' ? 'expiring_soon' : 'valid') : 'invalid',
              result.message,
              'qr_scan',
              result.reason
            );
          }
          
          // Clear and refocus
          if (scannerInputRef.current) {
            scannerInputRef.current.value = "";
          }
          scannerBufferRef.current = "";
          if (scannerTimeoutRef.current !== null) {
            clearTimeout(scannerTimeoutRef.current);
            scannerTimeoutRef.current = null;
          }
          lastKeyTimeRef.current = Date.now();
          
          const refocusInput = () => {
            if (scannerInputRef.current) {
              scannerInputRef.current.focus();
            }
          };
          requestAnimationFrame(refocusInput);
          setTimeout(refocusInput, 10);
          setTimeout(refocusInput, 50);
          setTimeout(refocusInput, 100);
          setTimeout(refocusInput, 200);
          setTimeout(refocusInput, 300);
          setTimeout(refocusInput, 500);
          return;
        }
      }
      
      // Try to fix common encoding issues (for QR codes)
      cleanedData = cleanedData.replace(/¨/g, ':');
      cleanedData = cleanedData
        .replace(/"μεμβερΙδ"/gi, '"memberId"')
        .replace(/"μεμβερΙΔ"/gi, '"memberId"')
        .replace(/"ναμε"/gi, '"name"')
        .replace(/"πηονε"/gi, '"phone"')
        .replace(/"τιμεσταμπ"/gi, '"timestamp"');
      
      cleanedData = cleanedData
        .replace(/["']/g, '"')
        .replace(/╩╧/g, '')
        .replace(/░┴╨┴─╨╧╘╦╧/g, '');

      // Try to parse as JSON (QR code format)
      let memberId: number | undefined;
      try {
        let qrData: Record<string, unknown> | null = null;
        try {
          qrData = JSON.parse(cleanedData) as Record<string, unknown>;
        } catch {
          const patterns = [
            /["']?id["']?\s*[:=¨]\s*(\d+)/i,
            /["']?ID["']?\s*[:=¨]\s*(\d+)/i,
            /["']?memberId["']?\s*[:=¨]\s*(\d+)/i,
            /["']?μεμβερΙδ["']?\s*[:=¨]\s*(\d+)/i,
            /id\s*[:=¨]\s*(\d+)/i,
            /memberId\s*[:=¨]\s*(\d+)/i,
          ];
          
          let found = false;
          for (const pattern of patterns) {
            const match = cleanedData.match(pattern);
            if (match) {
              memberId = parseInt(match[1]);
              found = true;
              break;
            }
          }
          
          if (!found) {
            // Try to extract number (could be barcode or QR with just number)
            const numberMatch = cleanedData.match(/\d+/);
            if (numberMatch) {
              memberId = parseInt(numberMatch[0]);
            }
          }
        }

        if (qrData && !memberId) {
          memberId = (qrData.id as number) ||
                     (qrData.ID as number) ||
                     (qrData.memberId as number) || 
                     (qrData.memberid as number) || 
                     (qrData.member_id as number);
        }
      } catch {
        // Fallback: extract any number from the data
        const parsedId = parseInt(cleanedData.replace(/\D/g, ''));
        if (!isNaN(parsedId) && parsedId > 0) {
          memberId = parsedId;
        } else {
          const numberMatch = scannedData.match(/\d+/);
          if (numberMatch) {
            memberId = parseInt(numberMatch[0]);
          }
        }
      }

      if (!memberId || isNaN(memberId) || memberId <= 0) {
        return;
      }

      // Validate member
      const result = await validateMember(memberId);
      
      // Log the user that was scanned
      if (result.member) {
        // Log entrance to database
        await logEntrance(
          result.member.id,
          result.member.name,
          result.member.phone,
          result.member.status,
          result.valid ? (result.member.status === 'expiring_soon' ? 'expiring_soon' : 'valid') : 'invalid',
          result.message,
          'qr_scan',
          result.reason
        );
      }

      // Clear and refocus scanner input for next scan - IMMEDIATELY
      const refocusInput = () => {
        if (scannerInputRef.current) {
          scannerInputRef.current.focus();
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
      
      // Aggressive refocus - multiple attempts
      requestAnimationFrame(refocusInput);
      setTimeout(refocusInput, 10);
      setTimeout(refocusInput, 50);
      setTimeout(refocusInput, 100);
      setTimeout(refocusInput, 200);
      setTimeout(refocusInput, 300);
      setTimeout(refocusInput, 500);
    } catch {
      // Silently handle errors
    }
  };

  // Handle plug and play QR scanner (USB barcode scanner)
  useEffect(() => {
    const handleScannerInput = (e: KeyboardEvent) => {
      // Only process if not typing in an input field (unless it's our scanner input)
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' && target !== scannerInputRef.current) {
        return; // User is typing in another input, ignore
      }

      const now = Date.now();
      const timeSinceLastKey = now - lastKeyTimeRef.current;

      // If more than 2000ms passed since last key, it's probably manual typing, not scanner
      if (timeSinceLastKey > 2000 && scannerBufferRef.current.length > 0) {
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
        
        // Clear buffer immediately
        scannerBufferRef.current = "";
        lastKeyTimeRef.current = Date.now();

        if (scannedData.length > 0) {
          processScannedData(scannedData);
        } else {
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

        // Set timeout to clear buffer if no more input comes
        scannerTimeoutRef.current = window.setTimeout(() => {
          scannerBufferRef.current = "";
        }, 2000);
      }
    };

    // AGGRESSIVE focus on mount
    const focusInput = () => {
      if (scannerInputRef.current) {
        scannerInputRef.current.focus();
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

    // Also focus on window focus
    const handleWindowFocus = () => {
      focusInput();
    };
    window.addEventListener('focus', handleWindowFocus);
    
    // Also refocus on visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        focusInput();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Add global keyboard listener
    window.addEventListener('keydown', handleScannerInput);

    return () => {
      window.removeEventListener('keydown', handleScannerInput);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (scannerTimeoutRef.current !== null) {
        clearTimeout(scannerTimeoutRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // AGGRESSIVE Continuous focus monitoring - ensures input stays focused ALWAYS
  useEffect(() => {
    const forceFocus = () => {
      if (scannerInputRef.current) {
        // Don't refocus if a modal is open and user is typing in it
        if (isModalOpen() && isUserTypingInForm()) {
          return;
        }
        
        // Only skip refocus if user is actively typing in manual input field
        const activeElement = document.activeElement as HTMLElement;
        const isManualInput = activeElement?.tagName === 'INPUT' && 
                             activeElement?.getAttribute('type') === 'number' &&
                             activeElement?.id !== 'global-scanner-input-hidden';
        
        if (!isManualInput && document.activeElement !== scannerInputRef.current) {
          scannerInputRef.current.focus();
        }
      }
    };
    
    // Check focus VERY frequently (every 100ms) to ensure it stays focused
    const focusInterval = setInterval(forceFocus, 100);
    
    // Also use MutationObserver to refocus after DOM changes (re-renders)
    const observer = new MutationObserver(() => {
      setTimeout(forceFocus, 50);
    });
    
    // Observe the entire document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });
    
    return () => {
      clearInterval(focusInterval);
      observer.disconnect();
    };
  }, []);

  return (
    <input
      id="global-scanner-input-hidden"
      ref={scannerInputRef}
      type="text"
      autoFocus
      style={{
        position: 'fixed',
        left: '-9999px',
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'auto',
        zIndex: 9999,
      }}
      tabIndex={0}
      onBlur={(e) => {
        const relatedTarget = e.relatedTarget as HTMLElement;
        
        // Check if user is clicking into a form field in a modal
        const isModalFormField = relatedTarget?.closest('.modal') !== null &&
                                 (relatedTarget?.tagName === 'INPUT' || 
                                  relatedTarget?.tagName === 'TEXTAREA' || 
                                  relatedTarget?.tagName === 'SELECT') &&
                                 relatedTarget?.id !== 'global-scanner-input-hidden';
        
        const isManualInput = relatedTarget?.tagName === 'INPUT' && 
                             relatedTarget?.getAttribute('type') === 'number' &&
                             relatedTarget?.id !== 'global-scanner-input-hidden';
        
        // Don't refocus if user is typing in a modal form field
        if (isModalFormField) {
          return;
        }
        
        if (!isManualInput) {
          // ULTRA AGGRESSIVE refocusing
          const refocus = () => {
            if (scannerInputRef.current) {
              // Don't refocus if modal is open and user is typing in it
              if (isModalOpen() && isUserTypingInForm()) {
                return;
              }
              scannerInputRef.current.focus();
            }
          };
          
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
        }
      }}
    />
  );
};

export default GlobalQRScanner;

