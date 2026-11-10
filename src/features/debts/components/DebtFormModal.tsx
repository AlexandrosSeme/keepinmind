import React, { useState } from "react";
import { FormActions, Modal } from "@/shared/ui";
import type { Member } from "@/features/members";
import type { Debt, DebtInput } from "../types";

const emptyForm: DebtInput = {
  name: "",
  amount: 0,
  daysOverdue: 0,
  status: "overdue",
  lastContact: "",
  phone: "",
  email: "",
};

const toForm = (debt: Debt): DebtInput => ({
  name: debt.name,
  amount: debt.amount,
  daysOverdue: debt.daysOverdue,
  status: debt.status,
  lastContact: debt.lastContact || "",
  phone: debt.phone || "",
  email: debt.email || "",
});

interface DebtFormModalProps {
  debt: Debt | null;
  members: Member[];
  onClose: () => void;
  /** Resolves to true when saved, so the modal can close. */
  onSubmit: (payload: DebtInput) => Promise<boolean>;
}

const DebtFormModal: React.FC<DebtFormModalProps> = ({
  debt,
  members,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<DebtInput>(
    debt ? toForm(debt) : emptyForm,
  );
  const [saving, setSaving] = useState(false);

  const setField = <K extends keyof DebtInput>(key: K, value: DebtInput[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleMemberPick = (memberName: string) => {
    const member = members.find((m) => m.name === memberName);
    setFormData((prev) => ({
      ...prev,
      name: memberName,
      phone: member?.phone || prev.phone,
      email: member?.email || prev.email,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await onSubmit({
        name: formData.name.trim(),
        amount: Number(formData.amount) || 0,
        daysOverdue: Number(formData.daysOverdue) || 0,
        status: formData.status,
        lastContact: formData.lastContact || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
      });
      if (saved) onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={debt ? "Επεξεργασια Οφειλης" : "Νεα Οφειλη"}
      onClose={onClose}
      closeDisabled={saving}
      onSubmit={handleSubmit}
      footer={
        <FormActions
          saving={saving}
          isEdit={Boolean(debt)}
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
              members.some((m) => m.name === formData.name) ? formData.name : ""
            }
            onChange={(e) => {
              if (e.target.value) handleMemberPick(e.target.value);
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
          value={formData.name}
          onChange={(e) => setField("name", e.target.value)}
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
          <label className="form-label">Ημερες καθυστερηση</label>
          <input
            type="number"
            className="form-control"
            min={0}
            value={formData.daysOverdue}
            onChange={(e) => setField("daysOverdue", Number(e.target.value))}
            required
          />
        </div>
      </div>
      <div className="mb-3">
        <label className="form-label">Κατασταση</label>
        <select
          className="form-select"
          value={formData.status}
          onChange={(e) => setField("status", e.target.value as Debt["status"])}
          required
        >
          <option value="warning">Προειδοποιηση</option>
          <option value="overdue">Ληξιπροθεσμη</option>
          <option value="critical">Κρισιμη</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">Τηλεφωνο</label>
        <input
          type="text"
          className="form-control"
          value={formData.phone || ""}
          onChange={(e) => setField("phone", e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          value={formData.email || ""}
          onChange={(e) => setField("email", e.target.value)}
        />
      </div>
      <div className="mb-0">
        <label className="form-label">Τελευταια επαφη</label>
        <input
          type="text"
          className="form-control"
          placeholder="DD/MM/YYYY"
          value={formData.lastContact || ""}
          onChange={(e) => setField("lastContact", e.target.value)}
        />
      </div>
    </Modal>
  );
};

export default DebtFormModal;
