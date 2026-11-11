import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserPlus } from "lucide-react";
import { PageHeader, PageLoader } from "@/shared/ui";
import {
  manageableRoles,
  staffAuthErrorMessage,
  useStaffAuth,
} from "@/features/auth";
import { useStaff, useStaffMutations } from "../queries";
import StaffFormModal, {
  type StaffFormValues,
} from "../components/StaffFormModal";
import StaffTable, { type StaffRow } from "../components/StaffTable";

type FormState = { user: StaffRow | null } | null;

const StaffPage: React.FC = () => {
  const { t } = useTranslation("staff");
  const { profile, role, refreshProfile } = useStaffAuth();
  const { users, isLoading, error } = useStaff();
  const { createUser, updateUser, deleteUser } = useStaffMutations();
  const [form, setForm] = useState<FormState>(null);
  const assignableRoles = manageableRoles(role);

  const rows = useMemo<StaffRow[]>(
    () =>
      users.map((user) => {
        const isSelf = user.id === profile?.id;
        return {
          ...user,
          isSelf,
          canManage: !isSelf && assignableRoles.includes(user.role),
        };
      }),
    [users, profile?.id, assignableRoles],
  );

  /** Runs a mutation; shows the error and resolves to false on failure. */
  const run = async (action: () => Promise<unknown>) => {
    try {
      await action();
      return true;
    } catch (err) {
      alert(staffAuthErrorMessage(err));
      return false;
    }
  };

  const handleSubmit = async (values: StaffFormValues) => {
    const editing = form?.user;
    if (!editing) return run(() => createUser(values));

    const ok = await run(() =>
      updateUser({
        id: editing.id,
        fullName: values.fullName,
        role: values.role,
        password: values.password || undefined,
      }),
    );
    if (ok && editing.isSelf) await refreshProfile();
    return ok;
  };

  const handleDelete = async (user: StaffRow) => {
    if (!window.confirm(t("confirmDelete", { email: user.email }))) return;
    await run(() => deleteUser(user.id));
  };

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title={t("page.title")}
        subtitle={t("page.subtitle")}
        actions={
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => setForm({ user: null })}
          >
            <UserPlus size={16} className="me-2" />
            {t("page.add")}
          </button>
        }
      />

      {error ? (
        <div className="alert alert-danger">{staffAuthErrorMessage(error)}</div>
      ) : (
        <StaffTable
          users={rows}
          onEdit={(user) => setForm({ user })}
          onDelete={handleDelete}
        />
      )}

      {form && (
        <StaffFormModal
          user={form.user}
          isSelf={Boolean(form.user?.isSelf)}
          assignableRoles={assignableRoles}
          onClose={() => setForm(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default StaffPage;
