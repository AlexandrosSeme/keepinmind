import React, { useMemo, useRef } from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { flexRender } from "@tanstack/react-table";
import {
  Calendar,
  CalendarDays,
  Clock,
  Plus,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { Pagination, SortableHeader, StatusBadge, ariaSort } from "@/shared/ui";
import {
  byNumber,
  byText,
  useClientTable,
  type ClientColumnDef,
  type ClientFilterFn,
} from "@/shared/table/useClientTable";
import type { AttendanceRecord, Program } from "../types";

const PAGE_SIZES = [10, 20, 50];

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

const programSearch: ClientFilterFn<Program> = (row, _columnId, filterValue) => {
  const query = String(filterValue).trim().toLowerCase();
  if (!query) return true;
  const program = row.original;
  return (
    program.title.toLowerCase().includes(query) ||
    (program.instructor ?? "").toLowerCase().includes(query)
  );
};

interface ProgramsTableProps {
  programs: Program[];
  records: AttendanceRecord[];
  searchTerm: string;
  categoryFilter: "all" | Program["type"];
  onRecord: (program: Program) => void;
}

const ProgramsTable: React.FC<ProgramsTableProps> = ({
  programs,
  records,
  searchTerm,
  categoryFilter,
  onRecord,
}) => {
  const { t } = useTranslation("attendance");
  const onRecordRef = useRef(onRecord);
  onRecordRef.current = onRecord;

  const statsByProgram = useMemo(() => {
    const map = new Map<number, { attended: number; absent: number; cancelled: number }>();
    for (const record of records) {
      if (record.programId == null) continue;
      const stats = map.get(record.programId) ?? { attended: 0, absent: 0, cancelled: 0 };
      stats[record.status] += 1;
      map.set(record.programId, stats);
    }
    return map;
  }, [records]);

  const columns = useMemo<ClientColumnDef<Program>[]>(
    () => [
      {
        id: "date",
        accessorFn: (program) => program.date,
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.date")} />
        ),
        sortingFn: byNumber<Program>((program) => moment(program.date).valueOf()),
        cell: ({ row }) => moment(row.original.date).format("DD/MM/YYYY"),
      },
      {
        accessorKey: "time",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.time")} />
        ),
        sortingFn: byText<Program>((program) => program.time),
      },
      {
        accessorKey: "title",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.program")} />
        ),
        cell: ({ row }) => <span className="fw-semibold">{row.original.title}</span>,
      },
      {
        accessorKey: "type",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.category")} />
        ),
        sortingFn: byText<Program>((program) => program.type),
        filterFn: (row, _columnId, value) => row.original.type === value,
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.type}
            icon={categoryIcon(row.original.type)}
            showDot={false}
          />
        ),
      },
      {
        id: "instructor",
        accessorFn: (program) => program.instructor ?? "",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.instructor")} />
        ),
        cell: ({ row }) => row.original.instructor || "-",
      },
      {
        id: "stats",
        accessorFn: (program) => statsByProgram.get(program.id)?.attended ?? 0,
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.stats")} />
        ),
        cell: ({ row }) => {
          const stats = statsByProgram.get(row.original.id) ?? {
            attended: 0,
            absent: 0,
            cancelled: 0,
          };
          return (
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
          );
        },
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => t("fields.actions"),
        cell: ({ row }) => (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => onRecordRef.current(row.original)}
          >
            <Plus size={14} className="me-1" />
            {t("programs.record")}
          </button>
        ),
      },
    ],
    [statsByProgram, t],
  );

  const table = useClientTable({
    data: programs,
    columns,
    globalFilter: searchTerm,
    globalFilterFn: programSearch,
    columnFilters:
      categoryFilter === "all" ? [] : [{ id: "type", value: categoryFilter }],
  });

  const rows = table.getRowModel().rows;
  const total = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    <>
      <div className="card border-0 shadow-sm km-table-card">
        <div className="card-header border-0 py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{t("tabs.programs")}</h5>
          <StatusBadge
            tone="neutral"
            label={t("programs.count", { count: total })}
            showDot={false}
          />
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
                            : header.column.id === "actions"
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
                      {t("programs.empty")}
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
                              : cell.column.id === "actions"
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

export default ProgramsTable;
