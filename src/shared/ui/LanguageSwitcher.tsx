import React from "react";
import { useTranslation } from "react-i18next";
import type { Language } from "@/shared/i18n";
import { GreekFlag, UkFlag } from "./Flags";
import "./LanguageSwitcher.scss";

const OPTIONS: { lng: Language; Flag: React.FC<{ className?: string }> }[] = [
  { lng: "el", Flag: GreekFlag },
  { lng: "en", Flag: UkFlag },
];

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
  const { t, i18n } = useTranslation();
  const current = i18n.resolvedLanguage;

  return (
    <div
      className={`km-lang ${className ?? ""}`}
      role="group"
      aria-label={t("language.label")}
    >
      {OPTIONS.map(({ lng, Flag }) => (
        <button
          key={lng}
          type="button"
          className={`km-lang__btn ${current === lng ? "is-active" : ""}`}
          onClick={() => i18n.changeLanguage(lng)}
          aria-pressed={current === lng}
          title={t(`language.${lng}`)}
          aria-label={t(`language.${lng}`)}
        >
          <Flag className="km-lang__flag" />
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
