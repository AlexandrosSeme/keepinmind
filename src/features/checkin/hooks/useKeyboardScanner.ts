import { useEffect, useRef, type RefObject } from "react";

/** Keys arriving further apart than this are treated as manual typing. */
const SCAN_IDLE_MS = 2000;

const isFormField = (el: HTMLElement | null): boolean =>
  !!el &&
  (el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT" ||
    el.isContentEditable);

/**
 * Listens for USB "keyboard wedge" scanners: they type the code quickly and end with Enter.
 * Keys typed into any form field other than `captureInputRef` are ignored.
 */
export function useKeyboardScanner(
  captureInputRef: RefObject<HTMLInputElement | null>,
  onScan: (data: string) => void,
  onEmptyScan?: () => void,
) {
  const bufferRef = useRef("");
  const timeoutRef = useRef<number | null>(null);
  const lastKeyTimeRef = useRef(0);
  const onScanRef = useRef(onScan);
  const onEmptyScanRef = useRef(onEmptyScan);
  onScanRef.current = onScan;
  onEmptyScanRef.current = onEmptyScan;

  useEffect(() => {
    const clearPending = () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target !== captureInputRef.current && isFormField(target)) return;

      const now = Date.now();
      if (now - lastKeyTimeRef.current > SCAN_IDLE_MS) bufferRef.current = "";
      lastKeyTimeRef.current = now;

      if (e.key === "Enter" || e.code === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        clearPending();

        const data = bufferRef.current.trim();
        bufferRef.current = "";
        if (captureInputRef.current) captureInputRef.current.value = "";

        if (data) {
          onScanRef.current(data);
        } else {
          onEmptyScanRef.current?.();
        }
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        clearPending();
        bufferRef.current += e.key;
        timeoutRef.current = window.setTimeout(() => {
          bufferRef.current = "";
        }, SCAN_IDLE_MS);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearPending();
    };
  }, [captureInputRef]);
}
