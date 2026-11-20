import React, { useMemo } from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { flexRender } from "@tanstack/react-table";
import { Pagination, SortableHeader, StatusBadge, ariaSort } from "@/shared/ui";
import { personNameMatches, surnameFirst } from "@/shared/lib/personName";
import {
  byNumber,
  bySurname,
  useClientTable,
  type ClientColumnDef,
  type ClientFilterFn,
} from "@/shared/table/useClientTable";
import type { AttendanceRecord, Program } from "../types";

const PAGE_SIZES = [10, 20, 50];

const recordSearch: ClientFilterFn<AttendanceRecord> = (row, _columnId, filterValue) => {
  const query = String(filterValue).trim().toLowerCase();
  if (!query) return true;
  return personNameMatches(row.original.memberName, query);
};

interface AttendanceRecordsTableProps {
  records: AttendanceRecord[];
  programs: Program[];
  searchTerm: string;
  statusFilter: "all" | AttendanceRecord["status"];
}

const AttendanceRecordsTable: React.FC<AttendanceRecordsTableProps> = ({
  records,
  programs,
  searchTerm,
  statusFilter,
}) => {
  const { t } = useTranslation("attendance");
  const programById = useMemo(
    () => new Map(programs.map((program) => [program.id, program])),
    [programs],
  );

  const columns = useMemo<ClientColumnDef<AttendanceRecord>[]>(
    () => [
      {
        id: "date",
        accessorFn: (record) => {
          const program = record.programId ? programById.get(record.programId) : undefined;
          return program ? moment(program.date).valueOf() : 0;
        },
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.date")} />
        ),
        cell: ({ row }) => {
          const program = row.original.programId
            ? programById.get(row.original.programId)
            : undefined;
          return program
            ? `${moment(program.date).format("DD/MM/YYYY")} ${program.time}`
            : "-";
        },
      },
      {
        id: "program",
        accessorFn: (record) =>
          (record.programId ? programById.get(record.programId)?.title : "") ?? "",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.program")} />
        ),
        cell: ({ row }) => (
          <span className="fw-semibold">
            {(row.original.programId
              ? programById.get(row.original.programId)?.title
              : "") || "-"}
          </span>
        ),
      },
      {
        accessorKey: "memberName",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.member")} />
        ),
        sortFn: bySurname<AttendanceRecord>((record) => record.memberName),
        cell: ({ row }) => surnameFirst(row.original.memberName),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.status")} />
        ),
        filterFn: (row, _columnId, value) => row.original.status === value,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "recordedAt",
        accessorFn: (record) => record.recordedAt,
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.recordedAt")} />
        ),
        sortFn: byNumber<AttendanceRecord>((record) => Date.parse(record.recordedAt) || 0),
        cell: ({ row }) => moment(row.original.recordedAt).format("DD/MM/YYYY HH:mm"),
      },
      {
        id: "notes",
        accessorFn: (record) => record.notes ?? "",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.notes")} />
        ),
        cell: ({ row }) => (
          <small className="text-muted">{row.original.notes || "-"}</small>
        ),
      },
    ],
    [programById, t],
  );

  const table = useClientTable({
    data: records,
    columns,
    globalFilter: searchTerm,
    globalFilterFn: recordSearch,
    columnFilters: statusFilter === "all" ? [] : [{ id: "status", value: statusFilter }],
  });

  const rows = table.getRowModel().rows;
  const total = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    <>
      <div className="card border-0 shadow-sm km-table-card">
        <div className="card-header border-0 py-3">
          <h5 className="mb-0">{t("records.title")}</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 km-table">
              <thead className="table-light">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`border-0 ${
                          header.column.id === "date"
                            ? "ps-4"
                            : header.column.id === "notes"
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
                      {t("records.empty")}
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={
                            cell.column.id === "date"
                              ? "ps-4"
                              : cell.column.id === "notes"
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
        </div>
      </div>
      <Pagination
        className="mt-3"
        page={pageIndex + 1}
        pageSize={pageSize}
        total={total}
        pageSizeOptions={PAGE_SIZES}
        onPageChange={(page) => table.setPageIndex(page - 1)}
        onPageSizeChange={(size) => table.setPageSize(size)}
      />
    </>
  );
};

export default AttendanceRecordsTable;
