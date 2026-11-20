import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { flexRender } from "@tanstack/react-table";
import { LogIn, QrCode, RefreshCw } from "lucide-react";
import { Pagination, PanelCard, SortableHeader, StatusBadge, ariaSort } from "@/shared/ui";
import {
  byNumber,
  byText,
  useClientTable,
  type ClientColumnDef,
} from "@/shared/table/useClientTable";
import { formatDateTime } from "@/shared/lib/date";
import { stripAccents } from "@/shared/lib/text";
import type { EntranceLog } from "@/features/attendance";

const PAGE_SIZES = [10, 20, 50];

interface MemberEntranceLogsProps {
  logs: EntranceLog[];
  refreshing: boolean;
  onRefresh: () => void;
}

const MemberEntranceLogs: React.FC<MemberEntranceLogsProps> = ({
  logs,
  refreshing,
  onRefresh,
}) => {
  const { t } = useTranslation(["members", "common"]);

  const columns = useMemo<ClientColumnDef<EntranceLog>[]>(
    () => [
      {
        id: "timestamp",
        accessorFn: (log) => log.timestamp,
        header: ({ column }) => (
          <SortableHeader column={column} label={t("logs.date")} />
        ),
        sortFn: byNumber<EntranceLog>((log) => Date.parse(log.timestamp) || 0),
        cell: ({ row }) => (
          <span className="fw-semibold km-member__log-time">
            {formatDateTime(row.original.timestamp)}
          </span>
        ),
      },
      {
        accessorKey: "entranceType",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("logs.method")} />
        ),
        sortFn: byText<EntranceLog>((log) => log.entranceType),
        cell: ({ row }) =>
          row.original.entranceType === "qr_scan" ? (
            <StatusBadge status="qr_scan" icon={<QrCode size={12} />} showDot={false} />
          ) : (
            <StatusBadge status="manual" icon={<LogIn size={12} />} showDot={false} />
          ),
      },
      {
        accessorKey: "validationStatus",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("logs.status")} />
        ),
        cell: ({ row }) => <StatusBadge status={row.original.validationStatus} />,
      },
      {
        id: "message",
        accessorFn: (log) => log.validationMessage,
        header: ({ column }) => (
          <SortableHeader column={column} label={t("logs.message")} />
        ),
        cell: ({ row }) => (
          <small className="text-muted">
            {stripAccents(row.original.validationMessage || "—")}
          </small>
        ),
      },
    ],
    [t],
  );

  const table = useClientTable({ data: logs, columns, initialPageSize: 10 });
  const rows = table.getRowModel().rows;
  const total = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    <PanelCard
      title={t("attendance.title")}
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
          {refreshing ? "..." : t("common:actions.refresh")}
        </button>
      }
      className="km-member__panel km-table-card"
      bodyClassName="p-0"
    >
      {logs.length === 0 ? (
        <div className="text-center text-muted py-5 px-3">
          <LogIn size={28} className="mb-2 opacity-50" />
          <div>{t("logs.empty")}</div>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover mb-0 km-table">
              <thead className="table-light">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`border-0 ${
                          header.column.id === "timestamp"
                            ? "ps-3"
                            : header.column.id === "message"
                              ? "pe-3"
                              : ""
                        }`}
                        aria-sort={ariaSort(header.column)}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={
                          cell.column.id === "timestamp"
                            ? "ps-3"
                            : cell.column.id === "message"
                              ? "pe-3"
                              : undefined
                        }
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            className="px-3 py-2"
            page={pageIndex + 1}
            pageSize={pageSize}
            total={total}
            pageSizeOptions={PAGE_SIZES}
            onPageChange={(page) => table.setPageIndex(page - 1)}
            onPageSizeChange={(size) => table.setPageSize(size)}
          />
        </>
      )}
    </PanelCard>
  );
};

export default MemberEntranceLogs;
