import React, { useState } from "react";
import { Modal, PhotoPicker } from "@/shared/ui";
import { useCameraCapture } from "@/shared/hooks";
import type { MemberInput, MemberStatus } from "../types";

interface MemberFormModalProps {
  title: string;
  initialValues: MemberInput;
  showEmail?: boolean;
  onClose: () => void;
  onSubmit: (
    values: MemberInput,
    photoFile: File | null,
  ) => void | Promise<void>;
}

const MemberFormModal: React.FC<MemberFormModalProps> = ({
  title,
  initialValues,
  showEmail = false,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<MemberInput>(initialValues);
  const capture = useCameraCapture(initialValues.photo_url ?? null);

  const setField = <K extends keyof MemberInput>(
    key: K,
    value: MemberInput[K],
  ) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, capture.photoFile);
  };

  return (
    <Modal
      title={title}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Ακυρωση
          </button>
          <button type="submit" className="btn btn-primary">
            Αποθηκευση
          </button>
        </>
      }
    >
      <PhotoPicker
        label="Φωτογραφια Προφιλ"
        capture={capture}
        onRemove={() => setField("photo_url", undefined)}
      />

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
      <div className="mb-3">
        <label className="form-label">Τηλεφωνο</label>
        <input
          type="text"
          className="form-control"
          value={formData.phone}
          onChange={(e) => setField("phone", e.target.value)}
          required
        />
      </div>
      {showEmail && (
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={formData.email || ""}
            onChange={(e) => setField("email", e.target.value)}
          />
        </div>
      )}
      <div className="mb-3">
        <label className="form-label">Κατασταση</label>
        <select
          className="form-select"
          value={formData.status}
          onChange={(e) => setField("status", e.target.value as MemberStatus)}
          required
        >
          <option value="active">Ενεργη</option>
          <option value="expiring_soon">Ληγει Συντομα</option>
          <option value="expired">Ληγμενη</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">Ημερομηνια Ληξης</label>
        <input
          type="text"
          className="form-control"
          placeholder="DD/MM/YYYY"
          value={formData.expiry}
          onChange={(e) => setField("expiry", e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Πακετο</label>
        <input
          type="text"
          className="form-control"
          value={formData.package}
          onChange={(e) => setField("package", e.target.value)}
          required
        />
      </div>
    </Modal>
  );
};

export default MemberFormModal;
