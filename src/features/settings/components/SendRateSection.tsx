import React from "react";
import { Trans, useTranslation } from "react-i18next";
import SettingsCard from "./SettingsCard";
import "./SendRateSection.scss";

const RATE_HINTS = {
  1: "verySlow",
  2: "slow",
  3: "medium",
  4: "fast",
  5: "veryFast",
} as const;

interface SendRateSectionProps {
  value: number;
  onChange: (value: number) => void;
}

const SendRateSection: React.FC<SendRateSectionProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation("settings");
  const hint = RATE_HINTS[value as keyof typeof RATE_HINTS];
  return (
    <SettingsCard title={t("sendRate.title")}>
      <div className="mb-3">
        <label className="form-label fw-semibold">
          Manual Sender Rate (1-5)
        </label>
        <div className="d-flex align-items-center gap-3">
          <input
            type="range"
            className="form-range flex-grow-1"
            min="1"
            max="5"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
          />
          <span className="badge bg-primary km-send-rate__value">{value}</span>
        </div>
        <div className="mt-2">
          <small className="text-muted">
            {hint && t(`sendRate.hints.${hint}`)}
          </small>
        </div>
        <div className="mt-2">
          <small className="text-muted d-block">
            <Trans
              t={t}
              i18nKey="sendRate.note"
              components={{ strong: <strong /> }}
            />
          </small>
        </div>
      </div>
    </SettingsCard>
  );
};

export default SendRateSection;
