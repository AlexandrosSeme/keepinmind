import React from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { QrCode, RefreshCw } from "lucide-react";
import { StatusBadge } from "@/shared/ui";
import type { EntranceLog } from "../types";

interface EntranceLogsTableProps {
  /** All loaded logs (used for the totals). */
  logs: EntranceLog[];
  /** Logs after search filtering (rendered rows). */
  visibleLogs: EntranceLog[];
  onRefresh: () => void;
}

const EntranceLogsTable: React.FC<EntranceLogsTableProps> = ({
  logs,
  visibleLogs,
  onRefresh,
}) => {
  const { t } = useTranslation("attendance");
  const count = (status: EntranceLog["validationStatus"]) =>
    logs.filter((l) => l.validationStatus === status).length;

  return (
    <div className="card border-0 shadow-sm km-table-card">
      <div className="card-header border-0 py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{t("tabs.entranceLogs")}</h5>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <button
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            onClick={onRefresh}
            title={t("entrance.refresh")}
          >
            <RefreshCw size={16} />
          </button>
          <StatusBadge
            tone="success"
            label={t("entrance.valid", { total: count("valid") })}
            showDot={false}
          />
          <StatusBadge
            tone="danger"
            label={t("entrance.invalid", { total: count("invalid") })}
            showDot={false}
          />
          <StatusBadge
            tone="warning"
            label={t("entrance.expiringSoon", {
              total: count("expiring_soon"),
            })}
            showDot={false}
          />
        </div>
      </div>
      <div className="card-body p-0">
        {visibleLogs.length === 0 ? (
          <div className="text-center text-muted py-5">
            <QrCode size={48} className="mb-3 opacity-50" />
            <p>{t("entrance.empty")}</p>
            <small>{t("entrance.emptyHint")}</small>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0 km-table">
              <thead className="table-light">
                <tr>
                  <th className="border-0 ps-4">{t("fields.dateTime")}</th>
                  <th className="border-0">{t("fields.member")}</th>
                  <th className="border-0">{t("fields.phone")}</th>
                  <th className="border-0">{t("fields.subscriptionStatus")}</th>
                  <th className="border-0">{t("fields.validation")}</th>
                  <th className="border-0">{t("fields.type")}</th>
                  <th className="border-0 pe-4">{t("fields.message")}</th>
                </tr>
              </thead>
              <tbody>
                {visibleLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="ps-4">
                      {moment(log.timestamp).format("DD/MM/YYYY HH:mm:ss")}
                    </td>
                    <td className="fw-semibold">{log.memberName}</td>
                    <td>{log.memberPhone}</td>
                    <td>
                      <StatusBadge status={log.memberStatus} />
                    </td>
                    <td>
                      <StatusBadge status={log.validationStatus} />
                    </td>
                    <td>
                      <StatusBadge
                        status={log.entranceType}
                        icon={
                          log.entranceType === "qr_scan" ? (
                            <QrCode size={12} />
                          ) : undefined
                        }
                        showDot={log.entranceType !== "qr_scan"}
                      />
                    </td>
                    <td className="pe-4">
                      <small className="text-muted">
                        {log.validationMessage}
                      </small>
                      {log.notes && (
                        <div className="small text-muted mt-1">{log.notes}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntranceLogsTable;
