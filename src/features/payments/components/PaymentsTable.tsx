import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { flexRender } from "@tanstack/react-table";
import { CreditCard, Edit, Eye, Search, Trash2 } from "lucide-react";
import { IconAvatar, Pagination, SortableHeader, StatusBadge, ariaSort } from "@/shared/ui";
import {
  byNumber,
  byText,
  useClientTable,
  type ClientColumnDef,
  type ClientFilterFn,
} from "@/shared/table/useClientTable";
import { parseGRDate } from "@/shared/lib/date";
import type { Payment } from "../types";
import { paymentMethodLabel } from "../methods";

const PAGE_SIZES = [10, 20, 50];

type PaymentStatus = Payment["status"];

const STATUS_RANK: Record<PaymentStatus, number> = {
  pending: 0,
  completed: 1,
  failed: 2,
};

const paymentSearch: ClientFilterFn<Payment> = (row, _columnId, filterValue) => {
  const query = String(filterValue).trim().toLowerCase();
  if (!query) return true;
  const payment = row.original;
  return (
    payment.memberName.toLowerCase().includes(query) ||
    (payment.package ?? "").toLowerCase().includes(query) ||
    paymentMethodLabel(payment.method).toLowerCase().includes(query) ||
    payment.date.includes(query) ||
    String(payment.amount).includes(query)
  );
};

interface PaymentsTableProps {
  payments: Payment[];
  onView: (payment: Payment) => void;
  onEdit: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
}

const PaymentsTable: React.FC<PaymentsTableProps> = ({
  payments,
  onView,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation(["payments", "common"]);
  const actionsRef = useRef({ onView, onEdit, onDelete });
  actionsRef.current = { onView, onEdit, onDelete };
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "">("");

  const columns = useMemo<ClientColumnDef<Payment>[]>(
    () => [
      {
        accessorKey: "memberName",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.member")} />
        ),
        cell: ({ row }) => (
          <div className="d-flex align-items-center">
            <IconAvatar className="me-3">
              <CreditCard size={18} />
            </IconAvatar>
            <div className="fw-semibold text-dark">{row.original.memberName}</div>
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.amount")} />
        ),
        sortingFn: byNumber<Payment>((payment) => Number(payment.amount)),
        cell: ({ row }) => (
          <span className="fw-semibold">€{row.original.amount}</span>
        ),
      },
      {
        accessorKey: "date",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.date")} />
        ),
        sortingFn: byNumber<Payment>(
          (payment) => parseGRDate(payment.date)?.getTime() ?? 0,
        ),
        cell: ({ row }) => (
          <span className="text-muted">{row.original.date}</span>
        ),
      },
      {
        accessorKey: "method",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.method")} />
        ),
        sortingFn: byText<Payment>((payment) => paymentMethodLabel(payment.method)),
        cell: ({ row }) => (
          <span className="text-muted">
            {paymentMethodLabel(row.original.method)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.status")} />
        ),
        filterFn: (row, _columnId, value) =>
          value === "" || row.original.status === value,
        sortingFn: byNumber<Payment>((payment) => STATUS_RANK[payment.status]),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => t("table.actions"),
        cell: ({ row }) => {
          const payment = row.original;
          const actions = actionsRef.current;
          return (
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-link btn-sm km-action-link"
                title={t("table.view")}
                onClick={() => actions.onView(payment)}
              >
                <Eye size={16} />
              </button>
              <button
                type="button"
                className="btn btn-link btn-sm km-action-link"
                title={t("common:actions.edit")}
                onClick={() => actions.onEdit(payment)}
              >
                <Edit size={16} />
              </button>
              <button
                type="button"
                className="btn btn-link btn-sm km-action-link km-action-danger"
                title={t("common:actions.delete")}
                onClick={() => actions.onDelete(payment)}
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
    data: payments,
    columns,
    globalFilter: searchTerm,
    globalFilterFn: paymentSearch,
    columnFilters: statusFilter ? [{ id: "status", value: statusFilter }] : [],
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
              <select
                className="form-select"
                aria-label={t("fields.status")}
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as PaymentStatus | "")
                }
              >
                <option value="">{t("page.allStatuses")}</option>
                <option value="completed">{t("common:status.completed")}</option>
                <option value="pending">{t("common:status.pending")}</option>
                <option value="failed">{t("common:status.failed")}</option>
              </select>
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
                          header.column.id === "memberName"
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
                            cell.column.id === "memberName"
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

export default PaymentsTable;
