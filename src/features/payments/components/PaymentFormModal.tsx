import React, { useState } from "react";
import { FormActions, Modal } from "@/shared/ui";
import { todayGR } from "@/shared/lib/date";
import type { Member } from "@/features/members";
import type { Payment, PaymentInput } from "../types";

const METHOD_OPTIONS = [
  "Μετρητα",
  "Καρτα",
  "Τραπεζικη Μεταφορα",
  "IRIS",
  "Αλλο",
];

const toForm = (payment: Payment | null): PaymentInput =>
  payment
    ? {
        memberName: payment.memberName,
        amount: payment.amount,
        date: payment.date,
        status: payment.status,
        method: payment.method,
      }
    : {
        memberName: "",
        amount: 0,
        date: todayGR(),
        status: "completed",
        method: "Μετρητα",
      };

interface PaymentFormModalProps {
  payment: Payment | null;
  members: Member[];
  onClose: () => void;
  /** Resolves to true when saved, so the modal can close. */
  onSubmit: (payload: PaymentInput) => Promise<boolean>;
}

const PaymentFormModal: React.FC<PaymentFormModalProps> = ({
  payment,
  members,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<PaymentInput>(() => toForm(payment));
  const [saving, setSaving] = useState(false);

  const setField = <K extends keyof PaymentInput>(
    key: K,
    value: PaymentInput[K],
  ) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await onSubmit({
        memberName: formData.memberName.trim(),
        amount: Number(formData.amount) || 0,
        date: formData.date.trim(),
        status: formData.status,
        method: formData.method,
      });
      if (saved) onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={payment ? "Επεξεργασια Πληρωμης" : "Νεα Πληρωμη"}
      onClose={onClose}
      closeDisabled={saving}
      onSubmit={handleSubmit}
      footer={
        <FormActions
          saving={saving}
          isEdit={Boolean(payment)}
          onCancel={onClose}
        />
      }
    >
      {members.length > 0 && (
        <div className="mb-3">
          <label className="form-label">Επιλογη μελους</label>
          <select
            className="form-select"
            value={
              members.some((m) => m.name === formData.memberName)
                ? formData.memberName
                : ""
            }
            onChange={(e) => {
              if (e.target.value) setField("memberName", e.target.value);
            }}
          >
            <option value="">— Χειροκινητη εισαγωγη —</option>
            {members.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="mb-3">
        <label className="form-label">Ονοματεπωνυμο</label>
        <input
          type="text"
          className="form-control"
          value={formData.memberName}
          onChange={(e) => setField("memberName", e.target.value)}
          required
        />
      </div>
      <div className="row g-3 mb-3">
        <div className="col-6">
          <label className="form-label">Ποσο (€)</label>
          <input
            type="number"
            className="form-control"
            min={0}
            step="0.01"
            value={formData.amount}
            onChange={(e) => setField("amount", Number(e.target.value))}
            required
          />
        </div>
        <div className="col-6">
          <label className="form-label">Ημερομηνια</label>
          <input
            type="text"
            className="form-control"
            placeholder="DD/MM/YYYY"
            value={formData.date}
            onChange={(e) => setField("date", e.target.value)}
            required
          />
        </div>
      </div>
      <div className="mb-3">
        <label className="form-label">Μεθοδος</label>
        <select
          className="form-select"
          value={formData.method}
          onChange={(e) => setField("method", e.target.value)}
          required
        >
          {METHOD_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-0">
        <label className="form-label">Κατασταση</label>
        <select
          className="form-select"
          value={formData.status}
          onChange={(e) =>
            setField("status", e.target.value as Payment["status"])
          }
          required
        >
          <option value="completed">Ολοκληρωθηκε</option>
          <option value="pending">Εκκρεμει</option>
          <option value="failed">Αποτυχια</option>
        </select>
      </div>
    </Modal>
  );
};

export default PaymentFormModal;
