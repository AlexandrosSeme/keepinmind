import React from "react";
import type { SmsSettings } from "@/features/notifications";
import SettingsCard from "./SettingsCard";

interface SmsProviderSectionProps {
  value: SmsSettings;
  onChange: (value: SmsSettings) => void;
}

const SmsProviderSection: React.FC<SmsProviderSectionProps> = ({
  value,
  onChange,
}) => (
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
      <small className="text-muted">
        Το email που χρησιμοποιειτε για login στο SMSme.gr
      </small>
    </div>
    <div className="mb-3">
      <label className="form-label fw-semibold">Password</label>
      <input
        type="password"
        className="form-control"
        placeholder="Εισαγετε τον κωδικο προσβασης"
        value={value.password}
        onChange={(e) => onChange({ ...value, password: e.target.value })}
      />
      <small className="text-muted">
        <a href="https://smsme.gr" target="_blank" rel="noopener noreferrer">
          Δημιουργηστε λογαριασμο στο SMSme.gr
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
        Το ονομα που θα εμφανιζεται ως αποστολεας (μεχρι 11 χαρακτηρες,
        αλφαριθμητικο)
      </small>
      <small className="text-warning d-block mt-1">
        ⚠️ <strong>Σημαντικο:</strong> Τα alphanumeric sender IDs (οπως
        "ColosseumGym") πρεπει να ειναι <strong>approved</strong> απο το
        SMSme.gr support. Εαν λαμβανετε 500 error, πιθανοτατα το sender ID δεν
        ειναι approved. Επικοινωνηστε με το SMSme.gr support για να approve το
        sender ID σας η χρησιμοποιηστε numeric sender (π.χ. "1234567890").
      </small>
    </div>
  </SettingsCard>
);

export default SmsProviderSection;
