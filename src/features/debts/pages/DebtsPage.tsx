import React, { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/shared/ui";
import { useMembers } from "@/features/members";
import type { Debt, DebtInput } from "../types";
import { useDebtMutations, useDebts } from "../queries";
import DebtsTable from "../components/DebtsTable";
import DebtFormModal from "../components/DebtFormModal";

type FormState = { debt: Debt | null } | null;

const DebtsPage: React.FC = () => {
  const { debts } = useDebts();
  const { members } = useMembers();
  const { addDebt, editDebt, removeDebt } = useDebtMutations();
  const [form, setForm] = useState<FormState>(null);

  const handleDelete = async (debt: Debt) => {
    if (
      !window.confirm(
        `Διαγραφη οφειλης του/της ${debt.name} (€${debt.amount});`,
      )
    ) {
      return;
    }
    const ok = await removeDebt(debt.id);
    if (!ok) alert("Αποτυχια διαγραφης. Ελεγξτε τη συνδεση με τη βαση.");
  };

  const handleSubmit = async (editing: Debt | null, payload: DebtInput) => {
    if (editing) {
      const updated = await editDebt(editing.id, payload);
      if (!updated) alert("Αποτυχια ενημερωσης οφειλης.");
      return Boolean(updated);
    }
    const created = await addDebt(payload);
    if (!created)
      alert("Αποτυχια δημιουργιας οφειλης. Ελεγξτε τη συνδεση με τη βαση.");
    return Boolean(created);
  };

  return (
    <div>
      <PageHeader
        title="Οφειλες"
        subtitle="Προβολη και διαχειριση ληξιπροθεσμων οφειλων"
        actions={
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => setForm({ debt: null })}
          >
            <Plus size={16} className="me-2" />
            Νεα Οφειλη
          </button>
        }
      />

      <DebtsTable
        debts={debts}
        onEdit={(debt) => setForm({ debt })}
        onDelete={handleDelete}
      />

      {form && (
        <DebtFormModal
          debt={form.debt}
          members={members}
          onClose={() => setForm(null)}
          onSubmit={(payload) => handleSubmit(form.debt, payload)}
        />
      )}
    </div>
  );
};

export default DebtsPage;
