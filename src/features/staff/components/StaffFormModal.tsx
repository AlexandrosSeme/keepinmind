import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormActions, Modal } from "@/shared/ui";
import {
  MIN_PASSWORD_LENGTH,
  type StaffRole,
  type StaffUser,
} from "@/features/auth";

export interface StaffFormValues {
  email: string;
  fullName: string;
  role: StaffRole;
  /** Required when creating; optional reset when editing someone else. */
  password: string;
}

interface StaffFormModalProps {
  /** Null to create a new user. */
  user: StaffUser | null;
  isSelf: boolean;
  assignableRoles: readonly StaffRole[];
  onClose: () => void;
  /** Resolves to true when saved, so the modal can close. */
  onSubmit: (values: StaffFormValues) => Promise<boolean>;
}

const StaffFormModal: React.FC<StaffFormModalProps> = ({
  user,
  isSelf,
  assignableRoles,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation(["staff", "auth"]);
  const [values, setValues] = useState<StaffFormValues>(() => ({
    email: user?.email ?? "",
    fullName: user?.fullName ?? "",
    role: user?.role ?? assignableRoles[assignableRoles.length - 1] ?? "trainer",
    password: "",
  }));
  const [saving, setSaving] = useState(false);
  // A user editing themselves keeps their role.
  const roleOptions = isSelf && user ? [user.role] : assignableRoles;

  const setField = <K extends keyof StaffFormValues>(
    key: K,
    value: StaffFormValues[K],
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (await onSubmit(values)) onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={user ? t("form.editTitle") : t("form.createTitle")}
      onClose={onClose}
      closeDisabled={saving}
      onSubmit={handleSubmit}
      footer={
        <FormActions saving={saving} isEdit={Boolean(user)} onCancel={onClose} />
      }
    >
      <div className="mb-3">
        <label htmlFor="staff-form-email" className="form-label">
          {t("fields.email")}
        </label>
        <input
          id="staff-form-email"
          type="email"
          className="form-control"
          autoComplete="off"
          value={values.email}
          onChange={(e) => setField("email", e.target.value)}
          disabled={Boolean(user)}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="staff-form-name" className="form-label">
          {t("fields.fullName")}
        </label>
        <input
          id="staff-form-name"
          type="text"
          className="form-control"
          maxLength={100}
          value={values.fullName}
          onChange={(e) => setField("fullName", e.target.value)}
        />
      </div>
      <div className={isSelf ? "mb-0" : "mb-3"}>
        <label htmlFor="staff-form-role" className="form-label">
          {t("fields.role")}
        </label>
        <select
          id="staff-form-role"
          className="form-select"
          value={values.role}
          onChange={(e) => setField("role", e.target.value as StaffRole)}
          disabled={isSelf}
          required
        >
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {t(`auth:roles.${role}`)}
            </option>
          ))}
        </select>
      </div>
      {!isSelf && (
        <div className="mb-0">
          <label htmlFor="staff-form-password" className="form-label">
            {user ? t("fields.newPassword") : t("fields.password")}
          </label>
          <input
            id="staff-form-password"
            type="password"
            className="form-control"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            value={values.password}
            onChange={(e) => setField("password", e.target.value)}
            required={!user}
          />
          <div className="form-text">
            {user
              ? t("form.resetPasswordHint")
              : t("form.passwordHint", { min: MIN_PASSWORD_LENGTH })}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default StaffFormModal;
