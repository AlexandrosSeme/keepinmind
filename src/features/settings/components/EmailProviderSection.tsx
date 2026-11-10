import React from "react";
import type { EmailSettings } from "@/features/notifications";
import SettingsCard from "./SettingsCard";

interface EmailProviderSectionProps {
  value: EmailSettings;
  onChange: (value: EmailSettings) => void;
}

const EmailProviderSection: React.FC<EmailProviderSectionProps> = ({
  value,
  onChange,
}) => (
  <SettingsCard title="Email Provider (Maileroo)">
    <div className="mb-3">
      <label className="form-label fw-semibold">API Key</label>
      <input
        type="password"
        className="form-control"
        placeholder="Εισαγετε το API Key απο Maileroo"
        value={value.apiKey}
        onChange={(e) => onChange({ ...value, apiKey: e.target.value })}
      />
      <small className="text-muted">
        <a
          href="https://maileroo.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Δωρεαν: 3.000 emails/μηνα - Maileroo
        </a>
      </small>
    </div>
    <div className="mb-3">
      <label className="form-label fw-semibold">Αποστολεας Email</label>
      <input
        type="email"
        className="form-control"
        placeholder="noreply@807c33da300c12b9.maileroo.org"
        value={value.fromEmail}
        onChange={(e) => onChange({ ...value, fromEmail: e.target.value })}
      />
      <small className="text-muted d-block mt-1">
        ⚠️ <strong>Σημαντικο:</strong> Το Maileroo απαιτει verified domain. Το
        Gmail δεν λειτουργει σε sandbox mode.
      </small>
      <small className="text-muted d-block mt-1">
        🌐 <strong>Λυση:</strong> Πρεπει να verify το domain σας (π.χ.
        fightingrooster.gr) στο{" "}
        <a
          href="https://app.maileroo.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Maileroo Dashboard → Domains
        </a>{" "}
        προσθετοντας DNS records (SPF, DKIM, DMARC).
      </small>
      <small className="text-muted d-block mt-1">
        📝 <strong>Βηματα:</strong> 1) Προσθεσε domain στο Maileroo, 2) Προσθεσε
        DNS records, 3) Verify, 4) Χρησιμοποιησε email@yourdomain.com
      </small>
    </div>
    <div className="mb-0">
      <label className="form-label fw-semibold">Ονομα Αποστολεα</label>
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

export default EmailProviderSection;
