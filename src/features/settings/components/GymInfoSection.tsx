import React from "react";
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

const GymInfoSection: React.FC<GymInfoSectionProps> = ({ value, onChange }) => (
  <SettingsCard title="Στοιχεια Γυμναστηριου">
    <div className="mb-3">
      <label className="form-label fw-semibold">Ονομα</label>
      <input
        type="text"
        className="form-control"
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
      />
    </div>
    <div className="mb-3">
      <label className="form-label fw-semibold">Τηλεφωνο</label>
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

export default GymInfoSection;
