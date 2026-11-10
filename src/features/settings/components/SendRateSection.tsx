import React from "react";
import SettingsCard from "./SettingsCard";
import "./SendRateSection.scss";

const RATE_HINTS: Record<number, string> = {
  1: "Πολυ αργη αποστολη (1 email/SMS ανα batch)",
  2: "Αργη αποστολη (2-5 emails/SMS ανα batch)",
  3: "Μετρια αποστολη (5-10 emails/SMS ανα batch) - Προτεινομενη",
  4: "Γρηγορη αποστολη (10-20 emails/SMS ανα batch)",
  5: "Πολυ γρηγορη αποστολη (20-50 emails/SMS ανα batch)",
};

interface SendRateSectionProps {
  value: number;
  onChange: (value: number) => void;
}

const SendRateSection: React.FC<SendRateSectionProps> = ({
  value,
  onChange,
}) => (
  <SettingsCard title="Ρυθμος Αποστολης">
    <div className="mb-3">
      <label className="form-label fw-semibold">Manual Sender Rate (1-5)</label>
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
        <small className="text-muted">{RATE_HINTS[value]}</small>
      </div>
      <div className="mt-2">
        <small className="text-muted d-block">
          <strong>Σημειωση:</strong> Χρησιμοποιειται για να ελεγξετε τον ρυθμο
          αποστολης και να αποφυγετε rate limits απο τα APIs.
        </small>
      </div>
    </div>
  </SettingsCard>
);

export default SendRateSection;
