import React, { useState } from "react";
import {
  Plus,
  CreditCard,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import StatusBadge from "./ui/StatusBadge";
import type { Payment } from "../types";
import { useAppData } from "../contexts/AppDataContext";

interface PaymentsProps {
  payments?: Payment[];
}

const emptyForm: Omit<Payment, "id"> = {
  memberName: "",
  amount: 0,
  date: "",
  status: "completed",
  method: "Μετρητα",
};

const methodOptions = [
  "Μετρητα",
  "Καρτα",
  "Τραπεζικη Μεταφορα",
  "IRIS",
  "Αλλο",
];

const todayGR = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const Payments: React.FC<PaymentsProps> = ({ payments: paymentsProp = [] }) => {
  const { payments, members, addPayment, editPayment, removePayment } =
    useAppData();
  const displayPayments = payments.length > 0 ? payments : paymentsProp;

  const [showModal, setShowModal] = useState(false);
  const [viewing, setViewing] = useState<Payment | null>(null);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [formData, setFormData] = useState<Omit<Payment, "id">>(emptyForm);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setFormData({ ...emptyForm, date: todayGR() });
    setShowModal(true);
  };

  const openEdit = (payment: Payment) => {
    setEditing(payment);
    setFormData({
      memberName: payment.memberName,
      amount: payment.amount,
      date: payment.date,
      status: payment.status,
      method: payment.method,
    });
    setShowModal(true);
  };

  const handleDelete = async (payment: Payment) => {
    if (
      !window.confirm(
        `Διαγραφη πληρωμης €${payment.amount} απο ${payment.memberName};`
      )
    ) {
      return;
    }
    const ok = await removePayment(payment.id);
    if (!ok) {
      alert(
        "Αποτυχια διαγραφης. Βεβαιωθειτε οτι εχετε τρεξει το supabase-payments-setup.sql."
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: Omit<Payment, "id"> = {
      memberName: formData.memberName.trim(),
      amount: Number(formData.amount) || 0,
      date: formData.date.trim(),
      status: formData.status,
      method: formData.method,
    };

    try {
      if (editing) {
        const updated = await editPayment(editing.id, payload);
        if (!updated) {
          alert(
            "Αποτυχια ενημερωσης. Τρεξτε το supabase-payments-setup.sql στο Supabase."
          );
          return;
        }
      } else {
        const created = await addPayment(payload);
        if (!created) {
          alert(
            "Αποτυχια δημιουργιας πληρωμης. Τρεξτε το supabase-payments-setup.sql στο Supabase SQL Editor."
          );
          return;
        }
      }
      setShowModal(false);
      setEditing(null);
      setFormData(emptyForm);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="km-page-header">
        <h2 className="km-page-title">Πληρωμες</h2>
        <button className="btn btn-primary" type="button" onClick={openAdd}>
          <Plus size={16} className="me-2" />
          Νεα Πληρωμη
        </button>
      </div>

      <div className="card border-0 shadow-sm km-table-card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 km-table">
              <thead className="table-light">
                <tr>
                  <th className="border-0 ps-4">Μελος</th>
                  <th className="border-0">Ποσο</th>
                  <th className="border-0">Ημερομηνια</th>
                  <th className="border-0">Μεθοδος</th>
                  <th className="border-0">Κατασταση</th>
                  <th className="border-0 pe-4">Ενεργειες</th>
                </tr>
              </thead>
              <tbody>
                {displayPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-5">
                      Δεν υπαρχουν πληρωμες. Προσθεστε την πρωτη με «Νεα
                      Πληρωμη».
                    </td>
                  </tr>
                ) : (
                  displayPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <div
                            className="km-avatar-soft me-3"
                            style={{ width: 40, height: 40 }}
                          >
                            <CreditCard size={18} />
                          </div>
                          <div className="fw-semibold text-dark">
                            {payment.memberName}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="fw-semibold">€{payment.amount}</span>
                      </td>
                      <td>
                        <span className="text-muted">{payment.date}</span>
                      </td>
                      <td>
                        <span className="text-muted">{payment.method}</span>
                      </td>
                      <td>
                        <StatusBadge status={payment.status} />
                      </td>
                      <td className="pe-4">
                        <div className="d-flex align-items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-link btn-sm km-action-link"
                            title="Προβολη"
                            onClick={() => setViewing(payment)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-link btn-sm km-action-link"
                            title="Επεξεργασια"
                            onClick={() => openEdit(payment)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-link btn-sm km-action-link km-action-danger"
                            title="Διαγραφη"
                            onClick={() => handleDelete(payment)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => !saving && setShowModal(false)}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editing ? "Επεξεργασια Πληρωμης" : "Νεα Πληρωμη"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  disabled={saving}
                  onClick={() => setShowModal(false)}
                />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {members.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label">Επιλογη μελους</label>
                      <select
                        className="form-select"
                        value={
                          members.some((m) => m.name === formData.memberName)
                            ? formData.memberName
                            : ""
                        }
                        onChange={(e) => {
                          if (e.target.value) {
                            setFormData((prev) => ({
                              ...prev,
                              memberName: e.target.value,
                            }));
                          }
                        }}
                      >
                        <option value="">— Χειροκινητη εισαγωγη —</option>
                        {members.map((m) => (
                          <option key={m.id} value={m.name}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Ονοματεπωνυμο</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.memberName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          memberName: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label">Ποσο (€)</label>
                      <input
                        type="number"
                        className="form-control"
                        min={0}
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            amount: Number(e.target.value),
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Ημερομηνια</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="DD/MM/YYYY"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Μεθοδος</label>
                    <select
                      className="form-select"
                      value={formData.method}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          method: e.target.value,
                        }))
                      }
                      required
                    >
                      {methodOptions.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-0">
                    <label className="form-label">Κατασταση</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.value as Payment["status"],
                        }))
                      }
                      required
                    >
                      <option value="completed">Ολοκληρωθηκε</option>
                      <option value="pending">Εκκρεμει</option>
                      <option value="failed">Αποτυχια</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={saving}
                    onClick={() => setShowModal(false)}
                  >
                    Ακυρωση
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving
                      ? "Αποθηκευση..."
                      : editing
                        ? "Αποθηκευση"
                        : "Δημιουργια"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {viewing && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setViewing(null)}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Λεπτομερειες Πληρωμης</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewing(null)}
                />
              </div>
              <div className="modal-body">
                <dl className="row mb-0">
                  <dt className="col-4 text-muted">Μελος</dt>
                  <dd className="col-8 fw-semibold">{viewing.memberName}</dd>
                  <dt className="col-4 text-muted">Ποσο</dt>
                  <dd className="col-8 fw-semibold">€{viewing.amount}</dd>
                  <dt className="col-4 text-muted">Ημερομηνια</dt>
                  <dd className="col-8">{viewing.date}</dd>
                  <dt className="col-4 text-muted">Μεθοδος</dt>
                  <dd className="col-8">{viewing.method}</dd>
                  <dt className="col-4 text-muted">Κατασταση</dt>
                  <dd className="col-8">
                    <StatusBadge status={viewing.status} />
                  </dd>
                </dl>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setViewing(null)}
                >
                  Κλεισιμο
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    openEdit(viewing);
                    setViewing(null);
                  }}
                >
                  Επεξεργασια
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
