import React, { useState } from "react";
import { FormActions, Modal } from "@/shared/ui";
import type { Package, PackageInput } from "../types";

const emptyForm: PackageInput = {
  name: "",
  category: "subscription",
  duration: "",
  price: 0,
  active: 0,
};

const toForm = (pkg: Package): PackageInput => ({
  name: pkg.name,
  category: pkg.category,
  duration: pkg.duration,
  price: pkg.price,
  active: pkg.active,
});

interface PackageFormModalProps {
  pkg: Package | null;
  onClose: () => void;
  /** Resolves to true when saved, so the modal can close. */
  onSubmit: (payload: PackageInput) => Promise<boolean>;
}

const PackageFormModal: React.FC<PackageFormModalProps> = ({ pkg, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<PackageInput>(pkg ? toForm(pkg) : emptyForm);
  const [saving, setSaving] = useState(false);

  const setField = <K extends keyof PackageInput>(key: K, value: PackageInput[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await onSubmit({
        ...formData,
        price: Number(formData.price) || 0,
        active: Number(formData.active) || 0,
      });
      if (saved) onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={pkg ? "Επεξεργασια Πακετου" : "Νεο Πακετο"}
      onClose={onClose}
      closeDisabled={saving}
      onSubmit={handleSubmit}
      footer={<FormActions saving={saving} isEdit={Boolean(pkg)} onCancel={onClose} />}
    >
      <div className="mb-3">
        <label className="form-label">Ονομα πακετου</label>
        <input
          type="text"
          className="form-control"
          value={formData.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="π.χ. Μηνιαια Unlimited"
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Κατηγορια</label>
        <select
          className="form-select"
          value={formData.category}
          onChange={(e) => setField("category", e.target.value as Package["category"])}
          required
        >
          <option value="subscription">Συνδρομη</option>
          <option value="hourly">Ωριαια</option>
          <option value="kids">Παιδικο</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">Διαρκεια</label>
        <input
          type="text"
          className="form-control"
          value={formData.duration}
          onChange={(e) => setField("duration", e.target.value)}
          placeholder="π.χ. 30 ημερες / 10 επισκεψεις"
          required
        />
      </div>
      <div className="row g-3">
        <div className="col-6">
          <label className="form-label">Τιμη (€)</label>
          <input
            type="number"
            className="form-control"
            min={0}
            step="0.01"
            value={formData.price}
            onChange={(e) => setField("price", Number(e.target.value))}
            required
          />
        </div>
        <div className="col-6">
          <label className="form-label">Ενεργα μελη</label>
          <input
            type="number"
            className="form-control"
            min={0}
            step={1}
            value={formData.active}
            onChange={(e) => setField("active", Number(e.target.value))}
          />
        </div>
      </div>
    </Modal>
  );
};

export default PackageFormModal;
