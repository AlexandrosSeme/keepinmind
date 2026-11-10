import React from "react";
import SettingsCard from "./SettingsCard";

export interface AutoNotifications {
  sevenDays: boolean;
  threeDays: boolean;
  expiryDay: boolean;
  threeDaysAfter: boolean;
  sendTime: string;
}

const TOGGLES: {
  key: Exclude<keyof AutoNotifications, "sendTime">;
  label: string;
}[] = [
  { key: "sevenDays", label: "7 ημερες πριν ληξη" },
  { key: "threeDays", label: "3 ημερες πριν ληξη" },
  { key: "expiryDay", label: "Ημερα ληξης" },
  { key: "threeDaysAfter", label: "3 ημερες μετα ληξη" },
];

interface AutoNotificationsSectionProps {
  value: AutoNotifications;
  onChange: (value: AutoNotifications) => void;
}

const AutoNotificationsSection: React.FC<AutoNotificationsSectionProps> = ({
  value,
  onChange,
}) => (
  <SettingsCard title="Αυτοματες Ειδοποιησεις">
    {TOGGLES.map(({ key, label }) => (
      <div key={key} className="mb-3">
        <div className="form-check d-flex justify-content-between align-items-center">
          <label className="form-check-label" htmlFor={key}>
            {label}
          </label>
          <input
            className="form-check-input"
            type="checkbox"
            id={key}
            checked={value[key]}
            onChange={(e) => onChange({ ...value, [key]: e.target.checked })}
          />
        </div>
      </div>
    ))}
    <div className="border-top pt-3">
      <label className="form-label fw-semibold">Ωρα Αποστολης</label>
      <input
        type="time"
        className="form-control"
        value={value.sendTime}
        onChange={(e) => onChange({ ...value, sendTime: e.target.value })}
      />
    </div>
  </SettingsCard>
);

export default AutoNotificationsSection;
