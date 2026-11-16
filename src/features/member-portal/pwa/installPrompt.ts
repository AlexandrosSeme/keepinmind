/** Captured once, at module load, so React strict mode cannot miss the event. */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    deferred = null;
    notify();
  });
}

export function subscribeInstall(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDeferredInstall() {
  return deferred;
}

export function wasInstalled() {
  return installed;
}

export async function promptInstall() {
  const event = deferred;
  if (!event) return false;
  deferred = null;
  notify();
  await event.prompt();
  const choice = await event.userChoice;
  if (choice.outcome === "accepted") {
    installed = true;
    notify();
    return true;
  }
  return false;
}

export function isStandalone() {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    nav.standalone === true
  );
}

export type InstallDevice = "ios" | "mobile" | "desktop";

export function installDevice(): InstallDevice {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  const iOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (iOS) return "ios";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (/Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua) || coarse) {
    return "mobile";
  }
  return "desktop";
}
