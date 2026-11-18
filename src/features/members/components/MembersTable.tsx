import React, { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { flexRender } from "@tanstack/react-table";
import {
  AlertTriangle,
  CreditCard,
  Edit,
  Eye,
  Printer,
  Trash2,
} from "lucide-react";
import { Pagination, SortableHeader, StatusBadge, ariaSort } from "@/shared/ui";
import {
  byNumber,
  useClientTable,
  type ClientColumnDef,
  type ClientFilterFn,
} from "@/shared/table/useClientTable";
import { parseGRDate } from "@/shared/lib/date";
import type { Member, MemberStatus } from "../types";
import type { MemberRowActions } from "./memberActions";
import MemberAvatar from "./MemberAvatar";

const PAGE_SIZES = [10, 20, 50];
const STATUS_RANK: Record<MemberStatus, number> = {
  active: 0,
  expiring_soon: 1,
  expired: 2,
};

interface MembersTableProps extends MemberRowActions {
  members: Member[];
  searchTerm: string;
  statusFilter: MemberStatus | "";
}

const memberSearch: ClientFilterFn<Member> = (row, _columnId, filterValue) => {
  const query = String(filterValue).trim().toLowerCase();
  if (!query) return true;
  const member = row.original;
  return (
    member.name.toLowerCase().includes(query) ||
    member.phone.includes(String(filterValue).trim())
  );
};

const MembersTable: React.FC<MembersTableProps> = ({
  members,
  searchTerm,
  statusFilter,
  onView,
  onEdit,
  onToggleCardLost,
  onPrintCard,
  onDelete,
  onPhotoClick,
}) => {
  const { t } = useTranslation(["members", "common"]);
  const actionsRef = useRef({
    onView,
    onEdit,
    onToggleCardLost,
    onPrintCard,
    onDelete,
    onPhotoClick,
  });
  actionsRef.current = {
    onView,
    onEdit,
    onToggleCardLost,
    onPrintCard,
    onDelete,
    onPhotoClick,
  };

  const columns = useMemo<ClientColumnDef<Member>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.name")} />
        ),
        cell: ({ row }) => {
          const member = row.original;
          return (
            <div className="d-flex align-items-center min-w-0 w-100">
              <MemberAvatar
                member={member}
                onPhotoClick={(src) => actionsRef.current.onPhotoClick(src)}
              />
              <div className="min-w-0">
                <div
                  className="fw-semibold text-dark km-clickable text-truncate"
                  onClick={() => actionsRef.current.onView(member)}
                >
                  {member.name}
                </div>
                <div className="d-md-none km-member-meta">
                  <StatusBadge status={member.status} />
                  {member.card_lost === true && (
                    <StatusBadge
                      status="card_lost"
                      icon={<AlertTriangle size={11} />}
                      showDot={false}
                    />
                  )}
                  <span
                    className="text-muted text-truncate"
                    title={`${member.phone} · ${member.package} · ${member.expiry}`}
                  >
                    {member.phone} · {member.package} · {member.expiry}
                  </span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "phone",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.phone")} />
        ),
        cell: ({ row }) => (
          <span className="text-muted">{row.original.phone}</span>
        ),
      },
      {
        accessorKey: "package",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.package")} />
        ),
        cell: ({ row }) => (
          <span className="text-muted">{row.original.package}</span>
        ),
      },
      {
        accessorKey: "expiry",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.expiry")} />
        ),
        sortingFn: byNumber<Member>(
          (member) => parseGRDate(member.expiry)?.getTime() ?? 0,
        ),
        cell: ({ row }) => (
          <span className="text-muted">{row.original.expiry}</span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.status")} />
        ),
        filterFn: (row, _columnId, value) =>
          value === "" || row.original.status === value,
        sortingFn: byNumber<Member>((member) => STATUS_RANK[member.status]),
        cell: ({ row }) => {
          const member = row.original;
          return (
            <div className="d-none d-md-flex flex-column align-items-start gap-1">
              <StatusBadge status={member.status} />
              {member.card_lost === true && (
                <StatusBadge
                  status="card_lost"
                  icon={<AlertTriangle size={11} />}
                  showDot={false}
                />
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => (
          <span className="d-none d-md-inline">{t("fields.actions")}</span>
        ),
        cell: ({ row }) => {
          const member = row.original;
          const actions = actionsRef.current;
          return (
            <div className="km-row-actions" role="group">
              <button
                className="btn btn-link btn-sm km-action-link p-0"
                onClick={() => actions.onView(member)}
                title={t("actions.view")}
              >
                <Eye size={16} />
              </button>
              <button
                className="btn btn-link btn-sm km-action-link p-0"
                onClick={() => actions.onEdit(member)}
                title={t("common:actions.edit")}
              >
                <Edit size={16} />
              </button>
              {member.card_lost === true ? (
                <>
                  <button
                    className="btn btn-link btn-sm km-action-link p-0"
                    onClick={() => actions.onToggleCardLost(member)}
                    title={t("actions.activateCard")}
                  >
                    <CreditCard size={16} />
                  </button>
                  <button
                    className="btn btn-link btn-sm km-action-link p-0"
                    onClick={() => actions.onPrintCard(member)}
                    title={t("actions.printNewCard")}
                  >
                    <Printer size={16} />
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-link btn-sm km-action-link km-action-danger p-0"
                  onClick={() => actions.onToggleCardLost(member)}
                  title={t("actions.cancelCardLost")}
                >
                  <CreditCard size={16} />
                </button>
              )}
              <button
                className="btn btn-link btn-sm km-action-link km-action-danger p-0"
                onClick={() => actions.onDelete(member)}
                title={t("common:actions.delete")}
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
    data: members,
    columns,
    globalFilter: searchTerm,
    globalFilterFn: memberSearch,
    columnFilters: statusFilter
      ? [{ id: "status", value: statusFilter }]
      : [],
  });

  const pageMembers = table.getRowModel().rows.map((row) => row.original);
  const total = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;


  console.info(table)
  return (
    <>
      <div className="card border-0 shadow-sm km-table-card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 km-table km-table-rows">
              <thead className="table-light">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                      const hide =
                        header.column.id === "phone" ||
                        header.column.id === "package" ||
                        header.column.id === "status"
                          ? "d-none d-md-table-cell"
                          : header.column.id === "expiry"
                            ? "d-none d-lg-table-cell"
                            : "";
                      const edge =
                        header.column.id === "name"
                          ? "ps-3 ps-md-4"
                          : header.column.id === "actions"
                            ? "pe-2 pe-md-4 km-col-actions"
                            : "";
                      return (
                        <th
                          key={header.id}
                          className={`border-0 ${edge} ${hide}`.trim()}
                          aria-sort={ariaSort(header.column)}
                          aria-label={
                            header.column.id === "actions"
                              ? t("fields.actions")
                              : undefined
                          }
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {pageMembers.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center text-muted py-4">
                      {t("page.empty")}
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        const hide =
                          cell.column.id === "phone" ||
                          cell.column.id === "package" ||
                          cell.column.id === "status"
                            ? "d-none d-md-table-cell"
                            : cell.column.id === "expiry"
                              ? "d-none d-lg-table-cell"
                              : "";
                        const edge =
                          cell.column.id === "name"
                            ? "ps-3 ps-md-4"
                            : cell.column.id === "actions"
                              ? "pe-2 pe-md-4 km-col-actions"
                              : "";
                        return (
                          <td
                            key={cell.id}
                            className={`${edge} ${hide}`.trim()}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        );
                      })}
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

export default MembersTable;
