import React from "react";
import { useTranslation } from "react-i18next";
import { Modal, StatusBadge } from "@/shared/ui";
import type { Payment } from "../types";
import { paymentMethodLabel } from "../methods";

interface PaymentDetailsModalProps {
  payment: Payment;
  onClose: () => void;
  onEdit: (payment: Payment) => void;
}

const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  payment,
  onClose,
  onEdit,
}) => {
  const { t } = useTranslation(["payments", "common"]);

  return (
    <Modal
      title={t("details.title")}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onClose}
          >
            {t("common:actions.close")}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onEdit(payment)}
          >
            {t("common:actions.edit")}
          </button>
        </>
      }
    >
      <dl className="row mb-0">
        <dt className="col-4 text-muted">{t("fields.member")}</dt>
        <dd className="col-8 fw-semibold">{payment.memberName}</dd>
        <dt className="col-4 text-muted">{t("fields.amount")}</dt>
        <dd className="col-8 fw-semibold">€{payment.amount}</dd>
        <dt className="col-4 text-muted">{t("fields.date")}</dt>
        <dd className="col-8">{payment.date}</dd>
        <dt className="col-4 text-muted">{t("fields.method")}</dt>
        <dd className="col-8">{paymentMethodLabel(payment.method)}</dd>
        <dt className="col-4 text-muted">{t("fields.status")}</dt>
        <dd className="col-8">
          <StatusBadge status={payment.status} />
        </dd>
      </dl>
    </Modal>
  );
};

export default PaymentDetailsModal;
