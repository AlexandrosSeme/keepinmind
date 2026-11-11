import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(["members", "common"]);
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
            {t("common:actions.cancel")}
          </button>
          <button type="submit" className="btn btn-primary">
            {t("common:actions.save")}
          </button>
        </>
      }
    >
      <PhotoPicker
        label={t("fields.photo")}
        capture={capture}
        onRemove={() => setField("photo_url", undefined)}
      />

      <div className="mb-3">
        <label className="form-label">{t("fields.name")}</label>
        <input
          type="text"
          className="form-control"
          value={formData.name}
          onChange={(e) => setField("name", e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">{t("fields.phone")}</label>
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
          <label className="form-label">{t("fields.email")}</label>
          <input
            type="email"
            className="form-control"
            value={formData.email || ""}
            onChange={(e) => setField("email", e.target.value)}
          />
        </div>
      )}
      <div className="mb-3">
        <label className="form-label">{t("fields.status")}</label>
        <select
          className="form-select"
          value={formData.status}
          onChange={(e) => setField("status", e.target.value as MemberStatus)}
          required
        >
          <option value="active">{t("common:status.active")}</option>
          <option value="expiring_soon">
            {t("common:status.expiring_soon")}
          </option>
          <option value="expired">{t("common:status.expired")}</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">{t("fields.expiryDate")}</label>
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
        <label className="form-label">{t("fields.package")}</label>
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
