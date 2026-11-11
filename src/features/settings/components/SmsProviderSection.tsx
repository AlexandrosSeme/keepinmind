import React from "react";
import { Trans, useTranslation } from "react-i18next";
import type { SmsSettings } from "@/features/notifications";
import SettingsCard from "./SettingsCard";

interface SmsProviderSectionProps {
  value: SmsSettings;
  onChange: (value: SmsSettings) => void;
}

const SmsProviderSection: React.FC<SmsProviderSectionProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation("settings");
  return (
    <SettingsCard title="SMS Provider (SMSme.gr)">
      <div className="mb-3">
        <label className="form-label fw-semibold">Username (Email)</label>
        <input
          type="email"
          className="form-control"
          placeholder="your-email@example.com"
          value={value.username}
          onChange={(e) => onChange({ ...value, username: e.target.value })}
        />
        <small className="text-muted">{t("sms.usernameHint")}</small>
      </div>
      <div className="mb-3">
        <label className="form-label fw-semibold">Password</label>
        <input
          type="password"
          className="form-control"
          placeholder={t("sms.passwordPlaceholder")}
          value={value.password}
          onChange={(e) => onChange({ ...value, password: e.target.value })}
        />
        <small className="text-muted">
          <a href="https://smsme.gr" target="_blank" rel="noopener noreferrer">
            {t("sms.createAccount")}
          </a>
        </small>
      </div>
      <div className="mb-0">
        <label className="form-label fw-semibold">Sender ID</label>
        <input
          type="text"
          className="form-control"
          placeholder="ColosseumGym"
          maxLength={11}
          value={value.senderId}
          onChange={(e) => onChange({ ...value, senderId: e.target.value })}
        />
        <small className="text-muted d-block mt-1">
          {t("sms.senderIdHint")}
        </small>
        <small className="text-warning d-block mt-1">
          ⚠️{" "}
          <Trans
            t={t}
            i18nKey="sms.senderIdWarning"
            components={{ strong: <strong /> }}
          />
        </small>
      </div>
    </SettingsCard>
  );
};

export default SmsProviderSection;
