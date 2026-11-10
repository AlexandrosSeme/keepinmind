import React from "react";
import { Modal, StatusBadge } from "@/shared/ui";
import type { Payment } from "../types";

interface PaymentDetailsModalProps {
  payment: Payment;
  onClose: () => void;
  onEdit: (payment: Payment) => void;
}

const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  payment,
  onClose,
  onEdit,
}) => (
  <Modal
    title="Λεπτομερειες Πληρωμης"
    onClose={onClose}
    footer={
      <>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onClose}
        >
          Κλεισιμο
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onEdit(payment)}
        >
          Επεξεργασια
        </button>
      </>
    }
  >
    <dl className="row mb-0">
      <dt className="col-4 text-muted">Μελος</dt>
      <dd className="col-8 fw-semibold">{payment.memberName}</dd>
      <dt className="col-4 text-muted">Ποσο</dt>
      <dd className="col-8 fw-semibold">€{payment.amount}</dd>
      <dt className="col-4 text-muted">Ημερομηνια</dt>
      <dd className="col-8">{payment.date}</dd>
      <dt className="col-4 text-muted">Μεθοδος</dt>
      <dd className="col-8">{payment.method}</dd>
      <dt className="col-4 text-muted">Κατασταση</dt>
      <dd className="col-8">
        <StatusBadge status={payment.status} />
      </dd>
    </dl>
  </Modal>
);

export default PaymentDetailsModal;
