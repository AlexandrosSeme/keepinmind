import React from "react";
import moment, { type Moment } from "moment";
import { useTranslation } from "react-i18next";
import { Loader2, Plus, User, Users } from "lucide-react";
import type { Booking } from "../types";
import {
  DAYS_OF_WEEK,
  GENERAL_CLASS_NAME,
  TIME_SLOTS,
  getBookingColor,
} from "../lib/schedule";

interface ScheduleGridProps {
  currentWeek: Moment;
  loading: boolean;
  getBookingsForSlot: (day: number, hour: number) => Booking[];
  onSlotClick: (day: number, hour: number) => void;
  onBookingClick: (booking: Booking) => void;
}

const BookingCard: React.FC<{ booking: Booking; onClick: () => void }> = ({
  booking,
  onClick,
}) => {
  const color = booking.color || getBookingColor(booking.type);
  return (
    <div
      className="booking-card"
      // Per-booking color comes from data.
      style={{
        backgroundColor: `${color}18`,
        borderLeft: `3px solid ${color}`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <div className="booking-title">{booking.title}</div>
      {booking.instructor && (
        <div className="booking-coach">
          <User size={12} />
          {booking.instructor}
        </div>
      )}
      {booking.memberName && booking.memberName !== GENERAL_CLASS_NAME && (
        <div className="booking-member">
          <Users size={12} />
          {booking.memberName}
        </div>
      )}
      <div className="booking-time">
        {moment(booking.startTime).format("HH:mm")} -{" "}
        {moment(booking.endTime).format("HH:mm")}
      </div>
    </div>
  );
};

const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  currentWeek,
  loading,
  getBookingsForSlot,
  onSlotClick,
  onBookingClick,
}) => {
  const { t } = useTranslation("bookings");

  return (
    <div className="schedule-grid-container">
      {loading ? (
        <div className="loading-overlay">
          <Loader2 size={32} className="spinner" />
          <p>{t("grid.loading")}</p>
        </div>
      ) : (
        <div className="schedule-grid">
          <div className="time-header"></div>

          {DAYS_OF_WEEK.map((day) => {
            const dayDate = currentWeek.clone().day(day);
            const isToday = dayDate.isSame(moment(), "day");
            return (
              <div key={day} className={`day-header ${isToday ? "today" : ""}`}>
                <div className="day-name">{t(`days.${day}`)}</div>
                <div className="day-date">{dayDate.format("DD/MM")}</div>
              </div>
            );
          })}

          {TIME_SLOTS.map((timeSlot) => (
            <React.Fragment key={timeSlot.hour}>
              <div className="time-slot-label">
                <span>{timeSlot.label}</span>
              </div>

              {DAYS_OF_WEEK.map((day) => {
                const slotBookings = getBookingsForSlot(day, timeSlot.hour);
                return (
                  <div
                    key={`${day}-${timeSlot.hour}`}
                    className="schedule-cell"
                    onClick={() => onSlotClick(day, timeSlot.hour)}
                  >
                    {slotBookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onClick={() => onBookingClick(booking)}
                      />
                    ))}
                    {slotBookings.length === 0 && (
                      <div className="empty-slot">
                        <Plus size={16} />
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleGrid;
