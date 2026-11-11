import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { PageHeader } from "@/shared/ui";
import { useMembers } from "@/features/members";
import type { Payment, PaymentInput } from "../types";
import { usePaymentMutations, usePayments } from "../queries";
import PaymentsTable from "../components/PaymentsTable";
import PaymentFormModal from "../components/PaymentFormModal";
import PaymentDetailsModal from "../components/PaymentDetailsModal";

type FormState = { payment: Payment | null } | null;

const PaymentsPage: React.FC = () => {
  const { t } = useTranslation("payments");
  const { payments } = usePayments();
  const { members } = useMembers();
  const { addPayment, editPayment, removePayment } = usePaymentMutations();
  const [form, setForm] = useState<FormState>(null);
  const [viewing, setViewing] = useState<Payment | null>(null);

  const handleDelete = async (payment: Payment) => {
    if (
      !window.confirm(
        t("page.confirmDelete", {
          amount: payment.amount,
          name: payment.memberName,
        }),
      )
    ) {
      return;
    }
    const ok = await removePayment(payment.id);
    if (!ok) {
      alert(t("page.deleteError"));
    }
  };

  const handleSubmit = async (
    editing: Payment | null,
    payload: PaymentInput,
  ) => {
    if (editing) {
      const updated = await editPayment(editing.id, payload);
      if (!updated) {
        alert(t("page.updateError"));
      }
      return Boolean(updated);
    }
    const created = await addPayment(payload);
    if (!created) {
      alert(t("page.createError"));
    }
    return Boolean(created);
  };

  return (
    <div>
      <PageHeader
        title={t("page.title")}
        actions={
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => setForm({ payment: null })}
          >
            <Plus size={16} className="me-2" />
            {t("page.newPayment")}
          </button>
        }
      />

      <PaymentsTable
        payments={payments}
        onView={setViewing}
        onEdit={(payment) => setForm({ payment })}
        onDelete={handleDelete}
      />

      {form && (
        <PaymentFormModal
          payment={form.payment}
          members={members}
          onClose={() => setForm(null)}
          onSubmit={(payload) => handleSubmit(form.payment, payload)}
        />
      )}

      {viewing && (
        <PaymentDetailsModal
          payment={viewing}
          onClose={() => setViewing(null)}
          onEdit={(payment) => {
            setViewing(null);
            setForm({ payment });
          }}
        />
      )}
    </div>
  );
};

export default PaymentsPage;
