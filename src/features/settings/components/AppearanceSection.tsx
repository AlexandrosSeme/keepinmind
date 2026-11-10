import React from "react";
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
}) => (
  <SettingsCard title="Εμφανιση">
    <div className="mb-3">
      <label className="form-label fw-semibold">Θεμα</label>
      <select
        className="form-select"
        value={value.theme}
        onChange={(e) => onChange({ ...value, theme: e.target.value })}
      >
        <option value="light">Ανοιχτο</option>
        <option value="dark">Σκουρο</option>
      </select>
    </div>
    <div className="mb-3">
      <label className="form-label fw-semibold">Γλωσσα</label>
      <select
        className="form-select"
        value={value.language}
        onChange={(e) => onChange({ ...value, language: e.target.value })}
      >
        <option value="el">Ελληνικα</option>
        <option value="en">English</option>
      </select>
    </div>
    <div className="mb-0">
      <label className="form-label fw-semibold">Νομισμα</label>
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

export default AppearanceSection;
