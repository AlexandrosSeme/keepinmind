import React, { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/shared/ui";
import type { Package, PackageInput } from "../types";
import { usePackageMutations, usePackages } from "../queries";
import PackageCard from "../components/PackageCard";
import PackageFormModal from "../components/PackageFormModal";
import "./SubscriptionsPage.scss";

type FormState = { pkg: Package | null } | null;

const SubscriptionsPage: React.FC = () => {
  const { packages } = usePackages();
  const { addPackage, editPackage, removePackage } = usePackageMutations();
  const [form, setForm] = useState<FormState>(null);

  const openAdd = () => setForm({ pkg: null });

  const handleDelete = async (pkg: Package) => {
    if (
      !window.confirm(
        `Ειστε σιγουροι οτι θελετε να διαγραψετε το πακετο «${pkg.name}»;`,
      )
    ) {
      return;
    }
    const ok = await removePackage(pkg.id);
    if (!ok) alert("Αποτυχια διαγραφης. Ελεγξτε τη συνδεση με τη βαση.");
  };

  const handleSubmit = async (
    editing: Package | null,
    payload: PackageInput,
  ) => {
    if (editing) {
      const updated = await editPackage(editing.id, payload);
      if (!updated) alert("Αποτυχια ενημερωσης πακετου.");
      return Boolean(updated);
    }
    const created = await addPackage(payload);
    if (!created)
      alert("Αποτυχια δημιουργιας πακετου. Ελεγξτε τη συνδεση με τη βαση.");
    return Boolean(created);
  };

  return (
    <div>
      <PageHeader
        title="Πακετα Συνδρομων"
        actions={
          <button className="btn btn-primary" type="button" onClick={openAdd}>
            <Plus size={16} className="me-2" />
            Νεο Πακετο
          </button>
        }
      />

      <div className="row g-3">
        {packages.map((pkg) => (
          <div key={pkg.id} className="col-12 col-md-6 col-lg-4 col-xl-3">
            <PackageCard
              pkg={pkg}
              onEdit={(p) => setForm({ pkg: p })}
              onDelete={handleDelete}
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
            <h5 className="text-muted">Δεν υπαρχουν πακετα συνδρομων</h5>
            <p className="text-muted mb-4">
              Δημιουργηστε το πρωτο πακετο συνδρομης για να ξεκινησετε
            </p>
            <button className="btn btn-primary" type="button" onClick={openAdd}>
              <Plus size={16} className="me-2" />
              Δημιουργια Πακετου
            </button>
          </div>
        </div>
      )}

      {form && (
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
