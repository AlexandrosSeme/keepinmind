import React from "react";
import type { Moment } from "moment";
import { ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";
import type { BookingType } from "../types";
import { BOOKING_TYPE_LABELS } from "../lib/schedule";

interface ScheduleControlsProps {
  currentWeek: Moment;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: BookingType | "all";
  onFilterTypeChange: (value: BookingType | "all") => void;
  filterCoach: string;
  onFilterCoachChange: (value: string) => void;
  coaches: string[];
}

const ScheduleControls: React.FC<ScheduleControlsProps> = ({
  currentWeek,
  onPrevWeek,
  onNextWeek,
  onToday,
  searchTerm,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterCoach,
  onFilterCoachChange,
  coaches,
}) => (
  <div className="schedule-controls">
    <div className="week-navigation">
      <button className="btn-nav" onClick={onPrevWeek}>
        <ChevronLeft size={20} />
      </button>
      <div className="week-display">
        <button className="btn-today" onClick={onToday}>
          Σημερα
        </button>
        <h3 className="week-title">
          {currentWeek.format("DD MMMM")} -{" "}
          {currentWeek.clone().endOf("week").format("DD MMMM YYYY")}
        </h3>
      </div>
      <button className="btn-nav" onClick={onNextWeek}>
        <ChevronRight size={20} />
      </button>
    </div>

    <div className="filters-section">
      <div className="search-box">
        <Search size={18} />
        <input
          type="text"
          placeholder="Αναζητηση ταξης, προπονητη η μελους..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="filter-group">
        <Filter size={18} />
        <select
          className="filter-select"
          value={filterType}
          onChange={(e) =>
            onFilterTypeChange(e.target.value as BookingType | "all")
          }
        >
          <option value="all">Ολοι οι τυποι</option>
          {(Object.keys(BOOKING_TYPE_LABELS) as BookingType[]).map((type) => (
            <option key={type} value={type}>
              {BOOKING_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
        <select
          className="filter-select"
          value={filterCoach}
          onChange={(e) => onFilterCoachChange(e.target.value)}
        >
          <option value="all">Ολοι οι προπονητες</option>
          {coaches.map((coach) => (
            <option key={coach} value={coach}>
              {coach}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
);

export default ScheduleControls;
