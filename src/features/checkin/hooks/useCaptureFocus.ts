import { useCallback, useEffect, type FocusEvent, type RefObject } from "react";

/** Attribute marking hidden scanner capture inputs. */
const CAPTURE_ATTR = "data-scanner-capture";

/**
 * True when focus should be left where it is.
 * With `priority`, other capture inputs may be taken over (page scanner beats the global one).
 */
const shouldKeepFocus = (
  el: Element | null,
  captureInput: HTMLInputElement | null,
  priority: boolean,
): boolean => {
  if (!el || el === captureInput || !(el instanceof HTMLElement)) return false;
  if (el.hasAttribute(CAPTURE_ATTR)) return !priority;
  if (
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT" ||
    el.isContentEditable
  )
    return true;
  if (el.tagName === "INPUT") {
    return (el.getAttribute("type") || "text").toLowerCase() !== "hidden";
  }
  return false;
};

/**
 * Keeps a hidden scanner capture input focused whenever the user is not typing
 * somewhere else, so USB scans are never lost.
 */
export function useCaptureFocus(
  inputRef: RefObject<HTMLInputElement | null>,
  enabled: boolean,
  priority = false,
) {
  const focusIfIdle = useCallback(() => {
    const input = inputRef.current;
    if (!enabled || !input) return;
    if (document.activeElement === input) return;
    if (shouldKeepFocus(document.activeElement, input, priority)) return;
    input.focus({ preventScroll: true });
  }, [inputRef, enabled, priority]);

  /** Several retries: re-renders and route changes can steal focus right after a scan. */
  const refocusSoon = useCallback(() => {
    requestAnimationFrame(focusIfIdle);
    [10, 50, 100, 200, 300, 500].forEach((ms) => setTimeout(focusIfIdle, ms));
  }, [focusIfIdle]);

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      if (!enabled) return;
      if (
        shouldKeepFocus(
          e.relatedTarget as Element | null,
          inputRef.current,
          priority,
        )
      )
        return;
      requestAnimationFrame(focusIfIdle);
      setTimeout(focusIfIdle, 50);
      setTimeout(focusIfIdle, 150);
    },
    [enabled, focusIfIdle, inputRef, priority],
  );

  useEffect(() => {
    if (!enabled) return;

    focusIfIdle();
    requestAnimationFrame(focusIfIdle);
    setTimeout(focusIfIdle, 50);
    setTimeout(focusIfIdle, 200);

    const handleVisibility = () => {
      if (!document.hidden) focusIfIdle();
    };
    const interval = setInterval(focusIfIdle, 100);
    const observer = new MutationObserver(() => setTimeout(focusIfIdle, 50));

    window.addEventListener("focus", focusIfIdle);
    document.addEventListener("visibilitychange", handleVisibility);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      window.removeEventListener("focus", focusIfIdle);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
      observer.disconnect();
    };
  }, [enabled, focusIfIdle]);

  return { focusIfIdle, refocusSoon, handleBlur };
}
