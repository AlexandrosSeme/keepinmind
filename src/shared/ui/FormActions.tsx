import React from "react";

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
}) => (
  <>
    <button
      type="button"
      className="btn btn-outline-secondary"
      disabled={saving}
      onClick={onCancel}
    >
      Ακυρωση
    </button>
    <button type="submit" className="btn btn-primary" disabled={saving}>
      {saving ? "Αποθηκευση..." : isEdit ? "Αποθηκευση" : "Δημιουργια"}
    </button>
  </>
);

export default FormActions;
