import React from "react";
import { useTranslation } from "react-i18next";
import { Dumbbell } from "lucide-react";
import type { TrainerOption } from "./useTrainerDirectory";

interface TrainerSelectProps {
  options: TrainerOption[];
  /** Empty string = all trainers. */
  value: string;
  onChange: (key: string) => void;
}

/** Dropdown to focus the gym view on one trainer or all of them. */
const TrainerSelect: React.FC<TrainerSelectProps> = ({ options, value, onChange }) => {
  const { t } = useTranslation("dashboard");
  return (
    <label className="km-trainer-select">
      <Dumbbell size={14} />
      <span className="visually-hidden">{t("gym.trainerFilter.label")}</span>
      <select
        className="form-select form-select-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{t("gym.trainerFilter.all")}</option>
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default TrainerSelect;
