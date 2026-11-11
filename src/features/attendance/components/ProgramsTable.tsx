import React from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  CalendarDays,
  Clock,
  Plus,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { StatusBadge } from "@/shared/ui";
import type { AttendanceRecord, Program } from "../types";

const categoryIcon = (type: Program["type"]) => {
  switch (type) {
    case "group":
      return <Users size={16} />;
    case "appointment":
      return <CalendarDays size={16} />;
    case "class":
      return <UserCheck size={16} />;
    default:
      return <Calendar size={16} />;
  }
};

interface ProgramsTableProps {
  programs: Program[];
  records: AttendanceRecord[];
  onRecord: (program: Program) => void;
}

const ProgramsTable: React.FC<ProgramsTableProps> = ({
  programs,
  records,
  onRecord,
}) => {
  const { t } = useTranslation("attendance");
  const statsFor = (programId: number) => {
    const programRecords = records.filter((r) => r.programId === programId);
    return {
      attended: programRecords.filter((r) => r.status === "attended").length,
      absent: programRecords.filter((r) => r.status === "absent").length,
      cancelled: programRecords.filter((r) => r.status === "cancelled").length,
    };
  };

  return (
    <div className="card border-0 shadow-sm km-table-card">
      <div className="card-header border-0 py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{t("tabs.programs")}</h5>
        <StatusBadge
          tone="neutral"
          label={t("programs.count", { count: programs.length })}
          showDot={false}
        />
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0 km-table">
            <thead className="table-light">
              <tr>
                <th className="border-0 ps-4">{t("fields.date")}</th>
                <th className="border-0">{t("fields.time")}</th>
                <th className="border-0">{t("fields.program")}</th>
                <th className="border-0">{t("fields.category")}</th>
                <th className="border-0">{t("fields.instructor")}</th>
                <th className="border-0">{t("fields.stats")}</th>
                <th className="border-0 pe-4">{t("fields.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {programs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    {t("programs.empty")}
                  </td>
                </tr>
              ) : (
                programs.map((program) => {
                  const stats = statsFor(program.id);
                  return (
                    <tr key={program.id}>
                      <td className="ps-4">
                        {moment(program.date).format("DD/MM/YYYY")}
                      </td>
                      <td>{program.time}</td>
                      <td className="fw-semibold">{program.title}</td>
                      <td>
                        <StatusBadge
                          status={program.type}
                          icon={categoryIcon(program.type)}
                          showDot={false}
                        />
                      </td>
                      <td>{program.instructor || "-"}</td>
                      <td>
                        <div className="d-flex gap-2 align-items-center">
                          <small className="text-success">
                            <UserCheck size={14} className="me-1" />
                            {stats.attended}
                          </small>
                          <small className="text-danger">
                            <UserX size={14} className="me-1" />
                            {stats.absent}
                          </small>
                          {stats.cancelled > 0 && (
                            <small className="text-warning">
                              <Clock size={14} className="me-1" />
                              {stats.cancelled}
                            </small>
                          )}
                        </div>
                      </td>
                      <td className="pe-4">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => onRecord(program)}
                        >
                          <Plus size={14} className="me-1" />
                          {t("programs.record")}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProgramsTable;
