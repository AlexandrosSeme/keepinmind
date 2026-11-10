import React, { useRef, useState } from "react";
import { recordEntrance, validateMemberEntry } from "../api";
import { extractMemberId } from "../lib/parseScan";
import { useKeyboardScanner } from "../hooks/useKeyboardScanner";
import { useCaptureFocus } from "../hooks/useCaptureFocus";
import "./GlobalQRScanner.scss";

// USB wedge scanners need focus on desktop; on touch devices focusing would open the soft keyboard.
const isDesktopScannerHost = (): boolean => {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  return !coarse && !touch;
};

/** Hidden, app-wide capture input that logs entrances from a USB scanner on any admin page. */
const GlobalQRScanner: React.FC = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [desktopScanner] = useState(isDesktopScannerHost);
  const { focusIfIdle, refocusSoon, handleBlur } = useCaptureFocus(
    inputRef,
    desktopScanner,
  );

  const handleScan = async (data: string) => {
    try {
      const memberId = extractMemberId(data);
      if (!memberId) return;
      const result = await validateMemberEntry(memberId);
      await recordEntrance(result, "qr_scan");
    } catch {
      // Background scanner: failures surface in the entrance logs.
    } finally {
      refocusSoon();
    }
  };

  useKeyboardScanner(inputRef, handleScan, () => setTimeout(focusIfIdle, 100));

  return (
    <input
      ref={inputRef}
      data-scanner-capture=""
      className="km-global-scanner-input"
      type="text"
      inputMode="none"
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      readOnly={!desktopScanner}
      tabIndex={-1}
      aria-hidden="true"
      onBlur={handleBlur}
    />
  );
};

export default GlobalQRScanner;
