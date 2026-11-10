import React from "react";
import moment from "moment";
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
  const count = (status: EntranceLog["validationStatus"]) =>
    logs.filter((l) => l.validationStatus === status).length;

  return (
    <div className="card border-0 shadow-sm km-table-card">
      <div className="card-header border-0 py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Logs Εισοδων</h5>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <button
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            onClick={onRefresh}
            title="Ανανεωση logs"
          >
            <RefreshCw size={16} />
          </button>
          <StatusBadge
            tone="success"
            label={`${count("valid")} Εγκυρες`}
            showDot={false}
          />
          <StatusBadge
            tone="danger"
            label={`${count("invalid")} Μη Εγκυρες`}
            showDot={false}
          />
          <StatusBadge
            tone="warning"
            label={`${count("expiring_soon")} Ληγουν Συντομα`}
            showDot={false}
          />
        </div>
      </div>
      <div className="card-body p-0">
        {visibleLogs.length === 0 ? (
          <div className="text-center text-muted py-5">
            <QrCode size={48} className="mb-3 opacity-50" />
            <p>Δεν υπαρχουν logs εισοδων</p>
            <small>Οι εισοδοι απο QR scanner θα εμφανιζονται εδω</small>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0 km-table">
              <thead className="table-light">
                <tr>
                  <th className="border-0 ps-4">Ημερομηνια/Ωρα</th>
                  <th className="border-0">Μελος</th>
                  <th className="border-0">Τηλεφωνο</th>
                  <th className="border-0">Κατασταση Συνδρομης</th>
                  <th className="border-0">Επικυρωση</th>
                  <th className="border-0">Τυπος</th>
                  <th className="border-0 pe-4">Μηνυμα</th>
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
