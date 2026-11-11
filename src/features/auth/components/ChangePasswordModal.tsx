import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/shared/ui";
import { MIN_PASSWORD_LENGTH } from "../types";
import { useStaffAuth } from "../session/useStaffAuth";

const ChangePasswordModal: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const { t } = useTranslation(["auth", "common"]);
  const { changePassword } = useStaffAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (next !== confirm) {
      setError(t("errors.password_mismatch"));
      return;
    }
    setSaving(true);
    const err = await changePassword(current, next);
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    alert(t("changePassword.success"));
    onClose();
  };

  return (
    <Modal
      title={t("changePassword.title")}
      onClose={onClose}
      closeDisabled={saving}
      onSubmit={handleSubmit}
      footer={
        <>
          <button
            type="button"
            className="btn btn-outline-secondary"
            disabled={saving}
            onClick={onClose}
          >
            {t("common:actions.cancel")}
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? t("common:actions.saving") : t("common:actions.save")}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="mb-3">
        <label htmlFor="current-password" className="form-label">
          {t("changePassword.current")}
        </label>
        <input
          id="current-password"
          type="password"
          className="form-control"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="new-password" className="form-label">
          {t("changePassword.new")}
        </label>
        <input
          id="new-password"
          type="password"
          className="form-control"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          value={next}
          onChange={(e) => setNext(e.target.value)}
          required
        />
        <div className="form-text">
          {t("fields.passwordHint", { min: MIN_PASSWORD_LENGTH })}
        </div>
      </div>
      <div className="mb-0">
        <label htmlFor="confirm-new-password" className="form-label">
          {t("fields.confirmPassword")}
        </label>
        <input
          id="confirm-new-password"
          type="password"
          className="form-control"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
