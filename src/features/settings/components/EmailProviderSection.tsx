import React from "react";
import { Trans, useTranslation } from "react-i18next";
import type { EmailSettings } from "@/features/notifications";
import SettingsCard from "./SettingsCard";

interface EmailProviderSectionProps {
  value: EmailSettings;
  onChange: (value: EmailSettings) => void;
}

const EmailProviderSection: React.FC<EmailProviderSectionProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation("settings");
  return (
    <SettingsCard title="Email Provider (Maileroo)">
      <div className="mb-3">
        <label className="form-label fw-semibold">API Key</label>
        <input
          type="password"
          className="form-control"
          placeholder={t("email.apiKeyPlaceholder")}
          value={value.apiKey}
          onChange={(e) => onChange({ ...value, apiKey: e.target.value })}
        />
        <small className="text-muted">
          <a
            href="https://maileroo.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("email.freeTier")}
          </a>
        </small>
      </div>
      <div className="mb-3">
        <label className="form-label fw-semibold">{t("email.fromEmail")}</label>
        <input
          type="email"
          className="form-control"
          placeholder="noreply@807c33da300c12b9.maileroo.org"
          value={value.fromEmail}
          onChange={(e) => onChange({ ...value, fromEmail: e.target.value })}
        />
        <small className="text-muted d-block mt-1">
          ⚠️{" "}
          <Trans
            t={t}
            i18nKey="email.important"
            components={{ strong: <strong /> }}
          />
        </small>
        <small className="text-muted d-block mt-1">
          🌐{" "}
          <Trans
            t={t}
            i18nKey="email.solution"
            components={{
              strong: <strong />,
              link: (
                <a
                  href="https://app.maileroo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
        </small>
        <small className="text-muted d-block mt-1">
          📝{" "}
          <Trans
            t={t}
            i18nKey="email.steps"
            components={{ strong: <strong /> }}
          />
        </small>
      </div>
      <div className="mb-0">
        <label className="form-label fw-semibold">{t("email.fromName")}</label>
        <input
          type="text"
          className="form-control"
          placeholder="Colosseum Gym"
          value={value.fromName}
          onChange={(e) => onChange({ ...value, fromName: e.target.value })}
        />
      </div>
    </SettingsCard>
  );
};

export default EmailProviderSection;
