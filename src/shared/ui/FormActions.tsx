import React from "react";
import { useTranslation } from "react-i18next";

interface FormActionsProps {
  saving: boolean;
  isEdit: boolean;
  onCancel: () => void;
}

/** Cancel + submit buttons for create/edit modals. */
const FormActions: React.FC<FormActionsProps> = ({
  saving,
  isEdit,
  onCancel,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <button
        type="button"
        className="btn btn-outline-secondary"
        disabled={saving}
        onClick={onCancel}
      >
        {t("actions.cancel")}
      </button>
      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving
          ? t("actions.saving")
          : isEdit
            ? t("actions.save")
            : t("actions.create")}
      </button>
    </>
  );
};

export default FormActions;
