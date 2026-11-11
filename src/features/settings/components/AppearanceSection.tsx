import React from "react";
import { useTranslation } from "react-i18next";
import SettingsCard from "./SettingsCard";

export interface Appearance {
  theme: string;
  language: string;
  currency: string;
}

interface AppearanceSectionProps {
  value: Appearance;
  onChange: (value: Appearance) => void;
}

const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation(["settings", "common"]);
  return (
    <SettingsCard title={t("appearance.title")}>
      <div className="mb-3">
        <label className="form-label fw-semibold">
          {t("appearance.theme")}
        </label>
        <select
          className="form-select"
          value={value.theme}
          onChange={(e) => onChange({ ...value, theme: e.target.value })}
        >
          <option value="light">{t("appearance.light")}</option>
          <option value="dark">{t("appearance.dark")}</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label fw-semibold">
          {t("common:language.label")}
        </label>
        <select
          className="form-select"
          value={value.language}
          onChange={(e) => onChange({ ...value, language: e.target.value })}
        >
          <option value="el">{t("common:language.el")}</option>
          <option value="en">{t("common:language.en")}</option>
        </select>
      </div>
      <div className="mb-0">
        <label className="form-label fw-semibold">
          {t("appearance.currency")}
        </label>
        <select
          className="form-select"
          value={value.currency}
          onChange={(e) => onChange({ ...value, currency: e.target.value })}
        >
          <option value="EUR">EUR (€)</option>
          <option value="USD">USD ($)</option>
        </select>
      </div>
    </SettingsCard>
  );
};

export default AppearanceSection;
