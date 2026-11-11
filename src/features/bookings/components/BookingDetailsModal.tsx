import React from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import {
  Clock,
  Edit2,
  Filter,
  Trash2,
  User,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import type { Booking } from "../types";
import { GENERAL_CLASS_NAME } from "../lib/schedule";

interface BookingDetailsModalProps {
  booking: Booking;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const DetailItem: React.FC<{
  label: React.ReactNode;
  highlight?: boolean;
  valueClassName?: string;
  children: React.ReactNode;
}> = ({ label, highlight, valueClassName = "", children }) => (
  <div className={`detail-item ${highlight ? "highlight" : ""}`.trim()}>
    <div className="detail-label">{label}</div>
    <div className={`detail-value ${valueClassName}`.trim()}>{children}</div>
  </div>
);

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation(["bookings", "common"]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content-large"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{booking.title}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="booking-details">
            {booking.instructor && (
              <DetailItem
                highlight
                valueClassName="coach-name"
                label={
                  <>
                    <UserCheck size={18} />
                    {t("details.coach")}
                  </>
                }
              >
                {booking.instructor}
              </DetailItem>
            )}

            <DetailItem
              label={
                <>
                  <Filter size={18} />
                  {t("details.type")}
                </>
              }
            >
              <span className="badge badge-type">
                {t(`types.${booking.type}`)}
              </span>
            </DetailItem>

            <DetailItem
              label={
                <>
                  <Clock size={18} />
                  {t("details.dateTime")}
                </>
              }
            >
              {moment(booking.startTime).format("dddd, DD MMMM YYYY")}
              <br />
              <small>
                {moment(booking.startTime).format("HH:mm")} -{" "}
                {moment(booking.endTime).format("HH:mm")}
              </small>
            </DetailItem>

            {booking.memberName &&
              booking.memberName !== GENERAL_CLASS_NAME && (
                <DetailItem
                  label={
                    <>
                      <User size={18} />
                      {t("details.member")}
                    </>
                  }
                >
                  {booking.memberName}
                </DetailItem>
              )}

            {booking.maxParticipants && (
              <DetailItem
                label={
                  <>
                    <Users size={18} />
                    {t("details.participants")}
                  </>
                }
              >
                {booking.currentParticipants || 0} / {booking.maxParticipants}
              </DetailItem>
            )}

            {booking.description && (
              <DetailItem label={t("details.description")}>
                {booking.description}
              </DetailItem>
            )}

            {booking.notes && (
              <DetailItem label={t("details.notes")}>
                {booking.notes}
              </DetailItem>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-danger" onClick={onDelete}>
            <Trash2 size={18} />
            {t("common:actions.delete")}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            {t("common:actions.close")}
          </button>
          <button className="btn btn-primary" onClick={onEdit}>
            <Edit2 size={18} />
            {t("common:actions.edit")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
