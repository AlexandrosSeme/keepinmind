import { useEffect } from "react";
import "./installPrompt";

const SW_URL = "/sw.js";

/** Registers the member shortcut service worker for this origin. */
const MemberInstallProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register(SW_URL, { scope: "/", updateViaCache: "none" }).catch(() => {
      // Install stays unavailable if the worker cannot register (e.g. insecure HTTP).
    });
  }, []);

  return children;
};

export default MemberInstallProvider;
