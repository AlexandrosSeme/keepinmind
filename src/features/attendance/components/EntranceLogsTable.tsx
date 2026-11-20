import React, { useMemo } from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { flexRender } from "@tanstack/react-table";
import { QrCode, RefreshCw } from "lucide-react";
import { Pagination, SortableHeader, StatusBadge, ariaSort } from "@/shared/ui";
import {
  byNumber,
  bySurname,
  useClientTable,
  type ClientColumnDef,
  type ClientFilterFn,
} from "@/shared/table/useClientTable";
import { personNameMatches, surnameFirst } from "@/shared/lib/personName";
import type { EntranceLog } from "../types";

const PAGE_SIZES = [10, 20, 50];

const logSearch: ClientFilterFn<EntranceLog> = (row, _columnId, filterValue) => {
  const raw = String(filterValue).trim();
  if (!raw) return true;
  const log = row.original;
  return (
    personNameMatches(log.memberName, raw) ||
    log.memberPhone.includes(raw)
  );
};

interface EntranceLogsTableProps {
  logs: EntranceLog[];
  searchTerm: string;
  statusFilter: "all" | EntranceLog["validationStatus"];
  methodFilter: "all" | EntranceLog["entranceType"];
  onRefresh: () => void;
}

const EntranceLogsTable: React.FC<EntranceLogsTableProps> = ({
  logs,
  searchTerm,
  statusFilter,
  methodFilter,
  onRefresh,
}) => {
  const { t } = useTranslation("attendance");
  const count = (status: EntranceLog["validationStatus"]) =>
    logs.filter((log) => log.validationStatus === status).length;

  const columns = useMemo<ClientColumnDef<EntranceLog>[]>(
    () => [
      {
        id: "timestamp",
        accessorFn: (log) => log.timestamp,
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.dateTime")} />
        ),
        sortFn: byNumber<EntranceLog>((log) => Date.parse(log.timestamp) || 0),
        cell: ({ row }) => moment(row.original.timestamp).format("DD/MM/YYYY HH:mm:ss"),
      },
      {
        accessorKey: "memberName",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.member")} />
        ),
        sortFn: bySurname<EntranceLog>((log) => log.memberName),
        cell: ({ row }) => (
          <span className="fw-semibold">{surnameFirst(row.original.memberName)}</span>
        ),
      },
      {
        accessorKey: "memberPhone",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.phone")} />
        ),
      },
      {
        accessorKey: "memberStatus",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.subscriptionStatus")} />
        ),
        cell: ({ row }) => <StatusBadge status={row.original.memberStatus} />,
      },
      {
        accessorKey: "validationStatus",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.validation")} />
        ),
        filterFn: (row, _columnId, value) => row.original.validationStatus === value,
        cell: ({ row }) => <StatusBadge status={row.original.validationStatus} />,
      },
      {
        accessorKey: "entranceType",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.type")} />
        ),
        filterFn: (row, _columnId, value) => row.original.entranceType === value,
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.entranceType}
            icon={
              row.original.entranceType === "qr_scan" ? <QrCode size={12} /> : undefined
            }
            showDot={row.original.entranceType !== "qr_scan"}
          />
        ),
      },
      {
        id: "message",
        accessorFn: (log) => log.validationMessage,
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.message")} />
        ),
        cell: ({ row }) => (
          <>
            <small className="text-muted">{row.original.validationMessage}</small>
            {row.original.notes && (
              <div className="small text-muted mt-1">{row.original.notes}</div>
            )}
          </>
        ),
      },
    ],
    [t],
  );

  const table = useClientTable({
    data: logs,
    columns,
    globalFilter: searchTerm,
    globalFilterFn: logSearch,
    columnFilters: [
      ...(statusFilter === "all" ? [] : [{ id: "validationStatus", value: statusFilter }]),
      ...(methodFilter === "all" ? [] : [{ id: "entranceType", value: methodFilter }]),
    ],
  });

  const rows = table.getRowModel().rows;
  const total = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    <>
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
              label={t("entrance.expiringSoon", { total: count("expiring_soon") })}
              showDot={false}
            />
          </div>
        </div>
        <div className="card-body p-0">
          {logs.length === 0 ? (
            <div className="text-center text-muted py-5">
              <QrCode size={48} className="mb-3 opacity-50" />
              <p>{t("entrance.empty")}</p>
              <small>{t("entrance.emptyHint")}</small>
            </div>
          ) : (
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
                              ? "ps-4"
                              : header.column.id === "message"
                                ? "pe-4"
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
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="text-center text-muted py-4">
                        {t("entrance.empty")}
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={
                              cell.column.id === "timestamp"
                                ? "ps-4"
                                : cell.column.id === "message"
                                  ? "pe-4"
                                  : undefined
                            }
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {logs.length > 0 && (
        <Pagination
          className="mt-3"
          page={pageIndex + 1}
          pageSize={pageSize}
          total={total}
          pageSizeOptions={PAGE_SIZES}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      )}
    </>
  );
};

export default EntranceLogsTable;
