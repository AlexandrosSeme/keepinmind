import React, { useState } from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import {
  Clock,
  Dumbbell,
  Filter,
  User,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import type { Member } from "@/features/members";
import type { BookingFormData, BookingType } from "../types";
import { BOOKING_TYPES } from "../lib/schedule";

interface BookingFormModalProps {
  isEdit: boolean;
  initialValues: BookingFormData;
  members: Member[];
  onClose: () => void;
  onSubmit: (values: BookingFormData) => void;
}

const BookingFormModal: React.FC<BookingFormModalProps> = ({
  isEdit,
  initialValues,
  members,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation(["bookings", "common"]);
  const [formData, setFormData] = useState<BookingFormData>(initialValues);

  const setField = <K extends keyof BookingFormData>(
    key: K,
    value: BookingFormData[K],
  ) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleStartChange = (value: string) => {
    const newStart = new Date(value);
    const duration = formData.endTime.getTime() - formData.startTime.getTime();
    setFormData((prev) => ({
      ...prev,
      startTime: newStart,
      endTime: new Date(newStart.getTime() + duration),
    }));
  };

  const isValid = formData.title.trim() && formData.instructor.trim();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? t("form.editTitle") : t("form.createTitle")}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">
              <Dumbbell size={16} />
              {t("form.title")} <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder={t("form.titlePlaceholder")}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <UserCheck size={16} />
                {t("form.coach")} <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={formData.instructor}
                onChange={(e) => setField("instructor", e.target.value)}
                placeholder={t("form.coachPlaceholder")}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Filter size={16} />
                {t("form.type")}
              </label>
              <select
                className="form-control"
                value={formData.type}
                onChange={(e) =>
                  setField("type", e.target.value as BookingType)
                }
              >
                {BOOKING_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`types.${type}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <Clock size={16} />
                {t("form.start")} <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                className="form-control"
                value={moment(formData.startTime).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) => handleStartChange(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Clock size={16} />
                {t("form.end")} <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                className="form-control"
                value={moment(formData.endTime).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) => setField("endTime", new Date(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <User size={16} />
                {t("form.memberOptional")}
              </label>
              <select
                className="form-control"
                value={formData.memberId || ""}
                onChange={(e) =>
                  setField("memberId", parseInt(e.target.value) || null)
                }
              >
                <option value="">{t("form.generalClass")}</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} {member.status === "active" ? "✓" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Users size={16} />
                {t("form.maxParticipants")}
              </label>
              <input
                type="number"
                className="form-control"
                value={formData.maxParticipants || ""}
                onChange={(e) =>
                  setField("maxParticipants", parseInt(e.target.value) || null)
                }
                placeholder={t("form.unlimited")}
                min="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t("form.description")}</label>
            <textarea
              className="form-control"
              rows={3}
              value={formData.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder={t("form.descriptionPlaceholder")}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t("form.notes")}</label>
            <textarea
              className="form-control"
              rows={2}
              value={formData.notes}
              onChange={(e) => setField("notes", e.target.value)}
              placeholder={t("form.notesPlaceholder")}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            {t("common:actions.cancel")}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onSubmit(formData)}
            disabled={!isValid}
          >
            {isEdit ? t("common:actions.save") : t("common:actions.create")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingFormModal;
