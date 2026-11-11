import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormActions, Modal } from "@/shared/ui";
import { todayGR } from "@/shared/lib/date";
import type { Member } from "@/features/members";
import type { Payment, PaymentInput } from "../types";
import { DEFAULT_METHOD, METHOD_OPTIONS, paymentMethodLabel } from "../methods";

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
        method: DEFAULT_METHOD,
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
  const { t } = useTranslation(["payments", "common"]);
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
      const memberName = formData.memberName.trim();
      // Link to the member (and their package) so finance reports can attribute it.
      const member = members.find((m) => m.name === memberName);
      const saved = await onSubmit({
        memberName,
        memberId: member?.id ?? payment?.memberId,
        package: member?.package ?? payment?.package,
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
      title={payment ? t("form.editTitle") : t("page.newPayment")}
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
          <label className="form-label">{t("form.pickMember")}</label>
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
            <option value="">{t("form.manualEntry")}</option>
            {members.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="mb-3">
        <label className="form-label">{t("fields.fullName")}</label>
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
          <label className="form-label">{t("fields.amountEuro")}</label>
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
          <label className="form-label">{t("fields.date")}</label>
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
        <label className="form-label">{t("fields.method")}</label>
        <select
          className="form-select"
          value={formData.method}
          onChange={(e) => setField("method", e.target.value)}
          required
        >
          {METHOD_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {paymentMethodLabel(m)}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-0">
        <label className="form-label">{t("fields.status")}</label>
        <select
          className="form-select"
          value={formData.status}
          onChange={(e) =>
            setField("status", e.target.value as Payment["status"])
          }
          required
        >
          <option value="completed">{t("common:status.completed")}</option>
          <option value="pending">{t("common:status.pending")}</option>
          <option value="failed">{t("common:status.failed")}</option>
        </select>
      </div>
    </Modal>
  );
};

export default PaymentFormModal;
