import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { PageHeader } from "@/shared/ui";
import { useStaffAuth } from "@/features/auth";
import type { Package, PackageInput } from "../types";
import { usePackageMutations, usePackages } from "../queries";
import PackageCard from "../components/PackageCard";
import PackageFormModal from "../components/PackageFormModal";
import "./SubscriptionsPage.scss";

type FormState = { pkg: Package | null } | null;

const SubscriptionsPage: React.FC = () => {
  const { t } = useTranslation("subscriptions");
  // Prices and package management are financial data.
  const canManage = useStaffAuth().can("finance");
  const { packages } = usePackages();
  const { addPackage, editPackage, removePackage } = usePackageMutations();
  const [form, setForm] = useState<FormState>(null);

  const openAdd = () => setForm({ pkg: null });

  const handleDelete = async (pkg: Package) => {
    if (!window.confirm(t("confirmDelete", { name: pkg.name }))) {
      return;
    }
    const ok = await removePackage(pkg.id);
    if (!ok) alert(t("errors.delete"));
  };

  const handleSubmit = async (
    editing: Package | null,
    payload: PackageInput,
  ) => {
    if (editing) {
      const updated = await editPackage(editing.id, payload);
      if (!updated) alert(t("errors.update"));
      return Boolean(updated);
    }
    const created = await addPackage(payload);
    if (!created) alert(t("errors.create"));
    return Boolean(created);
  };

  return (
    <div>
      <PageHeader
        title={t("page.title")}
        actions={
          canManage && (
            <button className="btn btn-primary" type="button" onClick={openAdd}>
              <Plus size={16} className="me-2" />
              {t("page.newPackage")}
            </button>
          )
        }
      />

      <div className="row g-3">
        {packages.map((pkg) => (
          <div key={pkg.id} className="col-12 col-md-6 col-lg-4 col-xl-3">
            <PackageCard
              pkg={pkg}
              showPrice={canManage}
              onEdit={canManage ? (p) => setForm({ pkg: p }) : undefined}
              onDelete={canManage ? handleDelete : undefined}
            />
          </div>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div className="km-avatar-soft d-inline-flex mb-3 km-subscriptions__empty-icon">
              <Plus size={32} />
            </div>
            <h5 className="text-muted">{t("page.emptyTitle")}</h5>
            <p className="text-muted mb-4">{t("page.emptyText")}</p>
            {canManage && (
              <button
                className="btn btn-primary"
                type="button"
                onClick={openAdd}
              >
                <Plus size={16} className="me-2" />
                {t("page.createPackage")}
              </button>
            )}
          </div>
        </div>
      )}

      {canManage && form && (
        <PackageFormModal
          pkg={form.pkg}
          onClose={() => setForm(null)}
          onSubmit={(payload) => handleSubmit(form.pkg, payload)}
        />
      )}
    </div>
  );
};

export default SubscriptionsPage;
