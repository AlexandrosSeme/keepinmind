import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { flexRender } from "@tanstack/react-table";
import { Clock, Edit, Euro, Mail, Phone, Search, Trash2 } from "lucide-react";
import i18n from "@/shared/i18n";
import { IconAvatar, Pagination, Select, SortableHeader, StatusBadge, ariaSort } from "@/shared/ui";
import {
  byNumber,
  bySurname,
  useClientTable,
  type ClientColumnDef,
  type ClientFilterFn,
} from "@/shared/table/useClientTable";
import { parseGRDate } from "@/shared/lib/date";
import { personNameMatches, surnameFirst } from "@/shared/lib/personName";
import type { Debt } from "../types";

const PAGE_SIZES = [10, 20, 50];

type DebtStatus = Debt["status"];

const STATUS_RANK: Record<DebtStatus, number> = {
  warning: 0,
  overdue: 1,
  critical: 2,
};

const debtSearch: ClientFilterFn<Debt> = (row, _columnId, filterValue) => {
  const query = String(filterValue).trim().toLowerCase();
  if (!query) return true;
  const debt = row.original;
  return (
    personNameMatches(debt.name, query) ||
    (debt.phone ?? "").includes(String(filterValue).trim()) ||
    (debt.email ?? "").toLowerCase().includes(query) ||
    String(debt.amount).includes(query)
  );
};

const callPhone = (phone?: string) => {
  if (!phone) {
    alert(i18n.t("debts:table.noPhone"));
    return;
  }
  window.location.href = `tel:${phone}`;
};

const sendMail = (email?: string) => {
  if (!email) {
    alert(i18n.t("debts:table.noEmail"));
    return;
  }
  window.location.href = `mailto:${email}`;
};

interface DebtsTableProps {
  debts: Debt[];
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
}

const DebtsTable: React.FC<DebtsTableProps> = ({ debts, onEdit, onDelete }) => {
  const { t } = useTranslation(["debts", "common"]);
  const actionsRef = useRef({ onEdit, onDelete });
  actionsRef.current = { onEdit, onDelete };
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<DebtStatus | "">("");

  const columns = useMemo<ClientColumnDef<Debt>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.member")} />
        ),
        sortFn: bySurname<Debt>((debt) => debt.name),
        cell: ({ row }) => (
          <div className="d-flex align-items-center">
            <IconAvatar className="me-3">
              <Euro size={18} />
            </IconAvatar>
            <div>
              <div className="fw-semibold text-dark">{surnameFirst(row.original.name)}</div>
              <small className="text-muted">{row.original.phone || "—"}</small>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.amount")} />
        ),
        sortFn: byNumber<Debt>((debt) => Number(debt.amount)),
        cell: ({ row }) => (
          <span className="fw-semibold text-danger">€{row.original.amount}</span>
        ),
      },
      {
        accessorKey: "daysOverdue",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.daysOverdue")} />
        ),
        sortFn: byNumber<Debt>((debt) => Number(debt.daysOverdue)),
        cell: ({ row }) => (
          <div className="d-flex align-items-center gap-2 text-muted">
            <Clock size={16} />
            <span className="fw-semibold text-dark">
              {t("table.days", { count: row.original.daysOverdue })}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.status")} />
        ),
        filterFn: (row, _columnId, value) =>
          value === "" || row.original.status === value,
        sortFn: byNumber<Debt>((debt) => STATUS_RANK[debt.status]),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "lastContact",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.lastContact")} />
        ),
        sortFn: byNumber<Debt>(
          (debt) => parseGRDate(debt.lastContact ?? "")?.getTime() ?? 0,
        ),
        cell: ({ row }) => (
          <small className="text-muted">{row.original.lastContact || "—"}</small>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => t("table.actions"),
        cell: ({ row }) => {
          const debt = row.original;
          const actions = actionsRef.current;
          return (
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-link btn-sm km-action-link"
                title={t("table.call")}
                onClick={() => callPhone(debt.phone)}
              >
                <Phone size={16} />
              </button>
              <button
                type="button"
                className="btn btn-link btn-sm km-action-link"
                title={t("fields.email")}
                onClick={() => sendMail(debt.email)}
              >
                <Mail size={16} />
              </button>
              <button
                type="button"
                className="btn btn-link btn-sm km-action-link"
                title={t("common:actions.edit")}
                onClick={() => actions.onEdit(debt)}
              >
                <Edit size={16} />
              </button>
              <button
                type="button"
                className="btn btn-link btn-sm km-action-link km-action-danger"
                title={t("common:actions.delete")}
                onClick={() => actions.onDelete(debt)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        },
      },
    ],
    [t],
  );

  const table = useClientTable({
    data: debts,
    columns,
    globalFilter: searchTerm,
    globalFilterFn: debtSearch,
    columnFilters: statusFilter ? [{ id: "status", value: statusFilter }] : [],
    initialSorting: [{ id: "name", desc: false }],
  });

  const rows = table.getRowModel().rows;
  const total = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    <>
      <div className="card border-0 shadow-sm mb-4 km-toolbar-card">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-8">
              <div className="position-relative">
                <Search
                  size={16}
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                />
                <input
                  type="search"
                  className="form-control ps-5"
                  placeholder={t("page.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label={t("common:actions.search")}
                />
              </div>
            </div>
            <div className="col-12 col-md-4">
              <Select
                ariaLabel={t("fields.status")}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as DebtStatus | "")}
                options={[
                  { value: "", label: t("page.allStatuses") },
                  { value: "warning", label: t("common:status.warning") },
                  { value: "overdue", label: t("common:status.overdue") },
                  { value: "critical", label: t("common:status.critical") },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm km-table-card">
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
                          header.column.id === "name"
                            ? "ps-4"
                            : header.column.id === "actions"
                              ? "pe-4"
                              : ""
                        }`}
                        aria-sort={ariaSort(header.column)}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center text-muted py-5">
                      {t("table.empty")}
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={
                            cell.column.id === "name"
                              ? "ps-4"
                              : cell.column.id === "actions"
                                ? "pe-4"
                                : undefined
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
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

export default DebtsTable;
