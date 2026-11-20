import React, { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { flexRender } from "@tanstack/react-table";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit,
  XCircle,
} from "lucide-react";
import { Pagination, SortableHeader, ariaSort } from "@/shared/ui";
import {
  byNumber,
  bySurname,
  byText,
  useClientTable,
  type ClientColumnDef,
  type ClientFilterFn,
} from "@/shared/table/useClientTable";
import { parseGRDate } from "@/shared/lib/date";
import { personNameMatches, surnameFirst } from "@/shared/lib/personName";
import type { Member, MemberStatus } from "../types";
import type { MemberRowActions } from "./memberActions";
import MemberAvatar from "./MemberAvatar";

const PAGE_SIZES = [10, 20, 50];

/** Column width on desktop. Mobile ignores these and keeps name plus actions. */
const WIDTH: Record<string, string> = {
  name: "km-w-name",
  dateRegistered: "km-w-date",
  package: "km-w-pack",
  dateBirth: "km-w-date",
  phone: "km-w-phone",
  email: "km-w-email",
  expiry: "km-w-date",
  territory: "km-w-area",
};

/** Hidden until this breakpoint. Mobile keeps name and actions only. */
const HIDE: Record<string, string> = {
  dateRegistered: "d-none d-xxl-table-cell",
  package: "d-none d-lg-table-cell",
  dateBirth: "d-none d-xxl-table-cell",
  phone: "d-none d-md-table-cell",
  email: "d-none d-xl-table-cell",
  expiry: "d-none d-md-table-cell",
  territory: "d-none d-xxl-table-cell",
};

const StatusMark: React.FC<{ status: MemberStatus; label: string }> = ({
  status,
  label,
}) => {
  if (status === "expired") {
    return <XCircle size={16} className="text-danger flex-shrink-0" aria-label={label} />;
  }
  if (status === "expiring_soon") {
    return <Clock size={16} className="text-warning flex-shrink-0" aria-label={label} />;
  }
  return <CheckCircle2 size={16} className="text-success flex-shrink-0" aria-label={label} />;
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
    personNameMatches(member.name, query) ||
    member.phone.includes(String(filterValue).trim()) ||
    (member.email ?? "").toLowerCase().includes(query)
  );
};

const dateValue = (value?: string) => parseGRDate(value ?? "")?.getTime() ?? 0;

const textCell = (value: string | undefined, wide = false) => (
  <span
    className={`text-muted text-truncate d-inline-block km-cell-clip${wide ? " is-wide" : ""}`}
    title={value || undefined}
  >
    {value || "—"}
  </span>
);

const MembersTable: React.FC<MembersTableProps> = ({
  members,
  searchTerm,
  statusFilter,
  onView,
  onEdit,
  onToggleCardLost,
  onPhotoClick,
}) => {
  const { t } = useTranslation(["members", "common"]);
  const actionsRef = useRef({ onView, onEdit, onToggleCardLost, onPhotoClick });
  actionsRef.current = { onView, onEdit, onToggleCardLost, onPhotoClick };

  const rows = useMemo(
    () => (statusFilter ? members.filter((member) => member.status === statusFilter) : members),
    [members, statusFilter],
  );

  const columns = useMemo<ClientColumnDef<Member>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.name")} />
        ),
        sortFn: bySurname<Member>((member) => member.name),
        cell: ({ row }) => {
          const member = row.original;
          return (
            <div className="d-flex align-items-center min-w-0">
              <span
                onClick={(event) => {
                  if (member.photo_url) event.stopPropagation();
                }}
              >
                <MemberAvatar
                  member={member}
                  onPhotoClick={(src) => actionsRef.current.onPhotoClick(src)}
                />
              </span>
              <div className="min-w-0">
                <div className="d-flex align-items-center gap-2 min-w-0">
                  <div className="km-member-name" title={surnameFirst(member.name)}>
                    {surnameFirst(member.name)}
                  </div>
                  {member.card_lost === true && (
                    <AlertTriangle
                      size={14}
                      className="text-danger flex-shrink-0"
                      aria-label={t("common:status.card_lost")}
                    />
                  )}
                </div>
                <div className="d-md-none km-member-meta">
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
        accessorKey: "dateRegistered",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.dateRegistered")} />
        ),
        sortFn: byNumber<Member>((member) => dateValue(member.dateRegistered)),
        cell: ({ row }) => textCell(row.original.dateRegistered),
      },
      {
        accessorKey: "package",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.package")} />
        ),
        cell: ({ row }) => textCell(row.original.package),
      },
      {
        accessorKey: "dateBirth",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.dateBirth")} />
        ),
        sortFn: byNumber<Member>((member) => dateValue(member.dateBirth)),
        cell: ({ row }) => textCell(row.original.dateBirth),
      },
      {
        accessorKey: "phone",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.phone")} />
        ),
        cell: ({ row }) => textCell(row.original.phone),
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.email")} />
        ),
        sortFn: byText<Member>((member) => member.email ?? ""),
        cell: ({ row }) => textCell(row.original.email, true),
      },
      {
        accessorKey: "expiry",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.expiry")} />
        ),
        sortFn: byNumber<Member>((member) => dateValue(member.expiry)),
        cell: ({ row }) => textCell(row.original.expiry),
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
          const label = t(`common:status.${member.status}`);
          return (
            <div
              className="km-row-actions"
              role="group"
              onClick={(event) => event.stopPropagation()}
            >
              <span title={label}>
                <StatusMark status={member.status} label={label} />
              </span>
              <button
                type="button"
                className="btn btn-link btn-sm km-action-link p-0"
                onClick={() => actions.onEdit(member)}
                title={t("common:actions.edit")}
                aria-label={t("common:actions.edit")}
              >
                <Edit size={16} />
              </button>
              <button
                type="button"
                className={`btn btn-link btn-sm km-action-link p-0${
                  member.card_lost === true ? "" : " km-action-danger"
                }`}
                onClick={() => actions.onToggleCardLost(member)}
                title={
                  member.card_lost === true
                    ? t("actions.activateCard")
                    : t("actions.cancelCardLost")
                }
                aria-label={
                  member.card_lost === true
                    ? t("actions.activateCard")
                    : t("actions.cancelCardLost")
                }
              >
                <CreditCard size={16} />
              </button>
            </div>
          );
        },
      },
      {
        accessorKey: "territory",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.territory")} />
        ),
        sortFn: byText<Member>((member) => member.territory ?? ""),
        cell: ({ row }) => textCell(row.original.territory),
      },
    ],
    [t],
  );

  const table = useClientTable({
    data: rows,
    columns,
    globalFilter: searchTerm,
    globalFilterFn: memberSearch,
    initialSorting: [{ id: "name", desc: false }],
  });

  const pageMembers = table.getRowModel().rows;
  const total = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    <>
      <div className="card border-0 shadow-sm km-table-card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 km-table km-table-rows km-members">
              <thead className="table-light">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const hide = HIDE[header.column.id] ?? "";
                      const width =
                        header.column.id === "actions"
                          ? "km-col-actions"
                          : (WIDTH[header.column.id] ?? "");
                      const edge =
                        header.column.id === "name"
                          ? "ps-3"
                          : header.column.id === "territory"
                            ? "pe-3"
                            : "";
                      return (
                        <th
                          key={header.id}
                          className={`border-0 ${width} ${edge} ${hide}`.trim()}
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
                  pageMembers.map((row) => (
                    <tr
                      key={row.id}
                      className={
                        row.original.status === "expired" ? "km-row-expired" : undefined
                      }
                      onClick={() => actionsRef.current.onView(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const hide = HIDE[cell.column.id] ?? "";
                        const width =
                          cell.column.id === "actions"
                            ? "km-col-actions"
                            : (WIDTH[cell.column.id] ?? "");
                        const edge =
                          cell.column.id === "name"
                            ? "ps-3"
                            : cell.column.id === "territory"
                              ? "pe-3"
                              : "";
                        return (
                          <td key={cell.id} className={`${width} ${edge} ${hide}`.trim()}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
