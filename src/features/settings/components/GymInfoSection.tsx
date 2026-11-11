import React from "react";
import { useTranslation } from "react-i18next";
import SettingsCard from "./SettingsCard";

export interface GymInfo {
  name: string;
  phone: string;
  email: string;
}

interface GymInfoSectionProps {
  value: GymInfo;
  onChange: (value: GymInfo) => void;
}

const GymInfoSection: React.FC<GymInfoSectionProps> = ({ value, onChange }) => {
  const { t } = useTranslation("settings");
  return (
    <SettingsCard title={t("gymInfo.title")}>
      <div className="mb-3">
        <label className="form-label fw-semibold">{t("gymInfo.name")}</label>
        <input
          type="text"
          className="form-control"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
        />
      </div>
      <div className="mb-3">
        <label className="form-label fw-semibold">{t("gymInfo.phone")}</label>
        <input
          type="text"
          className="form-control"
          value={value.phone}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
        />
      </div>
      <div className="mb-0">
        <label className="form-label fw-semibold">Email</label>
        <input
          type="email"
          className="form-control"
          value={value.email}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
        />
      </div>
    </SettingsCard>
  );
};

export default GymInfoSection;
