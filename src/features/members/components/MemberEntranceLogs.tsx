import React from "react";
import { LogIn, QrCode, RefreshCw } from "lucide-react";
import { PanelCard, StatusBadge } from "@/shared/ui";
import { formatDateTime } from "@/shared/lib/date";
import { stripAccents } from "@/shared/lib/text";
import type { EntranceLog } from "@/features/attendance";

interface MemberEntranceLogsProps {
  logs: EntranceLog[];
  refreshing: boolean;
  onRefresh: () => void;
}

const MemberEntranceLogs: React.FC<MemberEntranceLogsProps> = ({
  logs,
  refreshing,
  onRefresh,
}) => (
  <PanelCard
    title="Προσελευσεις"
    badge={
      logs.length > 0 && (
        <StatusBadge tone="brand" label={logs.length} showDot={false} />
      )
    }
    action={
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
        onClick={onRefresh}
        disabled={refreshing}
      >
        <RefreshCw size={14} className={refreshing ? "km-spin" : undefined} />
        {refreshing ? "..." : "Ανανεωση"}
      </button>
    }
    className="km-member__panel km-table-card"
    bodyClassName="p-0 km-member__logs"
  >
    {logs.length === 0 ? (
      <div className="text-center text-muted py-5 px-3">
        <LogIn size={28} className="mb-2 opacity-50" />
        <div>Δεν υπαρχουν καταγραφες</div>
      </div>
    ) : (
      <div className="table-responsive">
        <table className="table table-hover mb-0 km-table">
          <thead className="table-light">
            <tr>
              <th className="border-0 ps-3">Ημ/νια</th>
              <th className="border-0">Τροπος</th>
              <th className="border-0">Κατασταση</th>
              <th className="border-0 pe-3">Μηνυμα</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="ps-3">
                  <span className="fw-semibold km-member__log-time">
                    {formatDateTime(log.timestamp)}
                  </span>
                </td>
                <td>
                  {log.entranceType === "qr_scan" ? (
                    <StatusBadge
                      status="qr_scan"
                      icon={<QrCode size={12} />}
                      showDot={false}
                    />
                  ) : (
                    <StatusBadge
                      status="manual"
                      icon={<LogIn size={12} />}
                      showDot={false}
                    />
                  )}
                </td>
                <td>
                  <StatusBadge status={log.validationStatus} />
                </td>
                <td className="pe-3">
                  <small className="text-muted">
                    {stripAccents(log.validationMessage || "—")}
                  </small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </PanelCard>
);

export default MemberEntranceLogs;
