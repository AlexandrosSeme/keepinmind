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

  // Any real form field focused (not the hidden scanner capture input)
  const isUserTypingInForm = (): boolean => {
    const activeElement = document.activeElement as HTMLElement | null;
    if (!activeElement) return false;
    if (activeElement.id === "global-scanner-input-hidden") return false;

    const tag = activeElement.tagName;
    if (tag === "TEXTAREA" || tag === "SELECT") return true;
    if (tag === "INPUT") {
      const type = (activeElement.getAttribute("type") || "text").toLowerCase();
      // Allow typing in normal fields; keep scanner only when nothing else focused
      return type !== "hidden";
    }
    if (activeElement.isContentEditable) return true;
    return false;
  };

  const shouldLeaveFocusAlone = (): boolean => isUserTypingInForm();

  const focusScannerIfIdle = () => {
    if (!scannerInputRef.current) return;
    if (shouldLeaveFocusAlone()) return;
    scannerInputRef.current.focus();
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
            focusScannerIfIdle();
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
      const refocusInput = () => focusScannerIfIdle();

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
      const target = e.target as HTMLElement;
      // User typing in any form field — never hijack keys
      if (
        target &&
        target !== scannerInputRef.current &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      const now = Date.now();
      const timeSinceLastKey = now - lastKeyTimeRef.current;

      // If more than 2000ms passed since last key, it's probably manual typing, not scanner
      if (timeSinceLastKey > 2000 && scannerBufferRef.current.length > 0) {
        scannerBufferRef.current = "";
      }

      lastKeyTimeRef.current = now;

      // Handle Enter key (scanner sends Enter at the end)
      if (e.key === "Enter" || e.code === "Enter") {
        e.preventDefault();
        e.stopPropagation();

        if (scannerTimeoutRef.current !== null) {
          clearTimeout(scannerTimeoutRef.current);
          scannerTimeoutRef.current = null;
        }

        const scannedData = scannerBufferRef.current.trim();
        scannerBufferRef.current = "";
        lastKeyTimeRef.current = Date.now();

        if (scannedData.length > 0) {
          processScannedData(scannedData);
        } else {
          setTimeout(() => focusScannerIfIdle(), 100);
        }
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (scannerTimeoutRef.current !== null) {
          clearTimeout(scannerTimeoutRef.current);
        }

        scannerBufferRef.current += e.key;

        scannerTimeoutRef.current = window.setTimeout(() => {
          scannerBufferRef.current = "";
        }, 2000);
      }
    };

    const focusInput = () => focusScannerIfIdle();

    focusInput();
    requestAnimationFrame(focusInput);
    setTimeout(focusInput, 50);
    setTimeout(focusInput, 200);

    const handleWindowFocus = () => focusScannerIfIdle();
    window.addEventListener("focus", handleWindowFocus);

    const handleVisibilityChange = () => {
      if (!document.hidden) focusScannerIfIdle();
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

  // Keep scanner focused only when user is NOT typing in another field
  useEffect(() => {
    const forceFocus = () => {
      focusScannerIfIdle();
    };

    const focusInterval = setInterval(forceFocus, 100);

    const observer = new MutationObserver(() => {
      setTimeout(forceFocus, 50);
    });

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
        position: "fixed",
        left: "-9999px",
        width: "1px",
        height: "1px",
        opacity: 0,
        pointerEvents: "none",
        zIndex: -1,
      }}
      tabIndex={-1}
      onBlur={(e) => {
        const relatedTarget = e.relatedTarget as HTMLElement | null;

        const isOtherFormField =
          !!relatedTarget &&
          relatedTarget.id !== "global-scanner-input-hidden" &&
          (relatedTarget.tagName === "INPUT" ||
            relatedTarget.tagName === "TEXTAREA" ||
            relatedTarget.tagName === "SELECT" ||
            relatedTarget.isContentEditable);

        if (isOtherFormField || isUserTypingInForm()) {
          return;
        }

        const refocus = () => focusScannerIfIdle();

        requestAnimationFrame(refocus);
        setTimeout(refocus, 50);
        setTimeout(refocus, 150);
      }}
    />
  );
};

export default GlobalQRScanner;

