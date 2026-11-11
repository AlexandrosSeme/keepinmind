import React from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "@/shared/ui";
import type { AttendanceRecord, Program } from "../types";

interface AttendanceRecordsTableProps {
  records: AttendanceRecord[];
  programs: Program[];
}

const AttendanceRecordsTable: React.FC<AttendanceRecordsTableProps> = ({
  records,
  programs,
}) => {
  const { t } = useTranslation("attendance");

  return (
    <div className="card border-0 shadow-sm km-table-card">
      <div className="card-header border-0 py-3">
        <h5 className="mb-0">{t("records.title")}</h5>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0 km-table">
            <thead className="table-light">
              <tr>
                <th className="border-0 ps-4">{t("fields.date")}</th>
                <th className="border-0">{t("fields.program")}</th>
                <th className="border-0">{t("fields.member")}</th>
                <th className="border-0">{t("fields.status")}</th>
                <th className="border-0">{t("fields.recordedAt")}</th>
                <th className="border-0 pe-4">{t("fields.notes")}</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    {t("records.empty")}
                  </td>
                </tr>
              ) : (
                records.map((record) => {
                  const program = programs.find(
                    (p) => p.id === record.programId,
                  );
                  return (
                    <tr key={record.id}>
                      <td className="ps-4">
                        {program &&
                          `${moment(program.date).format("DD/MM/YYYY")} ${program.time}`}
                      </td>
                      <td className="fw-semibold">{program?.title || "-"}</td>
                      <td>{record.memberName}</td>
                      <td>
                        <StatusBadge status={record.status} />
                      </td>
                      <td>
                        {moment(record.recordedAt).format("DD/MM/YYYY HH:mm")}
                      </td>
                      <td className="pe-4">
                        <small className="text-muted">
                          {record.notes || "-"}
                        </small>
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

export default AttendanceRecordsTable;
