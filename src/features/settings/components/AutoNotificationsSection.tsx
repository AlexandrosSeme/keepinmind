import React from "react";
import { useTranslation } from "react-i18next";
import SettingsCard from "./SettingsCard";

export interface AutoNotifications {
  sevenDays: boolean;
  threeDays: boolean;
  expiryDay: boolean;
  threeDaysAfter: boolean;
  sendTime: string;
}

const TOGGLES: Exclude<keyof AutoNotifications, "sendTime">[] = [
  "sevenDays",
  "threeDays",
  "expiryDay",
  "threeDaysAfter",
];

interface AutoNotificationsSectionProps {
  value: AutoNotifications;
  onChange: (value: AutoNotifications) => void;
}

const AutoNotificationsSection: React.FC<AutoNotificationsSectionProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation("settings");
  return (
    <SettingsCard title={t("autoNotifications.title")}>
      {TOGGLES.map((key) => (
        <div key={key} className="mb-3">
          <div className="form-check d-flex justify-content-between align-items-center">
            <label className="form-check-label" htmlFor={key}>
              {t(`autoNotifications.${key}`)}
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
        <label className="form-label fw-semibold">
          {t("autoNotifications.sendTime")}
        </label>
        <input
          type="time"
          className="form-control"
          value={value.sendTime}
          onChange={(e) => onChange({ ...value, sendTime: e.target.value })}
        />
      </div>
    </SettingsCard>
  );
};

export default AutoNotificationsSection;
