import React from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import "./ManualRecipientsInput.scss";

interface ManualRecipientsInputProps {
  label: string;
  type: "email" | "tel";
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  onAdd: () => void;
  items: string[];
  onRemove: (item: string) => void;
  /** Bootstrap background for the chips, e.g. "bg-primary". */
  chipClassName: string;
  addedLabel: string;
  hint: string;
}

/** Text input + "add" button that collects extra recipients as removable chips. */
const ManualRecipientsInput: React.FC<ManualRecipientsInputProps> = ({
  label,
  type,
  placeholder,
  value,
  onValueChange,
  onAdd,
  items,
  onRemove,
  chipClassName,
  addedLabel,
  hint,
}) => {
  const { t } = useTranslation(["announcements", "common"]);
  return (
    <div className="col-12">
      <label className="form-label fw-semibold">{label}</label>
      <div className="d-flex gap-2 mb-2">
        <input
          type={type}
          className="form-control"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onAdd();
          }}
        />
        <button
          type="button"
          className="btn btn-outline-secondary d-flex align-items-center gap-2"
          onClick={onAdd}
        >
          <Plus size={16} />
          {t("common:actions.add")}
        </button>
      </div>
      {items.length > 0 && (
        <div className="mt-2">
          <small className="text-muted d-block mb-2">{addedLabel}</small>
          <div className="d-flex flex-wrap gap-2">
            {items.map((item) => (
              <span
                key={item}
                className={`badge ${chipClassName} d-flex align-items-center gap-2 km-recipient-chip`}
              >
                {item}
                <button
                  type="button"
                  className="btn-close btn-close-white km-recipient-chip__remove"
                  onClick={() => onRemove(item)}
                  aria-label={t("manual.remove")}
                />
              </span>
            ))}
          </div>
        </div>
      )}
      <small className="text-muted d-block mt-2">{hint}</small>
    </div>
  );
};

export default ManualRecipientsInput;
