import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Share, X } from "lucide-react";
import {
  getDeferredInstall,
  installDevice,
  isStandalone,
  promptInstall,
  subscribeInstall,
  wasInstalled,
} from "../pwa/installPrompt";

type Variant = "block" | "chip";

const InstallAppButton: React.FC<{ variant?: Variant }> = ({
  variant = "block",
}) => {
  const { t } = useTranslation("memberPortal");
  const [tick, setTick] = useState(0);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeInstall(() => setTick((n) => n + 1));
    return () => {
      unsubscribe();
    };
  }, []);

  const standalone = isStandalone() || wasInstalled();
  const device = installDevice();
  const canPrompt = tick >= 0 && getDeferredInstall() != null;

  if (standalone) return null;
  if (device === "desktop" && !canPrompt) return null;

  const openNative = async () => {
    if (canPrompt) {
      await promptInstall();
      return;
    }
    setHelp(true);
  };

  const helpKey = device === "ios" ? "ios" : "manual";

  return (
    <>
      <button
        type="button"
        className={
          variant === "chip"
            ? "mp-btn mp-install-chip"
            : "mp-btn mp-btn-install"
        }
        onClick={openNative}
      >
        {device === "ios" ? <Share size={16} /> : <Download size={16} />}
        {t("install.button")}
      </button>

      {help && (
        <div className="mp-install-backdrop" onClick={() => setHelp(false)}>
          <div
            className="mp-install-sheet"
            role="dialog"
            aria-labelledby="mp-install-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mp-install-sheet-head">
              <h2 id="mp-install-title" className="mp-card-title mb-0">
                {t(`install.${helpKey}.title`)}
              </h2>
              <button
                type="button"
                className="mp-install-close"
                aria-label={t("install.close")}
                onClick={() => setHelp(false)}
              >
                <X size={18} />
              </button>
            </div>
            <ol className="mp-install-steps">
              <li>{t(`install.${helpKey}.step1`)}</li>
              <li>{t(`install.${helpKey}.step2`)}</li>
              <li>{t(`install.${helpKey}.step3`)}</li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallAppButton;
